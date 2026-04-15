'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, Zap, Plus, Eye, Trash2, X, Search as SearchIcon, Printer, FileDown } from 'lucide-react';

interface ElectricityCalc {
  id: number;
  calcNumber: string;
  branch: string;
  branchKey: string;
  siteLocation: string;
  voltage: string;
  current: string;
  powerConsumption: string;
  monthlyUsage: string;
  monthlyCost: number;
  estimatedAnnualCost: number;
  date: string;
  remarks: string;
}

export default function ElectricityCalcPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ElectricityCalc | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const branches = [
    { key: 'korea', name: t.korea, currency: '₩' },
    { key: 'brunei', name: t.brunei, currency: 'B$' },
    { key: 'thailand', name: t.thailand, currency: '฿' },
    { key: 'vietnam', name: t.vietnam, currency: '₫' },
  ];

  const [items, setItems] = useState<ElectricityCalc[]>([
    { id: 1, calcNumber: 'EC-2026-001', branch: 'Korea', branchKey: 'korea', siteLocation: 'Seoul HQ Building', voltage: '380V', current: '200A', powerConsumption: '76kW', monthlyUsage: '54,720 kWh', monthlyCost: 6566400, estimatedAnnualCost: 78796800, date: '2026-02-15', remarks: 'Main office 3-phase system' },
    { id: 2, calcNumber: 'EC-2026-002', branch: 'Korea', branchKey: 'korea', siteLocation: 'Busan Factory', voltage: '440V', current: '500A', powerConsumption: '220kW', monthlyUsage: '158,400 kWh', monthlyCost: 19008000, estimatedAnnualCost: 228096000, date: '2026-02-14', remarks: 'Production line heavy load' },
    { id: 3, calcNumber: 'EC-2026-003', branch: 'Brunei', branchKey: 'brunei', siteLocation: 'Bandar Seri Begawan Office', voltage: '240V', current: '100A', powerConsumption: '24kW', monthlyUsage: '17,280 kWh', monthlyCost: 1728, estimatedAnnualCost: 20736, date: '2026-02-13', remarks: 'Single phase supply' },
    { id: 4, calcNumber: 'EC-2026-004', branch: 'Brunei', branchKey: 'brunei', siteLocation: 'Temburong Branch', voltage: '240V', current: '63A', powerConsumption: '15kW', monthlyUsage: '10,800 kWh', monthlyCost: 1080, estimatedAnnualCost: 12960, date: '2026-02-12', remarks: 'Small branch office' },
    { id: 5, calcNumber: 'EC-2026-005', branch: 'Thailand', branchKey: 'thailand', siteLocation: 'Bangkok Warehouse', voltage: '380V', current: '300A', powerConsumption: '114kW', monthlyUsage: '82,080 kWh', monthlyCost: 328320, estimatedAnnualCost: 3939840, date: '2026-02-11', remarks: 'Cold storage + office' },
    { id: 6, calcNumber: 'EC-2026-006', branch: 'Thailand', branchKey: 'thailand', siteLocation: 'Chiang Mai Service Center', voltage: '220V', current: '100A', powerConsumption: '22kW', monthlyUsage: '15,840 kWh', monthlyCost: 63360, estimatedAnnualCost: 760320, date: '2026-02-10', remarks: 'Service center with AC' },
    { id: 7, calcNumber: 'EC-2026-007', branch: 'Vietnam', branchKey: 'vietnam', siteLocation: 'Ho Chi Minh City Office', voltage: '380V', current: '160A', powerConsumption: '60.8kW', monthlyUsage: '43,776 kWh', monthlyCost: 109440000, estimatedAnnualCost: 1313280000, date: '2026-02-09', remarks: 'Office + showroom' },
    { id: 8, calcNumber: 'EC-2026-008', branch: 'Vietnam', branchKey: 'vietnam', siteLocation: 'Hanoi Distribution Center', voltage: '380V', current: '250A', powerConsumption: '95kW', monthlyUsage: '68,400 kWh', monthlyCost: 171000000, estimatedAnnualCost: 2052000000, date: '2026-02-08', remarks: 'Large distribution hub' },
    { id: 9, calcNumber: 'EC-2026-009', branch: 'Korea', branchKey: 'korea', siteLocation: 'Incheon R&D Lab', voltage: '380V', current: '150A', powerConsumption: '57kW', monthlyUsage: '41,040 kWh', monthlyCost: 4924800, estimatedAnnualCost: 59097600, date: '2026-02-07', remarks: 'Lab equipment + HVAC' },
    { id: 10, calcNumber: 'EC-2026-010', branch: 'Thailand', branchKey: 'thailand', siteLocation: 'Pattaya Branch Office', voltage: '220V', current: '63A', powerConsumption: '13.8kW', monthlyUsage: '9,936 kWh', monthlyCost: 39744, estimatedAnnualCost: 476928, date: '2026-02-06', remarks: 'Small branch' },
  ]);

  const [newItem, setNewItem] = useState({ branch: 'korea', siteLocation: '', voltage: '', current: '', powerConsumption: '', monthlyUsage: '', monthlyCost: 0, remarks: '' });

  const formatCurrency = (v: number, branch: string) => {
    const symbols: Record<string, string> = { korea: '₩', brunei: 'B$', thailand: '฿', vietnam: '₫' };
    return (symbols[branch] || '₩') + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);
  };

  const filtered = items.filter(o => {
    const matchSearch = o.calcNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.siteLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBranch = branchFilter === 'all' || o.branchKey === branchFilter;
    return matchSearch && matchBranch;
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
      calcNumber: `EC-2026-${String(newId).padStart(3, '0')}`,
      branch: branches.find(b => b.key === newItem.branch)?.name || '',
      branchKey: newItem.branch,
      siteLocation: newItem.siteLocation,
      voltage: newItem.voltage,
      current: newItem.current,
      powerConsumption: newItem.powerConsumption,
      monthlyUsage: newItem.monthlyUsage,
      monthlyCost: newItem.monthlyCost,
      estimatedAnnualCost: newItem.monthlyCost * 12,
      date: '2026-02-15',
      remarks: newItem.remarks,
    }]);
    setIsAddModalOpen(false);
    setNewItem({ branch: 'korea', siteLocation: '', voltage: '', current: '', powerConsumption: '', monthlyUsage: '', monthlyCost: 0, remarks: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/international-market/dashboard')} className="text-yellow-600 hover:text-yellow-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">{t.electricityCostCalc}</h1>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={t.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
            </div>
            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500">
              <option value="all">{t.allBranches}</option>
              {branches.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
            </select>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
              <Plus className="w-4 h-4" />{t.addNew}
            </button>
          </div>
        </div>

        {/* Summary Cards per Branch */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {branches.map(branch => {
            const branchItems = items.filter(i => i.branchKey === branch.key);
            const totalMonthly = branchItems.reduce((sum, i) => sum + i.monthlyCost, 0);
            return (
              <div key={branch.key} className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600">{branch.name}</p>
                <p className="text-lg font-bold text-yellow-700">{formatCurrency(totalMonthly, branch.key)}<span className="text-xs text-gray-500 ml-1">/{locale === 'ko' ? '월' : 'mo'}</span></p>
                <p className="text-xs text-gray-400">{branchItems.length} {locale === 'ko' ? '개 사이트' : 'sites'}</p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.calcNumber}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.branchName}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.siteLocation}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.voltage}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.powerConsumption}</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.monthlyCost}</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.estimatedAnnualCost}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.edit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-yellow-600">{item.calcNumber}</td>
                    <td className="px-4 py-3 text-sm">{branches.find(b => b.key === item.branchKey)?.name || item.branch}</td>
                    <td className="px-4 py-3 text-sm">{item.siteLocation}</td>
                    <td className="px-4 py-3 text-sm text-center">{item.voltage}</td>
                    <td className="px-4 py-3 text-sm text-center">{item.powerConsumption}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.monthlyCost, item.branchKey)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.estimatedAnnualCost, item.branchKey)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedItem(item)} className="text-yellow-500 hover:text-yellow-700"><Eye className="w-4 h-4" /></button>
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
                <div><p className="text-xs text-gray-500">{t.calcNumber}</p><p className="font-medium">{selectedItem.calcNumber}</p></div>
                <div><p className="text-xs text-gray-500">{t.branchName}</p><p className="font-medium">{branches.find(b => b.key === selectedItem.branchKey)?.name || selectedItem.branch}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">{t.siteLocation}</p><p className="font-medium">{selectedItem.siteLocation}</p></div>
                <div><p className="text-xs text-gray-500">{t.voltage}</p><p className="font-medium">{selectedItem.voltage}</p></div>
                <div><p className="text-xs text-gray-500">{t.current}</p><p className="font-medium">{selectedItem.current}</p></div>
                <div><p className="text-xs text-gray-500">{t.powerConsumption}</p><p className="font-medium">{selectedItem.powerConsumption}</p></div>
                <div><p className="text-xs text-gray-500">{t.monthlyUsage}</p><p className="font-medium">{selectedItem.monthlyUsage}</p></div>
                <div><p className="text-xs text-gray-500">{t.monthlyCost}</p><p className="font-medium text-yellow-700">{formatCurrency(selectedItem.monthlyCost, selectedItem.branchKey)}</p></div>
                <div><p className="text-xs text-gray-500">{t.estimatedAnnualCost}</p><p className="font-medium text-red-600">{formatCurrency(selectedItem.estimatedAnnualCost, selectedItem.branchKey)}</p></div>
              </div>
              <div><p className="text-xs text-gray-500">{t.remarks}</p><p className="font-medium">{selectedItem.remarks}</p></div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"><Printer className="w-4 h-4" />{t.printDocument}</button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"><FileDown className="w-4 h-4" />{t.exportPDF}</button>
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
              <h2 className="text-lg font-bold">{t.addNew} - {t.electricityCostCalc}</h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.voltage}</label>
                  <input type="text" value={newItem.voltage} onChange={e => setNewItem({ ...newItem, voltage: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="e.g. 380V" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.current}</label>
                  <input type="text" value={newItem.current} onChange={e => setNewItem({ ...newItem, current: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="e.g. 200A" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.powerConsumption}</label>
                  <input type="text" value={newItem.powerConsumption} onChange={e => setNewItem({ ...newItem, powerConsumption: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="e.g. 76kW" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.monthlyCost}</label>
                  <input type="number" value={newItem.monthlyCost} onChange={e => setNewItem({ ...newItem, monthlyCost: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.remarks}</label>
                <textarea value={newItem.remarks} onChange={e => setNewItem({ ...newItem, remarks: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">{t.cancel}</button>
                <button onClick={handleCreate} className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
