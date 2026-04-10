import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from '../src/backend/config/db.js';
import bcrypt from 'bcrypt';

// Simple in-memory rate limiter with cleanup and size limit
const rateLimitStore = new Map();
const MAX_STORE_SIZE = 10000;
const MAX_AGE_MS = 60000; // 1 minute max age for entries

// Cleanup stale entries every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  // If store is still too large after cleanup, clear oldest entries
  if (rateLimitStore.size > MAX_STORE_SIZE) {
    const entries = Array.from(rateLimitStore.entries());
    rateLimitStore.clear();
    // Keep newest entries up to half of max
    entries.slice(-MAX_STORE_SIZE / 2).forEach(([k, v]) => rateLimitStore.set(k, v));
  }
}, 30000);

const rateLimit = (maxRequests = 5, windowMs = 60000) => {
  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'];
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitStore.get(key);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    record.count++;
    next();
  };
};

const app = express();

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.) in development
    // Also allow exact matches
    const isAllowed = !origin || origin === 'null' || allowedOrigins.includes(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User'],
  maxAge: 86400,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handler for PayloadTooLargeError
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err.message.includes('request entity too large')) {
    console.error('Payload too large error:', err.message);
    return res.status(413).json({ error: 'Request entity too large. Please use a smaller image.' });
  }
  next(err);
});

// ============ AUTHENTICATION ENDPOINTS ============

// Login endpoint - checks admins, staffs, and residents tables
app.post('/api/login', rateLimit(5, 60000), async (req, res) => {
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

// Register endpoint - for homeowners (residents)
app.post('/api/register', rateLimit(3, 60000), async (req, res) => {
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

// ============ PROFILE ENDPOINTS ============

// Get current user profile
app.get('/api/profile/:id/:role', async (req, res) => {
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

// Update resident profile
app.put('/api/profile/resident/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, profile_image } = req.body;
  
  // Authorization check: verify user can only update their own profile (from X-User header)
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

// Update admin profile
app.put('/api/profile/admin/:id', async (req, res) => {
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

// Update staff profile
app.put('/api/profile/staff/:id', async (req, res) => {
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

// ============ RESIDENTS ENDPOINTS ============

// Get all residents
app.get('/api/residents', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, lot_number, block, email, phone, role, status, date_registered 
       FROM residents ORDER BY id`
    );
    // Map to frontend format
    const mapped = result.rows.map(r => ({
      id: r.id,
      username: r.username,
      fullName: r.full_name,
      lotNumber: r.lot_number,
      block: r.block,
      email: r.email,
      phoneNumber: r.phone,
      role: r.role,
      status: r.status,
      dateRegistered: r.date_registered
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching residents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search residents by lot number or block
app.get('/api/residents/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json({ residents: [] });
    }
    
    const searchPattern = `%${query}%`;
    
    // Also handle combined block+lot format (e.g., "A-101" or "A101")
    let blockOnly = '';
    let lotOnly = '';
    
    // Try to parse block and lot from combined format
    const combinedMatch = query.match(/^([A-Za-z]+)[- ]?(\d+)$/);
    if (combinedMatch) {
      blockOnly = combinedMatch[1];
      lotOnly = combinedMatch[2];
    }
    
    let result;
    if (blockOnly && lotOnly) {
      // Search for combined block+lot format
      result = await pool.query(
        `SELECT id, full_name, lot_number, block, email, phone, role, status, date_registered 
         FROM residents 
         WHERE (lot_number ILIKE $1 OR block ILIKE $2 OR full_name ILIKE $3)
         OR (block ILIKE $4 AND lot_number ILIKE $5)
         ORDER BY lot_number
         LIMIT 10`,
        [searchPattern, searchPattern, searchPattern, `%${blockOnly}%`, `%${lotOnly}%`]
      );
    } else {
      result = await pool.query(
        `SELECT id, full_name, lot_number, block, email, phone, role, status, date_registered 
         FROM residents 
         WHERE lot_number ILIKE $1 OR block ILIKE $1 OR full_name ILIKE $1
         ORDER BY lot_number
         LIMIT 10`,
        [searchPattern]
      );
    }
    
    const mapped = result.rows.map(r => ({
      id: r.id,
      full_name: r.full_name,
      lot_number: r.lot_number,
      block: r.block,
      email: r.email,
      phone: r.phone,
      role: r.role,
      status: r.status
    }));
    
    res.json({ residents: mapped });
  } catch (error) {
    console.error('Error searching residents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single resident
app.get('/api/residents/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM residents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching resident:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create resident
app.post('/api/residents', async (req, res) => {
  const { full_name, lot_number, block, email, phone, role, status } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO residents (full_name, lot_number, block, email, phone, role, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [full_name, lot_number, block, email, phone, role || 'homeowner', status || 'active']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating resident:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update resident
app.put('/api/residents/:id', async (req, res) => {
  const { full_name, lot_number, block, email, phone, role, status } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE residents SET full_name = $1, lot_number = $2, block = $3, email = $4, phone = $5, role = $6, status = $7, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 RETURNING *`,
      [full_name, lot_number, block, email, phone, role, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update resident by username
app.put('/api/residents/by-username/:username', async (req, res) => {
  const { username } = req.params;
  const { lot_number, block, phase, full_name, email, phone, role, status } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE residents SET lot_number = COALESCE($1, lot_number), block = COALESCE($2, block), phase = COALESCE($3, phase), full_name = COALESCE($4, full_name), email = COALESCE($5, email), phone = COALESCE($6, phone), role = COALESCE($7, role), status = COALESCE($8, status), updated_at = CURRENT_TIMESTAMP 
       WHERE username = $9 RETURNING *`,
      [lot_number, block, phase, full_name, email, phone, role, status, username]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete resident
app.delete('/api/residents/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM residents WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    res.json({ success: true, message: 'Resident deleted' });
  } catch (error) {
    console.error('Error deleting resident:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ VIOLATIONS ENDPOINTS ============

// Get violations for specific user (by lot_number)
app.get('/api/violations/user/:lotNumber', async (req, res) => {
  try {
    const { lotNumber } = req.params;
    const result = await pool.query(
      'SELECT * FROM violations WHERE lot_number = $1 ORDER BY id DESC',
      [lotNumber]
    );
    // Map to frontend format
    const mapped = result.rows.map(v => ({
      id: v.id,
      lotNumber: v.lot_number,
      residentName: v.resident_name,
      violationType: v.violation_type,
      description: v.description,
      dateIssued: v.date_issued,
      status: v.status,
      penalty: v.penalty
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching user violations:', error);
    res.json([]);
  }
});

// Get all violations
app.get('/api/violations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM violations ORDER BY id DESC');
    // Map to frontend format
    const mapped = result.rows.map(v => ({
      id: v.id,
      lotNumber: v.lot_number,
      residentName: v.resident_name,
      violationType: v.violation_type,
      description: v.description,
      dateIssued: v.date_issued,
      status: v.status,
      penalty: v.penalty
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create violation
app.post('/api/violations', async (req, res) => {
  const { lotNumber, block, residentName, violationType, description, penalty, dateIssued, status } = req.body;
  const lot_number = lotNumber;
  const violation_type = violationType;
  
  try {
    const result = await pool.query(
      `INSERT INTO violations (lot_number, resident_name, violation_type, description, date_issued, status, penalty, block) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [lot_number, residentName, violation_type, description, dateIssued, status || 'pending', penalty, block]
    );

    // AUTO-CREATE BILL: If penalty is set, create a bill for the resident
    if (penalty && parseFloat(penalty) > 0) {
      try {
        // Get resident info
        const residentResult = await pool.query(
          'SELECT id, full_name, email FROM residents WHERE lot_number = $1 LIMIT 1',
          [lot_number]
        );
        
        if (residentResult.rows.length > 0) {
          const resident = residentResult.rows[0];
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days
          
          await pool.query(
            `INSERT INTO bills (lot_number, resident_name, bill_type, amount, due_date, status, billing_period, related_id, related_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              lot_number,
              resident.full_name,
              'Violation Penalty',
              penalty,
              dueDate.toISOString().split('T')[0],
              'unpaid',
              new Date().toISOString().split('T')[0].substring(0, 7),
              result.rows[0].id,
              'violation'
            ]
          );
          
          console.log(`Auto-created bill for violation ${result.rows[0].id} - Penalty: PHP ${penalty}`);
        }
      } catch (billErr) {
        console.log('Could not auto-create bill:', billErr.message);
      }
    }
    
    // Ensure notifications table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        type VARCHAR(50),
        title VARCHAR(255),
        message TEXT,
        status VARCHAR(20) DEFAULT 'unread',
        related_id INTEGER,
        related_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const notificationTitle = `New Violation: ${violation_type}`;
    const notificationMessage = `A violation has been recorded for Lot ${lot_number}. Type: ${violation_type}. Description: ${description || 'N/A'}. Penalty: ₱${penalty || 0}`;
    
    // 1. Notify the homeowner (resident)
    try {
      // Get resident info including email
      const residentResult = await pool.query(
        'SELECT id, email, full_name FROM residents WHERE lot_number = $1 LIMIT 1',
        [lot_number]
      );
      
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, status, related_id, related_type)
         VALUES ((SELECT id FROM residents WHERE lot_number = $1 LIMIT 1), 'violation', $2, $3, 'unread', $4, 'violation')`,
        [lot_number, notificationTitle, notificationMessage, result.rows[0].id]
      );
      
      // Send email to resident
      if (residentResult.rows.length > 0 && residentResult.rows[0].email) {
        try {
          // Email sending temporarily disabled
          // await sendNoticeEmail(residentEmail, `Violation Notice - Lot ${lot_number}`, `...`);
        } catch (emailErr) {
          console.log('Could not send email to resident:', emailErr.message);
        }
      }
    } catch (notifyErr) {
      console.log('Could not create homeowner notification:', notifyErr.message);
    }
    
    // 2. Notify ALL admin users
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, status, related_id, related_type)
         SELECT id, 'violation_admin', $1, $2, 'unread', $3, 'violation' 
         FROM users WHERE role = 'admin'`,
        [notificationTitle, `NEW VIOLATION LOGGED: ${notificationMessage}`, result.rows[0].id]
      );
    } catch (notifyErr) {
      console.log('Could not create admin notification:', notifyErr.message);
    }
    
    // 3. Notify ALL staff users
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, status, related_id, related_type)
         SELECT id, 'violation_staff', $1, $2, 'unread', $3, 'violation' 
         FROM users WHERE role = 'staff'`,
        [notificationTitle, `NEW VIOLATION LOGGED: ${notificationMessage}`, result.rows[0].id]
      );
    } catch (notifyErr) {
      console.log('Could not create staff notification:', notifyErr.message);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating violation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update violation
app.put('/api/violations/:id', async (req, res) => {
  const { lotNumber, residentName, violationType, description, penalty, status } = req.body;
  
  try {
    // Get current violation to check if status changed
    const currentViolation = await pool.query('SELECT * FROM violations WHERE id = $1', [req.params.id]);
    if (currentViolation.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }
    
    const oldStatus = currentViolation.rows[0].status;
    const lotNumberVal = lotNumber || currentViolation.rows[0].lot_number;
    const residentNameVal = residentName || currentViolation.rows[0].resident_name;
    const violationTypeVal = violationType || currentViolation.rows[0].violation_type;
    const descriptionVal = description || currentViolation.rows[0].description;
    const penaltyVal = penalty || currentViolation.rows[0].penalty;
    
    const result = await pool.query(
      `UPDATE violations SET lot_number = $1, resident_name = $2, violation_type = $3, description = $4, status = $5, penalty = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 RETURNING *`,
      [lotNumberVal, residentNameVal, violationTypeVal, descriptionVal, status, penaltyVal, req.params.id]
    );
    
    // If status changed to 'resolved', notify the homeowner
    if (oldStatus !== 'resolved' && status === 'resolved') {
      try {
        // Ensure notifications table exists
        await pool.query(`
          CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            type VARCHAR(50),
            title VARCHAR(255),
            message TEXT,
            status VARCHAR(20) DEFAULT 'unread',
            related_id INTEGER,
            related_type VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, status, related_id, related_type)
           VALUES ((SELECT id FROM residents WHERE lot_number = $1 LIMIT 1), 'violation_resolved', $2, $3, 'unread', $4, 'violation')`,
          [lotNumberVal, 'Violation Resolved', `Your violation for Lot ${lotNumberVal} has been resolved. Thank you!`, req.params.id]
        );
        
        // Send email notification to resident
        const residentResult = await pool.query(
          'SELECT id, email, full_name FROM residents WHERE lot_number = $1 LIMIT 1',
          [lotNumberVal]
        );
        
        if (residentResult.rows.length > 0 && residentResult.rows[0].email) {
          try {
            // Email sending temporarily disabled
            // await sendNoticeEmail(residentEmail, `Violation Resolved - Lot ${lotNumberVal}`, `...`);
          } catch (emailErr) {
            console.log('Could not send resolution email:', emailErr.message);
          }
        }
      } catch (notifyErr) {
        console.log('Could not create resolved notification:', notifyErr.message);
      }
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating violation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete violation
app.delete('/api/violations/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM violations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }
    res.json({ success: true, message: 'Violation deleted' });
  } catch (error) {
    console.error('Error deleting violation:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ BILLS ENDPOINTS ============

// Get all bills
app.get('/api/bills', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bills ORDER BY id DESC');
    // Map to frontend format
    const mapped = result.rows.map(b => ({
      id: b.id,
      lotNumber: b.lot_number,
      residentName: b.resident_name,
      billType: b.bill_type,
      amount: parseFloat(b.amount),
      dueDate: b.due_date,
      status: b.status
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create bill
app.post('/api/bills', async (req, res) => {
  const { lot_number, resident_name, bill_type, amount, due_date, status } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO bills (lot_number, resident_name, bill_type, amount, due_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [lot_number, resident_name, bill_type, amount, due_date, status || 'unpaid']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update bill
app.put('/api/bills/:id', async (req, res) => {
  const { lot_number, resident_name, bill_type, amount, due_date, status } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE bills SET lot_number = $1, resident_name = $2, bill_type = $3, amount = $4, due_date = $5, status = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 RETURNING *`,
      [lot_number, resident_name, bill_type, amount, due_date, status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete bill
app.delete('/api/bills/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM bills WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ success: true, message: 'Bill deleted' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ PAYMENTS ENDPOINTS ============

// Get all payments
app.get('/api/payments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY id DESC');
    // Map to frontend format
    const mapped = result.rows.map(p => ({
      id: p.id,
      lotNumber: p.lot_number,
      residentName: p.resident_name,
      billReference: p.bill_reference,
      amount: parseFloat(p.amount),
      paymentDate: p.payment_date,
      paymentMethod: p.payment_method,
      status: p.status,
      approvedDate: p.approved_date
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create payment
app.post('/api/payments', async (req, res) => {
  const { lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO payments (lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status || 'pending']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update payment (approve/reject)
app.put('/api/payments/:id', async (req, res) => {
  const { lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status, approved_date } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE payments SET lot_number = $1, resident_name = $2, bill_reference = $3, amount = $4, payment_date = $5, payment_method = $6, status = $7, approved_date = $8, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $9 RETURNING *`,
      [lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status, approved_date, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ AUDIT LOGS ENDPOINTS ============

// Get all audit logs
app.get('/api/audit-logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get audit logs for a specific user (homeowner/staff) - for transaction history
app.get('/api/audit-logs/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;
    
    let query = '';
    let params = [];
    
    if (role === 'resident') {
      // For residents, get logs by lot number or full_name
      const resident = await pool.query('SELECT full_name, lot_number FROM residents WHERE id = $1', [userId]);
      if (resident.rows.length > 0) {
        query = `SELECT * FROM audit_logs WHERE user_name LIKE $1 OR user_role = 'resident' ORDER BY timestamp DESC LIMIT 50`;
        params = [`%${resident.rows[0].full_name}%`];
      } else {
        query = `SELECT * FROM audit_logs WHERE user_role = 'resident' ORDER BY timestamp DESC LIMIT 50`;
      }
    } else if (role === 'staff') {
      // For staff, get logs where user_role = 'staff' and user_id matches
      const staff = await pool.query('SELECT full_name FROM staffs WHERE id = $1', [userId]);
      if (staff.rows.length > 0) {
        query = `SELECT * FROM audit_logs WHERE user_name LIKE $1 OR user_role = 'staff' ORDER BY timestamp DESC LIMIT 50`;
        params = [`%${staff.rows[0].full_name}%`];
      } else {
        query = `SELECT * FROM audit_logs WHERE user_role = 'staff' ORDER BY timestamp DESC LIMIT 50`;
      }
    } else {
      // Default: get all recent logs
      query = `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50`;
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ DASHBOARD STATS ENDPOINTS ============

// Get dashboard statistics
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const totalResidents = await pool.query('SELECT COUNT(*) as count FROM residents');
    const totalViolations = await pool.query('SELECT COUNT(*) as count FROM violations');
    const totalBills = await pool.query('SELECT COUNT(*) as count FROM bills');
    const totalPayments = await pool.query('SELECT COUNT(*) as count FROM payments WHERE status = $1', ['approved']);
    const pendingPayments = await pool.query('SELECT COUNT(*) as count FROM payments WHERE status = $1', ['pending']);
    const overdueBills = await pool.query('SELECT COUNT(*) as count FROM bills WHERE status = $1', ['overdue']);
    
    res.json({
      totalResidents: parseInt(totalResidents.rows[0].count),
      totalViolations: parseInt(totalViolations.rows[0].count),
      totalBills: parseInt(totalBills.rows[0].count),
      totalPayments: parseInt(totalPayments.rows[0].count),
      pendingPayments: parseInt(pendingPayments.rows[0].count),
      overdueBills: parseInt(overdueBills.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout endpoint - log the logout action to audit logs
app.post('/api/logout', async (req, res) => {
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

// Reset audit_logs table - drop and recreate
app.post('/api/reset-audit-logs', rateLimit(3, 60000), async (req, res) => {
  // Authorization check: only admins can reset audit logs
  const authUser = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Only admins can reset audit logs' });
  }
  
  try {
    // Drop the table if exists
    await pool.query('DROP TABLE IF EXISTS audit_logs');
    
    // Recreate the table with updated schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(255),
        user_role VARCHAR(50),
        action VARCHAR(100),
        module VARCHAR(100),
        description TEXT,
        ip_address VARCHAR(50),
        profile_image TEXT,
        status VARCHAR(50) DEFAULT 'success',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert a test log
    await pool.query(
      `INSERT INTO audit_logs (user_name, user_role, action, module, description, ip_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['System', 'admin', 'Init', 'Audit Logs', 'Audit logs table recreated successfully', '127.0.0.1', 'success']
    );
    
    res.json({ success: true, message: 'Audit logs table reset successfully' });
  } catch (error) {
    console.error('Error resetting audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(3001, '0.0.0.0', () => {
  console.log('✅ Server running on http://0.0.0.0:3001');
  console.log('✅ Server is online and ready!');
});

// Clear violations data only
app.delete('/api/clear-violations', async (req, res) => {
  try {
    await pool.query('DELETE FROM violations');
    await pool.query('ALTER SEQUENCE violations_id_seq RESTART WITH 1');
    
    res.json({ success: true, message: 'Violations data cleared successfully' });
  } catch (error) {
    console.error('Error clearing violations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear audit logs data only
app.delete('/api/clear-audit-logs', async (req, res) => {
  try {
    await pool.query('DELETE FROM audit_logs');
    await pool.query('ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1');
    
    res.json({ success: true, message: 'Audit logs data cleared successfully' });
  } catch (error) {
    console.error('Error clearing audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN CLEAR DATA ENDPOINT ============

// Clear all data from tables (for testing/reset)
app.delete('/api/clear-all-data', async (req, res) => {
  try {
    await pool.query('DELETE FROM payments');
    await pool.query('DELETE FROM bills');
    await pool.query('DELETE FROM violations');
    await pool.query('DELETE FROM residents');
    await pool.query('DELETE FROM audit_logs');
    
    // Reset sequences
    await pool.query('ALTER SEQUENCE payments_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE bills_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE violations_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE residents_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1');
    
    res.json({ success: true, message: 'All data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user from request body (sent by frontend from localStorage)
// In production, this should be replaced with proper JWT verification
const getUserFromRequest = (req) => {
  try {
    const userData = req.body?.user || req.headers['x-user'];
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user from request:', error);
    return null;
  }
};

// Helper function to create notifications table if not exists
const ensureNotificationsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      type VARCHAR(50),
      title VARCHAR(255),
      message TEXT,
      status VARCHAR(20) DEFAULT 'unread',
      related_id INTEGER,
      related_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Get notifications for specific user (by user_id)
app.get('/api/notifications/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.json([]);
  }
});

// Get unread notification count
app.get('/api/notifications/unread-count', async (req, res) => {
  try {
    // Ensure notifications table exists
    await ensureNotificationsTable();
    
    const user = getUserFromRequest(req);
    let query = "SELECT COUNT(*) FROM notifications WHERE status = 'unread'";
    let params = [];
    
    // Filter by user_id if user is provided (for non-admin users)
    if (user && user.role !== 'admin') {
      query += ' AND user_id = $1';
      params.push(user.id);
    }
    
    const result = await pool.query(query, params);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.json({ count: 0 });
  }
});

// Get notifications
app.get('/api/notifications', async (req, res) => {
  try {
    // Ensure notifications table exists
    await ensureNotificationsTable();
    
    const user = getUserFromRequest(req);
    let query = 'SELECT * FROM notifications';
    let params = [];
    
    // Filter by user_id if user is provided (for non-admin users)
    if (user && user.role !== 'admin') {
      query += ' WHERE user_id = $1';
      params.push(user.id);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.json([]);
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const user = getUserFromRequest(req);
    let query = "UPDATE notifications SET status = 'read' WHERE id = $1";
    let params = [req.params.id];
    
    // Add user filter for non-admin users
    if (user && user.role !== 'admin') {
      query += ' AND user_id = $2';
      params.push(user.id);
    }
    
    await pool.query(query, params);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send notice/message to a resident
app.post('/api/send-notice', async (req, res) => {
  const { lot_number, resident_email, title, message } = req.body;
  
  if (!lot_number || !title || !message) {
    return res.status(400).json({ error: 'lot_number, title, and message are required' });
  }
  
  try {
    // Try to find resident by lot number or email
    let residentId = null;
    let residentEmail = resident_email;
    
    // First try by lot number
    const residentResult = await pool.query(
      'SELECT id, email FROM residents WHERE lot_number = $1 LIMIT 1',
      [lot_number]
    );
    
    if (residentResult.rows.length > 0) {
      residentId = residentResult.rows[0].id;
      residentEmail = resident_email || residentResult.rows[0].email;
    } else if (resident_email) {
      // Try by email if lot number not found
      const emailResult = await pool.query(
        'SELECT id, email FROM residents WHERE email = $1 LIMIT 1',
        [resident_email]
      );
      if (emailResult.rows.length > 0) {
        residentId = emailResult.rows[0].id;
        residentEmail = emailResult.rows[0].email;
      }
    }
    
    // Create notification
    if (residentId) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, status, related_type)
         VALUES ($1, 'notice', $2, $3, 'unread', 'notice')`,
        [residentId, title, message]
      );
    }
    
    // If we have an email, send it
    if (residentEmail) {
      try {
        // Email sending temporarily disabled
        // await sendNoticeEmail(residentEmail, title, message);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }
    
    res.json({ success: true, message: 'Notice sent successfully!' });
  } catch (error) {
    console.error('Error sending notice:', error);
    res.status(500).json({ error: error.message });
  }
});


