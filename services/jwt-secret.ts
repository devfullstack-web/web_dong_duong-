import { getRequiredEnv } from '@/utils/env';

export function getJwtSecret(): string {
    const secret = getRequiredEnv(process.env.JWT_SECRET, 'JWT_SECRET');

    if (secret.length < 32) {
        throw new Error('JWT_SECRET must be set to at least 32 characters');
    }

    return secret;
}
