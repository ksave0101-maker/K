'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, TestTube2, Plus, Eye, Trash2, X, Search as SearchIcon, Printer, FileDown } from 'lucide-react';

interface EquipmentTest {
  id: number;
  testReportNumber: string;
  region: string;
  regionKey: string;
  equipmentName: string;
  modelNumber: string;
  testDate: string;
  testedBy: string;
  performanceScore: number;
  powerOutput: string;
  efficiency: string;
  operatingTemp: string;
  testResult: 'pass' | 'fail' | 'conditional';
  remarks: string;
}

export default function DomesticEquipmentTestPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<EquipmentTest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const regions = locale === 'ko'
    ? [{ key: 'seoul', name: '서울/경기' }, { key: 'busan', name: '부산/경남' }, { key: 'daegu', name: '대구/경북' }, { key: 'daejeon', name: '대전/충청' }, { key: 'gwangju', name: '광주/전라' }, { key: 'incheon', name: '인천/강원' }, { key: 'jeju', name: '제주' }]
    : [{ key: 'seoul', name: 'Seoul/Gyeonggi' }, { key: 'busan', name: 'Busan/Gyeongnam' }, { key: 'daegu', name: 'Daegu/Gyeongbuk' }, { key: 'daejeon', name: 'Daejeon/Chungcheong' }, { key: 'gwangju', name: 'Gwangju/Jeolla' }, { key: 'incheon', name: 'Incheon/Gangwon' }, { key: 'jeju', name: 'Jeju' }];

  const [items, setItems] = useState<EquipmentTest[]>([
    { id: 1, testReportNumber: 'DTR-2026-001', region: '서울/경기', regionKey: 'seoul', equipmentName: 'K-Energy 태양광 패널', modelNumber: 'KSP-500W', testDate: '2026-02-15', testedBy: '김준석', performanceScore: 97, powerOutput: '498W', efficiency: '21.8%', operatingTemp: '45°C', testResult: 'pass', remarks: '정격 출력 초과, 최적 성능 확인' },
    { id: 2, testReportNumber: 'DTR-2026-002', region: '서울/경기', regionKey: 'seoul', equipmentName: '스마트 인버터', modelNumber: 'SI-3000', testDate: '2026-02-14', testedBy: '이현우', performanceScore: 95, powerOutput: '2.95kW', efficiency: '98.3%', operatingTemp: '38°C', testResult: 'pass', remarks: '순수 정현파 출력 검증 완료' },
    { id: 3, testReportNumber: 'DTR-2026-003', region: '부산/경남', regionKey: 'busan', equipmentName: '에너지 절감 장치', modelNumber: 'ESU-A200', testDate: '2026-02-13', testedBy: '박성호', performanceScore: 92, powerOutput: '195W', efficiency: '97.5%', operatingTemp: '42°C', testResult: 'pass', remarks: '모든 파라미터 사양 내 합격' },
    { id: 4, testReportNumber: 'DTR-2026-004', region: '부산/경남', regionKey: 'busan', equipmentName: '배터리 저장 시스템', modelNumber: 'BSS-500', testDate: '2026-02-12', testedBy: '최민재', performanceScore: 78, powerOutput: '475W', efficiency: '94.2%', operatingTemp: '52°C', testResult: 'conditional', remarks: '직사광선 하 동작 온도 최적 범위 초과' },
    { id: 5, testReportNumber: 'DTR-2026-005', region: '대구/경북', regionKey: 'daegu', equipmentName: '태양광 컨트롤러', modelNumber: 'SC-200', testDate: '2026-02-11', testedBy: '정우진', performanceScore: 99, powerOutput: '200W', efficiency: '99.1%', operatingTemp: '35°C', testResult: 'pass', remarks: '최고 수준 MPPT 추적 정확도' },
    { id: 6, testReportNumber: 'DTR-2026-006', region: '대전/충청', regionKey: 'daejeon', equipmentName: '변압기', modelNumber: 'T-5000', testDate: '2026-02-10', testedBy: '한지민', performanceScore: 65, powerOutput: '4.2kW', efficiency: '84.0%', operatingTemp: '68°C', testResult: 'fail', remarks: '효율 최소 기준 미달, 코일 권선 불량 감지' },
    { id: 7, testReportNumber: 'DTR-2026-007', region: '광주/전라', regionKey: 'gwangju', equipmentName: 'EV 충전기', modelNumber: 'EC-300', testDate: '2026-02-09', testedBy: '송태양', performanceScore: 94, powerOutput: '295W', efficiency: '98.5%', operatingTemp: '40°C', testResult: 'pass', remarks: '급속 충전 프로토콜 (CCS2) 검증 완료' },
    { id: 8, testReportNumber: 'DTR-2026-008', region: '인천/강원', regionKey: 'incheon', equipmentName: '전력 모니터링 시스템', modelNumber: 'PMS-100', testDate: '2026-02-08', testedBy: '윤서연', performanceScore: 91, powerOutput: 'N/A', efficiency: '99.8%', operatingTemp: '30°C', testResult: 'pass', remarks: '데이터 정확도 0.2% 허용 범위 내' },
    { id: 9, testReportNumber: 'DTR-2026-009', region: '제주', regionKey: 'jeju', equipmentName: '풍력 변환 시스템', modelNumber: 'WCS-500', testDate: '2026-02-07', testedBy: '강해람', performanceScore: 88, powerOutput: '480W', efficiency: '96.0%', operatingTemp: '55°C', testResult: 'conditional', remarks: '강풍 조건 하 방열 개선 필요' },
    { id: 10, testReportNumber: 'DTR-2026-010', region: '대구/경북', regionKey: 'daegu', equipmentName: 'LED 조명 모듈', modelNumber: 'LM-100', testDate: '2026-02-06', testedBy: '임채원', performanceScore: 96, powerOutput: '95W', efficiency: '95.0%', operatingTemp: '48°C', testResult: 'pass', remarks: '교정 검증 완료, 센서 정확' },
  ]);

  const [newItem, setNewItem] = useState<{ region: string; equipmentName: string; modelNumber: string; testedBy: string; performanceScore: number; powerOutput: string; efficiency: string; operatingTemp: string; testResult: 'pass' | 'fail' | 'conditional'; remarks: string }>({ region: 'seoul', equipmentName: '', modelNumber: '', testedBy: '', performanceScore: 0, powerOutput: '', efficiency: '', operatingTemp: '', testResult: 'pass', remarks: '' });

  const resultBadge = (s: string) => {
    const map: Record<string, string> = { pass: 'bg-green-100 text-green-700', fail: 'bg-red-100 text-red-700', conditional: 'bg-yellow-100 text-yellow-700' };
    const label: Record<string, string> = { pass: t.passStatus, fail: t.failStatus, conditional: t.conditionalStatus };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const scoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filtered = items.filter(o => {
    const matchSearch = o.testReportNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) || o.modelNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = regionFilter === 'all' || o.regionKey === regionFilter;
    const matchResult = resultFilter === 'all' || o.testResult === resultFilter;
    return matchSearch && matchRegion && matchResult;
  });

  const handleDelete = (id: number) => {
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setItems(items.filter(o => o.id !== id));
    }
  };

  const handleCreate = () => {
    const newId = Math.max(...items.map(o => o.id)) + 1;
    setItems([...items, {
      id: newId,
      testReportNumber: `DTR-2026-${String(newId).padStart(3, '0')}`,
      region: regions.find(r => r.key === newItem.region)?.name || '',
      regionKey: newItem.region,
      equipmentName: newItem.equipmentName,
      modelNumber: newItem.modelNumber,
      testDate: '2026-02-15',
      testedBy: newItem.testedBy,
      performanceScore: newItem.performanceScore,
      powerOutput: newItem.powerOutput,
      efficiency: newItem.efficiency,
      operatingTemp: newItem.operatingTemp,
      testResult: newItem.testResult,
      remarks: newItem.remarks,
    }]);
    setIsAddModalOpen(false);
    setNewItem({ region: 'seoul', equipmentName: '', modelNumber: '', testedBy: '', performanceScore: 0, powerOutput: '', efficiency: '', operatingTemp: '', testResult: 'pass', remarks: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/domestic-market/dashboard')} className="text-red-600 hover:text-red-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <TestTube2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{t.equipmentTestReport}</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '총 테스트' : 'Total Tests'}</p>
            <p className="text-2xl font-bold text-gray-800">{items.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{t.passStatus}</p>
            <p className="text-2xl font-bold text-green-600">{items.filter(i => i.testResult === 'pass').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{t.conditionalStatus}</p>
            <p className="text-2xl font-bold text-yellow-600">{items.filter(i => i.testResult === 'conditional').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{t.failStatus}</p>
            <p className="text-2xl font-bold text-red-600">{items.filter(i => i.testResult === 'fail').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={t.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
              <option value="all">{t.allRegions}</option>
              {regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
            </select>
            <select value={resultFilter} onChange={e => setResultFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
              <option value="all">{t.testResult}</option>
              <option value="pass">{t.passStatus}</option>
              <option value="conditional">{t.conditionalStatus}</option>
              <option value="fail">{t.failStatus}</option>
            </select>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              <Plus className="w-4 h-4" />{t.addNew}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.testReportNumber}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.region}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.equipmentName}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.modelNumber}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.performanceScore}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.efficiency}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.testResult}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.edit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-red-600">{item.testReportNumber}</td>
                    <td className="px-4 py-3 text-sm">{regions.find(r => r.key === item.regionKey)?.name || item.region}</td>
                    <td className="px-4 py-3 text-sm">{item.equipmentName}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.modelNumber}</td>
                    <td className="px-4 py-3 text-center"><span className={`font-bold ${scoreColor(item.performanceScore)}`}>{item.performanceScore}%</span></td>
                    <td className="px-4 py-3 text-center text-sm">{item.efficiency}</td>
                    <td className="px-4 py-3 text-center">{resultBadge(item.testResult)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedItem(item)} className="text-red-500 hover:text-red-700"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">{t.noData}</td></tr>
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
                <div><p className="text-xs text-gray-500">{t.testReportNumber}</p><p className="font-medium">{selectedItem.testReportNumber}</p></div>
                <div><p className="text-xs text-gray-500">{t.region}</p><p className="font-medium">{regions.find(r => r.key === selectedItem.regionKey)?.name || selectedItem.region}</p></div>
                <div><p className="text-xs text-gray-500">{t.equipmentName}</p><p className="font-medium">{selectedItem.equipmentName}</p></div>
                <div><p className="text-xs text-gray-500">{t.modelNumber}</p><p className="font-medium font-mono">{selectedItem.modelNumber}</p></div>
                <div><p className="text-xs text-gray-500">{t.testDate}</p><p className="font-medium">{selectedItem.testDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.testedBy}</p><p className="font-medium">{selectedItem.testedBy}</p></div>
              </div>
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">{locale === 'ko' ? '테스트 결과 상세' : 'Test Results Detail'}</h3>
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t.performanceScore}</span><span className={`font-bold ${scoreColor(selectedItem.performanceScore)}`}>{selectedItem.performanceScore}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${selectedItem.performanceScore >= 90 ? 'bg-green-500' : selectedItem.performanceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selectedItem.performanceScore}%` }} /></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t.powerOutput}</span><span className="font-medium">{selectedItem.powerOutput}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t.efficiency}</span><span className="font-medium">{selectedItem.efficiency}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-600">{t.operatingTemp}</span><span className="font-medium">{selectedItem.operatingTemp}</span></div>
                <div className="border-t pt-3 flex justify-between items-center font-semibold"><span className="text-sm">{t.testResult}</span>{resultBadge(selectedItem.testResult)}</div>
              </div>
              <div><p className="text-xs text-gray-500">{t.remarks}</p><p className="font-medium">{selectedItem.remarks}</p></div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"><Printer className="w-4 h-4" />{t.printDocument}</button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"><FileDown className="w-4 h-4" />{t.exportPDF}</button>
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
              <h2 className="text-lg font-bold">{t.addNew} - {t.equipmentTestReport}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.region}</label>
                <select value={newItem.region} onChange={e => setNewItem({ ...newItem, region: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.equipmentName}</label>
                  <input type="text" value={newItem.equipmentName} onChange={e => setNewItem({ ...newItem, equipmentName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.modelNumber}</label>
                  <input type="text" value={newItem.modelNumber} onChange={e => setNewItem({ ...newItem, modelNumber: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.testedBy}</label>
                <input type="text" value={newItem.testedBy} onChange={e => setNewItem({ ...newItem, testedBy: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.powerOutput}</label>
                  <input type="text" value={newItem.powerOutput} onChange={e => setNewItem({ ...newItem, powerOutput: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="e.g. 498W" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.efficiency}</label>
                  <input type="text" value={newItem.efficiency} onChange={e => setNewItem({ ...newItem, efficiency: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="e.g. 98.5%" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.performanceScore}</label>
                  <input type="number" min="0" max="100" value={newItem.performanceScore} onChange={e => setNewItem({ ...newItem, performanceScore: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.testResult}</label>
                  <select value={newItem.testResult} onChange={e => setNewItem({ ...newItem, testResult: e.target.value as 'pass' | 'fail' | 'conditional' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="pass">{t.passStatus}</option>
                    <option value="conditional">{t.conditionalStatus}</option>
                    <option value="fail">{t.failStatus}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.remarks}</label>
                <textarea value={newItem.remarks} onChange={e => setNewItem({ ...newItem, remarks: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">{t.cancel}</button>
                <button onClick={handleCreate} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
