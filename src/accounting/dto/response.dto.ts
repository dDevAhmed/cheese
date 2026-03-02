import { TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { EntryType } from '../entities/ledger-entry.entity';
import { AccountCurrency } from '../entities/account.entity';

/** All monetary values returned as strings — never numbers — to prevent client-side float issues */

export class AccountBalanceResponseDto {
  accountId: string;
  userId: string;
  /** NGN balance as string e.g. "50000.00" */
  nairaBalance: string;
  /** USDT balance as string e.g. "31.25000000" */
  usdtBalance: string;
  status: string;
  lastUpdated: string; // ISO UTC timestamp
}

export class TransactionHistoryItemDto {
  reference: string;
  amountNaira: string;
  amountUsdt: string;
  exchangeRate: string;
  fxRateSource: string;
  status: TransactionStatus;
  transactionType: TransactionType;
  recipientAccountNumber: string;
  recipientBankCode: string;
  recipientAccountName: string;
  initiatedAt: string;
  completedAt: string | null;
  createdAt: string;
}

export class LedgerEntryResponseDto {
  id: string;
  transactionId: string;
  accountId: string;
  entryType: EntryType;
  currency: AccountCurrency;
  amountNaira: string;
  amountUsdt: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  createdAt: string;
}

export class TransactionDetailResponseDto extends TransactionHistoryItemDto {
  senderAccountId: string;
  receiverAccountId: string;
  metadata: Record<string, unknown> | null;
  failureReason: string | null;
  ledgerEntries: LedgerEntryResponseDto[];
}

export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
