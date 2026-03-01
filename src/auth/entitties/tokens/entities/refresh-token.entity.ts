import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
@Index('UQ_refresh_token_hash', ['tokenHash'], { unique: true })
@Index('IDX_refresh_user_id',   ['userId'])
@Index('IDX_refresh_expires',   ['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  /**
   * SHA-256 hash of the opaque refresh token string.
   * Raw token returned to client once at issuance — never stored.
   */
  @Column({ type: 'char', length: 64 })
  tokenHash: string;

  @Column({ type: 'inet', nullable: true })
  issuedFromIp: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent: string | null;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  /**
   * Rotation chain — each token records its successor.
   * On replay of a revoked token, we walk the chain and revoke everything.
   */
  @Column({ type: 'uuid', nullable: true })
  replacedByTokenId: string | null;

  @Column({ type: 'boolean', default: false })
  rotationAttackDetected: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ── Computed ──────────────────────────────────────────────────────────────
  get isExpired(): boolean { return new Date() > this.expiresAt; }
  get isRevoked(): boolean { return this.revokedAt !== null; }
  get isValid(): boolean   { return !this.isExpired && !this.isRevoked; }
}
