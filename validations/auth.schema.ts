import { z } from 'zod';
import { AUTH_ROLE_CODES, AUTH_ROLE_CODE_VALUES } from '@/constants/rbac';

/**
 * User & Auth Validation Schemas
 */

export const loginSchema = z.object({
  username: z.string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(255, "Tên đăng nhập không được quá 255 ký tự")
    .trim(),
  
  password: z.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu không được quá 100 ký tự"),
});

export const userSchema = z.object({
  username: z.string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(255, "Tên đăng nhập không được quá 255 ký tự")
    .regex(/^[a-zA-Z0-9_-]+$/, "Tên đăng nhập chỉ được chứa chữ, số, gạch ngang và gạch dưới")
    .trim(),
  
  password: z.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(100, "Mật khẩu không được quá 100 ký tự")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số"),
  
  full_name: z.string()
    .min(1, "Họ tên là bắt buộc")
    .max(255, "Họ tên không được quá 255 ký tự")
    .trim()
    .nullable()
    .optional(),
  
  role: z.enum(AUTH_ROLE_CODE_VALUES, {
    message: "Role phải là 'admin', 'editor' hoặc 'viewer'"
  }).default(AUTH_ROLE_CODES.ADMIN),
});

export const createUserSchema = userSchema;

export const updateUserSchema = userSchema.partial().extend({
  id: z.string().uuid("User ID phải là UUID hợp lệ"),
  password: z.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số")
    .optional(), // Password optional for updates
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
