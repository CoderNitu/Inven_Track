import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

const StockTransactionModal = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    quantity_change: '',
    reason: 'adjustment',
    reference: '',
  });
  const [errors, setErrors] = useState({});
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!product && !formData.product) {
      newErrors.product = 'Please select a product';
    }
    if (!formData.quantity_change || formData.quantity_change === '0') {
      newErrors.quantity_change = 'Quantity change is required and cannot be zero';
    }
    if (!formData.reason) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const transactionData = {
        ...formData,
        quantity_change: parseInt(formData.quantity_change),
        product: product?.id || formData.product
      };
      
      // Validate that a product is selected
      if (!transactionData.product) {
        setErrors({ product: 'Please select a product' });
        return;
      }
      
      onSave(transactionData);
    }
  };

  const reasonOptions = [
    { value: 'purchase', label: 'Purchase Inbound' },
    { value: 'sale', label: 'Sale Outbound' },
    { value: 'adjustment', label: 'Manual Adjustment' },
    { value: 'return', label: 'Return' },
    { value: 'transfer', label: 'Transfer' },
  ];

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {product ? `Record Stock Transaction - ${product.name}` : 'Record Stock Transaction'}
          </h2>
          <button className="close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {!product && (
            <div className="form-group">
              <label>Product *</label>
              <select
                name="product"
                className="form-control"
                value={formData.product || ''}
                onChange={handleChange}
                required
              >
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
              {errors.product && <div className="error">{errors.product}</div>}
            </div>
          )}

          <div className="form-group">
            <label>Quantity Change *</label>
            <input
              type="number"
              name="quantity_change"
              className="form-control"
              value={formData.quantity_change}
              onChange={handleChange}
              placeholder="Positive for inbound, negative for outbound"
              required
            />
            <small className="text-muted">
              Use positive numbers for stock in (+100) and negative for stock out (-50)
            </small>
            {errors.quantity_change && <div className="error">{errors.quantity_change}</div>}
          </div>

          <div className="form-group">
            <label>Reason *</label>
            <select
              name="reason"
              className="form-control"
              value={formData.reason}
              onChange={handleChange}
              required
            >
              {reasonOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.reason && <div className="error">{errors.reason}</div>}
          </div>

          <div className="form-group">
            <label>Reference</label>
            <input
              type="text"
              name="reference"
              className="form-control"
              value={formData.reference}
              onChange={handleChange}
              placeholder="PO number, SO number, or other reference"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Record Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockTransactionModal;

