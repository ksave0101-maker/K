"use client"

import { useEffect, useRef, useState } from 'react'

interface SyncStatus {
  lastSync?: string
  synced: number
  failed: number
  isRunning: boolean
}

/**
 * Background component that syncs InfluxDB data to PostgreSQL in real-time
 * Place this component in your admin page to enable automatic synchronization
 */
export default function InfluxToPostgresSync() {
  const [status, setStatus] = useState<SyncStatus>({
    synced: 0,
    failed: 0,
    isRunning: false
  })
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize PostgreSQL table on first load
  async function initializeTable() {
    try {
      const res = await fetch('/api/database/init-influx-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()

      if (data.ok) {
        console.log('✅ PostgreSQL table initialized successfully')
        return true
      } else {
        console.warn('Table initialization response:', data)
        // Even if it fails (e.g., table already exists), continue
        return true
      }
    } catch (err: any) {
      console.error('Failed to initialize table:', err)
      // Continue anyway to allow sync to proceed
      return false
    }
  }

  async function syncData() {
    try {
      setStatus(prev => ({ ...prev, isRunning: true }))
      setError(null)

      // Fetch current data from InfluxDB (last 5 minutes)
      // Use the new power-data endpoint that gets both power_before and power_metrics
      const influxRes = await fetch('/api/influx/power-data?range=-5m')
      const influxData = await influxRes.json()

      if (!influxData.ok || !influxData.rows) {
        throw new Error('Failed to fetch InfluxDB data')
      }

      // Transform InfluxDB data into the format needed for PostgreSQL
      // Group by device and latest timestamp
      const deviceMap = new Map<string, any>()

      for (const row of influxData.rows) {
        const device = row.device || row.ksave || 'unknown'
        const measurement = row.measurement || ''
        const field = row.field?.toLowerCase() || ''
        const value = row.value

        if (!deviceMap.has(device)) {
          deviceMap.set(device, {
            device,
            ksave_id: row.ksave,
            location: row.location,
            time: row.time,
            power_before: {
              L1: null, L2: null, L3: null,
              kWh: null, P: null, Q: null, S: null,
              PF: null, THD: null, F: null
            },
            power_metrics: {
              L1: null, L2: null, L3: null,
              kWh: null, P: null, Q: null, S: null,
              PF: null, THD: null, F: null
            }
          })
        }

        const record = deviceMap.get(device)

        // Update timestamp to latest
        if (row.time && new Date(row.time) > new Date(record.time)) {
          record.time = row.time
        }

        // Map fields to power_before or power_metrics based on measurement or field name
        const isPowerBefore = measurement.includes('power_before') || measurement.includes('before') || field.includes('before')
        const target = isPowerBefore ? record.power_before : record.power_metrics

        // Extract field name and assign value
        if (field.includes('l1') || field === 'l1' || field.includes('ia')) {
          target.L1 = value
        } else if (field.includes('l2') || field === 'l2' || field.includes('ib')) {
          target.L2 = value
        } else if (field.includes('l3') || field === 'l3' || field.includes('ic')) {
          target.L3 = value
        } else if (field.includes('kwh') || field === 'kwh' || field === 'energy') {
          target.kWh = value
        } else if (field === 'p' || field.includes('active') || field.includes('power_p')) {
          target.P = value
        } else if (field === 'q' || field.includes('reactive') || field.includes('power_q')) {
          target.Q = value
        } else if (field === 's' || field.includes('apparent') || field.includes('power_s')) {
          target.S = value
        } else if (field.includes('pf') || field.includes('power_factor')) {
          target.PF = value
        } else if (field.includes('thd') || field.includes('harmonic')) {
          target.THD = value
        } else if (field === 'f' || field.includes('freq') || field.includes('frequency')) {
          target.F = value
        }
      }

      const dataToSync = Array.from(deviceMap.values())

      // Sync to PostgreSQL
      const syncRes = await fetch('/api/database/sync-influx-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataToSync })
      })

      const syncResult = await syncRes.json()

      if (syncResult.ok) {
        setStatus({
          lastSync: new Date().toISOString(),
          synced: syncResult.synced || 0,
          failed: syncResult.failed || 0,
          isRunning: false
        })
        console.log(`✅ Synced ${syncResult.synced} devices to PostgreSQL`)
      } else {
        throw new Error(syncResult.error || 'Sync failed')
      }

    } catch (err: any) {
      console.error('Sync error:', err)
      setError(err.message || 'Unknown sync error')
      setStatus(prev => ({ ...prev, isRunning: false }))
    }
  }

  useEffect(() => {
    // Initialize table first, then start syncing
    async function init() {
      await initializeTable()

      // Initial sync
      syncData()

      // Set up interval for real-time sync (every 15 seconds to match InfluxDB polling)
      intervalRef.current = setInterval(() => {
        syncData()
      }, 15000)
    }

    init()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Render nothing - component runs in background only
  // Status can be viewed in browser console logs
  return null
}
