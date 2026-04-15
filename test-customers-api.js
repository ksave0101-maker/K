// Test script to verify customers API
const mysql = require('mysql2/promise');

async function testCustomersAPI() {
  try {
    const pool = mysql.createPool({
      host: '127.0.0.1',
      port: 3306,
      database: 'ksystem',
      user: 'ksystem',
      password: 'Ksave2025Admin',
      waitForConnections: true,
      connectionLimit: 5,
    });

    console.log('📊 Testing Customers API Query...\n');

    const [rows] = await pool.query(`
      SELECT cd.cusID, cd.fullname, cd.email, cd.phone, cd.company,
             cd.house_number, cd.moo, cd.tambon, cd.amphoe, cd.province, cd.postcode,
             cd.tax_id, cd.message, cd.created_by, cd.created_by_user_id, cd.created_at,
             ul.name as created_by_name, ul.userName as created_by_username
      FROM cus_detail cd
      LEFT JOIN user_list ul ON cd.created_by_user_id = ul.userId
      ORDER BY cd.fullname ASC
      LIMIT 100
    `);

    console.log('✅ Query successful!');
    console.log(`📈 Found ${rows.length} customers\n`);

    if (rows.length > 0) {
      console.log('Sample data:');
      rows.forEach((row, i) => {
        console.log(`${i + 1}. #${row.cusID} - ${row.fullname} (${row.email || 'no email'})`);
        console.log(`   Phone: ${row.phone || '-'}, Province: ${row.province || '-'}`);
        console.log(`   Created by: ${row.created_by_name || row.created_by || '-'}\n`);
      });
    }

    const response = { success: true, customers: rows };
    console.log('\n📦 API Response format:');
    console.log(`   success: ${response.success}`);
    console.log(`   customers: Array(${response.customers.length})`);

    await pool.end();
    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCustomersAPI();
