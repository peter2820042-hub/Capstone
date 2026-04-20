import React, { useState, useEffect } from 'react';
import './Violations.css';

function Violations() {
  const [violations, setViolations] = useState([]);
  const [residents, setResidents] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    violationType: '',
    status: ''
  });

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

  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
    // Filter residents by selected block
    if (selectedBlock) {
      setFilteredResidents(residents.filter(r => r.block === selectedBlock));
    } else {
      setFilteredResidents(residents);
    }
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setToast(null);

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

        setToast({ type: 'success', message: 'Violation added successfully! Bill created for penalty amount.' });
        setFormData({
          lotNumber: '',
          block: '',
          residentName: '',
          violationType: '',
          description: '',
          penalty: '',
          dateIssued: new Date().toISOString().split('T')[0]
        });
        fetch('/api/violations').then(res => res.json()).then(data => setViolations(data || []));
        setTimeout(() => {
          setShowAddModal(false);
          setToast(null);
        }, 1500);
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to add violation' });
      }
    } catch {
      setToast({ type: 'error', message: 'Cannot connect to server' });
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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setToast(null);

    // Get user from sessionStorage for authorization
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    try {
      const response = await fetch(`/api/violations/${selectedViolation.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user': JSON.stringify(user)
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setToast({ type: 'success', message: 'Violation updated successfully!' });
        fetch('/api/violations').then(res => res.json()).then(data => setViolations(data || []));
        setTimeout(() => {
          setShowEditModal(false);
          setToast(null);
        }, 1500);
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to update violation' });
      }
    } catch {
      setToast({ type: 'error', message: 'Cannot connect to server' });
    } finally {
      setSubmitting(false);
    }
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
        headers: { 'x-user': JSON.stringify(user) }
      });

      if (response.ok) {
        setToast({ type: 'success', message: 'Violation deleted successfully!' });
        fetch('/api/violations').then(res => res.json()).then(data => setViolations(data || []));
        setTimeout(() => setToast(null), 2000);
      } else {
        setToast({ type: 'error', message: 'Failed to delete violation' });
      }
    } catch {
      setToast({ type: 'error', message: 'Cannot connect to server' });
    }
  };

  const handleResolve = async (violationId) => {
    // Get user from sessionStorage for authorization
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    try {
      const response = await fetch(`/api/violations/${violationId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user': JSON.stringify(user)
        },
        body: JSON.stringify({ status: 'resolved' })
      });

      if (response.ok) {
        setToast({ type: 'success', message: 'Violation resolved!' });
        fetch('/api/violations').then(res => res.json()).then(data => setViolations(data || []));
        setShowViewModal(false);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Error resolving violation:', err);
    }
  };

  const handleMarkAsPaid = async (violationId) => {
    // Get user from sessionStorage for authorization
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    try {
      const response = await fetch(`/api/violations/${violationId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user': JSON.stringify(user)
        },
        body: JSON.stringify({ status: 'paid' })
      });

      if (response.ok) {
        setToast({ type: 'success', message: 'Violation marked as paid!' });
        fetch('/api/violations').then(res => res.json()).then(data => setViolations(data || []));
        setShowViewModal(false);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  const filteredViolations = violations.filter(violation => {
    const { search, violationType, status } = filters;
    
    // Search filter
    let matchesSearch = true;
    if (search) {
      const searchLower = search.toLowerCase();
      const searchFields = [
        violation.lotNumber,
        violation.residentName,
        violation.violationType,
        violation.block
      ].filter(Boolean).map(f => f.toLowerCase());
      
      matchesSearch = searchFields.some(field => field.includes(searchLower));
    }
    
    // Status filter - match exact status
    const matchesStatus = !status || violation.status?.toLowerCase() === status.toLowerCase();
    
    // Type filter
    const matchesType = !violationType || violation.violationType === violationType;
    
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
    <div className="violations-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`sr-toast ${toast.type}`}>
          {toast.type === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          <span>{toast.message}</span>
          <button className="sr-toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      {/* Page Header */}
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

      {/* Search and Filter Bar */}
      <div className="sr-search-filter-bar">
        <div className="sr-filters-row">
          <div className="sr-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name, block, lot..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="sr-filter-group">
            <label>Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="sr-filter-group">
            <label>Type</label>
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
        </div>

        <div className="sr-buttons-row">
          <button className="sr-search-btn" onClick={() => {}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Search
          </button>
          <button
            className="sr-reset-btn"
            onClick={() => setFilters({ search: '', violationType: '', block: '', lot: '', status: '', dateFrom: '', dateTo: '' })}
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
                    <div className="sr-table-actions">
                      <button className="sr-view-btn" onClick={() => handleViewViolation(violation)}>View</button>
                      <button className="sr-edit-btn" onClick={() => handleEditViolation(violation)}>Edit</button>
                      <button className="sr-delete-btn" onClick={() => handleDeleteViolation(violation.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </section>

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
            <form onSubmit={handleAddSubmit} className="sr-modal-form">

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
              </div>
      
              <div className="sr-form-row">
                <div className="sr-form-group">
                  <label>Resident Name</label>
                  <input type="text" name="residentName" value={formData.residentName} onChange={handleChange} readOnly placeholder="Auto-filled from lot" />
                </div>
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
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
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
              {selectedViolation.status === 'pending' && (
                <>
                  <button className="billing-admin-admin-btn-primary" onClick={() => handleResolve(selectedViolation.id)}>
                    Resolve
                  </button>
                  <button className="billing-admin-admin-btn-primary" onClick={() => handleMarkAsPaid(selectedViolation.id)}>
                    Mark Paid
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
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
            <form onSubmit={handleUpdateSubmit} className="sr-modal-form">

              <div className="sr-form-row">
                <div className="sr-form-group">
                  <label>Block <span className="required">*</span></label>
                  <select
                    name="block"
                    value={formData.block}
                    onChange={handleBlockChange}
                    required
                  >
                    <option value="">Select Block</option>
                    {uniqueBlocks.map((block) => (
                      <option key={block} value={block}>{block}</option>
                    ))}
                  </select>
                </div>
                <div className="sr-form-group">
                  <label>Lot Number <span className="required">*</span></label>
                  <select
                    name="lotNumber"
                    value={formData.lotNumber}
                    onChange={handleLotChange}
                    required
                  >
                    <option value="">Select Lot</option>
                    {filteredResidents.map((resident) => (
                      <option key={resident.lotNumber} value={resident.lotNumber}>{resident.lotNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="sr-form-group">
                  <label>Resident Name</label>
                  <input
                    type="text"
                    name="residentName"
                    value={formData.residentName}
                    onChange={handleChange}
                    readOnly
                    placeholder="Auto-filled from lot"
                  />
                </div>
              </div>

              <div className="sr-form-row">
                <div className="sr-form-group">
                  <label>Violation Type <span className="required">*</span></label>
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
                <div className="sr-form-group">
                  <label>Fine Amount</label>
                  <input
                    type="number"
                    name="penalty"
                    value={formData.penalty}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="sr-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="sr-form-group">
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

              <div className="sr-modal-actions" style={{ justifyContent: 'center', gap: '20px' }}>
                <button type="button" className="sr-cancel-btn" onClick={() => setShowEditModal(false)} style={{ padding: '10px 100px', fontSize: '16px' }}>
                  Cancel
                </button>
                <button type="submit" className="sr-submit-btn" disabled={submitting} style={{ padding: '10px 100px', fontSize: '16px' }}>
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
