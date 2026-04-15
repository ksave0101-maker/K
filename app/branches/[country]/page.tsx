'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CountryFlag from '@/components/CountryFlag';
import CompanyLogo from '@/components/CompanyLogo';

export default function BranchDashboard() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const country = params.country as string;
  
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  // Branch data
  const branchData: Record<string, any> = {
    korea: {
      name: t.korea,
      flag: '🇰🇷',
      fullName: 'Korea',
      employees: 156,
      currency: 'KRW',
      currencySymbol: '₩',
      exchangeRate: 1340,
      revenue: 31477612,
      sales: 38000000,
      expenses: 23641791,
      netProfit: 7835821,
    },
    brunei: {
      name: t.brunei,
      flag: '🇧🇳',
      fullName: 'Brunei Darussalam',
      employees: 45,
      currency: 'BND',
      currencySymbol: 'B$',
      exchangeRate: 1.35,
      revenue: 2450000,
      sales: 3200000,
      expenses: 1820000,
      netProfit: 630000,
    },
    thailand: {
      name: t.thailand,
      flag: '🇹🇭',
      fullName: 'Thailand',
      employees: 78,
      currency: 'THB',
      currencySymbol: '฿',
      exchangeRate: 36,
      revenue: 4850000,
      sales: 5900000,
      expenses: 2980000,
      netProfit: 1870000,
    },
    vietnam: {
      name: t.vietnam,
      flag: '🇻🇳',
      fullName: 'Vietnam',
      employees: 62,
      currency: 'VND',
      currencySymbol: '₫',
      exchangeRate: 25400,
      revenue: 3720000,
      sales: 4500000,
      expenses: 2450000,
      netProfit: 1270000,
    },
  };

  const branch = branchData[country];

  if (!branch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Branch not found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    );
  }

  // Map country to flag code
  const countryFlagMap: Record<string, 'KR' | 'BN' | 'TH' | 'VN'> = {
    korea: 'KR',
    brunei: 'BN',
    thailand: 'TH',
    vietnam: 'VN',
  };
  const flagCode = countryFlagMap[country];

  // KPI Data
  const kpiData = [
    { name: t.customerSatisfaction, value: 92, target: 90, color: 'text-green-600', bgColor: 'bg-green-100' },
    { name: t.orderFulfillment, value: 88, target: 85, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { name: t.employeeProductivity, value: 95, target: 90, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { name: t.marketShare, value: 23, target: 20, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  ];

  // Convert to local currency
  const toLocalCurrency = (usdValue: number) => usdValue * branch.exchangeRate;

  // Monthly trend data
  const monthlyData = [
    { month: t.monthNames[0], revenue: toLocalCurrency(380000), sales: toLocalCurrency(450000), expenses: toLocalCurrency(240000) },
    { month: t.monthNames[1], revenue: toLocalCurrency(420000), sales: toLocalCurrency(490000), expenses: toLocalCurrency(260000) },
    { month: t.monthNames[2], revenue: toLocalCurrency(390000), sales: toLocalCurrency(470000), expenses: toLocalCurrency(250000) },
    { month: t.monthNames[3], revenue: toLocalCurrency(450000), sales: toLocalCurrency(520000), expenses: toLocalCurrency(270000) },
    { month: t.monthNames[4], revenue: toLocalCurrency(480000), sales: toLocalCurrency(550000), expenses: toLocalCurrency(285000) },
    { month: t.monthNames[5], revenue: toLocalCurrency(510000), sales: toLocalCurrency(580000), expenses: toLocalCurrency(295000) },
  ];

  // Daily data (last 7 days)
  const dailyData = [
    { day: locale === 'ko' ? '월' : 'Mon', revenue: toLocalCurrency(15000), sales: toLocalCurrency(18000), expenses: toLocalCurrency(9500) },
    { day: locale === 'ko' ? '화' : 'Tue', revenue: toLocalCurrency(18000), sales: toLocalCurrency(21000), expenses: toLocalCurrency(10200) },
    { day: locale === 'ko' ? '수' : 'Wed', revenue: toLocalCurrency(16500), sales: toLocalCurrency(19500), expenses: toLocalCurrency(9800) },
    { day: locale === 'ko' ? '목' : 'Thu', revenue: toLocalCurrency(19000), sales: toLocalCurrency(22000), expenses: toLocalCurrency(10500) },
    { day: locale === 'ko' ? '금' : 'Fri', revenue: toLocalCurrency(21000), sales: toLocalCurrency(24000), expenses: toLocalCurrency(11000) },
    { day: locale === 'ko' ? '토' : 'Sat', revenue: toLocalCurrency(23000), sales: toLocalCurrency(26000), expenses: toLocalCurrency(11500) },
    { day: locale === 'ko' ? '일' : 'Sun', revenue: toLocalCurrency(20000), sales: toLocalCurrency(23000), expenses: toLocalCurrency(10800) },
  ];

  // Yearly data
  const yearlyData = [
    { year: '2022', revenue: toLocalCurrency(3200000), sales: toLocalCurrency(3800000), expenses: toLocalCurrency(2100000) },
    { year: '2023', revenue: toLocalCurrency(3850000), sales: toLocalCurrency(4500000), expenses: toLocalCurrency(2400000) },
    { year: '2024', revenue: toLocalCurrency(4200000), sales: toLocalCurrency(5100000), expenses: toLocalCurrency(2650000) },
    { year: '2025', revenue: toLocalCurrency(4750000), sales: toLocalCurrency(5800000), expenses: toLocalCurrency(2900000) },
    { year: '2026', revenue: toLocalCurrency(branch.revenue), sales: toLocalCurrency(branch.sales), expenses: toLocalCurrency(branch.expenses) },
  ];

  const chartData = period === 'daily' ? dailyData : period === 'monthly' ? monthlyData : yearlyData;

  // Risk Analysis Data
  const risks = [
    { name: t.financialRisk, level: locale === 'ko' ? '낮음' : 'Low', color: 'text-green-600', bgColor: 'bg-green-100', severity: 25 },
    { name: t.operationalRisk, level: locale === 'ko' ? '중간' : 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100', severity: 55 },
    { name: t.marketRisk, level: locale === 'ko' ? '중간' : 'Medium', color: 'text-orange-600', bgColor: 'bg-orange-100', severity: 60 },
    { name: t.complianceRisk, level: locale === 'ko' ? '낮음' : 'Low', color: 'text-green-600', bgColor: 'bg-green-100', severity: 20 },
  ];

  const formatCurrency = (value: number) => {
    const valueInLocalCurrency = value * branch.exchangeRate;
    return branch.currencySymbol + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valueInLocalCurrency);
  };

  const formatLocalCurrency = (value: number) => {
    return branch.currencySymbol + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Company Logo (Small) */}
              <CompanyLogo size="2xl" />
              
              {/* Branch Info */}
              <div className="flex items-center gap-3 border-l-2 border-gray-200 pl-4">
                <CountryFlag country={flagCode} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900">
                      {branch.name} {t.branchDashboard}
                    </h1>
                  </div>
                  <p className="text-xs text-gray-500">{branch.fullName} • {t.companyName}</p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Financial Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t.financialSummary}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium mb-1">{t.revenue}</div>
              <div className="text-2xl font-bold text-blue-900">{formatCurrency(branch.revenue)}</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5%</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium mb-1">{t.sales}</div>
              <div className="text-2xl font-bold text-green-900">{formatCurrency(branch.sales)}</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+15.3%</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="text-sm text-orange-600 font-medium mb-1">{t.expenses}</div>
              <div className="text-2xl font-bold text-orange-900">{formatCurrency(branch.expenses)}</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                <TrendingUp className="w-4 h-4" />
                <span>+8.2%</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium mb-1">{t.netProfit}</div>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(branch.netProfit)}</div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+18.7%</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t.kpiMetrics}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => (
              <div key={index} className={`${kpi.bgColor} rounded-lg p-4`}>
                <div className="text-sm font-medium text-gray-700 mb-2">{kpi.name}</div>
                <div className={`text-3xl font-bold ${kpi.color} mb-2`}>{kpi.value}%</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${kpi.color.replace('text-', 'bg-')}`}
                      style={{ width: `${kpi.value}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {locale === 'ko' ? '목표' : 'Target'}: {kpi.target}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Analysis with Period Selector */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t.trendAnalysis}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('daily')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'daily'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.daily}
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.monthly}
              </button>
              <button
                onClick={() => setPeriod('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.yearly}
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={period === 'daily' ? 'day' : period === 'monthly' ? 'month' : 'year'} 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => formatLocalCurrency(value)}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name={t.revenue} />
              <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name={t.sales} />
              <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} name={t.expenses} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Analysis */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t.riskAnalysis}</h2>
          <div className="space-y-4">
            {risks.map((risk, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`${risk.bgColor} ${risk.color} p-2 rounded-lg`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{risk.name}</h3>
                      <p className="text-sm text-gray-500">
                        {t.riskLevel}: <span className={risk.color}>{risk.level}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 ${risk.bgColor} ${risk.color} rounded-full text-sm font-medium`}>
                    {risk.severity}%
                  </div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${risk.color.replace('text-', 'bg-')}`}
                    style={{ width: `${risk.severity}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
