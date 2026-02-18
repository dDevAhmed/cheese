import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto, AuditLogResponseDto, PaginatedAuditLogsResponseDto } from './audit-log.dto';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(query: AuditLogQueryDto, req: any): Promise<PaginatedAuditLogsResponseDto>;
    findByUser(userId: string, req: any): Promise<AuditLogResponseDto[]>;
    getMerchantStats(merchantId: string, req: any): Promise<{
        total: number;
        actionBreakdown: Record<string, number>;
        oldestEntry: Date | null;
        newestEntry: Date | null;
    }>;
    getRecentActivity(limit: number | undefined, req: any): Promise<AuditLogResponseDto[]>;
    cleanupOldLogs(retentionDays: number | undefined, req: any): Promise<{
        deletedCount: number;
        message: string;
    }>;
}
