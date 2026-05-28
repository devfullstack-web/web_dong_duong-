import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { roles, permissions, user_roles, modules, users } from '@/db/schemas';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { AUTH } from '@/constants/app';

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
        throw new Error('JWT_SECRET must be set to at least 32 characters in production');
    }

    return secret || 'dev-only-change-me-minimum-32-characters';
}

const secretKey = getJwtSecret();
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any, expireTime: string = AUTH.JWT_EXPIRY) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expireTime)
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function generateTokens(user: any) {
    const [currentUser] = await db
        .select({
            id: users.id,
            username: users.username,
            full_name: users.full_name,
            is_super: users.is_super,
        })
        .from(users)
        .where(
            and(
                eq(users.id, user.id),
                eq(users.is_active, true),
                eq(users.is_locked, false),
                isNull(users.deleted_at),
            ),
        )
        .limit(1);

    if (!currentUser) {
        throw new Error('USER_INACTIVE_OR_LOCKED');
    }

    const userRoles = await db
        .select({
            id: roles.id,
            name: roles.name,
            code: roles.code,
            is_super: roles.is_super,
        })
        .from(user_roles)
        .innerJoin(roles, eq(user_roles.role_id, roles.id))
        .where(eq(user_roles.user_id, user.id));

    const roleIds = userRoles.map((r) => r.id);
    // is_super if EITHER user.is_super flag is true OR any role has is_super true
    const isSuperUser = currentUser.is_super || userRoles.some((r) => r.is_super);

    let userPermissions: string[] = [];
    if (roleIds.length > 0) {
        const perms = await db
            .select({
                moduleCode: modules.code,
                canView: permissions.can_view,
                canCreate: permissions.can_create,
                canUpdate: permissions.can_update,
                canDelete: permissions.can_delete,
            })
            .from(permissions)
            .innerJoin(modules, eq(permissions.module_id, modules.id))
            .where(inArray(permissions.role_id, roleIds));

        userPermissions = perms.flatMap((p) => {
            const ps = [];
            if (p.canView) ps.push(`${p.moduleCode}:VIEW`);
            if (p.canCreate) ps.push(`${p.moduleCode}:CREATE`);
            if (p.canUpdate) ps.push(`${p.moduleCode}:UPDATE`);
            if (p.canDelete) ps.push(`${p.moduleCode}:DELETE`);
            return ps;
        });
    }

    const sessionPayload = {
        ...currentUser,
        is_super: isSuperUser,
        roles: userRoles.map((r) => r.code),
        permissions: userPermissions,
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

export async function login(user: any) {
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
    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: 'session',
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
    return res;
}
