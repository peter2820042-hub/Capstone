// Migration Script - Add missing columns to existing tables
import pool from '../config/db.js';

async function migrateTables() {
  const client = await pool.connect();
  
  try {
    // Add columns to bills table
    try {
      await client.query(`ALTER TABLE bills ADD COLUMN IF NOT EXISTS block VARCHAR(50)`);
      console.log('✅ Added block column to bills');
    } catch (e) { /* might exist */ }
    
    // Add columns to violations table
    try {
      await client.query(`ALTER TABLE violations ADD COLUMN IF NOT EXISTS block VARCHAR(50)`);
      console.log('✅ Added block column to violations');
    } catch (e) { /* might exist */ }
    
    try {
      await client.query(`ALTER TABLE violations ADD COLUMN IF NOT EXISTS lot_number VARCHAR(50)`);
      console.log('✅ Added lot_number column to violations');
    } catch (e) { /* might exist */ }

    // Add profile_image column to audit_logs table
    try {
      await client.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS profile_image TEXT`);
      console.log('✅ Added profile_image column to audit_logs');
    } catch (e) { /* might exist */ }
    
    // Add status column to notifications table
    try {
      await client.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'unread'`);
      console.log('✅ Added status column to notifications');
    } catch (e) { /* might exist */ }
    
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

    // Add columns to bills table
    try {
      await client.query(`ALTER TABLE bills ADD COLUMN IF NOT EXISTS bill_reference VARCHAR(100)`);
      console.log('✅ Added bill_reference column to bills');
    } catch (e) { /* might exist */ }

    try {
      await client.query(`ALTER TABLE bills ADD COLUMN IF NOT EXISTS billing_period VARCHAR(100)`);
      console.log('✅ Added billing_period column to bills');
    } catch (e) { /* might exist */ }

    try {
      await client.query(`ALTER TABLE bills ADD COLUMN IF NOT EXISTS date_paid DATE`);
      console.log('✅ Added date_paid column to bills');
    } catch (e) { /* might exist */ }

    try {
      await client.query(`ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)`);
      console.log('✅ Added payment_method column to bills');
    } catch (e) { /* might exist */ }

    try {
      await client.query(`ALTER TABLE bills ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2)`);
      console.log('✅ Added amount_paid column to bills');
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
