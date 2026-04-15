"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Tax Invoices — List"
      apiPath="/api/tax-invoices"
      createPath="/KR-Thailand/Admin-Login/tax-invoice"
      columns={[
        { key: 'taxNo', label: 'Tax Invoice No' },
        { key: 'taxDate', label: 'Date' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'total_amount', label: 'Total' },
        { key: 'status', label: 'Status' }
      ]}
      link={{ columnKey: 'taxNo', path: '/KR-Thailand/Admin-Login/tax-invoice', paramName: 'taxNo' }}
      print={{ path: '/KR-Thailand/Admin-Login/tax-invoice', paramName: 'taxNo', idKey: 'taxNo', newTab: true }}
    />
  )
}
