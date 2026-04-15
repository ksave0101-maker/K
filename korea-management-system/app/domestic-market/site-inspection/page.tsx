'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, Search as SearchIcon, Plus, Eye, Trash2, X, ClipboardCheck, Printer, FileDown } from 'lucide-react';

type InspResult = 'pass' | 'fail' | 'conditional';

interface SiteInspection {
  id: number;
  inspectionNumber: string;
  region: string;
  siteLocation: string;
  inspector: string;
  inspectionDate: string;
  structuralCondition: InspResult;
  electricalSystem: InspResult;
  safetyCompliance: InspResult;
  siteReadiness: InspResult;
  overallResult: InspResult;
  remarks: string;
}

export default function DomesticSiteInspectionPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<SiteInspection | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const regions = locale === 'ko'
    ? [{ key: 'seoul', name: '서울/경기' }, { key: 'busan', name: '부산/경남' }, { key: 'daegu', name: '대구/경북' }, { key: 'daejeon', name: '대전/충청' }, { key: 'gwangju', name: '광주/전라' }, { key: 'incheon', name: '인천/강원' }, { key: 'jeju', name: '제주' }]
    : [{ key: 'seoul', name: 'Seoul/Gyeonggi' }, { key: 'busan', name: 'Busan/Gyeongnam' }, { key: 'daegu', name: 'Daegu/Gyeongbuk' }, { key: 'daejeon', name: 'Daejeon/Chungcheong' }, { key: 'gwangju', name: 'Gwangju/Jeolla' }, { key: 'incheon', name: 'Incheon/Gangwon' }, { key: 'jeju', name: 'Jeju' }];

  const [items, setItems] = useState<SiteInspection[]>([
    { id: 1, inspectionNumber: 'DSI-2026-001', region: 'seoul', siteLocation: '서울 강남구 역삼동 - 타워A 옥상', inspector: 'Kim Taehyung', inspectionDate: '2026-02-15', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', overallResult: 'pass', remarks: '우수한 상태, 태양광 패널 설치 준비 완료' },
    { id: 2, inspectionNumber: 'DSI-2026-002', region: 'busan', siteLocation: '부산 해운대구 마린시티 복합건물', inspector: 'Park Seojin', inspectionDate: '2026-02-14', structuralCondition: 'pass', electricalSystem: 'conditional', safetyCompliance: 'pass', siteReadiness: 'conditional', overallResult: 'conditional', remarks: '설치 전 전기 배선 업그레이드 필요' },
    { id: 3, inspectionNumber: 'DSI-2026-003', region: 'daejeon', siteLocation: '대전 유성구 연구단지 건물C', inspector: 'Lee Junhyuk', inspectionDate: '2026-02-13', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', overallResult: 'pass', remarks: '접지 시스템 확인 완료, 사이트 준비됨' },
    { id: 4, inspectionNumber: 'DSI-2026-004', region: 'gwangju', siteLocation: '광주 서구 공공기관 건물', inspector: 'Choi Minkyu', inspectionDate: '2026-02-12', structuralCondition: 'fail', electricalSystem: 'conditional', safetyCompliance: 'fail', siteReadiness: 'fail', overallResult: 'fail', remarks: '지붕 구조물이 패널 하중 지지 불가, 보강 필요' },
    { id: 5, inspectionNumber: 'DSI-2026-005', region: 'seoul', siteLocation: '경기 수원시 삼성전자 인근 창고', inspector: 'Yoo Jaesung', inspectionDate: '2026-02-11', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', overallResult: 'pass', remarks: '넓은 평지붕, 500kW 시스템 적합' },
    { id: 6, inspectionNumber: 'DSI-2026-006', region: 'daegu', siteLocation: '대구 달성군 산업단지 공장', inspector: 'Bae Suzy', inspectionDate: '2026-02-10', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'conditional', siteReadiness: 'conditional', overallResult: 'conditional', remarks: '패널 구역 추가 방화 안전 조치 필요' },
    { id: 7, inspectionNumber: 'DSI-2026-007', region: 'incheon', siteLocation: '인천 서구 검단 신도시 건물', inspector: 'Son Heungmin', inspectionDate: '2026-02-09', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', overallResult: 'pass', remarks: '최신 시설, 모든 요구사항 충족' },
    { id: 8, inspectionNumber: 'DSI-2026-008', region: 'jeju', siteLocation: '제주 서귀포시 리조트 단지', inspector: 'Ko Changseok', inspectionDate: '2026-02-08', structuralCondition: 'conditional', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'conditional', overallResult: 'conditional', remarks: 'B, C 구역 경미한 지붕 수리 필요' },
    { id: 9, inspectionNumber: 'DSI-2026-009', region: 'seoul', siteLocation: '서울 마포구 상암 디지털미디어시티', inspector: 'Jung Wooyoung', inspectionDate: '2026-02-07', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', overallResult: 'pass', remarks: '최고급 건물, 최상 상태' },
    { id: 10, inspectionNumber: 'DSI-2026-010', region: 'busan', siteLocation: '부산 기장군 공장 건물', inspector: 'Park Jihoon', inspectionDate: '2026-02-06', structuralCondition: 'pass', electricalSystem: 'fail', safetyCompliance: 'conditional', siteReadiness: 'fail', overallResult: 'fail', remarks: '전기 시스템 노후화, 전면 교체 필요' },
  ]);

  const [newItem, setNewItem] = useState<{ region: string; siteLocation: string; inspector: string; structuralCondition: InspResult; electricalSystem: InspResult; safetyCompliance: InspResult; siteReadiness: InspResult; remarks: string }>({ region: 'seoul', siteLocation: '', inspector: '', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', remarks: '' });

  const resultBadge = (s: string) => {
    const map: Record<string, string> = { pass: 'bg-green-100 text-green-700', fail: 'bg-red-100 text-red-700', conditional: 'bg-yellow-100 text-yellow-700' };
    const label: Record<string, string> = { pass: t.passStatus, fail: t.failStatus, conditional: t.conditionalStatus };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const filtered = items.filter(o => {
    const matchSearch = o.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.siteLocation.toLowerCase().includes(searchTerm.toLowerCase()) || o.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = regionFilter === 'all' || o.region === regionFilter;
    const matchResult = resultFilter === 'all' || o.overallResult === resultFilter;
    return matchSearch && matchRegion && matchResult;
  });

  const handleDelete = (id: number) => {
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setItems(items.filter(o => o.id !== id));
    }
  };

  const handleCreate = () => {
    const newId = Math.max(...items.map(o => o.id)) + 1;
    const allResults: InspResult[] = [newItem.structuralCondition, newItem.electricalSystem, newItem.safetyCompliance, newItem.siteReadiness];
    const overall: InspResult = allResults.includes('fail') ? 'fail' : allResults.includes('conditional') ? 'conditional' : 'pass';
    setItems([...items, {
      id: newId,
      inspectionNumber: `DSI-2026-${String(newId).padStart(3, '0')}`,
      region: newItem.region,
      siteLocation: newItem.siteLocation,
      inspector: newItem.inspector,
      inspectionDate: '2026-02-15',
      structuralCondition: newItem.structuralCondition,
      electricalSystem: newItem.electricalSystem,
      safetyCompliance: newItem.safetyCompliance,
      siteReadiness: newItem.siteReadiness,
      overallResult: overall,
      remarks: newItem.remarks,
    }]);
    setIsAddModalOpen(false);
    setNewItem({ region: 'seoul', siteLocation: '', inspector: '', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', remarks: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/domestic-market/dashboard')} className="text-green-600 hover:text-green-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{t.siteInspection}</h1>
                  <p className="text-xs text-gray-500">🇰🇷 {t.domesticMarket}</p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><span className="text-green-600 font-bold">{items.filter(i => i.overallResult === 'pass').length}</span></div>
            <div><p className="text-sm text-gray-600">{t.passStatus}</p></div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><span className="text-yellow-600 font-bold">{items.filter(i => i.overallResult === 'conditional').length}</span></div>
            <div><p className="text-sm text-gray-600">{t.conditionalStatus}</p></div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><span className="text-red-600 font-bold">{items.filter(i => i.overallResult === 'fail').length}</span></div>
            <div><p className="text-sm text-gray-600">{t.failStatus}</p></div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={t.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
              <option value="all">{t.allRegions}</option>
              {regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
            </select>
            <select value={resultFilter} onChange={e => setResultFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
              <option value="all">{t.filter}</option>
              <option value="pass">{t.passStatus}</option>
              <option value="conditional">{t.conditionalStatus}</option>
              <option value="fail">{t.failStatus}</option>
            </select>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />{t.addNew}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.inspectionNumber}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.region}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.siteLocation}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.inspector}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.inspectionDate}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.testResult}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.edit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-green-600">{item.inspectionNumber}</td>
                    <td className="px-4 py-3 text-sm">{regions.find(r => r.key === item.region)?.name}</td>
                    <td className="px-4 py-3 text-sm max-w-[200px] truncate">{item.siteLocation}</td>
                    <td className="px-4 py-3 text-sm">{item.inspector}</td>
                    <td className="px-4 py-3 text-sm">{item.inspectionDate}</td>
                    <td className="px-4 py-3 text-center">{resultBadge(item.overallResult)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedItem(item)} className="text-green-500 hover:text-green-700"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{t.noData}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{t.viewDetails}</h2>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">{t.inspectionNumber}</p><p className="font-medium">{selectedItem.inspectionNumber}</p></div>
                <div><p className="text-xs text-gray-500">{t.region}</p><p className="font-medium">{regions.find(r => r.key === selectedItem.region)?.name}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">{t.siteLocation}</p><p className="font-medium">{selectedItem.siteLocation}</p></div>
                <div><p className="text-xs text-gray-500">{t.inspector}</p><p className="font-medium">{selectedItem.inspector}</p></div>
                <div><p className="text-xs text-gray-500">{t.inspectionDate}</p><p className="font-medium">{selectedItem.inspectionDate}</p></div>
              </div>
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">{locale === 'ko' ? '검사 항목' : 'Inspection Items'}</h3>
                <div className="flex justify-between items-center"><span className="text-sm text-gray-600">{t.structuralCondition}</span>{resultBadge(selectedItem.structuralCondition)}</div>
                <div className="flex justify-between items-center"><span className="text-sm text-gray-600">{t.electricalSystem}</span>{resultBadge(selectedItem.electricalSystem)}</div>
                <div className="flex justify-between items-center"><span className="text-sm text-gray-600">{t.safetyCompliance}</span>{resultBadge(selectedItem.safetyCompliance)}</div>
                <div className="flex justify-between items-center"><span className="text-sm text-gray-600">{t.siteReadiness}</span>{resultBadge(selectedItem.siteReadiness)}</div>
                <div className="border-t pt-3 flex justify-between items-center font-semibold"><span className="text-sm">{t.testResult}</span>{resultBadge(selectedItem.overallResult)}</div>
              </div>
              <div><p className="text-xs text-gray-500">{t.remarks}</p><p className="font-medium">{selectedItem.remarks}</p></div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"><Printer className="w-4 h-4" />{t.printDocument}</button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"><FileDown className="w-4 h-4" />{t.exportPDF}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{t.addNew} - {t.siteInspection}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.region}</label>
                <select value={newItem.region} onChange={e => setNewItem({ ...newItem, region: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.siteLocation}</label>
                <input type="text" value={newItem.siteLocation} onChange={e => setNewItem({ ...newItem, siteLocation: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.inspector}</label>
                <input type="text" value={newItem.inspector} onChange={e => setNewItem({ ...newItem, inspector: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {([['structuralCondition', t.structuralCondition], ['electricalSystem', t.electricalSystem], ['safetyCompliance', t.safetyCompliance], ['siteReadiness', t.siteReadiness]] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <select value={newItem[key]} onChange={e => setNewItem({ ...newItem, [key]: e.target.value as InspResult })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                      <option value="pass">{t.passStatus}</option>
                      <option value="conditional">{t.conditionalStatus}</option>
                      <option value="fail">{t.failStatus}</option>
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.remarks}</label>
                <textarea value={newItem.remarks} onChange={e => setNewItem({ ...newItem, remarks: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">{t.cancel}</button>
                <button onClick={handleCreate} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
