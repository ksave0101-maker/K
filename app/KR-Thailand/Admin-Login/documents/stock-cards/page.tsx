"use client"

import ListPage from '../../shared/ListPage'

export default function StockCardsListPage() {
  return (
    <ListPage
      title="Stock Cards"
      apiPath="/api/stock-cards"
      createPath="/KR-Thailand/Admin-Login/documents/stock-cards/create"
      columns={[
        { key: 'scNo', label: 'Stock Card No.' },
        { key: 'scDate', label: 'Date' },
        { key: 'product_code', label: 'Product Code' },
        { key: 'product_name', label: 'Product Name' },
        { key: 'transaction_type', label: 'Type' },
        { key: 'quantity_in', label: 'In' },
        { key: 'quantity_out', label: 'Out' },
        { key: 'balance', label: 'Balance' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/stock-cards/print', paramName: 'scNo', idKey: 'scID', newTab: true }}
    />
  )
}
