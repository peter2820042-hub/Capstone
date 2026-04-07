import React, { useState, useEffect, useMemo } from 'react';
import './Billing.css';

function Billing() {
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bills data - will be fetched from database
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected bill for details
  const [selectedBill, setSelectedBill] = useState(null);

  // TODO: Fetch bills from database
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/user/bills');
        // const data = await response.json();
        // setBills(data);
        
        // For now, set empty array until database is connected
        setBills([]);
        setError(null);
      } catch (err) {
        setError('Failed to fetch bills');
        console.error('Error fetching bills:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  // Get unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    return [...new Set(bills.map(bill => bill.status))];
  }, [bills]);

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // Date filter
      if (dateFrom && bill.dueDate < dateFrom) return false;
      if (dateTo && bill.dueDate > dateTo) return false;

      // Status filter
      if (statusFilter && bill.status !== statusFilter) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDescription = bill.description.toLowerCase().includes(query);
        const matchesBillNumber = bill.billNumber.toLowerCase().includes(query);
        if (!matchesDescription && !matchesBillNumber) return false;
      }

      return true;
    });
  }, [bills, dateFrom, dateTo, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBills = filteredBills.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = filteredBills.filter(bill => bill.status === 'Paid').reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = filteredBills.filter(bill => bill.status === 'Pending').reduce((sum, bill) => sum + bill.amount, 0);
  const overdueAmount = filteredBills.filter(bill => bill.status === 'Overdue').reduce((sum, bill) => sum + bill.amount, 0);

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

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Bill Number', 'Description', 'Amount', 'Due Date', 'Status', 'Paid Date'];
    const csvContent = [
      headers.join(','),
      ...filteredBills.map(bill => [
        bill.billNumber,
        `"${bill.description}"`,
        bill.amount,
        bill.dueDate,
        bill.status,
        bill.paidDate || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `billing_history_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // View bill details
  const viewBillDetails = (bill) => {
    setSelectedBill(bill);
  };

  const closeModal = () => {
    setSelectedBill(null);
  };

  // Clear filters
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setStatusFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="billing-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading bills...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="billing-container">

      {/* Summary Cards */}
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
              <span className="card-hint">{filteredBills.length} bill(s)</span>
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
              <span className="card-hint">{filteredBills.filter(b => b.status === 'Paid').length} bill(s)</span>
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
              <span className="card-hint">{filteredBills.filter(b => b.status === 'Pending').length} bill(s)</span>
            </div>
          </div>

          <div className="summary-card overdue">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Overdue</span>
              <span className="card-value">{formatCurrency(overdueAmount)}</span>
              <span className="card-hint">{filteredBills.filter(b => b.status === 'Overdue').length} bill(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <h2>Filters</h2>
          <button className="clear-filters-btn" onClick={clearFilters}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear Filters
          </button>
        </div>
        <div className="filters-grid">
          {/* Search */}
          <div className="filter-group search-group">
            <label>Search</label>
            <div className="search-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Date From */}
          <div className="filter-group">
            <label>Due Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="filter-group">
            <label>Due Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bills-table-section">
        <div className="table-header">
          <div className="table-info">
            <span className="results-count">
              Showing {filteredBills.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredBills.length)} of {filteredBills.length} bills
            </span>
          </div>
          <div className="items-per-page">
            <label>Show:</label>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="table-container">
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
                    <td className="bill-number-cell">{bill.billNumber}</td>
                    <td className="description-cell">{bill.description}</td>
                    <td className="amount-cell">{formatCurrency(bill.amount)}</td>
                    <td className="date-cell">{formatDate(bill.dueDate)}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${bill.status.toLowerCase()}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="date-cell">
                      {bill.paidDate ? formatDate(bill.paidDate) : '-'}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="view-btn"
                        onClick={() => viewBillDetails(bill)}
                        title="View Details"
                      >
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
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <p>No bills found</p>
                      {bills.length === 0 && (
                        <p className="no-bills-hint">Your billing statements will appear here once the database is connected</p>
                      )}
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
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            
            <div className="pagination-pages">
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
                      <span className="pagination-ellipsis">...</span>
                    )}
                    <button
                      className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bill Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Bill Number:</label>
                <span>{selectedBill.billNumber}</span>
              </div>
              <div className="detail-row">
                <label>Description:</label>
                <span>{selectedBill.description}</span>
              </div>
              <div className="detail-row">
                <label>Amount:</label>
                <span className="amount">{formatCurrency(selectedBill.amount)}</span>
              </div>
              <div className="detail-row">
                <label>Due Date:</label>
                <span>{formatDate(selectedBill.dueDate)}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status-badge ${selectedBill.status.toLowerCase()}`}>
                  {selectedBill.status}
                </span>
              </div>
              {selectedBill.paidDate && (
                <div className="detail-row">
                  <label>Paid Date:</label>
                  <span>{formatDate(selectedBill.paidDate)}</span>
                </div>
              )}
              {selectedBill.notes && (
                <div className="detail-row">
                  <label>Notes:</label>
                  <span>{selectedBill.notes}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedBill.status !== 'Paid' && (
                <a href="/user/payment" className="modal-btn pay">
                  Pay Now
                </a>
              )}
              <button className="modal-btn close" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
