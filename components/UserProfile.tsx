"use client";

import { Calendar, AlertCircle, Phone } from "lucide-react";
import Image from "next/image";
import { useSite } from "@/lib/SiteContext";
import { useLocale } from "@/lib/LocaleContext";
import CountryFlag from "./CountryFlag";

export default function UserProfile() {
  const { selectedSite, setSelectedSite } = useSite();
  const { t } = useLocale();

  return (
    <div className="card">
      {/* Profile Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-primary">
            <Image
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/AMqDpBqx0RHlW36D/kenergysave-logo-m6L2JxknygHwL0Bj.png"
              alt="K Energy Save"
              width={100}
              height={100}
              className="w-24 h-24 object-contain"
            />
          </div>
          <div className="absolute bottom-2 right-2 w-8 h-8 bg-secondary rounded-full border-4 border-white flex items-center justify-center">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mt-4">K Energy Save Co., Ltd.</h2>
        <p className="text-sm text-gray-500 mb-4">info@kenergy-save.com</p>

        <span className="inline-block px-4 py-1 bg-green-100 text-primary text-sm font-semibold rounded-full border border-primary">
          group of Zera
        </span>
      </div>

      {/* Profile Information */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-orange-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">{t("registered")}</p>
            <p className="text-sm font-semibold text-gray-800">13 Jan 2026 (25 days)</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">{t("expires")}</p>
            <p className="text-sm font-semibold text-red-600">{t("noExpiration")}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Phone className="w-5 h-5 text-green-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">{t("contact")}</p>
            <p className="text-sm font-semibold text-gray-800">{t("notSet")}</p>
          </div>
        </div>
      </div>

      {/* Sites Information */}
      <div className="mt-6 pt-4 border-t">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{t("sites")}</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedSite("thailand")}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
              selectedSite === "thailand"
                ? "bg-primary text-white shadow-md"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <CountryFlag country="thailand" size="md" />
            <span className={`text-sm font-medium ${
              selectedSite === "thailand" ? "text-white" : "text-gray-700"
            }`}>
              {t("thailand")}
            </span>
            {selectedSite === "thailand" && (
              <span className="ml-auto text-white text-lg">✓</span>
            )}
          </button>
          
          <button
            onClick={() => setSelectedSite("korea")}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
              selectedSite === "korea"
                ? "bg-primary text-white shadow-md"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <CountryFlag country="korea" size="md" />
            <span className={`text-sm font-medium ${
              selectedSite === "korea" ? "text-white" : "text-gray-700"
            }`}>
              {t("republicOfKorea")}
            </span>
            {selectedSite === "korea" && (
              <span className="ml-auto text-white text-lg">✓</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
