import { z } from 'zod';
import { ROLES } from '../utils/constants.js';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name is too short').max(80),
    email: z.string().email('Invalid email'),
    password: passwordSchema,
    role: z.enum([ROLES.SELLER, ROLES.RENTER]).default(ROLES.RENTER),
    phone: z.string().max(20).optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
    remember: z.boolean().optional().default(false),
  }),
};

export const adminLoginSchema = {
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({ email: z.string().email('Invalid email') }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(10, 'Invalid reset token'),
    password: passwordSchema,
  }),
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
};

export const verifyEmailSchema = {
  body: z.object({ token: z.string().min(10) }),
};
