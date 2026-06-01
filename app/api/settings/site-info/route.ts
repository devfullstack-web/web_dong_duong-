import { siteSettingService } from '@/services/site-setting-service';
import { apiResponse, apiError } from '@/utils/api-response';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';

export async function GET() {
    try {
        const info = await siteSettingService.getSiteInfo();
        return apiResponse(info);
    } catch (error) {
        console.error('Error getting site settings:', error);
        return apiError('Internal Server Error', 500);
    }
}

export const PATCH = withAuth(
    async (request) => {
        try {
            const body = await request.json();
            await siteSettingService.updateSiteInfo(body);
            return apiResponse({ success: true });
        } catch (error) {
            console.error('Error updating site settings:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE] },
);
