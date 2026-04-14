// ============ AUDIT LOGS ROUTES ============
// Query and manage audit logs

import express from 'express';
import pool from '../../src/backend/config/db.js';

const router = express.Router();

// ============ GET ALL AUDIT LOGS ============
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET AUDIT LOGS FOR SPECIFIC USER ============
// For transaction history - filters by userId and role
router.get('/user/:userId', async (req, res) => {
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

// ============ RESET AUDIT LOGS TABLE ============
// Drop and recreate the audit_logs table
router.post('/reset', async (req, res) => {
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

// ============ CLEAR AUDIT LOGS DATA ============
// Delete all audit logs but keep the table
router.delete('/clear', async (req, res) => {
  try {
    await pool.query('DELETE FROM audit_logs');
    await pool.query('ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1');
    
    res.json({ success: true, message: 'Audit logs data cleared successfully' });
  } catch (error) {
    console.error('Error clearing audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;