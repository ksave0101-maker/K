'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CompanyLogo from '@/components/CompanyLogo';
import {
  ShoppingCart,
  Award,
  FileText,
  Receipt,
  CreditCard,
  TrendingUp,
  DollarSign,
  Users,
  ArrowLeft,
  BarChart3,
  Calendar,
  ClipboardList,
  History,
  Briefcase,
  Workflow,
  Shield,
} from 'lucide-react';

type MenuCard = { icon: any; title: string; description: string; href: string; color: string; count: number | null; external?: boolean };

export default function HRDashboardPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

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

  const stats = {
    totalRevenue: 128500000,
    totalExpenses: 87300000,
    netProfit: 41200000,
    pendingInvoices: 23,
  };

  const menuCards: MenuCard[] = [
    {
      icon: ShoppingCart,
      title: t.purchaseOrders,
      description: t.purchaseOrdersDesc,
      href: '/hr/purchase-orders',
      color: 'bg-blue-500',
      count: 45,
    },
    {
      icon: Award,
      title: t.salesOrders,
      description: t.salesOrdersDesc,
      href: '/hr/Certificate',
      color: 'bg-green-500',
      count: 38,
    },
    {
      icon: FileText,
      title: t.invoices,
      description: t.invoicesDesc,
      href: '/hr/invoices',
      color: 'bg-orange-500',
      count: 56,
    },
    {
      icon: Receipt,
      title: t.taxInvoices,
      description: t.taxInvoicesDesc,
      href: '/hr/tax-invoices',
      color: 'bg-red-500',
      count: 42,
    },
    {
      icon: CreditCard,
      title: t.billsList,
      description: t.billsListDesc,
      href: '/hr/bills',
      color: 'bg-purple-500',
      count: 31,
    },
    {
      icon: TrendingUp,
      title: t.revenueReports,
      description: t.revenueReportsDesc,
      href: '/hr/revenue-reports',
      color: 'bg-emerald-500',
      count: null,
    },
    {
      icon: DollarSign,
      title: t.expenses,
      description: t.expensesDesc,
      href: '/hr/expenses',
      color: 'bg-amber-500',
      count: null,
    },
    {
      icon: Users,
      title: t.employeesByDepartment,
      description: t.employeesByDepartmentDesc,
      href: '/hr/employees-by-department',
      color: 'bg-indigo-500',
      count: null,
    },
    {
      icon: DollarSign,
      title: t.salaryPayments,
      description: t.salaryPaymentsDesc,
      href: '/hr/salary-payments',
      color: 'bg-teal-500',
      count: null,
    },
    {
      icon: History,
      title: t.employeeHistory,
      description: t.employeeHistoryDesc,
      href: '/hr/employee-history',
      color: 'bg-violet-500',
      count: null,
    },
    {
      icon: Briefcase,
      title: t.executiveOrders,
      description: t.executiveOrdersDesc,
      href: '/hr/executive-orders',
      color: 'bg-pink-500',
      count: null,
    },
    {
      icon: Workflow,
      title: t.flowSystem,
      description: t.flowSystemDesc,
      href: 'https://flow.team/signin.act',
      color: 'bg-cyan-500',
      count: null,
      external: true,
    },
    {
      icon: Shield,
      title: t.adminSupport,
      description: t.adminSupportDesc,
      href: '/admin-support/hr',
      color: 'bg-purple-500',
      count: null,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/Korea/Admin-Login')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {t.hrDashboard}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t.hrDepartmentDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {mounted && currentUser && (
                <div className="px-4 py-2 rounded-lg bg-blue-50 border-2 border-blue-200 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalRevenue}</p>
                <p className="text-2xl font-bold text-green-600">₩{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalExpenses}</p>
                <p className="text-2xl font-bold text-red-600">₩{formatCurrency(stats.totalExpenses)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.netProfit}</p>
                <p className="text-2xl font-bold text-blue-600">₩{formatCurrency(stats.netProfit)}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.pendingInvoices}</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingInvoices}</p>
              </div>
              <FileText className="w-12 h-12 text-orange-500" />
            </div>
          </div>
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
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group block"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {card.title}
                        </h3>
                        {card.count !== null && (
                          <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
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
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {card.title}
                      </h3>
                      {card.count !== null && (
                        <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
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
