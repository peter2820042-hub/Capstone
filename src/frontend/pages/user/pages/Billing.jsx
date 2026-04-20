import React, { useState, useEffect } from 'react';
import './Billing.css';

function Billing({ user }) {
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Bills data
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);

  // Get user's lot number
  const lotNumber = user?.lotNumber || user?.lotNumber;

  // Fetch bills from API
  useEffect(() => {
    if (!lotNumber) return;

    const fetchBills = async () => {
      try {
        const response = await fetch(`/api/bills/user/${encodeURIComponent(lotNumber)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bills');
        }
        const data = await response.json();
        setBills(data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load bills');
        console.error('Error fetching bills:', err);
      }
    };

    fetchBills();
  }, [lotNumber]);

  // Selected bill for details modal
  const [selectedBill, setSelectedBill] = useState(null);

  // Pagination calculation
  const totalPages = Math.ceil(bills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBills = bills.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalAmount = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
  const paidAmount = bills.filter(bill => bill.status === 'Paid').reduce((sum, bill) => sum + (bill.amount || 0), 0);
  const pendingAmount = bills.filter(bill => bill.status === 'Pending').reduce((sum, bill) => sum + (bill.amount || 0), 0);

  // Format currency (PHP)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Open bill details modal
  const viewBillDetails = (bill) => {
    setSelectedBill(bill);
  };

  // Close modal
  const closeModal = () => {
    setSelectedBill(null);
  };

  if (error) {
    return (
      <div className="billing-container">
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

  // Check if there are no bills at all
  const showEmptyState = bills.length === 0;

  return (
    <div className="billing-container">

      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Billing</h1>
          <p>View and manage your billing statements and payments</p>
        </div>
      </div>

      {/* Summary Cards - Always visible */}
      <div className="summary-section">
        <div className="summary-grid">
          <div className="summary-card total">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Total Bills</span>
              <span className="card-value">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="summary-card paid">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Paid</span>
              <span className="card-value">{formatCurrency(paidAmount)}</span>
            </div>
          </div>

          <div className="summary-card pending">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Pending</span>
              <span className="card-value">{formatCurrency(pendingAmount)}</span>
            </div>
          </div>
        </div>
      </div>



      {/* Table Section with Empty State */}
      <div className="table-section">
        {showEmptyState ? (
          <div className="empty-state">
            <div className="empty-state-icon billing-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div className="empty-state-content">
              <h2 className="empty-state-title">No Billing Statements Yet</h2>
              <p className="empty-state-description">
                You don't have any billing statements at the moment. Your bills will appear here once they are generated by the administration.
              </p>
              <div className="empty-state-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Check back later or contact the admin for assistance</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="user-table-container">
              <table className="bills-table">
                <thead>
                  <tr>
                    <th>Bill Number</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Paid Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBills.length > 0 ? (
                    paginatedBills.map(bill => (
                      <tr key={bill.id}>
                        <td className="bill-number">{bill.billNumber}</td>
                        <td className="description">{bill.description}</td>
                        <td className="amount">{formatCurrency(bill.amount)}</td>
                        <td className="due-date">{formatDate(bill.dueDate)}</td>
                        <td className="status">
                          <span className={`status-badge ${bill.status?.toLowerCase()}`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="paid-date">{formatDate(bill.paidDate)}</td>
                        <td className="actions">
                          <button className="view-btn" onClick={() => viewBillDetails(bill)} title="View Details">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-results">
                        <div className="no-results-content">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <p>No bills match your filters</p>
                          <p className="no-bills-hint">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="user-pagination">
                <button className="user-user-pagination-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                  </svg>
                </button>
                <button className="user-user-pagination-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                
                <div className="user-pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                      return false;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="user-pagination-ellipsis">...</span>
                        )}
                        <button
                          className={`user-pagination-page ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button className="user-user-pagination-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button className="user-user-pagination-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="user-modal-overlay" onClick={closeModal}>
          <div className="user-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal-header">
              <h2>Bill Details</h2>
              <button className="user-modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="user-modal-body">
              <div className="user-detail-row">
                <label>Bill Number:</label>
                <span>{selectedBill.billNumber}</span>
              </div>
              <div className="user-detail-row">
                <label>Description:</label>
                <span>{selectedBill.description}</span>
              </div>
              <div className="user-detail-row">
                <label>Amount:</label>
                <span className="amount">{formatCurrency(selectedBill.amount)}</span>
              </div>
              <div className="user-detail-row">
                <label>Due Date:</label>
                <span>{formatDate(selectedBill.dueDate)}</span>
              </div>
              <div className="user-detail-row">
                <label>Status:</label>
                <span className={`status-badge ${selectedBill.status?.toLowerCase()}`}>
                  {selectedBill.status}
                </span>
              </div>
              {selectedBill.paidDate && (
                <div className="user-detail-row">
                  <label>Paid Date:</label>
                  <span>{formatDate(selectedBill.paidDate)}</span>
                </div>
              )}
            </div>
            <div className="user-modal-footer">
              {selectedBill.status !== 'Paid' && (
                <a href="/user/payment" className="modal-btn pay">Pay Now</a>
              )}
              <button className="modal-btn close" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
