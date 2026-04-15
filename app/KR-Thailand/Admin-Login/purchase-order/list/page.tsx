"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Purchase Orders — List"
      apiPath="/api/purchase-orders"
      createPath="/KR-Thailand/Admin-Login/purchase-order"
      columns={[
        { key: 'orderNo', label: 'Order No' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'priceTotal', label: 'Total' },
        { key: 'status', label: 'Status' },
        { key: 'created_at', label: 'Created' }
      ]}
      link={{ columnKey: 'orderNo', path: '/KR-Thailand/Admin-Login/purchase-order', paramName: 'orderNo' }}
      print={{ path: '/KR-Thailand/Admin-Login/purchase-order/print', paramName: 'orderID', idKey: 'orderID', newTab: true }}
    />
  )
}
