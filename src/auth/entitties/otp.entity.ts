import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum OtpPurpose {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET     = 'password_reset',
  LOGIN_MFA          = 'login_mfa',
}

@Entity('otps')
@Index('IDX_otps_user_purpose', ['userId', 'purpose', 'usedAt'])
@Index('IDX_otps_expires_at',   ['expiresAt'])
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index('IDX_otps_user_id')
  userId: string;

  /**
   * SHA-256 hash of the raw 6-digit code.
   * Raw code never persisted — only emailed to user.
   */
  @Column({ type: 'char', length: 64 })
  codeHash: string;

  @Column({ type: 'enum', enum: OtpPurpose })
  purpose: OtpPurpose;

  @Column({ type: 'timestamptz' })
  @Index('IDX_otps_expires')
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  /** Attempt counter — lock after maxAttempts wrong entries */
  @Column({ type: 'smallint', default: 0 })
  attempts: number;

  @Column({ type: 'smallint', default: 5 })
  maxAttempts: number;

  @Column({ type: 'inet', nullable: true })
  requestedFromIp: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ── Computed ──────────────────────────────────────────────────────────────
  get isExpired(): boolean   { return new Date() > this.expiresAt; }
  get isUsed(): boolean      { return this.usedAt !== null; }
  get isExhausted(): boolean { return this.attempts >= this.maxAttempts; }
  get isValid(): boolean     { return !this.isExpired && !this.isUsed && !this.isExhausted; }
}
