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
          'SELECT id, username, password_hash, full_name, lot_number, block, phase, email, phone, profile_image FROM residents WHERE username = $1 AND status = $2',
          [username, 'active']
        );
        
        if (result.rows.length > 0) {
          user = result.rows[0];
          role = 'resident';
          passwordHash = user.password_hash;
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
  const { username, password, full_name, lot_number, block, email, phone } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO residents (username, password_hash, full_name, lot_number, block, email, phone, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, username, full_name`,
      [username, hashedPassword, full_name || username, lot_number || null, block || null, email || null, phone || null, 'active']
    );
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Register error:', error);
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

export default router;