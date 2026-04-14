import React, { useState, useEffect, useMemo } from 'react';
import './Billing.css';

function Billing() {
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Data states
  const [bills, setBills] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch data on mount
  useEffect(() => {
    fetchBills();
    fetchResidents();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bills');
      const data = await response.json();
      setBills(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      console.error('Error fetching bills:');
      setError('Failed to load bills');
    } finally {
      setLoading(false);
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

  // Unique values for filters
  const uniqueStatuses = useMemo(() => {
    return [...new Set(bills.map(bill => bill.status).filter(Boolean))];
  }, [bills]);

  const uniqueBillTypes = useMemo(() => {
    return [...new Set(bills.map(bill => bill.billType).filter(Boolean))];
  }, [bills]);

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // Date filter
      if (dateFrom && bill.dueDate && bill.dueDate < dateFrom) return false;
      if (dateTo && bill.dueDate && bill.dueDate > dateTo) return false;

      // Status filter
      if (statusFilter && bill.status !== statusFilter) return false;

      // Bill type filter
      if (billTypeFilter && bill.billType !== billTypeFilter) return false;

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesBillRef = bill.billReference?.toLowerCase().includes(query);
        const matchesResident = bill.residentName?.toLowerCase().includes(query);
        const matchesLot = bill.lotNumber?.toLowerCase().includes(query);
        const matchesBillType = bill.billType?.toLowerCase().includes(query);
        if (!matchesBillRef && !matchesResident && !matchesLot && !matchesBillType) return false;
      }

      return true;
    });
  }, [bills, dateFrom, dateTo, statusFilter, billTypeFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBills = filteredBills.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFrom, dateTo, statusFilter, billTypeFilter, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      total: filteredBills.reduce((sum, bill) => sum + (bill.amount || 0), 0),
      paid: filteredBills.filter(b => b.status === 'Paid').reduce((sum, bill) => sum + (bill.amount || 0), 0),
      unpaid: filteredBills.filter(b => b.status === 'unpaid').reduce((sum, bill) => sum + (bill.amount || 0), 0),
      pending: filteredBills.filter(b => b.status === 'pending').reduce((sum, bill) => sum + (bill.amount || 0), 0),
      overdue: filteredBills.filter(b => b.status === 'overdue').reduce((sum, bill) => sum + (bill.amount || 0), 0)
    };
  }, [filteredBills]);

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
    const resident = residents.find(r => r.lotNumber === lotNumber);
    setFormData(prev => ({
      ...prev,
      lotNumber,
      residentName: resident ? resident.fullName : ''
    }));
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lotNumber') {
      handleLotNumberChange(e);
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

  // Loading state
  if (loading && bills.length === 0) {
    return (
      <div className="billing-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading bills...</p>
        </div>
      </div>
    );
  }

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
        <h1>Billing Management</h1>
        <button className="btn-primary" onClick={openCreateModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Bill
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-grid">
          <div className="summary-card total">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Total Amount</span>
              <span className="card-value">{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <div className="summary-card paid">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Paid</span>
              <span className="card-value">{formatCurrency(totals.paid)}</span>
            </div>
          </div>

          <div className="summary-card pending">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Unpaid</span>
              <span className="card-value">{formatCurrency(totals.unpaid)}</span>
            </div>
          </div>

          <div className="summary-card overdue">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Overdue</span>
              <span className="card-value">{formatCurrency(totals.overdue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by bill reference, resident, or lot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Bill Type</label>
            <select value={billTypeFilter} onChange={(e) => setBillTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {(uniqueBillTypes.length > 0 ? uniqueBillTypes : billTypes).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Due Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Due Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-section">
        <div className="table-container">
          <table className="bills-table">
            <thead>
              <tr>
                <th>Bill Reference</th>
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
              {paginatedBills.length > 0 ? (
                paginatedBills.map(bill => {
                  const billStyle = getBillStyle(bill.billType);
                  return (
                    <tr key={bill.id}>
                      <td className="bill-ref">{bill.billReference}</td>
                      <td className="lot-number">{bill.lotNumber}</td>
                      <td className="resident-name">{bill.residentName}</td>
                      <td>
                        <div className="bill-type-badge" style={{ backgroundColor: billStyle.bg, color: billStyle.color }}>
                          <span className="bill-type-icon">{billStyle.icon}</span>
                          <span>{bill.billType}</span>
                        </div>
                      </td>
                      <td className="amount">{formatCurrency(bill.amount)}</td>
                      <td className="due-date">{formatDate(bill.dueDate)}</td>
                      <td className="status">
                        <span className={`status-badge ${bill.status?.toLowerCase()}`}>
                          {bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1)}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="action-btn view" onClick={() => viewBillDetails(bill)} title="View Details">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button className="action-btn edit" onClick={() => openEditModal(bill)} title="Edit">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="action-btn delete" onClick={() => openDeleteModal(bill)} title="Delete">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="no-results">
                    <div className="no-results-content">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <p>No bills found</p>
                      <p className="hint">Try adjusting your filters or create a new bill</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="pagination-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
            <button className="pagination-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>

            <button className="pagination-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button className="pagination-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
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
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBill ? 'Edit Bill' : 'Create New Bill'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formMessage && (
                  <div className={`form-message ${formMessage.type}`}>
                    {formMessage.text}
                  </div>
                )}
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Lot Number <span className="required">*</span></label>
                    <select 
                      name="lotNumber" 
                      value={formData.lotNumber} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Lot Number</option>
                      {residents.map(resident => (
                        <option key={resident.id} value={resident.lotNumber}>
                          {resident.lotNumber} - {resident.fullName}
                        </option>
                      ))}
                    </select>
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
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingBill ? 'Update Bill' : 'Create Bill')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedBill && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bill Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {/* Bill Header Card */}
              <div className="bill-header-card">
                <div className="bill-type-badge" style={{ 
                  backgroundColor: getBillStyle(selectedBill.billType)?.bg, 
                  color: getBillStyle(selectedBill.billType)?.color 
                }}>
                  <span className="bill-type-icon">{getBillStyle(selectedBill.billType)?.icon}</span>
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
                <div className="detail-card">
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
                
                <div className="detail-card">
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
                
                <div className="detail-card">
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
                
                <div className="detail-card highlight">
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
            <div className="modal-footer">
              {selectedBill.status !== 'Paid' && (
                <button className="btn-success" onClick={() => { handleMarkAsPaid(selectedBill); closeModal(); }}>
                  Mark as Paid
                </button>
              )}
              <button className="btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBill && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Bill</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p>Are you sure you want to delete this bill?</p>
              </div>
              <div className="delete-details">
                <div className="detail-row">
                  <label>Bill Reference:</label>
                  <span>{selectedBill.billReference}</span>
                </div>
                <div className="detail-row">
                  <label>Resident:</label>
                  <span>{selectedBill.residentName}</span>
                </div>
                <div className="detail-row">
                  <label>Amount:</label>
                  <span>{formatCurrency(selectedBill.amount)}</span>
                </div>
              </div>
              {formMessage && (
                <div className={`form-message ${formMessage.type}`}>
                  {formMessage.text}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
