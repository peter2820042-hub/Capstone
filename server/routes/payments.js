// ============ PAYMENTS ROUTES ============
// CRUD operations for payments

import express from 'express';
import pool from '../../src/backend/config/db.js';

const router = express.Router();

// ============ GET ALL PAYMENTS (admin) ============
router.get('/', async (req, res) => {
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

// ============ GET PAYMENTS/TRANSACTIONS FOR USER ============
router.get('/user/:lotNumber', async (req, res) => {
  try {
    const { lotNumber } = req.params;
    const result = await pool.query(
      'SELECT * FROM payments WHERE lot_number = $1 ORDER BY payment_date DESC',
      [lotNumber]
    );
    const mapped = result.rows.map(p => ({
      id: p.id,
      description: p.bill_reference || `Payment for bill`,
      lotNumber: p.lot_number,
      residentName: p.resident_name,
      billReference: p.bill_reference,
      amount: parseFloat(p.amount),
      date: p.payment_date,
      paymentDate: p.payment_date,
      paymentMethod: p.payment_method,
      status: p.status
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ CREATE PAYMENT ============
router.post('/', async (req, res) => {
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

// ============ UPDATE PAYMENT (Approve/Reject) ============
router.put('/:id', async (req, res) => {
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

// ============ DELETE PAYMENT ============
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;