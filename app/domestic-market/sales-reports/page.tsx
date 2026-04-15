'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Printer, FileDown } from 'lucide-react';

interface RegionReport {
  regionKey: string;
  quarterly: {
    q1: { sales: number; expenses: number; profit: number };
    q2: { sales: number; expenses: number; profit: number };
    q3: { sales: number; expenses: number; profit: number };
    q4: { sales: number; expenses: number; profit: number };
  };
  monthly: { month: string; sales: number; expenses: number; profit: number }[];
}

export default function DomesticSalesReportsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [regionFilter, setRegionFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'quarterly' | 'monthly'>('quarterly');

  const regions = locale === 'ko'
    ? [{ key: 'seoul', name: '서울/경기', flag: '🏙️' }, { key: 'busan', name: '부산/경남', flag: '⚓' }, { key: 'daegu', name: '대구/경북', flag: '🏭' }, { key: 'daejeon', name: '대전/충청', flag: '🔬' }, { key: 'gwangju', name: '광주/전라', flag: '🌾' }, { key: 'incheon', name: '인천/강원', flag: '✈️' }, { key: 'jeju', name: '제주', flag: '🏝️' }]
    : [{ key: 'seoul', name: 'Seoul/Gyeonggi', flag: '🏙️' }, { key: 'busan', name: 'Busan/Gyeongnam', flag: '⚓' }, { key: 'daegu', name: 'Daegu/Gyeongbuk', flag: '🏭' }, { key: 'daejeon', name: 'Daejeon/Chungcheong', flag: '🔬' }, { key: 'gwangju', name: 'Gwangju/Jeolla', flag: '🌾' }, { key: 'incheon', name: 'Incheon/Gangwon', flag: '✈️' }, { key: 'jeju', name: 'Jeju', flag: '🏝️' }];

  const monthNames = locale === 'ko'
    ? ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const regionReports: Record<string, RegionReport> = {
    seoul: {
      regionKey: 'seoul',
      quarterly: {
        q1: { sales: 8500000000, expenses: 5200000000, profit: 3300000000 },
        q2: { sales: 9200000000, expenses: 5800000000, profit: 3400000000 },
        q3: { sales: 10100000000, expenses: 6100000000, profit: 4000000000 },
        q4: { sales: 11500000000, expenses: 6500000000, profit: 5000000000 },
      },
      monthly: monthNames.map((m) => {
        const sales = 2800000000 + Math.floor(Math.random() * 1200000000);
        const expenses = 1700000000 + Math.floor(Math.random() * 600000000);
        return { month: m, sales, expenses, profit: sales - expenses };
      }),
    },
    busan: {
      regionKey: 'busan',
      quarterly: {
        q1: { sales: 4200000000, expenses: 2600000000, profit: 1600000000 },
        q2: { sales: 4800000000, expenses: 2900000000, profit: 1900000000 },
        q3: { sales: 5300000000, expenses: 3200000000, profit: 2100000000 },
        q4: { sales: 5800000000, expenses: 3400000000, profit: 2400000000 },
      },
      monthly: monthNames.map((m) => {
        const sales = 1400000000 + Math.floor(Math.random() * 600000000);
        const expenses = 850000000 + Math.floor(Math.random() * 300000000);
        return { month: m, sales, expenses, profit: sales - expenses };
      }),
    },
    daegu: {
      regionKey: 'daegu',
      quarterly: {
        q1: { sales: 3100000000, expenses: 1900000000, profit: 1200000000 },
        q2: { sales: 3500000000, expenses: 2100000000, profit: 1400000000 },
        q3: { sales: 3900000000, expenses: 2300000000, profit: 1600000000 },
        q4: { sales: 4200000000, expenses: 2500000000, profit: 1700000000 },
      },
      monthly: monthNames.map((m) => {
        const sales = 1000000000 + Math.floor(Math.random() * 450000000);
        const expenses = 600000000 + Math.floor(Math.random() * 250000000);
        return { month: m, sales, expenses, profit: sales - expenses };
      }),
    },
    daejeon: {
      regionKey: 'daejeon',
      quarterly: {
        q1: { sales: 2800000000, expenses: 1700000000, profit: 1100000000 },
        q2: { sales: 3200000000, expenses: 1900000000, profit: 1300000000 },
        q3: { sales: 3500000000, expenses: 2100000000, profit: 1400000000 },
        q4: { sales: 3900000000, expenses: 2200000000, profit: 1700000000 },
      },
      monthly: monthNames.map((m) => {
        const sales = 900000000 + Math.floor(Math.random() * 400000000);
        const expenses = 550000000 + Math.floor(Math.random() * 200000000);
        return { month: m, sales, expenses, profit: sales - expenses };
      }),
    },
    gwangju: {
      regionKey: 'gwangju',
      quarterly: {
        q1: { sales: 2200000000, expenses: 1400000000, profit: 800000000 },
        q2: { sales: 2500000000, expenses: 1500000000, profit: 1000000000 },
        q3: { sales: 2800000000, expenses: 1700000000, profit: 1100000000 },
        q4: { sales: 3100000000, expenses: 1800000000, profit: 1300000000 },
      },
      monthly: monthNames.map((m) => {
        const sales = 700000000 + Math.floor(Math.random() * 350000000);
        const expenses = 420000000 + Math.floor(Math.random() * 180000000);
        return { month: m, sales, expenses, profit: sales - expenses };
      }),
    },
    incheon: {
      regionKey: 'incheon',
      quarterly: {
        q1: { sales: 3500000000, expenses: 2100000000, profit: 1400000000 },
        q2: { sales: 3900000000, expenses: 2400000000, profit: 1500000000 },
        q3: { sales: 4300000000, expenses: 2600000000, profit: 1700000000 },
        q4: { sales: 4700000000, expenses: 2800000000, profit: 1900000000 },
      },
      monthly: monthNames.map((m) => {
        const sales = 1100000000 + Math.floor(Math.random() * 500000000);
        const expenses = 680000000 + Math.floor(Math.random() * 250000000);
        return { month: m, sales, expenses, profit: sales - expenses };
      }),
    },
    jeju: {
      regionKey: 'jeju',
      quarterly: {
        q1: { sales: 1500000000, expenses: 900000000, profit: 600000000 },
        q2: { sales: 1800000000, expenses: 1050000000, profit: 750000000 },
        q3: { sales: 2100000000, expenses: 1200000000, profit: 900000000 },
        q4: { sales: 2400000000, expenses: 1350000000, profit: 1050000000 },
      },
      monthly: monthNames.map((m) => {
        const sales = 500000000 + Math.floor(Math.random() * 250000000);
        const expenses = 300000000 + Math.floor(Math.random() * 130000000);
        return { month: m, sales, expenses, profit: sales - expenses };
      }),
    },
  };

  const formatCurrency = (v: number) => '₩' + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);

  const formatCompact = (v: number) => {
    if (locale === 'ko') {
      if (v >= 1000000000000) return '₩' + (v / 1000000000000).toFixed(1) + '조';
      if (v >= 100000000) return '₩' + (v / 100000000).toFixed(1) + '억';
      if (v >= 10000) return '₩' + (v / 10000).toFixed(0) + '만';
      return '₩' + v.toString();
    }
    if (v >= 1000000000000) return '₩' + (v / 1000000000000).toFixed(1) + 'T';
    if (v >= 1000000000) return '₩' + (v / 1000000000).toFixed(1) + 'B';
    if (v >= 1000000) return '₩' + (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return '₩' + (v / 1000).toFixed(1) + 'K';
    return '₩' + v.toString();
  };

  const visibleRegions = regionFilter === 'all' ? regions : regions.filter(r => r.key === regionFilter);

  const getGrowthRate = (report: RegionReport) => {
    const q1Total = report.quarterly.q1.sales;
    const q4Total = report.quarterly.q4.sales;
    return ((q4Total - q1Total) / q1Total * 100).toFixed(1);
  };

  const getMaxBarValue = (data: { sales: number; expenses: number }[]) => {
    return Math.max(...data.map(d => Math.max(d.sales, d.expenses)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/domestic-market/dashboard')} className="text-emerald-600 hover:text-emerald-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{t.salesUpdateReports}</h1>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5"><img src="https://flagcdn.com/kr.svg" alt="Korea" width={20} height={14} style={{ borderRadius: 2, objectFit: 'cover', display: 'inline-block' }} /> {t.domesticMarket}</p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
              <option value="all">{t.allRegions}</option>
              {regions.map(r => <option key={r.key} value={r.key}>{r.flag} {r.name}</option>)}
            </select>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setViewMode('quarterly')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'quarterly' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                {t.quarterlyReport}
              </button>
              <button onClick={() => setViewMode('monthly')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-gray-800'}`}>
                {t.monthly}
              </button>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"><Printer className="w-4 h-4" />{t.printDocument}</button>
              <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"><FileDown className="w-4 h-4" />{t.exportPDF}</button>
            </div>
          </div>
        </div>

        {/* Region Reports */}
        {visibleRegions.map(region => {
          const report = regionReports[region.key];
          const growth = getGrowthRate(report);
          const totalSales = Object.values(report.quarterly).reduce((sum, q) => sum + q.sales, 0);
          const totalExpenses = Object.values(report.quarterly).reduce((sum, q) => sum + q.expenses, 0);
          const totalProfit = totalSales - totalExpenses;
          const profitMargin = ((totalProfit / totalSales) * 100).toFixed(1);

          return (
            <div key={region.key} className="mb-8">
              {/* Region Header */}
              <div className="bg-white rounded-t-lg shadow-md p-4 border-b-2 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{region.flag}</span>
                    <h2 className="text-xl font-bold text-gray-800">{region.name}</h2>
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
                  <p className="text-lg font-bold text-green-600">{formatCompact(totalSales)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <p className="text-sm text-gray-600">{t.expenses}</p>
                  <p className="text-lg font-bold text-red-600">{formatCompact(totalExpenses)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <p className="text-sm text-gray-600">{t.totalProfit}</p>
                  <p className="text-lg font-bold text-blue-600">{formatCompact(totalProfit)}</p>
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
                              <div className="w-1/3 bg-green-400 rounded-t-sm transition-all" style={{ height: `${salesHeight}%` }} title={formatCurrency(data.sales)} />
                              <div className="w-1/3 bg-red-400 rounded-t-sm transition-all" style={{ height: `${expensesHeight}%` }} title={formatCurrency(data.expenses)} />
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
                              <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{formatCurrency(data.sales)}</td>
                              <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">{formatCurrency(data.expenses)}</td>
                              <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{formatCurrency(data.profit)}</td>
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
                          <td className="px-4 py-3 text-sm text-right text-green-700">{formatCurrency(totalSales)}</td>
                          <td className="px-4 py-3 text-sm text-right text-red-700">{formatCurrency(totalExpenses)}</td>
                          <td className="px-4 py-3 text-sm text-right text-blue-700">{formatCurrency(totalProfit)}</td>
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
                              <div className="w-2/5 bg-green-400 rounded-t-sm transition-all" style={{ height: `${salesHeight}%` }} title={formatCurrency(m.sales)} />
                              <div className="w-2/5 bg-red-400 rounded-t-sm transition-all" style={{ height: `${expensesHeight}%` }} title={formatCurrency(m.expenses)} />
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
                                <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{formatCurrency(m.sales)}</td>
                                <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">{formatCurrency(m.expenses)}</td>
                                <td className="px-4 py-3 text-sm text-right text-blue-600 font-medium">{formatCurrency(m.profit)}</td>
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
