import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ pageName, user }) => {
  const navigate = useNavigate();
  
  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  // Get profile image from localStorage or user object
  const profileImage = localStorage.getItem('userProfileImage') || user?.profileImage || null;
  
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="page-name">{pageName}</h1>
        <div className="profile">
          {profileImage ? (
            <img 
              id="profile-icon"
              src={profileImage} 
              alt="Profile" 
              className="profile-icon" 
              onClick={handleProfileClick}
            />
          ) : (
            <span 
              id="profile-icon"
              className="profile-icon" 
              onClick={handleProfileClick}
            >&#9679;</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
