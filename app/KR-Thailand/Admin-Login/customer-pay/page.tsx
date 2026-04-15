"use client"

import React from 'react'
import ListPage from '../shared/ListPage'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const cusID = searchParams?.get('cusID')
  const apiPath = cusID ? `/api/customer-payments?cusID=${encodeURIComponent(cusID)}` : '/api/customer-payments'
  const createPath = cusID ? `/KR-Thailand/Admin-Login/customer-pay/create?cusID=${encodeURIComponent(cusID)}` : '/KR-Thailand/Admin-Login/customer-pay/create?select=1'
  const title = cusID ? `Customer Payments — ${cusID}` : 'Customer Payments'

  return (
    <ListPage
      title={title}
      apiPath={apiPath}
      createPath={createPath}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'date', label: 'Date' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
      ]}
      link={{ columnKey: 'id', path: '/KR-Thailand/Admin-Login/customer-pay/view', paramName: 'id' }}
      print={{ path: '/KR-Thailand/Admin-Login/customer-pay', paramName: 'id' }}
    />
  )
}
