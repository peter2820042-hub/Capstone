import React, { useState, useEffect, useMemo } from 'react';
import './Violation.css';

function Violation() {
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Violations data - will be fetched from database
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected violation for details
  const [selectedViolation, setSelectedViolation] = useState(null);

  // TODO: Fetch violations from database
  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/user/violations');
        // const data = await response.json();
        // setViolations(data);
        
        // For now, set empty array until database is connected
        setViolations([]);
        setError(null);
      } catch (err) {
        setError('Failed to fetch violations');
        console.error('Error fetching violations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchViolations();
  }, []);

  // Get unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    return [...new Set(violations.map(v => v.status))];
  }, [violations]);

  // Filter violations
  const filteredViolations = useMemo(() => {
    return violations.filter(violation => {
      // Date filter
      if (dateFrom && violation.date < dateFrom) return false;
      if (dateTo && violation.date > dateTo) return false;

      // Status filter
      if (statusFilter && violation.status !== statusFilter) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesType = violation.type.toLowerCase().includes(query);
        const matchesDescription = violation.description.toLowerCase().includes(query);
        const matchesLocation = violation.location.toLowerCase().includes(query);
        if (!matchesType && !matchesDescription && !matchesLocation) return false;
      }

      return true;
    });
  }, [violations, dateFrom, dateTo, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredViolations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedViolations = filteredViolations.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalFines = filteredViolations.reduce((sum, v) => sum + v.fine, 0);
  const paidFines = filteredViolations.filter(v => v.status === 'Paid').reduce((sum, v) => sum + v.fine, 0);
  const pendingFines = filteredViolations.filter(v => v.status === 'Pending').reduce((sum, v) => sum + v.fine, 0);

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
    const headers = ['Violation ID', 'Type', 'Description', 'Location', 'Date', 'Fine', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredViolations.map(v => [
        v.violationId,
        v.type,
        `"${v.description}"`,
        v.location,
        v.date,
        v.fine,
        v.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `violations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // View violation details
  const viewViolationDetails = (violation) => {
    setSelectedViolation(violation);
  };

  const closeModal = () => {
    setSelectedViolation(null);
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
      <div className="violation-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading violations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="violation-container">
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
    <div className="violation-container">

      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-grid">
          <div className="summary-card total">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Total Fines</span>
              <span className="card-value">{formatCurrency(totalFines)}</span>
              <span className="card-hint">{filteredViolations.length} violation(s)</span>
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
              <span className="card-value">{formatCurrency(paidFines)}</span>
              <span className="card-hint">{filteredViolations.filter(v => v.status === 'Paid').length} violation(s)</span>
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
              <span className="card-value">{formatCurrency(pendingFines)}</span>
              <span className="card-hint">{filteredViolations.filter(v => v.status === 'Pending').length} violation(s)</span>
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
                placeholder="Search violations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Date From */}
          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="filter-group">
            <label>Date To</label>
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

      {/* Violations Table */}
      <div className="violations-table-section">
        <div className="table-header">
          <div className="table-info">
            <span className="results-count">
              Showing {filteredViolations.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredViolations.length)} of {filteredViolations.length} violations
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
          <table className="violations-table">
            <thead>
              <tr>
                <th>Violation ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Location</th>
                <th>Date</th>
                <th>Fine</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedViolations.length > 0 ? (
                paginatedViolations.map(violation => (
                  <tr key={violation.id}>
                    <td className="violation-id-cell">{violation.violationId}</td>
                    <td className="type-cell">
                      <span className={`type-badge ${violation.type.toLowerCase().replace(' ', '-')}`}>
                        {violation.type}
                      </span>
                    </td>
                    <td className="description-cell">{violation.description}</td>
                    <td className="location-cell">{violation.location}</td>
                    <td className="date-cell">{formatDate(violation.date)}</td>
                    <td className="fine-cell">{formatCurrency(violation.fine)}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${violation.status.toLowerCase()}`}>
                        {violation.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="view-btn"
                        onClick={() => viewViolationDetails(violation)}
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
                  <td colSpan="8" className="no-results">
                    <div className="no-results-content">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <p>No violations found</p>
                      {violations.length === 0 && (
                        <p className="no-violations-hint">Your violation records will appear here once the database is connected</p>
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

      {/* Violation Details Modal */}
      {selectedViolation && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Violation Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Violation ID:</label>
                <span>{selectedViolation.violationId}</span>
              </div>
              <div className="detail-row">
                <label>Type:</label>
                <span className={`type-badge ${selectedViolation.type.toLowerCase().replace(' ', '-')}`}>
                  {selectedViolation.type}
                </span>
              </div>
              <div className="detail-row">
                <label>Description:</label>
                <span>{selectedViolation.description}</span>
              </div>
              <div className="detail-row">
                <label>Location:</label>
                <span>{selectedViolation.location}</span>
              </div>
              <div className="detail-row">
                <label>Date:</label>
                <span>{formatDate(selectedViolation.date)}</span>
              </div>
              <div className="detail-row">
                <label>Fine:</label>
                <span className="fine">{formatCurrency(selectedViolation.fine)}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`status-badge ${selectedViolation.status.toLowerCase()}`}>
                  {selectedViolation.status}
                </span>
              </div>
              {selectedViolation.notes && (
                <div className="detail-row">
                  <label>Notes:</label>
                  <span>{selectedViolation.notes}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedViolation.status !== 'Paid' && (
                <a href="/user/payment" className="modal-btn pay">
                  Pay Fine
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

export default Violation;
