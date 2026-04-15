"use client"
import { useState } from 'react'
import ListPage from "../../shared/ListPage"
import PowerCalculatorModal from "../components/PowerCalculatorModal"

export default function Page() {
  const [modalCalcID, setModalCalcID] = useState<string | number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      <ListPage
        key={refreshKey}
        title="Power Calculator — List"
        apiPath="/api/power-calculations"
        createPath="/KR-Thailand/Admin-Login/power-calculator"
        columns={[
          { key: 'rowNumber', label: 'ลำดับ' },
          { key: 'power_calcuNo', label: 'เลขที่เอกสาร' },
          { key: 'created_at', label: 'วันที่' },
          { key: 'company_name', label: 'ชื่อบริษัท' },
          { key: 'customerName', label: 'ชื่อลูกค้า' },
          { key: 'status', label: 'สถานะ' }
        ]}
        print={{ path: '/KR-Thailand/Admin-Login/power-calculator/print', paramName: 'calcID', idKey: 'calcID', newTab: true }}
        onViewClick={(calcID) => setModalCalcID(calcID)}
      />

      {modalCalcID && (
        <PowerCalculatorModal
          calcID={modalCalcID}
          isOpen={!!modalCalcID}
          onClose={() => setModalCalcID(null)}
          onSave={() => {
            setRefreshKey(prev => prev + 1)
            setModalCalcID(null)
          }}
        />
      )}
    </>
  )
}

