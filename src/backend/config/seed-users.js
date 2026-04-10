// Seed Script - Create 2 test resident accounts
import pool from '../config/db.js';
import bcrypt from 'bcrypt';

async function seedUsers() {
  const client = await pool.connect();
   
  try {
    // Hash passwords for test accounts
    const userPassword = await bcrypt.hash('user123', 10);
    
    // Delete all existing residents first
    await client.query(`DELETE FROM residents`);
    console.log('✅ All existing residents deleted');
    
    // Create only 2 resident accounts
    // Resident 1: Block 1, Lot 1
    await client.query(`
      INSERT INTO residents (username, password_hash, full_name, lot_number, block, phase, email, phone, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, ['resident_1', userPassword, 'Juan Dela Cruz', '1', '1', '1', 'juan@email.com', '09123456789', 'homeowner', 'active']);
    
    // Resident 2: Block 1, Lot 2
    await client.query(`
      INSERT INTO residents (username, password_hash, full_name, lot_number, block, phase, email, phone, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, ['resident_2', userPassword, 'Maria Santos', '2', '1', '1', 'maria@email.com', '09123456790', 'homeowner', 'active']);
    
    console.log('✅ 2 Resident accounts created');
    console.log('\nTest Credentials:');
    console.log('  Admin:   username: peter,    password: admin123');
    console.log('  Staff:   username: john,      password: staff123');
    console.log('  Resident 1: username: resident_1, password: user123 (Block 1, Lot 1)');
    console.log('  Resident 2: username: resident_2, password: user123 (Block 1, Lot 2)');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedUsers();
