import React, { useState, useEffect } from 'react';
import './Reports.css';

function Reports() {
  const [activeTab, setActiveTab] = useState('billing');

  // Data states
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [violations, setViolations] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');



  // Fetch all data on mount
  useEffect(() => {
    const fetchBills = async () => {
      try {
        console.log('[Reports] Fetching bills...');
        const response = await fetch('/api/bills');
        console.log('[Reports] Bills response status:', response.status);
        if (!response.ok) {
          console.error('[Reports] Bills API error:', response.statusText);
          return;
        }
        const data = await response.json();
        console.log('[Reports] Bills data received, count:', data.length);
        setBills(data);
      } catch (error) {
        console.error('Error fetching bills:', error);
      }
    };

    const fetchPayments = async () => {
      try {
        console.log('[Reports] Fetching payments...');
        const response = await fetch('/api/payments');
        console.log('[Reports] Payments response status:', response.status);
        if (!response.ok) {
          console.error('[Reports] Payments API error:', response.statusText);
          return;
        }
        const data = await response.json();
        console.log('[Reports] Payments data received, count:', data.length);
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    const fetchResidents = async () => {
      try {
        console.log('[Reports] Fetching residents...');
        const response = await fetch('/api/residents');
        console.log('[Reports] Residents response status:', response.status);
        if (!response.ok) {
          console.error('[Reports] Residents API error:', response.statusText);
          return;
        }
        const data = await response.json();
        console.log('[Reports] Residents data received, count:', data.length);
        setResidents(data);
      } catch (error) {
        console.error('Error fetching residents:', error);
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

    fetchBills();
    fetchPayments();
    fetchResidents();
    fetchViolations();
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

  // Get status options based on active tab
  const getStatusOptions = () => {
    const baseOptions = [{ value: 'all', label: 'All Status' }];
    switch (activeTab) {
      case 'billing':
        return [...baseOptions, { value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Pending' }, { value: 'overdue', label: 'Overdue' }];
      case 'payments':
        return [...baseOptions, { value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }];
      case 'violations':
        return [...baseOptions, { value: 'unsettled', label: 'Unsettled' }, { value: 'settled', label: 'Settled' }, { value: 'appealed', label: 'Appealed' }];
      case 'residents':
        return [...baseOptions, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }];
      default:
        return baseOptions;
    }
  };

  // Filter data by status
  const filterByStatus = (data) => {
    if (statusFilter === 'all') return data;
    
    return data.filter(item => {
      const itemStatus = (item.status || '').toLowerCase();
      const selectedStatus = statusFilter.toLowerCase();
      return itemStatus === selectedStatus;
    });
  };

  // Get filtered data based on active tab
  const getFilteredData = () => {
    let data;
    switch (activeTab) {
      case 'billing':
        data = filterByDate(bills, 'dueDate');
        break;
      case 'payments':
        data = filterByDate(payments, 'paymentDate');
        break;
      case 'residents':
        data = filterByDate(residents, 'dateRegistered');
        break;
      case 'violations':
        data = filterByDate(violations, 'dateIssued');
        break;
      default:
        data = [];
    }

    // Apply status filter
    data = filterByStatus(data);
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return data.filter(item => {
        if (activeTab === 'billing') {
          return (item.residentName || '').toLowerCase().includes(term) ||
                 (item.billType || '').toLowerCase().includes(term) ||
                 (item.status || '').toLowerCase().includes(term);
        } else if (activeTab === 'payments') {
          return (item.residentName || '').toLowerCase().includes(term) ||
                 (item.billReference || '').toLowerCase().includes(term) ||
                 (item.status || '').toLowerCase().includes(term);
        } else if (activeTab === 'violations') {
          return (item.residentName || '').toLowerCase().includes(term) ||
                 (item.lotNumber || '').toLowerCase().includes(term) ||
                 (item.block || '').toLowerCase().includes(term) ||
                 (item.violationType || '').toLowerCase().includes(term) ||
                 (item.status || '').toLowerCase().includes(term);
        } else if (activeTab === 'residents') {
          return (item.fullName || '').toLowerCase().includes(term) ||
                 (item.lotNumber || '').toLowerCase().includes(term) ||
                 (item.block || '').toLowerCase().includes(term) ||
                 (item.email || '').toLowerCase().includes(term) ||
                 (item.status || '').toLowerCase().includes(term);
        }
        return true;
      });
    }
    
    return data;
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'payments') {
      setStatusFilter('completed');
    } else if (tab === 'violations') {
      setStatusFilter('settled');
    } else if (tab === 'billing') {
      setStatusFilter('paid');
    } else if (tab === 'residents') {
      setStatusFilter('active');
    } else {
      setStatusFilter('all');
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

  // Get tab title for table section
  const getTabTitle = () => {
    switch (activeTab) {
      case 'billing':
        return 'Billing Records';
      case 'payments':
        return 'Payment Records';
      case 'violations':
        return 'Violation Records';
      case 'residents':
        return 'Resident Records';
      default:
        return 'Records';
    }
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
          onClick={() => handleTabChange('billing')}
        >
          Billing
        </button>
        <button 
          className={`tab ${activeTab === 'violations' ? 'active' : ''}`}
          onClick={() => handleTabChange('violations')}
        >
          Violations
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => handleTabChange('payments')}
        >
          Payments
        </button>
        <button 
          className={`tab ${activeTab === 'residents' ? 'active' : ''}`}
          onClick={() => handleTabChange('residents')}
        >
          Residents
        </button>
      </div>

      {/* Search/Filter - Staff Style Layout */}
      <div className="sr-search-filter-bar">
        <div className="sr-filters-row">
          <div className="sr-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sr-filter-group">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {getStatusOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sr-filter-group">
            <label>From Date</label>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="sr-filter-group">
            <label>To Date</label>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>



      {/* Table Section */}
      <section className="sr-table-section">
        <h3 className="sr-table-title">{getTabTitle()}</h3>
        <div className="sr-table-container">
          <table className="sr-table">
          <thead>
            <tr>
              {activeTab === 'billing' && (
                <>
                  <th>Resident Name</th>
                  <th>Bill Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </>
              )}
              {activeTab === 'violations' && (
                <>
                  <th>Resident Name</th>
                  <th>Violation Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                <td colSpan="6" className="admin-admin-empty-row">
                  No records found
                </td>
              </tr>
            ) : (
              filteredData.slice(0, 50).map((item) => (
                <tr key={item.id}>
                  {activeTab === 'billing' && (
                    <>
                      <td>{item.residentName || '-'}</td>
                      <td>{item.billType || '-'}</td>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(item.amount)}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button className="view-btn">View</button>
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
                  {activeTab === 'violations' && (
                    <>
                      <td>{item.residentName || '-'}</td>
                      <td>{item.violationType || '-'}</td>
                      <td style={{ fontWeight: 'bold' }}>{formatCurrency(item.fine || 0)}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button className="view-btn">View</button>
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
      </section>

      {/* Report Summary */}
      {filteredData.length > 0 && (
        <div className="report-summary">
          <p>
            Showing {filteredData.length} records | Generated: {new Date().toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default Reports;
