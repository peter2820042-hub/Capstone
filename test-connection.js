import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

async function testConnection() {
  try {
    const pool = new Pool({
      user: process.env.DATABASE_USER || 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      database: process.env.DATABASE_NAME || 'sentrina_db',
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT) || 5432,
    });

    console.log('🔌 Connecting to PostgreSQL...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connection successful!');
    console.log('⏰ Server time:', result.rows[0].current_time);
    
    // List all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('\n📋 Tables in database:');
    tablesResult.rows.forEach((row, idx) => {
      console.log(`   ${idx + 1}. ${row.table_name}`);
    });
    
    await pool.end();
    console.log('\n✅ Connection closed');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testConnection();
