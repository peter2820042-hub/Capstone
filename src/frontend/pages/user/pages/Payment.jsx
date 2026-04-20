import React, { useState, useEffect } from 'react';
import './Payment.css';

// PayMonggo public key (loaded from backend)
let paymongoPublicKey = null;

function Payment({ user }) {
  // Payment form states
  const [selectedBills, setSelectedBills] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // PayMonggo GCash states
  const [, setIsProcessingGCash] = useState(false);
  const [, setGcashLoading] = useState(false);

  // Bills data - will be fetched from database
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);

  // Transaction history
  const [transactions, setTransactions] = useState([]);

  // KPI Stats
  const [kpis, setKpis] = useState({
    unpaidBills: 0,
    pendingPayments: 0,
    totalDue: 0
  });

  // Get user's lot number from user prop
  const lotNumber = user?.lotNumber || user?.lotNumber;

  // Payment methods - updated with PayMonggo
  const paymentMethods = [
    { id: 'cash', name: 'Cash'},
    { id: 'gcash', name: 'GCash', icon: '💚' },
    { id: 'gcrypto', name: 'GCrypto' }
  ];

  // Fetch PayMonggo public key on mount
  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const response = await fetch('/api/payments/public-key');
        const data = await response.json();
        paymongoPublicKey = data.publicKey;
      } catch (err) {
        console.error('Error fetching PayMonggo public key:', err);
      }
    };
    fetchPublicKey();
  }, []);

  // Fetch unpaid bills from database
  useEffect(() => {
    if (!lotNumber) return;

    const fetchBills = async () => {
      try {
        const response = await fetch(`/api/bills/user/${encodeURIComponent(lotNumber)}/unpaid`);
        if (!response.ok) {
          throw new Error('Failed to fetch bills');
        }
        const data = await response.json();
        setBills(data);
        
        // Calculate KPIs
        const totalDue = data.reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);
        setKpis(prev => ({
          ...prev,
          unpaidBills: data.length,
          totalDue: totalDue
        }));
        setError(null);
      } catch (err) {
        setError('Failed to fetch bills');
        console.error('Error fetching bills:', err);
      }
    };

    fetchBills();
  }, [lotNumber]);

  // Fetch transaction history from database
  useEffect(() => {
    if (!lotNumber) return;

    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/payments/user/${encodeURIComponent(lotNumber)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        setTransactions(data);
        
        // Count pending payments
        const pendingPayments = data.filter(p => p.status === 'pending').length;
        setKpis(prev => ({
          ...prev,
          pendingPayments: pendingPayments
        }));
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    };

    fetchTransactions();
  }, [lotNumber]);

  // Calculate total amount
  const totalAmount = selectedBills.reduce((sum, billId) => {
    const bill = bills.find(b => b.id === billId);
    return sum + (bill ? bill.amount : 0);
  }, 0);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle bill selection
  const handleBillSelection = (billId) => {
    setSelectedBills(prev => {
      if (prev.includes(billId)) {
        return prev.filter(id => id !== billId);
      } else {
        return [...prev, billId];
      }
    });
  };

  // Handle select all bills
  const handleSelectAll = () => {
    if (selectedBills.length === bills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(bills.map(bill => bill.id));
    }
  };

  // Handle GCash payment with PayMonggo
  const handleGCashPayment = async () => {
    if (!paymongoPublicKey) {
      setSubmitError('Payment system not initialized. Please refresh the page.');
      return;
    }

    if (selectedBills.length === 0) {
      setSubmitError('Please select at least one bill to pay');
      return;
    }

    setIsProcessingGCash(true);
    setGcashLoading(true);
    setSubmitError(null);

    try {
      const selectedBillsDetails = bills.filter(b => selectedBills.includes(b.id));
      const billReference = selectedBillsDetails.map(b => b.billNumber).join(', ');
      const residentName = user?.fullName || 'Resident';

      // Create checkout session with PayMonggo
      const response = await fetch('/api/payments/gcash/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          billReference,
          lotNumber,
          residentName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create GCash checkout');
      }

      const checkoutData = await response.json();

      // For now, save the payment as pending and redirect to checkout
      const paymentDate = new Date().toISOString().split('T')[0];
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lot_number: lotNumber,
          resident_name: residentName,
          bill_reference: billReference,
          amount: totalAmount,
          payment_date: paymentDate,
          payment_method: 'gcash',
          status: 'pending'
        })
      });

      // Open PayMonggo checkout in new window
      window.open(checkoutData.checkoutUrl, '_blank');
      
      setSubmitSuccess(true);
      setSelectedBills([]);
      setPaymentMethod('');
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to process GCash payment. Please try again.');
      console.error('GCash payment error:', err);
    } finally {
      setIsProcessingGCash(false);
      setGcashLoading(false);
    }
  };

  // Handle payment submission
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    if (selectedBills.length === 0) {
      setSubmitError('Please select at least one bill to pay');
      return;
    }

    if (!paymentMethod) {
      setSubmitError('Please select a payment method');
      return;
    }

    // Handle GCash payment differently
    if (paymentMethod === 'gcash') {
      await handleGCashPayment();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get selected bills details
      const selectedBillsDetails = bills.filter(b => selectedBills.includes(b.id));
      const billReferences = selectedBillsDetails.map(b => b.billNumber).join(', ');
      const paymentDate = new Date().toISOString().split('T')[0];

      // Create payment record
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lot_number: lotNumber,
          resident_name: user?.fullName || 'Resident',
          bill_reference: billReferences,
          amount: totalAmount,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          status: 'pending'
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to submit payment');
      }

      // Update bills status to 'paid' for selected bills
      for (const billId of selectedBills) {
        const bill = bills.find(b => b.id === billId);
        if (bill) {
          await fetch(`/api/bills/${billId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lot_number: lotNumber,
              resident_name: user?.fullName || 'Resident',
              bill_type: bill.billType || bill.description,
              amount: bill.amount,
              due_date: bill.dueDate,
              status: 'paid'
            })
          });
        }
      }
      
      setSubmitSuccess(true);
      setSelectedBills([]);
      setPaymentMethod('');
      setReferenceNumber('');
      setNotes('');
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError('Failed to submit payment. Please try again.');
      console.error('Error submitting payment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear form
  const clearForm = () => {
    setSelectedBills([]);
    setPaymentMethod('');
    setReferenceNumber('');
    setNotes('');
    setSubmitError(null);
  };

  if (error) {
    return (
      <div className="payment-container">
        <h1>Payments</h1>
        <div className="payment-error-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h1>Payments</h1>

      {/* Success Message */}
      {submitSuccess && (
        <div className="payment-success-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Payment submitted successfully!</span>
        </div>
      )}

      {/* KPI Stats Section - Matching Admin Design */}
      <div className="payment-stats-section">
        <div className="payment-stats-grid">
          {/* Unpaid Bills */}
          <div className="payment-stat-card">
            <div className="payment-stat-icon unpaid-bills">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="payment-stat-content">
              <span className="payment-stat-value">{kpis.unpaidBills}</span>
              <span className="payment-stat-label">Unpaid Bills</span>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="payment-stat-card">
            <div className="payment-stat-icon pending-payments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="payment-stat-content">
              <span className="payment-stat-value">{kpis.pendingPayments}</span>
              <span className="payment-stat-label">Pending Payments</span>
            </div>
          </div>

          {/* Total Due */}
          <div className="payment-stat-card">
            <div className="payment-stat-icon total-due">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="payment-stat-content">
              <span className="payment-stat-value">{formatCurrency(kpis.totalDue)}</span>
              <span className="payment-stat-label">Total Amount Due</span>
            </div>
          </div>
        </div>
      </div>

      <div className="payment-content">
        {/* Payment Form */}
        <div className="payment-form-section">
          <div className="section-header">
            <h2>Payment Details</h2>
            <button className="user-clear-btn" onClick={clearForm}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear
            </button>
          </div>

          <form onSubmit={handleSubmitPayment} className="payment-form">
            {/* Select Bills */}
            <div className="user-form-group">
              <label>Select Bills to Pay</label>
              <div className="bills-selection">
                {/* Always show table header */}
                <div className="bills-user-table-header">
                  <span className="bills-count">
                    {bills.length > 0 
                      ? `Showing ${selectedBills.length > 0 ? `0-${selectedBills.length} of ` : ''}${bills.length} bill${bills.length !== 1 ? 's' : ''}`
                      : 'Showing 0-0 of 0 bills'}
                  </span>
                </div>
                
                {bills.length > 0 ? (
                  <>
                    <div className="select-all-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedBills.length === bills.length}
                          onChange={handleSelectAll}
                        />
                        <span className="checkmark"></span>
                        Select All ({bills.length} bills)
                      </label>
                    </div>
                    <div className="bills-list">
                      {bills.map(bill => (
                        <div
                          key={bill.id}
                          className={`bill-item ${selectedBills.includes(bill.id) ? 'selected' : ''}`}
                          onClick={() => handleBillSelection(bill.id)}
                        >
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedBills.includes(bill.id)}
                              onChange={() => handleBillSelection(bill.id)}
                            />
                            <span className="checkmark"></span>
                          </label>
                          <div className="bill-info">
                            <span className="bill-number">{bill.billNumber}</span>
                            <span className="bill-description">{bill.description}</span>
                          </div>
                          <div className="bill-amount">
                            {formatCurrency(bill.amount)}
                          </div>
                          <div className="bill-due-date">
                            Due: {formatDate(bill.dueDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="no-bills">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <p>All caught up!</p>
                    <span className="hint">You have no outstanding bills</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="user-form-group">
              <label>Payment Method</label>
              <div className="payment-methods">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className={`payment-method-option ${paymentMethod === method.id ? 'selected' : ''} ${method.id === 'gcash' ? 'gcash-method' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <span className="method-icon">{method.icon}</span>
                    <span className="method-name">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="user-form-group">
              <label>Amount</label>
              <div className="amount-display">
                <span className="currency">₱</span>
                <input
                  type="text"
                  value={totalAmount > 0 ? totalAmount.toFixed(2) : ''}
                  readOnly
                  placeholder="0.00"
                />
              </div>
              {selectedBills.length > 0 && (
                <span className="amount-hint">
                  Total for {selectedBills.length} selected bill(s)
                </span>
              )}
            </div>

            {/* Reference Number */}
            <div className="user-form-group">
              <label>Reference Number (Optional)</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Enter reference number"
              />
            </div>

            {/* Notes */}
            <div className="user-form-group">
              <label>Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this payment"
                rows="3"
              />
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="error-message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || selectedBills.length === 0 || !paymentMethod}
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Pay {totalAmount > 0 ? formatCurrency(totalAmount) : ''}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Transaction History */}
        <div className="transactions-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <a href="/user/billing" className="view-all">View All</a>
          </div>
          <div className="transactions-list">
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div key={index} className="transaction-item">
                  <div className="transaction-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div className="transaction-content">
                    <span className="transaction-title">{transaction.description}</span>
                    <span className="transaction-date">{formatDate(transaction.date)}</span>
                  </div>
                  <div className="transaction-amount">
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-transactions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <p>No recent transactions</p>
                <span className="hint">Your payment history will appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
