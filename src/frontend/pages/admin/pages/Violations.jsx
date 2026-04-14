import React, { useState, useEffect } from 'react';
import './Violations.css';

function Violations() {
  const [violations, setViolations] = useState([]);
  const [residents, setResidents] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [lots, setLots] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedLot, setSelectedLot] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    violationType: '',
    block: '',
    lot: ''
  });

  // Resident search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
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

  // Violation type icons and colors
  const getViolationStyle = (type) => {
    const styles = {
      'Noise Violation': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        ),
        color: '#8b5cf6',
        bg: '#f5d5ff'
      },
      'Illegal Parking': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 17H7a2 2 0 0 1 0-4h2" />
            <path d="M15 3h2a2 2 0 0 1 0 4h-2" />
            <path d="M12 3v2" />
            <path d="M12 19v2" />
          </svg>
        ),
        color: '#f59e0b',
        bg: '#fef3c7'
      },
      'Property Damage': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M9 21v-6h6v6" />
            <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
          </svg>
        ),
        color: '#ef4444',
        bg: '#fee2e2'
      },
      'Waste Disposal': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        ),
        color: '#10b981',
        bg: '#d1fae5'
      },
      'Pet Violation': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8c-2.5 0-4.5 1.5-5.5 3" />
            <path d="M12 8c2.5 0 4.5 1.5 5.5 3" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          </svg>
        ),
        color: '#f97316',
        bg: '#ffedd5'
      },
      'Noise after hours': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        color: '#ec4899',
        bg: '#fce7f3'
      },
      'Unauthorized Construction': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        ),
        color: '#06b6d4',
        bg: '#cffafe'
      },
      'Others': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        ),
        color: '#6b7280',
        bg: '#f3f4f6'
      }
    };
    return styles[type] || styles['Others'];
  };

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
    fetchResidentsForDropdown();
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

  const fetchResidentsForDropdown = async () => {
    try {
      const response = await fetch('/api/residents');
      const data = await response.json();
      const residentsData = Array.isArray(data) ? data : (data.residents || []);
      setResidents(residentsData);
      
      // Extract unique blocks
      const uniqueBlocks = [...new Set(residentsData.map(r => r.block).filter(Boolean))].sort();
      setBlocks(uniqueBlocks);
      
      // Extract unique lots
      const uniqueLots = [...new Set(residentsData.map(r => r.lotNumber).filter(Boolean))].sort();
      setLots(uniqueLots);
    } catch (error) {
      console.error('Error fetching residents:', error);
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
        setMessage({ type: 'error', text: data.error || 'Failed to record Violation' });
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

  // Mark violation as paid
  const handleMarkAsPaid = async (violationId) => {
    try {
      const response = await fetch(`/api/violations/${violationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paid',
          lotNumber: '',
          residentName: '',
          violationType: '',
          description: '',
          penalty: ''
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Violation marked as paid! Homeowner has been notified.' });
        fetchViolations();
        setShowViewModal(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error marking violation as paid:', err);
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
      residentName: violation.residentName || '',
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
        fetchViolations();
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
        fetchViolations();
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete violation' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Cannot connect to server' });
    }
  };
  
  const handleNoticeChange = (e) => {
    const { name, value } = e.target;
    setNoticeData(prev => ({ ...prev, [name]: value }));
  };

  // Search resident for notice modal - called from useEffect
  const searchNoticeResident = async () => {
    const block = noticeData.block;
    const lot = noticeData.lotNumber;
    
    if ((!block || block.trim() === '') && (!lot || lot.trim() === '')) {
      setNoticeSearchResults([]);
      return;
    }
    
    setIsSearchingNotice(true);
    try {
      const params = new URLSearchParams();
      if (block && block.trim()) params.append('block', block.trim());
      if (lot && lot.trim()) params.append('lot', lot.trim());
      const response = await fetch(`/api/residents/search?${params.toString()}`);
      const data = await response.json();
      setNoticeSearchResults(data.residents || []);
    } catch (error) {
      console.error('Error searching resident:', error);
      setNoticeSearchResults([]);
    } finally {
      setIsSearchingNotice(false);
    }
  };

  // Debounced search effect - requires BOTH block AND lot
  useEffect(() => {
    const hasBlock = noticeData.block.trim() !== '';
    const hasLot = noticeData.lotNumber.trim() !== '';
    
    // Only search when BOTH block and lot are filled
    if (hasBlock && hasLot && showNoticeModal) {
      const timeoutId = setTimeout(() => {
        searchNoticeResident();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setNoticeSearchResults([]);
    }
  }, [noticeData.block, noticeData.lotNumber, showNoticeModal]);

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
    const { search, violationType, block, lot } = filters;
    
    // If no filters, show all
    if (!search && !violationType && !block && !lot) return true;
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      if (!violation.lotNumber?.toLowerCase().includes(searchLower) &&
          !violation.residentName?.toLowerCase().includes(searchLower) &&
          !violation.violationType?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Filter by violation type
    if (violationType && violation.violationType !== violationType) return false;
    
    // Filter by block
    if (block) {
      const lotNum = violation.lotNumber || '';
      if (!lotNum.toUpperCase().startsWith(block.toUpperCase())) return false;
    }
    
    // Filter by lot
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
          <p className="header-subtitle">Manage and monitor community policy infractions</p>
        </div>
        <div className="header-buttons">
          <button 
            className="add-btn"
            onClick={() => setShowAddModal(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Violation
          </button>
          <button 
            className="notice-btn"
            onClick={() => setShowNoticeModal(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Announce
          </button>
        </div>
      </div>

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
            {(() => {
              if (filteredViolations.length === 0) {
                return (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      {(filters.search || filters.violationType || filters.block || filters.lot) 
                        ? 'No violations found matching your search' 
                        : 'No violations logged yet'}
                    </td>
                  </tr>
                );
              }
              
              return filteredViolations.map((violation) => {
                const style = getViolationStyle(violation.violationType);
                return (
                  <tr key={violation.id}>
                    <td>{violation.residentName || '-'}</td>
                    <td>
                      <div className="violation-type-badge" style={{ backgroundColor: style.bg, color: style.color }}>
                        <span className="violation-icon">{style.icon}</span>
                        <span>{violation.violationType}</span>
                      </div>
                    </td>
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
                          className="delete-btn"
                          onClick={() => handleDeleteViolation(violation.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="view-btn"
                          onClick={() => handleViewViolation(violation)}
                        >
                          View
                        </button>
                        {violation.status === 'pending' && (
                          <button
                            className="paid-btn"
                            onClick={() => handleMarkAsPaid(violation.id)}
                          >
                            Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      {/* Add Violation Modal */}
      {showAddModal && (
        <div className="add-violation-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-violation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-violation-modal-header">
              <h3>Add Violation</h3>
              <button className="add-violation-modal-close" onClick={() => setShowAddModal(false)}>
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

              {/* Block and Lot side by side */}
              <div className="form-group-block-lot">
                <div className="form-group">
                  <label>Block *</label>
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Enter block..."
                      autoComplete="off"
                    />
                    {isSearching && <span className="search-loading">Searching...</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label>Lot *</label>
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Enter lot..."
                      autoComplete="off"
                    />
                    {isSearching && <span className="search-loading">Searching...</span>}
                  </div>
                </div>
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((resident) => (
                      <div
                        key={resident.id}
                        className="search-result-item"
                        onClick={() => selectResident(resident)}
                      >
                        <span className="resident-name">{resident.full_name}</span>
                        <span className="lot-number">Lot: {resident.lot_number}</span>
                        <span className="block-info">Block: {resident.block || 'N/A'}</span>
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
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Violation Modal */}
      {showViewModal && selectedViolation && (
        <div className="violation-view-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="violation-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="violation-view-modal-header">
              <div className="violation-view-modal-header-info">
                <h3>Violation Details</h3>
                <span className="violation-view-modal-id">ID: {selectedViolation.id || '-'}</span>
              </div>
              <button className="violation-view-modal-close" onClick={() => setShowViewModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="violation-view-modal-content">
              <div className="violation-view-modal-section">
                <div className="violation-view-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Resident Information
                </div>
                <div className="violation-view-modal-grid">
                  <div className="violation-view-modal-item">
                    <span className="violation-view-modal-label">Lot Number</span>
                    <span className="violation-view-modal-value">{selectedViolation.lotNumber || '-'}</span>
                  </div>
                  <div className="violation-view-modal-item">
                    <span className="violation-view-modal-label">Resident Name</span>
                    <span className="violation-view-modal-value">{selectedViolation.residentName || '-'}</span>
                  </div>
                </div>
              </div>
              <div className="violation-view-modal-section">
                <div className="violation-view-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Violation Information
                </div>
                <div className="violation-view-modal-grid">
                  <div className="violation-view-modal-item">
                    <span className="violation-view-modal-label">Violation Type</span>
                    <span className="violation-view-modal-value">{selectedViolation.violationType || '-'}</span>
                  </div>
                  <div className="violation-view-modal-item">
                    <span className="violation-view-modal-label">Fine Amount</span>
                    <span className="violation-view-modal-value fine-amount">{selectedViolation.fine ? `PHP ${parseFloat(selectedViolation.fine).toFixed(2)}` : '-'}</span>
                  </div>
                </div>
                <div className="violation-view-modal-item full-width">
                  <span className="violation-view-modal-label">Description</span>
                  <span className="violation-view-modal-value">{selectedViolation.description || '-'}</span>
                </div>
              </div>
              <div className="violation-view-modal-section">
                <div className="violation-view-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Date Information
                </div>
                <div className="violation-view-modal-grid">
                  <div className="violation-view-modal-item">
                    <span className="violation-view-modal-label">Date Reported</span>
                    <span className="violation-view-modal-value">{selectedViolation.dateReported ? new Date(selectedViolation.dateReported).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="violation-view-modal-item">
                    <span className="violation-view-modal-label">Status</span>
                    <span className="violation-view-modal-value">{selectedViolation.status || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Violation Modal */}
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
                    placeholder="e.g., John Doe"
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
                  className="violation-select"
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

              <div className="form-row">
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
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Violation'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announce Modal */}
      {showNoticeModal && (
        <div className="modal-overlay" onClick={() => setShowNoticeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Announce to Resident</h3>
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
                <label>Block *</label>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    name="block"
                    value={noticeData.block}
                    onChange={handleNoticeChange}
                    required
                    placeholder="Enter block..."
                  />
                  {isSearchingNotice && <span className="search-loading">Searching...</span>}
                </div>
              </div>
              <div className="form-group">
                <label>Lot *</label>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    name="lotNumber"
                    value={noticeData.lotNumber}
                    onChange={handleNoticeChange}
                    required
                    placeholder="Enter lot..."
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
                        <span className="resident-name">{resident.full_name}</span>
                        <span className="lot-number">Lot: {resident.lot_number}</span>
                        <span className="block-info">Block: {resident.block || 'N/A'}</span>
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
                  {sendingNotice ? 'Sending...' : 'Announce'}
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
