"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageResponseDto = exports.TwoFactorSetupResponseDto = exports.PaginatedUsersResponseDto = exports.UserResponseDto = exports.UserQueryDto = exports.InviteTeamMemberDto = exports.UpdateTransactionLimitsDto = exports.UpdateUserStatusDto = exports.UpdateUserRoleDto = exports.Use2FABackupCodeDto = exports.Disable2FADto = exports.Verify2FADto = exports.Enable2FADto = exports.VerifyPhoneDto = exports.ResendVerificationEmailDto = exports.VerifyEmailDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.ChangePasswordDto = exports.UpdateUserDto = exports.CreateUserDto = exports.NotificationPreferencesDto = exports.NotificationPushPreferencesDto = exports.NotificationSmsPreferencesDto = exports.NotificationEmailPreferencesDto = exports.PASSWORD_RULES = exports.PASSWORD_REGEX = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const users_entity_1 = require("./users.entity");
exports.PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#^])[A-Za-z\d@$!%*?&_\-#^]{8,128}$/;
exports.PASSWORD_RULES = 'Must be 8–128 chars, include uppercase, lowercase, number, and special character';
class NotificationEmailPreferencesDto {
    transactionAlerts;
    settlementNotifications;
    securityAlerts;
    productUpdates;
    marketingEmails;
}
exports.NotificationEmailPreferencesDto = NotificationEmailPreferencesDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationEmailPreferencesDto.prototype, "transactionAlerts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationEmailPreferencesDto.prototype, "settlementNotifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationEmailPreferencesDto.prototype, "securityAlerts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationEmailPreferencesDto.prototype, "productUpdates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationEmailPreferencesDto.prototype, "marketingEmails", void 0);
class NotificationSmsPreferencesDto {
    transactionAlerts;
    securityAlerts;
}
exports.NotificationSmsPreferencesDto = NotificationSmsPreferencesDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationSmsPreferencesDto.prototype, "transactionAlerts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationSmsPreferencesDto.prototype, "securityAlerts", void 0);
class NotificationPushPreferencesDto {
    transactionAlerts;
    settlementNotifications;
}
exports.NotificationPushPreferencesDto = NotificationPushPreferencesDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPushPreferencesDto.prototype, "transactionAlerts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPushPreferencesDto.prototype, "settlementNotifications", void 0);
class NotificationPreferencesDto {
    email;
    sms;
    push;
}
exports.NotificationPreferencesDto = NotificationPreferencesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationEmailPreferencesDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationEmailPreferencesDto),
    __metadata("design:type", NotificationEmailPreferencesDto)
], NotificationPreferencesDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationSmsPreferencesDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationSmsPreferencesDto),
    __metadata("design:type", NotificationSmsPreferencesDto)
], NotificationPreferencesDto.prototype, "sms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: NotificationPushPreferencesDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationPushPreferencesDto),
    __metadata("design:type", NotificationPushPreferencesDto)
], NotificationPreferencesDto.prototype, "push", void 0);
class CreateUserDto {
    email;
    password;
    fullName;
    phoneNumber;
    role;
    timezone;
    language;
    preferredCurrency;
    merchantId;
    metadata;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'merchant@example.com' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SecurePass@123', description: exports.PASSWORD_RULES }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(exports.PASSWORD_REGEX, { message: exports.PASSWORD_RULES }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateUserDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+2348012345678' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: users_entity_1.UserRole, default: users_entity_1.UserRole.MERCHANT_OWNER }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(users_entity_1.UserRole),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Africa/Lagos' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateUserDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'en' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], CreateUserDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'USD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(3),
    __metadata("design:type", String)
], CreateUserDto.prototype, "preferredCurrency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateUserDto.prototype, "metadata", void 0);
class UpdateUserDto {
    fullName;
    phoneNumber;
    timezone;
    language;
    preferredCurrency;
    avatarUrl;
    notificationPreferences;
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+2348012345678' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Africa/Lagos' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'en' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'USD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(3),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "preferredCurrency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: NotificationPreferencesDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationPreferencesDto),
    __metadata("design:type", NotificationPreferencesDto)
], UpdateUserDto.prototype, "notificationPreferences", void 0);
class ChangePasswordDto {
    currentPassword;
    newPassword;
    confirmNewPassword;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: exports.PASSWORD_RULES }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(exports.PASSWORD_REGEX, { message: exports.PASSWORD_RULES }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "confirmNewPassword", void 0);
class ForgotPasswordDto {
    email;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'merchant@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
    token;
    newPassword;
    confirmNewPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: exports.PASSWORD_RULES }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(exports.PASSWORD_REGEX, { message: exports.PASSWORD_RULES }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "confirmNewPassword", void 0);
class VerifyEmailDto {
    token;
}
exports.VerifyEmailDto = VerifyEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "token", void 0);
class ResendVerificationEmailDto {
    email;
}
exports.ResendVerificationEmailDto = ResendVerificationEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'merchant@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ResendVerificationEmailDto.prototype, "email", void 0);
class VerifyPhoneDto {
    code;
}
exports.VerifyPhoneDto = VerifyPhoneDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(4),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], VerifyPhoneDto.prototype, "code", void 0);
class Enable2FADto {
    method;
}
exports.Enable2FADto = Enable2FADto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: users_entity_1.TwoFactorMethod }),
    (0, class_validator_1.IsEnum)(users_entity_1.TwoFactorMethod),
    __metadata("design:type", String)
], Enable2FADto.prototype, "method", void 0);
class Verify2FADto {
    code;
}
exports.Verify2FADto = Verify2FADto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'OTP code from authenticator app or SMS' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(8),
    __metadata("design:type", String)
], Verify2FADto.prototype, "code", void 0);
class Disable2FADto {
    password;
    code;
}
exports.Disable2FADto = Disable2FADto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Disable2FADto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current 2FA code to confirm ownership' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(8),
    __metadata("design:type", String)
], Disable2FADto.prototype, "code", void 0);
class Use2FABackupCodeDto {
    backupCode;
}
exports.Use2FABackupCodeDto = Use2FABackupCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Use2FABackupCodeDto.prototype, "backupCode", void 0);
class UpdateUserRoleDto {
    role;
}
exports.UpdateUserRoleDto = UpdateUserRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: users_entity_1.UserRole }),
    (0, class_validator_1.IsEnum)(users_entity_1.UserRole),
    __metadata("design:type", String)
], UpdateUserRoleDto.prototype, "role", void 0);
class UpdateUserStatusDto {
    status;
    reason;
}
exports.UpdateUserStatusDto = UpdateUserStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: users_entity_1.UserStatus }),
    (0, class_validator_1.IsEnum)(users_entity_1.UserStatus),
    __metadata("design:type", String)
], UpdateUserStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for status change' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateUserStatusDto.prototype, "reason", void 0);
class UpdateTransactionLimitsDto {
    dailyTransactionLimit;
    monthlyTransactionLimit;
    singleTransactionLimit;
}
exports.UpdateTransactionLimitsDto = UpdateTransactionLimitsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateTransactionLimitsDto.prototype, "dailyTransactionLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateTransactionLimitsDto.prototype, "monthlyTransactionLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], UpdateTransactionLimitsDto.prototype, "singleTransactionLimit", void 0);
class InviteTeamMemberDto {
    email;
    role;
    fullName;
}
exports.InviteTeamMemberDto = InviteTeamMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'teamember@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], InviteTeamMemberDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: users_entity_1.UserRole }),
    (0, class_validator_1.IsEnum)(users_entity_1.UserRole),
    __metadata("design:type", String)
], InviteTeamMemberDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], InviteTeamMemberDto.prototype, "fullName", void 0);
class UserQueryDto {
    search;
    role;
    status;
    kycStatus;
    merchantId;
    page = 1;
    limit = 20;
    sortBy = 'createdAt';
    sortOrder = 'DESC';
}
exports.UserQueryDto = UserQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: users_entity_1.UserRole }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(users_entity_1.UserRole),
    __metadata("design:type", String)
], UserQueryDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: users_entity_1.UserStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(users_entity_1.UserStatus),
    __metadata("design:type", String)
], UserQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: users_entity_1.KYCStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(users_entity_1.KYCStatus),
    __metadata("design:type", String)
], UserQueryDto.prototype, "kycStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'createdAt' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['ASC', 'DESC'], default: 'DESC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ASC', 'DESC']),
    __metadata("design:type", String)
], UserQueryDto.prototype, "sortOrder", void 0);
class UserResponseDto {
    id;
    email;
    fullName;
    phoneNumber;
    role;
    status;
    merchantId;
    emailVerified;
    phoneVerified;
    twoFactorEnabled;
    twoFactorMethod;
    kycStatus;
    timezone;
    language;
    preferredCurrency;
    notificationPreferences;
    avatarUrl;
    dailyTransactionLimit;
    monthlyTransactionLimit;
    singleTransactionLimit;
    lastLoginAt;
    apiAccessEnabled;
    createdAt;
    updatedAt;
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "fullName", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "role", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "merchantId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "emailVerified", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "phoneVerified", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "twoFactorEnabled", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "twoFactorMethod", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "kycStatus", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "timezone", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "language", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "preferredCurrency", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "notificationPreferences", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "dailyTransactionLimit", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "monthlyTransactionLimit", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "singleTransactionLimit", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "lastLoginAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "apiAccessEnabled", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "updatedAt", void 0);
class PaginatedUsersResponseDto {
    data;
    total;
    page;
    limit;
    totalPages;
    hasNextPage;
    hasPreviousPage;
}
exports.PaginatedUsersResponseDto = PaginatedUsersResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [UserResponseDto] }),
    __metadata("design:type", Array)
], PaginatedUsersResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedUsersResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedUsersResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedUsersResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedUsersResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], PaginatedUsersResponseDto.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], PaginatedUsersResponseDto.prototype, "hasPreviousPage", void 0);
class TwoFactorSetupResponseDto {
    qrCode;
    secret;
    backupCodes;
    message;
}
exports.TwoFactorSetupResponseDto = TwoFactorSetupResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'QR code data URL for TOTP setup' }),
    __metadata("design:type", String)
], TwoFactorSetupResponseDto.prototype, "qrCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Manual TOTP secret for apps that require it' }),
    __metadata("design:type", String)
], TwoFactorSetupResponseDto.prototype, "secret", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Backup codes for emergency access' }),
    __metadata("design:type", Array)
], TwoFactorSetupResponseDto.prototype, "backupCodes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TwoFactorSetupResponseDto.prototype, "message", void 0);
class MessageResponseDto {
    message;
    data;
}
exports.MessageResponseDto = MessageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], MessageResponseDto.prototype, "data", void 0);
//# sourceMappingURL=user.dto.js.map