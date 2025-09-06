import React, { useState, useEffect } from 'react';
import { locationsAPI } from '../services/api';

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_person: '',
    phone: '',
    email: '',
    is_active: true
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await locationsAPI.getAll();
      setLocations(response.data);
    } catch (err) {
      setError('Failed to load locations');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await locationsAPI.update(editingLocation.id, formData);
      } else {
        await locationsAPI.create(formData);
      }
      setShowModal(false);
      setEditingLocation(null);
      resetForm();
      fetchLocations();
    } catch (err) {
      setError('Failed to save location');
      console.error('Save error:', err);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      contact_person: location.contact_person || '',
      phone: location.phone || '',
      email: location.email || '',
      is_active: location.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await locationsAPI.delete(id);
        fetchLocations();
      } catch (err) {
        setError('Failed to delete location');
        console.error('Delete error:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      contact_person: '',
      phone: '',
      email: '',
      is_active: true
    });
  };

  const openModal = () => {
    setEditingLocation(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Loading locations...</div>;
  }

  return (
    <div className="location-management">
      <div className="header">
        <h2>Warehouse Locations</h2>
        <button className="btn btn-primary" onClick={openModal}>
          Add New Location
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="locations-grid">
        {locations.map((location) => (
          <div key={location.id} className="location-card">
            <div className="location-header">
              <h3>{location.name}</h3>
              <span 
                className={`status-badge ${location.is_active ? 'active' : 'inactive'}`}
              >
                {location.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="location-details">
              {location.address && (
                <div className="detail">
                  <strong>Address:</strong> {location.address}
                </div>
              )}
              {location.contact_person && (
                <div className="detail">
                  <strong>Contact:</strong> {location.contact_person}
                </div>
              )}
              {location.phone && (
                <div className="detail">
                  <strong>Phone:</strong> {location.phone}
                </div>
              )}
              {location.email && (
                <div className="detail">
                  <strong>Email:</strong> {location.email}
                </div>
              )}
              <div className="detail">
                <strong>Created:</strong> {new Date(location.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="location-actions">
              <button 
                className="btn btn-sm btn-warning"
                onClick={() => handleEdit(location)}
              >
                Edit
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(location.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && (
        <div className="alert alert-info">
          No locations found. Add your first warehouse location to get started.
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingLocation ? 'Edit Location' : 'Add New Location'}</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Location Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
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
                <label>Contact Person</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
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
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  {editingLocation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;
