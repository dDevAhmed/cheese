import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index, OneToMany,
} from 'typeorm';
import { LedgerEntry } from './ledger-entry.entity';

export enum AccountCurrency {
  NGN  = 'NGN',
  USDT = 'USDT',
}

export enum AccountStatus {
  ACTIVE    = 'active',
  SUSPENDED = 'suspended',
  FROZEN    = 'frozen',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index('UQ_accounts_user_id', { unique: true })
  userId: string;

  /**
   * Naira balance — precision 18, scale 2 (kobo-level accuracy)
   * Stored as NUMERIC in Postgres. Never use JS float arithmetic on this.
   */
  @Column({ type: 'decimal', precision: 18, scale: 2, default: '0.00' })
  nairaBalance: string;

  /**
   * USDT balance — precision 18, scale 8 (satoshi-level accuracy)
   */
  @Column({ type: 'decimal', precision: 18, scale: 8, default: '0.00000000' })
  usdtBalance: string;

  @Column({
    type: 'enum',
    enum: AccountCurrency,
    default: AccountCurrency.NGN,
  })
  currency: AccountCurrency;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => LedgerEntry, (e) => e.account)
  ledgerEntries: LedgerEntry[];
}
