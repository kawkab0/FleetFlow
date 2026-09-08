import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditLog } from './entities/audit-log.entity';

export interface CreateAuditLogData {
  userId?: number | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  module: string;
  recordId?: number | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  description?: string | null;
  ipAddress?: string | null;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogsRepository: Repository<AuditLog>,
  ) {}

  async create(data: CreateAuditLogData): Promise<AuditLog> {
    const auditLog = this.auditLogsRepository.create({
      userId: data.userId ?? null,
      userName: data.userName ?? null,
      userRole: data.userRole ?? null,
      action: data.action,
      module: data.module,
      recordId: data.recordId ?? null,
      oldValues: data.oldValues ?? null,
      newValues: data.newValues ?? null,
      description: data.description ?? null,
      ipAddress: data.ipAddress ?? null,
    });

    return this.auditLogsRepository.save(auditLog);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByModule(module: string): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      where: {
        module,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findByUser(userId: number): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
