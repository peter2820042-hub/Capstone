import React, { useState, useEffect } from 'react';
import './Violations.css';

function Violations() {
  const [violations, setViolations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Resident search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
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

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Notice form state
  const [noticeData, setNoticeData] = useState({
    lotNumber: '',
    block: '',
    residentName: '',
    residentEmail: '',
    title: '',
    noticeMessage: ''
  });
  const [noticeSearchResults, setNoticeSearchResults] = useState([]);
  const [isSearchingNotice, setIsSearchingNotice] = useState(false);
  const [sendingNotice, setSendingNotice] = useState(false);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      const response = await fetch('/api/violations');
      const data = await response.json();
      setViolations(data || []);
    } catch (error) {
      console.error('Error fetching violations:', error);
    }
  };

  // Search resident by lot number or block
  const searchResident = async (query) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/residents/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.residents || []);
    } catch (error) {
      console.error('Error searching resident:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFormData(prev => ({ ...prev, lotNumber: query }));
    searchResident(query);
  };

  // Select a resident from search results
  const selectResident = (resident) => {
    setFormData(prev => ({
      ...prev,
      lotNumber: resident.lot_number || '',
      block: resident.block || '',
      residentName: resident.full_name || '',
      residentEmail: resident.email || ''
    }));
    setSearchQuery(resident.lot_number || '');
    setSearchResults([]);
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
      const response = await fetch('/api/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotNumber: formData.lotNumber,
          block: formData.block,
          residentName: formData.residentName,
          residentEmail: formData.residentEmail,
          violationType: formData.violationType,
          description: formData.description,
          penalty: formData.fine,
          dateIssued: new Date().toISOString(),
          status: 'pending'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Violation logged successfully! Notification sent to homeowner.' });
        setFormData({
          lotNumber: '',
          block: '',
          residentName: '',
          residentEmail: '',
          violationType: '',
          description: '',
          fine: ''
        });
        setSearchQuery('');
        fetchViolations();
        setTimeout(() => setShowAddModal(false), 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to log violation' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Cannot connect to server' });
    } finally {
      setSubmitting(false);
    }
  };

  // Resolve violation with notification
  const handleResolve = async (violationId) => {
    try {
      const response = await fetch(`/api/violations/${violationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolved',
          lotNumber: '',
          residentName: '',
          violationType: '',
          description: '',
          penalty: ''
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Violation resolved! Homeowner has been notified.' });
        fetchViolations();
        setShowViewModal(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error resolving violation:', err);
    }
  };

  const handleViewViolation = (violation) => {
    setSelectedViolation(violation);
    setShowViewModal(true);
  };
  
  const handleNoticeChange = (e) => {
    const { name, value } = e.target;
    setNoticeData(prev => ({ ...prev, [name]: value }));
    
    // If lotNumber changes, search for resident
    if (name === 'lotNumber') {
      searchNoticeResident(value);
    }
  };

  // Search resident for notice modal
  const searchNoticeResident = async (query) => {
    if (!query || query.length < 1) {
      setNoticeSearchResults([]);
      return;
    }
    
    setIsSearchingNotice(true);
    try {
      const response = await fetch(`/api/residents/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setNoticeSearchResults(data.residents || []);
    } catch (error) {
      console.error('Error searching resident:', error);
      setNoticeSearchResults([]);
    } finally {
      setIsSearchingNotice(false);
    }
  };

  // Select a resident from notice search results
  const selectNoticeResident = (resident) => {
    setNoticeData(prev => ({
      ...prev,
      lotNumber: resident.lot_number || '',
      block: resident.block || '',
      residentName: resident.full_name || '',
      residentEmail: resident.email || ''
    }));
    setNoticeSearchResults([]);
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    setSendingNotice(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/send-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lot_number: noticeData.lotNumber,
          block: noticeData.block,
          resident_name: noticeData.residentName,
          resident_email: noticeData.residentEmail,
          title: noticeData.title,
          message: noticeData.noticeMessage
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Notice sent successfully!' });
        setNoticeData({ 
          lotNumber: '', 
          block: '',
          residentName: '',
          residentEmail: '',
          title: '', 
          noticeMessage: '' 
        });
        setTimeout(() => {
          setShowNoticeModal(false);
          setMessage({ type: '', text: '' });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send notice' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Cannot connect to server' });
    } finally {
      setSendingNotice(false);
    }
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

  return (
    <div className="violations-container">
      {/* Header */}
      <div className="violations-header">
        <h2>Violation Management</h2>
        <button 
          className="notice-btn"
          onClick={() => setShowNoticeModal(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Send Notice
        </button>
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

              {/* Resident Search */}
              <div className="form-group">
                <label>Search Resident (Lot Number or Block) *</label>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Enter lot number or block..."
                    autoComplete="off"
                  />
                  {isSearching && <span className="search-loading">Searching...</span>}
                </div>
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((resident) => (
                      <div
                        key={resident.id}
                        className="search-result-item"
                        onClick={() => selectResident(resident)}
                      >
                        <span className="lot-number">{resident.lot_number}</span>
                        <span className="block-info">Block: {resident.block || 'N/A'}</span>
                        <span className="resident-name">{resident.full_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Resident Info */}
              {(formData.lotNumber || formData.residentName) && (
                <div className="selected-resident-info">
                  <div className="info-row">
                    <span className="label">Selected:</span>
                    <span className="value">Lot {formData.lotNumber} - {formData.residentName}</span>
                  </div>
                  {formData.block && (
                    <div className="info-row">
                      <span className="label">Block:</span>
                      <span className="value">{formData.block}</span>
                    </div>
                  )}
                </div>
              )}

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
              
              {/* Resolve Button - Only show for pending violations */}
              {selectedViolation.status === 'pending' && (
                <div className="resolve-section">
                  <button 
                    type="button" 
                    className="resolve-btn"
                    onClick={() => handleResolve(selectedViolation.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Mark as Resolved
                  </button>
                  <p className="resolve-note">This will notify the homeowner that the violation has been resolved.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Notice Modal */}
      {showNoticeModal && (
        <div className="modal-overlay" onClick={() => setShowNoticeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Notice to Resident</h3>
              <button className="close-btn" onClick={() => setShowNoticeModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSendNotice} className="modal-form">
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              
              <div className="form-group">
                <label>Search Resident (Lot Number or Block) *</label>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    name="lotNumber"
                    value={noticeData.lotNumber}
                    onChange={handleNoticeChange}
                    required
                    placeholder="Enter lot number or block..."
                  />
                  {isSearchingNotice && <span className="search-loading">Searching...</span>}
                </div>
                {noticeSearchResults.length > 0 && (
                  <div className="search-results">
                    {noticeSearchResults.map((resident) => (
                      <div
                        key={resident.id}
                        className="search-result-item"
                        onClick={() => selectNoticeResident(resident)}
                      >
                        <span className="lot-number">{resident.lot_number}</span>
                        <span className="block-info">Block: {resident.block || 'N/A'}</span>
                        <span className="resident-name">{resident.full_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Resident Info */}
              {(noticeData.lotNumber || noticeData.residentName) && (
                <div className="selected-resident-info">
                  <div className="info-row">
                    <span className="label">Selected:</span>
                    <span className="value">Lot {noticeData.lotNumber} - {noticeData.residentName}</span>
                  </div>
                  {noticeData.block && (
                    <div className="info-row">
                      <span className="label">Block:</span>
                      <span className="value">{noticeData.block}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Notice Title *</label>
                <input
                  type="text"
                  name="title"
                  value={noticeData.title}
                  onChange={handleNoticeChange}
                  required
                  placeholder="e.g., Important Notice"
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="noticeMessage"
                  value={noticeData.noticeMessage}
                  onChange={handleNoticeChange}
                  required
                  rows="5"
                  placeholder="Enter your message to the resident..."
                />
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="submit-btn" disabled={sendingNotice}>
                  {sendingNotice ? 'Sending...' : 'Send Notice'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowNoticeModal(false)}
                >
                  Cancel
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
