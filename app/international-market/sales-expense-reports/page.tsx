'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CountryFlag from '@/components/CountryFlag';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, DollarSign, Printer, FileDown, FileText, ChevronDown } from 'lucide-react';

interface BranchReport {
  branchKey: string;
  quarterly: {
    q1: { sales: number; expenses: number; profit: number };
    q2: { sales: number; expenses: number; profit: number };
    q3: { sales: number; expenses: number; profit: number };
    q4: { sales: number; expenses: number; profit: number };
  };
  monthly: { month: string; sales: number; expenses: number; profit: number }[];
}

export default function SalesExpenseReportsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [branchFilter, setBranchFilter] = useState('all');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'quarterly' | 'monthly'>('quarterly');
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  const branches = [
    { key: 'korea', name: t.korea, currency: '₩', country: 'KR' as const },
    { key: 'brunei', name: t.brunei, currency: 'B$', country: 'BN' as const },
    { key: 'thailand', name: t.thailand, currency: '฿', country: 'TH' as const },
    { key: 'vietnam', name: t.vietnam, currency: '₫', country: 'VN' as const },
  ];

  const selectedBranchOption = branches.find(b => b.key === branchFilter) || { key: 'all', name: t.allBranches, currency: '', country: null };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setShowBranchDropdown(false);
      }
    };

    if (showBranchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBranchDropdown]);

  const monthNames = locale === 'ko'
    ? ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const branchReports: Record<string, BranchReport> = {
    korea: {
      branchKey: 'korea',
      quarterly: {
        q1: { sales: 8500000000, expenses: 5200000000, profit: 3300000000 },
        q2: { sales: 9200000000, expenses: 5800000000, profit: 3400000000 },
        q3: { sales: 10100000000, expenses: 6100000000, profit: 4000000000 },
        q4: { sales: 11500000000, expenses: 6500000000, profit: 5000000000 },
      },
      monthly: monthNames.map((m, i) => ({
        month: m,
        sales: 2800000000 + Math.floor(Math.random() * 1200000000),
        expenses: 1700000000 + Math.floor(Math.random() * 600000000),
        profit: 0,
      })).map(d => ({ ...d, profit: d.sales - d.expenses })),
    },
    brunei: {
      branchKey: 'brunei',
      quarterly: {
        q1: { sales: 450000, expenses: 280000, profit: 170000 },
        q2: { sales: 520000, expenses: 310000, profit: 210000 },
        q3: { sales: 580000, expenses: 340000, profit: 240000 },
        q4: { sales: 620000, expenses: 360000, profit: 260000 },
      },
      monthly: monthNames.map((m, i) => ({
        month: m,
        sales: 140000 + Math.floor(Math.random() * 80000),
        expenses: 85000 + Math.floor(Math.random() * 40000),
        profit: 0,
      })).map(d => ({ ...d, profit: d.sales - d.expenses })),
    },
    thailand: {
      branchKey: 'thailand',
      quarterly: {
        q1: { sales: 42000000, expenses: 25000000, profit: 17000000 },
        q2: { sales: 48000000, expenses: 28000000, profit: 20000000 },
        q3: { sales: 53000000, expenses: 31000000, profit: 22000000 },
        q4: { sales: 58000000, expenses: 33000000, profit: 25000000 },
      },
      monthly: monthNames.map((m, i) => ({
        month: m,
        sales: 14000000 + Math.floor(Math.random() * 6000000),
        expenses: 8000000 + Math.floor(Math.random() * 3000000),
        profit: 0,
      })).map(d => ({ ...d, profit: d.sales - d.expenses })),
    },
    vietnam: {
      branchKey: 'vietnam',
      quarterly: {
        q1: { sales: 35000000000, expenses: 22000000000, profit: 13000000000 },
        q2: { sales: 40000000000, expenses: 25000000000, profit: 15000000000 },
        q3: { sales: 45000000000, expenses: 27000000000, profit: 18000000000 },
        q4: { sales: 50000000000, expenses: 29000000000, profit: 21000000000 },
      },
      monthly: monthNames.map((m, i) => ({
        month: m,
        sales: 12000000000 + Math.floor(Math.random() * 5000000000),
        expenses: 7000000000 + Math.floor(Math.random() * 3000000000),
        profit: 0,
      })).map(d => ({ ...d, profit: d.sales - d.expenses })),
    },
  };

  const formatCurrency = (v: number, branch: string) => {
    const symbols: Record<string, string> = { korea: '₩', brunei: 'B$', thailand: '฿', vietnam: '₫' };
    return (symbols[branch] || '₩') + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);
  };

  const formatCompact = (v: number, branch: string) => {
    const symbols: Record<string, string> = { korea: '₩', brunei: 'B$', thailand: '฿', vietnam: '₫' };
    const prefix = symbols[branch] || '₩';
    if (v >= 1000000000000) return prefix + (v / 1000000000000).toFixed(1) + 'T';
    if (v >= 1000000000) return prefix + (v / 1000000000).toFixed(1) + 'B';
    if (v >= 1000000) return prefix + (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return prefix + (v / 1000).toFixed(1) + 'K';
    return prefix + v.toString();
  };

  const visibleBranches = branchFilter === 'all' ? branches : branches.filter(b => b.key === branchFilter);

  const getGrowthRate = (report: BranchReport) => {
    const q1Total = report.quarterly.q1.sales;
    const q4Total = report.quarterly.q4.sales;
    return ((q4Total - q1Total) / q1Total * 100).toFixed(1);
  };

  const getMaxBarValue = (data: { sales: number; expenses: number }[]) => {
    return Math.max(...data.map(d => Math.max(d.sales, d.expenses)));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentBranch = branchFilter === 'all' ? null : branches.find(b => b.key === branchFilter);
    const reportBranches = branchFilter === 'all' ? branches : [currentBranch!];
    
    let contentHTML = '';
    
    reportBranches.forEach(branch => {
      const report = branchReports[branch.key];
      const totalSales = Object.values(report.quarterly).reduce((sum, q) => sum + q.sales, 0);
      const totalExpenses = Object.values(report.quarterly).reduce((sum, q) => sum + q.expenses, 0);
      const totalProfit = totalSales - totalExpenses;
      const profitMargin = ((totalProfit / totalSales) * 100).toFixed(1);

      contentHTML += `
        <div class="branch-section">
          <div class="branch-header">
            <div class="branch-info">
              ${branch.country ? `<img src="https://flagcdn.com/${branch.country.toLowerCase()}.svg" class="flag" alt="flag" />` : ''}
              <h2>${branch.name}</h2>
            </div>
            <div class="summary-stats">
              <div class="stat">
                <span class="label">${locale === 'ko' ? '총 매출' : 'Total Sales'}</span>
                <span class="value">${formatCurrency(totalSales, branch.key)}</span>
              </div>
              <div class="stat">
                <span class="label">${locale === 'ko' ? '총 비용' : 'Total Expenses'}</span>
                <span class="value">${formatCurrency(totalExpenses, branch.key)}</span>
              </div>
              <div class="stat">
                <span class="label">${locale === 'ko' ? '순이익' : 'Net Profit'}</span>
                <span class="value profit">${formatCurrency(totalProfit, branch.key)}</span>
              </div>
              <div class="stat">
                <span class="label">${locale === 'ko' ? '이익률' : 'Profit Margin'}</span>
                <span class="value">${profitMargin}%</span>
              </div>
            </div>
          </div>
          <div class="quarters">
            ${Object.entries(report.quarterly).map(([q, data]) => `
              <div class="quarter">
                <h3>${q.toUpperCase()}</h3>
                <div class="quarter-data">
                  <div><span class="label">${locale === 'ko' ? '매출' : 'Sales'}:</span> <span>${formatCurrency(data.sales, branch.key)}</span></div>
                  <div><span class="label">${locale === 'ko' ? '비용' : 'Expenses'}:</span> <span>${formatCurrency(data.expenses, branch.key)}</span></div>
                  <div class="profit-line"><span class="label">${locale === 'ko' ? '이익' : 'Profit'}:</span> <span class="profit">${formatCurrency(data.profit, branch.key)}</span></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${locale === 'ko' ? '해외 사업부 판매 및 비용 보고서' : 'International Sales & Expense Reports'}</title>
  <style>
    @media print {
      @page { 
        size: A4 landscape;
        margin: 1cm;
      }
      body { margin: 0; padding: 0 !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.4;
      color: #1f2937;
      margin: 0;
      padding: 1cm;
      font-size: 11px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #10b981;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .company-name {
      font-size: 20px;
      font-weight: bold;
      color: #065f46;
      margin-bottom: 5px;
    }
    .report-title {
      font-size: 16px;
      font-weight: 600;
      color: #4b5563;
    }
    .branch-section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .branch-header {
      background: #f0fdf4;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
      margin-bottom: 15px;
    }
    .branch-info {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .flag {
      width: 24px;
      height: 18px;
    }
    .branch-info h2 {
      margin: 0;
      font-size: 16px;
      color: #065f46;
    }
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .stat {
      display: flex;
      flex-direction: column;
    }
    .stat .label {
      font-size: 9px;
      color: #6b7280;
      font-weight: 600;
    }
    .stat .value {
      font-size: 13px;
      font-weight: bold;
      color: #111827;
    }
    .stat .value.profit {
      color: #10b981;
    }
    .quarters {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .quarter {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px;
    }
    .quarter h3 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #10b981;
      font-weight: bold;
    }
    .quarter-data {
      font-size: 10px;
    }
    .quarter-data > div {
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }
    .quarter-data .label {
      color: #6b7280;
      font-weight: 600;
    }
    .quarter-data .profit-line {
      border-top: 1px solid #e5e7eb;
      padding-top: 4px;
      margin-top: 4px;
    }
    .quarter-data .profit {
      color: #10b981;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      font-size: 9px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">K ENERGY SAVE CO., LTD. (Group of Zera)</div>
    <div class="report-title">${locale === 'ko' ? '해외 사업부 판매 및 비용 보고서' : 'International Sales & Expense Reports'}</div>
    <div style="margin-top: 5px; font-size: 10px; color: #6b7280;">${viewMode === 'quarterly' ? (locale === 'ko' ? '분기별 보고서' : 'Quarterly Report') : (locale === 'ko' ? '월별 보고서' : 'Monthly Report')} - ${new Date().toLocaleDateString()}</div>
  </div>
  
  ${contentHTML}
  
  <div class="footer">
    <p><strong>K Energy Save Co., Ltd.</strong></p>
    <p>International Market Division</p>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/international-market/dashboard')} className="text-emerald-600 hover:text-emerald-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">{t.salesExpenseReports}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Custom Branch Dropdown */}
            <div ref={branchDropdownRef} className="relative">
              <button
                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[200px] justify-between"
              >
                <div className="flex items-center gap-2">
                  {selectedBranchOption.country && (
                    <CountryFlag country={selectedBranchOption.country} size="sm" />
                  )}
                  <span className="text-sm text-gray-700">{selectedBranchOption.name}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {/* Dropdown Menu */}
              {showBranchDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setBranchFilter('all');
                      setShowBranchDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 flex items-center gap-2 border-b border-gray-100"
                  >
                    <span className="text-sm text-gray-700">{t.allBranches}</span>
                  </button>
                  {branches.map((branch) => (
                    <button
                      key={branch.key}
                      onClick={() => {
                        setBranchFilter(branch.key);
                        setShowBranchDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                    >
                      <CountryFlag country={branch.country} size="sm" />
                      <span className="text-sm text-gray-700">{branch.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode('quarterly')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'quarterly' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                {t.quarterlyReport}
              </button>
              <button onClick={() => setViewMode('monthly')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                {t.monthly}
              </button>
            </div>
            <div className="ml-auto flex gap-2">
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                {locale === 'ko' ? '인쇄 리포트' : locale === 'th' ? 'พิมพ์รายงาน' : locale === 'vn' ? 'In Báo Cáo' : 'Print Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Branch Reports */}
        {visibleBranches.map(branch => {
          const report = branchReports[branch.key];
          const growth = getGrowthRate(report);
          const totalSales = Object.values(report.quarterly).reduce((sum, q) => sum + q.sales, 0);
          const totalExpenses = Object.values(report.quarterly).reduce((sum, q) => sum + q.expenses, 0);
          const totalProfit = totalSales - totalExpenses;
          const profitMargin = ((totalProfit / totalSales) * 100).toFixed(1);

          return (
            <div key={branch.key} className="mb-8">
              {/* Branch Header */}
              <div className="bg-white rounded-t-lg shadow-md p-4 border-b-2 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CountryFlag country={branch.country} size="lg" />
                    <h2 className="text-xl font-bold text-gray-800">{branch.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${Number(growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(growth) >= 0 ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
                      {' '}{growth}% {t.growthRate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 mb-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <p className="text-sm text-gray-600">{t.totalSales}</p>
                  <p className="text-lg font-bold text-green-600">{formatCompact(totalSales, branch.key)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <p className="text-sm text-gray-600">{t.expenses}</p>
                  <p className="text-lg font-bold text-red-600">{formatCompact(totalExpenses, branch.key)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <p className="text-sm text-gray-600">{t.totalProfit}</p>
                  <p className="text-lg font-bold text-blue-600">{formatCompact(totalProfit, branch.key)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <p className="text-sm text-gray-600">{t.profitMargin}</p>
                  <p className="text-lg font-bold text-purple-600">{profitMargin}%</p>
                </div>
              </div>

              {viewMode === 'quarterly' ? (
                <>
                  {/* Quarterly Bar Chart */}
                  <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">{t.quarterlyReport} - 2026</h3>
                    <div className="flex items-end gap-4 h-48">
                      {(['q1', 'q2', 'q3', 'q4'] as const).map(q => {
                        const data = report.quarterly[q];
                        const maxVal = Math.max(...Object.values(report.quarterly).map(v => Math.max(v.sales, v.expenses)));
                        const salesHeight = (data.sales / maxVal) * 100;
                        const expensesHeight = (data.expenses / maxVal) * 100;
                        const qLabel = { q1: t.q1, q2: t.q2, q3: t.q3, q4: t.q4 }[q];
                        return (
                          <div key={q} className="flex-1 flex flex-col items-center">
                            <div className="flex items-end gap-1 h-40 w-full justify-center">
                              <div className="w-1/3 bg-green-400 rounded-t-sm transition-all" style={{ height: `${salesHeight}%` }} title={formatCurrency(data.sales, branch.key)} />
                              <div className="w-1/3 bg-red-400 rounded-t-sm transition-all" style={{ height: `${expensesHeight}%` }} title={formatCurrency(data.expenses, branch.key)} />
                            </div>
                            <span className="text-xs text-gray-600 mt-2 font-medium">{qLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded-sm" />{t.salesAmount}</div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-sm" />{t.expenseAmount}</div>
                    </div>
                  </div>

                  {/* Quarterly Table */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-emerald-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.reportPeriod}</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.salesAmount}</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.expenseAmount}</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.totalProfit}</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.profitMargin}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(['q1', 'q2', 'q3', 'q4'] as const).map(q => {
                          const data = report.quarterly[q];
                          const margin = ((data.profit / data.sales) * 100).toFixed(1);
                          const qLabel = { q1: t.q1, q2: t.q2, q3: t.q3, q4: t.q4 }[q];
                          return (
                            <tr key={q} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium">{qLabel} 2026</td>
                              <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{formatCurrency(data.sales, branch.key)}</td>
                              <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">{formatCurrency(data.expenses, branch.key)}</td>
                              <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{formatCurrency(data.profit, branch.key)}</td>
                              <td className="px-4 py-3 text-sm text-right">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${Number(margin) >= 30 ? 'bg-green-100 text-green-700' : Number(margin) >= 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                  {margin}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-emerald-50 font-bold">
                          <td className="px-4 py-3 text-sm">{locale === 'ko' ? '합계' : 'Total'}</td>
                          <td className="px-4 py-3 text-sm text-right text-green-700">{formatCurrency(totalSales, branch.key)}</td>
                          <td className="px-4 py-3 text-sm text-right text-red-700">{formatCurrency(totalExpenses, branch.key)}</td>
                          <td className="px-4 py-3 text-sm text-right text-blue-700">{formatCurrency(totalProfit, branch.key)}</td>
                          <td className="px-4 py-3 text-sm text-right"><span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">{profitMargin}%</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  {/* Monthly Bar Chart */}
                  <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">{t.monthly} - 2026</h3>
                    <div className="flex items-end gap-1 h-48">
                      {report.monthly.map((m, i) => {
                        const maxVal = getMaxBarValue(report.monthly);
                        const salesHeight = (m.sales / maxVal) * 100;
                        const expensesHeight = (m.expenses / maxVal) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div className="flex items-end gap-px h-40 w-full justify-center">
                              <div className="w-2/5 bg-green-400 rounded-t-sm transition-all" style={{ height: `${salesHeight}%` }} title={formatCurrency(m.sales, branch.key)} />
                              <div className="w-2/5 bg-red-400 rounded-t-sm transition-all" style={{ height: `${expensesHeight}%` }} title={formatCurrency(m.expenses, branch.key)} />
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1">{m.month}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded-sm" />{t.salesAmount}</div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-sm" />{t.expenseAmount}</div>
                    </div>
                  </div>

                  {/* Monthly Table */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-emerald-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.reportPeriod}</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.salesAmount}</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.expenseAmount}</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.totalProfit}</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.profitMargin}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {report.monthly.map((m, idx) => {
                            const margin = ((m.profit / m.sales) * 100).toFixed(1);
                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium">{m.month} 2026</td>
                                <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{formatCurrency(m.sales, branch.key)}</td>
                                <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">{formatCurrency(m.expenses, branch.key)}</td>
                                <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{formatCurrency(m.profit, branch.key)}</td>
                                <td className="px-4 py-3 text-sm text-right">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${Number(margin) >= 30 ? 'bg-green-100 text-green-700' : Number(margin) >= 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {margin}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
