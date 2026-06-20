import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import { FRUIT_TYPES, AMENITIES, RENT_TYPE, AREA_UNIT } from '../utils/constants.js';
import Orchard from '../models/Orchard.js';
import Setting from '../models/Setting.js';
import { ORCHARD_STATUS } from '../utils/constants.js';

/** Static + dynamic options for building search filters on the client. */
export const getFilterOptions = asyncHandler(async (_req, res) => {
  const [states, fruitFacets] = await Promise.all([
    Orchard.distinct('state', { status: ORCHARD_STATUS.PUBLISHED, deletedAt: null }),
    Orchard.distinct('fruitTypes', { status: ORCHARD_STATUS.PUBLISHED, deletedAt: null }),
  ]);

  return ok(res, {
    fruitTypes: FRUIT_TYPES,
    availableFruitTypes: fruitFacets,
    amenities: AMENITIES,
    rentTypes: Object.values(RENT_TYPE),
    areaUnits: Object.values(AREA_UNIT),
    states: states.sort(),
  });
});

/** Public-facing settings — announcement banner + maintenance flag. */
export const getPublicSettings = asyncHandler(async (_req, res) => {
  const s = await Setting.getSingleton();
  return ok(res, {
    maintenanceMode: s.maintenanceMode,
    maintenanceMessage: s.maintenanceMessage,
    announcement: s.announcement,
    supportEmail: s.supportEmail,
  });
});

/** Featured orchards for the homepage. */
export const getFeaturedOrchards = asyncHandler(async (_req, res) => {
  const items = await Orchard.find({
    isFeatured: true,
    status: ORCHARD_STATUS.PUBLISHED,
    deletedAt: null,
  })
    .populate('sellerId', 'name avatar')
    .sort({ ratingAverage: -1 })
    .limit(8)
    .lean();
  return ok(res, items, 'Featured orchards');
});

export const healthCheck = (_req, res) =>
  res.json({ success: true, status: 'ok', service: 'orchardlease-api', time: new Date().toISOString() });
