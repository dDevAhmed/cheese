import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index, OneToMany, BeforeInsert,
} from 'typeorm';
import { randomBytes } from 'crypto';
import { LedgerEntry } from './ledger-entry.entity';

export enum TransactionType {
  PAYMENT    = 'payment',
  REVERSAL   = 'reversal',
  FEE        = 'fee',
  SETTLEMENT = 'settlement',
}

export enum TransactionStatus {
  PENDING    = 'pending',
  PROCESSING = 'processing',
  COMPLETED  = 'completed',
  FAILED     = 'failed',
  REVERSED   = 'reversed',
}

/** Valid state machine transitions */
export const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.PENDING]:    [TransactionStatus.PROCESSING, TransactionStatus.FAILED],
  [TransactionStatus.PROCESSING]: [TransactionStatus.COMPLETED,  TransactionStatus.FAILED],
  [TransactionStatus.COMPLETED]:  [TransactionStatus.REVERSED],
  [TransactionStatus.FAILED]:     [],
  [TransactionStatus.REVERSED]:   [],
};

@Entity('transactions')
@Index('IDX_transactions_sender',    ['senderAccountId'])
@Index('IDX_transactions_receiver',  ['receiverAccountId'])
@Index('IDX_transactions_status',    ['status'])
@Index('IDX_transactions_created',   ['createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Human-readable reference in format CHZ-{timestamp}-{6 random alphanum}
   * Auto-generated on insert. Never changes after creation.
   */
  @Column({ type: 'varchar', length: 30 })
  @Index('UQ_transactions_reference', { unique: true })
  reference: string;

  @Column({ type: 'uuid' })
  senderAccountId: string;

  @Column({ type: 'uuid' })
  receiverAccountId: string;

  /** NGN amount being transferred to recipient */
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amountNaira: string;

  /** Equivalent USDT amount debited from sender */
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amountUsdt: string;

  /**
   * USDT/NGN rate locked at initiation time.
   * NEVER recalculated after initiation — this is the immutable rate of record.
   */
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  exchangeRate: string;

  @Column({ type: 'varchar', length: 100 })
  fxRateSource: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.PAYMENT,
  })
  transactionType: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'varchar', length: 10 })
  recipientBankCode: string;

  @Column({ type: 'varchar', length: 20 })
  recipientAccountNumber: string;

  @Column({ type: 'varchar', length: 200 })
  recipientAccountName: string;

  /**
   * Free-form JSON blob for extra data: bank response codes, webhook IDs, etc.
   * Never store PII in here without encryption.
   */
  @Column({ type: 'jsonb', nullable: true, default: null })
  metadata: Record<string, unknown> | null;

  /** Reason stored on failure/reversal for audit trail */
  @Column({ type: 'text', nullable: true, default: null })
  failureReason: string | null;

  /** Reference of the original transaction this reversal targets (if reversal type) */
  @Column({ type: 'uuid', nullable: true, default: null })
  originalTransactionId: string | null;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  initiatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  completedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => LedgerEntry, (e) => e.transaction)
  ledgerEntries: LedgerEntry[];

  @BeforeInsert()
  generateReference() {
    if (!this.reference) {
      const ts     = Date.now();
      const suffix = randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
      this.reference = `CHZ-${ts}-${suffix}`;
    }
  }
}
