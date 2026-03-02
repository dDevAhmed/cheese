import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Account, AccountCurrency } from './account.entity';

export enum EntryType {
  DEBIT  = 'debit',
  CREDIT = 'credit',
}

@Entity('ledger_entries')
@Index('IDX_ledger_transaction', ['transactionId'])
@Index('IDX_ledger_account',     ['accountId'])
@Index('IDX_ledger_created',     ['createdAt'])
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  transactionId: string;

  @Column({ type: 'uuid' })
  accountId: string;

  @Column({ type: 'enum', enum: EntryType })
  entryType: EntryType;

  /**
   * NGN component of this ledger entry.
   * Zero for pure USDT entries; non-zero for NGN or dual-currency entries.
   */
  @Column({ type: 'decimal', precision: 18, scale: 2, default: '0.00' })
  amountNaira: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: '0.00000000' })
  amountUsdt: string;

  /** Primary currency this entry is denominated in */
  @Column({ type: 'enum', enum: AccountCurrency })
  currency: AccountCurrency;

  /**
   * Balance snapshot at write time.
   * Using same precision as the balance column being tracked.
   * Both balanceBefore and balanceAfter always represent NGN value here;
   * for USDT-primary entries, this reflects the USDT balance cast to 18,2
   * for comparability — see LedgerService for the exact write logic.
   */
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  balanceBefore: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  balanceAfter: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Transaction, (t) => t.ledgerEntries, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @ManyToOne(() => Account, (a) => a.ledgerEntries, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
