import { db } from '@/db';
import { users } from '@/db/schemas';
import { and, eq, isNull, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateTokens } from '@/services/auth';
import { apiResponse, apiError } from '@/utils/api-response';
import { validateBody } from '@/middlewares/middleware';
import { loginSchema } from '@/validations/auth.schema';
import { checkRateLimit } from '@/utils/rate-limiter';

export async function POST(request: Request) {
    try {
        // Validate request body
        const dataOrError = await validateBody(request, loginSchema);
        if (dataOrError instanceof Response) {
            return dataOrError;
        }

        const { username, password } = dataOrError;
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';
        
        const ipLimit = checkRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000);
        const accountLimit = checkRateLimit(
            `login:account:${ip}:${username.toLowerCase()}`,
            5,
            15 * 60 * 1000,
        );

        if (ipLimit.isLimited || accountLimit.isLimited) {
            return apiError('Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.', 429);
        }

        const [user] = await db
            .select()
            .from(users)
            .where(
                and(
                    or(
                        eq(users.email, username.toLowerCase().trim()),
                        eq(users.username, username.toLowerCase().trim())
                    ),
                    isNull(users.deleted_at)
                )
            )
            .limit(1);

        if (!user || !user.is_active || user.is_locked) {
            return apiError('Tên đăng nhập hoặc mật khẩu không đúng', 401);
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return apiError('Tên đăng nhập hoặc mật khẩu không đúng', 401);
        }

        // Success
        const sessionUser = {
            id: user.id,
            email: user.email,
        };

        // Generate Tokens (JWT chỉ chứa id/email)
        const { accessToken, refreshToken, sessionPayload } = await generateTokens(sessionUser);

        // Set Cookies
        const { setAuthCookies } = await import('@/services/auth');
        await setAuthCookies(accessToken, refreshToken);

        return apiResponse({
            user: sessionPayload,
        });
    } catch (error) {
        console.error('Login Error:', error);
        return apiError('Lỗi máy chủ nội bộ', 500);
    }
}
