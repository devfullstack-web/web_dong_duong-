import cron from 'node-cron';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { lt, sql } from 'drizzle-orm';

// Configuration
const AUDIT_LOG_RETENTION_DAYS = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '30', 10);

/**
 * Cron Service - Manages all scheduled tasks
 */
class CronService {
    private isInitialized = false;

    /**
     * Initialize all cron jobs
     */
    init() {
        if (this.isInitialized) {
            console.log('[CRON] Cron service already initialized');
            return;
        }

        console.log('[CRON] Initializing cron jobs...');

        // Clean up old audit logs - runs daily at 2:00 AM
        this.scheduleAuditLogCleanup();

        this.isInitialized = true;
        console.log('[CRON] Cron service initialized successfully');
    }

    /**
     * Schedule audit log cleanup job
     * Runs daily at 2:00 AM to delete logs older than configured retention period
     */
    private scheduleAuditLogCleanup() {
        // Cron expression: "0 2 * * *" = At 02:00 every day
        const cronExpression = process.env.AUDIT_CLEANUP_CRON || '0 2 * * *';

        cron.schedule(cronExpression, async () => {
            console.log('[CRON] Starting audit log cleanup...');
            await this.cleanupAuditLogs();
        });

        console.log(
            `[CRON] Audit log cleanup scheduled: ${cronExpression} (retention: ${AUDIT_LOG_RETENTION_DAYS} days)`,
        );
    }

    /**
     * Delete audit logs older than the retention period
     */
    async cleanupAuditLogs(): Promise<{ deletedCount: number }> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - AUDIT_LOG_RETENTION_DAYS);

            console.log(`[CRON] Deleting audit logs older than ${cutoffDate.toISOString()}`);

            // Delete old logs and get count
            const result = await db
                .delete(auditLogs)
                .where(lt(auditLogs.created_at, cutoffDate))
                .returning({ id: auditLogs.id });

            const deletedCount = result.length;

            console.log(`[CRON] Audit log cleanup completed. Deleted ${deletedCount} records.`);

            // Log the cleanup action itself (meta-logging)
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

    /**
     * Get cleanup statistics
     */
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

    /**
     * Manually trigger cleanup (for admin use)
     */
    async triggerManualCleanup(): Promise<{ deletedCount: number }> {
        console.log('[CRON] Manual audit log cleanup triggered');
        return this.cleanupAuditLogs();
    }
}

export const cronService = new CronService();
