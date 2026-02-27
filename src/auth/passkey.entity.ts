import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

/**
 * Passkey Entity
 * 
 * Stores WebAuthn/FIDO2 credentials for passwordless authentication.
 * Each user can have multiple passkeys (different devices).
 * 
 * Security notes:
 * - credentialId is unique across all users
 * - publicKey is what we use to verify signatures
 * - counter prevents replay attacks (must increment on each use)
 * - Never store private keys (they stay on the device)
 */
@Entity('passkeys')
@Index(['userId'])
@Index(['credentialId'], { unique: true })
@Index(['userId', 'deviceName'])
export class Passkey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Credential ID - unique identifier for this passkey
   * Base64-encoded, comes from navigator.credentials.create()
   */
  @Column({ type: 'varchar', length: 512, unique: true })
  credentialId: string;

  /**
   * Public key for signature verification
   * Base64-encoded COSE key
   */
  @Column({ type: 'text' })
  publicKey: string;

  /**
   * Signature counter - increments with each use
   * Used to detect cloned authenticators (replay attack prevention)
   */
  @Column({ type: 'bigint', default: 0 })
  counter: number;

  /**
   * Transports supported by this authenticator
   * e.g., ['usb', 'nfc', 'ble', 'internal']
   */
  @Column({ type: 'jsonb', nullable: true })
  transports: ('usb' | 'nfc' | 'ble' | 'internal')[] | null;

  /**
   * Authenticator AAGUID (Authenticator Attestation GUID)
   * Identifies the make and model of the authenticator
   */
  @Column({ type: 'varchar', length: 128, nullable: true })
  aaguid: string | null;

  /**
   * User-friendly name for this device
   * e.g., "iPhone 14 Pro", "MacBook Air", "YubiKey 5"
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceName: string | null;

  /**
   * Device type detected at registration
   */
  @Column({
    type: 'enum',
    enum: ['mobile', 'desktop', 'tablet', 'security_key', 'unknown'],
    default: 'unknown',
  })
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'security_key' | 'unknown';

  /**
   * Browser/OS info at registration time
   */
  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  /**
   * IP address at registration time
   */
  @Column({ type: 'varchar', length: 45, nullable: true })
  registrationIp: string | null;

  /**
   * Last time this passkey was used for authentication
   */
  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;

  /**
   * Whether this passkey has been revoked
   * Users can revoke individual passkeys (e.g., lost device)
   */
  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  /**
   * Update last used timestamp and counter
   */
  markAsUsed(newCounter: number): void {
    this.lastUsedAt = new Date();
    
    // Counter should always increment (prevents replay attacks)
    if (newCounter <= this.counter) {
      throw new Error(
        `Passkey counter did not increment (expected > ${this.counter}, got ${newCounter}). Possible cloned authenticator.`,
      );
    }
    
    this.counter = newCounter;
  }

  /**
   * Revoke this passkey (user lost device or wants to remove it)
   */
  revoke(): void {
    this.isRevoked = true;
  }
}
