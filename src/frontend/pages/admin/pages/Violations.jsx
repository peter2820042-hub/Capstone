import React, { useState, useEffect } from 'react';
import './Violations.css';

function Violations() {
  const [violations, setViolations] = useState([]);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    violationType: '',
    block: '',
    lot: ''
  });

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    lotNumber: '',
    block: '',
    residentName: '',
    residentEmail: '',
    violationType: '',
    description: '',
    fine: ''
  });

  const violationTypes = [
    'Noise Violation',
    'Illegal Parking',
    'Property Damage',
    'Waste Disposal',
    'Pet Violation',
    'Noise after hours',
    'Unauthorized Construction',
    'Others'
  ];

  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/violations')
      .then(res => res.json())
      .then(data => setViolations(data || []))
      .catch(err => console.error('Error:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  const handleViewViolation = (violation) => {
    setSelectedViolation(violation);
    setShowViewModal(true);
  };

  const handleEditViolation = (violation) => {
    setSelectedViolation(violation);
    setFormData({
      lotNumber: violation.lotNumber || '',
      block: violation.block || '',
      residentName: violation.residentName || '',
      residentEmail: violation.residentEmail || '',
      violationType: violation.violationType || '',
      description: violation.description || '',
      fine: violation.fine || '',
      status: violation.status || 'pending'
    });
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`/api/violations/${selectedViolation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Violation updated successfully!' });
        fetch('/api/violations').then(res => res.json()).then(data => setViolations(data || []));
        setTimeout(() => {
          setShowEditModal(false);
          setMessage({ type: '', text: '' });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update violation' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Cannot connect to server' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteViolation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this violation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/violations/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Violation deleted successfully!' });
        fetch('/api/violations').then(res => res.json()).then(data => setViolations(data || []));
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete violation' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Cannot connect to server' });
    }
  };

  const handleResolve = async (violationId) => {
    try {
      const response = await fetch(`/api/violations/${violationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Violation resolved!' });
        fetch('/api/violations').then(res => res.json()).then(data => setViolations(data || []));
        setShowViewModal(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error resolving violation:', err);
    }
  };

  const handleMarkAsPaid = async (violationId) => {
    try {
      const response = await fetch(`/api/violations/${violationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Violation marked as paid!' });
        fetch('/api/violations').then(res => res.json()).then(data => setViolations(data || []));
        setShowViewModal(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  const filteredViolations = violations.filter(violation => {
    const { search, violationType, block, lot } = filters;
    
    if (!search && !violationType && !block && !lot) return true;
    
    if (search) {
      const searchLower = search.toLowerCase();
      if (!violation.lotNumber?.toLowerCase().includes(searchLower) &&
          !violation.residentName?.toLowerCase().includes(searchLower) &&
          !violation.violationType?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    if (violationType && violation.violationType !== violationType) return false;
    if (block) {
      const lotNum = violation.lotNumber || '';
      if (!lotNum.toUpperCase().startsWith(block.toUpperCase())) return false;
    }
    if (lot) {
      const lotNum = violation.lotNumber || '';
      const lotPart = lotNum.includes('-') ? lotNum.split('-')[1] : lotNum;
      if (!lotPart.includes(lot)) return false;
    }
    
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="violations-container">
      {/* Header */}
      <div className="violations-header">
        <div className="header-title">
          <h2>Violations</h2>
          <p className="header-subtitle">Manage and monitor community policy infractions</p>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="stats-row" style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{violations.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {violations.filter(v => v.status === 'pending').length}
            </span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {violations.filter(v => v.status === 'resolved').length}
            </span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {violations.filter(v => v.status === 'paid').length}
            </span>
            <span className="stat-label">Paid</span>
          </div>
        </div>
      </div>

      {/* Search/Filter */}
      <div className="search-filter-bar">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by lot, resident, or type..."
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <div className="filter-group">
          <label>Violation Type</label>
          <select
            value={filters.violationType || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, violationType: e.target.value }))}
          >
            <option value="">All Types</option>
            {violationTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Block</label>
          <input
            type="text"
            placeholder="Enter block..."
            value={filters.block || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, block: e.target.value }))}
          />
        </div>
        <div className="filter-group">
          <label>Lot</label>
          <input
            type="text"
            placeholder="Enter lot..."
            value={filters.lot || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, lot: e.target.value }))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="violations-table">
          <thead>
            <tr>
              <th>Resident Name</th>
              <th>Violation Type</th>
              <th>Fine</th>
              <th>Date Issued</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredViolations.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  {(filters.search || filters.violationType || filters.block || filters.lot) 
                    ? 'No violations found matching your search' 
                    : 'No violations logged yet'}
                </td>
              </tr>
            ) : (
              filteredViolations.map((violation) => (
                <tr key={violation.id}>
                  <td>{violation.residentName || '-'}</td>
                  <td>{violation.violationType || '-'}</td>
                  <td>{violation.fine ? `PHP ${parseFloat(violation.fine).toFixed(2)}` : '-'}</td>
                  <td>{formatDate(violation.dateIssued)}</td>
                  <td>
                    <span className={`status-badge ${violation.status}`}>
                      {violation.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                      <button
                        className="view-btn"
                        onClick={() => handleViewViolation(violation)}
                      >
                        View
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditViolation(violation)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteViolation(violation.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showViewModal && selectedViolation && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Violation Details</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Lot Number</label>
                  <span>{selectedViolation.lotNumber || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Block</label>
                  <span>{selectedViolation.block || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Resident Name</label>
                  <span>{selectedViolation.residentName || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Violation Type</label>
                  <span>{selectedViolation.violationType || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Fine Amount</label>
                  <span>
                    {selectedViolation.fine 
                      ? `PHP ${parseFloat(selectedViolation.fine).toFixed(2)}` 
                      : '-'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${selectedViolation.status}`}>
                    {selectedViolation.status}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <label>Description</label>
                  <span>{selectedViolation.description || '-'}</span>
                </div>
              </div>

              <div className="modal-actions">
                {selectedViolation.status === 'pending' && (
                  <>
                    <button
                      className="submit-btn"
                      onClick={() => handleResolve(selectedViolation.id)}
                    >
                      Resolve
                    </button>
                    <button
                      className="submit-btn paid-btn"
                      onClick={() => handleMarkAsPaid(selectedViolation.id)}
                    >
                      Mark Paid
                    </button>
                  </>
                )}
                <button
                  className="cancel-btn"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedViolation && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Violation</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="modal-form">
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Lot Number *</label>
                  <input
                    type="text"
                    name="lotNumber"
                    value={formData.lotNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Block *</label>
                  <input
                    type="text"
                    name="block"
                    value={formData.block}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Resident Name</label>
                <input
                  type="text"
                  name="residentName"
                  value={formData.residentName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Violation Type *</label>
                <select
                  name="violationType"
                  value={formData.violationType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type</option>
                  {violationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fine Amount</label>
                  <input
                    type="number"
                    name="fine"
                    value={formData.fine}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Violations;
