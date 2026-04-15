'use client';

import { Home, Users, FileText, BarChart3, Settings, Bell, MapPin, Package, Headphones, Wrench, Briefcase, FlaskConical, MessageCircle, Globe, Network } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CountryFlag from '@/components/CountryFlag';
import CompanyLogo from '@/components/CompanyLogo';

export default function HomePage() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const t = translations[locale];

  const features = [
    { 
      icon: Briefcase, 
      title: t.executiveDepartment,
      description: t.executiveDepartmentDesc,
      href: '/login/executive',
      color: 'bg-slate-700'
    },
    { 
      icon: Users, 
      title: t.hrDepartment,
      description: t.hrDepartmentDesc,
      href: '/login/hr',
      color: 'bg-blue-500'
    },
    { 
      icon: FileText, 
      title: t.productionDepartment,
      description: t.productionDepartmentDesc,
      href: '/login/production',
      color: 'bg-green-500'
    },
    { 
      icon: BarChart3, 
      title: t.internationalMarketDepartment,
      description: t.internationalMarketDepartmentDesc,
      href: '/login/international-market',
      color: 'bg-purple-500'
    },
    { 
      icon: Package, 
      title: t.domesticMarketDepartment,
      description: t.domesticMarketDepartmentDesc,
      href: '/login/domestic-market',
      color: 'bg-orange-500'
    },
    { 
      icon: Bell, 
      title: t.qualityControlDepartment,
      description: t.qualityControlDepartmentDesc,
      href: '/login/quality-control',
      color: 'bg-yellow-500'
    },
    { 
      icon: Headphones, 
      title: t.afterSalesServiceDepartment,
      description: t.afterSalesServiceDepartmentDesc,
      href: '/login/after-sales',
      color: 'bg-teal-500'
    },
    { 
      icon: Wrench, 
      title: t.maintenanceDepartment,
      description: t.maintenanceDepartmentDesc,
      href: '/login/maintenance',
      color: 'bg-indigo-500'
    },
    { 
      icon: FlaskConical, 
      title: t.researchDevelopmentDepartment,
      description: t.researchDevelopmentDepartmentDesc,
      href: '/login/research-development',
      color: 'bg-cyan-500'
    },
    { 
      icon: Globe, 
      title: t.fileImageTranslator,
      description: t.translatorDescription,
      href: '/translator',
      color: 'bg-violet-500'
    },
    { 
      icon: Users, 
      title: locale === 'ko' ? '고객 관리 시스템' : 'Customer Management System',
      description: locale === 'ko' ? '고객 정보, 주문 이력 및 관계 관리' : 'Manage customer information, order history, and relationships',
      href: '/customers',
      color: 'bg-blue-600'
    },
    { 
      icon: MessageCircle, 
      title: t.aiAssistant,
      description: t.aiAssistantDesc,
      href: '/ai-assistant',
      color: 'bg-purple-500'
    },
    { 
      icon: MessageCircle, 
      title: t.bruneiChatRoomDepartment,
      description: t.bruneiChatRoomDepartmentDesc,
      href: '/chat/brunei-chat',
      color: 'bg-amber-500'
    },
    { 
      icon: MessageCircle, 
      title: t.logisticsDepartment,
      description: t.logisticsDepartmentDesc,
      href: '/chat/thailand-chat',
      color: 'bg-red-500'
    },
    { 
      icon: MessageCircle, 
      title: t.vietnamChatRoomDepartment,
      description: t.vietnamChatRoomDepartmentDesc,
      href: '/chat/vietnam-chat',
      color: 'bg-emerald-500'
    },
    { 
      icon: Network, 
      title: locale === 'ko' ? 'Flow 시스템 연결' : 'Connect to Flow System',
      description: locale === 'ko' ? 'Flow 워크플로우 시스템과 통합 및 연동' : 'Integration and connection with Flow workflow system',
      href: 'https://flow.team/signin.act',
      color: 'bg-pink-500',
      external: true
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              <CompanyLogo size="2xl" />
              
              {/* Company & System Info */}
              <div className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-blue-600">{t.companyName}</h1>
                  <CountryFlag country="KR" size="sm" />
                </div>
                <p className="text-xs text-gray-500 mb-1">{t.companySlogan}</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-700">{t.systemName}</h2>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-500">{t.systemNameSub}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <Link 
                href="/settings"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {locale === 'ko' ? '관리' : 'AD'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.welcome}</h2>
          <p className="text-lg text-gray-600">
            {t.welcomeMessage}
          </p>
        </div>

        {/* Departments Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.departments}</h3>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const cardContent = (
              <>
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </>
            );

            const cardClassName = "bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 group hover:-translate-y-1 block";

            return feature.external ? (
              <a
                key={index}
                href={feature.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClassName}
              >
                {cardContent}
              </a>
            ) : (
              <Link
                key={index}
                href={feature.href}
                className={cardClassName}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.systemOverview}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Employees */}
            <div className="text-center bg-blue-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">341</div>
              <div className="text-sm text-gray-600 font-medium">{t.totalEmployees}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <CountryFlag country="KR" size="sm" /> 156 •
                <CountryFlag country="BN" size="sm" /> 45 •
                <CountryFlag country="TH" size="sm" /> 78 •
                <CountryFlag country="VN" size="sm" /> 62
              </div>
            </div>
            
            {/* Top Profit Branches */}
            <div className="text-center bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 font-medium mb-2">{t.topProfitBranches}</div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <CountryFlag country="KR" size="md" />
                  <span className="text-lg font-bold text-green-600">
                    ₩{new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { 
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(42180000000)}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CountryFlag country="TH" size="md" />
                  <span className="text-lg font-bold text-green-600">
                    ฿{new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { 
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(67320000)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Top Expense Branches */}
            <div className="text-center bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 font-medium mb-2">{t.topExpenseBranches}</div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <CountryFlag country="KR" size="md" />
                  <span className="text-lg font-bold text-orange-600">
                    ₩{new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { 
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(116240000000)}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CountryFlag country="VN" size="md" />
                  <span className="text-lg font-bold text-orange-600">
                    ₫{new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { 
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(62230000000)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Total Branches */}
            <div className="text-center bg-purple-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600 mb-1">4</div>
              <div className="text-sm text-gray-600 font-medium">{t.totalBranches}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <CountryFlag country="KR" size="sm" />
                <CountryFlag country="BN" size="sm" />
                <CountryFlag country="TH" size="sm" />
                <CountryFlag country="VN" size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* International Branches Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.internationalBranches}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Korea Branch (HQ) */}
            <Link href="/branches/korea" className="border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="group-hover:scale-110 transition-transform">
                  <CountryFlag country="KR" size="xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{t.korea}</h4>
                  <p className="text-sm text-gray-500">Korea</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.employees}:</span>
                  <span className="font-semibold text-gray-900">156</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t.lastUpdate}:</p>
                  <p className="text-sm text-gray-700">{t.koreaUpdate}</p>
                </div>
              </div>
              <div className="text-xs text-gray-400">1 {t.dayAgo}</div>
            </Link>

            {/* Brunei Branch */}
            <Link href="/branches/brunei" className="border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="group-hover:scale-110 transition-transform">
                  <CountryFlag country="BN" size="xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{t.brunei}</h4>
                  <p className="text-sm text-gray-500">Brunei Darussalam</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.employees}:</span>
                  <span className="font-semibold text-gray-900">45</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t.lastUpdate}:</p>
                  <p className="text-sm text-gray-700">{t.bruneiUpdate}</p>
                </div>
              </div>
              <div className="text-xs text-gray-400">2 {t.daysAgo}</div>
            </Link>

            {/* Thailand Branch */}
            <Link href="/branches/thailand" className="border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="group-hover:scale-110 transition-transform">
                  <CountryFlag country="TH" size="xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{t.thailand}</h4>
                  <p className="text-sm text-gray-500">Thailand</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.employees}:</span>
                  <span className="font-semibold text-gray-900">78</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t.lastUpdate}:</p>
                  <p className="text-sm text-gray-700">{t.thailandUpdate}</p>
                </div>
              </div>
              <div className="text-xs text-gray-400">5 {t.daysAgo}</div>
            </Link>

            {/* Vietnam Branch */}
            <Link href="/branches/vietnam" className="border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="group-hover:scale-110 transition-transform">
                  <CountryFlag country="VN" size="xl" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{t.vietnam}</h4>
                  <p className="text-sm text-gray-500">Vietnam</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t.employees}:</span>
                  <span className="font-semibold text-gray-900">62</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t.lastUpdate}:</p>
                  <p className="text-sm text-gray-700">{t.vietnamUpdate}</p>
                </div>
              </div>
              <div className="text-xs text-gray-400">1 {t.weekAgo}</div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            {t.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
