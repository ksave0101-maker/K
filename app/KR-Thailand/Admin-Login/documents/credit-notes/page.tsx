"use client"

import ListPage from '../../shared/ListPage'

export default function CreditNotesListPage() {
  return (
    <ListPage
      title="Credit Notes"
      apiPath="/api/credit-notes"
      createPath="/KR-Thailand/Admin-Login/documents/credit-notes/create"
      columns={[
        { key: 'cnNo', label: 'Credit Note No.' },
        { key: 'cnDate', label: 'Date' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'invoice_ref', label: 'Invoice Ref' },
        { key: 'total_amount', label: 'Total Amount' },
        { key: 'status', label: 'Status' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/credit-notes/print', paramName: 'cnNo', idKey: 'cnID', newTab: true }}
    />
  )
}
