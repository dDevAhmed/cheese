import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

// ================================================================
// CUSTOM BASE EXCEPTION
// ================================================================

export class TooManyRequestsException extends HttpException {
  constructor(response: string | Record<string, any>) {
    super(response, HttpStatus.TOO_MANY_REQUESTS);
  }
}

// ================================================================
// SIGNUP FLOW EXCEPTIONS
// ================================================================

export class InvalidSignupSessionException extends BadRequestException {
  constructor() {
    super({
      code: 'INVALID_SIGNUP_SESSION',
      message: 'Signup session not found or expired. Please start signup again.',
    });
  }
}

export class InvalidOtpException extends UnauthorizedException {
  constructor() {
    super({
      code: 'INVALID_OTP',
      message: 'The OTP code you entered is incorrect or expired.',
    });
  }
}

export class OtpExpiredException extends UnauthorizedException {
  constructor() {
    super({
      code: 'OTP_EXPIRED',
      message: 'This OTP has expired. Please request a new one.',
    });
  }
}

export class OtpRateLimitException extends TooManyRequestsException {
  constructor(retryAfterSeconds: number) {
    super({
      code: 'OTP_RATE_LIMITED',
      message: `Too many OTP requests. Please wait ${retryAfterSeconds} seconds before trying again.`,
      retryAfter: retryAfterSeconds,
    });
  }
}

export class WalletCreationFailedException extends BadRequestException {
  constructor(reason?: string) {
    super({
      code: 'WALLET_CREATION_FAILED',
      message: reason || 'Failed to create custodial wallet on blockchain.',
    });
  }
}

// ================================================================
// PASSKEY EXCEPTIONS
// ================================================================

export class InvalidPasskeyChallengeException extends UnauthorizedException {
  constructor() {
    super({
      code: 'INVALID_PASSKEY_CHALLENGE',
      message: 'Passkey challenge not found or expired.',
    });
  }
}

export class PasskeyVerificationFailedException extends UnauthorizedException {
  constructor(reason?: string) {
    super({
      code: 'PASSKEY_VERIFICATION_FAILED',
      message: reason || 'Passkey signature verification failed.',
    });
  }
}

export class PasskeyAlreadyRegisteredException extends BadRequestException {
  constructor() {
    super({
      code: 'PASSKEY_ALREADY_REGISTERED',
      message: 'This device already has a passkey registered.',
    });
  }
}

export class NoPasskeyFoundException extends UnauthorizedException {
  constructor() {
    super({
      code: 'NO_PASSKEY_FOUND',
      message: 'No passkey found for this user. Please use email/password login.',
    });
  }
}

export class PasskeyNotSupportedException extends BadRequestException {
  constructor() {
    super({
      code: 'PASSKEY_NOT_SUPPORTED',
      message: 'Passkey authentication is not supported on this device.',
    });
  }
}

// ================================================================
// LOGIN EXCEPTIONS
// ================================================================

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    });
  }
}

export class AccountLockedException extends ForbiddenException {
  constructor(lockedUntil: Date) {
    super({
      code: 'ACCOUNT_LOCKED',
      message: `Account locked due to too many failed login attempts. Try again after ${lockedUntil.toISOString()}.`,
      lockedUntil: lockedUntil.toISOString(),
    });
  }
}

export class TwoFactorRequiredException extends UnauthorizedException {
  constructor() {
    super({
      code: 'TWO_FACTOR_REQUIRED',
      message: '2FA code is required to complete login.',
    });
  }
}

export class Invalid2FACodeException extends UnauthorizedException {
  constructor() {
    super({
      code: 'INVALID_2FA_CODE',
      message: 'The 2FA code you entered is incorrect.',
    });
  }
}

// ================================================================
// TOKEN EXCEPTIONS
// ================================================================

export class InvalidTokenException extends UnauthorizedException {
  constructor(tokenType = 'token') {
    super({
      code: 'INVALID_TOKEN',
      message: `The ${tokenType} is invalid or malformed.`,
    });
  }
}

export class TokenExpiredException extends UnauthorizedException {
  constructor(tokenType = 'token') {
    super({
      code: 'TOKEN_EXPIRED',
      message: `Your ${tokenType} has expired. Please log in again.`,
    });
  }
}

export class SessionInvalidatedException extends UnauthorizedException {
  constructor() {
    super({
      code: 'SESSION_INVALIDATED',
      message: 'Your session has been invalidated. Please log in again.',
    });
  }
}

export class RefreshTokenNotFoundException extends UnauthorizedException {
  constructor() {
    super({
      code: 'REFRESH_TOKEN_NOT_FOUND',
      message: 'Refresh token not found. Please log in again.',
    });
  }
}

// ================================================================
// SESSION EXCEPTIONS
// ================================================================

export class SessionNotFoundException extends BadRequestException {
  constructor(sessionId: string) {
    super({
      code: 'SESSION_NOT_FOUND',
      message: `Session ${sessionId} not found.`,
    });
  }
}

export class MaxSessionsExceededException extends ForbiddenException {
  constructor(maxSessions: number) {
    super({
      code: 'MAX_SESSIONS_EXCEEDED',
      message: `Maximum of ${maxSessions} concurrent sessions allowed. Please log out from another device.`,
      maxSessions,
    });
  }
}

// ================================================================
// RATE LIMITING
// ================================================================

export class LoginRateLimitException extends TooManyRequestsException {
  constructor(retryAfterSeconds: number) {
    super({
      code: 'LOGIN_RATE_LIMITED',
      message: `Too many login attempts. Please wait ${retryAfterSeconds} seconds before trying again.`,
      retryAfter: retryAfterSeconds,
    });
  }
}
