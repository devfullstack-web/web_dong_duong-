import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schemas';
import { and, eq, isNull } from 'drizzle-orm';
import { AUTH } from '@/constants/app';
import { getJwtSecret } from '@/services/jwt-secret';

const secretKey = getJwtSecret();
const key = new TextEncoder().encode(secretKey);

type AuthUser = {
    id: string;
    email: string;
    [key: string]: unknown;
};

type AuthSessionPayload = JWTPayload & {
    user?: AuthUser;
    expires?: Date | string;
};

export async function encrypt(payload: JWTPayload, expireTime: string = AUTH.JWT_EXPIRY) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expireTime)
        .sign(key);
}

export async function decrypt(input: string): Promise<AuthSessionPayload | null> {
    try {
        const { payload } = await jwtVerify<AuthSessionPayload>(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch {
        return null;
    }
}

export async function generateTokens(user: Pick<AuthUser, 'id'>) {
    const [currentUser] = await db
        .select({
            id: users.id,
            email: users.email,
            is_active: users.is_active,
            is_locked: users.is_locked,
        })
        .from(users)
        .where(
            and(
                eq(users.id, user.id),
                isNull(users.deleted_at),
            ),
        )
        .limit(1);

    if (!currentUser) {
        throw new Error('USER_NOT_FOUND');
    }

    if (!currentUser.is_active || currentUser.is_locked) {
        throw new Error('USER_INACTIVE_OR_LOCKED');
    }

    // JWT chỉ chứa user_id và email
    const sessionPayload = {
        id: currentUser.id,
        email: currentUser.email,
    };

    const accessToken = await encrypt({ user: sessionPayload }, '15m');
    const refreshToken = await encrypt({ user: sessionPayload }, '7d');
    return { accessToken, refreshToken, sessionPayload };
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
    const cookieStore = await cookies();
    const secure = process.env.NODE_ENV === 'production';

    cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 15 * 60,
        path: '/',
        sameSite: 'lax',
        secure,
    });

    cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
        sameSite: 'lax',
        secure,
    });
}

export async function login(user: { id: string; email: string }) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ user, expires });
    const secure = process.env.NODE_ENV === 'production';

    (await cookies()).set('session', session, {
        expires,
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
    });
}

export async function logout() {
    const cookieStore = await cookies();
    const options = {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
    };
    cookieStore.set('session', '', options);
    cookieStore.set('accessToken', '', options);
    cookieStore.set('refreshToken', '', options);
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    const sessionData = await decrypt(session);
    if (!sessionData?.user?.id) return null;

    const [activeUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(
            and(
                eq(users.id, sessionData.user.id),
                eq(users.is_active, true),
                eq(users.is_locked, false),
                isNull(users.deleted_at),
            ),
        )
        .limit(1);

    return activeUser ? sessionData : null;
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    if (!session) return;

    const parsed = await decrypt(session);
    if (!parsed) return;
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    parsed.expires = expires;
    const res = NextResponse.next();
    res.cookies.set({
        name: 'session',
        value: await encrypt(parsed),
        httpOnly: true,
        expires,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
    return res;
}
