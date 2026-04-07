import React, { useState, useEffect } from 'react';
import './Billing.css';

function Billing() {
  // Billing data
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bills from API
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/bills');
        if (!response.ok) throw new Error('Failed to fetch bills');
        const data = await response.json();
        setBills(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching bills:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [lotFilter, setLotFilter] = useState('');
  const [residentFilter, setResidentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [billTypeFilter, setBillTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Bulk action states
  const [selectedBills, setSelectedBills] = useState([]);

  // Bill types for filter dropdown
  const billTypes = ['Association Dues', 'Water Bill', 'Electric Bill', 'Penalties', 'Maintenance Fee', 'Other'];

  // Calculate stats
  const totalBilled = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaid = bills.filter(bill => bill.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);
  const totalOutstanding = bills.filter(bill => bill.status !== 'paid').reduce((sum, bill) => sum + bill.amount, 0);
  const overdueBills = bills.filter(bill => bill.status === 'overdue').length;

  // Filter bills based on all criteria
  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billReference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLot = lotFilter === '' || bill.lotNumber.toLowerCase().includes(lotFilter.toLowerCase());
    const matchesResident = residentFilter === '' || bill.residentName.toLowerCase().includes(residentFilter.toLowerCase());
    const matchesBillType = billTypeFilter === '' || bill.billType === billTypeFilter;
    const matchesStatus = statusFilter === '' || bill.status === statusFilter;
    
    let matchesDateRange = true;
    if (dateFrom && dateTo) {
      const billDate = new Date(bill.dueDate);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      matchesDateRange = billDate >= fromDate && billDate <= toDate;
    } else if (dateFrom) {
      matchesDateRange = new Date(bill.dueDate) >= new Date(dateFrom);
    } else if (dateTo) {
      matchesDateRange = new Date(bill.dueDate) <= new Date(dateTo);
    }

    return matchesSearch && matchesLot && matchesResident && matchesBillType && matchesStatus && matchesDateRange;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

  // Get overdue bills for alerts section
  const overdueBillsList = bills.filter(bill => bill.status === 'overdue');

  // Handle view details
  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
    setShowViewModal(true);
  };

  // Handle edit
  const handleEdit = (bill) => {
    setSelectedBill(bill);
    setShowEditModal(true);
  };

  // Handle payment
  const handlePayment = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  // Handle delete
  const handleDelete = (bill) => {
    setSelectedBill(bill);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    setBills(bills.filter(b => b.id !== selectedBill.id));
    setShowDeleteModal(false);
    setSelectedBill(null);
  };

  // Mark as paid
  const markAsPaid = (billId) => {
    setBills(bills.map(bill => 
      bill.id === billId 
        ? { ...bill, status: 'paid', datePaid: new Date().toISOString().split('T')[0] }
        : bill
    ));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setLotFilter('');
    setResidentFilter('');
    setDateFrom('');
    setDateTo('');
    setBillTypeFilter('');
    setStatusFilter('');
  };

  // Handle bulk selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedBills(currentBills.map(bill => bill.id));
    } else {
      setSelectedBills([]);
    }
  };

  const handleSelectBill = (billId) => {
    setSelectedBills(prev => 
      prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  // Bulk actions
  const handleBulkMarkAsPaid = () => {
    setBills(bills.map(bill => 
      selectedBills.includes(bill.id)
        ? { ...bill, status: 'paid', datePaid: new Date().toISOString().split('T')[0] }
        : bill
    ));
    setSelectedBills([]);
  };

  const handleBulkSendReminders = () => {
    alert(`Reminders sent to ${selectedBills.length} residents`);
    setSelectedBills([]);
  };

  // Export functions
  const exportToPDF = () => {
    alert('Exporting to PDF...');
  };

  const exportToExcel = () => {
    alert('Exporting to Excel...');
  };

  // Send reminder for overdue bill
  const sendReminder = (billId) => {
    alert(`Reminder sent for bill ${billId}`);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'status-badge paid';
      case 'pending':
        return 'status-badge pending';
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
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Calculate days overdue
  const calculateDaysOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="billing-container">
      {/* Stats Cards Section */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total-billed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Outstanding</span>
              <span className="stat-value">{formatCurrency(totalOutstanding)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon overdue-bills">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Overdue Bills</span>
              <span className="stat-value overdue">{overdueBills}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alerts Section */}
      {overdueBillsList.length > 0 && (
        <div className="overdue-alerts-section">
          <div className="alert-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Warning: {overdueBillsList.length} overdue bill(s) require attention</span>
          </div>
          <div className="overdue-list">
            {overdueBillsList.map(bill => (
              <div key={bill.id} className="overdue-item">
                <div className="overdue-info">
                  <span className="overdue-lot">{bill.lotNumber}</span>
                  <span className="overdue-resident">{bill.residentName}</span>
                  <span className="overdue-amount">{formatCurrency(bill.amount)}</span>
                  <span className="overdue-days">{calculateDaysOverdue(bill.dueDate)} days overdue</span>
                </div>
                <button 
                  className="send-reminder-btn"
                  onClick={() => sendReminder(bill.id)}
                >
                  Send Reminder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Section */}
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
                placeholder="Search by lot, resident, or bill reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lot Number Filter */}
          <div className="filter-group">
            <label htmlFor="lotFilter">Lot Number</label>
            <input
              type="text"
              id="lotFilter"
              placeholder="Filter by lot number"
              value={lotFilter}
              onChange={(e) => setLotFilter(e.target.value)}
            />
          </div>

          {/* Resident Name Filter */}
          <div className="filter-group">
            <label htmlFor="residentFilter">Resident Name</label>
            <input
              type="text"
              id="residentFilter"
              placeholder="Filter by resident name"
              value={residentFilter}
              onChange={(e) => setResidentFilter(e.target.value)}
            />
          </div>

          {/* Date Range Filter */}
          <div className="filter-group date-range-group">
            <label>Date Range</label>
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

          {/* Bill Type Filter */}
          <div className="filter-group">
            <label htmlFor="billTypeFilter">Bill Type</label>
            <select
              id="billTypeFilter"
              value={billTypeFilter}
              onChange={(e) => setBillTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {billTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
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
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Table Section */}
      <div className="bills-table-section">
        <div className="table-header">
          <div className="table-title">
            <h2>Billing Entries</h2>
            <span className="table-info">Showing {filteredBills.length} of {bills.length} entries</span>
          </div>
          <div className="table-actions">
            <div className="export-buttons">
              <button className="export-btn pdf" onClick={exportToPDF}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                PDF
              </button>
              <button className="export-btn excel" onClick={exportToExcel}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Excel
              </button>
            </div>
            <button className="create-bill-btn" onClick={() => setShowCreateModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create New Bill
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedBills.length > 0 && (
          <div className="bulk-actions">
            <span>{selectedBills.length} bill(s) selected</span>
            <div className="bulk-buttons">
              <button className="bulk-btn mark-paid" onClick={handleBulkMarkAsPaid}>
                Mark as Paid
              </button>
              <button className="bulk-btn send-reminders" onClick={handleBulkSendReminders}>
                Send Reminders
              </button>
            </div>
          </div>
        )}

        <div className="table-container">
          <table className="bills-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedBills.length === currentBills.length && currentBills.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Bill Reference #</th>
                <th>Lot Number</th>
                <th>Resident Name</th>
                <th>Bill Type</th>
                <th>Billing Period</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBills.length > 0 ? (
                currentBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedBills.includes(bill.id)}
                        onChange={() => handleSelectBill(bill.id)}
                      />
                    </td>
                    <td>
                      <span className="bill-reference">{bill.billReference}</span>
                    </td>
                    <td>{bill.lotNumber}</td>
                    <td>{bill.residentName}</td>
                    <td>{bill.billType}</td>
                    <td>{bill.billingPeriod}</td>
                    <td>
                      <span className="amount">{formatCurrency(bill.amount)}</span>
                    </td>
                    <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={getStatusBadgeClass(bill.status)}>
                        {formatStatus(bill.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetails(bill)}
                          title="View Details"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(bill)}
                          title="Edit"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        {bill.status !== 'paid' && (
                          <button
                            className="action-btn pay-btn"
                            onClick={() => handlePayment(bill)}
                            title="Mark as Paid"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          </button>
                        )}
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(bill)}
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="no-results">
                    <div className="no-results-content">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                      <p>No bills found matching your criteria</p>
                      <button onClick={clearFilters}>Clear Filters</button>
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
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </button>
              ))}
            </div>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View Bill Details Modal */}
      {showViewModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bill Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Bill Reference:</label>
                <span>{selectedBill.billReference}</span>
              </div>
              <div className="detail-row">
                <label>Lot Number:</label>
                <span>{selectedBill.lotNumber}</span>
              </div>
              <div className="detail-row">
                <label>Resident Name:</label>
                <span>{selectedBill.residentName}</span>
              </div>
              <div className="detail-row">
                <label>Bill Type:</label>
                <span>{selectedBill.billType}</span>
              </div>
              <div className="detail-row">
                <label>Billing Period:</label>
                <span>{selectedBill.billingPeriod}</span>
              </div>
              <div className="detail-row">
                <label>Amount:</label>
                <span className="amount">{formatCurrency(selectedBill.amount)}</span>
              </div>
              <div className="detail-row">
                <label>Due Date:</label>
                <span>{new Date(selectedBill.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={getStatusBadgeClass(selectedBill.status)}>
                  {formatStatus(selectedBill.status)}
                </span>
              </div>
              {selectedBill.datePaid && (
                <>
                  <div className="detail-row">
                    <label>Date Paid:</label>
                    <span>{new Date(selectedBill.datePaid).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <label>Payment Method:</label>
                    <span>{selectedBill.paymentMethod}</span>
                  </div>
                </>
              )}
              {selectedBill.amountPaid && (
                <div className="detail-row">
                  <label>Amount Paid:</label>
                  <span>{formatCurrency(selectedBill.amountPaid)}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Bill Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Bill</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Bill Reference #</label>
                <input type="text" placeholder="e.g., BILL-2024-006" />
              </div>
              <div className="form-group">
                <label>Lot Number</label>
                <input type="text" placeholder="e.g., Lot 15" />
              </div>
              <div className="form-group">
                <label>Resident Name</label>
                <input type="text" placeholder="e.g., Juan Dela Cruz" />
              </div>
              <div className="form-group">
                <label>Bill Type</label>
                <select>
                  <option value="">Select Bill Type</option>
                  {billTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Billing Period</label>
                <input type="text" placeholder="e.g., Jan 2024" />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" placeholder="0.00" step="0.01" />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => setShowCreateModal(false)}>
                Create Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {showEditModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Bill</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Bill Reference #</label>
                <input type="text" defaultValue={selectedBill.billReference} />
              </div>
              <div className="form-group">
                <label>Lot Number</label>
                <input type="text" defaultValue={selectedBill.lotNumber} />
              </div>
              <div className="form-group">
                <label>Resident Name</label>
                <input type="text" defaultValue={selectedBill.residentName} />
              </div>
              <div className="form-group">
                <label>Bill Type</label>
                <select defaultValue={selectedBill.billType}>
                  {billTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Billing Period</label>
                <input type="text" defaultValue={selectedBill.billingPeriod} />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" defaultValue={selectedBill.amount} step="0.01" />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" defaultValue={selectedBill.dueDate} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select defaultValue={selectedBill.status}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="partial">Partial</option>
                </select>
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

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Record Payment</h2>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-summary">
                <div className="payment-info">
                  <span className="payment-label">Bill Reference:</span>
                  <span className="payment-value">{selectedBill.billReference}</span>
                </div>
                <div className="payment-info">
                  <span className="payment-label">Resident:</span>
                  <span className="payment-value">{selectedBill.residentName}</span>
                </div>
                <div className="payment-info">
                  <span className="payment-label">Total Amount:</span>
                  <span className="payment-value amount">{formatCurrency(selectedBill.amount)}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Payment Amount</label>
                <input type="number" placeholder="0.00" step="0.01" defaultValue={selectedBill.amount} />
              </div>
              <div className="form-group">
                <label>Payment Date</label>
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select>
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reference Number (Optional)</label>
                <input type="text" placeholder="e.g., Transaction ID" />
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea placeholder="Add any notes about this payment..." rows="3"></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={() => setShowPaymentModal(false)}>
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBill && (
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
                <p>Are you sure you want to delete this bill?</p>
                <p className="delete-details">
                  <strong>{selectedBill.billReference}</strong> for <strong>{selectedBill.residentName}</strong> at <strong>{selectedBill.lotNumber}</strong>
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

export default Billing;
