import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/api';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getAll();
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.product_detail?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.product_detail?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterReason || transaction.reason === filterReason;
    
    return matchesSearch && matchesFilter;
  });

  const getReasonLabel = (reason) => {
    const labels = {
      'purchase': 'Purchase Inbound',
      'sale': 'Sale Outbound',
      'adjustment': 'Manual Adjustment',
      'return': 'Return',
      'transfer': 'Transfer',
    };
    return labels[reason] || reason;
  };

  const getQuantityColor = (quantity) => {
    if (quantity > 0) return '#28a745'; // Green for positive
    if (quantity < 0) return '#dc3545'; // Red for negative
    return '#6c757d'; // Gray for zero
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading transactions...</div>
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
      <h1>Stock Transactions</h1>

      <div className="card">
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by product name, SKU, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ width: '200px' }}>
            <select
              className="form-control"
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
            >
              <option value="">All Reasons</option>
              <option value="purchase">Purchase Inbound</option>
              <option value="sale">Sale Outbound</option>
              <option value="adjustment">Manual Adjustment</option>
              <option value="return">Return</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Quantity Change</th>
              <th>Reason</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  {new Date(transaction.created_at).toLocaleDateString()} {new Date(transaction.created_at).toLocaleTimeString()}
                </td>
                <td>{transaction.product_detail?.name || 'N/A'}</td>
                <td>{transaction.product_detail?.sku || 'N/A'}</td>
                <td>
                  <span style={{ 
                    color: getQuantityColor(transaction.quantity_change),
                    fontWeight: 'bold'
                  }}>
                    {transaction.quantity_change > 0 ? '+' : ''}{transaction.quantity_change}
                  </span>
                </td>
                <td>
                  <span className={`btn btn-sm ${
                    transaction.reason === 'purchase' ? 'btn-success' :
                    transaction.reason === 'sale' ? 'btn-danger' :
                    transaction.reason === 'adjustment' ? 'btn-warning' :
                    transaction.reason === 'return' ? 'btn-info' :
                    'btn-secondary'
                  }`}>
                    {getReasonLabel(transaction.reason)}
                  </span>
                </td>
                <td>{transaction.reference || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <div className="alert alert-warning">
            {searchTerm || filterReason ? 'No transactions found matching your criteria.' : 'No transactions found.'}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Transaction Summary</h3>
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-number">{transactions.length}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {transactions.filter(t => t.reason === 'purchase').length}
            </div>
            <div className="stat-label">Purchase Transactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {transactions.filter(t => t.reason === 'sale').length}
            </div>
            <div className="stat-label">Sale Transactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {transactions.filter(t => t.reason === 'adjustment').length}
            </div>
            <div className="stat-label">Adjustments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;


