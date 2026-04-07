import React, { useState, useEffect } from 'react';
import './Violations.css';

function Violations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    lotNumber: '',
    residentName: '',
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

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/violations');
      const data = await response.json();
      setViolations(data.violations || []);
    } catch (error) {
      console.error('Error fetching violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:3001/api/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dateIssued: new Date().toISOString(),
          status: 'pending'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Violation logged successfully!' });
        setFormData({
          lotNumber: '',
          residentName: '',
          violationType: '',
          description: '',
          fine: ''
        });
        fetchViolations();
        setTimeout(() => setShowAddModal(false), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to log violation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Cannot connect to server' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewViolation = (violation) => {
    setSelectedViolation(violation);
    setShowViewModal(true);
  };

  const filteredViolations = violations.filter(violation => {
    const search = searchTerm.toLowerCase();
    return (
      violation.lotNumber?.toLowerCase().includes(search) ||
      violation.residentName?.toLowerCase().includes(search) ||
      violation.violationType?.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="violations-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading violations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="violations-container">
      {/* Header */}
      <div className="violations-header">
        <h2>Violation Management</h2>
        <button 
          className="add-btn"
          onClick={() => setShowAddModal(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Log Violation
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{violations.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-value">
            {violations.filter(v => v.status === 'pending').length}
          </span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card resolved">
          <span className="stat-value">
            {violations.filter(v => v.status === 'resolved').length}
          </span>
          <span className="stat-label">Resolved</span>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by lot, resident, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
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
            {filteredViolations.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  {searchTerm ? 'No violations found' : 'No violations logged yet'}
                </td>
              </tr>
            ) : (
              filteredViolations.map((violation) => (
                <tr key={violation.id}>
                  <td>{violation.lotNumber}</td>
                  <td>{violation.residentName}</td>
                  <td>{violation.violationType}</td>
                  <td>{formatDate(violation.dateIssued)}</td>
                  <td>
                    <span className={`status-badge ${violation.status}`}>
                      {violation.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => handleViewViolation(violation)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Violation Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log New Violation</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="modal-form">
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
                    placeholder="e.g., A-101"
                  />
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
                  rows="4"
                  placeholder="Describe the violation..."
                />
              </div>

              <div className="form-group">
                <label>Fine Amount (PHP)</label>
                <input
                  type="number"
                  name="fine"
                  value={formData.fine}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Log Violation'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Violation Modal */}
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
                  <span className="detail-label">ID</span>
                  <span className="detail-value">{selectedViolation.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Lot Number</span>
                  <span className="detail-value">{selectedViolation.lotNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Resident Name</span>
                  <span className="detail-value">{selectedViolation.residentName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Violation Type</span>
                  <span className="detail-value">{selectedViolation.violationType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Description</span>
                  <span className="detail-value">{selectedViolation.description || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fine Amount</span>
                  <span className="detail-value">
                    {selectedViolation.fine 
                      ? `PHP ${parseFloat(selectedViolation.fine).toFixed(2)}` 
                      : 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date Issued</span>
                  <span className="detail-value">{formatDate(selectedViolation.dateIssued)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge ${selectedViolation.status}`}>
                    {selectedViolation.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Violations;
