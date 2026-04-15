"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSite } from "@/lib/SiteContext";
import { useLocale } from "@/lib/LocaleContext";
import CountryFlag from "./CountryFlag";

const thailandData = [
  { month: 'Jan', messages: 0 },
  { month: 'Feb', messages: 0 },
  { month: 'Mar', messages: 0 },
  { month: 'Apr', messages: 0 },
  { month: 'May', messages: 0 },
  { month: 'Jun', messages: 0 },
  { month: 'Jul', messages: 0 },
  { month: 'Aug', messages: 0 },
  { month: 'Sep', messages: 0 },
  { month: 'Oct', messages: 0 },
  { month: 'Nov', messages: 0 },
  { month: 'Dec', messages: 0 },
];

const koreaData = [
  { month: 'Jan', messages: 15 },
  { month: 'Feb', messages: 28 },
  { month: 'Mar', messages: 42 },
  { month: 'Apr', messages: 35 },
  { month: 'May', messages: 50 },
  { month: 'Jun', messages: 45 },
  { month: 'Jul', messages: 38 },
  { month: 'Aug', messages: 52 },
  { month: 'Sep', messages: 48 },
  { month: 'Oct', messages: 40 },
  { month: 'Nov', messages: 55 },
  { month: 'Dec', messages: 30 },
];

export default function UsageChart() {
  const { selectedSite } = useSite();
  const { t } = useLocale();
  
  const data = selectedSite === "thailand" ? thailandData : koreaData;
  const totalMessages = data.reduce((sum, item) => sum + item.messages, 0);
  const averageMessages = Math.round(totalMessages / 12);
  const peakMessages = Math.max(...data.map(item => item.messages));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">{t("lineMessageUsage")}</h2>
        <div className="flex items-center space-x-2">
          <CountryFlag country={selectedSite} size="sm" />
          <span className="text-xs text-gray-500">
            {selectedSite === "thailand" ? t("thailand") : t("republicOfKorea")}
          </span>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              label={{ value: t("messages"), angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Bar dataKey="messages" fill="#2D8A3E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <p>{t("totalMessages")}: <span className="font-semibold text-gray-800">{totalMessages}</span></p>
        <p>{t("average")}: <span className="font-semibold text-gray-800">{averageMessages} {t("perMonth")}</span></p>
        <p>{t("peak")}: <span className="font-semibold text-gray-800">{peakMessages}</span></p>
      </div>
    </div>
  );
}
