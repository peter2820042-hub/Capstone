// src/backend/config/db.js
import pg from 'pg';

const { Pool } = pg;

// Use environment variables for configuration
const pool = new Pool({
  user: process.env.DATABASE_USER || 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  database: process.env.DATABASE_NAME || 'sentrina_db',
  password: process.env.DATABASE_PASSWORD || 'PMVinta_28',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
});

export default pool;