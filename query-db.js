import pool from './src/backend/config/db.js';

async function runQuery() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node query-db.js "YOUR SQL QUERY"');
    console.log('Example: node query-db.js "SELECT * FROM residents"');
    console.log('');
    console.log('Or use interactive mode: node query-db.js --interactive');
    process.exit(1);
  }

  if (args[0] === '--interactive' || args[0] === '-i') {
    // Interactive mode
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('🔍 Interactive SQL Query Mode');
    console.log('Type your SQL query and press Enter (or type "exit" to quit)\n');

    const askQuery = () => {
      rl.question('SQL> ', async (query) => {
        if (query.trim().toLowerCase() === 'exit') {
          rl.close();
          process.exit(0);
        }

        if (!query.trim()) {
          askQuery();
          return;
        }

        try {
          const result = await pool.query(query);
          console.log(`\n✅ Success! ${result.rows.length} row(s) returned\n`);
          if (result.rows.length > 0) {
            console.log(result.rows);
          }
          console.log('');
        } catch (err) {
          console.error(`\n❌ Error: ${err.message}\n`);
        }

        askQuery();
      });
    };

    askQuery();
  } else {
    // Single query mode
    const query = args.join(' ');
    try {
      const result = await pool.query(query);
      console.log(`✅ Success! ${result.rows.length} row(s):\n`);
      console.log(result.rows);
    } catch (err) {
      console.error('❌ Error:', err.message);
      process.exit(1);
    }
  }
}

runQuery();
