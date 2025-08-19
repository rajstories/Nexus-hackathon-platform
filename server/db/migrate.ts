import fs from 'fs';
import path from 'path';
import { query, closePool } from './sql';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(filePath, 'utf8');
      
      // Split by GO statements and execute each batch
      const batches = migrationSQL.split(/\nGO\s*\n/i);
      
      for (const batch of batches) {
        const trimmedBatch = batch.trim();
        if (trimmedBatch) {
          await query(trimmedBatch);
        }
      }
      
      console.log(`✅ Completed migration: ${file}`);
    }
    
    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };