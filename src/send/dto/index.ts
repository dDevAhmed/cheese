// src/send/dto/index.ts
import { IsNotEmpty, IsNumberString, IsString, Min } from 'class-validator'

export class SendToUsernameDto {
  @IsString() @IsNotEmpty()
  username: string

  @IsNumberString()
  amountUsdc: string

  @IsString() @IsNotEmpty()
  pinHash: string

  @IsString() @IsNotEmpty()
  deviceSignature: string

  @IsString() @IsNotEmpty()
  deviceId: string
}

export class SendToAddressDto {
  @IsString() @IsNotEmpty()
  address: string

  @IsNumberString()
  amountUsdc: string

  @IsString() @IsNotEmpty()
  network: string

  @IsString() @IsNotEmpty()
  pinHash: string

  @IsString() @IsNotEmpty()
  deviceSignature: string

  @IsString() @IsNotEmpty()
  deviceId: string
}
