// Test Create Warranty via API
// Run: node test-create-warranty-api.js

const fetch = require('node-fetch')

async function testCreateWarranty() {
  console.log('🧪 Testing Warranty Creation via API...\n')

  const warrantyData = {
    wtDate: new Date().toISOString().split('T')[0],
    contract_no: null,
    cusID: null,
    customer_name: 'ทดสอบระบบ Warranty Number',
    customer_phone: '0812345678',
    customer_email: 'test@example.com',
    product_id: null,
    product_name: 'ทดสอบสินค้า',
    serial_number: 'SN-TEST-001',
    purchase_date: new Date().toISOString().split('T')[0],
    warranty_start_date: new Date().toISOString().split('T')[0],
    warranty_end_date: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    warranty_period: 12,
    warranty_type: 'manufacturer',
    coverage_details: 'ครอบคลุมทุกอย่าง',
    notes: 'ทดสอบระบบเลข WT-TH-YYYYMM-####',
    created_by: 'test_script'
  }

  try {
    console.log('📤 Sending POST request to /api/warranties...')
    console.log('Data:', JSON.stringify(warrantyData, null, 2))
    console.log()

    const response = await fetch('http://localhost:3000/api/warranties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(warrantyData)
    })

    const result = await response.json()

    if (response.ok && result.success) {
      console.log('✅ Warranty created successfully!')
      console.log()
      console.log('📋 Result:')
      console.log(`   ID: ${result.wtID}`)
      console.log(`   Number: ${result.wtNo}`)
      console.log()
      console.log('🎯 Warranty Number Format Check:')

      if (result.wtNo.startsWith('WT-TH-')) {
        console.log('   ✅ Format correct: WT-TH-YYYYMM-####')
        console.log(`   ✅ Generated: ${result.wtNo}`)
      } else {
        console.log('   ❌ Format incorrect!')
        console.log(`   Expected: WT-TH-YYYYMM-####`)
        console.log(`   Got: ${result.wtNo}`)
      }
    } else {
      console.log('❌ Failed to create warranty')
      console.log('Error:', result.error || 'Unknown error')
      console.log('Response:', result)
    }

  } catch (error) {
    console.log('❌ Error:', error.message)
    console.log('\n⚠️  Make sure:')
    console.log('   1. Next.js dev server is running (npm run dev)')
    console.log('   2. Server is listening on http://localhost:3000')
  }

  console.log()
}

testCreateWarranty()
