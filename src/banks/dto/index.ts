// src/banks/dto/index.ts
import { IsNotEmpty, IsNumberString, IsString, MinLength, MaxLength } from 'class-validator'

export class ResolveAccountDto {
  @IsString() @IsNotEmpty() @MinLength(10) @MaxLength(10)
  accountNumber: string

  @IsString() @IsNotEmpty()
  bankCode: string
}

export class BankTransferDto {
  @IsString() @IsNotEmpty() @MinLength(10) @MaxLength(10)
  accountNumber: string

  @IsString() @IsNotEmpty()
  bankCode: string

  @IsString() @IsNotEmpty()
  accountName: string

  @IsNumberString()
  amountNgn: string

  @IsString() @IsNotEmpty()
  pinHash: string

  @IsString() @IsNotEmpty()
  deviceSignature: string

  @IsString() @IsNotEmpty()
  deviceId: string
}
