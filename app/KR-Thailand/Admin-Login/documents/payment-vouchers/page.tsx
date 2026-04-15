"use client"

import ListPage from '../../shared/ListPage'

export default function PaymentVouchersListPage() {
  return (
    <ListPage
      title="Payment Vouchers"
      apiPath="/api/payment-vouchers"
      createPath="/KR-Thailand/Admin-Login/documents/payment-vouchers/create"
      columns={[
        { key: 'pvNo', label: 'PV No.' },
        { key: 'pvDate', label: 'Date' },
        { key: 'payee_name', label: 'Payee' },
        { key: 'payment_method', label: 'Method' },
        { key: 'total_amount', label: 'Amount' },
        { key: 'status', label: 'Status' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/payment-vouchers/print', paramName: 'pvNo', idKey: 'pvID', newTab: true }}
    />
  )
}
