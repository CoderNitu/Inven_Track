import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import InventoryList from './components/InventoryList';
import TransactionList from './components/TransactionList';
import SupplierPerformance from './components/SupplierPerformance';
import SupplierManagement from './components/SupplierManagement';
import LocationManagement from './components/LocationManagement';
import MLAnalytics from './components/MLAnalytics';
import Notifications from './components/Notifications';
import Reports from './components/Reports';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/transactions" element={<TransactionList />} />
                            <Route path="/suppliers" element={<SupplierPerformance />} />
                  <Route path="/suppliers/manage" element={<SupplierManagement />} />
                  <Route path="/locations" element={<LocationManagement />} />
                  <Route path="/analytics" element={<MLAnalytics />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

