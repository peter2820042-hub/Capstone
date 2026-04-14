import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ user }) {
  // KPIs
  const [kpis, setKpis] = useState({
    totalResidents: 0,
    activeViolations: 0,
    pendingViolations: 0,
    resolvedViolations: 0
  });

  // Residents list
  const [residents, setResidents] = useState([]);

  // Recent activity
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch data from API
  const fetchDashboardData = async () => {
    try {
      // Fetch residents count
      const residentsRes = await fetch('/api/residents');
      const residentsData = await residentsRes.json();

      // Fetch violations
      const violationsRes = await fetch('/api/violations');
      const violationsData = await violationsRes.json();

      // Handle API response - could be array or object with residents property
      const residentsArray = Array.isArray(residentsData) ? residentsData : (residentsData.residents || []);
      const violationsArray = Array.isArray(violationsData) ? violationsData : (violationsData.violations || []);

      const pending = violationsArray.filter(v => v.status === 'pending').length || 0;
      const resolved = violationsArray.filter(v => v.status === 'resolved').length || 0;

      setKpis({
        totalResidents: residentsArray.length,
        activeViolations: violationsArray.length,
        pendingViolations: pending,
        resolvedViolations: resolved
      });

      // Set residents list (show max 10)
      setResidents(residentsArray.slice(0, 10));

      // Create activity feed from violations
      const activities = violationsArray.slice(0, 5).map(v => ({
        id: v.id,
        type: 'violation',
        description: `Violation logged for Lot ${v.lotNumber}`,
        details: v.violationType,
        date: v.dateIssued,
        status: v.status
      }));

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getActivityIcon = (type) => {
    if (type === 'violation') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const currentDate = new Date().toLocaleDateString('en-PH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="dashboard-container">
      {/* Date Display */}
      <div className="current-date">
        <span>{currentDate}</span>
      </div>

      {/* KPI Section */}

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
          <div className="kpi-icon violations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.activeViolations}</span>
            <span className="kpi-label">Active Violations</span>
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
            <span className="kpi-value">{kpis.pendingViolations}</span>
            <span className="kpi-label">Pending</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon resolved">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{kpis.resolvedViolations}</span>
            <span className="kpi-label">Resolved</span>
          </div>
        </div>
      </div>

      {/* Charts Section - Line Graph and Pie Chart */}
      <div className="charts-section">
        {/* Line Graph */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Payment Trends</h3>
            <a href="/staff/payment" className="chart-link">View</a>
          </div>
          <div className="line-chart-container">
            <svg viewBox="0 0 400 200">
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
        <div className="chart-card">
          <div className="chart-header">
            <h3>Residents Distribution</h3>
            <a href="/staff/residents" className="chart-link">View</a>
          </div>
          <div className="pie-chart-container">
            <svg viewBox="0 0 200 200">
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
}

export default Dashboard;
