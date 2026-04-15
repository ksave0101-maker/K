'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

interface TaxInvoice {
  id: number;
  taxInvoiceNumber: string;
  customer: string;
  businessNumber: string;
  issueDate: string;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
  items: { name: string; quantity: number; unit: string; unitPrice: number }[];
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'overdue';
  type: 'sales' | 'purchase';
  invoiceNumber?: string;
}

export default function RevenueReportsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const formatCurrency = (v: number) => '₩' + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);

  // Tax Invoices Data (from hr/tax-invoices - sales type only)
  const [taxInvoices] = useState<TaxInvoice[]>([
    { id: 1, taxInvoiceNumber: 'TAX-2026-001', customer: 'Brunei Energy Corp', businessNumber: '123-45-67890', issueDate: '2026-02-15', supplyAmount: 70000000, taxAmount: 7000000, totalAmount: 77000000, items: [{ name: 'Solar Inverter SI-5000', quantity: 20, unit: 'pcs', unitPrice: 3500000 }], paymentStatus: 'paid', type: 'sales', invoiceNumber: 'INV-2026-001' },
    { id: 2, taxInvoiceNumber: 'TAX-2026-002', customer: 'Samsung Electronics', businessNumber: '234-56-78901', issueDate: '2026-02-14', supplyAmount: 28900000, taxAmount: 2890000, totalAmount: 31790000, items: [{ name: 'LED Module A100', quantity: 500, unit: 'pcs', unitPrice: 45000 }], paymentStatus: 'paid', type: 'purchase' },
    { id: 3, taxInvoiceNumber: 'TAX-2026-003', customer: 'Thailand Power Solutions', businessNumber: '345-67-89012', issueDate: '2026-02-13', supplyAmount: 85000000, taxAmount: 8500000, totalAmount: 93500000, items: [{ name: 'Energy Saver Module ESM-200', quantity: 100, unit: 'pcs', unitPrice: 850000 }], paymentStatus: 'partial', type: 'sales', invoiceNumber: 'INV-2026-002' },
    { id: 4, taxInvoiceNumber: 'TAX-2026-004', customer: 'LG Chem', businessNumber: '456-78-90123', issueDate: '2026-02-12', supplyAmount: 15000000, taxAmount: 1500000, totalAmount: 16500000, items: [{ name: 'Battery Cell 3.7V', quantity: 1000, unit: 'pcs', unitPrice: 15000 }], paymentStatus: 'unpaid', type: 'purchase' },
    { id: 5, taxInvoiceNumber: 'TAX-2026-005', customer: 'Seoul Metro', businessNumber: '567-89-01234', issueDate: '2026-02-11', supplyAmount: 126000000, taxAmount: 12600000, totalAmount: 138600000, items: [{ name: 'Power Distribution Unit PDU-1000', quantity: 30, unit: 'pcs', unitPrice: 4200000 }], paymentStatus: 'paid', type: 'sales', invoiceNumber: 'INV-2026-004' },
    { id: 6, taxInvoiceNumber: 'TAX-2026-006', customer: 'SK Hynix', businessNumber: '678-90-12345', issueDate: '2026-02-10', supplyAmount: 8400000, taxAmount: 840000, totalAmount: 9240000, items: [{ name: 'Memory Chip 8GB', quantity: 300, unit: 'pcs', unitPrice: 28000 }], paymentStatus: 'overdue', type: 'purchase' },
    { id: 7, taxInvoiceNumber: 'TAX-2026-007', customer: 'Vietnam Green Tech', businessNumber: '789-01-23456', issueDate: '2026-02-09', supplyAmount: 60000000, taxAmount: 6000000, totalAmount: 66000000, items: [{ name: 'LED Controller LC-300', quantity: 500, unit: 'pcs', unitPrice: 120000 }], paymentStatus: 'unpaid', type: 'sales', invoiceNumber: 'INV-2026-003' },
    { id: 8, taxInvoiceNumber: 'TAX-2026-008', customer: 'Hyundai Steel', businessNumber: '890-12-34567', issueDate: '2026-02-08', supplyAmount: 12750000, taxAmount: 1275000, totalAmount: 14025000, items: [{ name: 'Steel Frame LK-200', quantity: 150, unit: 'pcs', unitPrice: 85000 }], paymentStatus: 'paid', type: 'purchase' },
    { id: 9, taxInvoiceNumber: 'TAX-2026-009', customer: 'KT Telecom', businessNumber: '901-23-45678', issueDate: '2026-02-07', supplyAmount: 155000000, taxAmount: 15500000, totalAmount: 170500000, items: [{ name: 'UPS System UPS-3000', quantity: 25, unit: 'pcs', unitPrice: 6200000 }], paymentStatus: 'paid', type: 'sales', invoiceNumber: 'INV-2026-008' },
    { id: 10, taxInvoiceNumber: 'TAX-2026-010', customer: 'Hanwha Solutions', businessNumber: '012-34-56789', issueDate: '2026-02-06', supplyAmount: 36000000, taxAmount: 3600000, totalAmount: 39600000, items: [{ name: 'Solar Panel 350W', quantity: 200, unit: 'pcs', unitPrice: 180000 }], paymentStatus: 'partial', type: 'purchase' },
  ]);

  // Filter only sales invoices
  const salesInvoices = taxInvoices.filter(inv => inv.type === 'sales');

  // Group by date for daily view
  const dailyGroups = salesInvoices.reduce((acc, inv) => {
    const date = inv.issueDate;
    if (!acc[date]) {
      acc[date] = { sales: 0, returns: 0 };
    }
    acc[date].sales += inv.totalAmount;
    return acc;
  }, {} as Record<string, { sales: number; returns: number }>);

  const dailyData = Object.entries(dailyGroups)
    .map(([date, data]) => ({
      date,
      sales: data.sales,
      returns: data.returns,
      net: data.sales - data.returns,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Group by month for monthly view
  const monthlyGroups = salesInvoices.reduce((acc, inv) => {
    const date = new Date(inv.issueDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthKey]) {
      acc[monthKey] = { sales: 0, returns: 0, year: date.getFullYear(), month: date.getMonth() + 1 };
    }
    acc[monthKey].sales += inv.totalAmount;
    return acc;
  }, {} as Record<string, { sales: number; returns: number; year: number; month: number }>);

  const monthlyData = Object.entries(monthlyGroups)
    .map(([key, data]) => ({
      month: locale === 'ko' ? `${data.year}년 ${data.month}월` : new Date(data.year, data.month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      sales: data.sales,
      returns: data.returns,
      net: data.sales - data.returns,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));

  // Group by year for yearly view
  const yearlyGroups = salesInvoices.reduce((acc, inv) => {
    const year = new Date(inv.issueDate).getFullYear().toString();
    if (!acc[year]) {
      acc[year] = { sales: 0, returns: 0 };
    }
    acc[year].sales += inv.totalAmount;
    return acc;
  }, {} as Record<string, { sales: number; returns: number }>);

  const yearlyData = Object.entries(yearlyGroups)
    .map(([year, data]) => ({
      year,
      sales: data.sales,
      returns: data.returns,
      net: data.sales - data.returns,
    }))
    .sort((a, b) => b.year.localeCompare(a.year));

  const currentData = viewMode === 'daily' ? dailyData : viewMode === 'monthly' ? monthlyData : yearlyData;
  const totalSales = currentData.reduce((sum, d) => sum + d.sales, 0);
  const totalReturns = currentData.reduce((sum, d) => sum + d.returns, 0);
  const totalNet = currentData.reduce((sum, d) => sum + d.net, 0);
  const maxSales = Math.max(...currentData.map(d => d.sales));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/hr/dashboard')} className="text-emerald-600 hover:text-emerald-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{t.revenueReports}</h1>
                  <p className="text-sm text-gray-600">{t.revenueReportsDesc}</p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '총 판매액' : 'Total Sales'}</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSales)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '총 반품/환불' : 'Total Returns/Refunds'}</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalReturns)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '순 매출' : 'Net Revenue'}</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalNet)}</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{locale === 'ko' ? '보기 모드:' : 'View Mode:'}</span>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button onClick={() => setViewMode('daily')} className={`px-4 py-2 text-sm font-medium ${viewMode === 'daily' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{t.daily}</button>
            <button onClick={() => setViewMode('monthly')} className={`px-4 py-2 text-sm font-medium border-x border-gray-300 ${viewMode === 'monthly' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{t.monthly}</button>
            <button onClick={() => setViewMode('yearly')} className={`px-4 py-2 text-sm font-medium ${viewMode === 'yearly' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>{t.yearly}</button>
          </div>
        </div>

        {/* Chart-like visualization */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            {locale === 'ko' ? '매출 추이' : 'Revenue Trend'}
          </h3>
          <div className="space-y-3">
            {currentData.map((d, i) => {
              const label = 'date' in d ? d.date : 'month' in d ? (d as any).month : (d as any).year;
              const barWidth = (d.sales / maxSales) * 100;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-28 text-sm text-gray-600 font-medium shrink-0">{label}</div>
                  <div className="flex-1 relative">
                    <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg transition-all duration-500" style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>
                  <div className="w-36 text-right text-sm font-semibold text-gray-700 shrink-0">{formatCurrency(d.sales)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 px-6 py-4">
            <h2 className="text-white font-bold text-lg">
              {viewMode === 'daily' ? (locale === 'ko' ? '일별 매출 상세' : 'Daily Revenue Details')
                : viewMode === 'monthly' ? (locale === 'ko' ? '월별 매출 상세' : 'Monthly Revenue Details')
                : (locale === 'ko' ? '연도별 매출 상세' : 'Yearly Revenue Details')}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">No.</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    {viewMode === 'daily' ? t.date : viewMode === 'monthly' ? (locale === 'ko' ? '월' : 'Month') : (locale === 'ko' ? '연도' : 'Year')}
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '판매액' : 'Sales'}</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '반품/환불' : 'Returns'}</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '순 매출' : 'Net Revenue'}</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '이익률' : 'Margin'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData.map((d, i) => {
                  const label = 'date' in d ? d.date : 'month' in d ? (d as any).month : (d as any).year;
                  const margin = ((d.net / d.sales) * 100).toFixed(1);
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{i + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{label}</td>
                      <td className="px-6 py-4 text-sm text-emerald-600 text-right font-medium">{formatCurrency(d.sales)}</td>
                      <td className="px-6 py-4 text-sm text-red-600 text-right">{formatCurrency(d.returns)}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 text-right font-semibold">{formatCurrency(d.net)}</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{margin}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-6 py-4 text-sm" colSpan={2}>{locale === 'ko' ? '합계' : 'Total'}</td>
                  <td className="px-6 py-4 text-sm text-emerald-600 text-right">{formatCurrency(totalSales)}</td>
                  <td className="px-6 py-4 text-sm text-red-600 text-right">{formatCurrency(totalReturns)}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 text-right">{formatCurrency(totalNet)}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{((totalNet / totalSales) * 100).toFixed(1)}%</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
