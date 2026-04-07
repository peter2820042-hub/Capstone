import React, { useState, useEffect } from 'react';
import './Violations.css';

function Violations() {
  // Violations data
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch violations from API
  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/violations');
        if (!response.ok) throw new Error('Failed to fetch violations');
        const data = await response.json();
        setViolations(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching violations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchViolations();
  }, []);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [lotFilter, setLotFilter] = useState('');
  const [residentFilter, setResidentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [violationTypeFilter, setViolationTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);

  // Get unique violation types for filter dropdown
  const violationTypes = [...new Set(violations.map(v => v.violationType))];

  // Filter violations based on all criteria
  const filteredViolations = violations.filter(violation => {
    const matchesSearch = 
      violation.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.violationType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLot = lotFilter === '' || violation.lotNumber.toLowerCase().includes(lotFilter.toLowerCase());
    const matchesResident = residentFilter === '' || violation.residentName.toLowerCase().includes(residentFilter.toLowerCase());
    const matchesViolationType = violationTypeFilter === '' || violation.violationType === violationTypeFilter;
    const matchesStatus = statusFilter === '' || violation.status === statusFilter;
    
    let matchesDateRange = true;
    if (dateFrom && dateTo) {
      const violationDate = new Date(violation.dateIssued);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      matchesDateRange = violationDate >= fromDate && violationDate <= toDate;
    } else if (dateFrom) {
      matchesDateRange = new Date(violation.dateIssued) >= new Date(dateFrom);
    } else if (dateTo) {
      matchesDateRange = new Date(violation.dateIssued) <= new Date(dateTo);
    }

    return matchesSearch && matchesLot && matchesResident && matchesViolationType && matchesStatus && matchesDateRange;
  });

  // Handle view details
  const handleViewDetails = (violation) => {
    setSelectedViolation(violation);
    setShowViewModal(true);
  };

  // Handle edit
  const handleEdit = (violation) => {
    setSelectedViolation(violation);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = (violation) => {
    setSelectedViolation(violation);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    setViolations(violations.filter(v => v.id !== selectedViolation.id));
    setShowDeleteModal(false);
    setSelectedViolation(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setLotFilter('');
    setResidentFilter('');
    setDateFrom('');
    setDateTo('');
    setViolationTypeFilter('');
    setStatusFilter('');
  };

  // Clear violations data
  const clearViolations = async () => {
    if (!window.confirm('Are you sure you want to clear all violations data? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/clear-violations', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setViolations([]);
        alert('Violations data cleared successfully');
      } else {
        alert('Failed to clear violations');
      }
    } catch (err) {
      console.error('Error clearing violations:', err);
      alert('Error clearing violations');
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-badge pending';
      case 'resolved':
        return 'status-badge resolved';
      case 'under_review':
        return 'status-badge under-review';
      default:
        return 'status-badge';
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="violations-container">

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <h2>Search & Filter</h2>
          <div className="header-buttons">
            <button className="clear-data-btn" onClick={clearViolations}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Clear Data
            </button>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
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
                placeholder="Search by lot, resident, or violation type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lot Number Filter */}
          <div className="filter-group">
            <label htmlFor="lotFilter">Lot Number</label>
            <input
              type="text"
              id="lotFilter"
              placeholder="Filter by lot number"
              value={lotFilter}
              onChange={(e) => setLotFilter(e.target.value)}
            />
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

          {/* Violation Type Filter */}
          <div className="filter-group">
            <label htmlFor="violationTypeFilter">Violation Type</label>
            <select
              id="violationTypeFilter"
              value={violationTypeFilter}
              onChange={(e) => setViolationTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {violationTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
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
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Violations Table Section */}
      <div className="violations-table-section">
        <div className="table-header">
          <h2>Violations List</h2>
          <div className="table-info">
            Showing {filteredViolations.length} of {violations.length} violations
          </div>
        </div>

        <div className="table-container">
          <table className="violations-table">
            <thead>
              <tr>
                <th>Lot Number</th>
                <th>Resident Name</th>
                <th>Violation Type</th>
                <th>Date Issued</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredViolations.length > 0 ? (
                filteredViolations.map((violation) => (
                  <tr key={violation.id}>
                    <td>
                      <span className="lot-number">{violation.lotNumber}</span>
                    </td>
                    <td>{violation.residentName}</td>
                    <td>{violation.violationType}</td>
                    <td>{new Date(violation.dateIssued).toLocaleDateString()}</td>
                    <td>
                      <span className={getStatusBadgeClass(violation.status)}>
                        {formatStatus(violation.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetails(violation)}
                          title="View Details"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(violation)}
                          title="Edit"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(violation)}
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    <div className="no-results-content">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                      <p>No violations found matching your criteria</p>
                      <button onClick={clearFilters}>Clear Filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedViolation && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Violation Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Lot Number:</label>
                <span>{selectedViolation.lotNumber}</span>
              </div>
              <div className="detail-row">
                <label>Resident Name:</label>
                <span>{selectedViolation.residentName}</span>
              </div>
              <div className="detail-row">
                <label>Violation Type:</label>
                <span>{selectedViolation.violationType}</span>
              </div>
              <div className="detail-row">
                <label>Date Issued:</label>
                <span>{new Date(selectedViolation.dateIssued).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={getStatusBadgeClass(selectedViolation.status)}>
                  {formatStatus(selectedViolation.status)}
                </span>
              </div>
              <div className="detail-row">
                <label>Description:</label>
                <span>{selectedViolation.description}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedViolation && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Violation</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Lot Number</label>
                <input type="text" defaultValue={selectedViolation.lotNumber} />
              </div>
              <div className="form-group">
                <label>Resident Name</label>
                <input type="text" defaultValue={selectedViolation.residentName} />
              </div>
              <div className="form-group">
                <label>Violation Type</label>
                <input type="text" defaultValue={selectedViolation.violationType} />
              </div>
              <div className="form-group">
                <label>Date Issued</label>
                <input type="date" defaultValue={selectedViolation.dateIssued} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select defaultValue={selectedViolation.status}>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea defaultValue={selectedViolation.description} rows="3"></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => setShowEditModal(false)}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedViolation && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <p>Are you sure you want to delete this violation?</p>
                <p className="delete-details">
                  <strong>{selectedViolation.violationType}</strong> for <strong>{selectedViolation.residentName}</strong> at <strong>{selectedViolation.lotNumber}</strong>
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Violations;
