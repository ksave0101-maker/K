'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, ShoppingCart, Plus, Search, Eye, Trash2, X, Upload, FileText } from 'lucide-react';

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplier: string;
  date: string;
  dueDate: string;
  items: { name: string; quantity: number; unit: string; unitPrice: number }[];
  totalAmount: number;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'overdue';
  receiptFile?: string;
  receiptFileName?: string;
}

interface Supplier {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptToView, setReceiptToView] = useState<{url: string, name: string} | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 1, name: 'Samsung Electronics', contact: 'Kim Min-soo', phone: '+82-2-2255-0114', email: 'contact@samsung.com', address: 'Seoul, South Korea' },
    { id: 2, name: 'LG Chem', contact: 'Park Ji-won', phone: '+82-2-3773-1114', email: 'info@lgchem.com', address: 'Seoul, South Korea' },
    { id: 3, name: 'SK Hynix', contact: 'Lee Sung-ho', phone: '+82-31-5185-0114', email: 'contact@skhynix.com', address: 'Icheon, South Korea' },
  ]);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', phone: '', email: '', address: '' });

  const [orders, setOrders] = useState<PurchaseOrder[]>([
    { id: 1, poNumber: 'PO-2026-001', supplier: 'Samsung Electronics', date: '2026-02-15', dueDate: '2026-03-15', items: [{ name: 'LED Module A100', quantity: 500, unit: 'pcs', unitPrice: 45000 }, { name: 'PCB Board X50', quantity: 200, unit: 'pcs', unitPrice: 32000 }], totalAmount: 28900000, status: 'approved', paymentStatus: 'paid' },
    { id: 2, poNumber: 'PO-2026-002', supplier: 'LG Chem', date: '2026-02-14', dueDate: '2026-03-14', items: [{ name: 'Battery Cell 3.7V', quantity: 1000, unit: 'pcs', unitPrice: 15000 }], totalAmount: 15000000, status: 'approved', paymentStatus: 'unpaid' },
    { id: 3, poNumber: 'PO-2026-003', supplier: 'SK Hynix', date: '2026-02-13', dueDate: '2026-03-13', items: [{ name: 'Memory Chip 8GB', quantity: 300, unit: 'pcs', unitPrice: 28000 }], totalAmount: 8400000, status: 'pending', paymentStatus: 'unpaid' },
    { id: 4, poNumber: 'PO-2026-004', supplier: 'Hyundai Steel', date: '2026-02-12', dueDate: '2026-03-12', items: [{ name: 'Steel Frame LK-200', quantity: 150, unit: 'pcs', unitPrice: 85000 }], totalAmount: 12750000, status: 'approved', paymentStatus: 'partial' },
    { id: 5, poNumber: 'PO-2026-005', supplier: 'POSCO', date: '2026-02-11', dueDate: '2026-03-11', items: [{ name: 'Aluminum Sheet 2mm', quantity: 100, unit: 'kg', unitPrice: 120000 }], totalAmount: 12000000, status: 'rejected', paymentStatus: 'unpaid' },
    { id: 6, poNumber: 'PO-2026-006', supplier: 'Doosan Corp', date: '2026-02-10', dueDate: '2026-03-10', items: [{ name: 'Motor Assembly EM-500', quantity: 50, unit: 'pcs', unitPrice: 250000 }], totalAmount: 12500000, status: 'approved', paymentStatus: 'overdue' },
    { id: 7, poNumber: 'PO-2026-007', supplier: 'Hanwha Solutions', date: '2026-02-09', dueDate: '2026-03-09', items: [{ name: 'Solar Panel 350W', quantity: 200, unit: 'pcs', unitPrice: 180000 }], totalAmount: 36000000, status: 'approved', paymentStatus: 'paid' },
    { id: 8, poNumber: 'PO-2026-008', supplier: 'Kumho Petrochemical', date: '2026-02-08', dueDate: '2026-03-08', items: [{ name: 'Rubber Gasket R-100', quantity: 2000, unit: 'pcs', unitPrice: 3500 }], totalAmount: 7000000, status: 'pending', paymentStatus: 'unpaid' },
    { id: 9, poNumber: 'PO-2026-009', supplier: 'Korea Electric Power', date: '2026-02-07', dueDate: '2026-03-07', items: [{ name: 'Transformer T-2000', quantity: 10, unit: 'pcs', unitPrice: 5500000 }], totalAmount: 55000000, status: 'approved', paymentStatus: 'partial' },
    { id: 10, poNumber: 'PO-2026-010', supplier: 'Lotte Chemical', date: '2026-02-06', dueDate: '2026-03-06', items: [{ name: 'Plastic Housing PH-50', quantity: 800, unit: 'pcs', unitPrice: 12000 }], totalAmount: 9600000, status: 'cancelled', paymentStatus: 'unpaid' },
  ]);

  const [newOrder, setNewOrder] = useState({
    supplier: '', date: '2026-02-15', dueDate: '', itemName: '', quantity: 0, unit: 'pcs', unitPrice: 0,
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const formatCurrency = (v: number) => '₩' + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-700' };
    const label: Record<string, string> = { approved: t.approved, pending: t.pending, rejected: t.rejected, cancelled: t.cancelled };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const paymentBadge = (s: string) => {
    const map: Record<string, string> = { paid: 'bg-green-100 text-green-700', unpaid: 'bg-red-100 text-red-700', partial: 'bg-orange-100 text-orange-700', overdue: 'bg-red-200 text-red-800' };
    const label: Record<string, string> = { paid: t.paid, unpaid: t.unpaid, partial: t.partial, overdue: t.overdue };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: number) => {
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleCreate = () => {
    const newId = Math.max(...orders.map(o => o.id)) + 1;
    const total = newOrder.quantity * newOrder.unitPrice;
    
    // Simulate file upload (in real app, would upload to server)
    const receiptFileUrl = receiptFile ? URL.createObjectURL(receiptFile) : undefined;
    const receiptFileName = receiptFile ? receiptFile.name : undefined;
    
    setOrders([...orders, {
      id: newId,
      poNumber: `PO-2026-${String(newId).padStart(3, '0')}`,
      supplier: newOrder.supplier,
      date: newOrder.date,
      dueDate: newOrder.dueDate,
      items: [{ name: newOrder.itemName, quantity: newOrder.quantity, unit: newOrder.unit, unitPrice: newOrder.unitPrice }],
      totalAmount: total,
      status: 'pending',
      paymentStatus: 'unpaid',
      receiptFile: receiptFileUrl,
      receiptFileName: receiptFileName,
    }]);
    setIsAddModalOpen(false);
    setNewOrder({ supplier: '', date: '2026-02-15', dueDate: '', itemName: '', quantity: 0, unit: 'pcs', unitPrice: 0 });
    setReceiptFile(null);
  };

  const handleAddSupplier = () => {
    const newId = Math.max(...suppliers.map(s => s.id)) + 1;
    setSuppliers([...suppliers, { id: newId, ...newSupplier }]);
    setIsSupplierModalOpen(false);
    setNewSupplier({ name: '', contact: '', phone: '', email: '', address: '' });
  };

  const handleDeleteSupplier = (id: number) => {
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/hr/dashboard')} className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{t.purchaseOrders}</h1>
                  <p className="text-sm text-gray-600">{t.purchaseOrdersDesc}</p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={locale === 'ko' ? 'PO번호 또는 공급업체 검색...' : 'Search PO number or supplier...'} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
            <option value="all">{locale === 'ko' ? '모든 상태' : 'All Status'}</option>
            <option value="approved">{t.approved}</option>
            <option value="pending">{t.pending}</option>
            <option value="rejected">{t.rejected}</option>
            <option value="cancelled">{t.cancelled}</option>
          </select>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />{t.addNew}
          </button>
          <button onClick={() => setIsSupplierModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />{locale === 'ko' ? 'Supplier' : 'Supplier'}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <h2 className="text-white font-bold text-lg">{t.purchaseOrders} ({filtered.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">No.</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.poNumber}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.supplier}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.date}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.duePaymentDate}</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.totalAmount}</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.status}</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.paymentStatus}</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((order, idx) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{order.poNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.supplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.dueDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4 text-center">{statusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-center">{paymentBadge(order.paymentStatus)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="text-blue-500 hover:text-blue-700"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(order.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">{selectedOrder.poNumber}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">{t.supplier}</p><p className="font-medium">{selectedOrder.supplier}</p></div>
                <div><p className="text-xs text-gray-500">{t.date}</p><p className="font-medium">{selectedOrder.date}</p></div>
                <div><p className="text-xs text-gray-500">{t.duePaymentDate}</p><p className="font-medium">{selectedOrder.dueDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.status}</p>{statusBadge(selectedOrder.status)}</div>
                <div><p className="text-xs text-gray-500">{t.paymentStatus}</p>{paymentBadge(selectedOrder.paymentStatus)}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{locale === 'ko' ? '주문 항목' : 'Order Items'}</h4>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">{locale === 'ko' ? '품목' : 'Item'}</th>
                      <th className="text-right px-3 py-2">{t.quantity}</th>
                      <th className="text-right px-3 py-2">{t.unitPrice}</th>
                      <th className="text-right px-3 py-2">{t.totalAmount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2 text-right">{item.quantity} {item.unit}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t pt-3 text-right">
                <p className="text-lg font-bold">{t.grandTotal}: {formatCurrency(selectedOrder.totalAmount)}</p>
              </div>
              
              {/* Receipt File Display */}
              {selectedOrder.receiptFileName && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{locale === 'ko' ? '첨부된 영수증' : 'Attached Receipt'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{selectedOrder.receiptFileName}</p>
                      </div>
                    </div>
                    {selectedOrder.receiptFile && (
                      <button
                        onClick={() => {
                          setReceiptToView({url: selectedOrder.receiptFile!, name: selectedOrder.receiptFileName!});
                          setIsReceiptModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {locale === 'ko' ? '보기' : 'View'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">{locale === 'ko' ? 'Supplier 관리' : 'Supplier Management'}</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {/* Add New Supplier Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-3">{locale === 'ko' ? '새 Supplier 추가' : 'Add New Supplier'}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '회사명' : 'Company Name'}</label><input value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder="Samsung Electronics" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '담당자' : 'Contact Person'}</label><input value={newSupplier.contact} onChange={e => setNewSupplier({ ...newSupplier, contact: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder="Kim Min-soo" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '전화번호' : 'Phone'}</label><input value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder="+82-2-1234-5678" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '이메일' : 'Email'}</label><input type="email" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder="contact@company.com" /></div>
                  <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '주소' : 'Address'}</label><input value={newSupplier.address} onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder="Seoul, South Korea" /></div>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={handleAddSupplier} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" />{locale === 'ko' ? '추가' : 'Add'}
                  </button>
                </div>
              </div>

              {/* Supplier List */}
              <div>
                <h4 className="font-semibold mb-3">{locale === 'ko' ? 'Supplier 목록' : 'Supplier List'} ({suppliers.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">No.</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '회사명' : 'Company'}</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '담당자' : 'Contact'}</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '전화번호' : 'Phone'}</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '이메일' : 'Email'}</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '작업' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((supplier, idx) => (
                        <tr key={supplier.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium">{supplier.name}</td>
                          <td className="px-4 py-3">{supplier.contact}</td>
                          <td className="px-4 py-3">{supplier.phone}</td>
                          <td className="px-4 py-3">{supplier.email}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => handleDeleteSupplier(supplier.id)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">{t.addNew} {t.purchaseOrders}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.supplier}</label>
                <select value={newOrder.supplier} onChange={e => setNewOrder({ ...newOrder, supplier: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <option value="">{locale === 'ko' ? '선택하세요' : 'Select Supplier'}</option>
                  {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.date}</label><input type="date" value={newOrder.date} onChange={e => setNewOrder({ ...newOrder, date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.duePaymentDate}</label><input type="date" value={newOrder.dueDate} onChange={e => setNewOrder({ ...newOrder, dueDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '품목명' : 'Item Name'}</label><input value={newOrder.itemName} onChange={e => setNewOrder({ ...newOrder, itemName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.quantity}</label><input type="number" value={newOrder.quantity} onChange={e => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '단위' : 'Unit'}</label>
                  <select value={newOrder.unit} onChange={e => setNewOrder({ ...newOrder, unit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    <option value="pcs">pcs</option><option value="kg">kg</option><option value="sets">sets</option><option value="boxes">boxes</option><option value="rolls">rolls</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.unitPrice}</label><input type="number" value={newOrder.unitPrice} onChange={e => setNewOrder({ ...newOrder, unitPrice: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              
              {/* Receipt Upload Section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {locale === 'ko' ? 'บิル/ใบเสร็จรับเงิน (สแกน)' : 'Receipt/Bill (Scan)'}
                  </div>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Upload className="w-5 h-5" />
                        <span className="text-sm">
                          {receiptFile ? receiptFile.name : (locale === 'ko' ? 'ไฟล์อัพโหลด (PDF, JPG, PNG)' : 'Upload File (PDF, JPG, PNG)')}
                        </span>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {receiptFile && (
                    <button 
                      onClick={() => setReceiptFile(null)} 
                      className="text-red-600 hover:text-red-800"
                      type="button"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {receiptFile && (
                  <div className="mt-2 text-xs text-gray-500">
                    {locale === 'ko' ? '크기' : 'Size'}: {(receiptFile.size / 1024).toFixed(2)} KB
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t.cancel}</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {isReceiptModalOpen && receiptToView && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setIsReceiptModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-bold">{locale === 'ko' ? '영수증 미리보기' : 'Receipt Preview'}</h3>
                  <p className="text-xs text-blue-100 mt-0.5">{receiptToView.name}</p>
                </div>
              </div>
              <button onClick={() => setIsReceiptModalOpen(false)} className="p-2 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(95vh - 80px)'}}>
              {receiptToView.name.toLowerCase().endsWith('.pdf') ? (
                <iframe src={receiptToView.url} className="w-full h-[75vh] border rounded-lg" title="Receipt PDF" />
              ) : (
                <img src={receiptToView.url} alt="Receipt" className="w-full h-auto rounded-lg shadow-lg" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
