const bcrypt = require('bcryptjs');

// Generate password hash
const password = process.argv[2] || 'password123';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nSQL INSERT statement:');
console.log(`INSERT INTO users (email, password_hash, name, role) VALUES ('admin@example.com', '${hash}', 'Admin User', 'admin');`);

