import { siteSettingService } from '@/services/site-setting-service';
import { apiResponse, apiError } from '@/utils/api-response';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = searchParams.get('locale') || 'vi';
        const data = await siteSettingService.getHomepageData(locale);
        return apiResponse(data);
    } catch (error) {
        console.error('Error getting homepage settings:', error);
        return apiError('Internal Server Error', 500);
    }
}

export const PATCH = withAuth(
    async (request: NextRequest) => {
        try {
            const body = await request.json();
            await siteSettingService.updateHomepageData(body);
            return apiResponse({ success: true, message: 'Homepage settings updated successfully' });
        } catch (error) {
            console.error('Error updating homepage settings:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE] },
);

export const PUT = PATCH;

