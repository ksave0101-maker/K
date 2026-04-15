'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  ArrowLeft,
  Briefcase,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Filter,
  Plus,
} from 'lucide-react';

interface ExecutiveOrder {
  id: string;
  title: string;
  description: string;
  issueDate: string;
  effectiveDate: string;
  issuedBy: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'pending';
  category: string;
  affectedDepartments: string[];
  progressUpdates?: ProgressUpdate[];
}

interface ProgressUpdate {
  id: string;
  date: string;
  updatedBy: string;
  status: string;
  description: string;
  completionPercentage: number;
}

export default function ExecutiveOrdersPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];

  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState({
    updatedBy: '',
    status: '',
    description: '',
    completionPercentage: 0,
  });

  // Sample executive orders data
  const executiveOrders: ExecutiveOrder[] = [
    {
      id: 'EO-2026-001',
      title: locale === 'ko' ? '2026년 상반기 목표 달성 전략' : '2026 H1 Goal Achievement Strategy',
      description: locale === 'ko' 
        ? '2026년 상반기 매출 목표 20% 증가를 위한 전사적 전략 실행 지침. 각 부서는 분기별 세부 실행 계획을 수립하고 월간 진척도를 보고해야 합니다.'
        : 'Company-wide strategic execution guidelines to achieve 20% H1 2026 revenue increase. Each department must establish quarterly execution plans and report monthly progress.',
      issueDate: '2026-01-05',
      effectiveDate: '2026-01-15',
      issuedBy: locale === 'ko' ? '김대표' : 'CEO Kim',
      priority: 'high',
      status: 'active',
      category: locale === 'ko' ? '전략' : 'Strategy',
      affectedDepartments: ['all'],
      progressUpdates: [
        {
          id: 'PU-001',
          date: '2026-01-20',
          updatedBy: locale === 'ko' ? '박부장' : 'Manager Park',
          status: locale === 'ko' ? '진행 중' : 'In Progress',
          description: locale === 'ko' ? '각 부서 실행 계획 수립 완료, 월간 보고 체계 구축' : 'Completed execution plans for each department, established monthly reporting system',
          completionPercentage: 25,
        },
        {
          id: 'PU-002',
          date: '2026-02-05',
          updatedBy: locale === 'ko' ? '최팀장' : 'Team Lead Choi',
          status: locale === 'ko' ? '진행 중' : 'In Progress',
          description: locale === 'ko' ? '1월 성과 분석 완료, 2월 마케팅 캠페인 시작' : 'January performance analysis completed, February marketing campaign initiated',
          completionPercentage: 40,
        },
      ],
    },
    {
      id: 'EO-2026-002',
      title: locale === 'ko' ? '신규 복리후생 제도 시행' : 'New Employee Benefits Implementation',
      description: locale === 'ko'
        ? '직원 만족도 향상을 위한 신규 복리후생 제도 시행. 건강검진 지원 확대, 유연근무제 도입, 자기계발비 지원 등이 포함됩니다.'
        : 'Implementation of new employee benefit programs to improve satisfaction. Includes expanded health check support, flexible work system, and self-development fund support.',
      issueDate: '2026-01-20',
      effectiveDate: '2026-02-01',
      issuedBy: locale === 'ko' ? '김대표' : 'CEO Kim',
      priority: 'medium',
      status: 'active',
      category: locale === 'ko' ? '인사' : 'HR',
      affectedDepartments: ['hr'],
    },
    {
      id: 'EO-2026-003',
      title: locale === 'ko' ? '생산 공정 효율화 프로젝트' : 'Production Process Efficiency Project',
      description: locale === 'ko'
        ? '생산 공정의 자동화 및 효율화를 통한 원가 절감 프로젝트 추진. 6개월 내 완료를 목표로 합니다.'
        : 'Cost reduction project through automation and efficiency of production processes. Target completion within 6 months.',
      issueDate: '2026-02-01',
      effectiveDate: '2026-02-15',
      issuedBy: locale === 'ko' ? '김대표' : 'CEO Kim',
      priority: 'high',
      status: 'active',
      category: locale === 'ko' ? '생산' : 'Production',
      affectedDepartments: ['production'],
    },
    {
      id: 'EO-2025-045',
      title: locale === 'ko' ? '해외 시장 확대 전략' : 'International Market Expansion Strategy',
      description: locale === 'ko'
        ? '동남아시아 시장 진출을 위한 전략적 파트너십 구축 및 현지화 전략 수립'
        : 'Establish strategic partnerships and localization strategies for Southeast Asian market entry',
      issueDate: '2025-12-10',
      effectiveDate: '2026-01-01',
      issuedBy: locale === 'ko' ? '김대표' : 'CEO Kim',
      priority: 'high',
      status: 'completed',
      category: locale === 'ko' ? '영업' : 'Sales',
      affectedDepartments: ['international'],
    },
    {
      id: 'EO-2026-004',
      title: locale === 'ko' ? '품질 관리 강화 지침' : 'Quality Control Enhancement Guidelines',
      description: locale === 'ko'
        ? '제품 품질 향상을 위한 QA/QC 프로세스 개선 및 검사 기준 강화'
        : 'QA/QC process improvement and inspection standard enhancement for product quality improvement',
      issueDate: '2026-02-10',
      effectiveDate: '2026-03-01',
      issuedBy: locale === 'ko' ? '김대표' : 'CEO Kim',
      priority: 'medium',
      status: 'pending',
      category: locale === 'ko' ? '품질' : 'Quality',
      affectedDepartments: ['quality'],
    },
  ];

  const priorities = [
    { id: 'all', name: locale === 'ko' ? '전체 우선순위' : 'All Priorities' },
    { id: 'high', name: locale === 'ko' ? '높음' : 'High' },
    { id: 'medium', name: locale === 'ko' ? '보통' : 'Medium' },
    { id: 'low', name: locale === 'ko' ? '낮음' : 'Low' },
  ];

  const statuses = [
    { id: 'all', name: locale === 'ko' ? '전체 상태' : 'All Status' },
    { id: 'active', name: locale === 'ko' ? '진행중' : 'Active' },
    { id: 'completed', name: locale === 'ko' ? '완료' : 'Completed' },
    { id: 'pending', name: locale === 'ko' ? '대기' : 'Pending' },
  ];

  const filteredOrders = executiveOrders.filter(order => {
    const matchesPriority = selectedPriority === 'all' || order.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesPriority && matchesStatus;
  });

  const selectedOrderData = selectedOrder
    ? executiveOrders.find(order => order.id === selectedOrder)
    : null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddProgress = () => {
    if (!newProgress.updatedBy || !newProgress.status || !newProgress.description) {
      alert(locale === 'ko' ? '모든 필드를 입력해주세요' : 'Please fill in all fields');
      return;
    }
    
    // In a real application, this would save to a database
    alert(locale === 'ko' ? '진행 상황이 업데이트되었습니다' : 'Progress has been updated');
    setShowProgressModal(false);
    setNewProgress({
      updatedBy: '',
      status: '',
      description: '',
      completionPercentage: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/hr/dashboard')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {t.executiveOrders}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t.executiveOrdersDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                {locale === 'ko' ? '우선순위' : 'Priority'}
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                {t.paymentStatus}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '전체 지시사항' : 'Total Orders'}</p>
                <p className="text-3xl font-bold text-blue-600">{executiveOrders.length}</p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '진행중' : 'Active'}</p>
                <p className="text-3xl font-bold text-green-600">
                  {executiveOrders.filter(o => o.status === 'active').length}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '높은 우선순위' : 'High Priority'}</p>
                <p className="text-3xl font-bold text-red-600">
                  {executiveOrders.filter(o => o.priority === 'high').length}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '이번 달' : 'This Month'}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {executiveOrders.filter(o => o.issueDate.startsWith('2026-02')).length}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Executive Message Box */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-xl p-6 mb-6 border-2 border-blue-400">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {locale === 'ko' ? '경영진 메시지' : 'Executive Message'}
              </h3>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20">
                <p className="text-white text-sm leading-relaxed mb-3">
                  {locale === 'ko' 
                    ? '인사부 여러분께,' 
                    : 'Dear HR'}
                </p>
                <p className="text-white text-base leading-relaxed mb-3">
                  {locale === 'ko'
                    ? '2026년 상반기를 맞이하여 우리 회사의 새로운 목표와 방향성을 공유하고자 합니다. 급변하는 시장 환경 속에서 우리는 혁신과 도전을 통해 지속 가능한 성장을 이루어야 합니다.'
                    : 'As we enter the first half of 2026, I would like to share our company\'s new goals and direction. In a rapidly changing market environment, we must achieve sustainable growth through innovation and challenge.'}
                </p>
                <p className="text-white text-base leading-relaxed mb-4">
                  {locale === 'ko'
                    ? '아래 제시된 경영 지시사항들은 모든 부서가 함께 협력하여 달성해야 할 핵심 과제들입니다. 각 부서장께서는 소속 팀원들과 충분히 공유하시고, 구체적인 실행 계획을 수립해 주시기 바랍니다.'
                    : 'The executive orders presented below are key tasks that all departments must work together to achieve. Department heads are requested to share thoroughly with team members and establish specific action plans.'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-white border-opacity-20">
                  <div className="text-white text-sm opacity-90">
                    <p className="font-semibold">{locale === 'ko' ? '대표이사' : 'CEO'}</p>
                    <p className="text-xs opacity-75">{locale === 'ko' ? '주식회사 제라' : 'K-Energy Co., Ltd. (Group of Zera)'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-white text-xs opacity-75">
                    <Calendar className="w-4 h-4" />
                    <span>2026.02.15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {locale === 'ko' ? '지시사항 목록' : 'Orders List'}
              </h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedOrder === order.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900 text-sm">{order.title}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{order.id}</span>
                      <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrderData ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="border-b pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-2xl font-bold text-gray-800">{selectedOrderData.title}</h2>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedOrderData.priority)}`}>
                          {selectedOrderData.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrderData.status)}`}>
                          {selectedOrderData.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">{selectedOrderData.id}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {selectedOrderData.issuedBy}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      {t.description}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedOrderData.description}</p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        {locale === 'ko' ? '발행일' : 'Issue Date'}
                      </div>
                      <div className="text-lg font-semibold text-gray-800">{selectedOrderData.issueDate}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        {locale === 'ko' ? '시행일' : 'Effective Date'}
                      </div>
                      <div className="text-lg font-semibold text-gray-800">{selectedOrderData.effectiveDate}</div>
                    </div>
                  </div>

                  {/* Category & Departments */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {locale === 'ko' ? '적용 부서' : 'Affected Departments'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium">
                        {selectedOrderData.category}
                      </span>
                      {selectedOrderData.affectedDepartments.map((dept, index) => (
                        <span key={index} className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg">
                          {dept === 'all' ? (locale === 'ko' ? '전체 부서' : 'All Departments') : dept}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Progress Updates Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-500" />
                        {locale === 'ko' ? '진행 상황 업데이트' : 'Progress Updates'}
                      </h3>
                      <button
                        onClick={() => setShowProgressModal(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {locale === 'ko' ? '업데이트 추가' : 'Add Update'}
                      </button>
                    </div>

                    {selectedOrderData.progressUpdates && selectedOrderData.progressUpdates.length > 0 ? (
                      <div className="space-y-4">
                        {selectedOrderData.progressUpdates.map((update) => (
                          <div key={update.id} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-l-4 border-green-500">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-700 font-bold text-sm">{update.completionPercentage}%</span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-800">{update.updatedBy}</span>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-sm text-gray-600">{update.date}</span>
                                  </div>
                                  <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                                    {update.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 mt-2 ml-15">{update.description}</p>
                            <div className="mt-3 ml-15">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${update.completionPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">
                          {locale === 'ko' ? '아직 진행 상황 업데이트가 없습니다' : 'No progress updates yet'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {locale === 'ko' ? '지시사항을 선택해주세요' : 'Please select an executive order'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Update Modal */}
        {showProgressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Plus className="w-6 h-6" />
                  {locale === 'ko' ? '진행 상황 업데이트 추가' : 'Add Progress Update'}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '업데이트 작성자' : 'Updated By'}
                  </label>
                  <input
                    type="text"
                    value={newProgress.updatedBy}
                    onChange={(e) => setNewProgress({ ...newProgress, updatedBy: e.target.value })}
                    placeholder={locale === 'ko' ? '이름을 입력하세요' : 'Enter name'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '상태' : 'Status'}
                  </label>
                  <input
                    type="text"
                    value={newProgress.status}
                    onChange={(e) => setNewProgress({ ...newProgress, status: e.target.value })}
                    placeholder={locale === 'ko' ? '예: 진행 중, 검토 중, 완료 등' : 'e.g., In Progress, Under Review, Completed'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '완료율 (%)' : 'Completion Percentage (%)'}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newProgress.completionPercentage}
                      onChange={(e) => setNewProgress({ ...newProgress, completionPercentage: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-green-600 w-16 text-center">
                      {newProgress.completionPercentage}%
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${newProgress.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '상세 설명' : 'Description'}
                  </label>
                  <textarea
                    value={newProgress.description}
                    onChange={(e) => setNewProgress({ ...newProgress, description: e.target.value })}
                    placeholder={locale === 'ko' ? '진행 상황에 대한 상세한 설명을 입력하세요' : 'Enter detailed description of the progress'}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 p-6 bg-gray-50 rounded-b-lg">
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    setNewProgress({
                      updatedBy: '',
                      status: '',
                      description: '',
                      completionPercentage: 0,
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleAddProgress}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {locale === 'ko' ? '업데이트 추가' : 'Add Update'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
