import React, { useState, useEffect } from 'react';
import './Reports.css';

function Reports() {
  const [reportType, setReportType] = useState('residents');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  // Stats
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalViolations: 0,
    pendingViolations: 0,
    resolvedViolations: 0
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (reportType === 'residents') {
        const response = await fetch('/api/residents');
        const result = await response.json();
        setData(result.residents || []);
        setStats(prev => ({ ...prev, totalResidents: result.residents?.length || 0 }));
      } else if (reportType === 'violations') {
        const response = await fetch('/api/violations');
        const result = await response.json();
        setData(result.violations || []);
        const violations = result.violations || [];
        setStats(prev => ({
          ...prev,
          totalViolations: violations.length,
          pendingViolations: violations.filter(v => v.status === 'pending').length,
          resolvedViolations: violations.filter(v => v.status === 'resolved').length
        }));
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    setReportType(type);
    setStats(prev => ({
      totalResidents: 0,
      totalViolations: 0,
      pendingViolations: 0,
      resolvedViolations: 0
    }));
  };

  const exportToCSV = () => {
    if (data.length === 0) return;

    let headers = [];
    let rows = [];

    if (reportType === 'residents') {
      headers = ['ID', 'Username', 'Full Name', 'Email', 'Block', 'Lot'];
      rows = data.map(r => [
        r.id,
        r.username,
        r.fullName || '',
        r.email || '',
        r.block || '',
        r.lot || ''
      ]);
    } else {
      headers = ['ID', 'Lot Number', 'Resident Name', 'Type', 'Status', 'Date'];
      rows = data.map(v => [
        v.id,
        v.lotNumber,
        v.residentName,
        v.violationType,
        v.status,
        v.dateIssued
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredData = data.filter(item => {
    if (!dateRange.from || !dateRange.to) return true;
    
    const itemDate = new Date(
      reportType === 'residents' 
        ? item.dateRegistered 
        : item.dateIssued
    );
    return itemDate >= new Date(dateRange.from) && itemDate <= new Date(dateRange.to);
  });

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <h2>Reports</h2>
        <button 
          className="export-btn"
          onClick={exportToCSV}
          disabled={data.length === 0}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="report-tabs">
        <button
          className={`tab ${reportType === 'residents' ? 'active' : ''}`}
          onClick={() => handleTypeChange('residents')}
        >
          Residents
        </button>
        <button
          className={`tab ${reportType === 'violations' ? 'active' : ''}`}
          onClick={() => handleTypeChange('violations')}
        >
          Violations
        </button>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        {reportType === 'residents' ? (
          <div className="stat-card">
            <span className="stat-value">{stats.totalResidents}</span>
            <span className="stat-label">Total Residents</span>
          </div>
        ) : (
          <>
            <div className="stat-card">
              <span className="stat-value">{stats.totalViolations}</span>
              <span className="stat-label">Total Violations</span>
            </div>
            <div className="stat-card pending">
              <span className="stat-value">{stats.pendingViolations}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card resolved">
              <span className="stat-value">{stats.resolvedViolations}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </>
        )}
      </div>

      {/* Date Filter */}
      <div className="date-filter">
        <div className="filter-group">
          <label>From Date</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
          />
        </div>
        <div className="filter-group">
          <label>To Date</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
          />
        </div>
        <button className="reset-btn" onClick={() => setDateRange({ from: '', to: '' })}>
          Reset
        </button>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading report...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {reportType === 'residents' ? (
                  <>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Block/Lot</th>
                  </>
                ) : (
                  <>
                    <th>ID</th>
                    <th>Lot Number</th>
                    <th>Resident</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={reportType === 'residents' ? 5 : 6} className="empty-row">
                    No data available
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.username || item.lotNumber}</td>
                    <td>{item.fullName || item.residentName}</td>
                    <td>{item.email || item.violationType}</td>
                    <td>
                      {item.block && item.lot 
                        ? `${item.block}-${item.lot}` 
                        : item.status}
                    </td>
                    <td>
                      {item.dateRegistered 
                        ? new Date(item.dateRegistered).toLocaleDateString() 
                        : item.dateIssued 
                          ? new Date(item.dateIssued).toLocaleDateString()
                          : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="report-summary">
        <p>
          Showing {filteredData.length} of {data.length} records
          {dateRange.from && dateRange.to && ' (filtered by date range)'}
        </p>
      </div>
    </div>
  );
}

export default Reports;
