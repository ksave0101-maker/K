import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  // Mock produced bills — in a real system this would query a database
  const bills = [
    { billId: 'BILL-1001', product: 'K-SAVER 10', qty: 10, finishedAt: '2026-02-09', batch: 'A1' },
    { billId: 'BILL-1002', product: 'K-SAVER 30', qty: 5, finishedAt: '2026-02-10', batch: 'B2' },
    { billId: 'BILL-1003', product: 'K-SAVER Max', qty: 2, finishedAt: '2026-02-11', batch: 'C3' },
  ];

  return NextResponse.json({ success: true, data: bills });
}
