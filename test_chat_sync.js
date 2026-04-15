// Chat Sync Test Script
// Run this in browser console to test localStorage synchronization

console.log('🧪 Chat Sync Test Started');

// Test 1: Check current messages
console.log('\n📋 Test 1: Current Messages in localStorage');
const departments = ['hr', 'production', 'international-market', 'domestic-market', 'quality-control', 'after-sales', 'maintenance', 'customers'];

departments.forEach(dept => {
  const key = `admin-chat-${dept}`;
  const data = localStorage.getItem(key);
  if (data) {
    try {
      const messages = JSON.parse(data);
      console.log(`  ✅ ${dept}: ${messages.length} messages`);
    } catch (e) {
      console.log(`  ❌ ${dept}: Invalid JSON`);
    }
  } else {
    console.log(`  ⚪ ${dept}: No messages`);
  }
});

// Test 2: Send a test message
console.log('\n📤 Test 2: Sending Test Message to HR department');
const testMessage = {
  id: Date.now().toString(),
  sender: 'Test User',
  role: 'user',
  text: 'This is a test message from console',
  timestamp: new Date().toISOString(),
  status: 'sent',
  department: 'hr'
};

const hrKey = 'admin-chat-hr';
const existingHR = localStorage.getItem(hrKey);
let hrMessages = [];

if (existingHR) {
  try {
    hrMessages = JSON.parse(existingHR);
  } catch (e) {
    console.log('  ⚠️ Could not parse existing messages');
  }
}

hrMessages.push(testMessage);
localStorage.setItem(hrKey, JSON.stringify(hrMessages));
console.log('  ✅ Test message sent to HR:', testMessage.text);
console.log('  📊 Total HR messages:', hrMessages.length);

// Test 3: Verify it was saved
console.log('\n🔍 Test 3: Verify Message Was Saved');
const verifyHR = localStorage.getItem(hrKey);
if (verifyHR) {
  try {
    const messages = JSON.parse(verifyHR);
    const lastMsg = messages[messages.length - 1];
    console.log('  ✅ Last message:', lastMsg.text);
    console.log('  ✅ Sender:', lastMsg.sender);
    console.log('  ✅ Role:', lastMsg.role);
  } catch (e) {
    console.log('  ❌ Failed to verify');
  }
}

// Test 4: Check for R&D response
console.log('\n💬 Test 4: Simulating R&D Admin Response');
const rdResponse = {
  id: (Date.now() + 1).toString(),
  sender: 'Research & Development',
  role: 'admin',
  text: 'Thank you for your message. This is an R&D response.',
  timestamp: new Date().toISOString(),
  status: 'read',
  department: 'hr'
};

hrMessages.push(rdResponse);
localStorage.setItem(hrKey, JSON.stringify(hrMessages));
console.log('  ✅ R&D response added');
console.log('  📊 Total messages now:', hrMessages.length);

// Test 5: Check message format
console.log('\n📋 Test 5: Message Format Verification');
hrMessages.forEach((msg, idx) => {
  const hasId = !!msg.id;
  const hasSender = !!msg.sender;
  const hasRole = !!msg.role;
  const hasText = !!msg.text;
  const hasTimestamp = !!msg.timestamp;

  const status = hasId && hasSender && hasRole && hasText && hasTimestamp ? '✅' : '❌';
  console.log(`  ${status} Message ${idx + 1}:`, {
    id: hasId,
    sender: hasSender,
    role: hasRole,
    text: hasText,
    timestamp: hasTimestamp
  });
});

console.log('\n🎯 Chat Sync Test Complete!');
console.log('📝 Instructions:');
console.log('  1. Open /admin-support/hr in one tab');
console.log('  2. Open /research-development/dashboard in another tab');
console.log('  3. Send messages and check console logs');
console.log('  4. Messages should sync within 2 seconds');
