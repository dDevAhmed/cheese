// src/send/send.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common'
import { CurrentUser }       from '../common/decorators/current-user.decorator'
import { User }              from '../auth/entities/user.entity'
import { SendService }       from './send.service'
import { SendToAddressDto, SendToUsernameDto } from './dto'

@Controller('send')
export class SendController {
  constructor(private readonly sendService: SendService) {}

  @Get('resolve/:username')
  resolveUsername(@Param('username') username: string) {
    return this.sendService.resolveUsername(username)
  }

  @Post('username')
  @HttpCode(HttpStatus.OK)
  sendToUsername(@CurrentUser() user: User, @Body() dto: SendToUsernameDto) {
    return this.sendService.sendToUsername(user.id, dto)
  }

  @Post('address')
  @HttpCode(HttpStatus.OK)
  sendToAddress(@CurrentUser() user: User, @Body() dto: SendToAddressDto) {
    return this.sendService.sendToAddress(user.id, dto)
  }
}