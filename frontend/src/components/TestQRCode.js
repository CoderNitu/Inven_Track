import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const TestQRCode = () => {
  const [qrCode, setQrCode] = useState('');
  const [testData, setTestData] = useState('PROD123');

  useEffect(() => {
    generateTestQR();
  }, [testData]);

  const generateTestQR = async () => {
    try {
      const qrImage = await QRCode.toDataURL(testData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCode(qrImage);
    } catch (error) {
      console.error('Error generating test QR code:', error);
    }
  };

  return (
    <div className="test-qr-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h3>Test QR Code for Scanner</h3>
      <p>Use this QR code to test the scanner functionality:</p>
      
      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label>QR Code Data:</label>
        <input
          type="text"
          value={testData}
          onChange={(e) => setTestData(e.target.value)}
          className="form-control"
          style={{ width: '200px', margin: '0 auto' }}
        />
      </div>
      
      {qrCode && (
        <div>
          <img src={qrCode} alt="Test QR Code" style={{ border: '2px solid #ddd', padding: '10px' }} />
          <p><strong>Data:</strong> {testData}</p>
          <p><small>Scan this QR code with the scanner to test functionality</small></p>
        </div>
      )}
    </div>
  );
};

export default TestQRCode;
