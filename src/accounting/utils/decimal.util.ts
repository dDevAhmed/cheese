/**
 * Decimal arithmetic utilities for monetary values.
 *
 * All monetary fields in this module are stored and manipulated as strings
 * (PostgreSQL NUMERIC → TypeORM decimal → string). This file provides
 * string-based arithmetic using BigInt scaled integers so we never introduce
 * floating-point error.
 *
 * Supported precision: up to 18 digits before decimal, up to 8 after.
 */

const SCALE = 8; // Max decimal places we work with (USDT scale)

/**
 * Parse a decimal string into a BigInt scaled by 10^SCALE.
 * "31.25000000" → 3125000000n
 * "50000.00"    → 5000000000000n
 */
export function toScaled(value: string): bigint {
  const [intPart, fracPart = ''] = value.split('.');
  const frac = fracPart.padEnd(SCALE, '0').slice(0, SCALE);
  return BigInt(intPart + frac);
}

/** Convert a scaled BigInt back to a decimal string with given scale */
export function fromScaled(scaled: bigint, scale: number = 2): string {
  const divisor = BigInt(10 ** SCALE);
  const fullScale = BigInt(10 ** (SCALE - scale));
  // Round to target scale
  const rounded = (scaled + fullScale / 2n) / fullScale * fullScale;
  const intPart  = rounded / divisor;
  const fracPart = (rounded % divisor).toString().padStart(SCALE, '0').slice(0, scale);
  return `${intPart}.${fracPart}`;
}

export function add(a: string, b: string): { ngn: string; usdt: string } {
  throw new Error('Use addNaira / addUsdt instead');
}

export function addNaira(a: string, b: string): string {
  return fromScaled(toScaled(a) + toScaled(b), 2);
}

export function subtractNaira(a: string, b: string): string {
  return fromScaled(toScaled(a) - toScaled(b), 2);
}

export function addUsdt(a: string, b: string): string {
  return fromScaled(toScaled(a) + toScaled(b), 8);
}

export function subtractUsdt(a: string, b: string): string {
  return fromScaled(toScaled(a) - toScaled(b), 8);
}

/**
 * Compute USDT amount from NGN amount and exchange rate.
 * amountUsdt = amountNaira / exchangeRate
 * Uses BigInt arithmetic to avoid float imprecision.
 */
export function ngnToUsdt(amountNaira: string, exchangeRate: string): string {
  const EXTRA_PRECISION = BigInt(10 ** 8);
  const ngnScaled  = toScaled(amountNaira);
  const rateScaled = toScaled(exchangeRate);
  // (ngnScaled * EXTRA_PRECISION) / rateScaled gives result in SCALE units
  const usdtScaled = (ngnScaled * EXTRA_PRECISION) / rateScaled;
  return fromScaled(usdtScaled, 8);
}

export function isNegative(value: string): boolean {
  return toScaled(value) < 0n;
}

export function isZero(value: string): boolean {
  return toScaled(value) === 0n;
}

export function isGreaterThan(a: string, b: string): boolean {
  return toScaled(a) > toScaled(b);
}

export function isLessThan(a: string, b: string): boolean {
  return toScaled(a) < toScaled(b);
}

export function isLessThanOrEqual(a: string, b: string): boolean {
  return toScaled(a) <= toScaled(b);
}

export function formatNaira(value: string): string {
  return fromScaled(toScaled(value), 2);
}

export function formatUsdt(value: string): string {
  return fromScaled(toScaled(value), 8);
}
