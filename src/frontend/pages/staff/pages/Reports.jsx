import React, { useState, useEffect } from 'react';
import './Reports.css';

function Reports() {
  const [activeTab, setActiveTab] = useState('billing');

  // Data states
  const [bills, setBills] = useState([]);
  const [violations, setViolations] = useState([]);
  const [payments, setPayments] = useState([]);

  // Date filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch all data on mount
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch('/api/bills');
        const data = await response.json();
        setBills(data);
      } catch (error) {
        console.error('Error fetching bills:', error);
      }
    };

    const fetchViolations = async () => {
      try {
        const response = await fetch('/api/violations');
        const data = await response.json();
        setViolations(data);
      } catch (error) {
        console.error('Error fetching violations:', error);
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

    fetchBills();
    fetchViolations();
    fetchPayments();
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
      case 'violations':
        return filterByDate(violations, 'dateIssued');
      case 'payments':
        return filterByDate(payments, 'paymentDate');
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

      {/* Report Tabs */}
      <div className="report-tabs">
        <button 
          className={`tab ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Billing
        </button>
        <button 
          className={`tab ${activeTab === 'violations' ? 'active' : ''}`}
          onClick={() => setActiveTab('violations')}
        >
          Violations
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
      </div>

      {/* Search/Filter - Horizontal Layout */}
      <div className="staff-search-filter-bar">
        <div className="staff-filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search..."
          />
        </div>
        <div className="staff-filter-group">
          <label>From Date</label>
          <input 
            type="date" 
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="staff-filter-group">
          <label>To Date</label>
          <input 
            type="date" 
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="staff-table-container">
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
              {activeTab === 'violations' && (
                <>
                  <th>ID</th>
                  <th>Lot #</th>
                  <th>Resident</th>
                  <th>Type</th>
                  <th>Penalty</th>
                  <th>Date</th>
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
                  <th>Method</th>
                  <th>Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'violations' ? 7 : 6} className="staff-empty-row">
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
                  {activeTab === 'violations' && (
                    <>
                      <td>#{item.id}</td>
                      <td>{item.lotNumber || '-'}</td>
                      <td>{item.residentName || '-'}</td>
                      <td>{item.violationType || '-'}</td>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(item.penalty || 0)}</td>
                      <td>{formatDate(item.dateIssued)}</td>
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
                      <td>{item.paymentMethod || 'N/A'}</td>
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
