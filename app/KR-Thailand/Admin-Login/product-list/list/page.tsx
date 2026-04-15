"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Product Lists — List"
      apiPath="/api/products"
      createPath="/KR-Thailand/Admin-Login/product-add"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Name' },
        { key: 'price', label: 'Price' }
      ]}
      link={{ columnKey: 'id', path: '/KR-Thailand/Admin-Login/product-add', paramName: 'id' }}
      print={{ path: '/KR-Thailand/Admin-Login/product-list/print', paramName: 'productID', idKey: 'productID', newTab: true }}
    />
  )
}
