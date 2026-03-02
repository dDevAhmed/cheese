import {
  IsString, IsUUID, IsNumber, IsEnum, MaxLength, IsPositive, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TransactionAction {
  WITHDRAWAL = 'withdrawal',
  TRANSFER   = 'transfer',
  SWAP       = 'swap',
}

/**
 * Signed transaction request DTO.
 *
 * ─── Client-side signing contract ────────────────────────────────────────────
 *
 * Step 1 — Build canonical payload (keys must be alphabetically sorted):
 *
 *   const canonical = JSON.stringify({
 *     action:      'withdrawal',
 *     amount:      5000,
 *     currency:    'USDC',
 *     destination: '0xRecipientAddress',
 *     nonce:       crypto.randomUUID(),     // UUID v4
 *     timestamp:   Math.floor(Date.now() / 1000),
 *     userId:      'uuid-of-current-user',
 *   });
 *
 * Step 2 — Hash payload:
 *   const digest = sha256(Buffer.from(canonical, 'utf8'));
 *
 * Step 3 — Sign with device private key (hardware-bound, never exported):
 *   // ed25519
 *   const sig = devicePrivKey.sign(digest);
 *   // secp256k1
 *   const sig = ecdsa.sign(digest, devicePrivKey).toDERBytes();
 *
 * Step 4 — Send this DTO with signature as base64(sig)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
export class SignedTransactionRequestDto {
  // ── Payload fields (must exactly match what was signed) ──────────────────

  @IsEnum(TransactionAction)
  action: TransactionAction;

  /** Smallest-unit integer: kobo for NGN, cents for USD, etc. No floats. */
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @IsString()
  @MaxLength(10)
  currency: string;

  @IsString()
  @MaxLength(255)
  destination: string;

  /** Client-generated UUID v4 — used for replay prevention */
  @IsUUID('4')
  nonce: string;

  /** Unix seconds (UTC) — request rejected if |now - timestamp| > 300 s */
  @IsNumber()
  @Type(() => Number)
  timestamp: number;

  // ── Cryptographic proof ───────────────────────────────────────────────────

  /**
   * Base64-encoded raw signature bytes from Secure Enclave / Keystore.
   * ed25519:   always 64 bytes → 88 base64 chars
   * secp256k1: DER-encoded ≈70 bytes → ≈96 base64 chars
   */
  @IsString()
  @MaxLength(256)
  signature: string;

  /**
   * Hardware OS device ID — used to locate the stored public key.
   * Not a secret; authentication is via signature validity only.
   */
  @IsString()
  @MaxLength(255)
  deviceId: string;
}
