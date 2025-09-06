import axios from 'axios';

// Use relative base path so CRA proxy forwards to Django in development
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Suppliers API
export const suppliersAPI = {
  getAll: () => api.get('/suppliers/'),
  getById: (id) => api.get(`/suppliers/${id}/`),
  create: (data) => api.post('/suppliers/', data),
  update: (id, data) => api.put(`/suppliers/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/suppliers/${id}/`, data),
  delete: (id) => api.delete(`/suppliers/${id}/`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
  getById: (id) => api.get(`/categories/${id}/`),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.put(`/categories/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
};

export const locationsAPI = {
  getAll: () => api.get('/locations/'),
  getById: (id) => api.get(`/locations/${id}/`),
  create: (data) => api.post('/locations/', data),
  update: (id, data) => api.put(`/locations/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/locations/${id}/`, data),
  delete: (id) => api.delete(`/locations/${id}/`),
};

  // Analytics API
  export const analyticsAPI = {
    // Demand Predictions
    getDemandPredictions: () => api.get('/analytics/demand-predictions/'),
    generateDemandPredictions: () => api.post('/analytics/demand-predictions/generate_predictions/'),
    getProductPredictions: (productId) => api.get(`/analytics/demand-predictions/product_predictions/?product_id=${productId}`),
    
    // Purchase Orders
    getPurchaseOrders: () => api.get('/analytics/purchase-orders/'),
    createPurchaseOrder: (data) => api.post('/analytics/purchase-orders/', data),
    updatePurchaseOrder: (id, data) => api.put(`/analytics/purchase-orders/${id}/`, data),
    generateAutomatedOrders: () => api.post('/analytics/purchase-orders/generate_automated_orders/'),
    getPendingOrders: () => api.get('/analytics/purchase-orders/pending_orders/'),
    updateOrderStatus: (id, status) => api.post(`/analytics/purchase-orders/${id}/update_status/`, { status }),
    
    // Stockout Predictions
    getStockoutPredictions: () => api.get('/analytics/stockout-predictions/'),
    generateStockoutPredictions: () => api.post('/analytics/stockout-predictions/generate_predictions/'),
    getCriticalRisks: () => api.get('/analytics/stockout-predictions/critical_risks/'),
    
    // Seasonal Trends
    getSeasonalTrends: () => api.get('/analytics/seasonal-trends/'),
    analyzeSeasonalTrends: () => api.post('/analytics/seasonal-trends/analyze_trends/'),
    
    // Analytics Dashboard
    getDashboardSummary: () => api.get('/analytics/analytics/dashboard_summary/'),
    getDemandForecast: (days = 30) => api.get(`/analytics/analytics/demand_forecast/?days=${days}`),
  };

  // Notifications API
  export const notificationsAPI = {
    // Notification Settings
    getNotificationSettings: () => api.get('/notifications/notification-settings/'),
    updateNotificationSettings: (id, data) => api.put(`/notifications/notification-settings/${id}/`, data),
    
    // Email Notifications
    getEmailNotifications: () => api.get('/notifications/email-notifications/'),
    getRecentEmails: (days = 7) => api.get(`/notifications/email-notifications/recent/?days=${days}`),
    getFailedEmails: () => api.get('/notifications/email-notifications/failed/'),
    
    // SMS Notifications
    getSMSNotifications: () => api.get('/notifications/sms-notifications/'),
    getRecentSMS: (days = 7) => api.get(`/notifications/sms-notifications/recent/?days=${days}`),
    getFailedSMS: () => api.get('/notifications/sms-notifications/failed/'),
    
    // Alert Rules
    getAlertRules: () => api.get('/notifications/alert-rules/'),
    createAlertRule: (data) => api.post('/notifications/alert-rules/', data),
    updateAlertRule: (id, data) => api.put(`/notifications/alert-rules/${id}/`, data),
    deleteAlertRule: (id) => api.delete(`/notifications/alert-rules/${id}/`),
    
    // Notification Management
    getSummary: () => api.get('/notifications/notifications/summary/'),
    checkAlerts: () => api.post('/notifications/notification-settings/check_alerts/'),
    testEmail: () => api.post('/notifications/notifications/test_email/'),
    testSMS: () => api.post('/notifications/notifications/test_sms/'),
  };

  // Reports API
  export const reportsAPI = {
    // Reports
    getReports: () => api.get('/reports/reports/'),
    getReport: (id) => api.get(`/reports/reports/${id}/`),
    generateReport: (data) => api.post('/reports/reports/generate/', data),
    downloadReport: (id) => api.get(`/reports/reports/${id}/download/`),
    getRecentReports: (days = 7) => api.get(`/reports/reports/recent/?days=${days}`),
    getFailedReports: () => api.get('/reports/reports/failed/'),
    
    // Report Templates
    getReportTemplates: () => api.get('/reports/report-templates/'),
    createReportTemplate: (data) => api.post('/reports/report-templates/', data),
    updateReportTemplate: (id, data) => api.put(`/reports/report-templates/${id}/`, data),
    deleteReportTemplate: (id) => api.delete(`/reports/report-templates/${id}/`),
    
    // Report Management
    getSummary: () => api.get('/reports/report-management/summary/'),
    cleanupOldReports: (days = 30) => api.post('/reports/report-management/cleanup_old_reports/', { days }),
  };

// Products API
export const productsAPI = {
  getAll: () => api.get('/products/'),
  getById: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/products/${id}/`, data),
  delete: (id) => api.delete(`/products/${id}/`),
  getInventory: (id) => api.get(`/products/${id}/inventory/`),
  createTransaction: (id, data) => api.post(`/products/${id}/transact/`, data),
  lookupByCode: (code) => api.get(`/products/lookup_by_code/?code=${encodeURIComponent(code)}`),
  getQRCode: (id) => api.get(`/products/${id}/qr_code/`),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/inventory/'),
  getById: (id) => api.get(`/inventory/${id}/`),
  update: (id, data) => api.patch(`/inventory/${id}/`, data),
};

// Stock Transactions API
export const transactionsAPI = {
  getAll: () => api.get('/transactions/'),
  getById: (id) => api.get(`/transactions/${id}/`),
};

export default api;
