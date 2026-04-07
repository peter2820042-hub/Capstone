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
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/payments');
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

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [residentFilter, setResidentFilter] = useState('');
  const [billReferenceFilter, setBillReferenceFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Bulk action states
  const [selectedPayments, setSelectedPayments] = useState([]);

  // Payment methods for filter dropdown
  const paymentMethods = ['Cash', 'GCash', 'Bank Transfer', 'Check', 'Other'];

  // Calculate stats
  const totalPayments = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);
  const pendingReview = payments.filter(p => p.status === 'pending').length;
  const approvedToday = payments.filter(p => {
    const today = new Date().toISOString().split('T')[0];
    return p.status === 'approved' && p.approvedDate === today;
  }).reduce((sum, p) => sum + p.amount, 0);
  const rejectedCount = payments.filter(p => p.status === 'rejected').length;

  // Filter payments based on all criteria
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.billReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResident = residentFilter === '' || payment.residentName.toLowerCase().includes(residentFilter.toLowerCase());
    const matchesBillReference = billReferenceFilter === '' || payment.billReference.toLowerCase().includes(billReferenceFilter.toLowerCase());
    const matchesPaymentMethod = paymentMethodFilter === '' || payment.paymentMethod === paymentMethodFilter;
    const matchesStatus = statusFilter === '' || payment.status === statusFilter;
    
    let matchesDateRange = true;
    if (dateFrom && dateTo) {
      const paymentDate = new Date(payment.paymentDate);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      matchesDateRange = paymentDate >= fromDate && paymentDate <= toDate;
    } else if (dateFrom) {
      matchesDateRange = new Date(payment.paymentDate) >= new Date(dateFrom);
    } else if (dateTo) {
      matchesDateRange = new Date(payment.paymentDate) <= new Date(dateTo);
    }

    return matchesSearch && matchesResident && matchesBillReference && matchesPaymentMethod && matchesStatus && matchesDateRange;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // Get pending payments for alerts section
  const pendingPayments = payments.filter(p => p.status === 'pending');

  // Handle view details
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  // Handle approve
  const handleApprove = (payment) => {
    setSelectedPayment(payment);
    setShowApproveModal(true);
  };

  // Handle reject
  const handleReject = (payment) => {
    setSelectedPayment(payment);
    setShowRejectModal(true);
  };

  // Confirm approve
  const confirmApprove = () => {
    setPayments(payments.map(p => 
      p.id === selectedPayment.id 
        ? { ...p, status: 'approved', approvedDate: new Date().toISOString().split('T')[0] }
        : p
    ));
    setShowApproveModal(false);
    setSelectedPayment(null);
  };

  // Confirm reject
  const confirmReject = () => {
    setPayments(payments.map(p => 
      p.id === selectedPayment.id 
        ? { ...p, status: 'rejected', rejectedDate: new Date().toISOString().split('T')[0] }
        : p
    ));
    setShowRejectModal(false);
    setSelectedPayment(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setResidentFilter('');
    setBillReferenceFilter('');
    setDateFrom('');
    setDateTo('');
    setPaymentMethodFilter('');
    setStatusFilter('');
  };

  // Handle bulk selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPayments(currentPayments.map(p => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  // Bulk actions
  const handleBulkApprove = () => {
    setPayments(payments.map(p => 
      selectedPayments.includes(p.id)
        ? { ...p, status: 'approved', approvedDate: new Date().toISOString().split('T')[0] }
        : p
    ));
    setSelectedPayments([]);
  };

  const handleBulkReject = () => {
    setPayments(payments.map(p => 
      selectedPayments.includes(p.id)
        ? { ...p, status: 'rejected', rejectedDate: new Date().toISOString().split('T')[0] }
        : p
    ));
    setSelectedPayments([]);
  };

  // Export functions
  const exportToPDF = () => {
    alert('Exporting to PDF...');
  };

  const exportToExcel = () => {
    alert('Exporting to Excel...');
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
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div className="payments-container">
      
      {/* Stats Cards Section */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total-payments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Payments</span>
              <span className="stat-value">{formatCurrency(totalPayments)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending-review">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Pending Review</span>
              <span className="stat-value">{pendingReview}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved-today">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Approved Today</span>
              <span className="stat-value">{formatCurrency(approvedToday)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rejected">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Rejected</span>
              <span className="stat-value rejected">{rejectedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments Alerts Section */}
      {pendingPayments.length > 0 && (
        <div className="pending-alerts-section">
          <div className="alert-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Attention: {pendingPayments.length} payment(s) pending review</span>
          </div>
          <div className="pending-list">
            {pendingPayments.map(payment => (
              <div key={payment.id} className="pending-item">
                <div className="pending-info">
                  <span className="pending-resident">{payment.residentName}</span>
                  <span className="pending-reference">{payment.billReference}</span>
                  <span className="pending-amount">{formatCurrency(payment.amount)}</span>
                  <span className="pending-method">{payment.paymentMethod}</span>
                  <span className="pending-date">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                </div>
                <div className="pending-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => handleApprove(payment)}
                  >
                    Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleReject(payment)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <h2>Search & Filter</h2>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>

        <div className="filter-grid">
          {/* General Search */}
          <div className="filter-group search-group">
            <label htmlFor="search">Search</label>
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                id="search"
                placeholder="Search by resident, bill reference, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Resident Name Filter */}
          <div className="filter-group">
            <label htmlFor="residentFilter">Resident Name</label>
            <input
              type="text"
              id="residentFilter"
              placeholder="Filter by resident name"
              value={residentFilter}
              onChange={(e) => setResidentFilter(e.target.value)}
            />
          </div>

          {/* Bill Reference Filter */}
          <div className="filter-group">
            <label htmlFor="billReferenceFilter">Bill Reference</label>
            <input
              type="text"
              id="billReferenceFilter"
              placeholder="Filter by bill reference"
              value={billReferenceFilter}
              onChange={(e) => setBillReferenceFilter(e.target.value)}
            />
          </div>

          {/* Date Range Filter */}
          <div className="filter-group date-range-group">
            <label>Date Range</label>
            <div className="date-range-inputs">
              <input
                type="date"
                id="dateFrom"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
              />
              <span className="date-separator">to</span>
              <input
                type="date"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
              />
            </div>
          </div>

          {/* Payment Method Filter */}
          <div className="filter-group">
            <label htmlFor="paymentMethodFilter">Payment Method</label>
            <select
              id="paymentMethodFilter"
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
            >
              <option value="">All Methods</option>
              {paymentMethods.map((method, index) => (
                <option key={index} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label htmlFor="statusFilter">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table Section */}
      <div className="payments-table-section">
        <div className="table-header">
          <div className="table-title">
            <h2>Payment Transactions</h2>
            <span className="table-info">Showing {filteredPayments.length} of {payments.length} entries</span>
          </div>
          <div className="table-actions">
            <div className="export-buttons">
              <button className="export-btn pdf" onClick={exportToPDF}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                PDF
              </button>
              <button className="export-btn excel" onClick={exportToExcel}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPayments.length > 0 && (
          <div className="bulk-actions">
            <span>{selectedPayments.length} payment(s) selected</span>
            <div className="bulk-buttons">
              <button className="bulk-btn approve" onClick={handleBulkApprove}>
                Approve Selected
              </button>
              <button className="bulk-btn reject" onClick={handleBulkReject}>
                Reject Selected
              </button>
            </div>
          </div>
        )}

        <div className="table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedPayments.length === currentPayments.length && currentPayments.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Transaction ID</th>
                <th>Bill Reference #</th>
                <th>Resident Name</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={() => handleSelectPayment(payment.id)}
                      />
                    </td>
                    <td>
                      <span className="transaction-id">{payment.transactionId}</span>
                    </td>
                    <td>{payment.billReference}</td>
                    <td>{payment.residentName}</td>
                    <td>
                      <span className="amount">{formatCurrency(payment.amount)}</span>
                    </td>
                    <td>{payment.paymentMethod}</td>
                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td>
                      <span className={getStatusBadgeClass(payment.status)}>
                        {formatStatus(payment.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetails(payment)}
                          title="View Details"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        {payment.status === 'pending' && (
                          <>
                            <button
                              className="action-btn approve-btn"
                              onClick={() => handleApprove(payment)}
                              title="Approve"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                              </svg>
                            </button>
                            <button
                              className="action-btn reject-btn"
                              onClick={() => handleReject(payment)}
                              title="Reject"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-results">
                    <div className="no-results-content">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                      <p>No payments found matching your criteria</p>
                      <button onClick={clearFilters}>Clear Filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </button>
              ))}
            </div>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View Payment Details Modal */}
      {showViewModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Transaction ID:</label>
                <span>{selectedPayment.transactionId}</span>
              </div>
              <div className="detail-row">
                <label>Bill Reference:</label>
                <span>{selectedPayment.billReference}</span>
              </div>
              <div className="detail-row">
                <label>Resident Name:</label>
                <span>{selectedPayment.residentName}</span>
              </div>
              <div className="detail-row">
                <label>Amount:</label>
                <span className="amount">{formatCurrency(selectedPayment.amount)}</span>
              </div>
              <div className="detail-row">
                <label>Payment Method:</label>
                <span>{selectedPayment.paymentMethod}</span>
              </div>
              <div className="detail-row">
                <label>Payment Date:</label>
                <span>{new Date(selectedPayment.paymentDate).toLocaleDateString()}</span>
              </div>
              {selectedPayment.referenceNumber && (
                <div className="detail-row">
                  <label>Reference Number:</label>
                  <span>{selectedPayment.referenceNumber}</span>
                </div>
              )}
              {selectedPayment.notes && (
                <div className="detail-row">
                  <label>Notes:</label>
                  <span>{selectedPayment.notes}</span>
                </div>
              )}
              <div className="detail-row">
                <label>Status:</label>
                <span className={getStatusBadgeClass(selectedPayment.status)}>
                  {formatStatus(selectedPayment.status)}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              {selectedPayment.status === 'pending' && (
                <>
                  <button className="btn-secondary" onClick={() => {
                    setShowViewModal(false);
                    handleReject(selectedPayment);
                  }}>
                    Reject
                  </button>
                  <button className="btn-primary" onClick={() => {
                    setShowViewModal(false);
                    handleApprove(selectedPayment);
                  }}>
                    Approve
                  </button>
                </>
              )}
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Approve Payment</h2>
              <button className="modal-close" onClick={() => setShowApproveModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="approve-summary">
                <div className="approve-info">
                  <span className="approve-label">Transaction ID:</span>
                  <span className="approve-value">{selectedPayment.transactionId}</span>
                </div>
                <div className="approve-info">
                  <span className="approve-label">Resident:</span>
                  <span className="approve-value">{selectedPayment.residentName}</span>
                </div>
                <div className="approve-info">
                  <span className="approve-label">Amount:</span>
                  <span className="approve-value amount">{formatCurrency(selectedPayment.amount)}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea placeholder="Add any notes about this approval..." rows="3"></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowApproveModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={confirmApprove}>
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Payment</h2>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="reject-summary">
                <div className="reject-info">
                  <span className="reject-label">Transaction ID:</span>
                  <span className="reject-value">{selectedPayment.transactionId}</span>
                </div>
                <div className="reject-info">
                  <span className="reject-label">Resident:</span>
                  <span className="reject-value">{selectedPayment.residentName}</span>
                </div>
                <div className="reject-info">
                  <span className="reject-label">Amount:</span>
                  <span className="reject-value amount">{formatCurrency(selectedPayment.amount)}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Reason for Rejection *</label>
                <textarea placeholder="Please provide a reason for rejecting this payment..." rows="3" required></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmReject}>
                Reject Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;
