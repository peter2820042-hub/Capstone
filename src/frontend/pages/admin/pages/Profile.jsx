import React, { useState, useRef, useEffect } from 'react';
import './Profile.css';

const Profile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('userProfileImage') || user?.profileImage || null;
  });
  const fileInputRef = useRef(null);

  // Fetch profile from server
  const fetchProfile = React.useCallback(async () => {
    if (!user?.id || !user?.role) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/profile/${user.id}/${user.role}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || ''
        });
        if (data.profileImage) {
          setProfileImage(data.profileImage);
          localStorage.setItem('userProfileImage', data.profileImage);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fall back to localStorage or user prop
      setFormData({
        fullName: user?.fullName || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role, user?.fullName, user?.name, user?.email, user?.phone]);

  // Fetch initial profile data from server
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
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
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 2MB');
        return;
      }
      
      // Create a preview URL for the uploaded image
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
      setErrorMessage('User not found. Please log in again.');
      return;
    }
    
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const endpoint = user.role === 'admin' 
        ? `/api/profile/admin/${user.id}` 
        : user.role === 'staff' 
          ? `/api/profile/staff/${user.id}`
          : `/api/profile/resident/${user.id}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          profile_image: profileImage
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Save to localStorage as backup
        localStorage.setItem('userProfileData', JSON.stringify({
          ...formData,
          profileImage
        }));
        
        // Update localStorage user object if needed
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          ...data.user
        }));
        
        // Create audit log entry
        try {
          await fetch('http://localhost:3001/api/audit-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_name: user?.username || 'User',
              user_role: user?.role || 'user',
              action: 'Update Profile',
              module: 'Profile',
              description: `Updated profile - Name: ${formData.fullName}, Email: ${formData.email}, Phone: ${formData.phone}`,
              status: 'success'
            })
          });
        } catch (auditError) {
          console.error('Error creating audit log:', auditError);
        }
        
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrorMessage('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values from server or user prop
    setFormData({
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    // Also reset profile image
    const storedImage = localStorage.getItem('userProfileImage');
    setProfileImage(storedImage || user?.profileImage || null);
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem('userProfileImage');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show loading while fetching profile
  if (isLoading) {
    return (
      <div className="profile-page">
        <h1 className="profile-page-title">My Profile</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="profile-page-title">My Profile</h1>
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
          <p className="profile-role">{user?.role || 'Admin'}</p>
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
          <h3>Personal Information</h3>
          {isEditing ? (
            <div className="edit-form">
              <div className="form-grid">
                <div className="form-item">
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
              
              {/* Error Message */}
              {errorMessage && (
                <div className="error-message">
                  {errorMessage}
                </div>
              )}
              
              {/* Success Message */}
              {successMessage && (
                <div className="success-message">
                  {successMessage}
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="save-btn" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
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
                <span>{user?.fullName || user?.name || 'Not provided'}</span>
              </div>
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
