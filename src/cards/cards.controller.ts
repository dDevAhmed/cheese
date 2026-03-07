// src/cards/cards.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { CurrentUser }  from '../common/decorators/current-user.decorator'
import { User }         from '../auth/entities/user.entity'
import { CardsService } from './cards.service'
import { RevealCvvDto } from './dto'

@Controller('card')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  getCard(@CurrentUser() user: User) {
    return this.cardsService.getCard(user.id)
  }

  @Post('freeze')
  @HttpCode(HttpStatus.OK)
  freeze(@CurrentUser() user: User) {
    return this.cardsService.freezeCard(user.id)
  }

  @Post('unfreeze')
  @HttpCode(HttpStatus.OK)
  unfreeze(@CurrentUser() user: User) {
    return this.cardsService.unfreezeCard(user.id)
  }

  @Post('cvv')
  @HttpCode(HttpStatus.OK)
  revealCvv(@CurrentUser() user: User, @Body() dto: RevealCvvDto) {
    return this.cardsService.revealCvv(user.id, dto)
  }

  @Get('transactions')
  getTransactions(@CurrentUser() user: User) {
    return this.cardsService.getCardTransactions(user.id)
  }
}
