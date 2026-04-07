import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard() {
  // User data - will be fetched from database
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Summary data
  const [summaryData, setSummaryData] = useState({
    outstandingBalance: 0,
    upcomingDueDates: 0,
    recentPayments: 0,
    activeViolations: 0
  });

  // Recent activity
  const [recentActivity, setRecentActivity] = useState([]);

  // TODO: Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/user/profile');
        // const data = await response.json();
        // setUserData(data);
        
        // For now, set empty data until database is connected
        setUserData(null);
        setError(null);
      } catch (err) {
        setError('Failed to fetch user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // TODO: Fetch summary data from database
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/user/summary');
        // const data = await response.json();
        // setSummaryData(data);
        
        // For now, set empty data until database is connected
        setSummaryData({
          outstandingBalance: 0,
          upcomingDueDates: 0,
          recentPayments: 0,
          activeViolations: 0
        });
      } catch (err) {
        console.error('Error fetching summary data:', err);
      }
    };

    fetchSummaryData();
  }, []);

  // TODO: Fetch recent activity from database
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/user/activity');
        // const data = await response.json();
        // setRecentActivity(data);
        
        // For now, set empty array until database is connected
        setRecentActivity([]);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
      }
    };

    fetchRecentActivity();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {userData?.name || 'Resident'}!</h1>
          <p>Here's what's happening with your account</p>
        </div>
        <div className="welcome-date">
          <span className="date">{new Date().toLocaleDateString('en-PH', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-grid">
          {/* Outstanding Balance */}
          <div className="summary-card balance">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Outstanding Balance</span>
              <span className="card-value">{formatCurrency(summaryData.outstandingBalance)}</span>
              <span className="card-hint">Due within 30 days</span>
            </div>
          </div>

          {/* Upcoming Due Dates */}
          <div className="summary-card due-dates">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Upcoming Due Dates</span>
              <span className="card-value">{summaryData.upcomingDueDates}</span>
              <span className="card-hint">Bills due soon</span>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="summary-card payments">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Recent Payments</span>
              <span className="card-value">{summaryData.recentPayments}</span>
              <span className="card-hint">This month</span>
            </div>
          </div>

          {/* Active Violations */}
          <div className="summary-card violations">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Active Violations</span>
              <span className="card-value">{summaryData.activeViolations}</span>
              <span className="card-hint">Pending resolution</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <a href="/user/payment" className="action-card">
            <div className="action-icon pay">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <span className="action-label">Pay Bills</span>
          </a>

          <a href="/user/billing" className="action-card">
            <div className="action-icon billing">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <span className="action-label">View Bills</span>
          </a>

          <a href="/user/profile" className="action-card">
            <div className="action-icon profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="action-label">My Profile</span>
          </a>

          <a href="/user/violation" className="action-card">
            <div className="action-icon violation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span className="action-label">My Violations</span>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <a href="/user/notification" className="view-all">View All</a>
        </div>
        <div className="activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'payment' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  )}
                  {activity.type === 'billing' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  )}
                  {activity.type === 'violation' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </svg>
                  )}
                </div>
                <div className="activity-content">
                  <span className="activity-title">{activity.title}</span>
                  <span className="activity-description">{activity.description}</span>
                </div>
                <div className="activity-time">
                  <span className="time">{formatDate(activity.timestamp)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-activity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p>No recent activity</p>
              <span className="hint">Your recent transactions and updates will appear here</span>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Due Dates */}
      <div className="due-dates-section">
        <div className="section-header">
          <h2>Upcoming Due Dates</h2>
          <a href="/user/billing" className="view-all">View All Bills</a>
        </div>
        <div className="due-dates-list">
          {summaryData.upcomingDueDates > 0 ? (
            <div className="due-date-item">
              <div className="due-date-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="due-date-content">
                <span className="due-date-title">Bills Due Soon</span>
                <span className="due-date-hint">You have {summaryData.upcomingDueDates} bill(s) due within the next 30 days</span>
              </div>
              <a href="/user/payment" className="pay-now-btn">Pay Now</a>
            </div>
          ) : (
            <div className="no-due-dates">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p>All caught up!</p>
              <span className="hint">You have no upcoming due dates</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
