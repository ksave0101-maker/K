"use client"

import ListPage from '@/app/KR-Thailand/Admin-Login/shared/ListPage'

export default function VacationLeaveRequestsListPage() {
  return (
    <ListPage
      title="Vacation Leave Requests"
      apiPath="/api/vacation-leave-requests"
      createPath="/Thailand/Admin-Login/documents/vacation-leave-requests/create"
      columns={[
        { key: 'vlrNo', label: 'VLR No.' },
        { key: 'requestDate', label: 'Date' },
        { key: 'employeeName', label: 'Employee' },
        { key: 'department', label: 'Department' },
        { key: 'leaveType', label: 'Leave Type' },
        { key: 'status', label: 'Status' }
      ]}
    />
  )
}
