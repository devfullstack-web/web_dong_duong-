import { SignJWT, jwtVerify } from 'jose';
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
