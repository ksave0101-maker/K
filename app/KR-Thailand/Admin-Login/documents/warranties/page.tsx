"use client"

import ListPage from '../../shared/ListPage'

export default function WarrantiesListPage() {
  return (
    <ListPage
      title="Warranties"
      apiPath="/api/warranties"
      createPath="/KR-Thailand/Admin-Login/documents/warranties/create"
      columns={[
        { key: 'wtNo', label: 'Warranty No.' },
        { key: 'wtDate', label: 'Date' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'product_name', label: 'Product' },
        { key: 'serial_number', label: 'Serial No.' },
        { key: 'warranty_end_date', label: 'Expiry Date' },
        { key: 'status', label: 'Status' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/warranties/print', paramName: 'wcNo', idKey: 'wcID', newTab: true }}
    />
  )
}
