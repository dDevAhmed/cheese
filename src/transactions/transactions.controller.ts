// src/transactions/transactions.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query, DefaultValuePipe } from '@nestjs/common'
import { CurrentUser }          from '../common/decorators/current-user.decorator'
import { User }                 from '../auth/entities/user.entity'
import { TransactionsService }  from './transactions.service'

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @Get()
  getList(
    @CurrentUser() user: User,
    @Query('page',     new DefaultValuePipe(1),  ParseIntPipe) page:     number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.txService.getList(user.id, page, pageSize)
  }

  @Get(':id')
  getById(@CurrentUser() user: User, @Param('id') id: string) {
    return this.txService.getById(user.id, id)
  }
}