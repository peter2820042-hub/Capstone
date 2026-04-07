import React, { useState } from 'react';
import './Reports.css';

function Reports() {
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [residentTypeFilter, setResidentTypeFilter] = useState('');

  // Report data (empty initially)
  const monthlyRevenue = [];
  const delinquencyRate = [];
  const violationFrequency = [];
  const occupancyData = [];
  const collectionRate = 0;
  const paymentMethods = [];

  // Calculate summary statistics
  const totalRevenue = 0;
  const averageCollectionRate = 0;
  const totalViolations = 0;
  const occupancyRate = 0;

  // Quick select date ranges
  const handleQuickSelect = (range) => {
    const today = new Date();
    let from, to;

    switch (range) {
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisYear':
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date(today.getFullYear(), 11, 31);
        break;
      case 'lastYear':
        from = new Date(today.getFullYear() - 1, 0, 1);
        to = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default:
        return;
    }

    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to.toISOString().split('T')[0]);
  };

  // Export functions
  const exportToPDF = () => {
    alert('Exporting to PDF...');
  };

  const exportToExcel = () => {
    alert('Exporting to Excel...');
  };

  const printReport = () => {
    window.print();
  };

  const refreshData = () => {
    alert('Refreshing data...');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div className="reports-container">
    
      {/* Summary Statistics Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total-revenue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon collection-rate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Average Collection Rate</span>
              <span className="stat-value">{averageCollectionRate}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon total-violations">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Violations</span>
              <span className="stat-value">{totalViolations}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon occupancy-rate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-label">Occupancy Rate</span>
              <span className="stat-value">{occupancyRate}%</span>
            </div>
          </div>
        </div>
      </div>
 {/* Date Range Filter Section */}
 <div className="filter-section">
        <div className="filter-header">
          <h2>Date Range Filter</h2>
        </div>
        <div className="filter-content">
          <div className="date-range-group">
            <div className="date-inputs">
              <div className="date-input-wrapper">
                <label>From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="date-input-wrapper">
                <label>To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="quick-select-buttons">
              <button onClick={() => handleQuickSelect('thisMonth')}>This Month</button>
              <button onClick={() => handleQuickSelect('lastMonth')}>Last Month</button>
              <button onClick={() => handleQuickSelect('thisYear')}>This Year</button>
              <button onClick={() => handleQuickSelect('lastYear')}>Last Year</button>
            </div>
          </div>
          <div className="additional-filters">
            <div className="filter-group">
              <label>Lot Block</label>
              <select value={blockFilter} onChange={(e) => setBlockFilter(e.target.value)}>
                <option value="">All Blocks</option>
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
                <option value="D">Block D</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Resident Type</label>
              <select value={residentTypeFilter} onChange={(e) => setResidentTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="owner">Owner</option>
                <option value="tenant">Tenant</option>
              </select>
            </div>
            <button className="generate-report-btn" onClick={refreshData}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="charts-grid">
          {/* Chart 1: Revenue Trends */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Revenue Trends</h3>
              <span className="chart-subtitle">Monthly revenue over time</span>
            </div>
            <div className="chart-content">
              <div className="bar-chart">
                {monthlyRevenue.map((item, index) => (
                  <div key={index} className="bar-item">
                    <div className="bar" style={{ height: `${(item.revenue / 200000) * 100}%` }}></div>
                    <span className="bar-label">{item.month}</span>
                    <span className="bar-value">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2: Delinquency Rate */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Delinquency Rate</h3>
              <span className="chart-subtitle">Payment compliance trends</span>
            </div>
            <div className="chart-content">
              <div className="line-chart">
                <svg viewBox="0 0 400 200" className="line-chart-svg">
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    points={delinquencyRate.map((item, index) => 
                      `${(index / 11) * 380 + 10},${180 - (item.rate / 10) * 160}`
                    ).join(' ')}
                  />
                  {delinquencyRate.map((item, index) => (
                    <circle
                      key={index}
                      cx={(index / 11) * 380 + 10}
                      cy={180 - (item.rate / 10) * 160}
                      r="5"
                      fill="#ef4444"
                    />
                  ))}
                </svg>
                <div className="chart-labels">
                  {delinquencyRate.map((item, index) => (
                    <span key={index} className="chart-label">{item.month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chart 3: Violation Frequency */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Violation Frequency</h3>
              <span className="chart-subtitle">Number of violations per month</span>
            </div>
            <div className="chart-content">
              <div className="bar-chart">
                {violationFrequency.map((item, index) => (
                  <div key={index} className="bar-item">
                    <div className="bar violation-bar" style={{ height: `${(item.count / 20) * 100}%` }}></div>
                    <span className="bar-label">{item.month}</span>
                    <span className="bar-value">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 4: Occupancy Pie */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Lot Occupancy</h3>
              <span className="chart-subtitle">Occupancy status distribution</span>
            </div>
            <div className="chart-content">
              <div className="pie-chart-container">
                <div className="pie-chart">
                  <svg viewBox="0 0 100 100" className="pie-svg">
                    {occupancyData.map((item, index) => {
                      const startAngle = occupancyData.slice(0, index).reduce((sum, d) => sum + (d.percentage / 100) * 360, 0);
                      const endAngle = startAngle + (item.percentage / 100) * 360;
                      const largeArcFlag = item.percentage > 50 ? 1 : 0;
                      const startX = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                      const startY = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                      const endX = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                      const endY = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
                      const colors = ['#10b981', '#f59e0b', '#ef4444'];
                      return (
                        <path
                          key={index}
                          d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                          fill={colors[index]}
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="pie-legend">
                  {occupancyData.map((item, index) => {
                    const colors = ['#10b981', '#f59e0b', '#ef4444'];
                    return (
                      <div key={index} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: colors[index] }}></span>
                        <span className="legend-label">{item.status}</span>
                        <span className="legend-value">{item.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Chart 5: Collection Rate */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Collection Rate</h3>
              <span className="chart-subtitle">Bills collected percentage</span>
            </div>
            <div className="chart-content">
              <div className="gauge-chart">
                <div className="gauge-container">
                  <svg viewBox="0 0 200 120" className="gauge-svg">
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeLinecap="round"
                      strokeDasharray={`${collectionRate * 2.51} 251`}
                    />
                  </svg>
                  <div className="gauge-value">
                    <span className="gauge-percentage">{collectionRate}%</span>
                    <span className="gauge-label">Collection Rate</span>
                  </div>
                </div>
                <div className="gauge-target">
                  <span className="target-label">Target: 90%</span>
                  <span className="target-status">Actual: {collectionRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 6: Payment Methods */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Payment Methods</h3>
              <span className="chart-subtitle">Payment method distribution</span>
            </div>
            <div className="chart-content">
              <div className="donut-chart-container">
                <div className="donut-chart">
                  <svg viewBox="0 0 100 100" className="donut-svg">
                    {paymentMethods.map((item, index) => {
                      const startAngle = paymentMethods.slice(0, index).reduce((sum, d) => sum + (d.percentage / 100) * 360, 0);
                      const endAngle = startAngle + (item.percentage / 100) * 360;
                      const largeArcFlag = item.percentage > 50 ? 1 : 0;
                      const startX = 50 + 35 * Math.cos((startAngle - 90) * Math.PI / 180);
                      const startY = 50 + 35 * Math.sin((startAngle - 90) * Math.PI / 180);
                      const endX = 50 + 35 * Math.cos((endAngle - 90) * Math.PI / 180);
                      const endY = 50 + 35 * Math.sin((endAngle - 90) * Math.PI / 180);
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];
                      return (
                        <path
                          key={index}
                          d={`M 50 50 L ${startX} ${startY} A 35 35 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                          fill={colors[index]}
                        />
                      );
                    })}
                    <circle cx="50" cy="50" r="20" fill="#ffffff" />
                  </svg>
                </div>
                <div className="donut-legend">
                  {paymentMethods.map((item, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];
                    return (
                      <div key={index} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: colors[index] }}></span>
                        <span className="legend-label">{item.method}</span>
                        <span className="legend-value">{item.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="export-section">
        <div className="export-buttons">
          <button className="export-btn pdf" onClick={exportToPDF}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Export to PDF
          </button>
          <button className="export-btn excel" onClick={exportToExcel}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Export to Excel
          </button>
          <button className="export-btn print" onClick={printReport}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reports;
