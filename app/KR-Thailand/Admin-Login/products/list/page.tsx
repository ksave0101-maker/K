"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Products — List"
      apiPath="/api/products"
      createPath="/KR-Thailand/Admin-Login/products"
      columns={[
        { key: 'productID', label: 'ID' },
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category' },
        { key: 'price', label: 'Price' },
        { key: 'stock_qty', label: 'Stock' }
      ]}
      link={{ columnKey: 'name', path: '/KR-Thailand/Admin-Login/products', paramName: 'productID' }}
      print={{ path: '/KR-Thailand/Admin-Login/products/print', paramName: 'productID', idKey: 'productID', newTab: true }}
    />
  )
}
