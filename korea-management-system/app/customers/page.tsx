'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  Users,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  Star,
  Calendar,
  Eye,
  Shield
} from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    type: 'individual'
  });

  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: '삼성중공업',
      nameEn: 'Samsung Heavy Industries',
      email: 'contact@shi.samsung.com',
      phone: '+82-2-2145-8000',
      company: 'Samsung Heavy Industries',
      address: '서울시 강남구 테헤란로 256',
      type: 'corporate',
      status: 'active',
      joinDate: '2025-11-15',
      lastOrder: '2026-02-10',
      totalOrders: 12,
      totalSpent: 2400000000,
      rating: 5
    },
    {
      id: 2,
      name: 'LG화학',
      nameEn: 'LG Chem',
      email: 'info@lgchem.com',
      phone: '+82-2-3773-1114',
      company: 'LG Chem Ltd.',
      address: '서울시 영등포구 여의도동 20',
      type: 'corporate',
      status: 'active',
      joinDate: '2025-12-03',
      lastOrder: '2026-02-08',
      totalOrders: 8,
      totalSpent: 1600000000,
      rating: 4
    },
    {
      id: 3,
      name: 'SK건설',
      nameEn: 'SK E&C',
      email: 'contact@skec.co.kr',
      phone: '+82-2-2121-3114',
      company: 'SK Engineering & Construction',
      address: '서울시 종로구 종로 26',
      type: 'corporate',
      status: 'pending',
      joinDate: '2026-01-20',
      lastOrder: '2026-02-05',
      totalOrders: 3,
      totalSpent: 750000000,
      rating: 4
    },
    {
      id: 4,
      name: '김영수',
      nameEn: 'Kim Young-soo',
      email: 'youngsu.kim@email.com',
      phone: '+82-10-1234-5678',
      company: '개인 고객',
      address: '부산시 해운대구 우동 123',
      type: 'individual',
      status: 'active',
      joinDate: '2026-01-10',
      lastOrder: '2026-01-25',
      totalOrders: 2,
      totalSpent: 18000000,
      rating: 5
    },
    {
      id: 5,
      name: '현대자동차',
      nameEn: 'Hyundai Motor',
      email: 'contact@hyundai.com',
      phone: '+82-2-3464-1114',
      company: 'Hyundai Motor Company',
      address: '서울시 서초구 헌릉로 12',
      type: 'corporate',
      status: 'inactive',
      joinDate: '2025-08-15',
      lastOrder: '2025-12-20',
      totalOrders: 5,
      totalSpent: 950000000,
      rating: 3
    }
  ]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = () => {
    const newId = Math.max(...customers.map(c => c.id)) + 1;
    const currentDate = new Date().toISOString().split('T')[0];
    
    setCustomers([...customers, {
      id: newId,
      name: newCustomer.name,
      nameEn: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      company: newCustomer.company || newCustomer.name,
      address: newCustomer.address,
      type: newCustomer.type,
      status: 'active',
      joinDate: currentDate,
      lastOrder: '-',
      totalOrders: 0,
      totalSpent: 0,
      rating: 0
    }]);
    
    setIsAddModalOpen(false);
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      type: 'individual'
    });
  };

  const handleDeleteCustomer = (id: number) => {
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'inactive': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return '₩' + new Intl.NumberFormat('ko-KR').format(amount);
  };

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    pending: customers.filter(c => c.status === 'pending').length,
    inactive: customers.filter(c => c.status === 'inactive').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {locale === 'ko' ? '고객 관리' : 'Customer Management'}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {locale === 'ko' ? '고객 정보 및 주문 이력 관리' : 'Manage customer information and order history'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin-support/customers"
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">{t.adminSupport}</span>
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '전체 고객' : 'Total Customers'}</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '활성 고객' : 'Active Customers'}</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '대기 고객' : 'Pending Customers'}</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '비활성 고객' : 'Inactive Customers'}</p>
                <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={locale === 'ko' ? '고객명, 이메일, 회사명으로 검색...' : 'Search by name, email, or company...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{locale === 'ko' ? '모든 상태' : 'All Status'}</option>
                <option value="active">{locale === 'ko' ? '활성' : 'Active'}</option>
                <option value="pending">{locale === 'ko' ? '대기' : 'Pending'}</option>
                <option value="inactive">{locale === 'ko' ? '비활성' : 'Inactive'}</option>
              </select>
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {locale === 'ko' ? '고객 추가' : 'Add Customer'}
            </button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    {locale === 'ko' ? '고객 정보' : 'Customer Info'}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    {locale === 'ko' ? '연락처' : 'Contact'}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    {locale === 'ko' ? '회사' : 'Company'}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    {locale === 'ko' ? '상태' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    {locale === 'ko' ? '주문 수' : 'Orders'}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    {locale === 'ko' ? '총 구매액' : 'Total Spent'}
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    {locale === 'ko' ? '작업' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            {locale === 'ko' ? '가입일' : 'Joined'}: {customer.joinDate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{customer.company}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {customer.type === 'corporate' ? (locale === 'ko' ? '법인' : 'Corporate') : (locale === 'ko' ? '개인' : 'Individual')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status === 'active' ? (locale === 'ko' ? '활성' : 'Active') :
                         customer.status === 'pending' ? (locale === 'ko' ? '대기' : 'Pending') :
                         (locale === 'ko' ? '비활성' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{customer.totalOrders}</div>
                      <div className="text-xs text-gray-500">
                        {locale === 'ko' ? '최근 주문' : 'Last order'}: {customer.lastOrder}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                      {customer.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(customer.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {locale === 'ko' ? '새 고객 추가' : 'Add New Customer'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ko' ? '고객명' : 'Customer Name'} *
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={locale === 'ko' ? '고객명을 입력하세요' : 'Enter customer name'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ko' ? '이메일' : 'Email'} *
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={locale === 'ko' ? '이메일을 입력하세요' : 'Enter email address'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ko' ? '전화번호' : 'Phone'} *
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={locale === 'ko' ? '전화번호를 입력하세요' : 'Enter phone number'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ko' ? '고객 유형' : 'Customer Type'}
                </label>
                <select
                  value={newCustomer.type}
                  onChange={(e) => setNewCustomer({...newCustomer, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="individual">{locale === 'ko' ? '개인' : 'Individual'}</option>
                  <option value="corporate">{locale === 'ko' ? '법인' : 'Corporate'}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ko' ? '회사명' : 'Company'}
                </label>
                <input
                  type="text"
                  value={newCustomer.company}
                  onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={locale === 'ko' ? '회사명을 입력하세요' : 'Enter company name'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {locale === 'ko' ? '주소' : 'Address'}
                </label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  placeholder={locale === 'ko' ? '주소를 입력하세요' : 'Enter address'}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                {locale === 'ko' ? '취소' : 'Cancel'}
              </button>
              <button
                onClick={handleAddCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {locale === 'ko' ? '추가' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}