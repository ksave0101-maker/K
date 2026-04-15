"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Receipts — List"
      apiPath="/api/receipts"
      createPath="/KR-Thailand/Admin-Login/receipt"
      columns={[
        { key: 'receiptNo', label: 'Receipt No' },
        { key: 'receiptDate', label: 'Date' },
        { key: 'invoice_no', label: 'Invoice' },
        { key: 'status', label: 'Status' },
        { key: 'amount', label: 'Amount' }
      ]}
      link={{ columnKey: 'receiptNo', path: '/KR-Thailand/Admin-Login/receipt', paramName: 'receiptNo' }}
      print={{ path: '/KR-Thailand/Admin-Login/receipt/print', paramName: 'receiptID', idKey: 'receiptID', newTab: true }}
    />
  )
}
