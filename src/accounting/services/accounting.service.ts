import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import { Account, AccountStatus, AccountCurrency } from '../entities/account.entity';
import { LedgerEntry, EntryType } from '../entities/ledger-entry.entity';
import { Transaction } from '../entities/transaction.entity';
import { LedgerService } from './ledger.service';
import { AccountBalanceResponseDto } from '../dto/response.dto';
import {
  AccountNotFoundException,
  AccountNotEligibleException,
  InsufficientBalanceException,
} from '../exceptions/accounting.exceptions';
import {
  addNaira, addUsdt,
  subtractNaira, subtractUsdt,
  isLessThan, formatNaira, formatUsdt,
} from '../utils/decimal.util';

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private readonly ledgerService: LedgerService,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Account Management ───────────────────────────────────────────────────

  async createAccount(userId: string): Promise<Account> {
    const existing = await this.accountRepo.findOne({ where: { userId } });
    if (existing) return existing;

    const account = this.accountRepo.create({
      userId,
      nairaBalance: '0.00',
      usdtBalance:  '0.00000000',
      currency:     AccountCurrency.NGN,
      status:       AccountStatus.ACTIVE,
    });

    const saved = await this.accountRepo.save(account);
    this.logger.log(`Account created [id=${saved.id}] [userId=${userId}]`);
    return saved;
  }

  async getAccount(userId: string): Promise<Account> {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new AccountNotFoundException(userId);
    return account;
  }

  async getAccountById(accountId: string): Promise<Account> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) throw new AccountNotFoundException(accountId);
    return account;
  }

  async getBalance(userId: string): Promise<AccountBalanceResponseDto> {
    const account = await this.getAccount(userId);
    return {
      accountId:    account.id,
      userId:       account.userId,
      nairaBalance: formatNaira(account.nairaBalance),
      usdtBalance:  formatUsdt(account.usdtBalance),
      status:       account.status,
      lastUpdated:  account.updatedAt.toISOString(),
    };
  }

  // ─── Balance Mutations (must always be called inside a QueryRunner) ────────

  /**
   * Debit an account — reduces both balances.
   * Validates balance sufficiency BEFORE making any changes.
   * Writes a ledger entry capturing balanceBefore and balanceAfter.
   *
   * @param accountId   DB UUID of the account
   * @param amountNaira NGN amount to debit
   * @param amountUsdt  USDT amount to debit
   * @param transactionId Transaction FK for the ledger entry
   * @param description Human-readable description for the ledger entry
   * @param qr          Active QueryRunner — caller owns commit/rollback
   */
  async debitAccount(
    accountId: string,
    amountNaira: string,
    amountUsdt: string,
    transactionId: string,
    description: string,
    qr: QueryRunner,
  ): Promise<void> {
    // Lock the account row for the duration of this transaction
    const account = await qr.manager
      .getRepository(Account)
      .createQueryBuilder('a')
      .setLock('pessimistic_write')
      .where('a.id = :id', { id: accountId })
      .getOne();

    if (!account) throw new AccountNotFoundException(accountId);
    this.assertEligible(account);

    // Balance checks
    if (isLessThan(account.nairaBalance, amountNaira)) {
      throw new InsufficientBalanceException(amountNaira, account.nairaBalance, 'NGN');
    }
    if (isLessThan(account.usdtBalance, amountUsdt)) {
      throw new InsufficientBalanceException(amountUsdt, account.usdtBalance, 'USDT');
    }

    const nairaBalanceBefore = account.nairaBalance;
    const usdtBalanceBefore  = account.usdtBalance;
    const newNaira = subtractNaira(account.nairaBalance, amountNaira);
    const newUsdt  = subtractUsdt(account.usdtBalance,   amountUsdt);

    await qr.manager.update(Account, accountId, {
      nairaBalance: newNaira,
      usdtBalance:  newUsdt,
    });

    // Naira ledger entry
    if (amountNaira !== '0.00') {
      await this.ledgerService.recordEntry({
        transactionId,
        accountId,
        entryType:     EntryType.DEBIT,
        amountNaira,
        amountUsdt:    '0.00000000',
        currency:      AccountCurrency.NGN,
        balanceBefore: nairaBalanceBefore,
        balanceAfter:  newNaira,
        description:   `${description} [NGN debit]`,
      }, qr);
    }

    // USDT ledger entry
    if (amountUsdt !== '0.00000000') {
      await this.ledgerService.recordEntry({
        transactionId,
        accountId,
        entryType:     EntryType.DEBIT,
        amountNaira:   '0.00',
        amountUsdt,
        currency:      AccountCurrency.USDT,
        balanceBefore: usdtBalanceBefore,
        balanceAfter:  newUsdt,
        description:   `${description} [USDT debit]`,
      }, qr);
    }

    this.logger.log(
      `Account debited [id=${accountId}] [NGN=${amountNaira}] [USDT=${amountUsdt}]`,
    );
  }

  /**
   * Credit an account — increases both balances.
   * Writes a ledger entry capturing balanceBefore and balanceAfter.
   */
  async creditAccount(
    accountId: string,
    amountNaira: string,
    amountUsdt: string,
    transactionId: string,
    description: string,
    qr: QueryRunner,
  ): Promise<void> {
    const account = await qr.manager
      .getRepository(Account)
      .createQueryBuilder('a')
      .setLock('pessimistic_write')
      .where('a.id = :id', { id: accountId })
      .getOne();

    if (!account) throw new AccountNotFoundException(accountId);
    this.assertEligible(account);

    const nairaBalanceBefore = account.nairaBalance;
    const usdtBalanceBefore  = account.usdtBalance;
    const newNaira = addNaira(account.nairaBalance, amountNaira);
    const newUsdt  = addUsdt(account.usdtBalance,   amountUsdt);

    await qr.manager.update(Account, accountId, {
      nairaBalance: newNaira,
      usdtBalance:  newUsdt,
    });

    if (amountNaira !== '0.00') {
      await this.ledgerService.recordEntry({
        transactionId,
        accountId,
        entryType:     EntryType.CREDIT,
        amountNaira,
        amountUsdt:    '0.00000000',
        currency:      AccountCurrency.NGN,
        balanceBefore: nairaBalanceBefore,
        balanceAfter:  newNaira,
        description:   `${description} [NGN credit]`,
      }, qr);
    }

    if (amountUsdt !== '0.00000000') {
      await this.ledgerService.recordEntry({
        transactionId,
        accountId,
        entryType:     EntryType.CREDIT,
        amountNaira:   '0.00',
        amountUsdt,
        currency:      AccountCurrency.USDT,
        balanceBefore: usdtBalanceBefore,
        balanceAfter:  newUsdt,
        description:   `${description} [USDT credit]`,
      }, qr);
    }

    this.logger.log(
      `Account credited [id=${accountId}] [NGN=${amountNaira}] [USDT=${amountUsdt}]`,
    );
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  assertEligible(account: Account): void {
    if (account.status !== AccountStatus.ACTIVE) {
      throw new AccountNotEligibleException(account.status);
    }
  }
}
