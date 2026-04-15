'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import CountryFlag from '@/components/CountryFlag';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface ProductionUpdate {
  id: string;
  orderNumber: string;
  productName: string;
  branch: 'Korea' | 'Brunei' | 'Thailand' | 'Vietnam';
  branchCode: 'KR' | 'BN' | 'TH' | 'VN';
  totalQuantity: number;
  completedQuantity: number;
  progressPercent: number;
  currentStage: 'assembly' | 'testing' | 'packaging' | 'ready';
  assignedTeam: string;
  startDate: string;
  estimatedCompletion: string;
  lastUpdate: string;
  notes?: string;
}

export default function ProductionUpdatesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedUpdate, setSelectedUpdate] = useState<ProductionUpdate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [updates] = useState<ProductionUpdate[]>([
    {
      id: '1',
      orderNumber: 'PO-2026-001',
      productName: 'Energy Saving System Model A-2024',
      branch: 'Korea',
      branchCode: 'KR',
      totalQuantity: 50,
      completedQuantity: 35,
      progressPercent: 70,
      currentStage: 'testing',
      assignedTeam: 'Team Alpha',
      startDate: '2026-02-10',
      estimatedCompletion: '2026-02-20',
      lastUpdate: '2026-02-15 14:30',
      notes: 'Testing phase progressing well, minor adjustments needed'
    },
    {
      id: '2',
      orderNumber: 'PO-2026-003',
      productName: 'Energy Monitor Pro',
      branch: 'Brunei',
      branchCode: 'BN',
      totalQuantity: 30,
      completedQuantity: 28,
      progressPercent: 93,
      currentStage: 'packaging',
      assignedTeam: 'Team Beta',
      startDate: '2026-02-08',
      estimatedCompletion: '2026-02-18',
      lastUpdate: '2026-02-15 11:00',
      notes: 'Almost ready for shipment'
    },
    {
      id: '3',
      orderNumber: 'PO-2026-004',
      productName: 'Industrial Controller IC-X500',
      branch: 'Thailand',
      branchCode: 'TH',
      totalQuantity: 40,
      completedQuantity: 20,
      progressPercent: 50,
      currentStage: 'assembly',
      assignedTeam: 'Team Gamma',
      startDate: '2026-02-12',
      estimatedCompletion: '2026-02-22',
      lastUpdate: '2026-02-15 09:15',
      notes: 'On schedule, additional components arrived'
    },
    {
      id: '4',
      orderNumber: 'PO-2026-005',
      productName: 'Smart Gateway SG-2024',
      branch: 'Vietnam',
      branchCode: 'VN',
      totalQuantity: 35,
      completedQuantity: 35,
      progressPercent: 100,
      currentStage: 'ready',
      assignedTeam: 'Team Delta',
      startDate: '2026-02-05',
      estimatedCompletion: '2026-02-15',
      lastUpdate: '2026-02-15 08:00',
      notes: 'Completed and ready for shipment'
    }
  ]);

  const getStageInfo = (stage: string) => {
    const stages = {
      'assembly': {
        label: locale === 'ko' ? '조립 중' : 'Assembly',
        color: 'bg-blue-100 text-blue-800',
        icon: '🔧'
      },
      'testing': {
        label: locale === 'ko' ? '테스트 중' : 'Testing',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🔬'
      },
      'packaging': {
        label: locale === 'ko' ? '포장 중' : 'Packaging',
        color: 'bg-purple-100 text-purple-800',
        icon: '📦'
      },
      'ready': {
        label: locale === 'ko' ? '완료' : 'Ready',
        color: 'bg-green-100 text-green-800',
        icon: '✅'
      }
    };
    return stages[stage as keyof typeof stages] || stages.assembly;
  };

  const handleViewDetails = (update: ProductionUpdate) => {
    setSelectedUpdate(update);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUpdate(null);
  };

  const handleUpdateProgress = () => {
    if (selectedUpdate) {
      alert(
        locale === 'ko'
          ? `${selectedUpdate.orderNumber} 진척도가 업데이트되었습니다!`
          : `Progress updated for ${selectedUpdate.orderNumber}!`
      );
      closeModal();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
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
                {locale === 'ko' ? '생산 진척 현황' : 'Production Updates'}
              </h1>
              <p className="text-gray-600 mt-1">
                {locale === 'ko' ? '실시간 생산 진행 상황' : 'Real-time production progress'}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '전체 프로젝트' : 'Total Projects'}</p>
            <p className="text-2xl font-bold text-green-600">{updates.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '조립 중' : 'In Assembly'}</p>
            <p className="text-2xl font-bold text-blue-600">
              {updates.filter(u => u.currentStage === 'assembly').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '테스트 중' : 'In Testing'}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {updates.filter(u => u.currentStage === 'testing').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '완료' : 'Completed'}</p>
            <p className="text-2xl font-bold text-green-600">
              {updates.filter(u => u.currentStage === 'ready').length}
            </p>
          </div>
        </div>

        {/* Production Updates List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {locale === 'ko' ? '생산 진행 목록' : 'Production Progress List'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '주문번호' : 'Order No.'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '제품명' : 'Product'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '지점' : 'Branch'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '진행률' : 'Progress'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '현재 단계' : 'Current Stage'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '담당팀' : 'Team'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '마지막 업데이트' : 'Last Update'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {locale === 'ko' ? '작업' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {updates.map((update) => {
                  const stageInfo = getStageInfo(update.currentStage);
                  return (
                    <tr key={update.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{update.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{update.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CountryFlag country={update.branchCode} size="sm" />
                          <span className="text-sm text-gray-600">{update.branch}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${update.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-700">
                            {update.progressPercent}%
                          </span>
                          <span className="text-xs text-gray-500">
                            {update.completedQuantity}/{update.totalQuantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${stageInfo.color}`}>
                          <span>{stageInfo.icon}</span>
                          <span>{stageInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{update.assignedTeam}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{update.lastUpdate}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(update)}
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
      {isModalOpen && selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CountryFlag country={selectedUpdate.branchCode} size="lg" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedUpdate.orderNumber}</h2>
                  <p className="text-green-100 text-sm">{selectedUpdate.productName}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Progress Overview */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-bold text-gray-800 mb-4">{locale === 'ko' ? '진행 현황' : 'Progress Overview'}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {locale === 'ko' ? '전체 진행률' : 'Overall Progress'}
                      </span>
                      <span className="text-sm font-bold text-green-600">{selectedUpdate.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${selectedUpdate.progressPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600">{locale === 'ko' ? '완료 수량' : 'Completed'}</p>
                      <p className="text-2xl font-bold text-green-600">{selectedUpdate.completedQuantity}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600">{locale === 'ko' ? '총 수량' : 'Total'}</p>
                      <p className="text-2xl font-bold text-gray-800">{selectedUpdate.totalQuantity}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '현재 단계' : 'Current Stage'}</p>
                  <p className="font-semibold text-gray-800">{getStageInfo(selectedUpdate.currentStage).label}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '담당팀' : 'Assigned Team'}</p>
                  <p className="font-semibold text-gray-800">{selectedUpdate.assignedTeam}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '시작일' : 'Start Date'}</p>
                  <p className="font-semibold text-gray-800">{selectedUpdate.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '완료 예정' : 'Est. Completion'}</p>
                  <p className="font-semibold text-gray-800">{selectedUpdate.estimatedCompletion}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '마지막 업데이트' : 'Last Update'}</p>
                  <p className="font-semibold text-gray-800">{selectedUpdate.lastUpdate}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedUpdate.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-800 mb-2">{locale === 'ko' ? '비고' : 'Notes'}</p>
                  <p className="text-sm text-yellow-700">{selectedUpdate.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg">
                  {t.close}
                </button>
                <button onClick={handleUpdateProgress} className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg">
                  {locale === 'ko' ? '진척도 업데이트' : 'Update Progress'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
