import React, { useState } from 'react';
import QRScanner from './QRScanner';
import BarcodeScanner from './BarcodeScanner';
import TestQRCode from './TestQRCode';
import ManualInput from './ManualInput';
import ProductDetails from './ProductDetails';
import { productsAPI } from '../services/api';

const ScannerModal = ({ isOpen, onClose, onProductFound, onViewDetails, onCheckInventory, onEditProduct }) => {
  const [scanType, setScanType] = useState('qr'); // 'qr', 'barcode', 'test', 'manual', or 'details'
  const [scannedCode, setScannedCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundProduct, setFoundProduct] = useState(null);
  const [currency, setCurrency] = useState('INR');

  const handleScan = async (code) => {
    setScannedCode(code);
    setSearching(true);
    
    try {
      const response = await productsAPI.lookupByCode(code);
      setFoundProduct(response.data);
      setScanType('details');
      if (onProductFound) {
        onProductFound(response.data);
      }
    } catch (error) {
      console.error('Error looking up product:', error);
      alert('Product not found for this code');
    } finally {
      setSearching(false);
    }
  };

  const handleClose = () => {
    setFoundProduct(null);
    setScannedCode('');
    setScanType('qr');
    onClose();
  };

  const handleViewDetails = (product) => {
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      alert(`Viewing details for ${product.name}`);
    }
  };

  const handleCheckInventory = (product) => {
    if (onCheckInventory) {
      onCheckInventory(product);
    } else {
      alert(`Checking inventory for ${product.name}`);
    }
  };

  const handleEditProduct = (product) => {
    if (onEditProduct) {
      onEditProduct(product);
    } else {
      alert(`Editing product ${product.name}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content scanner-modal">
        <div className="modal-header">
          <h2>Scan Product</h2>
          <button className="close" onClick={handleClose}>&times;</button>
        </div>
        
        <div className="scanner-tabs">
          <button 
            className={`tab ${scanType === 'qr' ? 'active' : ''}`}
            onClick={() => setScanType('qr')}
          >
            QR Scanner
          </button>
          <button 
            className={`tab ${scanType === 'barcode' ? 'active' : ''}`}
            onClick={() => setScanType('barcode')}
          >
            Barcode Scanner
          </button>
          <button 
            className={`tab ${scanType === 'manual' ? 'active' : ''}`}
            onClick={() => setScanType('manual')}
          >
            Manual Input
          </button>
          <button 
            className={`tab ${scanType === 'test' ? 'active' : ''}`}
            onClick={() => setScanType('test')}
          >
            Test QR
          </button>
        </div>

        <div className="scanner-content">
          {scanType === 'qr' && (
            <QRScanner onScan={handleScan} onClose={onClose} />
          )}
          {scanType === 'barcode' && (
            <BarcodeScanner onScan={handleScan} onClose={onClose} />
          )}
          {scanType === 'manual' && (
            <ManualInput onScan={handleScan} onClose={onClose} />
          )}
          {scanType === 'test' && (
            <TestQRCode />
          )}
          {scanType === 'details' && foundProduct && (
            <ProductDetails 
              product={foundProduct} 
              onClose={handleClose} 
              currency={currency}
              onViewDetails={handleViewDetails}
              onCheckInventory={handleCheckInventory}
              onEditProduct={handleEditProduct}
            />
          )}
        </div>

        {searching && (
          <div className="searching-overlay">
            <div className="loading">Searching for product...</div>
          </div>
        )}

        {scannedCode && (
          <div className="scanned-code">
            <p><strong>Scanned Code:</strong> {scannedCode}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerModal;
