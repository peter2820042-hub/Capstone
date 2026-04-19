import React, { useState, useEffect, useMemo } from 'react';
import './Billing.css';

function Billing() {
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    billType: ''
  });

  // Data states
  const [bills, setBills] = useState([]);
  const [residents, setResidents] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [editingBill, setEditingBill] = useState(null);

  // Form state
  const [formData, setFormData] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      lotNumber: '',
      block: '',
      residentName: '',
      billType: 'Monthly Dues',
      amount: '',
      dueDate: today,
      status: 'pending'
    };
  });
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

  // Bill types with colors (matching Violations design)
  const billTypes = ['Monthly Dues', 'Parking Fee', 'Utility Fee', 'Association Fee', 'Special Assessment', 'Violations', 'Other'];

  // Bill type colors and icons

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
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

  // Fetch residents
  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/residents');
      const data = await response.json();
      setResidents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  };

  // Fetch bills
  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bills?_t=' + Date.now());
      const data = await response.json();
      console.log('Fetched bills:', data);
      console.log('Sample bill:', data[0] ? { dueDate: data[0].dueDate, dateIssued: data[0].dateIssued } : 'no data');
      setBills(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      console.error('Error fetching bills:');
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchResidents();
      await fetchBills();
    };
    loadData();
  }, []);

  // Get unique blocks for filter
  const uniqueBlocks = useMemo(() => {
    return [...new Set(residents.map(r => r.block).filter(Boolean))];
  }, [residents]);

  // Filter residents by selected block for modal lot number dropdown
  const filteredResidents = formData.block
    ? residents.filter(r => r.block === formData.block)
    : residents;

  // Filtered and paginated bills
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchesSearch = !searchQuery ||
        bill.residentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.billReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.lotNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !filters.status || bill.status?.toLowerCase() === filters.status.toLowerCase();
      const matchesBillType = !filters.billType || bill.billType === filters.billType;

      return matchesSearch && matchesStatus && matchesBillType;
    });
  }, [bills, searchQuery, filters]);

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBills.slice(start, start + itemsPerPage);
  }, [filteredBills, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Modal handlers
  const closeModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setShowModal(false);
    setShowViewModal(false);
    setSelectedBill(null);
    setEditingBill(null);
    setToast(null);
    setFormData({
      lotNumber: '',
      block: '',
      residentName: '',
      billType: 'Monthly Dues',
      amount: '',
      dueDate: today,
      status: 'pending'
    });
  };

  const openAddViolationModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingBill(null);
    setFormData({
      lotNumber: '',
      block: '',
      residentName: '',
      billType: 'Violations',
      amount: '',
      dueDate: today,
      status: 'pending'
    });
    setShowModal(true);
    setToast(null);
  };

  const openEditModal = (bill) => {
    setEditingBill(bill);
    setFormData({
      lotNumber: bill.lotNumber || '',
      block: bill.block || '',
      residentName: bill.residentName || '',
      billType: bill.billType || 'Monthly Dues',
      amount: bill.amount?.toString() || '',
      dueDate: bill.dueDate?.split('T')[0] || '',
      billingPeriod: bill.billingPeriod || '',
      status: bill.status?.toLowerCase() || 'pending'
    });
    setShowModal(true);
  };

  const viewBillDetails = (bill) => {
    setSelectedBill(bill);
    setShowViewModal(true);
  };

  // Handle block change to update lot numbers
  const handleBlockChange = (e) => {
    const selectedBlock = e.target.value;
    setFormData(prev => ({
      ...prev,
      block: selectedBlock,
      lotNumber: '',
      residentName: ''
    }));
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('handleInputChange:', name, '=', value);
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill resident name when lot number changes
    if (name === 'lotNumber') {
      const selectedResident = residents.find(r => r.lotNumber === value && r.block === formData.block);
      if (selectedResident) {
        setFormData(prev => ({
          ...prev,
          residentName: selectedResident.fullName || selectedResident.name || ''
        }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setToast(null);

    const billData = {
      lotNumber: formData.lotNumber,
      block: formData.block,
      residentName: formData.residentName,
      billType: formData.billType,
      billingPeriod: formData.billingPeriod || 'N/A',
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      status: 'pending'
    };

    console.log('Frontend sending billData:', JSON.stringify(billData));

    try {
      const url = editingBill ? `/api/bills/${editingBill.id}` : '/api/bills';
      const method = editingBill ? 'PUT' : 'POST';
      console.log('Sending', method, 'to', url);
      console.log('Request body:', JSON.stringify(billData));

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await response.json();
      console.log('Response result:', result);

      // Check if response is OK - show success or error toast accordingly
      if (response.ok) {
        setToast({ type: 'success', message: editingBill ? 'Bill updated successfully!' : 'Bill created successfully!' });
        setTimeout(() => {
          closeModal();
          fetchBills();
        }, 1500);
      } else {
        setToast({ type: 'error', message: result.error || 'Failed to save bill' });
      }
    } catch (error) {
      console.error('Error saving bill:', error);
      setToast({ type: 'error', message: 'Failed to save bill' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async (bill) => {
    try {
      const response = await fetch(`/api/bills/${bill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      });

      if (response.ok) {
        fetchBills();
        setToast({ type: 'success', message: 'Bill marked as paid successfully!' });
      }
    } catch (error) {
      console.error('Error marking bill as paid:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchBills();
        setToast({ type: 'success', message: 'Bill deleted successfully!' });
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  return (
    <div className="billing-container">
      {/* Toast Notification */}
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

      {/* Page Header */}
      <div className="sr-header">
        <div className="sr-title">
          <p className="sr-subtitle">Manage resident bills, payments, and financial records</p>
        </div>
        <button className="sr-add-btn" onClick={openAddViolationModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Bill
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <p>{error}</p>
          <button onClick={fetchBills}>Try Again</button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="sr-search-filter-bar">
        <div className="sr-filters-row">
          <div className="sr-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by resident name, bill reference, or lot number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sr-filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="sr-filter-group">
            <label>Type</label>
            <select
              value={filters.billType}
              onChange={(e) => setFilters(prev => ({ ...prev, billType: e.target.value }))}
            >
              <option value="">All Types</option>
              {billTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="sr-buttons-row">
          <button className="sr-search-btn" onClick={() => setCurrentPage(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Search
          </button>
          <button
            className="sr-reset-btn"
            onClick={() => {
              setSearchQuery('');
              setFilters({ status: '', billType: '' });
            }}
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
        <h3 className="sr-table-title">Billing List</h3>
        <div className="sr-table-container">
          <table className="sr-table">
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="sr-loading-cell">
                    <div className="sr-loading-state">
                      <div className="sr-spinner"></div>
                      <span>Loading bills...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="sr-empty-row">
                    No bills found
                  </td>
                </tr>
              ) : (
                paginatedBills.map(bill => {
                  return (
                    <tr key={bill.id}>
                      <td>{bill.residentName || '-'}</td>
                      <td>
                        <span className={`sr-bill-type-badge ${bill.billType.toLowerCase().replace(' ', '-')}`}>
                          {bill.billType}
                        </span>
                      </td>
                      <td className="amount">{formatCurrency(bill.amount)}</td>
                      <td className="date-issued">{bill.dateIssued ? formatDate(bill.dateIssued) : '-'}</td>
                      <td className="due-date">{formatDate(bill.dueDate)}</td>
                      <td>
                        <span className={`sr-status-badge status-${(bill.status || 'unpaid').toLowerCase()}`}>
                          {bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="sr-table-actions">
                          <button className="sr-view-btn" onClick={() => viewBillDetails(bill)}>View</button>
                          <button className="sr-edit-btn" onClick={() => openEditModal(bill)}>Edit</button>
                          <button className="sr-delete-btn" onClick={() => handleDelete(bill.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination */}
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
        <div className="sr-modal-overlay" onClick={closeModal}>
          <div className="sr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sr-modal-header">
              <h3 style={{ textAlign: 'center', flex: 1 }}>{editingBill ? 'Edit Bill' : 'Create New Bill'}</h3>
              <button className="sr-modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="sr-modal-form">

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
                      {uniqueBlocks.map(block => (
                        <option key={block} value={block}>{block}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sr-form-group">
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

                  <div className="sr-form-group">
                    <label>Resident Name</label>
                    <input
                      type="text"
                      name="residentName"
                      value={formData.residentName}
                      readOnly
                      placeholder="Auto-filled from lot"
                    />
                  </div>

                  <div className="sr-form-group">
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

                  <div className="sr-form-group">
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

                  <div className="sr-form-group">
                    <label>Due Date <span className="required">*</span></label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="sr-modal-actions" style={{ justifyContent: 'center', gap: '20px' }}>
                  <button type="button" className="sr-cancel-btn" onClick={closeModal} style={{ padding: '10px 100px', fontSize: '16px' }}>
                    Cancel
                  </button>
                  <button type="submit" className="sr-submit-btn" disabled={submitting} style={{ padding: '10px 100px', fontSize: '16px' }}>
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
              {/* Simple Bill Info */}
              <div className="bill-detail-header">
                <h3>{selectedBill.billType}</h3>
                <p className="bill-ref">Reference: {selectedBill.billReference}</p>
              </div>

              {/* Simple Detail Rows */}
              <div className="bill-detail-list">
                <div className="bill-detail-row">
                  <span className="detail-label">Resident Name</span>
                  <span className="detail-value">{selectedBill.residentName || 'N/A'}</span>
                </div>
                <div className="bill-detail-row">
                  <span className="detail-label">Lot Number</span>
                  <span className="detail-value">{selectedBill.lotNumber || 'N/A'}</span>
                </div>
                <div className="bill-detail-row">
                  <span className="detail-label">Block</span>
                  <span className="detail-value">{selectedBill.block || 'N/A'}</span>
                </div>
                <div className="bill-detail-row">
                  <span className="detail-label">Date Issued</span>
                  <span className="detail-value">{selectedBill.dateIssued ? formatDate(selectedBill.dateIssued) : 'N/A'}</span>
                </div>
                <div className="bill-detail-row">
                  <span className="detail-label">Due Date</span>
                  <span className="detail-value">{formatDate(selectedBill.dueDate)}</span>
                </div>
                <div className="bill-detail-row">
                  <span className="detail-label">Billing Period</span>
                  <span className="detail-value">{selectedBill.billingPeriod || 'N/A'}</span>
                </div>
                <div className="bill-detail-row">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status-${(selectedBill.status || 'unpaid').toLowerCase()}`}>{selectedBill.status?.charAt(0).toUpperCase() + selectedBill.status?.slice(1)}</span>
                </div>
                <div className="bill-detail-row total-row">
                  <span className="detail-label">Total Amount</span>
                  <span className="detail-value">{formatCurrency(selectedBill.amount)}</span>
                </div>
              </div>
            </div>
            <div className="billing-admin-admin-modal-footer">
              <button className="billing-admin-admin-btn-secondary" onClick={closeModal}>Close</button>
              {selectedBill.status !== 'Paid' && (
                <button className="billing-admin-admin-btn-primary" onClick={() => { handleMarkAsPaid(selectedBill); closeModal(); }}>
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default Billing;
