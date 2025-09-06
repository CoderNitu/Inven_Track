import React, { useState } from 'react';

const ManualInput = ({ onScan, onClose }) => {
  const [inputType, setInputType] = useState('barcode'); // 'barcode' or 'qr'
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      setError('Please enter a valid code');
      return;
    }

    // Basic validation
    if (inputType === 'barcode') {
      // Barcode should be numeric and at least 8 digits
      if (!/^\d{8,}$/.test(inputValue.trim())) {
        setError('Barcode should be at least 8 digits');
        return;
      }
    } else {
      // QR code can be any text but should not be empty
      if (inputValue.trim().length < 3) {
        setError('QR code should be at least 3 characters');
        return;
      }
    }

    setError('');
    onScan(inputValue.trim());
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="manual-input-container">
      <div className="scanner-header">
        <h3>Manual Input</h3>
        <div className="scanner-controls">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <div className="input-type-selector" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="radio"
              name="inputType"
              value="barcode"
              checked={inputType === 'barcode'}
              onChange={(e) => setInputType(e.target.value)}
            />
            Barcode
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="radio"
              name="inputType"
              value="qr"
              checked={inputType === 'qr'}
              onChange={(e) => setInputType(e.target.value)}
            />
            QR Code
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="codeInput" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Enter {inputType === 'barcode' ? 'Barcode' : 'QR Code'}:
          </label>
          <input
            id="codeInput"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="form-control"
            placeholder={inputType === 'barcode' ? 'Enter barcode (e.g., 123456789012)' : 'Enter QR code data'}
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              margin: '0 auto',
              padding: '12px',
              fontSize: '16px'
            }}
            autoFocus
          />
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <div className="scanner-controls">
          <button type="submit" className="btn btn-primary">
            Lookup Product
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setInputValue('')}>
            Clear
          </button>
        </div>
      </form>

      <div className="manual-instructions" style={{ marginTop: '30px', textAlign: 'center', color: '#6c757d' }}>
        <h4>Instructions:</h4>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li><strong>Barcode:</strong> Enter the numeric barcode from the product label</li>
          <li><strong>QR Code:</strong> Enter the QR code data or scan a QR code image</li>
          <li>Click "Lookup Product" to search for the product in the database</li>
        </ul>
      </div>
    </div>
  );
};

export default ManualInput;
