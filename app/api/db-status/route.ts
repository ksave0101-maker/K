/**
 * API: ตรวจสอบสถานะ Database Connections
 * GET /api/db-status
 */

import { NextResponse } from 'next/server';
import { getPoolStatus } from '@/lib/db-pool';

export async function GET() {
  try {
    const status = getPoolStatus();

    // ⚠️ แจ้งเตือนถ้า connections ใกล้เต็ม
    const warningThreshold = 0.8; // 80%
    const maxConnections = 10; // ตาม config ใน db-pool.ts
    const usagePercent = status.activeConnections / maxConnections;

    return NextResponse.json({
      success: true,
      status: {
        ...status,
        maxConnections,
        usagePercent: Math.round(usagePercent * 100) + '%',
        warning: usagePercent > warningThreshold ? 'HIGH_USAGE' : null
      },
      message: usagePercent > warningThreshold
        ? `⚠️ Connection usage is high (${Math.round(usagePercent * 100)}%)`
        : 'OK'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
