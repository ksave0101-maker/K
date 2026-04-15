'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  FileText,
  ArrowLeft,
  Building2,
  Calendar,
  Package,
  DollarSign,
  CreditCard,
  Banknote,
  Save,
  Send
} from 'lucide-react';

export default function InvoicesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  
  const [selectedContract, setSelectedContract] = useState('DSC-2026-002');
  const [invoiceData, setInvoiceData] = useState({
    issueDate: '2026-02-15',
    paymentDueDate: '',
    quantity: 200,
    unitPrice: 9000000,
    paymentMethod: 'bank_transfer',
    notes: 'Sales Contract: DSC-2026-002 | 국내 | 부산/경남'
  });

  const contracts = [
    {
      id: 'DSC-2026-002',
      customer: '삼성중공업 (Samsung Heavy Industries)',
      customerEn: 'Samsung Heavy Industries',
      product: '에너지 절감 장치 A200',
      productEn: 'Energy Saving Device A200',
      region: '국내',
      location: '부산/경남'
    },
    {
      id: 'DSC-2026-001',
      customer: 'LG화학 (LG Chem)',
      customerEn: 'LG Chem',
      product: '에너지 절감 장치 B150',
      productEn: 'Energy Saving Device B150',
      region: '국내',
      location: '서울'
    },
    {
      id: 'DSC-2026-003',
      customer: 'SK건설 (SK E&C)',
      customerEn: 'SK E&C',
      product: '에너지 절감 장치 C300',
      productEn: 'Energy Saving Device C300',
      region: '국내',
      location: '인천'
    }
  ];

  const selectedContractData = contracts.find(c => c.id === selectedContract);

  const handleInputChange = (field: string, value: any) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    return invoiceData.quantity * invoiceData.unitPrice;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/domestic-market/dashboard')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {locale === 'ko' ? '새 인보이스 추가' : 'Add New Invoice'}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {locale === 'ko' ? '판매 계약 기반 인보이스 생성' : 'Create invoice based on sales contract'}
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Contract Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              {locale === 'ko' ? '판매 계약 선택' : 'Select Sales Contract'}
            </h2>
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.id} | {contract.customer} | {contract.product}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3">
                  {locale === 'ko' ? '고객' : 'Customer'}
                </h3>
                <p className="text-lg font-medium text-gray-900">
                  {selectedContractData?.customer}
                </p>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {locale === 'ko' ? '발행일' : 'Issue Date'}
                  </label>
                  <input
                    type="date"
                    value={invoiceData.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {locale === 'ko' ? '결제 기한' : 'Payment Due Date'}
                  </label>
                  <input
                    type="date"
                    value={invoiceData.paymentDueDate}
                    onChange={(e) => handleInputChange('paymentDueDate', e.target.value)}
                    placeholder="dd/mm/yyyy"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Item Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-500" />
                  {locale === 'ko' ? '제품 정보' : 'Item Details'}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'ko' ? '제품명' : 'Item Name'}
                    </label>
                    <p className="text-gray-900 font-medium">{selectedContractData?.product}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ko' ? '수량' : 'Quantity'}
                      </label>
                      <input
                        type="number"
                        value={invoiceData.quantity}
                        onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'ko' ? '단위' : 'Unit'}
                      </label>
                      <input
                        type="text"
                        value="pcs"
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'ko' ? '단가' : 'Unit Price'}
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">₩</span>
                      <input
                        type="number"
                        value={invoiceData.unitPrice}
                        onChange={(e) => handleInputChange('unitPrice', parseInt(e.target.value))}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  {locale === 'ko' ? '결제 방법' : 'Payment Method'}
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={invoiceData.paymentMethod === 'bank_transfer'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="mr-3"
                    />
                    <Banknote className="w-5 h-5 text-blue-500 mr-2" />
                    <span>ชำระด้วยการโอน (Bank Transfer)</span>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={invoiceData.paymentMethod === 'credit_card'}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="mr-3"
                    />
                    <CreditCard className="w-5 h-5 text-purple-500 mr-2" />
                    <span>ชำระด้วยบัตรเครดิต (Credit Card Payment)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ko' ? '비고' : 'Notes'}
            </label>
            <textarea
              value={invoiceData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Sales Contract: DSC-2026-002 | 국내 | 부산/경남"
            />
          </div>

          {/* Total Amount */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">
                {locale === 'ko' ? '총 금액' : 'Total Amount'}
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ₩{formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={() => router.push('/domestic-market/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {locale === 'ko' ? '취소' : 'Cancel'}
            </button>
            
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              {locale === 'ko' ? '임시저장' : 'Save Draft'}
            </button>
            
            <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" />
              {locale === 'ko' ? '인보이스 발송' : 'Send Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}