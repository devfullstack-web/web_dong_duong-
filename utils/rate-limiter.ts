/**
 * Simple In-Memory Rate Limiter
 * Used to prevent brute-force and spam on sensitive endpoints.
 */

interface RateLimitInfo {
    count: number;
    resetTime: number;
}

const cache = new Map<string, RateLimitInfo>();

/**
 * Check if the request should be rate limited
 *
 * @param key - Unique key for the limit (e.g., 'login:127.0.0.1')
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object indicating if limited and remaining retry time
 */
export function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number,
): { isLimited: boolean; retryAfter?: number } {
    const now = Date.now();
    const info = cache.get(key);

    if (!info || now > info.resetTime) {
        // First request or window expired
        cache.set(key, {
            count: 1,
            resetTime: now + windowMs,
        });
        return { isLimited: false };
    }

    if (info.count >= limit) {
        // Limit exceeded
        return {
            isLimited: true,
            retryAfter: Math.ceil((info.resetTime - now) / 1000),
        };
    }

    // Increment count
    info.count += 1;
    cache.set(key, info);

    return { isLimited: false };
}

/**
 * Clean up expired entries periodically to prevent memory leaks
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, info] of cache.entries()) {
        if (now > info.resetTime) {
            cache.delete(key);
        }
    }
}, 60 * 1000); // Every minute
