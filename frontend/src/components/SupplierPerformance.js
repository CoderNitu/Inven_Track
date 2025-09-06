import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { suppliersAPI } from '../services/api';

const SupplierPerformance = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await suppliersAPI.getAll();
      setSuppliers(response.data);
    } catch (err) {
      setError('Failed to load supplier data');
      console.error('Supplier error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return '#28a745'; // Green
    if (score >= 60) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const getPerformanceLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return <div className="loading">Loading supplier performance...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="supplier-performance">
      <div className="header">
        <h2>Supplier Performance Metrics</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/suppliers/manage')}
        >
          Manage Suppliers
        </button>
      </div>
      
      <div className="performance-grid">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="supplier-card">
            <div className="supplier-header">
              <h3>{supplier.name}</h3>
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: supplier.is_active ? '#28a745' : '#dc3545',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                {supplier.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="performance-metrics">
              <div className="metric">
                <label>Performance Score:</label>
                <div className="score-display">
                  <span 
                    style={{ 
                      color: getPerformanceColor(supplier.performance_score),
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}
                  >
                    {supplier.performance_score.toFixed(1)}
                  </span>
                  <span 
                    style={{ 
                      color: getPerformanceColor(supplier.performance_score),
                      fontSize: '12px',
                      marginLeft: '8px'
                    }}
                  >
                    ({getPerformanceLabel(supplier.performance_score)})
                  </span>
                </div>
              </div>

              <div className="metric">
                <label>Rating:</label>
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i}
                      style={{ 
                        color: i < supplier.rating ? '#ffc107' : '#e4e5e9',
                        fontSize: '16px'
                      }}
                    >
                      ★
                    </span>
                  ))}
                  <span style={{ marginLeft: '8px', fontSize: '14px' }}>
                    {supplier.rating}/5.0
                  </span>
                </div>
              </div>

              <div className="metric">
                <label>On-Time Delivery Rate:</label>
                <div className="delivery-rate">
                  <span style={{ fontWeight: 'bold' }}>
                    {supplier.on_time_delivery_rate.toFixed(1)}%
                  </span>
                  <span style={{ fontSize: '12px', color: '#6c757d', marginLeft: '8px' }}>
                    ({supplier.on_time_deliveries}/{supplier.total_orders} orders)
                  </span>
                </div>
              </div>

              <div className="metric">
                <label>Lead Time:</label>
                <span>{supplier.lead_time_days} days</span>
              </div>

              <div className="metric">
                <label>Total Orders:</label>
                <span>{supplier.total_orders}</span>
              </div>

              {supplier.last_order_date && (
                <div className="metric">
                  <label>Last Order:</label>
                  <span>{new Date(supplier.last_order_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="supplier-contact">
              {supplier.contact_email && (
                <div className="contact-info">
                  <strong>Email:</strong> {supplier.contact_email}
                </div>
              )}
              {supplier.phone && (
                <div className="contact-info">
                  <strong>Phone:</strong> {supplier.phone}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="alert alert-info">
          No suppliers found. Add suppliers to see performance metrics.
        </div>
      )}
    </div>
  );
};

export default SupplierPerformance;
