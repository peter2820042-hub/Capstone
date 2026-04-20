// ============ VIOLATIONS ROUTES ============
// CRUD operations for violations

import express from 'express';
import pool from '../../src/backend/config/db.js';

const router = express.Router();

// ============ GET VIOLATIONS FOR USER ============
router.get('/user/:lotNumber', async (req, res) => {
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

// ============ GET VIOLATION STATISTICS (Daily, Weekly, Monthly, Yearly) ============
router.get('/statistics', async (req, res) => {
  try {
    const { period } = req.query; // 'daily', 'weekly', 'monthly', 'yearly'
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 28);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 12);
        break;
      case 'yearly':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 12);
    }

    let query;
    const periodVal = period || 'monthly';
    
    if (periodVal === 'daily') {
      query = `
        SELECT 
          TO_CHAR(date_issued, 'YYYY-MM-DD') as period,
          COUNT(*) as count
        FROM violations
        WHERE date_issued >= $1
        GROUP BY TO_CHAR(date_issued, 'YYYY-MM-DD')
        ORDER BY period
      `;
    } else if (periodVal === 'weekly') {
      query = `
        SELECT 
          TO_CHAR(date_issued, 'IYYY-IW') as period,
          COUNT(*) as count
        FROM violations
        WHERE date_issued >= $1
        GROUP BY TO_CHAR(date_issued, 'IYYY-IW')
        ORDER BY period
      `;
    } else if (periodVal === 'monthly') {
      query = `
        SELECT 
          TO_CHAR(date_issued, 'YYYY-MM') as period,
          COUNT(*) as count
        FROM violations
        WHERE date_issued >= $1
        GROUP BY TO_CHAR(date_issued, 'YYYY-MM')
        ORDER BY period
      `;
    } else if (periodVal === 'yearly') {
      query = `
        SELECT 
          TO_CHAR(date_issued, 'YYYY') as period,
          COUNT(*) as count
        FROM violations
        WHERE date_issued >= $1
        GROUP BY TO_CHAR(date_issued, 'YYYY')
        ORDER BY period
      `;
    }

    const result = await pool.query(query, [startDate.toISOString().split('T')[0]]);
    
    // Get total count
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM violations WHERE date_issued >= $1',
      [startDate.toISOString().split('T')[0]]
    );

    res.json({
      data: result.rows,
      total: parseInt(totalResult.rows[0].total) || 0,
      period: period || 'monthly'
    });
  } catch (error) {
    console.error('Error fetching violation statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET ALL VIOLATIONS ============
router.get('/', async (req, res) => {
  try {
    // Get violations with related bill info
    const result = await pool.query(`
      SELECT v.*, r.full_name as resident_name, r.block as block,
             b.id as bill_id, b.bill_type as bill_type, b.amount as bill_amount, b.status as bill_status, b.due_date as bill_due_date
      FROM violations v 
      LEFT JOIN residents r ON v.lot_number = r.lot_number
      LEFT JOIN bills b ON v.id = b.violation_id
      ORDER BY v.id DESC
    `);
    // Map to frontend format
    const mapped = result.rows.map(v => ({
      id: v.id,
      lotNumber: v.lot_number,
      block: v.block,
      residentName: v.resident_name || 'Unknown',
      violationType: v.violation_type,
      description: v.description,
      dateIssued: v.date_issued,
      status: v.status,
      fine: v.penalty,
      // Related bill info
      billId: v.bill_id,
      billType: v.bill_type,
      billAmount: v.bill_amount,
      billStatus: v.bill_status,
      billDueDate: v.bill_due_date
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ CREATE VIOLATION ============
// Authorization: Admin and Staff only
router.post('/', async (req, res) => {
  // Authorization check: only admin and staff can create violations
  const authUser = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
  if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'staff')) {
    return res.status(403).json({ error: 'Unauthorized: Only admin and staff can create violations' });
  }
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
            `INSERT INTO bills (lot_number, resident_name, bill_type, amount, due_date, status, billing_period, violation_id, related_type)
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

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating violation:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ UPDATE VIOLATION ============
// Authorization: Admin and Staff only
router.put('/:id', async (req, res) => {
  // Authorization check: only admin and staff can update violations
  const authUser = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
  if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'staff')) {
    return res.status(403).json({ error: 'Unauthorized: Only admin and staff can update violations' });
  }
  const { lotNumber, residentName, violationType, description, penalty, status } = req.body;
  
  try {
    // Get current violation to check if status changed
    const currentViolation = await pool.query('SELECT * FROM violations WHERE id = $1', [req.params.id]);
    if (currentViolation.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }
    
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
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating violation:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ DELETE VIOLATION ============
// Authorization: Admin only
router.delete('/:id', async (req, res) => {
  // Authorization check: admin and staff can delete violations
  const authUser = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
  if (!authUser || (authUser.role !== 'admin' && authUser.role !== 'staff')) {
    return res.status(403).json({ error: 'Unauthorized: Only admin and staff can delete violations' });
  }
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

export default router;