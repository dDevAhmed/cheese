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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const audit_log_service_1 = require("./audit-log.service");
const audit_log_dto_1 = require("./audit-log.dto");
let AuditLogController = class AuditLogController {
    auditLogService;
    constructor(auditLogService) {
        this.auditLogService = auditLogService;
    }
    async findAll(query, req) {
        const ctx = req.user;
        return this.auditLogService.findAll(query, ctx);
    }
    async findByUser(userId, req) {
        const ctx = req.user;
        return this.auditLogService.findByUser(userId, ctx);
    }
    async getMerchantStats(merchantId, req) {
        const ctx = req.user;
        return this.auditLogService.getMerchantStats(merchantId, ctx);
    }
    async getRecentActivity(limit = 50, req) {
        const ctx = req.user;
        return this.auditLogService.getRecentActivity(limit, ctx);
    }
    async cleanupOldLogs(retentionDays = 365, req) {
        const ctx = req.user;
        const deletedCount = await this.auditLogService.cleanupOldLogs(retentionDays, ctx);
        return {
            deletedCount,
            message: `Successfully deleted ${deletedCount} audit logs older than ${retentionDays} days`,
        };
    }
};
exports.AuditLogController = AuditLogController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Query audit logs with filters and pagination' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Paginated list of audit logs',
        type: audit_log_dto_1.PaginatedAuditLogsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_log_dto_1.AuditLogQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit logs for a specific user' }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        type: 'string',
        format: 'uuid',
        description: 'User ID to query logs for',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of audit logs for the user (last 100 entries)',
        type: [audit_log_dto_1.AuditLogResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('stats/merchant/:merchantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit log statistics for a merchant' }),
    (0, swagger_1.ApiParam)({
        name: 'merchantId',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit log statistics',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                actionBreakdown: { type: 'object' },
                oldestEntry: { type: 'string', format: 'date-time', nullable: true },
                newestEntry: { type: 'string', format: 'date-time', nullable: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('merchantId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "getMerchantStats", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent audit activity (SUPER_ADMIN only)' }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of recent entries to return (max 200)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recent audit log entries',
        type: [audit_log_dto_1.AuditLogResponseDto],
    }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "getRecentActivity", null);
__decorate([
    (0, common_1.Delete)('cleanup'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete old audit logs (SUPER_ADMIN only)',
        description: 'Typically called by a scheduled job for data retention compliance',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'retentionDays',
        required: false,
        type: Number,
        description: 'Number of days to retain logs (default 365)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Number of logs deleted',
        schema: {
            type: 'object',
            properties: {
                deletedCount: { type: 'number' },
                message: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Query)('retentionDays')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "cleanupOldLogs", null);
exports.AuditLogController = AuditLogController = __decorate([
    (0, swagger_1.ApiTags)('Audit Logs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('audit-logs'),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService])
], AuditLogController);
//# sourceMappingURL=audit-log.controller.js.map