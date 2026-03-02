import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
  VALID_TRANSITIONS,
} from '../entities/transaction.entity';
import { AccountingService } from './accounting.service';
import { LedgerService } from './ledger.service';
import { InitiateTransactionDto } from '../dto/initiate-transaction.dto';
import { ngnToUsdt, formatNaira, formatUsdt } from '../utils/decimal.util';
import {
  TransactionNotFoundException,
  DuplicateTransactionException,
  InvalidTransactionStateException,
} from '../exceptions/accounting.exceptions';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    private readonly accountingService: AccountingService,
    private readonly ledgerService: LedgerService,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Initiate ─────────────────────────────────────────────────────────────

  /**
   * Creates the transaction record in PENDING status and validates that
   * the sender has sufficient USDT balance.
   *
   * The exchange rate is locked here and never recalculated. The caller
   * must supply the rate from the FX service at the moment of the request.
   *
   * Does NOT move any money — processTransaction() does that.
   */
  async initiateTransaction(dto: InitiateTransactionDto): Promise<Transaction> {
    const senderAccount   = await this.accountingService.getAccount(dto.userId);
    this.accountingService.assertEligible(senderAccount);

    // Derive USDT amount from the NGN amount and locked exchange rate
    const amountUsdt = ngnToUsdt(dto.amountNaira, dto.exchangeRate);

    // Pre-flight balance check (non-locking — real check happens in processTransaction)
    const { usdtBalance } = senderAccount;
    if (parseFloat(usdtBalance) < parseFloat(amountUsdt)) {
      const { InsufficientBalanceException } = await import('../exceptions/accounting.exceptions');
      throw new InsufficientBalanceException(amountUsdt, usdtBalance, 'USDT');
    }

    // System account for receiving NGN (in a real system this would be a
    // per-recipient account or a settlement pool account. Using a platform
    // account lookup by a well-known userId here.)
    // For this module we set receiverAccountId to senderAccountId as a
    // placeholder — wire up to your recipient account resolution logic.
    const receiverAccountId = senderAccount.id; // TODO: resolve actual recipient account

    const transaction = this.txRepo.create({
      senderAccountId:        senderAccount.id,
      receiverAccountId,
      amountNaira:            dto.amountNaira,
      amountUsdt,
      exchangeRate:           dto.exchangeRate,
      fxRateSource:           dto.fxRateSource,
      transactionType:        TransactionType.PAYMENT,
      status:                 TransactionStatus.PENDING,
      recipientBankCode:      dto.recipientBankCode,
      recipientAccountNumber: dto.recipientAccountNumber,
      recipientAccountName:   dto.recipientAccountName,
      metadata:               dto.metadata ?? null,
    });

    const saved = await this.txRepo.save(transaction);
    this.logger.log(
      `Transaction initiated [ref=${saved.reference}] [NGN=${dto.amountNaira}]` +
      ` [USDT=${amountUsdt}] [rate=${dto.exchangeRate}]`,
    );
    return saved;
  }

  // ─── Process ──────────────────────────────────────────────────────────────

  /**
   * Moves the transaction to PROCESSING and executes the double-entry:
   *   1. Debit sender's USDT balance
   *   2. Credit receiver's NGN balance
   *
   * All balance updates and ledger writes happen inside a single queryRunner.
   * If any step throws, the entire queryRunner is rolled back.
   */
  async processTransaction(reference: string): Promise<Transaction> {
    const tx = await this.findByReference(reference);
    this.assertTransition(tx, TransactionStatus.PROCESSING);

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction('SERIALIZABLE');

    try {
      // Update status to PROCESSING
      await qr.manager.update(Transaction, tx.id, {
        status: TransactionStatus.PROCESSING,
      });

      // ── Double-entry bookkeeping ────────────────────────────────────────
      // Debit sender USDT (crypto leaves sender's custody)
      await this.accountingService.debitAccount(
        tx.senderAccountId,
        '0.00',             // No NGN debit for sender
        tx.amountUsdt,
        tx.id,
        `Payment ${tx.reference} — USDT debit`,
        qr,
      );

      // Credit receiver NGN (fiat arrives at recipient side)
      await this.accountingService.creditAccount(
        tx.receiverAccountId,
        tx.amountNaira,
        '0.00000000',       // No USDT credit for receiver
        tx.id,
        `Payment ${tx.reference} — NGN credit`,
        qr,
      );
      // ───────────────────────────────────────────────────────────────────

      await qr.commitTransaction();
      this.logger.log(`Transaction processed [ref=${reference}]`);
    } catch (err) {
      await qr.rollbackTransaction();
      this.logger.error(`Process failed, rolled back [ref=${reference}]`, err);
      throw err;
    } finally {
      await qr.release();
    }

    // Verify double-entry integrity after commit (reads committed data)
    await this.ledgerService.verifyDoubleEntry(tx.id);

    return this.findByReference(reference);
  }

  // ─── Complete ─────────────────────────────────────────────────────────────

  async completeTransaction(reference: string): Promise<Transaction> {
    const tx = await this.findByReference(reference);
    this.assertTransition(tx, TransactionStatus.COMPLETED);

    await this.txRepo.update(tx.id, {
      status:      TransactionStatus.COMPLETED,
      completedAt: new Date(),
    });

    this.logger.log(`Transaction completed [ref=${reference}]`);
    return this.findByReference(reference);
  }

  // ─── Fail ────────────────────────────────────────────────────────────────

  /**
   * Mark as failed. If the transaction was already PROCESSING (funds moved),
   * trigger a reversal to restore balances.
   */
  async failTransaction(reference: string, reason: string): Promise<Transaction> {
    const tx = await this.findByReference(reference);
    this.assertTransition(tx, TransactionStatus.FAILED);

    const fundsAlreadyMoved = tx.status === TransactionStatus.PROCESSING;

    await this.txRepo.update(tx.id, {
      status:        TransactionStatus.FAILED,
      failureReason: reason,
    });

    if (fundsAlreadyMoved) {
      this.logger.warn(
        `Funds already moved before failure — triggering reversal [ref=${reference}]`,
      );
      await this.reverseTransaction(reference);
    }

    return this.findByReference(reference);
  }

  // ─── Reverse ─────────────────────────────────────────────────────────────

  /**
   * Creates a mirror REVERSAL transaction and restores both balances.
   * The reversal gets its own reference, its own ledger entries, and
   * links back to the original via originalTransactionId.
   *
   * A reversed transaction cannot be reversed again (state machine enforces this).
   */
  async reverseTransaction(reference: string): Promise<Transaction> {
    const original = await this.findByReference(reference);

    // Allow reversal of COMPLETED or FAILED (if funds moved)
    const reversibleStates = [TransactionStatus.COMPLETED, TransactionStatus.FAILED];
    if (!reversibleStates.includes(original.status)) {
      throw new InvalidTransactionStateException(original.status, 'reversed');
    }

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction('SERIALIZABLE');

    let reversalTx: Transaction;

    try {
      // Create the reversal transaction record
      reversalTx = qr.manager.create(Transaction, {
        senderAccountId:        original.receiverAccountId, // swap sides
        receiverAccountId:      original.senderAccountId,
        amountNaira:            original.amountNaira,
        amountUsdt:             original.amountUsdt,
        exchangeRate:           original.exchangeRate,
        fxRateSource:           original.fxRateSource,
        transactionType:        TransactionType.REVERSAL,
        status:                 TransactionStatus.PROCESSING,
        recipientBankCode:      original.recipientBankCode,
        recipientAccountNumber: original.recipientAccountNumber,
        recipientAccountName:   original.recipientAccountName,
        originalTransactionId:  original.id,
        metadata: {
          reversalOf: original.reference,
          reason:     'Transaction reversal',
        },
      });

      reversalTx = await qr.manager.save(Transaction, reversalTx);

      // Debit receiver's NGN (undo the credit)
      await this.accountingService.debitAccount(
        original.receiverAccountId,
        original.amountNaira,
        '0.00',
        reversalTx.id,
        `Reversal of ${original.reference} — NGN debit`,
        qr,
      );

      // Credit sender's USDT (restore the debit)
      await this.accountingService.creditAccount(
        original.senderAccountId,
        '0.00',
        original.amountUsdt,
        reversalTx.id,
        `Reversal of ${original.reference} — USDT credit`,
        qr,
      );

      // Mark reversal as completed and original as reversed
      await qr.manager.update(Transaction, reversalTx.id, {
        status:      TransactionStatus.COMPLETED,
        completedAt: new Date(),
      });
      await qr.manager.update(Transaction, original.id, {
        status: TransactionStatus.REVERSED,
      });

      await qr.commitTransaction();
      this.logger.log(
        `Reversal completed [original=${reference}] [reversal=${reversalTx.reference}]`,
      );
    } catch (err) {
      await qr.rollbackTransaction();
      this.logger.error(`Reversal failed, rolled back [ref=${reference}]`, err);
      throw err;
    } finally {
      await qr.release();
    }

    return this.txRepo.findOneOrFail({ where: { id: reversalTx.id } });
  }

  // ─── Queries ─────────────────────────────────────────────────────────────

  async findByReference(reference: string): Promise<Transaction> {
    const tx = await this.txRepo.findOne({ where: { reference } });
    if (!tx) throw new TransactionNotFoundException(reference);
    return tx;
  }

  async findById(id: string): Promise<Transaction> {
    const tx = await this.txRepo.findOne({ where: { id } });
    if (!tx) throw new TransactionNotFoundException(id);
    return tx;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private assertTransition(tx: Transaction, target: TransactionStatus): void {
    const allowed = VALID_TRANSITIONS[tx.status] ?? [];
    if (!allowed.includes(target)) {
      throw new InvalidTransactionStateException(tx.status, target);
    }
  }
}
