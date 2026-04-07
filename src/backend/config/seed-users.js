// Seed Script - Create test user accounts
import pool from '../config/db.js';
import bcrypt from 'bcrypt';

async function seedUsers() {
  const client = await pool.connect();
  
  try {
    // Hash passwords for test accounts
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    
    // Create Admin account (without position column)
    await client.query(`
      INSERT INTO admins (username, password_hash, full_name, email, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', adminPassword, 'Administrator', 'admin@sentrina.com', '09123456789', 'active']);
    console.log('✅ Admin account created (username: admin, password: admin123)');
    
    // Create Staff account
    await client.query(`
      INSERT INTO staffs (username, password_hash, full_name, email, phone, position, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username) DO NOTHING
    `, ['staff', staffPassword, 'Staff Member', 'staff@sentrina.com', '09123456790', 'Staff', 'active']);
    console.log('✅ Staff account created (username: staff, password: staff123)');
    
    // Create Resident account
    await client.query(`
      INSERT INTO residents (username, password_hash, full_name, lot_number, block, email, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (username) DO NOTHING
    `, ['resident1', userPassword, 'John Doe', '101', 'A', 'john.doe@email.com', '09123456791', 'active']);
    console.log('✅ Resident account created (username: resident1, password: user123)');
    
    // Create another Resident account
    await client.query(`
      INSERT INTO residents (username, password_hash, full_name, lot_number, block, email, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (username) DO NOTHING
    `, ['resident2', userPassword, 'Jane Smith', '202', 'B', 'jane.smith@email.com', '09123456792', 'active']);
    console.log('✅ Resident account created (username: resident2, password: user123)');
    
    console.log('\n🎉 All test accounts created successfully!');
    console.log('\nTest Credentials:');
    console.log('  Admin:   username: admin,    password: admin123');
    console.log('  Staff:   username: staff,    password: staff123');
    console.log('  Resident: username: resident1, password: user123');
    console.log('  Resident: username: resident2, password: user123');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedUsers();
