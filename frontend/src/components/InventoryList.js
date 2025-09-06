import React, { useState, useEffect } from 'react';
import { inventoryAPI, productsAPI } from '../services/api';
import StockTransactionModal from './StockTransactionModal';
import InventoryEditModal from './InventoryEditModal';
import { formatCurrency } from '../utils/currency';

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll();
      setInventory(response.data);
    } catch (err) {
      setError('Failed to load inventory');
      console.error('Inventory error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockTransaction = (product) => {
    setSelectedProduct(product);
    setShowTransactionModal(true);
  };

  const handleEditInventory = (inventoryItem) => {
    setSelectedInventory(inventoryItem);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowTransactionModal(false);
    setShowEditModal(false);
    setSelectedProduct(null);
    setSelectedInventory(null);
  };

  const handleTransactionSave = async (transactionData) => {
    try {
      const productId = selectedProduct?.id || transactionData.product;
      if (!productId) {
        alert('Please select a product');
        return;
      }
      
      // Remove product from transactionData since it's passed as URL parameter
      const { product, ...transactionPayload } = transactionData;
      
      await productsAPI.createTransaction(productId, transactionPayload);
      // Refresh inventory data
      await fetchInventory();
      setShowTransactionModal(false);
      setSelectedProduct(null);
    } catch (err) {
      alert('Failed to record transaction');
      console.error('Transaction error:', err);
    }
  };

  const handleInventorySave = async (inventoryData) => {
    try {
      await inventoryAPI.update(selectedInventory.id, inventoryData);
      // Refresh inventory data
      await fetchInventory();
      setShowEditModal(false);
      setSelectedInventory(null);
    } catch (err) {
      alert('Failed to update inventory');
      console.error('Inventory update error:', err);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.product_detail?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product_detail?.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading inventory...</div>
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
        <h1>Inventory Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setSelectedProduct(null); // Allow selecting any product
              setShowTransactionModal(true);
            }}
          >
            Record Stock Transaction
          </button>
        </div>
      </div>

      <div className="card">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search inventory by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>On Hand</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Value</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td>{item.product_detail?.name || 'N/A'}</td>
                <td>{item.product_detail?.sku || 'N/A'}</td>
                <td>{item.quantity_on_hand}</td>
                <td>{item.quantity_reserved}</td>
                <td>
                  <span style={{ 
                    color: item.available_quantity <= 0 ? '#dc3545' : 
                           item.is_below_reorder_point ? '#ffc107' : '#28a745',
                    fontWeight: 'bold'
                  }}>
                    {item.available_quantity}
                  </span>
                </td>
                <td>
                  {formatCurrency(
                    (item.product_detail?.price || 0) * item.quantity_on_hand, 
                    currency
                  )}
                </td>
                <td>{item.location || 'N/A'}</td>
                <td>
                  {item.is_below_reorder_point ? (
                    <span className="btn btn-warning btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }}>Low Stock</span>
                  ) : (
                    <span className="btn btn-success btn-sm" style={{ padding: '4px 8px', fontSize: '12px' }}>In Stock</span>
                  )}
                </td>
                <td>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleStockTransaction(item.product_detail)}
                    style={{ marginRight: '5px' }}
                  >
                    Adjust Stock
                  </button>
                  <button 
                    className="btn btn-warning btn-sm" 
                    onClick={() => handleEditInventory(item)}
                  >
                    Edit Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInventory.length === 0 && (
          <div className="alert alert-warning">
            {searchTerm ? 'No inventory items found matching your search.' : 'No inventory items found.'}
          </div>
        )}
      </div>

      {showTransactionModal && (
        <StockTransactionModal
          product={selectedProduct}
          onSave={handleTransactionSave}
          onClose={handleModalClose}
        />
      )}

      {showEditModal && (
        <InventoryEditModal
          inventory={selectedInventory}
          onSave={handleInventorySave}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default InventoryList;

