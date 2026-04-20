// ============ EXPORT AUDIT LOGS TO CSV ============
// Export all audit logs from database to a CSV file

import fs from 'fs';
import pool from '../src/backend/config/db.js';

async function exportAuditLogs() {
  try {
    // Get all audit logs
    const result = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    const logs = result.rows;

    console.log(`Found ${logs.length} audit logs in the database`);

    if (logs.length === 0) {
      console.log('No audit logs to export.');
      return;
    }

    // CSV Headers
    const headers = ['id', 'user_name', 'user_role', 'action', 'module', 'description', 'ip_address', 'profile_image', 'status', 'timestamp'];
    
    // Create CSV content
    const csvRows = [headers.join(',')];
    
    for (const log of logs) {
      const row = headers.map(header => {
        const value = log[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    
    // Write to file
    const filename = `audit-logs-export-${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(filename, csvContent, 'utf8');
    
    console.log(`Successfully exported ${logs.length} audit logs to ${filename}`);
    
  } catch (error) {
    console.error('Error exporting audit logs:', error);
  } finally {
    await pool.end();
  }
}

exportAuditLogs();