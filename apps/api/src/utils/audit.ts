import { prisma } from '@yukti/database';
import { logger } from '../config/logger.js';

interface AuditInput {
  userId?: string;
  action: string; // CREATED | UPDATED | DELETED | LOGIN | ...
  entity: string; // e.g. CASE_STUDY
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

// Best-effort audit logging — never blocks or fails the main operation.
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
        ipAddress: input.ipAddress,
      },
    });
  } catch (err) {
    logger.warn({ err }, 'Failed to write audit log');
  }
}
