'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, ClipboardCheck, Plus, Eye, Trash2, X, Search as SearchIcon, Printer, FileDown } from 'lucide-react';

interface SalesApproval {
  id: number;
  approvalNumber: string;
  branch: string;
  branchKey: string;
  productName: string;
  quantity: number;
  amount: number;
  requestedBy: string;
  approvedBy: string;
  approvalDate: string;
  status: 'approved' | 'pending' | 'rejected';
  remarks: string;
}

export default function SalesApprovalsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<SalesApproval | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const branches = [
    { key: 'korea', name: t.korea },
    { key: 'brunei', name: t.brunei },
    { key: 'thailand', name: t.thailand },
    { key: 'vietnam', name: t.vietnam },
  ];

  const [items, setItems] = useState<SalesApproval[]>([]);
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [showPoModal, setShowPoModal] = useState(false);
  const [loadingPO, setLoadingPO] = useState(false);

  useEffect(() => {
    fetch('/api/korea/int-approvals').then(r => r.json()).then(data => { if (Array.isArray(data)) setItems(data); });
  }, []);

  const [newItem, setNewItem] = useState({ branch: 'korea', productName: '', quantity: 0, amount: 0, requestedBy: '', remarks: '' });

  const formatCurrency = (v: number, branch: string) => {
    const symbols: Record<string, string> = { korea: '₩', brunei: 'B$', thailand: '฿', vietnam: '₫' };
    return (symbols[branch] || '₩') + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700' };
    const label: Record<string, string> = { approved: t.approved, pending: t.pending, rejected: t.rejected };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const filtered = items.filter(o => {
    const matchSearch = o.approvalNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.productName.toLowerCase().includes(searchTerm.toLowerCase()) || o.branch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBranch = branchFilter === 'all' || o.branchKey === branchFilter;
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchBranch && matchStatus;
  });

  const handleDelete = async (id: number) => {
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      await fetch(`/api/korea/int-approvals?id=${id}`, { method: 'DELETE' });
      setItems(items.filter(o => o.id !== id));
    }
  };

  const searchProductionOrders = async () => {
    setLoadingPO(true);
    try {
      const branchCodeMap: Record<string, string> = { korea: 'KR', brunei: 'BN', thailand: 'TH', vietnam: 'VN' };
      const branchCode = branchCodeMap[newItem.branch];
      const response = await fetch(`/api/korea/production-orders?branch=${encodeURIComponent(branches.find(b => b.key === newItem.branch)?.name || '')}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProductionOrders(data);
        setShowPoModal(true);
      }
    } catch (error) {
      console.error('Failed to load production orders:', error);
    } finally {
      setLoadingPO(false);
    }
  };

  const selectProductionOrder = (order: any) => {
    setNewItem({
      ...newItem,
      productName: order.product || '',
      quantity: order.quantity || 0,
      amount: 0,
      remarks: `PO: ${order.orderNumber || order.id} - Customer: ${order.customerName || '-'}`
    });
    setShowPoModal(false);
  };

  const handleCreate = async () => {
    const approvalNumber = `SA-2026-${String(Date.now()).slice(-3)}`;
    const branchName = branches.find(b => b.key === newItem.branch)?.name || newItem.branch;
    const res = await fetch('/api/korea/int-approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approvalNumber,
        branch: branchName,
        branchKey: newItem.branch,
        productName: newItem.productName,
        quantity: newItem.quantity,
        amount: newItem.amount,
        requestedBy: newItem.requestedBy,
        approvedBy: '-',
        approvalDate: new Date().toISOString().slice(0, 10),
        status: 'pending',
        remarks: newItem.remarks,
      }),
    });
    const json = await res.json();
    if (json.id) {
      setItems([{ id: json.id, approvalNumber, branch: branchName, branchKey: newItem.branch, productName: newItem.productName, quantity: newItem.quantity, amount: newItem.amount, requestedBy: newItem.requestedBy, approvedBy: '-', approvalDate: new Date().toISOString().slice(0, 10), status: 'pending', remarks: newItem.remarks }, ...items]);
    }
    setIsAddModalOpen(false);
    setNewItem({ branch: 'korea', productName: '', quantity: 0, amount: 0, requestedBy: '', remarks: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/international-market/dashboard')} className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">{t.salesApprovals}</h1>
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
              <input type="text" placeholder={t.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">{t.allBranches}</option>
              {branches.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">{t.filter}</option>
              <option value="approved">{t.approved}</option>
              <option value="pending">{t.pending}</option>
              <option value="rejected">{t.rejected}</option>
            </select>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />{t.addNew}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.approvalNumber}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.branchName}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.productName}</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.quantity}</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.amount}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.requestedBy}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.approvalDate}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.approved}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.edit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{item.approvalNumber}</td>
                    <td className="px-4 py-3 text-sm">{branches.find(b => b.key === item.branchKey)?.name || item.branch}</td>
                    <td className="px-4 py-3 text-sm">{item.productName}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.amount, item.branchKey)}</td>
                    <td className="px-4 py-3 text-sm">{item.requestedBy}</td>
                    <td className="px-4 py-3 text-sm">{item.approvalDate}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedItem(item)} className="text-blue-500 hover:text-blue-700"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">{t.noData}</td></tr>
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
                <div><p className="text-xs text-gray-500">{t.approvalNumber}</p><p className="font-medium">{selectedItem.approvalNumber}</p></div>
                <div><p className="text-xs text-gray-500">{t.branchName}</p><p className="font-medium">{branches.find(b => b.key === selectedItem.branchKey)?.name || selectedItem.branch}</p></div>
                <div><p className="text-xs text-gray-500">{t.productName}</p><p className="font-medium">{selectedItem.productName}</p></div>
                <div><p className="text-xs text-gray-500">{t.quantity}</p><p className="font-medium">{selectedItem.quantity.toLocaleString()}</p></div>
                <div><p className="text-xs text-gray-500">{t.amount}</p><p className="font-medium">{formatCurrency(selectedItem.amount, selectedItem.branchKey)}</p></div>
                <div><p className="text-xs text-gray-500">{t.approvalDate}</p><p className="font-medium">{selectedItem.approvalDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.requestedBy}</p><p className="font-medium">{selectedItem.requestedBy}</p></div>
                <div><p className="text-xs text-gray-500">{t.approvedBy}</p><p className="font-medium">{selectedItem.approvedBy}</p></div>
              </div>
              <div><p className="text-xs text-gray-500">{t.remarks}</p><p className="font-medium">{selectedItem.remarks}</p></div>
              <div className="flex justify-center">{statusBadge(selectedItem.status)}</div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"><Printer className="w-4 h-4" />{t.printDocument}</button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><FileDown className="w-4 h-4" />{t.exportPDF}</button>
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
              <h2 className="text-lg font-bold">{t.addNew} - {t.salesApprovals}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.branchName}</label>
                <select value={newItem.branch} onChange={e => setNewItem({ ...newItem, branch: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {branches.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
                </select>
              </div>

              {/* Production Order Search */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-blue-900">
                    {locale === 'ko' ? '생산 주문서에서 선택' : 'Select from Production Orders (PDO)'}
                  </label>
                  <button
                    onClick={searchProductionOrders}
                    disabled={loadingPO}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    <SearchIcon className="w-4 h-4" />
                    {loadingPO ? (locale === 'ko' ? '검색 중...' : 'Searching...') : (locale === 'ko' ? 'PDO 검색' : 'Search PDO')}
                  </button>
                </div>
                <p className="text-xs text-blue-700">
                  {locale === 'ko' ? '선택한 지점의 생산 주문을 검색하고 제품 정보를 자동으로 채웁니다' : 'Search production orders (PDO) for the selected branch and auto-fill product info'}
                </p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.amount}</label>
                  <input type="number" value={newItem.amount} onChange={e => setNewItem({ ...newItem, amount: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.requestedBy}</label>
                <input type="text" value={newItem.requestedBy} onChange={e => setNewItem({ ...newItem, requestedBy: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.remarks}</label>
                <textarea value={newItem.remarks} onChange={e => setNewItem({ ...newItem, remarks: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">{t.cancel}</button>
                <button onClick={handleCreate} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production Order Search Modal */}
      {showPoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-500 to-indigo-500">
              <h2 className="text-lg font-bold text-white">
                {locale === 'ko' ? '생산 주문 선택 (PDO)' : 'Select Production Order (PDO)'} - {branches.find(b => b.key === newItem.branch)?.name}
              </h2>
              <button onClick={() => setShowPoModal(false)} className="text-white hover:bg-white/20 rounded-full p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {productionOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">{locale === 'ko' ? '생산 주문이 없습니다' : 'No Production Orders'}</p>
                  <p className="text-sm mt-1">{locale === 'ko' ? '이 지점에 대한 생산 주문을 먼저 생성하십시오' : 'Create a production order for this branch first'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {productionOrders.map((order, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectProductionOrder(order)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-blue-600 text-lg">{order.orderNumber || order.id}</span>
                            {order.status && (
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                order.status === 'ready' ? 'bg-green-100 text-green-800' :
                                order.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-800">{order.product}</p>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>
                                <span className="font-medium">{locale === 'ko' ? '고객:' : 'Customer:'}</span> {order.customerName || '-'}
                              </span>
                              <span>
                                <span className="font-medium">{locale === 'ko' ? '수량:' : 'Qty:'}</span> {order.quantity?.toLocaleString() || 0}
                              </span>
                            </div>
                            {order.dueDate && (
                              <p className="text-xs text-gray-500">
                                <span className="font-medium">{locale === 'ko' ? '납기:' : 'Due:'}</span> {order.dueDate}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right pl-4">
                          <div className="text-2xl font-bold text-blue-600">{order.quantity?.toLocaleString() || 0}</div>
                          <div className="text-xs text-gray-500">{locale === 'ko' ? '단위' : 'units'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
