import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { roles, permissions, user_roles, modules } from '@/db/schemas';
import { eq, inArray } from 'drizzle-orm';
import { AUTH } from '@/constants/app';

const secretKey = process.env.JWT_SECRET || 'secret';
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
    const isSuperUser = user.is_super || userRoles.some((r) => r.is_super);

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
        ...user,
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

    cookieStore.set('accessToken', accessToken, {
        httpOnly: false,
        maxAge: 15 * 60,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });

    cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
}

export async function login(user: any) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ user, expires });

    (await cookies()).set('session', session, { expires, httpOnly: true });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.set('session', '', { expires: new Date(0) });
    cookieStore.set('accessToken', '', { expires: new Date(0) });
    cookieStore.set('refreshToken', '', { expires: new Date(0) });
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    if (!session) return;

    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: 'session',
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });
    return res;
}
