// src/profile/dto/index.ts
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(80)
  fullName?: string

  @IsOptional() @IsString() @MinLength(3) @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers and underscores' })
  username?: string

  @IsOptional()
  @Matches(/^\+?[1-9]\d{9,14}$/, { message: 'Invalid phone number' })
  phone?: string
}
