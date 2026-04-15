"use client"

import ListPage from '../../shared/ListPage'

export default function ExpenseBillsListPage() {
  return (
    <ListPage
      title="Expense Bills"
      apiPath="/api/expense-bills"
      createPath="/KR-Thailand/Admin-Login/documents/expense-bills/create"
      columns={[
        { key: 'ebNo', label: 'EB No.' },
        { key: 'ebDate', label: 'Date' },
        { key: 'vendor_name', label: 'Vendor' },
        { key: 'category', label: 'Category' },
        { key: 'total_amount', label: 'Total Amount' },
        { key: 'payment_status', label: 'Payment Status' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/expense-bills/print', paramName: 'ebNo', idKey: 'ebID', newTab: true }}
    />
  )
}
