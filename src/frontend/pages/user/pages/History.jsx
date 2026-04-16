import React, { useState, useEffect } from 'react';
import './History.css';

function History({ user }) {
  const [activeTab, setActiveTab] = useState('bills');
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get user's lot number
  const lotNumber = user?.lotNumber;

  // Fetch all data from API
  useEffect(() => {
    if (!lotNumber) return;

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch bills
        const billsRes = await fetch(`/api/bills/user/${encodeURIComponent(lotNumber)}`);
        const billsData = await billsRes.json();
        setBills(billsData || []);

        // Fetch payments
        const paymentsRes = await fetch(`/api/payments/user/${encodeURIComponent(lotNumber)}`);
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData || []);

        // Fetch violations
        const violationsRes = await fetch(`/api/violations/user/${encodeURIComponent(lotNumber)}`);
        const violationsData = await violationsRes.json();
        setViolations(violationsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lotNumber]);

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

  if (loading) {
    return (
      <div className="history-container">
        <div className="history-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="history-container">
      {/* Tabs */}
      <div className="history-tabs">
        <button
          className={`history-tab-btn ${activeTab === 'bills' ? 'active' : ''}`}
          onClick={() => setActiveTab('bills')}
        >
          Bills ({bills.length})
        </button>
        <button
          className={`history-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments ({payments.length})
        </button>
        <button
          className={`history-tab-btn ${activeTab === 'violations' ? 'active' : ''}`}
          onClick={() => setActiveTab('violations')}
        >
          Violations ({violations.length})
        </button>
      </div>

      {/* Table Section */}
      <div className="history-table-section">
        {activeTab === 'bills' && (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Lot</th>
                  <th>Resident Name</th>
                  <th>Bill Type</th>
                  <th>Amount</th>
                  <th>Date Issued</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.length > 0 ? (
                  bills.map(bill => (
                    <tr key={bill.id}>
                      <td>{bill.block || '-'}</td>
                      <td>{bill.lotNumber || '-'}</td>
                      <td>{bill.residentName || '-'}</td>
                      <td>{bill.billType || bill.description || '-'}</td>
                      <td>{formatCurrency(bill.amount)}</td>
                      <td>{formatDate(bill.created_at || bill.dateIssued)}</td>
                      <td>{formatDate(bill.dueDate)}</td>
                      <td>
                        <span className={`status-badge ${bill.status?.toLowerCase()}`}>
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="history-empty">No bills found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Lot</th>
                  <th>Resident Name</th>
                  <th>Bill Reference</th>
                  <th>Amount</th>
                  <th>Date Issued</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map(payment => (
                    <tr key={payment.id}>
                      <td>{payment.block || '-'}</td>
                      <td>{payment.lotNumber || '-'}</td>
                      <td>{payment.residentName || '-'}</td>
                      <td>{payment.billReference || '-'}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>{formatDate(payment.created_at)}</td>
                      <td>{formatDate(payment.paymentDate || payment.date)}</td>
                      <td>
                        <span className={`status-badge ${payment.status?.toLowerCase()}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="history-empty">No payments found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'violations' && (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Lot</th>
                  <th>Resident Name</th>
                  <th>Violation Type</th>
                  <th>Amount</th>
                  <th>Date Issued</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {violations.length > 0 ? (
                  violations.map(violation => (
                    <tr key={violation.id}>
                      <td>{violation.block || '-'}</td>
                      <td>{violation.lotNumber || '-'}</td>
                      <td>{violation.residentName || '-'}</td>
                      <td>{violation.violationType || '-'}</td>
                      <td>{formatCurrency(violation.penalty)}</td>
                      <td>{formatDate(violation.dateIssued)}</td>
                      <td>-</td>
                      <td>
                        <span className={`status-badge ${violation.status?.toLowerCase()}`}>
                          {violation.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="history-empty">No violations found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;