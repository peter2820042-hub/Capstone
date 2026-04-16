import React, { useState, useRef, useEffect } from 'react';
import './Profile.css';

const Profile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('userProfileImage') || user?.profileImage || null;
  });
  const [formData, setFormData] = useState(() => {
    if (user) {
      return {
        fullName: user.fullName || user.full_name || user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      };
    }
    return {
      fullName: '',
      email: '',
      phone: ''
    };
  });
  const fileInputRef = useRef(null);

  // Fetch full profile including dates from API
  const [profileDates, setProfileDates] = useState({ createdAt: null, lastLogin: null });
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || !user?.role) return;
      
      try {
        const response = await fetch(`/api/profile/${user.id}/${user.role}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            fullName: data.fullName || data.full_name || '',
            email: data.email || '',
            phone: data.phone || ''
          });
          setProfileDates({
            createdAt: data.createdAt,
            lastLogin: data.lastLogin
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [user?.id, user?.role]);

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
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('userProfileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user?.id || !user?.role) {
      alert('User not found. Please log in again.');
      return;
    }
    
    try {
      const endpoint = user.role === 'admin' 
        ? `/api/profile/admin/${user.id}` 
        : user.role === 'staff' 
          ? `/api/profile/staff/${user.id}`
          : `/api/profile/resident/${user.id}`;
       
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: user,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          profile_image: profileImage
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        localStorage.setItem('userProfileData', JSON.stringify({
          ...formData,
          profileImage
        }));
        
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          ...data.user
        }));
        
        // Also update the profile image in localStorage for header
        if (data.user.profileImage) {
          localStorage.setItem('userProfileImage', data.user.profileImage);
        } else if (profileImage) {
          localStorage.setItem('userProfileImage', profileImage);
        }
        
        alert('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // More detailed error message
      if (error.message) {
        alert('Error: ' + error.message);
      } else {
        alert('An error occurred while saving. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    const storedImage = localStorage.getItem('userProfileImage');
    setProfileImage(storedImage || user?.profileImage || null);
    setIsEditing(false);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem('userProfileImage');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="profile-page">
      <h1 className="profile-page-title">My Profile</h1>
      
      <div className="profile-header">
        <div className="profile-avatar-container">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-avatar-image" />
          ) : (
            <div className="profile-avatar">
              {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'S'}
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
          <h2>{formData.fullName || user?.name || 'Staff'}</h2>
          <p className="profile-role">{user?.role || 'Staff'}</p>
        </div>
        
        {!isEditing && (
          <button className="edit-btn" onClick={handleEdit}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Profile Information</h3>
          
          {isEditing ? (
            <div className="edit-form">
              <div className="staff-form-grid">
                <div className="staff-form-item">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="staff-form-item">
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
                <div className="staff-form-item">
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
              
              <div className="staff-form-actions">
                <button 
                  type="button" 
                  className="save-btn" 
                  onClick={handleSave}
                >
                  Save Changes
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <span>{formData.fullName || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{formData.email || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <span>{formData.phone || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Date Joined</label>
                <span>{profileDates.createdAt ? formatDate(profileDates.createdAt) : 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Last Login</label>
                <span>{profileDates.lastLogin ? formatDate(profileDates.lastLogin) : 'N/A'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
