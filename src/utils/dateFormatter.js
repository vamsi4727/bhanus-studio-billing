import { format, toZonedTime } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format date to DD/MM/YYYY format in IST timezone
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
export function formatDate(date = new Date()) {
  const istDate = toZonedTime(date, IST_TIMEZONE);
  return format(istDate, 'dd/MM/yyyy');
}

/**
 * Get current date in IST timezone as DD/MM/YYYY
 * @returns {string} Current date string
 */
export function getCurrentDate() {
  return formatDate(new Date());
}

/**
 * Parse DD/MM/YYYY date string to Date object
 * @param {string} dateString - Date string in DD/MM/YYYY format
 * @returns {Date} Date object
 */
export function parseDate(dateString) {
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
}

/**
 * Get ISO timestamp for sorting (in IST timezone)
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} ISO timestamp string
 */
export function getISOTimestamp(date = new Date()) {
  const istDate = toZonedTime(date, IST_TIMEZONE);
  return istDate.toISOString();
}

