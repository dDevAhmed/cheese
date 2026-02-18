import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * AuditLog Entity
 *
 * Immutable record of every significant action on the platform.
 *
 * Design decisions:
 * - No updatedAt or deletedAt — audit logs are append-only and never modified
 * - merchantId denormalized for fast tenant-scoped queries without joins
 * - metadata stored as JSONB for flexible context (old/new values, reasons)
 * - Indexes optimized for read-heavy workloads (compliance dashboards)
 */
@Entity('audit_logs')
@Index(['targetUserId'])
@Index(['performedBy'])
@Index(['action'])
@Index(['merchantId'])
@Index(['createdAt'])
@Index(['targetUserId', 'createdAt']) // User history queries
@Index(['merchantId', 'action', 'createdAt']) // Compliance reports
export class AuditLog {
  @ApiProperty({ description: 'Unique audit log entry ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Action type that was performed' })
  @Column({ type: 'varchar', length: 100 })
  action: string; // UserAuditAction enum value

  @ApiProperty({ description: 'User ID who performed the action' })
  @Column({ type: 'uuid' })
  performedBy: string;

  @ApiProperty({ description: 'User ID who was affected by the action' })
  @Column({ type: 'uuid' })
  targetUserId: string;

  @ApiPropertyOptional({ description: 'Merchant context (if applicable)' })
  @Column({ type: 'uuid', nullable: true })
  merchantId: string | null;

  @ApiPropertyOptional({ description: 'IP address of the action originator' })
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @ApiPropertyOptional({ description: 'User agent string' })
  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @ApiPropertyOptional({
    description: 'Additional context data (old/new values, reasons)',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @ApiProperty({ description: 'Timestamp when the action occurred' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
