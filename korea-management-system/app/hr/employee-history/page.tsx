'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  ArrowLeft,
  History,
  Search,
  User,
  Calendar,
  Award,
  TrendingUp,
  FileText,
  GraduationCap,
  Lightbulb,
  Plus,
  X,
  CheckCircle,
} from 'lucide-react';

interface EmployeeHistoryRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  joinDate: string;
  promotions: Array<{ date: string; from: string; to: string }>;
  evaluations: Array<{ date: string; score: number; grade: string }>;
  trainings: Array<{ date: string; course: string; status: string }>;
  achievements: Array<{ date: string; description: string }>;
  // New fields
  skills: string[];
  education: Array<{ 
    degree: string; 
    institution: string; 
    year: string; 
    major?: string;
    gpa?: string;
  }>;
  selfDevelopment: Array<{ 
    date: string; 
    activity: string; 
    description: string; 
    status: 'completed' | 'in-progress' | 'planned';
  }>;
}

export default function EmployeeHistoryPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  
  // Development Modal State
  const [showDevelopmentModal, setShowDevelopmentModal] = useState(false);
  const [newDevelopment, setNewDevelopment] = useState({
    date: new Date().toISOString().split('T')[0],
    activity: '',
    description: '',
    status: 'in-progress' as 'completed' | 'in-progress' | 'planned',
  });

  // Skills Modal State
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Education Modal State
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    year: '',
    major: '',
    gpa: '',
  });

  // Sample employee history data
  const employeeHistory: EmployeeHistoryRecord[] = [
    {
      employeeId: 'EMP001',
      employeeName: locale === 'ko' ? '김민수' : 'Kim Min-su',
      department: 'hr',
      position: locale === 'ko' ? '부서장' : 'Department Head',
      joinDate: '2020-03-15',
      promotions: [
        { date: '2023-01-01', from: locale === 'ko' ? '과장' : 'Manager', to: locale === 'ko' ? '부서장' : 'Department Head' },
        { date: '2021-06-01', from: locale === 'ko' ? '대리' : 'Assistant Manager', to: locale === 'ko' ? '과장' : 'Manager' },
      ],
      evaluations: [
        { date: '2025-12', score: 95, grade: 'A+' },
        { date: '2025-06', score: 92, grade: 'A' },
        { date: '2024-12', score: 90, grade: 'A' },
      ],
      trainings: [
        { date: '2025-10', course: locale === 'ko' ? '리더십 교육' : 'Leadership Training', status: 'completed' },
        { date: '2025-05', course: locale === 'ko' ? 'HR 관리 실무' : 'HR Management Practice', status: 'completed' },
      ],
      achievements: [
        { date: '2025-12', description: locale === 'ko' ? '우수 직원상 수상' : 'Excellence Award' },
        { date: '2024-08', description: locale === 'ko' ? '프로젝트 성공적 완료' : 'Successful Project Completion' },
      ],
      skills: [
        locale === 'ko' ? '인사 관리' : 'HR Management',
        locale === 'ko' ? '리더십' : 'Leadership',
        locale === 'ko' ? '조직 개발' : 'Organization Development',
        locale === 'ko' ? '노무 관리' : 'Labor Relations',
        locale === 'ko' ? '급여 관리' : 'Payroll Management',
      ],
      education: [
        {
          degree: locale === 'ko' ? '경영학 석사' : 'Master of Business Administration',
          institution: locale === 'ko' ? '서울대학교' : 'Seoul National University',
          year: '2019',
          major: locale === 'ko' ? '인적자원관리' : 'Human Resource Management',
          gpa: '4.0/4.5',
        },
        {
          degree: locale === 'ko' ? '경영학 학사' : 'Bachelor of Business Administration',
          institution: locale === 'ko' ? '고려대학교' : 'Korea University',
          year: '2017',
          major: locale === 'ko' ? '경영학' : 'Business Administration',
          gpa: '3.8/4.5',
        },
      ],
      selfDevelopment: [
        {
          date: '2026-02',
          activity: locale === 'ko' ? 'AI 인사 시스템 교육' : 'AI HR System Training',
          description: locale === 'ko' ? '최신 AI 기술을 활용한 인사관리 시스템 학습' : 'Learning modern AI-based HR management systems',
          status: 'in-progress' as const,
        },
        {
          date: '2025-11',
          activity: locale === 'ko' ? '리더십 코칭 자격증' : 'Leadership Coaching Certificate',
          description: locale === 'ko' ? 'ICF 공인 리더십 코치 자격증 취득' : 'Obtained ICF certified leadership coach certificate',
          status: 'completed' as const,
        },
        {
          date: '2025-09',
          activity: locale === 'ko' ? 'MBA 특강 수료' : 'MBA Special Lecture Completion',
          description: locale === 'ko' ? '전략적 인사관리 과정 수료' : 'Completed Strategic HR Management course',
          status: 'completed' as const,
        },
      ],
    },
    {
      employeeId: 'EMP002',
      employeeName: locale === 'ko' ? '이수진' : 'Lee Su-jin',
      department: 'hr',
      position: locale === 'ko' ? '회계 담당' : 'Accountant',
      joinDate: '2021-06-20',
      promotions: [
        { date: '2024-01-01', from: locale === 'ko' ? '사원' : 'Staff', to: locale === 'ko' ? '대리' : 'Assistant Manager' },
      ],
      evaluations: [
        { date: '2025-12', score: 88, grade: 'B+' },
        { date: '2025-06', score: 85, grade: 'B+' },
      ],
      trainings: [
        { date: '2025-09', course: locale === 'ko' ? '회계 실무 심화' : 'Advanced Accounting', status: 'completed' },
      ],
      achievements: [
        { date: '2025-11', description: locale === 'ko' ? '비용 절감 제안 채택' : 'Cost Reduction Proposal Accepted' },
      ],
      skills: [
        locale === 'ko' ? '재무 회계' : 'Financial Accounting',
        locale === 'ko' ? '세무 관리' : 'Tax Management',
        locale === 'ko' ? '예산 분석' : 'Budget Analysis',
        locale === 'ko' ? 'Excel 고급' : 'Advanced Excel',
      ],
      education: [
        {
          degree: locale === 'ko' ? '회계학 학사' : 'Bachelor of Accounting',
          institution: locale === 'ko' ? '연세대학교' : 'Yonsei University',
          year: '2021',
          major: locale === 'ko' ? '회계학' : 'Accounting',
          gpa: '3.9/4.5',
        },
      ],
      selfDevelopment: [
        {
          date: '2026-01',
          activity: locale === 'ko' ? 'CPA 시험 준비' : 'CPA Exam Preparation',
          description: locale === 'ko' ? '공인회계사 시험 준비중' : 'Preparing for Certified Public Accountant exam',
          status: 'in-progress' as const,
        },
        {
          date: '2025-10',
          activity: locale === 'ko' ? '세무사 1차 합격' : 'Tax Accountant Exam (1st Stage) Pass',
          description: locale === 'ko' ? '세무사 1차 시험 합격' : 'Passed the first stage of tax accountant exam',
          status: 'completed' as const,
        },
      ],
    },
    {
      employeeId: 'EMP003',
      employeeName: locale === 'ko' ? '박지훈' : 'Park Ji-hoon',
      department: 'production',
      position: locale === 'ko' ? '엔지니어' : 'Engineer',
      joinDate: '2019-11-10',
      promotions: [
        { date: '2023-11-01', from: locale === 'ko' ? '주임' : 'Senior Staff', to: locale === 'ko' ? '대리' : 'Assistant Manager' },
        { date: '2021-11-01', from: locale === 'ko' ? '사원' : 'Staff', to: locale === 'ko' ? '주임' : 'Senior Staff' },
      ],
      evaluations: [
        { date: '2025-12', score: 93, grade: 'A' },
        { date: '2025-06', score: 91, grade: 'A' },
      ],
      trainings: [
        { date: '2025-08', course: locale === 'ko' ? '신기술 교육' : 'New Technology Training', status: 'completed' },
        { date: '2025-03', course: locale === 'ko' ? '안전 교육' : 'Safety Training', status: 'completed' },
      ],
      achievements: [
        { date: '2025-10', description: locale === 'ko' ? '생산 효율 개선' : 'Production Efficiency Improvement' },
        { date: '2024-05', description: locale === 'ko' ? '기술 혁신상' : 'Technical Innovation Award' },
      ],
      skills: [
        locale === 'ko' ? '생산 공정 최적화' : 'Production Process Optimization',
        locale === 'ko' ? '품질 관리' : 'Quality Control',
        locale === 'ko' ? 'AutoCAD' : 'AutoCAD',
        locale === 'ko' ? 'Python 프로그래밍' : 'Python Programming',
        locale === 'ko' ? '프로젝트 관리' : 'Project Management',
      ],
      education: [
        {
          degree: locale === 'ko' ? '기계공학 석사' : 'Master of Mechanical Engineering',
          institution: locale === 'ko' ? '한양대학교' : 'Hanyang University',
          year: '2022',
          major: locale === 'ko' ? '생산 자동화' : 'Production Automation',
          gpa: '4.2/4.5',
        },
        {
          degree: locale === 'ko' ? '기계공학 학사' : 'Bachelor of Mechanical Engineering',
          institution: locale === 'ko' ? 'KAIST' : 'KAIST',
          year: '2019',
          major: locale === 'ko' ? '기계공학' : 'Mechanical Engineering',
          gpa: '4.0/4.5',
        },
      ],
      selfDevelopment: [
        {
          date: '2026-02',
          activity: locale === 'ko' ? '스마트팩토리 과정' : 'Smart Factory Course',
          description: locale === 'ko' ? 'IoT 기반 스마트 공장 시스템 구축 과정' : 'IoT-based smart factory system implementation course',
          status: 'planned' as const,
        },
        {
          date: '2025-12',
          activity: locale === 'ko' ? 'PMP 자격증' : 'PMP Certification',
          description: locale === 'ko' ? 'Project Management Professional 자격증 취득' : 'Obtained Project Management Professional certification',
          status: 'completed' as const,
        },
        {
          date: '2025-08',
          activity: locale === 'ko' ? 'Six Sigma Black Belt' : 'Six Sigma Black Belt',
          description: locale === 'ko' ? 'Six Sigma 블랙벨트 자격증 취득' : 'Obtained Six Sigma Black Belt certification',
          status: 'completed' as const,
        },
      ],
    },
  ];

  const filteredEmployees = employeeHistory.filter(employee => 
    employee.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEmployeeData = selectedEmployee 
    ? employeeHistory.find(emp => emp.employeeId === selectedEmployee)
    : null;

  const handleAddDevelopment = () => {
    if (newDevelopment.activity && newDevelopment.description && selectedEmployee) {
      // In a real app, this would send to backend
      console.log('Adding self-development record:', newDevelopment);
      // Reset form
      setNewDevelopment({
        date: new Date().toISOString().split('T')[0],
        activity: '',
        description: '',
        status: 'in-progress',
      });
      setShowDevelopmentModal(false);
      // Show success message (in real app)
      alert(locale === 'ko' ? '자기계발 기록이 추가되었습니다!' : 'Self-development record added successfully!');
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && selectedEmployee) {
      console.log('Adding skill:', newSkill);
      setNewSkill('');
      setShowSkillsModal(false);
      alert(locale === 'ko' ? '역량이 추가되었습니다!' : 'Skill added successfully!');
    }
  };

  const handleDeleteSkill = (skill: string) => {
    if (confirm(locale === 'ko' ? `"${skill}"을(를) 삭제하시겠습니까?` : `Delete "${skill}"?`)) {
      console.log('Deleting skill:', skill);
      alert(locale === 'ko' ? '역량이 삭제되었습니다!' : 'Skill deleted successfully!');
    }
  };

  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.institution && newEducation.year && selectedEmployee) {
      console.log('Adding education:', newEducation);
      setNewEducation({
        degree: '',
        institution: '',
        year: '',
        major: '',
        gpa: '',
      });
      setShowEducationModal(false);
      alert(locale === 'ko' ? '학력이 추가되었습니다!' : 'Education record added successfully!');
    }
  };

  const handleDeleteEducation = (degree: string, institution: string) => {
    if (confirm(locale === 'ko' ? `${degree} (${institution})을(를) 삭제하시겠습니까?` : `Delete ${degree} (${institution})?`)) {
      console.log('Deleting education:', degree, institution);
      alert(locale === 'ko' ? '학력이 삭제되었습니다!' : 'Education record deleted successfully!');
    }
  };

  const handleDeleteDevelopment = (activity: string) => {
    if (confirm(locale === 'ko' ? `"${activity}"을(를) 삭제하시겠습니까?` : `Delete "${activity}"?`)) {
      console.log('Deleting development:', activity);
      alert(locale === 'ko' ? '자기계발 기록이 삭제되었습니다!' : 'Self-development record deleted successfully!');
    }
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
                  <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center">
                    <History className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {t.employeeHistory}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t.employeeHistoryDesc}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-2" />
                  {locale === 'ko' ? '직원 검색' : 'Search Employee'}
                </label>
                <input
                  type="text"
                  placeholder={locale === 'ko' ? '이름 또는 ID 검색...' : 'Search by name or ID...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredEmployees.map((employee) => (
                  <button
                    key={employee.employeeId}
                    onClick={() => setSelectedEmployee(employee.employeeId)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedEmployee === employee.employeeId
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{employee.employeeName}</div>
                        <div className="text-xs text-gray-500">{employee.employeeId}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Employee Details */}
          <div className="lg:col-span-2">
            {selectedEmployeeData ? (
              <div className="space-y-6">
                {/* Employee Info */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-800">{selectedEmployeeData.employeeName}</h2>
                      <p className="text-gray-600">{selectedEmployeeData.position}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{selectedEmployeeData.employeeId}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {locale === 'ko' ? '입사일' : 'Joined'}: {selectedEmployeeData.joinDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promotions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    {locale === 'ko' ? '승진 이력' : 'Promotion History'}
                  </h3>
                  <div className="space-y-3">
                    {selectedEmployeeData.promotions.map((promotion, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {promotion.from} → {promotion.to}
                          </div>
                          <div className="text-xs text-gray-500">{promotion.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evaluations */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    {locale === 'ko' ? '평가 기록' : 'Evaluation Records'}
                  </h3>
                  <div className="space-y-3">
                    {selectedEmployeeData.evaluations.map((evaluation, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-yellow-500" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{evaluation.date}</div>
                            <div className="text-xs text-gray-500">{locale === 'ko' ? '등급' : 'Grade'}: {evaluation.grade}</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">{evaluation.score}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trainings */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    {locale === 'ko' ? '교육 이력' : 'Training History'}
                  </h3>
                  <div className="space-y-3">
                    {selectedEmployeeData.trainings.map((training, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{training.course}</div>
                          <div className="text-xs text-gray-500">{training.date}</div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {training.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    {t.achievements}
                  </h3>
                  <div className="space-y-3">
                    {selectedEmployeeData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <Award className="w-5 h-5 text-purple-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{achievement.description}</div>
                          <div className="text-xs text-gray-500">{achievement.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-orange-500" />
                      {locale === 'ko' ? '보유 역량' : 'Skills & Capabilities'}
                    </h3>
                    <button
                      onClick={() => setShowSkillsModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      {locale === 'ko' ? '추가' : 'Add'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployeeData.skills.map((skill, index) => (
                      <div 
                        key={index} 
                        className="group relative px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => handleDeleteSkill(skill)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-orange-600 hover:text-orange-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-500" />
                      {locale === 'ko' ? '학력 사항' : 'Education'}
                    </h3>
                    <button
                      onClick={() => setShowEducationModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      {locale === 'ko' ? '추가' : 'Add'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {selectedEmployeeData.education.map((edu, index) => (
                      <div key={index} className="group relative p-4 bg-indigo-50 rounded-lg border border-indigo-100 hover:border-indigo-300 transition-colors">
                        <button
                          onClick={() => handleDeleteEducation(edu.degree, edu.institution)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 bg-white rounded-full p-1.5 shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-start gap-3">
                          <GraduationCap className="w-6 h-6 text-indigo-500 mt-1" />
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 text-base">{edu.degree}</div>
                            <div className="text-sm text-gray-700 mt-1">{edu.institution}</div>
                            {edu.major && (
                              <div className="text-sm text-gray-600 mt-1">
                                {locale === 'ko' ? '전공' : 'Major'}: {edu.major}
                              </div>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {edu.year}
                              </span>
                              {edu.gpa && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                                  GPA: {edu.gpa}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Self-Development */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-teal-500" />
                      {locale === 'ko' ? '자기계발 이력' : 'Self-Development'}
                    </h3>
                    <button
                      onClick={() => setShowDevelopmentModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      {locale === 'ko' ? '추가' : 'Add'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedEmployeeData.selfDevelopment.map((dev, index) => (
                      <div key={index} className="group relative p-4 bg-teal-50 rounded-lg border border-teal-100 hover:border-teal-300 transition-colors">
                        <button
                          onClick={() => handleDeleteDevelopment(dev.activity)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 bg-white rounded-full p-1.5 shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            dev.status === 'completed' ? 'bg-green-100' :
                            dev.status === 'in-progress' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            {dev.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {dev.status === 'in-progress' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                            {dev.status === 'planned' && <Calendar className="w-5 h-5 text-gray-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-semibold text-gray-900">{dev.activity}</div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                dev.status === 'completed' ? 'bg-green-100 text-green-700' :
                                dev.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {dev.status === 'completed' ? (locale === 'ko' ? '완료' : 'Completed') :
                                 dev.status === 'in-progress' ? (locale === 'ko' ? '진행중' : 'In Progress') :
                                 (locale === 'ko' ? '예정' : 'Planned')}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{dev.description}</div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {dev.date}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {locale === 'ko' ? '직원을 선택해주세요' : 'Please select an employee'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-orange-500" />
                  {locale === 'ko' ? '역량 추가' : 'Add Skill'}
                </h2>
                <button
                  onClick={() => setShowSkillsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '역량명' : 'Skill Name'} *
                  </label>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder={locale === 'ko' ? '예: Python 프로그래밍, 리더십 등' : 'e.g., Python Programming, Leadership, etc.'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowSkillsModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {locale === 'ko' ? '취소' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {locale === 'ko' ? '추가하기' : 'Add Skill'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Education Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-indigo-500" />
                  {locale === 'ko' ? '학력 추가' : 'Add Education'}
                </h2>
                <button
                  onClick={() => setShowEducationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Degree */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '학위' : 'Degree'} *
                  </label>
                  <input
                    type="text"
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                    placeholder={locale === 'ko' ? '예: 경영학 학사, 공학 석사 등' : 'e.g., Bachelor of Science, Master of Engineering'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '학교명' : 'Institution'} *
                  </label>
                  <input
                    type="text"
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                    placeholder={locale === 'ko' ? '예: 서울대학교' : 'e.g., Seoul National University'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '졸업년도' : 'Graduation Year'} *
                  </label>
                  <input
                    type="text"
                    value={newEducation.year}
                    onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                    placeholder={locale === 'ko' ? '예: 2020' : 'e.g., 2020'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Major */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '전공' : 'Major'}
                  </label>
                  <input
                    type="text"
                    value={newEducation.major}
                    onChange={(e) => setNewEducation({ ...newEducation, major: e.target.value })}
                    placeholder={locale === 'ko' ? '예: 컴퓨터공학' : 'e.g., Computer Science'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* GPA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '학점' : 'GPA'}
                  </label>
                  <input
                    type="text"
                    value={newEducation.gpa}
                    onChange={(e) => setNewEducation({ ...newEducation, gpa: e.target.value })}
                    placeholder={locale === 'ko' ? '예: 3.8/4.5' : 'e.g., 3.8/4.0'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowEducationModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {locale === 'ko' ? '취소' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddEducation}
                  disabled={!newEducation.degree || !newEducation.institution || !newEducation.year}
                  className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {locale === 'ko' ? '추가하기' : 'Add Education'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Self-Development Modal */}
      {showDevelopmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-teal-500" />
                  {locale === 'ko' ? '자기계발 기록 추가' : 'Add Self-Development Record'}
                </h2>
                <button
                  onClick={() => setShowDevelopmentModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '날짜' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={newDevelopment.date}
                    onChange={(e) => setNewDevelopment({ ...newDevelopment, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Activity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '활동명' : 'Activity Name'} *
                  </label>
                  <input
                    type="text"
                    value={newDevelopment.activity}
                    onChange={(e) => setNewDevelopment({ ...newDevelopment, activity: e.target.value })}
                    placeholder={locale === 'ko' ? '예: MBA 과정, 자격증 취득 등' : 'e.g., MBA Course, Certification, etc.'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '상세 설명' : 'Description'} *
                  </label>
                  <textarea
                    value={newDevelopment.description}
                    onChange={(e) => setNewDevelopment({ ...newDevelopment, description: e.target.value })}
                    placeholder={locale === 'ko' ? '자기계발 활동에 대한 상세 설명을 입력하세요...' : 'Enter detailed description of the activity...'}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ko' ? '상태' : 'Status'}
                  </label>
                  <select
                    value={newDevelopment.status}
                    onChange={(e) => setNewDevelopment({ ...newDevelopment, status: e.target.value as 'completed' | 'in-progress' | 'planned' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="planned">{locale === 'ko' ? '예정' : 'Planned'}</option>
                    <option value="in-progress">{locale === 'ko' ? '진행중' : 'In Progress'}</option>
                    <option value="completed">{locale === 'ko' ? '완료' : 'Completed'}</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowDevelopmentModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {locale === 'ko' ? '취소' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddDevelopment}
                  disabled={!newDevelopment.activity || !newDevelopment.description}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {locale === 'ko' ? '추가하기' : 'Add Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
