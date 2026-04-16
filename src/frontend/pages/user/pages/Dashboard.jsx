import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ user }) {
  const [kpis, setKpis] = useState({
    unpaidBills: 0,
    totalUnpaid: 0,
    pendingPayments: 0,
    activeViolations: 0
  });
  const [loading, setLoading] = useState(false);

  const lotNumber = user?.lotNumber;

  useEffect(() => {
    if (!lotNumber) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch unpaid bills
        const billsRes = await fetch(`/api/bills/user/${encodeURIComponent(lotNumber)}/unpaid`);
        const billsData = await billsRes.json();
        
        // Fetch payments
        const paymentsRes = await fetch(`/api/payments/user/${encodeURIComponent(lotNumber)}`);
        const paymentsData = await paymentsRes.json();
        
        // Fetch violations
        const violationsRes = await fetch(`/api/violations/user/${encodeURIComponent(lotNumber)}`);
        const violationsData = await violationsRes.json();
        
        const unpaidBills = Array.isArray(billsData) ? billsData : [];
        const pendingPayments = Array.isArray(paymentsData) ? paymentsData.filter(p => p.status === 'pending') : [];
        const violations = Array.isArray(violationsData) ? violationsData.filter(v => v.status === 'pending') : [];
        
        const totalUnpaid = unpaidBills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
        
        setKpis({
          unpaidBills: unpaidBills.length,
          totalUnpaid: totalUnpaid,
          pendingPayments: pendingPayments.length,
          activeViolations: violations.length
        });
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lotNumber]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  return (
    <div className="use-dashboard-container">
      {/* KPI Grid */}
      <div className="use-kpi-grid">
        {/* Unpaid Bills */}
        <div className="use-kpi-card">
          <div className="use-kpi-icon unpaid">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="use-kpi-content">
            <span className="use-kpi-value">{kpis.unpaidBills}</span>
            <span className="use-kpi-label">Unpaid Bills</span>
          </div>
        </div>

        {/* Total Amount Due */}
        <div className="use-kpi-card">
          <div className="use-kpi-icon amount">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="use-kpi-content">
            <span className="use-kpi-value">{formatCurrency(kpis.totalUnpaid)}</span>
            <span className="use-kpi-label">Total Amount Due</span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="use-kpi-card">
          <div className="use-kpi-icon pending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="use-kpi-content">
            <span className="use-kpi-value">{kpis.pendingPayments}</span>
            <span className="use-kpi-label">Pending Payments</span>
          </div>
        </div>

        {/* Active Violations */}
        <div className="use-kpi-card">
          <div className="use-kpi-icon violations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="use-kpi-content">
            <span className="use-kpi-value">{kpis.activeViolations}</span>
            <span className="use-kpi-label">Active Violations</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
