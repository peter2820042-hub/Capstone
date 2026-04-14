import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [kpis] = useState({
    balance: 0,
    dueDates: 0,
    payments: 0,
    violations: 0
  });

  const [profile] = useState({
    name: '',
    lotNumber: '',
    contact: '',
    email: '',
    memberSince: ''
  });

  const [billingInfo] = useState({
    billingPeriod: '',
    dueDate: '',
    accountNumber: ''
  });

  const [activities] = useState([]);
  const [notifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Fetch from API
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const currentDate = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="date-section">
          <span className="current-date">{currentDate}</span>
        </div>
        <div className="profile-section">
          <div className="profile-info">
            <span className="profile-name">{profile.name || 'Resident'}</span>
            <span className="profile-lot">Lot {profile.lotNumber || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {/* Balance */}
        <div className="kpi-card">
          <div className="kpi-icon balance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{formatCurrency(kpis.balance)}</span>
            <span className="kpi-label">Outstanding Balance</span>
            <span className="kpi-hint">Amount due within 30 days</span>
          </div>
        </div>

        {/* Due Dates */}
        <div className="kpi-card">
          <div className="kpi-icon due">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.dueDates}</span>
            <span className="kpi-label">Upcoming Due Dates</span>
            <span className="kpi-hint">Bills due within 30 days</span>
          </div>
        </div>

        {/* Payments */}
        <div className="kpi-card">
          <div className="kpi-icon payments">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.payments}</span>
            <span className="kpi-label">Recent Payments</span>
            <span className="kpi-hint">Payments this month</span>
          </div>
        </div>

        {/* Violations */}
        <div className="kpi-card">
          <div className="kpi-icon violations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.violations}</span>
            <span className="kpi-label">Active Violations</span>
            <span className="kpi-hint">Pending resolution</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="content-grid">
        {/* Left Column */}
        <div className="column-left">
          {/* Quick Actions Card */}
          <div className="content-card actions-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="card-body">
              <p className="action-desc">Make a payment or view your billing history</p>
              <div className="action-buttons">
                <a href="/user/payment" className="btn-pay">Pay Now</a>
                <a href="/user/billing" className="btn-view">View Bills</a>
              </div>
            </div>
          </div>

          {/* Account Info Card */}
          <div className="content-card">
            <div className="card-header">
              <h3>Account Details</h3>
            </div>
            <div className="card-body">
              <div className="account-details">
                <div className="detail-row">
                  <span className="detail-label">Account Number</span>
                  <span className="detail-value">{billingInfo.accountNumber || '---'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Billing Period</span>
                  <span className="detail-value">{billingInfo.billingPeriod || '---'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Due Date</span>
                  <span className="detail-value">{billingInfo.dueDate || '---'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{profile.email || '---'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Contact</span>
                  <span className="detail-value">{profile.contact || '---'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">{profile.memberSince || '---'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="content-card">
            <div className="card-header">
              <h3>Recent Activity</h3>
              <a href="/user/notification" className="view-link">View All</a>
            </div>
            <div className="card-body">
              {activities.length > 0 ? (
                <div className="activity-list">
                  {activities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon ${activity.type}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <div className="activity-info">
                        <span className="activity-title">{activity.title}</span>
                        <span className="activity-date">{formatDate(activity.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-message">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="column-right">
          <div className="content-card">
            <div className="card-header">
              <h3>Notifications</h3>
            </div>
            <div className="card-body">
              {notifications.length > 0 ? (
                <div className="notifications-list">
                  {notifications.map((notif, index) => (
                    <div key={index} className="notification-item">
                      <span className="notif-message">{notif.message}</span>
                      <span className="notif-date">{formatDate(notif.date)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-message">
                  <p>No notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
