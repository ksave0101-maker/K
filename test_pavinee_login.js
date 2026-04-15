// Test login for user pavinee
const bcrypt = require('bcryptjs');

const testPassword = '018644';
const hashedPassword = '$2b$10$lwB8THfVh1I/N3KMIkJ8J.6sEiBOqvjnBsVO.Ivhv05hvTBpkMAEW';

(async () => {
  console.log('🧪 Testing password authentication for user: pavinee');
  console.log('📝 Plain text password:', testPassword);
  console.log('🔒 Hashed password:', hashedPassword);
  console.log('');

  const isMatch = await bcrypt.compare(testPassword, hashedPassword);

  if (isMatch) {
    console.log('✅ SUCCESS! Password matches correctly');
    console.log('✅ User "pavinee" can now login with password:', testPassword);
  } else {
    console.log('❌ FAILED! Password does not match');
  }
})();
