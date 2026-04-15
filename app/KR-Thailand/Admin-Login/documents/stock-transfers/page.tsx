"use client"

import ListPage from '../../shared/ListPage'

export default function StockTransfersListPage() {
  return (
    <ListPage
      title="Stock Transfers"
      apiPath="/api/stock-transfers"
      createPath="/KR-Thailand/Admin-Login/documents/stock-transfers/create"
      columns={[
        { key: 'stNo', label: 'ST No.' },
        { key: 'stDate', label: 'Date' },
        { key: 'from_warehouse', label: 'From' },
        { key: 'to_warehouse', label: 'To' },
        { key: 'transfer_by', label: 'Transfer By' },
        { key: 'status', label: 'Status' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/stock-transfers/print', paramName: 'stNo', idKey: 'stID', newTab: true }}
    />
  )
}
