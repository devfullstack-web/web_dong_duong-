import { db } from '@/db';
import { auditLogs } from '@/db/schemas';
import { lt, sql } from 'drizzle-orm';
import { getRequiredPositiveIntegerEnv } from '@/utils/env';

const AUDIT_LOG_RETENTION_DAYS = getRequiredPositiveIntegerEnv(
    process.env.AUDIT_LOG_RETENTION_DAYS,
    'AUDIT_LOG_RETENTION_DAYS',
);

class CronService {
    async cleanupAuditLogs(): Promise<{ deletedCount: number }> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - AUDIT_LOG_RETENTION_DAYS);

            const result = await db
                .delete(auditLogs)
                .where(lt(auditLogs.created_at, cutoffDate))
                .returning({ id: auditLogs.id });

            const deletedCount = result.length;

            if (deletedCount > 0) {
                await db.insert(auditLogs).values({
                    action: 'CLEANUP',
                    module: 'AUDIT_LOGS',
                    description: `Tự động xóa ${deletedCount} bản ghi audit log cũ hơn ${AUDIT_LOG_RETENTION_DAYS} ngày`,
                    changes: {
                        deletedCount,
                        retentionDays: AUDIT_LOG_RETENTION_DAYS,
                        cutoffDate: cutoffDate.toISOString(),
                    },
                });
            }

            return { deletedCount };
        } catch (error) {
            console.error('[CRON] Error during audit log cleanup:', error);
            throw error;
        }
    }

    async getCleanupStats(): Promise<{
        totalLogs: number;
        logsToDelete: number;
        retentionDays: number;
        oldestLogDate: Date | null;
    }> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - AUDIT_LOG_RETENTION_DAYS);

        const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(auditLogs);

        const [toDeleteResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(auditLogs)
            .where(lt(auditLogs.created_at, cutoffDate));

        const [oldestLog] = await db
            .select({ created_at: auditLogs.created_at })
            .from(auditLogs)
            .orderBy(auditLogs.created_at)
            .limit(1);

        return {
            totalLogs: Number(totalResult.count),
            logsToDelete: Number(toDeleteResult.count),
            retentionDays: AUDIT_LOG_RETENTION_DAYS,
            oldestLogDate: oldestLog?.created_at || null,
        };
    }

    async triggerManualCleanup(): Promise<{ deletedCount: number }> {
        return this.cleanupAuditLogs();
    }
}

export const cronService = new CronService();
