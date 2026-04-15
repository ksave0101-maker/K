import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const type = new URL(req.url).searchParams.get('type')

    if (type === 'purchase') {
      const [rows]: any = await pool.query(
        `SELECT doc_type, COUNT(*) as count, SUM(total) as total FROM acc_purchase_orders GROUP BY doc_type`)
      return NextResponse.json({ ok: true, data: rows })
    }

    if (type === 'sales') {
      const [rows]: any = await pool.query(
        `SELECT doc_type, COUNT(*) as count, SUM(total) as total FROM acc_sales_invoices GROUP BY doc_type`)
      return NextResponse.json({ ok: true, data: rows })
    }

    if (type === 'inventory') {
      const [rows]: any = await pool.query(
        `SELECT p.id, p.code, p.name_th, p.name_en, p.unit, p.qty_onhand, p.cost_price, p.sale_price
         FROM acc_products p WHERE p.is_active=1 ORDER BY p.code`)
      return NextResponse.json({ ok: true, data: rows })
    }

    if (type === 'ar-ap') {
      const [ar]: any = await pool.query(
        `SELECT si.customer_id, c.name_th as name, SUM(si.total - si.paid_amount) as balance
         FROM acc_sales_invoices si LEFT JOIN acc_customers c ON si.customer_id=c.id
         WHERE si.status != 'paid' GROUP BY si.customer_id, c.name_th HAVING balance > 0`)
      const [ap]: any = await pool.query(
        `SELECT po.supplier_id, s.name_th as name, SUM(po.total) as balance
         FROM acc_purchase_orders po LEFT JOIN acc_suppliers s ON po.supplier_id=s.id
         WHERE po.status != 'paid' GROUP BY po.supplier_id, s.name_th HAVING balance > 0`)
      return NextResponse.json({ ok: true, data: { receivables: ar, payables: ap } })
    }

    if (type === 'balance-sheet') {
      // Get all chart of accounts
      const [coa]: any = await pool.query(
        `SELECT code, name_th, name_en, account_type, sub_type FROM acc_chart_of_accounts WHERE is_active=1 ORDER BY code`)

      // Get journal-based balances (posted entries only)
      const [journal]: any = await pool.query(
        `SELECT jl.acc_code, SUM(jl.debit) as total_debit, SUM(jl.credit) as total_credit
         FROM acc_journal_lines jl
         JOIN acc_journal_entries je ON jl.entry_id=je.id
         WHERE je.status='posted'
         GROUP BY jl.acc_code`)
      const journalMap: Record<string, { debit: number; credit: number }> = {}
      for (const j of journal) journalMap[j.acc_code] = { debit: Number(j.total_debit) || 0, credit: Number(j.total_credit) || 0 }

      // Calculate from transaction tables for accounts with no journal entries
      // 1100 Cash: sum of bank account balances (type=current) + payment vouchers
      const [bankRows]: any = await pool.query(
        `SELECT COALESCE(SUM(balance),0) as total FROM acc_bank_accounts WHERE is_active=1`)
      const cashBalance = Number(bankRows[0]?.total) || 0

      // 1200 AR: unpaid sales invoices
      const [arRows]: any = await pool.query(
        `SELECT COALESCE(SUM(total - paid_amount),0) as total FROM acc_sales_invoices WHERE status NOT IN ('paid','cancelled')`)
      const arBalance = Number(arRows[0]?.total) || 0

      // 1300 Inventory: products qty * cost
      const [invRows]: any = await pool.query(
        `SELECT COALESCE(SUM(qty_onhand * cost_price),0) as total FROM acc_products WHERE is_active=1`)
      const invBalance = Number(invRows[0]?.total) || 0

      // 2100 AP: unpaid purchase orders
      const [apRows]: any = await pool.query(
        `SELECT COALESCE(SUM(total),0) as total FROM acc_purchase_orders WHERE status NOT IN ('paid','cancelled')`)
      const apBalance = Number(apRows[0]?.total) || 0

      // Map transaction-derived balances to account codes
      const txnMap: Record<string, number> = {
        '1100': cashBalance, '1110': 0, // bank deposit included in cash
        '1200': arBalance,
        '1300': invBalance,
        '2100': apBalance,
      }

      // Build result with computed balances
      const result = coa.map((acc: any) => {
        const jb = journalMap[acc.code]
        let balance = 0
        if (jb) {
          // From journal: assets/expenses = debit-credit, liabilities/equity/income = credit-debit
          if (acc.account_type === 'asset' || acc.account_type === 'expense') {
            balance = jb.debit - jb.credit
          } else {
            balance = jb.credit - jb.debit
          }
        }
        // Add transaction-derived balance if no journal entry for this account
        if (!jb && txnMap[acc.code] !== undefined) {
          balance = txnMap[acc.code]
        }
        return {
          code: acc.code, name_th: acc.name_th, name_en: acc.name_en,
          account_type: acc.account_type, sub_type: acc.sub_type, balance,
        }
      })
      return NextResponse.json({ ok: true, data: result })
    }

    if (type === 'income-statement') {
      const [rows]: any = await pool.query(
        `SELECT coa.account_type, coa.code, coa.name_th, coa.name_en,
                SUM(jl.debit) as total_debit, SUM(jl.credit) as total_credit
         FROM acc_journal_lines jl
         JOIN acc_chart_of_accounts coa ON jl.acc_code=coa.code
         JOIN acc_journal_entries je ON jl.entry_id=je.id
         WHERE je.status='posted' AND coa.account_type IN ('income','expense')
         GROUP BY coa.account_type, coa.code, coa.name_th, coa.name_en
         ORDER BY coa.code`)
      return NextResponse.json({ ok: true, data: rows })
    }

    if (type === 'cashflow') {
      const [rows]: any = await pool.query(
        `SELECT method, voucher_type, COUNT(*) as count, SUM(amount) as total
         FROM acc_payment_vouchers WHERE status='posted'
         GROUP BY method, voucher_type`)
      return NextResponse.json({ ok: true, data: rows })
    }

    return NextResponse.json({ ok: false, error: 'Missing type parameter. Use: purchase, sales, inventory, ar-ap, balance-sheet, income-statement, cashflow' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
