'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, Zap, Plus, Eye, Trash2, X, Search as SearchIcon, Printer, FileDown, Activity, BarChart3 } from 'lucide-react';

interface PreInstallationAnalysis {
  id: number;
  analysisNumber: string;
  region: string;
  regionKey: string;
  siteLocation: string;
  measurementDevice: string;
  measurementDateTime: string;
  lineL1Current: number;
  lineL2Current: number;
  lineL3Current: number;
  neutralCurrent: number;
  voltage: string;
  frequency: number;
  powerFactor: number;
  thd: number;
  phaseBalance: string;
  analysisResult: string;
  recommendedAction: string;
  technician: string;
  remarks: string;
}

export default function DomesticPreInstallationAnalysisPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<PreInstallationAnalysis | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const regions = locale === 'ko'
    ? [{ key: 'seoul', name: '서울/경기' }, { key: 'busan', name: '부산/경남' }, { key: 'daegu', name: '대구/경북' }, { key: 'daejeon', name: '대전/충청' }, { key: 'gwangju', name: '광주/전라' }, { key: 'incheon', name: '인천/강원' }, { key: 'jeju', name: '제주' }]
    : [{ key: 'seoul', name: 'Seoul/Gyeonggi' }, { key: 'busan', name: 'Busan/Gyeongnam' }, { key: 'daegu', name: 'Daegu/Gyeongbuk' }, { key: 'daejeon', name: 'Daejeon/Chungcheong' }, { key: 'gwangju', name: 'Gwangju/Jeolla' }, { key: 'incheon', name: 'Incheon/Gangwon' }, { key: 'jeju', name: 'Jeju' }];

  const [items, setItems] = useState<PreInstallationAnalysis[]>([
    { 
      id: 1, 
      analysisNumber: 'DPIA-2026-001', 
      region: '서울/경기', 
      regionKey: 'seoul', 
      siteLocation: '서울 강남구 역삼동 본사 빌딩 - 메인 판넬',
      measurementDevice: 'Fluke 1760 전력 품질 분석기', 
      measurementDateTime: '2026-02-15 09:30', 
      lineL1Current: 192.3, 
      lineL2Current: 198.7, 
      lineL3Current: 185.9, 
      neutralCurrent: 11.4,
      voltage: '380V',
      frequency: 59.97,
      powerFactor: 0.93,
      thd: 2.8,
      phaseBalance: 'Excellent',
      analysisResult: 'installationReady',
      recommendedAction: '전류 균형 상태 우수, KSAVE 즉시 설치 가능.',
      technician: '김종수',
      remarks: '본사 전력 시스템 최적화 상태, 고효율 기대'
    },
    { 
      id: 2, 
      analysisNumber: 'DPIA-2026-002', 
      region: '부산/경남', 
      regionKey: 'busan', 
      siteLocation: '부산 기장군 정관공장 - 생산라인 A',
      measurementDevice: 'Hioki PW3198 Power Analyzer', 
      measurementDateTime: '2026-02-14 14:20', 
      lineL1Current: 495.8, 
      lineL2Current: 532.4, 
      lineL3Current: 501.2, 
      neutralCurrent: 31.6,
      voltage: '440V',
      frequency: 60.01,
      powerFactor: 0.87,
      thd: 6.2,
      phaseBalance: 'Fair',
      analysisResult: 'requiresAdjustment',
      recommendedAction: 'L2상 과부하 상태. 생산 설비 부하 재분배 필요.',
      technician: '박민호',
      remarks: '생산 라인 중부하로 인한 상 불균형, 부하 조절 후 재측정'
    },
    { 
      id: 3, 
      analysisNumber: 'DPIA-2026-003', 
      region: '대전/충청', 
      regionKey: 'daejeon', 
      siteLocation: '대전 유성구 대덕연구단지 - R&D 센터',
      measurementDevice: 'Chauvin Arnoux CA 8335', 
      measurementDateTime: '2026-02-13 10:45', 
      lineL1Current: 145.2, 
      lineL2Current: 151.8, 
      lineL3Current: 139.6, 
      neutralCurrent: 8.3,
      voltage: '380V',
      frequency: 59.99,
      powerFactor: 0.94,
      thd: 2.5,
      phaseBalance: 'Good',
      analysisResult: 'installationReady',
      recommendedAction: '연구개발 시설 전력 품질 우수, 설치 진행 가능.',
      technician: '이상철',
      remarks: 'R&D 장비 특성상 안정적 전력 공급, 설치 적합'
    },
    { 
      id: 4, 
      analysisNumber: 'DPIA-2026-004', 
      region: '광주/전라', 
      regionKey: 'gwangju', 
      siteLocation: '광주 광산구 물류센터 - 냉동창고',
      measurementDevice: 'Yokogawa CW240 Clamp Power Meter', 
      measurementDateTime: '2026-02-12 11:30', 
      lineL1Current: 288.7, 
      lineL2Current: 315.9, 
      lineL3Current: 295.3, 
      neutralCurrent: 19.8,
      voltage: '380V',
      frequency: 60.02,
      powerFactor: 0.88,
      thd: 4.8,
      phaseBalance: 'Good',
      analysisResult: 'installationReady',
      recommendedAction: '냉동 시스템 특성상 적정 수준의 고조파, 설치 가능.',
      technician: '최영수',
      remarks: '물류센터 냉동시설 정상 운영 상태'
    },
    { 
      id: 5, 
      analysisNumber: 'DPIA-2026-005', 
      region: '서울/경기', 
      regionKey: 'seoul', 
      siteLocation: '경기 수원시 삼성전자 인근 사업소 - UPS실',
      measurementDevice: 'Fluke 438-II Motor Analyzer', 
      measurementDateTime: '2026-02-11 13:15', 
      lineL1Current: 159.7, 
      lineL2Current: 144.3, 
      lineL3Current: 172.8, 
      neutralCurrent: 25.4,
      voltage: '380V',
      frequency: 59.96,
      powerFactor: 0.84,
      thd: 8.1,
      phaseBalance: 'Poor',
      analysisResult: 'notRecommended',
      recommendedAction: 'UPS 시스템 과부하 및 L1-L3상 불균형 심각, 전력 시스템 점검 필요.',
      technician: '정현우',
      remarks: 'UPS 노후화로 인한 전력 품질 저하, 개선 후 재검토'
    },
    { 
      id: 6, 
      analysisNumber: 'DPIA-2026-006', 
      region: '대구/경북', 
      regionKey: 'daegu', 
      siteLocation: '대구 달성군 산업단지 지사 - 사무동',
      measurementDevice: 'Megger MIT1525 Insulation Tester', 
      measurementDateTime: '2026-02-10 15:20', 
      lineL1Current: 95.4, 
      lineL2Current: 101.2, 
      lineL3Current: 88.9, 
      neutralCurrent: 4.7,
      voltage: '380V',
      frequency: 59.98,
      powerFactor: 0.96,
      thd: 1.8,
      phaseBalance: 'Excellent',
      analysisResult: 'installationReady',
      recommendedAction: '소규모 사무소로 전력 품질 매우 우수, 즉시 설치 적합.',
      technician: '김태홍',
      remarks: '신규 사무소 건물, 전기 설비 상태 최고'
    },
    { 
      id: 7, 
      analysisNumber: 'DPIA-2026-007', 
      region: '인천/강원', 
      regionKey: 'incheon', 
      siteLocation: '인천 서구 검단 신규 설치현장 - 배전반',
      measurementDevice: 'AEMC 2135.36 Clamp-on Ground Tester', 
      measurementDateTime: '2026-02-09 16:45', 
      lineL1Current: 156.8, 
      lineL2Current: 163.4, 
      lineL3Current: 149.7, 
      neutralCurrent: 9.1,
      voltage: '380V',
      frequency: 60.00,
      powerFactor: 0.91,
      thd: 3.4,
      phaseBalance: 'Good',
      analysisResult: 'installationReady',
      recommendedAction: '신규 현장으로 전력 인프라 양호, 설치 진행.',
      technician: '서영민',
      remarks: '검단 신도시 신규 건물, 최신 전기 설비'
    },
    { 
      id: 8, 
      analysisNumber: 'DPIA-2026-008', 
      region: '제주', 
      regionKey: 'jeju', 
      siteLocation: '제주 서귀포시 태양광 발전소 - 관리동',
      measurementDevice: 'Kikusui KHA1000 Harmonic Analyzer', 
      measurementDateTime: '2026-02-08 11:10', 
      lineL1Current: 385.6, 
      lineL2Current: 412.3, 
      lineL3Current: 398.9, 
      neutralCurrent: 22.7,
      voltage: '380V',
      frequency: 60.01,
      powerFactor: 0.86,
      thd: 5.9,
      phaseBalance: 'Fair',
      analysisResult: 'requiresAdjustment',
      recommendedAction: '태양광 인버터로 인한 고조파 발생, 필터 설치 검토.',
      technician: '강도현',
      remarks: '재생에너지 시설 특성상 고조파 존재, 대책 필요'
    }
  ]);

  const [newAnalysis, setNewAnalysis] = useState<Partial<PreInstallationAnalysis>>({
    region: '',
    regionKey: '',
    siteLocation: '',
    measurementDevice: '',
    measurementDateTime: '',
    lineL1Current: 0,
    lineL2Current: 0,
    lineL3Current: 0,
    neutralCurrent: 0,
    voltage: '380V',
    frequency: 60.0,
    powerFactor: 0.9,
    thd: 0,
    phaseBalance: 'Good',
    analysisResult: 'installationReady',
    recommendedAction: '',
    technician: '',
    remarks: ''
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.siteLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.analysisNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === 'all' || item.regionKey === regionFilter;
    const matchesResult = resultFilter === 'all' || item.analysisResult === resultFilter;
    return matchesSearch && matchesRegion && matchesResult;
  });

  const handleSubmit = () => {
    if (newAnalysis.region && newAnalysis.siteLocation && newAnalysis.measurementDevice) {
      const nextId = Math.max(...items.map(item => item.id)) + 1;
      const analysisNumber = `DPIA-2026-${nextId.toString().padStart(3, '0')}`;
      
      setItems([...items, {
        ...newAnalysis,
        id: nextId,
        analysisNumber
      } as PreInstallationAnalysis]);
      
      setIsAddModalOpen(false);
      setNewAnalysis({
        region: '',
        regionKey: '',
        siteLocation: '',
        measurementDevice: '',
        measurementDateTime: '',
        lineL1Current: 0,
        lineL2Current: 0,
        lineL3Current: 0,
        neutralCurrent: 0,
        voltage: '380V',
        frequency: 60.0,
        powerFactor: 0.9,
        thd: 0,
        phaseBalance: 'Good',
        analysisResult: 'installationReady',
        recommendedAction: '',
        technician: '',
        remarks: ''
      });
    }
  };

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getResultBadgeColor = (result: string) => {
    switch (result) {
      case 'installationReady':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'requiresAdjustment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'notRecommended':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPhaseBalanceBadge = (balance: string) => {
    switch (balance) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800';
      case 'Good':
        return 'bg-green-100 text-green-800';
      case 'Fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'Poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {t.preInstallationAnalysis}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {t.preInstallationAnalysisDesc}
                  </p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={locale === 'ko' ? "분석번호, 위치, 기사명 검색..." : "Search by number, location, technician..."}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t.allRegions}</option>
                {regions.map(region => (
                  <option key={region.key} value={region.key}>{region.name}</option>
                ))}
              </select>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{locale === 'ko' ? '전체 결과' : 'All Results'}</option>
                <option value="installationReady">{t.installationReady}</option>
                <option value="requiresAdjustment">{t.requiresAdjustment}</option>
                <option value="notRecommended">{t.notRecommended}</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                {locale === 'ko' ? '새 분석 추가' : 'Add Analysis'}
              </button>
            </div>
          </div>
        </div>

        {/* Analysis List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              {t.threePhaseAnalysis} ({filteredItems.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '분석번호' : 'Analysis No.'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.region}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.siteLocation}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.measurementDateTime}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    L1/L2/L3 (A)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.phaseBalance}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.analysisResult}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {item.analysisNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.region}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.siteLocation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.measurementDateTime}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="text-red-600">L1: {item.lineL1Current}</span><br/>
                        <span className="text-yellow-600">L2: {item.lineL2Current}</span><br/>
                        <span className="text-blue-600">L3: {item.lineL3Current}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPhaseBalanceBadge(item.phaseBalance)}`}>
                        {item.phaseBalance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getResultBadgeColor(item.analysisResult)}`}>
                        {t[item.analysisResult as keyof typeof t]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {t.threePhaseAnalysis} - {selectedItem.analysisNumber}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{locale === 'ko' ? '기본 정보' : 'Basic Information'}</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>{t.region}:</strong> {selectedItem.region}</div>
                    <div><strong>{t.siteLocation}:</strong> {selectedItem.siteLocation}</div>
                    <div><strong>{t.measurementDevice}:</strong> {selectedItem.measurementDevice}</div>
                    <div><strong>{t.measurementDateTime}:</strong> {selectedItem.measurementDateTime}</div>
                    <div><strong>{locale === 'ko' ? '기사' : 'Technician'}:</strong> {selectedItem.technician}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">{locale === 'ko' ? '전기적 매개변수' : 'Electrical Parameters'}</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>{t.voltage}:</strong> {selectedItem.voltage}</div>
                    <div><strong>{t.frequency}:</strong> {selectedItem.frequency} Hz</div>
                    <div><strong>{t.powerFactor}:</strong> {selectedItem.powerFactor}</div>
                    <div><strong>{t.totalHarmonicDistortion}:</strong> {selectedItem.thd}%</div>
                    <div><strong>{t.neutralLine}:</strong> {selectedItem.neutralCurrent} A</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{t.threePhaseAnalysis}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-semibold text-red-600">{t.lineL1}</div>
                    <div className="text-2xl font-bold">{selectedItem.lineL1Current} A</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-semibold text-yellow-600">{t.lineL2}</div>
                    <div className="text-2xl font-bold">{selectedItem.lineL2Current} A</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">{t.lineL3}</div>
                    <div className="text-2xl font-bold">{selectedItem.lineL3Current} A</div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t.phaseBalance}:</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${getPhaseBalanceBadge(selectedItem.phaseBalance)}`}>
                      {selectedItem.phaseBalance}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{t.analysisResult}</h4>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{locale === 'ko' ? '결과' : 'Result'}:</span>
                    <span className={`px-3 py-1 rounded-full text-sm border ${getResultBadgeColor(selectedItem.analysisResult)}`}>
                      {t[selectedItem.analysisResult as keyof typeof t]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>{t.recommendedAction}:</strong> {selectedItem.recommendedAction}
                  </div>
                  {selectedItem.remarks && (
                    <div className="text-sm text-gray-700 mt-2">
                      <strong>{t.remarks}:</strong> {selectedItem.remarks}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {locale === 'ko' ? '새 전류 분석 추가' : 'Add New Current Analysis'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.region} *
                  </label>
                  <select
                    value={newAnalysis.regionKey}
                    onChange={(e) => {
                      const region = regions.find(r => r.key === e.target.value);
                      setNewAnalysis({
                        ...newAnalysis,
                        regionKey: e.target.value,
                        region: region?.name || ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{locale === 'ko' ? '지역 선택' : 'Select Region'}</option>
                    {regions.map(region => (
                      <option key={region.key} value={region.key}>{region.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.siteLocation} *
                  </label>
                  <input
                    type="text"
                    value={newAnalysis.siteLocation}
                    onChange={(e) => setNewAnalysis({...newAnalysis, siteLocation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.measurementDevice} *
                  </label>
                  <input
                    type="text"
                    value={newAnalysis.measurementDevice}
                    onChange={(e) => setNewAnalysis({...newAnalysis, measurementDevice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.measurementDateTime} *
                  </label>
                  <input
                    type="datetime-local"
                    value={newAnalysis.measurementDateTime}
                    onChange={(e) => setNewAnalysis({...newAnalysis, measurementDateTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.lineL1} (A) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAnalysis.lineL1Current}
                    onChange={(e) => setNewAnalysis({...newAnalysis, lineL1Current: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.lineL2} (A) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAnalysis.lineL2Current}
                    onChange={(e) => setNewAnalysis({...newAnalysis, lineL2Current: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.lineL3} (A) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAnalysis.lineL3Current}
                    onChange={(e) => setNewAnalysis({...newAnalysis, lineL3Current: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.neutralLine} (A)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAnalysis.neutralCurrent}
                    onChange={(e) => setNewAnalysis({...newAnalysis, neutralCurrent: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.analysisResult} *
                  </label>
                  <select
                    value={newAnalysis.analysisResult}
                    onChange={(e) => setNewAnalysis({...newAnalysis, analysisResult: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="installationReady">{t.installationReady}</option>
                    <option value="requiresAdjustment">{t.requiresAdjustment}</option>
                    <option value="notRecommended">{t.notRecommended}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === 'ko' ? '기사' : 'Technician'} *
                  </label>
                  <input
                    type="text"
                    value={newAnalysis.technician}
                    onChange={(e) => setNewAnalysis({...newAnalysis, technician: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.recommendedAction} *
                </label>
                <textarea
                  value={newAnalysis.recommendedAction}
                  onChange={(e) => setNewAnalysis({...newAnalysis, recommendedAction: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.remarks}
                </label>
                <textarea
                  value={newAnalysis.remarks}
                  onChange={(e) => setNewAnalysis({...newAnalysis, remarks: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {locale === 'ko' ? '분석 추가' : 'Add Analysis'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}