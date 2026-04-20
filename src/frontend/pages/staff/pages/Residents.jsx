import React, { useState, useEffect, useMemo } from 'react';
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
    full_name: '',
    email: '',
    phone: '',
    block: '',
    lot_number: ''
  });

  const [toast, setToast] = useState(null);
  const [, setFormMessage] = useState(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const [filters, setFilters] = useState({
    fullName: '',
    block: '',
    lot: '',
    role: '',
    status: ''
  });

  // For dropdown options
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [availableLots, setAvailableLots] = useState([]);

  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/residents');
      const data = await response.json();
      const residentsData = Array.isArray(data) ? data : (data.residents || []);
      setResidents(residentsData);
      
      // Extract unique blocks and lots for dropdowns
      const blocks = [...new Set(residentsData.map(r => r.block).filter(Boolean))].sort();
      const lots = [...new Set(residentsData.map(r => r.lotNumber).filter(Boolean))].sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numA - numB;
      });
      setAvailableBlocks(blocks);
      setAvailableLots(lots);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      // When block changes, reset lot selection
      if (name === 'block') {
        newFilters.lot = '';
      }
      return newFilters;
    });
  };





  // Compute filtered lots based on selected block using useMemo
  const filteredLots = useMemo(() => {
    if (filters.block) {
      return [...new Set(
        residents
          .filter(r => r.block === filters.block)
          .map(r => r.lotNumber)
          .filter(Boolean)
      )].sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numA - numB;
      });
    }
    // Reset to all lots when no block is selected
    return [...new Set(residents.map(r => r.lotNumber).filter(Boolean))].sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numA - numB;
    });
  }, [filters.block, residents]);

  // Use filtered lots for the dropdown
  const displayedLots = filters.block ? filteredLots : availableLots;

  // Fetch dropdown options on component mount
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/residents');
        const data = await response.json();
        const residentsData = Array.isArray(data) ? data : (data.residents || []);
        
        // Extract unique blocks and lots for dropdowns
        const blocks = [...new Set(residentsData.map(r => r.block).filter(Boolean))].sort();
        const lots = [...new Set(residentsData.map(r => r.lotNumber).filter(Boolean))].sort((a, b) => {
          const numA = parseInt(a) || 0;
          const numB = parseInt(b) || 0;
          return numA - numB;
        });
        setAvailableBlocks(blocks);
        setAvailableLots(lots);
      } catch (error) {
        console.error('Error fetching residents:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        setToast({ type: 'success', text: 'Resident added successfully!' });
        setToast({ type: 'success', message: 'Resident added successfully!' });
        setFormData({ username: '', password: '', full_name: '', email: '', phone: '', block: '', lot_number: '' });
        fetchResidents();
        setTimeout(() => setShowModal(false), 1500);
      } else {
        setToast({ type: 'error', text: data.error || data.message || 'Failed to add resident' });
        setToast({ type: 'error', message: data.error || data.message || 'Failed to add resident' });
      }
    } catch (error) {
      console.error('Error adding resident:', error);
      setToast({ type: 'error', text: 'An error occurred. Please try again.' });
      setToast({ type: 'error', message: 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="sr-container">
      {toast && (
        <div className={`sr-toast ${toast.type}`}>
          {toast.type === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
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
      <div className="sr-header">
        <div className="sr-title">
          <p className="sr-subtitle">Manage and view all registered residents and their account information</p>
        </div>
        <button className="sr-add-btn" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Resident
        </button>
      </div>

      <div className="sr-search-filter-bar">
        <div className="sr-filters-row">
          <div className="sr-filter-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Maglagay ng criteria sa paghahanap ng resident"
              value={filters.fullName}
              onChange={handleFilterChange}
            />
          </div>
          <div className="sr-filter-group">
            <label>Block</label>
            <select
              name="block"
              value={filters.block}
              onChange={handleFilterChange}
            >
              <option value="">All Blocks</option>
              {availableBlocks.map(block => (
                <option key={block} value={block}>{block}</option>
              ))}
            </select>
          </div>
          <div className="sr-filter-group">
            <label>Lot</label>
            <select
              name="lot"
              value={filters.lot}
              onChange={handleFilterChange}
              disabled={!filters.block && availableBlocks.length > 0}
            >
              <option value="">All Lots</option>
              {displayedLots.map(lot => (
                <option key={lot} value={lot}>{lot}</option>
              ))}
            </select>
          </div>
          <div className="sr-filter-group">
            <label>Role</label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="">All Roles</option>
              <option value="homeowner">Homeowner</option>
              <option value="tenant">Tenant</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="sr-filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="sr-buttons-row">
          <button className="sr-search-btn" onClick={() => {
            setCurrentPage(1);
            (async () => {
              setLoading(true);
              try {
                const hasFilters = filters.fullName.trim() || filters.block.trim() || filters.lot.trim() || filters.role.trim() || filters.status.trim();
                let response, data;
                if (hasFilters) {
                  const params = new URLSearchParams();
                  if (filters.fullName.trim()) params.append('full_name', filters.fullName);
                  if (filters.block.trim()) params.append('block', filters.block);
                  if (filters.lot.trim()) params.append('lot', filters.lot);
                  if (filters.role.trim()) params.append('role', filters.role);
                  if (filters.status.trim()) params.append('status', filters.status);
                  response = await fetch(`/api/residents/search?${params.toString()}`);
                } else {
                  response = await fetch('/api/residents');
                }
                data = await response.json();
                const residentsData = Array.isArray(data) ? data : (data.residents || []);
                setResidents(residentsData);
                setInitialLoadDone(true);
              } catch (error) {
                console.error('Error searching residents:', error);
              } finally {
                setLoading(false);
              }
            })();
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Search
          </button>
          <button 
            className="sr-reset-btn" 
            onClick={() => {
              setFilters({ fullName: '', block: '', lot: '', role: '', status: '' });
              setResidents([]);
              setInitialLoadDone(false);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      <section className="sr-table-section">
        <h3 className="sr-table-title">Residents List</h3>
        <div className="sr-table-container">
          <table className="sr-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Block</th>
              <th>Lot</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="sr-loading-cell">
                  <div className="sr-loading-state">
                    <div className="sr-spinner"></div>
                    <span>Loading residents...</span>
                  </div>
                </td>
              </tr>
            ) : !initialLoadDone ? (
              <tr>
                <td colSpan={9} className="sr-empty-row">
                  Enter criteria to search for residents
                </td>
              </tr>
            ) : residents.length === 0 ? (
              <tr>
                <td colSpan={9} className="sr-empty-row">
                  No residents found matching your search
                </td>
              </tr>
            ) : (
              residents
                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                .map((resident) => (
                  <tr key={resident.id}>
                    <td>{resident.fullName || '-'}</td>
                    <td>{resident.block || '-'}</td>
                    <td>{resident.lotNumber || '-'}</td>
                    <td>{resident.email || '-'}</td>
                    <td>{resident.phone || '-'}</td>
                    <td>
                      <span className={`sr-status-badge status-${(resident.status || 'active').toLowerCase()}`}>
                        {resident.status || 'active'}
                      </span>
                    </td>
                    <td className="resident-tbl-actions">
                      <button className="resident-tbl-view-btn" onClick={() => { setSelectedResident(resident); setShowViewModal(true); }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="sr-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="sr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sr-modal-header">
              <h3 style={{ textAlign: 'center', flex: 1 }}>Add New Resident</h3>
              <button className="sr-modal-close" onClick={() => setShowModal(false)}>X</button>
            </div>
            <form className="sr-modal-form" onSubmit={handleSubmit}>
              <div className="sr-form-row">
                <div className="sr-form-group">
                  <label>Username <span className="required">*</span></label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sr-form-group">
                  <label>Password <span className="required">*</span></label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sr-form-group span-2">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="sr-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>
                <div className="sr-form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="sr-form-group">
                  <label>Block <span className="required">*</span></label>
                  <input
                    type="text"
                    name="block"
                    value={formData.block}
                    onChange={handleInputChange}
                    placeholder="e.g., A"
                    required
                  />
                </div>
                <div className="sr-form-group">
                  <label>Lot <span className="required">*</span></label>
                  <input
                    type="text"
                    name="lot_number"
                    value={formData.lot_number}
                    onChange={handleInputChange}
                    placeholder="e.g., 101"
                    required
                  />
                </div>
              </div>
              <div className="sr-modal-actions" style={{ justifyContent: 'center', gap: '20px' }}>
                <button type="button" className="sr-cancel-btn" onClick={() => setShowModal(false)} style={{ padding: '10px 100px', fontSize: '16px' }}>
                  Cancel
                </button>
                <button type="submit" className="sr-submit-btn" style={{ padding: '10px 100px', fontSize: '16px' }}>
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedResident && (
        <div className="sr-view-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="sr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sr-view-modal-header">
              <div className="sr-view-modal-avatar">
                {selectedResident.fullName ? selectedResident.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'}
              </div>
              <div className="sr-view-modal-header-info">
                <h3>{selectedResident.fullName || 'Unknown'}</h3>
                <span className="sr-view-modal-location">Block {selectedResident.block || '-'}, Lot {selectedResident.lotNumber || '-'}</span>
              </div>
              <button className="sr-view-modal-close" onClick={() => setShowViewModal(false)}>X</button>
            </div>

            <div className="sr-view-modal-content">
              <div className="sr-view-modal-section">
                <div className="sr-view-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </div>
                <div className="sr-view-modal-grid">
                  <div className="sr-view-modal-item">
                    <span className="sr-view-modal-label">Email Address</span>
                    <span className="sr-view-modal-value">{selectedResident.email || '-'}</span>
                  </div>
                  <div className="sr-view-modal-item">
                    <span className="sr-view-modal-label">Phone Number</span>
                    <span className="sr-view-modal-value">{selectedResident.phone || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="sr-view-modal-section">
                <div className="sr-view-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Property Details
                </div>
                <div className="sr-view-modal-grid">
                  <div className="sr-view-modal-item">
                    <span className="sr-view-modal-label">Block</span>
                    <span className="sr-view-modal-value">{selectedResident.block || '-'}</span>
                  </div>
                  <div className="sr-view-modal-item">
                    <span className="sr-view-modal-label">Lot Number</span>
                    <span className="sr-view-modal-value">{selectedResident.lotNumber || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="sr-view-modal-section">
                <div className="sr-view-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Account Status
                </div>
                <div className="sr-view-modal-grid">
                  <div className="sr-view-modal-item">
                    <span className="sr-view-modal-label">Role</span>
                    <span className="sr-view-modal-value">{selectedResident.role || 'homeowner'}</span>
                  </div>
                  <div className="sr-view-modal-item">
                    <span className="sr-view-modal-label">Status</span>
                    <span className="sr-view-modal-value">{selectedResident.status || 'active'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sr-view-modal-footer">
              <a href="/payments" className="sr-view-action-btn sr-view-btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                View Payments
              </a>
              <a href="/violations" className="sr-view-action-btn sr-view-btn-secondary">
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
