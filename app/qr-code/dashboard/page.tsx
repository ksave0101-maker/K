'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  ScanLine,
  PlusCircle,
  List,
  BarChart3,
  History,
  ArrowLeft,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
} from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CompanyLogo from '@/components/CompanyLogo';

export default function QRCodeDashboardPage() {
  const router = useRouter();
  const { locale } = useLocale();

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('k_system_admin_user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch {
        // ignore
      }
    }
  }, []);

  const stats = [
    {
      label: locale === 'ko' ? '총 QR 코드' : 'Total QR Codes',
      value: '1,248',
      icon: QrCode,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: locale === 'ko' ? '오늘 스캔' : 'Scans Today',
      value: '342',
      icon: ScanLine,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: locale === 'ko' ? '활성 코드' : 'Active Codes',
      value: '987',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: locale === 'ko' ? '만료됨' : 'Expired',
      value: '261',
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  const menuCards = [
    {
      icon: PlusCircle,
      title: locale === 'ko' ? 'QR 코드 생성' : 'Generate QR Code',
      description:
        locale === 'ko'
          ? '새로운 QR 코드를 생성하고 설정합니다'
          : 'Create and configure new QR codes',
      href: '/qr-code/generate',
      color: 'bg-rose-500',
    },
    {
      icon: ScanLine,
      title: locale === 'ko' ? 'QR 코드 스캔' : 'Scan QR Code',
      description:
        locale === 'ko'
          ? '카메라로 QR 코드를 스캔합니다'
          : 'Scan QR codes using camera',
      href: '/qr-code/scan',
      color: 'bg-blue-500',
    },
    {
      icon: List,
      title: locale === 'ko' ? '코드 목록' : 'Code List',
      description:
        locale === 'ko'
          ? '모든 QR 코드 목록을 관리합니다'
          : 'Manage all QR code entries',
      href: '/qr-code/list',
      color: 'bg-green-500',
    },
    {
      icon: History,
      title: locale === 'ko' ? '스캔 이력' : 'Scan History',
      description:
        locale === 'ko'
          ? 'QR 코드 스캔 이력을 확인합니다'
          : 'View QR code scan history',
      href: '/qr-code/history',
      color: 'bg-indigo-500',
    },
    {
      icon: BarChart3,
      title: locale === 'ko' ? '통계 및 분석' : 'Statistics & Analytics',
      description:
        locale === 'ko'
          ? '스캔 데이터 및 사용 통계를 분석합니다'
          : 'Analyze scan data and usage statistics',
      href: '/qr-code/analytics',
      color: 'bg-purple-500',
    },
    {
      icon: Download,
      title: locale === 'ko' ? '일괄 내보내기' : 'Bulk Export',
      description:
        locale === 'ko'
          ? 'QR 코드를 이미지로 일괄 다운로드합니다'
          : 'Bulk download QR codes as images',
      href: '/qr-code/export',
      color: 'bg-teal-500',
    },
    {
      icon: Settings,
      title: locale === 'ko' ? '시스템 설정' : 'System Settings',
      description:
        locale === 'ko'
          ? 'QR 코드 시스템 설정을 관리합니다'
          : 'Configure QR code system settings',
      href: '/qr-code/settings',
      color: 'bg-gray-500',
    },
  ];

  const recentActivity = [
    {
      code: 'QR-2026-0001',
      action: locale === 'ko' ? '스캔됨' : 'Scanned',
      time: '2 min ago',
      status: 'success',
    },
    {
      code: 'QR-2026-0045',
      action: locale === 'ko' ? '생성됨' : 'Generated',
      time: '15 min ago',
      status: 'new',
    },
    {
      code: 'QR-2026-0023',
      action: locale === 'ko' ? '만료됨' : 'Expired',
      time: '1 hour ago',
      status: 'expired',
    },
    {
      code: 'QR-2026-0089',
      action: locale === 'ko' ? '스캔됨' : 'Scanned',
      time: '2 hours ago',
      status: 'success',
    },
    {
      code: 'QR-2026-0102',
      action: locale === 'ko' ? '비활성화됨' : 'Deactivated',
      time: '3 hours ago',
      status: 'inactive',
    },
  ];

  const statusColor: Record<string, string> = {
    success: 'text-green-600 bg-green-50',
    new: 'text-blue-600 bg-blue-50',
    expired: 'text-orange-600 bg-orange-50',
    inactive: 'text-gray-600 bg-gray-100',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CompanyLogo size="lg" />
              <div className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-center gap-2">
                  <div className="bg-rose-500 p-1.5 rounded-lg">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-lg font-bold text-rose-600">
                    {locale === 'ko' ? 'QR CODE 시스템' : 'QR Code System'}
                  </h1>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {locale === 'ko'
                    ? 'QR 코드 생성 · 스캔 · 추적 관리'
                    : 'Generation · Scanning · Tracking Management'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link
                href="/korea-main"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {locale === 'ko' ? '메인으로' : 'Back to Main'}
              </Link>
              {currentUser && (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-rose-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-800">{currentUser.name}</div>
                    <div className="text-xs text-gray-500">{currentUser.username}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {locale === 'ko' ? 'QR CODE 관리 대시보드' : 'QR Code Management Dashboard'}
          </h2>
          <p className="text-gray-500 mt-1">
            {locale === 'ko'
              ? 'QR 코드를 생성, 관리 및 추적하세요'
              : 'Create, manage and track your QR codes'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Cards */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {locale === 'ko' ? '기능 메뉴' : 'Features'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menuCards.map((card, i) => (
                <Link
                  key={i}
                  href={card.href}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 group hover:-translate-y-1 block"
                >
                  <div
                    className={`w-11 h-11 ${card.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">{card.title}</h4>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {locale === 'ko' ? '최근 활동' : 'Recent Activity'}
            </h3>
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{item.code}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[item.status]}`}
                        >
                          {item.action}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/qr-code/history"
                className="mt-4 block text-center text-sm text-rose-600 hover:text-rose-700 font-medium"
              >
                {locale === 'ko' ? '전체 이력 보기 →' : 'View all history →'}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            QR Code System — Korea Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
