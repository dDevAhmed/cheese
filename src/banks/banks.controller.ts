// src/banks/banks.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { CurrentUser }       from '../common/decorators/current-user.decorator'
import { User }              from '../auth/entities/user.entity'
import { BanksService }      from './banks.service'
import { BankTransferDto, ResolveAccountDto } from './dto'

@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get()
  getBanks() {
    return this.banksService.getBanks()
  }

  @Post('resolve')
  @HttpCode(HttpStatus.OK)
  resolveAccount(@Body() dto: ResolveAccountDto) {
    return this.banksService.resolveAccount(dto)
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  bankTransfer(@CurrentUser() user: User, @Body() dto: BankTransferDto) {
    return this.banksService.bankTransfer(user.id, dto)
  }
}
