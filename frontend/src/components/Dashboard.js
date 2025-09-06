import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, inventoryAPI } from '../services/api';
import { formatCurrency, getExchangeRate } from '../utils/currency';
import useWebSocket from '../hooks/useWebSocket';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalInventoryValue: 0,
    recentTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('INR');
  const [notifications, setNotifications] = useState([]);

  // For now, use polling instead of WebSocket for real-time updates
  const [wsConnected, setWsConnected] = useState(false);

  // Refresh dashboard data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get products first
      const productsResponse = await productsAPI.getAll();
      const products = productsResponse.data;
      
      // Try to get inventory data, but don't fail if it doesn't exist
      let inventory = [];
      try {
        const inventoryResponse = await inventoryAPI.getAll();
        inventory = inventoryResponse.data;
      } catch (inventoryError) {
        console.warn('Inventory data not available:', inventoryError);
        // Continue with empty inventory
      }

      // Calculate statistics
      const totalProducts = products.length;
      const lowStockItems = inventory.filter(item => item.is_below_reorder_point).length;
      const totalInventoryValue = inventory.reduce((sum, item) => {
        return sum + (item.product_detail?.price || 0) * item.quantity_on_hand;
      }, 0);

      setStats({
        totalProducts,
        lowStockItems,
        totalInventoryValue: totalInventoryValue.toFixed(2),
        recentTransactions: 0, // This would come from transactions API
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Inventory Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#28a745',
            marginRight: '8px'
          }}></div>
          <span style={{ fontSize: '14px', color: '#6c757d' }}>
            Auto-refresh every 30 seconds
          </span>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number" style={{ color: stats.lowStockItems > 0 ? '#dc3545' : '#28a745' }}>
            {stats.lowStockItems}
          </div>
          <div className="stat-label">Low Stock Items</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">
            {formatCurrency(parseFloat(stats.totalInventoryValue), currency)}
          </div>
          <div className="stat-label">
            Total Inventory Value
            {currency !== 'INR' && (
              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '5px' }}>
                (Rate: 1 INR = {getExchangeRate('INR', currency).toFixed(4)} {currency})
              </div>
            )}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.recentTransactions}</div>
          <div className="stat-label">Recent Transactions</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>Quick Actions</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label>Currency:</label>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="form-control"
              style={{ width: '100px' }}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/products')}
          >
            Add New Product
          </button>
          <button 
            className="btn btn-success" 
            onClick={() => navigate('/inventory')}
          >
            Record Stock In
          </button>
          <button 
            className="btn btn-warning" 
            onClick={() => navigate('/inventory')}
          >
            Record Stock Out
          </button>
          <button 
            className="btn btn-danger" 
            onClick={() => navigate('/inventory')}
          >
            View Low Stock
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Low Stock Alerts</h2>
        <LowStockAlerts />
      </div>
    </div>
  );
};

const LowStockAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      const response = await inventoryAPI.getAll();
      const lowStockItems = response.data.filter(item => item.is_below_reorder_point);
      setAlerts(lowStockItems);
    } catch (err) {
      console.error('Failed to fetch low stock items:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading alerts...</div>;
  }

  if (alerts.length === 0) {
    return (
      <div className="alert alert-success">
        No low stock alerts! All items are well stocked.
      </div>
    );
  }

  return (
    <div>
      {alerts.map((alert) => (
        <div key={alert.id} className="alert alert-warning">
          <strong>{alert.product_detail?.name}</strong> (SKU: {alert.product_detail?.sku}) - 
          Only {alert.available_quantity} units available. 
          Reorder point: {alert.product_detail?.reorder_point}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;

