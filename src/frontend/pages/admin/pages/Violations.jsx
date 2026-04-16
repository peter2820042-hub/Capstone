import React, { useState, useEffect } from 'react';
import './Violations.css';

function Violations() {
  const [violations, setViolations] = useState([]);
  const [residents, setResidents] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    lotNumber: '',
    block: '',
    residentName: '',
    violationType: '',
    description: '',
    penalty: '',
    dateIssued: new Date().toISOString().split('T')[0]
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
    
    // Fetch residents for Block/Lot lookup
    fetch('/api/residents')
      .then(res => res.json())
      .then(data => {
        setResidents(data || []);
        setFilteredResidents(data || []);
      })
      .catch(err => console.error('Error fetching residents:', err));
  }, []);

  // Get unique blocks from residents
  const uniqueBlocks = [...new Set(residents.map(r => r.block).filter(Boolean))].sort();

  // Handle block selection change
  const handleBlockChange = (e) => {
    const selectedBlock = e.target.value;
    setFormData(prev => ({ ...prev, block: selectedBlock, lotNumber: '', residentName: '' }));
  };

  // Handle lot selection change
  const handleLotChange = (e) => {
    const selectedLot = e.target.value;
    const { block } = formData;
    const resident = residents.find(r => r.block === block && r.lotNumber === selectedLot);
    if (resident) {
      setFormData(prev => ({
        ...prev,
        lotNumber: selectedLot,
        residentName: resident.fullName || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, lotNumber: selectedLot, residentName: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    // Get user from localStorage for authorization
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const response = await fetch('/api/violations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user': JSON.stringify(user)
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Violation added successfully!' });
        setFormData({
          lotNumber: '',
          block: '',
          residentName: '',
          violationType: '',
          description: '',
          fine: '',
          status: 'pending'
        });
        fetch('/api/violations').then(res => res.json()).then(data => setViolations(data || []));
        setTimeout(() => {
          setShowAddModal(false);
          setMessage({ type: '', text: '' });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add violation' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Cannot connect to server' });
    } finally {
      setSubmitting(false);
    }
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
      violationType: violation.violationType || '',
      description: violation.description || '',
      penalty: violation.fine || '',
      dateIssued: violation.dateIssued ? violation.dateIssued.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const handleDeleteViolation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this violation?')) {
      return;
    }

    // Get user from localStorage for authorization
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const response = await fetch(`/api/violations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user': JSON.stringify(user)
        }
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

  // Show all violations
  const filteredViolations = violations;

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
          <p className="header-subtitle">Manage and monitor community policy infractions</p>
        </div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Violation
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Stats - KPIs removed */}

      {/* Table */}
      <div className="admin-admin-table-container">
        <table className="violations-table">
          <thead>
            <tr>
              <th>Resident Name</th>
              <th>Block</th>
              <th>Lot</th>
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
                <td colSpan="8" className="admin-admin-empty-row">
                  </td>
              </tr>
            ) : (
              filteredViolations.map((violation) => (
                <tr key={violation.id}>
                  <td>{violation.residentName || '-'}</td>
                  <td>{violation.block || '-'}</td>
                  <td>{violation.lotNumber || '-'}</td>
                  <td>{violation.violationType || '-'}</td>
                  <td>{violation.fine ? `₱${parseFloat(violation.fine).toFixed(2)}` : '-'}</td>
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
        <div className="admin-admin-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-admin-modal-header">
              <h3>Violation Details</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>X</button>
            </div>
            <div className="admin-admin-modal-content">
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
                      ? `₱${parseFloat(selectedViolation.fine).toFixed(2)}` 
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

              <div className="admin-admin-modal-actions">
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
        <div className="admin-admin-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-admin-modal-header">
              <h3>Edit Violation</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>X</button>
            </div>
            <form className="admin-admin-modal-content" onSubmit={handleSubmit} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Block</label>
                  <select name="block" value={formData.block} onChange={handleBlockChange}>
                    <option value="">Select Block</option>
                    {uniqueBlocks.map(block => (
                      <option key={block} value={block}>{block}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Lot Number</label>
                  <select name="lotNumber" value={formData.lotNumber} onChange={handleLotChange}>
                    <option value="">Select Lot</option>
                    {filteredResidents.map(resident => (
                      <option key={resident.lotNumber} value={resident.lotNumber}>{resident.lotNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Resident Name</label>
                  <input type="text" name="residentName" value={formData.residentName} onChange={handleChange} readOnly />
                </div>
                <div className="form-group">
                  <label>Violation Type</label>
                  <select name="violationType" value={formData.violationType} onChange={handleChange}>
                    <option value="">Select Type</option>
                    {violationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fine Amount</label>
                  <input type="number" name="penalty" value={formData.penalty} onChange={handleChange} step="0.01" />
                </div>
                <div className="form-group">
                  <label>Date Issued</label>
                  <input type="date" name="dateIssued" value={formData.dateIssued} onChange={handleChange} />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="admin-admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-admin-modal-header">
              <h3>Add New Violation</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>X</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-admin-modal-form" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="admin-admin-form-row">
                <div className="admin-admin-form-group">
                  <label>Block *</label>
                  <select name="block" value={formData.block} onChange={handleBlockChange} required>
                    <option value="">Select Block</option>
                    {uniqueBlocks.map((block) => (<option key={block} value={block}>{block}</option>))}
                  </select>
                </div>
                <div className="admin-admin-form-group">
                  <label>Lot Number *</label>
                  <select name="lotNumber" value={formData.lotNumber} onChange={handleLotChange} required>
                    <option value="">Select Lot</option>
                    {filteredResidents.map((resident) => (<option key={resident.lotNumber} value={resident.lotNumber}>{resident.lotNumber}</option>))}
                  </select>
                </div>
              </div>

              <div className="admin-admin-form-group">
                <label>Resident Name</label>
                <input type="text" name="residentName" value={formData.residentName} onChange={handleChange} />
              </div>

              <div className="admin-admin-form-group">
                <label>Violation Type *</label>
                <select name="violationType" value={formData.violationType} onChange={handleChange} required>
                  <option value="">Select type</option>
                  {violationTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                </select>
              </div>

              <div className="admin-admin-form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
              </div>

              <div className="admin-admin-form-group">
                <label>Fine Amount</label>
                <input type="number" name="penalty" value={formData.penalty} onChange={handleChange} min="0" step="0.01" />
              </div>
              <div className="admin-admin-form-group">
                
              </div>

              <div className="admin-admin-modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? 'Sending...' : 'Send'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Violations;
