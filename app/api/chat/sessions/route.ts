import { NextRequest } from 'next/server';
import { db } from '@/db';
import { chatSessions } from '@/db/schemas';
import { eq, and } from 'drizzle-orm';
import { apiResponse, apiError } from '@/utils/api-response';
import { checkRateLimit } from '@/utils/rate-limiter';
import { sanitizePlainText } from '@/utils/sanitize';

const GUEST_ID_PATTERN = /^[a-zA-Z0-9:_-]{8,255}$/;

// POST: Create or resume a session for a guest
export async function POST(req: NextRequest) {
    try {
        const { guestId, guestName } = await req.json();
        const sanitizedGuestId = sanitizePlainText(guestId, 255);
        const sanitizedGuestName = guestName ? sanitizePlainText(guestName, 255) : null;

        if (!sanitizedGuestId || !GUEST_ID_PATTERN.test(sanitizedGuestId)) {
            return apiError('guestId is required', 400);
        }

        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('x-real-ip') ||
            'unknown';
        const rateLimit = checkRateLimit(`chat-session:${ip}:${sanitizedGuestId}`, 20, 60 * 1000);
        if (rateLimit.isLimited) return apiError('Too many chat session requests', 429);

        // Check for existing active session
        let session = await db.query.chatSessions.findFirst({
            where: and(eq(chatSessions.guest_id, sanitizedGuestId), eq(chatSessions.is_active, true)),
        });

        if (!session) {
            const [newSession] = await db
                .insert(chatSessions)
                .values({
                    guest_id: sanitizedGuestId,
                    guest_name: sanitizedGuestName,
                })
            .returning();
            session = newSession;
        } else if (sanitizedGuestName && session.guest_name !== sanitizedGuestName) {
            await db
                .update(chatSessions)
                .set({ guest_name: sanitizedGuestName, updated_at: new Date() })
                .where(eq(chatSessions.id, session.id));
            session = { ...session, guest_name: sanitizedGuestName };
        }

        return apiResponse(session);
    } catch (error) {
        console.error('Chat Session Error:', error);
        return apiError('Internal Server Error', 500);
    }
}

// GET: Fetch active session for a guest
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const guestId = sanitizePlainText(searchParams.get('guestId'), 255);

    if (!guestId || !GUEST_ID_PATTERN.test(guestId)) {
        return apiError('guestId is required', 400);
    }

    const session = await db.query.chatSessions.findFirst({
        where: and(eq(chatSessions.guest_id, guestId), eq(chatSessions.is_active, true)),
    });

    return apiResponse(session || null);
}
