
import { MODULE_CODES } from './rbac';

export const AUDIT_ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    RESTORE: 'RESTORE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    AUTH_FAILURE: 'AUTH_FAILURE',
    UPLOAD: 'UPLOAD',
    CLEANUP: 'CLEANUP',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const AUDIT_MODULES = {
    AUTH: 'AUTH',
    ...MODULE_CODES,
    // Alias: API news dùng module code BLOG, nhưng audit vẫn ghi nhận là NEWS
    NEWS: 'NEWS',
    AUDIT_LOGS: 'AUDIT_LOGS',
} as const;
