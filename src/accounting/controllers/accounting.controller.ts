import {
  Controller, Get, Post, Param, Body, Query,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { AccountingService } from '../services/accounting.service';
import { TransactionService } from '../services/transaction.service';
import { TransactionHistoryService } from '../services/transaction-history.service';
import { LedgerService } from '../services/ledger.service';
import { InitiateTransactionDto } from '../dto/initiate-transaction.dto';
import { TransactionFilterDto } from '../dto/transaction-filter.dto';
import { LedgerFilterDto } from '../dto/ledger-filter.dto';

@Controller('accounting')
export class AccountingController {
  constructor(
    private readonly accountingService: AccountingService,
    private readonly txService: TransactionService,
    private readonly historyService: TransactionHistoryService,
    private readonly ledgerService: LedgerService,
  ) {}

  // ─── Accounts ─────────────────────────────────────────────────────────────

  /**
   * POST /accounting/accounts
   * Create an account for a user. Idempotent — returns existing if already created.
   */
  @Post('accounts')
  @HttpCode(HttpStatus.CREATED)
  async createAccount(@Body('userId') userId: string) {
    const account = await this.accountingService.createAccount(userId);
    return {
      id:           account.id,
      userId:       account.userId,
      nairaBalance: account.nairaBalance,
      usdtBalance:  account.usdtBalance,
      status:       account.status,
      createdAt:    account.createdAt.toISOString(),
    };
  }

  /**
   * GET /accounting/accounts/:userId/balance
   * Returns current NGN and USDT balances.
   * All monetary values returned as strings.
   */
  @Get('accounts/:userId/balance')
  getBalance(@Param('userId') userId: string) {
    return this.accountingService.getBalance(userId);
  }

  /**
   * GET /accounting/accounts/:userId/transactions
   * Paginated transaction history with optional filters.
   */
  @Get('accounts/:userId/transactions')
  getTransactionHistory(
    @Param('userId') userId: string,
    @Query() filters: TransactionFilterDto,
  ) {
    return this.historyService.getHistory(userId, filters);
  }

  /**
   * GET /accounting/accounts/:userId/ledger
   * Paginated raw ledger entries for the user's account.
   */
  @Get('accounts/:userId/ledger')
  async getLedger(
    @Param('userId') userId: string,
    @Query() filters: LedgerFilterDto,
  ) {
    const account = await this.accountingService.getAccount(userId);
    return this.ledgerService.getLedgerByAccount(account.id, filters);
  }

  /**
   * GET /accounting/accounts/:userId/export
   * Export-ready transaction data (up to 10,000 rows, UTC timestamps).
   */
  @Get('accounts/:userId/export')
  exportHistory(
    @Param('userId') userId: string,
    @Query() filters: TransactionFilterDto,
  ) {
    return this.historyService.exportHistory(userId, filters);
  }

  // ─── Transactions ─────────────────────────────────────────────────────────

  /**
   * POST /accounting/transactions/initiate
   * Create a PENDING transaction. Locks the exchange rate. Does NOT move funds.
   */
  @Post('transactions/initiate')
  @HttpCode(HttpStatus.CREATED)
  initiateTransaction(@Body() dto: InitiateTransactionDto) {
    return this.txService.initiateTransaction(dto);
  }

  /**
   * GET /accounting/transactions/:reference
   * Full transaction detail including all associated ledger entries.
   */
  @Get('transactions/:reference')
  getTransactionDetail(@Param('reference') reference: string) {
    return this.historyService.getTransactionDetail(reference);
  }

  /**
   * POST /accounting/transactions/:reference/process
   * Moves to PROCESSING. Executes the double-entry debit/credit atomically.
   */
  @Post('transactions/:reference/process')
  @HttpCode(HttpStatus.OK)
  processTransaction(@Param('reference') reference: string) {
    return this.txService.processTransaction(reference);
  }

  /**
   * POST /accounting/transactions/:reference/complete
   * Marks as COMPLETED, records completedAt timestamp.
   */
  @Post('transactions/:reference/complete')
  @HttpCode(HttpStatus.OK)
  completeTransaction(@Param('reference') reference: string) {
    return this.txService.completeTransaction(reference);
  }

  /**
   * POST /accounting/transactions/:reference/fail
   * Marks as FAILED. If funds already moved (PROCESSING state), triggers reversal.
   */
  @Post('transactions/:reference/fail')
  @HttpCode(HttpStatus.OK)
  failTransaction(
    @Param('reference') reference: string,
    @Body('reason') reason: string,
  ) {
    return this.txService.failTransaction(reference, reason ?? 'Transaction failed');
  }

  /**
   * POST /accounting/transactions/:reference/reverse
   * Creates a mirror REVERSAL transaction and restores both balances atomically.
   */
  @Post('transactions/:reference/reverse')
  @HttpCode(HttpStatus.OK)
  reverseTransaction(@Param('reference') reference: string) {
    return this.txService.reverseTransaction(reference);
  }

  /**
   * GET /accounting/transactions/:reference/ledger
   * All ledger entries for a specific transaction (typically 2–4 entries).
   */
  @Get('transactions/:reference/ledger')
  async getTransactionLedger(@Param('reference') reference: string) {
    const tx = await this.txService.findByReference(reference);
    return this.ledgerService.getLedgerByTransaction(tx.id);
  }
}
