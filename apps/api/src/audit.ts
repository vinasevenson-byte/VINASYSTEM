import { Injectable, Inject } from '@nestjs/common';
import { Db } from './db';

export interface AuditParams {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(@Inject(Db) private db: Db) {}

  async log(params: AuditParams): Promise<void> {
    try {
      await this.db.auditLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId || null,
          details: params.details || {},
          ipAddress: params.ipAddress || null,
        },
      });
    } catch (err) {
      console.error('[AUDIT_ERROR]', err);
    }
  }

  async getRecent(userId: string, limit = 50) {
    return this.db.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
