'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  Printer,
} from 'lucide-react';

interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  paymentDate: string;
  paymentStatus: 'paid' | 'pending';
  // Year-to-date cumulative totals
  cumulativeIncome: number; // 누적 수입
  cumulativeTax: number; // 누적 세금
  cumulativeNationalPension: number; // 누적 국민연금
  cumulativeHealthInsurance: number; // 누적 건강보험
}

export default function SalaryPaymentsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];

  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Sample salary payment data
  const salaryPayments: SalaryPayment[] = [
    {
      id: 'PAY001',
      employeeId: 'EMP001',
      employeeName: locale === 'ko' ? '김민수' : 'Kim Min-su',
      department: 'hr',
      month: '2026-02',
      baseSalary: 5000000,
      bonus: 500000,
      deductions: 450000,
      netPay: 5050000,
      paymentDate: '2026-02-25',
      paymentStatus: 'paid',
      // Year-to-date cumulative (Jan + Feb 2026)
      cumulativeIncome: 11000000, // (5000000 + 500000) * 2 months
      cumulativeTax: 405000, // 450000 * 0.45 * 2 months
      cumulativeNationalPension: 198000, // 450000 * 0.22 * 2 months
      cumulativeHealthInsurance: 297000, // 450000 * 0.33 * 2 months
    },
    {
      id: 'PAY002',
      employeeId: 'EMP002',
      employeeName: locale === 'ko' ? '이수진' : 'Lee Su-jin',
      department: 'hr',
      month: '2026-02',
      baseSalary: 4000000,
      bonus: 300000,
      deductions: 350000,
      netPay: 3950000,
      paymentDate: '2026-02-25',
      paymentStatus: 'paid',
      cumulativeIncome: 8600000,
      cumulativeTax: 315000,
      cumulativeNationalPension: 154000,
      cumulativeHealthInsurance: 231000,
    },
    {
      id: 'PAY003',
      employeeId: 'EMP003',
      employeeName: locale === 'ko' ? '박지훈' : 'Park Ji-hoon',
      department: 'production',
      month: '2026-02',
      baseSalary: 4500000,
      bonus: 400000,
      deductions: 400000,
      netPay: 4500000,
      paymentDate: '2026-02-25',
      paymentStatus: 'paid',
      cumulativeIncome: 9800000,
      cumulativeTax: 360000,
      cumulativeNationalPension: 176000,
      cumulativeHealthInsurance: 264000,
    },
    {
      id: 'PAY004',
      employeeId: 'EMP004',
      employeeName: locale === 'ko' ? '최영희' : 'Choi Young-hee',
      department: 'quality',
      month: '2026-02',
      baseSalary: 3800000,
      bonus: 200000,
      deductions: 320000,
      netPay: 3680000,
      paymentDate: '2026-02-25',
      paymentStatus: 'paid',
      cumulativeIncome: 8000000,
      cumulativeTax: 288000,
      cumulativeNationalPension: 140800,
      cumulativeHealthInsurance: 211200,
    },
    {
      id: 'PAY005',
      employeeId: 'EMP005',
      employeeName: locale === 'ko' ? '정태영' : 'Jung Tae-young',
      department: 'rd',
      month: '2026-02',
      baseSalary: 5500000,
      bonus: 600000,
      deductions: 500000,
      netPay: 5600000,
      paymentDate: '2026-02-25',
      paymentStatus: 'paid',
      cumulativeIncome: 12200000,
      cumulativeTax: 450000,
      cumulativeNationalPension: 220000,
      cumulativeHealthInsurance: 330000,
    },
  ];

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

  const filteredPayments = salaryPayments.filter(payment => {
    const matchesDepartment = selectedDepartment === 'all' || payment.department === selectedDepartment;
    const matchesMonth = payment.month === selectedMonth;
    return matchesDepartment && matchesMonth;
  });

  const totalPayroll = filteredPayments.reduce((sum, payment) => sum + payment.netPay, 0);
  const totalBonus = filteredPayments.reduce((sum, payment) => sum + payment.bonus, 0);
  const totalDeductions = filteredPayments.reduce((sum, payment) => sum + payment.deductions, 0);

  // Calculate cumulative (YTD) totals from filtered payments
  const avgCumulativeIncome = filteredPayments.length > 0 
    ? filteredPayments.reduce((sum, payment) => sum + payment.cumulativeIncome, 0) / filteredPayments.length 
    : 0;
  const avgCumulativeTax = filteredPayments.length > 0
    ? filteredPayments.reduce((sum, payment) => sum + payment.cumulativeTax, 0) / filteredPayments.length
    : 0;
  const avgCumulativeNationalPension = filteredPayments.length > 0
    ? filteredPayments.reduce((sum, payment) => sum + payment.cumulativeNationalPension, 0) / filteredPayments.length
    : 0;
  const avgCumulativeHealthInsurance = filteredPayments.length > 0
    ? filteredPayments.reduce((sum, payment) => sum + payment.cumulativeHealthInsurance, 0) / filteredPayments.length
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(value);
  };

  const getDepartmentName = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : deptId;
  };

  const handlePrintSalarySlip = (payment: SalaryPayment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>급여 명세서 / Salary Slip - ${payment.employeeName}</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Noto Sans KR', Arial, sans-serif;
            padding: 10px;
            background: white;
            font-size: 11px;
          }
          .slip-container {
            max-width: 100%;
            min-height: auto;
            border: 3px solid #2563eb;
            padding: 20px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .logo {
            display: block;
            margin: 0 auto 10px auto;
            width: 100px;
            height: 100px;
            object-fit: contain;
            object-position: center;
            filter: contrast(1.1) brightness(1.05);
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 12px;
          }
          .company-name {
            font-size: 14px;
            font-weight: bold;
            color: #000000;
            letter-spacing: 1.5px;
            margin-bottom: 5px;
          }
          .company-name-en {
            font-size: 11px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 8px;
          }
          .slip-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 5px;
          }
          .bilingual {
            font-size: 11px;
            color: #64748b;
            margin-top: 3px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: left;
          }
          th {
            background: #f1f5f9;
            font-weight: 600;
            font-size: 10px;
            color: #475569;
          }
          td {
            font-size: 10px;
          }
          .info-table th {
            width: 35%;
            background: #dbeafe;
          }
          .salary-table th {
            text-align: center;
            background: #3b82f6;
            color: white;
          }
          .salary-table td {
            text-align: right;
            font-weight: 600;
          }
          .salary-table td:first-child {
            text-align: left;
          }
          .total-row {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            font-weight: bold;
          }
          .total-row td {
            color: white;
            font-size: 12px;
          }
          .positive {
            color: #16a34a;
          }
          .negative {
            color: #dc2626;
          }
          .cumulative-section {
            margin-top: 12px;
            padding: 10px;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 6px;
          }
          .cumulative-title {
            font-size: 11px;
            font-weight: bold;
            color: #475569;
            margin-bottom: 8px;
            text-align: center;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
          }
          .cumulative-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .cumulative-item {
            background: white;
            padding: 6px 8px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
          }
          .cumulative-label {
            font-size: 9px;
            color: #64748b;
            margin-bottom: 2px;
          }
          .cumulative-value {
            font-size: 11px;
            font-weight: bold;
            color: #1e40af;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
          }
          .signature {
            text-align: right;
          }
          .signature-label {
            font-size: 9px;
            color: #64748b;
            margin-bottom: 3px;
          }
          .signature-line {
            display: inline-block;
            width: 120px;
            border-bottom: 1px solid #000;
            margin-left: 10px;
          }
          .print-date {
            font-size: 8px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="slip-container">
          <div class="header">
            <img src="/kenergysave-logo.avif" alt="Company Logo" class="logo" />
            <div class="company-name">주식회사 제라</div>
            <div class="company-name-en">K-Energy Co., Ltd. (Group of Zera)</div>
            <div class="slip-title">급여 명세서 / Salary Slip</div>
            <div class="bilingual">${payment.month}</div>
          </div>

          <table class="info-table">
            <tr>
              <th>직원명 / Employee Name</th>
              <td colspan="3">${payment.employeeName}</td>
            </tr>
            <tr>
              <th>사번 / Employee ID</th>
              <td>${payment.employeeId}</td>
              <th>부서 / Department</th>
              <td>${getDepartmentName(payment.department)}</td>
            </tr>
            <tr>
              <th>지급월 / Payment Period</th>
              <td>${payment.month}</td>
              <th>지급일 / Payment Date</th>
              <td>${payment.paymentDate}</td>
            </tr>
          </table>

          <table class="salary-table">
            <thead>
              <tr>
                <th>항목 / Item</th>
                <th>금액 / Amount (₩)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>기본급 / Base Salary</td>
                <td>₩${formatCurrency(payment.baseSalary)}</td>
              </tr>
              <tr>
                <td class="positive">근태수당 / Attendance Bonus (+)</td>
                <td class="positive">+₩${formatCurrency(payment.bonus)}</td>
              </tr>
              <tr>
                <td class="negative">건강보험료 / Health Insurance (-)</td>
                <td class="negative">-₩${formatCurrency(Math.round(payment.deductions * 0.33))}</td>
              </tr>
              <tr>
                <td class="negative">국민연금 / National Pension (-)</td>
                <td class="negative">-₩${formatCurrency(Math.round(payment.deductions * 0.22))}</td>
              </tr>
              <tr>
                <td class="negative">소득세 / Income Tax (-)</td>
                <td class="negative">-₩${formatCurrency(Math.round(payment.deductions * 0.45))}</td>
              </tr>
              <tr class="total-row">
                <td>실수령액 / Net Pay</td>
                <td>₩${formatCurrency(payment.netPay)}</td>
              </tr>
            </tbody>
          </table>

          <div class="cumulative-section">
            <div class="cumulative-title">연간 누적 통계 (Year-to-Date Cumulative)</div>
            <div class="cumulative-grid">
              <div class="cumulative-item">
                <div class="cumulative-label">누적 수입 / Cumulative Income</div>
                <div class="cumulative-value">₩${formatCurrency(payment.cumulativeIncome)}</div>
              </div>
              <div class="cumulative-item">
                <div class="cumulative-label">누적 건강보험 / Cumulative Health Ins.</div>
                <div class="cumulative-value">₩${formatCurrency(payment.cumulativeHealthInsurance)}</div>
              </div>
              <div class="cumulative-item">
                <div class="cumulative-label">누적 국민연금 / Cumulative Nat. Pension</div>
                <div class="cumulative-value">₩${formatCurrency(payment.cumulativeNationalPension)}</div>
              </div>
              <div class="cumulative-item">
                <div class="cumulative-label">누적 세금 / Cumulative Tax</div>
                <div class="cumulative-value">₩${formatCurrency(payment.cumulativeTax)}</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="print-date">
              발급일 / Issued: ${new Date().toLocaleDateString('ko-KR')}
            </div>
            <div class="signature">
              <div class="signature-label">확인 (서명) / Confirmed (Signature)</div>
              <span class="signature-line"></span>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {t.salaryPayments}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t.salaryPaymentsDesc}
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
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                {locale === 'ko' ? '월 선택' : 'Select Month'}
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
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
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '총 급여' : 'Total Payroll'}</p>
                <p className="text-2xl font-bold text-blue-600">₩{formatCurrency(totalPayroll)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '총 상여금' : 'Total Bonus'}</p>
                <p className="text-2xl font-bold text-green-600">₩{formatCurrency(totalBonus)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '총 공제액' : 'Total Deductions'}</p>
                <p className="text-2xl font-bold text-red-600">₩{formatCurrency(totalDeductions)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{locale === 'ko' ? '지급 인원' : 'Employees Paid'}</p>
                <p className="text-3xl font-bold text-purple-600">{filteredPayments.length}</p>
              </div>
              <Users className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Year-to-Date (YTD) Cumulative Statistics */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            {locale === 'ko' ? '연간 누적 통계 (YTD)' : 'Year-to-Date Cumulative Statistics'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">
                {locale === 'ko' ? '평균 누적 수입' : 'Avg. Cumulative Income'}
              </p>
              <p className="text-2xl font-bold">₩{formatCurrency(Math.round(avgCumulativeIncome))}</p>
              <p className="text-xs opacity-75 mt-1">
                {locale === 'ko' ? '급여 + 상여금 누적' : 'Salary + Bonus YTD'}
              </p>
            </div>

            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">
                {locale === 'ko' ? '평균 누적 건강보험' : 'Avg. Cumulative Health Ins.'}
              </p>
              <p className="text-2xl font-bold">₩{formatCurrency(Math.round(avgCumulativeHealthInsurance))}</p>
              <p className="text-xs opacity-75 mt-1">
                {locale === 'ko' ? '건강보험료 누적' : 'Health Insurance YTD'}
              </p>
            </div>

            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">
                {locale === 'ko' ? '평균 누적 국민연금' : 'Avg. Cumulative Nat. Pension'}
              </p>
              <p className="text-2xl font-bold">₩{formatCurrency(Math.round(avgCumulativeNationalPension))}</p>
              <p className="text-xs opacity-75 mt-1">
                {locale === 'ko' ? '국민연금 누적' : 'National Pension YTD'}
              </p>
            </div>

            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">
                {locale === 'ko' ? '평균 누적 세금' : 'Avg. Cumulative Tax'}
              </p>
              <p className="text-2xl font-bold">₩{formatCurrency(Math.round(avgCumulativeTax))}</p>
              <p className="text-xs opacity-75 mt-1">
                {locale === 'ko' ? '소득세 누적' : 'Income Tax YTD'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {locale === 'ko' ? '결제 ID' : 'Payment ID'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {locale === 'ko' ? '직원' : 'Employee'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {t.department}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    {locale === 'ko' ? '기본급' : 'Base Salary'}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    {locale === 'ko' ? '상여금' : 'Bonus'}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    {locale === 'ko' ? '공제액' : 'Deductions'}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    {locale === 'ko' ? '실수령액' : 'Net Pay'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {locale === 'ko' ? '지급일' : 'Payment Date'}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    {t.paymentStatus}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    {locale === 'ko' ? '인쇄' : 'Print'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment, index) => (
                    <tr
                      key={payment.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {payment.id}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900">{payment.employeeName}</div>
                          <div className="text-xs text-gray-500">{payment.employeeId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {getDepartmentName(payment.department)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-700">
                        ₩{formatCurrency(payment.baseSalary)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-green-600 font-medium">
                        +₩{formatCurrency(payment.bonus)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-red-600 font-medium">
                        -₩{formatCurrency(payment.deductions)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-blue-600">
                        ₩{formatCurrency(payment.netPay)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {payment.paymentDate}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.paymentStatus === 'paid' ? t.paid : t.unpaid}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handlePrintSalarySlip(payment)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors inline-flex items-center justify-center"
                          title={locale === 'ko' ? '급여 명세서 인쇄' : 'Print Salary Slip'}
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      {t.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
