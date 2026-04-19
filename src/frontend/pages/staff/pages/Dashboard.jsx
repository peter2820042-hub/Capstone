import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const currentDate = new Date();
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
  
  // Violation statistics for line graph
  const [violationStats, setViolationStats] = useState([]);
  const [violationPeriod, setViolationPeriod] = useState('monthly');
  const [violationTotal, setViolationTotal] = useState(0);

  // eslint-disable-next-line no-unused-vars
  const [period] = useState('yearly');

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
          // Filter bills with pending status
          const pending = billsArray.filter(b => b.status && 
            b.status.toLowerCase() === 'pending');
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

  // Fetch violation statistics when period changes
  useEffect(() => {
    const fetchViolationStats = async () => {
      try {
        const res = await fetch(`/api/violations/statistics?period=${violationPeriod}`);
        if (res.ok) {
          const data = await res.json();
          setViolationStats(data.data || []);
          setViolationTotal(data.total || 0);
        }
      } catch (err) {
        console.error('Error fetching violation stats:', err);
      }
    };
    fetchViolationStats();
  }, [violationPeriod]);

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
              {currentDate.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
        {/* Pending Bills Section */}
        <div className="sta-pending-bills-section">
        <div className="sta-section-header">
          <h3>Pending Bills</h3>
          <a href="/staff/billing" className="sta-view-all-link">View All</a>
        </div>
        {pendingBills.length > 0 ? (
          <div className="sta-bills-table-container" style={{ flex: 1 }}>
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
                {pendingBills.slice(0, 6).map((bill) => (
                  <tr key={bill.id || bill.bill_id}>
                    <td>{bill.residentName || 'N/A'}</td>
                    <td>{bill.billType || bill.bill_type || 'N/A'}</td>
                    <td>₱{bill.amount ? Number(bill.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}</td>
                    <td>
                      <span className={`sta-status-badge ${bill.status?.toLowerCase() || 'pending'}`}>{bill.status || 'Pending'}</span>
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

        {/* Pending Violations Section */}
        <div className="sta-pending-violations-section">
        <div className="sta-section-header">
          <h3>Pending Violations</h3>
          <a href="/staff/violations" className="sta-view-all-link">View All</a>
        </div>
        {pendingViolations.length > 0 ? (
          <div className="sta-violations-table-container" style={{ flex: 1 }}>
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
                {pendingViolations.slice(0, 6).map((violation) => (
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
      </div>

      {/* Charts Section - Line Graph, Bar Chart and Pie Charts */}
      <div className="sta-charts-section">
        {/* Violation Line Graph with Period Filter */}
        <div className="sta-chart-card">
          <div className="sta-chart-header">
            <h3>Violation Trends</h3>
            <div className="sta-chart-filter">
              <select 
                value={violationPeriod} 
                onChange={(e) => setViolationPeriod(e.target.value)}
                className="sta-period-select"
              >
                <option value="daily">Daily (7 days)</option>
                <option value="weekly">Weekly (4 weeks)</option>
                <option value="monthly">Monthly (12 months)</option>
                <option value="yearly">Yearly (5 years)</option>
              </select>
            </div>
          </div>
          <div className="sta-violation-chart-container">
            <svg viewBox="0 0 400 200" style={{ width: '100%', height: '100%' }}>
              {/* Grid lines */}
              <line x1="40" y1="180" x2="380" y2="180" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="40" y1="140" x2="380" y2="140" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="40" y1="100" x2="380" y2="100" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="40" y1="60" x2="380" y2="60" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="40" y1="20" x2="380" y2="20" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Y-axis labels */}
              <text x="35" y="185" fontSize="10" fill="#6b7280" textAnchor="end">0</text>
              <text x="35" y="145" fontSize="10" fill="#6b7280" textAnchor="end">{Math.ceil(violationTotal / 4) || 5}</text>
              <text x="35" y="105" fontSize="10" fill="#6b7280" textAnchor="end">{Math.ceil(violationTotal / 2) || 10}</text>
              <text x="35" y="65" fontSize="10" fill="#6b7280" textAnchor="end">{Math.ceil(violationTotal * 3 / 4) || 15}</text>
              <text x="35" y="25" fontSize="10" fill="#6b7280" textAnchor="end">{violationTotal || 20}</text>
              
              {/* Generate chart points from violationStats data */}
              {violationStats.length > 0 && (() => {
                const maxCount = Math.max(...violationStats.map(d => parseInt(d.count || 0)), 1);
                const width = 340; // 380 - 40
                const height = 160; // 180 - 20
                const step = width / Math.max(violationStats.length - 1, 1);
                
                const points = violationStats.map((d, i) => {
                  const x = 40 + (i * step);
                  const y = 180 - ((parseInt(d.count || 0) / maxCount) * height);
                  return `${x},${y}`;
                }).join(' ');
                
                // X-axis labels
                const labelStep = Math.ceil(violationStats.length / 5);
                const xLabelsArr = violationStats.filter((_, i) => i % labelStep === 0 || i === violationStats.length - 1);
                
                return (
                  <g>
                    <polyline 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="3"
                      points={points}
                    />
                    {violationStats.map((d, i) => {
                      const x = 40 + (i * step);
                      const y = 180 - ((parseInt(d.count || 0) / maxCount) * height);
                      return <circle key={i} cx={x} cy={y} r="4" fill="#ef4444" />;
                    })}
                    {xLabelsArr.map((d, i) => {
                      const idx = violationStats.indexOf(d);
                      const x = 40 + (idx * step);
                      const periodLabel = violationPeriod === 'monthly' ? d.period?.substring(5) : 
                                         violationPeriod === 'yearly' ? d.period : 
                                         d.period;
                      return <text key={i} x={x} y="195" fontSize="9" fill="#6b7280" textAnchor="middle">{periodLabel}</text>;
                    })}
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="sta-chart-summary">
            <span className="sta-total-violations">Total: {violationTotal} violations</span>
          </div>
        </div>
        
        {/* Pie Chart - Registered Residents */}
        <div className="sta-chart-card">
          <div className="sta-chart-header">
            <h3>Registered Residents</h3>
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

      {/* Quick Actions Section */}
      <div className="sta-quick-actions-section">
        <h3 className="sta-quick-actions-title">Quick Actions</h3>
        <div className="sta-quick-actions-grid">
          <a href="/staff/residents?action=add" className="sta-quick-action-card">
            <div className="sta-quick-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <span className="sta-quick-action-label">Add Resident</span>
          </a>
          
          <a href="/staff/billing?action=create" className="sta-quick-action-card">
            <div className="sta-quick-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <span className="sta-quick-action-label">Create Bill</span>
          </a>
          
          <a href="/staff/violations?action=add" className="sta-quick-action-card">
            <div className="sta-quick-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span className="sta-quick-action-label">Record Violation</span>
          </a>
          
          <a href="/staff/reports" className="sta-quick-action-card">
            <div className="sta-quick-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <span className="sta-quick-action-label">View Reports</span>
          </a>
          
          <a href="/staff/payment" className="sta-quick-action-card">
            <div className="sta-quick-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <span className="sta-quick-action-label">Manage Payments</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
