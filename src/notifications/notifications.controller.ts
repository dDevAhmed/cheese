// src/notifications/notifications.controller.ts
import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { CurrentUser }           from '../common/decorators/current-user.decorator'
import { User }                  from '../auth/entities/user.entity'
import { NotificationsService }  from './notifications.service'

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  getAll(@CurrentUser() user: User) {
    return this.notifService.getNotifications(user.id)
  }

  @Post('read')
  @HttpCode(HttpStatus.OK)
  markRead(@CurrentUser() user: User) {
    return this.notifService.markAllRead(user.id)
  }
}
