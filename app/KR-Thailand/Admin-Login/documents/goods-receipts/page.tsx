"use client"

import ListPage from '../../shared/ListPage'

export default function GoodsReceiptsListPage() {
  return (
    <ListPage
      title="Goods Receipts"
      apiPath="/api/goods-receipts"
      createPath="/KR-Thailand/Admin-Login/documents/goods-receipts/create"
      columns={[
        { key: 'grNo', label: 'GR No.' },
        { key: 'grDate', label: 'Date' },
        { key: 'supplier_name', label: 'Supplier' },
        { key: 'po_ref', label: 'PO Ref' },
        { key: 'warehouse', label: 'Warehouse' },
        { key: 'status', label: 'Status' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/goods-receipts/print', paramName: 'grNo', idKey: 'grID', newTab: true }}
    />
  )
}
