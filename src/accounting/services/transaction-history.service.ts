import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Account } from '../entities/account.entity';
import { LedgerService } from './ledger.service';
import { TransactionService } from './transaction.service';
import { AccountingService } from './accounting.service';
import { TransactionFilterDto } from '../dto/transaction-filter.dto';
import {
  TransactionHistoryItemDto,
  TransactionDetailResponseDto,
  PaginatedResponseDto,
} from '../dto/response.dto';

@Injectable()
export class TransactionHistoryService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private readonly ledgerService: LedgerService,
    private readonly txService: TransactionService,
  ) {}

  /**
   * Paginated transaction history for a user.
   * Filters by status, type, date range, and currency.
   */
  async getHistory(
    userId: string,
    filters: TransactionFilterDto,
  ): Promise<PaginatedResponseDto<TransactionHistoryItemDto>> {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) return { data: [], total: 0, page: 1, limit: filters.limit ?? 20, totalPages: 0 };

    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 20;
    const skip  = (page - 1) * limit;

    const qb = this.txRepo
      .createQueryBuilder('t')
      .where('t.senderAccountId = :id OR t.receiverAccountId = :id', { id: account.id })
      .orderBy('t.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.status)    qb.andWhere('t.status          = :status',   { status:    filters.status    });
    if (filters.type)      qb.andWhere('t.transactionType = :type',     { type:      filters.type      });
    if (filters.startDate) qb.andWhere('t.createdAt      >= :start',    { start:     filters.startDate });
    if (filters.endDate)   qb.andWhere('t.createdAt      <= :end',      { end:       filters.endDate   });

    const [txns, total] = await qb.getManyAndCount();

    return {
      data:       txns.map(this.toHistoryItemDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Full transaction detail including all ledger entries.
   * Used for the transaction detail screen and audit queries.
   */
  async getTransactionDetail(reference: string): Promise<TransactionDetailResponseDto> {
    const tx      = await this.txService.findByReference(reference);
    const entries = await this.ledgerService.getLedgerByTransaction(tx.id);

    return {
      ...this.toHistoryItemDto(tx),
      senderAccountId:   tx.senderAccountId,
      receiverAccountId: tx.receiverAccountId,
      metadata:          tx.metadata,
      failureReason:     tx.failureReason,
      ledgerEntries:     entries,
    };
  }

  /**
   * Export-ready structured data — caller formats to CSV/PDF as needed.
   * Returns all matching transactions without pagination for export context.
   * Cap at 10,000 rows; for larger exports use a background job.
   */
  async exportHistory(
    userId: string,
    filters: TransactionFilterDto,
  ): Promise<TransactionHistoryItemDto[]> {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) return [];

    const qb = this.txRepo
      .createQueryBuilder('t')
      .where('t.senderAccountId = :id OR t.receiverAccountId = :id', { id: account.id })
      .orderBy('t.createdAt', 'DESC')
      .take(10_000);

    if (filters.status)    qb.andWhere('t.status          = :status', { status:    filters.status    });
    if (filters.type)      qb.andWhere('t.transactionType = :type',   { type:      filters.type      });
    if (filters.startDate) qb.andWhere('t.createdAt      >= :start',  { start:     filters.startDate });
    if (filters.endDate)   qb.andWhere('t.createdAt      <= :end',    { end:       filters.endDate   });

    const txns = await qb.getMany();
    return txns.map(this.toHistoryItemDto);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private toHistoryItemDto(tx: Transaction): TransactionHistoryItemDto {
    return {
      reference:              tx.reference,
      amountNaira:            tx.amountNaira,
      amountUsdt:             tx.amountUsdt,
      exchangeRate:           tx.exchangeRate,
      fxRateSource:           tx.fxRateSource,
      status:                 tx.status,
      transactionType:        tx.transactionType,
      recipientAccountNumber: tx.recipientAccountNumber,
      recipientBankCode:      tx.recipientBankCode,
      recipientAccountName:   tx.recipientAccountName,
      initiatedAt:            tx.initiatedAt.toISOString(),
      completedAt:            tx.completedAt?.toISOString() ?? null,
      createdAt:              tx.createdAt.toISOString(),
    };
  }
}
