"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Pre-Installation — List"
      apiPath="/api/pre-installation"
      createPath="/KR-Thailand/Admin-Login/pre-installation-form"
      columns={[
        { key: 'formID', label: 'Form ID' },
        { key: 'orderID', label: 'Order ID' },
        { key: 'cusID', label: 'Customer ID' },
        { key: 'site_address', label: 'Site Address' },
        { key: 'checklist', label: 'Checklist' },
        { key: 'photos', label: 'Photos' },
        { key: 'notes', label: 'Notes' },
        { key: 'status', label: 'Status' },
        { key: 'created_by', label: 'Created By' },
        { key: 'created_at', label: 'Created' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/pre-installation/print', paramName: 'preInstallID', idKey: 'preInstallID', newTab: true }}
      link={{ columnKey: 'formID', path: '/KR-Thailand/Admin-Login/pre-installation/print', paramName: 'formID' }}
    />
  )
}
