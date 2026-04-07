// Database Migration Script - Creates all required tables for Sentrina
import pool from './db.js';

async function createTables() {
  const client = await pool.connect();
  
  try {
    // Table 1: admins
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        position VARCHAR(100),
        profile_image TEXT,
        status VARCHAR(50) DEFAULT 'active',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "admins" created');

    // Table 2: staffs
    await client.query(`
      CREATE TABLE IF NOT EXISTS staffs (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        position VARCHAR(100),
        profile_image TEXT,
        status VARCHAR(50) DEFAULT 'active',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "staffs" created');

    // Table 3: residents (homeowners)
    await client.query(`
      CREATE TABLE IF NOT EXISTS residents (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        lot_number VARCHAR(50),
        block VARCHAR(50),
        phase VARCHAR(50),
        email VARCHAR(255),
        phone VARCHAR(50),
        profile_image TEXT,
        role VARCHAR(50) DEFAULT 'homeowner',
        status VARCHAR(50) DEFAULT 'active',
        date_registered DATE DEFAULT CURRENT_DATE,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "residents" created');

    // Table 2: violations
    await client.query(`
      CREATE TABLE IF NOT EXISTS violations (
        id SERIAL PRIMARY KEY,
        lot_number VARCHAR(50),
        resident_name VARCHAR(255),
        violation_type VARCHAR(100),
        description TEXT,
        date_issued DATE DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'pending',
        penalty DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "violations" created');

    // Table 3: bills (for billing)
    await client.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        lot_number VARCHAR(50),
        resident_name VARCHAR(255),
        bill_type VARCHAR(100),
        amount DECIMAL(10,2) NOT NULL,
        due_date DATE,
        status VARCHAR(50) DEFAULT 'unpaid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "bills" created');

    // Table 4: payments
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        lot_number VARCHAR(50),
        resident_name VARCHAR(255),
        bill_reference VARCHAR(100),
        amount DECIMAL(10,2) NOT NULL,
        payment_date DATE DEFAULT CURRENT_DATE,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        approved_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "payments" created');

    // Table 5: audit_logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(255),
        user_role VARCHAR(50),
        action VARCHAR(100),
        module VARCHAR(100),
        description TEXT,
        ip_address VARCHAR(50),
        status VARCHAR(50) DEFAULT 'success',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "audit_logs" created');

    // Table 7a: admins (admin login accounts)
    const adminTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admins'
      )
    `);

    if (!adminTableExists.rows[0].exists) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        )
      `);
      console.log('✅ Table "admins" created');
    } else {
      console.log('📋 Table "admins" already exists, adding columns if needed...');
      try {
        await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE`);
        await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
        await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)`);
        await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'`);
        await client.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`);
      } catch (_) { /* columns may exist */ }
    }

    // Table 7b: staff (staff login accounts)
    const staffTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'staffs'
      )
    `);

    if (!staffTableExists.rows[0].exists) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS staffs (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          position VARCHAR(100) DEFAULT 'staff',
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP
        )
      `);
      console.log('✅ Table "staffs" created');
    } else {
      console.log('📋 Table "staffs" already exists, adding columns if needed...');
      try {
        await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE`);
        await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
        await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)`);
        await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS position VARCHAR(100)`);
        await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'`);
        await client.query(`ALTER TABLE staffs ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`);
      } catch (_) { /* columns may exist */ }
    }

    // Add login columns to residents table (for homeowner login)
    // Residents = Homeowners = Users for login
    console.log('📋 Adding login columns to residents table...');
    try {
      await client.query(`ALTER TABLE residents ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE`);
      await client.query(`ALTER TABLE residents ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
      await client.query(`ALTER TABLE residents ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`);
      console.log('✅ Login columns added to residents table');
    } catch (_) { /* columns may exist */ }

    // Insert default admin account
    await client.query(`
      INSERT INTO admins (username, email, password_hash, full_name, status) VALUES
      ('admin', 'admin@sentrina.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Administrator', 'active')
      ON CONFLICT (username) DO NOTHING
    `);
    console.log('✅ Default admin account inserted');

    // Insert default staff account
    await client.query(`
      INSERT INTO staffs (username, email, password_hash, full_name, position, status) VALUES
      ('staff', 'staff@sentrina.com', '$2a$10$KvTqM9uLOickgx2ZMRZoMyeLJZAacfl7p92ldGxad68LJZdL17lhWy', 'Staff Member', 'General Staff', 'active')
      ON CONFLICT (username) DO NOTHING
    `);
    console.log('✅ Default staff account inserted');

    // Table 6: notifications (for user notifications)
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255),
        message TEXT,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "notifications" created');

    // Insert sample data
    console.log('\n📝 Inserting sample data...');
    
    // Sample residents
    await client.query(`
      INSERT INTO residents (full_name, lot_number, block, email, phone, role, status) VALUES
      ('Juan dela Cruz', '101', 'A', 'juan@example.com', '091234567890', 'homeowner', 'active'),
      ('Maria Santos', '102', 'A', 'maria@example.com', '091234567891', 'homeowner', 'active'),
      ('Pedro Garcia', '201', 'B', 'pedro@example.com', '091234567892', 'homeowner', 'active'),
      ('Ana Reyes', '202', 'B', 'ana@example.com', '091234567893', 'homeowner', 'active')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample residents inserted');

    // Sample violations
    await client.query(`
      INSERT INTO violations (lot_number, resident_name, violation_type, description, date_issued, status, penalty) VALUES
      ('101', 'Juan dela Cruz', 'Noise Violation', 'Loud music after 10 PM', '2026-03-15', 'pending', 500.00),
      ('102', 'Maria Santos', 'Illegal Parking', 'Parked in front of fire exit', '2026-03-20', 'settled', 300.00),
      ('201', 'Pedro Garcia', 'Garbage Violation', 'Improper waste disposal', '2026-03-25', 'pending', 200.00)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample violations inserted');

    // Sample bills
    await client.query(`
      INSERT INTO bills (lot_number, resident_name, bill_type, amount, due_date, status) VALUES
      ('101', 'Juan dela Cruz', 'Association Dues', 1500.00, '2026-04-15', 'unpaid'),
      ('102', 'Maria Santos', 'Association Dues', 1500.00, '2026-04-15', 'paid'),
      ('201', 'Pedro Garcia', 'Water Bill', 350.00, '2026-04-10', 'unpaid'),
      ('202', 'Ana Reyes', 'Association Dues', 1500.00, '2026-04-15', 'overdue')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample bills inserted');

    // Sample payments
    await client.query(`
      INSERT INTO payments (lot_number, resident_name, bill_reference, amount, payment_date, payment_method, status) VALUES
      ('102', 'Maria Santos', 'BILL-102-001', 1500.00, '2026-04-01', 'GCash', 'approved'),
      ('101', 'Juan dela Cruz', 'BILL-101-001', 1500.00, '2026-04-05', 'Cash', 'pending')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample payments inserted');

    // Sample audit logs
    await client.query(`
      INSERT INTO audit_logs (user_name, user_role, action, module, description, status) VALUES
      ('admin', 'admin', 'Login', 'Authentication', 'Admin logged in successfully', 'success'),
      ('staff', 'staff', 'View', 'Residents', 'Staff viewed residents list', 'success'),
      ('admin', 'admin', 'Create', 'Billing', 'Admin created new bill', 'success')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample audit logs inserted');

    // Show all tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('\n📋 All tables in database:', tables.rows.map(r => r.table_name));

    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();