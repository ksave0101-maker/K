"use client"

import ListPage from '../../shared/ListPage'

export default function ProductionOrdersListPage() {
  return (
    <ListPage
      title="Production Orders"
      apiPath="/api/production-orders"
      createPath="/KR-Thailand/Admin-Login/documents/production-orders/create"
      columns={[
        { key: 'pdoNo', label: 'PDO No.' },
        { key: 'poDate', label: 'Date' },
        { key: 'product_name', label: 'Product' },
        { key: 'quantity_ordered', label: 'Quantity' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/production-orders/print', paramName: 'pdoID', idKey: 'pdoID', newTab: true }}
    />
  )
}
