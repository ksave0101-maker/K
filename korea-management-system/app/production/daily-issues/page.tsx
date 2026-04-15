'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Issue {
  id: string;
  issueNumber: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: 'production' | 'quality' | 'equipment' | 'materials' | 'safety';
  reportedBy: string;
  reportedDate: string;
  assignedTo?: string;
  department: string;
  productionLine?: string;
  affectedOrders?: string[];
  resolution?: string;
  resolvedDate?: string;
}

export default function DailyIssuesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [issues] = useState<Issue[]>([
    {
      id: '1',
      issueNumber: 'ISS-2026-001',
      title: 'Microcontroller Component Shortage',
      description: 'Critical shortage of STM32F4 microcontrollers affecting Model A-2024 production line. Current inventory: 50 units, needed: 500 units.',
      severity: 'critical',
      status: 'open',
      category: 'materials',
      reportedBy: 'Kim Min-joon',
      reportedDate: '2026-02-15 08:30',
      department: 'Production',
      productionLine: 'Line A-1',
      affectedOrders: ['PO-2026-001', 'PO-2026-002', 'PO-2026-006']
    },
    {
      id: '2',
      issueNumber: 'ISS-2026-002',
      title: 'Assembly Line Conveyor Belt Malfunction',
      description: 'Main conveyor belt on Line B experiencing intermittent stops. Belt tension sensor showing irregular readings. Maintenance required immediately.',
      severity: 'high',
      status: 'in-progress',
      category: 'equipment',
      reportedBy: 'Park Ji-hun',
      reportedDate: '2026-02-15 10:15',
      assignedTo: 'Maintenance Team',
      department: 'Production',
      productionLine: 'Line B-2',
      affectedOrders: ['PO-2026-003', 'PO-2026-004']
    },
    {
      id: '3',
      issueNumber: 'ISS-2026-003',
      title: 'Quality Control Test Failure Rate Increase',
      description: 'LCD display units showing 12% failure rate during final QC testing (normal: 2%). Investigation into supplier batch quality required. Suspected moisture damage during shipping.',
      severity: 'high',
      status: 'open',
      category: 'quality',
      reportedBy: 'Lee Soo-jin',
      reportedDate: '2026-02-15 14:00',
      department: 'Quality Control',
      affectedOrders: ['PO-2026-005']
    }
  ]);

  const getSeverityInfo = (severity: string) => {
    const severities = {
      'critical': {
        label: locale === 'ko' ? '심각' : 'Critical',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '🔴'
      },
      'high': {
        label: locale === 'ko' ? '높음' : 'High',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: '🟠'
      },
      'medium': {
        label: locale === 'ko' ? '중간' : 'Medium',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '🟡'
      },
      'low': {
        label: locale === 'ko' ? '낮음' : 'Low',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '🟢'
      }
    };
    return severities[severity as keyof typeof severities] || severities.medium;
  };

  const getStatusInfo = (status: string) => {
    const statuses = {
      'open': {
        label: locale === 'ko' ? '접수됨' : 'Open',
        color: 'bg-red-100 text-red-800'
      },
      'in-progress': {
        label: locale === 'ko' ? '처리 중' : 'In Progress',
        color: 'bg-blue-100 text-blue-800'
      },
      'resolved': {
        label: locale === 'ko' ? '해결됨' : 'Resolved',
        color: 'bg-green-100 text-green-800'
      },
      'closed': {
        label: locale === 'ko' ? '종료됨' : 'Closed',
        color: 'bg-gray-100 text-gray-800'
      }
    };
    return statuses[status as keyof typeof statuses] || statuses.open;
  };

  const getCategoryInfo = (category: string) => {
    const categories = {
      'production': {
        label: locale === 'ko' ? '생산' : 'Production',
        icon: '🏭'
      },
      'quality': {
        label: locale === 'ko' ? '품질' : 'Quality',
        icon: '✅'
      },
      'equipment': {
        label: locale === 'ko' ? '설비' : 'Equipment',
        icon: '⚙️'
      },
      'materials': {
        label: locale === 'ko' ? '자재' : 'Materials',
        icon: '📦'
      },
      'safety': {
        label: locale === 'ko' ? '안전' : 'Safety',
        icon: '🛡️'
      }
    };
    return categories[category as keyof typeof categories] || categories.production;
  };

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
  };

  const openReportModal = () => {
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  const handleResolveIssue = () => {
    if (selectedIssue) {
      alert(
        locale === 'ko'
          ? `${selectedIssue.issueNumber} 문제가 해결되었습니다!`
          : `Issue ${selectedIssue.issueNumber} has been resolved!`
      );
      closeModal();
    }
  };

  const handleSubmitReport = () => {
    alert(
      locale === 'ko'
        ? '새로운 이슈가 보고되었습니다!'
        : 'New issue has been reported!'
    );
    closeReportModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/production/dashboard')}
              className="text-red-600 hover:text-red-800"
            >
              ← {t.back}
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                {locale === 'ko' ? '일일 이슈 리포트' : 'Daily Issue Report'}
              </h1>
              <p className="text-gray-600 mt-1">
                {locale === 'ko' ? '생산 중 발생한 문제 추적 및 해결' : 'Track and resolve production issues'}
              </p>
            </div>
            <button
              onClick={openReportModal}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg"
            >
              {locale === 'ko' ? '+ 이슈 보고' : '+ Report Issue'}
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '전체 이슈' : 'Total Issues'}</p>
            <p className="text-2xl font-bold text-red-600">{issues.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '심각' : 'Critical'}</p>
            <p className="text-2xl font-bold text-red-600">
              {issues.filter(i => i.severity === 'critical').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '접수됨' : 'Open'}</p>
            <p className="text-2xl font-bold text-orange-600">
              {issues.filter(i => i.status === 'open').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '처리 중' : 'In Progress'}</p>
            <p className="text-2xl font-bold text-blue-600">
              {issues.filter(i => i.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600">{locale === 'ko' ? '해결됨' : 'Resolved'}</p>
            <p className="text-2xl font-bold text-green-600">
              {issues.filter(i => i.status === 'resolved').length}
            </p>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {issues.map((issue) => {
            const severityInfo = getSeverityInfo(issue.severity);
            const statusInfo = getStatusInfo(issue.status);
            const categoryInfo = getCategoryInfo(issue.category);
            
            return (
              <div
                key={issue.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden border-l-4 ${severityInfo.color.split(' ')[0].replace('bg-', 'border-')}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-gray-500">{issue.issueNumber}</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${severityInfo.color}`}>
                          <span>{severityInfo.icon}</span>
                          <span>{severityInfo.label}</span>
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          <span>{categoryInfo.icon}</span>
                          <span>{categoryInfo.label}</span>
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{issue.title}</h3>
                      <p className="text-gray-600 mb-4">{issue.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">{locale === 'ko' ? '보고자' : 'Reported By'}</p>
                          <p className="font-semibold text-gray-900">{issue.reportedBy}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">{locale === 'ko' ? '부서' : 'Department'}</p>
                          <p className="font-semibold text-gray-900">{issue.department}</p>
                        </div>
                        {issue.productionLine && (
                          <div>
                            <p className="text-gray-500">{locale === 'ko' ? '생산 라인' : 'Production Line'}</p>
                            <p className="font-semibold text-gray-900">{issue.productionLine}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500">{locale === 'ko' ? '보고 시간' : 'Reported Date'}</p>
                          <p className="font-semibold text-gray-900">{issue.reportedDate}</p>
                        </div>
                      </div>

                      {issue.affectedOrders && issue.affectedOrders.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm font-semibold text-yellow-800 mb-1">
                            {locale === 'ko' ? '영향받는 주문:' : 'Affected Orders:'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {issue.affectedOrders.map((order) => (
                              <span key={order} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                {order}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {issue.assignedTo && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">{locale === 'ko' ? '담당자:' : 'Assigned To:'}</span> {issue.assignedTo}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewDetails(issue)}
                      className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg text-sm whitespace-nowrap"
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

      {/* Issue Details Modal */}
      {isModalOpen && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`sticky top-0 bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 flex items-center justify-between border-b-4 ${getSeverityInfo(selectedIssue.severity).color.split(' ')[0].replace('bg-', 'border-')}`}>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedIssue.issueNumber}</h2>
                <p className="text-red-100 text-sm">{selectedIssue.title}</p>
              </div>
              <button onClick={closeModal} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Severity & Status */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getSeverityInfo(selectedIssue.severity).color}`}>
                  <span className="text-xl">{getSeverityInfo(selectedIssue.severity).icon}</span>
                  <span>{getSeverityInfo(selectedIssue.severity).label}</span>
                </span>
                <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusInfo(selectedIssue.status).color}`}>
                  {getStatusInfo(selectedIssue.status).label}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg">
                  <span className="text-lg">{getCategoryInfo(selectedIssue.category).icon}</span>
                  <span>{getCategoryInfo(selectedIssue.category).label}</span>
                </span>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-2">{locale === 'ko' ? '문제 설명' : 'Description'}</h3>
                <p className="text-gray-700">{selectedIssue.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '보고자' : 'Reported By'}</p>
                  <p className="font-semibold text-gray-800">{selectedIssue.reportedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '부서' : 'Department'}</p>
                  <p className="font-semibold text-gray-800">{selectedIssue.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{locale === 'ko' ? '보고 시간' : 'Reported Date'}</p>
                  <p className="font-semibold text-gray-800">{selectedIssue.reportedDate}</p>
                </div>
                {selectedIssue.productionLine && (
                  <div>
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '생산 라인' : 'Production Line'}</p>
                    <p className="font-semibold text-gray-800">{selectedIssue.productionLine}</p>
                  </div>
                )}
                {selectedIssue.assignedTo && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '담당자' : 'Assigned To'}</p>
                    <p className="font-semibold text-gray-800">{selectedIssue.assignedTo}</p>
                  </div>
                )}
              </div>

              {/* Affected Orders */}
              {selectedIssue.affectedOrders && selectedIssue.affectedOrders.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-800 mb-2">{locale === 'ko' ? '영향받는 주문' : 'Affected Orders'}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedIssue.affectedOrders.map((order) => (
                      <span key={order} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                        {order}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg">
                  {t.close}
                </button>
                <button onClick={handleResolveIssue} className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg">
                  {locale === 'ko' ? '해결 완료' : 'Mark Resolved'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {locale === 'ko' ? '새 이슈 보고' : 'Report New Issue'}
              </h2>
              <button onClick={closeReportModal} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ko' ? '제목' : 'Title'}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder={locale === 'ko' ? '문제 제목 입력' : 'Enter issue title'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ko' ? '설명' : 'Description'}
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder={locale === 'ko' ? '문제 상세 설명' : 'Detailed description'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '카테고리' : 'Category'}
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                    <option value="production">{locale === 'ko' ? '생산' : 'Production'}</option>
                    <option value="quality">{locale === 'ko' ? '품질' : 'Quality'}</option>
                    <option value="equipment">{locale === 'ko' ? '설비' : 'Equipment'}</option>
                    <option value="materials">{locale === 'ko' ? '자재' : 'Materials'}</option>
                    <option value="safety">{locale === 'ko' ? '안전' : 'Safety'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '심각도' : 'Severity'}
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                    <option value="critical">{locale === 'ko' ? '심각' : 'Critical'}</option>
                    <option value="high">{locale === 'ko' ? '높음' : 'High'}</option>
                    <option value="medium">{locale === 'ko' ? '중간' : 'Medium'}</option>
                    <option value="low">{locale === 'ko' ? '낮음' : 'Low'}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={closeReportModal} className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg">
                  {locale === 'ko' ? '취소' : 'Cancel'}
                </button>
                <button onClick={handleSubmitReport} className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg">
                  {locale === 'ko' ? '보고하기' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
