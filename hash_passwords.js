// hash_passwords.js
const bcrypt = require('bcryptjs');

const passwords = [
  '018644',
  '00000',
  '42888',
  '4444',
  '64480',
  'team123~!',
  '6666',
  'zera0611',
  'Admin2026'
];

(async () => {
  for (const pw of passwords) {
    const hash = await bcrypt.hash(pw, 10);
    console.log(`${pw}: ${hash}`);
  }
})();
