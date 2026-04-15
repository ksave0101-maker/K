'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, Search as SearchIcon, Plus, Eye, Trash2, X, ClipboardCheck, Printer, FileDown } from 'lucide-react';

interface SiteInspection {
  id: number;
  inspectionNumber: string;
  branch: string;
  branchKey: string;
  siteLocation: string;
  inspector: string;
  inspectionDate: string;
  structuralCondition: 'pass' | 'fail' | 'conditional';
  electricalSystem: 'pass' | 'fail' | 'conditional';
  safetyCompliance: 'pass' | 'fail' | 'conditional';
  siteReadiness: 'pass' | 'fail' | 'conditional';
  overallResult: 'pass' | 'fail' | 'conditional';
  remarks: string;
}

export default function SiteInspectionPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<SiteInspection | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const branches = [
    { key: 'korea', name: t.korea },
    { key: 'brunei', name: t.brunei },
    { key: 'thailand', name: t.thailand },
    { key: 'vietnam', name: t.vietnam },
  ];

  const [items, setItems] = useState<SiteInspection[]>([
    { id: 1, inspectionNumber: 'SI-2026-001', branch: 'Korea', branchKey: 'korea', siteLocation: 'Seoul Gangnam District - Tower A Rooftop', inspector: 'Kim Taehyung', inspectionDate: '2026-02-15', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', overallResult: 'pass', remarks: 'Excellent condition, ready for solar panel installation' },
    { id: 2, inspectionNumber: 'SI-2026-002', branch: 'Korea', branchKey: 'korea', siteLocation: 'Busan Marine City Complex', inspector: 'Park Seojin', inspectionDate: '2026-02-14', structuralCondition: 'pass', electricalSystem: 'conditional', safetyCompliance: 'pass', siteReadiness: 'conditional', overallResult: 'conditional', remarks: 'Electrical wiring needs upgrade before installation' },
    { id: 3, inspectionNumber: 'SI-2026-003', branch: 'Brunei', branchKey: 'brunei', siteLocation: 'BSB Government Complex', inspector: 'Ahmad Faisal', inspectionDate: '2026-02-13', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', overallResult: 'pass', remarks: 'Site fully prepared, proper grounding available' },
    { id: 4, inspectionNumber: 'SI-2026-004', branch: 'Brunei', branchKey: 'brunei', siteLocation: 'Kuala Belait Industrial Zone', inspector: 'Mohd Azlan', inspectionDate: '2026-02-12', structuralCondition: 'fail', electricalSystem: 'conditional', safetyCompliance: 'fail', siteReadiness: 'fail', overallResult: 'fail', remarks: 'Roof structure cannot support panel weight, requires reinforcement' },
    { id: 5, inspectionNumber: 'SI-2026-005', branch: 'Thailand', branchKey: 'thailand', siteLocation: 'Bangkok Siam District Warehouse', inspector: 'Somsak Petcharat', inspectionDate: '2026-02-11', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', overallResult: 'pass', remarks: 'Large flat roof area, ideal for 500kW system' },
    { id: 6, inspectionNumber: 'SI-2026-006', branch: 'Thailand', branchKey: 'thailand', siteLocation: 'Chiang Mai University Campus', inspector: 'Nattaya Wongsri', inspectionDate: '2026-02-10', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'conditional', siteReadiness: 'conditional', overallResult: 'conditional', remarks: 'Need additional fire safety measures for panel area' },
    { id: 7, inspectionNumber: 'SI-2026-007', branch: 'Vietnam', branchKey: 'vietnam', siteLocation: 'HCMC District 7 Factory', inspector: 'Pham Duc', inspectionDate: '2026-02-09', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', overallResult: 'pass', remarks: 'Modern facility, all requirements met' },
    { id: 8, inspectionNumber: 'SI-2026-008', branch: 'Vietnam', branchKey: 'vietnam', siteLocation: 'Hanoi Long Bien Commercial Center', inspector: 'Le Van Thanh', inspectionDate: '2026-02-08', structuralCondition: 'conditional', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'conditional', overallResult: 'conditional', remarks: 'Minor roof repairs needed in sections B and C' },
    { id: 9, inspectionNumber: 'SI-2026-009', branch: 'Korea', branchKey: 'korea', siteLocation: 'Daejeon Research Park', inspector: 'Yoo Jaesung', inspectionDate: '2026-02-07', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', overallResult: 'pass', remarks: 'Government spec building, top condition' },
    { id: 10, inspectionNumber: 'SI-2026-010', branch: 'Thailand', branchKey: 'thailand', siteLocation: 'Phuket Resort Complex', inspector: 'Wichai Srisuwan', inspectionDate: '2026-02-06', structuralCondition: 'pass', electricalSystem: 'fail', safetyCompliance: 'conditional', siteReadiness: 'fail', overallResult: 'fail', remarks: 'Electrical system too old, complete rewiring required' },
  ]);

  type InspResult = 'pass' | 'fail' | 'conditional';
  const [newItem, setNewItem] = useState<{ branch: string; siteLocation: string; inspector: string; structuralCondition: InspResult; electricalSystem: InspResult; safetyCompliance: InspResult; siteReadiness: InspResult; remarks: string }>({ branch: 'korea', siteLocation: '', inspector: '', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', remarks: '' });

  const resultBadge = (s: string) => {
    const map: Record<string, string> = { pass: 'bg-green-100 text-green-700', fail: 'bg-red-100 text-red-700', conditional: 'bg-yellow-100 text-yellow-700' };
    const label: Record<string, string> = { pass: t.passStatus, fail: t.failStatus, conditional: t.conditionalStatus };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const filtered = items.filter(o => {
    const matchSearch = o.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.siteLocation.toLowerCase().includes(searchTerm.toLowerCase()) || o.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBranch = branchFilter === 'all' || o.branchKey === branchFilter;
    const matchResult = resultFilter === 'all' || o.overallResult === resultFilter;
    return matchSearch && matchBranch && matchResult;
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
      inspectionNumber: `SI-2026-${String(newId).padStart(3, '0')}`,
      branch: branches.find(b => b.key === newItem.branch)?.name || '',
      branchKey: newItem.branch,
      siteLocation: newItem.siteLocation,
      inspector: newItem.inspector,
      inspectionDate: '2026-02-15',
      structuralCondition: newItem.structuralCondition,
      electricalSystem: newItem.electricalSystem,
      safetyCompliance: newItem.safetyCompliance,
      siteReadiness: newItem.siteReadiness,
      overallResult: overall as 'pass' | 'fail' | 'conditional',
      remarks: newItem.remarks,
    }]);
    setIsAddModalOpen(false);
    setNewItem({ branch: 'korea', siteLocation: '', inspector: '', structuralCondition: 'pass', electricalSystem: 'pass', safetyCompliance: 'pass', siteReadiness: 'pass', remarks: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/international-market/dashboard')} className="text-green-600 hover:text-green-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">{t.siteInspection}</h1>
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
            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
              <option value="all">{t.allBranches}</option>
              {branches.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.branchName}</th>
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
                    <td className="px-4 py-3 text-sm">{branches.find(b => b.key === item.branchKey)?.name || item.branch}</td>
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
                <div><p className="text-xs text-gray-500">{t.branchName}</p><p className="font-medium">{branches.find(b => b.key === selectedItem.branchKey)?.name || selectedItem.branch}</p></div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.branchName}</label>
                <select value={newItem.branch} onChange={e => setNewItem({ ...newItem, branch: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {branches.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
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
                    <select value={newItem[key]} onChange={e => setNewItem({ ...newItem, [key]: e.target.value as 'pass' | 'fail' | 'conditional' })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
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
