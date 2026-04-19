// ============ AUTHENTICATION ROUTES ============
// Login, Register, Logout endpoints

import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../../src/backend/config/db.js';

const router = express.Router();

// ============ LOGIN ============
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    let user = null;
    let role = null;
    let passwordHash = null;
    
    // Check admins table first
    let result = await pool.query(
      'SELECT id, username, password_hash, full_name, email, phone, profile_image FROM admins WHERE username = $1 AND status = $2',
      [username, 'active']
    );
    
    if (result.rows.length > 0) {
      user = result.rows[0];
      role = 'admin';
      passwordHash = user.password_hash;
    } else {
      // Check staffs table
      result = await pool.query(
        'SELECT id, username, password_hash, full_name, position, email, phone, profile_image FROM staffs WHERE username = $1 AND status = $2',
        [username, 'active']
      );
      
      if (result.rows.length > 0) {
        user = result.rows[0];
        role = 'staff';
        passwordHash = user.password_hash;
      } else {
        // Check residents table (homeowners)
        result = await pool.query(
          'SELECT id, username, passwords, full_name, lot_number, block, phase, email, phone, profile_image FROM residents WHERE username = $1 AND status = $2',
          [username, 'active']
        );
        
        if (result.rows.length > 0) {
          user = result.rows[0];
          role = 'resident';
          passwordHash = user.passwords;
        }
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const validPassword = await bcrypt.compare(password, passwordHash);
    
    if (validPassword) {
      // Update last_login timestamp
      if (role === 'admin') {
        await pool.query('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
      } else if (role === 'staff') {
        await pool.query('UPDATE staffs SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
      } else {
        await pool.query('UPDATE residents SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
      }
      
      // Log the login action
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      await pool.query(
        `INSERT INTO audit_logs (user_name, user_role, action, module, description, ip_address, profile_image, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.full_name || user.username, role, 'Login', 'Authentication', 'Logged in', clientIp, user.profile_image || null, 'success']
      );
      
      res.json({ success: true, user: { 
        id: user.id, 
        username: user.username, 
        role: role, 
        fullName: user.full_name,
        email: user.email || '',
        phone: user.phone || '',
        lotNumber: user.lot_number || '',
        block: user.block || '',
        phase: user.phase || '',
        position: user.position || '',
        profileImage: user.profile_image || null
      } });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ REGISTER ============
router.post('/register', async (req, res) => {
  const { username, password, role, full_name, lot_number, block, email, phone, position } = req.body;
  
  try {
    // Input validation
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    // Validate role
    const validRoles = ['admin', 'staff', 'homeowner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Email format validation (if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Phone format validation (if provided) - accepts Philippine format
    if (phone && !/^09\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone must be 11 digits starting with 09' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    let result;
    
    // Insert based on role
    if (role === 'admin') {
      result = await pool.query(
        `INSERT INTO admins (username, password_hash, full_name, email, phone, position, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, full_name, position`,
        [username, hashedPassword, full_name || username, email || null, phone || null, position || 'Administrator', 'active']
      );
    } else if (role === 'staff') {
      result = await pool.query(
        `INSERT INTO staffs (username, password_hash, full_name, email, phone, position, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, full_name, position`,
        [username, hashedPassword, full_name || username, email || null, phone || null, position || 'Staff', 'active']
      );
    } else {
      // For residents, role is always 'homeowner'
      result = await pool.query(
        `INSERT INTO residents (username, passwords, full_name, lot_number, block, email, phone, role, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'homeowner', 'active') RETURNING id, username, full_name, lot_number, block`,
        [username, hashedPassword, full_name || username, lot_number || null, block || null, email || null, phone || null]
      );
    }
    
    res.json({ 
      success: true, 
      user: result.rows[0],
      role: role
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ============ LOGOUT ============
router.post('/logout', async (req, res) => {
  try {
    const { user, full_name, profile_image } = req.body;
    
    console.log('Logout endpoint called with user:', user, 'full_name:', full_name, 'profile_image:', profile_image);
    
    // Use full_name for display, extract first word only
    const fullName = full_name || user?.username || '';
    const displayName = fullName.split(' ')[0] || fullName || 'Unknown';
    
    if (displayName && displayName !== 'Unknown') {
      const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
      
      // Try to insert with profile_image first
      try {
        await pool.query(
          `INSERT INTO audit_logs (user_name, user_role, action, module, description, ip_address, profile_image, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [displayName, user?.role || 'unknown', 'Logout', 'Authentication', 'User logged out successfully', clientIp, profile_image || null, 'success']
        );
        console.log('Logout logged successfully with profile_image');
      } catch (insertError) {
        // If profile_image column doesn't exist, try without it
        if (insertError.message.includes('profile_image')) {
          console.log('profile_image column not found, trying without it');
          await pool.query(
            `INSERT INTO audit_logs (user_name, user_role, action, module, description, ip_address, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [displayName, user?.role || 'unknown', 'Logout', 'Authentication', 'User logged out successfully', clientIp, 'success']
          );
          console.log('Logout logged successfully without profile_image');
        } else {
          throw insertError;
        }
      }
    } else {
      console.log('No user data provided');
    }
    
    res.json({ success: true, message: 'Logout logged successfully' });
  } catch (error) {
    console.error('Error logging logout:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET ALL ACCOUNTS ============
router.get('/accounts', async (req, res) => {
  try {
    // Get all admins
    const adminsResult = await pool.query(
      'SELECT id, username, full_name, email, phone, position, profile_image, status, created_at FROM admins ORDER BY created_at DESC'
    );
    
    // Get all staffs
    const staffsResult = await pool.query(
      'SELECT id, username, full_name, email, phone, position, profile_image, status, created_at FROM staffs ORDER BY created_at DESC'
    );
    
    // Get all residents/homeowners
    const residentsResult = await pool.query(
      'SELECT id, username, full_name, lot_number, block, phase, email, phone, profile_image, status, created_at FROM residents ORDER BY created_at DESC'
    );
    
    // Format accounts with role information
    const accounts = [
      ...adminsResult.rows.map(admin => ({
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
        email: admin.email,
        phone: admin.phone,
        position: admin.position,
        profileImage: admin.profile_image,
        status: admin.status,
        createdAt: admin.created_at,
        role: 'admin',
        lotNumber: null,
        block: null
      })),
      ...staffsResult.rows.map(staff => ({
        id: staff.id,
        username: staff.username,
        fullName: staff.full_name,
        email: staff.email,
        phone: staff.phone,
        position: staff.position,
        profileImage: staff.profile_image,
        status: staff.status,
        createdAt: staff.created_at,
        role: 'staff',
        lotNumber: null,
        block: null
      })),
      ...residentsResult.rows.map(resident => ({
        id: resident.id,
        username: resident.username,
        fullName: resident.full_name,
        email: resident.email,
        phone: resident.phone,
        position: null,
        profileImage: resident.profile_image,
        status: resident.status,
        createdAt: resident.created_at,
        role: 'homeowner',
        lotNumber: resident.lot_number,
        block: resident.block
      }))
    ];
    
    res.json({ success: true, accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;