// src/rates/rates.controller.ts
import { Controller, Get } from '@nestjs/common'
import { RatesService }    from './rates.service'

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get('current')
  getCurrent() {
    return this.ratesService.getCurrentRate()
  }
}