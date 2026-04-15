'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, FileSignature, Plus, Eye, Trash2, X, Search as SearchIcon, Printer, FileDown } from 'lucide-react';

interface SalesContract {
  id: number;
  contractNumber: string;
  branch: string;
  branchKey: string;
  buyer: string;
  seller: string;
  productName: string;
  quantity: number;
  contractValue: number;
  contractDate: string;
  deliveryDate: string;
  status: 'active' | 'completed' | 'pending' | 'terminated';
  remarks: string;
}

export default function SalesContractsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<SalesContract | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const branches = [
    { key: 'korea', name: t.korea },
    { key: 'brunei', name: t.brunei },
    { key: 'thailand', name: t.thailand },
    { key: 'vietnam', name: t.vietnam },
  ];

  const [items, setItems] = useState<SalesContract[]>([
    { id: 1, contractNumber: 'SC-2026-001', branch: 'Korea', branchKey: 'korea', buyer: 'Seoul Metropolitan Government', seller: 'K Energy Save Co., Ltd', productName: 'Solar Panel System 500kW', quantity: 1, contractValue: 2500000000, contractDate: '2026-01-15', deliveryDate: '2026-06-30', status: 'active', remarks: 'Government green energy project phase 1' },
    { id: 2, contractNumber: 'SC-2026-002', branch: 'Brunei', branchKey: 'brunei', buyer: 'Brunei Energy Authority', seller: 'K Energy Brunei Branch', productName: 'Energy Save Unit A200 System', quantity: 100, contractValue: 350000, contractDate: '2026-01-20', deliveryDate: '2026-05-15', status: 'active', remarks: 'National energy efficiency program' },
    { id: 3, contractNumber: 'SC-2026-003', branch: 'Thailand', branchKey: 'thailand', buyer: 'Thai Solar Corp', seller: 'K Energy Thailand Branch', productName: 'Smart Inverter SI-3000', quantity: 200, contractValue: 42000000, contractDate: '2026-01-10', deliveryDate: '2026-04-30', status: 'active', remarks: 'Bulk supply agreement for solar farms' },
    { id: 4, contractNumber: 'SC-2026-004', branch: 'Vietnam', branchKey: 'vietnam', buyer: 'Vietnam Electric Corp (EVN)', seller: 'K Energy Vietnam Branch', productName: 'Transformer T-5000', quantity: 10, contractValue: 9500000000, contractDate: '2025-12-01', deliveryDate: '2026-03-31', status: 'active', remarks: 'Grid upgrade project in Hanoi' },
    { id: 5, contractNumber: 'SC-2026-005', branch: 'Korea', branchKey: 'korea', buyer: 'Samsung SDI', seller: 'K Energy Save Co., Ltd', productName: 'Battery Storage BS-500', quantity: 50, contractValue: 875000000, contractDate: '2025-11-15', deliveryDate: '2026-02-28', status: 'completed', remarks: 'R&D partnership supply' },
    { id: 6, contractNumber: 'SC-2026-006', branch: 'Brunei', branchKey: 'brunei', buyer: 'BSP Asset Management', seller: 'K Energy Brunei Branch', productName: 'LED Lighting Module LM-100', quantity: 500, contractValue: 45000, contractDate: '2025-10-20', deliveryDate: '2026-01-31', status: 'completed', remarks: 'Office renovation project' },
    { id: 7, contractNumber: 'SC-2026-007', branch: 'Thailand', branchKey: 'thailand', buyer: 'EGAT (Electricity Generating Authority)', seller: 'K Energy Thailand Branch', productName: 'Solar Controller SC-200', quantity: 300, contractValue: 16200000, contractDate: '2026-02-01', deliveryDate: '2026-07-31', status: 'pending', remarks: 'Awaiting final approval from EGAT board' },
    { id: 8, contractNumber: 'SC-2026-008', branch: 'Vietnam', branchKey: 'vietnam', buyer: 'Formosa Ha Tinh Steel', seller: 'K Energy Vietnam Branch', productName: 'Power Monitoring System PMS', quantity: 20, contractValue: 1800000000, contractDate: '2025-09-01', deliveryDate: '2025-12-31', status: 'terminated', remarks: 'Contract terminated due to scope changes' },
    { id: 9, contractNumber: 'SC-2026-009', branch: 'Korea', branchKey: 'korea', buyer: 'Hyundai E&C', seller: 'K Energy Save Co., Ltd', productName: 'EV Charger EC-300', quantity: 150, contractValue: 450000000, contractDate: '2026-02-10', deliveryDate: '2026-08-31', status: 'active', remarks: 'New apartment complex installation' },
    { id: 10, contractNumber: 'SC-2026-010', branch: 'Thailand', branchKey: 'thailand', buyer: 'PTT Public Company', seller: 'K Energy Thailand Branch', productName: 'Energy Audit Kit EAK-1', quantity: 50, contractValue: 3750000, contractDate: '2025-12-15', deliveryDate: '2026-02-15', status: 'completed', remarks: 'Annual energy audit equipment supply' },
  ]);

  const [newItem, setNewItem] = useState({ branch: 'korea', buyer: '', productName: '', quantity: 0, contractValue: 0, deliveryDate: '', remarks: '' });

  const formatCurrency = (v: number, branch: string) => {
    const symbols: Record<string, string> = { korea: '₩', brunei: 'B$', thailand: '฿', vietnam: '₫' };
    return (symbols[branch] || '₩') + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', pending: 'bg-yellow-100 text-yellow-700', terminated: 'bg-red-100 text-red-700' };
    const label: Record<string, string> = { active: t.active, completed: t.completed, pending: t.pending, terminated: t.terminated };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const filtered = items.filter(o => {
    const matchSearch = o.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.buyer.toLowerCase().includes(searchTerm.toLowerCase()) || o.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBranch = branchFilter === 'all' || o.branchKey === branchFilter;
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchBranch && matchStatus;
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
      contractNumber: `SC-2026-${String(newId).padStart(3, '0')}`,
      branch: branches.find(b => b.key === newItem.branch)?.name || '',
      branchKey: newItem.branch,
      buyer: newItem.buyer,
      seller: 'K Energy Save Co., Ltd',
      productName: newItem.productName,
      quantity: newItem.quantity,
      contractValue: newItem.contractValue,
      contractDate: '2026-02-15',
      deliveryDate: newItem.deliveryDate,
      status: 'pending',
      remarks: newItem.remarks,
    }]);
    setIsAddModalOpen(false);
    setNewItem({ branch: 'korea', buyer: '', productName: '', quantity: 0, contractValue: 0, deliveryDate: '', remarks: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/international-market/dashboard')} className="text-purple-600 hover:text-purple-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <FileSignature className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">{t.salesContracts}</h1>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{t.active}</p>
            <p className="text-2xl font-bold text-green-600">{items.filter(i => i.status === 'active').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{t.pending}</p>
            <p className="text-2xl font-bold text-yellow-600">{items.filter(i => i.status === 'pending').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{t.completed}</p>
            <p className="text-2xl font-bold text-blue-600">{items.filter(i => i.status === 'completed').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600">{t.terminated}</p>
            <p className="text-2xl font-bold text-red-600">{items.filter(i => i.status === 'terminated').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={t.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="all">{t.allBranches}</option>
              {branches.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="all">{t.contractStatus}</option>
              <option value="active">{t.active}</option>
              <option value="pending">{t.pending}</option>
              <option value="completed">{t.completed}</option>
              <option value="terminated">{t.terminated}</option>
            </select>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="w-4 h-4" />{t.addNew}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.contractNumber}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.branchName}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.buyer}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.productName}</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.contractValue}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.deliveryDate}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.contractStatus}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.edit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-purple-600">{item.contractNumber}</td>
                    <td className="px-4 py-3 text-sm">{branches.find(b => b.key === item.branchKey)?.name || item.branch}</td>
                    <td className="px-4 py-3 text-sm max-w-[150px] truncate">{item.buyer}</td>
                    <td className="px-4 py-3 text-sm max-w-[150px] truncate">{item.productName}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.contractValue, item.branchKey)}</td>
                    <td className="px-4 py-3 text-sm">{item.deliveryDate}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedItem(item)} className="text-purple-500 hover:text-purple-700"><Eye className="w-4 h-4" /></button>
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
                <div><p className="text-xs text-gray-500">{t.contractNumber}</p><p className="font-medium">{selectedItem.contractNumber}</p></div>
                <div><p className="text-xs text-gray-500">{t.branchName}</p><p className="font-medium">{branches.find(b => b.key === selectedItem.branchKey)?.name || selectedItem.branch}</p></div>
                <div><p className="text-xs text-gray-500">{t.buyer}</p><p className="font-medium">{selectedItem.buyer}</p></div>
                <div><p className="text-xs text-gray-500">{t.seller}</p><p className="font-medium">{selectedItem.seller}</p></div>
                <div><p className="text-xs text-gray-500">{t.productName}</p><p className="font-medium">{selectedItem.productName}</p></div>
                <div><p className="text-xs text-gray-500">{t.quantity}</p><p className="font-medium">{selectedItem.quantity.toLocaleString()}</p></div>
                <div><p className="text-xs text-gray-500">{t.contractValue}</p><p className="font-medium text-purple-700">{formatCurrency(selectedItem.contractValue, selectedItem.branchKey)}</p></div>
                <div><p className="text-xs text-gray-500">{t.contractDate}</p><p className="font-medium">{selectedItem.contractDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.deliveryDate}</p><p className="font-medium">{selectedItem.deliveryDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.contractStatus}</p>{statusBadge(selectedItem.status)}</div>
              </div>
              <div><p className="text-xs text-gray-500">{t.remarks}</p><p className="font-medium">{selectedItem.remarks}</p></div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"><Printer className="w-4 h-4" />{t.printDocument}</button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"><FileDown className="w-4 h-4" />{t.exportPDF}</button>
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
              <h2 className="text-lg font-bold">{t.addNew} - {t.salesContracts}</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.buyer}</label>
                <input type="text" value={newItem.buyer} onChange={e => setNewItem({ ...newItem, buyer: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.productName}</label>
                <input type="text" value={newItem.productName} onChange={e => setNewItem({ ...newItem, productName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.quantity}</label>
                  <input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.contractValue}</label>
                  <input type="number" value={newItem.contractValue} onChange={e => setNewItem({ ...newItem, contractValue: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.deliveryDate}</label>
                <input type="date" value={newItem.deliveryDate} onChange={e => setNewItem({ ...newItem, deliveryDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.remarks}</label>
                <textarea value={newItem.remarks} onChange={e => setNewItem({ ...newItem, remarks: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">{t.cancel}</button>
                <button onClick={handleCreate} className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
