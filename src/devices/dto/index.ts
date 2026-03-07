// src/devices/dto/index.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class RegisterDeviceDto {
  @IsString() @IsNotEmpty()
  deviceId: string

  @IsString() @IsNotEmpty()
  publicKey: string

  @IsString() @IsOptional()
  deviceName?: string
}
