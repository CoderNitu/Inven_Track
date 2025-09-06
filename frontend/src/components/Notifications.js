import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';

const Notifications = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [emailNotifications, setEmailNotifications] = useState([]);
  const [smsNotifications, setSmsNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    critical_stockout_alerts: true,
    reorder_point_alerts: true,
    purchase_order_updates: true,
    daily_summary: false,
    phone_number: ''
  });

  useEffect(() => {
    loadNotificationData();
  }, []);

  const loadNotificationData = async () => {
    setLoading(true);
    try {
      const [summaryRes, emailsRes, smsRes] = await Promise.all([
        notificationsAPI.getSummary(),
        notificationsAPI.getRecentEmails(),
        notificationsAPI.getRecentSMS()
      ]);

      setSummary(summaryRes.data);
      setEmailNotifications(emailsRes.data);
      setSmsNotifications(smsRes.data);
    } catch (error) {
      console.error('Failed to load notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testEmailNotification = async () => {
    setLoading(true);
    try {
      await notificationsAPI.testEmail();
      alert('Test email sent successfully! Check your console for the email.');
      await loadNotificationData();
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert('Failed to send test email. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const testSMSNotification = async () => {
    setLoading(true);
    try {
      await notificationsAPI.testSMS();
      alert('Test SMS sent successfully! Check console for SMS details.');
      await loadNotificationData();
    } catch (error) {
      console.error('Failed to send test SMS:', error);
      alert('Failed to send test SMS. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const checkAlerts = async () => {
    setLoading(true);
    try {
      await notificationsAPI.checkAlerts();
      alert('Alert checking completed!');
      await loadNotificationData();
    } catch (error) {
      console.error('Failed to check alerts:', error);
      alert('Failed to check alerts. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Here you would typically save to backend
      // For now, we'll just show a success message
      alert('Settings saved successfully!');
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) {
    return <div className="loading">Loading Notifications...</div>;
  }

  return (
    <div className="notifications">
      <div className="header">
        <h2>🔔 Notifications & Alerts</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={checkAlerts}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Alerts'}
          </button>
          <button 
            className="btn btn-success" 
            onClick={testEmailNotification}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Test Email'}
          </button>
          <button 
            className="btn btn-info" 
            onClick={testSMSNotification}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Test SMS'}
          </button>
        </div>
      </div>

      {/* Notification Summary Cards */}
      {summary && (
        <div className="notification-summary">
          <div className="summary-card">
            <h3>📊 Notification Overview</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Total Emails</span>
                <span className="value">{summary.total_emails}</span>
              </div>
              <div className="summary-item">
                <span className="label">Total SMS</span>
                <span className="value">{summary.total_sms}</span>
              </div>
              <div className="summary-item">
                <span className="label">Pending Emails</span>
                <span className="value warning">{summary.pending_emails}</span>
              </div>
              <div className="summary-item">
                <span className="label">Pending SMS</span>
                <span className="value warning">{summary.pending_sms}</span>
              </div>
              <div className="summary-item">
                <span className="label">Failed Emails</span>
                <span className="value danger">{summary.failed_emails}</span>
              </div>
              <div className="summary-item">
                <span className="label">Failed SMS</span>
                <span className="value danger">{summary.failed_sms}</span>
              </div>
              <div className="summary-item">
                <span className="label">Critical Alerts Today</span>
                <span className="value danger">{summary.critical_alerts_today}</span>
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
          className={`tab-btn ${activeTab === 'emails' ? 'active' : ''}`}
          onClick={() => setActiveTab('emails')}
        >
          📧 Email Notifications
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sms' ? 'active' : ''}`}
          onClick={() => setActiveTab('sms')}
        >
          📱 SMS Notifications
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="info-section">
              <h3>🚨 Critical Stockout Alerts</h3>
              <p>Automated alerts are sent when products are predicted to run out of stock within 7 days.</p>
              
              <h3>⚠️ Reorder Point Alerts</h3>
              <p>Notifications are sent when product stock falls below the defined reorder point.</p>
              
              <h3>📋 Purchase Order Updates</h3>
              <p>Status updates are sent when purchase orders change status (sent, confirmed, shipped, received).</p>
              
              <h3>📧 Email Configuration</h3>
              <p>For development, emails are sent to the console. Configure SMTP settings in production.</p>
              
              <h3>📱 SMS Configuration</h3>
              <p>SMS notifications are simulated. Integrate with Twilio or AWS SNS for production.</p>
            </div>
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="emails-tab">
            <h3>Recent Email Notifications</h3>
            {emailNotifications.length === 0 ? (
              <div className="no-data">No email notifications found</div>
            ) : (
              <div className="notifications-table">
                <table>
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailNotifications.map((notification) => (
                      <tr key={notification.id}>
                        <td>{notification.recipient.email}</td>
                        <td>
                          <span className={`notification-badge ${notification.notification_type}`}>
                            {notification.notification_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{notification.subject}</td>
                        <td>
                          <span className={`status-badge ${notification.status}`}>
                            {notification.status}
                          </span>
                        </td>
                        <td>{new Date(notification.created_at).toLocaleString()}</td>
                        <td>
                          {notification.sent_at 
                            ? new Date(notification.sent_at).toLocaleString()
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="sms-tab">
            <h3>Recent SMS Notifications</h3>
            {smsNotifications.length === 0 ? (
              <div className="no-data">No SMS notifications found</div>
            ) : (
              <div className="notifications-table">
                <table>
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Type</th>
                      <th>Phone</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {smsNotifications.map((notification) => (
                      <tr key={notification.id}>
                        <td>{notification.recipient.username}</td>
                        <td>
                          <span className={`notification-badge ${notification.notification_type}`}>
                            {notification.notification_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{notification.phone_number}</td>
                        <td className="message-cell">{notification.message}</td>
                        <td>
                          <span className={`status-badge ${notification.status}`}>
                            {notification.status}
                          </span>
                        </td>
                        <td>{new Date(notification.created_at).toLocaleString()}</td>
                        <td>
                          {notification.sent_at 
                            ? new Date(notification.sent_at).toLocaleString()
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h3>Notification Settings</h3>
            <div className="settings-form">
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.email_notifications}
                    onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
                  />
                  Email Notifications
                </label>
              </div>
              
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.sms_notifications}
                    onChange={(e) => setSettings({...settings, sms_notifications: e.target.checked})}
                  />
                  SMS Notifications
                </label>
              </div>
              
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.critical_stockout_alerts}
                    onChange={(e) => setSettings({...settings, critical_stockout_alerts: e.target.checked})}
                  />
                  Critical Stockout Alerts
                </label>
              </div>
              
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.reorder_point_alerts}
                    onChange={(e) => setSettings({...settings, reorder_point_alerts: e.target.checked})}
                  />
                  Reorder Point Alerts
                </label>
              </div>
              
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.purchase_order_updates}
                    onChange={(e) => setSettings({...settings, purchase_order_updates: e.target.checked})}
                  />
                  Purchase Order Updates
                </label>
              </div>
              
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={settings.daily_summary}
                    onChange={(e) => setSettings({...settings, daily_summary: e.target.checked})}
                  />
                  Daily Summary
                </label>
              </div>
              
              <div className="form-group">
                <label>Phone Number (for SMS):</label>
                <input 
                  type="tel"
                  value={settings.phone_number || ''}
                  onChange={(e) => setSettings({...settings, phone_number: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
              
              <div className="settings-info">
                <h4>Current Configuration Status</h4>
                <p><strong>Email:</strong> {settings.email_notifications ? '✅ Enabled' : '❌ Disabled'}</p>
                <p><strong>SMS:</strong> {settings.sms_notifications ? '✅ Enabled' : '❌ Disabled'}</p>
                <p><strong>Phone:</strong> {settings.phone_number || 'Not set'}</p>
                
                <h4>Production Setup</h4>
                <p>Your email is configured for: <strong>nitualam07@gmail.com</strong></p>
                <p>Make sure you have:</p>
                <ul>
                  <li>✅ Gmail App Password enabled</li>
                  <li>✅ 2-Factor Authentication enabled</li>
                  <li>✅ Less secure app access disabled</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;


