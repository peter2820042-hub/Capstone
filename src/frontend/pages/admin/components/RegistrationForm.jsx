import React, { useState } from 'react';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
    full_name: '',
    email: '',
    phone: '',
    position: '',
    block: '',
    lot_number: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation for role
    if (!formData.role) {
      alert("Mangyaring pumili ng role.");
      return;
    }

    // Validation for admin/staff
    if ((formData.role === 'admin' || formData.role === 'staff') && !formData.full_name) {
      alert("Mangyaring magbigay ng full name para sa admin/staff.");
      return;
    }

    // Validation for homeowner
    if (formData.role === 'homeowner' && (!formData.full_name || !formData.block || !formData.lot)) {
      alert("Mangyaring magbigay ng full name, block, at lot para sa homeowner.");
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
        setFormData({ 
          username: '', 
          password: '', 
          role: '', 
          full_name: '',
          email: '',
          phone: '',
          position: '',
          block: '', 
          lot_number: '' 
        });
        // Navigate to accounts page to see the new account
        window.location.href = '/accounts';
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      alert('Error connecting to server: ' + err.message);
    }
  };

  return (
    <div className="adm-registration-container">
      <h2 className="adm-registration-title">System Registration</h2>
      
      <form onSubmit={handleSubmit} className="adm-registration-form">
        
        {/* Username */}
        <div className="adm-input-group">
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
        <div className="adm-input-group">
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
        <div className="adm-input-group">
          <label>Role</label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange} 
            className="adm-role-select"
            required
          >
            <option value="" disabled>Select a role</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="homeowner">Homeowner</option>
          </select>
        </div>

        {/* Admin/Staff Fields: Full Name, Email, Phone, Position */}
        {(formData.role === 'admin' || formData.role === 'staff') && (
          <div className="adm-animate-fade-in">
            <div className="adm-input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter full name"
                required={formData.role === 'admin' || formData.role === 'staff'}
              />
            </div>
            <div className="adm-input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email (optional)"
              />
            </div>
            <div className="adm-input-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="09XXXXXXXXX (optional)"
              />
            </div>
            <div className="adm-input-group">
              <label>Position</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder={formData.role === 'admin' ? 'Administrator' : 'Staff position'}
              />
            </div>
          </div>
        )}

        {/* Conditional Fields: Lalabas lang kung Homeowner ang pinili */}
        {formData.role === 'homeowner' && (
          <div className="adm-animate-fade-in">
            <div className="adm-input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter full name"
                required={formData.role === 'homeowner'}
              />
            </div>
            <div className="adm-input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email (optional)"
              />
            </div>
            <div className="adm-input-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="09XXXXXXXXX (optional)"
              />
            </div>
            <div className="adm-form-row">
              <div className="adm-input-group">
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
              <div className="adm-input-group">
                <label>Lot</label>
                <input
                  type="text"
                  name="lot_number"
                  value={formData.lot_number}
                  onChange={handleChange}
                  placeholder="Lot"
                  required={formData.role === 'homeowner'}
                />
              </div>
            </div>
          </div>
        )}

        <button type="submit" className="adm-submit-button">
          Register Account
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;