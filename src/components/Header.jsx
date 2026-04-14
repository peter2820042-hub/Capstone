import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { ProfileIcon, NotificationIcon } from './Icons';

const Header = ({ pageName, user }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        } else if (response.status === 401) {
          // Handle unauthorized - user may need to login
          console.log('User not authenticated for notifications');
        }
      } catch {
        // Only log actual errors, not network failures when server is down
        // Silently fail - notifications are not critical
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  const handleNotificationClick = () => {
    navigate('/notification');
  };
  
  // Get profile image from localStorage or user object
  const profileImage = localStorage.getItem('userProfileImage') || user?.profileImage || null;
  
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="page-name">{pageName}</h1>
        <div className="header-actions">
          <button 
            className="notification-bell"
            onClick={handleNotificationClick}
            title="Notifications"
          >
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
            <NotificationIcon width={35} height={35} />
          </button>
          <div className="profile">
            {profileImage ? (
              <img 
                id="profile-icon"
                src={profileImage} 
                alt="Profile" 
                className="profile-icon img" 
                onClick={handleProfileClick}
              />
            ) : (
              <span 
                id="profile-icon"
                className="profile-icon" 
                onClick={handleProfileClick}
              >
                <ProfileIcon width={35} height={35} />
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
