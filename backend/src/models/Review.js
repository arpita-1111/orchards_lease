import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
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
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 2000 },
    isReported: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// one review per renter per orchard
reviewSchema.index({ orchardId: 1, renterId: 1 }, { unique: true });

/**
 * Recompute and persist an orchard's aggregate rating after a review change.
 */
reviewSchema.statics.recalculateRating = async function recalculateRating(orchardId) {
  const [agg] = await this.aggregate([
    { $match: { orchardId: new mongoose.Types.ObjectId(orchardId), isHidden: false } },
    {
      $group: {
        _id: '$orchardId',
        ratingAverage: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const Orchard = mongoose.model('Orchard');
  await Orchard.findByIdAndUpdate(orchardId, {
    ratingAverage: agg ? Number(agg.ratingAverage.toFixed(2)) : 0,
    ratingCount: agg ? agg.ratingCount : 0,
  });
};

reviewSchema.post('save', function afterSave() {
  this.constructor.recalculateRating(this.orchardId);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
