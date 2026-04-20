import React, { useState, useEffect } from 'react';
import './Violation.css';

function Violation(props) {
  // Get user from props or fall back to sessionStorage
  const user = props.user || JSON.parse(sessionStorage.getItem('user') || '{}');
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Violations data - will be fetched from database
  const [violations, setViolations] = useState([]);
  const [error, setError] = useState(null);

  // Selected violation for details
  const [selectedViolation, setSelectedViolation] = useState(null);

  // Fetch violations from database
  useEffect(() => {
    const fetchViolations = async () => {
      try {
        // Get lot number from user prop
        const lotNumber = user?.lotNumber;
        
        if (lotNumber) {
          const response = await fetch(`/api/violations/user/${encodeURIComponent(lotNumber)}`);
          const data = await response.json();
          
          // Map API response to frontend format
          const mappedData = data.map(v => ({
            id: v.id,
            violationId: `VIO-${String(v.id).padStart(4, '0')}`,
            type: v.violationType,
            description: v.description,
            location: `Lot ${v.lotNumber}`,
            date: v.dateIssued,
            fine: parseFloat(v.penalty) || 0,
            status: v.status || 'pending'
          }));
          
          setViolations(mappedData);
        } else {
          setViolations([]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch violations');
        console.error('Error fetching violations:', err);
      }
    };

    fetchViolations();
  }, [user?.lotNumber]);

  // Pagination
  const totalPages = Math.ceil(violations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedViolations = violations.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals
  const totalFines = violations.reduce((sum, v) => sum + v.fine, 0);
  const paidFines = violations.filter(v => v.status === 'Paid').reduce((sum, v) => sum + v.fine, 0);
  const pendingFines = violations.filter(v => v.status === 'Pending').reduce((sum, v) => sum + v.fine, 0);

  // Format currency (PHP)
  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount).toFixed(2)}`;
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
      ...violations.map(v => [
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

  // Check if there are no violations at all
  const showEmptyState = violations.length === 0;

  return (
    <div className="violation-container">

      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Violations</h1>
          <p>View and manage your violation records and fines</p>
        </div>
        <div className="header-actions">
          {!showEmptyState && (
            <button className="export-btn" onClick={exportToCSV}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards - Always visible */}
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
              <span className="card-hint">{violations.length} violation(s)</span>
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
              <span className="card-hint">{violations.filter(v => v.status === 'Paid').length} violation(s)</span>
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
              <span className="card-hint">{violations.filter(v => v.status === 'Pending').length} violation(s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section with Empty State */}
      <div className="violations-table-section">
        {showEmptyState ? (
          <div className="empty-state">
            <div className="empty-state-icon violation-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="empty-state-content">
              <h2 className="empty-state-title">No Violations Yet</h2>
              <p className="empty-state-description">
                Good news! You don't have any recorded violations. Continue following the community guidelines to keep your record clean.
              </p>
              <div className="empty-state-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Violations will appear here automatically when issued</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="user-table-header">
              <div className="user-table-info">
                <span className="results-count">
                  Showing {violations.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, violations.length)} of {violations.length} violations
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

            <div className="user-table-container">
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
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <p>No violations found</p>
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
                <button
                  className="user-user-pagination-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                  </svg>
                </button>
                <button
                  className="user-user-pagination-btn"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
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

                <button
                  className="user-user-pagination-btn"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button
                  className="user-user-pagination-btn"
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
          </>
        )}
      </div>

      {/* Violation Details Modal */}
      {selectedViolation && (
        <div className="user-modal-overlay" onClick={closeModal}>
          <div className="user-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal-header">
              <h2>Violation Details</h2>
              <button className="user-modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="user-modal-body">
              <div className="user-detail-row">
                <label>Violation ID:</label>
                <span>{selectedViolation.violationId}</span>
              </div>
              <div className="user-detail-row">
                <label>Type:</label>
                <span className={`type-badge ${selectedViolation.type.toLowerCase().replace(' ', '-')}`}>
                  {selectedViolation.type}
                </span>
              </div>
              <div className="user-detail-row">
                <label>Description:</label>
                <span>{selectedViolation.description}</span>
              </div>
              <div className="user-detail-row">
                <label>Location:</label>
                <span>{selectedViolation.location}</span>
              </div>
              <div className="user-detail-row">
                <label>Date:</label>
                <span>{formatDate(selectedViolation.date)}</span>
              </div>
              <div className="user-detail-row">
                <label>Fine:</label>
                <span className="fine">{formatCurrency(selectedViolation.fine)}</span>
              </div>
              <div className="user-detail-row">
                <label>Status:</label>
                <span className={`status-badge ${selectedViolation.status.toLowerCase()}`}>
                  {selectedViolation.status}
                </span>
              </div>
              {selectedViolation.notes && (
                <div className="user-detail-row">
                  <label>Notes:</label>
                  <span>{selectedViolation.notes}</span>
                </div>
              )}
            </div>
            <div className="user-modal-footer">
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
