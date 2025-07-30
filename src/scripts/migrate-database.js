const Database = require('better-sqlite3');
const path = require('path');

// Migration script to remove unique constraint from predictions table
function migrateDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'predictions.db');
  const db = new Database(dbPath);

  console.log('🔄 Starting database migration...');

  try {
    // Begin transaction
    db.exec('BEGIN TRANSACTION');

    // Create new table without unique constraint
    db.exec(`
      CREATE TABLE IF NOT EXISTS prediction_verdicts_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        prediction_date TEXT NOT NULL,
        verdict TEXT NOT NULL CHECK (verdict IN ('UP', 'DOWN', 'NEUTRAL')),
        confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
        reasoning TEXT NOT NULL,
        market_context TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        actual_price REAL,
        actual_date TEXT,
        accuracy BOOLEAN,
        profit_loss REAL,
        performance_notes TEXT,
        entry REAL,
        tp REAL,
        sl REAL,
        timeframe TEXT,
        style TEXT
      )
    `);

    // Copy data from old table to new table
    db.exec(`
      INSERT INTO prediction_verdicts_new 
      SELECT * FROM prediction_verdicts
    `);

    // Drop old table
    db.exec('DROP TABLE prediction_verdicts');

    // Rename new table
    db.exec('ALTER TABLE prediction_verdicts_new RENAME TO prediction_verdicts');

    // Recreate indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_id_symbol_date ON prediction_verdicts(user_id, symbol, prediction_date);
      CREATE INDEX IF NOT EXISTS idx_user_id_created_at ON prediction_verdicts(user_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_user_id_accuracy ON prediction_verdicts(user_id, accuracy);
    `);

    // Commit transaction
    db.exec('COMMIT');

    console.log('✅ Database migration completed successfully!');
    console.log('📊 Multiple predictions per symbol per day are now allowed.');

  } catch (error) {
    // Rollback on error
    db.exec('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase };