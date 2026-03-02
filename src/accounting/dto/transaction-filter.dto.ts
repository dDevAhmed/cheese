import {
  IsOptional, IsEnum, IsDateString, IsInt, Min, Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { AccountCurrency } from '../entities/account.entity';

export class TransactionFilterDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(AccountCurrency)
  currency?: AccountCurrency;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
