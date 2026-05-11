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
        { key: 'pre_install_no', label: 'Pre-Install No' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'site_address', label: 'Site Address' },
        { key: 'status', label: 'Status' },
        { key: 'created_by', label: 'Created By' },
        { key: 'created_at', label: 'Created' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/pre-installation/print', paramName: 'preInstallID', idKey: 'formID', newTab: true }}
      link={{ columnKey: 'formID', path: '/KR-Thailand/Admin-Login/pre-installation/print', paramName: 'formID' }}
      edit={{ path: '/KR-Thailand/Admin-Login/pre-installation-form', paramName: 'formID', idKey: 'formID' }}
    />
  )
}
