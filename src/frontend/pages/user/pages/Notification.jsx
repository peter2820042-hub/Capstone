import React, { useState, useEffect, useMemo } from 'react';
import './Notification.css';

function Notification(props) {
  // Get user from props or fall back to localStorage
  const user = props.user || JSON.parse(localStorage.getItem('user') || '{}');
  // Filter states
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Notifications data - will be fetched from database
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected notification for details
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Fetch notifications from database
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Get user ID from user prop
        const userId = user?.id;
        
        if (userId) {
          const response = await fetch(`/api/notifications/user/${userId}`);
          const data = await response.json();
          
          // Map API response to frontend format
          const mappedData = data.map(n => ({
            id: n.id,
            type: n.type || 'System',
            title: n.title,
            message: n.message,
            status: n.status === 'unread' ? 'Unread' : 'Read',
            timestamp: n.created_at
          }));
          
          setNotifications(mappedData);
        } else {
          setNotifications([]);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  // Get unique types and statuses for filters
  const uniqueTypes = useMemo(() => {
    return [...new Set(notifications.map(n => n.type))];
  }, [notifications]);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(notifications.map(n => n.status))];
  }, [notifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Type filter
      if (typeFilter && notification.type !== typeFilter) return false;

      // Status filter
      if (statusFilter && notification.status !== statusFilter) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = notification.title.toLowerCase().includes(query);
        const matchesMessage = notification.message.toLowerCase().includes(query);
        if (!matchesTitle && !matchesMessage) return false;
      }

      return true;
    });
  }, [notifications, typeFilter, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  // Calculate counts
  const unreadCount = notifications.filter(n => n.status === 'Unread').length;
  const readCount = notifications.filter(n => n.status === 'Read').length;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/user/notifications/${notificationId}/read`, { method: 'PUT' });
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, status: 'Read' } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/user/notifications/read-all', { method: 'PUT' });
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'Read' }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/user/notifications/${notificationId}`, { method: 'DELETE' });
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // View notification details
  const viewNotificationDetails = (notification) => {
    setSelectedNotification(notification);
    if (notification.status === 'Unread') {
      markAsRead(notification.id);
    }
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  // Clear filters
  const clearFilters = () => {
    setTypeFilter('');
    setStatusFilter('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Payment':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        );
      case 'Billing':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
      case 'Violation':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'System':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  if (error) {
    return (
      <div className="notification-container">
        <div className="error-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="notification-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-container">

      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-grid">
          <div className="summary-card total">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Total Notifications</span>
              <span className="card-value">{notifications.length}</span>
            </div>
          </div>

          <div className="summary-card unread">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Unread</span>
              <span className="card-value">{unreadCount}</span>
            </div>
          </div>

          <div className="summary-card read">
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="card-content">
              <span className="card-label">Read</span>
              <span className="card-value">{readCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <h2>Filters</h2>
          <button className="clear-filters-btn" onClick={clearFilters}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear Filters
          </button>
        </div>
        <div className="filters-grid">
          {/* Search */}
          <div className="filter-group search-group">
            <label>Search</label>
            <div className="search-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="filter-group">
            <label>Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-section">
        <div className="section-header">
          <div className="section-info">
            <span className="results-count">
              Showing {filteredNotifications.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredNotifications.length)} of {filteredNotifications.length} notifications
            </span>
          </div>
          <div className="items-per-page">
            <label>Show:</label>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="notifications-list">
          {paginatedNotifications.length > 0 ? (
            paginatedNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.status === 'Unread' ? 'unread' : ''}`}
                onClick={() => viewNotificationDetails(notification)}
              >
                <div className={`notification-icon ${notification.type.toLowerCase()}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <span className="notification-title">{notification.title}</span>
                    <span className="notification-time">{formatDate(notification.timestamp)}</span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-footer">
                    <span className={`notification-type ${notification.type.toLowerCase()}`}>
                      {notification.type}
                    </span>
                    <span className={`notification-status ${notification.status.toLowerCase()}`}>
                      {notification.status}
                    </span>
                  </div>
                </div>
                <div className="notification-actions">
                  {notification.status === 'Unread' && (
                    <button
                      className="action-btn mark-read"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      title="Mark as Read"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </button>
                  )}
                  <button
                    className="action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    title="Delete"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p>No notifications found</p>
              {notifications.length === 0 && (
                <p className="no-notifications-hint">Your notifications will appear here once the database is connected</p>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
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
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Notification Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Title:</label>
                <span>{selectedNotification.title}</span>
              </div>
              <div className="detail-row">
                <label>Type:</label>
                <span className={`notification-type ${selectedNotification.type.toLowerCase()}`}>
                  {selectedNotification.type}
                </span>
              </div>
              <div className="detail-row">
                <label>Message:</label>
                <span>{selectedNotification.message}</span>
              </div>
              <div className="detail-row">
                <label>Timestamp:</label>
                <span>{formatDate(selectedNotification.timestamp)}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`notification-status ${selectedNotification.status.toLowerCase()}`}>
                  {selectedNotification.status}
                </span>
              </div>
              {selectedNotification.link && (
                <div className="detail-row">
                  <label>Link:</label>
                  <a href={selectedNotification.link} className="notification-link">
                    View Details
                  </a>
                </div>
              )}
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

export default Notification;
