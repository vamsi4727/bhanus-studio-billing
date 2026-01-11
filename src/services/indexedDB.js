import { openDB } from 'idb';

const DB_NAME = 'bhanusStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'bills';
const SETTINGS_STORE = 'settings';

let db = null;

/**
 * Initialize IndexedDB database
 * @returns {Promise<IDBDatabase>} Database instance
 */
export async function initDB() {
  if (db) return db;

  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create bills store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const billStore = db.createObjectStore(STORE_NAME, {
          keyPath: 'invoiceNumber'
        });
        billStore.createIndex('createdAt', 'createdAt');
        billStore.createIndex('date', 'date');
        billStore.createIndex('customerName', 'customerName');
      }

      // Create settings store for invoice number
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE);
      }
    }
  });

  return db;
}

/**
 * Save a bill to IndexedDB
 * @param {Object} bill - Bill object
 * @returns {Promise<void>}
 */
export async function saveBill(bill) {
  const database = await initDB();
  await database.put(STORE_NAME, bill);
}

/**
 * Get all bills from IndexedDB
 * @returns {Promise<Array>} Array of bills
 */
export async function getAllBills() {
  const database = await initDB();
  return await database.getAll(STORE_NAME);
}

/**
 * Get a bill by invoice number
 * @param {string} invoiceNumber - Invoice number
 * @returns {Promise<Object|null>} Bill object or null
 */
export async function getBillByInvoiceNumber(invoiceNumber) {
  const database = await initDB();
  return await database.get(STORE_NAME, invoiceNumber);
}

/**
 * Get latest bill (by createdAt timestamp)
 * @returns {Promise<Object|null>} Latest bill or null
 */
export async function getLatestBill() {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, 'readonly');
  const index = tx.store.index('createdAt');
  const bills = await index.getAll();
  
  if (bills.length === 0) return null;
  
  // Sort by createdAt descending and return the first one
  bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return bills[0];
}

/**
 * Search bills by customer name (case-insensitive)
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching bills
 */
export async function searchBillsByCustomerName(searchTerm) {
  const database = await initDB();
  const allBills = await database.getAll(STORE_NAME);
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return allBills.filter(bill => 
    bill.customerName.toLowerCase().includes(lowerSearchTerm)
  );
}

/**
 * Filter bills by date range
 * @param {string} fromDate - Start date (DD/MM/YYYY)
 * @param {string} toDate - End date (DD/MM/YYYY)
 * @returns {Promise<Array>} Array of bills in date range
 */
export async function filterBillsByDateRange(fromDate, toDate) {
  const database = await initDB();
  const allBills = await database.getAll(STORE_NAME);
  
  const from = parseDateForComparison(fromDate);
  const to = parseDateForComparison(toDate);
  
  return allBills.filter(bill => {
    const billDate = parseDateForComparison(bill.date);
    return billDate >= from && billDate <= to;
  });
}

/**
 * Parse date string (DD/MM/YYYY) for comparison
 * @param {string} dateString - Date string
 * @returns {Date} Date object
 */
function parseDateForComparison(dateString) {
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
}

/**
 * Get all bills sorted by date (newest first)
 * @returns {Promise<Array>} Sorted array of bills
 */
export async function getAllBillsSorted() {
  const bills = await getAllBills();
  return bills.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB - dateA; // Newest first
  });
}

