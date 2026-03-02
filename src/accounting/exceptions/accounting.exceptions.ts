import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientBalanceException extends HttpException {
  constructor(required: string, available: string, currency: string) {
    super(
      {
        code: 'INSUFFICIENT_BALANCE',
        message: `Insufficient ${currency} balance. Required: ${required}, Available: ${available}`,
        required,
        available,
        currency,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class AccountNotFoundException extends HttpException {
  constructor(identifier: string) {
    super(
      { code: 'ACCOUNT_NOT_FOUND', message: `Account not found: ${identifier}` },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class AccountNotEligibleException extends HttpException {
  constructor(status: string) {
    super(
      {
        code: 'ACCOUNT_NOT_ELIGIBLE',
        message: `Account is not eligible for transactions. Current status: ${status}`,
        accountStatus: status,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class TransactionNotFoundException extends HttpException {
  constructor(reference: string) {
    super(
      { code: 'TRANSACTION_NOT_FOUND', message: `Transaction not found: ${reference}` },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class DuplicateTransactionException extends HttpException {
  constructor(reference: string) {
    super(
      { code: 'DUPLICATE_TRANSACTION', message: `Transaction already exists: ${reference}` },
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidTransactionStateException extends HttpException {
  constructor(current: string, attempted: string) {
    super(
      {
        code: 'INVALID_TRANSACTION_STATE',
        message: `Cannot transition transaction from '${current}' to '${attempted}'`,
        currentStatus: current,
        attemptedTransition: attempted,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class LedgerIntegrityException extends HttpException {
  constructor(transactionId: string) {
    super(
      {
        code: 'LEDGER_INTEGRITY_ERROR',
        message: `Double-entry integrity check failed for transaction ${transactionId}. Debits do not equal credits.`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
