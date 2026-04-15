'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface DevelopmentFix {
  id: string;
  fixNumber: string;
  title: string;
  description: string;
  type: 'bug-fix' | 'enhancement' | 'optimization' | 'documentation';
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in-progress' | 'testing' | 'deployed' | 'completed';
  relatedIssue?: string;
  developer: string;
  startDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours?: number;
  affectedSystems: string[];
  testingNotes?: string;
}

export default function DevelopmentFixesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedFix, setSelectedFix] = useState<DevelopmentFix | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [fixes] = useState<DevelopmentFix[]>([
    {
      id: '1',
      fixNumber: 'FIX-2026-001',
      title: 'Production Line Data Sync Optimization',
      description: 'Optimize real-time data synchronization between production lines and central database to reduce latency from 5s to <1s. Implemented Redis caching layer.',
      type: 'optimization',
      priority: 'high',
      status: 'deployed',
      developer: 'Lee Chan-woo',
      startDate: '2026-02-12',
      completedDate: '2026-02-15',
      estimatedHours: 24,
      actualHours: 20,
      affectedSystems: ['Production Line A-1', 'Production Line B-2', 'Central Database', 'Dashboard'],
      testingNotes: 'Tested under peak load conditions. Latency reduced to 0.8s average.'
    },
    {
      id: '2',
      fixNumber: 'FIX-2026-002',
      title: 'Fix Inventory Count Discrepancy Bug',
      description: 'Resolved critical bug causing inventory count discrepancies in materials database. Issue was race condition in concurrent update operations.',
      type: 'bug-fix',
      priority: 'high',
      status: 'completed',
      relatedIssue: 'ISS-2026-004',
      developer: 'Kim Seo-yeon',
      startDate: '2026-02-13',
      completedDate: '2026-02-14',
      estimatedHours: 16,
      actualHours: 18,
      affectedSystems: ['Materials Database', 'Inventory Management'],
      testingNotes: 'Comprehensive testing with 1000 concurrent transactions. No discrepancies found.'
    },
    {
      id: '3',
      fixNumber: 'FIX-2026-003',
      title: 'QC Test Results Auto-Report Generator',
      description: 'Developed automated report generation system for daily QC test results. Generates PDF reports with charts and analysis automatically at end of shift.',
      type: 'enhancement',
      priority: 'medium',
      status: 'testing',
      developer: 'Park Min-ji',
      startDate: '2026-02-10',
      estimatedHours: 32,
      actualHours: 28,
      affectedSystems: ['Quality Control System', 'Report Generator'],
      testingNotes: 'Initial testing shows accurate data compilation. User feedback collection in progress.'
    },
    {
      id: '4',
      fixNumber: 'FIX-2026-004',
      title: 'Shipment Tracking API Integration',
      description: 'Integrated third-party carrier APIs for real-time shipment tracking. Supports Korea Express, Pacific Shipping, and Asian Maritime carriers.',
      type: 'enhancement',
      priority: 'high',
      status: 'in-progress',
      developer: 'Choi Ji-hun',
      startDate: '2026-02-14',
      estimatedHours: 40,
      affectedSystems: ['Shipment Management', 'External APIs', 'Tracking Dashboard']
    },
    {
      id: '5',
      fixNumber: 'FIX-2026-005',
      title: 'Production Dashboard Mobile Responsiveness',
      description: 'Enhanced mobile responsiveness for production dashboard. Optimized layouts for tablets and smartphones for on-floor monitoring.',
      type: 'enhancement',
      priority: 'medium',
      status: 'completed',
      developer: 'Jung Hyun-woo',
      startDate: '2026-02-08',
      completedDate: '2026-02-13',
      estimatedHours: 20,
      actualHours: 22,
      affectedSystems: ['Production Dashboard', 'Mobile Interface'],
      testingNotes: 'Tested on iOS and Android devices. Responsive design works well on all screen sizes.'
    },
    {
      id: '6',
      fixNumber: 'FIX-2026-006',
      title: 'Database Backup Automation Enhancement',
      description: 'Improved automated backup system with incremental backups every 4 hours and full backup daily. Added backup verification and restore testing.',
      type: 'optimization',
      priority: 'medium',
      status: 'deployed',
      developer: 'Kang Yoo-jin',
      startDate: '2026-02-09',
      completedDate: '2026-02-12',
      estimatedHours: 16,
      actualHours: 14,
      affectedSystems: ['Database System', 'Backup Server'],
      testingNotes: 'Backup and restore tested successfully. Recovery time reduced by 60%.'
    },
    {
      id: '7',
      fixNumber: 'FIX-2026-007',
      title: 'API Documentation Update',
      description: 'Comprehensive update of internal API documentation for production and logistics systems. Added code examples and integration guides.',
      type: 'documentation',
      priority: 'low',
      status: 'in-progress',
      developer: 'Yoon Su-bin',
      startDate: '2026-02-11',
      estimatedHours: 24,
      affectedSystems: ['Documentation Portal', 'API Gateway']
    }
  ]);

  const getTypeInfo = (type: string) => {
    const types = {
      'bug-fix': {
        label: locale === 'ko' ? '버그 수정' : 'Bug Fix',
        color: 'bg-red-100 text-red-800',
        icon: '🐛'
      },
      'enhancement': {
        label: locale === 'ko' ? '기능 개선' : 'Enhancement',
        color: 'bg-blue-100 text-blue-800',
        icon: '✨'
      },
      'optimization': {
        label: locale === 'ko' ? '최적화' : 'Optimization',
        color: 'bg-green-100 text-green-800',
        icon: '⚡'
      },
      'documentation': {
        label: locale === 'ko' ? '문서화' : 'Documentation',
        color: 'bg-purple-100 text-purple-800',
        icon: '📝'
      }
    };
    return types[type as keyof typeof types] || types.enhancement;
  };

  const getPriorityInfo = (priority: string) => {
    const priorities = {
      'high': {
        label: locale === 'ko' ? '높음' : 'High',
        color: 'bg-red-100 text-red-800',
        icon: '🔴'
      },
      'medium': {
        label: locale === 'ko' ? '보통' : 'Medium',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🟡'
      },
      'low': {
        label: locale === 'ko' ? '낮음' : 'Low',
        color: 'bg-green-100 text-green-800',
        icon: '🟢'
      }
    };
    return priorities[priority as keyof typeof priorities] || priorities.medium;
  };

  const getStatusInfo = (status: string) => {
    const statuses = {
      'planned': {
        label: locale === 'ko' ? '계획됨' : 'Planned',
        color: 'bg-gray-100 text-gray-800',
        progress: 0
      },
      'in-progress': {
        label: locale === 'ko' ? '진행 중' : 'In Progress',
        color: 'bg-blue-100 text-blue-800',
        progress: 50
      },
      'testing': {
        label: locale === 'ko' ? '테스트 중' : 'Testing',
        color: 'bg-yellow-100 text-yellow-800',
        progress: 75
      },
      'deployed': {
        label: locale === 'ko' ? '배포됨' : 'Deployed',
        color: 'bg-purple-100 text-purple-800',
        progress: 90
      },
      'completed': {
        label: locale === 'ko' ? '완료됨' : 'Completed',
        color: 'bg-green-100 text-green-800',
        progress: 100
      }
    };
    return statuses[status as keyof typeof statuses] || statuses.planned;
  };

  const filteredFixes = fixes.filter(fix => {
    const typeMatch = filterType === 'all' || fix.type === filterType;
    const statusMatch = filterStatus === 'all' || fix.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const handleViewDetails = (fix: DevelopmentFix) => {
    setSelectedFix(fix);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFix(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py- 6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/production/dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← {t.back}
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                {locale === 'ko' ? '일일 개발 및 수정 사항' : 'Daily Development & Fixes'}
              </h1>
              <p className="text-gray-600 mt-1">
                {locale === 'ko' ? '시스템 개선 및 버그 수정 현황' : 'System improvements and bug fixes status'}
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
            <p className="text-sm text-gray-600">{locale === 'ko' ? '전체 수정' : 'Total Fixes'}</p>
            <p className="text-2xl font-bold text-blue-600">{fixes.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '진행 중' : 'In Progress'}</p>
            <p className="text-2xl font-bold text-blue-600">
              {fixes.filter(f => f.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '테스트 중' : 'Testing'}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {fixes.filter(f => f.status === 'testing').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '배포됨' : 'Deployed'}</p>
            <p className="text-2xl font-bold text-purple-600">
              {fixes.filter(f => f.status === 'deployed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '완료됨' : 'Completed'}</p>
            <p className="text-2xl font-bold text-green-600">
              {fixes.filter(f => f.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ko' ? '유형' : 'Type'}
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{locale === 'ko' ? '전체' : 'All'}</option>
                <option value="bug-fix">{locale === 'ko' ? '버그 수정' : 'Bug Fix'}</option>
                <option value="enhancement">{locale === 'ko' ? '기능 개선' : 'Enhancement'}</option>
                <option value="optimization">{locale === 'ko' ? '최적화' : 'Optimization'}</option>
                <option value="documentation">{locale === 'ko' ? '문서화' : 'Documentation'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ko' ? '상태' : 'Status'}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{locale === 'ko' ? '전체' : 'All'}</option>
                <option value="planned">{locale === 'ko' ? '계획됨' : 'Planned'}</option>
                <option value="in-progress">{locale === 'ko' ? '진행 중' : 'In Progress'}</option>
                <option value="testing">{locale === 'ko' ? '테스트 중' : 'Testing'}</option>
                <option value="deployed">{locale === 'ko' ? '배포됨' : 'Deployed'}</option>
                <option value="completed">{locale === 'ko' ? '완료됨' : 'Completed'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fixes List */}
        <div className="space-y-4">
          {filteredFixes.map((fix) => {
            const typeInfo = getTypeInfo(fix.type);
            const priorityInfo = getPriorityInfo(fix.priority);
            const statusInfo = getStatusInfo(fix.status);
            
            return (
              <div key={fix.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-gray-500">{fix.fixNumber}</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          <span>{typeInfo.icon}</span>
                          <span>{typeInfo.label}</span>
                        </span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                          <span>{priorityInfo.icon}</span>
                          <span>{priorityInfo.label}</span>
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{fix.title}</h3>
                      <p className="text-gray-600 mb-4">{fix.description}</p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{locale === 'ko' ? '진행률' : 'Progress'}</span>
                          <span>{statusInfo.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${statusInfo.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">{locale === 'ko' ? '개발자' : 'Developer'}</p>
                          <p className="font-semibold text-gray-900">{fix.developer}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">{locale === 'ko' ? '시작일' : 'Start Date'}</p>
                          <p className="font-semibold text-gray-900">{fix.startDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">{locale === 'ko' ? '예상 시간' : 'Est. Hours'}</p>
                          <p className="font-semibold text-gray-900">{fix.estimatedHours}h</p>
                        </div>
                        {fix.actualHours && (
                          <div>
                            <p className="text-gray-500">{locale === 'ko' ? '실제 시간' : 'Actual Hours'}</p>
                            <p className="font-semibold text-gray-900">{fix.actualHours}h</p>
                          </div>
                        )}
                      </div>

                      {fix.affectedSystems.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">{locale === 'ko' ? '영향받는 시스템:' : 'Affected Systems:'}</p>
                          <div className="flex flex-wrap gap-2">
                            {fix.affectedSystems.map((system, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                                {system}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewDetails(fix)}
                      className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-sm whitespace-nowrap"
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedFix && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedFix.fixNumber}</h2>
                <p className="text-blue-100 text-sm">{selectedFix.title}</p>
              </div>
              <button onClick={closeModal} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Type & Priority & Status */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getTypeInfo(selectedFix.type).color}`}>
                  <span className="text-xl">{getTypeInfo(selectedFix.type).icon}</span>
                  <span>{getTypeInfo(selectedFix.type).label}</span>
                </span>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getPriorityInfo(selectedFix.priority).color}`}>
                  <span>{getPriorityInfo(selectedFix.priority).icon}</span>
                  <span>{getPriorityInfo(selectedFix.priority).label}</span>
                </span>
                <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusInfo(selectedFix.status).color}`}>
                  {getStatusInfo(selectedFix.status).label}
                </span>
              </div>

              {/* Progress */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-bold text-gray-800 mb-4">{locale === 'ko' ? '진행 상태' : 'Progress Status'}</h3>
                <div className="mb-2 flex justify-between text-sm text-gray-700">
                  <span>{locale === 'ko' ? '전체 진행률' : 'Overall Progress'}</span>
                  <span className="font-bold">{getStatusInfo(selectedFix.status).progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${getStatusInfo(selectedFix.status).progress}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-2">{locale === 'ko' ? '설명' : 'Description'}</h3>
                <p className="text-gray-700">{selectedFix.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '개발자' : 'Developer'}</p>
                  <p className="font-semibold text-gray-800">{selectedFix.developer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '시작일' : 'Start Date'}</p>
                  <p className="font-semibold text-gray-800">{selectedFix.startDate}</p>
                </div>
                {selectedFix.completedDate && (
                  <div>
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '완료일' : 'Completed Date'}</p>
                    <p className="font-semibold text-gray-800">{selectedFix.completedDate}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '예상 시간' : 'Estimated Hours'}</p>
                  <p className="font-semibold text-gray-800">{selectedFix.estimatedHours}h</p>
                </div>
                {selectedFix.actualHours && (
                  <div>
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '실제 소요 시간' : 'Actual Hours'}</p>
                    <p className="font-semibold text-gray-800">{selectedFix.actualHours}h</p>
                  </div>
                )}
                {selectedFix.relatedIssue && (
                  <div>
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '관련 이슈' : 'Related Issue'}</p>
                    <p className="font-semibold text-blue-600">{selectedFix.relatedIssue}</p>
                  </div>
                )}
              </div>

              {/* Affected Systems */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-semibold text-purple-800 mb-2">{locale === 'ko' ? '영향받는 시스템' : 'Affected Systems'}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFix.affectedSystems.map((system, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                      {system}
                    </span>
                  ))}
                </div>
              </div>

              {/* Testing Notes */}
              {selectedFix.testingNotes && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-800 mb-2">{locale === 'ko' ? '테스트 노트' : 'Testing Notes'}</p>
                  <p className="text-sm text-green-700">{selectedFix.testingNotes}</p>
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
