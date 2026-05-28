import { db } from '@/db';
import { users } from '@/db/schemas';
import { and, eq, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { login, generateTokens } from '@/services/auth';
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
            .where(and(eq(users.username, username), isNull(users.deleted_at)))
            .limit(1);

        if (!user || !user.is_active || user.is_locked) {
            return apiError('Tên đăng nhập hoặc mật khẩu không đúng', 401);
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return apiError('Tên đăng nhập hoặc mật khẩu không đúng', 401);
        }

        // Success
        const sessionUser = {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            is_super: user.is_super,
        };

        // Generate Tokens (now includes roles/permissions)
        const { accessToken, refreshToken, sessionPayload } = await generateTokens(sessionUser);

        // Set Cookies
        const { setAuthCookies } = await import('@/services/auth');
        await setAuthCookies(accessToken, refreshToken);

        // Prepare session for cookie (backward compatibility for middleware)
        await login(sessionPayload);

        return apiResponse({
            user: sessionPayload,
        });
    } catch (error) {
        console.error('Login Error:', error);
        return apiError('Lỗi máy chủ nội bộ', 500);
    }
}
