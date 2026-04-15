'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  Package,
  Truck,
  Factory,
  Ship,
  Wrench,
  AlertTriangle,
  Settings,
  FlaskConical,
  ClipboardCheck,
  BarChart3,
  PieChart,
  Activity,
  Workflow,
  Shield,
  Users,
} from 'lucide-react';

type StatShape = {
  totalOrders: number;
  inProduction: number;
  readyToShip: number;
  shipped: number;
  qualityTests: number;
  materialsNeeded: number;
  efficiency: number;
  dailyOutput: number;
  qaReports: number;
  dailyIssues: number;
};

type BranchKey = 'korea' | 'thailand' | 'vietnam' | 'malaysia' | 'brunei';

const EMPTY_STATS: StatShape = {
  totalOrders: 0,
  inProduction: 0,
  readyToShip: 0,
  shipped: 0,
  qualityTests: 0,
  materialsNeeded: 0,
  efficiency: 0,
  dailyOutput: 0,
  qaReports: 0,
  dailyIssues: 0,
};

type MenuCard = { icon: any; title: string; description: string; href: string; color: string; count: number | null; external?: boolean };

export default function ProductionDashboardPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [summaryStats, setSummaryStats] = useState<StatShape>(EMPTY_STATS);
  const [branchStats, setBranchStats] = useState<Record<BranchKey, StatShape>>({
    korea: EMPTY_STATS,
    thailand: EMPTY_STATS,
    vietnam: EMPTY_STATS,
    malaysia: EMPTY_STATS,
    brunei: EMPTY_STATS,
  });
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [alerts, setAlerts] = useState<{ overdueOrders: any[]; unpaidInvoices: any[]; inTransitShipments: any[] }>({ overdueOrders: [], unpaidInvoices: [], inTransitShipments: [] });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [shipmentStats, setShipmentStats] = useState({ total: 0, preparing: 0, in_transit: 0, customs: 0, delivered: 0 });
  const [invoiceStats, setInvoiceStats] = useState({ total: 0, unpaid: 0, paid: 0, overdue: 0 });

  const branchInvoiceCards = [
    {
      id: 'korea',
      href: '/Korea/Admin-Login/invoices/create',
      flagSrc: '/flags/kr.svg',
      flagAlt: 'South Korea flag',
      name: locale === 'ko' ? '본사' : 'Korea HQ',
      subtitle: locale === 'ko' ? '한국 본사' : 'Headquarters',
      borderClass: 'border-orange-200 hover:border-orange-500 hover:bg-orange-50',
      textClass: 'group-hover:text-orange-700',
    },
    {
      id: 'thailand',
      href: '/KR-Thailand/Admin-Login/invoices/create',
      flagSrc: '/flags/th.svg',
      flagAlt: 'Thailand flag',
      name: locale === 'ko' ? '태국' : 'Thailand',
      subtitle: locale === 'ko' ? '태국 지점' : 'Thailand Branch',
      borderClass: 'border-blue-200 hover:border-blue-500 hover:bg-blue-50',
      textClass: 'group-hover:text-blue-700',
    },
    {
      id: 'vietnam',
      href: '/KR-Vietnam/Admin-Login/invoices/create',
      flagSrc: '/flags/vn.svg',
      flagAlt: 'Vietnam flag',
      name: locale === 'ko' ? '베트남' : 'Vietnam',
      subtitle: locale === 'ko' ? '베트남 지점' : 'Vietnam Branch',
      borderClass: 'border-green-200 hover:border-green-500 hover:bg-green-50',
      textClass: 'group-hover:text-green-700',
    },
    {
      id: 'malaysia',
      href: '/KR-Malaysia/Admin-Login/invoices/create',
      flagSrc: '/flags/my.svg',
      flagAlt: 'Malaysia flag',
      name: locale === 'ko' ? '말레이시아' : 'Malaysia',
      subtitle: locale === 'ko' ? '말레이시아 지점' : 'Malaysia Branch',
      borderClass: 'border-purple-200 hover:border-purple-500 hover:bg-purple-50',
      textClass: 'group-hover:text-purple-700',
    },
    {
      id: 'brunei',
      href: '/KR-Brunei/Admin-Login/invoices/create',
      flagSrc: '/flags/bn.svg',
      flagAlt: 'Brunei flag',
      name: locale === 'ko' ? '브루나이' : 'Brunei',
      subtitle: locale === 'ko' ? '브루나이 지점' : 'Brunei Branch',
      borderClass: 'border-yellow-200 hover:border-yellow-500 hover:bg-yellow-50',
      textClass: 'group-hover:text-yellow-700',
    },
  ];

  useEffect(() => {
    setMounted(true);
    try {
      const userData = localStorage.getItem('k_system_admin_user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setDashboardLoading(true);
      setDashboardError('');
      try {
        const res = await fetch('/api/production/dashboard', { cache: 'no-store' });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          throw new Error(json?.error || 'Failed to load production dashboard data');
        }
        if (!active) return;
        setSummaryStats({ ...EMPTY_STATS, ...(json.summary || {}) });
        setBranchStats({
          korea: { ...EMPTY_STATS, ...(json?.branches?.korea || {}) },
          thailand: { ...EMPTY_STATS, ...(json?.branches?.thailand || {}) },
          vietnam: { ...EMPTY_STATS, ...(json?.branches?.vietnam || {}) },
          malaysia: { ...EMPTY_STATS, ...(json?.branches?.malaysia || {}) },
          brunei: { ...EMPTY_STATS, ...(json?.branches?.brunei || {}) },
        });
        if (json.alerts) setAlerts(json.alerts);
        if (json.recentOrders) setRecentOrders(json.recentOrders);
        if (json.shipments) setShipmentStats(json.shipments);
        if (json.invoices) setInvoiceStats(json.invoices);
      } catch (err: any) {
        if (!active) return;
        setDashboardError(err?.message || 'Failed to load production dashboard data');
      } finally {
        if (active) setDashboardLoading(false);
      }
    };
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  // View options
  const departments = [
    { id: 'all', name: locale === 'ko' ? '전체' : 'All', emoji: '🏭' },
    { id: 'korea', name: locale === 'ko' ? '한국' : 'Korea', emoji: '🇰🇷' },
    { id: 'thailand', name: locale === 'ko' ? '태국' : 'Thailand', emoji: '🇹🇭' },
    { id: 'vietnam', name: locale === 'ko' ? '베트남' : 'Vietnam', emoji: '🇻🇳' },
    { id: 'malaysia', name: locale === 'ko' ? '말레이시아' : 'Malaysia', emoji: '🇲🇾' },
    { id: 'brunei', name: locale === 'ko' ? '브루나이' : 'Brunei', emoji: '🇧🇳' }
  ];

  const stats =
    selectedDepartment === 'all'
      ? summaryStats
      : branchStats[selectedDepartment as BranchKey] || EMPTY_STATS;

  const branchEntries: Array<{ key: BranchKey; name: string; emoji: string; stats: StatShape }> = [
    { key: 'korea', name: locale === 'ko' ? '한국' : 'Korea', emoji: '🇰🇷', stats: branchStats.korea || EMPTY_STATS },
    { key: 'thailand', name: locale === 'ko' ? '태국' : 'Thailand', emoji: '🇹🇭', stats: branchStats.thailand || EMPTY_STATS },
    { key: 'vietnam', name: locale === 'ko' ? '베트남' : 'Vietnam', emoji: '🇻🇳', stats: branchStats.vietnam || EMPTY_STATS },
    { key: 'malaysia', name: locale === 'ko' ? '말레이시아' : 'Malaysia', emoji: '🇲🇾', stats: branchStats.malaysia || EMPTY_STATS },
    { key: 'brunei', name: locale === 'ko' ? '브루나이' : 'Brunei', emoji: '🇧🇳', stats: branchStats.brunei || EMPTY_STATS },
  ];

  const menuCards: MenuCard[] = [
    {
      icon: Package,
      title: t.pendingProductionOrdersByBranch,
      description: locale === 'ko' ? '각 지점별 생산 대기 중인 주문 목록' : 'Production orders pending for each branch',
      href: '/production/pending-orders',
      color: 'bg-blue-500',
      count: stats.inProduction
    },
    {
      icon: Truck,
      title: t.pendingShipmentOrdersByBranch,
      description: locale === 'ko' ? '각 지점별 배송 대기 중인 주문 목록' : 'Shipment orders pending for each branch',
      href: '/production/pending-shipments',
      color: 'bg-green-500',
      count: stats.readyToShip
    },
    {
      icon: Factory,
      title: t.productionUpdates,
      description: locale === 'ko' ? '생산 진행 상황 업데이트' : 'Update production progress',
      href: '/production/production-updates',
      color: 'bg-orange-500',
      count: null
    },
    {
      icon: Ship,
      title: t.shipmentUpdates,
      description: locale === 'ko' ? '배송 상태 업데이트' : 'Update shipment status',
      href: '/production/shipment-updates',
      color: 'bg-teal-500',
      count: null
    },
    {
      icon: Wrench,
      title: t.materialsAwaitingPurchase,
      description: locale === 'ko' ? '구매 대기 중인 필수 자재 목록' : 'Essential materials awaiting purchase',
      href: '/production/materials-list',
      color: 'bg-purple-500',
      count: stats.materialsNeeded
    },
    {
      icon: AlertTriangle,
      title: t.dailyIssuesReport,
      description: locale === 'ko' ? '매일 발견된 문제점 업데이트' : 'Daily discovered issues update',
      href: '/production/daily-issues',
      color: 'bg-red-500',
      count: stats.dailyIssues
    },
    {
      icon: Settings,
      title: t.dailyDevelopmentFixes,
      description: locale === 'ko' ? '매일 개발 및 문제 해결 업데이트' : 'Daily development and fixes update',
      href: '/production/development-fixes',
      color: 'bg-indigo-500',
      count: null
    },
    {
      icon: FlaskConical,
      title: t.postProductionTestResults,
      description: locale === 'ko' ? '생산 후 기기 테스트 결과 업데이트' : 'Post-production device test results',
      href: '/production/test-results',
      color: 'bg-cyan-500',
      count: stats.qualityTests
    },
    {
      icon: ClipboardCheck,
      title: t.qualityControlReports,
      description: locale === 'ko' ? 'QA/QC 품질 검사 보고서' : 'QA/QC quality inspection reports',
      href: '/production/qa-reports',
      color: 'bg-emerald-500',
      count: stats.qaReports
    },
    {
      icon: Workflow,
      title: t.flowSystem,
      description: t.flowSystemDesc,
      href: 'https://flow.team/signin.act',
      color: 'bg-cyan-600',
      count: null,
      external: true
    },
    {
      icon: Shield,
      title: t.adminSupport,
      description: t.adminSupportDesc,
      href: '/admin-support/production',
      color: 'bg-purple-500',
      count: null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/Korea/Admin-Login')}
                className="text-orange-600 hover:text-orange-800"
              >
                ← {t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏭</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {t.productionLogisticsDashboard}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t.productionDepartmentDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {mounted && currentUser && (
                <div className="px-4 py-2 rounded-lg bg-green-50 border-2 border-green-200 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {currentUser.name || currentUser.username}
                  </span>
                </div>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Department Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {locale === 'ko' ? '지점 선택' : 'Select Branch'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedDepartment === dept.id
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                }`}
              >
                <div className="text-2xl mb-1">{dept.emoji}</div>
                <div className="text-sm font-medium">{dept.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Branch Invoice Creation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {locale === 'ko' ? '지점별 인보이스 생성' : 'Create Branch Invoices'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {branchInvoiceCards.map((branch) => (
              <button
                key={branch.id}
                onClick={() => router.push(branch.href)}
                className={`p-4 rounded-lg border-2 transition-all group ${branch.borderClass}`}
              >
                <div className="text-center">
                  <div className="mb-3 flex justify-center">
                    <span className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
                      <Image
                        src={branch.flagSrc}
                        alt={branch.flagAlt}
                        width={44}
                        height={44}
                        className="h-11 w-11 object-contain"
                      />
                    </span>
                  </div>
                  <div className={`text-sm font-semibold text-gray-700 ${branch.textClass}`}>
                    {branch.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {branch.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        {dashboardError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {dashboardError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalOrders}</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardLoading ? '-' : stats.totalOrders}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.inProduction}</p>
                <p className="text-3xl font-bold text-orange-600">{dashboardLoading ? '-' : stats.inProduction}</p>
              </div>
              <Factory className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.readyToShip}</p>
                <p className="text-3xl font-bold text-green-600">{dashboardLoading ? '-' : stats.readyToShip}</p>
              </div>
              <Truck className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.shipped}</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardLoading ? '-' : stats.shipped}</p>
              </div>
              <Ship className="w-12 h-12 text-teal-500" />
            </div>
          </div>
        </div>

        {/* Production Analytics Charts - Only show when 'All' is selected */}
        {selectedDepartment === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Production Performance Bar Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                {locale === 'ko' ? '부서별 생산량 비교' : 'Production Comparison by Department'}
              </h3>
              <div className="space-y-4">
                {branchEntries.map((entry) => {
                  const percentage = summaryStats.dailyOutput > 0 ? (entry.stats.dailyOutput / summaryStats.dailyOutput) * 100 : 0;
                  return (
                    <div key={entry.key} className="flex items-center gap-3">
                      <div className="w-16 text-sm font-medium flex items-center gap-1">
                        <span>{entry.emoji}</span>
                        <span className="text-xs">{entry.name}</span>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-orange-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                          style={{ width: `${Math.max(percentage, 15)}%` }}
                        >
                          <span className="text-white text-xs font-bold">{entry.stats.dailyOutput}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Production Activity Comparison */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                {locale === 'ko' ? '활동 현황 비교' : 'Activity Status Comparison'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.inProduction}</div>
                  <div className="text-sm text-blue-600">{locale === 'ko' ? '생산중' : 'In Production'}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.readyToShip}</div>
                  <div className="text-sm text-green-600">{locale === 'ko' ? '출하준비' : 'Ready to Ship'}</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.qualityTests}</div>
                  <div className="text-sm text-yellow-600">{locale === 'ko' ? '품질검사' : 'Quality Tests'}</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.materialsNeeded}</div>
                  <div className="text-sm text-red-600">{locale === 'ko' ? '자재필요' : 'Materials Needed'}</div>
                </div>
              </div>
            </div>

            {/* Production Efficiency Donut Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                {locale === 'ko' ? '부서별 효율성' : 'Department Efficiency'}
              </h3>
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                    {branchEntries.map((entry, index) => {
                      const colors = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
                      const percentage = entry.stats.efficiency;
                      const strokeDasharray = `${percentage * 2.51} 251`;
                      const rotation = index * 72;
                      return (
                        <circle
                          key={entry.key}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={colors[index]}
                          strokeWidth="8"
                          strokeDasharray={strokeDasharray}
                          strokeLinecap="round"
                          transform={`rotate(${rotation} 50 50)`}
                          opacity="0.8"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{stats.efficiency}%</div>
                      <div className="text-sm text-gray-600">{locale === 'ko' ? '평균 효율성' : 'Avg Efficiency'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2">
                {branchEntries.map((entry, index) => {
                  const colors = ['bg-orange-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-red-500'];
                  return (
                    <div key={entry.key} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                      <span className="text-sm flex-1">{entry.name}: {entry.stats.efficiency}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Production Performance Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {locale === 'ko' ? '부서별 성과 요약' : 'Department Performance Summary'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2">{locale === 'ko' ? '부서' : 'Department'}</th>
                      <th className="text-right py-3 px-2">{locale === 'ko' ? '일일 생산량' : 'Daily Output'}</th>
                      <th className="text-right py-3 px-2">{locale === 'ko' ? '효율성' : 'Efficiency'}</th>
                      <th className="text-right py-3 px-2">{locale === 'ko' ? '완료' : 'Shipped'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchEntries.map((entry) => {
                      return (
                        <tr key={entry.key} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 flex items-center gap-2">
                            <span>{entry.emoji}</span>
                            <span className="font-medium">{entry.name}</span>
                          </td>
                          <td className="text-right py-3 px-2 font-medium">{entry.stats.dailyOutput}</td>
                          <td className="text-right py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              entry.stats.efficiency >= 95 ? 'bg-green-100 text-green-600' :
                              entry.stats.efficiency >= 90 ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {entry.stats.efficiency}%
                            </span>
                          </td>
                          <td className="text-right py-3 px-2 text-gray-600">{entry.stats.shipped}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Live Data Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-xs text-gray-500 mb-1">{locale === 'ko' ? '출하 완료' : 'Delivered'}</div>
            <div className="text-2xl font-bold text-blue-700">{shipmentStats.delivered}</div>
            <div className="text-xs text-gray-400 mt-1">{locale === 'ko' ? `전체 ${shipmentStats.total}건` : `of ${shipmentStats.total} shipments`}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-xs text-gray-500 mb-1">{locale === 'ko' ? '운송중' : 'In Transit'}</div>
            <div className="text-2xl font-bold text-yellow-700">{shipmentStats.in_transit + shipmentStats.customs}</div>
            <div className="text-xs text-gray-400 mt-1">{locale === 'ko' ? `준비중 ${shipmentStats.preparing}건` : `${shipmentStats.preparing} preparing`}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="text-xs text-gray-500 mb-1">{locale === 'ko' ? '미납 인보이스' : 'Unpaid Invoices'}</div>
            <div className="text-2xl font-bold text-red-700">{invoiceStats.unpaid}</div>
            <div className="text-xs text-gray-400 mt-1">{locale === 'ko' ? `전체 ${invoiceStats.total}건` : `of ${invoiceStats.total} invoices`}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-xs text-gray-500 mb-1">{locale === 'ko' ? '납부 완료' : 'Paid'}</div>
            <div className="text-2xl font-bold text-green-700">{invoiceStats.paid}</div>
            <div className="text-xs text-gray-400 mt-1">{locale === 'ko' ? `연체 ${invoiceStats.overdue}건` : `${invoiceStats.overdue} overdue`}</div>
          </div>
        </div>

        {/* Alerts Section */}
        {(alerts.overdueOrders.length > 0 || alerts.unpaidInvoices.length > 0 || alerts.inTransitShipments.length > 0) && (
          <div className="mb-8 space-y-4">
            {alerts.overdueOrders.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {locale === 'ko' ? `납기 초과 생산 주문 (${alerts.overdueOrders.length}건)` : `Overdue Production Orders (${alerts.overdueOrders.length})`}
                </h3>
                <div className="space-y-2">
                  {alerts.overdueOrders.map((o: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-white rounded p-2">
                      <span className="font-semibold text-gray-800">{o.pdoNo}</span>
                      <span className="text-gray-600">{o.product_name}</span>
                      <span className="text-red-600 font-medium">Due: {o.due_date}</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">{o.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {alerts.unpaidInvoices.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-yellow-700 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {locale === 'ko' ? `미납 인보이스 (${alerts.unpaidInvoices.length}건)` : `Unpaid Invoices (${alerts.unpaidInvoices.length})`}
                </h3>
                <div className="space-y-2">
                  {alerts.unpaidInvoices.map((inv: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-white rounded p-2">
                      <span className="font-semibold text-gray-800">{inv.invoiceNumber}</span>
                      <span className="text-gray-600">{inv.customer}</span>
                      <span className="text-gray-800 font-medium">${Number(inv.totalAmount||0).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
                      <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-bold">{inv.branch_code || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {alerts.inTransitShipments.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  {locale === 'ko' ? `운송중 배송 (${alerts.inTransitShipments.length}건)` : `In-Transit Shipments (${alerts.inTransitShipments.length})`}
                </h3>
                <div className="space-y-2">
                  {alerts.inTransitShipments.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-white rounded p-2">
                      <span className="font-semibold text-gray-800">{s.shipmentNumber}</span>
                      <span className="text-gray-600">{s.orderNumber}</span>
                      <span className="text-blue-600">{s.destination}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">{s.currentStatus}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Production Orders */}
        {recentOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-orange-500" />
              {locale === 'ko' ? '최근 생산 주문' : 'Recent Production Orders'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500">
                    <th className="text-left py-2 px-2">{locale === 'ko' ? 'PDO 번호' : 'PDO No.'}</th>
                    <th className="text-left py-2 px-2">{locale === 'ko' ? '제품명' : 'Product'}</th>
                    <th className="text-right py-2 px-2">{locale === 'ko' ? '수량' : 'Qty'}</th>
                    <th className="text-left py-2 px-2">{locale === 'ko' ? '상태' : 'Status'}</th>
                    <th className="text-left py-2 px-2">{locale === 'ko' ? '납기일' : 'Due Date'}</th>
                    <th className="text-left py-2 px-2">{locale === 'ko' ? '우선순위' : 'Priority'}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 font-semibold text-gray-800 text-xs">{o.pdoNo}</td>
                      <td className="py-2 px-2 text-gray-700">{o.product_name}</td>
                      <td className="py-2 px-2 text-right">{Number(o.quantity_ordered||0)} {o.unit}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          o.status === 'completed' ? 'bg-green-100 text-green-700' :
                          o.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{o.status}</span>
                      </td>
                      <td className="py-2 px-2 text-gray-600 text-xs">{o.due_date}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          o.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          o.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{o.priority}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuCards.map((card, index) => {
            const Icon = card.icon;
            const isExternal = card.external;
            
            if (isExternal) {
              return (
                <a
                  key={index}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group block"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                          {card.title}
                        </h3>
                        {card.count !== null && (
                          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                            {card.count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </a>
              );
            }
            
            return (
              <button
                key={index}
                onClick={() => router.push(card.href)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {card.title}
                      </h3>
                      {card.count !== null && (
                        <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                          {card.count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {card.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
