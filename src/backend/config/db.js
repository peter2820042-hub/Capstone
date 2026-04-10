
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Lazy pool initialization - only create when first query is made
let pool = null;

const getPool = () => {
  if (!pool) {
    const dbPassword = process.env.DATABASE_PASSWORD;
    if (!dbPassword) {
      throw new Error('DATABASE_PASSWORD is required in .env file');
    }
    
    pool = new Pool({
      user: process.env.DATABASE_USER || 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      database: process.env.DATABASE_NAME || 'sentrina_db',
      password: dbPassword,
      port: parseInt(process.env.DATABASE_PORT) || 5432,
    });
    
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err.message);
    });
  }
  return pool;
};

export default {
  query: (...args) => getPool().query(...args),
  connect: () => getPool().connect(),
};
