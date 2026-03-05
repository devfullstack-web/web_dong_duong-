import { cronService } from '@/services/cron-service';
import { apiResponse, apiError } from '@/utils/api-response';
import { withAuth, isSuperAdmin } from '@/middlewares/middleware';

// GET - Get cleanup statistics
export const GET = withAuth(async (request, session) => {
    try {
        // Only SuperAdmin can view cleanup stats
        if (!isSuperAdmin(session.user)) {
            return apiError('Chỉ SuperAdmin mới có quyền xem thống kê', 403);
        }

        const stats = await cronService.getCleanupStats();

        return apiResponse({
            ...stats,
            nextCleanupSchedule: 'Hàng ngày lúc 02:00 AM',
            cronExpression: process.env.AUDIT_CLEANUP_CRON || '0 2 * * *',
        });
    } catch (error) {
        console.error('Error fetching cleanup stats:', error);
        return apiError('Internal Server Error', 500);
    }
});

// POST - Manually trigger cleanup
export const POST = withAuth(async (request, session) => {
    try {
        // Only SuperAdmin can trigger cleanup
        if (!isSuperAdmin(session.user)) {
            return apiError('Chỉ SuperAdmin mới có quyền thực hiện dọn dẹp', 403);
        }

        const result = await cronService.triggerManualCleanup();

        return apiResponse({
            message: `Đã xóa ${result.deletedCount} bản ghi audit log cũ`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('Error during manual cleanup:', error);
        return apiError('Lỗi khi dọn dẹp audit log', 500);
    }
});
