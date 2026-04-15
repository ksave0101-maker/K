// Shared utility for printing list/table reports

type PrintListOptions = {
  title: string
  titleTh?: string
  locale: 'en' | 'th'
  columns: Array<{ key: string; label: string; labelTh?: string }>
  data: any[]
  formatValue?: (key: string, value: any, row: any) => string
}

export function printList(options: PrintListOptions) {
  const { title, titleTh, locale, columns, data, formatValue } = options
  const T = (en: string, th: string) => locale === 'th' ? th : en
  const displayTitle = locale === 'th' && titleTh ? titleTh : title

  // Create print window
  const printWindow = window.open('', '_blank', 'width=1200,height=800')
  if (!printWindow) {
    alert(T('Please allow popups to print', 'กรุณาอนุญาตให้เปิดหน้าต่างใหม่เพื่อพิมพ์'))
    return
  }

  // Calculate totals for VAT
  const amountKeys = columns.filter(c =>
    /amount|total|price|value|cost|subtotal/i.test(c.key)
  ).map(c => c.key)

  let subtotal = 0
  if (amountKeys.length > 0) {
    data.forEach(row => {
      amountKeys.forEach(key => {
        const val = row?.[key]
        if (typeof val === 'number' && !isNaN(val)) {
          subtotal += val
        } else if (typeof val === 'string') {
          const num = parseFloat(val)
          if (!isNaN(num)) subtotal += num
        }
      })
    })
  }

  const vat = subtotal * 0.07
  const grandTotal = subtotal + vat
  const hasAmounts = subtotal > 0

  // Format value helper
  const formatCell = (key: string, value: any, row: any): string => {
    if (formatValue) {
      const custom = formatValue(key, value, row)
      if (custom !== null && custom !== undefined) return custom
    }

    // Handle null/undefined
    if (value === null || value === undefined) return '-'

    // Handle numbers
    if (typeof value === 'number') {
      const isId = /id$/i.test(key)
      const isAmount = /amount|total|price|value|cost/i.test(key)
      if (isAmount) {
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
      return isId ? String(value) : value.toFixed(2)
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? T('Yes', 'ใช่') : T('No', 'ไม่')
    }

    // Handle dates
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('_at')) {
      try {
        const d = new Date(value)
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')
        }
      } catch (_) {}
    }

    // Handle objects (try to extract name/username)
    if (typeof value === 'object' && value !== null) {
      if (key.toLowerCase().includes('created_by')) {
        return value.name || value.username || value.userName || JSON.stringify(value)
      }
      return JSON.stringify(value)
    }

    return String(value)
  }

  // Generate HTML content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${displayTitle} - ${T('Report', 'รายงาน')}</title>
      <style>
        @page {
          size: A4;
          margin: 1.8cm 2.5cm 1.8cm 2.5cm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: 100%;
          overflow: hidden !important;
        }
        /* Hide scrollbar */
        ::-webkit-scrollbar {
          display: none;
        }
        html {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        body {
          font-family: 'Sarabun', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 5px;
          font-size: 7px;
          max-width: 155mm;
          margin: 0 auto;
          background: white;
        }
        h1 {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 2px;
          color: #1e293b;
        }
        .subtitle {
          font-size: 7px;
          color: #64748b;
          margin-bottom: 6px;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 8px;
          color: #475569;
          padding: 4px 6px;
          background: #f8fafc;
          border-radius: 3px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 3px;
          font-size: 6px;
          table-layout: auto;
        }
        th, td {
          padding: 2px 3px;
          text-align: left;
          border: 1px solid #e2e8f0;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        th {
          background: #f1f5f9;
          font-weight: 600;
          color: #1e293b;
          font-size: 6px;
          white-space: nowrap;
        }
        tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        .badge {
          padding: 1px 6px;
          border-radius: 6px;
          font-size: 7px;
          font-weight: 600;
          display: inline-block;
        }
        .no-data {
          text-align: center;
          padding: 30px;
          color: #94a3b8;
          font-style: italic;
        }
        .summary {
          margin-top: 10px;
          border-top: 2px solid #1e293b;
          padding-top: 8px;
          display: flex;
          justify-content: flex-end;
        }
        .summary-table {
          width: 250px;
          border: none;
        }
        .summary-table td {
          border: none;
          padding: 4px 8px;
          font-size: 9px;
        }
        .summary-table .label {
          text-align: right;
          font-weight: 500;
          color: #475569;
        }
        .summary-table .value {
          text-align: right;
          font-weight: 600;
          color: #1e293b;
        }
        .summary-table .total-row {
          border-top: 2px solid #1e293b;
          background: #f1f5f9;
        }
        .summary-table .total-row td {
          font-size: 11px;
          font-weight: 700;
          color: #0f172a;
          padding-top: 6px;
          padding-bottom: 6px;
        }
        @media print {
          html, body {
            overflow: hidden !important;
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          ::-webkit-scrollbar {
            display: none !important;
          }
          body { padding: 0; max-width: 100%; }
          h1 { font-size: 11px; }
          th, td { padding: 2px 3px; font-size: 6px; }
          .meta { padding: 2px 4px; font-size: 6px; }
          .summary-table td { font-size: 7px; }
          .summary-table .total-row td { font-size: 9px; }
        }
      </style>
    </head>
    <body>
      <h1>${displayTitle}</h1>
      <div class="subtitle">${T('List Report', 'รายงานรายการ')}</div>
      <div class="meta">
        <div>${T('Total Records', 'จำนวนรายการทั้งหมด')}: <strong>${data.length}</strong></div>
        <div>${T('Printed', 'พิมพ์เมื่อ')}: <strong>${new Date().toLocaleString(locale === 'th' ? 'th-TH' : 'en-US')}</strong></div>
      </div>
      <table>
        <thead>
          <tr>
            ${columns.map(c => {
              const label = locale === 'th' && c.labelTh ? c.labelTh : c.label
              return `<th>${label}</th>`
            }).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.length === 0 ? `
            <tr>
              <td colspan="${columns.length}" class="no-data">
                ${T('No records found', 'ไม่พบข้อมูล')}
              </td>
            </tr>
          ` : data.map(row => `
            <tr>
              ${columns.map(c => {
                const value = row[c.key]
                const formatted = formatCell(c.key, value, row)
                const isAmount = /amount|total|price|value|cost/i.test(c.key)
                return `<td${isAmount ? ' style="text-align: right;"' : ''}>${formatted}</td>`
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${hasAmounts ? `
      <div class="summary">
        <table class="summary-table">
          <tr>
            <td class="label">${T('Subtotal', 'ยอดรวม')}:</td>
            <td class="value">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td class="label">${T('VAT 7%', 'ภาษีมูลค่าเพิ่ม 7%')}:</td>
            <td class="value">${vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr class="total-row">
            <td class="label">${T('Grand Total', 'ยอดรวมทั้งสิ้น')}:</td>
            <td class="value">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>
      ` : ''}
    </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()

  // Auto print after content loaded
  setTimeout(() => {
    printWindow.focus()
    printWindow.print()
  }, 250)
}

// Print button component (can be copied into pages)
export const PrintButtonHTML = `
<button
  onClick={handlePrintList}
  disabled={loading || data.length === 0}
  title="Print Report"
  style={{
    padding: '8px 16px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#0f172a',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s'
  }}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
  พิมพ์
</button>
`
