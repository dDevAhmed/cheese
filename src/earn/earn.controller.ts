// src/earn/earn.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { CurrentUser }  from '../common/decorators/current-user.decorator'
import { User }         from '../auth/entities/user.entity'
import { EarnService }  from './earn.service'
import { DepositEarnDto, WithdrawEarnDto } from './dto'

@Controller('earn')
export class EarnController {
  constructor(private readonly earnService: EarnService) {}

  @Get()
  getPosition(@CurrentUser() user: User) {
    return this.earnService.getPosition(user.id)
  }

  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  deposit(@CurrentUser() user: User, @Body() dto: DepositEarnDto) {
    return this.earnService.deposit(user.id, dto)
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  withdraw(@CurrentUser() user: User, @Body() dto: WithdrawEarnDto) {
    return this.earnService.withdraw(user.id, dto)
  }
}
