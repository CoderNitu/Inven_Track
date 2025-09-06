import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

const BarcodeScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const scannerRef = useRef(null);

  // Check camera permissions on component mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: 'camera' });
        setCameraPermission(permission.state);
        
        permission.onchange = () => {
          setCameraPermission(permission.state);
        };
      }
    } catch (error) {
      console.log('Permission API not supported');
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      setError(null);
      startScanning();
    } catch (error) {
      console.error('Camera permission denied:', error);
      setError('Camera permission denied. Please allow camera access in your browser settings.');
      setCameraPermission('denied');
    }
  };

  const startScanning = () => {
    setScanning(true);
    setError(null);
  };

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "barcode-reader",
      { 
        fps: 10, 
        qrbox: { width: 300, height: 100 },
        aspectRatio: 3.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true
      },
      false
    );

    scanner.render((decodedText, decodedResult) => {
      console.log('Barcode detected:', decodedText);
      onScan(decodedText);
      scanner.clear();
      setScanning(false);
    }, (error) => {
      if (error.name === 'NotFoundError') {
        setError('Camera not found. Please check if your device has a camera and try again.');
      } else if (error.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access.');
        setCameraPermission('denied');
      } else {
        console.warn('Barcode scan error:', error);
      }
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [scanning, onScan]);

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setScanning(false);
  };

  return (
    <div className="barcode-scanner-container">
      <div className="scanner-header">
        <h3>Barcode Scanner</h3>
        <div className="scanner-controls">
          {!scanning ? (
            <button className="btn btn-primary" onClick={requestCameraPermission}>
              Start Scanner
            </button>
          ) : (
            <button className="btn btn-danger" onClick={stopScanning}>
              Stop Scanner
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
          {cameraPermission === 'denied' && (
            <div style={{ marginTop: '10px' }}>
              <button className="btn btn-warning btn-sm" onClick={requestCameraPermission}>
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
      
      <div id="barcode-reader" className="barcode-reader"></div>
      
      {!scanning && !error && (
        <div className="scanner-instructions">
          <p>Click "Start Scanner" to begin scanning barcodes</p>
          <p>Point your camera at a barcode to scan it</p>
          <p><strong>Camera Permission Status:</strong> {cameraPermission}</p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
