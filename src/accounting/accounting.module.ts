import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { AccountingController } from './controllers/accounting.controller';
import { AccountingService } from './services/accounting.service';
import { TransactionService } from './services/transaction.service';
import { TransactionHistoryService } from './services/transaction-history.service';
import { LedgerService } from './services/ledger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction, LedgerEntry]),
  ],
  controllers: [AccountingController],
  providers: [
    AccountingService,
    TransactionService,
    TransactionHistoryService,
    LedgerService,
  ],
  exports: [
    AccountingService,
    TransactionService,
    TransactionHistoryService,
    LedgerService,
    TypeOrmModule,
  ],
})
export class AccountingModule {}
