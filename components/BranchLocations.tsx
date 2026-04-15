"use client";

import { MapPin, Phone, Mail, Building2 } from "lucide-react";
import { useSite } from "@/lib/SiteContext";
import { useLocale } from "@/lib/LocaleContext";
import CountryFlag from "./CountryFlag";

// Branch data by site
type Branch = {
  id: number;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  email: string;
  isHeadquarter: boolean;
};

const branchData: Record<string, Branch[]> = {
  thailand: [
    {
      id: 1,
      name: "Bangkok Office",
      address: "84 Chaloem Phrakiat Rama 9 Soi 34",
      district: "Nong Bon, Prawet",
      city: "Bangkok 10250",
      phone: "+66 2 0808916",
      email: "info@kenergy-save.com",
      isHeadquarter: true,
    },
    {
      id: 2,
      name: "Chiang Mai Branch",
      address: "123 Nimman Road",
      district: "Su Thep",
      city: "Chiang Mai 50200",
      phone: "+66 53 123456",
      email: "chiangmai@kenergy-save.com",
      isHeadquarter: false,
    },
    {
      id: 3,
      name: "Phuket Branch",
      address: "456 Patong Beach Road",
      district: "Kathu",
      city: "Phuket 83150",
      phone: "+66 76 123456",
      email: "phuket@kenergy-save.com",
      isHeadquarter: false,
    },
  ],
  korea: [
    {
      id: 1,
      name: "Seoul Headquarters",
      address: "2F, 16-10, 166beon-gil, Elseso-ro",
      district: "Gunpo-si",
      city: "Gyeonggi-do, Korea",
      phone: "+82 31-427-1380",
      email: "info@zera-energy.com",
      isHeadquarter: true,
    },
    {
      id: 2,
      name: "Busan Branch",
      address: "789 Marine City",
      district: "Haeundae-gu",
      city: "Busan, Korea",
      phone: "+82 51 123 4567",
      email: "busan@zera-energy.com",
      isHeadquarter: false,
    },
  ],
  vietnam: [],
  malaysia: [],
};

export default function BranchLocations() {
  const { selectedSite } = useSite();
  const { t } = useLocale();

  const branches = branchData[selectedSite] ?? [];
  const totalBranches = branches.length;
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
          <h2 className="text-xl font-bold text-gray-800">สาขาทั่วประเทศของเรา</h2>
          <div className="flex items-center space-x-2">
            <CountryFlag country={selectedSite} size="sm" />
            <span className="text-xs text-gray-500">
              {selectedSiteLabel}
            </span>
          </div>
        </div>
        <p className="text-sm font-semibold text-primary">WE ARE SITE IN THE WORLD</p>
      </div>

      {/* Branch Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-primary/10 rounded-lg p-4 text-center">
          <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{totalBranches}</p>
          <p className="text-sm text-gray-600">Total Branches</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{totalBranches}</p>
          <p className="text-sm text-gray-600">Active Locations</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <Phone className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">24/7</p>
          <p className="text-sm text-gray-600">Support Available</p>
        </div>
      </div>

      {/* Branch List */}
      <div className="space-y-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              branch.isHeadquarter
                ? "border-primary bg-primary/5"
                : "border-gray-200 bg-white hover:border-primary/50"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-800">{branch.name}</h3>
                  {branch.isHeadquarter && (
                    <span className="px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded-full">
                      HQ
                    </span>
                  )}
                </div>
              </div>
              <MapPin className={`w-5 h-5 ${branch.isHeadquarter ? "text-primary" : "text-gray-400"}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start space-x-2">
                <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p>{branch.address}</p>
                  <p>{branch.district}</p>
                  <p className="font-medium">{branch.city}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${branch.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {branch.phone}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${branch.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {branch.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-sm text-gray-600 text-center">
          <span className="font-semibold text-primary">K Energy Save Co., Ltd.</span>
          {" · "}
          Group of Zera
          {" · "}
          Serving customers across {selectedSiteLabel}
        </p>
      </div>
    </div>
  );
}
