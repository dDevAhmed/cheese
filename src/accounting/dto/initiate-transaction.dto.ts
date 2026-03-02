import {
  IsUUID, IsString, IsNumberString, IsOptional, Length,
  Matches, IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class InitiateTransactionDto {
  @IsUUID()
  userId: string;

  /**
   * NGN amount as a string to avoid floating-point issues.
   * Must be a valid decimal string with up to 2 decimal places.
   * Example: "50000.00"
   */
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'amountNaira must be a valid NGN decimal (max 2 decimal places)' })
  amountNaira: string;

  @IsString()
  @Length(6, 10)
  recipientAccountNumber: string;

  @IsString()
  @Length(3, 10)
  recipientBankCode: string;

  @IsString()
  @Length(1, 200)
  recipientAccountName: string;

  /**
   * USDT/NGN exchange rate locked at the moment of request.
   * The caller (FX service) is responsible for providing this.
   * Backend must never fetch rates — it only records what was supplied.
   */
  @IsNumberString()
  @Matches(/^\d+(\.\d{1,8})?$/, { message: 'exchangeRate must be a valid decimal (max 8 decimal places)' })
  exchangeRate: string;

  @IsString()
  @Length(1, 100)
  fxRateSource: string;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => value ?? null)
  metadata?: Record<string, unknown>;
}
