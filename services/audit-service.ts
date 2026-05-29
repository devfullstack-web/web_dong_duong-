import { db } from '@/db';
import { auditLogs } from '@/db/schemas';
import { NextRequest } from 'next/server';
import type { AuditAction } from '@/constants/audit';

export interface LogActionParams {
    userId?: string;
    action: AuditAction;
    module: string;
    targetId?: string;
    description?: string;
    changes?: {
        old?: Record<string, unknown>;
        new?: Record<string, unknown>;
    };
    request?: NextRequest | Request;
}

/**
 * Audit Logging Service
 * Handles recording system activities for security and monitoring.
 */
export const auditService = {
    /**
     * Record an action to the audit logs
     */
    async logAction({
        userId,
        action,
        module,
        targetId,
        description,
        changes,
        request,
    }: LogActionParams) {
        try {
            let ipAddress = 'unknown';
            let userAgent = 'unknown';

            if (request) {
                const headers =
                    request instanceof NextRequest ? request.headers : (request as Request).headers;
                ipAddress =
                    headers.get('x-forwarded-for')?.split(',')[0] ||
                    headers.get('x-real-ip') ||
                    'unknown';
                userAgent = headers.get('user-agent') || 'unknown';
            }

            db.insert(auditLogs)
                .values({
                    user_id: userId,
                    action,
                    module,
                    target_id: targetId,
                    description,
                    changes: changes || null,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                })
                .catch((err) => {
                    console.error('Audit Log Insertion Failed:', err);
                });
        } catch (error) {
            console.error('Audit Service Error:', error);
        }
    },
};
