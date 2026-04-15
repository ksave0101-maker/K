'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import CountryFlag from '@/components/CountryFlag';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type BranchKey = 'korea' | 'thailand' | 'vietnam' | 'malaysia' | 'brunei';
type StageType = 'assembly' | 'testing' | 'packaging' | 'ready';

interface ProductionUpdate {
  id: string;
  sourceId: string;
  reportNo: string;
  orderNumber: string;
  productName: string;
  branch: 'Korea' | 'Brunei' | 'Thailand' | 'Vietnam' | 'Malaysia';
  branchKey: BranchKey;
  branchCode: 'KR' | 'BN' | 'TH' | 'VN' | 'MY';
  totalQuantity: number;
  completedQuantity: number;
  progressPercent: number;
  currentStage: StageType;
  assignedTeam: string;
  startDate: string;
  estimatedCompletion: string;
  lastUpdate: string;
  notes?: string;
}

interface SearchPdoRow {
  id: string;
  pdoNo: string;
  product: string;
  quantity: number;
  dueDate: string;
  status: string;
}

interface ProductionReportRow {
  report_no?: string;
  branch_key?: string;
  pdo_id?: string;
}

const BRANCH_META: Array<{ key: BranchKey; branch: ProductionUpdate['branch']; branchCode: ProductionUpdate['branchCode'] }> = [
  { key: 'korea', branch: 'Korea', branchCode: 'KR' },
  { key: 'thailand', branch: 'Thailand', branchCode: 'TH' },
  { key: 'vietnam', branch: 'Vietnam', branchCode: 'VN' },
  { key: 'malaysia', branch: 'Malaysia', branchCode: 'MY' },
  { key: 'brunei', branch: 'Brunei', branchCode: 'BN' },
];

const PDO_PREFIX_BY_BRANCH: Record<BranchKey, string> = {
  korea: 'PDOKR',
  thailand: 'PDOTH',
  vietnam: 'PDOVT',
  malaysia: 'PDOML',
  brunei: 'PDOBN',
};

export default function ProductionUpdatesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedUpdate, setSelectedUpdate] = useState<ProductionUpdate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updates, setUpdates] = useState<ProductionUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editStage, setEditStage] = useState<StageType>('assembly');
  const [editCompletedQty, setEditCompletedQty] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [searchBranchKey, setSearchBranchKey] = useState<BranchKey>('thailand');
  const [searchPdoNo, setSearchPdoNo] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchRows, setSearchRows] = useState<SearchPdoRow[]>([]);
  const [selectedSearchId, setSelectedSearchId] = useState('');
  const [creatingReport, setCreatingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const printReportLabel = locale === 'ko' ? '생산 보고서 출력' : 'Print Production Report';

  const statusToStage = (status: unknown): StageType => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'completed' || normalized === 'done' || normalized === 'ready' || normalized === 'approved') return 'ready';
    if (normalized === 'testing') return 'testing';
    if (normalized === 'packaging') return 'packaging';
    if (normalized === 'in_progress' || normalized === 'in-progress' || normalized === 'processing' || normalized === 'production') return 'testing';
    return 'assembly';
  };

  const stageToStatus = (stage: StageType): string => {
    if (stage === 'ready') return 'completed';
    if (stage === 'testing' || stage === 'packaging') return 'in_progress';
    return 'pending';
  };

  const defaultProgressByStage = (stage: StageType): number => {
    if (stage === 'ready') return 100;
    if (stage === 'packaging') return 85;
    if (stage === 'testing') return 60;
    return 20;
  };

  const toDateOnly = (value: unknown): string => {
    const text = String(value || '');
    if (!text) return '-';
    if (text.includes('T')) return text.split('T')[0];
    return text.length >= 10 ? text.slice(0, 10) : text;
  };

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [progressRes, reportsRes, ...branchResponses] = await Promise.all([
          fetch('/api/korea/production-updates', { cache: 'no-store' }),
          fetch('/api/korea/production-reports', { cache: 'no-store' }),
          ...BRANCH_META.map((meta) =>
            fetch(`/api/korea/production-orders?branchKey=${encodeURIComponent(meta.key)}&branch=${encodeURIComponent(meta.branch)}`, { cache: 'no-store' })
          ),
        ]);

        const progressJson = await progressRes.json().catch(() => []);
        const progressRows: Array<Record<string, unknown>> = Array.isArray(progressJson) ? progressJson : [];
        const progressMap = new Map<string, Record<string, unknown>>();
        for (const row of progressRows) {
          const key = String(row.id || '');
          if (key) progressMap.set(key, row);
        }

        const reportsJson = await reportsRes.json().catch(() => []);
        const reportRows: ProductionReportRow[] = Array.isArray(reportsJson) ? reportsJson : [];
        const reportNoMap = new Map<string, string>();
        for (const row of reportRows) {
          const key = `${String(row.branch_key || '').toLowerCase()}:${String(row.pdo_id || '')}`;
          const reportNo = String(row.report_no || '');
          if (key && reportNo) reportNoMap.set(key, reportNo);
        }

        const branchJsonList = await Promise.all(branchResponses.map(async (res) => {
          const json = await res.json().catch(() => []);
          return Array.isArray(json) ? json : Array.isArray(json?.rows) ? json.rows : [];
        }));

        const mappedRows: ProductionUpdate[] = [];
        for (let i = 0; i < BRANCH_META.length; i++) {
          const meta = BRANCH_META[i];
          const rows = branchJsonList[i] as Array<Record<string, unknown>>;
          for (const row of rows) {
            const sourceId = String(row.id ?? row.poID ?? row.pdoID ?? '');
            if (!sourceId) continue;
            const progressId = `${meta.key}:${sourceId}`;
            const progressRow = progressMap.get(progressId);
            const reportNo = reportNoMap.get(progressId) || '';
            const stage = statusToStage(progressRow?.currentStage ?? row.status);
            const totalQuantity = Number.parseFloat(String(row.quantity ?? row.quantity_ordered ?? row.target_qty ?? 0)) || 0;
            const progressPercentRaw = Number.parseFloat(String(progressRow?.progressPercent ?? ''));
            const progressPercent = Number.isFinite(progressPercentRaw) ? Math.max(0, Math.min(100, progressPercentRaw)) : defaultProgressByStage(stage);
            const completedQtyRaw = Number.parseFloat(String(progressRow?.completedQuantity ?? ''));
            const completedQuantity = Number.isFinite(completedQtyRaw)
              ? Math.max(0, Math.min(totalQuantity || completedQtyRaw, completedQtyRaw))
              : Math.round((progressPercent / 100) * totalQuantity);

            mappedRows.push({
              id: progressId,
              sourceId,
              reportNo,
              orderNumber: String(row.orderNumber ?? row.pdoNo ?? row.poNo ?? '-'),
              productName: String(row.product ?? row.product_name ?? '-'),
              branch: meta.branch,
              branchKey: meta.key,
              branchCode: meta.branchCode,
              totalQuantity,
              completedQuantity,
              progressPercent,
              currentStage: stage,
              assignedTeam: String(progressRow?.assignedTeam || `${meta.branch} Production Team`),
              startDate: toDateOnly(progressRow?.startDate ?? row.orderDate ?? row.pdoDate ?? row.poDate ?? row.created_at),
              estimatedCompletion: toDateOnly(progressRow?.estimatedCompletion ?? row.dueDate ?? row.due_date),
              lastUpdate: toDateOnly(progressRow?.lastUpdate ?? row.updated_at ?? row.orderDate ?? row.created_at),
              notes: String(progressRow?.notes ?? row.notes ?? ''),
            });
          }
        }

        if (active) setUpdates(mappedRows);
      } catch {
        if (active) setError(locale === 'ko' ? '생산 업데이트 목록을 불러오지 못했습니다.' : 'Failed to load production updates.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [locale]);

  const getStageInfo = (stage: string) => {
    const stages = {
      'assembly': {
        label: locale === 'ko' ? '조립 중' : 'Assembly',
        color: 'bg-blue-100 text-blue-800',
        icon: '🔧'
      },
      'testing': {
        label: locale === 'ko' ? '테스트 중' : 'Testing',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🔬'
      },
      'packaging': {
        label: locale === 'ko' ? '포장 중' : 'Packaging',
        color: 'bg-purple-100 text-purple-800',
        icon: '📦'
      },
      'ready': {
        label: locale === 'ko' ? '완료' : 'Ready',
        color: 'bg-green-100 text-green-800',
        icon: '✅'
      }
    };
    return stages[stage as keyof typeof stages] || stages.assembly;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUpdate(null);
  };

  const handlePrintProductionReport = (update: ProductionUpdate) => {
    const printLang = locale === 'en' ? 'en' : 'ko';
    window.open(
      `/KR-Thailand/Admin-Login/production-orders/print?pdoID=${encodeURIComponent(update.sourceId)}&pdoNo=${encodeURIComponent(update.orderNumber)}&reportNo=${encodeURIComponent(update.reportNo)}&lang=${encodeURIComponent(printLang)}`,
      '_blank'
    );
  };

  const handleUpdateProgress = () => {
    if (!selectedUpdate) return;
    const run = async () => {
      setSaving(true);
      try {
        const safeCompleted = Math.max(0, Math.min(selectedUpdate.totalQuantity, Number(editCompletedQty) || 0));
        const progressPercent = selectedUpdate.totalQuantity > 0
          ? Math.min(100, Math.round((safeCompleted / selectedUpdate.totalQuantity) * 100))
          : 0;
        const nowDate = new Date().toISOString().slice(0, 10);

        const patchBody = {
          id: selectedUpdate.id,
          orderNumber: selectedUpdate.orderNumber,
          productName: selectedUpdate.productName,
          branch: selectedUpdate.branch,
          branchCode: selectedUpdate.branchCode,
          totalQuantity: selectedUpdate.totalQuantity,
          assignedTeam: selectedUpdate.assignedTeam,
          startDate: selectedUpdate.startDate,
          estimatedCompletion: selectedUpdate.estimatedCompletion,
          completedQuantity: safeCompleted,
          progressPercent,
          currentStage: editStage,
          lastUpdate: nowDate,
          notes: editNotes || null,
        };

        const patchProgressRes = await fetch('/api/korea/production-updates', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchBody),
        });

        if (!patchProgressRes.ok) {
          await fetch('/api/korea/production-updates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...patchBody,
              orderNumber: selectedUpdate.orderNumber,
              productName: selectedUpdate.productName,
              branch: selectedUpdate.branch,
              branchCode: selectedUpdate.branchCode,
              totalQuantity: selectedUpdate.totalQuantity,
              assignedTeam: selectedUpdate.assignedTeam,
              startDate: selectedUpdate.startDate,
              estimatedCompletion: selectedUpdate.estimatedCompletion,
            }),
          });
        }

        await fetch('/api/korea/production-orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedUpdate.sourceId,
            branchKey: selectedUpdate.branchKey,
            status: stageToStatus(editStage),
          }),
        });

        setUpdates((prev) => prev.map((item) => {
          if (item.id !== selectedUpdate.id) return item;
          return {
            ...item,
            completedQuantity: safeCompleted,
            progressPercent,
            currentStage: editStage,
            notes: editNotes,
            lastUpdate: nowDate,
          };
        }));
        closeModal();
      } finally {
        setSaving(false);
      }
    };
    run();
  };

  const loadBranchPdoBills = useCallback((keyword?: string) => {
    const run = async () => {
      const keywordText = String(keyword ?? searchPdoNo).trim();

      const branchMeta = BRANCH_META.find((b) => b.key === searchBranchKey);
      if (!branchMeta) return;

      setSearchLoading(true);
      setSearchError('');
      setSearchRows([]);
      setSelectedSearchId('');
      try {
        const queryParts = [
          `branchKey=${encodeURIComponent(searchBranchKey)}`,
          `branch=${encodeURIComponent(branchMeta.branch)}`
        ];
        if (keywordText) {
          queryParts.push(`search=${encodeURIComponent(keywordText)}`);
        }

        const res = await fetch(
          `/api/korea/production-orders?${queryParts.join('&')}`,
          { cache: 'no-store' }
        );
        const reportsRes = await fetch(
          `/api/korea/production-reports?branchKey=${encodeURIComponent(searchBranchKey)}`,
          { cache: 'no-store' }
        );
        const json = await res.json().catch(() => []);
        const reportsJson = await reportsRes.json().catch(() => []);
        const rows: Array<Record<string, unknown>> = Array.isArray(json)
          ? json
          : Array.isArray(json?.rows)
            ? json.rows
            : [];
        const reportRows: ProductionReportRow[] = Array.isArray(reportsJson) ? reportsJson : [];
        const createdPdoIdSet = new Set(
          reportRows
            .map((row) => String(row.pdo_id || ''))
            .filter(Boolean)
        );

        const mappedRows: SearchPdoRow[] = rows.map((row) => ({
          id: String(row.id ?? row.poID ?? row.pdoID ?? ''),
          pdoNo: String(row.orderNumber ?? row.pdoNo ?? row.poNo ?? '-'),
          product: String(row.product ?? row.product_name ?? '-'),
          quantity: Number.parseFloat(String(row.quantity ?? row.quantity_ordered ?? row.target_qty ?? 0)) || 0,
          dueDate: toDateOnly(row.dueDate ?? row.due_date),
          status: String(row.status ?? '-'),
        })).filter((row) => row.id && row.pdoNo && row.pdoNo !== '-' && !createdPdoIdSet.has(row.id));

        if (mappedRows.length === 0) {
          setSearchError(
            keywordText
              ? (locale === 'ko' ? '해당 PDO를 찾을 수 없습니다.' : 'PDO not found for this branch.')
              : (locale === 'ko' ? '이 지점에 표시할 PDO가 없습니다.' : 'No PDO bills for this branch.')
          );
          return;
        }

        setSearchRows(mappedRows);
        setSelectedSearchId(mappedRows[0].id);
      } catch {
        setSearchError(locale === 'ko' ? 'PDO 검색에 실패했습니다.' : 'Failed to search PDO.');
      } finally {
        setSearchLoading(false);
      }
    };
    run();
  }, [locale, searchBranchKey, searchPdoNo]);

  const handleSearchPdoBills = () => {
    const keyword = searchPdoNo.trim();
    if (!keyword) {
      setSearchError(locale === 'ko' ? 'PDO 번호를 입력해주세요.' : 'Please enter PDO number.');
      setSearchRows([]);
      setSelectedSearchId('');
      return;
    }
    loadBranchPdoBills(keyword);
  };

  useEffect(() => {
    loadBranchPdoBills('');
  }, [loadBranchPdoBills, searchBranchKey]);

  const handleCreateProductionReport = () => {
    const run = async () => {
      const selectedRow = searchRows.find((row) => row.id === selectedSearchId);
      if (!selectedRow) {
        setSearchError(locale === 'ko' ? '먼저 PDO를 검색하고 목록에서 선택해주세요.' : 'Please search and select a PDO bill first.');
        return;
      }

      const branchMeta = BRANCH_META.find((b) => b.key === searchBranchKey);
      if (!branchMeta) return;

      setCreatingReport(true);
      setSearchError('');
      setReportMessage('');
      try {
        let createdBy = '';
        try {
          const raw = localStorage.getItem('k_system_admin_user');
          const user = raw ? JSON.parse(raw) : null;
          createdBy = String(user?.name || user?.fullname || user?.username || '');
        } catch {
          createdBy = '';
        }

        const createRes = await fetch('/api/korea/production-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branchKey: searchBranchKey,
            branchName: branchMeta.branch,
            pdoID: selectedRow.id,
            pdoNo: selectedRow.pdoNo,
            productName: selectedRow.product,
            quantity: selectedRow.quantity,
            createdBy,
          }),
        });

        const createJson = await createRes.json().catch(() => ({}));
        if (!createRes.ok || !createJson?.success || !createJson?.report?.report_no) {
          setSearchError(locale === 'ko' ? '생산 보고서 생성에 실패했습니다.' : 'Failed to create production report.');
          return;
        }

        const reportNo = String(createJson.report.report_no);
        await fetch('/api/korea/production-updates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `${searchBranchKey}:${selectedRow.id}`,
            orderNumber: selectedRow.pdoNo,
            productName: selectedRow.product,
            branch: branchMeta.branch,
            branchCode: branchMeta.branchCode,
            totalQuantity: selectedRow.quantity,
            completedQuantity: 0,
            progressPercent: 0,
            currentStage: 'assembly',
            assignedTeam: `${branchMeta.branch} Production Team`,
            startDate: new Date().toISOString().slice(0, 10),
            estimatedCompletion: selectedRow.dueDate === '-' ? null : selectedRow.dueDate,
            lastUpdate: new Date().toISOString().slice(0, 10),
            notes: null
          }),
        });

        setUpdates((prev) => prev.map((item) => {
          if (item.branchKey === searchBranchKey && item.sourceId === selectedRow.id) {
            return { ...item, reportNo };
          }
          return item;
        }));
        setReportMessage(
          locale === 'ko'
            ? `생산 보고서가 생성되었습니다: ${reportNo}`
            : `Production report created: ${reportNo}`
        );
      } catch {
        setSearchError(locale === 'ko' ? '생산 보고서 생성에 실패했습니다.' : 'Failed to create production report.');
      } finally {
        setCreatingReport(false);
      }
    };
    run();
  };

  const reportUpdates = updates.filter((update) => Boolean(update.reportNo));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/production/dashboard')}
              className="text-green-600 hover:text-green-800"
            >
              ← {t.back}
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                {locale === 'ko' ? '생산 진척 현황' : 'Production Updates'}
              </h1>
              <p className="text-gray-600 mt-1">
                {locale === 'ko' ? '실시간 생산 진행 상황' : 'Real-time production progress'}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 rounded-xl border border-teal-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">
            {locale === 'ko' ? '지점별 PDO 검색 및 생산 보고서 생성' : 'PDO Search by Branch and Production Report'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {locale === 'ko' ? '지점을 선택하고 PDO 번호를 검색해 생산 보고서를 생성하세요.' : 'Select branch and search PDO number to generate production report.'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {BRANCH_META.map((branch) => (
              <button
                key={`search-branch-${branch.key}`}
                type="button"
                onClick={() => {
                  setSearchBranchKey(branch.key);
                  setSearchPdoNo('');
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  searchBranchKey === branch.key
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                }`}
              >
                {branch.branch} ({PDO_PREFIX_BY_BRANCH[branch.key]})
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
            <input
              value={searchPdoNo}
              onChange={(e) => setSearchPdoNo(e.target.value)}
              placeholder={locale === 'ko'
                ? `예: ${PDO_PREFIX_BY_BRANCH[searchBranchKey]}20260401-00016`
                : `Example: ${PDO_PREFIX_BY_BRANCH[searchBranchKey]}20260401-00016`}
              className="md:col-span-3 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleSearchPdoBills}
              disabled={searchLoading}
              className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-700 disabled:opacity-60"
            >
              {searchLoading
                ? (locale === 'ko' ? '검색 중...' : 'Searching...')
                : (locale === 'ko' ? 'PDO 빌 검색' : 'Search PDO Bills')}
            </button>
            <button
              type="button"
              onClick={handleCreateProductionReport}
              disabled={!selectedSearchId || creatingReport}
              className="rounded-lg bg-teal-600 text-white px-4 py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-60"
            >
              {creatingReport
                ? (locale === 'ko' ? '생성 중...' : 'Creating...')
                : (locale === 'ko' ? '생산 보고서 생성' : 'Create Production Report')}
            </button>
          </div>

          {searchRows.length > 0 && (
            <div className="mt-3 overflow-x-auto rounded-lg border border-teal-100">
              <table className="w-full text-sm">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-teal-800">{locale === 'ko' ? '선택' : 'Select'}</th>
                    <th className="px-3 py-2 text-left text-teal-800">PDO</th>
                    <th className="px-3 py-2 text-left text-teal-800">{locale === 'ko' ? '제품' : 'Product'}</th>
                    <th className="px-3 py-2 text-left text-teal-800">{locale === 'ko' ? '수량' : 'Qty'}</th>
                    <th className="px-3 py-2 text-left text-teal-800">{locale === 'ko' ? '납기일' : 'Due Date'}</th>
                    <th className="px-3 py-2 text-left text-teal-800">{locale === 'ko' ? '상태' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {searchRows.map((row) => (
                    <tr key={row.id} className="border-t border-teal-100">
                      <td className="px-3 py-2">
                        <input
                          type="radio"
                          name="selected_pdo_bill"
                          checked={selectedSearchId === row.id}
                          onChange={() => setSelectedSearchId(row.id)}
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900">{row.pdoNo}</td>
                      <td className="px-3 py-2 text-gray-700">{row.product}</td>
                      <td className="px-3 py-2 text-gray-700">{row.quantity}</td>
                      <td className="px-3 py-2 text-gray-700">{row.dueDate}</td>
                      <td className="px-3 py-2 text-gray-700">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {searchError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchError}
            </div>
          )}
          {reportMessage && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {reportMessage}
            </div>
          )}
        </div>

        {loading && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {locale === 'ko' ? 'PDO 생산 업데이트 목록을 불러오는 중...' : 'Loading PDO production updates...'}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '전체 프로젝트' : 'Total Projects'}</p>
            <p className="text-2xl font-bold text-green-600">{reportUpdates.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '조립 중' : 'In Assembly'}</p>
            <p className="text-2xl font-bold text-blue-600">
              {reportUpdates.filter(u => u.currentStage === 'assembly').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '테스트 중' : 'In Testing'}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {reportUpdates.filter(u => u.currentStage === 'testing').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '완료' : 'Completed'}</p>
            <p className="text-2xl font-bold text-green-600">
              {reportUpdates.filter(u => u.currentStage === 'ready').length}
            </p>
          </div>
        </div>

        {/* Production Updates List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {locale === 'ko' ? '생산 진행 목록' : 'Production Progress List'}
            </h2>
          </div>

          <div className="lg:hidden p-4 bg-slate-50 space-y-4">
            {reportUpdates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-gray-500">
                {locale === 'ko'
                  ? '생산 보고서를 생성한 PDO만 이 목록에 표시됩니다.'
                  : 'Only PDO bills with created production reports are shown here.'}
              </div>
            ) : reportUpdates.map((update) => {
              const stageInfo = getStageInfo(update.currentStage);
              return (
                <div key={`card-${update.id}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">{locale === 'ko' ? '보고서 번호' : 'Report No.'}</p>
                      <p className="text-sm font-semibold text-teal-700 break-words">{update.reportNo}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${stageInfo.color}`}>
                      <span>{stageInfo.icon}</span>
                      <span>{stageInfo.label}</span>
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p><span className="text-slate-500">{locale === 'ko' ? '주문번호' : 'Order No.'}: </span><span className="font-medium text-gray-900 break-words">{update.orderNumber}</span></p>
                    <p><span className="text-slate-500">{locale === 'ko' ? '제품명' : 'Product'}: </span><span className="text-gray-900">{update.productName}</span></p>
                    <p className="flex items-center gap-2"><span className="text-slate-500">{locale === 'ko' ? '지점' : 'Branch'}:</span><CountryFlag country={update.branchCode} size="sm" /><span className="text-gray-900">{update.branch}</span></p>
                    <p><span className="text-slate-500">{locale === 'ko' ? '담당팀' : 'Team'}: </span><span className="text-gray-900">{update.assignedTeam}</span></p>
                    <p><span className="text-slate-500">{locale === 'ko' ? '마지막 업데이트' : 'Last Update'}: </span><span className="text-gray-900">{update.lastUpdate}</span></p>
                  </div>

                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${update.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{locale === 'ko' ? '진행률' : 'Progress'}: {update.progressPercent}%</span>
                      <span>{update.completedQuantity}/{update.totalQuantity}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handlePrintProductionReport(update)}
                      title={printReportLabel}
                      aria-label={printReportLabel}
                      className="w-full rounded-lg bg-emerald-600 text-white py-2 text-sm font-medium hover:bg-emerald-700 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V4h12v5M6 18h12v2H6v-2zm-2-8h16a2 2 0 012 2v4h-4v-3H6v3H2v-4a2 2 0 012-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden lg:block overflow-x-auto relative">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '보고서 번호' : 'Report No.'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '주문번호' : 'Order No.'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '제품명' : 'Product'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '지점' : 'Branch'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '진행률' : 'Progress'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '현재 단계' : 'Current Stage'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '담당팀' : 'Team'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '마지막 업데이트' : 'Last Update'}
                  </th>
                  <th className="sticky right-0 z-10 bg-gray-50 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {printReportLabel}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportUpdates.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                      {locale === 'ko'
                        ? '생산 보고서를 생성한 PDO만 이 목록에 표시됩니다.'
                        : 'Only PDO bills with created production reports are shown here.'}
                    </td>
                  </tr>
                )}
                {reportUpdates.map((update) => {
                  const stageInfo = getStageInfo(update.currentStage);
                  return (
                    <tr key={update.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-teal-700">{update.reportNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{update.orderNumber}</div>
                      </td>
                      <td className="px-4 py-4 min-w-[180px]">
                        <div className="text-sm text-gray-900">{update.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CountryFlag country={update.branchCode} size="sm" />
                          <span className="text-sm text-gray-600">{update.branch}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${update.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            {update.progressPercent}%
                          </span>
                          <span className="text-xs text-gray-500">
                            {update.completedQuantity}/{update.totalQuantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${stageInfo.color}`}>
                          <span>{stageInfo.icon}</span>
                          <span>{stageInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{update.assignedTeam}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{update.lastUpdate}</div>
                      </td>
                      <td className="sticky right-0 z-10 bg-white px-4 py-4 text-center shadow-[-6px_0_6px_-6px_rgba(0,0,0,0.18)]">
                        <button
                          onClick={() => handlePrintProductionReport(update)}
                          title={printReportLabel}
                          aria-label={printReportLabel}
                          className="inline-flex items-center justify-center text-green-600 hover:text-green-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V4h12v5M6 18h12v2H6v-2zm-2-8h16a2 2 0 012 2v4h-4v-3H6v3H2v-4a2 2 0 012-2z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CountryFlag country={selectedUpdate.branchCode} size="lg" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUpdate.orderNumber}</h2>
                  <p className="text-green-100 text-sm">{selectedUpdate.productName}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Progress Overview */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-bold text-gray-800 mb-4">{locale === 'ko' ? '진행 현황' : 'Progress Overview'}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {locale === 'ko' ? '전체 진행률' : 'Overall Progress'}
                      </span>
                      <span className="text-sm font-bold text-green-600">{selectedUpdate.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${selectedUpdate.progressPercent}%` }}
                      />
                    </div>
                  </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600">{locale === 'ko' ? '완료 수량' : 'Completed'}</p>
                      <p className="text-2xl font-bold text-green-600">{selectedUpdate.completedQuantity}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600">{locale === 'ko' ? '총 수량' : 'Total'}</p>
                      <p className="text-2xl font-bold text-gray-800">{selectedUpdate.totalQuantity}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '현재 단계' : 'Current Stage'}</p>
                  <p className="font-semibold text-gray-800">{getStageInfo(selectedUpdate.currentStage).label}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '담당팀' : 'Assigned Team'}</p>
                  <p className="font-semibold text-gray-800">{selectedUpdate.assignedTeam}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '시작일' : 'Start Date'}</p>
                  <p className="font-semibold text-gray-800">{selectedUpdate.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '완료 예정' : 'Est. Completion'}</p>
                  <p className="font-semibold text-gray-800">{selectedUpdate.estimatedCompletion}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '마지막 업데이트' : 'Last Update'}</p>
                  <p className="font-semibold text-gray-800">{selectedUpdate.lastUpdate}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">{locale === 'ko' ? '현재 단계 수정' : 'Update Stage'}</p>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value as StageType)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="assembly">{locale === 'ko' ? '조립 중' : 'Assembly'}</option>
                    <option value="testing">{locale === 'ko' ? '테스트 중' : 'Testing'}</option>
                    <option value="packaging">{locale === 'ko' ? '포장 중' : 'Packaging'}</option>
                    <option value="ready">{locale === 'ko' ? '완료' : 'Ready'}</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">{locale === 'ko' ? '완료 수량 수정' : 'Update Completed Qty'}</p>
                  <input
                    type="number"
                    min={0}
                    max={selectedUpdate.totalQuantity}
                    value={editCompletedQty}
                    onChange={(e) => setEditCompletedQty(Number(e.target.value || 0))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-semibold text-yellow-800 mb-2">{locale === 'ko' ? '비고' : 'Notes'}</p>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-yellow-300 px-3 py-2 text-sm text-yellow-800"
                  placeholder={locale === 'ko' ? '진행 메모를 입력하세요.' : 'Write progress notes...'}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg">
                  {t.close}
                </button>
                <button
                  onClick={handleUpdateProgress}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg disabled:opacity-60"
                >
                  {saving ? (locale === 'ko' ? '저장 중...' : 'Saving...') : (locale === 'ko' ? '진척도 업데이트' : 'Update Progress')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
