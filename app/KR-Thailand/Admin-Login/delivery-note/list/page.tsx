"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Installation & Delivery — List"
      apiPath="/api/delivery-notes"
      createPath="/KR-Thailand/Admin-Login/delivery-note"
      columns={[
        { key: 'noteNo', label: 'Delivery No' },
        { key: 'date', label: 'Date' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'status', label: 'Status' }
      ]}
      link={{ columnKey: 'noteNo', path: '/KR-Thailand/Admin-Login/delivery-note', paramName: 'noteNo' }}
      print={{ path: '/KR-Thailand/Admin-Login/delivery-note', paramName: 'noteNo', idKey: 'noteNo', newTab: true }}
    />
  )
}
