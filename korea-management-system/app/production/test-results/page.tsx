'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface TestResult {
  id: string;
  testNumber: string;
  productName: string;
  orderNumber: string;
  serialNumber: string;
  testType: 'functional' | 'performance' | 'safety' | 'environmental' | 'durability';
  result: 'pass' | 'fail' | 'conditional';
  testDate: string;
  tester: string;
  testDuration: string;
  parameters: {
    name: string;
    expected: string;
    actual: string;
    status: 'pass' | 'fail';
    remarks?: string;
  }[];
  notes?: string;
  retestRequired?: boolean;
}

export default function TestResultsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');

  const [testResults] = useState<TestResult[]>([
    {
      id: '1',
      testNumber: 'TEST-2026-001',
      productName: 'Energy Saving System Model A-2024',
      orderNumber: 'PO-2026-001',
      serialNumber: 'ESS-A2024-001',
      testType: 'functional',
      result: 'pass',
      testDate: '2026-02-15 09:00',
      tester: 'Kim Min-soo',
      testDuration: '2h 15m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Power Output', expected: '100W ±5%', actual: '102W', status: 'pass' },
        { name: 'Voltage Stability', expected: '24V ±0.5V', actual: '24.2V', status: 'pass' },
        { name: 'Response Time', expected: '<100ms', actual: '85ms', status: 'pass' }
      ]
    },
    {
      id: '2',
      testNumber: 'TEST-2026-002',
      productName: 'Energy Monitor Pro',
      orderNumber: 'PO-2026-003',
      serialNumber: 'EMP-PRO-015',
      testType: 'performance',
      result: 'fail',
      testDate: '2026-02-15 10:30',
      tester: 'Lee Ji-won',
      testDuration: '1h 45m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Fail', status: 'fail', remarks: 'Calibration issue' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Data Accuracy', expected: '±0.01%', actual: '±0.02%', status: 'fail' },
        { name: 'Display Response', expected: '<50ms', actual: '45ms', status: 'pass' },
        { name: 'Power Consumption', expected: '<5W', actual: '4.8W', status: 'pass' }
      ],
      notes: 'Calibration issue detected. Requires sensor adjustment.',
      retestRequired: true
    },
    {
      id: '3',
      testNumber: 'TEST-2026-003',
      productName: 'Industrial Controller IC-X500',
      orderNumber: 'PO-2026-004',
      serialNumber: 'IC-X500-042',
      testType: 'safety',
      result: 'pass',
      testDate: '2026-02-15 11:15',
      tester: 'Park Seo-jun',
      testDuration: '3h 00m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Insulation Resistance', expected: '>100MΩ', actual: '150MΩ', status: 'pass' },
        { name: 'Ground Continuity', expected: '<0.1Ω', actual: '0.05Ω', status: 'pass' },
        { name: 'Leakage Current', expected: '<0.5mA', actual: '0.3mA', status: 'pass' }
      ]
    },
    {
      id: '4',
      testNumber: 'TEST-2026-004',
      productName: 'Smart Gateway SG-2024',
      orderNumber: 'PO-2026-005',
      serialNumber: 'SG-2024-028',
      testType: 'functional',
      result: 'pass',
      testDate: '2026-02-15 13:00',
      tester: 'Choi Yeon-hee',
      testDuration: '1h 30m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'WiFi Range', expected: '>50m', actual: '62m', status: 'pass' },
        { name: 'Data Throughput', expected: '>100Mbps', actual: '115Mbps', status: 'pass' },
        { name: 'Connection Stability', expected: '99.9%', actual: '99.95%', status: 'pass' }
      ]
    },
    {
      id: '5',
      testNumber: 'TEST-2026-005',
      productName: 'Energy Saving System Model A-2024',
      orderNumber: 'PO-2026-001',
      serialNumber: 'ESS-A2024-012',
      testType: 'environmental',
      result: 'conditional',
      testDate: '2026-02-15 14:00',
      tester: 'Jung Hae-in',
      testDuration: '4h 30m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Temperature Range', expected: '-20°C to 60°C', actual: '-18°C to 58°C', status: 'pass' },
        { name: 'Humidity Resistance', expected: '10-90% RH', actual: '10-88% RH', status: 'pass' },
        { name: 'Vibration Test', expected: '5G @ 10-500Hz', actual: '4.8G @ 10-500Hz', status: 'fail' }
      ],
      notes: 'Vibration test slightly below spec. Acceptable for standard applications.',
      retestRequired: false
    },
    {
      id: '6',
      testNumber: 'TEST-2026-006',
      productName: 'Energy Monitor Pro',
      orderNumber: 'PO-2026-003',
      serialNumber: 'EMP-PRO-022',
      testType: 'durability',
      result: 'pass',
      testDate: '2026-02-14 16:00',
      tester: 'Kim Min-soo',
      testDuration: '8h 00m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Cycle Test', expected: '10,000 cycles', actual: '10,500 cycles', status: 'pass' },
        { name: 'Button Endurance', expected: '50,000 presses', actual: '52,000 presses', status: 'pass' },
        { name: 'Screen Longevity', expected: '5,000 hours', actual: '5,200 hours', status: 'pass' }
      ]
    },
    {
      id: '7',
      testNumber: 'TEST-2026-007',
      productName: 'Industrial Controller IC-X500',
      orderNumber: 'PO-2026-004',
      serialNumber: 'IC-X500-055',
      testType: 'performance',
      result: 'pass',
      testDate: '2026-02-14 14:30',
      tester: 'Lee Ji-won',
      testDuration: '2h 20m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Processing Speed', expected: '>1GHz', actual: '1.2GHz', status: 'pass' },
        { name: 'Memory Usage', expected: '<80%', actual: '65%', status: 'pass' },
        { name: 'I/O Response', expected: '<10ms', actual: '7ms', status: 'pass' }
      ]
    },
    {
      id: '8',
      testNumber: 'TEST-2026-008',
      productName: 'Smart Gateway SG-2024',
      orderNumber: 'PO-2026-005',
      serialNumber: 'SG-2024-033',
      testType: 'safety',
      result: 'pass',
      testDate: '2026-02-14 12:00',
      tester: 'Park Seo-jun',
      testDuration: '2h 45m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'EMI Compliance', expected: 'FCC Part 15', actual: 'Pass', status: 'pass' },
        { name: 'ESD Protection', expected: '±8kV', actual: '±10kV', status: 'pass' },
        { name: 'Surge Protection', expected: '2kV', actual: '2.5kV', status: 'pass' }
      ]
    },
    {
      id: '9',
      testNumber: 'TEST-2026-009',
      productName: 'Energy Saving System Model A-2024',
      orderNumber: 'PO-2026-001',
      serialNumber: 'ESS-A2024-023',
      testType: 'functional',
      result: 'pass',
      testDate: '2026-02-14 10:00',
      tester: 'Choi Yeon-hee',
      testDuration: '2h 10m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'LCD Display', expected: 'Clear & Bright', actual: 'Excellent', status: 'pass' },
        { name: 'Button Response', expected: '<50ms', actual: '35ms', status: 'pass' },
        { name: 'Audio Alarm', expected: '>80dB', actual: '85dB', status: 'pass' }
      ]
    },
    {
      id: '10',
      testNumber: 'TEST-2026-010',
      productName: 'Energy Monitor Pro',
      orderNumber: 'PO-2026-003',
      serialNumber: 'EMP-PRO-018',
      testType: 'environmental',
      result: 'pass',
      testDate: '2026-02-14 08:30',
      tester: 'Jung Hae-in',
      testDuration: '5h 00m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'IP Rating Test', expected: 'IP65', actual: 'IP67', status: 'pass' },
        { name: 'UV Resistance', expected: '1000 hours', actual: '1100 hours', status: 'pass' },
        { name: 'Salt Spray Test', expected: '48 hours', actual: '52 hours', status: 'pass' }
      ]
    },
    {
      id: '11',
      testNumber: 'TEST-2026-011',
      productName: 'Industrial Controller IC-X500',
      orderNumber: 'PO-2026-004',
      serialNumber: 'IC-X500-061',
      testType: 'functional',
      result: 'fail',
      testDate: '2026-02-13 15:00',
      tester: 'Kim Min-soo',
      testDuration: '1h 50m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Fail', status: 'fail', remarks: 'Ethernet port issue' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Ethernet Port', expected: 'Functional', actual: 'Intermittent', status: 'fail' },
        { name: 'USB Ports', expected: '4 working', actual: '4 working', status: 'pass' },
        { name: 'Serial Port', expected: 'Functional', actual: 'Functional', status: 'pass' }
      ],
      notes: 'Ethernet port connector issue. Requires replacement.',
      retestRequired: true
    },
    {
      id: '12',
      testNumber: 'TEST-2026-012',
      productName: 'Smart Gateway SG-2024',
      orderNumber: 'PO-2026-005',
      serialNumber: 'SG-2024-019',
      testType: 'performance',
      result: 'pass',
      testDate: '2026-02-13 13:00',
      tester: 'Lee Ji-won',
      testDuration: '2h 00m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'CPU Temperature', expected: '<70°C', actual: '65°C', status: 'pass' },
        { name: 'Network Latency', expected: '<20ms', actual: '15ms', status: 'pass' },
        { name: 'Memory Leaks', expected: 'None', actual: 'None detected', status: 'pass' }
      ]
    },
    {
      id: '13',
      testNumber: 'TEST-2026-013',
      productName: 'Energy Saving System Model A-2024',
      orderNumber: 'PO-2026-001',
      serialNumber: 'ESS-A2024-034',
      testType: 'durability',
      result: 'pass',
      testDate: '2026-02-13 10:00',
      tester: 'Park Seo-jun',
      testDuration: '6h 30m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Thermal Cycling', expected: '500 cycles', actual: '520 cycles', status: 'pass' },
        { name: 'Power Cycling', expected: '1000 cycles', actual: '1050 cycles', status: 'pass' },
        { name: 'Mechanical Stress', expected: 'No failure', actual: 'No failure', status: 'pass' }
      ]
    },
    {
      id: '14',
      testNumber: 'TEST-2026-014',
      productName: 'Energy Monitor Pro',
      orderNumber: 'PO-2026-003',
      serialNumber: 'EMP-PRO-026',
      testType: 'safety',
      result: 'pass',
      testDate: '2026-02-13 08:00',
      tester: 'Choi Yeon-hee',
      testDuration: '3h 15m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Fire Resistance', expected: 'V-0 Rating', actual: 'V-0 Pass', status: 'pass' },
        { name: 'Toxicity Test', expected: 'Non-toxic', actual: 'Pass', status: 'pass' },
        { name: 'Sharp Edges', expected: 'None', actual: 'None detected', status: 'pass' }
      ]
    },
    {
      id: '15',
      testNumber: 'TEST-2026-015',
      productName: 'Industrial Controller IC-X500',
      orderNumber: 'PO-2026-004',
      serialNumber: 'IC-X500-072',
      testType: 'environmental',
      result: 'pass',
      testDate: '2026-02-12 14:00',
      tester: 'Jung Hae-in',
      testDuration: '4h 45m',
      parameters: [
        { name: 'Electrical Test / 전기 시험', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Visual Inspection / 외관 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Packaging Check / 포장 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Dimension Check / 치수 검사', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Weight Verification / 중량 확인', expected: 'Pass', actual: 'Pass', status: 'pass' },
        { name: 'Altitude Test', expected: 'Up to 3000m', actual: '3200m', status: 'pass' },
        { name: 'Shock Test', expected: '50G @ 11ms', actual: '52G @ 11ms', status: 'pass' },
        { name: 'Drop Test', expected: '1m height', actual: '1.2m', status: 'pass' }
      ]
    }
  ]);

  const getTestTypeInfo = (type: string) => {
    const types = {
      'functional': {
        label: locale === 'ko' ? '기능 테스트' : 'Functional',
        color: 'bg-blue-100 text-blue-800',
        icon: '⚙️'
      },
      'performance': {
        label: locale === 'ko' ? '성능 테스트' : 'Performance',
        color: 'bg-purple-100 text-purple-800',
        icon: '⚡'
      },
      'safety': {
        label: locale === 'ko' ? '안전 테스트' : 'Safety',
        color: 'bg-red-100 text-red-800',
        icon: '🛡️'
      },
      'environmental': {
        label: locale === 'ko' ? '환경 테스트' : 'Environmental',
        color: 'bg-green-100 text-green-800',
        icon: '🌍'
      },
      'durability': {
        label: locale === 'ko' ? '내구성 테스트' : 'Durability',
        color: 'bg-amber-100 text-amber-800',
        icon: '💪'
      }
    };
    return types[type as keyof typeof types] || types.functional;
  };

  const getResultInfo = (result: string) => {
    const results = {
      'pass': {
        label: locale === 'ko' ? '합격' : 'Pass',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '✅'
      },
      'fail': {
        label: locale === 'ko' ? '불합격' : 'Fail',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '❌'
      },
      'conditional': {
        label: locale === 'ko' ? '조건부 합격' : 'Conditional',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '⚠️'
      }
    };
    return results[result as keyof typeof results] || results.pass;
  };

  const filteredResults = testResults.filter(test => {
    const typeMatch = filterType === 'all' || test.testType === filterType;
    const resultMatch = filterResult === 'all' || test.result === filterResult;
    return typeMatch && resultMatch;
  });

  const handleViewDetails = (test: TestResult) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTest(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/production/dashboard')}
              className="text-green-600 hover:text-green-800"
            >
              ← {t.back}
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                {locale === 'ko' ? '제품 테스트 결과' : 'Post-Production Test Results'}
              </h1>
              <p className="text-gray-600 mt-1">
                {locale === 'ko' ? '생산 후 품질 테스트 결과 조회' : 'Quality test results after production'}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '전체 테스트' : 'Total Tests'}</p>
            <p className="text-2xl font-bold text-green-600">{testResults.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '합격' : 'Pass'}</p>
            <p className="text-2xl font-bold text-green-600">
              {testResults.filter(t => t.result === 'pass').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '불합격' : 'Fail'}</p>
            <p className="text-2xl font-bold text-red-600">
              {testResults.filter(t => t.result === 'fail').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '조건부 합격' : 'Conditional'}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {testResults.filter(t => t.result === 'conditional').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '합격률' : 'Pass Rate'}</p>
            <p className="text-2xl font-bold text-blue-600">
              {Math.round((testResults.filter(t => t.result === 'pass').length / testResults.length) * 100)}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ko' ? '테스트 유형' : 'Test Type'}
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">{locale === 'ko' ? '전체' : 'All'}</option>
                <option value="functional">{locale === 'ko' ? '기능 테스트' : 'Functional'}</option>
                <option value="performance">{locale === 'ko' ? '성능 테스트' : 'Performance'}</option>
                <option value="safety">{locale === 'ko' ? '안전 테스트' : 'Safety'}</option>
                <option value="environmental">{locale === 'ko' ? '환경 테스트' : 'Environmental'}</option>
                <option value="durability">{locale === 'ko' ? '내구성 테스트' : 'Durability'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ko' ? '결과' : 'Result'}
              </label>
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">{locale === 'ko' ? '전체' : 'All'}</option>
                <option value="pass">{locale === 'ko' ? '합격' : 'Pass'}</option>
                <option value="fail">{locale === 'ko' ? '불합격' : 'Fail'}</option>
                <option value="conditional">{locale === 'ko' ? '조건부 합격' : 'Conditional'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Test Results List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {locale === 'ko' ? '테스트 결과 목록' : 'Test Results List'} ({filteredResults.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '테스트 번호' : 'Test No.'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '제품명 / 일련번호' : 'Product / Serial'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '테스트 유형' : 'Test Type'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '결과' : 'Result'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '테스터' : 'Tester'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '테스트 일시' : 'Test Date'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '작업' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((test) => {
                  const typeInfo = getTestTypeInfo(test.testType);
                  const resultInfo = getResultInfo(test.result);
                  return (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{test.testNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{test.productName}</div>
                        <div className="text-xs text-gray-500">{test.serialNumber}</div>
                        <div className="text-xs text-blue-600">{test.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          <span>{typeInfo.icon}</span>
                          <span>{typeInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${resultInfo.color}`}>
                          <span>{resultInfo.icon}</span>
                          <span>{resultInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{test.tester}</div>
                        <div className="text-xs text-gray-500">{test.testDuration}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{test.testDate}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(test)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline"
                        >
                          {t.viewDetails}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`sticky top-0 bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 flex items-center justify-between border-b-4 ${getResultInfo(selectedTest.result).color.split(' ')[0].replace('bg-', 'border-')}`}>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedTest.testNumber}</h2>
                <p className="text-green-100 text-sm">{selectedTest.productName}</p>
              </div>
              <button onClick={closeModal} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Result Overview */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-medium ${getTestTypeInfo(selectedTest.testType).color}`}>
                      <span className="text-2xl">{getTestTypeInfo(selectedTest.testType).icon}</span>
                      <span>{getTestTypeInfo(selectedTest.testType).label}</span>
                    </span>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-medium border-2 ${getResultInfo(selectedTest.result).color}`}>
                      <span className="text-2xl">{getResultInfo(selectedTest.result).icon}</span>
                      <span>{getResultInfo(selectedTest.result).label}</span>
                    </span>
                  </div>
                  {selectedTest.retestRequired && (
                    <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-bold border border-red-300">
                      {locale === 'ko' ? '재테스트 필요' : 'Retest Required'}
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '일련번호' : 'Serial Number'}</p>
                  <p className="font-semibold text-gray-800">{selectedTest.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '주문번호' : 'Order Number'}</p>
                  <p className="font-semibold text-gray-800">{selectedTest.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '테스터' : 'Tester'}</p>
                  <p className="font-semibold text-gray-800">{selectedTest.tester}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '테스트 시간' : 'Test Duration'}</p>
                  <p className="font-semibold text-gray-800">{selectedTest.testDuration}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '테스트 일시' : 'Test Date'}</p>
                  <p className="font-semibold text-gray-800">{selectedTest.testDate}</p>
                </div>
              </div>

              {/* Inspection Results */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🔍</span>
                  {locale === 'ko' ? '검사 결과' : 'Inspection Results'}
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-600 w-10">No.</th>
                        <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-600">{locale === 'ko' ? '항목' : 'Item / 항목'}</th>
                        <th className="px-3 py-2.5 text-center text-xs font-bold text-gray-600 w-28">{locale === 'ko' ? '결과' : 'Result / 결과'}</th>
                        <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-600">{locale === 'ko' ? '비고' : 'Remarks / 비고'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTest.parameters.map((param, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-2.5 text-center text-gray-500 font-bold">{idx + 1}</td>
                          <td className="px-3 py-2.5 text-gray-800 font-medium">{param.name}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${param.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {param.status === 'pass' ? (locale === 'ko' ? '합격' : 'PASS') : (locale === 'ko' ? '불합격' : 'FAIL')}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 text-xs">
                            {param.remarks || `Expected: ${param.expected} / Actual: ${param.actual}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedTest.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-800 mb-2">{locale === 'ko' ? '비고' : 'Notes'}</p>
                  <p className="text-sm text-yellow-700">{selectedTest.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg">
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
