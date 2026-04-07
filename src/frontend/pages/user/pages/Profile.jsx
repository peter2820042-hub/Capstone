import React, { useState, useRef } from 'react';
import './Profile.css';

const Profile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(() => {
    // Try to get profile image from localStorage first
    return localStorage.getItem('userProfileImage') || user?.profileImage || null;
  });
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    lotNumber: user?.lotNumber || '',
    block: user?.block || '',
    phase: user?.phase || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the uploaded image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        // Save to localStorage so header can access it
        localStorage.setItem('userProfileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // In a real app, you would send this to the server
    console.log('Saving profile data:', { ...formData, profileImage });
    setIsEditing(false);
    // Here you would typically call an API to update the user data
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      lotNumber: user?.lotNumber || '',
      block: user?.block || '',
      phase: user?.phase || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem('userProfileImage');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-container">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-avatar-image" />
          ) : (
            <div className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          {isEditing && (
            <div className="avatar-edit-overlay">
              <button 
                className="avatar-edit-btn" 
                onClick={() => fileInputRef.current?.click()}
                title="Upload photo"
              >
                +
              </button>
              {profileImage && (
                <button 
                  className="avatar-remove-btn" 
                  onClick={handleRemoveImage}
                  title="Remove photo"
                >
                  ✕
                </button>
              )}
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
        <div className="profile-title">
          <h2>{user?.name || 'User'}</h2>
          <p className="profile-role">{user?.role || 'Homeowner'}</p>
        </div>
        {!isEditing && (
          <button className="edit-btn" onClick={handleEdit}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Username</label>
              <span>{user?.username || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Property Details</h3>
          {isEditing ? (
            <div className="edit-form">
              <div className="form-grid">
                <div className="form-item">
                  <label htmlFor="lotNumber">Lot Number</label>
                  <input
                    type="text"
                    id="lotNumber"
                    name="lotNumber"
                    value={formData.lotNumber}
                    onChange={handleChange}
                    placeholder="Enter lot number"
                  />
                </div>
                <div className="form-item">
                  <label htmlFor="block">Block</label>
                  <input
                    type="text"
                    id="block"
                    name="block"
                    value={formData.block}
                    onChange={handleChange}
                    placeholder="Enter block"
                  />
                </div>
                <div className="form-item">
                  <label htmlFor="phase">Phase</label>
                  <input
                    type="text"
                    id="phase"
                    name="phase"
                    value={formData.phase}
                    onChange={handleChange}
                    placeholder="Enter phase"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="save-btn" onClick={handleSave}>Save Changes</button>
                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Lot Number</label>
                <span>{user?.lotNumber || 'Not assigned'}</span>
              </div>
              <div className="info-item">
                <label>Block</label>
                <span>{user?.block || 'Not assigned'}</span>
              </div>
              <div className="info-item">
                <label>Phase</label>
                <span>{user?.phase || 'Not assigned'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h3>Contact Information</h3>
          {isEditing ? (
            <div className="edit-form">
              <div className="form-grid">
                <div className="form-item">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                </div>
                <div className="form-item">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Email</label>
                <span>{user?.email || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <span>{user?.phone || 'Not provided'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
