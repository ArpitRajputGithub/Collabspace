const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

const runMigrations = async () => {
  try {
    console.log('🚀 Starting database migrations...');

    // Create migrations table to track what's been run
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Get already executed migrations
    const executedResult = await pool.query('SELECT filename FROM migrations ORDER BY id');
    const executedMigrations = executedResult.rows.map(row => row.filename);

    // Run pending migrations
    for (const filename of migrationFiles) {
      if (executedMigrations.includes(filename)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }

      console.log(`⚡ Executing ${filename}...`);
      
      const filePath = path.join(migrationsDir, filename);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
        await pool.query('COMMIT');
        console.log(`✅ Migration ${filename} completed`);
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run migrations if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
