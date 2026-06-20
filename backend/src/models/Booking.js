import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/constants.js';

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
      default: PAYMENT_STATUS.UNPAID,
      index: true,
    },

    totalAmount: { type: Number, required: true, min: 0 },
    message: { type: String, default: '', maxlength: 1000 }, // renter note
    rejectionReason: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },

    timeline: { type: [timelineEntrySchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.index({ sellerId: 1, bookingStatus: 1, createdAt: -1 });
bookingSchema.index({ renterId: 1, createdAt: -1 });

bookingSchema.virtual('durationDays').get(function durationDays() {
  if (!this.startDate || !this.endDate) return 0;
  return Math.max(1, Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)));
});

bookingSchema.methods.addTimeline = function addTimeline(status, note, by) {
  this.timeline.push({ status, note, by, at: new Date() });
};

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
