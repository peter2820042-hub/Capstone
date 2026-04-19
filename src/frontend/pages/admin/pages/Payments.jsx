import React, { useState, useEffect } from 'react';
import './Payments.css';

function Payments() {
  // Payment data
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments');
        if (!response.ok) throw new Error('Failed to fetch payments');
        const data = await response.json();
        setPayments(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // KPIs state
  const [kpis, setKpis] = useState({
    totalAmount: 0,
    totalBills: 0,
    totalPayments: 0,
    totalViolations: 0
  });

  // Fetch KPIs
  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const response = await fetch('/api/pa-center');
        if (response.ok) {
          const data = await response.json();
          setKpis({
            totalAmount: data.totalBilled || 0,
            totalBills: data.billsCount?.total || 0,
            totalPayments: data.paymentsCount?.approved || 0,
            totalViolations: data.violationsCount?.total || 0
          });
        }
      } catch (err) {
        console.error('Error fetching KPIs:', err);
      }
    };
    fetchKPIs();
  }, []);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    residentName: '',
    billReference: '',
    paymentMethod: '',
    status: ''
  });

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Payment methods for filter dropdown
  const paymentMethods = ['Cash', 'GCash', 'Bank Transfer', 'Check', 'Other'];

  // Handle filter input change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filter payments based on all criteria
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      filters.search === '' ||
      payment.residentName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.billReference?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesResident = filters.residentName === '' || payment.residentName?.toLowerCase().includes(filters.residentName.toLowerCase());
    const matchesBillReference = filters.billReference === '' || payment.billReference?.toLowerCase().includes(filters.billReference.toLowerCase());
    const matchesPaymentMethod = filters.paymentMethod === '' || payment.paymentMethod === filters.paymentMethod;
    const matchesStatus = filters.status === '' || payment.status === filters.status;

    return matchesSearch && matchesResident && matchesBillReference && matchesPaymentMethod && matchesStatus;
  });

  // Handle view details
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      residentName: '',
      billReference: '',
      paymentMethod: '',
      status: ''
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-badge approved';
      case 'pending':
        return 'status-badge pending';
      case 'rejected':
        return 'status-badge rejected';
      default:
        return 'status-badge';
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1);
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  if (error) {
    return (
      <div className="pay-dashboard-container">
        <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
          Payments
        </h1>
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '40px', 
          textAlign: 'center',
          color: '#ef4444'
        }}>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pay-dashboard-container">
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
        Payments
      </h1>

      {/* KPI Cards */}
      <div className="pay-kpi-grid">
        {/* Total Amount */}
        <div className="pay-kpi-card">
          <div className="pay-kpi-icon total-amount">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="pay-kpi-content">
            <span className="pay-kpi-value">
              {loading ? '...' : formatCurrency(kpis.totalAmount)}
            </span>
            <span className="pay-kpi-label">Total Amount</span>
          </div>
        </div>

        {/* Total Bills */}
        <div className="pay-kpi-card">
          <div className="pay-kpi-icon total-bills">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="pay-kpi-content">
            <span className="pay-kpi-value">
              {loading ? '...' : kpis.totalBills}
            </span>
            <span className="pay-kpi-label">Total Bills</span>
          </div>
        </div>

        {/* Total Payments */}
        <div className="pay-kpi-card">
          <div className="pay-kpi-icon total-payments">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className="pay-kpi-content">
            <span className="pay-kpi-value">
              {loading ? '...' : kpis.totalPayments}
            </span>
            <span className="pay-kpi-label">Total Payments</span>
          </div>
        </div>

        {/* Total Violations */}
        <div className="pay-kpi-card">
          <div className="pay-kpi-icon total-violations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="pay-kpi-content">
            <span className="pay-kpi-value">
              {loading ? '...' : kpis.totalViolations}
            </span>
            <span className="pay-kpi-label">Total Violations</span>
          </div>
        </div>
      </div>

      {/* Search/Filter Bar */}
      <div className="admin-search-filter-bar">
        <div className="admin-filter-group">
          <label>Search</label>
          <input
            type="text"
            name="search"
            placeholder="Search resident or bill reference..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        <div className="admin-filter-group">
          <label>Resident Name</label>
          <input
            type="text"
            name="residentName"
            placeholder="Filter by resident name..."
            value={filters.residentName}
            onChange={handleFilterChange}
          />
        </div>
        <div className="admin-filter-group">
          <label>Bill Reference</label>
          <input
            type="text"
            name="billReference"
            placeholder="Filter by bill reference..."
            value={filters.billReference}
            onChange={handleFilterChange}
          />
        </div>
        <div className="admin-filter-group">
          <label>Payment Method</label>
          <select
            name="paymentMethod"
            value={filters.paymentMethod}
            onChange={handleFilterChange}
          >
            <option value="">All Methods</option>
            {paymentMethods.map((method, index) => (
              <option key={index} value={method}>{method}</option>
            ))}
          </select>
        </div>
        <div className="admin-filter-group">
          <label>Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button className="admin-clear-btn" onClick={clearFilters}>Clear</button>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-payments-table">
          <thead>
            <tr>
              <th>Resident Name</th>
              <th>Bill Reference</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              if (loading) {
                return (
                  <tr>
                    <td colSpan="7" className="admin-empty-row">
                      Loading payments...
                    </td>
                  </tr>
                );
              }
              
              if (filteredPayments.length === 0) {
                return (
                  <tr>
                    <td colSpan="7" className="admin-empty-row">
                      {(filters.search || filters.residentName || filters.billReference || filters.paymentMethod || filters.status)
                        ? 'No payments found matching your search' 
                        : 'No payments logged yet'}
                    </td>
                  </tr>
                );
              }
              
              return filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.residentName || '-'}</td>
                  <td>{payment.billReference || '-'}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{formatDate(payment.paymentDate)}</td>
                  <td>{payment.paymentMethod || '-'}</td>
                  <td>
                    <span className={getStatusBadgeClass(payment.status)}>
                      {formatStatus(payment.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn" onClick={() => handleViewDetails(payment)}>View</button>
                    </div>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showViewModal && selectedPayment && (
        <div className="admin-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Payment Details</h2>
              <button className="admin-modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-detail-row">
                <span className="detail-label">Resident Name:</span>
                <span className="detail-value">{selectedPayment.residentName || '-'}</span>
              </div>
              <div className="admin-detail-row">
                <span className="detail-label">Bill Reference:</span>
                <span className="detail-value">{selectedPayment.billReference || '-'}</span>
              </div>
              <div className="admin-detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">{formatCurrency(selectedPayment.amount)}</span>
              </div>
              <div className="admin-detail-row">
                <span className="detail-label">Payment Date:</span>
                <span className="detail-value">{formatDate(selectedPayment.paymentDate)}</span>
              </div>
              <div className="admin-detail-row">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value">{selectedPayment.paymentMethod || '-'}</span>
              </div>
              <div className="admin-detail-row">
                <span className="detail-label">Status:</span>
                <span className={getStatusBadgeClass(selectedPayment.status)}>
                  {formatStatus(selectedPayment.status)}
                </span>
              </div>
              {selectedPayment.approvedDate && (
                <div className="admin-detail-row">
                  <span className="detail-label">Approved Date:</span>
                  <span className="detail-value">{formatDate(selectedPayment.approvedDate)}</span>
                </div>
              )}
              {selectedPayment.notes && (
                <div className="admin-detail-row">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{selectedPayment.notes}</span>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;