// Clear Bills Data Script
// Run this to delete all data from the bills table

import pool from './db.js';

async function clearBills() {
  const client = await pool.connect();
  
  try {
    // Delete all data from bills table
    const result = await client.query('DELETE FROM bills');
    console.log(`✅ Deleted ${result.rowCount} bills from the table`);
    
    // Reset the serial ID sequence to start from 1
    await client.query("SELECT setval('bills_id_seq', 1, false)");
    console.log('✅ Bills ID sequence reset to 1');
    
    console.log('\n🎉 All bills data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing bills:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

clearBills();