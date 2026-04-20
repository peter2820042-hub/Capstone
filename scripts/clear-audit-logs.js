import pool from '../src/backend/config/db.js';

async function clearAuditLogs() {
  const client = await pool.connect();
  
  try {
    // Get current count
    const countResult = await client.query('SELECT COUNT(*) AS current_count FROM audit_logs');
    console.log(`Current audit log count: ${countResult.rows[0].current_count}`);
    
    // Delete all audit logs
    await client.query('DELETE FROM audit_logs');
    console.log('All audit logs deleted.');
    
    // Reset the sequence
    await client.query('ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1');
    console.log('Sequence restarted at 1.');
    
    // Insert a system log entry
    await client.query(
      `INSERT INTO audit_logs (user_name, user_role, action, module, description, ip_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ['System', 'admin', 'Clear', 'Audit Logs', 'All audit logs have been cleared from the database', '127.0.0.1', 'success']
    );
    
    // Verify table is empty (excluding the new log entry)
    const remainingResult = await client.query('SELECT COUNT(*) AS remaining_count FROM audit_logs');
    console.log(`Remaining audit log count: ${remainingResult.rows[0].remaining_count}`);
    
    console.log('✅ Audit logs cleared successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

clearAuditLogs();