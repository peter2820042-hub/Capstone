import React, { useState, useEffect } from 'react';
import './Residents.css';

function Residents() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    block: '',
    lot: ''
  });
  const [formMessage, setFormMessage] = useState(null);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/residents');
      const data = await response.json();
      setResidents(Array.isArray(data) ? data : (data.residents || []));
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
    }
  };

  const [filters, setFilters] = useState({
    fullName: '',
    block: '',
    lot: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const hasContent = filters.fullName.trim() || filters.block.trim() || filters.lot.trim();
    
    if (hasContent) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      fetchResidents();
    }
  }, [filters.fullName, filters.block, filters.lot]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.fullName.trim()) params.append('full_name', filters.fullName);
      if (filters.block.trim()) params.append('block', filters.block);
      if (filters.lot.trim()) params.append('lot', filters.lot);

      const url = `/api/residents/search?${params.toString()}`;
      console.log('Searching:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      console.log('Search results:', data);
      setResidents(Array.isArray(data) ? data : (data.residents || []));
    } catch (error) {
      console.error('Error searching residents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null);

    try {
      const response = await fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setFormMessage({ type: 'success', text: 'Resident added successfully!' });
        setFormData({ username: '', password: '', fullName: '', email: '', phone: '', block: '', lot: '' });
        fetchResidents();
        setTimeout(() => setShowModal(false), 1500);
      } else {
        setFormMessage({ type: 'error', text: data.message || 'Failed to add resident' });
      }
    } catch (error) {
      console.error('Error adding resident:', error);
      setFormMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="residents-container">
      <div className="residents-header">
        <div className="header-title">
          <h2>Residents</h2>
          <p className="header-subtitle">Manage and view all registered residents and their account information</p>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Resident
        </button>
      </div>

      <div className="staff-search-filter-bar">
        <div className="staff-filter-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter full name..."
            value={filters.fullName}
            onChange={handleFilterChange}
          />
        </div>
        <div className="staff-filter-group">
          <label>Block</label>
          <input
            type="text"
            name="block"
            placeholder="Enter block..."
            value={filters.block}
            onChange={handleFilterChange}
          />
        </div>
        <div className="staff-filter-group">
          <label>Lot</label>
          <input
            type="text"
            name="lot"
            placeholder="Enter lot..."
            value={filters.lot}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="staff-table-container">
        <table className="residents-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Block</th>
              <th>Lot</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-cell">
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <span>Loading residents...</span>
                  </div>
                </td>
              </tr>
            ) : residents.length === 0 ? (
              <tr>
                <td colSpan="5" className="staff-empty-row">
                  {(filters.fullName || filters.block || filters.lot) ? 'No residents found matching your search' : 'No residents registered yet'}
                </td>
              </tr>
            ) : (
              residents.map((resident) => (
                <tr key={resident.id}>
                  <td>{resident.fullName || '-'}</td>
                  <td>{resident.email || '-'}</td>
                  <td>{resident.block || '-'}</td>
                  <td>{resident.lotNumber || '-'}</td>
                  <td className="actions">
                    <button className="view-btn" onClick={() => { setSelectedResident(resident); setShowViewModal(true); }}>
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="staff-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3>Add New Resident</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="staff-modal-form" onSubmit={handleSubmit}>
              {formMessage && (
                <div className={`message ${formMessage.type}`}>
                  {formMessage.text}
                </div>
              )}
              <div className="staff-form-row">
                <div className="staff-form-group">
                  <label>Username <span className="required">*</span></label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="staff-form-group">
                  <label>Password <span className="required">*</span></label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="staff-form-group span-2">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="staff-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>
                <div className="staff-form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="staff-form-group">
                  <label>Block</label>
                  <input
                    type="text"
                    name="block"
                    value={formData.block}
                    onChange={handleInputChange}
                    placeholder="e.g., A"
                  />
                </div>
                <div className="staff-form-group">
                  <label>Lot</label>
                  <input
                    type="text"
                    name="lot"
                    value={formData.lot}
                    onChange={handleInputChange}
                    placeholder="e.g., 101"
                  />
                </div>
              </div>
              <div className="staff-modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedResident && (
        <div className="view-staff-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="view-staff-modal-header">
              <div className="view-modal-avatar">
                {selectedResident.fullName ? selectedResident.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'}
              </div>
              <div className="view-staff-modal-header-info">
                <h3>{selectedResident.fullName || 'Unknown'}</h3>
                <span className="view-modal-location">Block {selectedResident.block || '-'}, Lot {selectedResident.lotNumber || '-'}</span>
              </div>
              <button className="view-staff-modal-close" onClick={() => setShowViewModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="view-staff-modal-content">
              <div className="view-modal-section">
                <div className="view-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </div>
                <div className="view-modal-grid">
                  <div className="view-modal-item">
                    <span className="view-modal-label">Email Address</span>
                    <span className="view-modal-value">{selectedResident.email || '-'}</span>
                  </div>
                  <div className="view-modal-item">
                    <span className="view-modal-label">Phone Number</span>
                    <span className="view-modal-value">{selectedResident.phone || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="view-modal-section">
                <div className="view-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Property Details
                </div>
                <div className="view-modal-grid">
                  <div className="view-modal-item">
                    <span className="view-modal-label">Block</span>
                    <span className="view-modal-value">{selectedResident.block || '-'}</span>
                  </div>
                  <div className="view-modal-item">
                    <span className="view-modal-label">Lot Number</span>
                    <span className="view-modal-value">{selectedResident.lotNumber || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="view-staff-modal-footer">
              <a href="/payments" className="view-modal-action-btn view-modal-staff-btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                View Payments
              </a>
              <a href="/violations" className="view-modal-action-btn view-modal-staff-btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                View Violations
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Residents;
