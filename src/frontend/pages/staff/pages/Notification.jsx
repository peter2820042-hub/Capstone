import React, { useState, useEffect } from 'react';
import './Notification.css';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/notifications');
        const data = await response.json();
        setNotifications(data.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          status: n.status,
          createdAt: n.created_at
        })));
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Get type color and icon
  const getTypeColor = (type) => {
    switch (type) {
      case 'billing':
        return '#28a745';
      case 'violation':
        return '#dc3545';
      case 'announcement':
        return '#17a2b8';
      case 'notice':
        return '#0B2239';
      default:
        return '#6c757d';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'billing':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case 'violation':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'announcement':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
    }
  };

  return (
    <div className="notification-container">
      {/* Activity List Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Notifications</h3>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <p>No notifications</p>
          </div>
        ) : (
          <div className="activity-list">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`activity-item ${notification.status === 'unread' ? 'unread' : ''}`}
              >
                <div 
                  className="activity-icon"
                  style={{ color: getTypeColor(notification.type), background: `${getTypeColor(notification.type)}15` }}
                >
                  {getTypeIcon(notification.type)}
                </div>
                <div className="activity-details">
                  <span className="activity-description">{notification.title}</span>
                  <span className="activity-meta">{notification.message}</span>
                </div>
                <span className={`activity-status ${notification.status === 'unread' ? 'pending' : 'resolved'}`}>
                  {notification.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notification;