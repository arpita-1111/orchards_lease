import Orchard from '../models/Orchard.js';

/**
 * @desc Get availability & blocked dates for an orchard (Public)
 * @route GET /api/orchards/:id/availability
 */
export const getOrchardAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const orchard = await Orchard.findById(id).select('gardenName availabilityDates blockedDates available');
    if (!orchard) {
      return res.status(404).json({ message: 'Orchard not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        orchardId: orchard._id,
        gardenName: orchard.gardenName,
        available: orchard.available,
        availabilityDates: orchard.availabilityDates,
        blockedDates: orchard.blockedDates,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update availability & blocked dates (Owner/Seller only)
 * @route PUT /api/orchards/:id/availability
 */
export const updateOrchardAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availabilityDates, blockedDates } = req.body;

    const orchard = await Orchard.findById(id);
    if (!orchard) {
      return res.status(404).json({ message: 'Orchard not found' });
    }

    // Authorization check: Ensure requester is the owner
    if (orchard.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this orchard.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Helper validation to prevent modifying past dates
    const validateDatesNotPast = (dateRanges = [], label) => {
      for (const range of dateRanges) {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error(`Invalid date format in ${label}.`);
        }
        if (start > end) {
          throw new Error(`Start date cannot be after end date in ${label}.`);
        }
        if (start < today) {
          throw new Error(`Past dates cannot be modified in ${label}.`);
        }
      }
    };

    if (availabilityDates) {
      validateDatesNotPast(availabilityDates, 'availabilityDates');
      orchard.availabilityDates = availabilityDates;
    }

    if (blockedDates) {
      validateDatesNotPast(blockedDates, 'blockedDates');
      orchard.blockedDates = blockedDates;
    }

    await orchard.save();

    return res.status(200).json({
      success: true,
      message: 'Availability updated successfully.',
      data: {
        availabilityDates: orchard.availabilityDates,
        blockedDates: orchard.blockedDates,
      },
    });
  } catch (error) {
    if (error.message.includes('Past dates') || error.message.includes('Invalid date') || error.message.includes('Start date')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};