const checkWorkingHours = (req, res, next) => {
  const now = new Date();
  
  // Allowed working hours (default 08:00 to 22:00)
  const openTime = process.env.OPENING_HOUR || '08:00';
  const closeTime = process.env.CLOSING_HOUR || '22:00';

  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  // Use current server timezone
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), openHour, openMin, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), closeHour, closeMin, 0);

  if (now >= start && now <= end) {
    return next(); // Within working hours, proceed to checkout
  }

  return res.status(403).json({ 
    message: `The restaurant is currently closed. Ordering is available between ${openTime} and ${closeTime}.` 
  });
};

module.exports = { checkWorkingHours };
