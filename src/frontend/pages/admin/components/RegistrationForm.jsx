import React, { useState } from 'react';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '', // Idinagdag na role
    block: '',
    lot: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simpleng validation para sa role
    if (!formData.role) {
      alert("Mangyaring pumili ng role.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Registration successful!');
        setFormData({ username: '', password: '', role: '', block: '', lot: '' });
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      alert('Error connecting to server: ' + err.message);
    }
  };

  return (
    <div className="registration-container">
      <h2 className="registration-title">System Registration</h2>
      
      <form onSubmit={handleSubmit} className="registration-form">
        
        {/* Username */}
        <div className="input-group">
          <label>User Name</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            required
          />
        </div>

        {/* Password */}
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </div>

        {/* Role Dropdown */}
        <div className="input-group">
          <label>Role</label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange} 
            className="role-select"
            required
          >
            <option value="" disabled>Select a role</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="homeowner">Homeowner</option>
          </select>
        </div>

        {/* Conditional Fields: Lalabas lang kung Homeowner ang pinili */}
        {formData.role === 'homeowner' && (
          <div className="form-row animate-fade-in">
            <div className="input-group">
              <label>Block</label>
              <input
                type="text"
                name="block"
                value={formData.block}
                onChange={handleChange}
                placeholder="Block"
                required={formData.role === 'homeowner'}
              />
            </div>
            <div className="input-group">
              <label>Lot</label>
              <input
                type="text"
                name="lot"
                value={formData.lot}
                onChange={handleChange}
                placeholder="Lot"
                required={formData.role === 'homeowner'}
              />
            </div>
          </div>
        )}

        <button type="submit" className="submit-button">
          Register Account
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;