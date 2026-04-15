'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, ClipboardCheck, Plus, Eye, Trash2, X, Search as SearchIcon, Printer, FileDown, Users, Building2, FileText } from 'lucide-react';

interface SalesApproval {
  id: number;
  approvalNumber: string;
  region: string;
  productName: string;
  quantity: number;
  amount: number;
  requestedBy: string;
  approvedBy: string;
  approvalDate: string;
  status: 'approved' | 'pending' | 'rejected';
  remarks: string;
}

export default function DomesticSalesApprovalsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<SalesApproval | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<SalesApproval | null>(null);

  const regions = locale === 'ko'
    ? [{ key: 'seoul', name: '서울/경기' }, { key: 'busan', name: '부산/경남' }, { key: 'daegu', name: '대구/경북' }, { key: 'daejeon', name: '대전/충청' }, { key: 'gwangju', name: '광주/전라' }, { key: 'incheon', name: '인천/강원' }, { key: 'jeju', name: '제주' }]
    : [{ key: 'seoul', name: 'Seoul/Gyeonggi' }, { key: 'busan', name: 'Busan/Gyeongnam' }, { key: 'daegu', name: 'Daegu/Gyeongbuk' }, { key: 'daejeon', name: 'Daejeon/Chungcheong' }, { key: 'gwangju', name: 'Gwangju/Jeolla' }, { key: 'incheon', name: 'Incheon/Gangwon' }, { key: 'jeju', name: 'Jeju' }];

  // Customer data
  const customers = [
    { id: 1, name: 'Kim Minjun', company: '삼성전자', phone: '010-1234-5678', region: 'seoul' },
    { id: 2, name: 'Choi Donghyun', company: 'LG에너지솔루션', phone: '010-2345-6789', region: 'busan' },
    { id: 3, name: 'Son Heungmin', company: '현대자동차', phone: '010-3456-7890', region: 'daejeon' },
    { id: 4, name: 'Hwang Heemin', company: 'SK하이닉스', phone: '010-4567-8901', region: 'gwangju' },
    { id: 5, name: 'Jung Wooyoung', company: '포스코', phone: '010-5678-9012', region: 'seoul' },
    { id: 6, name: 'Bae Suzy', company: 'NAVER', phone: '010-6789-0123', region: 'daegu' },
    { id: 7, name: 'Lee Seunghyun', company: '카카오', phone: '010-7890-1234', region: 'incheon' },
    { id: 8, name: 'Ko Changseok', company: '제주항공', phone: '010-8901-2345', region: 'jeju' }
  ];

  // Dealer data
  const dealers = [
    { id: 1, name: 'GreenTech Solutions', contact: 'Park Jihye', phone: '02-1234-5678', region: 'seoul', type: 'wholesale' },
    { id: 2, name: 'EcoFriendly Systems', contact: 'Lee Kangin', phone: '051-2345-6789', region: 'busan', type: 'retail' },
    { id: 3, name: 'Solar Plus Korea', contact: 'Kim Yeji', phone: '042-3456-7890', region: 'daejeon', type: 'installation' },
    { id: 4, name: 'Energy Future Co.', contact: 'Choi Yuna', phone: '062-4567-8901', region: 'gwangju', type: 'distribution' },
    { id: 5, name: 'Smart Energy Hub', contact: 'Park Seonjin', phone: '02-5678-9012', region: 'seoul', type: 'wholesale' },
    { id: 6, name: 'Renewable Power Ltd.', contact: 'Kim Minjun', phone: '053-6789-0123', region: 'daegu', type: 'retail' }
  ];

  // Product data
  const products = [
    { id: 1, name: 'K-Energy Solar Panel 500W', price: 1800000, category: 'Solar', unit: 'ea' },
    { id: 2, name: 'Smart Inverter SI-3000', price: 1850000, category: 'Inverter', unit: 'ea' },
    { id: 3, name: 'Battery Storage BS-500', price: 3500000, category: 'Storage', unit: 'ea' },
    { id: 4, name: 'LED Lighting Module LM-100', price: 90000, category: 'Lighting', unit: 'ea' },
    { id: 5, name: 'EV Charger EC-300', price: 2400000, category: 'Charger', unit: 'ea' },
    { id: 6, name: 'Power Monitoring System PMS', price: 2500000, category: 'Monitoring', unit: 'ea' },
    { id: 7, name: 'Solar Controller SC-200', price: 450000, category: 'Controller', unit: 'ea' },
    { id: 8, name: 'Transformer T-5000', price: 90000000, category: 'Transformer', unit: 'ea' },
    { id: 9, name: 'Energy Audit Kit EAK-1', price: 900000, category: 'Audit', unit: 'set' }
  ];

  const [items, setItems] = useState<SalesApproval[]>([
    { id: 1, approvalNumber: 'DSA-2026-001', region: 'seoul', productName: 'K-Energy Solar Panel 500W', quantity: 300, amount: 540000000, requestedBy: 'Kim Minjun', approvedBy: 'Park Jihye', approvalDate: '2026-02-15', status: 'approved', remarks: '강남구 대형 빌딩 옥상 설치 프로젝트' },
    { id: 2, approvalNumber: 'DSA-2026-002', region: 'busan', productName: 'Smart Inverter SI-3000', quantity: 150, amount: 277500000, requestedBy: 'Choi Donghyun', approvedBy: '-', approvalDate: '2026-02-14', status: 'pending', remarks: '해운대 신축 아파트 단지 설치' },
    { id: 3, approvalNumber: 'DSA-2026-003', region: 'daejeon', productName: 'Battery Storage BS-500', quantity: 50, amount: 175000000, requestedBy: 'Son Heungmin', approvedBy: 'Lee Kangin', approvalDate: '2026-02-13', status: 'approved', remarks: '대덕연구단지 에너지 저장 시스템' },
    { id: 4, approvalNumber: 'DSA-2026-004', region: 'gwangju', productName: 'LED Lighting Module LM-100', quantity: 800, amount: 72000000, requestedBy: 'Hwang Heemin', approvedBy: '-', approvalDate: '2026-02-12', status: 'pending', remarks: '전남 공공기관 LED 교체 사업' },
    { id: 5, approvalNumber: 'DSA-2026-005', region: 'seoul', productName: 'EV Charger EC-300', quantity: 120, amount: 288000000, requestedBy: 'Jung Wooyoung', approvedBy: 'Kim Yeji', approvalDate: '2026-02-11', status: 'approved', remarks: '수도권 고속도로 휴게소 충전기 설치' },
    { id: 6, approvalNumber: 'DSA-2026-006', region: 'daegu', productName: 'Power Monitoring System PMS', quantity: 25, amount: 62500000, requestedBy: 'Bae Suzy', approvedBy: '-', approvalDate: '2026-02-10', status: 'rejected', remarks: '예산 초과 - 2분기 재신청 필요' },
    { id: 7, approvalNumber: 'DSA-2026-007', region: 'incheon', productName: 'Solar Controller SC-200', quantity: 200, amount: 90000000, requestedBy: 'Lee Seunghyun', approvedBy: 'Choi Yuna', approvalDate: '2026-02-09', status: 'approved', remarks: '인천공항 주변 태양광 발전소' },
    { id: 8, approvalNumber: 'DSA-2026-008', region: 'jeju', productName: 'K-Energy Solar Panel 500W', quantity: 500, amount: 900000000, requestedBy: 'Ko Changseok', approvedBy: 'Park Seonjin', approvalDate: '2026-02-08', status: 'approved', remarks: '제주도 신재생에너지 프로젝트' },
    { id: 9, approvalNumber: 'DSA-2026-009', region: 'busan', productName: 'Transformer T-5000', quantity: 8, amount: 720000000, requestedBy: 'Park Jihoon', approvedBy: '-', approvalDate: '2026-02-07', status: 'pending', remarks: '기장군 산업단지 변압기 교체' },
    { id: 10, approvalNumber: 'DSA-2026-010', region: 'seoul', productName: 'Energy Audit Kit EAK-1', quantity: 30, amount: 27000000, requestedBy: 'Yoo Jaesung', approvedBy: 'Kim Minjun', approvalDate: '2026-02-06', status: 'approved', remarks: '서울시 에너지 감사 장비 공급' },
  ]);

  const [newItem, setNewItem] = useState({ 
    region: 'seoul', 
    customerId: '', 
    dealerId: '', 
    productId: '', 
    productName: '', 
    quantity: 1, 
    unitPrice: 0,
    amount: 0, 
    requestedBy: '', 
    remarks: '' 
  });
  const [newCustomer, setNewCustomer] = useState({ name: '', companyName: '', email: '', phone: '', address: '', region: 'seoul', contactPerson: '', notes: '' });
  const [newDealer, setNewDealer] = useState({ dealerName: '', companyName: '', email: '', phone: '', address: '', region: 'seoul', contactPerson: '', businessType: '', notes: '' });

  const formatCurrency = (v: number) => '₩' + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700' };
    const label: Record<string, string> = { approved: t.approved, pending: t.pending, rejected: t.rejected };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const filtered = items.filter(o => {
    const matchSearch = o.approvalNumber.toLowerCase().includes(searchTerm.toLowerCase()) || o.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion = regionFilter === 'all' || o.region === regionFilter;
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchRegion && matchStatus;
  });

  const handleDelete = (id: number) => {
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setItems(items.filter(o => o.id !== id));
    }
  };

  const generateReportContent = (item: SalesApproval) => {
    const currentDate = new Date().toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US');
    const statusText = item.status === 'approved' ? (locale === 'ko' ? '승인됨' : 'Approved') :
                      item.status === 'pending' ? (locale === 'ko' ? '대기중' : 'Pending') :
                      (locale === 'ko' ? '거절됨' : 'Rejected');
    
    return {
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${t.salesApprovals} - ${item.approvalNumber}</title>
            <meta charset="UTF-8">
            <style>
              @page { size: A4; margin: 0; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; 
                background: white; 
                padding: 12mm; 
                color: #1a1a1a; 
              }
              @media print {
                body { padding: 8mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
              .container { 
                background: white; 
                max-width: 210mm; 
                margin: 0 auto; 
                padding: 18px; 
              }
              .header { 
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
                padding: 16px; 
                border-radius: 10px 10px 0 0; 
                color: white; 
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
              }
              .logo-section { 
                display: flex; 
                align-items: center; 
                gap: 12px; 
              }
              .logo { 
                width: 60px; 
                height: 60px; 
                background: white; 
                border-radius: 8px; 
                padding: 8px; 
                object-fit: contain; 
                object-position: center; 
              }
              .company-name { 
                font-size: 20px; 
                font-weight: 900; 
                letter-spacing: 1px; 
              }
              .company-name-en { 
                font-size: 13px; 
                font-weight: 700; 
                color: rgba(255,255,255,0.95); 
                margin-bottom: 6px; 
                letter-spacing: 0.8px; 
              }
              .company-info { 
                font-size: 10px; 
                color: #000000; 
                line-height: 1.5; 
                background: rgba(255,255,255,0.92); 
                padding: 10px 12px; 
                border-radius: 6px; 
                margin-top: 8px; 
              }
              .approval-badge { 
                background: white; 
                padding: 10px 15px; 
                border-radius: 6px; 
                text-align: right; 
                box-shadow: 0 3px 10px rgba(0,0,0,0.08); 
              }
              .approval-title { 
                font-size: 20px; 
                font-weight: 900; 
                color: #2563eb; 
                margin-bottom: 4px; 
              }
              .approval-title-en { 
                font-size: 11px; 
                color: #666; 
                font-weight: 600; 
              }
              .approval-number { 
                font-size: 14px; 
                color: #2563eb; 
                font-weight: 800; 
                margin-top: 6px; 
              }
              .info-section { 
                margin-top: 18px; 
                display: grid; 
                grid-template-columns: repeat(2, 1fr); 
                gap: 12px; 
              }
              .info-box { 
                background: linear-gradient(to right, #eff6ff 0%, #dbeafe 100%); 
                padding: 12px; 
                border-radius: 8px; 
                border-left: 4px solid #2563eb; 
              }
              .info-label { 
                font-size: 9px; 
                color: #666; 
                margin-bottom: 4px; 
                font-weight: 600; 
                text-transform: uppercase; 
                letter-spacing: 0.5px; 
              }
              .info-value { 
                font-size: 13px; 
                font-weight: 700; 
                color: #1a1a1a; 
              }
              .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 12px;
                text-transform: uppercase;
                ${item.status === 'approved' ? 'background: #dcfce7; color: #166534;' :
                  item.status === 'pending' ? 'background: #fef3c7; color: #d97706;' :
                  'background: #fecaca; color: #dc2626;'}
              }
              .total-section { 
                margin-top: 18px; 
                background: linear-gradient(to right, #eff6ff 0%, #dbeafe 100%); 
                padding: 14px; 
                border-radius: 8px; 
              }
              .total-row { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 12px; 
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
                border-radius: 6px; 
                color: white;
              }
              .total-label { 
                font-size: 16px; 
                font-weight: 800; 
                letter-spacing: 0.5px; 
              }
              .total-value { 
                font-size: 20px; 
                font-weight: 900; 
              }
              .remarks-section {
                margin-top: 18px;
                padding: 14px;
                background: linear-gradient(to right, #eff6ff 0%, #dbeafe 100%);
                border-left: 4px solid #2563eb;
                border-radius: 0 8px 8px 0;
              }
              .remarks-title {
                font-size: 12px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .remarks-content {
                font-size: 11px;
                color: #1a1a1a;
                line-height: 1.6;
              }
              .footer { 
                margin-top: 20px; 
                padding-top: 14px; 
                border-top: 2px solid #dbeafe; 
                text-align: center; 
                color: #999; 
                font-size: 9px; 
                line-height: 1.6; 
              }
              .print-date { 
                color: #666; 
                font-weight: 600; 
                margin-bottom: 4px; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo-section">
                  <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/AMqDpBqx0RHlW36D/kenergysave-logo-m6L2JxknygHwL0Bj.png" alt="Company Logo" class="logo">
                  <div>
                    <div class="company-name">${locale === 'ko' ? '주식회사 제라' : 'ZERA Co., Ltd'}</div>
                    <div class="company-name-en">${locale === 'ko' ? 'ZERA Co., Ltd' : '주식회사 제라'}</div>
                    <div class="company-info">
                      <strong>${locale === 'ko' ? '주소' : 'Address'}:</strong> ${locale === 'ko' ? '경기도 군포시 엘에스로166번길 16-10, 2층' : '2F, 16-10, 166beon-gil, Elseso-ro, Gunpo-si, Gyeonggi-do, Korea'}<br>
                      <strong>${locale === 'ko' ? '전화' : 'Tel'}:</strong> +82 31-427-1380 | <strong>${locale === 'ko' ? '이메일' : 'Email'}:</strong> info@zera-energy.com<br>
                      <strong>Website:</strong> www.zera-energy.com
                    </div>
                  </div>
                </div>
                <div class="approval-badge">
                  <div class="approval-title">${locale === 'ko' ? '판매승인서' : 'SALES APPROVAL'}</div>
                  <div class="approval-title-en">${locale === 'ko' ? 'Sales Approval' : '판매승인서'}</div>
                  <div class="approval-number">${item.approvalNumber}</div>
                </div>
              </div>
              
              <div class="info-section">
                <div class="info-box">
                  <div class="info-label">${t.region}</div>
                  <div class="info-value">${regions.find(r => r.key === item.region)?.name}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">${t.requestedBy}</div>
                  <div class="info-value">${item.requestedBy}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">${t.approvalDate}</div>
                  <div class="info-value">${item.approvalDate}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">${t.approved}</div>
                  <div class="info-value"><span class="status-badge">${statusText}</span></div>
                </div>
                <div class="info-box">
                  <div class="info-label">${t.productName}</div>
                  <div class="info-value">${item.productName}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">${t.quantity}</div>
                  <div class="info-value">${item.quantity.toLocaleString()}</div>
                </div>
              </div>
              
              <div class="total-section">
                <div class="total-row">
                  <span class="total-label">${t.amount}</span>
                  <span class="total-value">${formatCurrency(item.amount)}</span>
                </div>
              </div>
              
              ${item.remarks ? `
                <div class="remarks-section">
                  <div class="remarks-title">${t.remarks}</div>
                  <div class="remarks-content">${item.remarks}</div>
                </div>
              ` : ''}
              
              <div class="footer">
                <div class="print-date">${locale === 'ko' ? '출력일' : 'Print Date'}: ${currentDate}</div>
                <p>${locale === 'ko' ? '본 문서는 시스템에서 자동 생성되었습니다' : 'This document was automatically generated by the system'}</p>
                <p>${locale === 'ko' ? '문의사항: +82 31-427-1380 | info@zera-energy.com' : 'Contact: +82 31-427-1380 | info@zera-energy.com'}</p>
              </div>
            </div>
          </body>
        </html>
      `,
      statusText,
      currentDate
    };
  };

  const handlePrintSingle = (item: SalesApproval) => {
    const { html } = generateReportContent(item);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handlePreview = (item: SalesApproval) => {
    setPreviewItem(item);
    setIsPreviewModalOpen(true);
  };

  const handleExportPDF = (item: SalesApproval) => {
    const { html } = generateReportContent(item);
    
    // Create a temporary window for PDF export
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Use browser's built-in print to PDF functionality
      printWindow.onload = () => {
        printWindow.focus();
        // This will open the print dialog where user can select "Save as PDF"
        printWindow.print();
      };
    }
  };

  const handleCreate = () => {
    const selectedCustomer = customers.find(c => c.id === Number(newItem.customerId));
    const selectedDealer = dealers.find(d => d.id === Number(newItem.dealerId));
    const selectedProduct = products.find(p => p.id === Number(newItem.productId));
    
    const newId = Math.max(...items.map(o => o.id)) + 1;
    setItems([...items, {
      id: newId,
      approvalNumber: `DSA-2026-${String(newId).padStart(3, '0')}`,
      region: newItem.region,
      productName: selectedProduct?.name || newItem.productName,
      quantity: newItem.quantity,
      amount: newItem.amount,
      requestedBy: selectedCustomer?.name || newItem.requestedBy,
      approvedBy: '-',
      approvalDate: '2026-02-15',
      status: 'pending',
      remarks: `${locale === 'ko' ? '고객' : 'Customer'}: ${selectedCustomer?.company || 'N/A'}, ${locale === 'ko' ? '딜러' : 'Dealer'}: ${selectedDealer?.name || 'N/A'}${newItem.remarks ? ` - ${newItem.remarks}` : ''}`,
    }]);
    setIsAddModalOpen(false);
    setNewItem({ 
      region: 'seoul', 
      customerId: '', 
      dealerId: '', 
      productId: '', 
      productName: '', 
      quantity: 1, 
      unitPrice: 0,
      amount: 0, 
      requestedBy: '', 
      remarks: '' 
    });
  };

  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === Number(productId));
    if (selectedProduct) {
      const amount = selectedProduct.price * newItem.quantity;
      setNewItem({
        ...newItem,
        productId,
        productName: selectedProduct.name,
        unitPrice: selectedProduct.price,
        amount
      });
    }
  };

  const handleQuantityChange = (quantity: number) => {
    const amount = newItem.unitPrice * quantity;
    setNewItem({
      ...newItem,
      quantity,
      amount
    });
  };

  const handleCustomerChange = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === Number(customerId));
    if (selectedCustomer) {
      setNewItem({
        ...newItem,
        customerId,
        requestedBy: selectedCustomer.name,
        region: selectedCustomer.region
      });
    }
  };

  const handleCreateCustomer = () => {
    // In a real app, this would make an API call
    console.log('Creating customer:', newCustomer);
    setIsCustomerModalOpen(false);
    setNewCustomer({ name: '', companyName: '', email: '', phone: '', address: '', region: 'seoul', contactPerson: '', notes: '' });
    alert(locale === 'ko' ? '고객이 성공적으로 추가되었습니다!' : 'Customer added successfully!');
  };

  const handleCreateDealer = () => {
    // In a real app, this would make an API call
    console.log('Creating dealer:', newDealer);
    setIsDealerModalOpen(false);
    setNewDealer({ dealerName: '', companyName: '', email: '', phone: '', address: '', region: 'seoul', contactPerson: '', businessType: '', notes: '' });
    alert(locale === 'ko' ? '딜러가 성공적으로 추가되었습니다!' : 'Dealer added successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-300">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/domestic-market/dashboard')} className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{t.salesApprovals}</h1>
                  <p className="text-xs text-gray-500">🇰🇷 {t.domesticMarket}</p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={t.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">{t.allRegions}</option>
              {regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">{t.filter}</option>
              <option value="approved">{t.approved}</option>
              <option value="pending">{t.pending}</option>
              <option value="rejected">{t.rejected}</option>
            </select>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />{t.addNew}
            </button>
            <button onClick={() => setIsCustomerModalOpen(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Users className="w-4 h-4" />{t.newCustomer}
            </button>
            <button onClick={() => setIsDealerModalOpen(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              <Building2 className="w-4 h-4" />{t.newDealer}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.approvalNumber}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.region}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.productName}</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.quantity}</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t.amount}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.requestedBy}</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t.approvalDate}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.approved}</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.edit}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{item.approvalNumber}</td>
                    <td className="px-4 py-3 text-sm">{regions.find(r => r.key === item.region)?.name}</td>
                    <td className="px-4 py-3 text-sm">{item.productName}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-3 text-sm">{item.requestedBy}</td>
                    <td className="px-4 py-3 text-sm">{item.approvalDate}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedItem(item)} className="text-blue-500 hover:text-blue-700" title="View Details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handlePreview(item)} className="text-indigo-500 hover:text-indigo-700" title="Preview Report"><FileText className="w-4 h-4" /></button>
                        <button onClick={() => handlePrintSingle(item)} className="text-green-500 hover:text-green-700" title="Print Report"><Printer className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">{t.noData}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{t.viewDetails}</h2>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">{t.approvalNumber}</p><p className="font-medium">{selectedItem.approvalNumber}</p></div>
                <div><p className="text-xs text-gray-500">{t.region}</p><p className="font-medium">{regions.find(r => r.key === selectedItem.region)?.name}</p></div>
                <div><p className="text-xs text-gray-500">{t.productName}</p><p className="font-medium">{selectedItem.productName}</p></div>
                <div><p className="text-xs text-gray-500">{t.quantity}</p><p className="font-medium">{selectedItem.quantity.toLocaleString()}</p></div>
                <div><p className="text-xs text-gray-500">{t.amount}</p><p className="font-medium">{formatCurrency(selectedItem.amount)}</p></div>
                <div><p className="text-xs text-gray-500">{t.approvalDate}</p><p className="font-medium">{selectedItem.approvalDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.requestedBy}</p><p className="font-medium">{selectedItem.requestedBy}</p></div>
                <div><p className="text-xs text-gray-500">{t.approvedBy}</p><p className="font-medium">{selectedItem.approvedBy}</p></div>
              </div>
              <div><p className="text-xs text-gray-500">{t.remarks}</p><p className="font-medium">{selectedItem.remarks}</p></div>
              <div className="flex justify-center">{statusBadge(selectedItem.status)}</div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => handlePrintSingle(selectedItem)} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"><Printer className="w-4 h-4" />{t.printDocument}</button>
                <button onClick={() => handleExportPDF(selectedItem)} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><FileDown className="w-4 h-4" />{t.exportPDF}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-blue-800">{t.addNew} - {t.salesApprovals}</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '고객' : 'Customer'}</label>
                <select 
                  value={newItem.customerId} 
                  onChange={(e) => handleCustomerChange(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{locale === 'ko' ? '고객을 선택하세요' : 'Select Customer'}</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.company} ({customer.phone})
                    </option>
                  ))}
                </select>
                {/* Manual customer input if no selection */}
                {!newItem.customerId && (
                  <input
                    type="text"
                    placeholder={locale === 'ko' ? '또는 고객명을 직접 입력' : 'Or enter customer name manually'}
                    value={newItem.requestedBy}
                    onChange={(e) => setNewItem({...newItem, requestedBy: e.target.value})}
                    className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* Dealer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '딜러' : 'Dealer'}</label>
                <select 
                  value={newItem.dealerId} 
                  onChange={(e) => setNewItem({...newItem, dealerId: e.target.value})} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{locale === 'ko' ? '딜러를 선택하세요 (선택사항)' : 'Select Dealer (Optional)'}</option>
                  {dealers.map((dealer) => (
                    <option key={dealer.id} value={dealer.id}>
                      {dealer.name} - {dealer.contact} ({dealer.type})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.region}</label>
                <select value={newItem.region} onChange={e => setNewItem({ ...newItem, region: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
                </select>
              </div>

              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.productName}</label>
                <select 
                  value={newItem.productId} 
                  onChange={(e) => handleProductChange(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{locale === 'ko' ? '제품을 선택하세요' : 'Select Product'}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₩{product.price.toLocaleString()} ({product.unit})
                    </option>
                  ))}
                </select>
                {/* Manual product input if no selection */}
                {!newItem.productId && (
                  <input
                    type="text"
                    placeholder={locale === 'ko' ? '또는 제품명을 직접 입력' : 'Or enter product name manually'}
                    value={newItem.productName}
                    onChange={(e) => setNewItem({...newItem, productName: e.target.value})}
                    className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* Quantity and Unit Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.quantity}</label>
                  <input type="number" min="1" value={newItem.quantity} onChange={e => handleQuantityChange(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                {newItem.unitPrice > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '단가' : 'Unit Price'}</label>
                    <input type="text" value={`₩${newItem.unitPrice.toLocaleString()}`} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100" />
                  </div>
                )}
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.amount}</label>
                <input 
                  type="number" 
                  value={newItem.amount} 
                  onChange={e => setNewItem({ ...newItem, amount: Number(e.target.value) })} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  readOnly={newItem.unitPrice > 0}
                />
                {newItem.amount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">₩{newItem.amount.toLocaleString()}</p>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.remarks}</label>
                <textarea value={newItem.remarks} onChange={e => setNewItem({ ...newItem, remarks: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={3} placeholder={locale === 'ko' ? '추가 정보나 특별 요청사항을 입력하세요...' : 'Enter additional information or special requests...'} />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium">{t.cancel}</button>
                <button 
                  onClick={handleCreate} 
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed" 
                  disabled={(!newItem.productId && !newItem.productName) || newItem.quantity === 0 || newItem.amount === 0 || (!newItem.customerId && !newItem.requestedBy)}
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-green-800">{t.newCustomer}</h2>
              </div>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '고객명' : 'Customer Name'}</label>
                  <input type="text" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder={locale === 'ko' ? '고객 이름을 입력하세요' : 'Enter customer name'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '회사명' : 'Company Name'}</label>
                  <input type="text" value={newCustomer.companyName} onChange={e => setNewCustomer({ ...newCustomer, companyName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder={locale === 'ko' ? '회사명을 입력하세요' : 'Enter company name'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '이메일' : 'Email'}</label>
                  <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder={locale === 'ko' ? 'example@company.com' : 'example@company.com'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '전화번호' : 'Phone Number'}</label>
                  <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder={locale === 'ko' ? '010-1234-5678' : '+82-10-1234-5678'} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '주소' : 'Address'}</label>
                <input type="text" value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder={locale === 'ko' ? '서울특별시 강남구...' : 'Seoul, Gangnam-gu...'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.region}</label>
                  <select value={newCustomer.region} onChange={e => setNewCustomer({ ...newCustomer, region: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                    {regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '담당자' : 'Contact Person'}</label>
                  <input type="text" value={newCustomer.contactPerson} onChange={e => setNewCustomer({ ...newCustomer, contactPerson: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" placeholder={locale === 'ko' ? '담당자명' : 'Contact person name'} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '메모' : 'Notes'}</label>
                <textarea value={newCustomer.notes} onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" rows={3} placeholder={locale === 'ko' ? '고객에 대한 추가 정보...' : 'Additional information about the customer...'} />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button onClick={() => setIsCustomerModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium">{locale === 'ko' ? '취소' : 'Cancel'}</button>
                <button onClick={handleCreateCustomer} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium">{locale === 'ko' ? '고객 추가' : 'Add Customer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Dealer Modal */}
      {isDealerModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b bg-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-purple-800">{t.newDealer}</h2>
              </div>
              <button onClick={() => setIsDealerModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '딜러명' : 'Dealer Name'}</label>
                  <input type="text" value={newDealer.dealerName} onChange={e => setNewDealer({ ...newDealer, dealerName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" placeholder={locale === 'ko' ? '딜러 이름을 입력하세요' : 'Enter dealer name'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '회사명' : 'Company Name'}</label>
                  <input type="text" value={newDealer.companyName} onChange={e => setNewDealer({ ...newDealer, companyName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" placeholder={locale === 'ko' ? '회사명을 입력하세요' : 'Enter company name'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '이메일' : 'Email'}</label>
                  <input type="email" value={newDealer.email} onChange={e => setNewDealer({ ...newDealer, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" placeholder={locale === 'ko' ? 'dealer@company.com' : 'dealer@company.com'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '전화번호' : 'Phone Number'}</label>
                  <input type="tel" value={newDealer.phone} onChange={e => setNewDealer({ ...newDealer, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" placeholder={locale === 'ko' ? '010-1234-5678' : '+82-10-1234-5678'} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '주소' : 'Address'}</label>
                <input type="text" value={newDealer.address} onChange={e => setNewDealer({ ...newDealer, address: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" placeholder={locale === 'ko' ? '서울특별시 강남구...' : 'Seoul, Gangnam-gu...'} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.region}</label>
                  <select value={newDealer.region} onChange={e => setNewDealer({ ...newDealer, region: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500">
                    {regions.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '담당자' : 'Contact Person'}</label>
                  <input type="text" value={newDealer.contactPerson} onChange={e => setNewDealer({ ...newDealer, contactPerson: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" placeholder={locale === 'ko' ? '담당자명' : 'Contact person'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '사업 유형' : 'Business Type'}</label>
                  <select value={newDealer.businessType} onChange={e => setNewDealer({ ...newDealer, businessType: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500">
                    <option value="">{locale === 'ko' ? '선택하세요' : 'Select type'}</option>
                    <option value="retail">{locale === 'ko' ? '소매업' : 'Retail'}</option>
                    <option value="wholesale">{locale === 'ko' ? '도매업' : 'Wholesale'}</option>
                    <option value="distribution">{locale === 'ko' ? '유통업' : 'Distribution'}</option>
                    <option value="installation">{locale === 'ko' ? '설치업' : 'Installation'}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '메모' : 'Notes'}</label>
                <textarea value={newDealer.notes} onChange={e => setNewDealer({ ...newDealer, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500" rows={3} placeholder={locale === 'ko' ? '딜러에 대한 추가 정보...' : 'Additional information about the dealer...'} />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button onClick={() => setIsDealerModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium">{locale === 'ko' ? '취소' : 'Cancel'}</button>
                <button onClick={handleCreateDealer} className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium">{locale === 'ko' ? '딜러 추가' : 'Add Dealer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && previewItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b bg-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-indigo-800">{locale === 'ko' ? '문서 미리보기' : 'Document Preview'} - {previewItem.approvalNumber}</h2>
              </div>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6" style={{ minHeight: '800px', fontFamily: 'Arial, sans-serif' }}>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg p-2">
                        <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/AMqDpBqx0RHlW36D/kenergysave-logo-m6L2JxknygHwL0Bj.png" alt="Company Logo" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="text-lg font-bold">{locale === 'ko' ? '주식회사 제라' : 'ZERA Co., Ltd'}</div>
                        <div className="text-xs opacity-90">{locale === 'ko' ? 'ZERA Co., Ltd' : '주식회사 제라'}</div>
                        <div className="text-xs mt-2 bg-white text-gray-800 rounded px-2 py-1 inline-block">
                          <strong>{locale === 'ko' ? '주소' : 'Address'}:</strong> {locale === 'ko' ? '경기도 군포시 엘에스로166번길 16-10, 2층' : '2F, 16-10, 166beon-gil, Elseso-ro, Gunpo-si, Gyeonggi-do, Korea'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right bg-white text-blue-600 p-3 rounded-lg">
                      <div className="text-lg font-bold">{locale === 'ko' ? '판매승인서' : 'SALES APPROVAL'}</div>
                      <div className="text-xs text-gray-600">{locale === 'ko' ? 'Sales Approval' : '판매승인서'}</div>
                      <div className="text-sm font-bold mt-1">{previewItem.approvalNumber}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <div className="text-xs text-gray-600 uppercase font-semibold">{t.region}</div>
                    <div className="text-sm font-bold text-gray-800">{regions.find(r => r.key === previewItem.region)?.name}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <div className="text-xs text-gray-600 uppercase font-semibold">{t.requestedBy}</div>
                    <div className="text-sm font-bold text-gray-800">{previewItem.requestedBy}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <div className="text-xs text-gray-600 uppercase font-semibold">{t.approvalDate}</div>
                    <div className="text-sm font-bold text-gray-800">{previewItem.approvalDate}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <div className="text-xs text-gray-600 uppercase font-semibold">{t.approved}</div>
                    <div className="text-sm font-bold text-gray-800">{statusBadge(previewItem.status)}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <div className="text-xs text-gray-600 uppercase font-semibold">{t.productName}</div>
                    <div className="text-sm font-bold text-gray-800">{previewItem.productName}</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <div className="text-xs text-gray-600 uppercase font-semibold">{t.quantity}</div>
                    <div className="text-sm font-bold text-gray-800">{previewItem.quantity.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="bg-blue-600 text-white p-3 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-lg">{t.amount}</span>
                    <span className="font-bold text-xl">{formatCurrency(previewItem.amount)}</span>
                  </div>
                </div>
                
                {previewItem.remarks && (
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-6">
                    <div className="text-xs text-gray-600 uppercase font-semibold mb-2">{t.remarks}</div>
                    <div className="text-sm text-gray-800 leading-relaxed">{previewItem.remarks}</div>
                  </div>
                )}
                
                <div className="border-t-2 border-blue-200 pt-4 text-center text-xs text-gray-500">
                  <div className="font-semibold text-gray-600 mb-1">{locale === 'ko' ? '출력일' : 'Print Date'}: {new Date().toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}</div>
                  <p>{locale === 'ko' ? '본 문서는 시스템에서 자동 생성되었습니다' : 'This document was automatically generated by the system'}</p>
                  <p>{locale === 'ko' ? '문의사항: +82 31-427-1380 | info@zera-energy.com' : 'Contact: +82 31-427-1380 | info@zera-energy.com'}</p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <button onClick={() => setIsPreviewModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium">{locale === 'ko' ? '닫기' : 'Close'}</button>
                <button onClick={() => { handlePrintSingle(previewItem); setIsPreviewModalOpen(false); }} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" />{locale === 'ko' ? '인쇄하기' : 'Print Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
