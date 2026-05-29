import { z } from 'zod';
import { CONTACT_STATUS_VALUES } from '@/constants/content';

/**
 * Contact Form Validation Schema
 */

export const contactSchema = z.object({
    name: z.string().min(1, 'Tên là bắt buộc').max(255, 'Tên không được quá 255 ký tự').trim(),

    email: z
        .string()
        .email('Email không hợp lệ')
        .max(255, 'Email không được quá 255 ký tự')
        .trim()
        .toLowerCase(),

    phone: z
        .string()
        .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
        .min(10, 'Số điện thoại phải có ít nhất 10 số')
        .max(20, 'Số điện thoại không được quá 20 ký tự')
        .nullable()
        .optional(),

    address: z.string().max(500, 'Địa chỉ không được quá 500 ký tự').nullable().optional(),

    subject: z.string().max(255, 'Chủ đề không được quá 255 ký tự').nullable().optional(),

    message: z
        .string()
        .min(10, 'Tin nhắn phải có ít nhất 10 ký tự')
        .max(5000, 'Tin nhắn không được quá 5000 ký tự')
        .trim(),
});

export const updateContactStatusSchema = z.object({
    id: z.string().uuid('Contact ID phải là UUID hợp lệ'),
    status: z.enum(CONTACT_STATUS_VALUES, {
        message: 'Status không hợp lệ',
    }),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;
