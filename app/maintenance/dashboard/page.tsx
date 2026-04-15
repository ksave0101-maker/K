'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  Wrench,
  CalendarCheck,
  Hammer,
  Box,
  History,
  ArrowLeft,
  CheckCircle,
  Clock,
  Activity,
  Workflow,
  Shield,
  Users,
} from 'lucide-react';

type MenuCard = { icon: any; title: string; description: string; href: string; color: string; count: number | null; external?: boolean };

export default function MaintenanceDashboardPage() {
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
    scheduledMaintenance: 18,
    completedRepairs: 89,
    pendingParts: 7,
    equipmentUptime: 98.5,
  };

  const menuCards: MenuCard[] = [
    {
      icon: CalendarCheck,
      title: t.preventiveMaintenance,
      description: t.preventiveMaintenanceDesc,
      href: '/maintenance/preventive',
      color: 'bg-blue-500',
      count: stats.scheduledMaintenance,
    },
    {
      icon: Hammer,
      title: t.repairRequests,
      description: t.repairRequestsDesc,
      href: '/maintenance/repair-requests',
      color: 'bg-red-500',
      count: 12,
    },
    {
      icon: Box,
      title: t.spareParts,
      description: t.sparePartsDesc,
      href: '/maintenance/spare-parts',
      color: 'bg-green-500',
      count: stats.pendingParts,
    },
    {
      icon: History,
      title: t.maintenanceHistory,
      description: t.maintenanceHistoryDesc,
      href: '/maintenance/history',
      color: 'bg-purple-500',
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
      href: '/admin-support/maintenance',
      color: 'bg-purple-500',
      count: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/Korea/Admin-Login')} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t.maintenanceDashboard}</h1>
                    <p className="text-sm text-gray-600">{t.maintenanceDashboardDesc}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {mounted && currentUser && (
                <div className="px-4 py-2 rounded-lg bg-indigo-50 border-2 border-indigo-200 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">
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
                <p className="text-sm text-gray-600">{t.scheduledMaintenance}</p>
                <p className="text-3xl font-bold text-blue-600">{stats.scheduledMaintenance}</p>
              </div>
              <CalendarCheck className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.completedRepairs}</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedRepairs}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.pendingParts}</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingParts}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.equipmentUptime}</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.equipmentUptime}%</p>
              </div>
              <Activity className="w-12 h-12 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{card.title}</h3>
                        {card.count !== null && (
                          <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">{card.count}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{card.description}</p>
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
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{card.title}</h3>
                      {card.count !== null && (
                        <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">{card.count}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{card.description}</p>
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
