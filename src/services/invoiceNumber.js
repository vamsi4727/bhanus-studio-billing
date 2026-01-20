import { getLatestBill } from './indexedDB.js';

/**
 * Extract numeric part from invoice number
 * Supports both old format (INV-0001) and new format (00001)
 * @param {string} invoiceNumber - Invoice number string
 * @returns {number} Numeric part
 */
function extractInvoiceNumber(invoiceNumber) {
  if (!invoiceNumber) return 0;
  
  // Try new format first (5-digit number, e.g., "00001")
  const newFormatMatch = invoiceNumber.match(/^(\d{5})$/);
  if (newFormatMatch) {
    return parseInt(newFormatMatch[1], 10);
  }
  
  // Try old format (INV-XXXX, e.g., "INV-0001")
  const oldFormatMatch = invoiceNumber.match(/INV-(\d+)/);
  if (oldFormatMatch) {
    return parseInt(oldFormatMatch[1], 10);
  }
  
  // Try any numeric string (fallback)
  const numericMatch = invoiceNumber.match(/(\d+)/);
  return numericMatch ? parseInt(numericMatch[1], 10) : 0;
}

/**
 * Format invoice number with zero padding to 5 digits (e.g., 1 -> "00001")
 * @param {number} number - Invoice number
 * @returns {string} Formatted invoice number (5 digits)
 */
function formatInvoiceNumber(number) {
  return String(number).padStart(5, '0');
}

/**
 * Get the next invoice number by checking the latest bill in IndexedDB
 * @returns {Promise<string>} Next invoice number (e.g., "00001")
 */
export async function getNextInvoiceNumber() {
  try {
    const latestBill = await getLatestBill();
    
    if (!latestBill || !latestBill.invoiceNumber) {
      // No bills exist, start with 00001
      return '00001';
    }
    
    // Extract number from latest invoice and increment
    const latestNumber = extractInvoiceNumber(latestBill.invoiceNumber);
    const nextNumber = latestNumber + 1;
    
    return formatInvoiceNumber(nextNumber);
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    // Fallback to 00001 if there's an error
    return '00001';
  }
}

