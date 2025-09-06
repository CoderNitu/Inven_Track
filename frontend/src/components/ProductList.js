import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI, suppliersAPI } from '../services/api';
import ProductModal from './ProductModal';
import ScannerModal from './ScannerModal';
import QRGenerator from './QRGenerator';
import { formatCurrency } from '../utils/currency';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse, suppliersResponse] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
        suppliersAPI.getAll(),
      ]);

      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
      setSuppliers(suppliersResponse.data);
    } catch (err) {
      setError('Failed to load products');
      console.error('Products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert('Failed to delete product');
        console.error('Delete error:', err);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleModalSave = async (productData) => {
    try {
      if (editingProduct) {
        // Update existing product
        const response = await productsAPI.update(editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? response.data : p));
      } else {
        // Create new product
        const response = await productsAPI.create(productData);
        setProducts([...products, response.data]);
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (err) {
      alert('Failed to save product');
      console.error('Save error:', err);
    }
  };

  const handleScanProduct = (product) => {
    // Navigate to the product or show details
    setSelectedProduct(product);
    // You can add navigation logic here
  };

  const handleGenerateQR = (product) => {
    setSelectedProduct(product);
    setShowQRModal(true);
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCheckInventory = (product) => {
    // Navigate to inventory page
    navigate('/inventory');
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading products...</div>
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
        <h1>Products</h1>
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
          <button className="btn btn-success" onClick={() => setShowScannerModal(true)}>
            📱 Scan Product
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            Add New Product
          </button>
        </div>
      </div>

      <div className="card">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search products by name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Barcode</th>
              <th>Price</th>
              <th>Reorder Point</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category_detail?.name || 'N/A'}</td>
                <td>{product.supplier_detail?.name || 'N/A'}</td>
                <td>{product.barcode || 'N/A'}</td>
                <td>{formatCurrency(product.price, currency)}</td>
                <td>{product.reorder_point}</td>
                <td>
                  <span className={`btn btn-sm ${product.is_active ? 'btn-success' : 'btn-danger'}`} style={{ padding: '4px 8px', fontSize: '12px' }}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-warning btn-sm" 
                      onClick={() => handleEdit(product)}
                      style={{ padding: '6px 12px', fontSize: '12px', minWidth: '60px' }}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-success btn-sm" 
                      onClick={() => handleGenerateQR(product)}
                      style={{ padding: '6px 12px', fontSize: '12px', minWidth: '60px' }}
                    >
                      QR Code
                    </button>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleDelete(product.id)}
                      style={{ padding: '6px 12px', fontSize: '12px', minWidth: '60px' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="alert alert-warning">
            {searchTerm ? 'No products found matching your search.' : 'No products found. Create your first product!'}
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          suppliers={suppliers}
          onSave={handleModalSave}
          onClose={handleModalClose}
        />
      )}

      {showScannerModal && (
        <ScannerModal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          onProductFound={handleScanProduct}
          onViewDetails={handleViewDetails}
          onCheckInventory={handleCheckInventory}
          onEditProduct={handleEditProduct}
        />
      )}

      {showQRModal && selectedProduct && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>QR Code Generator</h2>
              <button className="close" onClick={() => setShowQRModal(false)}>&times;</button>
            </div>
            <QRGenerator product={selectedProduct} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;

