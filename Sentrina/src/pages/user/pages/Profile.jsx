import React from 'react';

const Profile = ({ user }) => {
  return (
    <div className="page-container">
      <h1>Profile</h1>
      <div className="profile-card">
        <p><strong>Username:</strong> {user?.username}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
      </div>
    </div>
  );
};

export default Profile;
