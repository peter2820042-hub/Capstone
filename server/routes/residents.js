// ============ RESIDENTS ROUTES ============
// CRUD operations for residents/homeowners

import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../../src/backend/config/db.js';

const router = express.Router();

// ============ CLEAR ALL RESIDENTS ============
router.delete('/clear-all', async (req, res) => {
  try {
    await pool.query('DELETE FROM residents');
    res.json({ success: true, message: 'All residents cleared' });
  } catch (error) {
    console.error('Error clearing residents:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ REGISTER NEW RESIDENT ============
router.post('/', async (req, res) => {
  const { username, password, full_name, lot_number, block, email, phone } = req.body;

  try {
    // Input validation
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!full_name) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    // Email format validation (if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Phone format validation (if provided) - accepts Philippine format
    if (phone && !/^09\d{9}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone must be 11 digits starting with 09' });
    }

    // Check for duplicate block + lot combination
    if (block && lot_number) {
      const checkDup = await pool.query(
        'SELECT id FROM residents WHERE block = $1 AND lot_number = $2 AND status = $3',
        [block, lot_number, 'active']
      );
      if (checkDup.rows.length > 0) {
        return res.status(400).json({ error: 'Block ' + block + ', Lot ' + lot_number + ' already has a resident' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO residents (username, passwords, full_name, lot_number, block, email, phone, role, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'homeowner', 'active') 
       RETURNING id, username, full_name, lot_number, block`,
      [username, hashedPassword, full_name, lot_number || null, block || null, email || null, phone || null]
    );

    res.json({ 
      success: true, 
      message: 'Resident registered successfully!',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ============ GET ALL RESIDENTS ============
router.get('/', async (req, res) => {
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
      phone: r.phone,
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

// ============ SEARCH RESIDENTS ============
// Search residents by full_name, block, and/or lot (filters combined with AND)
router.get('/search', async (req, res) => {
  try {
    const { full_name, block, lot } = req.query;
    
    // Build filter conditions with AND logic
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    if (full_name && full_name.trim()) {
      conditions.push(`full_name ILIKE $${paramIndex++}`);
      values.push(`%${full_name.trim()}%`);
    }
    
    if (block && block.trim()) {
      conditions.push(`block ILIKE $${paramIndex++}`);
      values.push(`%${block.trim()}%`);
    }
    
    if (lot && lot.trim()) {
      conditions.push(`lot_number ILIKE $${paramIndex++}`);
      values.push(`%${lot.trim()}%`);
    }
    
    let result;
    if (conditions.length === 0) {
      // No filters - return all residents
      result = await pool.query(
        `SELECT id, full_name, lot_number, block, email, phone, role, status, date_registered
         FROM residents
         ORDER BY full_name
         LIMIT 50`
      );
    } else {
      // Apply filters combined with AND
      const whereClause = conditions.join(' AND ');
      result = await pool.query(
        `SELECT id, full_name, lot_number, block, email, phone, role, status, date_registered
         FROM residents
         WHERE ${whereClause}
         ORDER BY full_name
         LIMIT 50`,
        values
      );
    }
    
    const mapped = result.rows.map(r => ({
      id: r.id,
      fullName: r.full_name,
      lotNumber: r.lot_number,
      block: r.block,
      email: r.email,
      phone: r.phone,
      role: r.role,
      status: r.status,
      dateRegistered: r.date_registered
    }));
    
    res.json(mapped);
  } catch (error) {
    console.error('Error searching residents:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET SINGLE RESIDENT ============
router.get('/:id', async (req, res) => {
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

// ============ CREATE RESIDENT ============
router.post('/', async (req, res) => {
  const { username, password, full_name, lot_number, block, email, phone, status } = req.body;
  
  try {
    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }
    
    const result = await pool.query(
      `INSERT INTO residents (username, passwords, full_name, lot_number, block, email, phone, role, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'homeowner', $8) RETURNING *`,
      [username || `resident_${lot_number}`, passwordHash, full_name, lot_number, block, email, phone, status || 'active']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating resident:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ UPDATE RESIDENT PASSWORD ============
router.put('/:id/password', async (req, res) => {
  const { password } = req.body;
  
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `UPDATE residents SET passwords = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [hash, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ UPDATE RESIDENT ============
router.put('/:id', async (req, res) => {
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

// ============ UPDATE RESIDENT BY USERNAME ============
router.put('/by-username/:username', async (req, res) => {
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

// ============ DELETE RESIDENT ============
router.delete('/:id', async (req, res) => {
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

export default router;