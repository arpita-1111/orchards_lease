import mongoose from 'mongoose';

/**
 * Renter's saved orchards (wishlist / favourites) and recently viewed list.
 * One document per renter.
 */
const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    orchards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Orchard' }],
    compareList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Orchard' }],
    recentlyViewed: [
      {
        orchard: { type: mongoose.Schema.Types.ObjectId, ref: 'Orchard' },
        viewedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
