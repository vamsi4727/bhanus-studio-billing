import { getLatestBill } from './indexedDB.js';

/**
 * Extract numeric part from invoice number (e.g., "INV-0001" -> 1)
 * @param {string} invoiceNumber - Invoice number string
 * @returns {number} Numeric part
 */
function extractInvoiceNumber(invoiceNumber) {
  const match = invoiceNumber.match(/INV-(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Format invoice number with zero padding (e.g., 1 -> "INV-0001")
 * @param {number} number - Invoice number
 * @returns {string} Formatted invoice number
 */
function formatInvoiceNumber(number) {
  return `INV-${String(number).padStart(4, '0')}`;
}

/**
 * Get the next invoice number by checking the latest bill in IndexedDB
 * @returns {Promise<string>} Next invoice number (e.g., "INV-0001")
 */
export async function getNextInvoiceNumber() {
  try {
    const latestBill = await getLatestBill();
    
    if (!latestBill || !latestBill.invoiceNumber) {
      // No bills exist, start with INV-0001
      return 'INV-0001';
    }
    
    // Extract number from latest invoice and increment
    const latestNumber = extractInvoiceNumber(latestBill.invoiceNumber);
    const nextNumber = latestNumber + 1;
    
    return formatInvoiceNumber(nextNumber);
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    // Fallback to INV-0001 if there's an error
    return 'INV-0001';
  }
}

