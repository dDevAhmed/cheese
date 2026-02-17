import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsPhoneNumber,
  IsUrl,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
  IsObject,
  ValidateNested,
  IsArray,
  IsPositive,
} from 'class-validator';
import { Type, Exclude, Expose } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  OmitType,
} from '@nestjs/swagger';
import {
  UserRole,
  UserStatus,
  KYCStatus,
  TwoFactorMethod,
} from './users.entity';

// ================================================================
// PASSWORD VALIDATION
// ================================================================

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#^])[A-Za-z\d@$!%*?&_\-#^]{8,128}$/;

export const PASSWORD_RULES =
  'Must be 8–128 chars, include uppercase, lowercase, number, and special character';

// ================================================================
// NESTED DTOs
// ================================================================

export class NotificationEmailPreferencesDto {
  @ApiProperty() @IsBoolean() transactionAlerts: boolean;
  @ApiProperty() @IsBoolean() settlementNotifications: boolean;
  @ApiProperty() @IsBoolean() securityAlerts: boolean;
  @ApiProperty() @IsBoolean() productUpdates: boolean;
  @ApiProperty() @IsBoolean() marketingEmails: boolean;
}

export class NotificationSmsPreferencesDto {
  @ApiProperty() @IsBoolean() transactionAlerts: boolean;
  @ApiProperty() @IsBoolean() securityAlerts: boolean;
}

export class NotificationPushPreferencesDto {
  @ApiProperty() @IsBoolean() transactionAlerts: boolean;
  @ApiProperty() @IsBoolean() settlementNotifications: boolean;
}

export class NotificationPreferencesDto {
  @ApiProperty({ type: NotificationEmailPreferencesDto })
  @ValidateNested()
  @Type(() => NotificationEmailPreferencesDto)
  email: NotificationEmailPreferencesDto;

  @ApiProperty({ type: NotificationSmsPreferencesDto })
  @ValidateNested()
  @Type(() => NotificationSmsPreferencesDto)
  sms: NotificationSmsPreferencesDto;

  @ApiProperty({ type: NotificationPushPreferencesDto })
  @ValidateNested()
  @Type(() => NotificationPushPreferencesDto)
  push: NotificationPushPreferencesDto;
}

// ================================================================
// CREATE USER DTO
// ================================================================

export class CreateUserDto {
  @ApiProperty({ example: 'merchant@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'SecurePass@123', description: PASSWORD_RULES })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_RULES })
  password: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.MERCHANT_OWNER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Africa/Lagos' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  preferredCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  merchantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// ================================================================
// UPDATE USER DTO
// ================================================================

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Africa/Lagos' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  preferredCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({ type: NotificationPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notificationPreferences?: NotificationPreferencesDto;
}

// ================================================================
// CHANGE PASSWORD DTO
// ================================================================

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: PASSWORD_RULES })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_RULES })
  newPassword: string;

  @ApiProperty()
  @IsString()
  confirmNewPassword: string;
}

// ================================================================
// FORGOT / RESET PASSWORD DTOs
// ================================================================

export class ForgotPasswordDto {
  @ApiProperty({ example: 'merchant@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ description: PASSWORD_RULES })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_RULES })
  newPassword: string;

  @ApiProperty()
  @IsString()
  confirmNewPassword: string;
}

// ================================================================
// EMAIL VERIFICATION DTOs
// ================================================================

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  token: string;
}

export class ResendVerificationEmailDto {
  @ApiProperty({ example: 'merchant@example.com' })
  @IsEmail()
  email: string;
}

// ================================================================
// PHONE VERIFICATION DTOs
// ================================================================

export class VerifyPhoneDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(10)
  code: string;
}

// ================================================================
// 2FA DTOs
// ================================================================

export class Enable2FADto {
  @ApiProperty({ enum: TwoFactorMethod })
  @IsEnum(TwoFactorMethod)
  method: TwoFactorMethod;
}

export class Verify2FADto {
  @ApiProperty({ description: 'OTP code from authenticator app or SMS' })
  @IsString()
  @MinLength(6)
  @MaxLength(8)
  code: string;
}

export class Disable2FADto {
  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'Current 2FA code to confirm ownership' })
  @IsString()
  @MinLength(6)
  @MaxLength(8)
  code: string;
}

export class Use2FABackupCodeDto {
  @ApiProperty()
  @IsString()
  backupCode: string;
}

// ================================================================
// ADMIN DTOs
// ================================================================

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class UpdateTransactionLimitsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  dailyTransactionLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  monthlyTransactionLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  singleTransactionLimit?: number;
}

export class InviteTeamMemberDto {
  @ApiProperty({ example: 'teamember@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;
}

// ================================================================
// QUERY / FILTER DTOs
// ================================================================

export class UserQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ enum: KYCStatus })
  @IsOptional()
  @IsEnum(KYCStatus)
  kycStatus?: KYCStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  merchantId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// ================================================================
// RESPONSE DTOs (what we return to clients)
// ================================================================

export class UserResponseDto {
  @Expose() id: string;
  @Expose() email: string;
  @Expose() fullName: string | null;
  @Expose() phoneNumber: string | null;
  @Expose() role: UserRole;
  @Expose() status: UserStatus;
  @Expose() merchantId: string | null;
  @Expose() emailVerified: boolean;
  @Expose() phoneVerified: boolean;
  @Expose() twoFactorEnabled: boolean;
  @Expose() twoFactorMethod: TwoFactorMethod;
  @Expose() kycStatus: KYCStatus;
  @Expose() timezone: string;
  @Expose() language: string;
  @Expose() preferredCurrency: string;
  @Expose() notificationPreferences: any;
  @Expose() avatarUrl: string | null;
  @Expose() dailyTransactionLimit: number | null;
  @Expose() monthlyTransactionLimit: number | null;
  @Expose() singleTransactionLimit: number | null;
  @Expose() lastLoginAt: Date | null;
  @Expose() apiAccessEnabled: boolean;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;
}

export class TwoFactorSetupResponseDto {
  @ApiProperty({ description: 'QR code data URL for TOTP setup' })
  qrCode?: string;

  @ApiProperty({ description: 'Manual TOTP secret for apps that require it' })
  secret?: string;

  @ApiProperty({ description: 'Backup codes for emergency access' })
  backupCodes?: string[];

  @ApiProperty()
  message: string;
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  data?: any;
}
