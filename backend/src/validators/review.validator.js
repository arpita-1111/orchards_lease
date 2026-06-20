import { z } from 'zod';
import { objectId } from './common.validator.js';

export const createReviewSchema = {
  body: z.object({
    orchardId: objectId,
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(2000).optional().default(''),
    bookingId: objectId.optional(),
  }),
};

export const updateReviewSchema = {
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().max(2000).optional(),
  }),
};
