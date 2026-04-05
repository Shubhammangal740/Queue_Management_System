/**
 * Date utility functions for queue management
 */

/**
 * Get start of day (00:00:00) for a given date
 * @param {Date|string} date - Input date
 * @returns {Date} - Date set to 00:00:00
 */
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get today's date at 00:00:00
 * @returns {Date}
 */
const getToday = () => {
  return getStartOfDay(new Date());
};

/**
 * Get tomorrow's date at 00:00:00
 * @returns {Date}
 */
const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getStartOfDay(tomorrow);
};

/**
 * Get day after tomorrow at 00:00:00
 * @returns {Date}
 */
const getDayAfterTomorrow = () => {
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  return getStartOfDay(dayAfter);
};

/**
 * Check if a date is within allowed booking range (today, tomorrow, day after tomorrow)
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
const isValidBookingDate = (date) => {
  const inputDate = getStartOfDay(date);
  const today = getToday();
  const maxDate = getDayAfterTomorrow();

  return inputDate >= today && inputDate <= maxDate;
};

/**
 * Get maximum allowed booking date (day after tomorrow)
 * @returns {Date}
 */
const getMaxBookingDate = () => {
  return getDayAfterTomorrow();
};

module.exports = {
  getStartOfDay,
  getToday,
  getTomorrow,
  getDayAfterTomorrow,
  isValidBookingDate,
  getMaxBookingDate,
};
