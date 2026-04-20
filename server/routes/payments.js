// ============ PAYMENTS ROUTES ============
// CRUD operations for payments
// Includes PayMonggo GCash integration

import express from 'express';
import pool from '../../src/backend/config/db.js';
import { createPaymentIntent, retrievePaymentIntent, createCheckoutSession, retrieveCheckoutSession, getPublicKeyHeader as getPublicKeyHeaderFn } from '../../src/backend/config/paymongo.js';

// Use the function from the module
const getPublicKeyHeader = getPublicKeyHeaderFn;

const router = express.Router();

// ============ GET PUBLIC KEY (for frontend) ============
router.get('/public-key', (req, res) => {
  try {
    const publicKey = getPublicKeyHeader();
    res.json({ publicKey });
  } catch (error) {
    console.error('Error getting public key:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ CREATE GCASH PAYMENT INTENT ============
router.post('/gcash/create-intent', async (req, res) => {
  const { amount, billReference, lotNumber, residentName } = req.body;
  
  if (!amount || !billReference || !lotNumber || !residentName) {
    return res.status(400).json({ error: 'Missing required fields: amount, billReference, lotNumber, residentName' });
  }

  try {
    const result = await createPaymentIntent({
      amount,
      billReference,
      lotNumber,
      residentName
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error creating GCash payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ CREATE GCASH CHECKOUT SESSION ============
router.post('/gcash/checkout', async (req, res) => {
  const { amount, billReference, lotNumber, residentName, successUrl, cancelUrl } = req.body;
  
  if (!amount || !billReference || !lotNumber || !residentName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await createCheckoutSession({
      amount,
      description: `Payment for ${billReference}`,
      billReference,
      lotNumber,
      residentName,
      successUrl: successUrl || `${req.headers.origin}/payment/success`,
      failedUrl: cancelUrl || `${req.headers.origin}/payment/cancel`
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error creating GCash checkout:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET GCASH PAYMENT STATUS ============
router.get('/gcash/status/:paymentIntentId', async (req, res) => {
  const { paymentIntentId } = req.params;
  
  try {
    const result = await retrievePaymentIntent(paymentIntentId);
    res.json(result);
  } catch (error) {
    console.error('Error getting GCash payment status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ CHECKOUT SESSION STATUS ============
router.get('/gcash/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    const result = await retrieveCheckoutSession(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error getting checkout session status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ WEBHOOK HANDLER ============
router.post('/gcash/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    console.log('PayMonggo webhook received:', event.type);
    
    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { billReference, lotNumber, billId } = paymentIntent.metadata || {};
      
      // Update payment record in database
      if (billReference && lotNumber) {
        await pool.query(
          `UPDATE payments SET status = 'approved', approved_date = CURRENT_DATE 
           WHERE bill_reference = $1 AND lot_number = $2`,
          [billReference, lotNumber]
        );
        
        // Update bill status to paid (by bill_reference or bill_id)
        if (billId) {
          await pool.query(
            `UPDATE bills SET status = 'paid', date_paid = CURRENT_DATE WHERE id = $1`,
            [billId]
          );
          // Get violation and update status to settled
          const billResult = await pool.query('SELECT violation_id FROM bills WHERE id = $1', [billId]);
          if (billResult.rows.length > 0 && billResult.rows[0].violation_id) {
            await pool.query(
              `UPDATE violations SET status = 'settled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
              [billResult.rows[0].violation_id]
            );
          }
        } else {
          await pool.query(
            `UPDATE bills SET status = 'paid', date_paid = CURRENT_DATE WHERE bill_reference = $1`,
            [billReference]
          );
        }
      }
    }
    
    // Handle failed payment
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const { billReference, lotNumber } = paymentIntent.metadata || {};
      
      if (billReference && lotNumber) {
        await pool.query(
          `UPDATE payments SET status = 'rejected' 
           WHERE bill_reference = $1 AND lot_number = $2 AND status = 'pending'`,
          [billReference, lotNumber]
        );
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET ALL PAYMENTS (admin) ============
router.get('/', async (req, res) => {
  try {
    // Get payments with bill and violation info
    const result = await pool.query(`
      SELECT p.*, b.bill_type, b.amount as bill_amount, b.violation_id, v.violation_type, v.description as violation_description
      FROM payments p
      LEFT JOIN bills b ON p.bill_id = b.id
      LEFT JOIN violations v ON b.violation_id = v.id
      ORDER BY p.id DESC
    `);
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
      approvedDate: p.approved_date,
      // Related info
      billId: p.bill_id,
      billType: p.bill_type,
      billAmount: p.bill_amount,
      violationId: p.violation_id,
      violationType: p.violation_type,
      violationDescription: p.violation_description
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
  const { lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status, bill_id } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO payments (lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status, bill_id, payment_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status || 'pending', bill_id, bill_id ? 'bill_payment' : null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ UPDATE PAYMENT (Approve/Reject) ============
router.put('/:id', async (req, res) => {
  const { lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status, approved_date, bill_id } = req.body;
  
  try {
    // Get current payment to check if status changed
    const currentPayment = await pool.query('SELECT * FROM payments WHERE id = $1', [req.params.id]);
    if (currentPayment.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    const oldStatus = currentPayment.rows[0].status;
    const newStatus = status;
    
    const result = await pool.query(
      `UPDATE payments SET lot_number = $1, resident_name = $2, bill_reference = $3, amount = $4, payment_date = $5, payment_method = $6, status = $7, approved_date = $8, bill_id = $9, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $10 RETURNING *`,
      [lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status, approved_date, bill_id, req.params.id]
    );
    
    // If payment is approved/paid, update the associated bill and violation status
    if ((newStatus === 'paid' || newStatus === 'approved') && oldStatus !== 'paid' && oldStatus !== 'approved') {
      // Update bill status to paid
      if (bill_id) {
        await pool.query(
          `UPDATE bills SET status = 'paid', date_paid = CURRENT_DATE, amount_paid = amount, payment_method = $1 WHERE id = $2`,
          [payment_method, bill_id]
        );
        
        // Get violation_id from bill and update violation status to settled
        const billResult = await pool.query('SELECT violation_id FROM bills WHERE id = $1', [bill_id]);
        if (billResult.rows.length > 0 && billResult.rows[0].violation_id) {
          await pool.query(
            `UPDATE violations SET status = 'settled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [billResult.rows[0].violation_id]
          );
        }
      } else if (bill_reference) {
        // Fallback: update by bill_reference
        await pool.query(
          `UPDATE bills SET status = 'paid', date_paid = CURRENT_DATE, amount_paid = amount, payment_method = $1 WHERE bill_reference = $2`,
          [payment_method, bill_reference]
        );
      }
    }
    
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