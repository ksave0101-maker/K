'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { Book, User, Plus, Navigation, Settings, Bell, Monitor, Layout, MessagesSquare, BarChart, ExternalLink } from 'lucide-react';

export default function HelpDocsPage() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState('gettingStarted');

  const tabs = [
    { id: 'gettingStarted', label: t('gettingStarted'), icon: Book },
    { id: 'account', label: t('account'), icon: User },
    { id: 'addDevice', label: t('addDevice'), icon: Plus },
    { id: 'navigation', label: t('navigation'), icon: Navigation },
    { id: 'setting', label: t('setting'), icon: Settings },
    { id: 'notification', label: t('notification'), icon: Bell },
    { id: 'devices', label: t('devices'), icon: Monitor },
    { id: 'menuGuide', label: t('menuGuide'), icon: Layout },
    { id: 'configuration', label: t('configuration'), icon: Settings },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'reports', label: t('reports'), icon: BarChart },
    { id: 'line', label: 'LINE', icon: MessagesSquare },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {t('helpAndDocumentation')}
              </h1>
              <p className="text-sm text-gray-600">
                {t('momoSpacePlatformUserGuide')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ExternalLink className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="flex items-center overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        {activeTab === 'gettingStarted' && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Book className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-blue-600">{t('gettingStarted')}</h2>
              </div>
              <p className="text-gray-700 mb-6 text-lg">
                {t('systemUsageGuideDescription')}
              </p>
            </div>

            {/* System Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layout className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-600">{t('systemOverview')}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {t('systemOverviewDescription')}
              </p>
            </div>

            {/* Dashboard Interface */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboardInterface')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{t('headerBar')}</h4>
                    <p className="text-gray-700 text-sm">{t('headerBarDescription')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{t('sidebarMenu')}</h4>
                    <p className="text-gray-700 text-sm">{t('sidebarMenuDescription')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{t('mainContent')}</h4>
                    <p className="text-gray-700 text-sm">{t('mainContentDescription')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-700 mb-4">{t('keyFeatures')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-800">{t('deviceMonitoring')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('deviceMonitoringDescription')}</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-800">{t('dataVisualization')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('dataVisualizationDescription')}</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-800">{t('locationTracking')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('locationTrackingDescription')}</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-800">{t('alertSystem')}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{t('alertSystemDescription')}</p>
                </div>
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚀</span>
                <h3 className="text-lg font-semibold text-blue-600">{t('quickStartGuide')}</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{t('selectSite')}</h4>
                    <p className="text-gray-700 text-sm">{t('selectSiteDescription')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{t('viewDashboard')}</h4>
                    <p className="text-gray-700 text-sm">{t('viewDashboardDescription')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{t('monitorDevices')}</h4>
                    <p className="text-gray-700 text-sm">{t('monitorDevicesDescription')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{t('configureSettings')}</h4>
                    <p className="text-gray-700 text-sm">{t('configureSettingsDescription')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    5
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{t('setupNotifications')}</h4>
                    <p className="text-gray-700 text-sm">{t('setupNotificationsDescription')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Tips */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">{t('importantTips')}</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>{t('tip1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>{t('tip2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>{t('tip3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>{t('tip4')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Support Contact */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📞</span>
                <h3 className="text-lg font-semibold text-purple-700">{t('needHelp')}</h3>
              </div>
              <p className="text-gray-700 mb-4">{t('needHelpDescription')}</p>
              <div className="flex flex-wrap gap-3">
                <a href="/support-tickets" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  {t('submitTicket')}
                </a>
                <a href="/user-feedback" className="px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                  {t('sendFeedback')}
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'gettingStarted' && (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t('documentationComingSoon')}
            </h3>
            <p className="text-gray-600">
              {t('thisDocumentationSectionIsUnderDevelopment')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
