import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

/**
 * Record a security/admin-relevant action. Failures are swallowed so that
 * audit logging never breaks the primary request.
 */
export const recordAudit = async ({
  actor,
  actorRole,
  actorLabel,
  action,
  targetType,
  targetId,
  description,
  meta = {},
  req,
}) => {
  try {
    await AuditLog.create({
      actor: actor || null,
      actorRole: actorRole || '',
      actorLabel: actorLabel || '',
      action,
      targetType: targetType || '',
      targetId: targetId || undefined,
      description: description || '',
      meta,
      ip: req?.ip || '',
      userAgent: req?.headers?.['user-agent'] || '',
    });
  } catch (err) {
    logger.error(`Failed to write audit log (${action}): ${err.message}`);
  }
};

export default { recordAudit };
