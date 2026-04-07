// Migration Script - Add missing columns to existing tables
import pool from '../config/db.js';

async function migrateTables() {
  const client = await pool.connect();
  
  try {
    // Add columns to admins table
    try {
      await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE`);
      console.log('✅ Added username column to admins');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
      console.log('✅ Added password_hash column to admins');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
      console.log('✅ Added email column to admins');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);
      console.log('✅ Added phone column to admins');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS profile_image TEXT`);
      console.log('✅ Added profile_image column to admins');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`);
      console.log('✅ Added last_login column to admins');
    } catch (e) { /* might exist */ }

    // Add columns to staffs table
    try {
      await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE`);
      console.log('✅ Added username column to staffs');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
      console.log('✅ Added password_hash column to staffs');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
      console.log('✅ Added email column to staffs');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);
      console.log('✅ Added phone column to staffs');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS profile_image TEXT`);
      console.log('✅ Added profile_image column to staffs');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`);
      console.log('✅ Added last_login column to staffs');
    } catch (e) { /* might exist */ }

    // Add columns to residents table
    try {
      await client.query(`ALTER TABLE residents ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE`);
      console.log('✅ Added username column to residents');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE residents ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
      console.log('✅ Added password_hash column to residents');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE residents ADD COLUMN IF NOT EXISTS phase VARCHAR(50)`);
      console.log('✅ Added phase column to residents');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE residents ADD COLUMN IF NOT EXISTS profile_image TEXT`);
      console.log('✅ Added profile_image column to residents');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE residents ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`);
      console.log('✅ Added last_login column to residents');
    } catch (e) { /* might exist */ }

    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateTables();
