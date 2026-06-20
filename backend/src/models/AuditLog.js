import mongoose from 'mongoose';

/**
 * Immutable record of admin / security-relevant actions.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null for env-admin
    actorRole: { type: String, default: '' },
    actorLabel: { type: String, default: '' }, // e.g. admin email
    action: { type: String, required: true, index: true },
    targetType: { type: String, default: '' }, // 'User' | 'Orchard' | ...
    targetId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
