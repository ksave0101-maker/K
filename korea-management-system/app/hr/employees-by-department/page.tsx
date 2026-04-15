'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  ArrowLeft,
  Users,
  Search,
  Building2,
  Mail,
  Phone,
  Plus,
  X,
  Upload,
  FileText,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  department: string;
  joinDate: string;
  documents?: string[]; // Array of base64 encoded files
}

export default function EmployeesByDepartmentPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];

  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewDocumentModal, setViewDocumentModal] = useState<{ isOpen: boolean; documents?: string[]; employeeName?: string; currentIndex?: number }>({ isOpen: false });
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    department: 'hr',
    joinDate: '2026-02-15',
    documents: [] as string[],
  });

  const departments = [
    { id: 'all', name: locale === 'ko' ? '전체 부서' : 'All Departments' },
    { id: 'executive', name: t.executiveDepartment },
    { id: 'hr', name: t.hrDepartment },
    { id: 'production', name: t.productionDepartment },
    { id: 'international', name: t.internationalMarketDepartment },
    { id: 'domestic', name: t.domesticMarketDepartment },
    { id: 'quality', name: t.qualityControlDepartment },
    { id: 'aftersales', name: t.afterSalesServiceDepartment },
    { id: 'maintenance', name: t.maintenanceDepartment },
    { id: 'rd', name: t.researchDevelopmentDepartment },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewEmployee(prev => ({
            ...prev,
            documents: [...prev.documents, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input to allow same file upload again
    e.target.value = '';
  };

  const handleRemoveDocument = (index: number) => {
    setNewEmployee(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleCreate = () => {
    const newId = `EMP${String(employeesList.length + initialEmployees.length + 1).padStart(3, '0')}`;
    const employeeToAdd: Employee = {
      id: newId,
      name: newEmployee.name,
      position: newEmployee.position,
      email: newEmployee.email,
      phone: newEmployee.phone,
      department: newEmployee.department,
      joinDate: newEmployee.joinDate,
      documents: newEmployee.documents.length > 0 ? newEmployee.documents : undefined,
    };
    setEmployeesList([...employeesList, employeeToAdd]);
    setNewEmployee({ name: '', position: '', email: '', phone: '', department: 'hr', joinDate: '2026-02-15', documents: [] });
    setIsAddModalOpen(false);
  };

  // Sample employee data
  const initialEmployees: Employee[] = [
    {
      id: 'EMP001',
      name: locale === 'ko' ? '김민수' : 'Kim Min-su',
      position: locale === 'ko' ? '부서장' : 'Department Head',
      email: 'minsu.kim@kenergy.com',
      phone: '+82-10-1234-5678',
      department: 'hr',
      joinDate: '2020-03-15',
    },
    {
      id: 'EMP002',
      name: locale === 'ko' ? '이수진' : 'Lee Su-jin',
      position: locale === 'ko' ? '회계 담당' : 'Accountant',
      email: 'sujin.lee@kenergy.com',
      phone: '+82-10-2345-6789',
      department: 'hr',
      joinDate: '2021-06-20',
    },
    {
      id: 'EMP003',
      name: locale === 'ko' ? '박지훈' : 'Park Ji-hoon',
      position: locale === 'ko' ? '엔지니어' : 'Engineer',
      email: 'jihoon.park@kenergy.com',
      phone: '+82-10-3456-7890',
      department: 'production',
      joinDate: '2019-11-10',
    },
    {
      id: 'EMP004',
      name: locale === 'ko' ? '최영희' : 'Choi Young-hee',
      position: locale === 'ko' ? '품질 검사원' : 'Quality Inspector',
      email: 'younghee.choi@kenergy.com',
      phone: '+82-10-4567-8901',
      department: 'quality',
      joinDate: '2022-01-05',
    },
    {
      id: 'EMP005',
      name: locale === 'ko' ? '정태영' : 'Jung Tae-young',
      position: locale === 'ko' ? '연구원' : 'Researcher',
      email: 'taeyoung.jung@kenergy.com',
      phone: '+82-10-5678-9012',
      department: 'rd',
      joinDate: '2020-08-18',
    },
  ];

  const employees = [...initialEmployees, ...employeesList];

  const filteredEmployees = employees.filter(employee => {
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const getDepartmentName = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : deptId;
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
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {t.employeesByDepartment}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t.employeesByDepartmentDesc}
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
        {/* Add Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            {locale === 'ko' ? '새 직원 추가' : 'Add New Employee'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                {t.department}
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                {t.filter}
              </label>
              <input
                type="text"
                placeholder={locale === 'ko' ? '이름, ID, 직책 검색...' : 'Search by name, ID, position...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalEmployees}</p>
                <p className="text-3xl font-bold text-blue-600">{filteredEmployees.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '선택된 부서' : 'Selected Department'}</p>
                <p className="text-lg font-bold text-indigo-600">{getDepartmentName(selectedDepartment)}</p>
              </div>
              <Building2 className="w-12 h-12 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '검색 결과' : 'Search Results'}</p>
                <p className="text-3xl font-bold text-green-600">{filteredEmployees.length}</p>
              </div>
              <Search className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {locale === 'ko' ? '직원 ID' : 'Employee ID'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {locale === 'ko' ? '이름' : 'Name'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {t.position}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {t.department}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {locale === 'ko' ? '이메일' : 'Email'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {locale === 'ko' ? '전화번호' : 'Phone'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {locale === 'ko' ? '입사일' : 'Join Date'}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    {locale === 'ko' ? '서류' : 'Documents'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee, index) => (
                    <tr
                      key={employee.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {employee.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {getDepartmentName(employee.department)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {employee.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {employee.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.joinDate}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {employee.documents && employee.documents.length > 0 ? (
                          <button
                            onClick={() => setViewDocumentModal({ isOpen: true, documents: employee.documents, employeeName: employee.name, currentIndex: 0 })}
                            className="text-green-600 hover:text-green-800 font-semibold text-sm"
                          >
                            {employee.documents.length} {locale === 'ko' ? '개' : 'files'}
                          </button>
                        ) : (
                          <span className="text-gray-400">✗</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      {t.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <h2 className="text-xl font-bold">{locale === 'ko' ? '직원 추가' : 'Add Employee Data'}</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{locale === 'ko' ? '이름' : 'Employee Name'}</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder={locale === 'ko' ? '이름 입력' : 'Enter name'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.position}</label>
                  <input
                    type="text"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder={locale === 'ko' ? '직책 입력' : 'Enter position'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{locale === 'ko' ? '이메일' : 'Email'}</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="email@kenergy.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{locale === 'ko' ? '전화번호' : 'Phone'}</label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="+82-10-XXXX-XXXX"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.department}</label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="hr">{t.hrDepartment}</option>
                    <option value="production">{t.productionDepartment}</option>
                    <option value="quality">{t.qualityControlDepartment}</option>
                    <option value="rd">{t.researchDevelopmentDepartment}</option>
                    <option value="international">{t.internationalMarketDepartment}</option>
                    <option value="domestic">{t.domesticMarketDepartment}</option>
                    <option value="aftersales">{t.afterSalesServiceDepartment}</option>
                    <option value="maintenance">{t.maintenanceDepartment}</option>
                    <option value="executive">{t.executiveDepartment}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{locale === 'ko' ? '입사일' : 'Join Date'}</label>
                  <input
                    type="date"
                    value={newEmployee.joinDate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, joinDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ko' ? '입사 지원 서류' : 'Job Application Documents'}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    id="document-upload"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    multiple
                    className="hidden"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {locale === 'ko' ? '파일 업로드 (여러 파일 선택 가능)' : 'Upload files (Multiple selection allowed)'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {locale === 'ko' ? '이미지 또는 PDF' : 'Image or PDF'}
                    </span>
                  </label>
                  {newEmployee.documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {newEmployee.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700">
                              {locale === 'ko' ? `파일 ${index + 1}` : `File ${index + 1}`}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveDocument(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                {locale === 'ko' ? '취소' : 'Cancel'}
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700"
              >
                {locale === 'ko' ? '추가' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {viewDocumentModal.isOpen && viewDocumentModal.documents && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setViewDocumentModal({ isOpen: false })}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <h2 className="text-xl font-bold">
                  {locale === 'ko' ? `${viewDocumentModal.employeeName} - 서류 (${(viewDocumentModal.currentIndex || 0) + 1}/${viewDocumentModal.documents.length})` : `${viewDocumentModal.employeeName} - Documents (${(viewDocumentModal.currentIndex || 0) + 1}/${viewDocumentModal.documents.length})`}
                </h2>
              </div>
              <button onClick={() => setViewDocumentModal({ isOpen: false })} className="text-white hover:bg-white/20 p-2 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
              {viewDocumentModal.documents[(viewDocumentModal.currentIndex || 0)]?.startsWith('data:application/pdf') ? (
                <iframe src={viewDocumentModal.documents[(viewDocumentModal.currentIndex || 0)]} className="w-full h-[600px] border rounded-lg" />
              ) : (
                <img src={viewDocumentModal.documents[(viewDocumentModal.currentIndex || 0)]} alt="Document" className="max-w-full h-auto rounded-lg shadow-lg" />
              )}
            </div>
            {viewDocumentModal.documents.length > 1 && (
              <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
                <button
                  onClick={() => setViewDocumentModal({
                    ...viewDocumentModal,
                    currentIndex: Math.max(0, (viewDocumentModal.currentIndex || 0) - 1)
                  })}
                  disabled={(viewDocumentModal.currentIndex || 0) === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {locale === 'ko' ? '이전' : 'Previous'}
                </button>
                <span className="text-sm text-gray-600">
                  {locale === 'ko' ? `${(viewDocumentModal.currentIndex || 0) + 1} / ${viewDocumentModal.documents.length}` : `${(viewDocumentModal.currentIndex || 0) + 1} of ${viewDocumentModal.documents.length}`}
                </span>
                <button
                  onClick={() => setViewDocumentModal({
                    ...viewDocumentModal,
                    currentIndex: Math.min(viewDocumentModal.documents!.length - 1, (viewDocumentModal.currentIndex || 0) + 1)
                  })}
                  disabled={(viewDocumentModal.currentIndex || 0) === viewDocumentModal.documents.length - 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {locale === 'ko' ? '다음' : 'Next'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
