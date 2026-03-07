// src/wallet/wallet.controller.ts
import { Controller, Get } from '@nestjs/common'
import { CurrentUser }     from '../common/decorators/current-user.decorator'
import { User }            from '../auth/entities/user.entity'
import { WalletService }   from './wallet.service'

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  getBalance(@CurrentUser() user: User) {
    return this.walletService.getBalance(user.id)
  }

  @Get('address')
  getAddress(@CurrentUser() user: User) {
    return this.walletService.getAddress(user.id)
  }

  @Get('deposit-networks')
  getDepositNetworks() {
    return this.walletService.getDepositNetworks()
  }
}