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
exports.AuditLog = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
let AuditLog = class AuditLog {
    id;
    action;
    performedBy;
    targetUserId;
    merchantId;
    ipAddress;
    userAgent;
    metadata;
    createdAt;
};
exports.AuditLog = AuditLog;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique audit log entry ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action type that was performed' }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who performed the action' }),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AuditLog.prototype, "performedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who was affected by the action' }),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AuditLog.prototype, "targetUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Merchant context (if applicable)' }),
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "merchantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'IP address of the action originator' }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "ipAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User agent string' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "userAgent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional context data (old/new values, reasons)',
    }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when the action occurred' }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], AuditLog.prototype, "createdAt", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, typeorm_1.Entity)('audit_logs'),
    (0, typeorm_1.Index)(['targetUserId']),
    (0, typeorm_1.Index)(['performedBy']),
    (0, typeorm_1.Index)(['action']),
    (0, typeorm_1.Index)(['merchantId']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['targetUserId', 'createdAt']),
    (0, typeorm_1.Index)(['merchantId', 'action', 'createdAt'])
], AuditLog);
//# sourceMappingURL=audit-log.entity.js.map