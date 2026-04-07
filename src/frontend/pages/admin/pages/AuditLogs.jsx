import React, { useState, useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Search, Calendar, Download, FileText, Trash2, X, 
  ChevronLeft, ChevronRight, ChevronFirst, ChevronLast,
  Eye, User, Shield, Monitor, CheckCircle, XCircle,
  AlertTriangle, Loader2, Filter, RotateCcw, Clock
} from 'lucide-react';
import './AuditLogs.css';

// ============================================================================
// BADGE CONFIGURATIONS
// ============================================================================

const ACTION_BADGES = {
  login: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Shield },
  delete: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: AlertTriangle },
  update: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: RotateCcw },
  create: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
  view: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: Eye },
  export: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: Download },
  default: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Monitor }
};

const MODULE_BADGES = {
  auth: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  users: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  billing: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  violations: { bg: 'bg-rose-100', text: 'text-rose-700' },
  residents: { bg: 'bg-orange-100', text: 'text-orange-700' },
  reports: { bg: 'bg-violet-100', text: 'text-violet-700' },
  default: { bg: 'bg-slate-100', text: 'text-slate-700' }
};

const STATUS_CONFIG = {
  success: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  failed: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  default: { bg: 'bg-slate-100', text: 'text-slate-700', icon: AlertTriangle }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    const date = timestamp.includes(' ') 
      ? parseISO(timestamp.replace(' ', 'T'))
      : parseISO(timestamp);
    return format(date, "MMM dd, yyyy | hh:mm a");
  } catch {
    return timestamp;
  }
};

const formatDateForExport = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    const date = timestamp.includes(' ')
      ? parseISO(timestamp.replace(' ', 'T'))
      : parseISO(timestamp);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  } catch {
    return timestamp;
  }
};

const getActionBadge = (action) => {
  const key = action?.toLowerCase() || 'default';
  return ACTION_BADGES[key] || ACTION_BADGES.default;
};

const getModuleBadge = (module) => {
  const key = module?.toLowerCase() || 'default';
  return MODULE_BADGES[key] || MODULE_BADGES.default;
};

const getStatusConfig = (status) => {
  const key = status?.toLowerCase() || 'default';
  return STATUS_CONFIG[key] || STATUS_CONFIG.default;
};

// ============================================================================
// FILTER COMPONENT
// ============================================================================

const FiltersSection = ({
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  userFilter, setUserFilter,
  actionFilter, setActionFilter,
  moduleFilter, setModuleFilter,
  searchQuery, setSearchQuery,
  uniqueUsers, uniqueActions, uniqueModules,
  onClearFilters
}) => {
  return (
    <div className="filters-section">
      <div className="filters-header">
        <div className="header-title">
          <Filter size={18} />
          <h2>Filters</h2>
        </div>
        <div className="header-buttons">
          <button className="clear-filters-btn" onClick={onClearFilters}>
            <RotateCcw size={16} />
            Clear Filters
          </button>
        </div>
      </div>
      
      <div className="filters-grid">
        {/* Search */}
        <div className="filter-group search-group">
          <label>
            <Search size={14} />
            Search
          </label>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="     Search logs, users, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Date From */}
        <div className="filter-group">
          <label>
            <Calendar size={14} />
            Date From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        {/* Date To */}
        <div className="filter-group">
          <label>
            <Calendar size={14} />
            Date To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* User Filter */}
        <div className="filter-group">
          <label>
            <User size={14} />
            User
          </label>
          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
            <option value="">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>

        {/* Action Filter */}
        <div className="filter-group">
          <label>
            <Shield size={14} />
            Action
          </label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        {/* Module Filter */}
        <div className="filter-group">
          <label>
            <Monitor size={14} />
            Module
          </label>
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
            <option value="">All Modules</option>
            {uniqueModules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function AuditLogs() {
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [selectedLog, setSelectedLog] = useState(null);

  // Exporting states
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Audit logs data - will be fetched from database
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: Fetch audit logs from database
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/audit-logs');
        const data = await response.json();
        
        // Map API response to component format
        const mappedLogs = data.map(log => ({
          id: log.id,
          user: log.user_name,
          userRole: log.user_role,
          action: log.action,
          module: log.module,
          description: log.description,
          status: log.status,
          timestamp: log.timestamp,
          ipAddress: log.ip_address,
          userAgent: log.user_agent,
          sessionId: log.session_id,
          requestId: log.request_id
        }));
        
        setLogs(mappedLogs);
        setError(null);
      } catch (err) {
        setError('Failed to fetch audit logs');
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // Clear filters
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setUserFilter('');
    setActionFilter('');
    setModuleFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Get unique values for filters
  const uniqueUsers = useMemo(() => {
    return [...new Set(logs.map(log => log.user))].filter(Boolean);
  }, [logs]);

  const uniqueActions = useMemo(() => {
    return [...new Set(logs.map(log => log.action))].filter(Boolean);
  }, [logs]);

  const uniqueModules = useMemo(() => {
    return [...new Set(logs.map(log => log.module))].filter(Boolean);
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Date filter
      if (dateFrom && log.timestamp < dateFrom) return false;
      if (dateTo && log.timestamp > dateTo + ' 23:59:59') return false;
      
      // User filter
      if (userFilter && log.user !== userFilter) return false;
      
      // Action filter
      if (actionFilter && log.action !== actionFilter) return false;
      
      // Module filter
      if (moduleFilter && log.module !== moduleFilter) return false;
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          log.user?.toLowerCase().includes(query) ||
          log.action?.toLowerCase().includes(query) ||
          log.module?.toLowerCase().includes(query) ||
          log.description?.toLowerCase().includes(query) ||
          log.ipAddress?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [logs, dateFrom, dateTo, userFilter, actionFilter, moduleFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Export to CSV
  const exportToCSV = async () => {
    setIsExportingCSV(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const headers = ['Timestamp', 'User', 'User Role', 'Action', 'Module', 'Description', 'IP Address', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        formatDateForExport(log.timestamp),
        log.user,
        log.userRole,
        log.action,
        log.module,
        `"${log.description}"`,
        log.ipAddress || '',
        log.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setIsExportingCSV(false);
  };

  // Export to PDF (simulated)
  const exportToPDF = async () => {
    setIsExportingPDF(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert('PDF export functionality would be implemented with a library like jsPDF or react-pdf');
    
    setIsExportingPDF(false);
  };

  // View log details
  const viewLogDetails = (log) => {
    setSelectedLog(log);
  };

  const closeModal = () => {
    setSelectedLog(null);
  };

  return (
    <div className="audit-logs-container">
      {/* Page Header */}
      <div className="page-header"></div>

      {/* Filters Section */}
      <FiltersSection
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        moduleFilter={moduleFilter}
        setModuleFilter={setModuleFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        uniqueUsers={uniqueUsers}
        uniqueActions={uniqueActions}
        uniqueModules={uniqueModules}
        onClearFilters={clearFilters}
      />

      {/* Logs Table */}
      <div className="logs-table-section">
        <div className="table-header">
          <div className="table-info">
            <span className="results-count">
              Showing {filteredLogs.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
            </span>
          </div>
          <div className="table-actions">
            <div className="items-per-page">
              <label>Show:</label>
              <select value={itemsPerPage} onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="header-actions">
              <button 
                className="export-btn csv" 
                onClick={exportToCSV}
                disabled={isExportingCSV || filteredLogs.length === 0}
              >
                {isExportingCSV ? (
                  <Loader2 size={16} className="spinner" />
                ) : (
                  <Download size={16} />
                )}
                {isExportingCSV ? 'Exporting...' : 'Export CSV'}
              </button>
              <button 
                className="export-btn pdf" 
                onClick={exportToPDF}
                disabled={isExportingPDF || filteredLogs.length === 0}
              >
                {isExportingPDF ? (
                  <Loader2 size={16} className="spinner" />
                ) : (
                  <FileText size={16} />
                )}
                {isExportingPDF ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <Loader2 size={48} className="spinner-large" />
              <p>Loading audit logs...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertTriangle size={48} />
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Description</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map(log => {
                    const actionBadge = getActionBadge(log.action);
                    const moduleBadge = getModuleBadge(log.module);
                    const statusCfg = getStatusConfig(log.status);
                    const ActionIcon = actionBadge.icon;
                    const StatusIcon = statusCfg.icon;

                    return (
                      <tr key={log.id}>
                        <td className="timestamp-cell">
                          <span className="date">{formatTimestamp(log.timestamp).split('|')[0]}</span>
                          <span className="time">{formatTimestamp(log.timestamp).split('|')[1]}</span>
                        </td>
                        <td className="user-cell">
                          <div className="user-info">
                            <div className="user-avatar">
                              {log.user?.charAt(0) || '?'}
                            </div>
                            <div className="user-details">
                              <span className="user-name">{log.user}</span>
                              <span className="user-role">{log.userRole || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="action-cell">
                          <span className={`action-badge ${actionBadge.bg} ${actionBadge.text} ${actionBadge.border}`}>
                            <ActionIcon size={12} />
                            {log.action}
                          </span>
                        </td>
                        <td className="module-cell">
                          <span className={`module-badge ${moduleBadge.bg} ${moduleBadge.text}`}>
                            {log.module}
                          </span>
                        </td>
                        <td className="description-cell">
                          <span title={log.description}>{log.description}</span>
                        </td>
                        <td className="ip-cell">
                          {log.ipAddress || '-'}
                        </td>
                        <td className="status-cell">
                          <span className={`status-badge ${statusCfg.bg} ${statusCfg.text}`}>
                            <StatusIcon size={12} />
                            {log.status}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button
                              className="view-btn"
                              onClick={() => viewLogDetails(log)}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="no-results">
                      <div className="no-results-content">
                        <Search size={48} />
                        <p>No audit logs found</p>
                        {logs.length === 0 && (
                          <p className="no-logs-hint">Audit logs will appear here once the database is connected</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <ChevronFirst size={16} />
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                  return false;
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="pagination-ellipsis">...</span>
                    )}
                    <button
                      className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              <ChevronLast size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Audit Log Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Log ID:</label>
                <span>#{selectedLog.id}</span>
              </div>
              <div className="detail-row">
                <label>Timestamp:</label>
                <span>{formatTimestamp(selectedLog.timestamp)}</span>
              </div>
              <div className="detail-row">
                <label>User:</label>
                <span>{selectedLog.user}</span>
              </div>
              <div className="detail-row">
                <label>Action:</label>
                <span>{selectedLog.action}</span>
              </div>
              <div className="detail-row">
                <label>Module:</label>
                <span>{selectedLog.module}</span>
              </div>
              <div className="detail-row">
                <label>Description:</label>
                <span>{selectedLog.description}</span>
              </div>
              <div className="detail-row">
                <label>IP Address:</label>
                <span>{selectedLog.ipAddress || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span>{selectedLog.status}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn close" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;