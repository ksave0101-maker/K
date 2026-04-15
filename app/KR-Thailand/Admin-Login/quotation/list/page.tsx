"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Quotations — List"
      apiPath="/api/quotations"
      createPath="/KR-Thailand/Admin-Login/quotation"
      columns={[
        { key: 'quoteNo', label: 'Quote No' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'total', label: 'Total' },
        { key: 'status', label: 'Status' },
        { key: 'created_at', label: 'Created' }
      ]}
      link={{ columnKey: 'quoteNo', path: '/KR-Thailand/Admin-Login/quotation', paramName: 'quoteNo' }}
      print={{ path: '/KR-Thailand/Admin-Login/quotation/print', paramName: 'quoteID', idKey: 'quoteID', newTab: true }}
    />
  )
}
