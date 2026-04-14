import React, { useState, useEffect } from 'react';
import './Reports.css';

function Reports() {
  const [activeTab, setActiveTab] = useState('billing');
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalBills: 0,
    totalPayments: 0,
    pendingPayments: 0,
    overdueBills: 0
  });

  // Data states
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);

  // Date filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch all data on mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchBills = async () => {
      try {
        const response = await fetch('/api/bills');
        const data = await response.json();
        setBills(data);
      } catch (error) {
        console.error('Error fetching bills:', error);
      }
    };

    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments');
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    const fetchResidents = async () => {
      try {
        const response = await fetch('/api/residents');
        const data = await response.json();
        setResidents(data);
      } catch (error) {
        console.error('Error fetching residents:', error);
      }
    };

    fetchDashboardStats();
    fetchBills();
    fetchPayments();
    fetchResidents();
  }, []);

  // Filter data by date range
  const filterByDate = (data, dateField) => {
    if (!dateFrom && !dateTo) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      if (dateFrom && itemDate < new Date(dateFrom)) return false;
      if (dateTo && itemDate > new Date(dateTo)) return false;
      return true;
    });
  };

  // Get filtered data based on active tab
  const getFilteredData = () => {
    switch (activeTab) {
      case 'billing':
        return filterByDate(bills, 'dueDate');
      case 'payments':
        return filterByDate(payments, 'paymentDate');
      case 'residents':
        return filterByDate(residents, 'dateRegistered');
      default:
        return [];
    }
  };

  const filteredData = getFilteredData();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div>
          <p>View and export system reports</p>
        </div>
        <div className="header-actions">
          <button className="add-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Excel
          </button>
          <button className="add-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="kpi-section">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalResidents}</span>
            <span className="kpi-label">Total Residents</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalBills}</span>
            <span className="kpi-label">Total Bills</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon yellow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.totalPayments}</span>
            <span className="kpi-label">Total Payments</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.pendingPayments}</span>
            <span className="kpi-label">Pending Payments</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{stats.overdueBills}</span>
            <span className="kpi-label">Overdue Bills</span>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="report-tabs">
        <button 
          className={`tab ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
        <button 
          className={`tab ${activeTab === 'residents' ? 'active' : ''}`}
          onClick={() => setActiveTab('residents')}
        >
          Residents
        </button>
      </div>

      {/* Search/Filter - Horizontal Layout */}
      <div className="search-filter-bar">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search..."
          />
        </div>
        <div className="filter-group">
          <label>From Date</label>
          <input 
            type="date" 
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>To Date</label>
          <input 
            type="date" 
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="violations-table">
          <thead>
            <tr>
              {activeTab === 'billing' && (
                <>
                  <th>Bill #</th>
                  <th>Resident</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </>
              )}
              {activeTab === 'payments' && (
                <>
                  <th>ID</th>
                  <th>Resident</th>
                  <th>Bill Ref</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                </>
              )}
              {activeTab === 'residents' && (
                <>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Lot #</th>
                  <th>Block</th>
                  <th>Email</th>
                  <th>Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  No records found
                </td>
              </tr>
            ) : (
              filteredData.slice(0, 50).map((item) => (
                <tr key={item.id}>
                  {activeTab === 'billing' && (
                    <>
                      <td>{item.billNumber || `BILL-${item.id}`}</td>
                      <td>{item.residentName || '-'}</td>
                      <td>{item.billType || '-'}</td>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(item.amount)}</td>
                      <td>{formatDate(item.dueDate)}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                    </>
                  )}
                  {activeTab === 'payments' && (
                    <>
                      <td>#{item.id}</td>
                      <td>{item.residentName || '-'}</td>
                      <td>{item.billReference || 'N/A'}</td>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(item.amount)}</td>
                      <td>{formatDate(item.paymentDate)}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                    </>
                  )}
                  {activeTab === 'residents' && (
                    <>
                      <td>#{item.id}</td>
                      <td>{item.fullName || '-'}</td>
                      <td>{item.lotNumber || 'N/A'}</td>
                      <td>{item.block || 'N/A'}</td>
                      <td>{item.email || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Report Summary */}
      <div className="report-summary">
        <p>
          Showing {filteredData.length} records | Generated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default Reports;
