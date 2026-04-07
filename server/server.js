import express from 'express';      // Web framework
import cors from 'cors';            // Allows frontend to communicate with backend
import pool from '../src/backend/config/db.js';         // Your database connection
import bcrypt from 'bcrypt';        // For password hashing

const app = express();
app.use(cors());                   // Enable CORS
app.use(express.json());           // Parse JSON data from frontend

// ============ AUTHENTICATION ENDPOINTS ============

// Login endpoint - checks admins, staffs, and residents tables
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    let user = null;
    let role = null;
    let passwordHash = null;
    
    // Check admins table first
    let result = await pool.query(
      'SELECT id, username, password_hash, full_name FROM admins WHERE username = $1 AND status = $2',
      [username, 'active']
    );
    
    if (result.rows.length > 0) {
      user = result.rows[0];
      role = 'admin';
      passwordHash = user.password_hash;
    } else {
      // Check staffs table
      result = await pool.query(
        'SELECT id, username, password_hash, full_name, position FROM staffs WHERE username = $1 AND status = $2',
        [username, 'active']
      );
      
      if (result.rows.length > 0) {
        user = result.rows[0];
        role = 'staff';
        passwordHash = user.password_hash;
      } else {
        // Check residents table (homeowners)
        result = await pool.query(
          'SELECT id, username, password_hash, full_name FROM residents WHERE username = $1 AND status = $2',
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
      await pool.query(
        `INSERT INTO audit_logs (user_name, user_role, action, module, description, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.username, role, 'Login', 'Authentication', 'User logged in successfully', 'success']
      );
      
      res.json({ success: true, user: { id: user.id, username: user.username, role: role, fullName: user.full_name } });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register endpoint - for homeowners (residents)
app.post('/api/register', async (req, res) => {
  const { username, password, full_name, lot_number, block } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO residents (username, password_hash, full_name, lot_number, block, status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, full_name`,
      [username, hashedPassword, full_name || username, lot_number || null, block || null, 'active']
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
      result = await pool.query('SELECT id, username, full_name, email, phone, position, status, last_login FROM admins WHERE id = $1', [id]);
    } else if (role === 'staff') {
      result = await pool.query('SELECT id, username, full_name, email, phone, position, status, last_login FROM staffs WHERE id = $1', [id]);
    } else {
      result = await pool.query('SELECT id, username, full_name, lot_number, block, phase, email, phone, status, last_login FROM residents WHERE id = $1', [id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      lotNumber: user.lot_number,
      block: user.block,
      phase: user.phase,
      email: user.email,
      phone: user.phone,
      position: user.position,
      status: user.status,
      lastLogin: user.last_login
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update resident profile
app.put('/api/profile/resident/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, lot_number, block, phase, email, phone, profile_image } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE residents SET full_name = $1, lot_number = $2, block = $3, phase = $4, email = $5, phone = $6, profile_image = $7, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 RETURNING id, username, full_name, lot_number, block, phase, email, phone`,
      [full_name, lot_number, block, phase, email, phone, profile_image, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    
    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        lotNumber: user.lot_number,
        block: user.block,
        phase: user.phase,
        email: user.email,
        phone: user.phone
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
  
  try {
    const result = await pool.query(
      `UPDATE admins SET full_name = $1, email = $2, phone = $3, profile_image = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING id, username, full_name, email, phone`,
      [full_name, email, phone, profile_image, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone
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
  
  try {
    const result = await pool.query(
      `UPDATE staffs SET full_name = $1, email = $2, phone = $3, profile_image = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING id, username, full_name, email, phone`,
      [full_name, email, phone, profile_image, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    
    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone
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
      `SELECT id, full_name, lot_number, block, email, phone, role, status, date_registered 
       FROM residents ORDER BY id`
    );
    // Map to frontend format
    const mapped = result.rows.map(r => ({
      id: r.id,
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
  const { lot_number, resident_name, violation_type, description, date_issued, status, penalty } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO violations (lot_number, resident_name, violation_type, description, date_issued, status, penalty) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [lot_number, resident_name, violation_type, description, date_issued, status || 'pending', penalty]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating violation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update violation
app.put('/api/violations/:id', async (req, res) => {
  const { lot_number, resident_name, violation_type, description, date_issued, status, penalty } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE violations SET lot_number = $1, resident_name = $2, violation_type = $3, description = $4, date_issued = $5, status = $6, penalty = $7, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 RETURNING *`,
      [lot_number, resident_name, violation_type, description, date_issued, status, penalty, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
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

// Start server
app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
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
