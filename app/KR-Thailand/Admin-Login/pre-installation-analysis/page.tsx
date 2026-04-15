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

export default function ThailandPreInstallationAnalysis() {
  const router = useRouter();
  const { locale } = useLocale();
  const lang = locale === 'th' ? 'th' : 'en';
  const [view, setView] = useState<'form' | 'upload' | 'list'>('form');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedCSVData, setUploadedCSVData] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    note: string;
  }
  interface CurrentBatch {
    batchId: string;
    customerName: string;
    location: string;
    createdAt: string;
    records: CurrentRecord[];
  }

  const BATCH_KEY = 'pre_install_current_batches';
  const loadBatches = (): CurrentBatch[] => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(BATCH_KEY) || '[]'); } catch { return []; }
  };
  const [batches, setBatches] = useState<CurrentBatch[]>(loadBatches);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(() => {
    const b = loadBatches();
    return b.length > 0 ? b[0].batchId : null;
  });
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerLocation, setNewCustomerLocation] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // ── Customer DB search ──
  type CusResult = { cusID: number; fullname: string; company: string; address: string; phone: string; email: string };
  const [cusQuery, setCusQuery] = useState('');
  const [cusResults, setCusResults] = useState<CusResult[]>([]);
  const [cusLoading, setCusLoading] = useState(false);
  const [cusOpen, setCusOpen] = useState(false);
  const cusDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    localStorage.setItem(BATCH_KEY, JSON.stringify(updated));
  };

  const activeBatch = batches.find(b => b.batchId === activeBatchId) ?? null;

  const createBatch = () => {
    if (!newCustomerName.trim()) return;
    const batch: CurrentBatch = {
      batchId: `batch_${Date.now()}`,
      customerName: newCustomerName.trim(),
      location: newCustomerLocation.trim(),
      createdAt: getCurrentDateTime(),
      records: Array.from({ length: 7 }, (_, i) => ({
        id: i + 1, date: '', time: '00:00',
        L1: '', L2: '', L3: '', N: '', voltage: '380', pf: '0.85', note: '',
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
    saveBatches(updated);
    setActiveBatchId(updated.length > 0 ? updated[0].batchId : null);
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
        L1: '', L2: '', L3: '', N: '', voltage: '380', pf: '0.85', note: '',
      }],
    }));
  };

  const deleteBatchRow = (batchId: string, recordId: number) => {
    saveBatches(batches.map(b => b.batchId !== batchId ? b : {
      ...b,
      records: b.records.filter(r => r.id !== recordId),
    }));
  };

  const loadBatchToForm = (batch: CurrentBatch) => {
    const filled = batch.records.filter(r => r.L1 !== '' || r.L2 !== '' || r.L3 !== '');
    if (filled.length === 0) { alert(lang === 'th' ? 'ยังไม่มีข้อมูลในชุดนี้' : 'No data in this batch'); return; }
    const avg = (key: 'L1'|'L2'|'L3'|'N') =>
      filled.reduce((s, r) => s + parseFloat((r as any)[key] || '0'), 0) / filled.length;
    setFormData(prev => ({
      ...prev,
      location: batch.location || prev.location,
      current: { L1: parseFloat(avg('L1').toFixed(1)), L2: parseFloat(avg('L2').toFixed(1)), L3: parseFloat(avg('L3').toFixed(1)), N: parseFloat(avg('N').toFixed(1)) },
      voltage: filled[0].voltage || prev.voltage,
      powerFactor: parseFloat(filled[0].pf) || prev.powerFactor,
    }));
    setView('form');
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

  useEffect(() => {
    // Load saved analyses
    const savedData = localStorage.getItem('thailand_pre_installation_analyses');
    if (savedData) {
      setAnalyses(JSON.parse(savedData));
    }
  }, []);

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
        const l1Idx = find(['l1','phase a','phasea','ia','phase_a','a1','current a','curr_a']);
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
  const powerData = [
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

  // Current data for phases
  const currentData = [
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

  const calculateBalance = (current: PhaseData): 'Good' | 'Fair' | 'Poor' => {
    const max = Math.max(current.L1, current.L2, current.L3);
    const min = Math.min(current.L1, current.L2, current.L3);
    const imbalance = ((max - min) / max) * 100;

    if (imbalance < 10) return 'Good';
    if (imbalance < 20) return 'Fair';
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

  const handleSave = () => {
    const newAnalyses = [...analyses, formData];
    setAnalyses(newAnalyses);
    localStorage.setItem('thailand_pre_installation_analyses', JSON.stringify(newAnalyses));

    // Reset form
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

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  setUploadError(null);
                  setUploadSuccess(null);
                  const files = Array.from(e.dataTransfer.files);
                  const allowed = files.filter(f => f.name.match(/\.(csv|xlsx|xls|pdf)$/i));
                  if (allowed.length < files.length) setUploadError(lang === 'th' ? 'รองรับเฉพาะไฟล์ CSV, Excel และ PDF เท่านั้น' : 'Only CSV, Excel and PDF files are supported');
                  if (allowed.length > 0) {
                    setUploadedFiles(prev => [...prev, ...allowed]);
                    setUploadSuccess(lang === 'th' ? `อัพโหลด ${allowed.length} ไฟล์เรียบร้อยแล้ว` : `${allowed.length} file(s) uploaded successfully`);
                    parseCSVFiles(allowed);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
                }`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    setUploadError(null);
                    setUploadSuccess(null);
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      setUploadedFiles(prev => [...prev, ...files]);
                      setUploadSuccess(lang === 'th' ? `อัพโหลด ${files.length} ไฟล์เรียบร้อยแล้ว` : `${files.length} file(s) uploaded successfully`);
                      parseCSVFiles(files);
                    }
                  }}
                />
                <Upload className="w-14 h-14 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  {lang === 'th' ? 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์' : 'Drag & drop files here, or click to select'}
                </p>
                <p className="text-sm text-gray-400">{lang === 'th' ? 'รองรับ CSV, Excel (.xlsx), PDF' : 'Supports CSV, Excel (.xlsx), PDF'}</p>
              </div>

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
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-gray-200 rounded-lg transition"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Instructions */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-2">
                    {lang === 'th' ? '📋 รูปแบบไฟล์ที่แนะนำสำหรับข้อมูล 7 วัน:' : '📋 Recommended format for 7-day data:'}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="text-xs text-blue-700 border-collapse w-full">
                      <thead>
                        <tr className="bg-blue-100">
                          <th className="border border-blue-300 px-3 py-1">Timestamp</th>
                          <th className="border border-blue-300 px-3 py-1">Phase A (L1) A</th>
                          <th className="border border-blue-300 px-3 py-1">Phase B (L2) A</th>
                          <th className="border border-blue-300 px-3 py-1">Phase C (L3) A</th>
                          <th className="border border-blue-300 px-3 py-1">Voltage (V)</th>
                          <th className="border border-blue-300 px-3 py-1">PF</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-blue-200 px-3 py-1">2026-02-18 00:00</td>
                          <td className="border border-blue-200 px-3 py-1">25.3</td>
                          <td className="border border-blue-200 px-3 py-1">22.1</td>
                          <td className="border border-blue-200 px-3 py-1">28.7</td>
                          <td className="border border-blue-200 px-3 py-1">380</td>
                          <td className="border border-blue-200 px-3 py-1">0.85</td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className="border border-blue-200 px-3 py-1 text-blue-500" colSpan={6}>... (ข้อมูลทุก 15 นาที / every 15 min)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => { setUploadedFiles([]); setUploadedCSVData([]); setUploadSuccess(null); setUploadError(null); }}
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    {lang === 'th' ? 'ล้างทั้งหมด' : 'Clear All'}
                  </button>
                  <button
                    onClick={() => {
                      setUploadSuccess(lang === 'th' ? `บันทึก ${uploadedFiles.length} ไฟล์ลงในระบบเรียบร้อยแล้ว` : `${uploadedFiles.length} file(s) saved to system`);
                    }}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {lang === 'th' ? 'บันทึกลงระบบ' : 'Save to System'}
                  </button>
                </div>
              </div>
            )}

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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                  {lang === 'th' ? 'ฐานข้อมูลค่ากระแสไฟฟ้า แยกตามลูกค้า/สถานที่' : 'Current Record Database — by Customer / Site'}
                </h3>
                <button
                  onClick={() => setShowNewCustomerForm(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  {lang === 'th' ? 'เพิ่มลูกค้าใหม่' : 'New Customer'}
                </button>
              </div>

              {/* New customer form */}
              {showNewCustomerForm && (
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
                  {lang === 'th' ? 'ยังไม่มีชุดข้อมูล กดปุ่ม "เพิ่มลูกค้าใหม่" เพื่อเริ่มต้น' : 'No batches yet. Click "New Customer" to get started.'}
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
                            {lang === 'th' ? 'สร้างเมื่อ: ' : 'Created: '}{activeBatch.createdAt}
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
                              <th className="border border-indigo-200 px-2 py-2 text-center text-xs font-bold text-orange-700">L1 / เฟส A (A)</th>
                              <th className="border border-indigo-200 px-2 py-2 text-center text-xs font-bold text-blue-700">L2 / เฟส B (A)</th>
                              <th className="border border-indigo-200 px-2 py-2 text-center text-xs font-bold text-purple-700">L3 / เฟส C (A)</th>
                              <th className="border border-indigo-200 px-2 py-2 text-center text-xs font-bold text-gray-600">N (A)</th>
                              <th className="border border-indigo-200 px-2 py-2 text-center text-xs font-bold text-gray-600">{lang === 'th' ? 'แรงดัน (V)' : 'Voltage (V)'}</th>
                              <th className="border border-indigo-200 px-2 py-2 text-center text-xs font-bold text-gray-600">PF</th>
                              <th className="border border-indigo-200 px-2 py-2 text-left text-xs font-bold text-gray-600">{lang === 'th' ? 'หมายเหตุ' : 'Note'}</th>
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
                                {(['L1','L2','L3','N'] as const).map(phase => (
                                  <td key={phase} className="border border-gray-200 px-1 py-1">
                                    <input type="number" step="0.1" value={(row as any)[phase]}
                                      onChange={e => updateBatchRecord(activeBatch.batchId, row.id, phase, e.target.value)}
                                      placeholder="0.0"
                                      className={`w-full px-1 py-0.5 text-xs text-center border-0 bg-transparent focus:ring-1 focus:ring-indigo-400 rounded ${
                                        phase === 'L1' ? 'text-orange-700 font-medium' :
                                        phase === 'L2' ? 'text-blue-700 font-medium' :
                                        phase === 'L3' ? 'text-purple-700 font-medium' : 'text-gray-700'
                                      }`}
                                    />
                                  </td>
                                ))}
                                <td className="border border-gray-200 px-1 py-1">
                                  <input type="number" step="1" value={row.voltage}
                                    onChange={e => updateBatchRecord(activeBatch.batchId, row.id, 'voltage', e.target.value)}
                                    className="w-full px-1 py-0.5 text-xs text-center border-0 bg-transparent focus:ring-1 focus:ring-indigo-400 rounded"
                                  />
                                </td>
                                <td className="border border-gray-200 px-1 py-1">
                                  <input type="number" step="0.01" min="0" max="1" value={row.pf}
                                    onChange={e => updateBatchRecord(activeBatch.batchId, row.id, 'pf', e.target.value)}
                                    className="w-full px-1 py-0.5 text-xs text-center border-0 bg-transparent focus:ring-1 focus:ring-indigo-400 rounded"
                                  />
                                </td>
                                <td className="border border-gray-200 px-1 py-1">
                                  <input type="text" value={row.note}
                                    onChange={e => updateBatchRecord(activeBatch.batchId, row.id, 'note', e.target.value)}
                                    placeholder={lang === 'th' ? 'หมายเหตุ...' : 'Note...'}
                                    className="w-full px-1 py-0.5 text-xs border-0 bg-transparent focus:ring-1 focus:ring-indigo-400 rounded"
                                  />
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
                                  <td colSpan={5} className="border border-gray-300"></td>
                                </tr>
                                <tr className="bg-red-50 font-semibold">
                                  <td colSpan={3} className="border border-gray-300 px-2 py-1.5 text-xs text-red-800">{lang === 'th' ? 'ค่าสูงสุด (Peak)' : 'Peak'}</td>
                                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-center text-orange-700 font-bold">{maxL1}</td>
                                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-center text-blue-700 font-bold">{maxL2}</td>
                                  <td className="border border-gray-300 px-2 py-1.5 text-xs text-center text-purple-700 font-bold">{maxL3}</td>
                                  <td colSpan={5} className="border border-gray-300"></td>
                                </tr>
                              </tfoot>
                            );
                          })()}
                        </table>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {lang === 'th'
                          ? `${activeBatch.records.length} แถว · บันทึกอัตโนมัติ · กด "โหลดเข้าฟอร์มวิเคราะห์" เพื่อนำค่าเฉลี่ยไปใช้`
                          : `${activeBatch.records.length} rows · Auto-saved · Click "Load to Analysis Form" to use averaged values`}
                      </p>
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
              {batches.length > 0 && (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-green-800 font-semibold text-sm">
                    <Activity className="w-4 h-4" />
                    {lang === 'th' ? 'โหลดค่ากระแสจากฐานข้อมูลลูกค้า:' : 'Load current data from customer database:'}
                  </div>
                  <select
                    defaultValue=""
                    onChange={e => {
                      const b = batches.find(x => x.batchId === e.target.value);
                      if (b) loadBatchToForm(b);
                      e.target.value = '';
                    }}
                    className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-green-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <option value="" disabled>
                      {lang === 'th' ? '— เลือกชื่อลูกค้า —' : '— Select customer —'}
                    </option>
                    {batches.map(b => (
                      <option key={b.batchId} value={b.batchId}>
                        {b.customerName}{b.location ? ` · ${b.location}` : ''} ({b.records.filter(r => r.L1 || r.L2 || r.L3).length} {lang === 'th' ? 'แถวข้อมูล' : 'records'})
                      </option>
                    ))}
                  </select>
                  <p className="w-full text-xs text-green-600 mt-0">
                    {lang === 'th'
                      ? 'ระบบจะนำค่าเฉลี่ย L1/L2/L3/N, แรงดัน, PF และชื่อสถานที่มาใส่ในฟอร์มโดยอัตโนมัติ'
                      : 'Average L1/L2/L3/N, voltage, PF, and location will be auto-filled into the form.'}
                  </p>
                </div>
              )}

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
                  <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${getBalanceColor(formData.balance)}`}>
                    {formData.balance}
                  </span>
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
                        <th className="text-center p-3 font-bold text-gray-700">
                          {lang === 'th' ? 'สถานะ' : 'Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const maxCurrent = Math.max(formData.current.L1, formData.current.L2, formData.current.L3);
                        const phases = [
                          { name: 'L1', value: formData.current.L1, color: 'text-orange-600' },
                          { name: 'L2', value: formData.current.L2, color: 'text-blue-600' },
                          { name: 'L3', value: formData.current.L3, color: 'text-purple-600' },
                          { name: 'N', value: formData.current.N, color: 'text-gray-600' }
                        ];

                        return phases.map((phase, idx) => {
                          const percentage = maxCurrent > 0 ? ((phase.value / maxCurrent) * 100).toFixed(1) : '0.0';
                          const isBalanced = phase.name !== 'N' && Math.abs((phase.value / maxCurrent) * 100 - 100) < 10;

                          return (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className={`p-3 font-semibold ${phase.color}`}>
                                {lang === 'th' ? 'เฟส' : 'Phase'} {phase.name}
                              </td>
                              <td className="p-3 text-right text-gray-800 font-medium">
                                {phase.value.toFixed(1)} A
                              </td>
                              <td className="p-3 text-right text-gray-600">
                                {phase.name !== 'N' ? `${percentage}%` : '-'}
                              </td>
                              <td className="p-3 text-center">
                                {phase.name !== 'N' && (
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                    isBalanced ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {isBalanced ? '✓' : '⚠'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Balance Analysis */}
                <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                  <div className="text-xs text-gray-600">
                    <strong>{lang === 'th' ? 'การวิเคราะห์ความสมดุล:' : 'Balance Analysis:'}</strong>
                    {(() => {
                      const max = Math.max(formData.current.L1, formData.current.L2, formData.current.L3);
                      const min = Math.min(formData.current.L1, formData.current.L2, formData.current.L3);
                      const imbalance = max > 0 ? (((max - min) / max) * 100).toFixed(1) : '0.0';
                      return (
                        <span className="ml-2">
                          {lang === 'th'
                            ? `ความไม่สมดุล ${imbalance}% (ค่าที่ดี: < 10%)`
                            : `Imbalance ${imbalance}% (Good: < 10%)`
                          }
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Inline Current Line Chart */}
                <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-xs font-bold text-gray-700 mb-2">
                    {lang === 'th' ? '📈 กราฟกระแสไฟฟ้าแต่ละเฟส (A)' : '📈 Phase Current Line Chart (A)'}
                  </p>
                  {(() => {
                    const chartData = [
                      { phase: 'L1', current: formData.current.L1 },
                      { phase: 'L2', current: formData.current.L2 },
                      { phase: 'L3', current: formData.current.L3 },
                      { phase: 'N',  current: formData.current.N  },
                    ];
                    const maxVal = Math.max(formData.current.L1, formData.current.L2, formData.current.L3, formData.current.N, 1);
                    return (
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="phase" tick={{ fontSize: 12, fontWeight: 700 }} />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            domain={[0, Math.ceil(maxVal * 1.2)]}
                            label={{ value: 'A', angle: -90, position: 'insideLeft', fontSize: 11 }}
                          />
                          <Tooltip
                            formatter={(value: number) => [`${value.toFixed(1)} A`, lang === 'th' ? 'กระแส' : 'Current']}
                            labelFormatter={(label) => `${lang === 'th' ? 'เฟส' : 'Phase'} ${label}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="current"
                            stroke="#8B5CF6"
                            strokeWidth={2.5}
                            dot={{ r: 5, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7 }}
                            name={lang === 'th' ? 'กระแส (A)' : 'Current (A)'}
                          />
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
                  <LineChart data={currentData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
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
                      domain={[0, 300]}
                      label={{ value: 'A', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: '15px' }} />
                    <Line type="monotone" dataKey="phaseA" stroke="#F59E0B" strokeWidth={2.5} name="Phase A (L1)" />
                    <Line type="monotone" dataKey="phaseB" stroke="#3B82F6" strokeWidth={2.5} name="Phase B (L2)" />
                    <Line type="monotone" dataKey="phaseC" stroke="#8B5CF6" strokeWidth={2.5} name="Phase C (L3)" />
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
                        const peakA = Math.max(...currentData.map(d => d.phaseA));
                        const peakB = Math.max(...currentData.map(d => d.phaseB));
                        const peakC = Math.max(...currentData.map(d => d.phaseC));
                        const nightRows = currentData.filter(d => d.time.includes('00:00') || d.time.includes('04:00'));
                        const nightA = (nightRows.reduce((s, d) => s + d.phaseA, 0) / nightRows.length);
                        const nightB = (nightRows.reduce((s, d) => s + d.phaseB, 0) / nightRows.length);
                        const nightC = (nightRows.reduce((s, d) => s + d.phaseC, 0) / nightRows.length);
                        const dayRows = currentData.filter(d => d.time.includes('08:00') || d.time.includes('12:00') || d.time.includes('16:00'));
                        const dayA = (dayRows.reduce((s, d) => s + d.phaseA, 0) / dayRows.length);
                        const dayB = (dayRows.reduce((s, d) => s + d.phaseB, 0) / dayRows.length);
                        const dayC = (dayRows.reduce((s, d) => s + d.phaseC, 0) / dayRows.length);
                        const avgA = (currentData.reduce((s, d) => s + d.phaseA, 0) / currentData.length);
                        const avgB = (currentData.reduce((s, d) => s + d.phaseB, 0) / currentData.length);
                        const avgC = (currentData.reduce((s, d) => s + d.phaseC, 0) / currentData.length);
                        const peakImbalance = (((Math.max(peakA, peakB, peakC) - Math.min(peakA, peakB, peakC)) / Math.max(peakA, peakB, peakC)) * 100);
                        const rows = [
                          {
                            label: lang === 'th' ? '⚡ ค่ากระแสสูงสุด (Peak)' : '⚡ Peak Current',
                            a: peakA, b: peakB, c: peakC,
                          },
                          {
                            label: lang === 'th' ? '☀️ ค่าเฉลี่ยช่วงกลางวัน (08:00–16:00)' : '☀️ Avg Daytime (08:00–16:00)',
                            a: dayA, b: dayB, c: dayC,
                          },
                          {
                            label: lang === 'th' ? '🌙 ค่าพื้นฐานกลางคืน (00:00–04:00)' : '🌙 Nighttime Base (00:00–04:00)',
                            a: nightA, b: nightB, c: nightC,
                          },
                          {
                            label: lang === 'th' ? '📊 ค่าเฉลี่ยรวม' : '📊 Overall Average',
                            a: avgA, b: avgB, c: avgC,
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
                  <p className="text-xs text-gray-600">
                    <strong>{lang === 'th' ? 'ความไม่สมดุลของเฟส (Peak):' : 'Phase Imbalance (Peak):'}</strong>
                    {' '}
                    {(() => {
                      const peakA = Math.max(...currentData.map(d => d.phaseA));
                      const peakB = Math.max(...currentData.map(d => d.phaseB));
                      const peakC = Math.max(...currentData.map(d => d.phaseC));
                      const imb = (((Math.max(peakA, peakB, peakC) - Math.min(peakA, peakB, peakC)) / Math.max(peakA, peakB, peakC)) * 100).toFixed(1);
                      const isGood = parseFloat(imb) < 10;
                      return (
                        <span className={`ml-1 font-semibold ${isGood ? 'text-green-700' : 'text-yellow-700'}`}>
                          {imb}% {isGood ? '✓' : '⚠'} ({lang === 'th' ? `ค่าที่ดี: < 10%` : 'Good: < 10%'})
                        </span>
                      );
                    })()}
                  </p>
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
                  <LineChart data={powerData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
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
                      domain={[0, 200]}
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
                        <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">
                          {lang === 'th' ? 'รายการ' : 'Item'}
                        </th>
                        <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">
                          {lang === 'th' ? 'ค่าที่วัดได้' : 'Measured Value'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? 'ความต้องการพลังงานสูงสุด' : 'Peak Power Demand'}
                        </td>
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? '≈ 175 kW (ในช่วงเวลาทำงาน)' : '≈ 175 kW (during operational hours)'}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? 'โหลดพื้นฐานกลางคืน' : 'Nighttime Base Load'}
                        </td>
                        <td className="p-3 text-gray-800">≈ 10 - 17 kW</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? 'การใช้พลังงานเฉลี่ยกลางวัน' : 'Average Daytime Consumption'}
                        </td>
                        <td className="p-3 text-gray-800">≈ 77 - 146 kW</td>
                      </tr>
                      <tr className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? 'ค่าตัวประกอบโหลด' : 'Load Factor'}
                        </td>
                        <td className="p-3 text-gray-800">≈ 68.4 %</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-3 text-gray-800">
                          {lang === 'th' ? 'ช่วงเวลาพีค' : 'Peak Hours'}
                        </td>
                        <td className="p-3 text-gray-800">
                          {lang === 'th'
                            ? '12:00-17:00 โดยมีการใช้สูงสุด 156-175 kW'
                            : '12:00-17:00 with highest consumption 156-175 kW'
                          }
                        </td>
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
