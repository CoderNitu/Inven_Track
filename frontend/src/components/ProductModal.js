import React, { useState, useEffect } from 'react';

const ProductModal = ({ product, categories, suppliers, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    supplier: '',
    barcode: '',
    unit: 'pcs',
    price: 0,
    reorder_point: 10,
    reorder_quantity: 50,
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        category: product.category || '',
        supplier: product.supplier || '',
        barcode: product.barcode || '',
        unit: product.unit || 'pcs',
        price: product.price || 0,
        reorder_point: product.reorder_point || 10,
        reorder_quantity: product.reorder_quantity || 50,
        is_active: product.is_active !== undefined ? product.is_active : true,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    if (formData.reorder_point < 0) {
      newErrors.reorder_point = 'Reorder point cannot be negative';
    }
    if (formData.reorder_quantity < 0) {
      newErrors.reorder_quantity = 'Reorder quantity cannot be negative';
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
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button className="close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>SKU *</label>
            <input
              type="text"
              name="sku"
              className="form-control"
              value={formData.sku}
              onChange={handleChange}
              placeholder="Enter product SKU"
            />
            {errors.sku && <div className="error">{errors.sku}</div>}
          </div>

          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && <div className="error">{errors.category}</div>}
          </div>

          <div className="form-group">
            <label>Supplier</label>
            <select
              name="supplier"
              className="form-control"
              value={formData.supplier}
              onChange={handleChange}
            >
              <option value="">Select a supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Barcode</label>
            <input
              type="text"
              name="barcode"
              className="form-control"
              value={formData.barcode}
              onChange={handleChange}
              placeholder="Enter barcode (optional)"
            />
          </div>

          <div className="form-group">
            <label>Unit</label>
            <select
              name="unit"
              className="form-control"
              value={formData.unit}
              onChange={handleChange}
            >
              <option value="pcs">Pieces</option>
              <option value="kg">Kilograms</option>
              <option value="g">Grams</option>
              <option value="l">Liters</option>
              <option value="ml">Milliliters</option>
              <option value="m">Meters</option>
              <option value="cm">Centimeters</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              className="form-control"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
            {errors.price && <div className="error">{errors.price}</div>}
          </div>

          <div className="form-group">
            <label>Reorder Point</label>
            <input
              type="number"
              name="reorder_point"
              className="form-control"
              value={formData.reorder_point}
              onChange={handleChange}
              min="0"
            />
            {errors.reorder_point && <div className="error">{errors.reorder_point}</div>}
          </div>

          <div className="form-group">
            <label>Reorder Quantity</label>
            <input
              type="number"
              name="reorder_quantity"
              className="form-control"
              value={formData.reorder_quantity}
              onChange={handleChange}
              min="0"
            />
            {errors.reorder_quantity && <div className="error">{errors.reorder_quantity}</div>}
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              Active
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;


