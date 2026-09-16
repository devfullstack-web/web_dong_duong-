import { siteSettingService, type SolutionData } from '@/services/site-setting-service';
import { apiResponse, apiError } from '@/utils/api-response';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { NextRequest } from 'next/server';

// GET /api/solutions - Get all solutions or filter by slug query
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            const solution = await siteSettingService.getSolutionBySlug(slug);
            if (!solution) {
                return apiError('Solution not found', 404);
            }
            return apiResponse(solution);
        }

        const solutions = await siteSettingService.getSolutions();
        return apiResponse(solutions);
    } catch (error) {
        console.error('Error getting solutions:', error);
        return apiError('Internal Server Error', 500);
    }
}

// POST /api/solutions - Add or update a solution
export const POST = withAuth(
    async (request: NextRequest) => {
        try {
            const body = await request.json();
            const { slug, ...solutionData } = body;

            if (!slug) {
                return apiError('Slug is required', 400);
            }

            const current = await siteSettingService.getSolutions();
            current[slug] = solutionData as SolutionData;
            await siteSettingService.updateSolutions(current);

            return apiResponse({ success: true, message: 'Solution saved successfully', slug });
        } catch (error) {
            console.error('Error creating/updating solution:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE] },
);

// PUT /api/solutions - Replace all solutions
export const PUT = withAuth(
    async (request: NextRequest) => {
        try {
            const body = await request.json();
            await siteSettingService.updateSolutions(body);
            return apiResponse({ success: true, message: 'All solutions updated successfully' });
        } catch (error) {
            console.error('Error updating all solutions:', error);
            return apiError('Internal Server Error', 500);
        }
    },
    { requiredPermissions: [PERMISSIONS.SETTINGS_UPDATE] },
);

// PATCH /api/solutions - Update solutions
export const PATCH = PUT;
