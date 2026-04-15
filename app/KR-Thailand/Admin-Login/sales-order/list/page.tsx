"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Sales Orders — List"
      apiPath="/api/sales-orders"
      createPath="/KR-Thailand/Admin-Login/sales-order"
      columns={[
        { key: 'orderNo', label: 'Order No' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'priceTotal', label: 'Total' },
        { key: 'status', label: 'Status' },
        { key: 'created_at', label: 'Created' },
        { key: 'delivery_date', label: 'Delivery' }
      ]}
      link={{ columnKey: 'orderNo', path: '/KR-Thailand/Admin-Login/sales-order', paramName: 'orderNo' }}
      print={{ path: '/KR-Thailand/Admin-Login/sales-order/print', paramName: 'orderID', idKey: 'orderID', newTab: true }}
    />
  )
}
