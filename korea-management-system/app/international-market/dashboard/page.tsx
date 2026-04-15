'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CountryFlag from '@/components/CountryFlag';
import {
  ClipboardCheck,
  Zap,
  Search,
  FileSignature,
  TestTube2,
  BarChart3,
  ArrowLeft,
  Globe,
  TrendingUp,
  Building2,
  DollarSign,
  FileText,
  MapPin,
  Activity,
  Workflow,
  Shield,
} from 'lucide-react';

export default function InternationalMarketDashboardPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedBranch, setSelectedBranch] = useState('all');

  const branches = [
    { id: 'all', name: locale === 'ko' ? '전체 지점' : 'All Branches', country: 'All', countryCode: null as null },
    { id: 'vietnam', name: locale === 'ko' ? '베트남 지점' : 'Vietnam Branch', country: 'Vietnam', countryCode: 'VN' as const },
    { id: 'thailand', name: locale === 'ko' ? '태국 지점' : 'Thailand Branch', country: 'Thailand', countryCode: 'TH' as const },
    { id: 'brunei', name: locale === 'ko' ? '브루나이 지점' : 'Brunei Branch', country: 'Brunei', countryCode: 'BN' as const },
  ];

  const branchData: Record<string, any> = {
    all: {
      salesApprovals: 35,
      electricityCost: 22,
      siteInspection: 25,
      salesContracts: 27,
      equipmentTest: 20,
      quotations: 38,
      totalSales: 66700000,
      pendingApprovals: 9,
    },
    vietnam: {
      salesApprovals: 12,
      electricityCost: 8,
      siteInspection: 9,
      salesContracts: 10,
      equipmentTest: 7,
      quotations: 14,
      totalSales: 23400000,
      pendingApprovals: 3,
    },
    thailand: {
      salesApprovals: 15,
      electricityCost: 9,
      siteInspection: 11,
      salesContracts: 12,
      equipmentTest: 8,
      quotations: 16,
      totalSales: 28600000,
      pendingApprovals: 4,
    },
    brunei: {
      salesApprovals: 8,
      electricityCost: 5,
      siteInspection: 5,
      salesContracts: 5,
      equipmentTest: 5,
      quotations: 8,
      totalSales: 14700000,
      pendingApprovals: 2,
    },
  };

  const currentData = branchData[selectedBranch];

  const stats = {
    totalBranches: selectedBranch === 'all' ? 3 : 1,
    totalSales: currentData.totalSales,
    pendingApprovals: currentData.pendingApprovals,
    activeContracts: currentData.salesContracts,
  };

  const menuCards: Array<{
    icon: typeof Workflow;
    title: string;
    description: string;
    href: string;
    color: string;
    count: number | null;
    external?: boolean;
  }> = [
    {
      icon: ClipboardCheck,
      title: locale === 'ko' ? '판매 승인' : 'Sales Approvals',
      description: locale === 'ko' ? '지점별 판매 승인 양식 관리' : 'Manage sales approval forms per branch',
      href: '/international-market/sales-approvals',
      color: 'bg-blue-500',
      count: currentData.salesApprovals,
    },
    {
      icon: Zap,
      title: locale === 'ko' ? '전기료 계산' : 'Electricity Cost Calculation',
      description: locale === 'ko' ? '지점별 전기료 계산' : 'Electricity cost calculation per branch',
      href: '/international-market/electricity-calc',
      color: 'bg-yellow-500',
      count: currentData.electricityCost,
    },
    {
      icon: Search,
      title: locale === 'ko' ? '현장 사전 점검' : 'Pre-installation Site Inspection',
      description: locale === 'ko' ? '지점별 설치 전 현장 점검 보고서' : 'Pre-installation site inspection reports per branch',
      href: '/international-market/site-inspection',
      color: 'bg-green-500',
      count: currentData.siteInspection,
    },
    {
      icon: FileSignature,
      title: locale === 'ko' ? '판매 계약' : 'Sales Contracts',
      description: locale === 'ko' ? '지점별 판매 계약 관리' : 'Manage sales contracts per branch',
      href: '/international-market/sales-contracts',
      color: 'bg-purple-500',
      count: currentData.salesContracts,
    },
    {
      icon: TestTube2,
      title: locale === 'ko' ? '장비 테스트 보고서' : 'Equipment Test Report',
      description: locale === 'ko' ? '지점별 설치 전 장비 테스트 보고서' : 'Pre-installation equipment test reports per branch',
      href: '/international-market/equipment-test',
      color: 'bg-red-500',
      count: currentData.equipmentTest,
    },
    {
      icon: Activity,
      title: locale === 'ko' ? 'KSAVE 설치전 전류분석' : 'Pre-Installation Current Analysis',
      description: locale === 'ko' ? '설치전 전류측정 및 L1 L2 L3 N 분석' : 'Pre-installation current measurement and L1 L2 L3 N analysis',
      href: '/international-market/pre-installation-analysis',
      color: 'bg-orange-500',
      count: null,
    },
    {
      icon: Globe,
      title: t.internationalShipments,
      description: t.internationalShipmentsDesc,
      href: '/international-market/international-shipments',
      color: 'bg-teal-500',
      count: null,
    },
    {
      icon: FileText,
      title: locale === 'ko' ? '견적서' : 'Quotations',
      description: locale === 'ko' ? '지점별 견적서 관리 및 추적' : 'Quotation management and tracking per branch',
      href: '/international-market/quotations',
      color: 'bg-indigo-500',
      count: currentData.quotations,
    },
    {
      icon: BarChart3,
      title: locale === 'ko' ? '판매 및 비용 보고서' : 'Sales & Expense Reports',
      description: locale === 'ko' ? '지점별 판매 및 비용 업데이트 보고서' : 'Sales and expense update reports per branch',
      href: '/international-market/sales-expense-reports',
      color: 'bg-emerald-500',
      count: null,
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
      href: '/admin-support/international-market',
      color: 'bg-purple-500',
      count: null,
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-purple-600 hover:text-purple-800 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {t.internationalMarketDashboard}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t.internationalMarketDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Branch Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              {locale === 'ko' ? '지점 선택' : 'Select Branch'}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedBranch === branch.id
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    {branch.countryCode ? (
                      <CountryFlag country={branch.countryCode} size="xl" />
                    ) : (
                      <Globe className="w-10 h-10 text-purple-600" />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{branch.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{branch.country}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedBranch === 'all' 
              ? (locale === 'ko' ? '전체 지점 통계' : 'All Branches Statistics')
              : `${branches.find(b => b.id === selectedBranch)?.name} ${locale === 'ko' ? '통계' : 'Statistics'}`
            }
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalBranches}</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalBranches}</p>
              </div>
              <Building2 className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalSales}</p>
                <p className="text-2xl font-bold text-green-600">₩{formatCurrency(stats.totalSales)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.pending}</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingApprovals}</p>
              </div>
              <FileText className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.salesContracts}</p>
                <p className="text-3xl font-bold text-blue-600">{stats.activeContracts}</p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Branch Comparison Charts - Only show when All Branches selected */}
        {selectedBranch === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Comparison Bar Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                {locale === 'ko' ? '지점별 매출 비교' : 'Sales Comparison by Branch'}
              </h3>
              <div className="space-y-4">
                {branches.filter(b => b.id !== 'all').map((branch) => {
                  const data = branchData[branch.id];
                  const maxSales = Math.max(...branches.filter(b => b.id !== 'all').map(b => branchData[b.id].totalSales));
                  const percentage = (data.totalSales / maxSales) * 100;
                  
                  return (
                    <div key={branch.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {branch.countryCode && <CountryFlag country={branch.countryCode} size="sm" />}
                          <span className="text-sm font-medium text-gray-700">{branch.country}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">₩{formatCurrency(data.totalSales)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity Comparison Radar-style */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                {locale === 'ko' ? '지점별 활동 비교' : 'Activity Comparison by Branch'}
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'salesApprovals', label: locale === 'ko' ? '판매 승인' : 'Sales Approvals', color: 'blue' },
                  { key: 'siteInspection', label: locale === 'ko' ? '현장 점검' : 'Site Inspections', color: 'green' },
                  { key: 'salesContracts', label: locale === 'ko' ? '판매 계약' : 'Sales Contracts', color: 'purple' },
                  { key: 'equipmentTest', label: locale === 'ko' ? '장비 테스트' : 'Equipment Tests', color: 'red' },
                ].map((metric) => {
                  const total = branches.filter(b => b.id !== 'all').reduce((sum, b) => sum + branchData[b.id][metric.key], 0);
                  
                  return (
                    <div key={metric.key}>
                      <div className="text-xs font-medium text-gray-600 mb-1">{metric.label} (Total: {total})</div>
                      <div className="flex gap-1">
                        {branches.filter(b => b.id !== 'all').map((branch) => {
                          const value = branchData[branch.id][metric.key];
                          const percentage = (value / total) * 100;
                          
                          return (
                            <div 
                              key={branch.id}
                              className={`bg-${metric.color}-500 h-8 rounded flex items-center justify-center text-white text-xs font-bold transition-all hover:scale-105 cursor-pointer`}
                              style={{ width: `${percentage}%` }}
                              title={`${branch.country}: ${value}`}
                            >
                              {percentage > 15 && value}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Donut Chart for Market Share */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                {locale === 'ko' ? '시장 점유율' : 'Market Share'}
              </h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Simple Pie Chart using CSS */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {(() => {
                      const totalSales = branches.filter(b => b.id !== 'all').reduce((sum, b) => sum + branchData[b.id].totalSales, 0);
                      let currentAngle = 0;
                      const colors = ['#3b82f6', '#10b981', '#8b5cf6'];
                      
                      return branches.filter(b => b.id !== 'all').map((branch, index) => {
                        const value = branchData[branch.id].totalSales;
                        const percentage = (value / totalSales) * 100;
                        const angle = (percentage / 100) * 360;
                        
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;
                        currentAngle = endAngle;
                        
                        const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                        const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                        const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                        const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                        
                        const largeArc = angle > 180 ? 1 : 0;
                        
                        return (
                          <path
                            key={branch.id}
                            d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                            fill={colors[index % colors.length]}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        );
                      });
                    })()}
                    <circle cx="50" cy="50" r="20" fill="white" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {branches.filter(b => b.id !== 'all').map((branch, index) => {
                  const value = branchData[branch.id].totalSales;
                  const totalSales = branches.filter(b => b.id !== 'all').reduce((sum, b) => sum + branchData[b.id].totalSales, 0);
                  const percentage = ((value / totalSales) * 100).toFixed(1);
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                  
                  return (
                    <div key={branch.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}></div>
                        {branch.countryCode && <CountryFlag country={branch.countryCode} size="sm" />}
                        <span className="text-sm text-gray-700">{branch.country}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Metrics Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                {locale === 'ko' ? '지점별 성과 지표' : 'Branch Performance Metrics'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-gray-600">{locale === 'ko' ? '지점' : 'Branch'}</th>
                      <th className="text-center py-2 px-2 text-gray-600">{locale === 'ko' ? '승인' : 'Approvals'}</th>
                      <th className="text-center py-2 px-2 text-gray-600">{locale === 'ko' ? '계약' : 'Contracts'}</th>
                      <th className="text-center py-2 px-2 text-gray-600">{locale === 'ko' ? '대기' : 'Pending'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.filter(b => b.id !== 'all').map((branch) => {
                      const data = branchData[branch.id];
                      return (
                        <tr key={branch.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {branch.countryCode && <CountryFlag country={branch.countryCode} size="sm" />}
                              <span className="font-medium text-gray-800">{branch.country}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                              {data.salesApprovals}
                            </span>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">
                              {data.salesContracts}
                            </span>
                          </td>
                          <td className="text-center py-3 px-2">
                            <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                              {data.pendingApprovals}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Menu Cards Section Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedBranch === 'all' 
              ? (locale === 'ko' ? '전체 지점 메뉴' : 'All Branches Menu')
              : `${branches.find(b => b.id === selectedBranch)?.name} ${locale === 'ko' ? '메뉴' : 'Menu'}`
            }
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {locale === 'ko' 
              ? '아래 메뉴들은 선택한 지점의 데이터를 표시합니다' 
              : 'The menu items below show data for the selected branch'}
          </p>
        </div>

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
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                          {card.title}
                        </h3>
                        {card.count !== null && (
                          <span className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-1 rounded-full">
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
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                        {card.title}
                      </h3>
                      {card.count !== null && (
                        <span className="bg-purple-100 text-purple-600 text-xs font-bold px-2 py-1 rounded-full">
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
