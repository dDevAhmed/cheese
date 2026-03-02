import { randomBytes } from 'crypto';

/**
 * Generate a transaction reference in the format:
 *   CHZ-{timestamp}-{6 random alphanumeric chars}
 *   e.g. CHZ-1709123456789-A3F7K2
 *
 * Collision probability: 36^6 = 2.18 billion combinations per millisecond.
 * Unique constraint on the column provides the final safety net.
 */
export function generateTransactionReference(): string {
  const timestamp = Date.now();
  const chars     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes     = randomBytes(6);
  const suffix    = Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join('');
  return `CHZ-${timestamp}-${suffix}`;
}
