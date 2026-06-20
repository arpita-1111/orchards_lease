import config from '../config/index.js';
import logger from '../config/logger.js';

/**
 * Email service — PLACEHOLDER.
 *
 * In `console` mode (default) emails are logged instead of sent.
 * Swap the `send` implementation for Nodemailer / SES / SendGrid later;
 * the call sites (sendWelcome, sendPasswordReset, ...) stay unchanged.
 */
const send = async ({ to, subject, html, text }) => {
  if (config.email.provider === 'console') {
    logger.info(`[email:placeholder] -> ${to} | ${subject}`);
    logger.debug(`[email:body] ${text || html}`);
    return { queued: true, provider: 'console' };
  }

  // TODO: wire real transport (Nodemailer/SES/SendGrid) using config.email.smtp
  logger.warn(`[email] provider "${config.email.provider}" not implemented — message dropped`);
  return { queued: false, provider: config.email.provider };
};

export const sendWelcomeEmail = (user) =>
  send({
    to: user.email,
    subject: 'Welcome to OrchardLease 🌳',
    text: `Hi ${user.name}, welcome to OrchardLease! Start exploring orchards now.`,
  });

export const sendVerificationEmail = (user, token) => {
  const url = `${config.clientUrl}/verify-email?token=${token}`;
  return send({
    to: user.email,
    subject: 'Verify your OrchardLease email',
    text: `Verify your email by visiting: ${url}`,
  });
};

export const sendPasswordResetEmail = (user, token) => {
  const url = `${config.clientUrl}/reset-password?token=${token}`;
  return send({
    to: user.email,
    subject: 'Reset your OrchardLease password',
    text: `Reset your password using this link (valid ${config.jwt.passwordResetExpiresIn}): ${url}`,
  });
};

export const sendBookingNotificationEmail = (user, { subject, body }) =>
  send({ to: user.email, subject, text: body });

export default { send };
