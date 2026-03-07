// src/referral/referral.controller.ts
import { Controller, Get } from '@nestjs/common'
import { CurrentUser }     from '../common/decorators/current-user.decorator'
import { User }            from '../auth/entities/user.entity'
import { ReferralService } from './referral.service'

@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get()
  getSummary(@CurrentUser() user: User) {
    return this.referralService.getSummary(user.id)
  }
}
