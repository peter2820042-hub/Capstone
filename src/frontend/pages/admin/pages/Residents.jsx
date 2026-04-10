import React, { useState, useEffect } from 'react';
import './Residents.css';

function Residents() {
  // Residents data
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch residents from API
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/residents');
        if (!response.ok) throw new Error('Failed to fetch residents');
        const data = await response.json();
        // API now returns data in frontend format (fullName, lotNumber, etc.)
        setResidents(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching residents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResidents();
  }, []);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  // Form state for adding new resident
  const [newResident, setNewResident] = useState({
    fullName: '',
    lotNumber: '',
    email: '',
    phoneNumber: '',
    role: 'user',
    address: '',
    dateOfBirth: ''
  });

  // Filter residents based on all criteria
  const filteredResidents = residents.filter(resident => {
    const matchesSearch = 
      resident.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.lotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resident.phoneNumber && resident.phoneNumber.includes(searchTerm));
    
    const matchesRole = roleFilter === '' || resident.role === roleFilter;
    const matchesStatus = statusFilter === '' || resident.status === statusFilter;
    
    let matchesDateRange = true;
    if (dateFrom && dateTo) {
      const regDate = new Date(resident.dateRegistered);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      matchesDateRange = regDate >= fromDate && regDate <= toDate;
    } else if (dateFrom) {
      matchesDateRange = new Date(resident.dateRegistered) >= new Date(dateFrom);
    } else if (dateTo) {
      matchesDateRange = new Date(resident.dateRegistered) <= new Date(dateTo);
    }

    return matchesSearch && matchesRole && matchesStatus && matchesDateRange;
  });

  // Handle view details
  const handleViewDetails = (resident) => {
    setSelectedResident(resident);
    setShowViewModal(true);
  };

  // Handle edit
  const handleEdit = (resident) => {
    setSelectedResident(resident);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = (resident) => {
    setSelectedResident(resident);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    setResidents(residents.filter(r => r.id !== selectedResident.id));
    setShowDeleteModal(false);
    setSelectedResident(null);
  };

  // Handle add new resident
  const handleAddResident = () => {
    const newId = residents.length > 0 ? Math.max(...residents.map(r => r.id)) + 1 : 1;
    const residentToAdd = {
      ...newResident,
      id: newId,
      residentId: `RES-${String(newId).padStart(3, '0')}`,
      status: 'active',
      dateRegistered: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      lotStatus: 'Owned',
      moveInDate: new Date().toISOString().split('T')[0]
    };
    setResidents([...residents, residentToAdd]);
    setShowAddModal(false);
    setNewResident({
      fullName: '',
      lotNumber: '',
      email: '',
      phoneNumber: '',
      role: 'user',
      address: '',
      dateOfBirth: ''
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  // Get role badge class
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge admin';
      case 'staff':
        return 'role-badge staff';
      case 'user':
        return 'role-badge user';
      default:
        return 'role-badge';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-badge active';
      case 'inactive':
        return 'status-badge inactive';
      case 'suspended':
        return 'status-badge suspended';
      default:
        return 'status-badge';
    }
  };

  // Format role text
  const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Format status text
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="residents-container">

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="filter-header">
          <h2>Search & Filter</h2>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>

        <div className="filter-grid">
          {/* General Search */}
          <div className="filter-group search-group">
            <label htmlFor="search">Search</label>
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                id="search"
                placeholder="Search by name, lot number, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="filter-group">
            <label htmlFor="roleFilter">Role</label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label htmlFor="statusFilter">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="filter-group date-range-group">
            <label>Date Registered</label>
            <div className="date-range-inputs">
              <input
                type="date"
                id="dateFrom"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
              />
              <span className="date-separator">to</span>
              <input
                type="date"
                id="dateTo"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Residents Table Section */}
      <div className="residents-table-section">
        <div className="table-header">
          <div className="header-title">
            <p className="header-subtitle">Manage and view all registered residents and their account information</p>
          </div>
          <div className="table-actions">
            <button className="add-resident-btn" onClick={() => setShowAddModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Account
            </button>
          </div>
        </div>

        <div className="table-info">
          Showing {filteredResidents.length} of {residents.length} accounts
        </div>

        <div className="table-container">
          <table className="residents-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Block</th>
                <th>Lot</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Date Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.length > 0 ? (
                filteredResidents.map((resident) => (
                  <tr key={resident.id}>
                    <td>{resident.fullName}</td>
                    <td>{resident.block}</td>
                    <td>{resident.lotNumber}</td>
                    <td>{resident.email}</td>
                    <td>{resident.phoneNumber}</td>
                    <td>{new Date(resident.dateRegistered).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetails(resident)}
                          title="View Details"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    <div className="no-results-content">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                      <p>No accounts found matching your criteria</p>
                      <button onClick={clearFilters}>Clear Filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedResident && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Account Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-section">
                <h3>Personal Information</h3>
                <div className="profile-grid">
                  <div className="profile-item">
                    <label>Full Name</label>
                    <span>{selectedResident.fullName}</span>
                  </div>
                  <div className="profile-item">
                    <label>Email</label>
                    <span>{selectedResident.email}</span>
                  </div>
                  <div className="profile-item">
                    <label>Phone Number</label>
                    <span>{selectedResident.phoneNumber}</span>
                  </div>
                  <div className="profile-item">
                    <label>Address</label>
                    <span>{selectedResident.address}</span>
                  </div>
                  <div className="profile-item">
                    <label>Date of Birth</label>
                    <span>{new Date(selectedResident.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>Account Information</h3>
                <div className="profile-grid">
                  <div className="profile-item">
                    <label>Resident ID</label>
                    <span>{selectedResident.residentId}</span>
                  </div>
                  <div className="profile-item">
                    <label>Role</label>
                    <span className={getRoleBadgeClass(selectedResident.role)}>
                      {formatRole(selectedResident.role)}
                    </span>
                  </div>
                  <div className="profile-item">
                    <label>Status</label>
                    <span className={getStatusBadgeClass(selectedResident.status)}>
                      {formatStatus(selectedResident.status)}
                    </span>
                  </div>
                  <div className="profile-item">
                    <label>Date Registered</label>
                    <span>{new Date(selectedResident.dateRegistered).toLocaleDateString()}</span>
                  </div>
                  <div className="profile-item">
                    <label>Last Login</label>
                    <span>{selectedResident.lastLogin}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>Lot Information</h3>
                <div className="profile-grid">
                  <div className="profile-item">
                    <label>Lot Number</label>
                    <span>{selectedResident.lotNumber}</span>
                  </div>
                  <div className="profile-item">
                    <label>Lot Status</label>
                    <span>{selectedResident.lotStatus}</span>
                  </div>
                  <div className="profile-item">
                    <label>Move-in Date</label>
                    <span>{new Date(selectedResident.moveInDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Account</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newResident.fullName}
                  onChange={(e) => setNewResident({...newResident, fullName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Lot Number *</label>
                <input
                  type="text"
                  value={newResident.lotNumber}
                  onChange={(e) => setNewResident({...newResident, lotNumber: e.target.value})}
                  placeholder="Enter lot number"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newResident.email}
                  onChange={(e) => setNewResident({...newResident, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={newResident.phoneNumber}
                  onChange={(e) => setNewResident({...newResident, phoneNumber: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={newResident.role}
                  onChange={(e) => setNewResident({...newResident, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={newResident.address}
                  onChange={(e) => setNewResident({...newResident, address: e.target.value})}
                  placeholder="Enter address"
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={newResident.dateOfBirth}
                  onChange={(e) => setNewResident({...newResident, dateOfBirth: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddResident}>
                Add Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedResident && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Account</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" defaultValue={selectedResident.fullName} />
              </div>
              <div className="form-group">
                <label>Lot Number</label>
                <input type="text" defaultValue={selectedResident.lotNumber} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" defaultValue={selectedResident.email} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" defaultValue={selectedResident.phoneNumber} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select defaultValue={selectedResident.role}>
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select defaultValue={selectedResident.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" defaultValue={selectedResident.address} />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" defaultValue={selectedResident.dateOfBirth} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => setShowEditModal(false)}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedResident && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <p>Are you sure you want to delete this account?</p>
                <p className="delete-details">
                  <strong>{selectedResident.fullName}</strong> ({selectedResident.residentId})
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Residents;
