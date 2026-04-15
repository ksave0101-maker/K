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
  branch: string;
  branchKey: string;
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

export default function EquipmentTestPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<EquipmentTest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const branches = [
    { key: 'korea', name: t.korea },
    { key: 'brunei', name: t.brunei },
    { key: 'thailand', name: t.thailand },
    { key: 'vietnam', name: t.vietnam },
  ];

  const [items, setItems] = useState<EquipmentTest[]>([
    { id: 1, testReportNumber: 'TR-2026-001', branch: 'Korea', branchKey: 'korea', equipmentName: 'K-Energy Solar Panel', modelNumber: 'KSP-500W', testDate: '2026-02-15', testedBy: 'Kim Junseok', performanceScore: 97, powerOutput: '498W', efficiency: '21.8%', operatingTemp: '45°C', testResult: 'pass', remarks: 'Exceeds rated output, optimal performance' },
    { id: 2, testReportNumber: 'TR-2026-002', branch: 'Korea', branchKey: 'korea', equipmentName: 'Smart Inverter', modelNumber: 'SI-3000', testDate: '2026-02-14', testedBy: 'Lee Hyunwoo', performanceScore: 95, powerOutput: '2.95kW', efficiency: '98.3%', operatingTemp: '38°C', testResult: 'pass', remarks: 'Pure sine wave output verified' },
    { id: 3, testReportNumber: 'TR-2026-003', branch: 'Brunei', branchKey: 'brunei', equipmentName: 'Energy Save Unit', modelNumber: 'ESU-A200', testDate: '2026-02-13', testedBy: 'Ahmad Hakim', performanceScore: 92, powerOutput: '195W', efficiency: '97.5%', operatingTemp: '42°C', testResult: 'pass', remarks: 'All parameters within spec, tropical climate tested' },
    { id: 4, testReportNumber: 'TR-2026-004', branch: 'Brunei', branchKey: 'brunei', equipmentName: 'Battery Storage System', modelNumber: 'BSS-500', testDate: '2026-02-12', testedBy: 'Mohd Rizwan', performanceScore: 78, powerOutput: '475W', efficiency: '94.2%', operatingTemp: '52°C', testResult: 'conditional', remarks: 'Operating temperature above optimal range in direct sun' },
    { id: 5, testReportNumber: 'TR-2026-005', branch: 'Thailand', branchKey: 'thailand', equipmentName: 'Solar Controller', modelNumber: 'SC-200', testDate: '2026-02-11', testedBy: 'Somchai Intarat', performanceScore: 99, powerOutput: '200W', efficiency: '99.1%', operatingTemp: '35°C', testResult: 'pass', remarks: 'Best-in-class MPPT tracking accuracy' },
    { id: 6, testReportNumber: 'TR-2026-006', branch: 'Thailand', branchKey: 'thailand', equipmentName: 'Transformer', modelNumber: 'T-5000', testDate: '2026-02-10', testedBy: 'Nattawut Suwan', performanceScore: 65, powerOutput: '4.2kW', efficiency: '84.0%', operatingTemp: '68°C', testResult: 'fail', remarks: 'Efficiency below minimum threshold, coil winding issue detected' },
    { id: 7, testReportNumber: 'TR-2026-007', branch: 'Vietnam', branchKey: 'vietnam', equipmentName: 'EV Charger', modelNumber: 'EC-300', testDate: '2026-02-09', testedBy: 'Tran Quoc Dung', performanceScore: 94, powerOutput: '295W', efficiency: '98.5%', operatingTemp: '40°C', testResult: 'pass', remarks: 'Fast charging protocol (CCS2) verified' },
    { id: 8, testReportNumber: 'TR-2026-008', branch: 'Vietnam', branchKey: 'vietnam', equipmentName: 'Power Monitoring System', modelNumber: 'PMS-100', testDate: '2026-02-08', testedBy: 'Nguyen Hoang', performanceScore: 91, powerOutput: 'N/A', efficiency: '99.8%', operatingTemp: '30°C', testResult: 'pass', remarks: 'Data accuracy within 0.2% tolerance' },
    { id: 9, testReportNumber: 'TR-2026-009', branch: 'Korea', branchKey: 'korea', equipmentName: 'LED Lighting Module', modelNumber: 'LM-100', testDate: '2026-02-07', testedBy: 'Park Minji', performanceScore: 88, powerOutput: '95W', efficiency: '95.0%', operatingTemp: '55°C', testResult: 'conditional', remarks: 'Heat dissipation needs improvement for enclosed fixtures' },
    { id: 10, testReportNumber: 'TR-2026-010', branch: 'Thailand', branchKey: 'thailand', equipmentName: 'Energy Audit Kit', modelNumber: 'EAK-1', testDate: '2026-02-06', testedBy: 'Preecha Saengchai', performanceScore: 96, powerOutput: 'N/A', efficiency: '99.5%', operatingTemp: '28°C', testResult: 'pass', remarks: 'Calibration verified, sensors accurate' },
  ]);

  const [newItem, setNewItem] = useState<{ branch: string; equipmentName: string; modelNumber: string; testedBy: string; performanceScore: number; powerOutput: string; efficiency: string; operatingTemp: string; testResult: 'pass' | 'fail' | 'conditional'; remarks: string }>({ branch: 'korea', equipmentName: '', modelNumber: '', testedBy: '', performanceScore: 0, powerOutput: '', efficiency: '', operatingTemp: '', testResult: 'pass', remarks: '' });

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
    const matchBranch = branchFilter === 'all' || o.branchKey === branchFilter;
    const matchResult = resultFilter === 'all' || o.testResult === resultFilter;
    return matchSearch && matchBranch && matchResult;
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
      testReportNumber: `TR-2026-${String(newId).padStart(3, '0')}`,
      branch: branches.find(b => b.key === newItem.branch)?.name || '',
      branchKey: newItem.branch,
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
    setNewItem({ branch: 'korea', equipmentName: '', modelNumber: '', testedBy: '', performanceScore: 0, powerOutput: '', efficiency: '', operatingTemp: '', testResult: 'pass', remarks: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/international-market/dashboard')} className="text-red-600 hover:text-red-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <TestTube2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">{t.equipmentTestReport}</h1>
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
            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
              <option value="all">{t.allBranches}</option>
              {branches.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.branchName}</th>
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
                    <td className="px-4 py-3 text-sm">{branches.find(b => b.key === item.branchKey)?.name || item.branch}</td>
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
                <div><p className="text-xs text-gray-500">{t.branchName}</p><p className="font-medium">{branches.find(b => b.key === selectedItem.branchKey)?.name || selectedItem.branch}</p></div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.branchName}</label>
                <select value={newItem.branch} onChange={e => setNewItem({ ...newItem, branch: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {branches.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
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
