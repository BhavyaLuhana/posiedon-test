const Database = require('better-sqlite3');
const db = new Database('./planposeidon.db');

const columns = db.prepare("PRAGMA table_info(users)").all();
const existingNames = columns.map(c => c.name);

const toAdd = [
  { name: 'resetToken', def: 'TEXT' },
  { name: 'resetTokenExpiry', def: 'TEXT' },
];

toAdd.forEach(col => {
  if (existingNames.includes(col.name)) {
    console.log(`${col.name} already exists — skipping.`);
  } else {
    db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.def}`);
    console.log(`✅ Added ${col.name} column.`);
  }
});

db.close();