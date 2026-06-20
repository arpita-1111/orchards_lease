import mongoose from 'mongoose';

/**
 * Device session — one document per active refresh token.
 * Enables "device session listing" and per-device revocation.
 */
const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true, index: true },

    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    deviceLabel: { type: String, default: 'Unknown device' },

    rememberMe: { type: Boolean, default: false },
    lastUsedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// TTL index — Mongo auto-removes expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

sessionSchema.virtual('isActive').get(function isActive() {
  return !this.revokedAt && this.expiresAt > Date.now();
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
