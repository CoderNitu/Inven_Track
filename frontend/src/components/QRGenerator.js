import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const QRGenerator = ({ product }) => {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      generateQRCode();
    }
  }, [product]);

  const generateQRCode = async () => {
    if (!product) return;
    
    setLoading(true);
    try {
      const qrData = product.qr_code || `https://smart-inventory.com/product/${product.sku}`;
      const qrImage = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCode(qrImage);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-${product.sku}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!product) {
    return <div>No product selected</div>;
  }

  return (
    <div className="qr-generator">
      <h3>QR Code for {product.name}</h3>
      <div className="qr-info">
        <p><strong>SKU:</strong> {product.sku}</p>
        <p><strong>Barcode:</strong> {product.barcode || 'Not set'}</p>
        <p><strong>QR Data:</strong> {product.qr_code || `https://smart-inventory.com/product/${product.sku}`}</p>
      </div>
      
      <div className="qr-display">
        {loading ? (
          <div className="loading">Generating QR Code...</div>
        ) : qrCode ? (
          <div className="qr-code-container">
            <img src={qrCode} alt="QR Code" className="qr-code-image" />
            <button className="btn btn-primary" onClick={downloadQRCode}>
              Download QR Code
            </button>
          </div>
        ) : (
          <div className="error">Failed to generate QR code</div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;
