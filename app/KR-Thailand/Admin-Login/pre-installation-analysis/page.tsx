'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Trash2, FileText, Zap, Activity, AlertTriangle, CheckCircle, XCircle, BarChart3, TrendingUp, Plus, Search, Eye, Download, Calendar, User, Building, Save, Upload, X, Table2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '../components/AdminLayout';

interface PhaseData {
  L1: number;
  L2: number;
  L3: number;
  N: number;
}

interface AnalysisData {
  id: string;
  branch: string;
  location: string;
  equipment: string;
  datetime: string;
  measurementPeriod: string;
  technician: string;
  voltage: string;
  frequency: number;
  powerFactor: number;
  thd: number;
  current: PhaseData;
  balance: 'Good' | 'Fair' | 'Poor';
  result: 'Recommended' | 'Not Recommended' | 'Further Analysis Required';
  recommendation: string;
  notes: string;
  recommendedProduct?: string;
  mainBreakerAmps?: number;
  // Engineer approval
  engineerName: string;
  engineerLicense: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvalDate: string;
  approverName: string;
}

// Helper functions
const generateDocumentNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 999) + 1;
  return `TH-PIA-${year}-${month}${day}-${String(random).padStart(3, '0')}`;
};

const getCurrentDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const formatDateTimeDisplay = (value?: string): string => {
  if (!value) return '';
  const trimmed = String(value).trim();

  // Already in expected style, just ensure single space between date/time
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const normalized = trimmed.replace(/\s+/, ' ');
    return /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(normalized)
      ? `${normalized}:00`
      : normalized;
  }

  // ISO-like: 2026-04-24T17:39:36.000Z or 2026-04-24T17:39:36
  const isoLike = trimmed.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})/);
  if (isoLike) return `${isoLike[1]} ${isoLike[2]}`;

  const dt = new Date(trimmed);
  if (!Number.isNaN(dt.getTime())) {
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const seconds = String(dt.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  return trimmed;
};

export default function ThailandPreInstallationAnalysis() {
  const router = useRouter();
  const { locale } = useLocale();
  const lang = locale === 'th' ? 'th' : 'en';
  const [view, setView] = useState<'form' | 'upload' | 'list'>('form');
  const batchTableRef = useRef<HTMLDivElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedCSVData, setUploadedCSVData] = useState<any[]>([]);
  const [uploadedFileData, setUploadedFileData] = useState<Record<string, { headers: string[]; rows: string[][]; error?: string }>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Per-meter per-phase upload
  const [selectedMeter, setSelectedMeter] = useState<1 | 2>(1);
  const [phaseFiles, setPhaseFiles] = useState<{ [meter: number]: { L1: File | null; L2: File | null; L3: File | null } }>({
    1: { L1: null, L2: null, L3: null },
    2: { L1: null, L2: null, L3: null },
  });
  const [phaseDragging, setPhaseDragging] = useState<{ [key: string]: boolean }>({});

  // AI parse state
  type PhaseRecord = { record_time: string; value: number; voltage: string; pf: string };
  type PhaseResult = { count: number; summary: { avg: number; peak: number; min: number }; preview: any[]; records: PhaseRecord[] };
  const [parseLoading, setParseLoading] = useState<{ [key: string]: boolean }>({});
  const [parseResults, setParseResults] = useState<{ [key: string]: PhaseResult }>({});
  const [parseError, setParseError] = useState<{ [key: string]: string }>({});
  const [activeBatchIdUpload, setActiveBatchIdUpload] = useState<string>(`batch_${Date.now()}`);
  const [showDetailTable, setShowDetailTable] = useState(false);
  const [detailPage, setDetailPage] = useState(0);
  const [savedToDB, setSavedToDB] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Upload section — customer selection (required before saving to DB)
  const [uploadCustomerName, setUploadCustomerName] = useState('');
  const [uploadCustomerLocation, setUploadCustomerLocation] = useState('');
  const [uploadCusID, setUploadCusID] = useState<number | null>(null);
  type UploadCusRow = { cusID: number; fullname: string; company: string; phone: string; address?: string };
  const [uploadCusSelected, setUploadCusSelected] = useState<UploadCusRow | null>(null);
  const [uploadCusQuery, setUploadCusQuery] = useState('');
  const [uploadCusResults, setUploadCusResults] = useState<UploadCusRow[]>([]);
  const [uploadCusOpen, setUploadCusOpen] = useState(false);
  const [uploadCusLoading, setUploadCusLoading] = useState(false);
  const [uploadCusError, setUploadCusError] = useState(false);
  const uploadCusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildAddress = (c: UploadCusRow) => c.address || '';

  const fetchUploadCustomers = async (q: string) => {
    setUploadCusLoading(true);
    try {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      const list: UploadCusRow[] = json.customers || [];
      setUploadCusResults(list);
      setUploadCusOpen(true);
    } catch { setUploadCusResults([]); setUploadCusOpen(true); } finally { setUploadCusLoading(false); }
  };

  const searchUploadCustomers = (q: string) => {
    setUploadCusQuery(q);
    setUploadCusSelected(null);
    setUploadCusError(false);
    if (q.length === 0) { setUploadCusOpen(false); setUploadCusResults([]); return; }
    setUploadCusOpen(true);
    if (uploadCusDebounceRef.current) clearTimeout(uploadCusDebounceRef.current);
    uploadCusDebounceRef.current = setTimeout(() => fetchUploadCustomers(q), 300);
  };

  const openUploadCusDropdown = () => {
    setUploadCusOpen(true);
    if (uploadCusResults.length === 0) fetchUploadCustomers(uploadCusQuery);
  };

  const parseUploadedCSVFile = (file: File) => {
    if (!file.name.match(/\.csv$/i)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result || '');
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length === 0) {
          setUploadedFileData(prev => ({ ...prev, [file.name]: { headers: [], rows: [], error: 'Empty CSV file' } }));
          return;
        }
        const parseLine = (line: string) =>
          line
            .split(',')
            .map(cell => cell.trim().replace(/^['"]|['"]$/g, ''));

        const headers = parseLine(lines[0]);
        const rows = lines.slice(1).map(parseLine);
        setUploadedFileData(prev => ({
          ...prev,
          [file.name]: { headers, rows },
        }));
      } catch {
        setUploadedFileData(prev => ({
          ...prev,
          [file.name]: { headers: [], rows: [], error: 'Failed to parse CSV' },
        }));
      }
    };
    reader.readAsText(file);
  };

  const setPhaseFile = (meter: number, phase: 'L1' | 'L2' | 'L3', file: File | null) => {
    const prevFile = phaseFiles[meter][phase];
    setPhaseFiles(prev => ({ ...prev, [meter]: { ...prev[meter], [phase]: file } }));
    const key = `${meter}-${phase}`;
    setParseResults(prev => { const n = { ...prev }; delete n[key]; return n; });
    setParseError(prev => { const n = { ...prev }; delete n[key]; return n; });
    setSavedToDB(false);
    setShowDetailTable(false);
    if (file) {
      setUploadedFiles(prev => {
        const withoutPrev = prevFile ? prev.filter(f => f.name !== prevFile.name) : prev;
        return [...withoutPrev.filter(f => f.name !== file.name), file];
      });
      parseUploadedCSVFile(file);
    } else if (prevFile) {
      setUploadedFiles(prev => prev.filter(f => f.name !== prevFile.name));
      setUploadedFileData(prev => {
        const next = { ...prev };
        delete next[prevFile.name];
        return next;
      });
    }
  };

  const parsePhaseFile = async (
    meter: number,
    phase: 'L1' | 'L2' | 'L3',
    mode: 'preview' | 'save' = 'preview',
    batchIdOverride?: string,
  ): Promise<PhaseResult | null> => {
    const file = phaseFiles[meter][phase];
    if (!file) return null;
    const key = `${meter}-${phase}`;
    setParseLoading(prev => ({ ...prev, [key]: true }));
    setParseError(prev => { const n = { ...prev }; delete n[key]; return n; });
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('meter', String(meter));
      fd.append('phase', phase);
      fd.append('batchId', batchIdOverride || activeBatchIdUpload);
      fd.append('action', mode);
      fd.append('customerName', uploadCustomerName);
      fd.append('location', uploadCustomerLocation);
      fd.append('cusID', uploadCusID ? String(uploadCusID) : '');
      const res = await fetch('/api/thailand/pre-install-parse-file', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Parse failed');
      setParseResults(prev => ({ ...prev, [key]: data }));
      return data as PhaseResult;
    } catch (e: any) {
      setParseError(prev => ({ ...prev, [key]: e.message }));
      return null;
    } finally {
      setParseLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const parseAllPhasesForMeter = async (meter: number) => {
    if (!uploadCusSelected) {
      setUploadCusError(true);
      setUploadError(lang === 'th' ? 'กรุณาเลือกลูกค้าจากฐานข้อมูลก่อน Generate' : 'Please select a customer from the database before generating');
      return;
    }

    const newBatchId = `batch_${uploadCusSelected.cusID || 'cus'}_${meter}_${Date.now()}`;
    setActiveBatchIdUpload(newBatchId);
    setShowDetailTable(false);
    setSavedToDB(false);
    setUploadSuccess(null);
    setUploadError(null);

    const results: { L1: PhaseResult | null; L2: PhaseResult | null; L3: PhaseResult | null } = { L1: null, L2: null, L3: null };
    const phaseFailures: string[] = [];
    for (const phase of ['L1', 'L2', 'L3'] as const) {
      if (phaseFiles[meter][phase]) {
        results[phase] = await parsePhaseFile(meter, phase, 'save', newBatchId);
        if (!results[phase]) {
          const key = `${meter}-${phase}`;
          phaseFailures.push(`${phase}: ${parseError[key] || (lang === 'th' ? 'อ่านไฟล์ไม่ได้' : 'Could not parse file')}`);
        }
      }
    }
    setShowDetailTable(true);

    const maxLen = Math.max(
      results.L1?.records?.length ?? 0,
      results.L2?.records?.length ?? 0,
      results.L3?.records?.length ?? 0,
    );

    if (maxLen > 0) {
      const parseRT = (rt: string) => {
        const value = String(rt || '').trim();
        const ymd = value.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})[T\s]+(\d{1,2}:\d{2})/);
        if (ymd) {
          const date = ymd[1]
            .replace(/\//g, '-')
            .split('-')
            .map((part, idx) => idx === 0 ? part.padStart(4, '0') : part.padStart(2, '0'))
            .join('-');
          return { date, time: ymd[2].padStart(5, '0') };
        }
        const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}:\d{2}))?/);
        if (dmy) return { date: `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`, time: dmy[4] ? dmy[4].padStart(5, '0') : '' };
        const hm = value.match(/(\d{1,2}:\d{2})/);
        return { date: '', time: hm ? hm[1].padStart(5, '0') : '' };
      };

      const records: CurrentRecord[] = Array.from({ length: Math.min(maxLen, 2000) }, (_, i) => {
        const l1 = results.L1?.records?.[i];
        const l2 = results.L2?.records?.[i];
        const l3 = results.L3?.records?.[i];
        const source = l1 || l2 || l3;
        const { date, time } = parseRT(source?.record_time || String(i + 1));
        return {
          id: i + 1,
          date,
          time,
          L1: l1 ? String(l1.value) : '',
          L2: l2 ? String(l2.value) : '',
          L3: l3 ? String(l3.value) : '',
          N: '',
          voltage: l1?.voltage || l2?.voltage || l3?.voltage || '380',
          pf: l1?.pf || l2?.pf || l3?.pf || '0.85',
          note: '',
        };
      });

      const customerName = uploadCustomerName || uploadCusSelected?.fullname || uploadCusSelected?.company || `Meter ${meter}`;
      const batch: CurrentBatch = {
        batchId: newBatchId,
        cusID: uploadCusSelected?.cusID ?? null,
        customerName: `${customerName} - Meter ${meter}`,
        location: uploadCustomerLocation || '',
        createdAt: getCurrentDateTime(),
        records,
      };

      const updated = [
        batch,
        ...batches.filter(b => b.batchId !== newBatchId),
      ];
      saveBatches(updated);
      setActiveBatchId(newBatchId);
      applyBatchToAnalysis(batch, false);
      setTimeout(() => batchTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      setUploadError(null);
      setUploadSuccess(lang === 'th' ? 'ดึงข้อมูลสำเร็จ แสดง Preview ใน Current Record Database และกำลัง Auto-save' : 'Preview loaded in Current Record Database and auto-save is running');
    } else {
      setUploadError(
        phaseFailures.length > 0
          ? phaseFailures.join(' | ')
          : (lang === 'th' ? 'ไม่พบข้อมูลที่อ่านได้จากไฟล์ กรุณาตรวจสอบรูปแบบไฟล์' : 'No readable data was found in the uploaded file(s). Please check the file format.')
      );
    }
  };

  const reloadBatches = () => {
    fetch('/api/thailand/pre-install-batches')
      .then(r => r.json())
      .then(d => {
        if (d.batches && d.batches.length > 0) {
          setBatches(d.batches);
          setActiveBatchId(d.batches[0].batchId);
        }
      })
      .catch(() => {});
  };

  const saveAllPhasesToDB = async (meter: number) => {
    if (!uploadCusSelected) {
      setUploadCusError(true);
      setUploadError(lang === 'th' ? 'กรุณาเลือกลูกค้าจากฐานข้อมูลก่อนบันทึก' : 'Please select a customer from the database before saving');
      return;
    }
    setIsSaving(true);
    setUploadSuccess(null);
    setUploadError(null);
    try {
      for (const phase of ['L1', 'L2', 'L3'] as const) {
        if (phaseFiles[meter][phase]) await parsePhaseFile(meter, phase, 'save', activeBatchIdUpload);
      }
      setSavedToDB(true);
      setUploadSuccess(lang === 'th' ? 'บันทึกลงฐานข้อมูลเรียบร้อยแล้ว' : 'Saved to database successfully');
      reloadBatches();
    } finally {
      setIsSaving(false);
    }
  };

  const clearAllUploads = () => {
    setUploadedFiles([]);
    setUploadedCSVData([]);
    setUploadedFileData({});
    setUploadSuccess(null);
    setUploadError(null);
    setSavedToDB(false);
    setShowDetailTable(false);
    setPhaseDragging({});
    setParseResults({});
    setParseError({});
    setParseLoading({});
    setActiveBatchIdUpload(`batch_${Date.now()}`);
    setPhaseFiles({
      1: { L1: null, L2: null, L3: null },
      2: { L1: null, L2: null, L3: null },
    });
  };

  const saveUploadedFilesToSystem = async () => {
    if (!uploadCusSelected) {
      setUploadCusError(true);
      setUploadError(lang === 'th' ? 'กรุณาเลือกลูกค้าจากฐานข้อมูลก่อนบันทึก' : 'Please select a customer from the database before saving');
      return;
    }

    const metersWithFiles = ([1, 2] as const).filter(meter =>
      (['L1', 'L2', 'L3'] as const).some(phase => !!phaseFiles[meter][phase])
    );

    if (metersWithFiles.length === 0) {
      setUploadError(lang === 'th' ? 'ยังไม่มีไฟล์ให้อัปโหลด' : 'No uploaded files to save');
      return;
    }

    setIsSaving(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      let savedPhases = 0;

      for (const meter of metersWithFiles) {
        const batchId = `batch_${uploadCusSelected.cusID || 'cus'}_${meter}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        for (const phase of ['L1', 'L2', 'L3'] as const) {
          if (!phaseFiles[meter][phase]) continue;
          const result = await parsePhaseFile(meter, phase, 'save', batchId);
          if (result) savedPhases += 1;
        }
      }

      if (savedPhases > 0) {
        setSavedToDB(true);
        reloadBatches();
        setUploadSuccess(
          lang === 'th'
            ? `บันทึกไฟล์ลงฐานข้อมูลสำเร็จ ${savedPhases} เฟส`
            : `Saved ${savedPhases} phase file(s) to database successfully`
        );
      } else {
        setUploadError(lang === 'th' ? 'ไม่พบข้อมูลที่บันทึกได้จากไฟล์' : 'No valid data found to save from uploaded files');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Customer Current Record Batches ----
  interface CurrentRecord {
    id: number;
    date: string;
    time: string;
    L1: string;
    L2: string;
    L3: string;
    N: string;
    voltage: string;
    pf: string;
    sourceFileL1?: string;
    sourceFileL2?: string;
    sourceFileL3?: string;
    note: string;
  }
  interface CurrentBatch {
    batchId: string;
    cusID?: number | null;
    customerName: string;
    location: string;
    createdAt: string;
    records: CurrentRecord[];
  }

  const [batches, setBatches] = useState<CurrentBatch[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [analysisBatchId, setAnalysisBatchId] = useState<string | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerLocation, setNewCustomerLocation] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [batchSaveStatus, setBatchSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const batchSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Power Calculator bills (fetched by cusID) ──
  const [powerCalcBills, setPowerCalcBills] = useState<any[]>([]);
  const [powerCalcBillsLoading, setPowerCalcBillsLoading] = useState(false);
  const [selectedBillCalcID, setSelectedBillCalcID] = useState<number | null>(null);
  const [showBillsPanel, setShowBillsPanel] = useState(true);

  // ── Power Calculator DB browser (fallback when cusID has no direct match) ──
  const [showUploadBillForm, setShowUploadBillForm] = useState(false);
  const [dbPowerCalcBills, setDbPowerCalcBills] = useState<any[]>([]);
  const [dbPowerCalcBillsLoading, setDbPowerCalcBillsLoading] = useState(false);
  const [dbPowerCalcBillsError, setDbPowerCalcBillsError] = useState<string | null>(null);
  const [dbPowerCalcBillsQuery, setDbPowerCalcBillsQuery] = useState('');

  // ── Customer DB search (upload section) ──
  type CusResult = { cusID: number; fullname: string; company: string; address: string; phone: string; email: string };
  const [cusQuery, setCusQuery] = useState('');
  const [cusResults, setCusResults] = useState<CusResult[]>([]);
  const [cusLoading, setCusLoading] = useState(false);
  const [cusOpen, setCusOpen] = useState(false);
  const cusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Customer DB search (form / Basic Information section) ──
  const [formCusQuery, setFormCusQuery] = useState('');
  const [formCusResults, setFormCusResults] = useState<CusResult[]>([]);
  const [formCusLoading, setFormCusLoading] = useState(false);
  const [formCusOpen, setFormCusOpen] = useState(false);
  const [formCusBatches, setFormCusBatches] = useState<CurrentBatch[]>([]);
  const formCusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formCusRef = useRef<HTMLDivElement>(null);

  const searchFormCustomers = (q: string) => {
    setFormCusQuery(q);
    if (formCusDebounceRef.current) clearTimeout(formCusDebounceRef.current);
    if (q.length === 0) { setFormCusResults([]); setFormCusOpen(false); setFormCusBatches([]); return; }
    formCusDebounceRef.current = setTimeout(async () => {
      setFormCusLoading(true);
      try {
        const res = await fetch(`/api/customers?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setFormCusResults(json.customers || []);
        setFormCusOpen(true);
      } catch { setFormCusResults([]); } finally { setFormCusLoading(false); }
    }, 300);
  };

  const selectFormCustomer = (c: CusResult) => {
    const displayName = c.fullname || c.company || '';
    setFormCusQuery(displayName);
    setFormCusOpen(false);
    setFormCusResults([]);
    // Find all batches for this customer (match by cusID or name)
    const matched = batches.filter(b =>
      (b.cusID != null && b.cusID === c.cusID) ||
      (b.customerName && (b.customerName.toLowerCase().includes(displayName.toLowerCase()) || displayName.toLowerCase().includes(b.customerName.replace(/ - Meter.*$/, '').trim().toLowerCase())))
    );
    setFormCusBatches(matched);
    if (matched.length === 1) {
      applyBatchToAnalysis(matched[0], false);
    } else if (matched.length > 1) {
      // Auto-load the most recent one; user can pick from sub-list
      const latest = matched.sort((a, b2) => new Date(b2.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];
      applyBatchToAnalysis(latest, false);
    } else {
      // No batch found – at least fill address
      setFormData(prev => ({
        ...prev,
        location: c.address || prev.location,
      }));
    }
  };

  const searchCustomers = (q: string) => {
    setCusQuery(q);
    setNewCustomerName(q);
    if (cusDebounceRef.current) clearTimeout(cusDebounceRef.current);
    if (q.length === 0) { setCusResults([]); setCusOpen(false); return; }
    cusDebounceRef.current = setTimeout(async () => {
      setCusLoading(true);
      try {
        const res = await fetch(`/api/customers?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setCusResults(json.customers || []);
        setCusOpen(true);
      } catch { setCusResults([]); } finally { setCusLoading(false); }
    }, 300);
  };

  const selectCustomer = (c: CusResult) => {
    const displayName = c.fullname || c.company || '';
    setNewCustomerName(displayName);
    setCusQuery(displayName);
    if (!newCustomerLocation) setNewCustomerLocation(c.address || c.company || '');
    setCusOpen(false);
    setCusResults([]);
  };

  const saveBatches = (updated: CurrentBatch[]) => {
    setBatches(updated);
    setBatchSaveStatus('saving');
    if (batchSaveTimerRef.current) clearTimeout(batchSaveTimerRef.current);
    batchSaveTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/thailand/pre-install-batches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batches: updated }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || json?.success === false) throw new Error(json?.error || 'save failed');
        setBatchSaveStatus('saved');
        setTimeout(() => setBatchSaveStatus('idle'), 2500);
      } catch (e: any) {
        setUploadError(`${lang === 'th' ? 'บันทึกอัตโนมัติไม่สำเร็จ' : 'Auto-save failed'}: ${e.message || 'Unknown error'}`);
        setBatchSaveStatus('error');
      }
    }, 500);
  };

  const activeBatch = batches.find(b => b.batchId === activeBatchId) ?? null;
  const analysisBatch = batches.find(b => b.batchId === analysisBatchId) ?? null;

  const toNumeric = (value: string | number | undefined | null) => {
    const parsed = parseFloat(String(value ?? '').replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatBatchTimestamp = (row: CurrentRecord) => {
    const date = String(row.date || '').trim();
    const time = String(row.time || '').trim();
    if (date && time) {
      const ymd = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (ymd) return `${ymd[3]}/${ymd[2]} ${time}`;
      return `${date} ${time}`;
    }
    return date || time || `#${row.id}`;
  };

  const parseHourValue = (value: string) => {
    const match = String(value || '').match(/(\d{1,2}):(\d{2})/);
    return match ? parseInt(match[1], 10) : -1;
  };

  const parseBatchTimestampMs = (row: CurrentRecord): number | null => {
    const date = String(row.date || '').trim();
    const timeRaw = String(row.time || '').trim();
    if (!date || !timeRaw) return null;
    const time = /^\d{2}:\d{2}$/.test(timeRaw) ? `${timeRaw}:00` : timeRaw;
    const dt = new Date(`${date}T${time}`);
    return Number.isNaN(dt.getTime()) ? null : dt.getTime();
  };

  const sampleSeries = <T,>(rows: T[], maxPoints = 240) => {
    const step = Math.max(1, Math.ceil(rows.length / maxPoints));
    return rows.filter((_, idx) => idx % step === 0 || idx === rows.length - 1);
  };

  const analysisCurrentRows = analysisBatch
    ? analysisBatch.records
        .filter(r => r.L1 !== '' || r.L2 !== '' || r.L3 !== '' || r.N !== '')
        .map((row) => {
          const L1 = toNumeric(row.L1);
          const L2 = toNumeric(row.L2);
          const L3 = toNumeric(row.L3);
          const N = toNumeric(row.N);
          const activePhaseValues = [L1, L2, L3].filter(v => v > 0);
          const avgCurrent = activePhaseValues.length > 0
            ? activePhaseValues.reduce((sum, val) => sum + val, 0) / activePhaseValues.length
            : 0;
          const voltage = toNumeric(row.voltage) || toNumeric(formData.voltage) || 380;
          const pf = toNumeric(row.pf) || formData.powerFactor || 0.85;
          const powerKw = avgCurrent > 0 ? (Math.sqrt(3) * voltage * avgCurrent * pf) / 1000 : 0;
          const label = formatBatchTimestamp(row);
          const hour = parseHourValue(row.time || label);
          const dateKey = row.date || label.split(' ')[0] || `row-${row.id}`;
          const timestampMs = parseBatchTimestampMs(row);
          return {
            time: label,
            dateKey,
            hour,
            timestampMs,
            phaseA: L1,
            phaseB: L2,
            phaseC: L3,
            neutral: N,
            voltage,
            pf,
            powerKw,
          };
        })
    : [];

  const groupedPowerByDate = analysisCurrentRows.reduce<Record<string, { day: number[]; night: number[] }>>((acc, row) => {
    if (!acc[row.dateKey]) acc[row.dateKey] = { day: [], night: [] };
    if (row.hour >= 8 && row.hour <= 16) acc[row.dateKey].day.push(row.powerKw);
    if (row.hour >= 0 && row.hour <= 4) acc[row.dateKey].night.push(row.powerKw);
    return acc;
  }, {});

  const analysisPowerRows = analysisCurrentRows.map((row) => {
    const byDate = groupedPowerByDate[row.dateKey] || { day: [], night: [] };
    const avgDay = byDate.day.length ? byDate.day.reduce((sum, val) => sum + val, 0) / byDate.day.length : row.powerKw;
    const night = byDate.night.length ? byDate.night.reduce((sum, val) => sum + val, 0) / byDate.night.length : row.powerKw;
    return {
      time: row.time,
      peak: row.powerKw,
      avgDay,
      night,
    };
  });

  const displayedCurrentData = analysisCurrentRows.length > 0
    ? sampleSeries(analysisCurrentRows)
    : getFallbackCurrentData();
  const displayedPowerData = analysisPowerRows.length > 0
    ? sampleSeries(analysisPowerRows)
    : getFallbackPowerData();

  const metricCurrentRows = analysisCurrentRows.length > 0 ? analysisCurrentRows : getFallbackCurrentData();
  const metricPowerRows = analysisPowerRows.length > 0 ? analysisPowerRows : getFallbackPowerData();

  // Separate valid (non-zero) rows per phase for accurate per-phase stats
  const metricValidA = metricCurrentRows.filter(d => d.phaseA > 0);
  const metricValidB = metricCurrentRows.filter(d => d.phaseB > 0);
  const metricValidC = metricCurrentRows.filter(d => d.phaseC > 0);
  // Per-phase peaks only from rows where that phase is measured
  const metricPeakA = metricValidA.length ? Math.max(...metricValidA.map(d => d.phaseA)) : 0;
  const metricPeakB = metricValidB.length ? Math.max(...metricValidB.map(d => d.phaseB)) : 0;
  const metricPeakC = metricValidC.length ? Math.max(...metricValidC.map(d => d.phaseC)) : 0;
  // Per-phase averages only from rows where that phase is measured (exclude zeros)
  const metricAvgA = metricValidA.length ? metricValidA.reduce((s, d) => s + d.phaseA, 0) / metricValidA.length : 0;
  const metricAvgB = metricValidB.length ? metricValidB.reduce((s, d) => s + d.phaseB, 0) / metricValidB.length : 0;
  const metricAvgC = metricValidC.length ? metricValidC.reduce((s, d) => s + d.phaseC, 0) / metricValidC.length : 0;
  const metricNightRows = metricCurrentRows.filter(d => d.time.includes('00:00') || d.time.includes('04:00') || (typeof (d as any).hour === 'number' && (d as any).hour >= 0 && (d as any).hour <= 4));
  const metricDayRows = metricCurrentRows.filter(d => d.time.includes('08:00') || d.time.includes('12:00') || d.time.includes('16:00') || (typeof (d as any).hour === 'number' && (d as any).hour >= 8 && (d as any).hour <= 16));
  const metricNightA = metricNightRows.filter(d => d.phaseA > 0).length ? metricNightRows.filter(d => d.phaseA > 0).reduce((s, d) => s + d.phaseA, 0) / metricNightRows.filter(d => d.phaseA > 0).length : 0;
  const metricNightB = metricNightRows.filter(d => d.phaseB > 0).length ? metricNightRows.filter(d => d.phaseB > 0).reduce((s, d) => s + d.phaseB, 0) / metricNightRows.filter(d => d.phaseB > 0).length : 0;
  const metricNightC = metricNightRows.filter(d => d.phaseC > 0).length ? metricNightRows.filter(d => d.phaseC > 0).reduce((s, d) => s + d.phaseC, 0) / metricNightRows.filter(d => d.phaseC > 0).length : 0;
  const metricDayA = metricDayRows.filter(d => d.phaseA > 0).length ? metricDayRows.filter(d => d.phaseA > 0).reduce((s, d) => s + d.phaseA, 0) / metricDayRows.filter(d => d.phaseA > 0).length : 0;
  const metricDayB = metricDayRows.filter(d => d.phaseB > 0).length ? metricDayRows.filter(d => d.phaseB > 0).reduce((s, d) => s + d.phaseB, 0) / metricDayRows.filter(d => d.phaseB > 0).length : 0;
  const metricDayC = metricDayRows.filter(d => d.phaseC > 0).length ? metricDayRows.filter(d => d.phaseC > 0).reduce((s, d) => s + d.phaseC, 0) / metricDayRows.filter(d => d.phaseC > 0).length : 0;

  // Per-row NEMA imbalance (IEC 60034-26): max_deviation_from_avg / avg — only rows with all 3 phases measured
  const metricAllPhaseRows = metricCurrentRows.filter(d => d.phaseA > 0 && d.phaseB > 0 && d.phaseC > 0);
  const rowImbalances = metricAllPhaseRows.map(r => {
    const avg3 = (r.phaseA + r.phaseB + r.phaseC) / 3;
    const maxDev = Math.max(Math.abs(r.phaseA - avg3), Math.abs(r.phaseB - avg3), Math.abs(r.phaseC - avg3));
    return avg3 > 0 ? (maxDev / avg3) * 100 : 0;
  });
  const metricAvgImbalance = rowImbalances.length ? rowImbalances.reduce((s, v) => s + v, 0) / rowImbalances.length : 0;
  const metricMaxImbalance = rowImbalances.length ? Math.max(...rowImbalances) : 0;
  // metricPeakImbalance = per-row average imbalance (NEMA/IEC formula, accurate)
  const metricPeakImbalance = metricAvgImbalance;

  const powerPeakDemand = metricPowerRows.length ? Math.max(...metricPowerRows.map(d => d.peak)) : 0;
  const powerNightValues = metricPowerRows.map(d => d.night).filter(v => v > 0);
  const powerDayValues = metricPowerRows.map(d => d.avgDay).filter(v => v > 0);
  const powerNightMin = powerNightValues.length ? Math.min(...powerNightValues) : 0;
  const powerNightMax = powerNightValues.length ? Math.max(...powerNightValues) : 0;
  const powerDayMin = powerDayValues.length ? Math.min(...powerDayValues) : 0;
  const powerDayMax = powerDayValues.length ? Math.max(...powerDayValues) : 0;
  const powerOverallAvgRaw = metricPowerRows.length ? metricPowerRows.reduce((sum, row) => sum + row.peak, 0) / metricPowerRows.length : 0;
  const intervalEnergyStats = (() => {
    const timedRows = analysisCurrentRows
      .filter((row): row is (typeof analysisCurrentRows[number] & { timestampMs: number }) =>
        typeof (row as any).timestampMs === 'number' && Number.isFinite((row as any).timestampMs)
      )
      .sort((a, b) => a.timestampMs - b.timestampMs);

    if (timedRows.length < 2) {
      return {
        hasIntervals: false,
        coverageHours: 0,
        energyKwh: 0,
        avgKw: 0,
      };
    }

    let coverageHours = 0;
    let energyKwh = 0;

    for (let i = 0; i < timedRows.length - 1; i += 1) {
      const current = timedRows[i];
      const next = timedRows[i + 1];
      const dtHours = (next.timestampMs - current.timestampMs) / (1000 * 60 * 60);
      // Ignore invalid or too-large gaps to avoid over-estimation from sparse data.
      if (dtHours <= 0 || dtHours > 24) continue;
      const p1 = current.powerKw || 0;
      const p2 = next.powerKw || p1;
      energyKwh += ((p1 + p2) / 2) * dtHours;
      coverageHours += dtHours;
    }

    const avgKw = coverageHours > 0 ? energyKwh / coverageHours : 0;
    return {
      hasIntervals: coverageHours > 0,
      coverageHours,
      energyKwh,
      avgKw,
    };
  })();

  const powerOverallAvg = intervalEnergyStats.hasIntervals ? intervalEnergyStats.avgKw : powerOverallAvgRaw;
  const loadFactor = powerPeakDemand > 0 ? (powerOverallAvg / powerPeakDemand) * 100 : 0;
  const powerPeakRows = metricPowerRows.filter(row => row.peak >= powerPeakDemand * 0.95);
  const peakHourLabel = (() => {
    if (powerPeakRows.length === 0) return lang === 'th' ? 'ไม่มีข้อมูล' : 'No data';
    const first = powerPeakRows[0].time.match(/(\d{1,2}:\d{2})/)?.[1] || powerPeakRows[0].time;
    const last = powerPeakRows[powerPeakRows.length - 1].time.match(/(\d{1,2}:\d{2})/)?.[1] || powerPeakRows[powerPeakRows.length - 1].time;
    const minPeak = Math.min(...powerPeakRows.map(r => r.peak));
    const maxPeak = Math.max(...powerPeakRows.map(r => r.peak));
    return lang === 'th'
      ? `${first}-${last} โดยมีการใช้สูงสุด ${minPeak.toFixed(1)}-${maxPeak.toFixed(1)} kW`
      : `${first}-${last} with highest consumption ${minPeak.toFixed(1)}-${maxPeak.toFixed(1)} kW`;
  })();

  const createBatch = () => {
    if (!newCustomerName.trim()) return;
    const batch: CurrentBatch = {
      batchId: `batch_${Date.now()}`,
      customerName: newCustomerName.trim(),
      location: newCustomerLocation.trim(),
      createdAt: getCurrentDateTime(),
      records: Array.from({ length: 7 }, (_, i) => ({
        id: i + 1, date: '', time: '00:00',
        L1: '', L2: '', L3: '', N: '', voltage: '380', pf: '0.85', sourceFileL1: '', sourceFileL2: '', sourceFileL3: '', note: '',
      })),
    };
    const updated = [batch, ...batches];
    saveBatches(updated);
    setActiveBatchId(batch.batchId);
    setNewCustomerName('');
    setNewCustomerLocation('');
    setShowNewCustomerForm(false);
  };

  const deleteBatch = (batchId: string) => {
    if (!confirm(lang === 'th' ? 'ยืนยันการลบชุดข้อมูลนี้?' : 'Delete this batch?')) return;
    const updated = batches.filter(b => b.batchId !== batchId);
    setBatches(updated);
    setActiveBatchId(updated.length > 0 ? updated[0].batchId : null);
    fetch(`/api/thailand/pre-install-batches?batchId=${encodeURIComponent(batchId)}`, { method: 'DELETE' }).catch(() => {});
  };

  const updateBatchRecord = (batchId: string, recordId: number, field: keyof CurrentRecord, value: string) => {
    saveBatches(batches.map(b => b.batchId !== batchId ? b : {
      ...b,
      records: b.records.map(r => r.id === recordId ? { ...r, [field]: value } : r),
    }));
  };

  const addBatchRow = (batchId: string) => {
    saveBatches(batches.map(b => b.batchId !== batchId ? b : {
      ...b,
      records: [...b.records, {
        id: Date.now(), date: '', time: '00:00',
        L1: '', L2: '', L3: '', N: '', voltage: '380', pf: '0.85', sourceFileL1: '', sourceFileL2: '', sourceFileL3: '', note: '',
      }],
    }));
  };

  const deleteBatchRow = (batchId: string, recordId: number) => {
    saveBatches(batches.map(b => b.batchId !== batchId ? b : {
      ...b,
      records: b.records.filter(r => r.id !== recordId),
    }));
  };

  const applyBatchToAnalysis = (batch: CurrentBatch, switchView = true) => {
    const filled = batch.records.filter(r => r.L1 !== '' || r.L2 !== '' || r.L3 !== '');
    if (filled.length === 0) { alert(lang === 'th' ? 'ยังไม่มีข้อมูลในชุดนี้' : 'No data in this batch'); return; }
    // Exclude zero/missing values so that rows with unmeasured phases don't pull down the average
    const avg = (key: 'L1'|'L2'|'L3'|'N') => {
      const vals = filled.map(r => parseFloat((r as any)[key] || '0')).filter(v => v > 0);
      return vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
    };
    const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
    const sourceParts = [
      unique(filled.map(r => r.sourceFileL1 || '')).length ? `L1: ${unique(filled.map(r => r.sourceFileL1 || '')).join(', ')}` : '',
      unique(filled.map(r => r.sourceFileL2 || '')).length ? `L2: ${unique(filled.map(r => r.sourceFileL2 || '')).join(', ')}` : '',
      unique(filled.map(r => r.sourceFileL3 || '')).length ? `L3: ${unique(filled.map(r => r.sourceFileL3 || '')).join(', ')}` : '',
    ].filter(Boolean);
    const avgL1 = parseFloat(avg('L1').toFixed(1));
    const avgL2 = parseFloat(avg('L2').toFixed(1));
    const avgL3 = parseFloat(avg('L3').toFixed(1));
    const avgN  = parseFloat(avg('N').toFixed(1));
    // IEC 60034-26 NEMA formula: max_deviation_from_avg / avg * 100
    const phases3 = [avgL1, avgL2, avgL3].filter(v => v > 0);
    const avgCur3 = phases3.length > 0 ? phases3.reduce((s, v) => s + v, 0) / phases3.length : 0;
    const maxDev3 = phases3.length > 0 ? Math.max(...phases3.map(v => Math.abs(v - avgCur3))) : 0;
    const imbalancePct = avgCur3 > 0 ? (maxDev3 / avgCur3) * 100 : 0;
    const computedBalance: AnalysisData['balance'] = imbalancePct < 5 ? 'Good' : imbalancePct < 10 ? 'Fair' : 'Poor';
    setFormData(prev => ({
      ...prev,
      location: batch.location || prev.location,
      current: { L1: avgL1, L2: avgL2, L3: avgL3, N: avgN },
      balance: computedBalance,
      voltage: filled[0].voltage || prev.voltage,
      powerFactor: parseFloat(filled[0].pf) || prev.powerFactor,
      notes: sourceParts.length > 0
        ? (() => {
            const sourceLine = `${lang === 'th' ? 'ไฟล์ที่ดึงข้อมูล' : 'Source files'}: ${sourceParts.join(' | ')}`;
            if (!prev.notes) return sourceLine;
            return prev.notes.includes(sourceLine) ? prev.notes : `${prev.notes}\n${sourceLine}`;
          })()
        : prev.notes,
    }));
    setAnalysisBatchId(batch.batchId);
    setActiveBatchId(batch.batchId);
    if (switchView) setView('form');
  };

  const loadBatchToForm = (batch: CurrentBatch) => {
    applyBatchToAnalysis(batch, true);
  };
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('thailand');

  const [formData, setFormData] = useState<AnalysisData>({
    id: generateDocumentNumber(),
    branch: 'Thailand',
    location: '',
    equipment: 'Fluke 438-II Motor Analyzer',
    datetime: getCurrentDateTime(),
    measurementPeriod: '7 days',
    technician: '',
    voltage: '380',
    frequency: 50.0,
    powerFactor: 0.85,
    thd: 0,
    current: { L1: 156.3, L2: 142.9, L3: 168.7, N: 22.1 },
    balance: 'Fair',
    result: 'Recommended',
    recommendation: 'Large current difference between L3 and L2 phases. UPS system inspection and load redistribution required.',
    notes: 'Harmonics and phase imbalance due to UPS system, review after improvement',
    recommendedProduct: 'KSAVER 150KVA',
    mainBreakerAmps: 0,
    engineerName: '',
    engineerLicense: '',
    approvalStatus: 'Pending',
    approvalDate: getCurrentDateTime(),
    approverName: '',
  });

  const branches = [
    { id: 'thailand', name: lang === 'th' ? 'ไทย' : 'Thailand', countryCode: 'TH' as const },
    { id: 'vietnam', name: lang === 'th' ? 'เวียดนาม' : 'Vietnam', countryCode: 'VN' as const },
    { id: 'brunei', name: lang === 'th' ? 'บรูไน' : 'Brunei', countryCode: 'BN' as const },
    { id: 'korea', name: lang === 'th' ? 'เกาหลี' : 'Korea', countryCode: 'KR' as const },
  ];

  // Load analyses and batches from MySQL on mount
  useEffect(() => {
    fetch('/api/thailand/pre-install-analysis')
      .then(r => r.json())
      .then(d => { if (d.analyses) setAnalyses(d.analyses.map((a: any) => ({
        ...a,
        current: { L1: a.current_L1, L2: a.current_L2, L3: a.current_L3, N: a.current_N },
      }))); })
      .catch(() => {});
    fetch('/api/thailand/pre-install-batches')
      .then(r => r.json())
      .then(d => {
        if (d.batches && d.batches.length > 0) {
          setBatches(d.batches);
          setActiveBatchId(d.batches[0].batchId);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setDetailPage(0);
  }, [selectedMeter, showDetailTable, parseResults]);

  // Fetch power-calculator bills when active batch customer changes
  useEffect(() => {
    const cusID = activeBatch?.cusID;
    if (!cusID) {
      setPowerCalcBills([]);
      setSelectedBillCalcID(null);
      return;
    }
    setPowerCalcBillsLoading(true);
    fetch(`/api/power-calculations?cusID=${cusID}&limit=20`)
      .then(r => r.json())
      .then(json => {
        const rows: any[] = json.rows || [];
        setPowerCalcBills(rows);
        if (rows.length > 0) setSelectedBillCalcID(rows[0].calcID);
        else setSelectedBillCalcID(null);
      })
      .catch(() => { setPowerCalcBills([]); setSelectedBillCalcID(null); })
      .finally(() => setPowerCalcBillsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBatch?.cusID]);

  const openDbBillBrowser = async () => {
    setShowUploadBillForm(true);
    setDbPowerCalcBillsLoading(true);
    setDbPowerCalcBillsError(null);
    const queryHint = (activeBatch?.customerName || '').replace(/\s*-\s*Meter\s+\d+\s*$/i, '').trim();
    setDbPowerCalcBillsQuery(queryHint);
    try {
      const cusID = activeBatch?.cusID;
      const url = cusID
        ? `/api/power-calculations?cusID=${cusID}&limit=100`
        : `/api/power-calculations?limit=100`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error || 'Failed to load power calculations');
      }
      setDbPowerCalcBills(json.rows || []);
    } catch (err: any) {
      setDbPowerCalcBills([]);
      setDbPowerCalcBillsError(err?.message || (lang === 'th' ? 'โหลดข้อมูลบิลไม่สำเร็จ' : 'Failed to load bills'));
    } finally {
      setDbPowerCalcBillsLoading(false);
    }
  };

  const selectDbBillForCalculation = (bill: any) => {
    setPowerCalcBills(prev => {
      const withoutSelected = prev.filter((row: any) => row.calcID !== bill.calcID);
      return [bill, ...withoutSelected];
    });
    setSelectedBillCalcID(bill.calcID);
    setShowUploadBillForm(false);
    setShowBillsPanel(true);
  };

  // ── CSV parser for 30-second interval data ──────────────────────────────
  const parseCSVFiles = (files: File[]) => {
    const csvFiles = files.filter(f => f.name.match(/\.csv$/i));
    if (csvFiles.length === 0) return;
    const allRows: { time: string; L1: number; L2: number; L3: number; N: number }[] = [];
    let done = 0;
    csvFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { done++; if (done === csvFiles.length) setUploadedCSVData([...allRows]); return; }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[\'"]/g, ''));
        const find = (pats: string[]) => { for (const p of pats) { const i = headers.findIndex(h => h.includes(p)); if (i >= 0) return i; } return -1; };
        const tIdx = find(['timestamp','datetime','time','date']);
        const l1Idx = find(['l1','phase a','phasea','ia','phase_a','a1','current a','curr_a','current 1','current1','current_1']);
        const l2Idx = find(['l2','phase b','phaseb','ib','phase_b','a2','current b','curr_b']);
        const l3Idx = find(['l3','phase c','phasec','ic','phase_c','a3','current c','curr_c']);
        const nIdx  = find(['neutral','phase n','l_n','n_current','in_']);
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/[\'"]/g, ''));
          const L1 = l1Idx >= 0 ? parseFloat(cols[l1Idx]) || 0 : 0;
          const L2 = l2Idx >= 0 ? parseFloat(cols[l2Idx]) || 0 : 0;
          const L3 = l3Idx >= 0 ? parseFloat(cols[l3Idx]) || 0 : 0;
          if (L1 > 0 || L2 > 0 || L3 > 0) {
            allRows.push({ time: tIdx >= 0 ? cols[tIdx] : `${i}`, L1, L2, L3, N: nIdx >= 0 ? parseFloat(cols[nIdx]) || 0 : 0 });
          }
        }
        done++;
        if (done === csvFiles.length) setUploadedCSVData([...allRows]);
      };
      reader.readAsText(file);
    });
  };

  // Power consumption data for 7 days
  function getFallbackPowerData() {
    return [
    { time: '20/02 00:00', peak: 12.3, avgDay: 12.3, night: 12.3 },
    { time: '20/02 04:00', peak: 15.1, avgDay: 15.1, night: 15.1 },
    { time: '20/02 08:00', peak: 89.2, avgDay: 89.2, night: 25.4 },
    { time: '20/02 12:00', peak: 165.8, avgDay: 138.5, night: 35.2 },
    { time: '20/02 16:00', peak: 171.3, avgDay: 142.7, night: 28.9 },
    { time: '20/02 20:00', peak: 68.9, avgDay: 68.9, night: 22.1 },
    { time: '21/02 00:00', peak: 13.7, avgDay: 13.7, night: 13.7 },
    { time: '21/02 04:00', peak: 16.2, avgDay: 16.2, night: 16.2 },
    { time: '21/02 08:00', peak: 92.1, avgDay: 92.1, night: 26.8 },
    { time: '21/02 12:00', peak: 158.4, avgDay: 131.2, night: 38.7 },
    { time: '21/02 16:00', peak: 167.9, avgDay: 139.8, night: 31.5 },
    { time: '21/02 20:00', peak: 71.3, avgDay: 71.3, night: 24.6 },
    { time: '22/02 00:00', peak: 11.5, avgDay: 11.5, night: 11.5 },
    { time: '22/02 04:00', peak: 14.8, avgDay: 14.8, night: 14.8 },
    { time: '22/02 08:00', peak: 95.7, avgDay: 95.7, night: 28.3 },
    { time: '22/02 12:00', peak: 170.2, avgDay: 141.8, night: 39.4 },
    { time: '22/02 16:00', peak: 175.1, avgDay: 146.2, night: 32.8 },
    { time: '22/02 20:00', peak: 69.4, avgDay: 69.4, night: 23.7 },
    ];
  }

  // Current data for phases
  function getFallbackCurrentData() {
    return [
    { time: '20/02 00:00', phaseA: 25.3, phaseB: 22.1, phaseC: 28.7 },
    { time: '20/02 04:00', phaseA: 30.1, phaseB: 27.2, phaseC: 32.6 },
    { time: '20/02 08:00', phaseA: 145.2, phaseB: 138.9, phaseC: 156.3 },
    { time: '20/02 12:00', phaseA: 268.7, phaseB: 251.4, phaseC: 282.1 },
    { time: '20/02 16:00', phaseA: 275.9, phaseB: 258.2, phaseC: 289.7 },
    { time: '20/02 20:00', phaseA: 112.4, phaseB: 105.8, phaseC: 118.9 },
    { time: '21/02 00:00', phaseA: 27.1, phaseB: 24.6, phaseC: 30.2 },
    { time: '21/02 04:00', phaseA: 31.8, phaseB: 28.9, phaseC: 34.1 },
    { time: '21/02 08:00', phaseA: 148.9, phaseB: 142.1, phaseC: 159.7 },
    { time: '21/02 12:00', phaseA: 261.3, phaseB: 244.7, phaseC: 275.8 },
    { time: '21/02 16:00', phaseA: 272.1, phaseB: 255.6, phaseC: 286.4 },
    { time: '21/02 20:00', phaseA: 115.7, phaseB: 108.9, phaseC: 122.3 },
    ];
  }

  // IEC 60034-26 / NEMA: imbalance = max_deviation_from_avg / avg * 100
  const calculateBalance = (current: PhaseData): 'Good' | 'Fair' | 'Poor' => {
    const phases = [current.L1, current.L2, current.L3].filter(v => v > 0);
    if (phases.length < 2) return 'Good';
    const avg = phases.reduce((s, v) => s + v, 0) / phases.length;
    const maxDev = Math.max(...phases.map(v => Math.abs(v - avg)));
    const imbalance = avg > 0 ? (maxDev / avg) * 100 : 0;
    if (imbalance < 5) return 'Good';
    if (imbalance < 10) return 'Fair';
    return 'Poor';
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('current.')) {
      const currentField = field.split('.')[1] as keyof PhaseData;
      const newCurrent = { ...formData.current, [currentField]: Number(value) };
      const balance = calculateBalance(newCurrent);
      setFormData({
        ...formData,
        current: newCurrent,
        balance
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/thailand/pre-install-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('save failed');
      setAnalyses(prev => {
        const exists = prev.find(a => a.id === formData.id);
        return exists ? prev.map(a => a.id === formData.id ? formData : a) : [...prev, formData];
      });
      setFormData({
        id: generateDocumentNumber(),
        branch: 'Thailand',
        location: '',
        equipment: 'Fluke 438-II Motor Analyzer',
        datetime: getCurrentDateTime(),
        measurementPeriod: '7 days',
        technician: '',
        voltage: '380',
        frequency: 50.0,
        powerFactor: 0.85,
        thd: 0,
        current: { L1: 0, L2: 0, L3: 0, N: 0 },
        balance: 'Good',
        result: 'Recommended',
        recommendation: '',
        notes: '',
        engineerName: '',
        engineerLicense: '',
        approvalStatus: 'Pending',
        approvalDate: getCurrentDateTime(),
        approverName: '',
      });
      alert(lang === 'th' ? 'บันทึกข้อมูลเรียบร้อยแล้ว' : 'Data saved successfully');
    } catch {
      alert(lang === 'th' ? 'เกิดข้อผิดพลาดในการบันทึก' : 'Failed to save data');
    }
  };

  const t = {
    title: lang === 'th' ? 'การวิเคราะห์ก่อนติดตั้ง KSAVE' : 'Pre-Installation Current Analysis',
    subtitle: lang === 'th' ? 'วิเคราะห์กระแสไฟฟ้าและคุณภาพไฟฟ้าก่อนติดตั้ง' : 'Current and Power Quality Analysis Before Installation',
    documentNo: lang === 'th' ? 'เลขที่เอกสาร' : 'Document No',
    location: lang === 'th' ? 'สถานที่' : 'Location',
    equipment: lang === 'th' ? 'อุปกรณ์ที่ใช้' : 'Equipment Used',
    datetime: lang === 'th' ? 'วันที่และเวลา' : 'Date & Time',
    technician: lang === 'th' ? 'ช่างเทคนิค' : 'Technician',
    voltage: lang === 'th' ? 'แรงดันไฟฟ้า (V)' : 'Voltage (V)',
    frequency: lang === 'th' ? 'ความถี่ (Hz)' : 'Frequency (Hz)',
    powerFactor: lang === 'th' ? 'ตัวประกอบกำลัง' : 'Power Factor',
    thd: lang === 'th' ? 'THD (%)' : 'THD (%)',
    currentMeasurement: lang === 'th' ? 'การวัดกระแสไฟฟ้า' : 'Current Measurement',
    phase: lang === 'th' ? 'เฟส' : 'Phase',
    current: lang === 'th' ? 'กระแส (A)' : 'Current (A)',
    balance: lang === 'th' ? 'ความสมดุล' : 'Balance',
    result: lang === 'th' ? 'ผลการประเมิน' : 'Result',
    recommendation: lang === 'th' ? 'คำแนะนำ' : 'Recommendation',
    notes: lang === 'th' ? 'หมายเหตุ' : 'Notes',
    save: lang === 'th' ? 'บันทึก' : 'Save',
    cancel: lang === 'th' ? 'ยกเลิก' : 'Cancel',
    form: lang === 'th' ? 'แบบฟอร์ม' : 'Form',
    list: lang === 'th' ? 'รายการ' : 'List',
    powerGraph: lang === 'th' ? 'กราฟพลังงาน 7 วัน' : '7-Day Power Graph',
    currentGraph: lang === 'th' ? 'กราฟกระแสไฟฟ้า' : 'Current Graph',
    engineerApproval: lang === 'th' ? 'การอนุมัติและรับรองโดยวิศวกร' : 'Engineer Certification & Approval',
    engineerName: lang === 'th' ? 'ชื่อวิศวกร / ผู้รับรอง' : 'Engineer / Certifier Name',
    engineerLicense: lang === 'th' ? 'เลขที่ใบอนุญาตวิศวกร' : 'Engineer License No.',
    approvalStatus: lang === 'th' ? 'สถานะการอนุมัติ' : 'Approval Status',
    approverName: lang === 'th' ? 'ชื่อผู้อนุมัติ' : 'Approver Name',
    approvalDate: lang === 'th' ? 'วันที่อนุมัติ' : 'Approval Date',
    signaturePlaceholder: lang === 'th' ? 'ลายเซ็นวิศวกร' : 'Engineer Signature',
    back: lang === 'th' ? 'กลับ' : 'Back',
  };

  const getBalanceColor = (balance: string) => {
    if (balance === 'Good') return 'text-green-600 bg-green-100';
    if (balance === 'Fair') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getResultColor = (result: string) => {
    if (result === 'Recommended') return 'text-green-600 bg-green-100';
    if (result === 'Not Recommended') return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/KR-Thailand/Admin-Login/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.back}</span>
          </button>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{t.title}</h1>
                  <p className="text-gray-600 mt-1">{t.subtitle}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setView('form')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    view === 'form'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  {t.form}
                </button>
                <button
                  onClick={() => setView('upload')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    view === 'upload'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Upload className="w-5 h-5 inline mr-2" />
                  {lang === 'th' ? 'อัพโหลด' : 'Upload'}
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    view === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Search className="w-5 h-5 inline mr-2" />
                  {t.list} ({analyses.length})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload View */}
        {view === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <Upload className="w-6 h-6 mr-2 text-green-600" />
                {lang === 'th' ? 'อัพโหลดข้อมูลกระแสไฟฟ้าก่อนติดตั้ง' : 'Upload Pre-Installation Current Data'}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {lang === 'th'
                  ? 'อัพโหลดไฟล์ข้อมูลกระแสไฟฟ้าที่เทสไว้ก่อนการติดตั้งเป็นเวลา 7 วัน (CSV / Excel / PDF)'
                  : 'Upload 7-day pre-installation current test data files (CSV / Excel / PDF)'}
              </p>

              {/* Customer Name — required before saving */}
              <div className={`mb-6 p-4 rounded-xl border-2 transition-colors ${
                uploadCusError && !uploadCusSelected ? 'bg-red-50 border-red-300' :
                uploadCusSelected ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-200'
              }`}>
                <p className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-blue-600" />
                  {lang === 'th' ? 'ค้นหาลูกค้าจากฐานข้อมูล' : 'Search Customer from Database'}
                  <span className="text-red-500 font-bold">* {lang === 'th' ? '(จำเป็น)' : '(required)'}</span>
                </p>

                {/* Selected customer card */}
                {uploadCusSelected ? (
                  <div className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-green-300 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{uploadCusSelected.fullname || uploadCusSelected.company}</p>
                        {uploadCusSelected.company && uploadCusSelected.fullname && (
                          <p className="text-xs text-gray-500">{uploadCusSelected.company}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">ID: {uploadCusSelected.cusID}{uploadCusSelected.phone ? ` · ${uploadCusSelected.phone}` : ''}</p>
                        {buildAddress(uploadCusSelected) && (
                          <p className="text-xs text-blue-600 mt-0.5">📍 {buildAddress(uploadCusSelected)}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUploadCusSelected(null);
                        setUploadCusID(null);
                        setUploadCustomerName('');
                        setUploadCusQuery('');
                        setUploadCustomerLocation('');
                        setSavedToDB(false);
                      }}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-lg transition flex-shrink-0"
                    >
                      {lang === 'th' ? 'เปลี่ยน' : 'Change'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[260px]">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={uploadCusQuery}
                        onChange={e => searchUploadCustomers(e.target.value)}
                        onBlur={() => setTimeout(() => setUploadCusOpen(false), 200)}
                        onFocus={openUploadCusDropdown}
                        placeholder={lang === 'th' ? 'พิมพ์ชื่อลูกค้าเพื่อค้นหาจากฐานข้อมูล...' : 'Type to search customers from database...'}
                        className={`w-full pl-9 pr-9 py-2.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 ${
                          uploadCusError ? 'border-red-400 focus:ring-red-300 bg-red-50' : 'border-blue-300 focus:ring-blue-300 bg-white'
                        }`}
                      />
                      {uploadCusLoading && (
                        <span className="absolute right-3 top-3 w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                      )}
                      {uploadCusOpen && uploadCusResults.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-56 overflow-auto">
                          {uploadCusResults.map(c => (
                            <button
                              key={c.cusID}
                              onMouseDown={() => {
                                const name = c.fullname || c.company || '';
                                setUploadCustomerName(name);
                                setUploadCusQuery(name);
                                setUploadCustomerLocation(buildAddress(c));
                                setUploadCusID(c.cusID);
                                setUploadCusSelected(c);
                                setUploadCusOpen(false);
                                setUploadCusError(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0 flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-700">
                                {(c.fullname || c.company || '?')[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{c.fullname}</p>
                                <p className="text-xs text-gray-400 truncate">
                                  ID: {c.cusID}{c.company ? ` · ${c.company}` : ''}
                                </p>
                                {buildAddress(c) && (
                                  <p className="text-xs text-blue-500 truncate">📍 {buildAddress(c)}</p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {uploadCusOpen && uploadCusResults.length === 0 && uploadCusQuery.length > 0 && !uploadCusLoading && (
                        <div className="absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 px-4 py-3 text-sm text-gray-400">
                          {lang === 'th' ? 'ไม่พบลูกค้าในฐานข้อมูล' : 'No customers found'}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {uploadCusError && !uploadCusSelected && (
                  <p className="text-xs text-red-600 mt-2 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {lang === 'th' ? 'กรุณาเลือกลูกค้าจากฐานข้อมูลก่อนบันทึก' : 'Please select a customer from the database before saving'}
                  </p>
                )}
              </div>

              {/* Meter Selector */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm font-semibold text-gray-700">{lang === 'th' ? 'เลือกมิเตอร์:' : 'Select Meter:'}</span>
                {([1, 2] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMeter(m)}
                    className={`px-5 py-2 rounded-lg font-semibold border-2 transition-all ${
                      selectedMeter === m
                        ? 'bg-green-600 text-white border-green-600 shadow'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {lang === 'th' ? `มิเตอร์ ${m}` : `Meter ${m}`}
                  </button>
                ))}
                {/* indicator if both meters have files */}
                {([1, 2] as const).map(m => {
                  const mf = phaseFiles[m];
                  const count = [mf.L1, mf.L2, mf.L3].filter(Boolean).length;
                  return count > 0 ? (
                    <span key={m} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                      {lang === 'th' ? `มิเตอร์ ${m}: ${count}/3 เฟส` : `Meter ${m}: ${count}/3 phases`}
                    </span>
                  ) : null;
                })}
              </div>

              {/* Phase Upload Zones */}
              <div className="grid grid-cols-3 gap-4">
                {(['L1', 'L2', 'L3'] as const).map((phase, pi) => {
                  const phaseColors = [
                    { border: 'border-blue-400', bg: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-700', activeBg: 'bg-blue-100' },
                    { border: 'border-yellow-400', bg: 'bg-yellow-50', dot: 'bg-yellow-500', text: 'text-yellow-700', activeBg: 'bg-yellow-100' },
                    { border: 'border-red-400', bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-700', activeBg: 'bg-red-100' },
                  ][pi];
                  const file = phaseFiles[selectedMeter][phase];
                  const dragKey = `${selectedMeter}-${phase}`;
                  const dragging = !!phaseDragging[dragKey];
                  const inputId = `phase-input-${selectedMeter}-${phase}`;
                  return (
                    <div key={phase}>
                      <div className={`flex items-center gap-2 mb-2`}>
                        <div className={`w-3 h-3 rounded-full ${phaseColors.dot}`} />
                        <span className={`font-bold text-base ${phaseColors.text}`}>{phase}</span>
                        <span className="text-xs text-gray-400">{lang === 'th' ? 'เฟส' : 'Phase'} {pi + 1}</span>
                      </div>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setPhaseDragging(p => ({ ...p, [dragKey]: true })); }}
                        onDragLeave={() => setPhaseDragging(p => ({ ...p, [dragKey]: false }))}
                        onDrop={(e) => {
                          e.preventDefault();
                          setPhaseDragging(p => ({ ...p, [dragKey]: false }));
                          const files = Array.from(e.dataTransfer.files);
                          const f = files.find(f => f.name.match(/\.(csv|xlsx|xls|pdf)$/i));
                          if (f) setPhaseFile(selectedMeter, phase, f);
                          else setUploadError(lang === 'th' ? 'รองรับเฉพาะ CSV, Excel, PDF' : 'Only CSV, Excel, PDF supported');
                        }}
                        onClick={() => document.getElementById(inputId)?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all min-h-[140px] flex flex-col items-center justify-center gap-2 ${
                          dragging
                            ? `${phaseColors.border} ${phaseColors.activeBg}`
                            : file
                            ? `${phaseColors.border} ${phaseColors.bg}`
                            : 'border-gray-300 bg-gray-50 hover:' + phaseColors.border
                        }`}
                      >
                        <input
                          id={inputId}
                          type="file"
                          accept=".csv,.xlsx,.xls,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) { setPhaseFile(selectedMeter, phase, f); setUploadSuccess(null); setUploadError(null); }
                            e.target.value = '';
                          }}
                        />
                        {file ? (
                          <>
                            <CheckCircle className={`w-8 h-8 ${phaseColors.text}`} />
                            <p className={`text-xs font-semibold ${phaseColors.text} break-all text-center px-1`}>{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                            <button
                              onClick={(e) => { e.stopPropagation(); setPhaseFile(selectedMeter, phase, null); }}
                              className="mt-1 text-xs text-red-500 hover:underline"
                            >
                              {lang === 'th' ? 'ลบ' : 'Remove'}
                            </button>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <p className="text-sm font-medium text-gray-500">
                              {lang === 'th' ? 'วางไฟล์หรือคลิก' : 'Drop or click'}
                            </p>
                            <p className="text-xs text-gray-400">CSV / Excel / PDF</p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Generate Button — always visible */}
              <div className="mt-6 flex items-center justify-between gap-4 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="w-4 h-4" />
                  {(['L1','L2','L3'] as const).some(p => phaseFiles[selectedMeter][p]) ? (
                    <>
                      {(['L1','L2','L3'] as const).filter(p => phaseFiles[selectedMeter][p]).map((p, i) => (
                        <span key={p} className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: ['#dbeafe','#fef9c3','#fee2e2'][i], color: ['#1d4ed8','#92400e','#b91c1c'][i] }}>{p}</span>
                      ))}
                      <span className="text-gray-400">Meter {selectedMeter}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">{lang === 'th' ? 'อัพโหลดไฟล์อย่างน้อย 1 เฟสก่อน Generate' : 'Upload at least 1 phase file to Generate'}</span>
                  )}
                </div>
                <button
                  onClick={() => parseAllPhasesForMeter(selectedMeter)}
                  disabled={
                    !uploadCusSelected ||
                    !(['L1','L2','L3'] as const).some(p => phaseFiles[selectedMeter][p]) ||
                    (['L1','L2','L3'] as const).some(p => parseLoading[`${selectedMeter}-${p}`])
                  }
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-base shadow-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {(['L1','L2','L3'] as const).some(p => parseLoading[`${selectedMeter}-${p}`]) ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {lang === 'th' ? 'กำลัง Generate...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generate
                    </>
                  )}
                </button>
              </div>

              {/* Per-phase loading badges */}
              {(['L1','L2','L3'] as const).some(p => parseLoading[`${selectedMeter}-${p}`]) && (
                <div className="mt-3 flex gap-3">
                  {(['L1','L2','L3'] as const).map((phase, pi) => {
                    const key = `${selectedMeter}-${phase}`;
                    if (!parseLoading[key]) return null;
                    return (
                      <div key={phase} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700 font-medium">
                        <span className="w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                        {lang === 'th' ? `กำลังอ่าน ${phase}...` : `Reading ${phase}...`}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Alerts */}
              {uploadError && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />{uploadError}
                </div>
              )}
              {uploadSuccess && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />{uploadSuccess}
                </div>
              )}
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Table2 className="w-5 h-5 mr-2 text-blue-600" />
                  {lang === 'th' ? `ไฟล์ที่อัพโหลด (${uploadedFiles.length} ไฟล์)` : `Uploaded Files (${uploadedFiles.length})`}
                </h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => {
                    const ext = file.name.split('.').pop()?.toLowerCase();
                    const iconColor = ext === 'pdf' ? 'text-red-500' : ext === 'csv' ? 'text-green-600' : 'text-blue-600';
                    const bgColor = ext === 'pdf' ? 'bg-red-50' : ext === 'csv' ? 'bg-green-50' : 'bg-blue-50';
                    const borderColor = ext === 'pdf' ? 'border-red-200' : ext === 'csv' ? 'border-green-200' : 'border-blue-200';
                    return (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${bgColor} ${borderColor}`}>
                        <div className="flex items-center gap-3">
                          <FileText className={`w-5 h-5 ${iconColor}`} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB · {ext?.toUpperCase()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const target = uploadedFiles[idx];
                            setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                            if (target) {
                              setUploadedFileData(prev => {
                                const next = { ...prev };
                                delete next[target.name];
                                return next;
                              });
                            }
                          }}
                          className="p-1 hover:bg-gray-200 rounded-lg transition"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={clearAllUploads}
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    {lang === 'th' ? 'ล้างทั้งหมด' : 'Clear All'}
                  </button>
                  <button
                    onClick={saveUploadedFilesToSystem}
                    disabled={isSaving || uploadedFiles.length === 0}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        {lang === 'th' ? 'กำลังบันทึก...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {lang === 'th' ? 'บันทึกลงระบบ' : 'Save to System'}
                      </>
                    )}
                  </button>
                </div>

                {/* Show all CSV rows for each uploaded file */}
                {uploadedFiles.map((file) => {
                  const parsed = uploadedFileData[file.name];
                  if (!file.name.match(/\.csv$/i)) {
                    return (
                      <div key={`data-${file.name}`} className="mt-4 p-3 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-500">
                        {lang === 'th'
                          ? `ไฟล์ ${file.name} ไม่ใช่ CSV จึงไม่แสดงตารางข้อมูลในส่วนนี้`
                          : `${file.name} is not a CSV file, so tabular preview is not shown here.`}
                      </div>
                    );
                  }
                  return (
                    <div key={`data-${file.name}`} className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-gray-700">
                          {lang === 'th' ? `ข้อมูลทั้งหมดในไฟล์: ${file.name}` : `All rows in file: ${file.name}`}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {parsed ? `${parsed.rows.length.toLocaleString()} ${lang === 'th' ? 'แถว' : 'rows'}` : (lang === 'th' ? 'กำลังอ่านไฟล์...' : 'Reading file...')}
                        </span>
                      </div>

                      {parsed?.error ? (
                        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-600">
                          {lang === 'th' ? `อ่านไฟล์ไม่สำเร็จ: ${parsed.error}` : `Failed to parse file: ${parsed.error}`}
                        </div>
                      ) : parsed ? (
                        <div className="overflow-auto max-h-[380px] border border-gray-200 rounded-lg">
                          <table className="min-w-full text-xs">
                            <thead className="bg-gray-100 sticky top-0 z-10">
                              <tr>
                                <th className="px-2 py-2 border-b border-gray-200 text-left text-gray-600 w-12">#</th>
                                {parsed.headers.map((h, i) => (
                                  <th key={`${file.name}-h-${i}`} className="px-2 py-2 border-b border-gray-200 text-left text-gray-700 whitespace-nowrap">
                                    {h || `Column ${i + 1}`}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {parsed.rows.map((row, rowIdx) => (
                                <tr key={`${file.name}-r-${rowIdx}`} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-2 py-1 border-b border-gray-100 text-gray-400">{rowIdx + 1}</td>
                                  {parsed.headers.map((_, colIdx) => (
                                    <td key={`${file.name}-c-${rowIdx}-${colIdx}`} className="px-2 py-1 border-b border-gray-100 text-gray-700 whitespace-nowrap">
                                      {row[colIdx] ?? ''}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Generated Detail Table */}
            {showDetailTable && (['L1','L2','L3'] as const).some(p => parseResults[`${selectedMeter}-${p}`]) && (() => {
              const r1 = parseResults[`${selectedMeter}-L1`];
              const r2 = parseResults[`${selectedMeter}-L2`];
              const r3 = parseResults[`${selectedMeter}-L3`];

              // Build combined rows aligned by index (zip)
              const maxLen = Math.max(r1?.records?.length ?? 0, r2?.records?.length ?? 0, r3?.records?.length ?? 0);
              const rows = Array.from({ length: maxLen }, (_, i) => ({
                time: r1?.records?.[i]?.record_time ?? r2?.records?.[i]?.record_time ?? r3?.records?.[i]?.record_time ?? String(i + 1),
                L1: r1?.records?.[i]?.value ?? null,
                L2: r2?.records?.[i]?.value ?? null,
                L3: r3?.records?.[i]?.value ?? null,
                voltage: r1?.records?.[i]?.voltage ?? r2?.records?.[i]?.voltage ?? r3?.records?.[i]?.voltage ?? '',
                pf: r1?.records?.[i]?.pf ?? r2?.records?.[i]?.pf ?? r3?.records?.[i]?.pf ?? '',
              }));

              const PAGE_SIZE = 50;
              const totalPages = Math.ceil(rows.length / PAGE_SIZE);
              const safeDetailPage = Math.min(detailPage, Math.max(0, totalPages - 1));
              const pageRows = rows.slice(safeDetailPage * PAGE_SIZE, (safeDetailPage + 1) * PAGE_SIZE);

              return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Table2 className="w-5 h-5 text-green-600" />
                        {lang === 'th' ? `ข้อมูลที่ดึงได้ — มิเตอร์ ${selectedMeter}` : `Generated Data — Meter ${selectedMeter}`}
                        <span className="text-sm font-normal text-gray-400">({rows.length.toLocaleString()} {lang === 'th' ? 'แถว' : 'rows'})</span>
                      </h3>
                      {savedToDB ? (
                        <p className="text-xs text-green-600 mt-0.5 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {lang === 'th' ? 'บันทึกลงฐานข้อมูลแล้ว' : 'Saved to database'}
                        </p>
                      ) : (
                        <button
                          onClick={() => saveAllPhasesToDB(selectedMeter)}
                          disabled={isSaving}
                          className="mt-1.5 flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              {lang === 'th' ? 'กำลังบันทึก...' : 'Saving...'}
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              {lang === 'th' ? 'บันทึกลงฐานข้อมูล' : 'Save to Database'}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {/* Summary badges */}
                      {([['L1', r1, 'bg-blue-100 text-blue-700'], ['L2', r2, 'bg-yellow-100 text-yellow-700'], ['L3', r3, 'bg-red-100 text-red-700']] as [string, PhaseResult|undefined, string][]).map(([ph, res]) =>
                        res ? (
                          <div key={ph} className="text-center">
                            <div className={`px-3 py-1 rounded-lg text-xs font-bold ${ph === 'L1' ? 'bg-blue-100 text-blue-700' : ph === 'L2' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-700'}`}>
                              {ph}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">Peak: <span className="font-semibold text-red-600">{res.summary.peak}A</span></div>
                            <div className="text-xs text-gray-500">Avg: <span className="font-semibold text-blue-600">{res.summary.avg}A</span></div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 w-8">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{lang === 'th' ? 'เวลา' : 'Timestamp'}</th>
                          {r1 && <th className="px-4 py-3 text-right text-xs font-semibold text-blue-600">L1 (A)</th>}
                          {r2 && <th className="px-4 py-3 text-right text-xs font-semibold text-yellow-600">L2 (A)</th>}
                          {r3 && <th className="px-4 py-3 text-right text-xs font-semibold text-red-600">L3 (A)</th>}
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Voltage</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">PF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.map((row, i) => {
                          const rowIdx = safeDetailPage * PAGE_SIZE + i;
                          const isEven = i % 2 === 0;
                          return (
                            <tr key={rowIdx} className={`border-b border-gray-100 ${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors`}>
                              <td className="px-4 py-2 text-xs text-gray-400">{rowIdx + 1}</td>
                              <td className="px-4 py-2 text-xs text-gray-700 font-mono">{row.time}</td>
                              {r1 && <td className="px-4 py-2 text-right text-xs font-semibold text-blue-700">{row.L1 != null ? row.L1.toFixed(1) : '—'}</td>}
                              {r2 && <td className="px-4 py-2 text-right text-xs font-semibold text-yellow-700">{row.L2 != null ? row.L2.toFixed(1) : '—'}</td>}
                              {r3 && <td className="px-4 py-2 text-right text-xs font-semibold text-red-700">{row.L3 != null ? row.L3.toFixed(1) : '—'}</td>}
                              <td className="px-4 py-2 text-right text-xs text-gray-500">{row.voltage || '—'}</td>
                              <td className="px-4 py-2 text-right text-xs text-gray-500">{row.pf || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-gray-500">
                        {lang === 'th' ? `หน้า ${safeDetailPage + 1} จาก ${totalPages} (แสดง ${PAGE_SIZE} แถวต่อหน้า)` : `Page ${safeDetailPage + 1} of ${totalPages} (${PAGE_SIZE} rows/page)`}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDetailPage(p => Math.max(0, p - 1))}
                          disabled={safeDetailPage === 0}
                          className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition"
                        >
                          {lang === 'th' ? '← ก่อนหน้า' : '← Prev'}
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pg = safeDetailPage < 3 ? i : safeDetailPage - 2 + i;
                          if (pg >= totalPages) return null;
                          return (
                            <button
                              key={pg}
                              onClick={() => setDetailPage(pg)}
                              className={`px-3 py-1.5 text-xs rounded-lg transition ${pg === safeDetailPage ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                              {pg + 1}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setDetailPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={safeDetailPage === totalPages - 1}
                          className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition"
                        >
                          {lang === 'th' ? 'ถัดไป →' : 'Next →'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* CSV Analysis Result */}
            {uploadedCSVData.length > 0 && (() => {
              const data = uploadedCSVData;
              const peakL1 = Math.max(...data.map(r => r.L1));
              const peakL2 = Math.max(...data.map(r => r.L2));
              const peakL3 = Math.max(...data.map(r => r.L3));
              const avgL1 = data.reduce((s, r) => s + r.L1, 0) / data.length;
              const avgL2 = data.reduce((s, r) => s + r.L2, 0) / data.length;
              const avgL3 = data.reduce((s, r) => s + r.L3, 0) / data.length;
              const peakMax = Math.max(peakL1, peakL2, peakL3);
              const peakMin = Math.min(peakL1, peakL2, peakL3);
              const imbalance = peakMax > 0 ? (((peakMax - peakMin) / peakMax) * 100).toFixed(1) : '0.0';
              // Sample ~400 points for chart
              const step = Math.max(1, Math.floor(data.length / 400));
              const chartData = data.filter((_, i) => i % step === 0);
              // Estimated interval (assume 30s → 2 rows/min)
              const estIntervalSec = data.length > 1 ? Math.round((7 * 24 * 3600) / data.length) : 30;
              return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                    {lang === 'th' ? 'ผลวิเคราะห์ข้อมูล CSV — กระแสไฟฟ้า 7 วัน' : 'CSV Data Analysis — 7-Day Current Log'}
                  </h3>
                  {/* Stats bar */}
                  <div className="flex flex-wrap gap-3 mb-4 mt-3">
                    {[
                      { label: lang === 'th' ? 'แถวข้อมูล' : 'Data Rows', value: data.length.toLocaleString() },
                      { label: lang === 'th' ? 'ช่วงบันทึก' : 'Interval', value: `~${estIntervalSec}s` },
                      { label: lang === 'th' ? 'Peak L1' : 'Peak L1', value: `${peakL1.toFixed(1)} A` },
                      { label: lang === 'th' ? 'Peak L2' : 'Peak L2', value: `${peakL2.toFixed(1)} A` },
                      { label: lang === 'th' ? 'Peak L3' : 'Peak L3', value: `${peakL3.toFixed(1)} A` },
                      { label: lang === 'th' ? 'ความไม่สมดุล' : 'Imbalance', value: `${imbalance}%`, warn: parseFloat(imbalance) >= 10 },
                    ].map((s, i) => (
                      <div key={i} className={`flex-1 min-w-[110px] rounded-lg p-3 text-center border ${
                        s.warn ? 'bg-yellow-50 border-yellow-300' : 'bg-emerald-50 border-emerald-200'
                      }`}>
                        <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
                        <p className={`font-bold text-sm ${s.warn ? 'text-yellow-700' : 'text-emerald-800'}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Graph */}
                  <p className="text-xs text-gray-400 mb-1">
                    {lang === 'th' ? `* กราฟแสดงทุก ${step} จุด จากทั้งหมด ${data.length.toLocaleString()} แถว` : `* Chart sampled every ${step} rows of ${data.length.toLocaleString()} total`}
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 55 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="time" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} interval={Math.floor(chartData.length / 8)} />
                      <YAxis tick={{ fontSize: 11 }} label={{ value: 'A', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} A`]} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      <Line type="monotone" dataKey="L1" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="L1 (A)" />
                      <Line type="monotone" dataKey="L2" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="L2 (A)" />
                      <Line type="monotone" dataKey="L3" stroke="#8B5CF6" strokeWidth={1.5} dot={false} name="L3 (A)" />
                      {uploadedCSVData.some(r => r.N > 0) && (
                        <Line type="monotone" dataKey="N" stroke="#6B7280" strokeWidth={1} dot={false} name="N (A)" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                  {/* Summary table */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-2 font-bold text-gray-700">{lang === 'th' ? 'เฟส' : 'Phase'}</th>
                          <th className="text-right p-2 font-bold text-orange-600">Peak (A)</th>
                          <th className="text-right p-2 font-bold text-blue-600">{lang === 'th' ? 'เฉลี่ย (A)' : 'Avg (A)'}</th>
                          <th className="text-right p-2 font-bold text-gray-600">Min (A)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(['L1','L2','L3'] as const).map((ph, i) => {
                          const vals = data.map(r => r[ph]);
                          const pk = Math.max(...vals);
                          const av = vals.reduce((s,v)=>s+v,0)/vals.length;
                          const mn = Math.min(...vals);
                          const colors = ['text-amber-700','text-blue-700','text-purple-700'];
                          return (
                            <tr key={ph} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className={`p-2 font-semibold ${colors[i]}`}>{ph}</td>
                              <td className="p-2 text-right">{pk.toFixed(1)}</td>
                              <td className="p-2 text-right">{av.toFixed(1)}</td>
                              <td className="p-2 text-right">{mn.toFixed(1)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Customer Batch Database */}
            <div ref={batchTableRef} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                  {lang === 'th' ? 'ฐานข้อมูลค่ากระแสไฟฟ้า แยกตามลูกค้า/สถานที่' : 'Current Record Database — by Customer / Site'}
                </h3>
              </div>

              {false && (
                <div className="mb-4 p-4 border-2 border-indigo-200 rounded-xl bg-indigo-50 flex flex-wrap gap-3 items-end">
                  {/* Customer search with DB autocomplete */}
                  <div className="flex-1 min-w-[220px] relative">
                    <label className="block text-xs font-semibold text-indigo-700 mb-1">
                      {lang === 'th' ? 'ค้นหาชื่อลูกค้า / บริษัท' : 'Search Customer / Company'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cusQuery}
                        onChange={e => searchCustomers(e.target.value)}
                        onFocus={() => { if (cusResults.length > 0) setCusOpen(true); }}
                        onBlur={() => setTimeout(() => setCusOpen(false), 180)}
                        placeholder={lang === 'th' ? 'พิมพ์ชื่อ, อีเมล, เบอร์โทร...' : 'Name, email, phone...'}
                        className="w-full px-3 py-2 pr-8 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                        autoComplete="off"
                      />
                      {cusLoading && (
                        <span className="absolute right-2 top-2.5 w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin inline-block" />
                      )}
                    </div>
                    {/* Dropdown results */}
                    {cusOpen && cusResults.length > 0 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-indigo-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                        {cusResults.map(c => (
                          <button
                            key={c.cusID}
                            type="button"
                            onMouseDown={() => selectCustomer(c)}
                            className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                          >
                            <p className="text-sm font-semibold text-gray-800 truncate">{c.fullname || c.company}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {[c.company, c.phone, c.email].filter(Boolean).join(' · ')}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                    {cusOpen && !cusLoading && cusResults.length === 0 && cusQuery.length > 0 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-indigo-200 rounded-xl shadow-xl px-3 py-3 text-sm text-gray-400">
                        {lang === 'th' ? 'ไม่พบลูกค้า — กรอกชื่อเพื่อสร้างใหม่' : 'No match — type to create new'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-semibold text-indigo-700 mb-1">
                      {lang === 'th' ? 'สถานที่ / ที่ตั้ง' : 'Location / Site'}
                    </label>
                    <input
                      type="text"
                      value={newCustomerLocation}
                      onChange={e => setNewCustomerLocation(e.target.value)}
                      placeholder={lang === 'th' ? 'เช่น โรงงาน, สาขา...' : 'e.g. Factory, Branch...'}
                      className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    />
                  </div>
                  <button
                    onClick={createBatch}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition font-semibold"
                  >
                    {lang === 'th' ? 'สร้างชุดข้อมูล' : 'Create Batch'}
                  </button>
                  <button
                    onClick={() => { setShowNewCustomerForm(false); setCusQuery(''); setCusResults([]); setCusOpen(false); }}
                    className="px-3 py-2 bg-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-300 transition"
                  >
                    {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </button>
                </div>
              )}

              {/* Customer tabs / selector */}
              {batches.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  {lang === 'th' ? 'ยังไม่มีชุดข้อมูล อัปโหลดไฟล์อย่างน้อย 1 เฟส แล้วกด Generate เพื่อเริ่มต้น' : 'No batches yet. Upload at least one phase file and click Generate to get started.'}
                </div>
              ) : (
                <>
                  {/* Horizontal scrollable customer pills */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                    {batches.map(b => (
                      <button
                        key={b.batchId}
                        onClick={() => setActiveBatchId(b.batchId)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                          b.batchId === activeBatchId
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-700'
                        }`}
                      >
                        {b.customerName}
                        <span className="ml-1.5 text-xs opacity-70">({b.records.length})</span>
                      </button>
                    ))}
                  </div>

                  {activeBatch && (
                    <div>
                      {/* Batch header info bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 p-3 bg-indigo-50 rounded-xl">
                        <div>
                          <p className="font-bold text-indigo-800 text-sm">{activeBatch.customerName}</p>
                          {activeBatch.location && (
                            <p className="text-xs text-indigo-600">{activeBatch.location}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {lang === 'th' ? 'สร้างเมื่อ: ' : 'Created: '}{formatDateTimeDisplay(activeBatch.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => addBatchRow(activeBatch.batchId)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs rounded-lg hover:bg-indigo-200 transition font-medium"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {lang === 'th' ? 'เพิ่มแถว' : 'Row'}
                          </button>
                          <button
                            onClick={() => loadBatchToForm(activeBatch)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition font-semibold"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            {lang === 'th' ? 'โหลดเข้าฟอร์มวิเคราะห์' : 'Load to Analysis Form'}
                          </button>
                          <button
                            onClick={() => deleteBatch(activeBatch.batchId)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 text-xs rounded-lg hover:bg-red-200 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Records table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-indigo-50">
                              <th className="border border-indigo-200 px-2 py-2 text-left text-xs font-bold text-indigo-800 w-8">#</th>
                              <th className="border border-indigo-200 px-2 py-2 text-left text-xs font-bold text-indigo-800">{lang === 'th' ? 'วันที่' : 'Date'}</th>
                              <th className="border border-indigo-200 px-2 py-2 text-left text-xs font-bold text-indigo-800">{lang === 'th' ? 'เวลา' : 'Time'}</th>
                              <th className="border border-indigo-200 px-2 py-2 text-center text-xs font-bold text-orange-700">L1</th>
                              <th className="border border-indigo-200 px-2 py-2 text-center text-xs font-bold text-blue-700">L2</th>
                              <th className="border border-indigo-200 px-2 py-2 text-center text-xs font-bold text-purple-700">L3</th>
                              <th className="border border-indigo-200 px-2 py-2 text-left text-xs font-bold text-indigo-800">{lang === 'th' ? 'ไฟล์ที่ดึงข้อมูล' : 'Source File(s)'}</th>
                              <th className="border border-indigo-200 px-2 py-2 w-8"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeBatch.records.map((row, idx) => (
                              <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-200 px-2 py-1 text-center text-xs text-gray-500">{idx + 1}</td>
                                <td className="border border-gray-200 px-1 py-1">
                                  <input type="date" value={row.date}
                                    onChange={e => updateBatchRecord(activeBatch.batchId, row.id, 'date', e.target.value)}
                                    className="w-full px-1 py-0.5 text-xs border-0 bg-transparent focus:ring-1 focus:ring-indigo-400 rounded"
                                  />
                                </td>
                                <td className="border border-gray-200 px-1 py-1">
                                  <input type="time" value={row.time}
                                    onChange={e => updateBatchRecord(activeBatch.batchId, row.id, 'time', e.target.value)}
                                    className="w-full px-1 py-0.5 text-xs border-0 bg-transparent focus:ring-1 focus:ring-indigo-400 rounded"
                                  />
                                </td>
                                {(['L1','L2','L3'] as const).map(phase => (
                                  <td key={phase} className="border border-gray-200 px-1 py-1">
                                    <input type="number" step="0.1" value={(row as any)[phase]}
                                      onChange={e => updateBatchRecord(activeBatch.batchId, row.id, phase, e.target.value)}
                                      placeholder="0.0"
                                      className={`w-full px-1 py-0.5 text-xs text-center border-0 bg-transparent focus:ring-1 focus:ring-indigo-400 rounded ${
                                        phase === 'L1' ? 'text-orange-700 font-medium' :
                                        phase === 'L2' ? 'text-blue-700 font-medium' :
                                        'text-purple-700 font-medium'
                                      }`}
                                    />
                                  </td>
                                ))}
                                <td className="border border-gray-200 px-2 py-1 text-xs text-gray-600 align-top">
                                  <div className="space-y-0.5">
                                    {row.sourceFileL1 ? <p className="truncate max-w-[220px]" title={row.sourceFileL1}><span className="font-semibold text-orange-700">L1:</span> {row.sourceFileL1}</p> : null}
                                    {row.sourceFileL2 ? <p className="truncate max-w-[220px]" title={row.sourceFileL2}><span className="font-semibold text-blue-700">L2:</span> {row.sourceFileL2}</p> : null}
                                    {row.sourceFileL3 ? <p className="truncate max-w-[220px]" title={row.sourceFileL3}><span className="font-semibold text-purple-700">L3:</span> {row.sourceFileL3}</p> : null}
                                    {!row.sourceFileL1 && !row.sourceFileL2 && !row.sourceFileL3 ? <span className="text-gray-400">—</span> : null}
                                  </div>
                                </td>
                                <td className="border border-gray-200 px-1 py-1 text-center">
                                  <button onClick={() => deleteBatchRow(activeBatch.batchId, row.id)}
                                    className="p-0.5 hover:bg-red-100 rounded text-red-400 hover:text-red-600 transition"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          {(() => {
                            const filled = activeBatch.records.filter(r => r.L1 !== '' || r.L2 !== '' || r.L3 !== '');
                            if (filled.length === 0) return null;
                            const avgL1 = (filled.reduce((s, r) => s + parseFloat(r.L1 || '0'), 0) / filled.length).toFixed(1);
                            const avgL2 = (filled.reduce((s, r) => s + parseFloat(r.L2 || '0'), 0) / filled.length).toFixed(1);
                            const avgL3 = (filled.reduce((s, r) => s + parseFloat(r.L3 || '0'), 0) / filled.length).toFixed(1);
                            const maxL1 = Math.max(...filled.map(r => parseFloat(r.L1 || '0'))).toFixed(1);
                            const maxL2 = Math.max(...filled.map(r => parseFloat(r.L2 || '0'))).toFixed(1);
                            const maxL3 = Math.max(...filled.map(r => parseFloat(r.L3 || '0'))).toFixed(1);
                            return (
                              <tfoot>
                                <tr className="bg-orange-50 font-semibold">
                                  <td colSpan={3} className="border border-gray-300 px-2 py-1.5 text-xs text-orange-800">{lang === 'th' ? 'ค่าเฉลี่ย' : 'Average'}</td>
                                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-center text-orange-700 font-bold">{avgL1}</td>
                                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-center text-blue-700 font-bold">{avgL2}</td>
                                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-center text-purple-700 font-bold">{avgL3}</td>
                                  <td className="border border-gray-300"></td>
                                  <td className="border border-gray-300"></td>
                                </tr>
                                <tr className="bg-red-50 font-semibold">
                                  <td colSpan={3} className="border border-gray-300 px-2 py-1.5 text-xs text-red-800">{lang === 'th' ? 'ค่าสูงสุด (Peak)' : 'Peak'}</td>
                                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-center text-orange-700 font-bold">{maxL1}</td>
                                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-center text-blue-700 font-bold">{maxL2}</td>
                                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-center text-purple-700 font-bold">{maxL3}</td>
                                  <td className="border border-gray-300"></td>
                                  <td className="border border-gray-300"></td>
                                </tr>
                              </tfoot>
                            );
                          })()}
                        </table>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-xs text-gray-400">
                          {activeBatch.records.length} {lang === 'th' ? 'แถว' : 'rows'} ·{' '}
                          {lang === 'th' ? 'กด "โหลดเข้าฟอร์มวิเคราะห์" เพื่อนำค่าเฉลี่ยไปใช้' : 'Click "Load to Analysis Form" to use averaged values'}
                        </p>
                        <span className={`text-xs font-medium flex items-center gap-1 ${
                          batchSaveStatus === 'saving' ? 'text-yellow-500' :
                          batchSaveStatus === 'saved' ? 'text-green-600' :
                          batchSaveStatus === 'error' ? 'text-red-500' : 'text-gray-400'
                        }`}>
                          {batchSaveStatus === 'saving' && (
                            <><span className="w-3 h-3 border-2 border-yellow-300 border-t-yellow-500 rounded-full animate-spin inline-block" />
                            {lang === 'th' ? 'กำลังบันทึก...' : 'Saving...'}</>
                          )}
                          {batchSaveStatus === 'saved' && <>✓ {lang === 'th' ? 'บันทึกลงฐานข้อมูลแล้ว' : 'Saved to DB'}</>}
                          {batchSaveStatus === 'error' && <>✗ {lang === 'th' ? 'บันทึกไม่สำเร็จ' : 'Save failed'}</>}
                          {batchSaveStatus === 'idle' && <>{lang === 'th' ? 'บันทึกอัตโนมัติ' : 'Auto-save'}</>}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        {view === 'form' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                {lang === 'th' ? 'ข้อมูลพื้นฐาน' : 'Basic Information'}
              </h2>

              {/* Load from customer database */}
              <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-800 font-semibold text-sm mb-3">
                  <Activity className="w-4 h-4" />
                  {lang === 'th' ? 'โหลดค่ากระแสจากฐานข้อมูลลูกค้า:' : 'Load current data from customer database:'}
                </div>

                {/* Customer search autocomplete */}
                <div className="relative" ref={formCusRef}>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={formCusQuery}
                        onChange={e => searchFormCustomers(e.target.value)}
                        onFocus={() => { if (formCusResults.length > 0) setFormCusOpen(true); }}
                        placeholder={lang === 'th' ? '— ค้นหาชื่อลูกค้า —' : '— Search customer name —'}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-green-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                      {formCusLoading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                      )}
                    </div>
                    {formCusQuery && (
                      <button
                        type="button"
                        onClick={() => { setFormCusQuery(''); setFormCusResults([]); setFormCusOpen(false); setFormCusBatches([]); }}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete dropdown */}
                  {formCusOpen && formCusResults.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-green-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                      {formCusResults.map(c => (
                        <button
                          key={c.cusID}
                          type="button"
                          onClick={() => selectFormCustomer(c)}
                          className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-0"
                        >
                          <div className="font-medium text-gray-800 text-sm">{c.fullname || c.company}</div>
                          {c.address && <div className="text-xs text-gray-500 truncate mt-0.5">{c.address}</div>}
                          {/* Show how many batches match */}
                          {(() => {
                            const n = batches.filter(b =>
                              (b.cusID != null && b.cusID === c.cusID) ||
                              (b.customerName && b.customerName.toLowerCase().includes((c.fullname || c.company || '').toLowerCase()))
                            ).length;
                            return n > 0 ? (
                              <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                {n} {lang === 'th' ? 'ชุดข้อมูลที่อัปโหลด' : 'uploaded batch(es)'}
                              </span>
                            ) : (
                              <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                {lang === 'th' ? 'ยังไม่มีข้อมูลอัปโหลด' : 'No uploaded data yet'}
                              </span>
                            );
                          })()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-batch picker when customer has multiple batches */}
                {formCusBatches.length > 1 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-green-700 font-medium">{lang === 'th' ? 'เลือกชุดข้อมูล:' : 'Select batch:'}</span>
                    {formCusBatches
                      .slice()
                      .sort((a, b2) => new Date(b2.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                      .map(b => (
                        <button
                          key={b.batchId}
                          type="button"
                          onClick={() => applyBatchToAnalysis(b, false)}
                          className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                            analysisBatchId === b.batchId
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
                          }`}
                        >
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' }) : b.batchId.slice(-8)}
                          {' · '}{b.records.filter(r => r.L1 || r.L2 || r.L3).length} {lang === 'th' ? 'แถว' : 'rows'}
                        </button>
                      ))}
                  </div>
                )}

                {/* Status after loading */}
                {analysisBatchId && formCusQuery && (
                  <div className="mt-3 flex items-center gap-2 text-green-700 text-xs">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>
                      {lang === 'th'
                        ? `โหลดข้อมูลแล้ว · ค่าเฉลี่ย L1/L2/L3/N, แรงดัน, PF และสถานที่ถูกนำเข้าฟอร์มโดยอัตโนมัติ`
                        : `Data loaded · Average L1/L2/L3/N, voltage, PF, and location have been auto-filled.`}
                    </span>
                  </div>
                )}

                <p className="mt-3 text-xs text-green-600">
                  {lang === 'th'
                    ? 'ระบบจะนำค่าเฉลี่ย L1/L2/L3/N, แรงดัน, PF และชื่อสถานที่มาใส่ในฟอร์มโดยอัตโนมัติ'
                    : 'Average L1/L2/L3/N, voltage, PF, and location will be auto-filled into the form.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.documentNo}
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.datetime}
                  </label>
                  <input
                    type="text"
                    value={formData.datetime}
                    onChange={(e) => handleInputChange('datetime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.location}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={lang === 'th' ? 'เช่น กรุงเทพฯ - ห้อง UPS' : 'e.g. Bangkok - UPS Room'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.technician}
                  </label>
                  <input
                    type="text"
                    value={formData.technician}
                    onChange={(e) => handleInputChange('technician', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={lang === 'th' ? 'ชื่อช่างเทคนิค' : 'Technician Name'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.equipment}
                  </label>
                  <select
                    value={formData.equipment}
                    onChange={(e) => handleInputChange('equipment', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Fluke 438-II Motor Analyzer</option>
                    <option>Fluke 345 Power Quality Clamp Meter</option>
                    <option>Hioki PW3198 Power Quality Analyzer</option>
                    <option>Other Equipment</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Electrical Parameters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-yellow-600" />
                {lang === 'th' ? 'พารามิเตอร์ไฟฟ้า' : 'Electrical Parameters'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.voltage}
                  </label>
                  <input
                    type="text"
                    value={formData.voltage}
                    onChange={(e) => handleInputChange('voltage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.frequency}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.powerFactor}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.powerFactor}
                    onChange={(e) => handleInputChange('powerFactor', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.thd}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.thd}
                    onChange={(e) => handleInputChange('thd', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'th' ? 'ขนาดเบรคเกอร์หลักเดิม (A)' : 'Existing Main Breaker Size (A)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder={lang === 'th' ? 'เช่น 400' : 'e.g. 400'}
                    value={formData.mainBreakerAmps || ''}
                    onChange={(e) => handleInputChange('mainBreakerAmps', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.mainBreakerAmps && formData.mainBreakerAmps > 0 && (() => {
                    const v = parseFloat(formData.voltage) || 380;
                    const breakerKva = Math.round(Math.sqrt(3) * v * formData.mainBreakerAmps / 1000 * 10) / 10;
                    return (
                      <p className="text-xs text-gray-500 mt-1">
                        {lang === 'th' ? `≈ ${breakerKva.toFixed(1)} kVA (√3 × ${v}V × ${formData.mainBreakerAmps}A)` : `≈ ${breakerKva.toFixed(1)} kVA (√3 × ${v}V × ${formData.mainBreakerAmps}A)`}
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Current Measurement */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-purple-600" />
                {t.currentMeasurement}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    L1 {t.current}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.current.L1}
                    onChange={(e) => handleInputChange('current.L1', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    L2 {t.current}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.current.L2}
                    onChange={(e) => handleInputChange('current.L2', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    L3 {t.current}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.current.L3}
                    onChange={(e) => handleInputChange('current.L3', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    N {t.current}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.current.N}
                    onChange={(e) => handleInputChange('current.N', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.balance}
                  </label>
                  {(() => {
                    const phases = [formData.current.L1, formData.current.L2, formData.current.L3];
                    const avg = phases.reduce((s, v) => s + v, 0) / 3;
                    const maxDev = Math.max(...phases.map(v => Math.abs(v - avg)));
                    const imb = avg > 0 ? (maxDev / avg) * 100 : 0;
                    const iecBadge = imb < 5
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : imb < 10
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      : 'bg-red-100 text-red-700 border border-red-300';
                    const iecIcon = imb < 5 ? '✓' : imb < 10 ? '⚠' : '✗';
                    return (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${getBalanceColor(formData.balance)}`}>
                          {formData.balance}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold ${iecBadge}`}>
                          {iecIcon} {imb.toFixed(2)}%
                          <span className="text-xs font-normal opacity-75 ml-1">IEC 60034-26</span>
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Current Measurement Table */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-purple-600" />
                  {lang === 'th' ? 'ตารางการวัดกระแสไฟฟ้า' : 'Current Measurement Table'}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm bg-white rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="text-left p-3 font-bold text-gray-700">
                          {lang === 'th' ? 'เฟส' : 'Phase'}
                        </th>
                        <th className="text-right p-3 font-bold text-gray-700">
                          {lang === 'th' ? 'กระแส (A)' : 'Current (A)'}
                        </th>
                        <th className="text-right p-3 font-bold text-gray-700">
                          {lang === 'th' ? '% ของค่าสูงสุด' : '% of Max'}
                        </th>
                        <th className="text-right p-3 font-bold text-gray-700">
                          {lang === 'th' ? 'เบี่ยงเบนจากเฉลี่ย' : 'Dev from Avg'}
                        </th>
                        <th className="text-center p-3 font-bold text-gray-700">
                          {lang === 'th' ? 'สถานะ IEC' : 'IEC Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const L1 = formData.current.L1;
                        const L2 = formData.current.L2;
                        const L3 = formData.current.L3;
                        const N  = formData.current.N;
                        const maxCurrent = Math.max(L1, L2, L3);
                        const minCurrent = Math.min(L1, L2, L3);
                        const avg3 = (L1 + L2 + L3) / 3;
                        // IEC 60034-26: per-phase deviation from 3-phase average
                        const phases = [
                          { name: 'L1', value: L1, color: 'text-orange-600', isLine: true },
                          { name: 'L2', value: L2, color: 'text-blue-600',   isLine: true },
                          { name: 'L3', value: L3, color: 'text-purple-600', isLine: true },
                          { name: 'N',  value: N,  color: 'text-gray-600',   isLine: false },
                        ];

                        return phases.map((phase, idx) => {
                          const pctOfMax = maxCurrent > 0 ? (phase.value / maxCurrent) * 100 : 0;
                          const devFromAvg = phase.isLine && avg3 > 0
                            ? ((phase.value - avg3) / avg3) * 100
                            : null;
                          // N phase: show neutral displacement relative to avg line current
                          const nRatio = !phase.isLine && avg3 > 0 ? (phase.value / avg3) * 100 : null;

                          // Per-phase IEC status: use absolute deviation from avg
                          let badge = '';
                          let badgeText = '';
                          if (phase.isLine) {
                            const absDev = Math.abs(devFromAvg!);
                            if (absDev < 5) { badge = 'bg-green-100 text-green-700'; badgeText = '✓ Pass'; }
                            else if (absDev < 10) { badge = 'bg-yellow-100 text-yellow-700'; badgeText = '⚠ Warn'; }
                            else { badge = 'bg-red-100 text-red-700'; badgeText = '✗ Fail'; }
                          } else {
                            // N phase: < 15% of avg line current = OK (typical unbalanced load tolerance)
                            if (nRatio !== null) {
                              if (nRatio < 15) { badge = 'bg-green-100 text-green-700'; badgeText = '✓ OK'; }
                              else if (nRatio < 30) { badge = 'bg-yellow-100 text-yellow-700'; badgeText = '⚠ Warn'; }
                              else { badge = 'bg-red-100 text-red-700'; badgeText = '✗ High'; }
                            } else if (phase.value === 0) {
                              badge = 'bg-gray-100 text-gray-500'; badgeText = '— Zero';
                            } else {
                              badge = 'bg-gray-100 text-gray-500'; badgeText = '—';
                            }
                          }

                          return (
                            <tr key={idx} className={`border-b border-gray-200 hover:bg-gray-50 ${phase.value === maxCurrent && phase.isLine ? 'bg-orange-50' : ''}`}>
                              <td className={`p-3 font-semibold ${phase.color}`}>
                                {lang === 'th' ? 'เฟส' : 'Phase'} {phase.name}
                                {phase.isLine && phase.value === maxCurrent && (
                                  <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1 rounded">MAX</span>
                                )}
                                {phase.isLine && phase.value === minCurrent && maxCurrent !== minCurrent && (
                                  <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">MIN</span>
                                )}
                              </td>
                              <td className="p-3 text-right text-gray-800 font-medium">
                                {phase.value.toFixed(1)} A
                              </td>
                              <td className="p-3 text-right text-gray-600">
                                {phase.isLine ? `${pctOfMax.toFixed(1)}%` : (nRatio !== null ? `${nRatio.toFixed(1)}% of avg` : '—')}
                              </td>
                              <td className="p-3 text-right">
                                {devFromAvg !== null ? (
                                  <span className={devFromAvg >= 0 ? 'text-orange-600 font-medium' : 'text-blue-600 font-medium'}>
                                    {devFromAvg >= 0 ? '+' : ''}{devFromAvg.toFixed(2)}%
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${badge}`}>
                                  {badgeText}
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                    <tfoot>
                      <tr className="bg-purple-50 border-t-2 border-purple-200">
                        <td className="p-3 font-bold text-gray-700">
                          {lang === 'th' ? 'ค่าเฉลี่ย 3Φ' : '3Φ Average'}
                        </td>
                        <td className="p-3 text-right font-bold text-gray-800">
                          {((formData.current.L1 + formData.current.L2 + formData.current.L3) / 3).toFixed(1)} A
                        </td>
                        <td className="p-3 text-right text-gray-500">—</td>
                        <td className="p-3 text-right text-gray-500">—</td>
                        <td className="p-3 text-center">
                          {(() => {
                            const phases = [formData.current.L1, formData.current.L2, formData.current.L3];
                            const avg = phases.reduce((s, v) => s + v, 0) / 3;
                            const maxDev = Math.max(...phases.map(v => Math.abs(v - avg)));
                            const imb = avg > 0 ? (maxDev / avg) * 100 : 0;
                            const b = imb < 5 ? 'bg-green-100 text-green-700' : imb < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                            const t = imb < 5 ? `✓ ${imb.toFixed(1)}%` : imb < 10 ? `⚠ ${imb.toFixed(1)}%` : `✗ ${imb.toFixed(1)}%`;
                            return <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${b}`}>{t}</span>;
                          })()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="text-xs text-gray-400 mt-1 px-1">
                  {lang === 'th'
                    ? '* IEC Status: เบี่ยงเบนต่อเฟสจากค่าเฉลี่ย 3 เฟส — ✓ &lt;5% | ⚠ 5–10% | ✗ ≥10% (IEC 60034-26). ค่า Imbalance รวมใช้สูตร NEMA/IEC: max|Iₙ−Iavg|/Iavg'
                    : '* IEC Status: per-phase deviation from 3Φ average — ✓ <5% | ⚠ 5–10% | ✗ ≥10% (IEC 60034-26). Overall imbalance uses NEMA/IEC: max|Iₙ−Iavg|/Iavg'}</p>

                {/* Balance Analysis */}
                <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">{lang === 'th' ? 'การวิเคราะห์ความสมดุลกระแส:' : 'Current Balance Analysis:'}</p>
                  {(() => {
                    const phases = [formData.current.L1, formData.current.L2, formData.current.L3];
                    const avg = phases.reduce((s, v) => s + v, 0) / 3;
                    const maxDev = Math.max(...phases.map(v => Math.abs(v - avg)));
                    const imb = avg > 0 ? (maxDev / avg) * 100 : 0;
                    const imbStr = imb.toFixed(1);
                    // IEC 60034-26: < 5%
                    const isPass = imb < 5;
                    const isWarn = imb >= 5 && imb < 10;
                    const color = isPass ? 'text-green-700' : isWarn ? 'text-yellow-700' : 'text-red-700';
                    const badge = isPass ? 'bg-green-100 text-green-700' : isWarn ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                    const icon = isPass ? '✓ Pass' : isWarn ? '⚠ Warn' : '✗ Fail';
                    return (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-bold ${color}`}>{imbStr}%</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${badge}`}>{icon}</span>
                        <span className="text-xs text-gray-500">
                          {lang === 'th' ? 'มาตรฐาน IEC 60034-26: &lt; 5%' : 'Standard IEC 60034-26: < 5%'}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Inline Current Line Chart — time-series from batch */}
                <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-xs font-bold text-gray-700 mb-2">
                    {lang === 'th' ? '📈 กราฟกระแสไฟฟ้าแต่ละเฟส (A)' : '📈 Phase Current Line Chart (A)'}
                    {analysisCurrentRows.length > 0 && (
                      <span className="ml-2 font-normal text-green-600">
                        ({analysisCurrentRows.length} {lang === 'th' ? 'จุดข้อมูล' : 'data points'})
                      </span>
                    )}
                  </p>
                  {(() => {
                    const chartData = displayedCurrentData;
                    const maxVal = chartData.length > 0
                      ? Math.max(...chartData.map(d => Math.max(d.phaseA, d.phaseB, d.phaseC, (d as any).neutral || 0)), 1)
                      : Math.max(formData.current.L1, formData.current.L2, formData.current.L3, formData.current.N, 1);
                    const hasNeutral = chartData.some(d => ((d as any).neutral || 0) > 0);
                    return (
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: analysisCurrentRows.length > 0 ? 45 : 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="time"
                            tick={{ fontSize: 10 }}
                            angle={analysisCurrentRows.length > 4 ? -45 : 0}
                            textAnchor={analysisCurrentRows.length > 4 ? 'end' : 'middle'}
                            interval={analysisCurrentRows.length > 4 ? 'preserveStartEnd' : 0}
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            domain={[0, Math.ceil(maxVal * 1.2)]}
                            label={{ value: 'A', angle: -90, position: 'insideLeft', fontSize: 11 }}
                          />
                          <Tooltip
                            formatter={(value: number) => [`${value.toFixed(1)} A`]}
                            labelFormatter={(label) => label}
                          />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
                          <Line type="monotone" dataKey="phaseA" stroke="#F59E0B" strokeWidth={2} dot={false} name="L1 (A)" />
                          <Line type="monotone" dataKey="phaseB" stroke="#3B82F6" strokeWidth={2} dot={false} name="L2 (A)" />
                          <Line type="monotone" dataKey="phaseC" stroke="#8B5CF6" strokeWidth={2} dot={false} name="L3 (A)" />
                          {hasNeutral && (
                            <Line type="monotone" dataKey="neutral" stroke="#6B7280" strokeWidth={1.5} dot={false} name="N (A)" />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Current Graph */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-indigo-600" />
                {t.currentGraph}
              </h2>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayedCurrentData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={[0, Math.max(300, Math.ceil(Math.max(...displayedCurrentData.map(d => Math.max(d.phaseA, d.phaseB, d.phaseC, (d as any).neutral || 0)), 0)))]}
                      label={{ value: 'A', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: '15px' }} />
                    <Line type="monotone" dataKey="phaseA" stroke="#F59E0B" strokeWidth={2.5} name="Phase A (L1)" />
                    <Line type="monotone" dataKey="phaseB" stroke="#3B82F6" strokeWidth={2.5} name="Phase B (L2)" />
                    <Line type="monotone" dataKey="phaseC" stroke="#8B5CF6" strokeWidth={2.5} name="Phase C (L3)" />
                    {displayedCurrentData.some(d => ((d as any).neutral || 0) > 0) && (
                      <Line type="monotone" dataKey="neutral" stroke="#6B7280" strokeWidth={1.75} name="N" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Current Metrics Table */}
              <div className="mt-4 bg-white rounded-lg p-4 border border-indigo-200 shadow-sm">
                <div className="bg-indigo-100 rounded-t-lg px-4 py-2 -mx-4 -mt-4 mb-4">
                  <h5 className="font-bold text-indigo-800">
                    {lang === 'th' ? 'ตารางค่ากระแสไฟฟ้า' : 'Current Metrics Table'}
                  </h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">
                          {lang === 'th' ? 'รายการ' : 'Item'}
                        </th>
                        <th className="text-right p-3 font-bold text-orange-600 bg-gray-100">
                          {lang === 'th' ? 'เฟส A (L1)' : 'Phase A (L1)'}
                        </th>
                        <th className="text-right p-3 font-bold text-blue-600 bg-gray-100">
                          {lang === 'th' ? 'เฟส B (L2)' : 'Phase B (L2)'}
                        </th>
                        <th className="text-right p-3 font-bold text-purple-600 bg-gray-100">
                          {lang === 'th' ? 'เฟส C (L3)' : 'Phase C (L3)'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const rows = [
                          {
                            label: lang === 'th' ? '⚡ ค่ากระแสสูงสุด (Peak)' : '⚡ Peak Current',
                            a: metricPeakA, b: metricPeakB, c: metricPeakC,
                          },
                          {
                            label: lang === 'th' ? '☀️ ค่าเฉลี่ยช่วงกลางวัน (08:00–16:00)' : '☀️ Avg Daytime (08:00–16:00)',
                            a: metricDayA, b: metricDayB, c: metricDayC,
                          },
                          {
                            label: lang === 'th' ? '🌙 ค่าพื้นฐานกลางคืน (00:00–04:00)' : '🌙 Nighttime Base (00:00–04:00)',
                            a: metricNightA, b: metricNightB, c: metricNightC,
                          },
                          {
                            label: lang === 'th' ? '📊 ค่าเฉลี่ยรวม' : '📊 Overall Average',
                            a: metricAvgA, b: metricAvgB, c: metricAvgC,
                          },
                        ];
                        return rows.map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-indigo-50">
                            <td className="p-3 text-gray-800">{row.label}</td>
                            <td className="p-3 text-right font-medium text-orange-700">{row.a.toFixed(1)} A</td>
                            <td className="p-3 text-right font-medium text-blue-700">{row.b.toFixed(1)} A</td>
                            <td className="p-3 text-right font-medium text-purple-700">{row.c.toFixed(1)} A</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Phase Imbalance */}
                <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    {lang === 'th' ? 'ความไม่สมดุลของเฟส (NEMA/IEC 60034-26):' : 'Phase Current Imbalance (NEMA/IEC 60034-26):'}
                  </p>
                  {(() => {
                    const imb = metricAvgImbalance;
                    const imbMax = metricMaxImbalance;
                    const isPass = imb < 5;
                    const isWarn = imb >= 5 && imb < 10;
                    const color = isPass ? 'text-green-700' : isWarn ? 'text-yellow-700' : 'text-red-700';
                    const badge = isPass ? 'bg-green-100 text-green-700' : isWarn ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                    const icon = isPass ? '✓ Pass' : isWarn ? '⚠ Warn' : '✗ Fail';
                    return (
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-bold ${color}`}>{imb.toFixed(1)}%</span>
                          <span className="text-xs text-gray-500">{lang === 'th' ? '(เฉลี่ยต่อช่วงเวลา)' : '(avg per interval)'}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${badge}`}>{icon}</span>
                          <span className="text-xs text-gray-500">IEC 60034-26: &lt; 5%</span>
                        </div>
                        {imbMax > 0 && (
                          <p className="text-xs text-gray-500">
                            {lang === 'th' ? `สูงสุด (worst case): ${imbMax.toFixed(1)}%` : `Peak (worst case): ${imbMax.toFixed(1)}%`}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">{lang === 'th' ? 'สูตร: max|I_n − Iavg| / Iavg × 100 (คำนวณทุกแถวข้อมูล)' : 'Formula: max|I_n − Iavg| / Iavg × 100 (computed per data row)'}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Power Graph */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-green-600" />
                {t.powerGraph}
              </h2>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayedPowerData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={[0, Math.max(200, Math.ceil(Math.max(...displayedPowerData.map(d => Math.max(d.peak, d.avgDay, d.night)), 0)))]}
                      label={{ value: 'kW', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: '15px' }} />
                    <Line type="monotone" dataKey="peak" stroke="#EF4444" strokeWidth={2.5} name="Peak Power" />
                    <Line type="monotone" dataKey="avgDay" stroke="#10B981" strokeWidth={2.5} name="Average Daytime" />
                    <Line type="monotone" dataKey="night" stroke="#3B82F6" strokeWidth={2.5} name="Night Base Load" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Power Metrics Table */}
              <div className="mt-4 bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                <div className="bg-green-100 rounded-t-lg px-4 py-2 -mx-4 -mt-4 mb-4">
                  <h5 className="font-bold text-green-800">
                    {lang === 'th' ? 'ตัวชี้วัดพลังงาน' : 'Power Metrics'}
                  </h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">{lang === 'th' ? 'รายการ' : 'Item'}</th>
                        <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">{lang === 'th' ? 'ค่าที่วัดได้' : 'Measured Value'}</th>
                        <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">{lang === 'th' ? 'มาตรฐาน' : 'Standard'}</th>
                        <th className="text-center p-3 font-bold text-gray-700 bg-gray-100">{lang === 'th' ? 'ผล' : 'Result'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Load Factor */}
                      {(() => {
                        const pass = loadFactor >= 60;
                        const color = pass ? 'text-green-700' : 'text-red-700';
                        const badge = pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
                        return (
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-3 text-gray-800">{lang === 'th' ? 'ค่าตัวประกอบโหลด' : 'Load Factor'}</td>
                            <td className={`p-3 font-semibold ${color}`}>{loadFactor.toFixed(1)} %</td>
                            <td className="p-3 text-xs text-gray-500">&gt; 60%</td>
                            <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge}`}>{pass ? '✓ Pass' : '✗ Fail'}</span></td>
                          </tr>
                        );
                      })()}
                      {/* Average Power Factor */}
                      {(() => {
                        const pf = formData.powerFactor;
                        const pass = pf >= 0.95;
                        const warn = pf >= 0.85 && pf < 0.95;
                        const color = pass ? 'text-green-700' : warn ? 'text-yellow-700' : 'text-red-700';
                        const badge = pass ? 'bg-green-100 text-green-700' : warn ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                        const label = pass ? '✓ Pass' : warn ? '⚠ Warn' : '✗ Fail';
                        return (
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-3 text-gray-800">{lang === 'th' ? 'ตัวประกอบกำลังเฉลี่ย' : 'Average Power Factor'}</td>
                            <td className={`p-3 font-semibold ${color}`}>{pf.toFixed(2)}</td>
                            <td className="p-3 text-xs text-gray-500">&ge; 0.95</td>
                            <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge}`}>{label}</span></td>
                          </tr>
                        );
                      })()}
                      {/* Average Current Imbalance */}
                      {(() => {
                        const imb = metricPeakImbalance;
                        const pass = imb < 5;
                        const warn = imb >= 5 && imb < 10;
                        const color = pass ? 'text-green-700' : warn ? 'text-yellow-700' : 'text-red-700';
                        const badge = pass ? 'bg-green-100 text-green-700' : warn ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                        const label = pass ? '✓ Pass' : warn ? '⚠ Warn' : '✗ Fail';
                        return (
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-3 text-gray-800">{lang === 'th' ? 'ความไม่สมดุลกระแสเฉลี่ย' : 'Average Current Imbalance'}</td>
                            <td className={`p-3 font-semibold ${color}`}>{imb.toFixed(1)} %</td>
                            <td className="p-3 text-xs text-gray-500">&lt; 5% <span className="text-gray-400">(IEC 60034-26)</span></td>
                            <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge}`}>{label}</span></td>
                          </tr>
                        );
                      })()}
                      {/* Average Voltage Imbalance */}
                      {(() => {
                        const voltages = metricCurrentRows.map(d => (d as any).voltage).filter((v: any) => v && v > 0) as number[];
                        const vMax = voltages.length ? Math.max(...voltages) : 0;
                        const vMin = voltages.length ? Math.min(...voltages) : 0;
                        const vAvg = voltages.length ? voltages.reduce((s, v) => s + v, 0) / voltages.length : 0;
                        const vImb = vAvg > 0 ? ((vMax - vMin) / vAvg) * 100 : 0;
                        const hasData = voltages.length > 1 && vMax !== vMin;
                        const passIec = vImb < 2;
                        const passIeee = vImb < 3;
                        const color = passIec ? 'text-green-700' : passIeee ? 'text-yellow-700' : 'text-red-700';
                        const badge = passIec ? 'bg-green-100 text-green-700' : passIeee ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                        const status = passIec ? '✓ Pass' : passIeee ? '⚠ IEEE only' : '✗ Fail';
                        return (
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-3 text-gray-800">{lang === 'th' ? 'ความไม่สมดุลแรงดันเฉลี่ย' : 'Average Voltage Imbalance'}</td>
                            <td className={`p-3 font-semibold ${hasData ? color : 'text-gray-400'}`}>
                              {hasData ? `${vImb.toFixed(2)} %` : (lang === 'th' ? 'ไม่มีข้อมูลแรงดันแยกแต่ละแถว' : 'N/A — no per-row voltage data')}
                            </td>
                            <td className="p-3 text-xs text-gray-500">&lt;2% <span className="text-gray-400">(IEC)</span> / &lt;3% <span className="text-gray-400">(IEEE)</span></td>
                            <td className="p-3 text-center">
                              {hasData
                                ? <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge}`}>{status}</span>
                                : <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-400">N/A</span>}
                            </td>
                          </tr>
                        );
                      })()}
                      {/* Peak Power Demand */}
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800">{lang === 'th' ? 'ความต้องการพลังงานสูงสุด' : 'Peak Power Demand'}</td>
                        <td className="p-3 text-gray-800" colSpan={2}>
                          {`≈ ${powerPeakDemand.toFixed(1)} kW`}{analysisBatch ? (lang === 'th' ? ' (คำนวณจากข้อมูลที่อัปโหลด)' : ' (from uploaded data)') : ''}
                        </td>
                        <td className="p-3" />
                      </tr>
                      {/* Nighttime Base Load */}
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800">{lang === 'th' ? 'โหลดพื้นฐานกลางคืน' : 'Nighttime Base Load'}</td>
                        <td className="p-3 text-gray-800" colSpan={2}>≈ {powerNightMin.toFixed(1)} – {powerNightMax.toFixed(1)} kW</td>
                        <td className="p-3" />
                      </tr>
                      {/* Daytime Consumption */}
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800">{lang === 'th' ? 'การใช้พลังงานเฉลี่ยกลางวัน' : 'Average Daytime Consumption'}</td>
                        <td className="p-3 text-gray-800" colSpan={2}>≈ {powerDayMin.toFixed(1)} – {powerDayMax.toFixed(1)} kW</td>
                        <td className="p-3" />
                      </tr>
                      {/* Peak Hours */}
                      <tr className="hover:bg-gray-50">
                        <td className="p-3 text-gray-800">{lang === 'th' ? 'ช่วงเวลาพีค' : 'Peak Hours'}</td>
                        <td className="p-3 text-gray-800" colSpan={2}>{peakHourLabel}</td>
                        <td className="p-3" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


            {/* Result & Recommendation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                {lang === 'th' ? 'ผลการประเมินและคำแนะนำ' : 'Result & Recommendation'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.result}
                  </label>
                  <select
                    value={formData.result}
                    onChange={(e) => handleInputChange('result', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Recommended">Recommended</option>
                    <option value="Not Recommended">Not Recommended</option>
                    <option value="Further Analysis Required">Further Analysis Required</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.recommendation}
                  </label>
                  <textarea
                    value={formData.recommendation}
                    onChange={(e) => handleInputChange('recommendation', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={lang === 'th' ? 'คำแนะนำและข้อเสนอแนะ' : 'Recommendations and suggestions'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.notes}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={lang === 'th' ? 'หมายเหตุเพิ่มเติม' : 'Additional notes'}
                  />
                </div>

                {/* Engineer Approval Section */}
                <div className="border-t-2 border-dashed border-gray-300 pt-5 mt-2">
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    {t.engineerApproval}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Engineer Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.engineerName} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.engineerName}
                        onChange={(e) => handleInputChange('engineerName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={lang === 'th' ? 'ชื่อ-นามสกุล วิศวกร' : 'Full name of engineer'}
                      />
                    </div>

                    {/* Engineer License */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.engineerLicense}
                      </label>
                      <input
                        type="text"
                        value={formData.engineerLicense}
                        onChange={(e) => handleInputChange('engineerLicense', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={lang === 'th' ? 'เช่น กว. 12345' : 'e.g. ENG-12345'}
                      />
                    </div>

                    {/* Approver Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.approverName}
                      </label>
                      <input
                        type="text"
                        value={formData.approverName}
                        onChange={(e) => handleInputChange('approverName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={lang === 'th' ? 'ชื่อผู้อนุมัติ / หัวหน้าวิศวกร' : 'Approver / Chief Engineer'}
                      />
                    </div>

                    {/* Approval Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.approvalDate}
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.approvalDate.replace(' ', 'T')}
                        onChange={(e) => handleInputChange('approvalDate', e.target.value.replace('T', ' '))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Approval Status */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.approvalStatus}
                      </label>
                      <div className="flex gap-3 flex-wrap">
                        {(['Pending', 'Approved', 'Rejected'] as const).map((status) => {
                          const colors = {
                            Pending:  { ring: 'ring-yellow-400', bg: 'bg-yellow-50 border-yellow-400 text-yellow-800',  icon: '⏳' },
                            Approved: { ring: 'ring-green-500',  bg: 'bg-green-50 border-green-500 text-green-800',    icon: '✅' },
                            Rejected: { ring: 'ring-red-500',    bg: 'bg-red-50 border-red-500 text-red-800',          icon: '❌' },
                          };
                          const label = {
                            Pending:  lang === 'th' ? 'รออนุมัติ' : 'Pending',
                            Approved: lang === 'th' ? 'อนุมัติแล้ว' : 'Approved',
                            Rejected: lang === 'th' ? 'ไม่อนุมัติ' : 'Rejected',
                          };
                          const isSelected = formData.approvalStatus === status;
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleInputChange('approvalStatus', status)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 font-semibold transition-all ${
                                isSelected ? colors[status].bg + ' ' + colors[status].ring + ' ring-2' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <span>{colors[status].icon}</span>
                              {label[status]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Signature Box */}
                  <div className="mt-5 grid grid-cols-2 gap-6">
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 text-center bg-blue-50 min-h-[100px] flex flex-col items-center justify-center">
                      <User className="w-8 h-8 text-blue-300 mb-2" />
                      <p className="text-xs text-blue-500 font-medium">{t.signaturePlaceholder}</p>
                      {formData.engineerName && (
                        <p className="text-sm font-semibold text-blue-800 mt-2 border-t border-blue-200 pt-2 w-full">
                          {formData.engineerName}
                        </p>
                      )}
                      {formData.engineerLicense && (
                        <p className="text-xs text-blue-600">{formData.engineerLicense}</p>
                      )}
                    </div>
                    <div className="border-2 border-dashed border-green-300 rounded-xl p-4 text-center bg-green-50 min-h-[100px] flex flex-col items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-300 mb-2" />
                      <p className="text-xs text-green-500 font-medium">{lang === 'th' ? 'ลายเซ็นผู้อนุมัติ' : 'Approver Signature'}</p>
                      {formData.approverName && (
                        <p className="text-sm font-semibold text-green-800 mt-2 border-t border-green-200 pt-2 w-full">
                          {formData.approverName}
                        </p>
                      )}
                      {formData.approvalDate && (
                        <p className="text-xs text-green-600">{formData.approvalDate}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== DETAILED ANALYSIS REPORT ===== */}

            {/* 1. Quantified Voltage Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-yellow-500" />
                {lang === 'th' ? '1. การวิเคราะห์แรงดันไฟฟ้าเชิงปริมาณ' : '1. Quantified Voltage Analysis'}
              </h2>
              {(() => {
                const voltages = metricCurrentRows.map(d => (d as any).voltage as number).filter((v: number) => v > 0);
                const nomV = parseFloat(formData.voltage) || 380;
                const vAvg = voltages.length ? voltages.reduce((s, v) => s + v, 0) / voltages.length : nomV;
                const vMax = voltages.length ? Math.max(...voltages) : vAvg;
                const vMin = voltages.length ? Math.min(...voltages) : vAvg;
                const vStd = voltages.length > 1 ? Math.sqrt(voltages.reduce((s, v) => s + (v - vAvg) ** 2, 0) / voltages.length) : 0;
                const devPct = ((vAvg - nomV) / nomV) * 100;
                const iec = Math.abs(devPct) <= 10;
                const chartData = displayedCurrentData.map(d => ({ time: d.time, voltage: (d as any).voltage || nomV }));
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                        <p className="text-xs text-blue-600 mb-1">{lang === 'th' ? 'แรงดันเฉลี่ย' : 'Average Voltage'}</p>
                        <p className="text-lg font-bold text-blue-800">{vAvg.toFixed(1)} V</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                        <p className="text-xs text-orange-600 mb-1">{lang === 'th' ? 'แรงดันสูงสุด' : 'Peak Voltage'}</p>
                        <p className="text-lg font-bold text-orange-800">{vMax.toFixed(1)} V</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                        <p className="text-xs text-purple-600 mb-1">{lang === 'th' ? 'แรงดันต่ำสุด' : 'Min Voltage'}</p>
                        <p className="text-lg font-bold text-purple-800">{vMin.toFixed(1)} V</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">{lang === 'th' ? 'ส่วนเบี่ยงเบน' : 'Std Dev'}</p>
                        <p className="text-lg font-bold text-gray-800">{vStd.toFixed(2)} V</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-600">{lang === 'th' ? 'แรงดันพิกัด:' : 'Nominal:'} {nomV} V</span>
                      <span className={`text-sm font-semibold ${devPct >= 0 ? 'text-orange-700' : 'text-blue-700'}`}>
                        {devPct >= 0 ? '+' : ''}{devPct.toFixed(2)}%
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${iec ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {iec ? '✓ IEC 60038 ±10%' : '✗ Out of IEC 60038'}
                      </span>
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 11 }} domain={[Math.floor(vMin * 0.97), Math.ceil(vMax * 1.03)]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="voltage" stroke="#f59e0b" strokeWidth={2} dot={false} name={lang === 'th' ? 'แรงดัน (V)' : 'Voltage (V)'} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
                      {lang === 'th'
                        ? `คำอธิบายผล: ค่าแรงดันเฉลี่ย ${vAvg.toFixed(1)}V ${devPct >= 0 ? 'สูงกว่า' : 'ต่ำกว่า'}แรงดันพิกัด ${nomV}V อยู่ ${Math.abs(devPct).toFixed(2)}% และมีช่วงแกว่ง ${(vMax - vMin).toFixed(1)}V (${vMin.toFixed(1)}–${vMax.toFixed(1)}V) ซึ่ง${iec ? 'อยู่ใน' : 'อยู่นอก'}เกณฑ์ IEC 60038 (±10%).`
                        : `Analysis: Average voltage is ${vAvg.toFixed(1)}V, ${Math.abs(devPct).toFixed(2)}% ${devPct >= 0 ? 'above' : 'below'} nominal ${nomV}V, with ${(vMax - vMin).toFixed(1)}V spread (${vMin.toFixed(1)}–${vMax.toFixed(1)}V), which is ${iec ? 'within' : 'outside'} IEC 60038 (±10%).`}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 2. Quantified Current Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-blue-600" />
                {lang === 'th' ? '2. การวิเคราะห์กระแสเชิงปริมาณ' : '2. Quantified Current Analysis'}
              </h2>
              {(() => {
                const phases = [
                  { key: 'phaseA', label: 'L1', color: '#f59e0b', avg: metricAvgA, peak: metricPeakA },
                  { key: 'phaseB', label: 'L2', color: '#3b82f6', avg: metricAvgB, peak: metricPeakB },
                  { key: 'phaseC', label: 'L3', color: '#8b5cf6', avg: metricAvgC, peak: metricPeakC },
                ];
                const overallAvg = (metricAvgA + metricAvgB + metricAvgC) / 3;
                return (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-blue-50">
                          <tr>
                            {['Phase', lang === 'th' ? 'กระแสเฉลี่ย (A)' : 'Avg (A)', lang === 'th' ? 'กระแสสูงสุด (A)' : 'Peak (A)', lang === 'th' ? 'เบี่ยงเบนจากค่าเฉลี่ย' : 'Dev from Avg', lang === 'th' ? 'สัดส่วนโหลด (%)' : 'Load Share (%)'].map(h => (
                              <th key={h} className="p-3 text-left font-semibold text-gray-700">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {phases.map(ph => {
                            const dev = overallAvg > 0 ? ((ph.avg - overallAvg) / overallAvg) * 100 : 0;
                            const share = overallAvg > 0 ? (ph.avg / (overallAvg * 3)) * 100 : 33.3;
                            return (
                              <tr key={ph.label} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-3 font-bold" style={{ color: ph.color }}>{ph.label}</td>
                                <td className="p-3">{ph.avg.toFixed(1)}</td>
                                <td className="p-3">{ph.peak.toFixed(1)}</td>
                                <td className="p-3">
                                  <span className={dev >= 0 ? 'text-orange-700' : 'text-blue-700'}>
                                    {dev >= 0 ? '+' : ''}{dev.toFixed(2)}%
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div className="h-2 rounded-full" style={{ width: `${Math.min(share, 100)}%`, backgroundColor: ph.color }} />
                                    </div>
                                    <span className="text-xs w-10 text-right">{share.toFixed(1)}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="bg-gray-50 font-semibold">
                            <td className="p-3">{lang === 'th' ? 'ค่าเฉลี่ยรวม' : 'Overall Avg'}</td>
                            <td className="p-3">{overallAvg.toFixed(1)}</td>
                            <td className="p-3">{Math.max(metricPeakA, metricPeakB, metricPeakC).toFixed(1)}</td>
                            <td className="p-3">—</td>
                            <td className="p-3">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayedCurrentData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="phaseA" stroke="#f59e0b" strokeWidth={2} dot={false} name="L1 (A)" />
                          <Line type="monotone" dataKey="phaseB" stroke="#3b82f6" strokeWidth={2} dot={false} name="L2 (A)" />
                          <Line type="monotone" dataKey="phaseC" stroke="#8b5cf6" strokeWidth={2} dot={false} name="L3 (A)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {(() => {
                      const worstDev = overallAvg > 0
                        ? Math.max(
                            Math.abs(((metricAvgA - overallAvg) / overallAvg) * 100),
                            Math.abs(((metricAvgB - overallAvg) / overallAvg) * 100),
                            Math.abs(((metricAvgC - overallAvg) / overallAvg) * 100),
                          )
                        : 0;
                      return (
                        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-800">
                          {lang === 'th'
                            ? `คำอธิบายผล: กระแสเฉลี่ยรวมอยู่ที่ ${overallAvg.toFixed(1)}A โดยเฟสที่เบี่ยงเบนมากที่สุดอยู่ที่ ${worstDev.toFixed(2)}%. ควรรักษาการกระจายโหลดให้ความเบี่ยงเบนต่อเฟสต่ำกว่า 5% เพื่อความเสถียรของระบบ.`
                            : `Analysis: Overall average current is ${overallAvg.toFixed(1)}A, and the worst phase deviation is ${worstDev.toFixed(2)}%. Keep phase deviation below 5% for better system stability.`}
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}
            </div>

            {/* 3. Findings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-indigo-600" />
                {lang === 'th' ? '3. ผลการตรวจวัด (Findings)' : '3. Findings'}
              </h2>

              {/* 3.1 Measurement Overview */}
              <div className="mt-4 mb-6">
                <h3 className="text-base font-bold text-indigo-700 mb-3">3.1 {lang === 'th' ? 'ภาพรวมการวัด' : 'Measurement Overview'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: lang === 'th' ? 'จำนวนจุดวัด' : 'Data Points', val: String(analysisCurrentRows.length || 4), icon: '📊' },
                    { label: lang === 'th' ? 'ช่วงเวลา' : 'Period', val: formData.measurementPeriod, icon: '📅' },
                    { label: lang === 'th' ? 'อุปกรณ์วัด' : 'Instrument', val: formData.equipment, icon: '🔬' },
                    { label: lang === 'th' ? 'สถานที่' : 'Location', val: formData.location || '—', icon: '📍' },
                    { label: lang === 'th' ? 'แรงดันพิกัด' : 'Nominal Voltage', val: `${formData.voltage} V`, icon: '⚡' },
                    { label: lang === 'th' ? 'ความถี่' : 'Frequency', val: `${formData.frequency} Hz`, icon: '〰️' },
                  ].map(s => (
                    <div key={s.label} className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                      <p className="text-xs text-indigo-500 mb-1">{s.icon} {s.label}</p>
                      <p className="text-sm font-semibold text-indigo-900 truncate">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3.2 Hourly Load Profile */}
              <div>
                <h3 className="text-base font-bold text-indigo-700 mb-3">3.2 {lang === 'th' ? 'โปรไฟล์โหลดรายชั่วโมง' : 'Hourly Load Profile'}</h3>
                {(() => {
                  const hourlyMap: Record<number, number[]> = {};
                  analysisCurrentRows.forEach(row => {
                    const h = (row as any).hour as number ?? 0;
                    if (!hourlyMap[h]) hourlyMap[h] = [];
                    hourlyMap[h].push((row as any).powerKw || 0);
                  });
                  const hourlyBuilt = Array.from({ length: 24 }, (_, h) => ({
                    hour: `${String(h).padStart(2, '0')}:00`,
                    kw: hourlyMap[h] ? hourlyMap[h].reduce((s, v) => s + v, 0) / hourlyMap[h].length : 0,
                  })).filter(d => d.kw > 0);
                  const chartData = hourlyBuilt.length > 0 ? hourlyBuilt : [
                    { hour: '08:00', kw: powerDayMin },
                    { hour: '12:00', kw: powerPeakDemand },
                    { hour: '16:00', kw: powerDayMax },
                    { hour: '22:00', kw: powerNightMin },
                  ];
                  return (
                    <div className="space-y-3">
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 11 }} unit=" kW" />
                            <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)} kW`, lang === 'th' ? 'โหลด' : 'Load']} />
                            <Bar dataKey="kw" fill="#6366f1" radius={[3, 3, 0, 0]} name={lang === 'th' ? 'โหลด (kW)' : 'Load (kW)'} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {(() => {
                        const peakRow = chartData.reduce((m, d) => d.kw > m.kw ? d : m, chartData[0]);
                        const baseRow = chartData.reduce((m, d) => d.kw < m.kw ? d : m, chartData[0]);
                        return (
                          <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50 text-sm text-indigo-800">
                            {lang === 'th'
                              ? `คำอธิบายผล: ช่วงโหลดสูงสุดอยู่ที่ ${peakRow.hour} ประมาณ ${peakRow.kw.toFixed(2)} kW และช่วงโหลดต่ำสุดที่ ${baseRow.hour} ประมาณ ${baseRow.kw.toFixed(2)} kW (ต่างกัน ${(peakRow.kw - baseRow.kw).toFixed(2)} kW).`
                              : `Analysis: Peak load occurs around ${peakRow.hour} at ${peakRow.kw.toFixed(2)} kW, while the base load is around ${baseRow.hour} at ${baseRow.kw.toFixed(2)} kW (delta ${(peakRow.kw - baseRow.kw).toFixed(2)} kW).`}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 4. Executive Summary */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-blue-300" />
                {lang === 'th' ? '4. สรุปผู้บริหาร (Executive Summary)' : '4. Executive Summary'}
              </h2>
              {(() => {
                const pf = formData.powerFactor;
                const imb = metricPeakImbalance;
                const thd = formData.thd;
                const issues: string[] = [];
                if (pf < 0.85) issues.push(lang === 'th' ? `ค่า Power Factor ต่ำมาก (${pf.toFixed(2)}) — เสี่ยงค่าปรับจากการไฟฟ้า` : `Very low Power Factor (${pf.toFixed(2)}) — risk of utility penalty`);
                else if (pf < 0.95) issues.push(lang === 'th' ? `ค่า Power Factor ต่ำกว่ามาตรฐาน (${pf.toFixed(2)}) — ควรปรับปรุง` : `Sub-standard Power Factor (${pf.toFixed(2)}) — improvement needed`);
                if (imb >= 10) issues.push(lang === 'th' ? `ความไม่สมดุลกระแสสูง (${imb.toFixed(1)}%) — เกินมาตรฐาน IEC 60034-26` : `High current imbalance (${imb.toFixed(1)}%) — exceeds IEC 60034-26`);
                else if (imb >= 5) issues.push(lang === 'th' ? `ความไม่สมดุลกระแสระดับเฝ้าระวัง (${imb.toFixed(1)}%)` : `Current imbalance in warning zone (${imb.toFixed(1)}%)`);
                if (loadFactor < 60) issues.push(lang === 'th' ? `Load Factor ต่ำ (${loadFactor.toFixed(1)}%) — การใช้พลังงานไม่มีประสิทธิภาพ` : `Low Load Factor (${loadFactor.toFixed(1)}%) — poor energy efficiency`);
                if (thd > 5) issues.push(lang === 'th' ? `THD สูง (${thd.toFixed(1)}%) — เสี่ยงต่ออุปกรณ์ไวต่อฮาร์มอนิก` : `High THD (${thd.toFixed(1)}%) — risk to harmonic-sensitive equipment`);
                const overallOk = issues.length === 0;
                return (
                  <div className="space-y-4">
                    <div className={`rounded-lg p-4 ${overallOk ? 'bg-green-800 bg-opacity-40 border border-green-500' : 'bg-yellow-800 bg-opacity-40 border border-yellow-500'}`}>
                      <p className="font-bold text-lg">
                        {overallOk
                          ? (lang === 'th' ? '✅ ระบบไฟฟ้าอยู่ในเกณฑ์ดี' : '✅ Electrical System in Good Condition')
                          : (lang === 'th' ? `⚠️ พบ ${issues.length} ประเด็นที่ต้องดำเนินการ` : `⚠️ ${issues.length} Issue(s) Require Attention`)}
                      </p>
                    </div>
                    {issues.length > 0 && (
                      <ul className="space-y-2">
                        {issues.map((iss, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-yellow-400 mt-0.5 shrink-0">⚠</span>
                            <span className="text-blue-100">{iss}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      {[
                        { label: 'Load Factor', val: `${loadFactor.toFixed(1)}%`, ok: loadFactor >= 60 },
                        { label: 'Power Factor', val: formData.powerFactor.toFixed(2), ok: formData.powerFactor >= 0.95 },
                        { label: 'Current Imbalance', val: `${metricPeakImbalance.toFixed(1)}%`, ok: metricPeakImbalance < 5 },
                      ].map(m => (
                        <div key={m.label} className="bg-white bg-opacity-10 rounded-lg p-3 text-center">
                          <p className="text-xs text-blue-300 mb-1">{m.label}</p>
                          <p className={`text-lg font-bold ${m.ok ? 'text-green-400' : 'text-yellow-400'}`}>{m.val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-lg border border-blue-300 bg-blue-800/30 text-sm text-blue-100">
                      {lang === 'th'
                        ? `คำอธิบายผล: สรุปผู้บริหารนี้สร้างจาก 4 ตัวชี้วัดหลัก ได้แก่ PF=${pf.toFixed(2)}, Current Imbalance=${imb.toFixed(1)}%, Load Factor=${loadFactor.toFixed(1)}% และ THD=${thd.toFixed(1)}%. ระบบจัดกลุ่มประเด็นที่ต้องแก้ไขให้อัตโนมัติตามเกณฑ์มาตรฐานที่กำหนด.`
                        : `Analysis: This executive summary is generated from four key metrics: PF=${pf.toFixed(2)}, Current Imbalance=${imb.toFixed(1)}%, Load Factor=${loadFactor.toFixed(1)}%, and THD=${thd.toFixed(1)}%. Issues are auto-grouped by configured standard thresholds.`}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 5. Peak Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-orange-600" />
                {lang === 'th' ? '5. การวิเคราะห์ค่าสูงสุด (Peak Analysis)' : '5. Peak Analysis'}
              </h2>
              {(() => {
                const ratio = powerOverallAvg > 0 ? (powerPeakDemand / powerOverallAvg).toFixed(2) : '—';
                const firstPeakRow = metricPowerRows.filter(r => r.peak >= powerPeakDemand * 0.8)[0];
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                        <p className="text-xs text-red-600 mb-1">{lang === 'th' ? 'ความต้องการสูงสุด' : 'Peak Demand'}</p>
                        <p className="text-base font-bold text-red-800">{powerPeakDemand.toFixed(1)} kW</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                        <p className="text-xs text-blue-600 mb-1">{lang === 'th' ? 'ค่าเฉลี่ยรวม' : 'Overall Average'}</p>
                        <p className="text-base font-bold text-blue-800">{powerOverallAvg.toFixed(1)} kW</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                        <p className="text-xs text-purple-600 mb-1">{lang === 'th' ? 'อัตราส่วน Peak/เฉลี่ย' : 'Peak/Avg Ratio'}</p>
                        <p className="text-base font-bold text-purple-800">{ratio}×</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                        <p className="text-xs text-orange-600 mb-1">{lang === 'th' ? 'ช่วง Peak' : 'Peak Period'}</p>
                        <p className="text-base font-bold text-orange-800 truncate">{firstPeakRow ? firstPeakRow.time : '—'}</p>
                      </div>
                    </div>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayedPowerData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 11 }} unit=" kW" />
                          <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)} kW`]} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="peak" stroke="#ef4444" strokeWidth={2} dot={false} name={lang === 'th' ? 'พลังงาน (kW)' : 'Power (kW)'} />
                          <Line type="monotone" dataKey="avgDay" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name={lang === 'th' ? 'เฉลี่ยกลางวัน' : 'Day Avg'} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="p-3 rounded-lg border border-orange-200 bg-orange-50 text-sm text-orange-800">
                      {lang === 'th'
                        ? `คำอธิบายผล: ค่าพีคสูงกว่าค่าเฉลี่ย ${ratio} เท่า โดยมีความต้องการสูงสุด ${powerPeakDemand.toFixed(1)} kW. หากอัตราส่วน Peak/Avg สูงมาก ควรวางแผนลดพีคหรือกระจายเวลาใช้งานโหลด.`
                        : `Analysis: Peak demand is ${ratio}x the average, reaching ${powerPeakDemand.toFixed(1)} kW. A high Peak/Avg ratio suggests peak-shaving or load-shifting opportunities.`}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 6. Three-Phase Imbalance Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-amber-600" />
                {lang === 'th' ? '6. การวิเคราะห์ความไม่สมดุลสามเฟส' : '6. Three-Phase Imbalance Analysis'}
              </h2>
              {(() => {
                const avg3 = (metricAvgA + metricAvgB + metricAvgC) / 3;
                const deviations = [
                  { phase: 'L1', avg: metricAvgA, peak: metricPeakA },
                  { phase: 'L2', avg: metricAvgB, peak: metricPeakB },
                  { phase: 'L3', avg: metricAvgC, peak: metricPeakC },
                ];
                const maxDevPct = avg3 > 0 ? Math.max(...deviations.map(d => Math.abs(d.avg - avg3))) / avg3 * 100 : 0;
                const isPassIec = maxDevPct < 5;
                const isWarnIec = maxDevPct >= 5 && maxDevPct < 10;
                const phasorData = deviations.map(d => ({ phase: d.phase, avg: parseFloat(d.avg.toFixed(1)), peak: parseFloat(d.peak.toFixed(1)) }));
                return (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="bg-amber-50 rounded-lg px-4 py-3 border border-amber-200">
                        <p className="text-xs text-amber-600">{lang === 'th' ? 'Imbalance ของค่าเฉลี่ย (NEMA)' : 'Avg-based Imbalance (NEMA)'}</p>
                        <p className="text-xl font-bold text-amber-800">{maxDevPct.toFixed(2)}%</p>
                        <p className="text-xs text-amber-500">{lang === 'th' ? 'คำนวณจากกระแสเฉลี่ยแต่ละเฟส' : 'from per-phase time-averages'}</p>
                      </div>
                      {metricAvgImbalance > 0 && (
                        <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-200">
                          <p className="text-xs text-blue-600">{lang === 'th' ? 'Imbalance เฉลี่ยต่อช่วงเวลา' : 'Per-interval Avg Imbalance'}</p>
                          <p className="text-xl font-bold text-blue-800">{metricAvgImbalance.toFixed(2)}%</p>
                          <p className="text-xs text-blue-500">{lang === 'th' ? 'เฉลี่ยของ NEMA ทุกแถวข้อมูล' : 'mean NEMA across all rows'}</p>
                        </div>
                      )}
                      {metricMaxImbalance > 0 && (
                        <div className="bg-red-50 rounded-lg px-4 py-3 border border-red-200">
                          <p className="text-xs text-red-600">{lang === 'th' ? 'Imbalance สูงสุด (Worst-case)' : 'Peak Imbalance (Worst-case)'}</p>
                          <p className="text-xl font-bold text-red-800">{metricMaxImbalance.toFixed(2)}%</p>
                          <p className="text-xs text-red-500">{lang === 'th' ? 'สูงสุดที่พบในข้อมูล' : 'max found in dataset'}</p>
                        </div>
                      )}
                      <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${isPassIec ? 'bg-green-100 text-green-700' : isWarnIec ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {isPassIec ? '✓ Pass — IEC 60034-26 < 5%' : isWarnIec ? '⚠ Warn — 5–10%' : '✗ Fail — > 10%'}
                      </span>
                    </div>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={phasorData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="phase" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                          <YAxis tick={{ fontSize: 11 }} unit=" A" />
                          <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)} A`]} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="avg" fill="#f59e0b" name={lang === 'th' ? 'กระแสเฉลี่ย (A)' : 'Avg Current (A)'} radius={[3, 3, 0, 0]} />
                          <Bar dataKey="peak" fill="#ef4444" name={lang === 'th' ? 'กระแสสูงสุด (A)' : 'Peak Current (A)'} radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-amber-50">
                          <tr>
                            {['Phase', lang === 'th' ? 'กระแสเฉลี่ย (A)' : 'Avg (A)', lang === 'th' ? 'เบี่ยงเบนจาก 3Φ เฉลี่ย' : 'Dev from 3Φ Avg', lang === 'th' ? 'สถานะ' : 'Status'].map(h => (
                              <th key={h} className="p-3 text-left font-semibold text-gray-700">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {deviations.map(d => {
                            const dev = avg3 > 0 ? ((d.avg - avg3) / avg3) * 100 : 0;
                            const ok = Math.abs(dev) < 5;
                            return (
                              <tr key={d.phase} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-3 font-bold text-gray-700">{d.phase}</td>
                                <td className="p-3">{d.avg.toFixed(1)}</td>
                                <td className="p-3">
                                  <span className={dev >= 0 ? 'text-orange-700' : 'text-blue-700'}>
                                    {dev >= 0 ? '+' : ''}{dev.toFixed(2)}%
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {ok ? '✓ OK' : '✗ High'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
                      {lang === 'th'
                        ? `คำอธิบายผล: ความเบี่ยงเบนสูงสุดจากค่าเฉลี่ยสามเฟส = ${maxDevPct.toFixed(2)}% (${isPassIec ? 'ผ่านเกณฑ์' : isWarnIec ? 'อยู่ช่วงเฝ้าระวัง' : 'ไม่ผ่านเกณฑ์'} IEC 60034-26). ควรปรับสมดุลโหลดให้ความต่างแต่ละเฟสใกล้เคียงกันมากขึ้น.`
                        : `Analysis: Maximum deviation from the three-phase average is ${maxDevPct.toFixed(2)}% (${isPassIec ? 'Pass' : isWarnIec ? 'Warning range' : 'Fail'} per IEC 60034-26). Load balancing is recommended to reduce phase spread.`}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 7. Current Imbalance (NEMA Method) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-purple-600" />
                {lang === 'th' ? '7. ความไม่สมดุลกระแส (วิธี NEMA)' : '7. Current Imbalance (NEMA Method)'}
              </h2>
              {(() => {
                const avg3 = (metricAvgA + metricAvgB + metricAvgC) / 3;
                const nema = avg3 > 0
                  ? Math.max(Math.abs(metricAvgA - avg3), Math.abs(metricAvgB - avg3), Math.abs(metricAvgC - avg3)) / avg3 * 100
                  : 0;
                const iecImb = metricPeakImbalance;
                const isPassNema = nema < 1;
                const isWarnNema = nema >= 1 && nema < 2;
                const derating = nema < 1 ? 1.0 : nema < 2 ? 0.98 : nema < 3 ? 0.95 : nema < 4 ? 0.92 : nema < 5 ? 0.88 : 0.82;
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-xs text-purple-600 mb-1">{lang === 'th' ? 'ความไม่สมดุล NEMA MG1' : 'NEMA MG1 Imbalance'}</p>
                        <p className="text-2xl font-bold text-purple-800">{nema.toFixed(2)}%</p>
                        <p className="text-xs text-purple-500 mt-1">Max deviation / Average × 100</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-blue-600 mb-1">{lang === 'th' ? 'ความไม่สมดุลเฉลี่ยต่อช่วงเวลา (IEC 60034-26)' : 'Per-Interval Avg Imbalance (IEC 60034-26)'}</p>
                        <p className="text-2xl font-bold text-blue-800">{iecImb.toFixed(2)}%</p>
                        <p className="text-xs text-blue-500 mt-1">max|Iₙ − Iavg| / Iavg × 100 (row-based average)</p>
                      </div>
                      <div className={`rounded-lg p-4 border ${isPassNema ? 'bg-green-50 border-green-200' : isWarnNema ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                        <p className={`text-xs mb-1 ${isPassNema ? 'text-green-600' : isWarnNema ? 'text-yellow-600' : 'text-red-600'}`}>
                          {lang === 'th' ? 'ค่า Derating มอเตอร์ (NEMA MG1)' : 'Motor Derating Factor (NEMA MG1)'}
                        </p>
                        <p className={`text-2xl font-bold ${isPassNema ? 'text-green-800' : isWarnNema ? 'text-yellow-800' : 'text-red-800'}`}>{(derating * 100).toFixed(0)}%</p>
                        <p className={`text-xs mt-1 ${isPassNema ? 'text-green-500' : isWarnNema ? 'text-yellow-500' : 'text-red-500'}`}>
                          {isPassNema
                            ? (lang === 'th' ? 'ใช้งานมอเตอร์ได้เต็มกำลัง' : 'Motor full capacity')
                            : (lang === 'th' ? 'ต้องลดขนาดกำลังมอเตอร์' : 'Motor derating required')}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
                      <p className="font-semibold mb-2">{lang === 'th' ? '📌 สูตรคำนวณ NEMA MG1' : '📌 NEMA MG1 Formula'}</p>
                      <p className="font-mono text-xs bg-white px-3 py-2 rounded border border-gray-200">
                        % Imbalance = (Max Deviation from Average Current / Average Current) × 100
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {lang === 'th'
                          ? 'มาตรฐาน NEMA MG1: ความไม่สมดุลกระแส > 2% จะต้องลดพิกัดกำลังมอเตอร์และอาจทำให้อายุการใช้งานลดลง'
                          : 'NEMA MG1: Current imbalance > 2% requires motor derating and significantly reduces motor lifespan'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-purple-200 bg-purple-50 text-sm text-purple-800">
                      {lang === 'th'
                        ? `คำอธิบายผล: NEMA Imbalance = ${nema.toFixed(2)}% และแนะนำการ derating มอเตอร์ที่ ${(derating * 100).toFixed(0)}% ของกำลังพิกัด เพื่อจำกัดความร้อนสะสมและยืดอายุอุปกรณ์.`
                        : `Analysis: NEMA imbalance is ${nema.toFixed(2)}%, indicating a recommended motor derating to ${(derating * 100).toFixed(0)}% of rated capacity to limit thermal stress and extend equipment life.`}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 8. Energy (kWh) Estimation and Load Factor Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-green-600" />
                {lang === 'th' ? '8. การประเมินพลังงาน (kWh) และ Load Factor' : '8. Energy (kWh) Estimation and Load Factor Analysis'}
              </h2>

              {/* ── Power Calculator Bill Import Panel ─────────────────────── */}
              {activeBatch?.cusID && (
                <div className="mb-5 border border-blue-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowBillsPanel(p => !p)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                  >
                    <span className="font-semibold text-blue-800 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {lang === 'th' ? '📋 บิลค่าไฟจาก Power Calculator' : '📋 Bills from Power Calculator'}
                      {powerCalcBills.length > 0 && (
                        <span className="ml-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{powerCalcBills.length}</span>
                      )}
                    </span>
                    <span className="text-blue-500 text-xs">{showBillsPanel ? '▲' : '▼'}</span>
                  </button>

                  {showBillsPanel && (
                    <div className="p-4 bg-white space-y-3">
                      {powerCalcBillsLoading ? (
                        <p className="text-sm text-gray-400 text-center py-4">{lang === 'th' ? 'กำลังโหลดบิล...' : 'Loading bills...'}</p>
                      ) : powerCalcBills.length === 0 ? (
                        <div className="py-4">
                          <div className="text-center mb-3">
                            <p className="text-sm text-gray-500">{lang === 'th' ? 'ไม่พบบิลค่าไฟใน Power Calculator สำหรับลูกค้านี้' : 'No Power Calculator bills found for this customer.'}</p>
                            <div className="flex justify-center gap-3 mt-2">
                              <a
                                href="/KR-Thailand/Admin-Login/power-calculator"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-xs text-blue-600 underline"
                              >
                                {lang === 'th' ? '+ สร้างบิลใหม่ใน Power Calculator' : '+ Create new bill in Power Calculator'}
                              </a>
                              <button
                                onClick={() => {
                                  if (showUploadBillForm) {
                                    setShowUploadBillForm(false);
                                  } else {
                                    openDbBillBrowser();
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full transition-colors"
                              >
                                <Upload className="w-3 h-3" />
                                {lang === 'th' ? 'อัปโหลดบิลจากฐานข้อมูล' : 'Upload bill from DB'}
                              </button>
                            </div>
                          </div>

                          {/* ── DB bill browser ── */}
                          {showUploadBillForm && (
                            <div className="mt-3 border border-emerald-200 rounded-xl bg-emerald-50 p-4 space-y-3">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <p className="text-xs font-semibold text-emerald-800">
                                  {lang === 'th'
                                    ? 'เลือกรายการบิลที่บันทึกไว้ในฐานข้อมูล power_calculations เพื่อนำมาใช้คำนวณ'
                                    : 'Select a saved bill from the power_calculations database for calculation'}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Search className="w-3.5 h-3.5 text-emerald-700" />
                                  <input
                                    type="text"
                                    value={dbPowerCalcBillsQuery}
                                    onChange={e => setDbPowerCalcBillsQuery(e.target.value)}
                                    placeholder={lang === 'th' ? 'ค้นหาเลขที่บิล / ลูกค้า / ชื่อรายการ' : 'Search doc no / customer / title'}
                                    className="w-full md:w-72 border border-emerald-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                                  />
                                </div>
                              </div>

                              <div className="text-[11px] text-emerald-700 bg-white/70 border border-emerald-200 rounded-lg px-3 py-2">
                                {lang === 'th'
                                  ? 'ปุ่มนี้จะดึงข้อมูลจากตาราง power_calculations โดยตรง แล้วให้เลือกบิลที่ต้องการนำมาแสดงในส่วนคำนวณ'
                                  : 'This button loads records directly from the power_calculations table and lets you choose one to display in the calculation section.'}
                              </div>

                              {dbPowerCalcBillsLoading ? (
                                <p className="text-xs text-gray-500 py-3 text-center">{lang === 'th' ? 'กำลังโหลดรายการบิลจากฐานข้อมูล...' : 'Loading bills from database...'}</p>
                              ) : dbPowerCalcBillsError ? (
                                <p className="text-xs text-red-600 py-2">{dbPowerCalcBillsError}</p>
                              ) : (() => {
                                const query = dbPowerCalcBillsQuery.trim().toLowerCase();
                                const rows = dbPowerCalcBills.filter((bill: any) => {
                                  if (!query) return true;
                                  const customerText = String(bill.customerName || bill.customer_name || '').toLowerCase();
                                  const titleText = String(bill.title || '').toLowerCase();
                                  const docText = String(bill.power_calcuNo || bill.calcID || '').toLowerCase();
                                  const cusIdText = String(bill.cusID || '').toLowerCase();
                                  return customerText.includes(query)
                                    || titleText.includes(query)
                                    || docText.includes(query)
                                    || cusIdText.includes(query);
                                });

                                return rows.length === 0 ? (
                                  <p className="text-xs text-gray-500 py-3 text-center">{lang === 'th' ? 'ไม่พบบิลที่ตรงกับเงื่อนไขค้นหา' : 'No matching bills found'}</p>
                                ) : (
                                  <div className="overflow-x-auto border border-emerald-200 rounded-lg bg-white">
                                    <table className="w-full text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-emerald-50 text-gray-600">
                                          <th className="px-2 py-2 text-left border-b border-emerald-100">{lang === 'th' ? 'เลขที่บิล' : 'Doc No.'}</th>
                                          <th className="px-2 py-2 text-left border-b border-emerald-100">{lang === 'th' ? 'ลูกค้า' : 'Customer'}</th>
                                          <th className="px-2 py-2 text-left border-b border-emerald-100">{lang === 'th' ? 'วันที่' : 'Date'}</th>
                                          <th className="px-2 py-2 text-right border-b border-emerald-100">{lang === 'th' ? 'kWh/เดือน' : 'kWh/mo'}</th>
                                          <th className="px-2 py-2 text-right border-b border-emerald-100">{lang === 'th' ? 'ค่าไฟ/เดือน' : 'Bill/mo'}</th>
                                          <th className="px-2 py-2 text-center border-b border-emerald-100">{lang === 'th' ? 'นำไปใช้' : 'Use'}</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {rows.map((bill: any) => (
                                          <tr key={bill.calcID} className="hover:bg-emerald-50/40 transition-colors">
                                            <td className="px-2 py-2 border-b border-gray-100 font-mono text-emerald-700">{bill.power_calcuNo || `#${bill.calcID}`}</td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-gray-700 max-w-[220px] truncate" title={bill.customerName || bill.customer_name || bill.title || '-'}>
                                              {bill.customerName || bill.customer_name || bill.title || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-gray-500">{bill.created_at ? String(bill.created_at).slice(0, 10) : '—'}</td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-right">{bill.average_monthly_kwh ? Number(bill.average_monthly_kwh).toLocaleString('en', { maximumFractionDigits: 0 }) : '—'}</td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-right font-semibold text-green-700">{bill.average_monthly_cost ? `฿${Number(bill.average_monthly_cost).toLocaleString('en', { maximumFractionDigits: 0 })}` : '—'}</td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-center">
                                              <button
                                                onClick={() => selectDbBillForCalculation(bill)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-medium"
                                              >
                                                <Eye className="w-3 h-3" />
                                                {lang === 'th' ? 'ใช้คำนวณ' : 'Use'}
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                );
                              })()}

                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setShowUploadBillForm(false)}
                                  className="px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                  {lang === 'th' ? 'ปิด' : 'Close'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Bill selector list */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr className="bg-gray-50 text-gray-600">
                                  <th className="px-2 py-2 text-left border-b border-gray-200">{lang === 'th' ? 'เลือก' : 'Select'}</th>
                                  <th className="px-2 py-2 text-left border-b border-gray-200">{lang === 'th' ? 'เลขที่' : 'Doc No.'}</th>
                                  <th className="px-2 py-2 text-left border-b border-gray-200">{lang === 'th' ? 'วันที่' : 'Date'}</th>
                                  <th className="px-2 py-2 text-right border-b border-gray-200">{lang === 'th' ? 'kWh/เดือน (เฉลี่ย)' : 'kWh/mo (avg)'}</th>
                                  <th className="px-2 py-2 text-right border-b border-gray-200">{lang === 'th' ? 'ค่าไฟ/เดือน (เฉลี่ย)' : 'Bill/mo (avg)'}</th>
                                  <th className="px-2 py-2 text-right border-b border-gray-200">{lang === 'th' ? 'kWh/ปี' : 'kWh/yr'}</th>
                                  <th className="px-2 py-2 text-center border-b border-gray-200">{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {powerCalcBills.map((bill: any) => {
                                  const isSelected = bill.calcID === selectedBillCalcID;
                                  return (
                                    <tr
                                      key={bill.calcID}
                                      onClick={() => setSelectedBillCalcID(bill.calcID)}
                                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                                    >
                                      <td className="px-2 py-2 text-center">
                                        <input
                                          type="radio"
                                          checked={isSelected}
                                          onChange={() => setSelectedBillCalcID(bill.calcID)}
                                          className="accent-blue-600"
                                        />
                                      </td>
                                      <td className="px-2 py-2 font-mono text-blue-700">{bill.power_calcuNo || `#${bill.calcID}`}</td>
                                      <td className="px-2 py-2 text-gray-500">{bill.created_at ? String(bill.created_at).slice(0, 10) : '—'}</td>
                                      <td className="px-2 py-2 text-right font-medium text-gray-800">{bill.average_monthly_kwh ? Number(bill.average_monthly_kwh).toLocaleString('en', { maximumFractionDigits: 0 }) : '—'}</td>
                                      <td className="px-2 py-2 text-right font-bold text-green-700">{bill.average_monthly_cost ? `฿${Number(bill.average_monthly_cost).toLocaleString('en', { maximumFractionDigits: 0 })}` : '—'}</td>
                                      <td className="px-2 py-2 text-right text-gray-600">{bill.total_annual_kwh ? Number(bill.total_annual_kwh).toLocaleString('en', { maximumFractionDigits: 0 }) : '—'}</td>
                                      <td className="px-2 py-2 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bill.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                          {bill.status || 'completed'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Selected bill details */}
                          {(() => {
                            const bill = powerCalcBills.find((b: any) => b.calcID === selectedBillCalcID);
                            if (!bill) return null;
                            const months = [
                              { key: 'january', label: lang === 'th' ? 'ม.ค.' : 'Jan' },
                              { key: 'february', label: lang === 'th' ? 'ก.พ.' : 'Feb' },
                              { key: 'march', label: lang === 'th' ? 'มี.ค.' : 'Mar' },
                              { key: 'april', label: lang === 'th' ? 'เม.ย.' : 'Apr' },
                              { key: 'may', label: lang === 'th' ? 'พ.ค.' : 'May' },
                              { key: 'june', label: lang === 'th' ? 'มิ.ย.' : 'Jun' },
                              { key: 'july', label: lang === 'th' ? 'ก.ค.' : 'Jul' },
                              { key: 'august', label: lang === 'th' ? 'ส.ค.' : 'Aug' },
                              { key: 'september', label: lang === 'th' ? 'ก.ย.' : 'Sep' },
                              { key: 'october', label: lang === 'th' ? 'ต.ค.' : 'Oct' },
                              { key: 'november', label: lang === 'th' ? 'พ.ย.' : 'Nov' },
                              { key: 'december', label: lang === 'th' ? 'ธ.ค.' : 'Dec' },
                            ];
                            const monthlyData = months
                              .map(m => ({
                                month: m.label,
                                kwh: Number(bill[`${m.key}_kwh`]) || 0,
                                cost: Number(bill[`${m.key}_cost`]) || 0,
                              }))
                              .filter(d => d.kwh > 0 || d.cost > 0);

                            return (
                              <div className="mt-3 space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 text-center">
                                    <p className="text-xs text-blue-600">{lang === 'th' ? 'kWh/เดือน (เฉลี่ย)' : 'Avg Monthly kWh'}</p>
                                    <p className="text-lg font-bold text-blue-800">{bill.average_monthly_kwh ? Number(bill.average_monthly_kwh).toLocaleString('en', { maximumFractionDigits: 0 }) : '—'}</p>
                                  </div>
                                  <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
                                    <p className="text-xs text-green-600">{lang === 'th' ? 'ค่าไฟ/เดือน (เฉลี่ย)' : 'Avg Monthly Bill'}</p>
                                    <p className="text-lg font-bold text-green-800">{bill.average_monthly_cost ? `฿${Number(bill.average_monthly_cost).toLocaleString('en', { maximumFractionDigits: 0 })}` : '—'}</p>
                                  </div>
                                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                                    <p className="text-xs text-purple-600">{lang === 'th' ? 'kWh/ปี' : 'Annual kWh'}</p>
                                    <p className="text-lg font-bold text-purple-800">{bill.total_annual_kwh ? Number(bill.total_annual_kwh).toLocaleString('en', { maximumFractionDigits: 0 }) : '—'}</p>
                                  </div>
                                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 text-center">
                                    <p className="text-xs text-orange-600">{lang === 'th' ? 'ค่าไฟ/ปี' : 'Annual Bill'}</p>
                                    <p className="text-lg font-bold text-orange-800">{bill.total_annual_cost ? `฿${Number(bill.total_annual_cost).toLocaleString('en', { maximumFractionDigits: 0 })}` : '—'}</p>
                                  </div>
                                </div>

                                {monthlyData.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-600 mb-2">{lang === 'th' ? 'ข้อมูลค่าไฟรายเดือน (จาก Power Calculator)' : 'Monthly Bill Data (from Power Calculator)'}</p>
                                    <div className="h-44">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                          <YAxis yAxisId="kwh" orientation="left" tick={{ fontSize: 10 }} unit=" kWh" width={60} />
                                          <YAxis yAxisId="cost" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} width={52} />
                                          <Tooltip
                                            formatter={(v: any, name: string) =>
                                              name === (lang === 'th' ? 'kWh' : 'kWh')
                                                ? [`${Number(v).toLocaleString('en', { maximumFractionDigits: 0 })} kWh`, name]
                                                : [`฿${Number(v).toLocaleString('en', { maximumFractionDigits: 0 })}`, name]
                                            }
                                          />
                                          <Legend wrapperStyle={{ fontSize: 11 }} />
                                          <Bar yAxisId="kwh" dataKey="kwh" fill="#60a5fa" name="kWh" radius={[3, 3, 0, 0]} />
                                          <Bar yAxisId="cost" dataKey="cost" fill="#34d399" name={lang === 'th' ? 'ค่าไฟ (฿)' : 'Bill (฿)'} radius={[3, 3, 0, 0]} />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                )}

                                {bill.power_saving_rate > 0 && (
                                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex items-start gap-2">
                                    <span className="text-base">💡</span>
                                    <span>
                                      {lang === 'th'
                                        ? `อัตราประหยัดพลังงานที่ระบุ: ${bill.power_saving_rate}% → ประหยัด ≈ ฿${(Number(bill.average_monthly_cost || 0) * bill.power_saving_rate / 100).toLocaleString('en', { maximumFractionDigits: 0 })}/เดือน`
                                        : `Stated energy saving rate: ${bill.power_saving_rate}% → savings ≈ ฿${(Number(bill.average_monthly_cost || 0) * bill.power_saving_rate / 100).toLocaleString('en', { maximumFractionDigits: 0 })}/month`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Main Section 8 analysis ─────────────────────────────────── */}
              {(() => {
                // Base + advanced tariff assumptions (Thailand LV business-style estimate)
                const electricityRate = 4.2; // kept for legacy/simple comparison
                const energyRate = 4.2;
                const ftRate = 0.3972;
                const demandRate = 196.26;
                const serviceCharge = 312.24;
                const vatRate = 0.07;

                const hasIntervalEnergy = intervalEnergyStats.hasIntervals;
                const observedHours = intervalEnergyStats.coverageHours;
                const observedEnergyKwh = intervalEnergyStats.energyKwh;
                const avgKwForEnergy = hasIntervalEnergy ? intervalEnergyStats.avgKw : powerOverallAvg;
                const dailyKwh = hasIntervalEnergy && observedHours > 0
                  ? (observedEnergyKwh * 24) / observedHours
                  : avgKwForEnergy * 24;
                const monthlyKwh = dailyKwh * 30;
                const monthlyBill = monthlyKwh * electricityRate;
                const energyCharge = monthlyKwh * (energyRate + ftRate);
                const demandCharge = powerPeakDemand * demandRate;
                const monthlyBillAdvanced = (energyCharge + demandCharge + serviceCharge) * (1 + vatRate);

                // Use only same-customer bill data (cusID matched) for calibration; no cross-customer fallback assumptions
                const selectedBill = powerCalcBills.find((b: any) => b.calcID === selectedBillCalcID);
                const billAvgCost = selectedBill ? Number(selectedBill.average_monthly_cost) : 0;
                const billAvgKwh = selectedBill ? Number(selectedBill.average_monthly_kwh) : 0;
                const hasBillData = billAvgCost > 0;

                const historicalBillMin = hasBillData ? billAvgCost * 0.9 : null;
                const historicalBillMax = hasBillData ? billAvgCost * 1.1 : null;
                const historicalBillMid = hasBillData ? billAvgCost : null;
                const requiredMultiplierMin = hasBillData && monthlyBillAdvanced > 0 && historicalBillMin !== null ? historicalBillMin / monthlyBillAdvanced : null;
                const requiredMultiplierMax = hasBillData && monthlyBillAdvanced > 0 && historicalBillMax !== null ? historicalBillMax / monthlyBillAdvanced : null;
                const requiredMultiplierMid = hasBillData && monthlyBillAdvanced > 0 && historicalBillMid !== null ? historicalBillMid / monthlyBillAdvanced : null;
                const feederCoveragePct = hasBillData && monthlyBillAdvanced > 0 && historicalBillMid !== null
                  ? (monthlyBillAdvanced / historicalBillMid) * 100
                  : null;
                const calibratedMonthlyKwh = hasBillData && billAvgKwh > 0 ? billAvgKwh : null;
                const calibratedLossFromImbalance = calibratedMonthlyKwh && metricPeakImbalance > 0
                  ? (metricPeakImbalance / 100) * 0.025 * calibratedMonthlyKwh
                  : null;
                const lossFromImbalance = metricPeakImbalance > 0 ? (metricPeakImbalance / 100) * 0.025 * monthlyKwh : 0;
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                        <p className="text-xs text-green-600 mb-1">{lang === 'th' ? 'ใช้พลังงาน/วัน (ประมาณ)' : 'Est. Daily Energy'}</p>
                        <p className="text-base font-bold text-green-800">{dailyKwh.toFixed(0)} kWh</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                        <p className="text-xs text-blue-600 mb-1">{lang === 'th' ? 'ใช้พลังงาน/เดือน (ประมาณ)' : 'Est. Monthly Energy'}</p>
                        <p className="text-base font-bold text-blue-800">{monthlyKwh.toFixed(0)} kWh</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                        <p className="text-xs text-orange-600 mb-1">{lang === 'th' ? 'ค่าไฟ/เดือน (โมเดลง่าย)' : 'Monthly Bill (Simple)'}</p>
                        <p className="text-base font-bold text-orange-800">฿{monthlyBill.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className={`rounded-lg p-3 text-center border ${loadFactor >= 60 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <p className={`text-xs mb-1 ${loadFactor >= 60 ? 'text-green-600' : 'text-red-600'}`}>Load Factor</p>
                        <p className={`text-base font-bold ${loadFactor >= 60 ? 'text-green-800' : 'text-red-800'}`}>{loadFactor.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <p className="text-xs text-indigo-600 mb-1">{lang === 'th' ? 'ค่าไฟ/เดือน (โมเดลไทยแบบละเอียด)' : 'Monthly Bill (Advanced Thai Model)'}</p>
                        <p className="text-lg font-bold text-indigo-800">฿{monthlyBillAdvanced.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
                        <p className="text-xs text-indigo-500 mt-1">{lang === 'th' ? 'Energy+Ft + Demand + Service + VAT' : 'Energy+Ft + Demand + Service + VAT'}</p>
                      </div>
                      <div className={`rounded-lg p-3 border ${hasBillData ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-xs mb-1 ${hasBillData ? 'text-purple-600' : 'text-gray-500'}`}>
                          {hasBillData
                            ? (lang === 'th' ? '📋 บิลจริงลูกค้าเดียวกัน (Power Calculator)' : '📋 Same-customer actual bill (Power Calculator)')
                            : (lang === 'th' ? 'ไม่พบบิลของลูกค้ารายนี้ในฐานข้อมูล' : 'No same-customer bill found in database')}
                        </p>
                        <p className={`text-lg font-bold ${hasBillData ? 'text-purple-800' : 'text-gray-500'}`}>
                          {hasBillData && historicalBillMid !== null
                            ? `฿${historicalBillMid!.toLocaleString('en', { maximumFractionDigits: 0 })}`
                            : 'N/A'}
                        </p>
                        <p className={`text-xs mt-1 ${hasBillData ? 'text-purple-500' : 'text-gray-400'}`}>
                          {hasBillData && requiredMultiplierMid !== null
                            ? (lang === 'th' ? `เทียบโมเดล: x${requiredMultiplierMid!.toFixed(2)}` : `vs model: x${requiredMultiplierMid!.toFixed(2)}`)
                            : (lang === 'th' ? 'ไม่คาลิเบรตข้ามลูกค้า (Same-customer only)' : 'No cross-customer calibration (same-customer only)')}
                        </p>
                      </div>
                      <div className={`rounded-lg p-3 border ${feederCoveragePct === null ? 'bg-gray-50 border-gray-200' : feederCoveragePct >= 80 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        <p className={`text-xs mb-1 ${feederCoveragePct === null ? 'text-gray-500' : feederCoveragePct >= 80 ? 'text-green-600' : 'text-yellow-700'}`}>{lang === 'th' ? 'ความครอบคลุมของจุดวัดเทียบทั้งไซต์' : 'Measured Feeder Coverage vs Whole Site'}</p>
                        <p className={`text-lg font-bold ${feederCoveragePct === null ? 'text-gray-500' : feederCoveragePct >= 80 ? 'text-green-800' : 'text-yellow-800'}`}>{feederCoveragePct === null ? 'N/A' : `${feederCoveragePct.toFixed(1)}%`}</p>
                        <p className={`text-xs mt-1 ${feederCoveragePct === null ? 'text-gray-400' : feederCoveragePct >= 80 ? 'text-green-500' : 'text-yellow-600'}`}>
                          {feederCoveragePct === null
                            ? (lang === 'th' ? 'ต้องมีบิลลูกค้ารายเดียวกันก่อน จึงคำนวณ coverage ได้' : 'Coverage requires same-customer bill data')
                            : (lang === 'th' ? 'ยิ่งต่ำยิ่งบ่งชี้ว่าข้อมูลอาจเป็นบาง feeder' : 'Lower values suggest this dataset is likely partial feeder data')}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
                      <p className="font-semibold mb-1">{lang === 'th' ? 'องค์ประกอบค่าไฟ (โมเดลไทยแบบละเอียด):' : 'Bill component breakdown (advanced Thai model):'}</p>
                      <p>{lang === 'th' ? 'ค่าพลังงาน+Ft' : 'Energy+Ft'}: ฿{energyCharge.toLocaleString('en', { maximumFractionDigits: 0 })} · {lang === 'th' ? 'ค่า Demand' : 'Demand'}: ฿{demandCharge.toLocaleString('en', { maximumFractionDigits: 0 })} · {lang === 'th' ? 'ค่าบริการ' : 'Service'}: ฿{serviceCharge.toLocaleString('en', { maximumFractionDigits: 0 })} · VAT 7%</p>
                    </div>

                    {lossFromImbalance > 0 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                        <p className="font-semibold text-orange-800">
                          {lang === 'th' ? '⚡ การสูญเสียพลังงานจากความไม่สมดุล (ประมาณ):' : '⚡ Estimated Energy Loss from Imbalance:'}
                        </p>
                        <p className="text-orange-700 mt-1">
                          ≈ {lossFromImbalance.toFixed(0)} kWh/{lang === 'th' ? 'เดือน' : 'mo'} ≈ ฿{(lossFromImbalance * electricityRate).toLocaleString('en', { maximumFractionDigits: 0 })}/{lang === 'th' ? 'เดือน' : 'mo'}
                          {calibratedLossFromImbalance !== null
                            ? (lang === 'th'
                              ? ` · เมื่อคาลิเบรตด้วยบิลลูกค้ารายเดียวกัน ≈ ${calibratedLossFromImbalance.toFixed(0)} kWh/เดือน`
                              : ` · calibrated with same-customer bill: ≈ ${calibratedLossFromImbalance.toFixed(0)} kWh/mo`)
                            : (lang === 'th'
                              ? ' · ไม่มีบิลลูกค้ารายเดียวกัน จึงไม่คาลิเบรตเพิ่ม'
                              : ' · no same-customer bill, so no extra calibration')}
                        </p>
                      </div>
                    )}
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayedPowerData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 11 }} unit=" kW" />
                          <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)} kW`]} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="peak" stroke="#22c55e" strokeWidth={2} dot={false} name={lang === 'th' ? 'พลังงาน (kW)' : 'Power (kW)'} />
                          <Line type="monotone" dataKey="night" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name={lang === 'th' ? 'โหลดกลางคืน' : 'Night Load'} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-400">* {lang === 'th' ? 'ค่าไฟฟ้าประมาณ 4.20 บาท/kWh (PEA/MEA ไทย) — เป็นค่าประมาณการเท่านั้น' : 'Electricity rate ≈ 4.20 THB/kWh (Thailand PEA/MEA) — estimated values only'}</p>
                    <p className="text-xs text-gray-400">* {lang === 'th' ? (hasIntervalEnergy
                      ? `วิธีคำนวณพลังงาน: อินทิเกรตกำลังตามช่วงเวลา (trapezoidal) จากข้อมูล ${observedHours.toFixed(1)} ชั่วโมง แล้ว normalize เป็น 24 ชม./วัน`
                      : 'วิธีคำนวณพลังงานสำรอง: ใช้กำลังเฉลี่ย × 24 (เนื่องจากข้อมูลเวลาไม่พอสำหรับการอินทิเกรต)')
                      : (hasIntervalEnergy
                        ? `Energy method: interval integration (trapezoidal) over ${observedHours.toFixed(1)} observed hours, then normalized to 24h/day`
                        : 'Fallback energy method: average power × 24 (insufficient timestamp continuity for interval integration)')}</p>
                    <div className="p-3 rounded-lg border border-green-200 bg-green-50 text-sm text-green-800">
                      {lang === 'th'
                        ? (hasBillData && historicalBillMid !== null && requiredMultiplierMid !== null
                            ? `คำอธิบายผล: จากข้อมูลโหลดนี้ ระบบคำนวณได้ ${monthlyKwh.toFixed(0)} kWh/เดือน (โมเดล ≈ ฿${monthlyBillAdvanced.toLocaleString('en', { maximumFractionDigits: 0 })}/เดือน). บิลจริงของลูกค้ารายเดียวกันจาก Power Calculator คือ ฿${historicalBillMid!.toLocaleString('en', { maximumFractionDigits: 0 })}/เดือน (${billAvgKwh > 0 ? `${billAvgKwh.toLocaleString('en', { maximumFractionDigits: 0 })} kWh/เดือน` : '—'}) ต้องสเกล x${requiredMultiplierMid!.toFixed(2)} เพื่อให้สอดคล้องกัน ซึ่งบ่งชี้ถึงสัดส่วน feeder ที่วัดได้.`
                            : `คำอธิบายผล: จากข้อมูลโหลดนี้ ระบบคำนวณได้ ${monthlyKwh.toFixed(0)} kWh/เดือน และค่าไฟแบบละเอียด ≈ ฿${monthlyBillAdvanced.toLocaleString('en', { maximumFractionDigits: 0 })}/เดือน แต่ยังไม่พบบิลของลูกค้ารายเดียวกันในฐานข้อมูล จึงยังไม่ทำการคาลิเบรตหรือเทียบ coverage ข้ามลูกค้า.`)
                        : (hasBillData && historicalBillMid !== null && requiredMultiplierMid !== null
                            ? `Analysis: This dataset yields ${monthlyKwh.toFixed(0)} kWh/month (model ≈ ฿${monthlyBillAdvanced.toLocaleString('en', { maximumFractionDigits: 0 })}/month). Same-customer actual bill from Power Calculator is ฿${historicalBillMid!.toLocaleString('en', { maximumFractionDigits: 0 })}/month (${billAvgKwh > 0 ? `${billAvgKwh.toLocaleString('en', { maximumFractionDigits: 0 })} kWh/month` : '—'}), requiring a x${requiredMultiplierMid!.toFixed(2)} scale factor, indicating measured feeder coverage ratio.`
                            : `Analysis: This dataset yields ${monthlyKwh.toFixed(0)} kWh/month and advanced bill ≈ ฿${monthlyBillAdvanced.toLocaleString('en', { maximumFractionDigits: 0 })}/month, but no same-customer bill was found in database, so cross-customer calibration/coverage estimation is intentionally disabled.`)}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 9. Advanced Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-cyan-600" />
                {lang === 'th' ? '9. การวิเคราะห์เชิงลึก (Advanced Analysis)' : '9. Advanced Analysis'}
              </h2>
              {(() => {
                const thd = formData.thd;
                const thdPass = thd <= 5;
                const thdWarn = thd > 5 && thd <= 8;
                const pqScore = Math.round(
                  (formData.powerFactor / 1.0) * 40 +
                  (metricPeakImbalance < 5 ? 1 : metricPeakImbalance < 10 ? 0.6 : 0.3) * 30 +
                  (thdPass ? 1 : thdWarn ? 0.6 : 0.3) * 20 +
                  (loadFactor >= 60 ? 1 : loadFactor >= 40 ? 0.7 : 0.4) * 10
                );
                const pqGrade = pqScore >= 85 ? 'A' : pqScore >= 70 ? 'B' : pqScore >= 55 ? 'C' : 'D';
                const pqColorClass = pqScore >= 85 ? 'green' : pqScore >= 70 ? 'blue' : pqScore >= 55 ? 'yellow' : 'red';
                const ksaverKva_demand = Math.ceil(powerPeakDemand * 1.25 / 10) * 10;
                const breakerAmps9 = formData.mainBreakerAmps || 0;
                const voltageNum9 = parseFloat(formData.voltage) || 380;
                const ksaverKva_breaker = breakerAmps9 > 0 ? Math.ceil(Math.sqrt(3) * voltageNum9 * breakerAmps9 / 1000 / 10) * 10 : 0;
                const ksaverKva = Math.max(ksaverKva_demand, ksaverKva_breaker);
                const getKsaverModel = (kva: number) => {
                  if (kva <= 50) return 'KSAVER 50KVA';
                  if (kva <= 75) return 'KSAVER 75KVA';
                  if (kva <= 100) return 'KSAVER 100KVA';
                  if (kva <= 150) return 'KSAVER 150KVA';
                  if (kva <= 200) return 'KSAVER 200KVA';
                  if (kva <= 250) return 'KSAVER 250KVA';
                  if (kva <= 300) return 'KSAVER 300KVA';
                  return `KSAVER Custom ≥${kva}KVA`;
                };
                const autoKsaverModel = ksaverKva > 0 ? getKsaverModel(ksaverKva) : '';
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`bg-${pqColorClass}-50 rounded-xl p-4 border-2 border-${pqColorClass}-300 text-center`}>
                        <p className={`text-xs text-${pqColorClass}-600 mb-1`}>{lang === 'th' ? 'คะแนนคุณภาพไฟฟ้า' : 'Power Quality Score'}</p>
                        <p className={`text-4xl font-black text-${pqColorClass}-800`}>{pqScore}</p>
                        <p className={`text-xl font-bold text-${pqColorClass}-700`}>{lang === 'th' ? `เกรด ${pqGrade}` : `Grade ${pqGrade}`}</p>
                        <p className="text-xs text-gray-500 mt-1">{lang === 'th' ? 'จาก 100 คะแนน' : 'out of 100'}</p>
                      </div>
                      <div className={`rounded-lg p-4 border ${thdPass ? 'bg-green-50 border-green-200' : thdWarn ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                        <p className={`text-xs mb-1 ${thdPass ? 'text-green-600' : thdWarn ? 'text-yellow-600' : 'text-red-600'}`}>
                          Total Harmonic Distortion (THD)
                        </p>
                        <p className={`text-2xl font-bold ${thdPass ? 'text-green-800' : thdWarn ? 'text-yellow-800' : 'text-red-800'}`}>{thd.toFixed(1)}%</p>
                        <p className={`text-xs mt-1 ${thdPass ? 'text-green-500' : thdWarn ? 'text-yellow-500' : 'text-red-500'}`}>
                          {thdPass ? '✓ ' : thdWarn ? '⚠ ' : '✗ '}IEEE 519: ≤ 5%
                        </p>
                      </div>
                      <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                        <p className="text-xs text-cyan-600 mb-1">{lang === 'th' ? 'แนะนำขนาดอุปกรณ์' : 'Recommended Equipment'}</p>
                        <p className="text-2xl font-bold text-cyan-800">{ksaverKva > 0 ? `${ksaverKva} kVA` : '—'}</p>
                        <p className="text-xs font-semibold text-cyan-700 mt-0.5">{autoKsaverModel}</p>
                        <div className="text-xs text-cyan-500 mt-1 space-y-0.5">
                          <p>📊 {lang === 'th' ? `Peak: ${ksaverKva_demand > 0 ? ksaverKva_demand + ' kVA' : '—'}` : `Peak demand: ${ksaverKva_demand > 0 ? ksaverKva_demand + ' kVA' : '—'}`}</p>
                          {ksaverKva_breaker > 0 && <p>⚡ {lang === 'th' ? `เบรคเกอร์: ${ksaverKva_breaker} kVA` : `Breaker: ${ksaverKva_breaker} kVA`}</p>}
                          <p className="font-semibold text-cyan-600">{lang === 'th' ? `→ ใช้ค่าสูงสุด: ${ksaverKva} kVA` : `→ Using max: ${ksaverKva} kVA`}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3">{lang === 'th' ? 'รายละเอียดคะแนนคุณภาพไฟฟ้า' : 'Power Quality Score Breakdown'}</p>
                      <div className="space-y-2">
                        {[
                          { label: `Power Factor (${formData.powerFactor.toFixed(2)})`, score: Math.round(formData.powerFactor * 40), max: 40 },
                          { label: `Current Imbalance (${metricPeakImbalance.toFixed(1)}%)`, score: Math.round((metricPeakImbalance < 5 ? 1 : metricPeakImbalance < 10 ? 0.6 : 0.3) * 30), max: 30 },
                          { label: `THD (${thd.toFixed(1)}%)`, score: Math.round((thdPass ? 1 : thdWarn ? 0.6 : 0.3) * 20), max: 20 },
                          { label: `Load Factor (${loadFactor.toFixed(1)}%)`, score: Math.round((loadFactor >= 60 ? 1 : loadFactor >= 40 ? 0.7 : 0.4) * 10), max: 10 },
                        ].map(item => (
                          <div key={item.label} className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 w-48 truncate">{item.label}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div className="h-3 rounded-full bg-blue-500" style={{ width: `${(item.score / item.max) * 100}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 w-14 text-right">{item.score}/{item.max}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-cyan-200 bg-cyan-50 text-sm text-cyan-800">
                      {lang === 'th'
                        ? `คำอธิบายผล: คะแนนคุณภาพไฟฟ้ารวม = ${pqScore}/100 (เกรด ${pqGrade}) โดยคะแนนถูกถ่วงน้ำหนักจาก PF 40%, Current Imbalance 30%, THD 20% และ Load Factor 10%. ค่าคะแนนนี้ช่วยสรุประดับความพร้อมของระบบในรูปตัวเลขเดียว.`
                        : `Analysis: Overall power quality score is ${pqScore}/100 (Grade ${pqGrade}), weighted by PF 40%, current imbalance 30%, THD 20%, and load factor 10%. This gives a single numeric readiness indicator for the system.`}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 10. Quantified Power Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-green-600" />
                {lang === 'th' ? '10. การวิเคราะห์กำลังไฟฟ้าเชิงปริมาณ' : '10. Quantified Power Analysis'}
              </h2>
              {(() => {
                const pf = formData.powerFactor;
                const nomV = parseFloat(formData.voltage) || 380;
                const vMean = metricCurrentRows.length > 0
                  ? metricCurrentRows.reduce((s, d) => s + ((d as any).voltage || nomV), 0) / metricCurrentRows.length
                  : nomV;
                const iAvg = (metricAvgA + metricAvgB + metricAvgC) / 3;
                const apparentKva = (Math.sqrt(3) * vMean * iAvg) / 1000;
                const activeKw = apparentKva * pf;
                const reactiveKvar = Math.sqrt(Math.max(0, apparentKva ** 2 - activeKw ** 2));
                const targetPf = 0.95;
                const capacitorKvar = reactiveKvar - activeKw * Math.tan(Math.acos(targetPf));
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-blue-600 mb-1">{lang === 'th' ? 'กำลังปรากฏ (S)' : 'Apparent Power (S)'}</p>
                        <p className="text-base font-bold text-blue-800">{apparentKva.toFixed(1)} kVA</p>
                        <p className="text-xs text-blue-400 font-mono">S = √3 × V × I</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-green-600 mb-1">{lang === 'th' ? 'กำลังแอกทีฟ (P)' : 'Active Power (P)'}</p>
                        <p className="text-base font-bold text-green-800">{activeKw.toFixed(1)} kW</p>
                        <p className="text-xs text-green-400 font-mono">P = S × PF</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <p className="text-xs text-orange-600 mb-1">{lang === 'th' ? 'กำลังรีแอกทีฟ (Q)' : 'Reactive Power (Q)'}</p>
                        <p className="text-base font-bold text-orange-800">{reactiveKvar.toFixed(1)} kVAR</p>
                        <p className="text-xs text-orange-400 font-mono">Q = √(S²−P²)</p>
                      </div>
                      <div className={`rounded-lg p-3 border ${capacitorKvar > 0 ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-xs mb-1 ${capacitorKvar > 0 ? 'text-purple-600' : 'text-gray-500'}`}>{lang === 'th' ? 'Capacitor ที่แนะนำ' : 'Recommended Cap.'}</p>
                        <p className={`text-base font-bold ${capacitorKvar > 0 ? 'text-purple-800' : 'text-gray-500'}`}>
                          {capacitorKvar > 0 ? `${capacitorKvar.toFixed(1)} kVAR` : (lang === 'th' ? 'ไม่จำเป็น' : 'Not needed')}
                        </p>
                        <p className={`text-xs font-mono ${capacitorKvar > 0 ? 'text-purple-400' : 'text-gray-400'}`}>PF → {targetPf}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3">📐 {lang === 'th' ? 'Power Triangle' : 'Power Triangle'}</p>
                      <div className="flex items-center gap-8 flex-wrap">
                        <div className="w-36 h-24">
                          <svg viewBox="0 0 130 85" className="w-full h-full">
                            <line x1="10" y1="75" x2="115" y2="75" stroke="#22c55e" strokeWidth="3" />
                            <line x1="115" y1="75" x2="115" y2="15" stroke="#f97316" strokeWidth="3" />
                            <line x1="10" y1="75" x2="115" y2="15" stroke="#3b82f6" strokeWidth="3" />
                            <text x="58" y="88" fontSize="8" fill="#22c55e" textAnchor="middle">P={activeKw.toFixed(0)}kW</text>
                            <text x="122" y="50" fontSize="8" fill="#f97316" textAnchor="start">Q</text>
                            <text x="55" y="40" fontSize="8" fill="#3b82f6" textAnchor="middle" transform="rotate(-28 62 52)">S={apparentKva.toFixed(0)}kVA</text>
                          </svg>
                        </div>
                        <div className="text-xs space-y-1 text-gray-600">
                          <p>🟢 P (Active) = {activeKw.toFixed(1)} kW</p>
                          <p>🟠 Q (Reactive) = {reactiveKvar.toFixed(1)} kVAR</p>
                          <p>🔵 S (Apparent) = {apparentKva.toFixed(1)} kVA</p>
                          <p>⚡ cos φ = {pf.toFixed(3)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayedPowerData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 11 }} unit=" kW" />
                          <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)} kW`]} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="peak" stroke="#22c55e" strokeWidth={2} dot={false} name="P (kW)" />
                          <Line type="monotone" dataKey="avgDay" stroke="#3b82f6" strokeWidth={1.5} dot={false} name={lang === 'th' ? 'เฉลี่ยกลางวัน' : 'Avg Day'} />
                          <Line type="monotone" dataKey="night" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name={lang === 'th' ? 'กลางคืน' : 'Night'} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">
                      {lang === 'th'
                        ? `คำอธิบายผล: จากค่าเฉลี่ย V=${vMean.toFixed(1)}V และ I=${iAvg.toFixed(1)}A ได้ S=${apparentKva.toFixed(1)}kVA, P=${activeKw.toFixed(1)}kW, Q=${reactiveKvar.toFixed(1)}kVAR. ${capacitorKvar > 0 ? `เพื่อยก PF ไป ${targetPf} แนะนำชดเชยรีแอกทีฟประมาณ ${capacitorKvar.toFixed(1)}kVAR.` : 'ค่า PF อยู่ในช่วงที่ยังไม่จำเป็นต้องชดเชยเพิ่มเติม.'}`
                        : `Analysis: Using average V=${vMean.toFixed(1)}V and I=${iAvg.toFixed(1)}A gives S=${apparentKva.toFixed(1)}kVA, P=${activeKw.toFixed(1)}kW, and Q=${reactiveKvar.toFixed(1)}kVAR. ${capacitorKvar > 0 ? `To improve PF to ${targetPf}, reactive compensation of about ${capacitorKvar.toFixed(1)}kVAR is recommended.` : 'PF is currently in a range that does not require extra compensation.'}`}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 11. Technical Interpretation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-slate-600" />
                {lang === 'th' ? '11. การตีความผลทางเทคนิค (Technical Interpretation)' : '11. Technical Interpretation'}
              </h2>
              {(() => {
                const pf = formData.powerFactor;
                const imb = metricPeakImbalance;
                const thd = formData.thd;
                const items: { title: string; detail: string; severity: 'ok' | 'warn' | 'fail' }[] = [
                  {
                    title: `Power Factor: ${pf.toFixed(2)}`,
                    detail: pf >= 0.95
                      ? (lang === 'th' ? 'ค่า PF ดีเยี่ยม ไม่จำเป็นต้องติดตั้ง Capacitor Bank เพิ่มเติม' : 'Excellent PF — no additional capacitor bank required')
                      : pf >= 0.85
                      ? (lang === 'th' ? `ค่า PF ต่ำกว่ามาตรฐาน ควรพิจารณาติดตั้ง Capacitor Bank เพื่อปรับปรุงและลดค่าไฟ` : 'Sub-standard PF — recommend capacitor bank for correction and cost savings')
                      : (lang === 'th' ? 'ค่า PF ต่ำมาก เสี่ยงถูกปรับจากการไฟฟ้า ต้องติดตั้ง Capacitor Bank โดยด่วน' : 'Very low PF — immediate capacitor bank installation required to avoid utility penalty'),
                    severity: pf >= 0.95 ? 'ok' : pf >= 0.85 ? 'warn' : 'fail',
                  },
                  {
                    title: lang === 'th' ? `ความไม่สมดุลกระแส: ${imb.toFixed(1)}%` : `Current Imbalance: ${imb.toFixed(1)}%`,
                    detail: imb < 5
                      ? (lang === 'th' ? 'ความสมดุลกระแสอยู่ในเกณฑ์ดี ตามมาตรฐาน IEC 60034-26 (<5%)' : 'Current balance is within IEC 60034-26 standard (<5%)')
                      : imb < 10
                      ? (lang === 'th' ? 'ความไม่สมดุลกระแสระดับเฝ้าระวัง ควรตรวจสอบการกระจายโหลดและวงจรควบคุม' : 'Current imbalance in warning zone — inspect load distribution and control circuits')
                      : (lang === 'th' ? 'ความไม่สมดุลกระแสสูงเกินมาตรฐาน อาจทำให้มอเตอร์ร้อนเกิน อายุการใช้งานลดลง และเสี่ยงต่อความเสียหาย' : 'Excessive current imbalance — risk of motor overheating, reduced lifespan, and potential damage'),
                    severity: imb < 5 ? 'ok' : imb < 10 ? 'warn' : 'fail',
                  },
                  ...(thd > 0 ? [{
                    title: `THD: ${thd.toFixed(1)}%`,
                    detail: thd <= 5
                      ? (lang === 'th' ? 'THD อยู่ในเกณฑ์มาตรฐาน IEEE 519 (<5%) อุปกรณ์ทำงานปกติ' : 'THD within IEEE 519 (<5%) — equipment operating normally')
                      : thd <= 8
                      ? (lang === 'th' ? 'THD สูงกว่ามาตรฐาน IEEE 519 ควรพิจารณาติดตั้ง Harmonic Filter หรือ Active Filter' : 'THD exceeds IEEE 519 — consider harmonic filter or active power filter')
                      : (lang === 'th' ? 'THD สูงมาก อาจทำให้หม้อแปลงร้อน ระบบป้องกันผิดพลาด และอุปกรณ์ไวต่อฮาร์มอนิกเสียหาย' : 'Very high THD — risk of transformer overheating, false protection trips, and damage to sensitive equipment'),
                    severity: (thd <= 5 ? 'ok' : thd <= 8 ? 'warn' : 'fail') as 'ok' | 'warn' | 'fail',
                  }] : []),
                  {
                    title: lang === 'th' ? `Load Factor: ${loadFactor.toFixed(1)}%` : `Load Factor: ${loadFactor.toFixed(1)}%`,
                    detail: loadFactor >= 60
                      ? (lang === 'th' ? 'Load Factor อยู่ในเกณฑ์ดี การใช้พลังงานสม่ำเสมอและมีประสิทธิภาพ' : 'Good Load Factor — consistent and efficient energy utilization')
                      : loadFactor >= 40
                      ? (lang === 'th' ? 'Load Factor ค่อนข้างต่ำ ควรปรับตารางการใช้พลังงานหรือโยกย้ายโหลดมาช่วงนอก Peak Hours' : 'Below average Load Factor — consider load scheduling or shifting loads to off-peak hours')
                      : (lang === 'th' ? 'Load Factor ต่ำมาก บ่งชี้ว่ามีการใช้พลังงานสูงสุดสั้น ควรปรับปรุงการบริหารพลังงาน' : 'Very low Load Factor — brief peak usage, energy management improvement required'),
                    severity: loadFactor >= 60 ? 'ok' : loadFactor >= 40 ? 'warn' : 'fail',
                  },
                ];
                const icons = { ok: '✓', warn: '⚠', fail: '✗' };
                return (
                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <div key={i} className={`p-4 rounded-lg border-l-4 ${item.severity === 'ok' ? 'bg-green-50 border-green-400' : item.severity === 'warn' ? 'bg-yellow-50 border-yellow-400' : 'bg-red-50 border-red-400'}`}>
                        <p className={`font-bold text-sm mb-1 ${item.severity === 'ok' ? 'text-green-700' : item.severity === 'warn' ? 'text-yellow-700' : 'text-red-700'}`}>
                          {icons[item.severity]} {item.title}
                        </p>
                        <p className="text-sm text-gray-700">{item.detail}</p>
                      </div>
                    ))}
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700">
                      {(() => {
                        const okCount = items.filter(i => i.severity === 'ok').length;
                        const warnCount = items.filter(i => i.severity === 'warn').length;
                        const failCount = items.filter(i => i.severity === 'fail').length;
                        return lang === 'th'
                          ? `สรุปผลเชิงเทคนิค: ผ่าน ${okCount} หัวข้อ, เฝ้าระวัง ${warnCount} หัวข้อ, ไม่ผ่าน ${failCount} หัวข้อ โดยจัดลำดับจากค่าคำนวณจริงของ PF, imbalance, THD และ load factor.`
                          : `Technical summary: ${okCount} pass, ${warnCount} warning, and ${failCount} fail item(s), prioritized from calculated PF, imbalance, THD, and load factor values.`;
                      })()}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 12. Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
                {lang === 'th' ? '12. ข้อเสนอแนะ (Recommendations)' : '12. Recommendations'}
              </h2>
              {(() => {
                const pf = formData.powerFactor;
                const imb = metricPeakImbalance;
                const thd = formData.thd;
                const ksaverKva_demand12 = Math.ceil(powerPeakDemand * 1.25 / 10) * 10;
                const breakerAmps12 = formData.mainBreakerAmps || 0;
                const voltageNum12 = parseFloat(formData.voltage) || 380;
                const ksaverKva_breaker12 = breakerAmps12 > 0 ? Math.ceil(Math.sqrt(3) * voltageNum12 * breakerAmps12 / 1000 / 10) * 10 : 0;
                const ksaverKva = Math.max(ksaverKva_demand12, ksaverKva_breaker12);
                const getKsaverModel12 = (kva: number) => {
                  if (kva <= 50) return 'KSAVER 50KVA';
                  if (kva <= 75) return 'KSAVER 75KVA';
                  if (kva <= 100) return 'KSAVER 100KVA';
                  if (kva <= 150) return 'KSAVER 150KVA';
                  if (kva <= 200) return 'KSAVER 200KVA';
                  if (kva <= 250) return 'KSAVER 250KVA';
                  if (kva <= 300) return 'KSAVER 300KVA';
                  return `KSAVER Custom ≥${kva}KVA`;
                };
                const autoKsaverModel12 = ksaverKva > 0 ? getKsaverModel12(ksaverKva) : (formData.recommendedProduct || '');
                const recs: { priority: 'high' | 'medium' | 'low'; title: string; action: string }[] = [];
                if (pf < 0.85) recs.push({ priority: 'high', title: lang === 'th' ? '🔋 ติดตั้ง Capacitor Bank ทันที' : '🔋 Install Capacitor Bank Immediately', action: lang === 'th' ? `ติดตั้ง Capacitor Bank ขนาดที่เหมาะสม เพื่อปรับค่า PF จาก ${pf.toFixed(2)} ให้ถึง ≥0.95 ลดค่าไฟและป้องกันค่าปรับ` : `Install appropriately sized capacitor bank to correct PF from ${pf.toFixed(2)} to ≥0.95, reducing costs and avoiding penalties` });
                else if (pf < 0.95) recs.push({ priority: 'medium', title: lang === 'th' ? '🔋 ปรับปรุง Power Factor' : '🔋 Power Factor Correction', action: lang === 'th' ? `พิจารณาติดตั้ง Capacitor Bank หรือ Active PFC เพื่อปรับค่า PF จาก ${pf.toFixed(2)} ให้ถึงมาตรฐาน ≥0.95` : `Consider capacitor bank or active PFC to bring PF from ${pf.toFixed(2)} to standard ≥0.95` });
                if (imb >= 10) recs.push({ priority: 'high', title: lang === 'th' ? '⚖️ จัดสมดุลโหลดเร่งด่วน' : '⚖️ Urgent Load Balancing', action: lang === 'th' ? `ความไม่สมดุลกระแส ${imb.toFixed(1)}% เกินมาตรฐาน IEC 60034-26 (<5%) ต้องจัดสมดุลโหลดระหว่างสามเฟสโดยด่วน` : `Current imbalance ${imb.toFixed(1)}% exceeds IEC 60034-26 (<5%) — urgent three-phase load balancing required` });
                else if (imb >= 5) recs.push({ priority: 'medium', title: lang === 'th' ? '⚖️ ตรวจสอบสมดุลโหลด' : '⚖️ Check Load Balance', action: lang === 'th' ? `ความไม่สมดุลกระแส ${imb.toFixed(1)}% ระดับเฝ้าระวัง ควรตรวจสอบและปรับสมดุลโหลดระหว่างเฟส` : `Current imbalance ${imb.toFixed(1)}% in warning zone — inspect and redistribute load between phases` });
                if (thd > 8) recs.push({ priority: 'high', title: lang === 'th' ? '〰️ ติดตั้ง Harmonic Filter' : '〰️ Install Harmonic Filter', action: lang === 'th' ? `THD ${thd.toFixed(1)}% สูงมาก ควรติดตั้ง Active Harmonic Filter เพื่อลด THD ให้ต่ำกว่า 5% ตามมาตรฐาน IEEE 519` : `THD ${thd.toFixed(1)}% is very high — install active harmonic filter to reduce THD below IEEE 519 limit of 5%` });
                else if (thd > 5) recs.push({ priority: 'medium', title: lang === 'th' ? '〰️ พิจารณา Harmonic Filter' : '〰️ Consider Harmonic Filter', action: lang === 'th' ? `THD ${thd.toFixed(1)}% เกินมาตรฐาน IEEE 519 ควรพิจารณาติดตั้ง Harmonic Filter` : `THD ${thd.toFixed(1)}% exceeds IEEE 519 — consider harmonic filter installation` });
                if (loadFactor < 40) recs.push({ priority: 'medium', title: lang === 'th' ? '📅 บริหารจัดการพลังงาน' : '📅 Energy Management', action: lang === 'th' ? `Load Factor ${loadFactor.toFixed(1)}% ต่ำมาก ควรโยกย้ายโหลดมาช่วงนอก Peak Hours และพิจารณา Demand Response Program` : `Load Factor ${loadFactor.toFixed(1)}% is very low — shift loads to off-peak hours and consider demand response programs` });
                recs.push({
                  priority: 'low',
                  title: lang === 'th' ? `💡 แนะนำผลิตภัณฑ์ KSAVER${ksaverKva > 0 ? ` ≥ ${ksaverKva} kVA` : ''}` : `💡 KSAVER Product Recommendation${ksaverKva > 0 ? ` ≥ ${ksaverKva} kVA` : ''}`,
                  action: lang === 'th'
                    ? `ติดตั้ง KSAVER เพื่อปรับปรุงคุณภาพไฟฟ้า ลดความไม่สมดุล และเพิ่มประสิทธิภาพพลังงาน${autoKsaverModel12 ? ` รุ่นที่แนะนำ: ${autoKsaverModel12}` : ''} (Peak demand: ${ksaverKva_demand12} kVA${ksaverKva_breaker12 > 0 ? `, เบรคเกอร์: ${ksaverKva_breaker12} kVA` : ''} → ใช้ค่าสูงสุด)`
                    : `Install KSAVER to improve power quality, reduce imbalance, and increase overall efficiency${autoKsaverModel12 ? `. Recommended model: ${autoKsaverModel12}` : ''} (Peak demand: ${ksaverKva_demand12} kVA${ksaverKva_breaker12 > 0 ? `, Breaker: ${ksaverKva_breaker12} kVA` : ''} → using max)`,
                });
                const priorityStyle: Record<string, string> = {
                  high: 'bg-red-50 border-red-400 border-l-4',
                  medium: 'bg-yellow-50 border-yellow-400 border-l-4',
                  low: 'bg-blue-50 border-blue-400 border-l-4',
                };
                const priorityLabel: Record<string, string> = {
                  high: lang === 'th' ? '🔴 สำคัญมาก' : '🔴 High Priority',
                  medium: lang === 'th' ? '🟡 สำคัญปานกลาง' : '🟡 Medium Priority',
                  low: lang === 'th' ? '🔵 ข้อแนะนำ' : '🔵 Advisory',
                };
                return (
                  <div className="space-y-3">
                    {recs.map((rec, i) => (
                      <div key={i} className={`p-4 rounded-r-lg ${priorityStyle[rec.priority]}`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-bold text-sm text-gray-800">{rec.title}</p>
                          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${rec.priority === 'high' ? 'bg-red-100 text-red-700' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                            {priorityLabel[rec.priority]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{rec.action}</p>
                      </div>
                    ))}
                    <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-800">
                      {lang === 'th'
                        ? `คำอธิบายผล: ข้อเสนอแนะถูกจัดระดับความสำคัญอัตโนมัติจากค่า PF=${pf.toFixed(2)}, Imbalance=${imb.toFixed(1)}%, THD=${thd.toFixed(1)}% และ Load Factor=${loadFactor.toFixed(1)}% เพื่อให้ทีมปฏิบัติการลงมือแก้ไขตามผลกระทบก่อนหลัง.`
                        : `Analysis: Recommendations are auto-prioritized from PF=${pf.toFixed(2)}, Imbalance=${imb.toFixed(1)}%, THD=${thd.toFixed(1)}%, and Load Factor=${loadFactor.toFixed(1)}% so operations can address the highest-impact items first.`}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => router.push('/KR-Thailand/Admin-Login/dashboard')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {t.save}
              </button>
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {lang === 'th' ? 'รายการการวิเคราะห์' : 'Analysis Records'}
            </h2>

            {analyses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{lang === 'th' ? 'ยังไม่มีข้อมูลการวิเคราะห์' : 'No analysis records yet'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.documentNo}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.location}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.datetime}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.balance}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.result}
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {lang === 'th' ? 'การจัดการ' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyses.map((analysis, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{analysis.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{analysis.location}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{analysis.datetime}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getBalanceColor(analysis.balance)}`}>
                            {analysis.balance}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getResultColor(analysis.result)}`}>
                            {analysis.result}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-blue-600 hover:text-blue-800 mx-1">
                            <Eye className="w-5 h-5 inline" />
                          </button>
                          <button className="text-green-600 hover:text-green-800 mx-1">
                            <Download className="w-5 h-5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
