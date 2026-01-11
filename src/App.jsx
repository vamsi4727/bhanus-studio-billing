import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import CreateBill from './pages/CreateBill.jsx';
import ViewBills from './pages/ViewBills.jsx';
import ViewBill from './pages/ViewBill.jsx';
import { initDB } from './services/indexedDB.js';

// Initialize IndexedDB on app start
initDB().catch(console.error);

function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-black text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">
              Bhanus Studio
            </Link>
            <div className="flex gap-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded hover:bg-gray-800 ${
                  location.pathname === '/' ? 'bg-gray-800' : ''
                }`}
              >
                Home
              </Link>
              <Link
                to="/create"
                className={`px-3 py-2 rounded hover:bg-gray-800 ${
                  location.pathname === '/create' ? 'bg-gray-800' : ''
                }`}
              >
                Create Bill
              </Link>
              <Link
                to="/bills"
                className={`px-3 py-2 rounded hover:bg-gray-800 ${
                  location.pathname.startsWith('/bills') ? 'bg-gray-800' : ''
                }`}
              >
                View Bills
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateBill />} />
          <Route path="/bills" element={<ViewBills />} />
          <Route path="/bills/:invoiceNumber" element={<ViewBill />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
