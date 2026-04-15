'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  MapPin,
  Truck,
  Warehouse,
  Calendar,
  DollarSign,
  ArrowLeft,
  Package,
  CheckCircle,
  Clock,
  Workflow,
  Users,
} from 'lucide-react';

type MenuCard = { icon: any; title: string; description: string; href: string; color: string; count: number | null; external?: boolean };

export default function LogisticsDashboardPage() {
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
    totalShipments: 234,
    inTransit: 47,
    delivered: 172,
    pendingPickup: 15,
  };

  const menuCards: MenuCard[] = [
    {
      icon: Truck,
      title: t.shipmentTracking,
      description: t.shipmentTrackingDesc,
      href: '/logistics/shipment-tracking',
      color: 'bg-blue-500',
      count: stats.inTransit,
    },
    {
      icon: Warehouse,
      title: t.warehouseManagement,
      description: t.warehouseManagementDesc,
      href: '/logistics/warehouse',
      color: 'bg-green-500',
      count: 8,
    },
    {
      icon: Calendar,
      title: t.deliverySchedule,
      description: t.deliveryScheduleDesc,
      href: '/logistics/delivery-schedule',
      color: 'bg-orange-500',
      count: 23,
    },
    {
      icon: DollarSign,
      title: t.transportCost,
      description: t.transportCostDesc,
      href: '/logistics/transport-cost',
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/Korea/Admin-Login')} className="text-red-600 hover:text-red-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t.logisticsDashboard}</h1>
                    <p className="text-sm text-gray-600">{t.logisticsDashboardDesc}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {mounted && currentUser && (
                <div className="px-4 py-2 rounded-lg bg-red-50 border-2 border-red-200 flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
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
                <p className="text-sm text-gray-600">{t.totalShipments}</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalShipments}</p>
              </div>
              <Package className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.inTransit}</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inTransit}</p>
              </div>
              <Truck className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.delivered}</p>
                <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.pendingPickup}</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingPickup}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-500" />
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
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-600 transition-colors">{card.title}</h3>
                        {card.count !== null && (
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{card.count}</span>
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
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-600 transition-colors">{card.title}</h3>
                      {card.count !== null && (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{card.count}</span>
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
