const Setting = require('../models/Setting');

const workingHoursMiddleware = async (req, res, next) => {
  try {
// 1. Check for admin manual switch
    const setting = await Setting.findOne({ key: 'isForceOpen' });

    if (setting && setting.value === true) {
// If manual switch is enabled, orders are allowed regardless of system time
      return next();
    }

// 2. Default logic: Check for normal working hours (08:00 to 22:00)
    const currentHour = new Date().getHours();
    if (currentHour < 8 || currentHour >= 22) {
      return res.status(400).json({
        message: 'The restaurant is currently closed. Normal working hours are 08:00 to 22:00.'
      });
    }

    next();
  } catch (error) {
    console.error('Error in workingHoursMiddleware:', error);
// If there is an error getting the settings, use the default hours
    const currentHour = new Date().getHours();
    if (currentHour >= 8 && currentHour < 22) {
      return next();
    }
    res.status(400).json({ message: 'The restaurant is currently closed.' });
  }
};

module.exports = workingHoursMiddleware ;