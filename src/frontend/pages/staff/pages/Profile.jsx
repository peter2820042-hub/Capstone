function Profile({ user }) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Profile</h1>
      <p>Name: {user?.name || 'Staff Member'}</p>
      <p>Role: Staff</p>
    </div>
  );
}

export default Profile;
