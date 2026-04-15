'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, CreditCard, Plus, Search, Eye, Trash2, X } from 'lucide-react';

interface Bill {
  id: number;
  billNumber: string;
  vendor: string;
  category: string;
  issueDate: string;
  dueDate: string;
  description: string;
  amount: number;
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'overdue';
  source?: 'bill' | 'purchase-order'; // Track the source
  paidBy?: string; // Payment recipient
}

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
}

export default function BillsListPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories = [
    { value: 'utilities', label: t.utilities },
    { value: 'salary', label: t.salary },
    { value: 'materials', label: t.materials },
    { value: 'transportation', label: t.transportation },
    { value: 'maintenance', label: t.maintenance },
    { value: 'office', label: t.office },
    { value: 'marketing', label: t.marketing },
    { value: 'purchase-order', label: locale === 'ko' ? '발주서' : 'Purchase Orders' },
    { value: 'other', label: t.other },
  ];

  // Purchase Orders Data (from hr/purchase-orders)
  const [purchaseOrders] = useState<PurchaseOrder[]>([
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

  const [bills, setBills] = useState<Bill[]>([
    { id: 1, billNumber: 'BILL-2026-001', vendor: 'Korea Electric Power Corp', category: 'utilities', issueDate: '2026-02-15', dueDate: '2026-03-05', description: locale === 'ko' ? '2월 전기요금' : 'February electricity bill', amount: 4500000, paymentStatus: 'unpaid', source: 'bill', paidBy: 'Korea Electric Power Corp' },
    { id: 2, billNumber: 'BILL-2026-002', vendor: 'Seoul Gas Corp', category: 'utilities', issueDate: '2026-02-15', dueDate: '2026-03-05', description: locale === 'ko' ? '2월 가스요금' : 'February gas bill', amount: 1800000, paymentStatus: 'unpaid', source: 'bill', paidBy: 'Seoul Gas Corp' },
    { id: 3, billNumber: 'BILL-2026-003', vendor: 'KT Telecom', category: 'utilities', issueDate: '2026-02-14', dueDate: '2026-03-04', description: locale === 'ko' ? '인터넷 및 전화 요금' : 'Internet and phone bill', amount: 850000, paymentStatus: 'paid', source: 'bill', paidBy: 'KT Telecom' },
    { id: 4, billNumber: 'BILL-2026-004', vendor: locale === 'ko' ? '직원 급여' : 'Employee Payroll', category: 'salary', issueDate: '2026-02-10', dueDate: '2026-02-25', description: locale === 'ko' ? '2월 급여 지급' : 'February salary payment', amount: 45000000, paymentStatus: 'paid', source: 'bill', paidBy: locale === 'ko' ? '전체 직원' : 'All Employees' },
    { id: 5, billNumber: 'BILL-2026-005', vendor: 'Samsung Electronics', category: 'materials', issueDate: '2026-02-12', dueDate: '2026-03-12', description: locale === 'ko' ? 'LED 모듈 자재비' : 'LED module material cost', amount: 28900000, paymentStatus: 'partial', source: 'bill', paidBy: 'Samsung Electronics' },
    { id: 6, billNumber: 'BILL-2026-006', vendor: 'Hyundai Logistics', category: 'transportation', issueDate: '2026-02-11', dueDate: '2026-03-11', description: locale === 'ko' ? '화물 운송비' : 'Freight transportation cost', amount: 5200000, paymentStatus: 'unpaid', source: 'bill', paidBy: 'Hyundai Logistics' },
    { id: 7, billNumber: 'BILL-2026-007', vendor: locale === 'ko' ? '건물 관리사' : 'Building Manager', category: 'maintenance', issueDate: '2026-02-10', dueDate: '2026-02-28', description: locale === 'ko' ? '공장 시설 유지보수' : 'Factory facility maintenance', amount: 3200000, paymentStatus: 'overdue', source: 'bill', paidBy: locale === 'ko' ? '건물 관리사' : 'Building Manager' },
    { id: 8, billNumber: 'BILL-2026-008', vendor: 'Alpha Office Supply', category: 'office', issueDate: '2026-02-09', dueDate: '2026-02-28', description: locale === 'ko' ? '사무용품 구매' : 'Office supplies purchase', amount: 750000, paymentStatus: 'paid', source: 'bill', paidBy: 'Alpha Office Supply' },
    { id: 9, billNumber: 'BILL-2026-009', vendor: 'Naver Marketing', category: 'marketing', issueDate: '2026-02-08', dueDate: '2026-03-08', description: locale === 'ko' ? '온라인 광고비' : 'Online advertising cost', amount: 8500000, paymentStatus: 'unpaid', source: 'bill', paidBy: 'Naver Marketing' },
    { id: 10, billNumber: 'BILL-2026-010', vendor: locale === 'ko' ? '세무법인 한솔' : 'Hansol Tax Corp', category: 'other', issueDate: '2026-02-07', dueDate: '2026-02-28', description: locale === 'ko' ? '세무 자문비' : 'Tax advisory fee', amount: 2000000, paymentStatus: 'paid', source: 'bill', paidBy: locale === 'ko' ? '세무법인 한솔' : 'Hansol Tax Corp' },
    { id: 11, billNumber: 'BILL-2026-011', vendor: 'LG Chem', category: 'materials', issueDate: '2026-02-06', dueDate: '2026-03-06', description: locale === 'ko' ? '배터리 셀 납품대금' : 'Battery cell delivery payment', amount: 15000000, paymentStatus: 'partial', source: 'bill', paidBy: 'LG Chem' },
    { id: 12, billNumber: 'BILL-2026-012', vendor: locale === 'ko' ? '국민건강보험' : 'National Health Insurance', category: 'salary', issueDate: '2026-02-05', dueDate: '2026-02-28', description: locale === 'ko' ? '직원 건강보험료' : 'Employee health insurance premium', amount: 6800000, paymentStatus: 'paid', source: 'bill', paidBy: locale === 'ko' ? '국민건강보험공단' : 'National Health Insurance Service' },
  ]);

  // Convert purchase orders to bills format and combine
  const purchaseOrderBills: Bill[] = purchaseOrders.map(po => ({
    id: po.id + 1000, // Offset ID to avoid conflicts
    billNumber: po.poNumber,
    vendor: po.supplier,
    category: 'purchase-order',
    issueDate: po.date,
    dueDate: po.dueDate,
    description: po.items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', '),
    amount: po.totalAmount,
    paymentStatus: po.paymentStatus,
    source: 'purchase-order',
    paidBy: po.supplier,
  }));

  // Combine bills and purchase orders
  const allBills = [...bills, ...purchaseOrderBills];

  const [newBill, setNewBill] = useState({
    vendor: '', category: 'utilities', issueDate: '2026-02-15', dueDate: '', description: '', amount: 0, paidBy: '',
  });

  const formatCurrency = (v: number) => '₩' + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);

  const paymentBadge = (s: string) => {
    const map: Record<string, string> = { paid: 'bg-green-100 text-green-700', unpaid: 'bg-red-100 text-red-700', partial: 'bg-orange-100 text-orange-700', overdue: 'bg-red-200 text-red-800' };
    const label: Record<string, string> = { paid: t.paid, unpaid: t.unpaid, partial: t.partial, overdue: t.overdue };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const categoryLabel = (cat: string) => {
    const found = categories.find(c => c.value === cat);
    return found ? found.label : cat;
  };

  // Filter for displaying in table (paid bills only, with search/category filters)
  const filtered = allBills.filter(b => {
    const matchSearch = b.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) || b.vendor.toLowerCase().includes(searchTerm.toLowerCase()) || b.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
    const matchCategory = categoryFilter === 'all' || b.category === categoryFilter;
    const isPaid = b.paymentStatus === 'paid'; // Only show paid bills
    return matchSearch && matchStatus && matchCategory && isPaid;
  });

  // All paid bills for expense calculations (regardless of search/filter)
  const paidBills = allBills.filter(b => b.paymentStatus === 'paid');

  const totalUnpaid = allBills.filter(b => b.paymentStatus === 'unpaid' || b.paymentStatus === 'overdue').reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = allBills.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.amount, 0);

  // Calculate daily, monthly, yearly expenses (from all paid bills)
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayStr = today.toISOString().split('T')[0];

  const dailyExpenses = paidBills
    .filter(b => b.issueDate === todayStr)
    .reduce((sum, b) => sum + b.amount, 0);

  const monthlyExpenses = paidBills
    .filter(b => {
      const billDate = new Date(b.issueDate);
      return billDate.getFullYear() === currentYear && billDate.getMonth() === currentMonth;
    })
    .reduce((sum, b) => sum + b.amount, 0);

  const yearlyExpenses = paidBills
    .filter(b => {
      const billDate = new Date(b.issueDate);
      return billDate.getFullYear() === currentYear;
    })
    .reduce((sum, b) => sum + b.amount, 0);

  const handleDelete = (id: number, source?: 'bill' | 'purchase-order') => {
    if (source === 'purchase-order') {
      alert(locale === 'ko' ? '발주서는 구매 주문 페이지에서만 삭제할 수 있습니다.' : 'Purchase orders can only be deleted from the Purchase Orders page.');
      return;
    }
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setBills(bills.filter(b => b.id !== id));
    }
  };

  const handleCreate = () => {
    const newId = Math.max(...bills.map(b => b.id)) + 1;
    setBills([...bills, {
      id: newId,
      billNumber: `BILL-2026-${String(newId).padStart(3, '0')}`,
      vendor: newBill.vendor,
      category: newBill.category,
      issueDate: newBill.issueDate,
      dueDate: newBill.dueDate,
      description: newBill.description,
      amount: newBill.amount,
      paymentStatus: 'unpaid',
      source: 'bill',
      paidBy: newBill.paidBy,
    }]);
    setIsAddModalOpen(false);
    setNewBill({ vendor: '', category: 'utilities', issueDate: '2026-02-15', dueDate: '', description: '', amount: 0, paidBy: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/hr/dashboard')} className="text-purple-600 hover:text-purple-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{t.billsList}</h1>
                  <p className="text-sm text-gray-600">{t.billsListDesc}</p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Expense Analysis by Period */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {locale === 'ko' ? '기간별 비용 분석 (ชำระแล้ว)' : 'Expense Analysis by Period (Paid)'}
          </h2>
          <p className="text-sm opacity-90 mb-3">{locale === 'ko' ? '※ ชำระเงินแล้วแต่ระบบค่าใช้จ่ายเท่านั้น' : '※ Only paid bills are calculated'}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-sm opacity-90 mb-1">{locale === 'ko' ? '오늘 비용' : 'Today\'s Paid Expenses'}</p>
              <p className="text-3xl font-bold">{formatCurrency(dailyExpenses)}</p>
              <p className="text-xs opacity-75 mt-1">{today.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-sm opacity-90 mb-1">{locale === 'ko' ? '이번 달 비용' : 'This Month\'s Paid Expenses'}</p>
              <p className="text-3xl font-bold">{formatCurrency(monthlyExpenses)}</p>
              <p className="text-xs opacity-75 mt-1">{today.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long' })}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-sm opacity-90 mb-1">{locale === 'ko' ? '올해 비용' : 'This Year\'s Paid Expenses'}</p>
              <p className="text-3xl font-bold">{formatCurrency(yearlyExpenses)}</p>
              <p className="text-xs opacity-75 mt-1">{currentYear}{locale === 'ko' ? '년' : ''}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={locale === 'ko' ? '빌 번호, 업체 또는 설명 검색...' : 'Search bill number, vendor or description...'} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4">
            <h2 className="text-white font-bold text-lg">{t.billsList} ({filtered.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">No.</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.billNumber}</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '업체' : 'Vendor'}</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.category}</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.description}</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.duePaymentDate}</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.amount}</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.paymentStatus}</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((bill, idx) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-4 text-sm font-medium text-purple-600">{bill.billNumber}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{bill.vendor}</td>
                    <td className="px-4 py-4 text-center"><span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{categoryLabel(bill.category)}</span></td>
                    <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">{bill.description}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{bill.dueDate}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(bill.amount)}</td>
                    <td className="px-4 py-4 text-center">{paymentBadge(bill.paymentStatus)}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedBill(bill)} className="text-purple-500 hover:text-purple-700"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(bill.id, bill.source)} className="text-red-500 hover:text-red-700" title={bill.source === 'purchase-order' ? (locale === 'ko' ? '발주서는 삭제할 수 없습니다' : 'Cannot delete purchase order') : ''}><Trash2 className="w-4 h-4" /></button>
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
      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">{selectedBill.billNumber}</h3>
              <button onClick={() => setSelectedBill(null)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">{locale === 'ko' ? '업체' : 'Vendor'}</p><p className="font-medium">{selectedBill.vendor}</p></div>
                <div><p className="text-xs text-gray-500">{t.category}</p><p className="font-medium">{categoryLabel(selectedBill.category)}</p></div>
                <div><p className="text-xs text-gray-500">{t.issueDate}</p><p className="font-medium">{selectedBill.issueDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.duePaymentDate}</p><p className="font-medium">{selectedBill.dueDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.paymentStatus}</p>{paymentBadge(selectedBill.paymentStatus)}</div>
                <div><p className="text-xs text-gray-500">{t.amount}</p><p className="font-bold text-lg">{formatCurrency(selectedBill.amount)}</p></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{t.description}</p>
                <p className="text-sm">{selectedBill.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">{t.addNew} {t.billsList}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '업체' : 'Vendor'}</label><input value={newBill.vendor} onChange={e => setNewBill({ ...newBill, vendor: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
                <select value={newBill.category} onChange={e => setNewBill({ ...newBill, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500">
                  {categories.filter(c => c.value !== 'purchase-order').map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.issueDate}</label><input type="date" value={newBill.issueDate} onChange={e => setNewBill({ ...newBill, issueDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.duePaymentDate}</label><input type="date" value={newBill.dueDate} onChange={e => setNewBill({ ...newBill, dueDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label><textarea value={newBill.description} onChange={e => setNewBill({ ...newBill, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.amount}</label><input type="number" value={newBill.amount} onChange={e => setNewBill({ ...newBill, amount: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '수령인' : 'Paid By'}</label><input value={newBill.paidBy} onChange={e => setNewBill({ ...newBill, paidBy: e.target.value })} placeholder={locale === 'ko' ? '지급 수령인 입력' : 'Enter payment recipient'} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" /></div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t.cancel}</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
