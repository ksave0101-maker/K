'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, FileText, Plus, Search, Eye, Edit, Trash2, Download, DollarSign, Calendar, User, MapPin } from 'lucide-react';

interface DomesticQuotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerRegion: string;
  contactPerson: string;
  phone: string;
  email: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdDate: string;
  lastModified: string;
  notes?: string;
}

export default function DomesticQuotationsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Sample data
  const [quotations, setQuotations] = useState<DomesticQuotation[]>([
    {
      id: '1',
      quotationNumber: 'DQ-2026-001',
      customerName: '서울특별시청',
      customerRegion: '서울/경기',
      contactPerson: '김영수',
      phone: '02-123-4567',
      email: 'kim.youngsu@seoul.go.kr',
      product: '태양광 패널 시스템 500kW',
      quantity: 1,
      unitPrice: 2500000000,
      totalAmount: 2500000000,
      validUntil: '2026-03-20',
      status: 'sent',
      createdDate: '2026-02-10',
      lastModified: '2026-02-10',
      notes: '서울시 친환경 에너지 1단계 사업'
    },
    {
      id: '2',
      quotationNumber: 'DQ-2026-002',
      customerName: '삼성중공업',
      customerRegion: '부산/경남',
      contactPerson: '박철수',
      phone: '051-987-6543',
      email: 'park.cs@samsung.com',
      product: '에너지 절감 장치 A200',
      quantity: 200,
      unitPrice: 9000000,
      totalAmount: 1800000000,
      validUntil: '2026-02-28',
      status: 'accepted',
      createdDate: '2026-01-15',
      lastModified: '2026-02-05',
      notes: '거제 조선소 에너지 효율화 프로젝트'
    },
    {
      id: '3',
      quotationNumber: 'DQ-2026-003',
      customerName: 'POSCO 포항제철',
      customerRegion: '대구/경북',
      contactPerson: '이민정',
      phone: '054-456-7890',
      email: 'lee.mj@posco.com',
      product: '스마트 인버터 SI-3000',
      quantity: 150,
      unitPrice: 9000000,
      totalAmount: 1350000000,
      validUntil: '2026-03-10',
      status: 'draft',
      createdDate: '2026-02-08',
      lastModified: '2026-02-12',
      notes: '포항 제철소 전력 관리 고도화'
    },
    {
      id: '4',
      quotationNumber: 'DQ-2026-004',
      customerName: '현대건설',
      customerRegion: '서울/경기',
      contactPerson: '정수연',
      phone: '02-5555-1234',
      email: 'jung.sy@hyundai.com',
      product: 'EV 충전기 EC-300',
      quantity: 300,
      unitPrice: 3000000,
      totalAmount: 900000000,
      validUntil: '2026-02-25',
      status: 'accepted',
      createdDate: '2026-01-20',
      lastModified: '2026-01-28',
      notes: '신규 아파트 단지 충전 인프라'
    },
    {
      id: '5',
      quotationNumber: 'DQ-2026-005',
      customerName: '제주에너지공사',
      customerRegion: '제주',
      contactPerson: '강태호',
      phone: '064-111-2222',
      email: 'kang.th@jejuenergy.co.kr',
      product: '풍력 변환 시스템 WCS-500',
      quantity: 10,
      unitPrice: 220000000,
      totalAmount: 2200000000,
      validUntil: '2026-03-15',
      status: 'sent',
      createdDate: '2026-02-01',
      lastModified: '2026-02-10',
      notes: '제주 해상풍력 연계 프로젝트'
    }
  ]);

  const regions = [
    { key: 'seoul', name: '서울/경기' },
    { key: 'busan', name: '부산/경남' },
    { key: 'daegu', name: '대구/경북' },
    { key: 'daejeon', name: '대전/충청' },
    { key: 'gwangju', name: '광주/전라' },
    { key: 'incheon', name: '인천/강원' },
    { key: 'jeju', name: '제주' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return locale === 'ko' ? '초안' : 'Draft';
      case 'sent': return locale === 'ko' ? '발송됨' : 'Sent';
      case 'accepted': return locale === 'ko' ? '승인됨' : 'Accepted';
      case 'rejected': return locale === 'ko' ? '거부됨' : 'Rejected';
      case 'expired': return locale === 'ko' ? '만료됨' : 'Expired';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return '₩' + new Intl.NumberFormat('ko-KR').format(amount);
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || q.customerRegion === regions.find(r => r.key === regionFilter)?.name;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/domestic-market/domestic-shipments')} 
                className="text-orange-600 hover:text-orange-800 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {locale === 'ko' ? '국내 견적 관리' : 'Domestic Quotations'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {locale === 'ko' ? '국내 고객 견적서 작성 및 관리' : 'Manage quotes for domestic clients'}
                  </p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={locale === 'ko' ? '견적 번호, 고객명, 제품명 검색...' : 'Search quotation number, customer, product...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-80"
                />
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">{locale === 'ko' ? '모든 상태' : 'All Status'}</option>
                <option value="draft">{locale === 'ko' ? '초안' : 'Draft'}</option>
                <option value="sent">{locale === 'ko' ? '발송됨' : 'Sent'}</option>
                <option value="accepted">{locale === 'ko' ? '승인됨' : 'Accepted'}</option>
                <option value="rejected">{locale === 'ko' ? '거부됨' : 'Rejected'}</option>
                <option value="expired">{locale === 'ko' ? '만료됨' : 'Expired'}</option>
              </select>
              <select 
                value={regionFilter} 
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">{locale === 'ko' ? '모든 지역' : 'All Regions'}</option>
                {regions.map(region => (
                  <option key={region.key} value={region.key}>{region.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              {t.newQuotation}
            </button>
          </div>
        </div>

        {/* Quotations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '견적 번호' : 'Quotation No.'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '고객 정보' : 'Customer'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '제품' : 'Product'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '금액' : 'Amount'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '유효기한' : 'Valid Until'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '상태' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'ko' ? '작업' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{quotation.quotationNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{quotation.customerName}</div>
                        <div className="text-sm text-gray-500">{quotation.customerRegion} • {quotation.contactPerson}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{quotation.product}</div>
                      <div className="text-sm text-gray-500">{locale === 'ko' ? '수량' : 'Qty'}: {quotation.quantity.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(quotation.totalAmount)}
                      </div>
                      {quotation.quantity > 1 && (
                        <div className="text-sm text-gray-500">
                          @ {formatCurrency(quotation.unitPrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{quotation.validUntil}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(quotation.status)}`}>
                        {getStatusText(quotation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button className="text-orange-600 hover:text-orange-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  {locale === 'ko' ? '총 견적서' : 'Total Quotes'}
                </p>
                <p className="text-2xl font-semibold text-gray-900">{quotations.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  {locale === 'ko' ? '승인된 금액' : 'Accepted Value'}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(quotations.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.totalAmount, 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  {locale === 'ko' ? '대기 중' : 'Pending'}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {quotations.filter(q => q.status === 'sent').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  {locale === 'ko' ? '지역 수' : 'Regions'}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(quotations.map(q => q.customerRegion)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}