import { siteSettingService, type SolutionData } from '@/services/site-setting-service';
import { apiResponse, apiError } from '@/utils/api-response';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { NextRequest } from 'next/server';

// GET /api/solutions/[slug] - Get a single solution by slug
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const solution = await siteSettingService.getSolutionBySlug(slug);

        if (!solution) {
            return apiError('Solution not found', 404);
        }

        return apiResponse(solution);
    } catch (error) {
        console.error('Error getting solution by slug:', error);
        return apiError('Internal Server Error', 500);
    }
}

// PATCH /api/solutions/[slug] - Update a solution
export const PATCH = withAuth(
    async (request: NextRequest, session, { params }) => {
        try {
            const { slug } = await params;
            const body = await request.json();

            const current = await siteSettingService.getSolutions();
            const existing = current[slug] || {};
            current[slug] = {
                ...existing,
                ...body,
            } as SolutionData;

            await siteSettingService.updateSolutions(current);
            return apiResponse({ success: true, message: 'Solution updated successfully', data: current[slug] });
        } catch (error) {
            console.error('Error updating solution:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE] },
);

// PUT /api/solutions/[slug] - Replace a solution
export const PUT = withAuth(
    async (request: NextRequest, session, { params }) => {
        try {
            const { slug } = await params;
            const body = await request.json();

            const current = await siteSettingService.getSolutions();
            current[slug] = body as SolutionData;

            await siteSettingService.updateSolutions(current);
            return apiResponse({ success: true, message: 'Solution replaced successfully', data: current[slug] });
        } catch (error) {
            console.error('Error replacing solution:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE] },
);

// DELETE /api/solutions/[slug] - Delete a solution
export const DELETE = withAuth(
    async (request: NextRequest, session, { params }) => {
        try {
            const { slug } = await params;
            const current = await siteSettingService.getSolutions();

            if (!current[slug]) {
                return apiError('Solution not found', 404);
            }

            delete current[slug];
            await siteSettingService.updateSolutions(current);

            return apiResponse({ success: true, message: 'Solution deleted successfully' });
        } catch (error) {
            console.error('Error deleting solution:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE] },
);
