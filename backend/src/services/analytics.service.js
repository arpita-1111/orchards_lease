import mongoose from 'mongoose';
import User from '../models/User.js';
import Orchard from '../models/Orchard.js';
import Booking from '../models/Booking.js';
import { BOOKING_STATUS, ORCHARD_STATUS, ROLES } from '../utils/constants.js';
import { growthPercent } from '../utils/helpers.js';

const objId = (id) => new mongoose.Types.ObjectId(id);
const REVENUE_STATUSES = [BOOKING_STATUS.APPROVED, BOOKING_STATUS.COMPLETED];

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

/* ------------------------------------------------------------------ */
/*  SELLER ANALYTICS                                                    */
/* ------------------------------------------------------------------ */

export const getSellerOverview = async (sellerId) => {
  const sid = objId(sellerId);

  const [orchardStats, bookingStats, revenueAgg, pendingApprovals] = await Promise.all([
    Orchard.aggregate([
      { $match: { sellerId: sid, deletedAt: null } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', ORCHARD_STATUS.PUBLISHED] }, 1, 0] },
          },
          views: { $sum: '$viewCount' },
        },
      },
    ]),
    Booking.aggregate([
      { $match: { sellerId: sid } },
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
    ]),
    Booking.aggregate([
      { $match: { sellerId: sid, bookingStatus: { $in: REVENUE_STATUSES } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    Orchard.countDocuments({ sellerId: sid, status: ORCHARD_STATUS.PENDING }),
  ]);

  const bookingsByStatus = bookingStats.reduce((acc, b) => ({ ...acc, [b._id]: b.count }), {});
  const totalBookings = bookingStats.reduce((sum, b) => sum + b.count, 0);

  return {
    totalOrchards: orchardStats[0]?.total || 0,
    activeListings: orchardStats[0]?.active || 0,
    totalViews: orchardStats[0]?.views || 0,
    totalBookings,
    bookingsByStatus,
    revenue: revenueAgg[0]?.revenue || 0,
    completedBookings: revenueAgg[0]?.count || 0,
    pendingApprovals,
  };
};

export const getSellerRevenueSeries = async (sellerId, months = 6) => {
  const start = new Date();
  start.setMonth(start.getMonth() - (months - 1));
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const rows = await Booking.aggregate([
    {
      $match: {
        sellerId: objId(sellerId),
        bookingStatus: { $in: REVENUE_STATUSES },
        createdAt: { $gte: start },
      },
    },
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);

  return fillMonthlySeries(rows, months);
};

export const getSellerOrchardPerformance = async (sellerId, limit = 10) =>
  Orchard.aggregate([
    { $match: { sellerId: objId(sellerId), deletedAt: null } },
    {
      $lookup: {
        from: 'bookings',
        let: { oid: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$orchardId', '$$oid'] },
              bookingStatus: { $in: REVENUE_STATUSES },
            },
          },
          { $group: { _id: null, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
        ],
        as: 'bookingAgg',
      },
    },
    {
      $project: {
        gardenName: 1,
        slug: 1,
        thumbnail: 1,
        status: 1,
        viewCount: 1,
        favouriteCount: 1,
        ratingAverage: 1,
        revenue: { $ifNull: [{ $arrayElemAt: ['$bookingAgg.revenue', 0] }, 0] },
        bookings: { $ifNull: [{ $arrayElemAt: ['$bookingAgg.bookings', 0] }, 0] },
      },
    },
    { $sort: { revenue: -1, viewCount: -1 } },
    { $limit: limit },
  ]);

/* ------------------------------------------------------------------ */
/*  ADMIN ANALYTICS                                                     */
/* ------------------------------------------------------------------ */

export const getAdminKpis = async () => {
  const prev30 = daysAgo(30);
  const prev60 = daysAgo(60);

  const [
    totalUsers,
    usersLast30,
    usersPrev30,
    totalOrchards,
    orchardsLast30,
    orchardsPrev30,
    activeRentals,
    revenueAgg,
    bookingTotals,
  ] = await Promise.all([
    User.countDocuments({ deletedAt: null }),
    User.countDocuments({ createdAt: { $gte: prev30 }, deletedAt: null }),
    User.countDocuments({ createdAt: { $gte: prev60, $lt: prev30 }, deletedAt: null }),
    Orchard.countDocuments({ deletedAt: null }),
    Orchard.countDocuments({ createdAt: { $gte: prev30 }, deletedAt: null }),
    Orchard.countDocuments({ createdAt: { $gte: prev60, $lt: prev30 }, deletedAt: null }),
    Booking.countDocuments({ bookingStatus: BOOKING_STATUS.APPROVED }),
    Booking.aggregate([
      { $match: { bookingStatus: { $in: REVENUE_STATUSES } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    Booking.countDocuments({}),
  ]);

  const totalRevenue = revenueAgg[0]?.revenue || 0;
  const convertedBookings = revenueAgg[0]?.count || 0;
  const conversionRate = bookingTotals ? Number(((convertedBookings / bookingTotals) * 100).toFixed(2)) : 0;

  return {
    totalUsers,
    userGrowthPercent: growthPercent(usersLast30, usersPrev30),
    totalOrchards,
    orchardGrowthPercent: growthPercent(orchardsLast30, orchardsPrev30),
    activeRentals,
    totalRevenue,
    totalBookings: bookingTotals,
    conversionRate,
    pendingModeration: await Orchard.countDocuments({ status: ORCHARD_STATUS.PENDING }),
  };
};

export const getUserGrowthSeries = async (months = 12) => {
  const start = new Date();
  start.setMonth(start.getMonth() - (months - 1));
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const rows = await User.aggregate([
    { $match: { createdAt: { $gte: start }, deletedAt: null } },
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, role: '$role' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);

  // collapse roles into a single series keyed by month
  const merged = {};
  rows.forEach((r) => {
    const key = `${r._id.y}-${r._id.m}`;
    if (!merged[key]) merged[key] = { count: 0, sellers: 0, renters: 0 };
    merged[key].count += r.count;
    if (r._id.role === ROLES.SELLER) merged[key].sellers += r.count;
    if (r._id.role === ROLES.RENTER) merged[key].renters += r.count;
  });
  const asRows = Object.entries(merged).map(([k, v]) => {
    const [y, m] = k.split('-').map(Number);
    return { _id: { y, m }, ...v };
  });
  return fillMonthlySeries(asRows, months, ['count', 'sellers', 'renters']);
};

export const getRevenueSeries = async (months = 12) => {
  const start = new Date();
  start.setMonth(start.getMonth() - (months - 1));
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const rows = await Booking.aggregate([
    { $match: { bookingStatus: { $in: REVENUE_STATUSES }, createdAt: { $gte: start } } },
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);
  return fillMonthlySeries(rows, months, ['revenue', 'bookings']);
};

export const getGeographicDistribution = async () =>
  Orchard.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: '$state',
        orchards: { $sum: 1 },
        avgPrice: { $avg: '$price' },
      },
    },
    { $project: { state: '$_id', orchards: 1, avgPrice: { $round: ['$avgPrice', 0] }, _id: 0 } },
    { $sort: { orchards: -1 } },
  ]);

export const getTopSellers = async (limit = 5) =>
  Booking.aggregate([
    { $match: { bookingStatus: { $in: REVENUE_STATUSES } } },
    {
      $group: {
        _id: '$sellerId',
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    {
      $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'seller' },
    },
    { $unwind: '$seller' },
    {
      $project: {
        sellerId: '$_id',
        name: '$seller.name',
        email: '$seller.email',
        avatar: '$seller.avatar',
        revenue: 1,
        bookings: 1,
        _id: 0,
      },
    },
  ]);

export const getTopFruitCategories = async (limit = 8) =>
  Orchard.aggregate([
    { $match: { deletedAt: null } },
    { $unwind: '$fruitTypes' },
    { $group: { _id: '$fruitTypes', count: { $sum: 1 } } },
    { $project: { fruit: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

export const getDailyTraffic = async (days = 30) => {
  const start = daysAgo(days);
  const rows = await Booking.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r) => ({ date: r._id, bookings: r.bookings }));
};

/* ------------------------------------------------------------------ */
/*  PER-ORCHARD ANALYTICS  (Feature #28)                                */
/* ------------------------------------------------------------------ */

/**
 * Returns KPI stats + monthly revenue series for a single orchard.
 * sellerId is required for ownership verification upstream — this
 * function trusts the caller has already confirmed ownership.
 */
export const getOrchardAnalytics = async (orchardId, months = 6) => {
  const oid = objId(orchardId);

  const [orchard, bookingStats, revenueAgg, monthlySeries] = await Promise.all([
    // Basic orchard fields (views, saves, rating)
    Orchard.findOne({ _id: oid, deletedAt: null })
      .select('viewCount favouriteCount ratingAverage ratingCount gardenName')
      .lean(),

    // Booking counts grouped by status
    Booking.aggregate([
      { $match: { orchardId: oid } },
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
    ]),

    // Total revenue from approved/completed bookings
    Booking.aggregate([
      { $match: { orchardId: oid, bookingStatus: { $in: REVENUE_STATUSES } } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),

    // Monthly revenue series
    (() => {
      const start = new Date();
      start.setMonth(start.getMonth() - (months - 1));
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return Booking.aggregate([
        {
          $match: {
            orchardId: oid,
            bookingStatus: { $in: REVENUE_STATUSES },
            createdAt: { $gte: start },
          },
        },
        {
          $group: {
            _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { '_id.y': 1, '_id.m': 1 } },
      ]);
    })(),
  ]);

  const bookingsByStatus = bookingStats.reduce((acc, b) => ({ ...acc, [b._id]: b.count }), {});
  const totalBookings = bookingStats.reduce((sum, b) => sum + b.count, 0);

  return {
    gardenName: orchard?.gardenName || '',
    viewCount: orchard?.viewCount || 0,
    favouriteCount: orchard?.favouriteCount || 0,
    ratingAverage: orchard?.ratingAverage || 0,
    ratingCount: orchard?.ratingCount || 0,
    totalBookings,
    bookingsByStatus,
    revenue: revenueAgg[0]?.revenue || 0,
    completedBookings: revenueAgg[0]?.count || 0,
    pendingApprovals: bookingsByStatus[BOOKING_STATUS.REQUESTED] || 0,
    revenueSeries: fillMonthlySeries(monthlySeries, months),
  };
};

/* ------------------------------------------------------------------ */
/*  helpers                                                             */
/* ------------------------------------------------------------------ */

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fillMonthlySeries(rows, months, fields = ['revenue', 'bookings']) {
  const map = {};
  rows.forEach((r) => {
    map[`${r._id.y}-${r._id.m}`] = r;
  });

  const out = [];
  const cursor = new Date();
  cursor.setMonth(cursor.getMonth() - (months - 1));
  cursor.setDate(1);

  for (let i = 0; i < months; i += 1) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth() + 1;
    const row = map[`${y}-${m}`] || {};
    const point = { label: `${MONTH_LABELS[m - 1]} ${String(y).slice(2)}`, year: y, month: m };
    fields.forEach((f) => {
      point[f] = row[f] || 0;
    });
    out.push(point);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return out;
}
