import React, { useState, useEffect } from 'react';
import './Notification.css';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Fetch notifications from API
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

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.status === filter;
  });

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

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (notification.status === 'unread') {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, status: 'read' } : n
          )
        );
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
  };

  return (
    <div className="notification-page">
      <div className="notification-header">
        <h2>Notifications</h2>
        <div className="notification-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="notification-loading">Loading...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="notification-empty">
          <p>No notifications</p>
        </div>
      ) : (
        <div className="notification-list">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.status === 'unread' ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
              style={{ cursor: 'pointer' }}
            >
              <div 
                className="notification-type"
                style={{ backgroundColor: getTypeColor(notification.type) }}
              >
                {notification.type}
              </div>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-date">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notification;