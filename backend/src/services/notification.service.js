import Notification from '../models/Notification.js';
import User from '../models/User.js';
import logger from '../config/logger.js';
import { sendBookingNotificationEmail } from './email.service.js';

/**
 * Create an in-app notification and, depending on the user's preferences,
 * trigger an email placeholder.
 */
export const notify = async ({ user, type, title, message, link, meta = {}, email = false }) => {
  try {
    const doc = await Notification.create({ user, type, title, message, link, meta });

    if (email) {
      const recipient = await User.findById(user).select('email name notificationSettings');
      if (recipient?.notificationSettings?.emailBookings) {
        await sendBookingNotificationEmail(recipient, { subject: title, body: message });
      }
    }
    return doc;
  } catch (err) {
    logger.error(`Failed to create notification: ${err.message}`);
    return null;
  }
};

export const notifyMany = async (notifications = []) =>
  Promise.all(notifications.map((n) => notify(n)));

export default { notify, notifyMany };
