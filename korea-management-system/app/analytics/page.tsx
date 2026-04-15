'use client';

import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users as UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AnalyticsPage() {
  const { locale } = useLocale();
  const t = translations[locale];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                {t.back}
              </Link>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">{t.statisticsAndAnalytics}</h1>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">₩45.2억</div>
            <div className="text-sm text-gray-600">{t.totalRevenue}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.2%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">2,847</div>
            <div className="text-sm text-gray-600">{t.orderCount}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-1" />
                +15.3%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">18,234</div>
            <div className="text-sm text-gray-600">{t.activeUsers}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="flex items-center text-red-600 text-sm font-medium">
                <TrendingDown className="w-4 h-4 mr-1" />
                -2.4%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">67.8%</div>
            <div className="text-sm text-gray-600">{t.conversionRate}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.monthlyRevenueTrend}</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {[65, 75, 85, 70, 90, 95, 88, 92, 87, 94, 98, 100].map((height, index) => (
                <div key={index} className="flex-1 bg-purple-100 hover:bg-purple-200 rounded-t transition-colors relative group">
                  <div 
                    className="bg-purple-600 rounded-t absolute bottom-0 w-full transition-all"
                    style={{ height: `${height}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {height}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>1월</span>
              <span>6월</span>
              <span>12월</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 분포</h3>
            <div className="space-y-4">
              {[
                { name: '전자제품', value: 35, color: 'bg-blue-600' },
                { name: '의류', value: 25, color: 'bg-green-600' },
                { name: '식품', value: 20, color: 'bg-yellow-600' },
                { name: '가구', value: 12, color: 'bg-purple-600' },
                { name: '기타', value: 8, color: 'bg-gray-600' },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
          <div className="space-y-4">
            {[
              { action: '신규 주문', detail: '주문 #12847', time: '5분 전', color: 'bg-blue-100 text-blue-800' },
              { action: '재고 부족', detail: '제품 SKU-4523', time: '15분 전', color: 'bg-red-100 text-red-800' },
              { action: '사용자 등록', detail: '김민준', time: '1시간 전', color: 'bg-green-100 text-green-800' },
              { action: '리뷰 작성', detail: '제품 #8942', time: '2시간 전', color: 'bg-purple-100 text-purple-800' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${activity.color}`}>
                    {activity.action}
                  </span>
                  <span className="text-gray-700">{activity.detail}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
