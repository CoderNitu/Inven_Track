import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Report generation form state
  const [reportForm, setReportForm] = useState({
    report_type: 'inventory_summary',
    format: 'pdf',
    parameters: {},
    name: ''
  });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [summaryRes, reportsRes] = await Promise.all([
        reportsAPI.getSummary(),
        reportsAPI.getRecentReports()
      ]);

      setSummary(summaryRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const response = await reportsAPI.generateReport(reportForm);
      alert('Report generated successfully!');
      await loadReportData();
      
      // Reset form
      setReportForm({
        report_type: 'inventory_summary',
        format: 'pdf',
        parameters: {},
        name: ''
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Check console for details.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = async (reportId, fileName) => {
    try {
      const response = await reportsAPI.downloadReport(reportId);
      
      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `report_${reportId}.${response.headers['content-type'] === 'application/pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report. Check console for details.');
    }
  };

  const cleanupOldReports = async () => {
    if (window.confirm('Are you sure you want to clean up old reports? This action cannot be undone.')) {
      setLoading(true);
      try {
        const response = await reportsAPI.cleanupOldReports(30);
        alert(`Cleaned up ${response.data.deleted_count} old reports`);
        await loadReportData();
      } catch (error) {
        console.error('Failed to cleanup reports:', error);
        alert('Failed to cleanup reports. Check console for details.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormChange = (field, value) => {
    setReportForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && !summary) {
    return <div className="loading">Loading Reports...</div>;
  }

  return (
    <div className="reports">
      <div className="header">
        <h2>📊 Reports & Exports</h2>
        <div className="header-actions">
          <button 
            className="btn btn-warning" 
            onClick={cleanupOldReports}
            disabled={loading}
          >
            {loading ? 'Cleaning...' : 'Cleanup Old Reports'}
          </button>
        </div>
      </div>

      {/* Report Summary Cards */}
      {summary && (
        <div className="report-summary">
          <div className="summary-card">
            <h3>📈 Report Overview</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Total Reports</span>
                <span className="value">{summary.total_reports}</span>
              </div>
              <div className="summary-item">
                <span className="label">Completed</span>
                <span className="value success">{summary.completed_reports}</span>
              </div>
              <div className="summary-item">
                <span className="label">Failed</span>
                <span className="value danger">{summary.failed_reports}</span>
              </div>
              <div className="summary-item">
                <span className="label">Pending</span>
                <span className="value warning">{summary.pending_reports}</span>
              </div>
              <div className="summary-item">
                <span className="label">Total Size</span>
                <span className="value">{summary.total_file_size_mb} MB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          ➕ Generate Report
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📋 Recent Reports
        </button>
        <button 
          className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          📝 Templates
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="info-section">
              <h3>📊 Available Report Types</h3>
              <div className="report-types">
                <div className="report-type">
                  <h4>📦 Inventory Summary</h4>
                  <p>Complete inventory status with stock levels, reorder points, and supplier information.</p>
                  <span className="formats">Formats: PDF, Excel</span>
                </div>
                
                <div className="report-type">
                  <h4>📈 Stock Transactions</h4>
                  <p>Detailed transaction history with dates, quantities, and reasons.</p>
                  <span className="formats">Formats: PDF</span>
                </div>
                
                <div className="report-type">
                  <h4>🔮 Demand Forecast</h4>
                  <p>ML-powered demand predictions with confidence levels.</p>
                  <span className="formats">Formats: Excel</span>
                </div>
                
                <div className="report-type">
                  <h4>📋 Purchase Orders</h4>
                  <p>Purchase order status and supplier performance metrics.</p>
                  <span className="formats">Formats: PDF, Excel</span>
                </div>
              </div>
              
              <h3>📁 Report Storage</h3>
              <p>Reports are automatically saved and can be downloaded anytime. Old reports are automatically cleaned up after 30 days.</p>
              
              <h3>⚙️ Customization</h3>
              <p>Create custom report templates with specific parameters and formatting preferences.</p>
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="generate-tab">
            <div className="report-form">
              <h3>Generate New Report</h3>
              
              <div className="form-group">
                <label>Report Type:</label>
                <select 
                  value={reportForm.report_type}
                  onChange={(e) => handleFormChange('report_type', e.target.value)}
                >
                  <option value="inventory_summary">Inventory Summary</option>
                  <option value="stock_transactions">Stock Transactions</option>
                  <option value="demand_forecast">Demand Forecast</option>
                  <option value="purchase_orders">Purchase Orders</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Format:</label>
                <select 
                  value={reportForm.format}
                  onChange={(e) => handleFormChange('format', e.target.value)}
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Report Name (Optional):</label>
                <input 
                  type="text"
                  value={reportForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Enter custom report name"
                />
              </div>
              
              {/* Only show Parameters section if there are parameters for the selected report type */}
              {(reportForm.report_type === 'stock_transactions') && (
                <div className="form-group">
                  <label>Parameters:</label>
                  <div className="parameters">
                    <div className="parameter">
                      <label>Days Back:</label>
                      <input 
                        type="number"
                        value={reportForm.parameters.days || 30}
                        onChange={(e) => handleFormChange('parameters', { ...reportForm.parameters, days: parseInt(e.target.value) })}
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                className="btn btn-primary"
                onClick={generateReport}
                disabled={generatingReport}
              >
                {generatingReport ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <h3>Recent Reports</h3>
            {reports.length === 0 ? (
              <div className="no-data">No reports found</div>
            ) : (
              <div className="reports-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Format</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Size</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.name}</td>
                        <td>
                          <span className={`report-badge ${report.report_type}`}>
                            {report.report_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={`format-badge ${report.format}`}>
                            {report.format.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${report.status}`}>
                            {report.status}
                          </span>
                        </td>
                        <td>{new Date(report.created_at).toLocaleString()}</td>
                        <td>{report.file_size_mb ? `${report.file_size_mb} MB` : '-'}</td>
                        <td>
                          {report.status === 'completed' && (
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => downloadReport(report.id, report.name)}
                            >
                              Download
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="templates-tab">
            <h3>Report Templates</h3>
            <div className="info-section">
              <p>Report templates allow you to save custom report configurations for quick generation.</p>
              <p>Coming soon: Create and manage custom report templates with specific parameters and formatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
