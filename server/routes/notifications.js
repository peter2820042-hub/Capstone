// ============ NOTIFICATIONS ROUTES ============
// Get and manage notifications for users

import express from 'express';
import pool from '../../src/backend/config/db.js';

const router = express.Router();

// Helper function to ensure notifications table exists
const ensureNotificationsTable = async () => {
  try {
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
  } catch (err) {
    console.log('Notifications table might already exist');
  }
};

// Get user from request body
const getUserFromRequest = (req) => {
  try {
    const userData = req.body?.user || req.headers['x-user'];
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

// ============ GET ALL NOTIFICATIONS ============
router.get('/', async (req, res) => {
  try {
    await ensureNotificationsTable();
    const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.json([]);
  }
});

// ============ GET NOTIFICATIONS FOR USER ============
router.get('/user/:userId', async (req, res) => {
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

// ============ GET UNREAD COUNT ============
router.get('/unread-count', async (req, res) => {
  try {
    await ensureNotificationsTable();
    const user = getUserFromRequest(req);
    let query = "SELECT COUNT(*) FROM notifications WHERE status = 'unread'";
    let params = [];
    
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

// ============ MARK AS READ ============
router.put('/:id/read', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET status = $1 WHERE id = $2 RETURNING *',
      ['read', req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ MARK ALL READ ============
router.put('/mark-all-read', async (req, res) => {
  try {
    const user = getUserFromRequest(req);
    if (user) {
      await pool.query('UPDATE notifications SET status = $1 WHERE user_id = $2 AND status = $3', ['read', user.id, 'unread']);
    } else {
      await pool.query('UPDATE notifications SET status = $1 WHERE status = $2', ['read', 'unread']);
    }
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ DELETE NOTIFICATION ============
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ SEND NOTICE (Announcement) ============
router.post('/send-notice', async (req, res) => {
  try {
    await ensureNotificationsTable();
    
    const { lot_number, block, resident_name, resident_email, title, message, send_to_all } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    if (send_to_all) {
      // Get all residents
      const residents = await pool.query('SELECT id FROM residents');
      
      if (residents.rows.length === 0) {
        return res.status(404).json({ error: 'No residents found' });
      }
      
      // Insert notification for each resident
      for (const resident of residents.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, status, related_type) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [resident.id, 'announcement', title, message, 'unread', 'bulk_announcement']
        );
      }
      
      res.json({ 
        success: true, 
        message: `Announcement sent to ${residents.rows.length} residents!`,
        count: residents.rows.length
      });
    } else {
      // Single resident notification - find by lot_number and block
      if (!lot_number || !block) {
        return res.status(400).json({ error: 'Lot number and block are required for single notice' });
      }
      
      const resident = await pool.query(
        'SELECT id FROM residents WHERE lot_number = $1 AND block = $2',
        [lot_number, block]
      );
      
      if (resident.rows.length === 0) {
        return res.status(404).json({ error: 'Resident not found' });
      }
      
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, status, related_type) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [resident.rows[0].id, 'notice', title, message, 'unread', 'violation_notice']
      );
      
      res.json({ success: true, message: 'Notice sent successfully!' });
    }
  } catch (error) {
    console.error('Error sending notice:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;