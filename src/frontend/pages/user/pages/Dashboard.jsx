import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ user }) {
  const [kpis, setKpis] = useState({
    unpaidBills: 0,
    totalUnpaid: 0,
    pendingPayments: 0,
    activeViolations: 0
  });
  const [currentDate, setCurrentDate] = useState(new Date());

  const lotNumber = user?.lotNumber;

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!lotNumber) return;

    const fetchData = async () => {
      try {
        // Fetch unpaid bills
        const billsRes = await fetch(`/api/bills/user/${encodeURIComponent(lotNumber)}/unpaid`);
        const billsData = await billsRes.json();
        
        // Fetch payments
        const paymentsRes = await fetch(`/api/payments/user/${encodeURIComponent(lotNumber)}`);
        const paymentsData = await paymentsRes.json();
        
        // Fetch violations
        const violationsRes = await fetch(`/api/violations/user/${encodeURIComponent(lotNumber)}`);
        const violationsData = await violationsRes.json();
        
        const unpaidBills = Array.isArray(billsData) ? billsData : [];
        const pendingPayments = Array.isArray(paymentsData) ? paymentsData.filter(p => p.status === 'pending') : [];
        const violations = Array.isArray(violationsData) ? violationsData.filter(v => v.status === 'pending') : [];
        
        const totalUnpaid = unpaidBills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
        
        setKpis({
          unpaidBills: unpaidBills.length,
          totalUnpaid: totalUnpaid,
          pendingPayments: pendingPayments.length,
          activeViolations: violations.length
        });
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [lotNumber]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Placeholder data for pending bills
  const placeholderBills = [
    { id: 1, billNo: 'BILL-2024-001', period: 'January 2024', amount: 1500, dueDate: '2024-02-01', status: 'pending' },
    { id: 2, billNo: 'BILL-2024-002', period: 'February 2024', amount: 1500, dueDate: '2024-03-01', status: 'pending' },
    { id: 3, billNo: 'BILL-2024-003', period: 'March 2024', amount: 1500, dueDate: '2024-04-01', status: 'pending' }
  ];

  // Placeholder data for recent activity
  const placeholderActivities = [
    {
      id: 1,
      type: 'bill',
      title: 'New Bill Received',
      description: 'Bill #BILL-2024-003 for March 2024 has been issued',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Processed',
      description: 'Your payment for BILL-2023-012 has been confirmed',
      time: '1 day ago'
    },
    {
      id: 3,
      type: 'violation',
      title: 'Violation Notice',
      description: 'You have a pending violation: Noise Complaint (#VIO-2024-001)',
      time: '3 days ago'
    },
    {
      id: 4,
      type: 'info',
      title: 'Profile Updated',
      description: 'Your contact information has been updated successfully',
      time: '1 week ago'
    }
  ];

  // Placeholder data for payments history
  const PLACEHOLDER_PAYMENTS = [
    { id: 1, orNo: 'OR-2024-001', billNo: 'BILL-2023-012', amount: 1500, date: '2024-01-15', status: 'paid' },
    { id: 2, orNo: 'OR-2023-012', billNo: 'BILL-2023-011', amount: 1500, date: '2023-12-10', status: 'paid' }
  ];

  // Placeholder data for violations
  const PLACEHOLDER_VIOLATIONS = [
    {
      id: 1,
      violationNo: 'VIO-2024-001',
      type: 'Noise Complaint',
      description: 'Excessive noise during quiet hours',
      dateIssued: '2024-03-15',
      status: 'pending',
      penalty: 500
    },
    {
      id: 2,
      violationNo: 'VIO-2024-002',
      type: 'Unlicensed Pet',
      description: 'Pet registration required',
      dateIssued: '2024-02-20',
      status: 'settled',
      penalty: 300
    }
  ];

  // Placeholder data for billing history
  const PLACEHOLDER_BILLING_HISTORY = [
    { id: 1, billNo: 'BILL-2023-012', period: 'December 2023', amount: 1500, dueDate: '2024-01-01', status: 'paid', datePaid: '2023-12-28' },
    { id: 2, billNo: 'BILL-2023-011', period: 'November 2023', amount: 1500, dueDate: '2023-12-01', status: 'paid', datePaid: '2023-11-25' },
    { id: 3, billNo: 'BILL-2023-010', period: 'October 2023', amount: 1500, dueDate: '2023-11-01', status: 'paid', datePaid: '2023-10-28' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'payment':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        );
      case 'bill':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
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
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  return (
    <div className="use-dashboard-container">
      {/* Dashboard Header */}
      <div className="use-dashboard-header">
        <div className="use-header-text">
          <h1 className="use-dashboard-title">Welcome back, {user?.firstName || 'Resident'}!</h1>
          <p className="use-dashboard-subtitle">Here's what's happening with your account today.</p>
        </div>
        <div className="use-datetime-section">
          <div className="use-date-section">
            <span className="use-current-date">{formatDate(currentDate)}</span>
          </div>
          <span className="use-current-date">{formatTime(currentDate)}</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="use-kpi-grid">
        {/* Unpaid Bills */}
        <div className="use-kpi-card">
          <div className="use-kpi-icon unpaid">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="use-kpi-content">
            <span className="use-kpi-value">{kpis.unpaidBills}</span>
            <span className="use-kpi-label">Unpaid Bills</span>
          </div>
        </div>

        {/* Total Amount Due */}
        <div className="use-kpi-card">
          <div className="use-kpi-icon amount">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="use-kpi-content">
            <span className="use-kpi-value">{formatCurrency(kpis.totalUnpaid)}</span>
            <span className="use-kpi-label">Total Amount Due</span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="use-kpi-card">
          <div className="use-kpi-icon pending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="use-kpi-content">
            <span className="use-kpi-value">{kpis.pendingPayments}</span>
            <span className="use-kpi-label">Pending Payments</span>
          </div>
        </div>

        {/* Active Violations */}
        <div className="use-kpi-card">
          <div className="use-kpi-icon violations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="use-kpi-content">
            <span className="use-kpi-value">{kpis.activeViolations}</span>
            <span className="use-kpi-label">Active Violations</span>
          </div>
        </div>
      </div>

      {/* Pending Bills Section */}
      <div className="use-pending-bills-section">
        <div className="use-section-header">
          <h3>Pending Bills</h3>
          <Link to="/billing" className="use-view-all-link">View All</Link>
        </div>
        <div className="use-bills-table-container">
          <table className="use-bills-table">
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {placeholderBills.length > 0 ? (
                placeholderBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.billNo}</td>
                    <td>{bill.period}</td>
                    <td>{formatCurrency(bill.amount)}</td>
                    <td>{new Date(bill.dueDate).toLocaleDateString('en-PH')}</td>
                    <td>
                      <span className={`use-status-badge ${bill.status}`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="use-empty-message">
                    No pending bills. You're all caught up!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="use-activity-section">
        <div className="use-section-header">
          <h3>Recent Activity</h3>
          <Link to="/history" className="use-view-all-link">View All</Link>
        </div>
        <div className="use-activity-list">
          {placeholderActivities.map((activity) => (
            <div key={activity.id} className="use-activity-item">
              <div className={`use-activity-icon ${activity.type}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="use-activity-content">
                <h4 className="use-activity-title">{activity.title}</h4>
                <p className="use-activity-description">{activity.description}</p>
              </div>
              <span className="use-activity-time">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Violations Section */}
      <div className="use-pending-bills-section">
        <div className="use-section-header">
          <h3>Active Violations</h3>
          <Link to="/violation" className="use-view-all-link">View All</Link>
        </div>
        <div className="use-bills-table-container">
          <table className="use-bills-table">
            <thead>
              <tr>
                <th>Violation No.</th>
                <th>Type</th>
                <th>Description</th>
                <th>Date Issued</th>
                <th>Penalty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {PLACEHOLDER_VIOLATIONS.length > 0 ? (
                PLACEHOLDER_VIOLATIONS.map((violation) => (
                  <tr key={violation.id}>
                    <td>{violation.violationNo}</td>
                    <td>{violation.type}</td>
                    <td>{violation.description}</td>
                    <td>{new Date(violation.dateIssued).toLocaleDateString('en-PH')}</td>
                    <td>{formatCurrency(violation.penalty)}</td>
                    <td>
                      <span className={`use-status-badge ${violation.status}`}>
                        {violation.status.charAt(0).toUpperCase() + violation.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="use-empty-message">
                    No violations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing History Section */}
      <div className="use-activity-section">
        <div className="use-section-header">
          <h3>Billing History</h3>
          <Link to="/billing" className="use-view-all-link">View All</Link>
        </div>
        <div className="use-activity-list">
          {PLACEHOLDER_BILLING_HISTORY.slice(0, 3).map((bill) => (
            <div key={bill.id} className="use-activity-item">
              <div className="use-activity-icon bill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="use-activity-content">
                <h4 className="use-activity-title">{bill.billNo} - {bill.period}</h4>
                <p className="use-activity-description">{formatCurrency(bill.amount)} • Due: {new Date(bill.dueDate).toLocaleDateString('en-PH')}</p>
              </div>
              <span className={`use-status-badge ${bill.status}`}>{bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="use-quick-actions-section">
        <h3 className="use-quick-actions-title">Quick Actions</h3>
        <div className="use-quick-actions-grid">
          <Link to="/payment" className="use-quick-action-card">
            <div className="use-quick-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <span className="use-quick-action-label">Pay Bills</span>
          </Link>
          <Link to="/billing" className="use-quick-action-card">
            <div className="use-quick-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="use-quick-action-label">View Bills</span>
          </Link>
          <Link to="/profile" className="use-quick-action-card">
            <div className="use-quick-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="use-quick-action-label">My Profile</span>
          </Link>
          <Link to="/history" className="use-quick-action-card">
            <div className="use-quick-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span className="use-quick-action-label">History</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
