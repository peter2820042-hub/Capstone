import React, { useState, useEffect } from 'react';
import './Payments.css';

function Payments() {
  const [kpis, setKpis] = useState({
    totalAmount: 0,
    totalBills: 0,
    totalPayments: 0,
    totalViolations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const response = await fetch('/api/pa-center');
        if (response.ok) {
          const data = await response.json();
          setKpis({
            totalAmount: data.totalBilled || 0,
            totalBills: data.billsCount?.total || 0,
            totalPayments: data.paymentsCount?.approved || 0,
            totalViolations: data.violationsCount?.total || 0
          });
        }
      } catch (err) {
        console.error('Error fetching KPIs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div className="pay-dashboard-container">
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
        Payments
      </h1>

      {/* KPI Cards */}
      <div className="pay-kpi-grid">
        {/* Total Amount */}
        <div className="pay-kpi-card">
          <div className="pay-kpi-icon total-amount">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="pay-kpi-content">
            <span className="pay-kpi-value">
              {loading ? '...' : formatCurrency(kpis.totalAmount)}
            </span>
            <span className="pay-kpi-label">Total Amount</span>
          </div>
        </div>

        {/* Total Bills */}
        <div className="pay-kpi-card">
          <div className="pay-kpi-icon total-bills">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="pay-kpi-content">
            <span className="pay-kpi-value">
              {loading ? '...' : kpis.totalBills}
            </span>
            <span className="pay-kpi-label">Total Bills</span>
          </div>
        </div>

        {/* Total Payments */}
        <div className="pay-kpi-card">
          <div className="pay-kpi-icon total-payments">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className="pay-kpi-content">
            <span className="pay-kpi-value">
              {loading ? '...' : kpis.totalPayments}
            </span>
            <span className="pay-kpi-label">Total Payments</span>
          </div>
        </div>

        {/* Total Violations */}
        <div className="pay-kpi-card">
          <div className="pay-kpi-icon total-violations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="pay-kpi-content">
            <span className="pay-kpi-value">
              {loading ? '...' : kpis.totalViolations}
            </span>
            <span className="pay-kpi-label">Total Violations</span>
          </div>
        </div>
      </div>

      {/* Placeholder for payment content */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: '#718096'
      }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
        <p>Payment records and transactions will appear here.</p>
      </div>
    </div>
  );
}

export default Payments;