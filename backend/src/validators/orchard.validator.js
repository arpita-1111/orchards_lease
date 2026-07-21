import { z } from 'zod';
import {
  RENT_TYPE,
  AREA_UNIT,
  ORCHARD_STATUS,
} from '../utils/constants.js';

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional().default(''),
  alt: z.string().optional().default(''),
});

const pricingRuleSchema = z.object({
  label: z.string().min(1),
  minDays: z.number().min(0).optional().default(0),
  multiplier: z.number().min(0).optional().default(1),
});

const treatmentSchema = z.object({
  date: z.coerce.date(),
  method: z.string().optional().default(''),
  chemicals: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(''),
});

const historyEntrySchema = z.object({
  incidentDate: z.coerce.date(),
  season: z.string().optional().default(''),
  items: z.array(z.string()).optional().default([]),
  severity: z.string().optional().default(''),
  description: z.string().optional().default(''),
  treatments: z.array(treatmentSchema).optional().default([]),
});

const baseOrchard = {
  gardenName: z.string().min(3, 'Garden name is too short').max(120),
  description: z.string().max(5000).optional().default(''),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().optional().default('India'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().max(500).optional().default(''),
  fruitTypes: z.array(z.string()).min(1, 'Select at least one fruit type'),
  totalTrees: z.number().int().min(0).optional().default(0),
  averageFruitPerTree: z.number().min(0).optional().default(0),
  expectedYield: z.number().min(0).optional().default(0),
  estimatedHarvestDate: z.coerce.date().optional(),
  totalArea: z.number().min(0).optional().default(0),
  areaUnit: z.nativeEnum(AREA_UNIT).optional().default(AREA_UNIT.ACRE),
  rentType: z.nativeEnum(RENT_TYPE).optional().default(RENT_TYPE.SEASON),
  price: z.number().min(0, 'Price must be positive'),
  pricingRules: z.array(pricingRuleSchema).optional().default([]),
  images: z.array(imageSchema).optional().default([]),
  thumbnail: z.string().url().optional().or(z.literal('')),
  amenities: z.array(z.string()).optional().default([]),
  pestHistory: z.array(historyEntrySchema).optional().default([]),
  diseaseHistory: z.array(historyEntrySchema).optional().default([]),
  available: z.boolean().optional().default(true),
  seo: z
    .object({
      metaTitle: z.string().max(160).optional().default(''),
      metaDescription: z.string().max(320).optional().default(''),
      keywords: z.array(z.string()).optional().default([]),
    })
    .optional(),
};

export const createOrchardSchema = {
  body: z.object({
    ...baseOrchard,
    status: z
      .enum([ORCHARD_STATUS.DRAFT, ORCHARD_STATUS.PENDING])
      .optional()
      .default(ORCHARD_STATUS.DRAFT),
  }),
};

export const updateOrchardSchema = {
  body: z.object(baseOrchard).partial(),
};

export const orchardQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sort: z.string().optional(),
    search: z.string().optional(),
    fruit: z.string().optional(),
    state: z.string().optional(),
    district: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    minTrees: z.coerce.number().optional(),
    maxTrees: z.coerce.number().optional(),
    minArea: z.coerce.number().optional(),
    maxArea: z.coerce.number().optional(),
    minYield: z.coerce.number().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    available: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
    featured: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
  }),
};

export const moderateOrchardSchema = {
  body: z.object({
    action: z.enum(['approve', 'reject', 'feature', 'unfeature']),
    reason: z.string().max(500).optional(),
  }),
};
