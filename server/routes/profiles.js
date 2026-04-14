// ============ PROFILE ROUTES ============
// Get and update profiles for admin, staff, and residents

import express from 'express';
import pool from '../../src/backend/config/db.js';

const router = express.Router();

// ============ GET PROFILE ============
router.get('/:id/:role', async (req, res) => {
  const { id, role } = req.params;
  
  try {
    let result;
    if (role === 'admin') {
      result = await pool.query('SELECT id, username, full_name, email, phone, profile_image, status, last_login, created_at FROM admins WHERE id = $1', [id]);
    } else if (role === 'staff') {
      result = await pool.query('SELECT id, username, full_name, email, phone, position, profile_image, status, last_login, created_at FROM staffs WHERE id = $1', [id]);
    } else {
      result = await pool.query('SELECT id, username, full_name, lot_number, block, phase, email, phone, profile_image, status, last_login, created_at FROM residents WHERE id = $1', [id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      lotNumber: user.lot_number,
      block: user.block,
      phase: user.phase,
      position: user.position,
      profileImage: user.profile_image || null,
      status: user.status,
      lastLogin: user.last_login,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ UPDATE RESIDENT PROFILE ============
router.put('/resident/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, profile_image } = req.body;
  
  // Authorization check: verify user can only update their own profile
  const authUser = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
  if (!authUser || authUser.role !== 'resident' || authUser.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Not authorized to update this profile' });
  }
  
  try {
    // Check if id is valid
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    // Check if profile_image is valid - limit 5MB for base64 (~3.75MB actual image)
    if (profile_image && profile_image.length > 5000000) {
      return res.status(400).json({ error: 'Image size too large. Please use a smaller image (max 3.75MB).' });
    }
    
    // Try update
    const result = await pool.query(
      `UPDATE residents SET full_name = $1, email = $2, phone = $3, profile_image = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING id, username, full_name, email, phone, profile_image`,
      [full_name, email, phone, profile_image, parsedId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    
    // Log the profile update action
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    await pool.query(
      `INSERT INTO audit_logs (user_name, user_role, action, module, description, ip_address, profile_image, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [full_name || authUser?.username || 'unknown', authUser?.role || 'resident', 'Update Profile', 'Profile', 'Updated profile', clientIp, profile_image || null, 'success']
    );
    
    const userdata = result.rows[0];
    res.json({
      success: true,
      user: {
        id: userdata.id,
        username: userdata.username,
        fullName: userdata.full_name,
        lotNumber: userdata.lot_number,
        block: userdata.block,
        phase: userdata.phase,
        email: userdata.email,
        phone: userdata.phone,
        profileImage: userdata.profile_image || null
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ UPDATE ADMIN PROFILE ============
router.put('/admin/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, profile_image } = req.body;
  
  // Authorization check: verify admin can only update their own profile
  const authUser = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
  if (!authUser || authUser.role !== 'admin' || authUser.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Unauthorized: You can only update your own profile' });
  }
  
  try {
    // Check if profile_image is valid - limit 5MB for base64 (~3.75MB actual image)
    if (profile_image && profile_image.length > 5000000) {
      return res.status(400).json({ error: 'Image size too large. Please use a smaller image (max 3.75MB).' });
    }
    
    // Update using the ID from URL params, not from user object
    const result = await pool.query(
      `UPDATE admins SET full_name = $1, email = $2, phone = $3, profile_image = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING id, username, full_name, email, phone, profile_image`,
      [full_name, email, phone, profile_image, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    console.log('Update result:', result.rows[0]);
    
    // Log the profile update action
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    await pool.query(
      `INSERT INTO audit_logs (user_name, user_role, action, module, description, ip_address, profile_image, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [full_name || authUser?.username || 'unknown', authUser?.role || 'admin', 'Update Profile', 'Profile', 'Updated profile', clientIp, profile_image || null, 'success']
    );
    
    const userdata = result.rows[0];
    res.json({
      success: true,
      user: {
        id: userdata.id,
        username: userdata.username,
        fullName: userdata.full_name,
        email: userdata.email,
        phone: userdata.phone,
        profileImage: userdata.profile_image || null
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ UPDATE STAFF PROFILE ============
router.put('/staff/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, profile_image } = req.body;
  
  // Authorization check: verify staff can only update their own profile
  const authUser = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
  if (!authUser || authUser.role !== 'staff' || authUser.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Unauthorized: You can only update your own profile' });
  }
  
  try {
    // Check if profile_image is valid - limit 5MB for base64 (~3.75MB actual image)
    if (profile_image && profile_image.length > 5000000) {
      return res.status(400).json({ error: 'Image size too large. Please use a smaller image (max 3.75MB).' });
    }
    
    const result = await pool.query(
      `UPDATE staffs SET full_name = $1, email = $2, phone = $3, profile_image = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING id, username, full_name, email, phone, position, profile_image`,
      [full_name, email, phone, profile_image, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    
    console.log('Update result:', result.rows[0]);
    
    // Log the profile update action
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    await pool.query(
      `INSERT INTO audit_logs (user_name, user_role, action, module, description, ip_address, profile_image, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [full_name || authUser?.username || 'unknown', authUser?.role || 'staff', 'Update Profile', 'Profile', 'Updated profile', clientIp, profile_image || null, 'success']
    );
    
    const userdata = result.rows[0];
    res.json({
      success: true,
      user: {
        id: userdata.id,
        username: userdata.username,
        fullName: userdata.full_name,
        email: userdata.email,
        phone: userdata.phone,
        profileImage: userdata.profile_image || null
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;