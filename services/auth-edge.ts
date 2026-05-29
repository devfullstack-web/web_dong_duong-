import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';
import { AUTH } from '@/constants/app';
import { getJwtSecret } from '@/services/jwt-secret';

const secretKey = getJwtSecret();
const key = new TextEncoder().encode(secretKey);

type AuthSessionPayload = JWTPayload & {
    user?: {
        id?: string;
        [key: string]: unknown;
    };
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
