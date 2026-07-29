const Setting = require('../models/Setting');

const workingHoursMiddleware = async (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  try {
    const setting = await Setting.findOne({ key: 'isForceOpen' });

    if (setting && setting.value === true) {
      return next();
    }

    const currentHour = new Date().getHours();
    if (currentHour < 8 || currentHour >= 22) {
      return res.status(400).json({
        message: 'Restaurant is closed now, working time is between 8 and 22.'
      });
    }

    next();
  } catch (error) {
    console.error('Error in workingHoursMiddleware:', error);
    const currentHour = new Date().getHours();
    if (currentHour >= 8 && currentHour < 22) {
      return next();
    }
    res.status(400).json({ message: 'Restaurant is closed now, working time is between 8 and 22.' });
  }
};

module.exports = workingHoursMiddleware;