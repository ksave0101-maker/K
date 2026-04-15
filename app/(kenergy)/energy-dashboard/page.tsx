'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { useSite } from '@/lib/SiteContext';
import { formatCurrencyBySite, getCurrencyCodeBySite } from '@/lib/currency';
import {
  Zap,
  TrendingDown,
  Leaf,
  DollarSign,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';

interface AnalyticsSummary {
  totalEnergySaved: number;
  totalCO2Saved: number;
  costSavings: number;
  reductionPercent: number;
  deviceCount: number;
  avgBefore: number;
  avgAfter: number;
}

interface DailyData {
  date: string;
  activeDevices: number;
  energySaved: number;
  co2Saved: number;
  avgBefore: number;
  avgAfter: number;
  avgPower: number;
}

export default function EnergyDashboardPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { selectedSite } = useSite();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('30'); // days

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/kenergy/energy-analytics?period=${period}&site=${selectedSite}`);
      const json = await res.json();

      if (json.success) {
        setSummary(json.data.summary);
        setDailyData(json.data.dailyData || []);
      } else {
        setError(json.error || 'Failed to load analytics');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [period, selectedSite]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !summary) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const stats = summary || {
    totalEnergySaved: 0,
    totalCO2Saved: 0,
    costSavings: 0,
    reductionPercent: 0,
    deviceCount: 0,
    avgBefore: 0,
    avgAfter: 0
  };
  const currencyCode = getCurrencyCodeBySite(selectedSite, locale);
  const costSavingsText = formatCurrencyBySite(stats.costSavings, selectedSite, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('energyAnalytics') || 'Energy Analytics'}
          </h1>
          <p className="text-gray-600">
            {t('trackEnergySavings') || 'Track your energy savings and environmental impact'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>

          <button
            onClick={fetchAnalytics}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Energy Saved */}
        <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">
                {t('totalEnergySaved') || 'Total Energy Saved'}
              </p>
              <p className="text-3xl font-bold text-orange-900">
                {stats.totalEnergySaved.toLocaleString()}
              </p>
              <p className="text-xs text-orange-600 mt-1">kWh</p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Cost Savings */}
        <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 mb-1">
                {t('costSavings') || 'Cost Savings'}
              </p>
              <p className="text-3xl font-bold text-amber-900">
                {costSavingsText}
              </p>
              <p className="text-xs text-amber-600 mt-1">{currencyCode}</p>
            </div>
            <div className="p-3 bg-amber-500 rounded-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* CO2 Reduction */}
        <div className="stat-card bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 mb-1">
                {t('co2Reduced') || 'CO₂ Reduced'}
              </p>
              <p className="text-3xl font-bold text-emerald-900">
                {stats.totalCO2Saved.toLocaleString()}
              </p>
              <p className="text-xs text-emerald-600 mt-1">kg</p>
            </div>
            <div className="p-3 bg-emerald-500 rounded-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Reduction Percentage */}
        <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">
                {t('energyReduction') || 'Energy Reduction'}
              </p>
              <p className="text-3xl font-bold text-orange-900">
                {stats.reductionPercent}%
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {t('compared') || 'vs. before optimization'}
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Before vs After Comparison */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t('beforeAfterComparison') || 'Before vs After Optimization'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-red-700">
                {t('beforeOptimization') || 'Before Optimization'}
              </h3>
              <Activity className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-4xl font-bold text-red-900">
              {stats.avgBefore.toLocaleString()}
            </p>
            <p className="text-sm text-red-600 mt-1">kWh average</p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-green-700">
                {t('afterOptimization') || 'After Optimization'}
              </h3>
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-4xl font-bold text-green-900">
              {stats.avgAfter.toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-1">kWh average</p>
          </div>
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t('dailyEnergyTrend') || 'Daily Energy Savings Trend'}
        </h2>

        {dailyData.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {t('noDataAvailable') || 'No data available for selected period'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">
                    {t('date') || 'Date'}
                  </th>
                  <th className="text-center p-3 text-sm font-semibold text-gray-700">
                    {t('activeDevices') || 'Active Devices'}
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">
                    {t('energySaved') || 'Energy Saved (kWh)'}
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">
                    {t('co2Saved') || 'CO₂ Saved (kg)'}
                  </th>
                  <th className="text-right p-3 text-sm font-semibold text-gray-700">
                    {t('avgPower') || 'Avg Power (kW)'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyData.map((day, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-sm text-gray-700">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm text-center font-medium text-blue-600">
                      {day.activeDevices}
                    </td>
                    <td className="p-3 text-sm text-right font-semibold text-yellow-600">
                      {day.energySaved.toLocaleString()}
                    </td>
                    <td className="p-3 text-sm text-right font-semibold text-green-600">
                      {day.co2Saved.toLocaleString()}
                    </td>
                    <td className="p-3 text-sm text-right text-gray-700">
                      {day.avgPower.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="p-3 text-sm font-semibold text-gray-800">
                    {t('total') || 'Total'}
                  </td>
                  <td className="p-3 text-sm text-center font-semibold text-blue-700">
                    {stats.deviceCount}
                  </td>
                  <td className="p-3 text-sm text-right font-bold text-yellow-700">
                    {stats.totalEnergySaved.toLocaleString()}
                  </td>
                  <td className="p-3 text-sm text-right font-bold text-green-700">
                    {stats.totalCO2Saved.toLocaleString()}
                  </td>
                  <td className="p-3 text-sm text-right text-gray-700">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t('viewMore') || 'View More Details'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/monitor')}
            className="k-btn flex items-center justify-center gap-3 p-4 bg-white hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300 rounded-lg transition-all"
          >
            <Activity className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-gray-700">
              {t('realTimeMonitoring') || 'Real-time Monitoring'}
            </span>
          </button>

          <button
            onClick={() => router.push('/overview')}
            className="k-btn flex items-center justify-center gap-3 p-4 bg-white hover:bg-amber-50 border-2 border-gray-200 hover:border-amber-300 rounded-lg transition-all"
          >
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-gray-700">
              {t('deviceOverview') || 'Device Overview'}
            </span>
          </button>

          <button
            onClick={() => router.push('/monitor/Compare-Monitoring')}
            className="k-btn flex items-center justify-center gap-3 p-4 bg-white hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300 rounded-lg transition-all"
          >
            <TrendingDown className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-gray-700">
              {t('compareAnalysis') || 'Compare Analysis'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
