import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [kpis, setKpis] = useState({
    totalResidents: 0,
    pendingPayment: 0,
    pendingBill: 0,
    pendingViolation: 0
  });

  // eslint-disable-next-line no-unused-vars
  const [violations, setViolations] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [period] = useState('yearly');

  const currentDate = new Date().toLocaleDateString('en-PH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
          const vioArray = Array.isArray(vioData) ? vioData : (vioData.violations || []);
          setViolations(vioArray);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="current-date">
        <span>{currentDate}</span>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon residents">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.totalResidents}</span>
            <span className="kpi-label">Total Residents</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon pending">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.pendingPayment}</span>
            <span className="kpi-label">Pending Payment</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon dues">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.pendingBill}</span>
            <span className="kpi-label">Pending Bill</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon violations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.pendingViolation}</span>
            <span className="kpi-label">Pending Violation</span>
          </div>
        </div>
      </div>

      {/* Charts Section - Line Graph and Pie Chart */}
      <div className="charts-section" style={{ display: 'flex', gap: '20px' }}>
        {/* Line Graph */}
        <div className="chart-card" style={{ flex: 1, minHeight: '350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Payment Trends</h3>
            <a href="/payments" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', textDecoration: 'none' }}>View</a>
          </div>
          <div className="line-chart-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
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
        <div className="chart-card" style={{ flex: 1, minHeight: '350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Residents Distribution</h3>
            <a href="/residents" style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', textDecoration: 'none' }}>View</a>
          </div>
          <div className="pie-chart-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
            <svg viewBox="0 0 200 200" style={{ width: '200px', height: '200px' }}>
              {/* Background circle */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="24" />
              {/* Progress circle - extended line */}
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
