// ============ RESIDENTS ROUTES ============
// CRUD operations for residents/homeowners

import express from 'express';
import pool from '../../src/backend/config/db.js';

const router = express.Router();

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
  const { username, full_name, lot_number, block, email, phone, role, status } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO residents (username, full_name, lot_number, block, email, phone, role, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [username || `resident_${lot_number}`, full_name, lot_number, block, email, phone, role || 'homeowner', status || 'active']
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
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `UPDATE residents SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
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