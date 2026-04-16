import React, { useState, useEffect, useMemo } from 'react';
import './Billing.css';

function Billing() {
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Data states
  const [bills, setBills] = useState([]);
  const [residents, setResidents] = useState([]);

  const [error, setError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [editingBill, setEditingBill] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    lotNumber: '',
    block: '',
    residentName: '',
    billType: 'Monthly Dues',
    amount: '',
    dueDate: '',
    billingPeriod: '',
    status: 'unpaid'
  });
  const [formMessage, setFormMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Bill types with colors (matching Violations design)
  const billTypes = ['Monthly Dues', 'Parking Fee', 'Utility Fee', 'Association Fee', 'Special Assessment', 'Violations', 'Other'];

  // Bill type colors and icons
  const getBillStyle = (type) => {
    const styles = {
      'Monthly Dues': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        ),
        color: '#3b82f6',
        bg: '#dbeafe'
      },
      'Parking Fee': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 17H7a2 2 0 0 1 0-4h2" />
            <path d="M15 3h2a2 2 0 0 1 0 4h-2" />
          </svg>
        ),
        color: '#f59e0b',
        bg: '#fef3c7'
      },
      'Utility Fee': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        ),
        color: '#10b981',
        bg: '#d1fae5'
      },
      'Association Fee': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
        color: '#8b5cf6',
        bg: '#ede9fe'
      },
      'Special Assessment': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
        color: '#ef4444',
        bg: '#fee2e2'
      },
      'Violations': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ),
        color: '#dc2626',
        bg: '#fee2e2'
      },
      'Other': {
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        ),
        color: '#6b7280',
        bg: '#f3f4f6'
      }
    };
    return styles[type] || styles['Other'];
  };

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills');
      const data = await response.json();
      setBills(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      console.error('Error fetching bills:');
      setError('Failed to load bills');
    }
  };

  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/residents');
      const data = await response.json();
      setResidents(Array.isArray(data) ? data : []);
    } catch {
      console.error('Error fetching residents:');
    }
  };

  // Fetch data on mount
  useEffect(() => {
    (async () => {
      await fetchBills();
      await fetchResidents();
    })();
  }, []);

  // Filter bills - show all without search/filter
  const filteredBills = useMemo(() => {
    return bills;
  }, [bills]);

  // Pagination
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBills = filteredBills.slice(startIndex, startIndex + itemsPerPage);

  // Calculate totals (for future use if needed)
  const totalAmount = bills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  
  // Debug: Check what the data looks like
  console.log('[Billing] bills count:', bills.length);
  console.log('[Billing] sample bill:', bills[0]);
  console.log('[Billing] totalAmount:', totalAmount);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle lot number change - auto-fill resident name
  const handleLotNumberChange = (e) => {
    const lotNumber = e.target.value;
    const { block } = formData;
    const resident = residents.find(r => r.block === block && r.lotNumber === lotNumber);
    setFormData(prev => ({
      ...prev,
      lotNumber,
      residentName: resident ? resident.fullName : '',
      block: resident ? resident.block : prev.block
    }));
  };

  // Handle block selection change
  const handleBlockChange = (e) => {
    const selectedBlock = e.target.value;
    setFormData(prev => ({ ...prev, block: selectedBlock, lotNumber: '', residentName: '' }));
  };

  // Get unique blocks from residents
  const uniqueBlocks = [...new Set(residents.map(r => r.block).filter(Boolean))].sort();

  // Filter residents by selected block
  const filteredResidents = formData.block 
    ? residents.filter(r => r.block === formData.block) 
    : residents;

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lotNumber') {
      handleLotNumberChange(e);
    } else if (name === 'block') {
      handleBlockChange(e);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setFormData({
      lotNumber: '',
      residentName: '',
      billType: 'Monthly Dues',
      amount: '',
      dueDate: '',
      billingPeriod: '',
      status: 'unpaid'
    });
    setFormMessage(null);
    setEditingBill(null);
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (bill) => {
    setFormData({
      lotNumber: bill.lotNumber || '',
      block: bill.block || '',
      residentName: bill.residentName || '',
      billType: bill.billType || 'Monthly Dues',
      amount: bill.amount || '',
      dueDate: bill.dueDate ? bill.dueDate.split('T')[0] : '',
      billingPeriod: bill.billingPeriod || '',
      status: bill.status || 'unpaid'
    });
    setFormMessage(null);
    setEditingBill(bill);
    setShowModal(true);
  };

  // View bill details
  const viewBillDetails = (bill) => {
    setSelectedBill(bill);
    setShowViewModal(true);
  };

  // Open delete confirmation
  const openDeleteModal = (bill) => {
    setSelectedBill(bill);
    setShowDeleteModal(true);
  };

  // Close all modals
  const closeModal = () => {
    setShowModal(false);
    setShowViewModal(false);
    setShowDeleteModal(false);
    setSelectedBill(null);
    setEditingBill(null);
    setFormMessage(null);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null);
    setSubmitting(true);

    try {
      const payload = {
        lot_number: formData.lotNumber,
        block: formData.block,
        resident_name: formData.residentName,
        bill_type: formData.billType,
        amount: parseFloat(formData.amount),
        due_date: formData.dueDate,
        billing_period: formData.billingPeriod || formData.billType,
        status: formData.status
      };

      let response;
      if (editingBill) {
        response = await fetch(`/api/bills/${editingBill.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/bills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();

      if (response.ok) {
        setFormMessage({ type: 'success', text: editingBill ? 'Bill updated successfully' : 'Bill created successfully' });
        fetchBills();
        setTimeout(() => {
          closeModal();
        }, 1000);
      } else {
        setFormMessage({ type: 'error', text: data.error || 'Failed to save bill' });
      }
    } catch {
      setFormMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedBill) return;

    try {
      const response = await fetch(`/api/bills/${selectedBill.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchBills();
        closeModal();
      } else {
        const data = await response.json();
        setFormMessage({ type: 'error', text: data.error || 'Failed to delete bill' });
      }
    } catch {
      setFormMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async (bill) => {
    try {
      const response = await fetch(`/api/bills/${bill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bill,
          status: 'Paid'
        })
      });

      if (response.ok) {
        fetchBills();
      }
    } catch {
      console.error('Error marking bill as paid:');
    }
  };

  // Error state
  if (error && bills.length === 0) {
    return (
      <div className="billing-container">
        <div className="error-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button onClick={fetchBills}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-container">
      {/* Header */}
      <div className="billing-header">
        <div className="billing-header-title">
          <p className="header-subtitle">Manage and monitor resident billing and payments</p>
        </div>
        <button className="add-btn" onClick={openCreateModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Bill
        </button>
      </div>

      {/* Stats - KPIs removed */}

      {/* Table */}
      <div className="billing-admin-admin-table-container">
        <table className="violations-table">
          <thead>
            <tr>
              <th>Resident Name</th>
              <th>Bill Type</th>
              <th>Amount</th>
              <th>Date Issued</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBills.length > 0 ? (
              paginatedBills.map(bill => {
                const billStyle = getBillStyle(bill.billType);
                return (
                  <tr key={bill.id}>
                    <td className="resident-name">{bill.residentName}</td>
                    <td>
                      <div className="billing-bill-type-badge">
                        <span className="billing-bill-type-icon">{billStyle.icon}</span>
                        <span>{bill.billType}</span>
                      </div>
                    </td>
                    <td className="amount">{formatCurrency(bill.amount)}</td>
                    <td className="date-issued">{bill.dateIssued ? formatDate(bill.dateIssued) : '-'}</td>
                    <td className="due-date">{formatDate(bill.dueDate)}</td>
                    <td className="status">
                      <span className={`status-badge ${bill.status?.toLowerCase()}`}>
                        {bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                        <button className="view-btn" onClick={() => viewBillDetails(bill)}>
                          View
                        </button>
                        <button className="edit-btn" onClick={() => openEditModal(bill)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => openDeleteModal(bill)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="billing-admin-admin-empty-row">
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="billing-admin-admin-pagination">
            <button className="admin-admin-admin-admin-pagination-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
            <button className="admin-admin-admin-admin-pagination-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            
            <div className="billing-admin-admin-admin-admin-pagination-info">
              Page {currentPage} of {totalPages}
            </div>

            <button className="admin-admin-admin-admin-pagination-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button className="admin-admin-admin-admin-pagination-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </button>

            <select 
              className="items-per-page"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="admin-admin-modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-admin-modal-header">
              <h3>{editingBill ? 'Edit Bill' : 'Create New Bill'}</h3>
              <button className="close-btn" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-admin-modal-body">
                {formMessage && (
                  <div className={`admin-admin-form-message ${formMessage.type}`}>
                    {formMessage.text}
                  </div>
                )}
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Block <span className="required">*</span></label>
                    <select 
                      name="block" 
                      value={formData.block} 
                      onChange={handleBlockChange}
                      required
                    >
                      <option value="">Select Block</option>
                      {uniqueBlocks.map(block => (
                        <option key={block} value={block}>{block}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Lot Number <span className="required">*</span></label>
                    <select 
                      name="lotNumber" 
                      value={formData.lotNumber} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Lot Number</option>
                      {filteredResidents.map(resident => (
                        <option key={resident.id} value={resident.lotNumber}>
                          {resident.lotNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Resident Name</label>
                    <input 
                      type="text" 
                      name="residentName" 
                      value={formData.residentName} 
                      readOnly
                      placeholder="Auto-filled from lot"
                    />
                  </div>

                  <div className="form-group">
                    <label>Bill Type <span className="required">*</span></label>
                    <select 
                      name="billType" 
                      value={formData.billType} 
                      onChange={handleInputChange}
                      required
                    >
                      {billTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Amount <span className="required">*</span></label>
                    <input 
                      type="number" 
                      name="amount" 
                      value={formData.amount} 
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Due Date <span className="required">*</span></label>
                    <input 
                      type="date" 
                      name="dueDate" 
                      value={formData.dueDate} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Billing Period</label>
                    <input 
                      type="text" 
                      name="billingPeriod" 
                      value={formData.billingPeriod} 
                      onChange={handleInputChange}
                      placeholder="e.g., January 2024"
                    />
                  </div>

                  <div className="form-group">
                    <label>Status <span className="required">*</span></label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="admin-admin-modal-actions">
                  <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingBill ? 'Update Bill' : 'Create Bill')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedBill && (
        <div className="billing-admin-admin-modal-overlay" onClick={closeModal}>
          <div className="billing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="billing-admin-admin-modal-header">
              <h2>Bill Details</h2>
              <button className="billing-admin-admin-modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="admin-admin-modal-body">
              {/* Bill Header Card */}
              <div className="bill-header-card">
                <div className="billing-bill-type-badge">
                  <span className="billing-bill-type-icon">{getBillStyle(selectedBill.billType)?.icon}</span>
                  <span>{selectedBill.billType}</span>
                </div>
                <div className="bill-header-info">
                  <h2 className="bill-type-title">{selectedBill.billType}</h2>
                  <p className="bill-id">Bill Reference: {selectedBill.billReference}</p>
                </div>
                <div className={`status-pill ${selectedBill.status}`}>
                  {selectedBill.status}
                </div>
              </div>

              {/* Detail Cards */}
              <div className="detail-cards-grid">
                <div className="admin-admin-detail-card">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </div>
                  <div className="card-content">
                    <span className="card-label">Lot Number</span>
                    <span className="card-value">{selectedBill.lotNumber || 'N/A'}</span>
                  </div>
                </div>

                <div className="admin-admin-detail-card">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </div>
                  <div className="card-content">
                    <span className="card-label">Block</span>
                    <span className="card-value">{selectedBill.block || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="admin-admin-detail-card">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="card-content">
                    <span className="card-label">Resident</span>
                    <span className="card-value">{selectedBill.residentName || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="admin-admin-detail-card">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className="card-content">
                    <span className="card-label">Due Date</span>
                    <span className="card-value">{formatDate(selectedBill.dueDate)}</span>
                  </div>
                </div>
                
                <div className="admin-admin-detail-card highlight">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="card-content">
                    <span className="card-label">Amount</span>
                    <span className="card-value">{formatCurrency(selectedBill.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="billing-admin-admin-modal-footer">
              {selectedBill.status !== 'Paid' && (
                <button className="billing-admin-admin-btn-primary" onClick={() => { handleMarkAsPaid(selectedBill); closeModal(); }}>
                  Mark as Paid
                </button>
              )}
              <button className="billing-admin-admin-btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBill && (
        <div className="billing-admin-admin-modal-overlay" onClick={closeModal}>
          <div className="billing-admin-admin-modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="billing-admin-admin-modal-header">
              <h2>Delete Bill</h2>
              <button className="billing-admin-admin-modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="admin-admin-modal-body">
              <div className="delete-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p>Are you sure you want to delete this bill?</p>
              </div>
              <div className="delete-details">
                <div className="admin-admin-detail-row">
                  <label>Bill Reference:</label>
                  <span>{selectedBill.billReference}</span>
                </div>
                <div className="admin-admin-detail-row">
                  <label>Resident:</label>
                  <span>{selectedBill.residentName}</span>
                </div>
                <div className="admin-admin-detail-row">
                  <label>Amount:</label>
                  <span>{formatCurrency(selectedBill.amount)}</span>
                </div>
              </div>
              {formMessage && (
                <div className={`admin-admin-form-message ${formMessage.type}`}>
                  {formMessage.text}
                </div>
              )}
            </div>
            <div className="admin-admin-modal-footer">
              <button className="billing-admin-admin-btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="billing-admin-admin-btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
