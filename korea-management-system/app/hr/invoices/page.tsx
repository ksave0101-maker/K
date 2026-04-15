'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, FileText, Plus, Search, Eye, Trash2, X, Printer, CreditCard, Banknote } from 'lucide-react';

interface SalesContract {
  id: number;
  contractNumber: string;
  buyer: string;
  productName: string;
  quantity: number;
  contractValue: number;
  market: 'domestic' | 'international';
  region: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  items: { name: string; quantity: number; unit: string; unitPrice: number }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'overdue';
  notes: string;
  salesContractNumber?: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sales Contracts from Domestic and International Markets
  const [salesContracts] = useState<SalesContract[]>([
    // Domestic Market - Korea
    { id: 1, contractNumber: 'DSC-2026-001', buyer: '서울특별시청 (Seoul Metropolitan Government)', productName: '태양광 패널 시스템 500kW', quantity: 1, contractValue: 2500000000, market: 'domestic', region: '서울/경기' },
    { id: 2, contractNumber: 'DSC-2026-002', buyer: '삼성중공업 (Samsung Heavy Industries)', productName: '에너지 절감 장치 A200', quantity: 200, contractValue: 1800000000, market: 'domestic', region: '부산/경남' },
    { id: 3, contractNumber: 'DSC-2026-003', buyer: 'POSCO 포항제철', productName: '스마트 인버터 SI-3000', quantity: 150, contractValue: 1350000000, market: 'domestic', region: '대구/경북' },
    { id: 4, contractNumber: 'DSC-2026-004', buyer: 'KAIST', productName: '전력 모니터링 시스템 PMS', quantity: 5, contractValue: 450000000, market: 'domestic', region: '대전/충청' },
    { id: 5, contractNumber: 'DSC-2026-005', buyer: '현대건설 (Hyundai E&C)', productName: 'EV 충전기 EC-300', quantity: 300, contractValue: 900000000, market: 'domestic', region: '서울/경기' },
    { id: 6, contractNumber: 'DSC-2026-006', buyer: '한국전력공사 전남지사 (KEPCO Jeonnam)', productName: 'LED 조명 모듈 LM-100', quantity: 1000, contractValue: 320000000, market: 'domestic', region: '광주/전라' },
    { id: 7, contractNumber: 'DSC-2026-007', buyer: '인천국제공항공사 (Incheon Airport Corp)', productName: '태양광 컨트롤러 SC-200', quantity: 100, contractValue: 680000000, market: 'domestic', region: '인천/강원' },
    { id: 8, contractNumber: 'DSC-2026-008', buyer: '제주에너지공사 (Jeju Energy Corp)', productName: '풍력 변환 시스템 WCS-500', quantity: 10, contractValue: 2200000000, market: 'domestic', region: '제주' },
    { id: 9, contractNumber: 'DSC-2026-009', buyer: 'LG화학 울산공장 (LG Chem Ulsan)', productName: '배터리 저장 시스템 BS-500', quantity: 30, contractValue: 1050000000, market: 'domestic', region: '부산/경남' },
    { id: 10, contractNumber: 'DSC-2026-010', buyer: '경북도청 (Gyeongbuk Provincial Office)', productName: '에너지 감사 키트 EAK-1', quantity: 50, contractValue: 180000000, market: 'domestic', region: '대구/경북' },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 1, invoiceNumber: 'INV-2026-001', customer: 'Brunei Energy Corp', issueDate: '2026-02-15', dueDate: '2026-03-15', items: [{ name: 'Solar Inverter SI-5000', quantity: 20, unit: 'pcs', unitPrice: 3500000 }], subtotal: 70000000, taxRate: 10, taxAmount: 7000000, totalAmount: 77000000, paymentStatus: 'paid', notes: 'Payment received via wire transfer' },
    { id: 2, invoiceNumber: 'INV-2026-002', customer: 'Thailand Power Solutions', issueDate: '2026-02-14', dueDate: '2026-03-14', items: [{ name: 'Energy Saver Module ESM-200', quantity: 100, unit: 'pcs', unitPrice: 850000 }], subtotal: 85000000, taxRate: 10, taxAmount: 8500000, totalAmount: 93500000, paymentStatus: 'partial', notes: '50% deposit received' },
    { id: 3, invoiceNumber: 'INV-2026-003', customer: 'Vietnam Green Tech', issueDate: '2026-02-13', dueDate: '2026-03-13', items: [{ name: 'LED Controller LC-300', quantity: 500, unit: 'pcs', unitPrice: 120000 }], subtotal: 60000000, taxRate: 10, taxAmount: 6000000, totalAmount: 66000000, paymentStatus: 'unpaid', notes: '' },
    { id: 4, invoiceNumber: 'INV-2026-004', customer: 'Seoul Metro', issueDate: '2026-02-12', dueDate: '2026-03-12', items: [{ name: 'Power Distribution Unit PDU-1000', quantity: 30, unit: 'pcs', unitPrice: 4200000 }], subtotal: 126000000, taxRate: 10, taxAmount: 12600000, totalAmount: 138600000, paymentStatus: 'paid', notes: '' },
    { id: 5, invoiceNumber: 'INV-2026-005', customer: 'Busan Port Authority', issueDate: '2026-02-11', dueDate: '2026-02-25', items: [{ name: 'Industrial Battery IB-500', quantity: 50, unit: 'pcs', unitPrice: 2800000 }], subtotal: 140000000, taxRate: 10, taxAmount: 14000000, totalAmount: 154000000, paymentStatus: 'overdue', notes: 'Payment reminder sent' },
    { id: 6, invoiceNumber: 'INV-2026-006', customer: 'Incheon Airport Corp', issueDate: '2026-02-10', dueDate: '2026-03-10', items: [{ name: 'Smart Grid Controller SGC-100', quantity: 15, unit: 'pcs', unitPrice: 8500000 }], subtotal: 127500000, taxRate: 10, taxAmount: 12750000, totalAmount: 140250000, paymentStatus: 'unpaid', notes: '' },
    { id: 7, invoiceNumber: 'INV-2026-007', customer: 'Jeju Energy Co', issueDate: '2026-02-09', dueDate: '2026-03-09', items: [{ name: 'Wind Turbine Controller WTC-50', quantity: 5, unit: 'pcs', unitPrice: 15000000 }], subtotal: 75000000, taxRate: 10, taxAmount: 7500000, totalAmount: 82500000, paymentStatus: 'paid', notes: '' },
    { id: 8, invoiceNumber: 'INV-2026-008', customer: 'KT Telecom', issueDate: '2026-02-08', dueDate: '2026-03-08', items: [{ name: 'UPS System UPS-3000', quantity: 25, unit: 'pcs', unitPrice: 6200000 }], subtotal: 155000000, taxRate: 10, taxAmount: 15500000, totalAmount: 170500000, paymentStatus: 'paid', notes: '' },
    { id: 9, invoiceNumber: 'INV-2026-009', customer: 'Daegu Industrial Zone', issueDate: '2026-02-07', dueDate: '2026-03-07', items: [{ name: 'Voltage Regulator VR-200', quantity: 80, unit: 'pcs', unitPrice: 950000 }], subtotal: 76000000, taxRate: 10, taxAmount: 7600000, totalAmount: 83600000, paymentStatus: 'unpaid', notes: '' },
    { id: 10, invoiceNumber: 'INV-2026-010', customer: 'Gwangju Solar Farm', issueDate: '2026-02-06', dueDate: '2026-03-06', items: [{ name: 'Solar Panel SP-400W', quantity: 300, unit: 'pcs', unitPrice: 350000 }], subtotal: 105000000, taxRate: 10, taxAmount: 10500000, totalAmount: 115500000, paymentStatus: 'partial', notes: '30% advance paid' },
  ]);

  const [newInvoice, setNewInvoice] = useState({
    salesContractId: '', customer: '', issueDate: '2026-02-15', dueDate: '', itemName: '', quantity: 0, unit: 'pcs', unitPrice: 0, notes: '', paymentMethod: 'bank_transfer'
  });

  const handleContractSelect = (contractId: string) => {
    if (!contractId) {
      setNewInvoice({ salesContractId: '', customer: '', issueDate: '2026-02-15', dueDate: '', itemName: '', quantity: 0, unit: 'pcs', unitPrice: 0, notes: '', paymentMethod: 'bank_transfer' });
      return;
    }
    const contract = salesContracts.find(c => c.id === Number(contractId));
    if (contract) {
      const unitPrice = Math.round(contract.contractValue / contract.quantity);
      setNewInvoice({
        salesContractId: contractId,
        customer: contract.buyer,
        issueDate: '2026-02-15',
        dueDate: '',
        itemName: contract.productName,
        quantity: contract.quantity,
        unit: 'pcs',
        unitPrice: unitPrice,
        notes: `Sales Contract: ${contract.contractNumber} | ${contract.market === 'domestic' ? '국내' : '해외'} | ${contract.region}`,
        paymentMethod: 'bank_transfer'
      });
    }
  };

  const formatCurrency = (v: number) => '₩' + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);

  const paymentBadge = (s: string) => {
    const map: Record<string, string> = { paid: 'bg-green-100 text-green-700', unpaid: 'bg-red-100 text-red-700', partial: 'bg-orange-100 text-orange-700', overdue: 'bg-red-200 text-red-800' };
    const label: Record<string, string> = { paid: t.paid, unpaid: t.unpaid, partial: t.partial, overdue: t.overdue };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || inv.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: number) => {
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const handlePrint = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const contractInfo = invoice.salesContractNumber ? `<div class="contract-badge"><span class="badge-icon">\ud83d\udcdc</span> Sales Contract: <strong>${invoice.salesContractNumber}</strong></div>` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', 'Malgun Gothic', Arial, sans-serif; 
            padding: 12mm; 
            background: white; 
            color: #1a1a1a;
          }
          
          .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.06);
            padding: 18px;
            position: relative;
            overflow: hidden;
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            font-weight: 900;
            color: rgba(249, 115, 22, 0.02);
            z-index: 0;
            pointer-events: none;
            letter-spacing: 8px;
          }
          
          .content { position: relative; z-index: 1; }
          
          .header {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            margin: -18px -18px 18px -18px;
            padding: 20px 18px;
            border-radius: 8px 8px 0 0;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 250px;
            height: 250px;
            background: rgba(255,255,255,0.08);
            border-radius: 50%;
          }
          
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
            z-index: 1;
          }
          
          .logo-section {
            flex: 1;
          }
          
          .company-logo {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.12);
            padding: 8px;
          }
          
          .company-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          
          .company-name {
            font-size: 20px;
            font-weight: 900;
            color: white;
            margin-bottom: 2px;
            letter-spacing: 1.5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
          
          .invoice-badge {
            background: white;
            padding: 10px 15px;
            border-radius: 6px;
            text-align: right;
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
          }
          
          .invoice-title {
            font-size: 22px;
            font-weight: 900;
            color: #f97316;
            margin-bottom: 3px;
            letter-spacing: 1.5px;
          }
          
          .invoice-number {
            font-size: 11px;
            color: #666;
            font-weight: 600;
          }
          
          .contract-badge {
            display: inline-block;
            background: linear-gradient(135deg, #fef3f2, #fff7ed);
            border: 1.5px dashed #fed7aa;
            padding: 5px 10px;
            border-radius: 6px;
            margin: 10px 0 8px 0;
            font-size: 9px;
            color: #ea580c;
            font-weight: 600;
          }
          
          .badge-icon { font-size: 11px; margin-right: 3px; }
          
          .section-title {
            font-size: 10px;
            font-weight: 700;
            color: #f97316;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin: 15px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 1.5px solid #fed7aa;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 10px;
            margin: 12px 0;
          }
          
          .info-box {
            background: linear-gradient(135deg, #fef3f2 0%, #fff7ed 100%);
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #f97316;
            box-shadow: 0 1px 5px rgba(249,115,22,0.06);
          }
          
          .info-label {
            font-size: 8px;
            color: #ea580c;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 4px;
            letter-spacing: 0.4px;
          }
          
          .info-value {
            font-size: 11px;
            color: #1a1a1a;
            font-weight: 700;
            line-height: 1.3;
          }
          
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 12px 0;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 8px rgba(0,0,0,0.04);
          }
          
          thead {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          }
          
          th {
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }
          
          tbody tr {
            background: white;
          }
          
          tbody tr:nth-child(even) {
            background: #fef3f2;
          }
          
          td {
            padding: 8px;
            border-bottom: 1px solid #fed7aa;
            font-size: 10px;
            color: #333;
          }
          
          tbody tr:last-child td {
            border-bottom: none;
          }
          
          .text-right { text-align: right; font-weight: 600; }
          
          .total-section {
            margin-top: 15px;
            background: linear-gradient(135deg, #fef3f2, #fff7ed);
            padding: 12px;
            border-radius: 6px;
            border: 1.5px solid #fed7aa;
          }
          
          .total-row {
            display: flex;
            justify-content: flex-end;
            padding: 6px 0;
            font-size: 11px;
            border-bottom: 1px dashed #fed7aa;
          }
          
          .total-row:last-child {
            border-bottom: none;
          }
          
          .total-label {
            width: 150px;
            font-weight: 700;
            color: #666;
          }
          
          .total-value {
            width: 150px;
            text-align: right;
            font-weight: 700;
            color: #1a1a1a;
          }
          
          .grand-total {
            background: linear-gradient(135deg, #f97316, #ea580c);
            margin: 10px -12px -12px -12px;
            padding: 10px 12px;
            border-radius: 0 0 4px 4px;
          }
          
          .grand-total .total-label,
          .grand-total .total-value {
            color: white;
            font-size: 14px;
            font-weight: 900;
          }
          
          .notes-section {
            margin-top: 15px;
            padding: 12px;
            background: linear-gradient(135deg, #fffbeb, #fef3c7);
            border: 1.5px solid #fcd34d;
            border-radius: 6px;
          }
          
          .notes-title {
            font-size: 9px;
            font-weight: 700;
            color: #d97706;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }
          
          .notes-text {
            font-size: 9px;
            color: #92400e;
            line-height: 1.4;
          }
          
          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1.5px dashed #e5e7eb;
          }
          
          .signature-box {
            text-align: center;
          }
          
          .signature-label {
            font-size: 8px;
            color: #666;
            margin-bottom: 25px;
            font-weight: 600;
          }
          
          .signature-line {
            border-top: 1.5px solid #333;
            margin: 0 15px;
            padding-top: 5px;
            font-size: 9px;
            color: #333;
            font-weight: 700;
          }
          
          .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 7px;
            color: #999;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
          }
          
          .footer-logo {
            font-size: 12px;
            font-weight: 900;
            color: #f97316;
            margin-bottom: 5px;
          }
          
          @media print {
            .no-print { display: none; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="watermark">INVOICE</div>
          <div class="content">
            <div class="header">
              <div class="header-content">
                <div class="logo-section">
                  <div class="company-logo">
                    <img src="/kenergysave-logo.avif" alt="ZERA Company Logo" />
                  </div>
                  <div class="company-name">\uc8fc\uc2dd\ud68c\uc0ac \uc81c\ub77c</div>
                  <div class="company-name-en">ZERA Co., Ltd</div>
                  <div class="company-info">
                    <strong>\uc8fc\uc18c:</strong> \uacbd\uae30\ub3c4 \uad70\ud3ec\uc2dc \uc5d8\uc5d0\uc2a4\ub85c166\ubc88\uae38 16-10, 2\uce35<br/>
                    <strong>Address:</strong> 2F, 16-10, 166beon-gil, Elseso-ro, Gunpo-si, Gyeonggi-do, Korea<br/>
                    <strong>\uc804\ud654 / Tel:</strong> +82 31-427-1380 | <strong>\uc774\uba54\uc77c / Email:</strong> info@zera-energy.com<br/>
                    <strong>Website:</strong> www.zera-energy.com
                  </div>
                </div>
                <div class="invoice-badge">
                  <div class="invoice-title">INVOICE</div>
                  <div class="invoice-number">#${invoice.invoiceNumber}</div>
                </div>
              </div>
            </div>

            ${contractInfo}

            <div class="section-title">\ud074\ub77c\uc774\uc5b8\ud2b8 \uc815\ubcf4 / Client Information</div>
            <div class="info-grid">
              <div class="info-box">
                <div class="info-label">\ud074\ub77c\uc774\uc5b8\ud2b8 / Bill To</div>
                <div class="info-value">${invoice.customer}</div>
              </div>
              <div>
                <div class="info-box" style="margin-bottom: 10px;">
                  <div class="info-label">\ubc1c\ud589\uc77c / Issue Date</div>
                  <div class="info-value">${invoice.issueDate}</div>
                </div>
                <div class="info-box">
                  <div class="info-label">\ub0a9\ubd80\uae30\ud55c / Due Date</div>
                  <div class="info-value">${invoice.dueDate}</div>
                </div>
              </div>
            </div>

            <div class="section-title">\ud488\ubaa9 \uc0c1\uc138 / Invoice Details</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">Item / \ud488\ubaa9</th>
                  <th class="text-right" style="width: 15%;">Qty / \uc218\ub7c9</th>
                  <th class="text-right" style="width: 17.5%;">Unit Price / \ub2e8\uac00</th>
                  <th class="text-right" style="width: 17.5%;">Amount / \uae08\uc561</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td style="font-weight: 600;">${item.name}</td>
                    <td class="text-right">${item.quantity} ${item.unit}</td>
                    <td class="text-right">\u20a9${new Intl.NumberFormat('ko-KR').format(item.unitPrice)}</td>
                    <td class="text-right" style="color: #f97316; font-weight: 700;">\u20a9${new Intl.NumberFormat('ko-KR').format(item.quantity * item.unitPrice)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-row">
                <div class="total-label">Subtotal / \uc18c\uacc4:</div>
                <div class="total-value">\u20a9${new Intl.NumberFormat('ko-KR').format(invoice.subtotal)}</div>
              </div>
              <div class="total-row">
                <div class="total-label">Tax (10%) / \uc138\uae08 (10%):</div>
                <div class="total-value">\u20a9${new Intl.NumberFormat('ko-KR').format(invoice.taxAmount)}</div>
              </div>
              <div class="total-row grand-total">
                <div class="total-label">Grand Total / \ucd1d\uc561:</div>
                <div class="total-value">\u20a9${new Intl.NumberFormat('ko-KR').format(invoice.totalAmount)}</div>
              </div>
            </div>

            ${invoice.notes ? `
              <div class="notes-section">
                <div class="notes-title">\ud2b9\uae30\uc0ac\ud56d / Notes</div>
                <div class="notes-text">${invoice.notes}</div>
              </div>
            ` : ''}

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-label">\ubc1c\ud589\uc790 / Issued By</div>
                <div style="height: 70px;"></div>
                <div class="signature-line">\uc8fc\uc2dd\ud68c\uc0ac \uc81c\ub77c</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">\uc218\ub839\uc778 / Received By</div>
                <div style="height: 70px;"></div>
                <div class="signature-line">${invoice.customer}</div>
              </div>
            </div>

            <div class="footer">
              <div class="footer-logo">ZERA</div>
              <p><strong>\uc774 \ubb38\uc11c\ub294 \uacf5\uc2dd \uccad\uad6c\uc11c\uc785\ub2c8\ub2e4 | This is an official invoice</strong></p>
              <p style="margin-top: 5px;">Printed on ${new Date().toLocaleDateString('ko-KR', {year: 'numeric', month: 'long', day: 'numeric'})} at ${new Date().toLocaleTimeString('ko-KR')}</p>
              <p style="margin-top: 5px; color: #ccc;">\u00a9 2026 ZERA Co., Ltd. All rights reserved.</p>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() { 
            setTimeout(function() { window.print(); }, 250); 
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCreate = () => {
    const newId = Math.max(...invoices.map(inv => inv.id)) + 1;
    const subtotal = newInvoice.quantity * newInvoice.unitPrice;
    const taxAmount = Math.round(subtotal * 0.1);
    setInvoices([...invoices, {
      id: newId,
      invoiceNumber: `INV-2026-${String(newId).padStart(3, '0')}`,
      customer: newInvoice.customer,
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      items: [{ name: newInvoice.itemName, quantity: newInvoice.quantity, unit: newInvoice.unit, unitPrice: newInvoice.unitPrice }],
      subtotal,
      taxRate: 10,
      taxAmount,
      totalAmount: subtotal + taxAmount,
      paymentStatus: 'unpaid',
      notes: `${newInvoice.notes}${newInvoice.notes ? ' | ' : ''}Payment Method: ${newInvoice.paymentMethod === 'bank_transfer' ? (locale === 'ko' ? 'Bank Transfer (계좌 이체)' : 'Bank Transfer') : (locale === 'ko' ? 'Credit Card (신용카드)' : 'Credit Card')}`,
      salesContractNumber: salesContracts.find(c => c.id === Number(newInvoice.salesContractId))?.contractNumber,
    }]);
    setIsAddModalOpen(false);
    setNewInvoice({ salesContractId: '', customer: '', issueDate: '2026-02-15', dueDate: '', itemName: '', quantity: 0, unit: 'pcs', unitPrice: 0, notes: '', paymentMethod: 'bank_transfer' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/hr/dashboard')} className="text-orange-600 hover:text-orange-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{t.invoices}</h1>
                  <p className="text-sm text-gray-600">{t.invoicesDesc}</p>
                </div>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={locale === 'ko' ? '청구서 번호 또는 고객 검색...' : 'Search invoice number or customer...'} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
            <option value="all">{locale === 'ko' ? '모든 상태' : 'All Status'}</option>
            <option value="paid">{t.paid}</option>
            <option value="unpaid">{t.unpaid}</option>
            <option value="partial">{t.partial}</option>
            <option value="overdue">{t.overdue}</option>
          </select>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />{t.addNew}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-700 px-6 py-4">
            <h2 className="text-white font-bold text-lg">{t.invoices} ({filtered.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">No.</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.invoiceNumber}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.customer}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.issueDate}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.duePaymentDate}</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.subtotal}</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.tax} (10%)</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.grandTotal}</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.paymentStatus}</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-orange-600">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{inv.customer}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{inv.issueDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{inv.dueDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">{formatCurrency(inv.subtotal)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">{formatCurrency(inv.taxAmount)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-6 py-4 text-center">{paymentBadge(inv.paymentStatus)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedInvoice(inv)} className="text-orange-500 hover:text-orange-700" title={locale === 'ko' ? '상세보기' : 'View Details'}><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handlePrint(inv)} className="text-blue-500 hover:text-blue-700" title={locale === 'ko' ? '인쇄' : 'Print'}><Printer className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(inv.id)} className="text-red-500 hover:text-red-700" title={locale === 'ko' ? '삭제' : 'Delete'}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-orange-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">{selectedInvoice.invoiceNumber}</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">{t.customer}</p><p className="font-medium">{selectedInvoice.customer}</p></div>
                <div><p className="text-xs text-gray-500">{t.issueDate}</p><p className="font-medium">{selectedInvoice.issueDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.duePaymentDate}</p><p className="font-medium">{selectedInvoice.dueDate}</p></div>
                <div><p className="text-xs text-gray-500">{t.paymentStatus}</p>{paymentBadge(selectedInvoice.paymentStatus)}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{locale === 'ko' ? '항목' : 'Items'}</h4>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">{locale === 'ko' ? '품목' : 'Item'}</th>
                      <th className="text-right px-3 py-2">{t.quantity}</th>
                      <th className="text-right px-3 py-2">{t.unitPrice}</th>
                      <th className="text-right px-3 py-2">{t.totalAmount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2 text-right">{item.quantity} {item.unit}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t pt-3 space-y-1 text-right">
                <p className="text-sm">{t.subtotal}: {formatCurrency(selectedInvoice.subtotal)}</p>
                <p className="text-sm">{t.tax} (10%): {formatCurrency(selectedInvoice.taxAmount)}</p>
                <p className="text-lg font-bold">{t.grandTotal}: {formatCurrency(selectedInvoice.totalAmount)}</p>
              </div>
              {selectedInvoice.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">{locale === 'ko' ? '비고' : 'Notes'}</p>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-orange-500 to-orange-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">{t.addNew} {t.invoices}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '판매 계약 선택' : 'Select Sales Contract'}</label>
                <select 
                  value={newInvoice.salesContractId} 
                  onChange={e => handleContractSelect(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">{locale === 'ko' ? '-- 판매 계약 선택 --' : '-- Select Sales Contract --'}</option>
                  <optgroup label={locale === 'ko' ? '🇰🇷 국내 시장 (Domestic Market)' : '🇰🇷 Domestic Market (Korea)'}>
                    {salesContracts.filter(c => c.market === 'domestic').map(contract => (
                      <option key={contract.id} value={contract.id}>
                        {contract.contractNumber} | {contract.buyer} | {contract.productName}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.customer}</label><input value={newInvoice.customer} onChange={e => setNewInvoice({ ...newInvoice, customer: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 bg-gray-50" readOnly /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.issueDate}</label><input type="date" value={newInvoice.issueDate} onChange={e => setNewInvoice({ ...newInvoice, issueDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.duePaymentDate}</label><input type="date" value={newInvoice.dueDate} onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '품목명' : 'Item Name'}</label><input value={newInvoice.itemName} onChange={e => setNewInvoice({ ...newInvoice, itemName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.quantity}</label><input type="number" value={newInvoice.quantity} onChange={e => setNewInvoice({ ...newInvoice, quantity: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '단위' : 'Unit'}</label>
                  <select value={newInvoice.unit} onChange={e => setNewInvoice({ ...newInvoice, unit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
                    <option value="pcs">pcs</option><option value="kg">kg</option><option value="sets">sets</option><option value="boxes">boxes</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.unitPrice}</label><input type="number" value={newInvoice.unitPrice} onChange={e => setNewInvoice({ ...newInvoice, unitPrice: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '비고' : 'Notes'}</label><textarea value={newInvoice.notes} onChange={e => setNewInvoice({ ...newInvoice, notes: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" /></div>
              
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {locale === 'ko' ? '결제 방법' : 'Payment Method'}
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={newInvoice.paymentMethod === 'bank_transfer'}
                      onChange={(e) => setNewInvoice({ ...newInvoice, paymentMethod: e.target.value })}
                      className="mr-3 text-orange-500"
                    />
                    <Banknote className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="text-sm font-medium">
                      {locale === 'ko' ? '계좌 이체 (Bank Transfer)' : 'Bank Transfer'}
                    </span>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={newInvoice.paymentMethod === 'credit_card'}
                      onChange={(e) => setNewInvoice({ ...newInvoice, paymentMethod: e.target.value })}
                      className="mr-3 text-orange-500"
                    />
                    <CreditCard className="w-5 h-5 text-purple-500 mr-3" />
                    <span className="text-sm font-medium">
                      {locale === 'ko' ? '신용카드 (Credit Card)' : 'Credit Card'}
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t.cancel}</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
