import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import { getPagination, buildPageMeta } from '../utils/helpers.js';
import { BOOKING_STATUS, NOTIFICATION_TYPE } from '../utils/constants.js';

import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Orchard from '../models/Orchard.js';
import { notify } from '../services/notification.service.js';

/* --------------------------- Create -------------------------------- */
export const createReview = asyncHandler(async (req, res) => {
  const { orchardId, rating, comment, bookingId } = req.body;

  const orchard = await Orchard.findById(orchardId);
  if (!orchard) throw ApiError.notFound('Orchard not found');

  // must have a completed/approved booking to review
  const hasBooking = await Booking.findOne({
    orchardId,
    renterId: req.user._id,
    bookingStatus: { $in: [BOOKING_STATUS.APPROVED, BOOKING_STATUS.COMPLETED] },
  });
  if (!hasBooking) throw ApiError.forbidden('You can only review orchards you have booked');

  const existing = await Review.findOne({ orchardId, renterId: req.user._id });
  if (existing) throw ApiError.conflict('You have already reviewed this orchard');

  const review = await Review.create({
    orchardId,
    renterId: req.user._id,
    bookingId,
    rating,
    comment,
  });

  await notify({
    user: orchard.sellerId,
    type: NOTIFICATION_TYPE.REVIEW,
    title: 'New review',
    message: `Your orchard "${orchard.gardenName}" received a ${rating}★ review`,
    link: `/seller/orchards`,
  });

  return created(res, review, 'Review submitted');
});

/* ----------------------- List by orchard --------------------------- */
export const listOrchardReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { orchardId: req.params.orchardId, isHidden: false };

  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate('renterId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  return ok(res, items, 'Reviews', buildPageMeta({ page, limit, total }));
});

/* ----------------------------- Update ------------------------------ */
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, renterId: req.user._id });
  if (!review) throw ApiError.notFound('Review not found');
  if (req.body.rating !== undefined) review.rating = req.body.rating;
  if (req.body.comment !== undefined) review.comment = req.body.comment;
  await review.save();
  return ok(res, review, 'Review updated');
});

/* ----------------------------- Delete ------------------------------ */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, renterId: req.user._id });
  if (!review) throw ApiError.notFound('Review not found');
  await Review.recalculateRating(review.orchardId);
  return ok(res, null, 'Review deleted');
});

/* ----------------------------- Report ------------------------------ */
export const reportReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isReported: true },
    { new: true }
  );
  if (!review) throw ApiError.notFound('Review not found');
  return ok(res, null, 'Review reported');
});
