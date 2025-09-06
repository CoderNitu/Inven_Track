import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { suppliersAPI } from '../services/api';

const SupplierManagement = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    phone: '',
    address: '',
    lead_time_days: 7,
    rating: 5.0,
    total_orders: 0,
    on_time_deliveries: 0,
    is_active: true
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await suppliersAPI.update(editingSupplier.id, formData);
      } else {
        await suppliersAPI.create(formData);
      }
      setShowModal(false);
      setEditingSupplier(null);
      resetForm();
      fetchSuppliers();
    } catch (err) {
      setError('Failed to save supplier');
      console.error('Save error:', err);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_email: supplier.contact_email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      lead_time_days: supplier.lead_time_days,
      rating: supplier.rating,
      total_orders: supplier.total_orders,
      on_time_deliveries: supplier.on_time_deliveries,
      is_active: supplier.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await suppliersAPI.delete(id);
        fetchSuppliers();
      } catch (err) {
        setError('Failed to delete supplier');
        console.error('Delete error:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact_email: '',
      phone: '',
      address: '',
      lead_time_days: 7,
      rating: 5.0,
      total_orders: 0,
      on_time_deliveries: 0,
      is_active: true
    });
  };

  const openModal = () => {
    setEditingSupplier(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Loading suppliers...</div>;
  }

  return (
    <div className="supplier-management">
      <div className="header">
        <h2>Supplier Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/suppliers')}>
            Back to Performance
          </button>
          <button className="btn btn-primary" onClick={openModal}>
            Add New Supplier
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="suppliers-grid">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="supplier-card">
            <div className="supplier-header">
              <h3>{supplier.name}</h3>
              <span 
                className={`status-badge ${supplier.is_active ? 'active' : 'inactive'}`}
              >
                {supplier.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="supplier-details">
              <div className="detail">
                <strong>Email:</strong> {supplier.contact_email || 'N/A'}
              </div>
              <div className="detail">
                <strong>Phone:</strong> {supplier.phone || 'N/A'}
              </div>
              <div className="detail">
                <strong>Lead Time:</strong> {supplier.lead_time_days} days
              </div>
              <div className="detail">
                <strong>Rating:</strong> {supplier.rating}/5.0
              </div>
              <div className="detail">
                <strong>Total Orders:</strong> {supplier.total_orders}
              </div>
              <div className="detail">
                <strong>On-Time Deliveries:</strong> {supplier.on_time_deliveries}
              </div>
              <div className="detail">
                <strong>Performance Score:</strong> {supplier.performance_score?.toFixed(1) || 'N/A'}
              </div>
            </div>

            <div className="supplier-actions">
              <button 
                className="btn btn-sm btn-warning"
                onClick={() => handleEdit(supplier)}
              >
                Edit
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(supplier.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="alert alert-info">
          No suppliers found. Add your first supplier to get started.
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Supplier Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Lead Time (days)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.lead_time_days}
                  onChange={(e) => setFormData({...formData, lead_time_days: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Rating (1-5)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                  min="1"
                  max="5"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Total Orders</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.total_orders}
                  onChange={(e) => setFormData({...formData, total_orders: parseInt(e.target.value)})}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>On-Time Deliveries</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.on_time_deliveries}
                  onChange={(e) => setFormData({...formData, on_time_deliveries: parseInt(e.target.value)})}
                  min="0"
                  max={formData.total_orders}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSupplier ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
