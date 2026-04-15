import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'qa-reports.json');

export const runtime = 'nodejs';

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.error('qa-reports: JSON parse error, backing up file', err);
      // backup corrupt file
      await fs.writeFile(DATA_PATH + '.corrupt.' + Date.now(), raw, 'utf-8');
      // return empty array so service stays up
      return [];
    }
  } catch (err: any) {
    if (err && err.code === 'ENOENT') {
      // file missing — create empty
      await writeData([]);
      return [];
    }
    throw err;
  }
}

async function writeData(data: any) {
  const tmp = DATA_PATH + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmp, DATA_PATH);
}

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('GET /api/production/qa-reports error', err);
    return NextResponse.json({ success: false, error: 'Failed to read QA reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, station, inspector, status, notes } = body;
    if (!date || !station || !inspector) {
      return NextResponse.json({ success: false, error: 'date, station and inspector are required' }, { status: 400 });
    }

    const data = await readData();
    const newId = id || `QA-${Date.now()}`;
    const newReport = { id: newId, date, station, inspector, status: status || 'Pass', notes: notes || '' };
    data.push(newReport);
    await writeData(data);
    return NextResponse.json({ success: true, data: newReport });
  } catch (err) {
    console.error('POST qa-reports error', err);
    return NextResponse.json({ success: false, error: 'Failed to create report' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;
    if (!id || !updates) {
      return NextResponse.json({ success: false, error: 'id and updates are required' }, { status: 400 });
    }

    const data = await readData();
    const idx = data.findIndex((r: any) => r.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    const updated = { ...data[idx], ...updates };
    data[idx] = updated;
    await writeData(data);

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('PATCH qa-reports error', err);
    return NextResponse.json({ success: false, error: 'Failed to update report' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const data = await readData();
    const idx = data.findIndex((r: any) => r.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    data.splice(idx, 1);
    await writeData(data);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE qa-reports error', err);
    return NextResponse.json({ success: false, error: 'Failed to delete report' }, { status: 500 });
  }
}
