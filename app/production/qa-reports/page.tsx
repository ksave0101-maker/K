"use client";

import { Filter, Search, Plus, Save, X, Printer } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type InspectionItem = { result: string; remarks: string };
type RepdoBill = {
  report_id?: number;
  report_no: string;
  branch_key?: string;
  branch_name?: string;
  pdo_id: string;
  pdo_no: string;
  product_name?: string;
  quantity?: number;
  created_at?: string;
};

type Report = {
  id: string;
  date: string;
  station: string;
  inspector: string;
  status: string;
  notes: string;
  billId?: string;
  product?: string;
  qty?: number;
  orderNumber?: string;
  productionNumber?: string;
  serialNumbers?: string[];
  inspections?: InspectionItem[];
  isLocked?: boolean;
};

const makeInspections = (count: number): InspectionItem[] => Array.from({ length: Math.max(0, count) }, () => ({ result: '', remarks: '' }));
const PRINT_INSPECTION_LABELS = [
  'Electrical Test / 전기 시험',
  'Visual Inspection / 외관 검사',
  'Packaging Check / 포장 검사',
  'Dimension Check / 치수 검사',
  'Weight Verification / 중량 확인',
  'Power Output / 출력 테스트',
  'Voltage Stability / 전압 안정성',
  'Response Time / 응답 시간',
];
const STANDARD_INSPECTION_COUNT = PRINT_INSPECTION_LABELS.length;
const BRANCH_CODE_MAP: Record<string, string> = {
  korea: 'KR',
  thailand: 'TH',
  vietnam: 'VT',
  malaysia: 'ML',
  brunei: 'BN',
};

function toYYYYMMDD(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const cleaned = value.slice(0, 10).replace(/-/g, '');
  return /^\d{8}$/.test(cleaned) ? cleaned : new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function detectBranchCode(orderNo?: string, station?: string) {
  const fromOrder = String(orderNo || '').toUpperCase().match(/^PDO([A-Z]{2})/);
  if (fromOrder?.[1]) return fromOrder[1];
  const stationKey = String(station || '').trim().toLowerCase();
  return BRANCH_CODE_MAP[stationKey] || 'KR';
}

function detectModelCode(product?: string) {
  const text = String(product || '').trim();
  const num = text.match(/(\d{2,3})\s*(?:kva|a)?/i)?.[1];
  if (num) return `${num}A`;
  return text ? text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) : 'MODEL';
}

function serialBase(date?: string, product?: string, orderNo?: string, station?: string) {
  return `ZE-KOR-C-${toYYYYMMDD(date)}-${detectModelCode(product)}-${detectBranchCode(orderNo, station)}`;
}

function buildSerialNo(base: string, seq: number) {
  return `${base}${String(seq).padStart(6, '0')}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function makeSerialNumbers(count: number, date?: string, product?: string, orderNo?: string, station?: string, prev: string[] = []) {
  const base = serialBase(date, product, orderNo, station);
  return Array.from({ length: Math.max(0, count) }, (_, i) => prev[i]?.trim() || buildSerialNo(base, i + 1));
}

function normalizeSerialInput(rawValue: string, base: string) {
  const raw = String(rawValue || '').trim().toUpperCase();
  if (!raw) return '';
  if (/^\d{1,6}$/.test(raw)) return buildSerialNo(base, Number(raw));

  const direct = raw.match(new RegExp(`^${escapeRegExp(base)}(\\d{1,6})$`));
  if (direct?.[1]) return buildSerialNo(base, Number(direct[1]));

  const compactBase = base.replace(/[^A-Z0-9]/g, '');
  const compactRaw = raw.replace(/[^A-Z0-9]/g, '');
  if (compactRaw.startsWith(compactBase)) {
    const rest = compactRaw.slice(compactBase.length);
    if (/^\d{1,6}$/.test(rest)) return buildSerialNo(base, Number(rest));
  }
  return raw;
}

function formatDateOnly(value?: string) {
  const text = String(value || '').trim();
  if (!text) return '-';
  return text.slice(0, 10);
}

export default function QAReportsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [bills, setBills] = useState<RepdoBill[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [billsError, setBillsError] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);
  const [form, setForm] = useState({ id: '', date: '', station: '', inspector: '', status: 'Pass', notes: '', billId: '', product: '', qty: 0, orderNumber: '', productionNumber: '', serialNumbers: [] as string[], inspections: makeInspections(STANDARD_INSPECTION_COUNT) });
  const { locale } = useLocale();
  const uiLocale = locale === 'th' ? 'en' : locale;
  const t = translations[uiLocale];
  const currentSerialBase = serialBase(form.date, form.product, form.orderNumber, form.station);

  async function readApiResponse(res: Response): Promise<{ success: boolean; error?: string }> {
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as { success?: boolean; error?: string; code?: string; errno?: number }
      if (obj.success) return { success: true };
      const details = [obj.error, obj.code, obj.errno ? `errno:${obj.errno}` : ''].filter(Boolean).join(' | ');
      return { success: false, error: details || `HTTP ${res.status}` };
    }
    return { success: false, error: text?.slice(0, 180) || `HTTP ${res.status}` };
  }

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/korea/qa-reports');
      const json = await res.json();
      if (Array.isArray(json)) {
        setReports(json);
        return;
      }
      if (json?.success && Array.isArray(json.data)) {
        setReports(json.data);
      }
    } catch (e) {
      console.error('fetchReports', e);
    }
  }, []);

  const fetchBills = useCallback(async () => {
    try {
      setBillsLoading(true);
      setBillsError('');
      const res = await fetch('/api/korea/production-reports', { cache: 'no-store' });
      const json = await res.json();
      const rows = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
      setBills(rows);
    } catch (e) {
      console.error('fetchBills', e);
      setBillsError(locale === 'ko' ? 'REPDO 빌을 불러오지 못했습니다.' : 'Failed to load REPDO bills.');
    } finally {
      setBillsLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchReports();
    fetchBills();
  }, [fetchReports, fetchBills]);

  const filtered = reports.filter((r) => {
    if (status !== 'all' && r.status.toLowerCase() !== status) return false;
    if (query && ![r.id, r.station, r.inspector, r.notes].join(' ').toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  const usedRepdoSet = new Set(
    reports
      .map((r) => String(r.billId || '').trim())
      .filter(Boolean)
  );
  const availableBills = bills.filter((b) => !usedRepdoSet.has(String(b.report_no || '').trim()));

  function openCreate() {
    fetchReports();
    fetchBills();
    setEditing(null);
    setForm({ id: '', date: '', station: '', inspector: '', status: 'Pass', notes: '', billId: '', product: '', qty: 0, orderNumber: '', productionNumber: '', serialNumbers: [], inspections: makeInspections(STANDARD_INSPECTION_COUNT) });
    setModalOpen(true);
  }

  function openEdit(r: Report) {
    if (r.isLocked) {
      alert(
        locale === 'ko'
          ? '이 청구서는 이미 배송/출고 문서에 사용되어 수정할 수 없습니다.'
          : 'This bill is already used for shipment/delivery and cannot be edited.'
      );
      return;
    }
    setEditing(r);
    const qty = r.qty || 0;
    const snArr = r.serialNumbers || Array.from({ length: qty }, () => '');
    setForm({
      id: r.id || '',
      date: formatDateOnly(r.date),
      station: r.station || '',
      inspector: r.inspector || '',
      status: r.status || 'Pass',
      notes: r.notes || '',
      billId: r.billId || '',
      product: r.product || '',
      qty,
      orderNumber: r.orderNumber || '',
      productionNumber: r.productionNumber || '',
      serialNumbers: snArr,
      inspections: (r.inspections && r.inspections.length > 0) ? r.inspections : makeInspections(STANDARD_INSPECTION_COUNT),
    });
    setModalOpen(true);
  }

  async function save() {
    let payload = { ...form };
    // Normalize serial numbers before save (auto-fix invalid/missing entries)
    const reqQty = form.qty || 0;
    if (reqQty > 0) {
      const snArrRaw = form.serialNumbers || [];
      const normalized = Array.from({ length: reqQty }, (_, i) => normalizeSerialInput(snArrRaw[i] || '', currentSerialBase));
      const pattern = new RegExp(`^${escapeRegExp(currentSerialBase)}\\d{6}$`);
      const snArr = normalized.map((value, i) => {
        if (!value) return buildSerialNo(currentSerialBase, i + 1);
        if (pattern.test(value)) return value;
        const trailing = String(value).match(/(\d{1,6})$/)?.[1];
        if (trailing) return buildSerialNo(currentSerialBase, Number(trailing));
        return buildSerialNo(currentSerialBase, i + 1);
      });
      setForm(prev => ({ ...prev, serialNumbers: snArr }));
      payload = { ...payload, serialNumbers: snArr };
    }
    try {
      if (editing) {
        const res = await fetch('/api/korea/qa-reports', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editing.id }),
        });
        const api = await readApiResponse(res);
        if (api.success) {
          await fetchReports();
          setModalOpen(false);
        } else {
          alert(api.error || (locale === 'ko' ? '저장에 실패했습니다.' : 'Failed to save report.'));
        }
      } else {
        const res = await fetch('/api/korea/qa-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const api = await readApiResponse(res);
        if (api.success) {
          await fetchReports();
          setModalOpen(false);
        } else {
          alert(api.error || (locale === 'ko' ? '저장에 실패했습니다.' : 'Failed to save report.'));
        }
      }
    } catch (e) {
      console.error('save', e);
      const message = e instanceof Error ? e.message : (locale === 'ko' ? '저장 중 오류가 발생했습니다.' : 'Unexpected error while saving.');
      alert(message);
    }
  }

  function importFromBill(billId: string) {
    const b = bills.find((x) => x.report_no === billId);
    if (!b) return;
    const qty = Number(b.quantity || 0);
    setForm({
      id: '',
      date: (b.created_at || new Date().toISOString()).slice(0, 10),
      station: b.branch_name || b.branch_key || 'Production',
      inspector: 'Auto',
      status: 'Pass',
      notes: `From REPDO ${b.report_no} (PDO: ${b.pdo_no})`,
      billId: b.report_no,
      product: b.product_name || '',
      qty,
      orderNumber: b.pdo_no || '',
      productionNumber: b.report_no || '',
      serialNumbers: makeSerialNumbers(qty, (b.created_at || new Date().toISOString()).slice(0, 10), b.product_name || '', b.pdo_no || '', b.branch_name || b.branch_key || 'Production'),
      inspections: makeInspections(STANDARD_INSPECTION_COUNT),
    });
  }

  function printReport(r: Report) {
    const win = window.open('', '_blank');
    if (!win) return;

    const normalizedReportStatus = String(r.status || '').toLowerCase();
    const displayOverallStatus =
      normalizedReportStatus === 'pass'
        ? 'Pass'
        : normalizedReportStatus === 'fail'
          ? 'Fail'
          : normalizedReportStatus === 'pending'
            ? 'Pending'
            : (r.status || '—');
    const statusColor = normalizedReportStatus === 'pass' ? '#16a34a' : normalizedReportStatus === 'fail' ? '#dc2626' : '#d97706';
    const unitStatusText =
      normalizedReportStatus === 'pass'
        ? '☑ Pass   ☐ Fail'
        : normalizedReportStatus === 'fail'
          ? '☐ Pass   ☑ Fail'
          : '☐ Pass   ☐ Fail';

    // Generate unit rows with serial numbers
    const unitQty = r.qty || 1;
    const snList = r.serialNumbers || [];
    const unitRows = Array.from({ length: unitQty }, (_, i) => {
      const sn = snList[i] || '—';
      return `<tr>
        <td style="text-align:center">${i + 1}</td>
        <td style="font-family:monospace;font-weight:600;letter-spacing:.5px">${sn}</td>
        <td>${r.product || '—'}</td>
        <td style="text-align:center">${unitStatusText}</td>
        <td></td>
      </tr>`;
    }).join('');
    const shouldSplitPages = unitQty > 4;
    const totalPages = shouldSplitPages ? 2 : 1;
    const inspectionRows = PRINT_INSPECTION_LABELS.map((label, i) => {
      const ins = (r.inspections || [])[i];
      const res = ins?.result || '—';
      const rem = ins?.remarks || '—';
      const rc = res === 'Pass' ? '#16a34a' : res === 'Fail' ? '#dc2626' : '#000';
      return `<tr><td style="text-align:center">${i + 2}</td><td>${label}</td><td style="color:${rc};font-weight:600">${res}</td><td>${rem}</td></tr>`;
    }).join('');
    const inspectionAndSignatureContent = `
      <div style="margin-top:12px;margin-bottom:6px;font-size:12px;font-weight:700;color:#000">Inspection Standard Record / 검사 표준 기록</div>
      <table class="styled-table">
        <thead>
          <tr>
            <th style="width:6%">No.</th>
            <th style="width:28%">Item / 항목</th>
            <th style="width:22%">Result / 결과</th>
            <th>Remarks / 비고</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align:center;font-weight:600">1</td>
            <td style="font-weight:600">Overall Status / 전체 상태</td>
            <td style="color:${statusColor};font-weight:600">${displayOverallStatus}</td>
            <td>${r.notes || '—'}</td>
          </tr>
          ${inspectionRows}
        </tbody>
      </table>
      <div class="sec-title">
        <div class="sec-icon" style="background:#faf5ff;color:#9333ea">✍️</div>
        <h3>Approval Signatures</h3><span class="ko">승인 서명</span>
      </div>
      <div class="sign-grid">
        <div class="sign-card">
          <div class="role">Inspector / 검사관</div>
          <div class="role-ko">Inspected by</div>
          <div class="sign-line"></div>
          <div class="name">${r.inspector}</div>
          <div class="date-lbl">Date / 날짜</div>
          <div class="date-line"></div>
        </div>
        <div class="sign-card">
          <div class="role">QA Manager / 품질관리</div>
          <div class="role-ko">Reviewed by</div>
          <div class="sign-line"></div>
          <div class="name">________________</div>
          <div class="date-lbl">Date / 날짜</div>
          <div class="date-line"></div>
        </div>
        <div class="sign-card">
          <div class="role">Director / 이사</div>
          <div class="role-ko">Approved by</div>
          <div class="sign-line"></div>
          <div class="name">________________</div>
          <div class="date-lbl">Date / 날짜</div>
          <div class="date-line"></div>
        </div>
      </div>
      <div class="generated">Generated: ${new Date().toLocaleString()} &nbsp;•&nbsp; Document ID: ${r.id}</div>
    `;

    const html = `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>QA Form ${r.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            *{margin:0;padding:0;box-sizing:border-box}
            body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:#000;background:#f8fafc;padding:0}
            .page{max-width:800px;margin:12px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
            .print-page{position:relative;padding-bottom:24px}
            .page-break{page-break-before:always}
            .page-number{text-align:right;font-size:9px;color:#000;opacity:.6;padding:0 24px 8px}
            
            /* Header */
            .header-bar{background:#fff;padding:16px 24px;display:flex;align-items:center;gap:14px;border-bottom:3px solid #1e3a8a}
            .logo-wrap{width:52px;height:52px;background:#f1f5f9;border-radius:10px;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0}
            .logo-wrap img{width:42px;height:42px;object-fit:contain;border-radius:6px}
            .header-text{flex:1;color:#000}
            .header-text .org{font-size:20px;font-weight:900;letter-spacing:-.3px;color:#000}
            .header-text .sub{font-size:12px;color:#000;margin-top:1px;font-weight:500}
            .header-text .dept{font-size:10px;color:#000;margin-top:2px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
            .header-text .addr{font-size:9px;color:#000;margin-top:3px;line-height:1.4;opacity:.7}
            .doc-id-badge{background:#f1f5f9;border:2px solid #1e3a8a;border-radius:6px;padding:6px 12px;text-align:center;color:#000}
            .doc-id-badge .lbl{font-size:8px;text-transform:uppercase;letter-spacing:1px;color:#000;font-weight:700}
            .doc-id-badge .val{font-size:14px;font-weight:900;margin-top:1px;letter-spacing:.3px;color:#000}

            /* Title strip */
            .title-strip{background:#1e3a8a;padding:10px 24px;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}
            .title-strip h2{color:#fff;font-size:14px;font-weight:800;letter-spacing:1px;text-transform:uppercase}
            .title-strip .sub{color:#fff;font-size:10px;margin-top:2px;font-weight:500}

            /* Content */
            .content{padding:16px 24px 12px}

            /* Section headers */
            .sec-title{display:flex;align-items:center;gap:6px;margin-bottom:8px;margin-top:14px}
            .sec-title:first-child{margin-top:0}
            .sec-icon{width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:11px}
            .sec-title h3{font-size:12px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:.4px}
            .sec-title .ko{font-size:10px;color:#000;font-weight:500;margin-left:4px;opacity:.7}

            /* Info cards */
            .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
            .info-card{background:#f8fafc;border:1px solid #d1d5db;border-radius:6px;padding:7px 10px}
            .info-card .lbl{font-size:9px;color:#000;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;opacity:.6}
            .info-card .val{font-size:13px;font-weight:700;color:#000}

            /* Tables */
            .styled-table{width:100%;border-collapse:separate;border-spacing:0;border-radius:6px;overflow:hidden;border:1px solid #d1d5db;margin-top:6px}
            .styled-table thead th{background:linear-gradient(180deg,#f3f4f6,#e5e7eb);padding:6px 10px;font-size:10px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:.4px;text-align:left;border-bottom:2px solid #d1d5db}
            .styled-table tbody td{padding:6px 10px;font-size:12px;color:#000;border-bottom:1px solid #f1f5f9}
            .styled-table tbody tr:last-child td{border-bottom:none}
            .styled-table tbody tr:hover{background:#f8fafc}
            .styled-table tbody th{padding:6px 10px;font-size:11px;font-weight:700;color:#000;background:#f8fafc;text-align:left;border-bottom:1px solid #f1f5f9;border-right:1px solid #d1d5db;width:30%}

            /* Signatures */
            .sign-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:16px}
            .sign-card{border:1px solid #d1d5db;border-radius:6px;padding:10px;text-align:center;background:#fafbfc}
            .sign-card .role{font-size:9px;font-weight:700;color:#000;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
            .sign-card .role-ko{font-size:8px;color:#000;opacity:.5;margin-bottom:18px}
            .sign-line{border-bottom:2px solid #9ca3af;margin:0 8px}
            .sign-card .name{font-size:10px;color:#000;margin-top:5px;font-weight:500}
            .sign-card .date-lbl{font-size:8px;color:#000;opacity:.5;margin-top:8px}
            .sign-card .date-line{border-bottom:1px dashed #9ca3af;margin:3px 16px 0}

            /* Footer */
            .footer{background:#f3f4f6;border-top:1px solid #d1d5db;padding:12px 24px;margin-top:14px}
            .footer-inner{display:flex;align-items:center;justify-content:space-between}
            .footer-brand{font-weight:700;font-size:12px;color:#1e40af}
            .footer-info{font-size:9px;color:#000;opacity:.5;line-height:1.6;text-align:right}
            .footer-copy{text-align:center;margin-top:8px;padding-top:8px;border-top:1px solid #d1d5db;font-size:8px;color:#000;opacity:.35;letter-spacing:.3px}

            /* Stamp */
            .generated{text-align:center;font-size:8px;color:#000;opacity:.4;margin-top:10px;letter-spacing:.3px}

            @media print{
              html,body{width:210mm;height:297mm}
              body{
                background:#fff;
                padding:0;
                font-size:11.5px;
                line-height:1.35;
                color:#000;
                -webkit-print-color-adjust:exact;
                print-color-adjust:exact;
                text-rendering:optimizeLegibility;
              }
              .page{margin:0;box-shadow:none;border-radius:0;max-width:100%;page-break-inside:auto}
              .header-bar{padding:10px 14px;gap:10px}
              .logo-wrap{width:44px;height:44px}
              .logo-wrap img{width:34px;height:34px}
              .header-text .org{font-size:17px;font-weight:900}
              .header-text .dept{font-size:10px;font-weight:700}
              .header-text .addr{font-size:9px;opacity:1}
              .doc-id-badge{padding:4px 8px}
              .doc-id-badge .val{font-size:13px}
              .title-strip{padding:8px 14px}
              .title-strip h2{font-size:13px}
              .title-strip .sub{font-size:10px}
              .content{padding:10px 14px 8px}
              .sec-title{margin-bottom:6px;margin-top:10px}
              .sec-icon{width:18px;height:18px;font-size:10px}
              .sec-title h3{font-size:12px}
              .sec-title .ko{font-size:10px}
              .info-grid{gap:4px}
              .info-card{padding:5px 8px}
              .info-card .lbl{font-size:9px}
              .info-card .val{font-size:12px}
              .styled-table thead th{padding:4px 6px;font-size:9.5px;font-weight:800}
              .styled-table tbody td{padding:4px 6px;font-size:11px}
              .styled-table tbody th{padding:4px 6px;font-size:10px}
              .sign-grid{gap:6px;margin-top:10px}
              .sign-card{padding:7px}
              .sign-card .role{font-size:9px}
              .sign-card .role-ko{font-size:8px;margin-bottom:12px}
              .sign-card .name{font-size:10px}
              .footer{padding:8px 14px;margin-top:8px}
              .footer-copy{margin-top:4px;padding-top:6px;font-size:8px;opacity:1}
              .generated{font-size:8px;margin-top:6px;opacity:1}
              .page-number{font-size:8px;padding:0 14px 4px;opacity:1}
              button{display:none!important}
              @page{size:A4;margin:4mm 5mm}
            }
          </style>
        </head>
        <body>
          <div class="page print-page">
            <div class="header-bar">
              <div class="logo-wrap"><img src="/zera-logo.png" alt="Zera Logo" /></div>
              <div class="header-text">
                <div class="org">Zera Co., Ltd.</div>
                <div class="dept">Quality Assurance Department / 품질보증부</div>
                <div class="addr">2F, 16-10, 166beon-gil, Elseso-ro, Gunpo-si, Gyeonggi-do, Korea<br/>Tel: +82 31-427-1380 | Email: info@zera-energy.com</div>
              </div>
              <div class="doc-id-badge"><div class="lbl">Report No.</div><div class="val">${r.id}</div></div>
            </div>
            <div class="title-strip">
              <h2>Quality Assurance Form / 품질보증 양식</h2>
              <div class="sub">Batch Quality Confirmation / 생산 로트 품질 확인서</div>
            </div>
            <div class="content">
              <div class="sec-title">
                <div class="sec-icon" style="background:#eff6ff;color:#2563eb">📋</div>
                <h3>Report Information</h3><span class="ko">보고서 정보</span>
              </div>
              <div class="info-grid">
                <div class="info-card">
                  <div class="lbl">Report ID / 보고서 번호</div>
                  <div class="val">${r.id}</div>
                </div>
                <div class="info-card">
                  <div class="lbl">Date / 날짜</div>
                  <div class="val">${formatDateOnly(r.date)}</div>
                </div>
                <div class="info-card">
                  <div class="lbl">Station / 작업장</div>
                  <div class="val">${r.station}</div>
                </div>
                <div class="info-card">
                  <div class="lbl">Inspector / 검사관</div>
                  <div class="val">${r.inspector}</div>
                </div>
              </div>
              <div class="sec-title">
                <div class="sec-icon" style="background:#f0fdf4;color:#16a34a">📦</div>
                <h3>Order &amp; Production</h3><span class="ko">주문 및 생산 정보</span>
              </div>
              <table class="styled-table">
                <tbody>
                  <tr><th>Order No. / 주문번호</th><td>${r.orderNumber || r.billId || '—'}</td></tr>
                  <tr><th>Production No. / 생산번호</th><td>${r.productionNumber || r.station || '—'}</td></tr>
                  <tr><th>Product / 제품</th><td>${r.product || '—'}</td></tr>
                  <tr><th>Quantity / 수량</th><td>${r.qty ?? '—'}</td></tr>
                </tbody>
              </table>
              <div class="sec-title">
                <div class="sec-icon" style="background:#fef3c7;color:#d97706">🔧</div>
                <h3>Unit Details</h3><span class="ko">개별 기기 상세</span>
              </div>
              <table class="styled-table">
                <thead>
                  <tr>
                    <th style="width:6%">No.</th>
                    <th style="width:24%">Serial No. / 시리얼번호</th>
                    <th style="width:22%">Product / 제품</th>
                    <th style="width:24%">Status / 상태</th>
                    <th>Notes / 비고</th>
                  </tr>
                </thead>
                <tbody>
                  ${unitRows}
                </tbody>
              </table>
              <div style="font-size:9px;color:#000;opacity:.5;margin-top:4px">Total: ${unitQty} unit(s) / 총 ${unitQty}대</div>
              ${!shouldSplitPages ? inspectionAndSignatureContent : ''}
            </div>
            ${!shouldSplitPages ? `<div class="footer"><div class="footer-copy">&copy; ${new Date().getFullYear()} Zera Co., Ltd. All rights reserved.</div></div>` : ''}
            <div class="page-number">Page 1 of ${totalPages}</div>
          </div>

          ${shouldSplitPages ? `<div class="page print-page page-break">
            <div class="content">
              ${inspectionAndSignatureContent}
            </div>
            <div class="footer">
              <div class="footer-copy">&copy; ${new Date().getFullYear()} Zera Co., Ltd. All rights reserved.</div>
            </div>
            <div class="page-number">Page 2 of ${totalPages}</div>
          </div>` : ''}
        </body>
      </html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
    setTimeout(() => { try { win.print(); } catch {} }, 350);
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t.qaTitle}</h1>
          <p className="text-gray-600">{t.qaDescription}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button onClick={() => window.history.back()} className="px-3 py-1 border rounded hover:bg-gray-50">{t.back}</button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Plus className="w-4 h-4"/> {t.addReport}</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.qaSearchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mt-3 md:mt-0 flex items-center gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">{t.allStatus}</option>
              <option value="pass">{t.pass}</option>
              <option value="fail">{t.fail}</option>
            </select>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {locale === 'ko' ? '검사 결과 목록' : 'Test Results List'} ({filtered.length})
          </h2>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            {locale === 'ko' ? '검사 추가' : 'Add Test Results'}
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Numbers</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.id}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDateOnly(r.date)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{r.station}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{r.inspector}</td>
                <td className={`px-4 py-3 text-sm font-semibold ${r.status === 'Pass' ? 'text-green-700' : 'text-red-700'}`}>{r.status}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.notes}</td>
                <td className="px-4 py-3 text-xs text-gray-700 font-mono max-w-[280px]">
                  {Array.isArray(r.serialNumbers) && r.serialNumbers.length > 0
                    ? r.serialNumbers.join(', ')
                    : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        disabled={Boolean(r.isLocked)}
                        className={`px-3 py-1 text-sm rounded ${r.isLocked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-yellow-100'}`}
                      >
                        {r.isLocked ? (locale === 'ko' ? 'Locked' : 'Locked') : t.viewDetails}
                      </button>
                      <button onClick={() => printReport(r)} className="px-3 py-1 text-sm bg-gray-100 rounded flex items-center gap-2"><Printer className="w-4 h-4"/> {t.print}</button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editing ? t.editQAReport : t.createQAReport}</h3>
              <button onClick={() => setModalOpen(false)}><X /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Station</label>
                <input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Inspector</label>
                <input value={form.inspector} onChange={(e) => setForm({ ...form, inspector: e.target.value })} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded">
                  <option>Pass</option>
                  <option>Fail</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input type="number" value={form.qty} onChange={(e) => {
                  const newQty = Number(e.target.value) || 0;
                  const prev = form.serialNumbers || [];
                  const serialNumbers = makeSerialNumbers(newQty, form.date, form.product, form.orderNumber, form.station, prev);
                  setForm({ ...form, qty: newQty, serialNumbers });
                }} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Order No.</label>
                <input value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Production No.</label>
                <input value={form.productionNumber} onChange={(e) => setForm({ ...form, productionNumber: e.target.value })} className="w-full px-3 py-2 border rounded" />
              </div>
              {/* Inspection Results */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Inspection Standard Record / 검사 표준 기록</label>
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 w-8">No.</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Item / 항목</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 w-28">Result / 결과</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Serial Numbers *</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: form.qty || 0 }, (_, i) => i).map((i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-1.5 text-center text-gray-500 font-bold">{i + 1}</td>
                          <td className="px-3 py-1.5 text-gray-800 text-xs">{form.product || '-'}</td>
                          <td className="px-2 py-1">
                            <select
                              value={form.inspections?.[i]?.result || form.status || ''}
                              onChange={(e) => {
                                const updated = [...(form.inspections || makeInspections(STANDARD_INSPECTION_COUNT))];
                                updated[i] = { ...updated[i], result: e.target.value };
                                setForm({ ...form, inspections: updated });
                              }}
                              className="w-full px-2 py-1 border rounded text-xs"
                            >
                              <option value="">—</option>
                              <option value="Pass">Pass</option>
                              <option value="Fail">Fail</option>
                              <option value="N/A">N/A</option>
                            </select>
                          </td>
                          <td className="px-2 py-1">
                            <input
                              value={form.serialNumbers?.[i] || ''}
                              onChange={(e) => {
                                const updated = [...(form.serialNumbers || [])];
                                updated[i] = e.target.value;
                                setForm({ ...form, serialNumbers: updated });
                              }}
                              onBlur={(e) => {
                                const updated = [...(form.serialNumbers || [])];
                                updated[i] = normalizeSerialInput(e.target.value, currentSerialBase);
                                setForm({ ...form, serialNumbers: updated });
                              }}
                              placeholder={buildSerialNo(currentSerialBase, i + 1)}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Checklist / 표준 체크리스트</label>
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 w-8">No.</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Item / 항목</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 w-28">Result / 결과</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600">Remarks / 비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PRINT_INSPECTION_LABELS.map((label, i) => (
                        <tr key={`check-${i}`} className="border-t">
                          <td className="px-3 py-1.5 text-center text-gray-500 font-bold">{i + 1}</td>
                          <td className="px-3 py-1.5 text-gray-800 text-xs">{label}</td>
                          <td className="px-2 py-1">
                            <select
                              value={form.inspections?.[i]?.result || ''}
                              onChange={(e) => {
                                const updated = [...(form.inspections || makeInspections(STANDARD_INSPECTION_COUNT))];
                                updated[i] = { ...updated[i], result: e.target.value };
                                setForm({ ...form, inspections: updated });
                              }}
                              className="w-full px-2 py-1 border rounded text-xs"
                            >
                              <option value="">—</option>
                              <option value="Pass">Pass</option>
                              <option value="Fail">Fail</option>
                              <option value="N/A">N/A</option>
                            </select>
                          </td>
                          <td className="px-2 py-1">
                            <input
                              value={form.inspections?.[i]?.remarks || ''}
                              onChange={(e) => {
                                const updated = [...(form.inspections || makeInspections(STANDARD_INSPECTION_COUNT))];
                                updated[i] = { ...updated[i], remarks: e.target.value };
                                setForm({ ...form, inspections: updated });
                              }}
                              placeholder="Remarks"
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  {locale === 'ko' ? 'REPDO 청구서에서 가져오기 (선택)' : 'Import from REPDO Bill (optional)'}
                </label>
                {billsError && (
                  <p className="mt-2 text-xs text-red-600">{billsError}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <select
                    onChange={(e) => importFromBill(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                    disabled={billsLoading}
                  >
                    <option value="">
                      {billsLoading
                        ? (locale === 'ko' ? '-- REPDO 빌 불러오는 중... --' : '-- Loading REPDO bills... --')
                        : (locale === 'ko' ? '-- REPDO 빌 선택 --' : '-- Select REPDO bill --')}
                    </option>
                    {availableBills.map((b) => (
                      <option key={b.report_no} value={b.report_no}>
                        {b.report_no} — {b.pdo_no} — {b.product_name || '-'} ({Number(b.quantity || 0)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded">{t.cancel}</button>
              <button onClick={save} className="px-4 py-2 bg-primary text-white rounded flex items-center gap-2"><Save className="w-4 h-4"/> {t.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
