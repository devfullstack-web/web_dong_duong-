import { db } from '@/db';
import { users } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { login, generateTokens } from '@/services/auth';
import { apiResponse, apiError } from '@/utils/api-response';
import { validateBody } from '@/middlewares/middleware';
import { loginSchema } from '@/validations/auth.schema';

export async function POST(request: Request) {
    try {
        // Validate request body
        const dataOrError = await validateBody(request, loginSchema);
        if (dataOrError instanceof Response) {
            return dataOrError;
        }

        const { username, password } = dataOrError;

        const [user] = await db.select().from(users).where(eq(users.username, username));

        if (!user) {
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
