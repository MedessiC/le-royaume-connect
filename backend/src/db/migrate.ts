import fs from 'fs';
import path from 'path';
import { query } from './connection.js';

export async function runMigrations() {
  try {
    console.log('🔄 Running migrations...');

    // Create migrations tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Get all migration files
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const fileName = path.basename(file, '.sql');
      
      // Check if migration already ran
      const result = await query(
        'SELECT * FROM migrations WHERE name = $1',
        [fileName]
      );

      if (result.rows.length === 0) {
        console.log(`⏳ Running migration: ${fileName}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        await query(sql);
        await query('INSERT INTO migrations (name) VALUES ($1)', [fileName]);
        console.log(`✅ Completed: ${fileName}`);
      }
    }

    console.log('✨ All migrations completed!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}
