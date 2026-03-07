// src/auth/dto/index.ts
import {
  IsEmail, IsEnum, IsNotEmpty, IsString,
  Matches, MaxLength, MinLength,
} from 'class-validator'
import { OtpType } from '../../otp/entities/otp.entity'

export class SignupDto {
  @IsString() @IsNotEmpty() @MaxLength(80)
  fullName: string

  @IsEmail()
  email: string

  @Matches(/^\+?[1-9]\d{9,14}$/, { message: 'Invalid phone number' })
  phone: string

  @IsString() @MinLength(3) @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers and underscores' })
  username: string

  @IsString() @MinLength(8) @MaxLength(64)
  password: string

  @IsString() @IsNotEmpty()
  devicePublicKey: string   // P-256 public key (base64url or PEM)

  @IsString() @IsNotEmpty()
  deviceId: string
}

export class VerifyOtpDto {
  @IsEmail()
  email: string

  @IsString() @MinLength(6) @MaxLength(6)
  otp: string

  @IsEnum(OtpType)
  type: OtpType
}

export class ResendOtpDto {
  @IsEmail()
  email: string

  @IsEnum(OtpType)
  type: OtpType
}

export class LoginDto {
  @IsString() @IsNotEmpty()
  identifier: string   // email or username

  @IsString() @IsNotEmpty()
  password: string

  @IsString() @IsNotEmpty()
  deviceSignature: string   // ECDSA P-256 signature of SHA256(timestamp) in base64

  @IsString() @IsNotEmpty()
  deviceId: string
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string
}

export class ResetPasswordDto {
  @IsEmail()
  email: string

  @IsString() @MinLength(6) @MaxLength(6)
  otp: string

  @IsString() @MinLength(8) @MaxLength(64)
  newPassword: string
}

export class VerifyPinDto {
  @IsString() @IsNotEmpty()
  pinHash: string   // HMAC-SHA256(pin, deviceId) in base64url

  @IsString() @IsNotEmpty()
  deviceId: string
}

export class ChangePinDto {
  @IsString() @IsNotEmpty()
  currentPinHash: string

  @IsString() @IsNotEmpty()
  newPinHash: string

  @IsString() @IsNotEmpty()
  deviceId: string

  @IsString() @IsNotEmpty()
  deviceSignature: string
}
