'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, Award, Plus, Search, Eye, Trash2, X, CheckCircle, Clock, XCircle, Printer, FileText } from 'lucide-react';

interface CertificateRequest {
  id: number;
  requestNumber: string;
  employeeName: string;
  employeeId: string;
  certificateType: string;
  requestDate: string;
  requiredDate: string;
  quantity: number;
  purpose: string;
  status: 'approved' | 'pending' | 'rejected';
  approver?: string;
  approvalDate?: string;
  notes?: string;
}

export default function CertificatePrintingPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const certificateTypes = locale === 'ko' ? [
    '재직증명서',
    '경력증명서',
    '소득증명서',
    '원천징수영수증',
    '근로소득원천징수영수증',
    '퇴직증명서',
    '건강보험자격득실확인서',
    '4대보험가입확인서',
  ] : [
    'Employment Certificate',
    'Career Certificate',
    'Income Certificate',
    'Tax Withholding Receipt',
    'Earned Income Tax Receipt',
    'Retirement Certificate',
    'Health Insurance Status Certificate',
    'Social Insurance Certificate',
  ];

  const [requests, setRequests] = useState<CertificateRequest[]>([
    { 
      id: 1, 
      requestNumber: 'CR-2026-001', 
      employeeName: locale === 'ko' ? '김민수' : 'Kim Min-su',
      employeeId: 'EMP001',
      certificateType: certificateTypes[0],
      requestDate: '2026-02-15',
      requiredDate: '2026-02-18',
      quantity: 1,
      purpose: locale === 'ko' ? '은행 대출용' : 'Bank loan application',
      status: 'approved',
      approver: locale === 'ko' ? '인사팀장' : 'HR Manager',
      approvalDate: '2026-02-15',
    },
    { 
      id: 2, 
      requestNumber: 'CR-2026-002', 
      employeeName: locale === 'ko' ? '이수진' : 'Lee Su-jin',
      employeeId: 'EMP002',
      certificateType: certificateTypes[2],
      requestDate: '2026-02-14',
      requiredDate: '2026-02-17',
      quantity: 2,
      purpose: locale === 'ko' ? '비자 신청' : 'Visa application',
      status: 'pending',
    },
    { 
      id: 3, 
      requestNumber: 'CR-2026-003', 
      employeeName: locale === 'ko' ? '박지훈' : 'Park Ji-hoon',
      employeeId: 'EMP003',
      certificateType: certificateTypes[1],
      requestDate: '2026-02-13',
      requiredDate: '2026-02-20',
      quantity: 1,
      purpose: locale === 'ko' ? '이직 준비' : 'Job change preparation',
      status: 'approved',
      approver: locale === 'ko' ? '인사팀장' : 'HR Manager',
      approvalDate: '2026-02-14',
    },
    { 
      id: 4, 
      requestNumber: 'CR-2026-004', 
      employeeName: locale === 'ko' ? '최영희' : 'Choi Young-hee',
      employeeId: 'EMP004',
      certificateType: certificateTypes[3],
      requestDate: '2026-02-12',
      requiredDate: '2026-02-16',
      quantity: 1,
      purpose: locale === 'ko' ? '연말정산' : 'Year-end tax settlement',
      status: 'approved',
      approver: locale === 'ko' ? '인사팀장' : 'HR Manager',
      approvalDate: '2026-02-12',
    },
    { 
      id: 5, 
      requestNumber: 'CR-2026-005', 
      employeeName: locale === 'ko' ? '정태영' : 'Jung Tae-young',
      employeeId: 'EMP005',
      certificateType: certificateTypes[7],
      requestDate: '2026-02-11',
      requiredDate: '2026-02-15',
      quantity: 1,
      purpose: locale === 'ko' ? '부동산 계약' : 'Real estate contract',
      status: 'pending',
    },
    { 
      id: 6, 
      requestNumber: 'CR-2026-006', 
      employeeName: locale === 'ko' ? '강민지' : 'Kang Min-ji',
      employeeId: 'EMP006',
      certificateType: certificateTypes[0],
      requestDate: '2026-02-10',
      requiredDate: '2026-02-14',
      quantity: 3,
      purpose: locale === 'ko' ? '자녀 학교 제출' : 'Child school submission',
      status: 'rejected',
      approver: locale === 'ko' ? '인사팀장' : 'HR Manager',
      approvalDate: '2026-02-11',
      notes: locale === 'ko' ? '보류 - 추가 서류 필요' : 'On hold - Additional documents required',
    },
  ]);

  const [newRequest, setNewRequest] = useState({
    employeeName: '', 
    employeeId: '', 
    certificateType: certificateTypes[0], 
    requestDate: '2026-02-15', 
    requiredDate: '', 
    quantity: 1,
    purpose: '',
  });

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700' };
    const label: Record<string, string> = { approved: locale === 'ko' ? '승인완료' : 'Approved', pending: locale === 'ko' ? '대기중' : 'Pending', rejected: locale === 'ko' ? '반려' : 'Rejected' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const filtered = requests.filter(r => {
    const matchSearch = r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       r.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: number) => {
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setRequests(requests.filter(r => r.id !== id));
    }
  };

  const handleCreate = () => {
    const newId = Math.max(...requests.map(r => r.id)) + 1;
    setRequests([...requests, {
      id: newId,
      requestNumber: `CR-2026-${String(newId + 6).padStart(3, '0')}`,
      employeeName: newRequest.employeeName,
      employeeId: newRequest.employeeId,
      certificateType: newRequest.certificateType,
      requestDate: newRequest.requestDate,
      requiredDate: newRequest.requiredDate,
      quantity: newRequest.quantity,
      purpose: newRequest.purpose,
      status: 'pending',
    }]);
    setIsAddModalOpen(false);
    setNewRequest({ 
      employeeName: '', 
      employeeId: '', 
      certificateType: certificateTypes[0], 
      requestDate: '2026-02-15', 
      requiredDate: '', 
      quantity: 1,
      purpose: '',
    });
  };

  const stats = {
    total: requests.length,
    approved: requests.filter(r => r.status === 'approved').length,
    pending: requests.filter(r => r.status === 'pending').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const handlePrint = (request: CertificateRequest) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(locale === 'ko' ? '팝업 차단을 해제해주세요' : 'Please allow popups');
      return;
    }

    const currentDate = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const currentDateEn = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Certificate type mapping (Korean - English)
    const certTypeMap: Record<string, string> = {
      '재직증명서': 'CERTIFICATE OF EMPLOYMENT',
      '경력증명서': 'CAREER CERTIFICATE',
      '소득증명서': 'INCOME CERTIFICATE',
      '원천징수영수증': 'TAX WITHHOLDING RECEIPT',
      '근로소득원천징수영수증': 'EARNED INCOME TAX RECEIPT',
      '퇴직증명서': 'RETIREMENT CERTIFICATE',
      '건강보험자격득실확인서': 'HEALTH INSURANCE STATUS CERTIFICATE',
      '4대보험가입확인서': 'SOCIAL INSURANCE CERTIFICATE',
      'Employment Certificate': '재직증명서',
      'Career Certificate': '경력증명서',
      'Income Certificate': '소득증명서',
      'Tax Withholding Receipt': '원천징수영수증',
      'Earned Income Tax Receipt': '근로소득원천징수영수증',
      'Retirement Certificate': '퇴직증명서',
      'Health Insurance Status Certificate': '건강보험자격득실확인서',
      'Social Insurance Certificate': '4대보험가입확인서',
    };

    // Determine Korean and English titles
    let certTypeKo = request.certificateType;
    let certTypeEn = certTypeMap[request.certificateType] || 'CERTIFICATE OF EMPLOYMENT';
    
    // If the current type is in English, swap them
    if (request.certificateType.includes('Certificate') || request.certificateType.includes('Receipt')) {
      certTypeEn = request.certificateType.toUpperCase();
      certTypeKo = certTypeMap[request.certificateType] || '재직증명서';
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${request.certificateType} - ${request.employeeName}</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 210mm;
            height: 297mm;
          }
          body {
            font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif;
            background: white;
            color: #000;
            line-height: 1.4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: #ffffff;
            padding: 15mm;
            border: 3px solid #000000;
            position: relative;
            box-sizing: border-box;
          }
          .logo {
            display: block;
            margin: 0 auto 15px auto;
            width: 100px;
            height: 100px;
            object-fit: contain;
            object-position: center;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            background: #ffffff;
            padding: 20px 15px 15px 15px;
            border: 2px solid #000000;
            border-radius: 0;
            position: relative;
          }
          .company-name {
            font-size: 18px;
            font-weight: 800;
            color: #000000;
            margin-bottom: 12px;
            letter-spacing: 1.5px;
            position: relative;
          }
          .title {
            font-size: 28px;
            font-weight: 900;
            margin: 8px 0 5px 0;
            letter-spacing: 10px;
            color: #000000;
            position: relative;
          }
          .title-en {
            font-size: 14px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 8px;
            letter-spacing: 2px;
            text-transform: uppercase;
            position: relative;
          }
          .doc-number {
            font-size: 10px;
            color: #666666;
            text-align: right;
            margin-top: 8px;
            font-weight: 500;
            position: relative;
          }
          .content {
            margin: 12px 0;
            font-size: 12px;
            background: white;
            padding: 12px;
            border-radius: 0;
          }
          .info-row {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 20px;
            margin: 12px 0;
            padding: 12px 15px;
            background: #f9f9f9;
            border: 1px solid #d0d0d0;
            border-left: 4px solid #000000;
            align-items: center;
          }
          .info-label {
            font-weight: 800;
            color: #000000;
            font-size: 13px;
            line-height: 1.4;
            letter-spacing: 0.5px;
          }
          .info-label-en {
            font-size: 9px;
            color: #666666;
            font-weight: 600;
            display: block;
            margin-top: 3px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-value {
            color: #000000;
            font-weight: 700;
            font-size: 15px;
            line-height: 1.4;
            letter-spacing: 0.3px;
          }
          .purpose-section {
            margin: 15px 0;
            padding: 12px 15px;
            background: #ffffff;
            border: 2px solid #000000;
            border-radius: 0;
          }
          .purpose-title {
            font-weight: 800;
            margin-bottom: 3px;
            color: #000000;
            font-size: 12px;
            letter-spacing: 0.5px;
          }
          .purpose-title-en {
            font-size: 9px;
            color: #666666;
            margin-bottom: 8px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .certification-text {
            margin-top: 15px;
            text-align: center;
            font-size: 11px;
            line-height: 1.6;
            padding: 12px 15px;
            background: #f8f8f8;
            border: 2px solid #000000;
            border-radius: 0;
            position: relative;
          }
          .certification-ko {
            font-weight: 700;
            color: #000000;
            margin-bottom: 8px;
            font-size: 12px;
            line-height: 1.6;
          }
          .certification-en {
            font-size: 10px;
            color: #333333;
            font-style: italic;
            font-weight: 500;
            line-height: 1.4;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
          }
          .issue-date {
            font-size: 13px;
            margin: 12px 0;
            font-weight: 700;
            color: #000000;
            letter-spacing: 0.5px;
          }
          .issue-date-en {
            font-size: 10px;
            color: #666666;
            margin-top: 3px;
            font-weight: 600;
          }
          .company-info {
            margin-top: 15px;
            padding: 12px 15px 10px 15px;
            background: #ffffff;
            border-top: 2px solid #000000;
            border-radius: 0;
          }
          .company-title {
            font-size: 16px;
            font-weight: 800;
            margin-bottom: 8px;
            color: #000000;
            letter-spacing: 1.5px;
          }
          .company-address {
            font-size: 9px;
            color: #333333;
            margin: 3px 0;
            line-height: 1.4;
            font-weight: 500;
          }
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            html, body {
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
            }
            .container {
              width: 210mm;
              height: 297mm;
              border: none;
              padding: 15mm;
              margin: 0;
              box-sizing: border-box;
            }
            .header {
              page-break-inside: avoid;
            }
            .content {
              page-break-inside: avoid;
            }
            .footer {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="/kenergysave-logo.avif" alt="Company Logo" class="logo" />
            <div class="company-name">주식회사 제라</div>
            <div class="title">${certTypeKo}</div>
            <div class="title-en">${certTypeEn}</div>
            <div class="doc-number">문서번호 (Doc No.): ${request.requestNumber}</div>
          </div>
          
          <div class="content">
            <div class="info-row">
              <div class="info-label">
                성명
                <span class="info-label-en">Name</span>
              </div>
              <div class="info-value">${request.employeeName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">
                사번
                <span class="info-label-en">Employee ID</span>
              </div>
              <div class="info-value">${request.employeeId}</div>
            </div>

            <div class="purpose-section">
              <div class="purpose-title">발급 목적 <span style="color: #666666; font-weight: 600; font-size: 10px;">/ Purpose of Issuance</span></div>
              <div style="margin-top: 6px; font-size: 11px; color: #000000; font-weight: 500; line-height: 1.4;">${request.purpose}</div>
            </div>

            <div class="certification-text">
              <div class="certification-ko">
                상기 인은 본사의 정규 직원임을 증명합니다.<br/>
                <span style="font-size: 10px; color: #333333; margin-top: 4px; display: inline-block;">This is to certify that the above-mentioned person is a regular employee of our company.</span>
              </div>
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #cccccc;">
                <div class="certification-ko">
                  본 증명서는 요청된 용도로만 사용되며, 다른 용도로 사용할 수 없습니다.<br/>
                  <span style="font-size: 10px; color: #333333; margin-top: 4px; display: inline-block;">This certificate is valid only for the requested purpose and may not be used for any other purpose.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="issue-date">
              <div style="font-size: 10px; color: #666666; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Issue Date / 발급일</div>
              <div style="font-size: 14px; color: #000000;">${currentDate}</div>
              <div class="issue-date-en" style="margin-top: 3px;">${currentDateEn}</div>
            </div>

            <div class="company-info">
              <div class="company-title">주식회사 제라<span style="font-size: 11px; color: #666666; font-weight: 600; margin-left: 6px;">/ ZERA Co., Ltd</span></div>
              <div class="company-address" style="margin-top: 8px;">
                <div style="margin: 3px 0; font-size: 9px;"><strong style="color: #000000;">주소:</strong> 경기도 군포시 엘에스로166번길 16-10, 2층</div>
                <div style="margin: 3px 0; font-size: 9px;"><strong style="color: #000000;">Address:</strong> 2F, 16-10, 166beon-gil, Elseso-ro, Gunpo-si, Gyeonggi-do, Korea</div>
                <div style="margin: 3px 0; font-size: 9px;"><strong style="color: #000000;">전화 / Tel:</strong> +82 31-427-1380</div>
                <div style="margin: 3px 0; font-size: 9px;"><strong style="color: #000000;">이메일 / Email:</strong> info@zera-energy.com</div>
              </div>
            </div>
          </div>
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

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/hr/dashboard')} className="text-green-600 hover:text-green-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{t.salesOrders}</h1>
                  <p className="text-sm text-gray-600">{t.salesOrdersDesc}</p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '전체 요청' : 'Total Requests'}</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '승인완료' : 'Approved'}</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '대기중' : 'Pending'}</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '반려' : 'Rejected'}</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder={locale === 'ko' ? '요청번호, 이름 또는 ID 검색...' : 'Search request number, name or ID...'} 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" 
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
            <option value="all">{locale === 'ko' ? '모든 상태' : 'All Status'}</option>
            <option value="approved">{locale === 'ko' ? '승인완료' : 'Approved'}</option>
            <option value="pending">{locale === 'ko' ? '대기중' : 'Pending'}</option>
            <option value="rejected">{locale === 'ko' ? '반려' : 'Rejected'}</option>
          </select>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />{t.addNew}
          </button>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
            <h2 className="text-white font-bold text-lg">{t.salesOrders} ({filtered.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">No.</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '요청번호' : 'Request No.'}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '직원명' : 'Employee'}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '증명서 종류' : 'Certificate Type'}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '요청일' : 'Request Date'}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '필요일' : 'Required Date'}</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '수량' : 'Qty'}</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '상태' : 'Status'}</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '관리' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((request, idx) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{request.requestNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="font-medium">{request.employeeName}</div>
                      <div className="text-xs text-gray-500">{request.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{request.certificateType}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{request.requestDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{request.requiredDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-center">{request.quantity}</td>
                    <td className="px-6 py-4 text-center">{statusBadge(request.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedRequest(request)} className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        {request.status === 'approved' && (
                          <button 
                            onClick={() => handlePrint(request)} 
                            className="text-green-600 hover:text-green-800"
                            title={locale === 'ko' ? '인쇄' : 'Print'}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(request.id)} className="text-red-600 hover:text-red-800">
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

      {/* View Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{locale === 'ko' ? '요청 상세' : 'Request Details'}</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-white hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">{locale === 'ko' ? '요청번호' : 'Request No.'}</label>
                  <p className="text-lg font-semibold text-gray-800">{selectedRequest.requestNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{locale === 'ko' ? '상태' : 'Status'}</label>
                  <div className="mt-1">{statusBadge(selectedRequest.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">{locale === 'ko' ? '직원명' : 'Employee'}</label>
                  <p className="text-gray-800">{selectedRequest.employeeName} ({selectedRequest.employeeId})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{locale === 'ko' ? '증명서 종류' : 'Certificate Type'}</label>
                  <p className="text-gray-800">{selectedRequest.certificateType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">{locale === 'ko' ? '요청일' : 'Request Date'}</label>
                  <p className="text-gray-800">{selectedRequest.requestDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{locale === 'ko' ? '필요일' : 'Required Date'}</label>
                  <p className="text-gray-800">{selectedRequest.requiredDate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">{locale === 'ko' ? '수량' : 'Quantity'}</label>
                  <p className="text-gray-800">{selectedRequest.quantity} {locale === 'ko' ? '부' : 'copies'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{locale === 'ko' ? '용도' : 'Purpose'}</label>
                  <p className="text-gray-800">{selectedRequest.purpose}</p>
                </div>
              </div>
              {selectedRequest.approver && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">{locale === 'ko' ? '승인자' : 'Approver'}</label>
                    <p className="text-gray-800">{selectedRequest.approver}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">{locale === 'ko' ? '승인일' : 'Approval Date'}</label>
                    <p className="text-gray-800">{selectedRequest.approvalDate}</p>
                  </div>
                </div>
              )}
              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{locale === 'ko' ? '비고' : 'Notes'}</label>
                  <p className="text-gray-800 bg-yellow-50 p-3 rounded">{selectedRequest.notes}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              {selectedRequest.status === 'approved' && (
                <button 
                  onClick={() => handlePrint(selectedRequest)} 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  {locale === 'ko' ? '인쇄' : 'Print'}
                </button>
              )}
              <button onClick={() => setSelectedRequest(null)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                {locale === 'ko' ? '닫기' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{locale === 'ko' ? '새 인증서 요청' : 'New Certificate Request'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '직원명' : 'Employee Name'}</label>
                  <input value={newRequest.employeeName} onChange={e => setNewRequest({...newRequest, employeeName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '직원 ID' : 'Employee ID'}</label>
                  <input value={newRequest.employeeId} onChange={e => setNewRequest({...newRequest, employeeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '증명서 종류' : 'Certificate Type'}</label>
                <select value={newRequest.certificateType} onChange={e => setNewRequest({...newRequest, certificateType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  {certificateTypes.map((type, idx) => (
                    <option key={idx} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '요청일' : 'Request Date'}</label>
                  <input type="date" value={newRequest.requestDate} onChange={e => setNewRequest({...newRequest, requestDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '필요일' : 'Required Date'}</label>
                  <input type="date" value={newRequest.requiredDate} onChange={e => setNewRequest({...newRequest, requiredDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '수량' : 'Quantity'}</label>
                  <input type="number" min="1" value={newRequest.quantity} onChange={e => setNewRequest({...newRequest, quantity: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '용도' : 'Purpose'}</label>
                <textarea value={newRequest.purpose} onChange={e => setNewRequest({...newRequest, purpose: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                {locale === 'ko' ? '취소' : 'Cancel'}
              </button>
              <button onClick={handleCreate} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                {locale === 'ko' ? '요청' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
