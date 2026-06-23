const Database = require('better-sqlite3'); 
const db = new Database('./planposeidon.db'); 
db.prepare("DELETE FROM users WHERE email = 'admin@gmail.com'").run();
console.log('deleted');