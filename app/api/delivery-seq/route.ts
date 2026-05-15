import { NextRequest, NextResponse } from 'next/server'
import { generateDocumentNumber } from '@/lib/document-number'

export async function GET(_request: NextRequest) {
  try {
    const formatted = await generateDocumentNumber('DN', 'delivery_notes', 'deliveryNo')
    return NextResponse.json({ success: true, formatted })
  } catch (error: any) {
    console.error('delivery-seq error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
