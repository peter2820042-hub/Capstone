import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  // KPI data
  const [kpis, setKpis] = useState({
    totalResidents: 0,
    totalViolations: 0,
    totalBills: 0,
    totalPayments: 0,
    pendingPayments: 0,
    overdueBills: 0
  });

  // Revenue data (empty initially)
  const [revenueData, setRevenueData] = useState([]);

  // Collection status (empty initially)
  const [collectionStatus, setCollectionStatus] = useState({
    paid: 0,
    pending: 0,
    overdue: 0
  });

  // Activity feed (empty initially)
  const [activityFeed, setActivityFeed] = useState([]);

  // Recent transactions (empty initially)
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Upcoming due dates (empty initially)
  const [upcomingDueDates, setUpcomingDueDates] = useState([]);

  // Notifications (empty initially)
  const [notifications, setNotifications] = useState([]);

  // Chart filter state
  const [chartFilter, setChartFilter] = useState('year');

  // Current date for display
  const currentDate = new Date().toLocaleDateString('en-PH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard-stats');
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await response.json();
        setKpis({
          totalResidents: data.totalResidents,
          totalViolations: data.totalViolations,
          totalBills: data.totalBills,
          pendingPayments: data.pendingPayments,
          approvedPayments: data.totalPayments,
          overdueBills: data.overdueBills
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Get max revenue for chart scaling
  const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(d => d.revenue)) : 0;

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'payment':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case 'violation':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'resident':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'status':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  // Get activity color based on type
  const getActivityColor = (type) => {
    switch (type) {
      case 'payment':
        return 'activity-payment';
      case 'violation':
        return 'activity-violation';
      case 'resident':
        return 'activity-resident';
      case 'status':
        return 'activity-status';
      default:
        return '';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Date Display */}
      <div className="current-date">
        <span>{currentDate}</span>
      </div>

      {/* KPI Cards Section */}
      <div className="kpi-section">
        <div className="kpi-card">
          <div className="kpi-icon residents">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.totalResidents}</span>
            <span className="kpi-label">Total Residents</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon lots">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.totalViolations}</span>
            <span className="kpi-label">Total Violations</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon dues">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.totalBills}</span>
            <span className="kpi-label">Total Bills</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon delinquencies">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.pendingPayments}</span>
            <span className="kpi-label">Pending Payments</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon violations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.overdueBills}</span>
            <span className="kpi-label">Overdue Bills</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon occupancy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.totalPayments}</span>
            <span className="kpi-label">Approved Payments</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Revenue Area Chart */}
        <div className="chart-card revenue-chart">
          <div className="chart-header">
            <h3>Revenue Trends</h3>
            <div className="chart-filter">
              <select value={chartFilter} onChange={(e) => setChartFilter(e.target.value)}>
                <option value="year">This Year</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </div>
          <div className="chart-content">
            {revenueData.length > 0 ? (
              <div className="area-chart">
                <svg viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0 ${200 - (revenueData[0].revenue / maxRevenue) * 180} ${revenueData.map((d, i) => 
                      `L ${(i / (revenueData.length - 1)) * 400} ${200 - (d.revenue / maxRevenue) * 180}`
                    ).join(' ')} L 400 200 L 0 200 Z`}
                    fill="url(#revenueGradient)"
                  />
                  <path
                    d={`M 0 ${200 - (revenueData[0].revenue / maxRevenue) * 180} ${revenueData.map((d, i) => 
                      `L ${(i / (revenueData.length - 1)) * 400} ${200 - (d.revenue / maxRevenue) * 180}`
                    ).join(' ')}`}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  {revenueData.map((d, i) => (
                    <circle
                      key={i}
                      cx={(i / (revenueData.length - 1)) * 400}
                      cy={200 - (d.revenue / maxRevenue) * 180}
                      r="4"
                      fill="#3b82f6"
                    />
                  ))}
                </svg>
                <div className="chart-labels">
                  {revenueData.map((d, i) => (
                    <span key={i}>{d.month}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="chart-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                </svg>
                <p>No revenue data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Collection Status Bars */}
        <div className="chart-card collection-status">
          <div className="chart-header">
            <h3>Collection Status</h3>
          </div>
          <div className="chart-content">
            <div className="status-bars">
              <div className="status-bar-item">
                <div className="status-bar-label">
                  <span>Paid</span>
                  <span className="status-percentage">{collectionStatus.paid}%</span>
                </div>
                <div className="status-bar-track">
                  <div 
                    className="status-bar-fill paid" 
                    style={{ width: `${collectionStatus.paid}%` }}
                  ></div>
                </div>
              </div>
              <div className="status-bar-item">
                <div className="status-bar-label">
                  <span>Pending</span>
                  <span className="status-percentage">{collectionStatus.pending}%</span>
                </div>
                <div className="status-bar-track">
                  <div 
                    className="status-bar-fill pending" 
                    style={{ width: `${collectionStatus.pending}%` }}
                  ></div>
                </div>
              </div>
              <div className="status-bar-item">
                <div className="status-bar-label">
                  <span>Overdue</span>
                  <span className="status-percentage">{collectionStatus.overdue}%</span>
                </div>
                <div className="status-bar-track">
                  <div 
                    className="status-bar-fill overdue" 
                    style={{ width: `${collectionStatus.overdue}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom">
        {/* Live Activity Feed */}
        <div className="activity-feed-card">
          <div className="card-header">
            <h3>Live Activity Feed</h3>
          </div>
          <div className="activity-list">
            {activityFeed.length > 0 ? (
              activityFeed.map((activity) => (
                <div key={activity.id} className={`activity-item ${getActivityColor(activity.type)}`}>
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <p className="activity-message">{activity.message}</p>
                    {activity.amount && <span className="activity-amount">{activity.amount}</span>}
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="recent-transactions-card">
          <div className="card-header">
            <h3>Recent Transactions</h3>
          </div>
          <div className="transactions-list">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="transaction-lot">{transaction.lot}</span>
                    <span className="transaction-resident">{transaction.resident}</span>
                  </div>
                  <div className="transaction-details">
                    <span className="transaction-amount">₱{transaction.amount.toLocaleString()}</span>
                    <span className={`transaction-status ${transaction.status}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Due Dates */}
        <div className="upcoming-dates-card">
          <div className="card-header">
            <h3>Upcoming Due Dates</h3>
          </div>
          <div className="due-dates-list">
            {upcomingDueDates.length > 0 ? (
              upcomingDueDates.map((due) => (
                <div key={due.id} className="due-date-item">
                  <div className="due-date-info">
                    <span className="due-lot">{due.lot}</span>
                    <span className="due-resident">{due.resident}</span>
                  </div>
                  <div className="due-date-details">
                    <span className="due-amount">₱{due.amount.toLocaleString()}</span>
                    <span className={`due-days ${due.daysLeft <= 7 ? 'urgent' : ''}`}>
                      {due.daysLeft} days left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>No upcoming due dates</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="notifications-card">
          <div className="card-header">
            <h3>Notifications</h3>
          </div>
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className={`notification-item ${notification.type}`}>
                  <div className="notification-icon">
                    {notification.type === 'warning' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    )}
                    {notification.type === 'info' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    )}
                    {notification.type === 'alert' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    )}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p>No notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
