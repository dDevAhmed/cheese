// src/earn/dto/index.ts
import { IsIn, IsNumberString, IsOptional } from 'class-validator'

export class DepositEarnDto {
  @IsNumberString()
  amountUsdc: string
}

export class WithdrawEarnDto {
  @IsNumberString()
  amountUsdc: string
}
