import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sentrina_db',
  password: 'PMVinta_28',
  port: 5432,
});

async function clearAuditLogs() {
  try {
    await pool.query('DELETE FROM audit_logs');
    await pool.query('ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1');
    console.log('Audit logs cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

clearAuditLogs();