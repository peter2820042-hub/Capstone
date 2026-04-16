import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [kpis, setKpis] = useState({
    totalResidents: 0,
    pendingPayment: 0,
    pendingBill: 0,
    pendingViolation: 0
  });

  // eslint-disable-next-line no-unused-vars
  const [violations, setViolations] = useState([]);
  const [pendingViolations, setPendingViolations] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);


  // eslint-disable-next-line no-unused-vars
  const [period] = useState('yearly');

  // Update the current date/time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/dashboard-stats');
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setKpis({
            totalResidents: stats.totalResidents || 0,
            pendingPayment: stats.pendingPayments || 0,
            pendingBill: stats.pendingBills || 0,
            pendingViolation: stats.pendingViolations || 0
          });
        }

        const vioRes = await fetch('/api/violations');
        if (vioRes.ok) {
          const vioData = await vioRes.json();
          const vioArray = Array.isArray(vioData) ? vioData : [];
          setViolations(vioArray);
          // Filter only pending violations (status = 'pending' or 'Pending')
          const pending = vioArray.filter(v => v.status && v.status.toLowerCase() === 'pending');
          setPendingViolations(pending);
          // Update the pending violation count in KPIs
          setKpis(prev => ({ ...prev, pendingViolation: pending.length }));
        }

        const billsRes = await fetch('/api/bills');
        if (billsRes.ok) {
          const billsData = await billsRes.json();
          const billsArray = Array.isArray(billsData) ? billsData : [];
          // Filter bills with pending, unpaid, or overdue status
          const pending = billsArray.filter(b => b.status && 
            ['pending', 'unpaid', 'overdue'].includes(b.status.toLowerCase()));
          setPendingBills(pending);
          // Update the pending bill count in KPIs
          setKpis(prev => ({ ...prev, pendingBill: pending.length }));
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="sta-dashboard-container">
      {/* Dashboard Header */}
      <div className="sta-dashboard-header">
        <div className="sta-header-text">
          <h1 className="sta-dashboard-title">Manage and Monitor Community Policy Infractions</h1>
        </div>
        <div className="sta-datetime-section">
          <div className="sta-date-section">
            <span className="sta-current-date">
              {currentDateTime.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="sta-kpi-grid">
        {/* Card 1: Total Residents */}
        <div className="sta-kpi-card">
          <div className="sta-kpi-icon residents">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="sta-kpi-content">
            <span className="sta-kpi-value">{kpis.totalResidents}</span>
            <span className="sta-kpi-label">Total Residents</span>
          </div>
        </div>

        {/* Card 2: Pending Payment */}
        <div className="sta-kpi-card">
          <div className="sta-kpi-icon pending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="sta-kpi-content">
            <span className="sta-kpi-value">{kpis.pendingPayment}</span>
            <span className="sta-kpi-label">Pending Payments</span>
          </div>
        </div>

        {/* Card 3: Pending Bill */}
        <div className="sta-kpi-card">
          <div className="sta-kpi-icon dues">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="sta-kpi-content">
            <span className="sta-kpi-value">{kpis.pendingBill}</span>
            <span className="sta-kpi-label">Pending Bills</span>
          </div>
        </div>

        {/* Card 4: Pending Violation */}
        <div className="sta-kpi-card">
          <div className="sta-kpi-icon violations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="sta-kpi-content">
            <span className="sta-kpi-value">{kpis.pendingViolation}</span>
            <span className="sta-kpi-label">Pending Violations</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Pending Sections */}
      <div className="sta-pending-sections-row">
        {/* Pending Violations Section */}
        <div className="sta-pending-violations-section">
        <div className="sta-section-header">
          <h3>Pending Violations</h3>
          <a href="/staff/violations" className="sta-view-all-link">View All</a>
        </div>
        {pendingViolations.length > 0 ? (
          <div className="sta-violations-table-container">
            <table className="sta-violations-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingViolations.slice(0, 5).map((violation) => (
                  <tr key={violation.id || violation.violation_id}>
                    <td>{violation.residentName || 'N/A'}</td>
                    <td>{violation.violationType || 'N/A'}</td>
                    <td>₱{violation.fine || violation.penalty ? Number(violation.fine || violation.penalty).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}</td>
                    <td>
                      <span className={`sta-status-badge ${violation.status?.toLowerCase() || 'pending'}`}>{violation.status || 'Pending'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="sta-empty-message">No pending violations</div>
        )}
        </div>

        {/* Pending Bills Section */}
        <div className="sta-pending-bills-section">
        <div className="sta-section-header">
          <h3>Pending Bills</h3>
          <a href="/staff/billing" className="sta-view-all-link">View All</a>
        </div>
        {pendingBills.length > 0 ? (
          <div className="sta-bills-table-container">
            <table className="sta-bills-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingBills.slice(0, 5).map((bill) => (
                  <tr key={bill.id || bill.bill_id}>
                    <td>{bill.residentName || 'N/A'}</td>
                    <td>{bill.billType || bill.bill_type || 'N/A'}</td>
                    <td>₱{bill.amount ? Number(bill.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}</td>
                    <td>
                      <span className={`sta-status-badge bill-${bill.status?.toLowerCase() || 'pending'}`}>{bill.status || 'Pending'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="sta-empty-message">No pending bills</div>
        )}
        </div>
      </div>

      {/* Charts Section - Line Graph and Pie Chart */}
      <div className="sta-charts-section">
        {/* Line Graph */}
        <div className="sta-chart-card">
          <div className="sta-chart-header">
            <h3>Payment Trends</h3>
            <a href="/staff/payment" className="sta-chart-link">View</a>
          </div>
          <div className="sta-line-chart-container">
            <svg viewBox="0 0 400 200" style={{ width: '100%', height: '100%' }}>
              {/* Grid lines */}
              <line x1="40" y1="180" x2="380" y2="180" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="40" y1="140" x2="380" y2="140" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="40" y1="100" x2="380" y2="100" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="40" y1="60" x2="380" y2="60" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="40" y1="20" x2="380" y2="20" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Y-axis labels */}
              <text x="35" y="185" fontSize="10" fill="#6b7280" textAnchor="end">0</text>
              <text x="35" y="145" fontSize="10" fill="#6b7280" textAnchor="end">5K</text>
              <text x="35" y="105" fontSize="10" fill="#6b7280" textAnchor="end">10K</text>
              <text x="35" y="65" fontSize="10" fill="#6b7280" textAnchor="end">15K</text>
              <text x="35" y="25" fontSize="10" fill="#6b7280" textAnchor="end">20K</text>
              
              {/* X-axis labels */}
              <text x="80" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">Jan</text>
              <text x="150" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">Feb</text>
              <text x="220" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">Mar</text>
              <text x="290" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">Apr</text>
              <text x="360" y="195" fontSize="10" fill="#6b7280" textAnchor="middle">May</text>
              
              {/* Line chart path */}
              <polyline 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3"
                points="80,160 150,140 220,100 290,80 360,40"
              />
              
              {/* Data points */}
              <circle cx="80" cy="160" r="5" fill="#3b82f6" />
              <circle cx="150" cy="140" r="5" fill="#3b82f6" />
              <circle cx="220" cy="100" r="5" fill="#3b82f6" />
              <circle cx="290" cy="80" r="5" fill="#3b82f6" />
              <circle cx="360" cy="40" r="5" fill="#3b82f6" />
            </svg>
          </div>
        </div>
        
        {/* Pie Chart */}
        <div className="sta-chart-card">
          <div className="sta-chart-header">
            <h3>Residents Distribution</h3>
            <a href="/staff/residents" className="sta-chart-link">View</a>
          </div>
          <div className="sta-pie-chart-container">
            <svg viewBox="0 0 200 200" style={{ width: '200px', height: '200px' }}>
              {/* Background circle */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="24" />
              {/* Progress circle */}
              <circle 
                cx="100" cy="100" r="80" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="24"
                strokeDasharray={`${(kpis.totalResidents / 308) * 502.65} ${502.65 - (kpis.totalResidents / 308) * 502.65}`}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
              <text x="100" y="95" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#1a1a2e">
                {kpis.totalResidents}
              </text>
              <text x="100" y="120" fontSize="14" fill="#6b7280">
                / 308
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
