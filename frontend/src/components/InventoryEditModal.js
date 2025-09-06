import React, { useState, useEffect } from 'react';

const InventoryEditModal = ({ inventory, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    quantity_reserved: 0,
    location: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (inventory) {
      setFormData({
        quantity_reserved: inventory.quantity_reserved || 0,
        location: inventory.location || '',
      });
    }
  }, [inventory]);

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

    if (formData.quantity_reserved < 0) {
      newErrors.quantity_reserved = 'Reserved quantity cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            Edit Inventory Details - {inventory?.product_detail?.name}
          </h2>
          <button className="close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product</label>
            <input
              type="text"
              className="form-control"
              value={`${inventory?.product_detail?.sku} - ${inventory?.product_detail?.name}`}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Current Stock on Hand</label>
            <input
              type="number"
              className="form-control"
              value={inventory?.quantity_on_hand || 0}
              disabled
            />
            <small className="text-muted">
              Stock on hand cannot be changed here. Use "Adjust Stock" to record transactions.
            </small>
          </div>

          <div className="form-group">
            <label>Reserved Quantity</label>
            <input
              type="number"
              name="quantity_reserved"
              className="form-control"
              value={formData.quantity_reserved}
              onChange={handleChange}
              min="0"
              placeholder="Enter reserved quantity"
            />
            <small className="text-muted">
              Items reserved for orders or other purposes
            </small>
            {errors.quantity_reserved && <div className="error">{errors.quantity_reserved}</div>}
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              className="form-control"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter storage location (e.g., Warehouse A, Shelf 3)"
            />
            <small className="text-muted">
              Physical location where this item is stored
            </small>
          </div>

          <div className="form-group">
            <label>Available Quantity (Read-only)</label>
            <input
              type="number"
              className="form-control"
              value={(inventory?.quantity_on_hand || 0) - (formData.quantity_reserved || 0)}
              disabled
            />
            <small className="text-muted">
              Available = On Hand - Reserved
            </small>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryEditModal;


