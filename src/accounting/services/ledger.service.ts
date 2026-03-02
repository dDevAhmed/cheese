import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { RecordLedgerEntryDto } from '../dto/record-ledger-entry.dto';
import { LedgerFilterDto } from '../dto/ledger-filter.dto';
import { LedgerEntryResponseDto, PaginatedResponseDto } from '../dto/response.dto';
import { LedgerIntegrityException } from '../exceptions/accounting.exceptions';
import { addUsdt, subtractUsdt, isLessThan } from '../utils/decimal.util';

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepo: Repository<LedgerEntry>,
  ) {}

  /**
   * Write a single ledger entry inside an existing queryRunner transaction.
   * The queryRunner MUST be provided — this method never manages its own transaction.
   * balanceBefore and balanceAfter are captured from the DTO (computed by the caller
   * immediately before/after the balance update, within the same queryRunner transaction).
   */
  async recordEntry(dto: RecordLedgerEntryDto, qr: QueryRunner): Promise<LedgerEntry> {
    const entry = qr.manager.create(LedgerEntry, {
      transactionId: dto.transactionId,
      accountId:     dto.accountId,
      entryType:     dto.entryType,
      amountNaira:   dto.amountNaira,
      amountUsdt:    dto.amountUsdt,
      currency:      dto.currency,
      balanceBefore: dto.balanceBefore,
      balanceAfter:  dto.balanceAfter,
      description:   dto.description,
    });

    const saved = await qr.manager.save(LedgerEntry, entry);
    this.logger.log(
      `Ledger entry written [id=${saved.id}] [type=${dto.entryType}]` +
      ` [txn=${dto.transactionId}] [account=${dto.accountId}]`,
    );
    return saved;
  }

  /**
   * Verify double-entry integrity for a completed transaction.
   * Sum of all USDT debits must equal sum of all USDT credits.
   * Called after processTransaction completes, before marking COMPLETED.
   */
  async verifyDoubleEntry(transactionId: string): Promise<void> {
    const entries = await this.ledgerRepo.find({ where: { transactionId } });

    let totalDebits  = '0.00000000';
    let totalCredits = '0.00000000';

    for (const e of entries) {
      if (e.entryType === 'debit')  totalDebits  = addUsdt(totalDebits,  e.amountUsdt);
      if (e.entryType === 'credit') totalCredits = addUsdt(totalCredits, e.amountUsdt);
    }

    // Allow for rounding tolerance of 1 satoshi (0.00000001 USDT)
    const diff = subtractUsdt(totalDebits, totalCredits).replace('-', '');
    if (isLessThan('0.00000001', diff)) {
      this.logger.error(
        `[INTEGRITY] Debit/credit mismatch [txn=${transactionId}]` +
        ` [debits=${totalDebits}] [credits=${totalCredits}]`,
      );
      throw new LedgerIntegrityException(transactionId);
    }
  }

  async getLedgerByTransaction(transactionId: string): Promise<LedgerEntryResponseDto[]> {
    const entries = await this.ledgerRepo.find({
      where: { transactionId },
      order: { createdAt: 'ASC' },
    });
    return entries.map(this.toResponseDto);
  }

  async getLedgerByAccount(
    accountId: string,
    filters: LedgerFilterDto,
  ): Promise<PaginatedResponseDto<LedgerEntryResponseDto>> {
    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 20;
    const skip  = (page - 1) * limit;

    const qb = this.ledgerRepo
      .createQueryBuilder('e')
      .where('e.accountId = :accountId', { accountId })
      .orderBy('e.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.entryType) qb.andWhere('e.entryType = :entryType', { entryType: filters.entryType });
    if (filters.currency)  qb.andWhere('e.currency  = :currency',  { currency:  filters.currency  });

    const [entries, total] = await qb.getManyAndCount();

    return {
      data:       entries.map(this.toResponseDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private toResponseDto(e: LedgerEntry): LedgerEntryResponseDto {
    return {
      id:            e.id,
      transactionId: e.transactionId,
      accountId:     e.accountId,
      entryType:     e.entryType,
      currency:      e.currency,
      amountNaira:   e.amountNaira,
      amountUsdt:    e.amountUsdt,
      balanceBefore: e.balanceBefore,
      balanceAfter:  e.balanceAfter,
      description:   e.description,
      createdAt:     e.createdAt.toISOString(),
    };
  }
}
