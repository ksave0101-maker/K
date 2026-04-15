'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import { ArrowLeft, FileText, Zap, Activity, AlertTriangle, CheckCircle, XCircle, BarChart3, TrendingUp, Info, Globe, Plus, Search, Eye, Edit, Trash2, Download, DollarSign, Calendar, User, Building } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import CountryFlag from '@/components/CountryFlag';

interface PhaseData {
  L1: number;
  L2: number;
  L3: number;
  N: number;
}

interface AnalysisData {
  id: string;
  branch: string;
  location: string;
  equipment: string;
  datetime: string;
  technician: string;
  voltage: string;
  frequency: number;
  powerFactor: number;
  thd: number;
  current: PhaseData;
  balance: 'Good' | 'Fair' | 'Poor';
  result: 'Recommended' | 'Not Recommended' | 'Further Analysis Required';
  recommendation: string;
  notes: string;
  // Additional fields for Further Analysis Required
  additionalTests?: {
    harmonicAnalysis: boolean;
    powerQualityCheck: boolean;
    loadBalancing: boolean;
    temperatureMonitoring: boolean;
    cableIntegrityTest: boolean;
  };
  scheduledFollowUp?: {
    date: string;
    technician: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    expectedDuration: string;
  };
  additionalEquipment?: string[];
  estimatedCost?: number;
  riskAssessment?: 'Low' | 'Medium' | 'High';
}

interface Bill {
  id: string;
  billNumber: string;
  analysisId: string;
  customerName: string;
  customerCountry: string;
  contactPerson: string;
  email: string;
  analysisType: string;
  serviceFee: number;
  equipmentCost: number;
  installationCost: number;
  totalAmount: number;
  currency: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  createdDate: string;
  lastModified: string;
  notes?: string;
}

// Helper functions for automatic data generation
const generateDocumentNumber = (): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 999) + 1;
  return `PIA-${year}-${month}${day}-${String(random).padStart(3, '0')}`;
};

const getCurrentDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const sampleAnalysis: AnalysisData = {
  id: 'PIA-2026-0216-001', // Static initial value to prevent hydration error
  branch: 'Vietnam',
  location: 'Ho Chi Minh City Office - UPS Room',
  equipment: 'Fluke 438-II Motor Analyzer',
  datetime: '2026-02-16 14:30', // Static initial value to prevent hydration error
  technician: 'Engr. Patrick Jung',
  voltage: '380',
  frequency: 49.98,
  powerFactor: 0.85,
  thd: 7.8,
  current: {
    L1: 156.3,
    L2: 142.9,
    L3: 168.7,
    N: 22.1
  },
  balance: 'Poor',
  result: 'Recommended',
  recommendation: 'L3상과 L2상 간 전류 차이가 큼. UPS 시스템 점검 및 부하 재분배 필요.',
  notes: 'UPS 시스템으로 인한 고조파 및 상 불균형, 개선 후 재검토'
};

// Current Waveform Chart Component - Recharts Format
const CurrentWaveformChart = ({ data, translations }: { data: PhaseData, translations: any }) => {
  // 7-day hourly power consumption data (every 4 hours for readability)
  const powerData = [
    // Day 1 (11/02)
    { time: '11/02 00:00', peak: 12.3, avgDay: 12.3, night: 12.3, day: '11/02' },
    { time: '11/02 04:00', peak: 15.1, avgDay: 15.1, night: 15.1, day: '11/02' },
    { time: '11/02 08:00', peak: 89.2, avgDay: 89.2, night: 25.4, day: '11/02' },
    { time: '11/02 12:00', peak: 165.8, avgDay: 138.5, night: 35.2, day: '11/02' },
    { time: '11/02 16:00', peak: 171.3, avgDay: 142.7, night: 28.9, day: '11/02' },
    { time: '11/02 20:00', peak: 68.9, avgDay: 68.9, night: 22.1, day: '11/02' },
    
    // Day 2 (12/02)
    { time: '12/02 00:00', peak: 13.7, avgDay: 13.7, night: 13.7, day: '12/02' },
    { time: '12/02 04:00', peak: 16.2, avgDay: 16.2, night: 16.2, day: '12/02' },
    { time: '12/02 08:00', peak: 92.1, avgDay: 92.1, night: 26.8, day: '12/02' },
    { time: '12/02 12:00', peak: 158.4, avgDay: 131.2, night: 38.7, day: '12/02' },
    { time: '12/02 16:00', peak: 167.9, avgDay: 139.8, night: 31.5, day: '12/02' },
    { time: '12/02 20:00', peak: 71.3, avgDay: 71.3, night: 24.6, day: '12/02' },
    
    // Day 3 (13/02)
    { time: '13/02 00:00', peak: 11.5, avgDay: 11.5, night: 11.5, day: '13/02' },
    { time: '13/02 04:00', peak: 14.8, avgDay: 14.8, night: 14.8, day: '13/02' },
    { time: '13/02 08:00', peak: 95.7, avgDay: 95.7, night: 28.3, day: '13/02' },
    { time: '13/02 12:00', peak: 170.2, avgDay: 141.8, night: 39.4, day: '13/02' },
    { time: '13/02 16:00', peak: 175.1, avgDay: 146.2, night: 32.8, day: '13/02' },
    { time: '13/02 20:00', peak: 69.4, avgDay: 69.4, night: 23.7, day: '13/02' },
    
    // Day 4 (14/02)
    { time: '14/02 00:00', peak: 12.9, avgDay: 12.9, night: 12.9, day: '14/02' },
    { time: '14/02 04:00', peak: 15.6, avgDay: 15.6, night: 15.6, day: '14/02' },
    { time: '14/02 08:00', peak: 88.3, avgDay: 88.3, night: 24.9, day: '14/02' },
    { time: '14/02 12:00', peak: 162.7, avgDay: 135.6, night: 36.1, day: '14/02' },
    { time: '14/02 16:00', peak: 168.9, avgDay: 140.7, night: 29.3, day: '14/02' },
    { time: '14/02 20:00', peak: 73.1, avgDay: 73.1, night: 25.8, day: '14/02' },
    
    // Day 5 (15/02)
    { time: '15/02 00:00', peak: 13.2, avgDay: 13.2, night: 13.2, day: '15/02' },
    { time: '15/02 04:00', peak: 16.8, avgDay: 16.8, night: 16.8, day: '15/02' },
    { time: '15/02 08:00', peak: 91.5, avgDay: 91.5, night: 27.2, day: '15/02' },
    { time: '15/02 12:00', peak: 156.3, avgDay: 130.3, night: 37.8, day: '15/02' },
    { time: '15/02 16:00', peak: 163.7, avgDay: 136.4, night: 30.5, day: '15/02' },
    { time: '15/02 20:00', peak: 67.8, avgDay: 67.8, night: 21.9, day: '15/02' },
    
    // Day 6 (16/02)
    { time: '16/02 00:00', peak: 10.9, avgDay: 10.9, night: 10.9, day: '16/02' },
    { time: '16/02 04:00', peak: 14.3, avgDay: 14.3, night: 14.3, day: '16/02' },
    { time: '16/02 08:00', peak: 93.8, avgDay: 93.8, night: 26.5, day: '16/02' },
    { time: '16/02 12:00', peak: 168.5, avgDay: 140.4, night: 38.2, day: '16/02' },
    { time: '16/02 16:00', peak: 173.2, avgDay: 144.3, night: 31.7, day: '16/02' },
    { time: '16/02 20:00', peak: 70.6, avgDay: 70.6, night: 24.1, day: '16/02' },
    
    // Day 7 (17/02)
    { time: '17/02 00:00', peak: 12.6, avgDay: 12.6, night: 12.6, day: '17/02' },
    { time: '17/02 04:00', peak: 15.4, avgDay: 15.4, night: 15.4, day: '17/02' },
    { time: '17/02 08:00', peak: 87.1, avgDay: 87.1, night: 25.7, day: '17/02' },
    { time: '17/02 12:00', peak: 163.4, avgDay: 136.2, night: 36.8, day: '17/02' },
    { time: '17/02 16:00', peak: 169.8, avgDay: 141.5, night: 29.6, day: '17/02' },
    { time: '17/02 20:00', peak: 72.5, avgDay: 72.5, night: 23.4, day: '17/02' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg space-y-6">
      {/* Header */}
      <h3 className="text-lg font-bold text-gray-800 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-600" />
        {translations.quantifiedPowerAnalysis}
      </h3>

      {/* Section 1: Power Graph */}
      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-purple-600" />
          {translations.powerGraph7Days || '7-Day Power Graph'}
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={powerData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(value) => value.split(' ')[0]}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                domain={[0, 200]}
                label={{ value: 'kW', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} kW`, '']}
                labelFormatter={(label) => `${translations.time}: ${label}`}
                contentStyle={{ fontSize: 11, backgroundColor: '#f8fafc' }}
                itemStyle={{ fontSize: 11 }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 11, paddingTop: '15px' }} 
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="peak" 
                stroke="#EF4444" 
                strokeWidth={2.5} 
                name="Peak Power"
                dot={{ fill: '#EF4444', strokeWidth: 1, r: 3, stroke: 'white' }}
                activeDot={{ r: 5, fill: '#EF4444' }}
              />
              <Line 
                type="monotone" 
                dataKey="avgDay" 
                stroke="#10B981" 
                strokeWidth={2.5} 
                name="Average Daytime"
                dot={{ fill: '#10B981', strokeWidth: 1, r: 3, stroke: 'white' }}
                activeDot={{ r: 5, fill: '#10B981' }}
              />
              <Line 
                type="monotone" 
                dataKey="night" 
                stroke="#3B82F6" 
                strokeWidth={2.5} 
                name="Night Base Load"
                dot={{ fill: '#3B82F6', strokeWidth: 1, r: 3, stroke: 'white' }}
                activeDot={{ r: 5, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Power Metrics Table */}
        <div className="mt-4 bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
          <div className="bg-purple-100 rounded-t-lg px-4 py-2 -mx-4 -mt-4 mb-4">
            <h5 className="font-bold text-purple-800">Power Metrics</h5>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">Item</th>
                  <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">Measured Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Peak Power Demand</td>
                  <td className="p-3 text-gray-800">≈ 175 kW (during operational hours)</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Nighttime Base Load</td>
                  <td className="p-3 text-gray-800">≈ 10 - 17 kW</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Average Daytime Consumption</td>
                  <td className="p-3 text-gray-800">≈ 77 - 146 kW</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Load Factor</td>
                  <td className="p-3 text-gray-800">≈ 68.4 %</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Peak Hours</td>
                  <td className="p-3 text-gray-800">12:00-17:00 with highest consumption 156-175 kW</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Current Analysis Chart Component
const CurrentAnalysisChart = ({ translations }: { translations: any }) => {
  // 7-day hourly current data (every 4 hours for readability)
  const currentData = [
    // Day 1 (11/02)
    { time: '11/02 00:00', phaseA: 25.3, phaseB: 22.1, phaseC: 28.7, day: '11/02' },
    { time: '11/02 04:00', phaseA: 28.5, phaseB: 24.8, phaseC: 31.2, day: '11/02' },
    { time: '11/02 08:00', phaseA: 142.3, phaseB: 128.9, phaseC: 155.7, day: '11/02' },
    { time: '11/02 12:00', phaseA: 168.3, phaseB: 152.9, phaseC: 181.7, day: '11/02' },
    { time: '11/02 16:00', phaseA: 175.2, phaseB: 159.1, phaseC: 188.3, day: '11/02' },
    { time: '11/02 20:00', phaseA: 89.4, phaseB: 76.8, phaseC: 95.2, day: '11/02' },
    
    // Day 2 (12/02)
    { time: '12/02 00:00', phaseA: 24.8, phaseB: 21.5, phaseC: 27.9, day: '12/02' },
    { time: '12/02 04:00', phaseA: 29.1, phaseB: 25.2, phaseC: 32.0, day: '12/02' },
    { time: '12/02 08:00', phaseA: 145.1, phaseB: 131.2, phaseC: 158.1, day: '12/02' },
    { time: '12/02 12:00', phaseA: 171.1, phaseB: 155.2, phaseC: 184.1, day: '12/02' },
    { time: '12/02 16:00', phaseA: 178.0, phaseB: 162.0, phaseC: 191.0, day: '12/02' },
    { time: '12/02 20:00', phaseA: 92.1, phaseB: 79.2, phaseC: 97.8, day: '12/02' },
    
    // Day 3 (13/02)
    { time: '13/02 00:00', phaseA: 23.8, phaseB: 20.7, phaseC: 26.9, day: '13/02' },
    { time: '13/02 04:00', phaseA: 27.8, phaseB: 24.1, phaseC: 30.9, day: '13/02' },
    { time: '13/02 08:00', phaseA: 141.8, phaseB: 127.7, phaseC: 154.9, day: '13/02' },
    { time: '13/02 12:00', phaseA: 167.8, phaseB: 151.7, phaseC: 180.9, day: '13/02' },
    { time: '13/02 16:00', phaseA: 174.5, phaseB: 158.2, phaseC: 187.1, day: '13/02' },
    { time: '13/02 20:00', phaseA: 88.7, phaseB: 75.9, phaseC: 94.3, day: '13/02' },
    
    // Day 4 (14/02)
    { time: '14/02 00:00', phaseA: 25.2, phaseB: 22.5, phaseC: 28.3, day: '14/02' },
    { time: '14/02 04:00', phaseA: 28.9, phaseB: 25.5, phaseC: 31.7, day: '14/02' },
    { time: '14/02 08:00', phaseA: 144.2, phaseB: 130.5, phaseC: 157.3, day: '14/02' },
    { time: '14/02 12:00', phaseA: 170.2, phaseB: 154.5, phaseC: 183.3, day: '14/02' },
    { time: '14/02 16:00', phaseA: 177.1, phaseB: 161.2, phaseC: 190.0, day: '14/02' },
    { time: '14/02 20:00', phaseA: 91.3, phaseB: 78.4, phaseC: 96.8, day: '14/02' },
    
    // Day 5 (15/02)
    { time: '15/02 00:00', phaseA: 24.7, phaseB: 21.1, phaseC: 27.2, day: '15/02' },
    { time: '15/02 04:00', phaseA: 28.2, phaseB: 24.6, phaseC: 30.8, day: '15/02' },
    { time: '15/02 08:00', phaseA: 143.7, phaseB: 129.1, phaseC: 156.2, day: '15/02' },
    { time: '15/02 12:00', phaseA: 169.7, phaseB: 153.1, phaseC: 182.2, day: '15/02' },
    { time: '15/02 16:00', phaseA: 176.5, phaseB: 160.3, phaseC: 189.1, day: '15/02' },
    { time: '15/02 20:00', phaseA: 90.8, phaseB: 77.7, phaseC: 96.1, day: '15/02' },
    
    // Day 6 (16/02)
    { time: '16/02 00:00', phaseA: 25.9, phaseB: 22.8, phaseC: 29.1, day: '16/02' },
    { time: '16/02 04:00', phaseA: 29.3, phaseB: 25.8, phaseC: 32.1, day: '16/02' },
    { time: '16/02 08:00', phaseA: 145.9, phaseB: 131.8, phaseC: 158.1, day: '16/02' },
    { time: '16/02 12:00', phaseA: 171.9, phaseB: 155.8, phaseC: 184.1, day: '16/02' },
    { time: '16/02 16:00', phaseA: 178.7, phaseB: 162.5, phaseC: 191.2, day: '16/02' },
    { time: '16/02 20:00', phaseA: 92.8, phaseB: 79.7, phaseC: 98.1, day: '16/02' },
    
    // Day 7 (17/02)
    { time: '17/02 00:00', phaseA: 23.5, phaseB: 19.9, phaseC: 26.4, day: '17/02' },
    { time: '17/02 04:00', phaseA: 27.2, phaseB: 23.8, phaseC: 30.1, day: '17/02' },
    { time: '17/02 08:00', phaseA: 140.5, phaseB: 125.9, phaseC: 153.4, day: '17/02' },
    { time: '17/02 12:00', phaseA: 166.5, phaseB: 149.9, phaseC: 179.4, day: '17/02' },
    { time: '17/02 16:00', phaseA: 173.2, phaseB: 156.8, phaseC: 185.7, day: '17/02' },
    { time: '17/02 20:00', phaseA: 87.3, phaseB: 74.2, phaseC: 92.8, day: '17/02' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg space-y-6">
      {/* Header */}
      <h3 className="text-lg font-bold text-gray-800 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-600" />
        {translations.quantifiedCurrentAnalysis}
      </h3>

      {/* Section 1: Current Graph */}
      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-red-600" />
          {translations.currentGraph7Days || '7-Day Current Graph'}
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={currentData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(value) => value.split(' ')[0]}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                domain={[0, 200]}
                label={{ value: translations.currentUnit || 'A', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} A`, '']}
                labelFormatter={(label) => `${translations.time}: ${label}`}
                contentStyle={{ fontSize: 11, backgroundColor: '#f8fafc' }}
                itemStyle={{ fontSize: 11 }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 11, paddingTop: '15px' }} 
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="phaseA" 
                stroke="#EF4444" 
                strokeWidth={2.5} 
                name={translations.phaseALabel || "Phase A"}
                dot={{ fill: '#EF4444', strokeWidth: 1, r: 3, stroke: 'white' }}
                activeDot={{ r: 5, fill: '#EF4444' }}
              />
              <Line 
                type="monotone" 
                dataKey="phaseB" 
                stroke="#10B981" 
                strokeWidth={2.5} 
                name={translations.phaseBLabel || "Phase B"}
                dot={{ fill: '#10B981', strokeWidth: 1, r: 3, stroke: 'white' }}
                activeDot={{ r: 5, fill: '#10B981' }}
              />
              <Line 
                type="monotone" 
                dataKey="phaseC" 
                stroke="#3B82F6" 
                strokeWidth={2.5} 
                name={translations.phaseCLabel || "Phase C"}
                dot={{ fill: '#3B82F6', strokeWidth: 1, r: 3, stroke: 'white' }}
                activeDot={{ r: 5, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Current Metrics Table */}
        <div className="mt-4 bg-white rounded-lg p-4 border border-red-200 shadow-sm">
          <div className="bg-orange-100 rounded-t-lg px-4 py-2 -mx-4 -mt-4 mb-4">
            <h5 className="font-bold text-orange-800">Current Metrics</h5>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">Item</th>
                  <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">Measured Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Peak Current Range</td>
                  <td className="p-3 text-gray-800">≈ 260 - 330 A per phase</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Nighttime Base Current</td>
                  <td className="p-3 text-gray-800">≈ 20 - 30 A</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Dominant Phase</td>
                  <td className="p-3 text-gray-800">Phase 1</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Current Imbalance Ratio</td>
                  <td className="p-3 text-gray-800">≈ 15 - 25 %</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Imbalance Occurrence</td>
                  <td className="p-3 text-gray-800">Main feeder Phase 1 vs Phase 2/3 during 10:00-17:00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Voltage Analysis Chart Component
const VoltageAnalysisChart = ({ translations }: { translations: any }) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  // 24-hour detailed current data for each day with 15-minute intervals
  const dailyHourlyData = {
    day1: [
      { hour: '00:00', L1: 32.1, L2: 28.4, L3: 35.2 },
      { hour: '00:15', L1: 31.8, L2: 28.1, L3: 34.9 },
      { hour: '00:30', L1: 31.4, L2: 27.8, L3: 34.5 },
      { hour: '00:45', L1: 31.0, L2: 27.4, L3: 34.1 },
      { hour: '01:00', L1: 30.8, L2: 27.1, L3: 33.9 },
      { hour: '01:15', L1: 30.5, L2: 26.9, L3: 33.6 },
      { hour: '01:30', L1: 30.1, L2: 26.6, L3: 33.2 },
      { hour: '01:45', L1: 29.8, L2: 26.4, L3: 32.9 },
      { hour: '02:00', L1: 29.5, L2: 26.3, L3: 32.7 },
      { hour: '02:15', L1: 29.3, L2: 26.1, L3: 32.5 },
      { hour: '02:30', L1: 29.1, L2: 25.9, L3: 32.2 },
      { hour: '02:45', L1: 29.0, L2: 25.8, L3: 32.0 },
      { hour: '03:00', L1: 28.9, L2: 25.8, L3: 31.5 },
      { hour: '03:15', L1: 29.2, L2: 26.0, L3: 31.8 },
      { hour: '03:30', L1: 29.6, L2: 26.3, L3: 32.2 },
      { hour: '03:45', L1: 30.1, L2: 26.7, L3: 32.8 },
      { hour: '04:00', L1: 31.2, L2: 27.9, L3: 34.1 },
      { hour: '04:15', L1: 33.8, L2: 30.1, L3: 37.0 },
      { hour: '04:30', L1: 38.4, L2: 34.2, L3: 42.1 },
      { hour: '04:45', L1: 43.9, L2: 39.0, L3: 48.1 },
      { hour: '05:00', L1: 48.7, L2: 43.2, L3: 52.8 },
      { hour: '05:15', L1: 54.2, L2: 48.1, L3: 59.3 },
      { hour: '05:30', L1: 61.8, L2: 54.9, L3: 67.7 },
      { hour: '05:45', L1: 71.3, L2: 63.4, L3: 78.1 },
      { hour: '06:00', L1: 89.4, L2: 81.6, L3: 95.2 },
      { hour: '06:15', L1: 98.7, L2: 90.1, L3: 105.4 },
      { hour: '06:30', L1: 109.2, L2: 99.8, L3: 116.8 },
      { hour: '06:45', L1: 121.6, L2: 111.0, L3: 129.7 },
      { hour: '07:00', L1: 134.8, L2: 124.1, L3: 142.5 },
      { hour: '07:15', L1: 148.2, L2: 136.4, L3: 156.9 },
      { hour: '07:30', L1: 161.5, L2: 148.7, L3: 171.2 },
      { hour: '07:45', L1: 172.1, L2: 158.3, L3: 182.4 },
      { hour: '08:00', L1: 178.7, L2: 162.5, L3: 189.3 },
      { hour: '08:15', L1: 176.9, L2: 161.2, L3: 187.6 },
      { hour: '08:30', L1: 174.2, L2: 159.1, L3: 184.9 },
      { hour: '08:45', L1: 171.8, L2: 157.4, L3: 182.5 },
      { hour: '09:00', L1: 165.2, L2: 151.8, L3: 174.6 },
      { hour: '09:15', L1: 167.4, L2: 153.8, L3: 177.2 },
      { hour: '09:30', L1: 169.8, L2: 156.1, L3: 179.9 },
      { hour: '09:45', L1: 170.9, L2: 157.2, L3: 181.3 },
      { hour: '10:00', L1: 171.9, L2: 158.4, L3: 181.7 },
      { hour: '10:15', L1: 173.2, L2: 159.6, L3: 183.8 },
      { hour: '10:30', L1: 174.8, L2: 161.0, L3: 185.4 },
      { hour: '10:45', L1: 175.6, L2: 161.8, L3: 186.2 },
      { hour: '11:00', L1: 176.3, L2: 161.9, L3: 186.1 },
      { hour: '11:15', L1: 176.8, L2: 162.4, L3: 187.2 },
      { hour: '11:30', L1: 177.1, L2: 162.7, L3: 187.9 },
      { hour: '11:45', L1: 176.9, L2: 162.5, L3: 187.6 },
      { hour: '12:00', L1: 174.5, L2: 160.2, L3: 184.2 },
      { hour: '12:15', L1: 173.8, L2: 159.6, L3: 183.4 },
      { hour: '12:30', L1: 172.6, L2: 158.9, L3: 182.3 },
      { hour: '12:45', L1: 171.2, L2: 157.8, L3: 181.0 },
      { hour: '13:00', L1: 169.8, L2: 156.1, L3: 179.4 },
      { hour: '13:15', L1: 168.9, L2: 155.4, L3: 178.7 },
      { hour: '13:30', L1: 168.1, L2: 154.8, L3: 178.0 },
      { hour: '13:45', L1: 167.6, L2: 154.3, L3: 177.5 },
      { hour: '14:00', L1: 167.2, L2: 153.7, L3: 176.8 },
      { hour: '14:15', L1: 168.4, L2: 155.0, L3: 178.3 },
      { hour: '14:30', L1: 170.1, L2: 156.8, L3: 180.2 },
      { hour: '14:45', L1: 171.5, L2: 158.1, L3: 181.7 },
      { hour: '15:00', L1: 172.6, L2: 158.9, L3: 182.3 },
      { hour: '15:15', L1: 172.1, L2: 158.4, L3: 181.9 },
      { hour: '15:30', L1: 171.3, L2: 157.7, L3: 180.9 },
      { hour: '15:45', L1: 170.1, L2: 156.6, L3: 179.6 },
      { hour: '16:00', L1: 168.4, L2: 155.0, L3: 177.9 },
      { hour: '16:15', L1: 165.7, L2: 152.6, L3: 174.8 },
      { hour: '16:30', L1: 162.8, L2: 150.0, L3: 171.5 },
      { hour: '16:45', L1: 161.2, L2: 148.5, L3: 169.7 },
      { hour: '17:00', L1: 159.7, L2: 147.2, L3: 168.5 },
      { hour: '17:15', L1: 156.4, L2: 144.1, L3: 164.8 },
      { hour: '17:30', L1: 152.8, L2: 140.7, L3: 160.9 },
      { hour: '17:45', L1: 149.1, L2: 137.2, L3: 157.0 },
      { hour: '18:00', L1: 145.3, L2: 133.8, L3: 153.1 },
      { hour: '18:15', L1: 138.2, L2: 127.4, L3: 145.7 },
      { hour: '18:30', L1: 129.7, L2: 119.5, L3: 136.9 },
      { hour: '18:45', L1: 119.8, L2: 110.4, L3: 126.4 },
      { hour: '19:00', L1: 98.6, L2: 90.7, L3: 104.2 },
      { hour: '19:15', L1: 91.4, L2: 84.2, L3: 96.5 },
      { hour: '19:30', L1: 83.7, L2: 77.1, L3: 88.3 },
      { hour: '19:45', L1: 75.9, L2: 69.9, L3: 80.1 },
      { hour: '20:00', L1: 67.4, L2: 62.1, L3: 71.2 },
      { hour: '20:15', L1: 63.2, L2: 58.3, L3: 66.7 },
      { hour: '20:30', L1: 58.7, L2: 54.2, L3: 62.0 },
      { hour: '20:45', L1: 55.4, L2: 51.1, L3: 58.5 },
      { hour: '21:00', L1: 52.8, L2: 48.6, L3: 55.7 },
      { hour: '21:15', L1: 50.1, L2: 46.2, L3: 52.9 },
      { hour: '21:30', L1: 47.6, L2: 43.9, L3: 50.2 },
      { hour: '21:45', L1: 45.3, L2: 41.8, L3: 47.8 },
      { hour: '22:00', L1: 41.9, L2: 38.5, L3: 44.2 },
      { hour: '22:15', L1: 40.7, L2: 37.5, L3: 43.0 },
      { hour: '22:30', L1: 39.2, L2: 36.1, L3: 41.4 },
      { hour: '22:45', L1: 38.0, L2: 35.0, L3: 40.1 },
      { hour: '23:00', L1: 36.7, L2: 33.8, L3: 38.7 },
      { hour: '23:15', L1: 35.8, L2: 33.0, L3: 37.8 },
      { hour: '23:30', L1: 34.9, L2: 32.2, L3: 36.9 },
      { hour: '23:45', L1: 33.4, L2: 30.8, L3: 35.2 }
    ],
    day2: [
      { hour: '00:00', L1: 33.4, L2: 29.7, L3: 36.5 },
      { hour: '01:00', L1: 31.9, L2: 28.2, L3: 34.8 },
      { hour: '02:00', L1: 30.2, L2: 26.9, L3: 33.1 },
      { hour: '03:00', L1: 29.6, L2: 26.4, L3: 32.4 },
      { hour: '04:00', L1: 32.1, L2: 28.8, L3: 35.2 },
      { hour: '05:00', L1: 50.3, L2: 44.9, L3: 54.7 },
      { hour: '06:00', L1: 92.1, L2: 84.3, L3: 98.7 },
      { hour: '07:00', L1: 138.5, L2: 127.4, L3: 147.2 },
      { hour: '08:00', L1: 181.3, L2: 166.8, L3: 194.1 },
      { hour: '09:00', L1: 168.7, L2: 155.2, L3: 178.9 },
      { hour: '10:00', L1: 174.2, L2: 160.1, L3: 185.6 },
      { hour: '11:00', L1: 179.1, L2: 164.8, L3: 190.4 },
      { hour: '12:00', L1: 177.8, L2: 163.5, L3: 189.1 },
      { hour: '13:00', L1: 172.4, L2: 158.6, L3: 183.2 },
      { hour: '14:00', L1: 170.5, L2: 156.9, L3: 181.7 },
      { hour: '15:00', L1: 175.3, L2: 161.2, L3: 186.8 },
      { hour: '16:00', L1: 171.7, L2: 158.1, L3: 182.9 },
      { hour: '17:00', L1: 162.8, L2: 150.4, L3: 173.1 },
      { hour: '18:00', L1: 148.9, L2: 137.2, L3: 158.4 },
      { hour: '19:00', L1: 101.7, L2: 93.8, L3: 108.2 },
      { hour: '20:00', L1: 69.8, L2: 64.3, L3: 74.1 },
      { hour: '21:00', L1: 54.6, L2: 50.2, L3: 58.1 },
      { hour: '22:00', L1: 43.2, L2: 39.8, L3: 45.9 },
      { hour: '23:00', L1: 37.8, L2: 34.9, L3: 40.2 }
    ],
    day3: [
      { hour: '00:00', L1: 31.7, L2: 28.1, L3: 34.6 },
      { hour: '01:00', L1: 30.4, L2: 26.8, L3: 33.2 },
      { hour: '02:00', L1: 29.1, L2: 25.7, L3: 31.8 },
      { hour: '03:00', L1: 28.5, L2: 25.2, L3: 31.1 },
      { hour: '04:00', L1: 30.8, L2: 27.3, L3: 33.7 },
      { hour: '05:00', L1: 47.9, L2: 42.4, L3: 52.3 },
      { hour: '06:00', L1: 88.2, L2: 80.1, L3: 96.4 },
      { hour: '07:00', L1: 132.6, L2: 120.8, L3: 144.9 },
      { hour: '08:00', L1: 175.4, L2: 159.7, L3: 191.8 },
      { hour: '09:00', L1: 162.9, L2: 148.4, L3: 178.1 },
      { hour: '10:00', L1: 169.7, L2: 154.6, L3: 185.4 },
      { hour: '11:00', L1: 174.2, L2: 158.9, L3: 190.6 },
      { hour: '12:00', L1: 172.8, L2: 157.3, L3: 189.0 },
      { hour: '13:00', L1: 167.9, L2: 153.1, L3: 183.7 },
      { hour: '14:00', L1: 165.8, L2: 151.2, L3: 181.4 },
      { hour: '15:00', L1: 170.4, L2: 155.3, L3: 186.2 },
      { hour: '16:00', L1: 166.9, L2: 152.1, L3: 182.5 },
      { hour: '17:00', L1: 158.2, L2: 144.1, L3: 172.9 },
      { hour: '18:00', L1: 143.7, L2: 131.0, L3: 157.2 },
      { hour: '19:00', L1: 97.3, L2: 88.6, L3: 106.4 },
      { hour: '20:00', L1: 66.8, L2: 60.9, L3: 73.1 },
      { hour: '21:00', L1: 52.1, L2: 47.5, L3: 57.0 },
      { hour: '22:00', L1: 41.4, L2: 37.7, L3: 45.3 },
      { hour: '23:00', L1: 36.2, L2: 33.0, L3: 39.6 }
    ],
    day4: [
      { hour: '00:00', L1: 32.8, L2: 29.2, L3: 35.9 },
      { hour: '01:00', L1: 31.5, L2: 27.9, L3: 34.4 },
      { hour: '02:00', L1: 30.0, L2: 26.6, L3: 32.8 },
      { hour: '03:00', L1: 29.4, L2: 26.1, L3: 32.1 },
      { hour: '04:00', L1: 31.8, L2: 28.2, L3: 34.7 },
      { hour: '05:00', L1: 49.6, L2: 44.0, L3: 54.2 },
      { hour: '06:00', L1: 90.7, L2: 82.7, L3: 99.1 },
      { hour: '07:00', L1: 136.4, L2: 124.3, L3: 149.2 },
      { hour: '08:00', L1: 179.8, L2: 163.9, L3: 196.4 },
      { hour: '09:00', L1: 166.5, L2: 151.8, L3: 182.0 },
      { hour: '10:00', L1: 173.1, L2: 157.8, L3: 189.3 },
      { hour: '11:00', L1: 177.9, L2: 162.2, L3: 194.6 },
      { hour: '12:00', L1: 176.4, L2: 160.8, L3: 193.0 },
      { hour: '13:00', L1: 171.2, L2: 156.1, L3: 187.4 },
      { hour: '14:00', L1: 169.1, L2: 154.2, L3: 185.0 },
      { hour: '15:00', L1: 174.0, L2: 158.7, L3: 190.4 },
      { hour: '16:00', L1: 170.3, L2: 155.4, L3: 186.2 },
      { hour: '17:00', L1: 161.5, L2: 147.3, L3: 176.8 },
      { hour: '18:00', L1: 147.2, L2: 134.2, L3: 161.0 },
      { hour: '19:00', L1: 100.4, L2: 91.5, L3: 109.8 },
      { hour: '20:00', L1: 68.9, L2: 62.8, L3: 75.4 },
      { hour: '21:00', L1: 53.7, L2: 49.0, L3: 58.8 },
      { hour: '22:00', L1: 42.6, L2: 38.9, L3: 46.7 },
      { hour: '23:00', L1: 37.3, L2: 34.0, L3: 40.8 }
    ],
    day5: [
      { hour: '00:00', L1: 30.9, L2: 27.4, L3: 33.8 },
      { hour: '01:00', L1: 29.7, L2: 26.3, L3: 32.5 },
      { hour: '02:00', L1: 28.4, L2: 25.1, L3: 31.0 },
      { hour: '03:00', L1: 27.8, L2: 24.6, L3: 30.4 },
      { hour: '04:00', L1: 30.1, L2: 26.7, L3: 32.9 },
      { hour: '05:00', L1: 46.8, L2: 41.5, L3: 51.2 },
      { hour: '06:00', L1: 86.9, L2: 79.2, L3: 95.1 },
      { hour: '07:00', L1: 130.7, L2: 119.1, L3: 143.0 },
      { hour: '08:00', L1: 173.6, L2: 158.2, L3: 189.9 },
      { hour: '09:00', L1: 161.2, L2: 146.9, L3: 176.3 },
      { hour: '10:00', L1: 167.4, L2: 152.6, L3: 183.1 },
      { hour: '11:00', L1: 172.1, L2: 156.9, L3: 188.4 },
      { hour: '12:00', L1: 170.9, L2: 155.8, L3: 187.2 },
      { hour: '13:00', L1: 165.7, L2: 151.0, L3: 181.4 },
      { hour: '14:00', L1: 163.4, L2: 149.0, L3: 178.9 },
      { hour: '15:00', L1: 168.2, L2: 153.4, L3: 183.9 },
      { hour: '16:00', L1: 164.8, L2: 150.3, L3: 180.4 },
      { hour: '17:00', L1: 156.3, L2: 142.6, L3: 171.0 },
      { hour: '18:00', L1: 142.1, L2: 129.6, L3: 155.5 },
      { hour: '19:00', L1: 96.2, L2: 87.7, L3: 105.3 },
      { hour: '20:00', L1: 65.7, L2: 59.9, L3: 72.0 },
      { hour: '21:00', L1: 51.3, L2: 46.8, L3: 56.1 },
      { hour: '22:00', L1: 40.7, L2: 37.1, L3: 44.6 },
      { hour: '23:00', L1: 35.6, L2: 32.4, L3: 39.0 }
    ],
    day6: [
      { hour: '00:00', L1: 34.1, L2: 30.3, L3: 37.3 },
      { hour: '01:00', L1: 32.6, L2: 28.9, L3: 35.6 },
      { hour: '02:00', L1: 31.2, L2: 27.6, L3: 34.1 },
      { hour: '03:00', L1: 30.5, L2: 27.0, L3: 33.4 },
      { hour: '04:00', L1: 32.9, L2: 29.2, L3: 36.0 },
      { hour: '05:00', L1: 51.2, L2: 45.4, L3: 56.0 },
      { hour: '06:00', L1: 93.4, L2: 85.2, L3: 102.1 },
      { hour: '07:00', L1: 140.1, L2: 127.7, L3: 153.2 },
      { hour: '08:00', L1: 184.7, L2: 168.4, L3: 202.0 },
      { hour: '09:00', L1: 171.8, L2: 156.8, L3: 187.9 },
      { hour: '10:00', L1: 178.2, L2: 162.5, L3: 195.0 },
      { hour: '11:00', L1: 182.4, L2: 166.3, L3: 199.6 },
      { hour: '12:00', L1: 181.2, L2: 165.2, L3: 198.3 },
      { hour: '13:00', L1: 175.8, L2: 160.3, L3: 192.4 },
      { hour: '14:00', L1: 173.9, L2: 158.6, L3: 190.6 },
      { hour: '15:00', L1: 178.5, L2: 162.8, L3: 195.4 },
      { hour: '16:00', L1: 174.7, L2: 159.4, L3: 191.2 },
      { hour: '17:00', L1: 165.9, L2: 151.3, L3: 181.7 },
      { hour: '18:00', L1: 151.6, L2: 138.3, L3: 166.0 },
      { hour: '19:00', L1: 103.8, L2: 94.6, L3: 113.6 },
      { hour: '20:00', L1: 71.2, L2: 64.9, L3: 77.9 },
      { hour: '21:00', L1: 55.6, L2: 50.7, L3: 60.9 },
      { hour: '22:00', L1: 44.1, L2: 40.2, L3: 48.3 },
      { hour: '23:00', L1: 38.6, L2: 35.2, L3: 42.2 }
    ],
    day7: [
      { hour: '00:00', L1: 32.0, L2: 28.4, L3: 34.9 },
      { hour: '01:00', L1: 30.6, L2: 27.1, L3: 33.5 },
      { hour: '02:00', L1: 29.3, L2: 26.0, L3: 32.0 },
      { hour: '03:00', L1: 28.7, L2: 25.5, L3: 31.4 },
      { hour: '04:00', L1: 31.0, L2: 27.5, L3: 33.9 },
      { hour: '05:00', L1: 48.3, L2: 42.8, L3: 52.8 },
      { hour: '06:00', L1: 89.1, L2: 81.2, L3: 97.5 },
      { hour: '07:00', L1: 133.8, L2: 121.9, L3: 146.4 },
      { hour: '08:00', L1: 176.9, L2: 161.2, L3: 193.6 },
      { hour: '09:00', L1: 164.3, L2: 149.8, L3: 179.8 },
      { hour: '10:00', L1: 170.8, L2: 155.7, L3: 187.0 },
      { hour: '11:00', L1: 175.6, L2: 160.1, L3: 192.3 },
      { hour: '12:00', L1: 174.1, L2: 158.7, L3: 190.6 },
      { hour: '13:00', L1: 169.0, L2: 154.1, L3: 185.0 },
      { hour: '14:00', L1: 166.7, L2: 152.0, L3: 182.4 },
      { hour: '15:00', L1: 171.6, L2: 156.4, L3: 187.9 },
      { hour: '16:00', L1: 168.0, L2: 153.1, L3: 183.9 },
      { hour: '17:00', L1: 159.4, L2: 145.4, L3: 174.6 },
      { hour: '18:00', L1: 145.0, L2: 132.2, L3: 158.8 },
      { hour: '19:00', L1: 98.7, L2: 89.9, L3: 108.0 },
      { hour: '20:00', L1: 67.6, L2: 61.6, L3: 74.0 },
      { hour: '21:00', L1: 52.7, L2: 48.1, L3: 57.7 },
      { hour: '22:00', L1: 41.8, L2: 38.1, L3: 45.8 },
      { hour: '23:00', L1: 36.5, L2: 33.3, L3: 40.0 }
    ]
  };
  
  // 7-day hourly voltage data (every 4 hours for readability)
  const voltageData = [
    // Day 1 (11/02)
    { time: '11/02 00:00', L1N: 219.5, L2N: 219.3, L3N: 219.7, day: '11/02' },
    { time: '11/02 04:00', L1N: 219.8, L2N: 219.6, L3N: 220.0, day: '11/02' },
    { time: '11/02 08:00', L1N: 218.2, L2N: 217.9, L3N: 218.5, day: '11/02' },
    { time: '11/02 12:00', L1N: 216.8, L2N: 216.4, L3N: 217.2, day: '11/02' },
    { time: '11/02 16:00', L1N: 215.9, L2N: 215.5, L3N: 216.3, day: '11/02' },
    { time: '11/02 20:00', L1N: 218.7, L2N: 218.4, L3N: 219.0, day: '11/02' },
    
    // Day 2 (12/02)
    { time: '12/02 00:00', L1N: 220.2, L2N: 220.1, L3N: 220.0, day: '12/02' },
    { time: '12/02 04:00', L1N: 220.0, L2N: 219.9, L3N: 220.2, day: '12/02' },
    { time: '12/02 08:00', L1N: 218.5, L2N: 218.2, L3N: 218.8, day: '12/02' },
    { time: '12/02 12:00', L1N: 217.1, L2N: 216.7, L3N: 217.5, day: '12/02' },
    { time: '12/02 16:00', L1N: 216.2, L2N: 215.8, L3N: 216.6, day: '12/02' },
    { time: '12/02 20:00', L1N: 219.0, L2N: 218.7, L3N: 219.3, day: '12/02' },
    
    // Day 3 (13/02)
    { time: '13/02 00:00', L1N: 220.0, L2N: 219.8, L3N: 220.1, day: '13/02' },
    { time: '13/02 04:00', L1N: 219.7, L2N: 219.5, L3N: 219.9, day: '13/02' },
    { time: '13/02 08:00', L1N: 218.0, L2N: 217.7, L3N: 218.3, day: '13/02' },
    { time: '13/02 12:00', L1N: 216.9, L2N: 216.5, L3N: 217.3, day: '13/02' },
    { time: '13/02 16:00', L1N: 216.0, L2N: 215.6, L3N: 216.4, day: '13/02' },
    { time: '13/02 20:00', L1N: 218.8, L2N: 218.5, L3N: 219.1, day: '13/02' },
    
    // Day 4 (14/02)
    { time: '14/02 00:00', L1N: 219.9, L2N: 220.0, L3N: 220.0, day: '14/02' },
    { time: '14/02 04:00', L1N: 219.6, L2N: 219.8, L3N: 219.7, day: '14/02' },
    { time: '14/02 08:00', L1N: 218.3, L2N: 218.0, L3N: 218.6, day: '14/02' },
    { time: '14/02 12:00', L1N: 217.0, L2N: 216.6, L3N: 217.4, day: '14/02' },
    { time: '14/02 16:00', L1N: 216.1, L2N: 215.7, L3N: 216.5, day: '14/02' },
    { time: '14/02 20:00', L1N: 218.9, L2N: 218.6, L3N: 219.2, day: '14/02' },
    
    // Day 5 (15/02)
    { time: '15/02 00:00', L1N: 220.1, L2N: 220.2, L3N: 219.8, day: '15/02' },
    { time: '15/02 04:00', L1N: 219.8, L2N: 220.0, L3N: 219.6, day: '15/02' },
    { time: '15/02 08:00', L1N: 218.4, L2N: 218.1, L3N: 218.7, day: '15/02' },
    { time: '15/02 12:00', L1N: 217.2, L2N: 216.8, L3N: 217.6, day: '15/02' },
    { time: '15/02 16:00', L1N: 216.3, L2N: 215.9, L3N: 216.7, day: '15/02' },
    { time: '15/02 20:00', L1N: 219.1, L2N: 218.8, L3N: 219.4, day: '15/02' },
    
    // Day 6 (16/02)
    { time: '16/02 00:00', L1N: 220.0, L2N: 219.9, L3N: 220.1, day: '16/02' },
    { time: '16/02 04:00', L1N: 219.7, L2N: 219.6, L3N: 219.8, day: '16/02' },
    { time: '16/02 08:00', L1N: 218.1, L2N: 217.8, L3N: 218.4, day: '16/02' },
    { time: '16/02 12:00', L1N: 216.7, L2N: 216.3, L3N: 217.1, day: '16/02' },
    { time: '16/02 16:00', L1N: 215.8, L2N: 215.4, L3N: 216.2, day: '16/02' },
    { time: '16/02 20:00', L1N: 218.6, L2N: 218.3, L3N: 218.9, day: '16/02' },
    
    // Day 7 (17/02)
    { time: '17/02 00:00', L1N: 219.8, L2N: 220.0, L3N: 220.0, day: '17/02' },
    { time: '17/02 04:00', L1N: 219.5, L2N: 219.7, L3N: 219.6, day: '17/02' },
    { time: '17/02 08:00', L1N: 217.9, L2N: 217.6, L3N: 218.2, day: '17/02' },
    { time: '17/02 12:00', L1N: 216.5, L2N: 216.1, L3N: 216.9, day: '17/02' },
    { time: '17/02 16:00', L1N: 215.6, L2N: 215.2, L3N: 216.0, day: '17/02' },
    { time: '17/02 20:00', L1N: 218.4, L2N: 218.1, L3N: 218.7, day: '17/02' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg space-y-6">
      {/* Header */}
      <h3 className="text-lg font-bold text-gray-800 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-yellow-600" />
        {translations.quantifiedVoltageAnalysis}
      </h3>

      {/* Section 1: Voltage Graph */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-blue-600" />
          {translations.voltageGraph7Days}
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={voltageData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 60,
              }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(value) => value.split(' ')[0]}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={[210, 225]}
                label={{ value: translations.voltageUnit, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)} V`, 
                  name
                ]}
                labelFormatter={(label) => `${translations.time}: ${label}`}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line 
                type="monotone" 
                dataKey="L1N" 
                stroke="#10B981" 
                strokeWidth={2.5} 
                name={translations.lineL1}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3, stroke: 'white' }}
                activeDot={{ r: 5, fill: '#10B981' }}
              />
              <Line 
                type="monotone" 
                dataKey="L2N" 
                stroke="#EF4444" 
                strokeWidth={2.5} 
                name={translations.lineL2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 3, stroke: 'white' }}
                activeDot={{ r: 5, fill: '#EF4444' }}
              />
              <Line 
                type="monotone" 
                dataKey="L3N" 
                stroke="#3B82F6" 
                strokeWidth={2.5} 
                name={translations.lineL3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3, stroke: 'white' }}
                activeDot={{ r: 5, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Voltage Metrics Table */}
        <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
          <div className="bg-orange-100 rounded-t-lg px-4 py-2 -mx-4 -mt-4 mb-4">
            <h5 className="font-bold text-orange-800">Voltage Metrics</h5>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">Item</th>
                  <th className="text-left p-3 font-bold text-gray-700 bg-gray-100">Measured Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Minimum Voltage</td>
                  <td className="p-3 text-gray-800">≈ 225 V (LN2 during peak load)</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Maximum Voltage</td>
                  <td className="p-3 text-gray-800">≈ 237 V</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Typical Operating Range</td>
                  <td className="p-3 text-gray-800">228 - 235 V</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Voltage Drop at Peak Load</td>
                  <td className="p-3 text-gray-800">≈ 3 - 7 V</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 text-gray-800">Inter-phase Voltage Deviation</td>
                  <td className="p-3 text-gray-800">≈ 1.5 - 3.0 V (LN2 lowest)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Section 2: Daily Average Current List */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-amber-600" />
          {translations.dailyAverageCurrentList}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 border-2 border-blue-300 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all" onClick={() => setSelectedDay('day1')}>
            <div className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1">
              <div className="flex items-center">
                <Activity className="w-3 h-3 mr-1 text-blue-600" />
                {translations.day1}
              </div>
              <div className="text-xs font-normal text-gray-600 mt-1">11/02/2026</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">L1:</span>
                <span className="font-bold text-red-600">156.8A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L2:</span>
                <span className="font-bold text-green-600">142.4A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L3:</span>
                <span className="font-bold text-blue-600">168.2A</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600 hover:text-blue-800 font-medium text-center">
              <Eye className="w-3 h-3 inline mr-1" />
              {translations.clickToView24Hour}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border-2 border-blue-300 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all" onClick={() => setSelectedDay('day2')}>
            <div className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1">
              <div className="flex items-center">
                <Activity className="w-3 h-3 mr-1 text-blue-600" />
                {translations.day2}
              </div>
              <div className="text-xs font-normal text-gray-600 mt-1">12/02/2026</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">L1:</span>
                <span className="font-bold text-red-600">158.2A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L2:</span>
                <span className="font-bold text-green-600">144.1A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L3:</span>
                <span className="font-bold text-blue-600">170.5A</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600 hover:text-blue-800 font-medium text-center">
              <Eye className="w-3 h-3 inline mr-1" />
              {translations.clickToView24Hour}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border-2 border-blue-300 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all" onClick={() => setSelectedDay('day3')}>
            <div className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1">
              <div className="flex items-center">
                <Activity className="w-3 h-3 mr-1 text-blue-600" />
                {translations.day3}
              </div>
              <div className="text-xs font-normal text-gray-600 mt-1">13/02/2026</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">L1:</span>
                <span className="font-bold text-red-600">155.7A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L2:</span>
                <span className="font-bold text-green-600">141.8A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L3:</span>
                <span className="font-bold text-blue-600">167.9A</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600 hover:text-blue-800 font-medium text-center">
              <Eye className="w-3 h-3 inline mr-1" />
              {translations.clickToView24Hour}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border-2 border-blue-300 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all" onClick={() => setSelectedDay('day4')}>
            <div className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1">
              <div className="flex items-center">
                <Activity className="w-3 h-3 mr-1 text-blue-600" />
                {translations.day4}
              </div>
              <div className="text-xs font-normal text-gray-600 mt-1">14/02/2026</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">L1:</span>
                <span className="font-bold text-red-600">157.1A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L2:</span>
                <span className="font-bold text-green-600">143.6A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L3:</span>
                <span className="font-bold text-blue-600">169.3A</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600 hover:text-blue-800 font-medium text-center">
              <Eye className="w-3 h-3 inline mr-1" />
              {translations.clickToView24Hour}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border-2 border-blue-300 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all" onClick={() => setSelectedDay('day5')}>
            <div className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1">
              <div className="flex items-center">
                <Activity className="w-3 h-3 mr-1 text-blue-600" />
                {translations.day5}
              </div>
              <div className="text-xs font-normal text-gray-600 mt-1">15/02/2026</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">L1:</span>
                <span className="font-bold text-red-600">154.9A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L2:</span>
                <span className="font-bold text-green-600">140.7A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L3:</span>
                <span className="font-bold text-blue-600">166.4A</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600 hover:text-blue-800 font-medium text-center">
              <Eye className="w-3 h-3 inline mr-1" />
              {translations.clickToView24Hour}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border-2 border-blue-300 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all" onClick={() => setSelectedDay('day6')}>
            <div className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1">
              <div className="flex items-center">
                <Activity className="w-3 h-3 mr-1 text-blue-600" />
                {translations.day6}
              </div>
              <div className="text-xs font-normal text-gray-600 mt-1">16/02/2026</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">L1:</span>
                <span className="font-bold text-red-600">159.4A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L2:</span>
                <span className="font-bold text-green-600">145.2A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L3:</span>
                <span className="font-bold text-blue-600">171.8A</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600 hover:text-blue-800 font-medium text-center">
              <Eye className="w-3 h-3 inline mr-1" />
              {translations.clickToView24Hour}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border-2 border-blue-300 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all" onClick={() => setSelectedDay('day7')}>
            <div className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1">
              <div className="flex items-center">
                <Activity className="w-3 h-3 mr-1 text-blue-600" />
                {translations.day7}
              </div>
              <div className="text-xs font-normal text-gray-600 mt-1">17/02/2026</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">L1:</span>
                <span className="font-bold text-red-600">156.5A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L2:</span>
                <span className="font-bold text-green-600">142.3A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">L3:</span>
                <span className="font-bold text-blue-600">168.7A</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600 hover:text-blue-800 font-medium text-center">
              <Eye className="w-3 h-3 inline mr-1" />
              {translations.clickToView24Hour}
            </div>
          </div>
        </div>
        
        {/* Summary Statistics */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h5 className="text-xs font-bold text-gray-700 mb-3 text-center">{translations.summary7DaysAverage}</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 text-center border border-red-200 shadow-sm">
              <div className="text-xs font-semibold text-red-800 mb-1">L1 {translations.averageValue}</div>
              <div className="text-xl font-black text-red-900">156.8A</div>
              <div className="text-xs text-red-600 mt-2 space-y-0.5">
                <div>{translations.maxValue}: 159.4A</div>
                <div>{translations.minValue}: 154.9A</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center border border-green-200 shadow-sm">
              <div className="text-xs font-semibold text-green-800 mb-1">L2 {translations.averageValue}</div>
              <div className="text-xl font-black text-green-900">142.9A</div>
              <div className="text-xs text-green-600 mt-2 space-y-0.5">
                <div>{translations.maxValue}: 145.2A</div>
                <div>{translations.minValue}: 140.7A</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-200 shadow-sm">
              <div className="text-xs font-semibold text-blue-800 mb-1">L3 {translations.averageValue}</div>
              <div className="text-xl font-black text-blue-900">168.7A</div>
              <div className="text-xs text-blue-600 mt-2 space-y-0.5">
                <div>{translations.maxValue}: 171.8A</div>
                <div>{translations.minValue}: 166.4A</div>
              </div>
            </div>
          </div>
        </div>
      </div>
        
        {/* Modal for 24-Hour Data View */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {translations.currentRecordsList}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {translations.currentTable} {translations.every15Minutes}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="text-left p-3 font-bold text-gray-800 border-r border-gray-300">{translations.time}</th>
                        <th className="text-center p-3 font-bold text-red-700 border-r border-gray-300">L1 A</th>
                        <th className="text-center p-3 font-bold text-green-700 border-r border-gray-300">L2 A</th>
                        <th className="text-center p-3 font-bold text-blue-700">L3 A</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyHourlyData[selectedDay as keyof typeof dailyHourlyData].map((hourData, index) => {
                        const baseHour = parseInt(hourData.hour.split(':')[0]);
                        const currentValues = hourData;
                        const nextHourData = dailyHourlyData[selectedDay as keyof typeof dailyHourlyData][index + 1];
                        
                        // Generate 4 rows for each hour (00, 15, 30, 45 minutes)
                        const rows = [];
                        for (let i = 0; i < 4; i++) {
                          const minutes = i * 15;
                          const timeStr = `${baseHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                          
                          // Calculate interpolated values for 15-minute intervals
                          const ratio = i / 4;
                          const l1Value = nextHourData ? 
                            (currentValues.L1 + (nextHourData.L1 - currentValues.L1) * ratio).toFixed(1) : 
                            currentValues.L1.toFixed(1);
                          const l2Value = nextHourData ? 
                            (currentValues.L2 + (nextHourData.L2 - currentValues.L2) * ratio).toFixed(1) : 
                            currentValues.L2.toFixed(1);
                          const l3Value = nextHourData ? 
                            (currentValues.L3 + (nextHourData.L3 - currentValues.L3) * ratio).toFixed(1) : 
                            currentValues.L3.toFixed(1);
                          
                          rows.push(
                            <tr key={`${index}-${i}`} className={`border-b border-gray-200 ${((index * 4) + i) % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                              <td className="p-3 font-semibold text-blue-900 border-r border-gray-200">{timeStr}</td>
                              <td className="text-center p-3 font-semibold text-red-600 border-r border-gray-200">{l1Value}</td>
                              <td className="text-center p-3 font-semibold text-green-600 border-r border-gray-200">{l2Value}</td>
                              <td className="text-center p-3 font-semibold text-blue-600">{l3Value}</td>
                            </tr>
                          );
                        }
                        return rows;
                      }).flat()}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {translations.closeView}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

// Phase Balance Chart Component
const PhaseBalanceChart = ({ data, translations }: { data: PhaseData, translations: any }) => {
  const phaseData = [
    { phase: translations.l1Phase || 'L1', current: data.L1, fill: '#EF4444' },
    { phase: translations.l2Phase || 'L2', current: data.L2, fill: '#10B981' },
    { phase: translations.l3Phase || 'L3', current: data.L3, fill: '#3B82F6' },
    { phase: translations.neutralLine || 'N', current: data.N, fill: '#6B7280' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
        {translations.phaseDistribution}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={phaseData} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            tick={{ fontSize: 12 }}
            label={{ value: 'Current (A)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="category" 
            dataKey="phase" 
            tick={{ fontSize: 12 }}
            width={80}
          />
          <Tooltip 
            formatter={(value: number) => `${value}${translations.ampere || 'A'}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar 
            dataKey="current" 
            fill="#8884d8"
            radius={[0, 8, 8, 0]}
          >
            {phaseData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
// Translation additions for the analysis page
const analysisTranslations = {
  ko: {
    preInstallationCurrentAnalysis: '설치전 전류 분석',
    threePhaseCurrentPowerQuality: '3상 전류 및 전력 품질 분석 보고서',
    threePhaseCurrentAnalysis: '3상 전류 분석',
    datetime: '일시',
    technician: '기사',
    installationRecommended: '설치 권장',
    installationNotRecommended: '설치 권장하지 않음',
    additionalAnalysisRequired: '추가 분석 필요',
    branch: '지점',
    customerLocation: '고객 위치',
    measurementEquipment: '측정장비',
    measurementPeriod7Days: '측정기간 (7일)',
    electricalParametersAutoAnalyzed: '전기적 매개변수 (자동 분석됨)',
    voltage: '전압',
    frequency: '주파수',
    powerFactor: '역률',
    totalHarmonicDistortionTHD: '총 고조파 왜곡률(THD)',
    autoDetected: '자동 감지됨',
    standard: '표준',
    calculated: '계산됨',
    estimated: '추정됨',
    threePhaseCurrentAnalysisInput: '3상 전류 분석 (측정값 입력)',
    phaseBalance: '상 균형',
    imbalanceRate: '불균형률',
    good: '양호',
    fair: '보통',
    poor: '불량',
    analysisResults: '분석 결과',
    result: '결과',
    recommendedActions: '권장 조치',
    notes: '비고',
    technicalInterpretation: '기술적 해석',
    recommendedProduct: '추천 제품',
    madeBy: '작성자',
    date: '날짜',
    selectProduct: '제품 선택',
    selectEngineer: '엔지니어 선택',
    approvalPending: '승인 대기중',
    approvalApproved: '승인됨',
    requestApproval: '승인 요청',
    phaseDistribution: '상별 전류 분포',
    l1Phase: 'L1상',
    l2Phase: 'L2상', 
    l3Phase: 'L3상',
    neutralLine: 'N선',
    ampere: 'A',
    quantifiedCurrentAnalysis: '정량화된 전류 분석',
    quantifiedVoltageAnalysis: '정량화된 전압 분석',
    quantifiedPowerAnalysis: '정량화된 전력 분석',
    voltageGraph7Days: '전압 그래프 7일',
    currentGraph7Days: '전류 그래프 7일',
    powerGraph7Days: '전력 그래프 7일',
    currentRecordsList: '전력 기록 목록',
    summary7DaysAverage: '7일 평균 요약',
    enterPassword: '비밀번호 입력',
    verifyPassword: '비밀번호 확인',
    invalidPassword: '잘못된 비밀번호',
    recommendationText: 'L3상과 L2상 간 전류 차이가 큼. UPS 시스템 점검 및 부하 재분배 필요.',
    notesText: 'UPS 시스템으로 인한 고조파 및 상 불균형, 개선 후 재검토',
    saveNotes: '비고 저장',
    saved: '저장됨!',
    enterNotesPlaceholder: '분석 비고를 입력하세요...',
    technicalInterpretationText: 'Phase imbalance exceeding 10% generally considered undesirable in three phase systems. High imbalance typically over 25% on Phase 1 indicates inefficient load distribution, increased losses, and higher stress on upstream electrical equipment.',
    // Additional analysis fields
    additionalTestsRequired: '추가 필요 테스트',
    scheduledFollowUp: '추적 검사 예정',
    additionalEquipmentNeeded: '추가 필요 장비',
    estimatedCost: '예상 비용',
    riskAssessment: '위험 평가',
    harmonicAnalysis: '고조파 분석',
    powerQualityCheck: '전력 품질 검사',
    loadBalancing: '부하 균형 조정',
    temperatureMonitoring: '온도 모니터링',
    cableIntegrityTest: '케이블 무결성 테스트',
    followUpDate: '추적 검사일',
    assignedTechnician: '담당 기사',
    priority: '우선순위',
    expectedDuration: '예상 소요시간',
    required: '필요',
    optional: '선택',
    low: '낮음',
    medium: '보통',
    high: '높음',
    critical: '긴급',
    won: '원',
    // Document creation
    createDocument: '문서 생성',
    generatePDF: 'PDF 생성',
    createQuotation: '상품 견적서 생성',
    printDocument: '문서 인쇄',
    selectPrintLanguage: '인쇄 언어 선택',
    engineerApprovalRequired: '엔지니어 승인 필요',
    documentCreated: '문서가 성공적으로 생성됨',
    exportOptions: '내보내기 옵션',
    saveAsPDF: 'PDF로 저장',
    sendEmail: '이메일 발송',
    viewPreview: '미리보기',
    // Bill management
    createBill: '청구서 생성',
    viewBills: '청구서 보기',
    billManagement: '청구서 관리',
    newBill: '새 청구서',
    billCreated: '청구서가 생성되었습니다',
    billNumber: '청구서 번호',
    totalAmount: '총액',
    dueDate: '만기일',
    billStatus: '청구서 상태',
    pending: '대기중',
    paid: '지불완료',
    overdue: '연체',
    cancelled: '취소됨',
    viewAnalysisList: '사전 설치 분석 목록',
    analysisList: '분석 목록',
    sendToFlow: 'Flow 시스템으로 전송',
    flowIntegration: 'Flow 통합',
    emailSent: 'Flow 시스템으로 이메일 전송됨',
    flowSystemConnected: 'Flow 시스템 연결됨'
  },
  en: {
    preInstallationCurrentAnalysis: 'Pre-Installation Current Analysis',
    threePhaseCurrentPowerQuality: '3-Phase Current & Power Quality Analysis Report',
    threePhaseCurrentAnalysis: '3-Phase Current Analysis',
    datetime: 'Date/Time',
    technician: 'Technician',
    installationRecommended: 'Installation Recommended',
    installationNotRecommended: 'Installation Not Recommended',
    additionalAnalysisRequired: 'Additional Analysis Required',
    branch: 'Branch',
    customerLocation: 'Customer Location',
    measurementEquipment: 'Measurement Equipment',
    measurementPeriod7Days: 'Measurement Period (7 days)',
    electricalParametersAutoAnalyzed: 'Electrical Parameters (Auto-Analyzed)',
    voltage: 'Voltage',
    frequency: 'Frequency',
    powerFactor: 'Power Factor',
    totalHarmonicDistortionTHD: 'Total Harmonic Distortion (THD)',
    autoDetected: 'Auto-detected',
    standard: 'Standard',
    calculated: 'Calculated',
    estimated: 'Estimated',
    threePhaseCurrentAnalysisInput: '3-Phase Current Analysis (Input Measured Values)',
    phaseBalance: 'Phase Balance',
    imbalanceRate: 'Imbalance Rate',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    analysisResults: 'Analysis Results',
    result: 'Result',
    recommendedActions: 'Recommended Actions',
    notes: 'Notes',
    technicalInterpretation: 'Technical Interpretation',
    recommendedProduct: 'Recommended Product',
    madeBy: 'Made by',
    date: 'Date',
    selectProduct: 'Select Product',
    selectEngineer: 'Select Engineer',
    approvalPending: 'Approval Pending',
    approvalApproved: 'Approved',
    requestApproval: 'Request Approval',
    phaseDistribution: 'Phase Current Distribution',
    l1Phase: 'L1 Phase',
    l2Phase: 'L2 Phase', 
    l3Phase: 'L3 Phase',
    neutralLine: 'Neutral Line',
    ampere: 'A',
    quantifiedCurrentAnalysis: 'Quantified Current Analysis',
    quantifiedVoltageAnalysis: 'Quantified Voltage Analysis',
    quantifiedPowerAnalysis: 'Quantified Power Analysis',
    voltageGraph7Days: '7-Day Voltage Graph',
    currentGraph7Days: '7-Day Current Graph',
    powerGraph7Days: '7-Day Power Graph',
    currentRecordsList: 'Power Records List',
    summary7DaysAverage: '7-Day Average Summary',
    enterPassword: 'Enter Password',
    verifyPassword: 'Verify Password',
    invalidPassword: 'Invalid Password',
    recommendationText: 'Large current difference between L3 and L2 phases. UPS system inspection and load redistribution required.',
    notesText: 'Harmonics and phase imbalance due to UPS system, review after improvement',
    saveNotes: 'Save Notes',
    saved: 'Saved!',
    enterNotesPlaceholder: 'Enter analysis notes...',
    technicalInterpretationText: 'Phase imbalance exceeding 10% generally considered undesirable in three phase systems. High imbalance typically over 25% on Phase 1 indicates inefficient load distribution, increased losses, and higher stress on upstream electrical equipment.',
    // Additional analysis fields
    additionalTestsRequired: 'Additional Tests Required',
    scheduledFollowUp: 'Scheduled Follow-up',
    additionalEquipmentNeeded: 'Additional Equipment Needed',
    estimatedCost: 'Estimated Cost',
    riskAssessment: 'Risk Assessment',
    harmonicAnalysis: 'Harmonic Analysis',
    powerQualityCheck: 'Power Quality Check',
    loadBalancing: 'Load Balancing',
    temperatureMonitoring: 'Temperature Monitoring',
    cableIntegrityTest: 'Cable Integrity Test',
    followUpDate: 'Follow-up Date',
    assignedTechnician: 'Assigned Technician',
    priority: 'Priority',
    expectedDuration: 'Expected Duration',
    required: 'Required',
    optional: 'Optional',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    won: 'KRW',
    // Document creation
    createDocument: 'Create Document',
    generatePDF: 'Generate PDF',
    createQuotation: 'Create Quotation',
    printDocument: 'Print Document',
    selectPrintLanguage: 'Select Print Language',
    engineerApprovalRequired: 'Engineer Approval Required',
    documentCreated: 'Document Created Successfully',
    exportOptions: 'Export Options',
    saveAsPDF: 'Save as PDF',
    sendEmail: 'Send Email',
    viewPreview: 'View Preview',
    // Billing
    createBill: 'Create Bill',
    newBill: 'New Bill',
    billNumber: 'Bill Number',
    serviceFee: 'Service Fee',
    equipmentCost: 'Equipment Cost', 
    installationCost: 'Installation Cost',
    totalAmount: 'Total Amount',
    dueDate: 'Due Date',
    billStatus: 'Status',
    pending: 'Pending',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
    billCreated: 'Bill Created Successfully',
    viewBills: 'View Bills',
    billManagement: 'Bill Management',
    viewAnalysisList: 'Pre-Installation Analysis List',
    analysisList: 'Analysis List',
    sendToFlow: 'Send to Flow System',
    flowIntegration: 'Flow Integration',
    emailSent: 'Email sent to Flow System',
    flowSystemConnected: 'Connected to Flow System'
  }
};

// Custom Language Switcher for International Market Page (English & Korean only)
const InternationalLanguageSwitcher = () => {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = translations[locale];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'ko' as const, name: t.korean, flag: 'KR' as const },
    { code: 'en' as const, name: t.english, flag: 'GB' as const }
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <CountryFlag country={currentLanguage.flag} size="sm" />
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                setLocale(language.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                locale === language.code ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              <CountryFlag country={language.flag} size="sm" />
              <span>{language.name}</span>
              {locale === language.code && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function PreInstallationAnalysisPage(): JSX.Element {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const at = analysisTranslations[locale as keyof typeof analysisTranslations] || analysisTranslations.en;
  const [analysis, setAnalysis] = useState<AnalysisData>(sampleAnalysis);
  const [selectedBranch, setSelectedBranch] = useState('Vietnam');
  const [selectedCustomer, setSelectedCustomer] = useState('Ho Chi Minh City Office - UPS Room');
  const [selectedEquipment, setSelectedEquipment] = useState('Fluke 438-II Motor Analyzer');
  const [measurementStartDate, setMeasurementStartDate] = useState('2026-02-11');
  const [measurementEndDate, setMeasurementEndDate] = useState('2026-02-18');
  const [currentValues, setCurrentValues] = useState({
    L1: 156.3, // Phase A from 7-day measurement
    L2: 142.9, // Phase B from 7-day measurement  
    L3: 168.7, // Phase C from 7-day measurement
    N: 22.1
  });
  const [selectedProduct, setSelectedProduct] = useState('KSAVER 150KVA');
  const [selectedEngineer, setSelectedEngineer] = useState('Engr. Patrick Jung');
  const [engineerApprovalStatus, setEngineerApprovalStatus] = useState('approved');
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showAnalysisList, setShowAnalysisList] = useState(false);
  const [printLanguage, setPrintLanguage] = useState<'th' | 'ko' | 'vi' | 'en'>('en');
  const [analysisNotes, setAnalysisNotes] = useState<string>('');
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [previousNotesText, setPreviousNotesText] = useState<string>('');
  
  // Save notes function
  const handleSaveNotes = () => {
    // Update analysis notes
    setAnalysis((prevAnalysis) => ({
      ...prevAnalysis,
      notes: analysisNotes
    }));
    
    setShowSaveNotification(true);
    // Here you would typically save to backend/database
    console.log('Notes saved:', analysisNotes);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowSaveNotification(false);
    }, 3000);
  };
  
  // Update analysis with dynamic values after hydration to prevent SSR mismatch
  useEffect(() => {
    setAnalysis((prevAnalysis) => ({
      ...prevAnalysis,
      id: generateDocumentNumber(),
      datetime: getCurrentDateTime(),
      technician: selectedEngineer
    }));
  }, [selectedEngineer]); // Update when selectedEngineer changes
  
  // Update notes text when locale changes
  useEffect(() => {
    // If notes haven't been changed by user (still matches previous translation), update to new language
    if (analysisNotes === previousNotesText || analysisNotes === '') {
      setAnalysisNotes(at.notesText);
    }
    setPreviousNotesText(at.notesText);
  }, [locale, at.notesText]); // Update when locale or translation changes
  
  const handleEngineerChange = (engineer: string) => {
    setSelectedEngineer(engineer);
    setEngineerApprovalStatus('approved'); // Auto-approve all engineers
  };

  // Document creation functions
  const handleCreateDocument = async () => {
    if (engineerApprovalStatus !== 'approved') {
      alert(at.engineerApprovalRequired || 'Engineer approval required');
      return;
    }
    
    setIsGeneratingDocument(true);
    
    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would:
      // 1. Generate a formatted PDF report
      // 2. Save to database with unique ID
      // 3. Send to appropriate stakeholders
      
      const documentId = generateDocumentNumber();
      alert(`${at.documentCreated} - ${documentId}`);
      setShowExportOptions(true);
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Error creating document. Please try again.');
    } finally {
      setIsGeneratingDocument(false);
    }
  };

  // Report translations for multilingual print support
  const reportTranslations = {
    th: {
      companyName: '⚡ K Energy Save Co., Ltd. (Group of Zera)',
      reportTitle: 'รายงานการวิเคราะห์ก่อนการติดตั้ง',
      reportSubtitle: 'การวิเคราะห์กระแสไฟฟ้า 3 เฟส และคุณภาพไฟฟ้า',
      documentId: 'เลขที่เอกสาร',
      dateTime: 'วันที่และเวลา',
      branch: 'สาขา',
      location: 'สถานที่',
      customerInfo: 'ข้อมูลลูกค้า',
      customerName: 'ชื่อลูกค้า',
      contactPerson: 'ผู้ติดต่อ',
      phoneNumber: 'เบอร์โทรศัพท์',
      email: 'อีเมล',
      equipment: 'อุปกรณ์',
      technician: 'ช่างเทคนิค',
      installationRecommended: '✓ แนะนำให้ติดตั้ง',
      installationNotRecommended: '✗ ไม่แนะนำให้ติดตั้ง',
      furtherAnalysisRequired: '⚠ ต้องการการวิเคราะห์เพิ่มเติม',
      electricalParameters: '⚡ พารามิเตอร์ไฟฟ้า',
      parameter: 'พารามิเตอร์',
      value: 'ค่า',
      voltage: 'แรงดันไฟฟ้า',
      frequency: 'ความถี่',
      powerFactor: 'พาวเวอร์แฟกเตอร์',
      thd: 'THD (Total Harmonic Distortion)',
      phaseBalance: 'ความสมดุลของเฟส',
      currentMeasurements: '⚡ การวัดกระแสไฟฟ้า',
      phaseL1: 'เฟส L1',
      phaseL2: 'เฟส L2',
      phaseL3: 'เฟส L3',
      neutralCurrent: 'กระแสนิวทรัล',
      voltageMetrics: '📊 ค่าวัดแรงดันไฟฟ้า',
      item: 'รายการ',
      measuredValue: 'ค่าที่วัดได้',
      minimumVoltage: 'แรงดันไฟฟ้าต่ำสุด',
      maximumVoltage: 'แรงดันไฟฟ้าสูงสุด',
      typicalOperatingRange: 'ช่วงการทำงานปกติ',
      voltageDropAtPeakLoad: 'แรงดันตกที่ภาระสูงสุด',
      interphaseVoltageDeviation: 'ค่าเบี่ยงเบนแรงดันระหว่างเฟส',
      currentMetrics: '⚡ ค่าวัดกระแสไฟฟ้า',
      peakCurrentRange: 'ช่วงกระแสสูงสุด',
      nighttimeBaseCurrent: 'กระแสพื้นฐานช่วงกลางคืน',
      dominantPhase: 'เฟสหลัก',
      currentImbalanceRatio: 'อัตราส่วนความไม่สมดุลของกระแส',
      imbalanceOccurrence: 'การเกิดความไม่สมดุล',
      powerMetrics: '🔌 ค่าวัดกำลังไฟฟ้า',
      peakPowerDemand: 'ความต้องการกำลังไฟฟ้าสูงสุด',
      averageDaytimeLoad: 'ภาระเฉลี่ยช่วงกลางวัน',
      nighttimeBaseLoad: 'ภาระพื้นฐานช่วงกลางคืน',
      peakConcentrationPeriod: 'ช่วงเวลาที่มีภาระสูงสุด',
      recommendations: '💡 ข้อเสนอแนะ',
      additionalNotes: '📝 หมายเหตุเพิ่มเติม',
      generatedBy: 'รายงานนี้สร้างโดย K Energy Save Pre-Installation Analysis System',
      generatedOn: 'สร้างเมื่อ',
      technicianSignature: 'ลายเซ็นช่างเทคนิค',
      approvedBy: 'อนุมัติโดย',
      sampleRecommendation: 'กระแสไฟฟ้าในเฟส L3 และ L2 มีความแตกต่างกันสูง จำเป็นต้องตรวจสอบระบบ UPS และกระจายภาระใหม่',
      sampleNotes: 'พบการบิดเบี้ยวของคลื่นฮาร์โมนิกและความไม่สมดุลของเฟสจากระบบ UPS ควรปรับปรุงแล้วตรวจสอบใหม่',
    },
    ko: {
      companyName: '⚡ K Energy Save Co., Ltd. (Group of Zera)',
      reportTitle: '사전 설치 분석 보고서',
      reportSubtitle: '3상 전류 및 전력 품질 분석',
      documentId: '문서 ID',
      dateTime: '날짜 및 시간',
      branch: '지점',
      location: '위치',
      customerInfo: '고객 정보',
      customerName: '고객명',
      contactPerson: '담당자',
      phoneNumber: '전화번호',
      email: '이메일',
      equipment: '장비',
      technician: '기술자',
      installationRecommended: '✓ 설치 권장',
      installationNotRecommended: '✗ 설치 비권장',
      furtherAnalysisRequired: '⚠ 추가 분석 필요',
      electricalParameters: '⚡ 전기 파라미터',
      parameter: '파라미터',
      value: '값',
      voltage: '전압',
      frequency: '주파수',
      powerFactor: '역률',
      thd: 'THD (총 고조파 왜곡)',
      phaseBalance: '상 균형',
      currentMeasurements: '⚡ 전류 측정',
      phaseL1: 'L1상',
      phaseL2: 'L2상',
      phaseL3: 'L3상',
      neutralCurrent: '중성선 전류',
      voltageMetrics: '📊 전압 측정치',
      item: '항목',
      measuredValue: '측정값',
      minimumVoltage: '최소 전압',
      maximumVoltage: '최대 전압',
      typicalOperatingRange: '일반 작동 범위',
      voltageDropAtPeakLoad: '최대 부하시 전압 강하',
      interphaseVoltageDeviation: '상간 전압 편차',
      currentMetrics: '⚡ 전류 측정치',
      peakCurrentRange: '피크 전류 범위',
      nighttimeBaseCurrent: '야간 기본 전류',
      dominantPhase: '주요 상',
      currentImbalanceRatio: '전류 불균형 비율',
      imbalanceOccurrence: '불균형 발생',
      powerMetrics: '🔌 전력 측정치',
      peakPowerDemand: '피크 전력 수요',
      averageDaytimeLoad: '평균 주간 부하',
      nighttimeBaseLoad: '야간 기본 부하',
      peakConcentrationPeriod: '피크 집중 기간',
      recommendations: '💡 권장사항',
      additionalNotes: '📝 추가 참고사항',
      generatedBy: '이 보고서는 K Energy Save 사전 설치 분석 시스템에서 생성되었습니다',
      generatedOn: '생성일',
      technicianSignature: '기술자 서명',
      approvedBy: '승인자',
      sampleRecommendation: 'L3상과 L2상 간 전류 차이가 큼. UPS 시스템 점검 및 부하 재분배 필요.',
      sampleNotes: 'UPS 시스템으로 인한 고조파 및 상 불균형, 개선 후 재검토',
    },
    vi: {
      companyName: '⚡ K Energy Save Co., Ltd. (Group of Zera)',
      reportTitle: 'Báo Cáo Phân Tích Trước Lắp Đặt',
      reportSubtitle: 'Phân Tích Dòng Điện 3 Pha & Chất Lượng Điện Năng',
      documentId: 'Mã Tài Liệu',
      dateTime: 'Ngày & Giờ',
      branch: 'Chi Nhánh',
      location: 'Vị Trí',
      customerInfo: 'Thông Tin Khách Hàng',
      customerName: 'Tên Khách Hàng',
      contactPerson: 'Người Liên Hệ',
      phoneNumber: 'Số Điện Thoại',
      email: 'Email',
      equipment: 'Thiết Bị',
      technician: 'Kỹ Thuật Viên',
      installationRecommended: '✓ KHUYẾN NGHỊ LẮP ĐẶT',
      installationNotRecommended: '✗ KHÔNG KHUYẾN NGHỊ LẮP ĐẶT',
      furtherAnalysisRequired: '⚠ YÊU CẦU PHÂN TÍCH THÊM',
      electricalParameters: '⚡ Thông Số Điện',
      parameter: 'Thông Số',
      value: 'Giá Trị',
      voltage: 'Điện Áp',
      frequency: 'Tần Số',
      powerFactor: 'Hệ Số Công Suất',
      thd: 'THD (Méo Hài Tổng)',
      phaseBalance: 'Cân Bằng Pha',
      currentMeasurements: '⚡ Đo Dòng Điện',
      phaseL1: 'Pha L1',
      phaseL2: 'Pha L2',
      phaseL3: 'Pha L3',
      neutralCurrent: 'Dòng Trung Tính',
      voltageMetrics: '📊 Chỉ Số Điện Áp',
      item: 'Mục',
      measuredValue: 'Giá Trị Đo',
      minimumVoltage: 'Điện Áp Tối Thiểu',
      maximumVoltage: 'Điện Áp Tối Đa',
      typicalOperatingRange: 'Phạm Vi Hoạt Động Thông Thường',
      voltageDropAtPeakLoad: 'Sụt Áp Tại Tải Đỉnh',
      interphaseVoltageDeviation: 'Độ Lệch Điện Áp Giữa Các Pha',
      currentMetrics: '⚡ Chỉ Số Dòng Điện',
      peakCurrentRange: 'Phạm Vi Dòng Điện Đỉnh',
      nighttimeBaseCurrent: 'Dòng Điện Cơ Bản Ban Đêm',
      dominantPhase: 'Pha Chủ Đạo',
      currentImbalanceRatio: 'Tỷ Lệ Mất Cân Bằng Dòng Điện',
      imbalanceOccurrence: 'Xuất Hiện Mất Cân Bằng',
      powerMetrics: '🔌 Chỉ Số Công Suất',
      peakPowerDemand: 'Nhu Cầu Công Suất Đỉnh',
      averageDaytimeLoad: 'Tải Trung Bình Ban Ngày',
      nighttimeBaseLoad: 'Tải Cơ Bản Ban Đêm',
      peakConcentrationPeriod: 'Thời Gian Tập Trung Đỉnh',
      recommendations: '💡 Khuyến Nghị',
      additionalNotes: '📝 Ghi Chú Bổ Sung',
      generatedBy: 'Báo cáo này được tạo bởi Hệ Thống Phân Tích Trước Lắp Đặt K Energy Save',
      generatedOn: 'Được tạo vào',
      technicianSignature: 'Chữ Ký Kỹ Thuật Viên',
      approvedBy: 'Được Phê Duyệt Bởi',
      sampleRecommendation: 'Sự chênh lệch dòng điện giữa pha L3 và L2 lớn. Cần kiểm tra hệ thống UPS và phân phối lại tải.',
      sampleNotes: 'Méo hài và mất cân bằng pha do hệ thống UPS, cần cải thiện rồi xem xét lại',
    },
    en: {
      companyName: '⚡ K Energy Save Co., Ltd. (Group of Zera)',
      reportTitle: 'Pre-Installation Analysis Report',
      reportSubtitle: '3-Phase Current & Power Quality Analysis',
      documentId: 'Document ID',
      dateTime: 'Date & Time',
      branch: 'Branch',
      location: 'Location',
      customerInfo: 'Customer Information',
      customerName: 'Customer Name',
      contactPerson: 'Contact Person',
      phoneNumber: 'Phone Number',
      email: 'Email',
      equipment: 'Equipment',
      technician: 'Technician',
      installationRecommended: '✓ INSTALLATION RECOMMENDED',
      installationNotRecommended: '✗ INSTALLATION NOT RECOMMENDED',
      furtherAnalysisRequired: '⚠ FURTHER ANALYSIS REQUIRED',
      electricalParameters: '⚡ Electrical Parameters',
      parameter: 'Parameter',
      value: 'Value',
      voltage: 'Voltage',
      frequency: 'Frequency',
      powerFactor: 'Power Factor',
      thd: 'THD (Total Harmonic Distortion)',
      phaseBalance: 'Phase Balance',
      currentMeasurements: '⚡ Current Measurements',
      phaseL1: 'Phase L1',
      phaseL2: 'Phase L2',
      phaseL3: 'Phase L3',
      neutralCurrent: 'Neutral Current',
      voltageMetrics: '📊 Voltage Metrics',
      item: 'Item',
      measuredValue: 'Measured Value',
      minimumVoltage: 'Minimum Voltage',
      maximumVoltage: 'Maximum Voltage',
      typicalOperatingRange: 'Typical Operating Range',
      voltageDropAtPeakLoad: 'Voltage Drop at Peak Load',
      interphaseVoltageDeviation: 'Inter-phase Voltage Deviation',
      currentMetrics: '⚡ Current Metrics',
      peakCurrentRange: 'Peak Current Range',
      nighttimeBaseCurrent: 'Nighttime Base Current',
      dominantPhase: 'Dominant Phase',
      currentImbalanceRatio: 'Current Imbalance Ratio',
      imbalanceOccurrence: 'Imbalance Occurrence',
      powerMetrics: '🔌 Power Metrics',
      peakPowerDemand: 'Peak Power Demand',
      averageDaytimeLoad: 'Average Daytime Load',
      nighttimeBaseLoad: 'Nighttime Base Load',
      peakConcentrationPeriod: 'Peak Concentration Period',
      recommendations: '💡 Recommendations',
      additionalNotes: '📝 Additional Notes',
      generatedBy: 'This report is generated by K Energy Save Pre-Installation Analysis System',
      generatedOn: 'Generated on',
      technicianSignature: 'Technician Signature',
      approvedBy: 'Approved By',
      sampleRecommendation: 'Significant current difference between Phase L3 and L2. UPS system inspection and load redistribution required.',
      sampleNotes: 'Harmonic distortion and phase imbalance due to UPS system, improvement and re-evaluation needed',
    }
  };

  const handlePrintDocument = () => {
    // Get translations for selected language
    const t = reportTranslations[printLanguage];
    
    // Create printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
<!DOCTYPE html>
<html lang="${printLanguage}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.reportTitle} - ${analysis.id}</title>
  <style>
    @media print {
      @page { 
        size: A4;
        margin: 1cm;
      }
      body { margin: 0; padding: 0 !important; }
      .print-instructions { display: none !important; }
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6; 
      color: #1f2937;
      padding: 1cm;
      background: white;
      font-size: 11px;
    }
    
    /* Header */
    .report-header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 4px solid #10b981;
      margin-bottom: 25px;
    }
    .company-name {
      font-size: 22px;
      font-weight: bold;
      color: #065f46;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .report-title {
      font-size: 18px;
      font-weight: 600;
      color: #4b5563;
      margin: 10px 0;
    }
    .report-subtitle {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }
    
    /* Document Info */
    .doc-info {
      background: #f0fdf4;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
      margin-bottom: 20px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .info-item {
      padding: 6px 8px;
      background: white;
      border-radius: 4px;
    }
    .info-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 9px;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    .info-value {
      color: #111827;
      font-size: 11px;
      font-weight: 600;
    }
    
    /* Analysis Result Box */
    .result-box {
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
      border: 2px solid;
    }
    .result-recommended {
      background: #d1fae5;
      border-color: #10b981;
      color: #065f46;
    }
    .result-not-recommended {
      background: #fee2e2;
      border-color: #ef4444;
      color: #991b1b;
    }
    .result-further {
      background: #fef3c7;
      border-color: #f59e0b;
      color: #92400e;
    }
    .result-title {
      font-size: 14px;
      font-weight: bold;
    }
    
    /* Section Titles */
    h2 {
      color: #065f46;
      font-size: 14px;
      font-weight: bold;
      margin: 20px 0 10px;
      padding: 8px 10px;
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      border-radius: 4px;
    }
    
    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      page-break-inside: avoid;
    }
    .data-table th {
      background: #065f46;
      color: white;
      padding: 8px 10px;
      text-align: left;
      font-size: 10px;
      font-weight: 600;
    }
    .data-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 10px;
    }
    .data-table td strong {
      color: #065f46;
      font-weight: 600;
    }
    .data-table tr:nth-child(even) {
      background: #f9fafb;
    }
    
    /* Metrics Tables */
    .metrics-section {
      margin: 20px 0;
      page-break-inside: avoid;
      padding: 10px 0;
    }
    .metrics-title {
      font-size: 13px;
      font-weight: bold;
      color: #065f46;
      margin-bottom: 10px;
      padding: 8px 10px;
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      border-radius: 4px;
    }
    .metrics-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    .metrics-table th {
      background: #f0fdf4;
      padding: 8px 10px;
      text-align: left;
      border: 1px solid #d1d5db;
      font-size: 10px;
      font-weight: 600;
      color: #065f46;
    }
    .metrics-table td {
      padding: 6px 10px;
      border: 1px solid #d1d5db;
      font-size: 10px;
      line-height: 1.5;
    }
    
    /* Current Data */
    .current-data {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 15px 0;
    }
    .phase-box {
      padding: 10px;
      border-radius: 6px;
      text-align: center;
      border: 2px solid;
    }
    .phase-a { border-color: #ef4444; background: #fee2e2; }
    .phase-b { border-color: #10b981; background: #d1fae5; }
    .phase-c { border-color: #3b82f6; background: #dbeafe; }
    .phase-label {
      font-size: 9px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #4b5563;
      text-transform: uppercase;
    }
    .phase-value {
      font-size: 18px;
      font-weight: bold;
    }
    
    /* Recommendations */
    .recommendations {
      background: #f0fdf4;
      border: 2px solid #10b981;
      border-radius: 6px;
      padding: 12px;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    .recommendations-title {
      font-size: 12px;
      font-weight: bold;
      color: #065f46;
      margin-bottom: 8px;
    }
    .recommendations-text {
      color: #064e3b;
      font-size: 10px;
      line-height: 1.6;
    }
    
    /* Chart Sections */
    .chart-container {
      margin: 15px 0;
      padding: 15px;
      background: #f8fafc;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      page-break-inside: avoid;
    }
    .chart-title {
      font-size: 12px;
      font-weight: bold;
      color: #065f46;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    .chart-flex {
      display: flex;
      gap: 15px;
    }
    .chart-area {
      flex: 2;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 10px;
      min-height: 180px;
    }
    .chart-legend {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .legend-item {
      border-radius: 8px;
      padding: 8px;
      text-align: center;
      border: 2px solid;
    }
    
    /* Footer */
    .report-footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      page-break-inside: avoid;
      text-align: center;
    }
    .signature-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
      margin-top: 40px;
    }
    .signature-box {
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #6b7280;
      margin: 50px 20px 8px;
    }
    .signature-label {
      font-size: 9px;
      color: #6b7280;
      text-transform: uppercase;
    }
    
    .notes-section {
      background: #fffbeb;
      border: 2px solid #fbbf24;
      border-radius: 6px;
      padding: 12px;
      margin: 15px 0;
    }
    .notes-section h3 {
      margin: 0 0 8px 0;
      color: #92400e;
      font-size: 11px;
      font-weight: bold;
    }
    .notes-section p {
      margin: 0;
      color: #78350f;
      font-size: 9px;
      line-height: 1.4;
    }
    
    .additional-tests {
      margin: 15px 0;
    }
    .test-item {
      padding: 6px 10px;
      background: #f0fdf4;
      margin: 5px 0;
      border-radius: 4px;
      font-size: 9px;
      border-left: 3px solid #10b981;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="report-header">
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 15px; text-align: center;">
      <img src="/kenergysave-logo.avif" alt="K Energy Save Logo" style="height: 50px; width: auto; margin-bottom: 10px;" />
      <div>
        <div class="company-name" style="text-align: center;">K ENERGY SAVE CO., LTD. (Group of Zera)</div>
        <div class="report-title" style="text-align: center;">${t.reportTitle}</div>
      </div>
    </div>
    <div class="report-subtitle" style="text-align: center;">${new Date().toLocaleDateString(printLanguage === 'th' ? 'th-TH' : printLanguage === 'ko' ? 'ko-KR' : printLanguage === 'vi' ? 'vi-VN' : 'en-US')}</div>
  </div>
  
  <!-- Print Instructions -->
  <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; page-break-inside: avoid;">
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
      <svg style="width: 20px; height: 20px; fill: #0ea5e9;" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-2h1v2zm1 0v2h6v-2H6zm0-1h8v-2H6v2z" clip-rule="evenodd" />
      </svg>
      <span style="color: #0ea5e9; font-weight: bold; font-size: 14px;">
        ${printLanguage === 'ko' ? '인쇄 미리보기' : printLanguage === 'th' ? 'ตัวอย่างก่อนพิมพ์' : printLanguage === 'vi' ? 'Xem Trước In' : 'Print Preview'}
      </span>
    </div>
    <button onclick="window.print()" style="background: #0ea5e9; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; transition: all 0.2s;">
      🖨️ ${printLanguage === 'ko' ? '지금 인쇄하기' : printLanguage === 'th' ? 'พิมพ์เลย' : printLanguage === 'vi' ? 'In Ngay' : 'Print Now'}
    </button>
    <div style="margin-top: 8px; font-size: 10px; color: #64748b;">
      ${printLanguage === 'ko' ? '이 미리보기를 확인한 후 인쇄 버튼을 클릭하세요' : printLanguage === 'th' ? 'ตรวจสอบตัวอย่างนี้แล้วคลิกปุ่มพิมพ์' : printLanguage === 'vi' ? 'Kiểm tra bản xem trước này và nhấp vào nút in' : 'Review this preview and click the print button'}
    </div>
  </div>
  
  <!-- Document Information -->
  <div class="doc-info">
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">${t.documentId}:</div>
        <div class="info-value">${analysis.id}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${t.dateTime}:</div>
        <div class="info-value">${analysis.datetime}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${t.branch}:</div>
        <div class="info-value">${selectedBranch}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${t.location}:</div>
        <div class="info-value">${selectedCustomer}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${t.customerInfo}:</div>
        <div class="info-value">${selectedCustomer || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${t.equipment}:</div>
        <div class="info-value">${selectedEquipment}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${t.technician}:</div>
        <div class="info-value">${analysis.technician}</div>
      </div>
    </div>
  </div>
  
  <!-- Analysis Result -->
  <div class="result-box result-${analysis.result === 'Recommended' ? 'recommended' : analysis.result === 'Not Recommended' ? 'not-recommended' : 'further'}">
    <div class="result-title">
      ${analysis.result === 'Recommended' ? t.installationRecommended : 
        analysis.result === 'Not Recommended' ? t.installationNotRecommended : 
        t.furtherAnalysisRequired}
    </div>
  </div>
  
  <!-- Electrical Parameters -->
  <h2>${t.electricalParameters}</h2>
  <table class="data-table">
    <tr>
      <th>${t.parameter}</th>
      <th>${t.value}</th>
    </tr>
    <tr>
      <td><strong>${t.voltage}</strong></td>
      <td>${analysis.voltage} V</td>
    </tr>
    <tr>
      <td><strong>${t.frequency}</strong></td>
      <td>${analysis.frequency} Hz</td>
    </tr>
    <tr>
      <td><strong>${t.powerFactor}</strong></td>
      <td>${analysis.powerFactor}</td>
    </tr>
    <tr>
      <td><strong>${t.thd}</strong></td>
      <td>${analysis.thd}%</td>
    </tr>
    <tr>
      <td><strong>${t.phaseBalance}</strong></td>
      <td>${analysis.balance}</td>
    </tr>
  </table>
  
  <!-- Current Measurements -->
  <h2>${t.currentMeasurements}</h2>
  <div class="current-data">
    <div class="phase-box phase-a">
      <div class="phase-label">${t.phaseL1}</div>
      <div class="phase-value" style="color: #ef4444;">${analysis.current.L1}A</div>
    </div>
    <div class="phase-box phase-b">
      <div class="phase-label">${t.phaseL2}</div>
      <div class="phase-value" style="color: #10b981;">${analysis.current.L2}A</div>
    </div>
    <div class="phase-box phase-c">
      <div class="phase-label">${t.phaseL3}</div>
      <div class="phase-value" style="color: #3b82f6;">${analysis.current.L3}A</div>
    </div>
  </div>
  <div style="text-align: center; padding: 10px; background: #f0fdf4; border-radius: 6px; margin: 10px 0; border: 1px solid #d1d5db;">
    <strong style="font-size: 10px; color: #065f46;">${t.neutralCurrent}:</strong> <span style="font-size: 14px; font-weight: bold; color: #10b981;">${analysis.current.N}A</span>
  </div>
  
  <!-- Voltage Metrics -->
  <div class="metrics-section">
    <div class="metrics-title">${t.voltageMetrics}</div>
    <table class="metrics-table">
      <thead>
        <tr>
          <th>${t.item}</th>
          <th>${t.measuredValue}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${t.minimumVoltage}</td>
          <td>≈ 225 V (LN2 during peak load)</td>
        </tr>
        <tr>
          <td>${t.maximumVoltage}</td>
          <td>≈ 237 V</td>
        </tr>
        <tr>
          <td>${t.typicalOperatingRange}</td>
          <td><strong>228 - 235 V</strong></td>
        </tr>
        <tr>
          <td>${t.voltageDropAtPeakLoad}</td>
          <td>≈ 3 - 7 V</td>
        </tr>
        <tr>
          <td>${t.interphaseVoltageDeviation}</td>
          <td>≈ 1.5 - 3.0 V (LN2 lowest)</td>
        </tr>
      </tbody>
    </table>
    
    <!-- Voltage Chart -->
    <div style="margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; font-weight: bold; color: #065f46; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">⚡</span> Voltage Analysis (7 Days)
      </div>
      <div style="display: flex; gap: 15px;">
        <!-- Line Chart Area -->
        <div style="flex: 2; height: 180px; position: relative; background: white; border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px;">
          <svg width="100%" height="100%" viewBox="0 0 300 140" style="overflow: visible;">
            <!-- Grid Lines -->
            <defs>
              <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="2,2"/>
              </pattern>
            </defs>
            <rect width="300" height="140" fill="url(#grid)" />
            
            <!-- L1-N Line (Green) -->
            <polyline points="20,70 60,68 100,72 140,74 180,68 220,70 260,76 300,70" 
                     fill="none" stroke="#10b981" stroke-width="2"/>
            <!-- L2-N Line (Red) -->  
            <polyline points="20,68 60,66 100,74 140,70 180,64 220,68 260,78 300,66"
                     fill="none" stroke="#ef4444" stroke-width="2"/>
            <!-- L3-N Line (Blue) -->
            <polyline points="20,72 60,70 100,68 140,70 180,76 220,68 260,70 300,72"
                     fill="none" stroke="#3b82f6" stroke-width="2"/>
                     
            <!-- Data Points -->
            <circle cx="20" cy="70" r="2" fill="#10b981" stroke="white" stroke-width="1"/>
            <circle cx="60" cy="68" r="2" fill="#10b981" stroke="white" stroke-width="1"/>
            <circle cx="100" cy="72" r="2" fill="#10b981" stroke="white" stroke-width="1"/>
            <circle cx="140" cy="74" r="2" fill="#10b981" stroke="white" stroke-width="1"/>
            <circle cx="180" cy="68" r="2" fill="#10b981" stroke="white" stroke-width="1"/>
            <circle cx="220" cy="70" r="2" fill="#10b981" stroke="white" stroke-width="1"/>
            <circle cx="260" cy="76" r="2" fill="#10b981" stroke="white" stroke-width="1"/>
            <circle cx="300" cy="70" r="2" fill="#10b981" stroke="white" stroke-width="1"/>
            
            <!-- Axis Labels -->
            <text x="20" y="155" text-anchor="middle" font-size="8" fill="#6b7280">11/02</text>
            <text x="100" y="155" text-anchor="middle" font-size="8" fill="#6b7280">13/02</text>
            <text x="180" y="155" text-anchor="middle" font-size="8" fill="#6b7280">15/02</text>
            <text x="260" y="155" text-anchor="middle" font-size="8" fill="#6b7280">17/02</text>
            
            <text x="5" y="75" text-anchor="middle" font-size="8" fill="#6b7280">220V</text>
            <text x="5" y="35" text-anchor="middle" font-size="8" fill="#6b7280">225V</text>
          </svg>
        </div>
        
        <!-- Value Cards -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-right: 6px;"></div>
              <span style="font-size: 8px; color: #6b7280; font-weight: 600;">L1-N Phase</span>
            </div>
            <div style="font-size: 14px; font-weight: bold; color: #065f46;">220V</div>
          </div>
          <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; margin-right: 6px;"></div>
              <span style="font-size: 8px; color: #6b7280; font-weight: 600;">L2-N Phase</span>
            </div>
            <div style="font-size: 14px; font-weight: bold; color: #dc2626;">220V</div>
          </div>
          <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-right: 6px;"></div>
              <span style="font-size: 8px; color: #6b7280; font-weight: 600;">L3-N Phase</span>
            </div>
            <div style="font-size: 14px; font-weight: bold; color: #2563eb;">220V</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Current Metrics -->
  <div class="metrics-section">
    <div class="metrics-title">${t.currentMetrics}</div>
    <table class="metrics-table">
      <thead>
        <tr>
          <th>${t.item}</th>
          <th>${t.measuredValue}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${t.peakCurrentRange}</td>
          <td>≈ 260 - 330 A per phase</td>
        </tr>
        <tr>
          <td>${t.nighttimeBaseCurrent}</td>
          <td>≈ 20 - 30 A</td>
        </tr>
        <tr>
          <td>${t.dominantPhase}</td>
          <td><strong>Phase 1</strong></td>
        </tr>
        <tr>
          <td>${t.currentImbalanceRatio}</td>
          <td>≈ 15 - 25 %</td>
        </tr>
        <tr>
          <td>${t.imbalanceOccurrence}</td>
          <td>Main feeder Phase 1 vs Phase 2/3 during 10:00-17:00</td>
        </tr>
      </tbody>
    </table>
    
    <!-- Current Chart -->
    <div style="margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; font-weight: bold; color: #065f46; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">⚡</span> Current Analysis (7 Days)
      </div>
      <div style="display: flex; gap: 15px;">
        <!-- Line Chart Area -->
        <div style="flex: 2; height: 200px; position: relative; background: white; border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px;">
          <svg width="100%" height="100%" viewBox="0 0 300 160" style="overflow: visible;">
            <!-- Grid Lines -->
            <defs>
              <pattern id="currentGrid" width="30" height="20" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="2,2"/>
              </pattern>
            </defs>
            <rect width="300" height="160" fill="url(#currentGrid)" />
            
            <!-- Phase A Line (Red) - Highest values -->
            <polyline points="20,45 60,48 100,42 140,46 180,44 220,45 260,50 300,45" 
                     fill="none" stroke="#ef4444" stroke-width="3"/>
            <!-- Phase B Line (Green) - Medium values -->  
            <polyline points="20,65 60,68 100,62 140,66 180,64 220,65 260,70 300,65"
                     fill="none" stroke="#10b981" stroke-width="3"/>
            <!-- Phase C Line (Blue) - Highest values -->
            <polyline points="20,40 60,43 100,37 140,41 180,39 220,40 260,45 300,40"
                     fill="none" stroke="#3b82f6" stroke-width="3"/>
                     
            <!-- Data Points -->
            <!-- Phase A Points -->
            <circle cx="20" cy="45" r="3" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="60" cy="48" r="3" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="100" cy="42" r="3" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="140" cy="46" r="3" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="180" cy="44" r="3" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="220" cy="45" r="3" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="260" cy="50" r="3" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="300" cy="45" r="3" fill="#ef4444" stroke="white" stroke-width="2"/>
            
            <!-- Phase B Points -->
            <circle cx="20" cy="65" r="3" fill="#10b981" stroke="white" stroke-width="2"/>
            <circle cx="60" cy="68" r="3" fill="#10b981" stroke="white" stroke-width="2"/>
            <circle cx="100" cy="62" r="3" fill="#10b981" stroke="white" stroke-width="2"/>
            <circle cx="140" cy="66" r="3" fill="#10b981" stroke="white" stroke-width="2"/>
            <circle cx="180" cy="64" r="3" fill="#10b981" stroke="white" stroke-width="2"/>
            <circle cx="220" cy="65" r="3" fill="#10b981" stroke="white" stroke-width="2"/>
            <circle cx="260" cy="70" r="3" fill="#10b981" stroke="white" stroke-width="2"/>
            <circle cx="300" cy="65" r="3" fill="#10b981" stroke="white" stroke-width="2"/>
            
            <!-- Phase C Points -->
            <circle cx="20" cy="40" r="3" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="60" cy="43" r="3" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="100" cy="37" r="3" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="140" cy="41" r="3" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="180" cy="39" r="3" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="220" cy="40" r="3" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="260" cy="45" r="3" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="300" cy="40" r="3" fill="#3b82f6" stroke="white" stroke-width="2"/>
            
            <!-- Axis Labels -->
            <text x="20" y="175" text-anchor="middle" font-size="8" fill="#6b7280">11/02</text>
            <text x="100" y="175" text-anchor="middle" font-size="8" fill="#6b7280">13/02</text>
            <text x="180" y="175" text-anchor="middle" font-size="8" fill="#6b7280">15/02</text>
            <text x="260" y="175" text-anchor="middle" font-size="8" fill="#6b7280">17/02</text>
            
            <text x="5" y="45" text-anchor="middle" font-size="8" fill="#6b7280">170A</text>
            <text x="5" y="85" text-anchor="middle" font-size="8" fill="#6b7280">140A</text>
          </svg>
        </div>
        
        <!-- Value Cards -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; margin-right: 6px;"></div>
              <span style="font-size: 8px; color: #6b7280; font-weight: 600;">Phase A</span>
            </div>
            <div style="font-size: 16px; font-weight: bold; color: #dc2626;">156.3A</div>
          </div>
          <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-right: 6px;"></div>
              <span style="font-size: 8px; color: #6b7280; font-weight: 600;">Phase B</span>
            </div>
            <div style="font-size: 16px; font-weight: bold; color: #065f46;">142.9A</div>
          </div>
          <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-right: 6px;"></div>
              <span style="font-size: 8px; color: #6b7280; font-weight: 600;">Phase C</span>
            </div>
            <div style="font-size: 16px; font-weight: bold; color: #2563eb;">168.7A</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Power Metrics -->
  <div class="metrics-section">
    <div class="metrics-title">${t.powerMetrics}</div>
    <table class="metrics-table">
      <thead>
        <tr>
          <th>${t.item}</th>
          <th>${t.measuredValue}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${t.peakPowerDemand}</td>
          <td><strong>≈ 150 - 170 kW</strong></td>
        </tr>
        <tr>
          <td>${t.averageDaytimeLoad}</td>
          <td>≈ 110 - 130 kW</td>
        </tr>
        <tr>
          <td>${t.nighttimeBaseLoad}</td>
          <td>≈ 10 - 15 kW</td>
        </tr>
        <tr>
          <td>${t.peakConcentrationPeriod}</td>
          <td>Weekdays 10:00 - 17:00</td>
        </tr>
      </tbody>
    </table>
    
    <!-- Power Chart -->
    <div style="margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
      <div style="font-size: 12px; font-weight: bold; color: #065f46; margin-bottom: 12px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">🔌</span> Power Analysis (7 Days)
      </div>
      <div style="display: flex; gap: 15px;">
        <!-- Line Chart Area -->
        <div style="flex: 2; height: 220px; position: relative; background: white; border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px;">
          <svg width="100%" height="100%" viewBox="0 0 300 180" style="overflow: visible;">
            <!-- Grid Lines -->
            <defs>
              <pattern id="powerGrid" width="30" height="20" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="2,2"/>
              </pattern>
            </defs>
            <rect width="300" height="180" fill="url(#powerGrid)" />
            
            <!-- Peak Power Line (Red) - Highest values -->
            <polyline points="20,25 60,30 100,20 140,27 180,35 220,22 260,28 300,32" 
                     fill="none" stroke="#ef4444" stroke-width="4"/>
            <!-- Average Daytime Line (Amber) - Medium values -->  
            <polyline points="20,80 60,85 100,75 140,82 180,87 220,78 260,83 300,85"
                     fill="none" stroke="#f59e0b" stroke-width="4"/>
            <!-- Night Base Line (Blue) - Low values -->
            <polyline points="20,140 60,145 100,135 140,142 180,147 220,132 260,140 300,145"
                     fill="none" stroke="#3b82f6" stroke-width="4"/>
                     
            <!-- Data Points -->
            <!-- Peak Power Points -->
            <circle cx="20" cy="25" r="4" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="60" cy="30" r="4" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="100" cy="20" r="4" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="140" cy="27" r="4" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="180" cy="35" r="4" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="220" cy="22" r="4" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="260" cy="28" r="4" fill="#ef4444" stroke="white" stroke-width="2"/>
            <circle cx="300" cy="32" r="4" fill="#ef4444" stroke="white" stroke-width="2"/>
            
            <!-- Average Daytime Points -->
            <circle cx="20" cy="80" r="4" fill="#f59e0b" stroke="white" stroke-width="2"/>
            <circle cx="60" cy="85" r="4" fill="#f59e0b" stroke="white" stroke-width="2"/>
            <circle cx="100" cy="75" r="4" fill="#f59e0b" stroke="white" stroke-width="2"/>
            <circle cx="140" cy="82" r="4" fill="#f59e0b" stroke="white" stroke-width="2"/>
            <circle cx="180" cy="87" r="4" fill="#f59e0b" stroke="white" stroke-width="2"/>
            <circle cx="220" cy="78" r="4" fill="#f59e0b" stroke="white" stroke-width="2"/>
            <circle cx="260" cy="83" r="4" fill="#f59e0b" stroke="white" stroke-width="2"/>
            <circle cx="300" cy="85" r="4" fill="#f59e0b" stroke="white" stroke-width="2"/>
            
            <!-- Night Base Points -->
            <circle cx="20" cy="140" r="4" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="60" cy="145" r="4" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="100" cy="135" r="4" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="140" cy="142" r="4" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="180" cy="147" r="4" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="220" cy="132" r="4" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="260" cy="140" r="4" fill="#3b82f6" stroke="white" stroke-width="2"/>
            <circle cx="300" cy="145" r="4" fill="#3b82f6" stroke="white" stroke-width="2"/>
            
            <!-- Axis Labels -->
            <text x="20" y="195" text-anchor="middle" font-size="8" fill="#6b7280">11/02</text>
            <text x="100" y="195" text-anchor="middle" font-size="8" fill="#6b7280">13/02</text>
            <text x="180" y="195" text-anchor="middle" font-size="8" fill="#6b7280">15/02</text>
            <text x="260" y="195" text-anchor="middle" font-size="8" fill="#6b7280">17/02</text>
            
            <text x="5" y="30" text-anchor="middle" font-size="8" fill="#6b7280">170kW</text>
            <text x="5" y="85" text-anchor="middle" font-size="8" fill="#6b7280">110kW</text>
            <text x="5" y="145" text-anchor="middle" font-size="8" fill="#6b7280">12kW</text>
          </svg>
        </div>
        
        <!-- Value Cards -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; margin-right: 6px;"></div>
              <span style="font-size: 8px; color: #6b7280; font-weight: 600;">Peak Power</span>
            </div>
            <div style="font-size: 14px; font-weight: bold; color: #dc2626;">150-170 kW</div>
          </div>
          <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; margin-right: 6px;"></div>
              <span style="font-size: 8px; color: #6b7280; font-weight: 600;">Avg Daytime</span>
            </div>
            <div style="font-size: 14px; font-weight: bold; color: #d97706;">110 kW</div>
          </div>
          <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-right: 6px;"></div>
              <span style="font-size: 8px; color: #6b7280; font-weight: 600;">Night Base</span>
            </div>
            <div style="font-size: 14px; font-weight: bold; color: #2563eb;">10-15 kW</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="page-break"></div>
  
  <!-- Recommendations -->
  <div class="recommendations">
    <div class="recommendations-title">${t.recommendations}</div>
    <div class="recommendations-text">${t.sampleRecommendation}</div>
  </div>
  
  <!-- Notes -->
  <div class="notes-section">
    <h3>${t.additionalNotes}</h3>
    <p style="white-space: pre-wrap;">${analysisNotes}</p>
  </div>
  
  ${analysis.result === 'Further Analysis Required' && analysis.additionalTests ? `
  <!-- Additional Tests Required -->
  <h2>${printLanguage === 'ko' ? '추가 테스트 필요' : printLanguage === 'th' ? 'ต้องการการทดสอบเพิ่มเติม' : printLanguage === 'vi' ? 'Cần Kiểm Tra Thêm' : 'Additional Tests Required'}</h2>
  <div class="additional-tests">
    ${analysis.additionalTests.harmonicAnalysis ? '<div class="test-item">✓ Harmonic Analysis</div>' : ''}
    ${analysis.additionalTests.powerQualityCheck ? '<div class="test-item">✓ Power Quality Check</div>' : ''}
    ${analysis.additionalTests.loadBalancing ? '<div class="test-item">✓ Load Balancing Test</div>' : ''}
    ${analysis.additionalTests.temperatureMonitoring ? '<div class="test-item">✓ Temperature Monitoring</div>' : ''}
    ${analysis.additionalTests.cableIntegrityTest ? '<div class="test-item">✓ Cable Integrity Test</div>' : ''}
  </div>
  
  ${analysis.scheduledFollowUp ? `
  <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: 6px; padding: 12px; margin: 15px 0; font-size: 9px;">
    <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 11px; font-weight: bold;">📅 ${printLanguage === 'ko' ? '예정된 후속 조치' : printLanguage === 'th' ? 'การติดตามที่กำหนดไว้' : printLanguage === 'vi' ? 'Theo Dõi Đã Lên Lịch' : 'Scheduled Follow-up'}</h3>
    <div style="color: #1e3a8a; line-height: 1.5;">
      <p style="margin: 2px 0;"><strong>${printLanguage === 'ko' ? '날짜' : printLanguage === 'th' ? 'วันที่' : printLanguage === 'vi' ? 'Ngày' : 'Date'}:</strong> ${analysis.scheduledFollowUp.date}</p>
      <p style="margin: 2px 0;"><strong>${printLanguage === 'ko' ? '기술자' : printLanguage === 'th' ? 'ช่างเทคนิค' : printLanguage === 'vi' ? 'Kỹ Thuật Viên' : 'Technician'}:</strong> ${analysis.scheduledFollowUp.technician}</p>
      <p style="margin: 2px 0;"><strong>${printLanguage === 'ko' ? '우선순위' : printLanguage === 'th' ? 'ลำดับความสำคัญ' : printLanguage === 'vi' ? 'Ưu Tiên' : 'Priority'}:</strong> ${analysis.scheduledFollowUp.priority}</p>
      <p style="margin: 2px 0;"><strong>${printLanguage === 'ko' ? '예상 시간' : printLanguage === 'th' ? 'ระยะเวลาที่คาดการณ์' : printLanguage === 'vi' ? 'Thời Gian Dự Kiến' : 'Expected Duration'}:</strong> ${analysis.scheduledFollowUp.expectedDuration}</p>
    </div>
  </div>
  ` : ''}
  ` : ''}
  
  <!-- Footer -->
  <div class="report-footer">
    <p style="color: #6b7280; font-size: 9px; margin-bottom: 5px;">
      ${printLanguage === 'ko' ? 'K 에너지 세이브 주식회사 (Zera 그룹)' : printLanguage === 'th' ? 'บริษัท K เอ็นเนอร์จี้ เซฟ จำกัด (กลุ่ม Zera)' : printLanguage === 'vi' ? 'Công ty K Energy Save (Tập đoàn Zera)' : 'K Energy Save Co., Ltd. (Group of Zera)'}
    </p>
    <p style="color: #9ca3af; font-size: 9px;">
      ${printLanguage === 'ko' ? '생성일' : printLanguage === 'th' ? 'สร้างเมื่อ' : printLanguage === 'vi' ? 'Tạo vào' : 'Generated on'}: ${new Date().toLocaleString(printLanguage === 'th' ? 'th-TH' : printLanguage === 'ko' ? 'ko-KR' : printLanguage === 'vi' ? 'vi-VN' : 'en-US')}
    </p>
    
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">${t.technicianSignature}</div>
        <div style="margin-top: 5px; font-weight: bold; font-size: 10px;">${analysis.technician}</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-label">${t.approvedBy}</div>
        <div style="margin-top: 5px; font-weight: bold; font-size: 10px;">${selectedEngineer}</div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Show preview without auto-printing - user can manually print when ready
    printWindow.focus();
  };

  const handleSendToFlowSystem = () => {
    if (engineerApprovalStatus !== 'approved') {
      alert('Engineer approval required to send emails');
      return;
    }
    
    // Create Flow system link with analysis data
    const flowUrl = 'https://flow.team/signin.act';
    const analysisUrl = window.location.href;
    const emailSubject = `Pre-Installation Analysis Report - ${analysis.id}`;
    const emailBody = `
Analysis Report Summary:
- Document ID: ${analysis.id}
- Branch: ${selectedBranch}
- Location: ${selectedCustomer}
- Date: ${analysis.datetime}
- Result: ${analysis.result}
- Technician: ${analysis.technician}
- Approved by: ${selectedEngineer}

View full report: ${analysisUrl}

Flow System: ${flowUrl}
    `;
    
    // Open Flow system in new window
    window.open(flowUrl, '_blank');
    
    // Show confirmation
    alert(`${at.emailSent}\n\nFlow System: ${flowUrl}\n\n${at.flowSystemConnected}`);
  };

  const handleEmailDocument = () => {
    const subject = `Pre-Installation Analysis - ${generateDocumentNumber()}`;
    const body = `Please find the attached pre-installation analysis report.\n\nBranch: ${selectedBranch}\nCustomer: ${selectedCustomer}\nEngineer: ${selectedEngineer}\nDate: ${getCurrentDateTime()}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  // Bill management functions
  const generateBillNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `IB-${year}-${month}${day}-${random}`;
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'Recommended':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'Not Recommended':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Recommended':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'Not Recommended':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  const getBalanceColor = (balance: string) => {
    switch (balance) {
      case 'Good':
        return 'text-green-700 bg-green-100';
      case 'Fair':
        return 'text-yellow-700 bg-yellow-100';
      case 'Poor':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Sample data for branches, customers, and equipment
  const branches = [
    { id: 'vietnam', name: 'Vietnam', code: 'VN' },
    { id: 'korea', name: 'Korea', code: 'KR' },
    { id: 'thailand', name: 'Thailand', code: 'TH' },
    { id: 'brunei', name: 'Brunei', code: 'BN' }
  ];

  const customersByBranch = {
    Vietnam: [
      'Ho Chi Minh City Office - UPS Room',
      'Hanoi Manufacturing Plant - Main Panel',
      'Da Nang Distribution Center - Power Room',
      'Can Tho Factory - Production Line'
    ],
    Korea: [
      'Seoul HQ Building - Main Panel',
      'Busan Factory - Production Line A',
      'Incheon Warehouse - Distribution Panel'
    ],
    Thailand: [
      'Bangkok Warehouse - Cold Storage Unit',
      'Phuket Resort - Main Distribution',
      'Chiang Mai Factory - Assembly Line'
    ],
    Brunei: [
      'Bandar Seri Begawan Office - Main Distribution',
      'Kuala Belait Industrial - Power Station'
    ]
  };

  const equipmentByBranch = {
    Vietnam: [
      'Fluke 438-II Motor Analyzer',
      'Hioki PW3198 Power Analyzer',
      'Yokogawa CW240 Clamp Power Meter'
    ],
    Korea: [
      'Fluke 1760 Power Quality Analyzer',
      'Hioki PW3198 Power Analyzer',
      'Chauvin Arnoux CA 8335'
    ],
    Thailand: [
      'Yokogawa CW240 Clamp Power Meter',
      'Fluke 438-II Motor Analyzer'
    ],
    Brunei: [
      'Chauvin Arnoux CA 8335',
      'Hioki PW3198 Power Analyzer'
    ]
  };

  // Available KSAVER products
  const availableProducts = [
    'KSAVER 50KVA',
    'KSAVER 75KVA',
    'KSAVER 100KVA',
    'KSAVER 150KVA',
    'KSAVER 200KVA',
    'KSAVER 250KVA',
    'KSAVER 300KVA',
    'KSAVER PRO 150KVA',
    'KSAVER PRO 200KVA'
  ];

  // Available engineers
  const availableEngineers = [
    'Engr. Patrick Jung',
    'Engr. Kim Min-ho',
    'Engr. Sarah Chen',
    'Engr. Ahmad Rahman',
    'Engr. Nguyen Duc',
    'Engr. Somchai Naree',
    'Engr. Maria Santos',
    'Engr. John Smith'
  ];

  // Calculate phase balance analysis
  const calculatePhaseBalance = () => {
    const avg = (currentValues.L1 + currentValues.L2 + currentValues.L3) / 3;
    const maxDeviation = Math.max(
      Math.abs(currentValues.L1 - avg),
      Math.abs(currentValues.L2 - avg),
      Math.abs(currentValues.L3 - avg)
    );
    const deviationPercentage = (maxDeviation / avg) * 100;
    
    if (deviationPercentage <= 5) return 'Good';
    if (deviationPercentage <= 10) return 'Fair';
    return 'Poor';
  };

  // Calculate electrical parameters based on current values
  const calculateElectricalParams = () => {
    const totalCurrent = currentValues.L1 + currentValues.L2 + currentValues.L3;
    const voltage = totalCurrent > 300 ? '480V' : totalCurrent > 200 ? '380V' : '240V';
    const powerFactor = currentValues.N > 20 ? 0.82 : currentValues.N > 15 ? 0.85 : 0.92;
    const thd = currentValues.N > 20 ? 8.2 : currentValues.N > 15 ? 7.8 : 4.5;
    
    return { voltage, powerFactor, thd };
  };

  const handleCurrentValueChange = (phase: 'L1' | 'L2' | 'L3' | 'N', value: number) => {
    const newValues = { ...currentValues, [phase]: value };
    setCurrentValues(newValues);
    
    // Update analysis data
    const params = calculateElectricalParams();
    const balance = calculatePhaseBalance();
    
    setAnalysis((prev) => ({
      ...prev,
      current: newValues,
      voltage: params.voltage,
      powerFactor: params.powerFactor,
      thd: params.thd,
      balance
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-200 to-gray-100 shadow-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.back()}
                className="p-4 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:shadow-lg group"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
              </button>
              <div className="flex items-center space-x-5">
                <div className="p-4 bg-gradient-to-br from-orange-500 via-orange-600 to-red-700 rounded-2xl shadow-xl">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
                    {at.preInstallationCurrentAnalysis}
                  </h1>
                  <p className="text-base text-gray-600 font-medium mt-1">
                    {at.threePhaseCurrentPowerQuality}
                  </p>
                </div>
              </div>
            </div>
            <InternationalLanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10" id="analysis-content">
        {/* Analysis Header Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                {at.threePhaseCurrentAnalysis}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {analysis.datetime}
                </span>
                <span>{at.technician}: {analysis.technician}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getResultIcon(analysis.result)}
              <span className={`px-4 py-2 rounded-xl font-bold border ${getResultColor(analysis.result)}`}>
                {analysis.result === 'Recommended' ? at.installationRecommended : 
                 analysis.result === 'Not Recommended' ? at.installationNotRecommended : 
                 analysis.result === 'Further Analysis Required' ? at.additionalAnalysisRequired : analysis.result}
              </span>
            </div>
          </div>

          {/* Interactive Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-600 mb-2">{at.branch}</h3>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setSelectedCustomer(customersByBranch[e.target.value as keyof typeof customersByBranch][0]);
                  setSelectedEquipment(equipmentByBranch[e.target.value as keyof typeof equipmentByBranch][0]);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-bold"
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.name}>{branch.name}</option>
                ))}
              </select>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-600 mb-2">{at.customerLocation}</h3>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs font-bold"
              >
                {customersByBranch[selectedBranch as keyof typeof customersByBranch]?.map(customer => (
                  <option key={customer} value={customer}>{customer}</option>
                ))}
              </select>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-600 mb-2">{at.measurementEquipment}</h3>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs font-bold"
              >
                {equipmentByBranch[selectedBranch as keyof typeof equipmentByBranch]?.map(equipment => (
                  <option key={equipment} value={equipment}>{equipment}</option>
                ))}
              </select>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-600 mb-2">{at.measurementPeriod7Days}</h3>
              <div className="space-y-1">
                <input
                  type="date"
                  value={measurementStartDate}
                  onChange={(e) => {
                    setMeasurementStartDate(e.target.value);
                    // Auto-calculate end date (7 days later)
                    const startDate = new Date(e.target.value);
                    startDate.setDate(startDate.getDate() + 7);
                    setMeasurementEndDate(startDate.toISOString().split('T')[0]);
                  }}
                  className="w-full p-1 border border-gray-300 rounded text-xs font-bold"
                />
                <input
                  type="date"
                  value={measurementEndDate}
                  readOnly
                  className="w-full p-1 border border-gray-200 rounded text-xs font-bold bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Electrical Parameters - Auto-calculated from measurements */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{at.electricalParametersAutoAnalyzed}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-blue-600">{calculateElectricalParams().voltage}</div>
                <div className="text-sm text-gray-600 font-bold">{at.voltage}</div>
                <div className="text-xs text-gray-500">{at.autoDetected}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-green-600">{analysis.frequency} Hz</div>
                <div className="text-sm text-gray-600 font-bold">{at.frequency}</div>
                <div className="text-xs text-gray-500">{at.standard}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-purple-600">{calculateElectricalParams().powerFactor.toFixed(2)}</div>
                <div className="text-sm text-gray-600 font-bold">{at.powerFactor}</div>
                <div className="text-xs text-gray-500">{at.calculated}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-orange-600">{calculateElectricalParams().thd.toFixed(1)}%</div>
                <div className="text-sm text-gray-600 font-bold">{at.totalHarmonicDistortionTHD}</div>
                <div className="text-xs text-gray-500">{at.estimated}</div>
              </div>
            </div>
          </div>

          {/* Current Analysis - Input from measurement equipment */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{at.threePhaseCurrentAnalysisInput}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                <input
                  type="number"
                  step="0.1"
                  value={currentValues.L1}
                  onChange={(e) => handleCurrentValueChange('L1', parseFloat(e.target.value) || 0)}
                  className="w-full text-2xl font-black text-red-600 text-center border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-red-300 rounded"
                />
                <div className="text-xs text-gray-500">{at.ampere}</div>
                <div className="text-sm text-gray-600 font-bold">{at.l1Phase}</div>
              </div>
              <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                <input
                  type="number"
                  step="0.1"
                  value={currentValues.L2}
                  onChange={(e) => handleCurrentValueChange('L2', parseFloat(e.target.value) || 0)}
                  className="w-full text-2xl font-black text-green-600 text-center border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-green-300 rounded"
                />
                <div className="text-xs text-gray-500">{at.ampere}</div>
                <div className="text-sm text-gray-600 font-bold">{at.l2Phase}</div>
              </div>
              <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                <input
                  type="number"
                  step="0.1"
                  value={currentValues.L3}
                  onChange={(e) => handleCurrentValueChange('L3', parseFloat(e.target.value) || 0)}
                  className="w-full text-2xl font-black text-blue-600 text-center border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
                />
                <div className="text-xs text-gray-500">{at.ampere}</div>
                <div className="text-sm text-gray-600 font-bold">{at.l3Phase}</div>
              </div>
              <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                <input
                  type="number"
                  step="0.1"
                  value={currentValues.N}
                  onChange={(e) => handleCurrentValueChange('N', parseFloat(e.target.value) || 0)}
                  className="w-full text-2xl font-black text-gray-600 text-center border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
                />
                <div className="text-xs text-gray-500">{at.ampere}</div>
                <div className="text-sm text-gray-600 font-bold">{at.neutralLine}</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-700">{at.phaseBalance}:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getBalanceColor(calculatePhaseBalance())}`}>
                  {calculatePhaseBalance() === 'Good' ? at.good : 
                   calculatePhaseBalance() === 'Fair' ? at.fair : at.poor}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-bold">{at.imbalanceRate}: </span>
                <span className="font-black text-orange-600">
                  {(() => {
                    const avg = (currentValues.L1 + currentValues.L2 + currentValues.L3) / 3;
                    const maxDev = Math.max(
                      Math.abs(currentValues.L1 - avg),
                      Math.abs(currentValues.L2 - avg),
                      Math.abs(currentValues.L3 - avg)
                    );
                    return ((maxDev / avg) * 100).toFixed(1);
                  })()}{"%"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Creation Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 mb-2 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                {at.createDocument}
              </h2>
              <p className="text-gray-600">
                Generate official pre-installation analysis report
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {engineerApprovalStatus === 'approved' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>

          {/* Language Selector for Print Report */}
          <div className="mt-6 mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {at.selectPrintLanguage || 'Select Print Language'}:
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setPrintLanguage('th')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 ${
                  printLanguage === 'th'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CountryFlag country="TH" size="md" />
                <span>ไทย</span>
              </button>
              
              <button
                onClick={() => setPrintLanguage('ko')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 ${
                  printLanguage === 'ko'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CountryFlag country="KR" size="md" />
                <span>한국어</span>
              </button>
              
              <button
                onClick={() => setPrintLanguage('vi')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 ${
                  printLanguage === 'vi'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CountryFlag country="VN" size="md" />
                <span>Tiếng Việt</span>
              </button>
              
              <button
                onClick={() => setPrintLanguage('en')}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 ${
                  printLanguage === 'en'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CountryFlag country="GB" size="md" />
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleCreateDocument}
              disabled={engineerApprovalStatus !== 'approved' || isGeneratingDocument}
              className={`p-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                engineerApprovalStatus === 'approved' && !isGeneratingDocument
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isGeneratingDocument ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FileText className="w-5 h-5" />
              )}
              <span>{isGeneratingDocument ? 'Generating...' : at.createDocument}</span>
            </button>

            <button
              onClick={() => router.push('/international-market/quotations')}
              disabled={engineerApprovalStatus !== 'approved'}
              className={`p-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                engineerApprovalStatus === 'approved'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span>{at.createQuotation}</span>
            </button>

            <button
              onClick={handlePrintDocument}
              disabled={engineerApprovalStatus !== 'approved'}
              className={`p-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                engineerApprovalStatus === 'approved'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-2h1v2zm1 0v2h6v-2H6zm0-1h8v-2H6v2z" clipRule="evenodd" />
              </svg>
              <span>{at.printDocument}</span>
            </button>

            <button
              onClick={handleSendToFlowSystem}
              disabled={engineerApprovalStatus !== 'approved'}
              className={`p-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                engineerApprovalStatus === 'approved'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>{at.sendToFlow}</span>
            </button>
          </div>

          {/* View Analysis List Button */}
          <div className="mt-4">
            <button
              onClick={() => setShowAnalysisList(!showAnalysisList)}
              className="w-full p-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl font-bold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Activity className="w-5 h-5" />
              <span>{at.viewAnalysisList}</span>
            </button>
          </div>

          {/* Status Messages */}
          {engineerApprovalStatus !== 'approved' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-medium">
                  Engineer approval required to create documents
                </span>
              </div>
            </div>
          )}

          {showExportOptions && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-bold">
                  {at.documentCreated}
                </span>
              </div>
              <div className="text-sm text-green-700">
                <p>Document ID: {generateDocumentNumber()}</p>
                <p>Generated: {getCurrentDateTime()}</p>
                <p>Approved by: {selectedEngineer}</p>
                <p>Location: {selectedBranch} - {selectedCustomer}</p>
              </div>
            </div>
          )}
        </div>

        {/* Charts Section - Power Quality Analysis Report Style */}
        <div className="space-y-12 mb-12">
          {/* Voltage Analysis */}
          <VoltageAnalysisChart translations={at} />
          
          {/* Current Analysis */}
          <CurrentAnalysisChart translations={at} />
          
          {/* Power Analysis */}  
          <CurrentWaveformChart data={analysis.current} translations={at} />
          
          {/* Phase Balance Chart */}
          <PhaseBalanceChart data={analysis.current} translations={at} />
        </div>

        {/* Analysis Results */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-600" />
            {at.analysisResults}
          </h2>
          
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border-2 ${getResultColor(analysis.result)}`}>
              <div className="flex items-center space-x-3 mb-3">
                {getResultIcon(analysis.result)}
                <h3 className="text-lg font-bold">{at.result}:</h3>
              </div>
              <p className="text-xl font-black">
                {analysis.result === 'Recommended' ? at.installationRecommended : 
                 analysis.result === 'Not Recommended' ? at.installationNotRecommended : 
                 analysis.result === 'Further Analysis Required' ? at.additionalAnalysisRequired : analysis.result}
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-2xl">
              <div className="flex items-center space-x-3 mb-3">
                <Info className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-bold text-yellow-800">{at.recommendedActions}:</h3>
              </div>
              <p className="text-yellow-900 font-medium">{at.recommendationText}</p>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-800">{at.notes}:</h3>
                </div>
                {showSaveNotification && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm font-semibold transition-opacity duration-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>{at.saved}</span>
                  </div>
                )}
              </div>
              <textarea
                value={analysisNotes}
                onChange={(e) => setAnalysisNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 font-medium mb-3"
                rows={3}
                placeholder={at.enterNotesPlaceholder}
              />
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>{at.saveNotes}</span>
              </button>
            </div>

            {/* Additional Analysis Section - Only show when Further Analysis Required */}
            {analysis.result === 'Further Analysis Required' && (
              <div className="bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 border-2 border-orange-300 p-8 rounded-3xl shadow-lg">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="bg-orange-500 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-orange-900">{at.additionalTestsRequired}</h3>
                    <p className="text-orange-700 font-medium">Additional tests required for analysis</p>
                  </div>
                </div>
                
                {analysis.additionalTests && (
                  <div className="bg-white rounded-2xl p-6 mb-6 shadow-md border border-orange-200">
                    <h4 className="text-lg font-black text-gray-800 mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-orange-600" />
                      Test Items
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${analysis.additionalTests.harmonicAnalysis ? 'bg-red-500 ring-2 ring-red-200' : 'bg-gray-300'}`}></div>
                            <span className="font-bold text-gray-800">{at.harmonicAnalysis}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${analysis.additionalTests.harmonicAnalysis ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'}`}>
                            {analysis.additionalTests.harmonicAnalysis ? '✓ ' + at.required : at.optional}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${analysis.additionalTests.powerQualityCheck ? 'bg-red-500 ring-2 ring-red-200' : 'bg-gray-300'}`}></div>
                            <span className="font-bold text-gray-800">{at.powerQualityCheck}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${analysis.additionalTests.powerQualityCheck ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'}`}>
                            {analysis.additionalTests.powerQualityCheck ? '✓ ' + at.required : at.optional}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${analysis.additionalTests.loadBalancing ? 'bg-red-500 ring-2 ring-red-200' : 'bg-gray-300'}`}></div>
                            <span className="font-bold text-gray-800">{at.loadBalancing}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${analysis.additionalTests.loadBalancing ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'}`}>
                            {analysis.additionalTests.loadBalancing ? '✓ ' + at.required : at.optional}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border-l-4 border-gray-400">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${analysis.additionalTests.temperatureMonitoring ? 'bg-red-500 ring-2 ring-red-200' : 'bg-gray-300'}`}></div>
                            <span className="font-bold text-gray-600">{at.temperatureMonitoring}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${analysis.additionalTests.temperatureMonitoring ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'}`}>
                            {analysis.additionalTests.temperatureMonitoring ? '✓ ' + at.required : at.optional}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${analysis.additionalTests.cableIntegrityTest ? 'bg-red-500 ring-2 ring-red-200' : 'bg-gray-300'}`}></div>
                            <span className="font-bold text-gray-800">{at.cableIntegrityTest}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${analysis.additionalTests.cableIntegrityTest ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'}`}>
                            {analysis.additionalTests.cableIntegrityTest ? '✓ ' + at.required : at.optional}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Follow-up Schedule Card */}
                {analysis.scheduledFollowUp && (
                  <div className="bg-white rounded-2xl p-6 mb-6 shadow-md border border-orange-200">
                    <h4 className="text-lg font-black text-gray-800 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      {at.scheduledFollowUp}
                    </h4>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 p-2 rounded-full">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-blue-600">{at.followUpDate}</span>
                              <p className="text-lg font-black text-blue-900">{analysis.scheduledFollowUp.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-500 p-2 rounded-full">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-600">{at.assignedTechnician}</span>
                              <p className="text-lg font-black text-green-900">{analysis.scheduledFollowUp.technician}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-orange-500 p-2 rounded-full">
                              <AlertTriangle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-orange-600">{at.priority}</span>
                              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-black ${
                                analysis.scheduledFollowUp.priority === 'Critical' ? 'bg-red-200 text-red-800' :
                                analysis.scheduledFollowUp.priority === 'High' ? 'bg-orange-200 text-orange-800' :
                                analysis.scheduledFollowUp.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-green-200 text-green-800'
                              }`}>
                                {analysis.scheduledFollowUp.priority === 'Critical' ? '🔴 ' + at.critical :
                                 analysis.scheduledFollowUp.priority === 'High' ? '🟠 ' + at.high :
                                 analysis.scheduledFollowUp.priority === 'Medium' ? '🟡 ' + at.medium : '🟢 ' + at.low}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="bg-purple-500 p-2 rounded-full">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-purple-600">{at.expectedDuration}</span>
                              <p className="text-lg font-black text-purple-900">{analysis.scheduledFollowUp.expectedDuration}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Equipment and Cost Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analysis.additionalEquipment && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-200">
                      <h4 className="text-lg font-black text-gray-800 mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-purple-600" />
                        {at.additionalEquipmentNeeded}
                      </h4>
                      <div className="space-y-3">
                        {analysis.additionalEquipment.map((equipment, index) => (
                          <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
                            <div className="flex items-center space-x-3">
                              <div className="bg-purple-500 p-1 rounded-full">
                                <span className="w-2 h-2 bg-white rounded-full block"></span>
                              </div>
                              <span className="font-medium text-gray-800">{equipment}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {/* Cost Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-200">
                      <h4 className="text-lg font-black text-gray-800 mb-3 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                        {at.estimatedCost}
                      </h4>
                      {analysis.estimatedCost && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                          <p className="text-3xl font-black text-green-700">
                            ₩{analysis.estimatedCost.toLocaleString()}
                          </p>
                          <p className="text-sm text-green-600 font-medium">{at.won} (Korean Won)</p>
                        </div>
                      )}
                    </div>

                    {/* Risk Assessment Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-200">
                      <h4 className="text-lg font-black text-gray-800 mb-3 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-red-600" />
                        {at.riskAssessment}
                      </h4>
                      {analysis.riskAssessment && (
                        <div className={`p-4 rounded-xl border-2 ${
                          analysis.riskAssessment === 'High' ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300' :
                          analysis.riskAssessment === 'Medium' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' :
                          'bg-gradient-to-r from-green-50 to-green-100 border-green-300'
                        }`}>
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-black ${
                            analysis.riskAssessment === 'High' ? 'bg-red-200 text-red-800' :
                            analysis.riskAssessment === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                            {analysis.riskAssessment === 'High' ? '⚠️ ' + at.high :
                             analysis.riskAssessment === 'Medium' ? '⚡ ' + at.medium : '✅ ' + at.low}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Technical Interpretation - matching the image format */}
            <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl">
              <div className="flex items-center space-x-3 mb-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-800">{at.technicalInterpretation}:</h3>
              </div>
              
              <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                {/* Product Selection */}
                {/* Product Selection */}
                <div className="mb-3">
                  <label className="text-sm font-bold text-blue-800 mb-2 block">{at.recommendedProduct}:</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-bold text-blue-800 bg-white"
                  >
                    {availableProducts.map(product => (
                      <option key={product} value={product}>{product}</option>
                    ))}
                  </select>
                </div>
                
                {/* Engineer Selection with Password Approval */}
                <div className="mb-3">
                  <label className="text-sm font-bold text-blue-800 mb-2 block">{at.madeBy}:</label>
                  <div className="flex items-center space-x-2 mb-2">
                    <select
                      value={selectedEngineer}
                      onChange={(e) => handleEngineerChange(e.target.value)}
                      className="flex-1 p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs font-bold text-blue-800 bg-white"
                    >
                      {availableEngineers.map(engineer => (
                        <option key={engineer} value={engineer}>{engineer}</option>
                      ))}
                    </select>
                    <span className={`px-3 py-2 rounded-lg text-xs font-bold ${
                      engineerApprovalStatus === 'approved' 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {engineerApprovalStatus === 'approved' ? at.approvalApproved : at.approvalPending}
                    </span>
                  </div>
                </div>
                
                {/* Automatic Current Date */}
                <div className="text-xs text-blue-700">
                  {at.date}: {getCurrentDateTime().split(' ')[0]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis List Section */}
        {showAnalysisList && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-800 mb-2 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-teal-600" />
                  {at.viewAnalysisList}
                </h2>
                <p className="text-gray-600">
                  {locale === 'ko' ? '사전 설치 전류 분석 보고서 목록' : 'Pre-Installation Current Analysis Reports'}
                </p>
              </div>
            </div>

            {/* Sample Analysis List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'ko' ? '문서 ID' : 'Document ID'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {at.branch}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {at.customerLocation}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {at.datetime}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {at.result}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'ko' ? '작업' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Sample current analysis */}
                    <tr className="hover:bg-gray-50 bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-900">{analysis.id}</span>
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-full">
                          {locale === 'ko' ? '현재' : 'Current'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{selectedBranch}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{selectedCustomer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{analysis.datetime}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getResultIcon(analysis.result)}
                          <span className={`text-xs font-semibold`}>
                            {analysis.result === 'Recommended' ? at.installationRecommended : 
                             analysis.result === 'Not Recommended' ? at.installationNotRecommended : 
                             at.additionalAnalysisRequired}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            title={locale === 'ko' ? '보기' : 'View'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={handlePrintDocument}
                            title={locale === 'ko' ? '인쇄' : 'Print'}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-2h1v2zm1 0v2h6v-2H6zm0-1h8v-2H6v2z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button 
                            className="text-purple-600 hover:text-purple-900"
                            onClick={handleSendToFlowSystem}
                            title={locale === 'ko' ? 'Flow로 전송' : 'Send to Flow'}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Sample previous analyses */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">PIA-2026-0215-089</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Korea</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">Seoul HQ Building - Main Panel</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">2026-02-15 10:20</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-xs font-semibold">
                            {at.installationRecommended}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">PIA-2026-0214-067</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Thailand</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">Bangkok Warehouse - Cold Storage Unit</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">2026-02-14 14:45</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <span className="text-xs font-semibold">
                            {at.additionalAnalysisRequired}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}