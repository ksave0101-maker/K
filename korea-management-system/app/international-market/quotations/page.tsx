'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CountryFlag from '@/components/CountryFlag';
import { ArrowLeft, FileText, Search, Eye, Printer, DollarSign, Calendar, User, Building, ChevronDown } from 'lucide-react';

interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerCountry: string;
  branch: string;
  contactPerson: string;
  email: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  validUntil: string;
  status: 'pending-signature' | 'signed' | 'testing' | 'active';
  createdDate: string;
  lastModified: string;
  notes?: string;
}

export default function InternationalQuotationsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Branch options with country codes
  const branchOptions = [
    { value: 'all', label: locale === 'ko' ? '모든 지사' : 'All Branches', country: null },
    { value: 'Vietnam Branch', label: 'Vietnam Branch', country: 'VN' as const },
    { value: 'Thailand Branch', label: 'Thailand Branch', country: 'TH' as const },
    { value: 'Brunei Branch', label: 'Brunei Branch', country: 'BN' as const }
  ];

  const selectedBranchOption = branchOptions.find(opt => opt.value === branchFilter) || branchOptions[0];

  // Status options
  const statusOptions = [
    { value: 'all', label: locale === 'ko' ? '모든 상태' : 'All Status' },
    { value: 'pending-signature', label: locale === 'ko' ? '서명 대기 중' : 'Awaiting Signature' },
    { value: 'signed', label: locale === 'ko' ? '서명 완료' : 'Signed' },
    { value: 'testing', label: locale === 'ko' ? '설치 전 테스트 중' : 'Pre-Installation Testing' },
    { value: 'active', label: locale === 'ko' ? '운영 중' : 'Active' }
  ];

  const selectedStatusOption = statusOptions.find(opt => opt.value === statusFilter) || statusOptions[0];

  // Refs for dropdowns to handle click outside
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setShowBranchDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    if (showBranchDropdown || showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBranchDropdown, showStatusDropdown]);

  // Sample data - Quotations from international branches
  const [quotations, setQuotations] = useState<Quotation[]>([
    {
      id: '1',
      quotationNumber: 'IQ-2026-001',
      customerName: 'Vietnam Energy Solutions',
      customerCountry: 'Vietnam',
      branch: 'Vietnam Branch',
      contactPerson: 'Nguyen Van Duc',
      email: 'duc.nguyen@vietnamenergy.com',
      product: 'KSAVE Industrial Package 500kW',
      quantity: 10,
      unitPrice: 45000,
      totalAmount: 450000,
      currency: 'USD',
      validUntil: '2026-03-15',
      status: 'pending-signature',
      createdDate: '2026-02-10',
      lastModified: '2026-02-10',
      notes: 'Include installation and training package'
    },
    {
      id: '2',
      quotationNumber: 'IQ-2026-002',
      customerName: 'Thailand Green Tech Co.',
      customerCountry: 'Thailand',
      branch: 'Thailand Branch',
      contactPerson: 'Somchai Jaidee',
      email: 'somchai@thgreentech.co.th',
      product: 'KSAVE Commercial Series 200kW',
      quantity: 25,
      unitPrice: 18000,
      totalAmount: 450000,
      currency: 'USD',
      validUntil: '2026-02-28',
      status: 'signed',
      createdDate: '2026-01-25',
      lastModified: '2026-02-08',
      notes: 'Bulk order discount applied'
    },
    {
      id: '3',
      quotationNumber: 'IQ-2026-003',
      customerName: 'Brunei Power Systems',
      customerCountry: 'Brunei',
      branch: 'Brunei Branch',
      contactPerson: 'Ahmad Rahman',
      email: 'ahmad@bruneipower.bn',
      product: 'KSAVE Marine Edition 100kW',
      quantity: 5,
      unitPrice: 35000,
      totalAmount: 175000,
      currency: 'USD',
      validUntil: '2026-03-01',
      status: 'testing',
      createdDate: '2026-02-12',
      lastModified: '2026-02-14',
      notes: 'Customization for marine environment'
    },
    {
      id: '4',
      quotationNumber: 'IQ-2026-004',
      customerName: 'Vietnam Solar Co., Ltd.',
      customerCountry: 'Vietnam',
      branch: 'Vietnam Branch',
      contactPerson: 'Tran Minh Hoang',
      email: 'hoang@vietnamsolar.vn',
      product: 'KSAVE Solar Hybrid 300kW',
      quantity: 15,
      unitPrice: 28000,
      totalAmount: 420000,
      currency: 'USD',
      validUntil: '2026-04-15',
      status: 'active',
      createdDate: '2026-01-10',
      lastModified: '2026-02-01',
      notes: 'System installed and operational'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending-signature': return 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-300 shadow-sm';
      case 'signed': return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 shadow-sm';
      case 'testing': return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-300 shadow-sm';
      case 'active': return 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-400 shadow-sm';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending-signature': return locale === 'ko' ? '서명 대기 중' : 'Awaiting Signature';
      case 'signed': return locale === 'ko' ? '서명 완료' : 'Signed';
      case 'testing': return locale === 'ko' ? '설치 전 테스트 중' : 'Pre-Installation Testing';
      case 'active': return locale === 'ko' ? '운영 중' : 'Active';
      default: return status;
    }
  };

  const getBranchCountryCode = (branch: string): 'VN' | 'TH' | 'BN' | undefined => {
    if (branch === 'Vietnam Branch') return 'VN';
    if (branch === 'Thailand Branch') return 'TH';
    if (branch === 'Brunei Branch') return 'BN';
    return undefined;
  };

  const handleViewQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowViewModal(true);
  };

  const handlePrintQuotation = (quotation: Quotation) => {
    // Create a printable HTML document
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const countryFlag = getBranchCountryCode(quotation.branch);
    const flagUrl = countryFlag ? `https://flagcdn.com/${countryFlag.toLowerCase()}.svg` : '';
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quotation ${quotation.quotationNumber}</title>
  <style>
    @media print {
      @page { 
        size: A4;
        margin: 1cm;
      }
      body { 
        margin: 0;
        padding: 0 !important;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.4;
      color: #1f2937;
      max-width: 100%;
      margin: 0;
      padding: 0.5cm;
      font-size: 12px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .company-name {
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 3px;
    }
    .document-title {
      font-size: 14px;
      font-weight: 600;
      color: #4b5563;
      margin-top: 5px;
    }
    .branch-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(to right, #3b82f6, #6366f1);
      color: white;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 5px;
    }
    .branch-flag {
      width: 16px;
      height: 12px;
    }
    .info-section {
      margin-bottom: 12px;
      background: #f9fafb;
      padding: 10px;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 13px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .info-item {
      margin-bottom: 5px;
    }
    .info-label {
      font-size: 10px;
      color: #6b7280;
      font-weight: 600;
    }
    .info-value {
      font-size: 12px;
      color: #111827;
      font-weight: 500;
    }
    .total-section {
      background: #dbeafe;
      padding: 12px;
      border-radius: 6px;
      text-align: center;
      margin: 12px 0;
      border: 2px solid #3b82f6;
      page-break-inside: avoid;
    }
    .total-label {
      font-size: 12px;
      color: #1e40af;
      font-weight: 600;
      margin-bottom: 3px;
    }
    .total-amount {
      font-size: 24px;
      font-weight: bold;
      color: #1e3a8a;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 5px;
    }
    .status-pending-signature { background: #fef3c7; color: #92400e; }
    .status-signed { background: #d1fae5; color: #065f46; }
    .status-testing { background: #dbeafe; color: #1e40af; }
    .status-active { background: #d1fae5; color: #047857; }
    .notes-section {
      background: #fffbeb;
      padding: 10px;
      border-radius: 6px;
      margin-top: 12px;
      border-left: 3px solid #f59e0b;
      page-break-inside: avoid;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">K ENERGY SAVE CO., LTD. (Group of Zera)</div>
    <div class="document-title">INTERNATIONAL QUOTATION</div>
    ${flagUrl ? `<div class="branch-badge"><img src="${flagUrl}" class="branch-flag" alt="flag" />${quotation.branch}</div>` : ''}
  </div>

  <div class="info-section">
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Quotation Number</div>
        <div class="info-value">${quotation.quotationNumber}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date</div>
        <div class="info-value">${quotation.createdDate}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Valid Until</div>
        <div class="info-value">${quotation.validUntil}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Status</div>
        <div><span class="status-badge status-${quotation.status}">${getStatusText(quotation.status)}</span></div>
      </div>
    </div>
  </div>

  <div class="info-section">
    <div class="section-title">Customer Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Company Name</div>
        <div class="info-value">${quotation.customerName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Country</div>
        <div class="info-value">${quotation.customerCountry}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Contact Person</div>
        <div class="info-value">${quotation.contactPerson}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">${quotation.email}</div>
      </div>
    </div>
  </div>

  <div class="info-section">
    <div class="section-title">Product Details</div>
    <div class="info-item">
      <div class="info-label">Product</div>
      <div class="info-value">${quotation.product}</div>
    </div>
    <div class="info-grid" style="margin-top: 5px;">
      <div class="info-item">
        <div class="info-label">Quantity</div>
        <div class="info-value">${quotation.quantity.toLocaleString()} units</div>
      </div>
      <div class="info-item">
        <div class="info-label">Unit Price</div>
        <div class="info-value">${quotation.currency} $${quotation.unitPrice.toLocaleString()}</div>
      </div>
    </div>
  </div>

  <div class="total-section">
    <div class="total-label">TOTAL AMOUNT</div>
    <div class="total-amount">${quotation.currency} $${quotation.totalAmount.toLocaleString()}</div>
  </div>

  ${quotation.notes ? `
  <div class="notes-section">
    <div class="section-title" style="color: #92400e;">Notes</div>
    <div class="info-value">${quotation.notes}</div>
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>K Energy Save Co., Ltd.</strong></p>
    <p>International Market Division - ${quotation.branch}</p>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.createdDate.includes(searchTerm);
    const matchesBranch = branchFilter === 'all' || q.branch === branchFilter;
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-[96%] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/international-market/sales-expense-reports')} 
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {locale === 'ko' ? '해외 사업부 견적서 현황' : 'International Branch Quotations'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {locale === 'ko' ? '해외 각 지사에서 생성된 견적서 조회 (읽기 전용)' : 'View quotations from international branches (Read-only)'}
                  </p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-[96%] mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-semibold text-blue-800">
                {locale === 'ko' ? '📋 열람 전용 페이지' : '📋 View Only Page'}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {locale === 'ko' 
                  ? '이 페이지는 해외 각 지사에서 생성된 견적서를 조회하는 페이지입니다. 견적서 생성, 수정, 삭제는 각 지사에서만 가능합니다.'
                  : 'This page displays quotations created by international branches. Creation, editing, and deletion can only be performed by respective branches.'}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={locale === 'ko' ? '날짜, 견적 번호, 고객명으로 검색...' : 'Search by date, quotation number, customer...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 ml-10">
                {locale === 'ko' ? '예: 2026-02-10, IQ-2026-001, Vietnam Energy' : 'e.g., 2026-02-10, IQ-2026-001, Vietnam Energy'}
              </p>
            </div>
            {/* Custom Branch Dropdown */}
            <div ref={branchDropdownRef} className="relative">
              <button
                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[200px] justify-between"
              >
                <div className="flex items-center gap-2">
                  {selectedBranchOption.country && (
                    <CountryFlag country={selectedBranchOption.country} size="sm" />
                  )}
                  <span className="text-sm text-gray-700">{selectedBranchOption.label}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {/* Dropdown Menu */}
              {showBranchDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {branchOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setBranchFilter(option.value);
                        setShowBranchDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                    >
                      {option.country && (
                        <CountryFlag country={option.country} size="sm" />
                      )}
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Status Dropdown */}
            <div ref={statusDropdownRef} className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 flex items-center gap-2 min-w-[200px] justify-between"
              >
                <span className="text-sm text-gray-700">{selectedStatusOption.label}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {/* Dropdown Menu */}
              {showStatusDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quotations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    {locale === 'ko' ? '견적 번호' : 'Quotation No.'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    {locale === 'ko' ? '지사' : 'Branch'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    {locale === 'ko' ? '생성일' : 'Created Date'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    {locale === 'ko' ? '고객 정보' : 'Customer'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    {locale === 'ko' ? '제품' : 'Product'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    {locale === 'ko' ? '금액' : 'Amount'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    {locale === 'ko' ? '유효기한' : 'Valid Until'}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    {locale === 'ko' ? '상태' : 'Status'}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                    {locale === 'ko' ? '작업' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation, index) => (
                  <tr key={quotation.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 hover:shadow-sm">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{quotation.quotationNumber}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <CountryFlag country={getBranchCountryCode(quotation.branch)} size="sm" />
                        <span className="text-sm font-medium text-gray-900">{quotation.branch}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                        <span className="text-sm text-gray-900">{quotation.createdDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{quotation.customerName}</div>
                        <div className="text-xs text-gray-500">{quotation.customerCountry} • {quotation.contactPerson}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{quotation.product}</div>
                      <div className="text-xs text-gray-500">{locale === 'ko' ? '수량' : 'Qty'}: {quotation.quantity.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quotation.currency} ${quotation.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        @ {quotation.currency} ${quotation.unitPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{quotation.validUntil}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full border-2 ${getStatusColor(quotation.status)}`}>
                        {getStatusText(quotation.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        <button 
                          onClick={() => handleViewQuotation(quotation)}
                          className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-all duration-200 p-1 rounded-lg hover:bg-blue-50"
                          title={locale === 'ko' ? '상세보기' : 'View Details'}
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handlePrintQuotation(quotation)}
                          className="text-purple-600 hover:text-purple-800 hover:scale-110 transition-all duration-200 p-1 rounded-lg hover:bg-purple-50"
                          title={locale === 'ko' ? '인쇄' : 'Print'}
                        >
                          <Printer className="w-4.5 h-4.5" />
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

      {/* View Quotation Modal */}
      {showViewModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      {locale === 'ko' ? '견적서 상세 정보' : 'Quotation Details'}
                    </h2>
                    <p className="text-blue-100 text-sm">{selectedQuotation.quotationNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              {/* Branch and Status Badge */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                    <CountryFlag country={getBranchCountryCode(selectedQuotation.branch)} size="sm" />
                    {selectedQuotation.branch}
                  </span>
                  <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full border-2 ${getStatusColor(selectedQuotation.status)}`}>
                    {getStatusText(selectedQuotation.status)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {locale === 'ko' ? '생성일' : 'Created'}: {selectedQuotation.createdDate}
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  {locale === 'ko' ? '고객 정보' : 'Customer Information'}
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '회사명' : 'Company'}</p>
                    <p className="font-semibold text-gray-900">{selectedQuotation.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '국가' : 'Country'}</p>
                    <p className="font-semibold text-gray-900">{selectedQuotation.customerCountry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '담당자' : 'Contact Person'}</p>
                    <p className="font-semibold text-gray-900">{selectedQuotation.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '이메일' : 'Email'}</p>
                    <p className="font-semibold text-gray-900">{selectedQuotation.email}</p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
                  <Building className="w-5 h-5 mr-2 text-blue-600" />
                  {locale === 'ko' ? '제품 정보' : 'Product Information'}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '제품명' : 'Product'}</p>
                    <p className="font-semibold text-gray-900">{selectedQuotation.product}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{locale === 'ko' ? '수량' : 'Quantity'}</p>
                      <p className="font-semibold text-gray-900">{selectedQuotation.quantity.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{locale === 'ko' ? '단가' : 'Unit Price'}</p>
                      <p className="font-semibold text-gray-900">{selectedQuotation.currency} ${selectedQuotation.unitPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{locale === 'ko' ? '통화' : 'Currency'}</p>
                      <p className="font-semibold text-gray-900">{selectedQuotation.currency}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
                  <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                  {locale === 'ko' ? '가격 정보' : 'Pricing'}
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-700">
                      {locale === 'ko' ? '총 금액' : 'Total Amount'}:
                    </span>
                    <span className="text-3xl font-bold text-blue-600">
                      {selectedQuotation.currency} ${selectedQuotation.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  {locale === 'ko' ? '추가 정보' : 'Additional Information'}
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '유효기한' : 'Valid Until'}</p>
                    <p className="font-semibold text-gray-900">{selectedQuotation.validUntil}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{locale === 'ko' ? '최종 수정' : 'Last Modified'}</p>
                    <p className="font-semibold text-gray-900">{selectedQuotation.lastModified}</p>
                  </div>
                </div>
                {selectedQuotation.notes && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-1">{locale === 'ko' ? '비고' : 'Notes'}:</p>
                    <p className="text-gray-900">{selectedQuotation.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => {
                    handlePrintQuotation(selectedQuotation);
                    setShowViewModal(false);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {locale === 'ko' ? '인쇄' : 'Print'}
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  {locale === 'ko' ? '닫기' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}