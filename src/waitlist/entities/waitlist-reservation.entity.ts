import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum WaitlistStatus {
  PENDING   = 'pending',
  NOTIFIED  = 'notified',
  CONVERTED = 'converted',
  EXPIRED   = 'expired',
}

@Entity('waitlist_reservations')
@Index('UQ_waitlist_email',    ['email'],    { unique: true })
@Index('UQ_waitlist_username', ['username'], { unique: true })
@Index('IDX_waitlist_status',  ['status'])
export class WaitlistReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({ type: 'varchar', length: 30 })
  username: string;

  @Column({ type: 'int' })
  waitlistPosition: number;

  @Column({ type: 'enum', enum: WaitlistStatus, default: WaitlistStatus.PENDING })
  status: WaitlistStatus;

  /**
   * SHA-256 hash of the HMAC-signed continuation token.
   * Raw token only lives in the launch email link.
   */
  @Column({ type: 'char', length: 64, nullable: true })
  continuationTokenHash: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  tokenExpiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  notifiedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  convertedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  convertedUserId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
