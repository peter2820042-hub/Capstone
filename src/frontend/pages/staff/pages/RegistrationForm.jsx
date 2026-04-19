import React, { useState } from 'react';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'homeowner', // Default to homeowner for staff registrations
    full_name: '',
    block: '',
    lot_number: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.role) {
      alert("Mangyaring pumili ng role.");
      return;
    }

    if (!formData.username || !formData.password) {
      alert("Mangyaring punan ang username at password.");
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Registration successful!');
        setFormData({ username: '', password: '', role: 'homeowner', block: '', lot_number: '' });
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      alert('Error connecting to server: ' + err.message);
    }
  };

  return (
    <div className="registration-container">
      <h2 className="registration-title">Register New Resident</h2>
      
      <form onSubmit={handleSubmit} className="registration-form">
        
        {/* Username */}
        <div className="input-group">
          <label>User Name</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
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

        {/* Role Dropdown - Limited for staff */}
        <div className="input-group">
          <label>Role</label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange} 
            className="role-select"
            required
          >
            <option value="homeowner">Homeowner</option>
          </select>
        </div>

        {/* Full Name - Required for homeowners */}
        <div className="input-group">
          <label>Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />
        </div>

        {/* Block and Lot - Required for homeowners */}
        <div className="form-row animate-fade-in">
          <div className="input-group">
            <label>Block</label>
            <input
              type="text"
              name="block"
              value={formData.block}
              onChange={handleChange}
              placeholder="Block"
              required
            />
          </div>
          <div className="input-group">
            <label>Lot</label>
            <input
              type="text"
              name="lot_number"
              value={formData.lot_number}
              onChange={handleChange}
              placeholder="Lot"
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-button">
          Register Resident
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;