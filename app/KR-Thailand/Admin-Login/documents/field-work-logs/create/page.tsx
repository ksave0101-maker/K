"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

type TaskType = {
  task_description: string
  task_status: string
  time_spent_minutes: number
  notes: string
}

export default function CreateFieldWorkLogPage() {
  const router = useRouter()

  const [fwlNo, setFwlNo] = useState('')
  const [fwlDate, setFwlDate] = useState(() => new Date().toISOString().split('T')[0])
  const [workDate, setWorkDate] = useState(() => new Date().toISOString().split('T')[0])
  const [employeeName, setEmployeeName] = useState('')
  const [department, setDepartment] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [siteLocation, setSiteLocation] = useState('')
  const [siteContactPerson, setSiteContactPerson] = useState('')
  const [siteContactPhone, setSiteContactPhone] = useState('')
  const [workType, setWorkType] = useState('installation')
  const [workDescription, setWorkDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [totalHours, setTotalHours] = useState(0)
  const [equipmentUsed, setEquipmentUsed] = useState('')
  const [materialsUsed, setMaterialsUsed] = useState('')
  const [workStatus, setWorkStatus] = useState('in_progress')
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [issuesEncountered, setIssuesEncountered] = useState('')
  const [customerSatisfaction, setCustomerSatisfaction] = useState('')
  const [nextVisitRequired, setNextVisitRequired] = useState(false)
  const [nextVisitDate, setNextVisitDate] = useState('')
  const [notes, setNotes] = useState('')

  const [tasks, setTasks] = useState<TaskType[]>([{
    task_description: '',
    task_status: 'pending',
    time_spent_minutes: 0,
    notes: ''
  }])

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [locale, setLocale] = useState<'en'|'th'>('th')

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l as 'en'|'th')
    } catch {}

    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLocale(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  // Auto-calculate total hours when start/end time changes
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`)
      const end = new Date(`2000-01-01T${endTime}`)
      const diffMs = end.getTime() - start.getTime()
      const hours = diffMs / (1000 * 60 * 60)
      setTotalHours(hours > 0 ? parseFloat(hours.toFixed(2)) : 0)
    }
  }, [startTime, endTime])

  function addTask() {
    setTasks([...tasks, {
      task_description: '',
      task_status: 'pending',
      time_spent_minutes: 0,
      notes: ''
    }])
  }

  function updateTask(i: number, key: keyof TaskType, value: any) {
    const copy = [...tasks]
    if (key === 'time_spent_minutes') {
      copy[i][key] = Number(value)
    } else {
      copy[i][key] = value
    }
    setTasks(copy)
  }

  function removeTask(i: number) {
    if (tasks.length === 1) return
    setTasks(tasks.filter((_, idx) => idx !== i))
  }

  function validate() {
    const errs: string[] = []

    if (!employeeName) errs.push(L('Employee name is required', 'กรุณาระบุชื่อพนักงาน'))
    if (!siteLocation) errs.push(L('Site location is required', 'กรุณาระบุสถานที่ทำงาน'))
    if (!workDescription) errs.push(L('Work description is required', 'กรุณาระบุรายละเอียดงาน'))

    tasks.forEach((task, idx) => {
      if (!task.task_description) errs.push(L(`Task ${idx + 1} needs description`, `งานที่ ${idx + 1} ต้องมีรายละเอียด`))
    })

    setErrors(errs)
    return errs.length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('k_system_admin_user') || '{}')
      const created_by = user?.username || user?.name || 'system'

      const payload = {
        fwlDate,
        work_date: workDate,
        employee_name: employeeName,
        department: department || null,
        customer_name: customerName || null,
        site_location: siteLocation,
        site_contact_person: siteContactPerson || null,
        site_contact_phone: siteContactPhone || null,
        work_type: workType,
        work_description: workDescription,
        start_time: startTime || null,
        end_time: endTime || null,
        total_hours: totalHours,
        equipment_used: equipmentUsed || null,
        materials_used: materialsUsed || null,
        work_status: workStatus,
        completion_percentage: completionPercentage,
        issues_encountered: issuesEncountered || null,
        customer_satisfaction: customerSatisfaction || null,
        next_visit_required: nextVisitRequired ? 1 : 0,
        next_visit_date: nextVisitDate || null,
        notes,
        tasks: tasks.map(task => ({
          task_description: task.task_description,
          task_status: task.task_status,
          time_spent_minutes: task.time_spent_minutes,
          notes: task.notes || null
        })),
        created_by
      }

      const res = await fetch('/api/field-work-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Field work log created successfully', 'สร้างใบบันทึกทำงานสำเร็จ') })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/documents/field-work-logs'), 900)
      } else {
        setMessageBar({ type: 'error', text: L('Failed: ', 'ล้มเหลว: ') + (j.error || 'Unknown error') })
      }
    } catch (err) {
      console.error(err)
      setMessageBar({ type: 'error', text: L('Error occurred', 'เกิดข้อผิดพลาด') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Create Field Work Log" titleTh="สร้างใบบันทึกทำงานนอกสถานที่">
      {messageBar && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: 8,
          color: messageBar.type === 'error' ? '#7f1d1d' : '#064e3b',
          background: messageBar.type === 'error' ? '#fee2e2' : '#ecfdf5',
          border: messageBar.type === 'error' ? '1px solid #fca5a5' : '1px solid #86efac'
        }}>
          {messageBar.text}
        </div>
      )}

      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{L('Create Field Work Log', 'สร้างใบบันทึกทำงานนอกสถานที่')}</h2>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Document No.', 'เลขที่เอกสาร')}</label>
                <input type="text" value={fwlNo || L('Auto-generated', 'สร้างอัตโนมัติ')} disabled className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Document Date', 'วันที่เอกสาร')}</label>
                <input type="date" value={fwlDate} onChange={e => setFwlDate(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Work Date', 'วันที่ทำงาน')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="date" value={workDate} onChange={e => setWorkDate(e.target.value)} className={styles.formInput} />
              </div>
            </div>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>{L('Employee Information', 'ข้อมูลพนักงาน')}</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Employee Name', 'ชื่อพนักงาน')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={employeeName} onChange={e => setEmployeeName(e.target.value)} className={styles.formInput} placeholder={L('Technician/Employee name', 'ชื่อช่าง/พนักงาน')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Department', 'แผนก')}</label>
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className={styles.formInput} placeholder={L('Department', 'แผนก')} />
              </div>
            </div>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>{L('Site Information', 'ข้อมูลสถานที่')}</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Customer Name', 'ชื่อลูกค้า')}</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Work Type', 'ประเภทงาน')}</label>
                <select value={workType} onChange={e => setWorkType(e.target.value)} className={styles.formInput}>
                  <option value="installation">{L('Installation', 'ติดตั้ง')}</option>
                  <option value="maintenance">{L('Maintenance', 'ซ่อมบำรุง')}</option>
                  <option value="repair">{L('Repair', 'ซ่อมแซม')}</option>
                  <option value="inspection">{L('Inspection', 'ตรวจสอบ')}</option>
                  <option value="survey">{L('Survey', 'สำรวจ')}</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Site Location', 'สถานที่ทำงาน')} <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea value={siteLocation} onChange={e => setSiteLocation(e.target.value)} className={styles.formInput} rows={2} placeholder={L('Full address of work site', 'ที่อยู่สถานที่ทำงานแบบเต็ม')} />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Contact Person', 'ผู้ติดต่อ')}</label>
                <input type="text" value={siteContactPerson} onChange={e => setSiteContactPerson(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Contact Phone', 'เบอร์โทรติดต่อ')}</label>
                <input type="tel" value={siteContactPhone} onChange={e => setSiteContactPhone(e.target.value)} className={styles.formInput} />
              </div>
            </div>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>{L('Work Details', 'รายละเอียดงาน')}</h3>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Work Description', 'รายละเอียดงาน')} <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea value={workDescription} onChange={e => setWorkDescription(e.target.value)} className={styles.formInput} rows={3} placeholder={L('Describe the work performed...', 'อธิบายงานที่ทำ...')} />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Start Time', 'เวลาเริ่ม')}</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('End Time', 'เวลาสิ้นสุด')}</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Total Hours', 'ชั่วโมงรวม')}</label>
                <input type="number" value={totalHours} readOnly className={styles.formInput} style={{ background: '#f5f5f5' }} step="0.01" />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Equipment Used', 'อุปกรณ์ที่ใช้')}</label>
                <textarea value={equipmentUsed} onChange={e => setEquipmentUsed(e.target.value)} className={styles.formInput} rows={2} placeholder={L('List equipment and tools used...', 'รายการอุปกรณ์และเครื่องมือที่ใช้...')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Materials Used', 'วัสดุที่ใช้')}</label>
                <textarea value={materialsUsed} onChange={e => setMaterialsUsed(e.target.value)} className={styles.formInput} rows={2} placeholder={L('List materials consumed...', 'รายการวัสดุที่ใช้ไป...')} />
              </div>
            </div>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>{L('Tasks Performed', 'รายการงานที่ทำ')}</h3>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>#</th>
                    <th style={{ width: '35%' }}>{L('Task Description', 'รายละเอียดงาน')}</th>
                    <th style={{ width: '15%' }}>{L('Status', 'สถานะ')}</th>
                    <th style={{ width: '15%' }}>{L('Time (min)', 'เวลา (นาที)')}</th>
                    <th style={{ width: '25%' }}>{L('Notes', 'หมายเหตุ')}</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center' }}>{i + 1}</td>
                      <td><input type="text" value={task.task_description} onChange={e => updateTask(i, 'task_description', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td>
                        <select value={task.task_status} onChange={e => updateTask(i, 'task_status', e.target.value)} className={styles.formInput} style={{ width: '100%' }}>
                          <option value="pending">{L('Pending', 'รอดำเนินการ')}</option>
                          <option value="in_progress">{L('In Progress', 'กำลังทำ')}</option>
                          <option value="completed">{L('Completed', 'เสร็จแล้ว')}</option>
                        </select>
                      </td>
                      <td><input type="number" value={task.time_spent_minutes} onChange={e => updateTask(i, 'time_spent_minutes', e.target.value)} className={styles.formInput} min="0" style={{ width: '100%' }} /></td>
                      <td><input type="text" value={task.notes} onChange={e => updateTask(i, 'notes', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" onClick={() => removeTask(i)} disabled={tasks.length === 1} className={styles.btnDanger} style={{ padding: '6px 12px' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addTask} className={styles.btnSecondary} style={{ marginTop: 10 }}>+ {L('Add Task', 'เพิ่มงาน')}</button>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>{L('Work Status', 'สถานะงาน')}</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Work Status', 'สถานะ')}</label>
                <select value={workStatus} onChange={e => setWorkStatus(e.target.value)} className={styles.formInput}>
                  <option value="pending">{L('Pending', 'รอดำเนินการ')}</option>
                  <option value="in_progress">{L('In Progress', 'กำลังดำเนินการ')}</option>
                  <option value="completed">{L('Completed', 'เสร็จสมบูรณ์')}</option>
                  <option value="cancelled">{L('Cancelled', 'ยกเลิก')}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Completion %', '% ความสำเร็จ')}</label>
                <input type="number" value={completionPercentage} onChange={e => setCompletionPercentage(Number(e.target.value))} className={styles.formInput} min="0" max="100" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Customer Satisfaction', 'ความพึงพอใจ')}</label>
                <select value={customerSatisfaction} onChange={e => setCustomerSatisfaction(e.target.value)} className={styles.formInput}>
                  <option value="">{L('-- Not rated --', '-- ยังไม่ประเมิน --')}</option>
                  <option value="very_satisfied">{L('Very Satisfied', 'พึงพอใจมาก')}</option>
                  <option value="satisfied">{L('Satisfied', 'พึงพอใจ')}</option>
                  <option value="neutral">{L('Neutral', 'ปานกลาง')}</option>
                  <option value="unsatisfied">{L('Unsatisfied', 'ไม่พอใจ')}</option>
                  <option value="very_unsatisfied">{L('Very Unsatisfied', 'ไม่พอใจมาก')}</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Issues Encountered', 'ปัญหาที่พบ')}</label>
              <textarea value={issuesEncountered} onChange={e => setIssuesEncountered(e.target.value)} className={styles.formInput} rows={2} placeholder={L('Any issues or problems encountered...', 'ปัญหาหรืออุปสรรคที่พบ...')} />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={nextVisitRequired} onChange={e => setNextVisitRequired(e.target.checked)} />
                  <span>{L('Next Visit Required', 'ต้องนัดหมายครั้งถัดไป')}</span>
                </label>
              </div>
              {nextVisitRequired && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Next Visit Date', 'วันนัดหมายครั้งถัดไป')}</label>
                  <input type="date" value={nextVisitDate} onChange={e => setNextVisitDate(e.target.value)} className={styles.formInput} />
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className={styles.formInput} rows={2} placeholder={L('Additional notes...', 'หมายเหตุเพิ่มเติม...')} />
            </div>

            {errors.length > 0 && (
              <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#7f1d1d' }}>
                {errors.map((err, idx) => (<div key={idx}>• {err}</div>))}
              </div>
            )}

            <div className={styles.formRow} style={{ justifyContent: 'space-between', marginTop: 30 }}>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
              </button>
              <button type="button" onClick={() => router.back()} className={styles.btnOutline}>{L('Cancel', 'ยกเลิก')}</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
