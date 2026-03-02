import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { EntryType } from '../entities/ledger-entry.entity';
import { AccountCurrency } from '../entities/account.entity';

export class LedgerFilterDto {
  @IsOptional()
  @IsEnum(EntryType)
  entryType?: EntryType;

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
