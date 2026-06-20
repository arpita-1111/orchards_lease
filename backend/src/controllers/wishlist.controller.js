import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import Wishlist from '../models/Wishlist.js';
import Orchard from '../models/Orchard.js';

const getOrCreate = async (userId) => {
  let wl = await Wishlist.findOne({ user: userId });
  if (!wl) wl = await Wishlist.create({ user: userId });
  return wl;
};

/* ---------------------------- Wishlist ----------------------------- */
export const getWishlist = asyncHandler(async (req, res) => {
  const wl = await Wishlist.findOne({ user: req.user._id })
    .populate({
      path: 'orchards',
      select: 'gardenName slug thumbnail price state district ratingAverage fruitTypes available',
    })
    .lean();
  return ok(res, wl?.orchards || [], 'Wishlist');
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { orchardId } = req.params;
  const orchard = await Orchard.findById(orchardId);
  if (!orchard) throw ApiError.notFound('Orchard not found');

  const wl = await getOrCreate(req.user._id);
  const idx = wl.orchards.findIndex((o) => String(o) === String(orchardId));

  let added;
  if (idx >= 0) {
    wl.orchards.splice(idx, 1);
    added = false;
    await Orchard.updateOne({ _id: orchardId }, { $inc: { favouriteCount: -1 } });
  } else {
    wl.orchards.push(orchardId);
    added = true;
    await Orchard.updateOne({ _id: orchardId }, { $inc: { favouriteCount: 1 } });
  }
  await wl.save();

  return ok(res, { added, count: wl.orchards.length }, added ? 'Added to wishlist' : 'Removed from wishlist');
});

/* ----------------------------- Compare ----------------------------- */
export const getCompareList = asyncHandler(async (req, res) => {
  const wl = await Wishlist.findOne({ user: req.user._id })
    .populate('compareList')
    .lean();
  return ok(res, wl?.compareList || [], 'Compare list');
});

export const toggleCompare = asyncHandler(async (req, res) => {
  const { orchardId } = req.params;
  const wl = await getOrCreate(req.user._id);
  const idx = wl.compareList.findIndex((o) => String(o) === String(orchardId));

  if (idx >= 0) {
    wl.compareList.splice(idx, 1);
  } else {
    if (wl.compareList.length >= 4) throw ApiError.badRequest('You can compare up to 4 orchards');
    wl.compareList.push(orchardId);
  }
  await wl.save();
  return ok(res, wl.compareList, 'Compare list updated');
});

export const clearCompare = asyncHandler(async (req, res) => {
  const wl = await getOrCreate(req.user._id);
  wl.compareList = [];
  await wl.save();
  return ok(res, [], 'Compare list cleared');
});

/* ------------------------- Recently viewed ------------------------- */
export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const wl = await Wishlist.findOne({ user: req.user._id })
    .populate({
      path: 'recentlyViewed.orchard',
      select: 'gardenName slug thumbnail price state ratingAverage',
    })
    .lean();
  const items = (wl?.recentlyViewed || []).map((r) => r.orchard).filter(Boolean);
  return ok(res, items, 'Recently viewed');
});
