import { z } from 'zod';

export const updateProfileSchema = {
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    bio: z.string().max(500).optional(),
    phone: z.string().max(20).optional(),
    language: z.string().max(10).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
  }),
};

export const notificationSettingsSchema = {
  body: z.object({
    emailBookings: z.boolean().optional(),
    emailApprovals: z.boolean().optional(),
    emailMarketing: z.boolean().optional(),
    inAppBookings: z.boolean().optional(),
    inAppSystem: z.boolean().optional(),
  }),
};

export const deleteAccountSchema = {
  body: z.object({
    password: z.string().min(1, 'Password is required to delete your account'),
  }),
};
