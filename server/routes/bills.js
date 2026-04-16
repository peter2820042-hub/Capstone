// ============ BILLS ROUTES ============
// CRUD operations for bills

import express from 'express';
import pool from '../../src/backend/config/db.js';

const router = express.Router();

// ============ GET ALL BILLS (admin) ============
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bills ORDER BY id DESC');
    // Map to frontend format
    const mapped = result.rows.map(b => ({
      id: b.id,
      billReference: b.bill_reference || `BILL-${b.id.toString().padStart(4, '0')}`,
      lotNumber: b.lot_number,
      block: b.block,
      residentName: b.resident_name,
      billType: b.bill_type,
      billingPeriod: b.billing_period || 'N/A',
      amount: parseFloat(b.amount),
      dueDate: b.due_date,
      status: b.status,
      datePaid: b.date_paid || null,
      paymentMethod: b.payment_method || null,
      amountPaid: b.amount_paid ? parseFloat(b.amount_paid) : null
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET BILLS FOR SPECIFIC USER (by lot_number) ============
router.get('/user/:lotNumber', async (req, res) => {
  try {
    const { lotNumber } = req.params;
    const result = await pool.query(
      'SELECT * FROM bills WHERE lot_number = $1 ORDER BY due_date DESC',
      [lotNumber]
    );
    const mapped = result.rows.map(b => ({
      id: b.id,
      billNumber: b.bill_reference || `BILL-${b.id.toString().padStart(4, '0')}`,
      description: b.bill_type,
      lotNumber: b.lot_number,
      residentName: b.resident_name,
      billType: b.bill_type,
      billingPeriod: b.billing_period || 'N/A',
      amount: parseFloat(b.amount),
      dueDate: b.due_date,
      status: b.status,
      paidDate: b.date_paid || null,
      paymentMethod: b.payment_method || null,
      amountPaid: b.amount_paid ? parseFloat(b.amount_paid) : null
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching user bills:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET UNPAID BILLS FOR USER ============
router.get('/user/:lotNumber/unpaid', async (req, res) => {
  try {
    const { lotNumber } = req.params;
    const result = await pool.query(
      "SELECT * FROM bills WHERE lot_number = $1 AND status IN ('unpaid', 'pending', 'overdue') ORDER BY due_date ASC",
      [lotNumber]
    );
    const mapped = result.rows.map(b => ({
      id: b.id,
      billNumber: b.bill_reference || `BILL-${b.id.toString().padStart(4, '0')}`,
      description: b.bill_type,
      lotNumber: b.lot_number,
      residentName: b.resident_name,
      billType: b.bill_type,
      billingPeriod: b.billing_period || 'N/A',
      amount: parseFloat(b.amount),
      dueDate: b.due_date,
      status: b.status
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Error fetching unpaid bills:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ CREATE BILL ============
router.post('/', async (req, res) => {
  // Handle both camelCase (frontend) and snake_case (server) formats
  const { lot_number, block, resident_name, bill_type, amount, due_date, status, billing_period,
        lotNumber, residentName, billType, billingPeriod } = req.body;

  // Normalize field names
  const normalizedLotNumber = lot_number || lotNumber;
  const normalizedResidentName = resident_name || residentName;
  const normalizedBillType = bill_type || billType;
  const normalizedBillingPeriod = billing_period || billingPeriod || 'N/A';
  
  try {
    const result = await pool.query(
      `INSERT INTO bills (lot_number, block, resident_name, bill_type, billing_period, amount, due_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [normalizedLotNumber, block, normalizedResidentName, normalizedBillType, normalizedBillingPeriod, amount, due_date, status || 'unpaid']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ UPDATE BILL ============
router.put('/:id', async (req, res) => {
  const { lot_number, block, resident_name, bill_type, amount, due_date, status } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE bills SET lot_number = $1, block = $2, resident_name = $3, bill_type = $4, amount = $5, due_date = $6, status = $7, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 RETURNING *`,
      [lot_number, block, resident_name, bill_type, amount, due_date, status, req.params.id]
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

// ============ DELETE OVERDUE BILLS ============
router.delete('/overdue', async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM bills WHERE status = 'overdue' RETURNING *");
    res.json({ success: true, message: `${result.rowCount} overdue bill(s) deleted` });
  } catch (error) {
    console.error('Error deleting overdue bills:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ DELETE BILL ============
router.delete('/:id', async (req, res) => {
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

// ============ CLEAR ALL BILLS ============
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM bills');
    res.json({ success: true, message: 'All bills cleared' });
  } catch (error) {
    console.error('Error clearing bills:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;