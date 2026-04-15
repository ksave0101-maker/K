import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3307),
  user: process.env.MYSQL_USER || 'ksystem',
  password: process.env.MYSQL_PASSWORD || 'Ksave2025Admin',
  database: 'ksystem',
  connectionLimit: 10,
  timezone: '+00:00'
})

/**
 * Query ksave database with parameterized statements
 */
export async function queryKsave(sql: string, values?: any[]): Promise<any[]> {
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.query(sql, values)
    return Array.isArray(rows) ? rows : [rows]
  } finally {
    conn.release()
  }
}

/**
 * Get all devices from ksave.devices table
 */
export async function getAllDevices(): Promise<any[]> {
  try {
    const devices = await queryKsave(
      `SELECT deviceID, deviceName, ksaveID, location, status, ipAddress, 
              beforeMeterNo, metricsMeterNo, phone, created_at, updated_at
       FROM devices 
       ORDER BY deviceID ASC`
    )
    return devices
  } catch (error) {
    console.error('Error fetching devices from ksave:', error)
    return []
  }
}

/**
 * Get device by ID
 */
export async function getDeviceById(deviceID: number): Promise<any | null> {
  try {
    const devices = await queryKsave(
      `SELECT deviceID, deviceName, ksaveID, location, status, ipAddress, 
              beforeMeterNo, metricsMeterNo, created_at, updated_at
       FROM devices 
       WHERE deviceID = ?`,
      [deviceID]
    )
    return devices[0] || null
  } catch (error) {
    console.error('Error fetching device from ksave:', error)
    return null
  }
}

/**
 * Get device by ksaveID
 */
export async function getDeviceByKsaveId(ksaveID: string): Promise<any | null> {
  try {
    const devices = await queryKsave(
      `SELECT deviceID, deviceName, ksaveID, location, status, ipAddress, 
              beforeMeterNo, metricsMeterNo, created_at, updated_at
       FROM devices 
       WHERE ksaveID = ?`,
      [ksaveID]
    )
    return devices[0] || null
  } catch (error) {
    console.error('Error fetching device from ksave:', error)
    return null
  }
}
