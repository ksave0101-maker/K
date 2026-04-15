"use client"

import React, { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PanelFrame from '../components/grafana/PanelFrame'

type Language = 'th' | 'en' | 'cn' | 'kr'

const translations = {
  th: {
    title: 'การตรวจสอบอุปกรณ์',
    back: 'กลับ',
    refresh: 'รีเฟรช',
    language: 'ภาษา',
    deviceInfo: 'ข้อมูลอุปกรณ์',
    seriesName: 'ชื่อซีรีส์',
    seriesNo: 'หมายเลขซีรีส์',
    location: 'สถานที่',
    status: 'สถานะ',
    lastSeen: 'เห็นครั้งล่าสุด',
    realTimeData: 'ข้อมูลเรียลไทม์',
    current: 'กระแสไฟฟ้า (A)',
    activePower: 'กำลังไฟฟ้าจริง (W)',
    reactivePower: 'กำลังไฟฟ้ารีแอคทีฟ (var)',
    apparentPower: 'กำลังไฟฟ้าปรากฏ (VA)',
    powerFactor: 'ตัวประกอบกำลังไฟฟ้า',
    thd: 'ความผิดเพี้ยนฮาร์มอนิก',
    frequency: 'ความถี่ (Hz)',
    charts: 'กราฟข้อมูล',
    aiAnalysis: 'การวิเคราะห์ AI',
    comparison: 'การเปรียบเทียบ',
    alerts: 'การแจ้งเตือน',
    peakLoad: 'การวิเคราะห์ Peak Load',
    loading: 'กำลังโหลด...',
    noData: 'ไม่มีข้อมูล',
    on: 'เปิด',
    off: 'ปิด',
    normal: 'ปกติ',
    warning: 'เตือน',
    critical: 'วิกฤต',
    peakTime: 'เวลา Peak',
    peakValue: 'ค่า Peak',
    avgLoad: 'ค่าเฉลี่ยโหลด',
    energySaving: 'การประหยัดพลังงาน',
    efficiency: 'ประสิทธิภาพ'
  },
  en: {
    title: 'Device Monitoring',
    back: 'Back',
    refresh: 'Refresh',
    language: 'Language',
    deviceInfo: 'Device Information',
    seriesName: 'Series Name',
    seriesNo: 'Series No',
    location: 'Location',
    status: 'Status',
    lastSeen: 'Last Seen',
    realTimeData: 'Real-Time Data',
    current: 'Current (A)',
    activePower: 'Active Power (W)',
    reactivePower: 'Reactive Power (var)',
    apparentPower: 'Apparent Power (VA)',
    powerFactor: 'Power Factor',
    thd: 'THD',
    frequency: 'Frequency (Hz)',
    charts: 'Data Charts',
    aiAnalysis: 'AI Analysis',
    comparison: 'Comparison',
    alerts: 'Alerts',
    peakLoad: 'Peak Load Analysis',
    loading: 'Loading...',
    noData: 'No Data',
    on: 'ON',
    off: 'OFF',
    normal: 'Normal',
    warning: 'Warning',
    critical: 'Critical',
    peakTime: 'Peak Time',
    peakValue: 'Peak Value',
    avgLoad: 'Average Load',
    energySaving: 'Energy Saving',
    efficiency: 'Efficiency'
  },
  cn: {
    title: '设备监控',
    back: '返回',
    refresh: '刷新',
    language: '语言',
    deviceInfo: '设备信息',
    seriesName: '系列名称',
    seriesNo: '系列号',
    location: '位置',
    status: '状态',
    lastSeen: '最后查看',
    realTimeData: '实时数据',
    current: '电流 (A)',
    activePower: '有功功率 (W)',
    reactivePower: '无功功率 (var)',
    apparentPower: '视在功率 (VA)',
    powerFactor: '功率因数',
    thd: '总谐波失真',
    frequency: '频率 (Hz)',
    charts: '数据图表',
    aiAnalysis: 'AI分析',
    comparison: '比较',
    alerts: '警报',
    peakLoad: '峰值负载分析',
    loading: '加载中...',
    noData: '无数据',
    on: '开',
    off: '关',
    normal: '正常',
    warning: '警告',
    critical: '危急',
    peakTime: '峰值时间',
    peakValue: '峰值',
    avgLoad: '平均负载',
    energySaving: '节能',
    efficiency: '效率'
  },
  kr: {
    title: '장치 모니터링',
    back: '뒤로',
    refresh: '새로고침',
    language: '언어',
    deviceInfo: '장치 정보',
    seriesName: '시리즈 이름',
    seriesNo: '시리즈 번호',
    location: '위치',
    status: '상태',
    lastSeen: '마지막 확인',
    realTimeData: '실시간 데이터',
    current: '전류 (A)',
    activePower: '유효 전력 (W)',
    reactivePower: '무효 전력 (var)',
    apparentPower: '피상 전력 (VA)',
    powerFactor: '역률',
    thd: '총 고조파 왜곡',
    frequency: '주파수 (Hz)',
    charts: '데이터 차트',
    aiAnalysis: 'AI 분석',
    comparison: '비교',
    alerts: '알림',
    peakLoad: '피크 부하 분석',
    loading: '로딩 중...',
    noData: '데이터 없음',
    on: '켜짐',
    off: '꺼짐',
    normal: '정상',
    warning: '경고',
    critical: '위급',
    peakTime: '피크 시간',
    peakValue: '피크 값',
    avgLoad: '평균 부하',
    energySaving: '에너지 절약',
    efficiency: '효율'
  }
}

function DeviceMonitoringContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const deviceId = searchParams.get('device') || ''

  const [language, setLanguage] = useState<Language>('en')
  const [deviceData, setDeviceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState<Date>(new Date())

  const t = translations[language]

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch device data
  useEffect(() => {
    if (!deviceId) return

    let mounted = true
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/influx/device?id=${encodeURIComponent(deviceId)}`)
        const data = await res.json()

        if (!mounted) return

        if (!res.ok) {
          setError(data.error || 'Failed to fetch device data')
          return
        }

        setDeviceData(data)
      } catch (e: any) {
        if (mounted) setError(e.message || 'Error fetching data')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Refresh every 5 seconds

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [deviceId])

  // AI Analysis - Calculate insights
  const aiInsights = useMemo(() => {
    if (!deviceData || !deviceData.parsed) return null

    const parsed = deviceData.parsed
    const currentPower = parsed.P || 0
    const beforePower = parsed.power_before?.P || currentPower * 1.3
    const savings = beforePower - currentPower
    const savingsPercent = beforePower > 0 ? (savings / beforePower * 100) : 0
    const efficiency = parsed.PF || 0.95

    // Determine alert level
    let alertLevel: 'normal' | 'warning' | 'critical' = 'normal'
    let alertMessage = t.normal

    if (efficiency < 0.85) {
      alertLevel = 'critical'
      alertMessage = `${t.critical}: Low power factor detected`
    } else if (efficiency < 0.90) {
      alertLevel = 'warning'
      alertMessage = `${t.warning}: Power factor below optimal`
    }

    if (parsed.THD > 5) {
      alertLevel = alertLevel === 'critical' ? 'critical' : 'warning'
      alertMessage += ` | High THD detected`
    }

    return {
      savings,
      savingsPercent,
      efficiency,
      alertLevel,
      alertMessage,
      recommendation: savingsPercent > 15 ? 'Excellent energy efficiency!' :
                     savingsPercent > 5 ? 'Good performance, room for improvement' :
                     'Consider optimization measures'
    }
  }, [deviceData, t])

  // Peak Load Analysis
  const peakLoadAnalysis = useMemo(() => {
    if (!deviceData || !deviceData.parsed) return null

    const parsed = deviceData.parsed
    const currentPower = parsed.P || 0
    const peakPower = currentPower * 1.2 // Simulated peak (20% higher)
    const avgPower = currentPower * 0.85 // Simulated average (15% lower)

    return {
      peak: peakPower,
      average: avgPower,
      current: currentPower,
      peakTime: '14:30 - 15:00',
      loadFactor: (avgPower / peakPower * 100).toFixed(1)
    }
  }, [deviceData])

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 18 }}>{t.loading}</div>
      </div>
    )
  }

  if (error || !deviceData) {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ color: '#dc2626', marginBottom: 16 }}>{t.noData}: {error}</div>
        <button onClick={() => router.push('/sites')} className="k-btn">{t.back}</button>
      </div>
    )
  }

  const parsed = deviceData.parsed || {}
  const statusOn = parsed.ok ?? false

  return (
    <div style={{ padding: 20, maxWidth: 1600, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>{t.title}</h1>
          <div style={{ fontSize: 16, color: '#6b7280', marginTop: 4 }}>
            Device: {deviceId.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            <option value="en">🇬🇧 English</option>
            <option value="th">🇹🇭 ไทย</option>
            <option value="cn">🇨🇳 中文</option>
            <option value="kr">🇰🇷 한국어</option>
          </select>

          <button onClick={() => router.push('/sites')} className="k-btn">{t.back}</button>
          <button onClick={() => window.location.reload()} className="k-btn k-btn-primary">{t.refresh}</button>
        </div>
      </header>

      {/* Device Info Card */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600 }}>{t.deviceInfo}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{t.seriesName}</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{parsed.seriesName || deviceId}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{t.seriesNo}</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{parsed.seriesNo || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{t.location}</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{parsed.location || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{t.status}</div>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: statusOn ? '#059669' : '#dc2626'
            }}>
              {statusOn ? t.on : t.off}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis & Alerts */}
      {aiInsights && (
        <div style={{
          background: aiInsights.alertLevel === 'critical' ? '#fee2e2' :
                     aiInsights.alertLevel === 'warning' ? '#fef3c7' : '#d1fae5',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          border: `2px solid ${aiInsights.alertLevel === 'critical' ? '#dc2626' :
                                aiInsights.alertLevel === 'warning' ? '#f59e0b' : '#059669'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{t.aiAnalysis}</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>{t.energySaving}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>
                {aiInsights.savingsPercent.toFixed(1)}%
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                {aiInsights.savings.toFixed(2)} W saved
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>{t.efficiency}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>
                {(aiInsights.efficiency * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                {aiInsights.recommendation}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>{t.alerts}</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {aiInsights.alertMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Data */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600 }}>{t.realTimeData}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{t.current}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2563eb' }}>
              {(parsed.current || 0).toFixed(2)}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{t.activePower}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#059669' }}>
              {(parsed.P || 0).toFixed(1)}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{t.reactivePower}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
              {(parsed.Q || 0).toFixed(1)}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{t.apparentPower}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#8b5cf6' }}>
              {(parsed.S || 0).toFixed(1)}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{t.powerFactor}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0891b2' }}>
              {(parsed.PF || 0).toFixed(3)}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{t.thd}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626' }}>
              {(parsed.THD || 0).toFixed(2)}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{t.frequency}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#6366f1' }}>
              {(parsed.F || 50).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Peak Load Analysis */}
      {peakLoadAnalysis && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{t.peakLoad}</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{t.peakValue}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>
                {peakLoadAnalysis.peak.toFixed(1)} W
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{t.avgLoad}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>
                {peakLoadAnalysis.average.toFixed(1)} W
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Current Load</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>
                {peakLoadAnalysis.current.toFixed(1)} W
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{t.peakTime}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>
                {peakLoadAnalysis.peakTime}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Load Factor</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>
                {peakLoadAnalysis.loadFactor}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grafana Charts */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600 }}>{t.charts}</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          {/* Main Power Chart */}
          <div style={{ height: 300, background: '#f8fafc', borderRadius: 8, overflow: 'hidden' }}>
            <PanelFrame
              uid={process.env.NEXT_PUBLIC_GRAFANA_DASH_UID || 'all-power'}
              panelId={Number(process.env.NEXT_PUBLIC_GRAFANA_PANEL_ID || 2)}
              vars={{ ksave: deviceId }}
              height={300}
            />
          </div>

          {/* Additional Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
            <div style={{ height: 250, background: '#f8fafc', borderRadius: 8, overflow: 'hidden' }}>
              <PanelFrame
                uid={process.env.NEXT_PUBLIC_GRAFANA_DASH_UID || 'all-power'}
                panelId={3}
                vars={{ ksave: deviceId }}
                height={250}
              />
            </div>

            <div style={{ height: 250, background: '#f8fafc', borderRadius: 8, overflow: 'hidden' }}>
              <PanelFrame
                uid={process.env.NEXT_PUBLIC_GRAFANA_DASH_UID || 'all-power'}
                panelId={4}
                vars={{ ksave: deviceId }}
                height={250}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DeviceMonitoringPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <DeviceMonitoringContent />
    </Suspense>
  )
}
