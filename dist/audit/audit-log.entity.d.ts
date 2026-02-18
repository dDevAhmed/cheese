export declare class AuditLog {
    id: string;
    action: string;
    performedBy: string;
    targetUserId: string;
    merchantId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    metadata: Record<string, any> | null;
    createdAt: Date;
}
