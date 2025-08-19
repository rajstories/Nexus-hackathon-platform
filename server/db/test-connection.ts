import { query, closePool } from './sql';

async function testConnection() {
  try {
    console.log('Testing Azure SQL Database connection...');
    
    // Test basic connection
    const result = await query('SELECT 1 as test_value, GETUTCDATE() as current_time');
    console.log('✅ Connection successful!');
    console.log('Test query result:', result.recordset[0]);
    
    // Test if tables exist (after migration)
    try {
      const tableCheck = await query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        ORDER BY TABLE_NAME
      `);
      
      if (tableCheck.recordset.length > 0) {
        console.log('✅ Found tables:');
        tableCheck.recordset.forEach((row: any) => {
          console.log(`  - ${row.TABLE_NAME}`);
        });
        
        // Count records in each table
        const tables = ['users', 'events', 'tracks', 'teams', 'team_members', 'submissions', 'judges', 'scores', 'announcements'];
        
        for (const table of tables) {
          try {
            const countResult = await query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`  ${table}: ${countResult.recordset[0].count} records`);
          } catch (err) {
            console.log(`  ${table}: table not found or error`);
          }
        }
      } else {
        console.log('📝 No tables found. Run migrations first: npm run migrate:sql');
      }
    } catch (err) {
      console.log('📝 Tables not found. Run migrations first: npm run migrate:sql');
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Login failed')) {
        console.log('\n💡 Troubleshooting steps:');
        console.log('1. Check your Azure SQL credentials in environment variables');
        console.log('2. Ensure the database exists');
        console.log('3. Verify the user has access to the database');
      } else if (error.message.includes('Cannot connect')) {
        console.log('\n💡 Troubleshooting steps:');
        console.log('1. Check your server name and ensure it includes .database.windows.net');
        console.log('2. Verify firewall rules allow your IP address');
        console.log('3. Check if the server exists and is running');
      }
    }
    
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testConnection();
}

export { testConnection };