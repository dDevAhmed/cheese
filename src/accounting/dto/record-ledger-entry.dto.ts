import { EntryType } from '../entities/ledger-entry.entity';
import { AccountCurrency } from '../entities/account.entity';

/** Internal DTO — not exposed in API. Used by LedgerService.recordEntry() */
export class RecordLedgerEntryDto {
  transactionId: string;
  accountId: string;
  entryType: EntryType;
  amountNaira: string;
  amountUsdt: string;
  currency: AccountCurrency;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
}
