import mongoose from 'mongoose';
import {
  ORCHARD_STATUS,
  RENT_TYPE,
  AREA_UNIT,
} from '../utils/constants.js';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' }, // Cloudinary public id (placeholder)
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const pricingRuleSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "Peak season"
    minDays: { type: Number, default: 0 },
    multiplier: { type: Number, default: 1 }, // applied to base price
  },
  { _id: false }
);

const orchardSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    gardenName: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '', maxlength: 5000 },

    // location
    district: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, trim: true, index: true },
    country: { type: String, default: 'India', trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String, default: '' },

    // orchard characteristics
    fruitTypes: { type: [String], default: [], index: true },
    totalTrees: { type: Number, default: 0, min: 0 },
    averageFruitPerTree: { type: Number, default: 0, min: 0 },
    expectedYield: { type: Number, default: 0, min: 0 }, // kg
    estimatedHarvestDate: { type: Date },
    totalArea: { type: Number, default: 0, min: 0 },
    areaUnit: { type: String, enum: Object.values(AREA_UNIT), default: AREA_UNIT.ACRE },

    // pricing
    rentType: { type: String, enum: Object.values(RENT_TYPE), default: RENT_TYPE.SEASON },
    price: { type: Number, required: true, min: 0, index: true },
    pricingRules: { type: [pricingRuleSchema], default: [] },

    // media
    images: { type: [imageSchema], default: [] },
    thumbnail: { type: String, default: '' },

    amenities: { type: [String], default: [] },

    // marketplace state
    available: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: Object.values(ORCHARD_STATUS),
      default: ORCHARD_STATUS.DRAFT,
      index: true,
    },
    rejectionReason: { type: String, default: '' },

    // engagement
    viewCount: { type: Number, default: 0 },
    favouriteCount: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },

    // SEO
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: { type: [String], default: [] },
    },

    publishedAt: { type: Date },
    archivedAt: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search-everywhere
orchardSchema.index({
  gardenName: 'text',
  description: 'text',
  district: 'text',
  state: 'text',
});

// Geospatial-ready compound for map/region queries
orchardSchema.index({ state: 1, district: 1, status: 1 });

orchardSchema.virtual('seller', {
  ref: 'User',
  localField: 'sellerId',
  foreignField: '_id',
  justOne: true,
});

const Orchard = mongoose.model('Orchard', orchardSchema);
export default Orchard;
