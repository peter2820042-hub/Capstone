import React, { useState, useEffect } from 'react';
import './Payments.css';

function Payment() {
  // Payment data
  const [payments, setPayments] = useState([]);
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
      }
    };
    fetchPayments();
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    status: '',
    notes: ''
  });

  // Payment methods for filter dropdown
  const paymentMethods = ['Cash', 'GCash', 'Bank Transfer', 'Check', 'Other'];

  // KPI stats
  const [totalBills, setTotalBills] = useState(0);
  const [totalViolations, setTotalViolations] = useState(0);

  // Calculate stats
  const totalPayments = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);

  // Fetch bills and violations counts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [billsRes, violationsRes] = await Promise.all([
          fetch('/api/bills'),
          fetch('/api/violations')
        ]);
        if (billsRes.ok) {
          const bills = await billsRes.json();
          setTotalBills(bills.length);
        }
        if (violationsRes.ok) {
          const violations = await violationsRes.json();
          setTotalViolations(violations.length);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

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

  // Handle edit
  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setEditForm({
      status: payment.status,
      notes: payment.notes || ''
    });
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Save edited payment
  const saveEdit = async () => {
    try {
      const response = await fetch(`/api/payments/${selectedPayment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editForm.status,
          notes: editForm.notes,
          approvedDate: editForm.status === 'approved' ? new Date().toISOString() : null
        })
      });
      
      if (!response.ok) throw new Error('Failed to update payment');
      
      // Refresh payments
      const fetchPayments = async () => {
        const res = await fetch('/api/payments');
        const data = await res.json();
        setPayments(data);
      };
      fetchPayments();
      
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating payment:', err);
    }
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
      <div className="payment-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      {/* KPI Stats Section */}
      <div className="staff-stats-section">
        <div className="staff-stats-grid">
          <div className="staff-stat-card">
            <div className="staff-stat-icon total-payments">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="staff-stat-content">
              <span className="staff-stat-label">Total Payments</span>
              <span className="staff-stat-value">{formatCurrency(totalPayments)}</span>
            </div>
          </div>
          <div className="staff-stat-card">
            <div className="staff-stat-icon pending-review">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="staff-stat-content">
              <span className="staff-stat-label">Total Bills</span>
              <span className="staff-stat-value">{totalBills}</span>
            </div>
          </div>
          <div className="staff-stat-card">
            <div className="staff-stat-icon approved-today">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="staff-stat-content">
              <span className="staff-stat-label">Total Violations</span>
              <span className="staff-stat-value">{totalViolations}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Search/Filter - Horizontal Layout */}
      <div className="staff-search-filter-bar">
        <div className="staff-filter-group">
          <label>Search</label>
          <input
            type="text"
            name="search"
            placeholder="Search resident or bill reference..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        <div className="staff-filter-group">
          <label>Resident Name</label>
          <input
            type="text"
            name="residentName"
            placeholder="Filter by resident name..."
            value={filters.residentName}
            onChange={handleFilterChange}
          />
        </div>
        <div className="staff-filter-group">
          <label>Bill Reference</label>
          <input
            type="text"
            name="billReference"
            placeholder="Filter by bill reference..."
            value={filters.billReference}
            onChange={handleFilterChange}
          />
        </div>
        <div className="staff-filter-group">
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
        <div className="staff-filter-group">
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
        <button className="staff-clear-btn" onClick={clearFilters}>Clear</button>
      </div>

      {/* Table */}
      <div className="staff-table-container">
        <table className="payments-table">
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
              if (filteredPayments.length === 0) {
                return (
                  <tr>
                    <td colSpan="7" className="staff-empty-row">
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
                      <button className="edit-btn" onClick={() => handleEdit(payment)}>Edit</button>
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
        <div className="staff-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="staff-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h2>Payment Details</h2>
              <button className="staff-modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="staff-modal-body">
              <div className="staff-detail-row">
                <span className="detail-label">Resident Name:</span>
                <span className="detail-value">{selectedPayment.residentName || '-'}</span>
              </div>
              <div className="staff-detail-row">
                <span className="detail-label">Bill Reference:</span>
                <span className="detail-value">{selectedPayment.billReference || '-'}</span>
              </div>
              <div className="staff-detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">{formatCurrency(selectedPayment.amount)}</span>
              </div>
              <div className="staff-detail-row">
                <span className="detail-label">Payment Date:</span>
                <span className="detail-value">{formatDate(selectedPayment.paymentDate)}</span>
              </div>
              <div className="staff-detail-row">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value">{selectedPayment.paymentMethod || '-'}</span>
              </div>
              <div className="staff-detail-row">
                <span className="detail-label">Status:</span>
                <span className={getStatusBadgeClass(selectedPayment.status)}>
                  {formatStatus(selectedPayment.status)}
                </span>
              </div>
              {selectedPayment.approvedDate && (
                <div className="staff-detail-row">
                  <span className="detail-label">Approved Date:</span>
                  <span className="detail-value">{formatDate(selectedPayment.approvedDate)}</span>
                </div>
              )}
              {selectedPayment.notes && (
                <div className="staff-detail-row">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{selectedPayment.notes}</span>
                </div>
              )}
            </div>
            <div className="staff-modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPayment && (
        <div className="staff-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="staff-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h2>Edit Payment</h2>
              <button className="staff-modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="staff-modal-body">
              <div className="staff-form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="staff-form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={editForm.notes}
                  onChange={handleEditFormChange}
                  rows="4"
                  placeholder="Add any notes..."
                />
              </div>
            </div>
            <div className="staff-modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="modal-btn save" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;
