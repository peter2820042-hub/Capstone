import React, { useState, useEffect } from 'react';
import './Violations.css';

function Violations() {
  const [violations, setViolations] = useState([]);
  const [residents, setResidents] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Add Modal - Resident search
  const [residentSearch, setResidentSearch] = useState('');

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
    setResidentSearch('');
  };

  // Handle resident search in Add Modal
  const handleResidentSearchChange = (e) => {
    setResidentSearch(e.target.value);
    setFormData(prev => ({ ...prev, block: '', lotNumber: '', residentName: '' }));
  };

  // Filter residents for Add Modal based on search
  const searchedResidents = residents.filter(resident => {
    if (!residentSearch) return true;
    const search = residentSearch.toLowerCase();
    return (
      (resident.fullName && resident.fullName.toLowerCase().includes(search)) ||
      (resident.lotNumber && resident.lotNumber.toLowerCase().includes(search)) ||
      (resident.block && resident.block.toLowerCase().includes(search))
    );
  });

  // Handle selecting a resident from search results
  const handleResidentSelect = (resident) => {
    setFormData(prev => ({
      ...prev,
      block: resident.block,
      lotNumber: resident.lotNumber,
      residentName: resident.fullName || ''
    }));
    setResidentSearch('');
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

    // Get user from sessionStorage for authorization
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

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
        // Also create a bill if there's a penalty amount
        if (formData.penalty && parseFloat(formData.penalty) > 0) {
          const billData = {
            lotNumber: formData.lotNumber,
            block: formData.block,
            residentName: formData.residentName,
            billType: 'Violations',
            amount: parseFloat(formData.penalty),
            dueDate: formData.dateIssued,
            billingPeriod: formData.violationType,
            status: 'pending'
          };

          await fetch('/api/bills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(billData)
          });
        }

        setMessage({ type: 'success', text: 'Violation added successfully! Bill created for penalty amount.' });
        setFormData({
          lotNumber: '',
          block: '',
          residentName: '',
          violationType: '',
          description: '',
          penalty: '',
          dateIssued: new Date().toISOString().split('T')[0]
        });
        setResidentSearch('');
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

    // Get user from sessionStorage for authorization
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

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

  // Filter violations based on search and filter criteria
  const filteredViolations = violations.filter(violation => {
    const matchesSearch = searchQuery === '' || 
      (violation.residentName && violation.residentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (violation.lotNumber && violation.lotNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (violation.block && violation.block.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (violation.violationType && violation.violationType.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === '' || violation.status === filterStatus;
    const matchesType = filterType === '' || violation.violationType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
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
    <div className="billing-container">
      {/* Header */}
      <div className="sr-header">
        <div className="sr-title">
          <p className="sr-subtitle">Manage and monitor community policy infractions</p>
        </div>
        <button className="sr-add-btn" onClick={() => setShowAddModal(true)}>
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

      {/* Search and Filter Bar */}
      <div className="sr-search-filter-bar">
        <div className="sr-filters-row">
          <div className="sr-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name, block, lot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sr-filter-group">
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="sr-filter-group">
            <label>Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              {violationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="sr-buttons-row">
          <button className="sr-search-btn" onClick={() => setCurrentPage(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Search
          </button>
          <button
            className="sr-reset-btn"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('');
              setFilterType('');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Table Section */}
      <section className="sr-table-section">
        <h3 className="sr-table-title">Violations List</h3>
        <div className="sr-table-container">
          <table className="sr-table">
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
                <td colSpan={8} className="sr-empty-row">
                  No violations found
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
                    <span className={`sr-status-badge status-${violation.status}`}>
                      {violation.status}
                    </span>
                  </td>
                  <td>
                    <div className="sr-table-actions" style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                      <button
                        className="sr-view-btn"
                        onClick={() => handleViewViolation(violation)}
                      >
                        View
                      </button>
                      <button
                        className="sr-edit-btn"
                        onClick={() => handleEditViolation(violation)}
                      >
                        Edit
                      </button>
                      <button
                        className="sr-delete-btn"
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
      </section>

      {/* View Modal */}
      {showViewModal && selectedViolation && (
        <div className="billing-admin-admin-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="billing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="billing-admin-admin-modal-header">
              <h2>Violation Details</h2>
              <button className="billing-admin-admin-modal-close" onClick={() => setShowViewModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="admin-admin-modal-body">
              <div className="bill-detail-header">
                <h3>{selectedViolation.violationType}</h3>
                <p className="bill-ref">Status: {selectedViolation.status}</p>
              </div>

              <div className="bill-detail-list">
                <div className="bill-detail-row">
                  <span className="detail-label">Resident Name</span>
                  <span className="detail-value">{selectedViolation.residentName || 'N/A'}</span>
                </div>
                <div className="bill-detail-row">
                  <span className="detail-label">Lot Number</span>
                  <span className="detail-value">{selectedViolation.lotNumber || 'N/A'}</span>
                </div>
                <div className="bill-detail-row">
                  <span className="detail-label">Block</span>
                  <span className="detail-value">{selectedViolation.block || 'N/A'}</span>
                </div>
                <div className="bill-detail-row">
                  <span className="detail-label">Date Issued</span>
                  <span className="detail-value">{formatDate(selectedViolation.dateIssued)}</span>
                </div>
                <div className="bill-detail-row">
                  <span className="detail-label">Fine Amount</span>
                  <span className="detail-value">
                    {selectedViolation.fine 
                      ? `₱${parseFloat(selectedViolation.fine).toFixed(2)}` 
                      : 'N/A'}
                  </span>
                </div>
                <div className="bill-detail-row total-row">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status-${(selectedViolation.status || 'unpaid').toLowerCase()}`}>
                    {selectedViolation.status}
                  </span>
                </div>
                <div className="bill-detail-row">
                  <span className="detail-label">Description</span>
                  <span className="detail-value">{selectedViolation.description || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="billing-admin-admin-modal-footer">
              <button className="billing-admin-admin-btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedViolation && (
        <div className="sr-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="sr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sr-modal-header">
              <h3 style={{ textAlign: 'center', flex: 1 }}>Edit Violation</h3>
              <button className="sr-modal-close" onClick={() => setShowEditModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="sr-modal-form">
              {message.text && (
                <div className={`admin-admin-form-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="sr-form-row">
                <div className="sr-form-group">
                  <label>Block <span className="required">*</span></label>
                  <select name="block" value={formData.block} onChange={handleBlockChange} required>
                    <option value="">Select Block</option>
                    {uniqueBlocks.map((block) => (<option key={block} value={block}>{block}</option>))}
                  </select>
                </div>
                <div className="sr-form-group">
                  <label>Lot Number <span className="required">*</span></label>
                  <select name="lotNumber" value={formData.lotNumber} onChange={handleLotChange} required>
                    <option value="">Select Lot</option>
                    {filteredResidents.map((resident) => (<option key={resident.lotNumber} value={resident.lotNumber}>{resident.lotNumber}</option>))}
                  </select>
                </div>
                <div className="sr-form-group">
                  <label>Resident Name</label>
                  <input type="text" name="residentName" value={formData.residentName} onChange={handleChange} readOnly placeholder="Auto-filled from lot" />
                </div>
              </div>

              <div className="sr-form-row">
                <div className="sr-form-group">
                  <label>Violation Type <span className="required">*</span></label>
                  <select name="violationType" value={formData.violationType} onChange={handleChange} required>
                    <option value="">Select type</option>
                    {violationTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                  </select>
                </div>
                <div className="sr-form-group">
                  <label>Fine Amount</label>
                  <input type="number" name="penalty" value={formData.penalty} onChange={handleChange} min="0" step="0.01" />
                </div>
              </div>

              <div className="sr-form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
              </div>

              <div className="sr-modal-actions" style={{ justifyContent: 'center', gap: '20px' }}>
                <button type="button" className="sr-cancel-btn" onClick={() => setShowEditModal(false)} style={{ padding: '10px 100px', fontSize: '16px' }}>
                  Cancel
                </button>
                <button type="submit" className="sr-submit-btn" disabled={submitting} style={{ padding: '10px 100px', fontSize: '16px' }}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="sr-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="sr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sr-modal-header">
              <h3 style={{ textAlign: 'center', flex: 1 }}>Add New Violation</h3>
              <button className="sr-modal-close" onClick={() => setShowAddModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="sr-modal-form">
              {message.text && (
                <div className={`admin-admin-form-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="sr-form-row">
                <div className="sr-form-group">
                  <label>Block <span className="required">*</span></label>
                  <select name="block" value={formData.block} onChange={handleBlockChange} required>
                    <option value="">Select Block</option>
                    {uniqueBlocks.map((block) => (<option key={block} value={block}>{block}</option>))}
                  </select>
                </div>
                <div className="sr-form-group">
                  <label>Lot Number <span className="required">*</span></label>
                  <select name="lotNumber" value={formData.lotNumber} onChange={handleLotChange} required>
                    <option value="">Select Lot</option>
                    {filteredResidents.map((resident) => (<option key={resident.lotNumber} value={resident.lotNumber}>{resident.lotNumber}</option>))}
                  </select>
                </div>
                <div className="sr-form-group">
                  <label>Resident Name</label>
                  <input type="text" name="residentName" value={formData.residentName} onChange={handleChange} readOnly placeholder="Auto-filled from lot" />
                </div>
              </div>

              <div className="sr-form-row">
                <div className="sr-form-group">
                  <label>Violation Type <span className="required">*</span></label>
                  <select name="violationType" value={formData.violationType} onChange={handleChange} required>
                    <option value="">Select type</option>
                    {violationTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                  </select>
                </div>
                <div className="sr-form-group">
                  <label>Fine Amount</label>
                  <input type="number" name="penalty" value={formData.penalty} onChange={handleChange} min="0" step="0.01" />
                </div>
              </div>

              <div className="sr-form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
              </div>

              <div className="sr-modal-actions" style={{ justifyContent: 'center', gap: '20px' }}>
                <button type="button" className="sr-cancel-btn" onClick={() => setShowAddModal(false)} style={{ padding: '10px 100px', fontSize: '16px' }}>
                  Cancel
                </button>
                <button type="submit" className="sr-submit-btn" disabled={submitting} style={{ padding: '10px 100px', fontSize: '16px' }}>
                  {submitting ? 'Saving...' : 'Create Violation'}
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
