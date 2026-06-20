import mongoose from 'mongoose';
import { TOKEN_TYPE } from '../utils/constants.js';

/**
 * Short-lived one-time tokens for password reset and email verification.
 * Only the sha256 hash of the token is stored.
 */
const tokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [TOKEN_TYPE.RESET, TOKEN_TYPE.VERIFY],
      required: true,
    },
    usedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);
export default Token;
