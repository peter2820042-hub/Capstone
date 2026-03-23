import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ pageName, user }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="page-name">{pageName}</h1>
        <div className="profile-section">
          <div 
            className="profile-picture" 
            onClick={handleProfileClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleProfileClick()}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
