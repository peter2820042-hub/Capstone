// Script to update passwords in the database
import pool from '../../config/db.js';
import bcrypt from 'bcrypt';

async function updatePasswords() {
  const client = await pool.connect();
  
  try {
    // Generate new password hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);
    
    // Update admin password
    await client.query(
      'UPDATE admins SET password_hash = $1 WHERE username = $2',
      [adminHash, 'admin']
    );
    console.log('✅ Admin password updated');
    
    // Update staff password
    await client.query(
      'UPDATE staffs SET password_hash = $1 WHERE username = $2',
      [staffHash, 'staff']
    );
    console.log('✅ Staff password updated');
    
    console.log('\n Login credentials:');
    console.log('Admin: admin / admin123');
    console.log('Staff: staff / staff123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

updatePasswords();