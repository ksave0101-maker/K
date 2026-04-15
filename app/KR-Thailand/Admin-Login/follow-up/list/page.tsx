"use client"
import ListPage from "../../shared/ListPage"

export default function Page() {
  return (
    <ListPage
      title="Follow Ups — List"
      apiPath="/api/follow-ups"
      createPath="/KR-Thailand/Admin-Login/follow-up"
      columns={[
        { key: 'followUpID', label: 'ID' },
        { key: 'target_type', label: 'Target' },
        { key: 'notes', label: 'Notes' },
        { key: 'status', label: 'Status' },
        { key: 'assigned_to', label: 'Assigned' },
        { key: 'created_at', label: 'Created' }
      ]}
      link={{ columnKey: 'followUpID', path: '/KR-Thailand/Admin-Login/follow-up', paramName: 'followUpID' }}
      print={{ path: '/KR-Thailand/Admin-Login/follow-up/print', paramName: 'followUpID', idKey: 'followUpID', newTab: true }}
    />
  )
}
