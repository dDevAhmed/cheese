import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  Req,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import {
  AuditLogQueryDto,
  AuditLogResponseDto,
  PaginatedAuditLogsResponseDto,
} from './audit-log.dto';
import { RequestContext } from '../users/user.types';

/**
 * AuditLogController
 *
 * Provides read-only endpoints for querying audit logs.
 * No create/update/delete endpoints — audit logs are append-only.
 *
 * NOTE: Guards are commented out but should be uncommented in production.
 * - JwtAuthGuard ensures user is authenticated
 * - RolesGuard enforces role-based access control
 * - CurrentUser() decorator extracts RequestContext
 */

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * Query audit logs with filters and pagination.
   *
   * Access:
   * - SUPER_ADMIN: Can query all logs across all merchants
   * - MERCHANT_OWNER, MERCHANT_ADMIN: Can query logs for their own merchant
   * - Other roles: Denied
   */
  @Get()
  // @Roles(UserRole.SUPER_ADMIN, UserRole.MERCHANT_OWNER, UserRole.MERCHANT_ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Query audit logs with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of audit logs',
    type: PaginatedAuditLogsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async findAll(
    @Query() query: AuditLogQueryDto,
    @Req() req: any, // In production: @CurrentUser() ctx: RequestContext
  ): Promise<PaginatedAuditLogsResponseDto> {
    // For now, extract context from req.user
    // In production with guards: use @CurrentUser() decorator
    const ctx: RequestContext = req.user;
    return this.auditLogService.findAll(query, ctx);
  }

  /**
   * Get audit logs for a specific user.
   *
   * Access:
   * - The user themselves can view their own logs
   * - SUPER_ADMIN and SUPPORT can view any user's logs
   * - MERCHANT_OWNER and MERCHANT_ADMIN can view logs for users in their merchant
   */
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  @ApiParam({
    name: 'userId',
    type: 'string',
    format: 'uuid',
    description: 'User ID to query logs for',
  })
  @ApiResponse({
    status: 200,
    description: 'List of audit logs for the user (last 100 entries)',
    type: [AuditLogResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: any,
  ): Promise<AuditLogResponseDto[]> {
    const ctx: RequestContext = req.user;
    return this.auditLogService.findByUser(userId, ctx);
  }

  /**
   * Get audit statistics for a merchant.
   *
   * Returns:
   * - Total log count
   * - Breakdown by action type
   * - Date range of logs
   *
   * Access: SUPER_ADMIN and MERCHANT_OWNER only
   */
  @Get('stats/merchant/:merchantId')
  // @Roles(UserRole.SUPER_ADMIN, UserRole.MERCHANT_OWNER)
  @ApiOperation({ summary: 'Get audit log statistics for a merchant' })
  @ApiParam({
    name: 'merchantId',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
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
  })
  async getMerchantStats(
    @Param('merchantId', ParseUUIDPipe) merchantId: string,
    @Req() req: any,
  ): Promise<{
    total: number;
    actionBreakdown: Record<string, number>;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  }> {
    const ctx: RequestContext = req.user;
    return this.auditLogService.getMerchantStats(merchantId, ctx);
  }

  /**
   * Get recent activity across the platform.
   *
   * Returns the most recent N audit entries.
   *
   * Access: SUPER_ADMIN only
   */
  @Get('recent')
  // @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get recent audit activity (SUPER_ADMIN only)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of recent entries to return (max 200)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent audit log entries',
    type: [AuditLogResponseDto],
  })
  async getRecentActivity(
    @Query('limit') limit: number = 50,
    @Req() req: any,
  ): Promise<AuditLogResponseDto[]> {
    const ctx: RequestContext = req.user;
    return this.auditLogService.getRecentActivity(limit, ctx);
  }

  /**
   * Cleanup old audit logs (data retention).
   *
   * Deletes logs older than the specified retention period.
   * This should typically be called by a scheduled job, not manually.
   *
   * Access: SUPER_ADMIN only
   */
  @Delete('cleanup')
  // @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete old audit logs (SUPER_ADMIN only)',
    description:
      'Typically called by a scheduled job for data retention compliance',
  })
  @ApiQuery({
    name: 'retentionDays',
    required: false,
    type: Number,
    description: 'Number of days to retain logs (default 365)',
  })
  @ApiResponse({
    status: 200,
    description: 'Number of logs deleted',
    schema: {
      type: 'object',
      properties: {
        deletedCount: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async cleanupOldLogs(
    @Query('retentionDays') retentionDays: number = 365,
    @Req() req: any,
  ): Promise<{ deletedCount: number; message: string }> {
    const ctx: RequestContext = req.user;
    const deletedCount = await this.auditLogService.cleanupOldLogs(
      retentionDays,
      ctx,
    );

    return {
      deletedCount,
      message: `Successfully deleted ${deletedCount} audit logs older than ${retentionDays} days`,
    };
  }
}
