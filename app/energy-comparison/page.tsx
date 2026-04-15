'use client';

import { Zap, TrendingDown, TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { translations } from '@/translations';

export default function EnergyComparisonPage() {
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Current comparison data
  const currentData = {
    before: [45, 52, 48, 55, 58, 54, 60, 56, 59, 62, 58, 61],
    after: [32, 35, 33, 38, 40, 37, 42, 39, 41, 43, 40, 42],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  // Cost comparison data
  const costData = {
    before: [450, 520, 480, 550, 580, 540, 600, 560, 590, 620, 580, 610],
    after: [320, 350, 330, 380, 400, 370, 420, 390, 410, 430, 400, 420],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  // Calculate savings
  const totalBeforeCurrent = currentData.before.reduce((a, b) => a + b, 0);
  const totalAfterCurrent = currentData.after.reduce((a, b) => a + b, 0);
  const currentSavings = ((totalBeforeCurrent - totalAfterCurrent) / totalBeforeCurrent * 100).toFixed(1);

  const totalBeforeCost = costData.before.reduce((a, b) => a + b, 0);
  const totalAfterCost = costData.after.reduce((a, b) => a + b, 0);
  const costSavings = totalBeforeCost - totalAfterCost;
  const costSavingsPercent = ((costSavings / totalBeforeCost) * 100).toFixed(1);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/Korea/Admin-Login" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.energyComparison}</h1>
        <p className="text-gray-600">{t.energyComparisonDesc}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <TrendingDown className="w-4 h-4 mr-1" />
              {currentSavings}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalAfterCurrent}A</div>
          <div className="text-sm text-gray-600">{t.avgCurrentAfter}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
            <span className="flex items-center text-red-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              High
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalBeforeCurrent}A</div>
          <div className="text-sm text-gray-600">{t.avgCurrentBefore}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm font-medium">
              <TrendingDown className="w-4 h-4 mr-1" />
              {costSavingsPercent}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">${totalAfterCost}</div>
          <div className="text-sm text-gray-600">{t.totalCostAfter}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-purple-600 font-medium">{t.saved}</span>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">${costSavings}</div>
          <div className="text-sm text-gray-600">{t.totalSavings}</div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{t.timePeriod}</span>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'daily', label: t.daily },
              { key: 'weekly', label: t.weekly },
              { key: 'monthly', label: t.monthly },
              { key: 'yearly', label: t.yearly }
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t.currentComparison}</h2>
            <p className="text-sm text-gray-600 mt-1">{t.currentComparisonDesc}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">{t.beforeInstallation}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">{t.afterInstallation}</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-80 flex items-end justify-between gap-1">
          {currentData.months.map((month, index) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 items-end h-64">
                {/* Before bar */}
                <div className="flex-1 bg-red-100 rounded-t relative group hover:bg-red-200 transition-colors">
                  <div 
                    className="bg-red-500 rounded-t absolute bottom-0 w-full transition-all"
                    style={{ height: `${(currentData.before[index] / 70) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {currentData.before[index]}A
                    </div>
                  </div>
                </div>
                {/* After bar */}
                <div className="flex-1 bg-green-100 rounded-t relative group hover:bg-green-200 transition-colors">
                  <div 
                    className="bg-green-500 rounded-t absolute bottom-0 w-full transition-all"
                    style={{ height: `${(currentData.after[index] / 70) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {currentData.after[index]}A
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600">{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t.costComparison}</h2>
            <p className="text-sm text-gray-600 mt-1">{t.costComparisonDesc}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-600">{t.beforeInstallation}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">{t.afterInstallation}</span>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-80 flex items-end justify-between gap-4 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-64 flex flex-col justify-between text-xs text-gray-500">
            <span>$700</span>
            <span>$525</span>
            <span>$350</span>
            <span>$175</span>
            <span>$0</span>
          </div>

          {/* Grid lines */}
          <div className="absolute left-12 right-0 top-0 h-64 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-gray-200 w-full"></div>
            ))}
          </div>

          {/* Chart area */}
          <div className="ml-12 flex-1 h-64 relative">
            <svg className="w-full h-full" preserveAspectRatio="none">
              {/* Before line */}
              <polyline
                points={costData.before.map((value, i) => 
                  `${(i / (costData.before.length - 1)) * 100}%,${100 - (value / 700) * 100}%`
                ).join(' ')}
                fill="none"
                stroke="#F97316"
                strokeWidth="3"
              />
              {/* After line */}
              <polyline
                points={costData.after.map((value, i) => 
                  `${(i / (costData.after.length - 1)) * 100}%,${100 - (value / 700) * 100}%`
                ).join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
              />
              {/* Data points - Before */}
              {costData.before.map((value, i) => (
                <circle
                  key={`before-${i}`}
                  cx={`${(i / (costData.before.length - 1)) * 100}%`}
                  cy={`${100 - (value / 700) * 100}%`}
                  r="4"
                  fill="#F97316"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>${value}</title>
                </circle>
              ))}
              {/* Data points - After */}
              {costData.after.map((value, i) => (
                <circle
                  key={`after-${i}`}
                  cx={`${(i / (costData.after.length - 1)) * 100}%`}
                  cy={`${100 - (value / 700) * 100}%`}
                  r="4"
                  fill="#3B82F6"
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>${value}</title>
                </circle>
              ))}
            </svg>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-4 pl-12">
          {costData.months.map((month) => (
            <span key={month} className="text-xs text-gray-600">{month}</span>
          ))}
        </div>
      </div>

      {/* Savings Summary */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border-2 border-green-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.savingsSummary}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">{t.currentReduction}</div>
                <div className="text-2xl font-bold text-green-600">{currentSavings}%</div>
                <div className="text-xs text-gray-500">{totalBeforeCurrent - totalAfterCurrent}A {t.saved.toLowerCase()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">{t.costReduction}</div>
                <div className="text-2xl font-bold text-green-600">{costSavingsPercent}%</div>
                <div className="text-xs text-gray-500">${costSavings} {t.saved.toLowerCase()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">{t.annualProjection}</div>
                <div className="text-2xl font-bold text-green-600">${costSavings}</div>
                <div className="text-xs text-gray-500">{t.basedOnCurrentYear}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
