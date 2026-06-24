const Database = require('better-sqlite3');
const db = new Database('./planposeidon.db');

// Check if the column already exists before trying to add it
const columns = db.prepare("PRAGMA table_info(users)").all();
const hasColumn = columns.some(col => col.name === 'setupComplete');

if (hasColumn) {
  console.log('setupComplete column already exists — nothing to do.');
} else {
  db.exec(`ALTER TABLE users ADD COLUMN setupComplete INTEGER NOT NULL DEFAULT 0`);
  console.log('✅ Added setupComplete column to users table.');
}

db.close();