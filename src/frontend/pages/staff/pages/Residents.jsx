import React, { useState, useEffect } from 'react';
import './Residents.css';

function Residents() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    block: '',
    lot: '',
    password: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/residents');
      const data = await response.json();
      setResidents(data.residents || []);
    } catch (error) {
      console.error('Error fetching residents:', error);
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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'user'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Resident added successfully!' });
        setFormData({
          username: '',
          fullName: '',
          email: '',
          phoneNumber: '',
          block: '',
          lot: '',
          password: ''
        });
        fetchResidents();
        setTimeout(() => setShowAddModal(false), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add resident' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Cannot connect to server' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewResident = (resident) => {
    setSelectedResident(resident);
    setShowViewModal(true);
  };

  const filteredResidents = residents.filter(resident => {
    const search = searchTerm.toLowerCase();
    return (
      resident.username?.toLowerCase().includes(search) ||
      resident.fullName?.toLowerCase().includes(search) ||
      resident.email?.toLowerCase().includes(search) ||
      resident.block?.toLowerCase().includes(search) ||
      resident.lot?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="residents-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading residents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="residents-container">
      {/* Header */}
      <div className="residents-header">
        <h2>Resident Management</h2>
        <button 
          className="add-btn"
          onClick={() => setShowAddModal(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Resident
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, email, block, or lot..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="residents-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Block/Lot</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResidents.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">
                  {searchTerm ? 'No residents found matching your search' : 'No residents registered yet'}
                </td>
              </tr>
            ) : (
              filteredResidents.map((resident) => (
                <tr key={resident.id}>
                  <td>{resident.username}</td>
                  <td>{resident.fullName || '-'}</td>
                  <td>{resident.email || '-'}</td>
                  <td>{resident.block && resident.lot ? `${resident.block}-${resident.lot}` : '-'}</td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => handleViewResident(resident)}
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

      {/* Add Resident Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Resident</h3>
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
                  <label>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Block</label>
                  <input
                    type="text"
                    name="block"
                    value={formData.block}
                    onChange={handleChange}
                    placeholder="e.g., A"
                  />
                </div>
                <div className="form-group">
                  <label>Lot</label>
                  <input
                    type="text"
                    name="lot"
                    value={formData.lot}
                    onChange={handleChange}
                    placeholder="e.g., 101"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Resident'}
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

      {/* View Resident Modal */}
      {showViewModal && selectedResident && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Resident Details</h3>
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
                  <span className="detail-label">Username</span>
                  <span className="detail-value">{selectedResident.username}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{selectedResident.fullName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedResident.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{selectedResident.phoneNumber || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Block/Lot</span>
                  <span className="detail-value">
                    {selectedResident.block && selectedResident.lot 
                      ? `${selectedResident.block}-${selectedResident.lot}` 
                      : 'Not assigned'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">User ID</span>
                  <span className="detail-value">{selectedResident.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Residents;
