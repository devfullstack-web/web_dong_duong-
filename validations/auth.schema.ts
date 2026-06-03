import { z } from 'zod';

/**
 * User & Auth Validation Schemas
 */

export const loginSchema = z.object({
  username: z.string()
    .min(3, "Tên đăng nhập hoặc email phải có ít nhất 3 ký tự")
    .max(255, "Tên đăng nhập hoặc email không được quá 255 ký tự")
    .trim(),
  
  password: z.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu không được quá 100 ký tự"),
});

export const userSchema = z.object({
  email: z.string()
    .email("Email không hợp lệ")
    .max(255)
    .trim(),
  
  password: z.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số"),
  
  full_name: z.string()
    .min(1, "Họ tên là bắt buộc")
    .max(255)
    .trim()
    .nullable()
    .optional(),
  
  role_ids: z.array(z.string().uuid("Role ID phải là UUID hợp lệ")).optional(),
});

export const createUserSchema = userSchema;

export const updateUserSchema = userSchema.partial().extend({
  id: z.string().uuid("User ID phải là UUID hợp lệ"),
  password: z.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số")
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
