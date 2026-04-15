"use client";

import { useState, useEffect } from "react";
import { Radio, MessageCircle, Send, Key, Layout, Database, Zap, Smartphone } from "lucide-react";
import { useSite } from "@/lib/SiteContext";
import { useLocale } from "@/lib/LocaleContext";
import CountryFlag from "./CountryFlag";

export default function PackageUsage() {
  const { selectedSite } = useSite();
  const { t } = useLocale();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Different data based on selected site
  const siteData: Record<string, {
    devices: { current: number; total: number; percentage: number };
    lineMessages: { current: number; total: number; percentage: number };
    apiRequests: { current: number; total: number; percentage: number };
    apiKeys: number;
    dashboards: { current: number; total: number };
  }> = {
    thailand: {
      devices: { current: 3, total: 5, percentage: 60 },
      lineMessages: { current: 0, total: 250, percentage: 0 },
      apiRequests: { current: 0, total: 10000, percentage: 0 },
      apiKeys: 0,
      dashboards: { current: 1, total: 1 },
    },
    korea: {
      devices: { current: 2, total: 5, percentage: 40 },
      lineMessages: { current: 50, total: 250, percentage: 20 },
      apiRequests: { current: 1200, total: 10000, percentage: 12 },
      apiKeys: 1,
      dashboards: { current: 1, total: 1 },
    },
    vietnam: {
      devices: { current: 0, total: 5, percentage: 0 },
      lineMessages: { current: 0, total: 250, percentage: 0 },
      apiRequests: { current: 0, total: 10000, percentage: 0 },
      apiKeys: 0,
      dashboards: { current: 1, total: 1 },
    },
    malaysia: {
      devices: { current: 0, total: 5, percentage: 0 },
      lineMessages: { current: 0, total: 250, percentage: 0 },
      apiRequests: { current: 0, total: 10000, percentage: 0 },
      apiKeys: 0,
      dashboards: { current: 1, total: 1 },
    },
  };

  const data = siteData[selectedSite] ?? siteData.thailand;
  const selectedSiteLabel = selectedSite === "thailand"
    ? t("thailand")
    : selectedSite === "korea"
      ? t("republicOfKorea")
      : selectedSite === "vietnam"
        ? t("vietnam")
        : t("malaysia");

  return (
    <div className="card">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-800">{t("packageUsage")}</h2>
          <div className="flex items-center space-x-2">
            <CountryFlag country={selectedSite} size="sm" />
            <span className="text-xs text-gray-500">
              {selectedSiteLabel}
            </span>
          </div>
        </div>
        <p className="text-sm font-semibold text-primary">WE ARE SITE IN THE WORLD</p>
      </div>

      {/* Usage Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Devices */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">{t("devices")}</span>
            <Radio className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-gray-800">{data.devices.current}</span>
            <span className="text-gray-500"> / {data.devices.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${data.devices.percentage}%` }}></div>
          </div>
        </div>

        {/* LINE Messages */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">{t("lineMessages")}</span>
            <MessageCircle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-gray-800">{data.lineMessages.current}</span>
            <span className="text-gray-500"> / {data.lineMessages.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.lineMessages.percentage}%` }}></div>
          </div>
        </div>

        {/* Telegram Messages */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">{t("telegramMessages")}</span>
            <Send className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mb-2">
            <span className="text-lg font-semibold text-primary">{t("enabled")}</span>
          </div>
          <div className="text-xs text-gray-500">{t("unlimited")}</div>
        </div>

        {/* API Requests */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">{t("apiRequests")}</span>
            <Database className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-gray-800">
              {isClient ? data.apiRequests.current.toLocaleString() : data.apiRequests.current}
            </span>
            <span className="text-gray-500"> / {isClient ? data.apiRequests.total.toLocaleString() : data.apiRequests.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${data.apiRequests.percentage}%` }}></div>
          </div>
        </div>

        {/* API Keys */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">{t("apiKeys")}</span>
            <Key className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-gray-800">{data.apiKeys}</span>
          </div>
          <div className="text-xs text-gray-500">{t("delay")}: 5 min</div>
        </div>

        {/* Dashboards */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">{t("dashboards")}</span>
            <Layout className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-gray-800">{data.dashboards.current}</span>
            <span className="text-gray-500"> / {data.dashboards.total}</span>
          </div>
          <div className="text-xs text-gray-500">{t("totalCreated")}: {data.dashboards.current}</div>
        </div>
      </div>

      {/* Package Features */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("packageFeatures")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("historyRecords")}</p>
              <p className="text-sm font-bold text-gray-800">150.0K</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("apiLimit")}</p>
              <p className="text-sm font-bold text-gray-800">10.0K</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("telegram")}</p>
              <p className="text-sm font-bold text-green-600">{t("enabled")}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("maxDevices")}</p>
              <p className="text-sm font-bold text-gray-800">5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
