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

      {/* Registered Residents */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Registered Residents</h3>
          <span className="total-count">Total: {kpis.totalResidents} residents</span>
        </div>
        {residents.length === 0 ? (
          <div className="empty-state">
            <p>No registered residents yet.</p>
          </div>
        ) : (
          <div className="residents-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Block</th>
                  <th>Lot</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((resident) => (
                  <tr key={resident.id}>
                    <td>{resident.fullName}</td>
                    <td>{resident.email}</td>
                    <td>{resident.block || '-'}</td>
                    <td>{resident.lotNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h3>Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <div className="empty-state">
            <p>No recent activity to display.</p>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-details">
                  <span className="activity-description">{activity.description}</span>
                  <span className="activity-meta">
                    {activity.details} • {formatDate(activity.date)}
                  </span>
                </div>
                <div className={`activity-status ${activity.status}`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
