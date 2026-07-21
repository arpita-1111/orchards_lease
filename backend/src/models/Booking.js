import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/constants.js';

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    orchardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Orchard',
      required: true,
      index: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    bookingStatus: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.REQUESTED,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },

    totalAmount: { type: Number, required: true, min: 0 },
    message: { type: String, default: '', maxlength: 1000 },
    rejectionReason: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },

    // Lease Renewal Management (Issue #27)
    isRenewal: { type: Boolean, default: false },
    previousBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    renewalHistory: [
      {
        renewedAt: { type: Date, default: Date.now },
        previousEndDate: { type: Date },
        newEndDate: { type: Date },
        additionalAmount: { type: Number },
      },
    ],

    timeline: { type: [timelineSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ sellerId: 1, bookingStatus: 1 });
bookingSchema.index({ renterId: 1, bookingStatus: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
