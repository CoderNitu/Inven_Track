import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

const MLAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [demandForecast, setDemandForecast] = useState([]);
  const [criticalRisks, setCriticalRisks] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [summaryRes, forecastRes, risksRes, ordersRes] = await Promise.all([
        analyticsAPI.getDashboardSummary(),
        analyticsAPI.getDemandForecast(),
        analyticsAPI.getCriticalRisks(),
        analyticsAPI.getPendingOrders()
      ]);

      setSummary(summaryRes.data);
      setDemandForecast(forecastRes.data);
      setCriticalRisks(risksRes.data);
      setPendingOrders(ordersRes.data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async () => {
    setLoading(true);
    try {
      await Promise.all([
        analyticsAPI.generateDemandPredictions(),
        analyticsAPI.generateStockoutPredictions(),
        analyticsAPI.analyzeSeasonalTrends()
      ]);
      await loadAnalyticsData();
      alert('ML predictions generated successfully!');
    } catch (error) {
      console.error('Failed to generate predictions:', error);
      alert('Failed to generate predictions. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const generateAutomatedOrders = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.generateAutomatedOrders();
      await loadAnalyticsData();
      alert(`Automated orders generated: ${response.data.results.length} orders processed`);
    } catch (error) {
      console.error('Failed to generate automated orders:', error);
      alert('Failed to generate automated orders. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await analyticsAPI.updateOrderStatus(orderId, newStatus);
      await loadAnalyticsData();
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  if (loading && !summary) {
    return <div className="loading">Loading ML Analytics...</div>;
  }

  return (
    <div className="ml-analytics">
      <div className="header">
        <h2>🤖 ML Analytics & Automation</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={generatePredictions}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate ML Predictions'}
          </button>
          <button 
            className="btn btn-success" 
            onClick={generateAutomatedOrders}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Generate Auto Orders'}
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      {summary && (
        <div className="analytics-summary">
          <div className="summary-card">
            <h3>📊 Analytics Overview</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Total Products</span>
                <span className="value">{summary.total_products}</span>
              </div>
              <div className="summary-item">
                <span className="label">Below Reorder Point</span>
                <span className="value warning">{summary.products_below_reorder_point}</span>
              </div>
              <div className="summary-item">
                <span className="label">Critical Stockout Risk</span>
                <span className="value danger">{summary.critical_stockout_risk}</span>
              </div>
              <div className="summary-item">
                <span className="label">Pending Orders</span>
                <span className="value">{summary.pending_purchase_orders}</span>
              </div>
              <div className="summary-item">
                <span className="label">Predicted Demand (30d)</span>
                <span className="value">{summary.total_predicted_demand}</span>
              </div>
              <div className="summary-item">
                <span className="label">Avg Confidence</span>
                <span className="value">{summary.average_confidence_level}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'demand' ? 'active' : ''}`}
          onClick={() => setActiveTab('demand')}
        >
          📊 Demand Forecast
        </button>
        <button 
          className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
          onClick={() => setActiveTab('risks')}
        >
          ⚠️ Stockout Risks
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Purchase Orders
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="chart-container">
              <h3>Demand Forecast Trend</h3>
              <div className="forecast-chart">
                {demandForecast.slice(0, 7).map((day, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar" 
                      style={{ height: `${(day.total_demand / Math.max(...demandForecast.map(d => d.total_demand))) * 200}px` }}
                    ></div>
                    <span className="bar-label">{new Date(day.date).toLocaleDateString()}</span>
                    <span className="bar-value">{day.total_demand}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demand' && (
          <div className="demand-tab">
            <h3>30-Day Demand Forecast</h3>
            <div className="forecast-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Demand</th>
                    <th>Products</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {demandForecast.map((day, index) => (
                    <tr key={index}>
                      <td>{new Date(day.date).toLocaleDateString()}</td>
                      <td>{day.total_demand}</td>
                      <td>{day.products_count}</td>
                      <td>{day.avg_confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="risks-tab">
            <h3>Critical Stockout Risks</h3>
            {criticalRisks.length === 0 ? (
              <div className="no-data">No critical stockout risks detected</div>
            ) : (
              <div className="risks-grid">
                {criticalRisks.map((risk) => (
                  <div key={risk.id} className="risk-card">
                    <div className="risk-header">
                      <h4>{risk.product.name}</h4>
                      <span className={`risk-badge ${risk.is_critical ? 'critical' : 'warning'}`}>
                        {risk.is_critical ? 'Critical' : 'Warning'}
                      </span>
                    </div>
                    <div className="risk-details">
                      <p><strong>Stockout Date:</strong> {new Date(risk.predicted_stockout_date).toLocaleDateString()}</p>
                      <p><strong>Current Stock:</strong> {risk.current_stock_level}</p>
                      <p><strong>Daily Consumption:</strong> {risk.daily_consumption_rate}</p>
                      <p><strong>Confidence:</strong> {risk.confidence_level}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-tab">
            <h3>Purchase Orders</h3>
            {pendingOrders.length === 0 ? (
              <div className="no-data">No pending purchase orders</div>
            ) : (
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>PO Number</th>
                      <th>Supplier</th>
                      <th>Status</th>
                      <th>Expected Delivery</th>
                      <th>Total Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.po_number}</td>
                        <td>{order.supplier.name}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.expected_delivery_date).toLocaleDateString()}</td>
                        <td>${order.total_amount}</td>
                        <td>
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MLAnalytics;
