import { db } from '@/db';
import { contacts } from '@/db/schema';
import { desc, ilike, or, gte, lte, and } from 'drizzle-orm';
import { withAuth } from '@/middlewares/middleware';
import { PERMISSIONS } from '@/constants/rbac';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const STATUS_LABELS: Record<string, string> = {
    new: 'Mới',
    pending: 'Cần xử lý',
    processed: 'Đã xử lý',
    read: 'Đã đọc',
    replied: 'Đã trả lời',
    archived: 'Đã lưu trữ',
    spam: 'Spam',
};

export const GET = withAuth(
    async (request) => {
        try {
            const { searchParams } = new URL(request.url);
            const search = searchParams.get('search');
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');

            // Build where conditions
            const conditions = [];

            if (search) {
                conditions.push(
                    or(
                        ilike(contacts.name, `%${search}%`),
                        ilike(contacts.email, `%${search}%`),
                        ilike(contacts.address, `%${search}%`),
                    ),
                );
            }

            if (startDate) {
                conditions.push(gte(contacts.created_at, new Date(startDate)));
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                conditions.push(lte(contacts.created_at, end));
            }

            // Fetch all matching data (no pagination for export)
            let query = db.select().from(contacts).orderBy(desc(contacts.created_at));

            if (conditions.length > 0) {
                // @ts-ignore - Drizzle type issue with dynamic conditions
                query = query.where(and(...conditions));
            }

            const allContacts = await query;

            // Build CSV with BOM for Excel UTF-8 compatibility
            const BOM = '\uFEFF';
            const headers = [
                'STT',
                'Họ tên',
                'Email',
                'Số điện thoại',
                'Địa chỉ',
                'Chủ đề',
                'Nội dung',
                'Trạng thái',
                'Ngày gửi',
            ];

            const escapeCSV = (value: string | null | undefined): string => {
                if (!value) return '';
                const str = String(value).replace(/\r?\n/g, ' ');
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            const rows = allContacts.map((contact, index) => {
                return [
                    index + 1,
                    escapeCSV(contact.name),
                    escapeCSV(contact.email),
                    escapeCSV(contact.phone),
                    escapeCSV(contact.address),
                    escapeCSV(contact.subject),
                    escapeCSV(contact.message),
                    escapeCSV(STATUS_LABELS[contact.status] || contact.status),
                    contact.created_at
                        ? format(new Date(contact.created_at), 'HH:mm dd/MM/yyyy', { locale: vi })
                        : '',
                ].join(',');
            });

            const csv = BOM + headers.join(',') + '\n' + rows.join('\n');

            const filename = `lien-he_${format(new Date(), 'dd-MM-yyyy')}.csv`;

            return new Response(csv, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
            });
        } catch (error) {
            console.error('Error exporting contacts:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    },
    { requiredPermissions: [PERMISSIONS.CONTACTS_VIEW] },
);
