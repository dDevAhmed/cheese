// src/profile/profile.controller.ts
import { Body, Controller, Patch } from '@nestjs/common'
import { CurrentUser }   from '../common/decorators/current-user.decorator'
import { User }          from '../auth/entities/user.entity'
import { ProfileService } from './profile.service'
import { UpdateProfileDto } from './dto'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch()
  update(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.profileService.update(user.id, dto)
  }
}
