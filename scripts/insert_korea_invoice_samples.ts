import { pool } from '../lib/mysql'

async function insertSamples() {
  try {
    console.log('Inserting sample Korea HQ invoices...\n')

    // Sample invoices from Korea headquarters
    const samples = [
      {
        id: 'KR-INV-2026-001',
        invoiceNumber: 'KR-2026-0001',
        customer: 'K Energy Save (Thailand) Co., Ltd.',
        issueDate: '2026-03-01',
        dueDate: '2026-03-31',
        subtotal: 50000000,
        taxRate: 10.00,
        taxAmount: 5000000,
        totalAmount: 55000000,
        paymentStatus: 'unpaid',
        notes: 'Equipment purchase - Solar panels batch 1',
        salesContractNumber: 'SC-KR-2026-001'
      },
      {
        id: 'KR-INV-2026-002',
        invoiceNumber: 'KR-2026-0002',
        customer: 'K Energy Save (Thailand) Co., Ltd.',
        issueDate: '2026-03-10',
        dueDate: '2026-04-10',
        subtotal: 35000000,
        taxRate: 10.00,
        taxAmount: 3500000,
        totalAmount: 38500000,
        paymentStatus: 'partial',
        notes: 'Technical support & training services',
        salesContractNumber: 'SC-KR-2026-002'
      },
      {
        id: 'KR-INV-2026-003',
        invoiceNumber: 'KR-2026-0003',
        customer: 'K Energy Save (Thailand) Co., Ltd.',
        issueDate: '2026-02-15',
        dueDate: '2026-03-15',
        subtotal: 28000000,
        taxRate: 10.00,
        taxAmount: 2800000,
        totalAmount: 30800000,
        paymentStatus: 'overdue',
        notes: 'Battery storage systems',
        salesContractNumber: 'SC-KR-2026-003'
      },
      {
        id: 'KR-INV-2026-004',
        invoiceNumber: 'KR-2026-0004',
        customer: 'K Energy Save (Thailand) Co., Ltd.',
        issueDate: '2026-03-20',
        dueDate: '2026-04-20',
        subtotal: 42000000,
        taxRate: 10.00,
        taxAmount: 4200000,
        totalAmount: 46200000,
        paymentStatus: 'unpaid',
        notes: 'Inverter equipment - Q1 2026',
        salesContractNumber: 'SC-KR-2026-004'
      }
    ]

    for (const invoice of samples) {
      await pool.query(`
        INSERT INTO kr_hr_invoices (
          id, invoiceNumber, customer, issueDate, dueDate,
          subtotal, taxRate, taxAmount, totalAmount,
          paymentStatus, notes, salesContractNumber
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invoice.id,
        invoice.invoiceNumber,
        invoice.customer,
        invoice.issueDate,
        invoice.dueDate,
        invoice.subtotal,
        invoice.taxRate,
        invoice.taxAmount,
        invoice.totalAmount,
        invoice.paymentStatus,
        invoice.notes,
        invoice.salesContractNumber
      ])
      console.log(`✓ Inserted: ${invoice.invoiceNumber} - ${invoice.totalAmount.toLocaleString()} ₩ (${invoice.paymentStatus})`)
    }

    console.log('\n✅ Successfully inserted', samples.length, 'sample invoices!')

    // Verify
    const [result]: any = await pool.query(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN paymentStatus IN ('unpaid', 'partial', 'overdue') THEN 1 ELSE 0 END) as unpaid
      FROM kr_hr_invoices
    `)
    console.log('\nSummary:')
    console.log('  Total invoices:', result[0].total)
    console.log('  Unpaid invoices:', result[0].unpaid)

    process.exit(0)
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠ Sample data already exists')
      process.exit(0)
    }
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

insertSamples()
