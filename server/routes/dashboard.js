// ============ DASHBOARD ROUTES ============
// Dashboard statistics and data clearing endpoints

import express from 'express';
import pool from '../../src/backend/config/db.js';

const router = express.Router();

// ============ GET DASHBOARD STATS (Supports both /api/dashboard/stats and /api/dashboard-stats) ============
router.get('/stats', async (req, res) => {
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

// Legacy route for backward compatibility
router.get('', async (req, res) => {
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

// ============ CLEAR VIOLATIONS DATA ============
router.delete('/clear-violations', async (req, res) => {
  try {
    await pool.query('DELETE FROM violations');
    await pool.query('ALTER SEQUENCE violations_id_seq RESTART WITH 1');
    
    res.json({ success: true, message: 'Violations data cleared successfully' });
  } catch (error) {
    console.error('Error clearing violations:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ CLEAR AUDIT LOGS DATA ============
router.delete('/clear-audit-logs', async (req, res) => {
  try {
    await pool.query('DELETE FROM audit_logs');
    await pool.query('ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1');
    
    res.json({ success: true, message: 'Audit logs data cleared successfully' });
  } catch (error) {
    console.error('Error clearing audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ CLEAR ALL DATA (Admin only) ============
// Clear all data from tables (for testing/reset)
router.delete('/clear-all-data', async (req, res) => {
  // Authorization check: only admins can clear all data
  const authUser = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Only admins can clear all data' });
  }
  
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query('DELETE FROM payments');
      await client.query('DELETE FROM bills');
      await client.query('DELETE FROM violations');
      await client.query('DELETE FROM residents');
      await client.query('DELETE FROM audit_logs');
      
      // Reset sequences
      await client.query('ALTER SEQUENCE payments_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE bills_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE violations_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE residents_id_seq RESTART WITH 1');
      await client.query('ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1');
      
      await client.query('COMMIT');
      
      res.json({ success: true, message: 'All data cleared successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET PA CENTER FINANCIAL SUMMARY ============
// Combined financial summary from bills and payments (for both staff and admin)
router.get('/pa-center', async (req, res) => {
  try {
    // Get total billed from bills table
    const billedResult = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM bills');
    const totalBilled = parseFloat(billedResult.rows[0].total);
    
    // Get total paid from payments table (only approved payments)
    const paidResult = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = $1', ['approved']);
    const totalPaid = parseFloat(paidResult.rows[0].total);
    
    // Also get paid from bills table for comparison (bills marked as paid)
    const billsPaidResult = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE status = $1', ['paid']);
    const totalPaidFromBills = parseFloat(billsPaidResult.rows[0].total);
    
    // Get outstanding from bills (unpaid + overdue)
    const outstandingResult = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM bills WHERE status != $1', ['paid']);
    const outstanding = parseFloat(outstandingResult.rows[0].total);
    
    // Alternative outstanding calculation: Total Billed - Total Paid
    const outstandingAlt = totalBilled - totalPaid;
    
    // Get bill counts by status
    const paidBillsCount = await pool.query('SELECT COUNT(*) as count FROM bills WHERE status = $1', ['paid']);
    const unpaidBillsCount = await pool.query('SELECT COUNT(*) as count FROM bills WHERE status = $1', ['unpaid']);
    const overdueBillsCount = await pool.query('SELECT COUNT(*) as count FROM bills WHERE status = $1', ['overdue']);
    
    // Get payment counts by status
    const approvedPaymentsCount = await pool.query('SELECT COUNT(*) as count FROM payments WHERE status = $1', ['approved']);
    const pendingPaymentsCount = await pool.query('SELECT COUNT(*) as count FROM payments WHERE status = $1', ['pending']);
    const rejectedPaymentsCount = await pool.query('SELECT COUNT(*) as count FROM payments WHERE status = $1', ['rejected']);
    
    // Get violations count
    const totalViolations = await pool.query('SELECT COUNT(*) as count FROM violations');
    const pendingViolations = await pool.query('SELECT COUNT(*) as count FROM violations WHERE status = $1', ['pending']);
    
    res.json({
      // Financial totals
      totalBilled: totalBilled,
      totalPaid: totalPaid,
      totalPaidFromBills: totalPaidFromBills,
      outstanding: outstanding,
      outstandingAlt: outstandingAlt > 0 ? outstandingAlt : 0,
      // Bill counts
      billsCount: {
        paid: parseInt(paidBillsCount.rows[0].count),
        unpaid: parseInt(unpaidBillsCount.rows[0].count),
        overdue: parseInt(overdueBillsCount.rows[0].count),
        total: parseInt(paidBillsCount.rows[0].count) + parseInt(unpaidBillsCount.rows[0].count) + parseInt(overdueBillsCount.rows[0].count)
      },
      // Payment counts
      paymentsCount: {
        approved: parseInt(approvedPaymentsCount.rows[0].count),
        pending: parseInt(pendingPaymentsCount.rows[0].count),
        rejected: parseInt(rejectedPaymentsCount.rows[0].count)
      },
      // Violations counts
      violationsCount: {
        total: parseInt(totalViolations.rows[0].count),
        pending: parseInt(pendingViolations.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error fetching PA center financial summary:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;