import React from 'react';
import { formatCurrency } from '../utils/currency';

const ProductDetails = ({ product, onClose, currency = 'INR', onViewDetails, onCheckInventory, onEditProduct }) => {
  if (!product) {
    return (
      <div className="product-details">
        <div className="scanner-header">
          <h3>Product Details</h3>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="alert alert-warning">
          No product information available.
        </div>
      </div>
    );
  }

  return (
    <div className="product-details">
      <div className="scanner-header">
        <h3>Product Found!</h3>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="product-info" style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <h4 style={{ color: '#007bff', marginBottom: '15px' }}>{product.name}</h4>
            <p><strong>SKU:</strong> {product.sku}</p>
            <p><strong>Category:</strong> {product.category_detail?.name || 'N/A'}</p>
            <p><strong>Supplier:</strong> {product.supplier_detail?.name || 'N/A'}</p>
            <p><strong>Barcode:</strong> {product.barcode || 'N/A'}</p>
          </div>
          <div>
            <p><strong>Price:</strong> {formatCurrency(product.price, currency)}</p>
            <p><strong>Unit:</strong> {product.unit}</p>
            <p><strong>Reorder Point:</strong> {product.reorder_point}</p>
            <p><strong>Reorder Quantity:</strong> {product.reorder_quantity}</p>
            <p><strong>Status:</strong> 
              <span className={`btn btn-sm ${product.is_active ? 'btn-success' : 'btn-danger'}`} style={{ marginLeft: '8px', padding: '4px 8px', fontSize: '12px' }}>
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="product-actions" style={{ textAlign: 'center' }}>
        <button 
          className="btn btn-primary" 
          style={{ marginRight: '10px' }}
          onClick={() => onViewDetails && onViewDetails(product)}
        >
          View Full Details
        </button>
        <button 
          className="btn btn-success" 
          style={{ marginRight: '10px' }}
          onClick={() => onCheckInventory && onCheckInventory(product)}
        >
          Check Inventory
        </button>
        <button 
          className="btn btn-warning"
          onClick={() => onEditProduct && onEditProduct(product)}
        >
          Edit Product
        </button>
      </div>

      <div className="product-meta" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px', fontSize: '14px', color: '#6c757d' }}>
        <p><strong>QR Code:</strong> {product.qr_code || 'Not generated'}</p>
        <p><strong>Product ID:</strong> {product.id}</p>
      </div>
    </div>
  );
};

export default ProductDetails;
