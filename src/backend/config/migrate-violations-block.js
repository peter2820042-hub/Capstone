// Migration: Add block column to violations table
import pool from '../config/db.js';

async function migrate() {
  const client = await pool.connect();
  try {
    // Check if column exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'violations' AND column_name = 'block'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add block column
      await client.query(`
        ALTER TABLE violations ADD COLUMN block VARCHAR(50)
      `);
      console.log('✅ Added block column to violations table');
    } else {
      console.log('ℹ️  block column already exists in violations table');
    }
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();