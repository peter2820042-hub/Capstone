// src/backend/scripts/init-db.js
import pool from '../config/db.js';

async function createDatabase() {
  const client = await pool.connect();
  
  try {
    // Create database if it doesn't exist
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'sentrina_db'
      AND pid <> pg_backend_pid();
    `);
    
    await client.query(`
      CREATE DATABASE sentrina_db
    `);
    
    console.log('Database "sentrina_db" created successfully!');
  } catch (error) {
    console.log('Database might already exist:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createDatabase();
