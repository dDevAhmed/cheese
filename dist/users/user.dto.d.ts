import { UserRole, UserStatus, KYCStatus, TwoFactorMethod } from './users.entity';
export declare const PASSWORD_REGEX: RegExp;
export declare const PASSWORD_RULES = "Must be 8\u2013128 chars, include uppercase, lowercase, number, and special character";
export declare class NotificationEmailPreferencesDto {
    transactionAlerts: boolean;
    settlementNotifications: boolean;
    securityAlerts: boolean;
    productUpdates: boolean;
    marketingEmails: boolean;
}
export declare class NotificationSmsPreferencesDto {
    transactionAlerts: boolean;
    securityAlerts: boolean;
}
export declare class NotificationPushPreferencesDto {
    transactionAlerts: boolean;
    settlementNotifications: boolean;
}
export declare class NotificationPreferencesDto {
    email: NotificationEmailPreferencesDto;
    sms: NotificationSmsPreferencesDto;
    push: NotificationPushPreferencesDto;
}
export declare class CreateUserDto {
    email: string;
    password: string;
    fullName?: string;
    phoneNumber?: string;
    role?: UserRole;
    timezone?: string;
    language?: string;
    preferredCurrency?: string;
    merchantId?: string;
    metadata?: Record<string, any>;
}
export declare class UpdateUserDto {
    fullName?: string;
    phoneNumber?: string;
    timezone?: string;
    language?: string;
    preferredCurrency?: string;
    avatarUrl?: string;
    notificationPreferences?: NotificationPreferencesDto;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}
export declare class VerifyEmailDto {
    token: string;
}
export declare class ResendVerificationEmailDto {
    email: string;
}
export declare class VerifyPhoneDto {
    code: string;
}
export declare class Enable2FADto {
    method: TwoFactorMethod;
}
export declare class Verify2FADto {
    code: string;
}
export declare class Disable2FADto {
    password: string;
    code: string;
}
export declare class Use2FABackupCodeDto {
    backupCode: string;
}
export declare class UpdateUserRoleDto {
    role: UserRole;
}
export declare class UpdateUserStatusDto {
    status: UserStatus;
    reason?: string;
}
export declare class UpdateTransactionLimitsDto {
    dailyTransactionLimit?: number;
    monthlyTransactionLimit?: number;
    singleTransactionLimit?: number;
}
export declare class InviteTeamMemberDto {
    email: string;
    role: UserRole;
    fullName?: string;
}
export declare class UserQueryDto {
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    kycStatus?: KYCStatus;
    merchantId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export declare class UserResponseDto {
    id: string;
    email: string;
    fullName: string | null;
    phoneNumber: string | null;
    role: UserRole;
    status: UserStatus;
    merchantId: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
    twoFactorMethod: TwoFactorMethod;
    kycStatus: KYCStatus;
    timezone: string;
    language: string;
    preferredCurrency: string;
    notificationPreferences: any;
    avatarUrl: string | null;
    dailyTransactionLimit: number | null;
    monthlyTransactionLimit: number | null;
    singleTransactionLimit: number | null;
    lastLoginAt: Date | null;
    apiAccessEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaginatedUsersResponseDto {
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class TwoFactorSetupResponseDto {
    qrCode?: string;
    secret?: string;
    backupCodes?: string[];
    message: string;
}
export declare class MessageResponseDto {
    message: string;
    data?: any;
}
