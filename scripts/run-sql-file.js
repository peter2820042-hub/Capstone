import pool from '../src/backend/config/db.js';
import fs from 'fs';
import path from 'path';

async function runSqlFile() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/run-sql-file.js <sql-filename>');
    console.log('Example: node scripts/run-sql-file.js insert-blocks-1-16.sql');
    process.exit(1);
  }

  const sqlFile = args[0];
  const sqlPath = path.join(process.cwd(), 'sql', sqlFile);

  try {
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const client = await pool.connect();

    try {
      // Check if it's a SELECT query (returns rows) or modification query
      const trimmedSql = sql.trim().toUpperCase();
      const isSelect = trimmedSql.includes('SELECT');
      console.log('SQL type:', isSelect ? 'SELECT' : 'OTHER');
      
      if (isSelect) {
        const result = await client.query(sql);
        console.log('Query results:');
        console.log(JSON.stringify(result.rows, null, 2));
      } else {
        await client.query(sql);
        console.log(`✅ Successfully executed ${sqlFile}`);
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runSqlFile();
