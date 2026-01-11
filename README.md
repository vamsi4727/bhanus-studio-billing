# Bhanus Studio Billing - PWA

A Progressive Web App (PWA) for creating and managing bills for Bhanus Studio. Works on iOS/iPad and allows creating bills, viewing old bills, and sharing them as PNG images via WhatsApp.

## Features

- ✅ Create bills with customer details and multiple items
- ✅ Auto-incrementing invoice numbers (INV-0001, INV-0002, etc.)
- ✅ View all bills with search and filter functionality
- ✅ Generate PNG images of bills
- ✅ Share bills via WhatsApp (Web Share API)
- ✅ Download bills as PNG files
- ✅ Offline functionality (PWA)
- ✅ Local storage using IndexedDB
- ✅ Responsive design for mobile and tablet

## Tech Stack

- **Framework**: React 18+ with Vite
- **Storage**: IndexedDB (using idb library)
- **Image Generation**: html2canvas
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM
- **PWA**: vite-plugin-pwa

## Installation

1. Install dependencies:
```bash
npm install
```

2. Add logo:
   - Place your logo file as `public/logo.png`
   - Recommended size: 512x512px for best PWA icon support

3. Update shop details:
   - Edit `src/components/BillTemplate.jsx` to update:
     - Shop address
     - Contact phone number
     - Email address

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── BillForm.jsx          # Bill creation form
│   ├── BillTemplate.jsx       # Bill display template
│   ├── BillList.jsx          # List of all bills with search/filter
│   └── BillViewer.jsx        # Single bill view with share/download
├── pages/
│   ├── Home.jsx              # Dashboard/home page
│   ├── CreateBill.jsx        # Create bill page
│   ├── ViewBills.jsx         # View all bills page
│   └── ViewBill.jsx          # View single bill page
├── services/
│   ├── indexedDB.js          # IndexedDB operations
│   ├── invoiceNumber.js      # Invoice number auto-increment
│   └── billGenerator.js      # PNG generation and sharing
├── utils/
│   └── dateFormatter.js     # Date formatting utilities (IST)
├── App.jsx                   # Main app with routing
└── main.jsx                  # Entry point
```

## Usage

### Creating a Bill

1. Navigate to "Create Bill"
2. Enter customer name (required) and phone (optional)
3. Add items with description, quantity, and rate
4. Amount is auto-calculated (Qty × Rate)
5. Total amount is auto-calculated
6. Click "Save Bill" to save

### Viewing Bills

1. Navigate to "View Bills"
2. Use search to filter by customer name
3. Use date range filters (From Date / To Date)
4. Click "View" on any bill to see details

### Sharing Bills

1. Open a bill in the viewer
2. Click "Download PNG" to download the bill as PNG
3. Click "Share (WhatsApp)" to share via Web Share API (opens WhatsApp on mobile)

## PWA Installation (iOS/iPad)

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will be installed as a standalone PWA

## Data Storage

- All bills are stored locally in IndexedDB
- Database name: `bhanusStudioDB`
- Store name: `bills`
- Key: `invoiceNumber`

## Invoice Number Logic

- Invoice numbers are auto-generated sequentially
- Format: INV-XXXX (4 digits, zero-padded)
- The app checks the latest bill in IndexedDB and increments accordingly
- Starts from INV-0001 if no bills exist

## Date Format

- All dates are in DD/MM/YYYY format
- Timezone: IST (Asia/Kolkata)
- Current date is auto-filled when creating a bill

## Future Enhancements (Phase 2)

- Google Drive sync
- Email sharing
- Edit/delete bills
- Form validation
- GST/Tax calculations
- PDF generation

## Browser Support

- Chrome/Edge (latest)
- Safari (iOS 11.3+)
- Firefox (latest)

## License

Private project for Bhanus Studio
