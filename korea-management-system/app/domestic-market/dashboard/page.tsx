'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  ClipboardCheck,
  Zap,
  Search,
  FileSignature,
  TestTube2,
  BarChart3,
  ArrowLeft,
  Package,
  TrendingUp,
  DollarSign,
  FileText,
  MapPin,
  Building2,
  Receipt,
  Activity,
  Truck,
  Workflow,
  Shield,
} from 'lucide-react';

export default function DomesticMarketDashboardPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedRegion, setSelectedRegion] = useState('all');

  const regions = [
    { id: 'all', name: locale === 'ko' ? '전체 지역' : 'All Regions', city: 'All', emoji: '🇰🇷' },
    { id: 'seoul', name: locale === 'ko' ? '서울' : 'Seoul', city: 'Seoul', emoji: '🏙️' },
    { id: 'busan', name: locale === 'ko' ? '부산' : 'Busan', city: 'Busan', emoji: '🌊' },
    { id: 'incheon', name: locale === 'ko' ? '인천' : 'Incheon', city: 'Incheon', emoji: '✈️' },
    { id: 'daegu', name: locale === 'ko' ? '대구' : 'Daegu', city: 'Daegu', emoji: '🏔️' },
    { id: 'gyeonggi', name: locale === 'ko' ? '경기' : 'Gyeonggi', city: 'Gyeonggi', emoji: '🏛️' },
  ];

  const regionData: Record<string, any> = {
    all: {
      salesApprovals: 35,
      electricityCost: 23,
      siteInspection: 28,
      salesContracts: 26,
      equipmentTest: 19,
      quotations: 42,
      invoices: 31,
      totalSales: 49300000000,
      pendingApprovals: 10,
    },
    seoul: {
      salesApprovals: 10,
      electricityCost: 6,
      siteInspection: 8,
      salesContracts: 8,
      equipmentTest: 5,
      quotations: 12,
      invoices: 9,
      totalSales: 15000000000,
      pendingApprovals: 3,
    },
    busan: {
      salesApprovals: 8,
      electricityCost: 5,
      siteInspection: 7,
      salesContracts: 6,
      equipmentTest: 4,
      quotations: 9,
      invoices: 7,
      totalSales: 11200000000,
      pendingApprovals: 2,
    },
    incheon: {
      salesApprovals: 6,
      electricityCost: 4,
      siteInspection: 4,
      salesContracts: 4,
      equipmentTest: 3,
      quotations: 6,
      invoices: 5,
      totalSales: 8100000000,
      pendingApprovals: 2,
    },
    daegu: {
      salesApprovals: 4,
      electricityCost: 3,
      siteInspection: 3,
      salesContracts: 3,
      equipmentTest: 3,
      quotations: 5,
      invoices: 4,
      totalSales: 5000000000,
      pendingApprovals: 1,
    },
    gyeonggi: {
      salesApprovals: 7,
      electricityCost: 5,
      siteInspection: 6,
      salesContracts: 5,
      equipmentTest: 4,
      quotations: 10,
      invoices: 6,
      totalSales: 10000000000,
      pendingApprovals: 2,
    },
  };

  const currentData = regionData[selectedRegion];

  const stats = {
    totalSales: currentData.totalSales,
    pendingApprovals: currentData.pendingApprovals,
    activeContracts: currentData.salesContracts,
    completedTests: currentData.equipmentTest,
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
      title: t.salesApprovals,
      description: t.domesticSalesApprovalsDesc,
      href: '/domestic-market/sales-approvals',
      color: 'bg-blue-500',
      count: currentData.salesApprovals,
    },
    {
      icon: Zap,
      title: t.electricityCostCalc,
      description: t.domesticElectricityCostCalcDesc,
      href: '/domestic-market/electricity-calc',
      color: 'bg-yellow-500',
      count: currentData.electricityCost,
    },
    {
      icon: Search,
      title: t.siteInspection,
      description: t.domesticSiteInspectionDesc,
      href: '/domestic-market/site-inspection',
      color: 'bg-green-500',
      count: currentData.siteInspection,
    },
    {
      icon: FileSignature,
      title: t.salesContracts,
      description: t.domesticSalesContractsDesc,
      href: '/domestic-market/sales-contracts',
      color: 'bg-purple-500',
      count: currentData.salesContracts,
    },
    {
      icon: TestTube2,
      title: t.equipmentTestReport,
      description: t.domesticEquipmentTestDesc,
      href: '/domestic-market/equipment-test',
      color: 'bg-red-500',
      count: currentData.equipmentTest,
    },
    {
      icon: Activity,
      title: locale === 'ko' ? 'KSAVE 설치전 전류분석' : 'Pre-Installation Current Analysis',
      description: locale === 'ko' ? '설치전 전류측정 및 L1 L2 L3 N 분석' : 'Pre-installation current measurement and L1 L2 L3 N analysis',
      href: '/domestic-market/pre-installation-analysis',
      color: 'bg-orange-500',
      count: null,
    },
    {
      icon: Truck,
      title: t.domesticShipments,
      description: t.domesticShipmentsDesc,
      href: '/domestic-market/domestic-shipments',
      color: 'bg-teal-500',
      count: null,
    },
    {
      icon: FileText,
      title: locale === 'ko' ? '견적서' : 'Quotations',
      description: locale === 'ko' ? '국내 시장 견적서 관리 및 추적' : 'Domestic market quotation management and tracking',
      href: '/domestic-market/quotations',
      color: 'bg-indigo-500',
      count: currentData.quotations,
    },
    {
      icon: Receipt,
      title: locale === 'ko' ? '인보이스' : 'Invoices',
      description: locale === 'ko' ? '국내 시장 인보이스 생성 및 관리' : 'Domestic market invoice generation and management',
      href: '/domestic-market/invoices',
      color: 'bg-cyan-500',
      count: currentData.invoices,
    },
    {
      icon: BarChart3,
      title: t.salesUpdateReports,
      description: t.domesticSalesReportsDesc,
      href: '/domestic-market/sales-reports',
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
      href: '/admin-support/domestic-market',
      color: 'bg-purple-500',
      count: null,
    },
  ];

  const formatCurrency = (value: number) => {
    return '₩' + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-orange-600 hover:text-orange-800 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {t.domesticMarketDashboard}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t.domesticMarketDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇰🇷</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Region Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              {locale === 'ko' ? '지역 선택' : 'Select Region'}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedRegion === region.id
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{region.emoji}</div>
                  <div className="text-sm font-semibold text-gray-800">{region.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{region.city}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedRegion === 'all' 
              ? (locale === 'ko' ? '전체 지역 통계' : 'All Regions Statistics')
              : `${regions.find(r => r.id === selectedRegion)?.name} ${locale === 'ko' ? '통계' : 'Statistics'}`
            }
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalSales}</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalSales)}</p>
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

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.equipmentTestReport}</p>
                <p className="text-3xl font-bold text-purple-600">{stats.completedTests}</p>
              </div>
              <TestTube2 className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Regional Comparison Charts - Only show when All Regions selected */}
        {selectedRegion === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Comparison Bar Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                {locale === 'ko' ? '지역별 매출 비교' : 'Sales Comparison by Region'}
              </h3>
              <div className="space-y-4">
                {regions.filter(r => r.id !== 'all').map((region) => {
                  const data = regionData[region.id];
                  const maxSales = Math.max(...regions.filter(r => r.id !== 'all').map(r => regionData[r.id].totalSales));
                  const percentage = (data.totalSales / maxSales) * 100;
                  
                  return (
                    <div key={region.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{region.emoji}</span>
                          <span className="text-sm font-medium text-gray-700">{region.city}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(data.totalSales)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity Comparison */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                {locale === 'ko' ? '지역별 활동 비교' : 'Activity Comparison by Region'}
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'salesApprovals', label: locale === 'ko' ? '판매 승인' : 'Sales Approvals', color: 'blue' },
                  { key: 'siteInspection', label: locale === 'ko' ? '현장 점검' : 'Site Inspections', color: 'green' },
                  { key: 'salesContracts', label: locale === 'ko' ? '판매 계약' : 'Sales Contracts', color: 'purple' },
                  { key: 'equipmentTest', label: locale === 'ko' ? '장비 테스트' : 'Equipment Tests', color: 'red' },
                ].map((metric) => {
                  const total = regions.filter(r => r.id !== 'all').reduce((sum, r) => sum + regionData[r.id][metric.key], 0);
                  
                  return (
                    <div key={metric.key}>
                      <div className="text-xs font-medium text-gray-600 mb-1">{metric.label} (Total: {total})</div>
                      <div className="flex gap-1">
                        {regions.filter(r => r.id !== 'all').map((region) => {
                          const value = regionData[region.id][metric.key];
                          const percentage = (value / total) * 100;
                          
                          return (
                            <div 
                              key={region.id}
                              className={`bg-${metric.color}-500 h-8 rounded flex items-center justify-center text-white text-xs font-bold transition-all hover:scale-105 cursor-pointer`}
                              style={{ width: `${percentage}%` }}
                              title={`${region.city}: ${value}`}
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
                {locale === 'ko' ? '지역별 시장 점유율' : 'Regional Market Share'}
              </h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {(() => {
                      const totalSales = regions.filter(r => r.id !== 'all').reduce((sum, r) => sum + regionData[r.id].totalSales, 0);
                      let currentAngle = 0;
                      const colors = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6'];
                      
                      return regions.filter(r => r.id !== 'all').map((region, index) => {
                        const value = regionData[region.id].totalSales;
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
                            key={region.id}
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
                {regions.filter(r => r.id !== 'all').map((region, index) => {
                  const value = regionData[region.id].totalSales;
                  const totalSales = regions.filter(r => r.id !== 'all').reduce((sum, r) => sum + regionData[r.id].totalSales, 0);
                  const percentage = ((value / totalSales) * 100).toFixed(1);
                  const colors = ['bg-orange-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500'];
                  
                  return (
                    <div key={region.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}></div>
                        <span className="text-xl">{region.emoji}</span>
                        <span className="text-sm text-gray-700">{region.city}</span>
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
                {locale === 'ko' ? '지역별 성과 지표' : 'Regional Performance Metrics'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-gray-600">{locale === 'ko' ? '지역' : 'Region'}</th>
                      <th className="text-center py-2 px-2 text-gray-600">{locale === 'ko' ? '승인' : 'Approvals'}</th>
                      <th className="text-center py-2 px-2 text-gray-600">{locale === 'ko' ? '계약' : 'Contracts'}</th>
                      <th className="text-center py-2 px-2 text-gray-600">{locale === 'ko' ? '대기' : 'Pending'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.filter(r => r.id !== 'all').map((region) => {
                      const data = regionData[region.id];
                      return (
                        <tr key={region.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{region.emoji}</span>
                              <span className="font-medium text-gray-800">{region.city}</span>
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
