import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/ApiResponse.js';
import Booking from '../models/Booking.js';
import {
  getSellerOverview,
  getSellerRevenueSeries,
  getSellerOrchardPerformance,
} from '../services/analytics.service.js';

/* --------------------------- Overview ------------------------------ */
export const getOverview = asyncHandler(async (req, res) => {
  const data = await getSellerOverview(req.user._id);
  return ok(res, data, 'Seller overview');
});

/* ------------------------ Revenue series --------------------------- */
export const getRevenue = asyncHandler(async (req, res) => {
  const months = Math.min(parseInt(req.query.months, 10) || 6, 24);
  const data = await getSellerRevenueSeries(req.user._id, months);
  return ok(res, data, 'Revenue series');
});

/* --------------------- Orchard performance ------------------------- */
export const getPerformance = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const data = await getSellerOrchardPerformance(req.user._id, limit);
  return ok(res, data, 'Orchard performance');
});

/* --------------------- Export bookings CSV ------------------------- */
export const exportBookingsCsv = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ sellerId: req.user._id })
    .populate('orchardId', 'gardenName')
    .populate('renterId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const header = [
    'Booking ID',
    'Orchard',
    'Renter',
    'Renter Email',
    'Start Date',
    'End Date',
    'Status',
    'Payment',
    'Amount',
    'Created',
  ];

  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = bookings.map((b) =>
    [
      b._id,
      b.orchardId?.gardenName || '',
      b.renterId?.name || '',
      b.renterId?.email || '',
      b.startDate?.toISOString().slice(0, 10),
      b.endDate?.toISOString().slice(0, 10),
      b.bookingStatus,
      b.paymentStatus,
      b.totalAmount,
      b.createdAt?.toISOString().slice(0, 10),
    ]
      .map(escape)
      .join(',')
  );

  const csv = [header.map(escape).join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="orchardlease-bookings.csv"');
  return res.send(csv);
});
