import React, { useState, useEffect } from 'react';
import './Billing.css';

function Billing() {
  // Billing data
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);

  // Fetch bills from API
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch('/api/bills');
        if (!response.ok) throw new Error('Failed to fetch bills');
        const data = await response.json();
        setBills(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching bills:', err);
      }
    };
    fetchBills();
  }, []);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    lotNumber: '',
    residentName: '',
    billType: '',
    status: ''
  });

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    amount: '',
    billType: '',
    dueDate: '',
    status: ''
  });

  // Bill types for filter dropdown
  const billTypes = ['Association Dues', 'Water Bill', 'Electric Bill', 'Penalties', 'Maintenance Fee', 'Other'];

  // Calculate stats
  const totalBilled = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaid = bills.filter(bill => bill.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);
  const totalOutstanding = bills.filter(bill => bill.status !== 'paid').reduce((sum, bill) => sum + bill.amount, 0);

  // Handle filter input change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filter bills based on all criteria
  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      filters.search === '' ||
      bill.lotNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      bill.residentName?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesLot = filters.lotNumber === '' || bill.lotNumber?.toLowerCase().includes(filters.lotNumber.toLowerCase());
    const matchesResident = filters.residentName === '' || bill.residentName?.toLowerCase().includes(filters.residentName.toLowerCase());
    const matchesBillType = filters.billType === '' || bill.billType === filters.billType;
    const matchesStatus = filters.status === '' || bill.status === filters.status;

    return matchesSearch && matchesLot && matchesResident && matchesBillType && matchesStatus;
  });

  // Handle view details
  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
    setShowViewModal(true);
  };

  // Handle edit
  const handleEdit = (bill) => {
    setSelectedBill(bill);
    setEditForm({
      amount: bill.amount,
      billType: bill.billType,
      dueDate: bill.dueDate ? bill.dueDate.split('T')[0] : '',
      status: bill.status
    });
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Save edited bill
  const saveEdit = async () => {
    try {
      const response = await fetch(`/api/bills/${selectedBill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(editForm.amount),
          billType: editForm.billType,
          dueDate: editForm.dueDate,
          status: editForm.status
        })
      });
      
      if (!response.ok) throw new Error('Failed to update bill');
      
      // Refresh bills
      const fetchBills = async () => {
        const res = await fetch('/api/bills');
        const data = await res.json();
        setBills(data);
      };
      fetchBills();
      
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating bill:', err);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      lotNumber: '',
      residentName: '',
      billType: '',
      status: ''
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'status-badge paid';
      case 'unpaid':
        return 'status-badge unpaid';
      case 'overdue':
        return 'status-badge overdue';
      case 'partial':
        return 'status-badge partial';
      default:
        return 'status-badge';
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  if (error) {
    return (
      <div className="billing-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="billing-container">
      {/* Stats Cards Section */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total-billed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Billed</span>
              <span className="stat-value">{formatCurrency(totalBilled)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon total-paid">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Paid</span>
              <span className="stat-value">{formatCurrency(totalPaid)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon total-outstanding">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Outstanding</span>
              <span className="stat-value">{formatCurrency(totalOutstanding)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Search/Filter - Horizontal Layout */}
      <div className="search-filter-bar">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            name="search"
            placeholder="Search lot number or resident name..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>Lot Number</label>
          <input
            type="text"
            name="lotNumber"
            placeholder="Filter by lot number..."
            value={filters.lotNumber}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>Resident Name</label>
          <input
            type="text"
            name="residentName"
            placeholder="Filter by resident name..."
            value={filters.residentName}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>Bill Type</label>
          <select
            name="billType"
            value={filters.billType}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            {billTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
          </select>
        </div>
        <button className="clear-btn" onClick={clearFilters}>Clear</button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="billing-table">
          <thead>
            <tr>
              <th>Lot Number</th>
              <th>Resident Name</th>
              <th>Bill Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              if (filteredBills.length === 0) {
                return (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      {(filters.search || filters.lotNumber || filters.residentName || filters.billType || filters.status)
                        ? 'No bills found matching your search' 
                        : 'No bills logged yet'}
                    </td>
                  </tr>
                );
              }
              
              return filteredBills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.lotNumber || '-'}</td>
                  <td>{bill.residentName || '-'}</td>
                  <td>{bill.billType || '-'}</td>
                  <td>{formatCurrency(bill.amount)}</td>
                  <td>{formatDate(bill.dueDate)}</td>
                  <td>
                    <span className={getStatusBadgeClass(bill.status)}>
                      {formatStatus(bill.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn" onClick={() => handleViewDetails(bill)}>View</button>
                      <button className="edit-btn" onClick={() => handleEdit(bill)}>Edit</button>
                    </div>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showViewModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bill Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Lot Number:</span>
                <span className="detail-value">{selectedBill.lotNumber || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Resident Name:</span>
                <span className="detail-value">{selectedBill.residentName || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bill Reference:</span>
                <span className="detail-value">{selectedBill.billReference || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bill Type:</span>
                <span className="detail-value">{selectedBill.billType || '-'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">{formatCurrency(selectedBill.amount)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Due Date:</span>
                <span className="detail-value">{formatDate(selectedBill.dueDate)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={getStatusBadgeClass(selectedBill.status)}>
                  {formatStatus(selectedBill.status)}
                </span>
              </div>
              {selectedBill.paidDate && (
                <div className="detail-row">
                  <span className="detail-label">Paid Date:</span>
                  <span className="detail-value">{formatDate(selectedBill.paidDate)}</span>
                </div>
              )}
              {selectedBill.notes && (
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{selectedBill.notes}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Bill</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={editForm.amount}
                  onChange={handleEditFormChange}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Bill Type</label>
                <select
                  name="billType"
                  value={editForm.billType}
                  onChange={handleEditFormChange}
                >
                  {billTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={editForm.dueDate}
                  onChange={handleEditFormChange}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="modal-btn save" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;