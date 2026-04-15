import { pool } from '../lib/mysql'

async function updateFormat() {
  try {
    console.log('Updating Korea invoice number format...\n')

    // Update existing invoices to new format
    const updates = [
      { oldId: 'KR-INV-2026-001', newId: 'KR-INV-20260301-0001', oldNo: 'KR-2026-0001', newNo: 'KR-INV-20260301-0001' },
      { oldId: 'KR-INV-2026-002', newId: 'KR-INV-20260310-0001', oldNo: 'KR-2026-0002', newNo: 'KR-INV-20260310-0001' },
      { oldId: 'KR-INV-2026-003', newId: 'KR-INV-20260215-0001', oldNo: 'KR-2026-0003', newNo: 'KR-INV-20260215-0001' },
      { oldId: 'KR-INV-2026-004', newId: 'KR-INV-20260320-0001', oldNo: 'KR-2026-0004', newNo: 'KR-INV-20260320-0001' }
    ]

    for (const u of updates) {
      try {
        // Update kr_hr_invoices
        await pool.query(`
          UPDATE kr_hr_invoices
          SET id = ?, invoiceNumber = ?
          WHERE id = ?
        `, [u.newId, u.newNo, u.oldId])
        console.log(`✓ Updated: ${u.oldNo} → ${u.newNo}`)
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠ ${u.newNo} already exists, skipping...`)
        } else {
          console.error(`❌ Error updating ${u.oldNo}:`, err.message)
        }
      }
    }

    // Verify
    console.log('\n=== Current Invoices ===')
    const [invoices]: any = await pool.query(`
      SELECT id, invoiceNumber, issueDate
      FROM kr_hr_invoices
      ORDER BY created_at
    `)

    invoices.forEach((inv: any) => {
      console.log(`  ${inv.invoiceNumber || inv.id} (${inv.issueDate})`)
    })

    console.log('\n✅ Format update completed!')
    console.log('\nNew format: KR-INV-yyyymmdd-0001')
    console.log('Example: KR-INV-20260326-0001')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

updateFormat()
