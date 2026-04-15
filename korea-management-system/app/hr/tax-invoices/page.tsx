'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowLeft, Receipt, Plus, Search, Eye, Trash2, X, Printer, CreditCard, Calendar, DollarSign } from 'lucide-react';

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

interface TaxInvoice {
  id: number;
  taxInvoiceNumber: string;
  customer: string;
  businessNumber: string;
  issueDate: string;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
  items: { name: string; quantity: number; unit: string; unitPrice: number }[];
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'overdue';
  type: 'sales' | 'purchase';
  invoiceNumber?: string;
}

export default function TaxInvoicesPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<TaxInvoice | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Invoices from Invoice System
  const [availableInvoices] = useState<Invoice[]>([
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

  const [invoices, setInvoices] = useState<TaxInvoice[]>([
    { id: 1, taxInvoiceNumber: 'TAX-2026-001', customer: 'Brunei Energy Corp', businessNumber: '123-45-67890', issueDate: '2026-02-15', supplyAmount: 70000000, taxAmount: 7000000, totalAmount: 77000000, items: [{ name: 'Solar Inverter SI-5000', quantity: 20, unit: 'pcs', unitPrice: 3500000 }], paymentStatus: 'paid', type: 'sales', invoiceNumber: 'INV-2026-001' },
    { id: 2, taxInvoiceNumber: 'TAX-2026-002', customer: 'Samsung Electronics', businessNumber: '234-56-78901', issueDate: '2026-02-14', supplyAmount: 28900000, taxAmount: 2890000, totalAmount: 31790000, items: [{ name: 'LED Module A100', quantity: 500, unit: 'pcs', unitPrice: 45000 }], paymentStatus: 'paid', type: 'purchase' },
    { id: 3, taxInvoiceNumber: 'TAX-2026-003', customer: 'Thailand Power Solutions', businessNumber: '345-67-89012', issueDate: '2026-02-13', supplyAmount: 85000000, taxAmount: 8500000, totalAmount: 93500000, items: [{ name: 'Energy Saver Module ESM-200', quantity: 100, unit: 'pcs', unitPrice: 850000 }], paymentStatus: 'partial', type: 'sales', invoiceNumber: 'INV-2026-002' },
    { id: 4, taxInvoiceNumber: 'TAX-2026-004', customer: 'LG Chem', businessNumber: '456-78-90123', issueDate: '2026-02-12', supplyAmount: 15000000, taxAmount: 1500000, totalAmount: 16500000, items: [{ name: 'Battery Cell 3.7V', quantity: 1000, unit: 'pcs', unitPrice: 15000 }], paymentStatus: 'unpaid', type: 'purchase' },
    { id: 5, taxInvoiceNumber: 'TAX-2026-005', customer: 'Seoul Metro', businessNumber: '567-89-01234', issueDate: '2026-02-11', supplyAmount: 126000000, taxAmount: 12600000, totalAmount: 138600000, items: [{ name: 'Power Distribution Unit PDU-1000', quantity: 30, unit: 'pcs', unitPrice: 4200000 }], paymentStatus: 'paid', type: 'sales', invoiceNumber: 'INV-2026-004' },
    { id: 6, taxInvoiceNumber: 'TAX-2026-006', customer: 'SK Hynix', businessNumber: '678-90-12345', issueDate: '2026-02-10', supplyAmount: 8400000, taxAmount: 840000, totalAmount: 9240000, items: [{ name: 'Memory Chip 8GB', quantity: 300, unit: 'pcs', unitPrice: 28000 }], paymentStatus: 'overdue', type: 'purchase' },
    { id: 7, taxInvoiceNumber: 'TAX-2026-007', customer: 'Vietnam Green Tech', businessNumber: '789-01-23456', issueDate: '2026-02-09', supplyAmount: 60000000, taxAmount: 6000000, totalAmount: 66000000, items: [{ name: 'LED Controller LC-300', quantity: 500, unit: 'pcs', unitPrice: 120000 }], paymentStatus: 'unpaid', type: 'sales', invoiceNumber: 'INV-2026-003' },
    { id: 8, taxInvoiceNumber: 'TAX-2026-008', customer: 'Hyundai Steel', businessNumber: '890-12-34567', issueDate: '2026-02-08', supplyAmount: 12750000, taxAmount: 1275000, totalAmount: 14025000, items: [{ name: 'Steel Frame LK-200', quantity: 150, unit: 'pcs', unitPrice: 85000 }], paymentStatus: 'paid', type: 'purchase' },
    { id: 9, taxInvoiceNumber: 'TAX-2026-009', customer: 'KT Telecom', businessNumber: '901-23-45678', issueDate: '2026-02-07', supplyAmount: 155000000, taxAmount: 15500000, totalAmount: 170500000, items: [{ name: 'UPS System UPS-3000', quantity: 25, unit: 'pcs', unitPrice: 6200000 }], paymentStatus: 'paid', type: 'sales', invoiceNumber: 'INV-2026-008' },
    { id: 10, taxInvoiceNumber: 'TAX-2026-010', customer: 'Hanwha Solutions', businessNumber: '012-34-56789', issueDate: '2026-02-06', supplyAmount: 36000000, taxAmount: 3600000, totalAmount: 39600000, items: [{ name: 'Solar Panel 350W', quantity: 200, unit: 'pcs', unitPrice: 180000 }], paymentStatus: 'partial', type: 'purchase' },
  ]);

  const [newInvoice, setNewInvoice] = useState({
    invoiceId: '', invoiceNumber: '', customer: '', businessNumber: '', issueDate: '2026-02-15', itemName: '', quantity: 0, unit: 'pcs', unitPrice: 0, type: 'sales' as 'sales' | 'purchase',
    // Payment Information
    paymentReceived: 0,
    paymentDate: '',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'pending',
    remainingAmount: 0
  });

  const handleInvoiceSelect = (invoiceId: string) => {
    if (!invoiceId) {
      setNewInvoice({ 
        invoiceId: '', invoiceNumber: '', customer: '', businessNumber: '', issueDate: '2026-02-15', itemName: '', quantity: 0, unit: 'pcs', unitPrice: 0, type: 'sales',
        paymentReceived: 0, paymentDate: '', paymentMethod: 'bank_transfer', paymentStatus: 'pending', remainingAmount: 0
      });
      return;
    }
    const selectedInv = availableInvoices.find(inv => inv.id === Number(invoiceId));
    if (selectedInv) {
      const firstItem = selectedInv.items[0];
      const totalAmount = selectedInv.totalAmount;
      setNewInvoice({
        invoiceId,
        invoiceNumber: selectedInv.invoiceNumber,
        customer: selectedInv.customer,
        businessNumber: '123-45-67890', // Default business number
        issueDate: selectedInv.issueDate,
        itemName: firstItem.name,
        quantity: firstItem.quantity,
        unit: firstItem.unit,
        unitPrice: firstItem.unitPrice,
        type: 'sales',
        paymentReceived: 0,
        paymentDate: '',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        remainingAmount: totalAmount
      });
    }
  };

  const formatCurrency = (v: number) => '₩' + new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(v);

  const paymentBadge = (s: string) => {
    const map: Record<string, string> = { paid: 'bg-green-100 text-green-700', unpaid: 'bg-red-100 text-red-700', partial: 'bg-orange-100 text-orange-700', overdue: 'bg-red-200 text-red-800' };
    const label: Record<string, string> = { paid: t.paid, unpaid: t.unpaid, partial: t.partial, overdue: t.overdue };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s]}`}>{label[s]}</span>;
  };

  const typeBadge = (type: string) => {
    return type === 'sales'
      ? <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{locale === 'ko' ? '매출' : 'Sales'}</span>
      : <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{locale === 'ko' ? '매입' : 'Purchase'}</span>;
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.taxInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || inv.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
    const matchType = typeFilter === 'all' || inv.type === typeFilter;
    const isPaid = inv.paymentStatus === 'paid'; // Only show paid invoices
    return matchSearch && matchStatus && matchType && isPaid;
  });

  const handleDelete = (id: number) => {
    if (confirm(locale === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const handleCreate = () => {
    const newId = Math.max(...invoices.map(inv => inv.id)) + 1;
    const supplyAmount = newInvoice.quantity * newInvoice.unitPrice;
    const taxAmount = Math.round(supplyAmount * 0.1);
    setInvoices([...invoices, {
      id: newId,
      taxInvoiceNumber: `TAX-2026-${String(newId).padStart(3, '0')}`,
      customer: newInvoice.customer,
      businessNumber: newInvoice.businessNumber,
      issueDate: newInvoice.issueDate,
      supplyAmount,
      taxAmount,
      totalAmount: supplyAmount + taxAmount,
      items: [{ name: newInvoice.itemName, quantity: newInvoice.quantity, unit: newInvoice.unit, unitPrice: newInvoice.unitPrice }],
      paymentStatus: newInvoice.paymentStatus as 'paid' | 'unpaid' | 'partial' | 'overdue',
      type: newInvoice.type,
      invoiceNumber: newInvoice.invoiceNumber,
    }]);
    setIsAddModalOpen(false);
    setNewInvoice({ 
      invoiceId: '', invoiceNumber: '', customer: '', businessNumber: '', issueDate: '2026-02-15', itemName: '', quantity: 0, unit: 'pcs', unitPrice: 0, type: 'sales',
      paymentReceived: 0, paymentDate: '', paymentMethod: 'bank_transfer', paymentStatus: 'pending', remainingAmount: 0
    });
  };

  const handlePrint = (inv: TaxInvoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${inv.taxInvoiceNumber} - ${locale === 'ko' ? '세금계산서' : 'Tax Invoice'}</title>
          <style>
            @page { size: A4; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; background: white; padding: 12mm; color: #1a1a1a; }
            @media print {
              body { padding: 8mm; }
            }
            .container { background: white; max-width: 210mm; margin: 0 auto; padding: 18px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 16px; border-radius: 10px 10px 0 0; color: white; display: flex; align-items: center; justify-content: space-between; }
            .logo-section { display: flex; align-items: center; gap: 12px; }
            .logo { width: 60px; height: 60px; background: white; border-radius: 8px; padding: 8px; object-fit: contain; object-position: center; }
            .company-name { font-size: 20px; font-weight: 900; letter-spacing: 1px; }
            .company-name-en { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.95); margin-bottom: 6px; letter-spacing: 0.8px; }
            .company-info { font-size: 10px; color: #000000; line-height: 1.5; background: rgba(255,255,255,0.92); padding: 10px 12px; border-radius: 6px; margin-top: 8px; }
            .tax-invoice-badge { background: white; padding: 10px 15px; border-radius: 6px; text-align: right; box-shadow: 0 3px 10px rgba(0,0,0,0.08); }
            .tax-invoice-title { font-size: 20px; font-weight: 900; color: #dc2626; margin-bottom: 4px; }
            .tax-invoice-title-en { font-size: 11px; color: #666; font-weight: 600; }
            .tax-invoice-number { font-size: 14px; color: #dc2626; font-weight: 800; margin-top: 6px; }
            .info-section { margin-top: 18px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .info-box { background: linear-gradient(to right, #fef2f2 0%, #fee2e2 100%); padding: 12px; border-radius: 8px; border-left: 4px solid #dc2626; }
            .info-label { font-size: 9px; color: #666; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-value { font-size: 13px; font-weight: 700; color: #1a1a1a; }
            .items-section { margin-top: 18px; }
            .section-title { font-size: 13px; font-weight: 800; color: #1a1a1a; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 3px solid #dc2626; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
            .items-table thead { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; }
            .items-table th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
            .items-table th.text-right { text-align: right; }
            .items-table tbody tr { background: white; }
            .items-table tbody tr:nth-child(even) { background: #fef2f2; }
            .items-table td { padding: 10px 12px; font-size: 11px; color: #333; border-bottom: 1px solid #fee2e2; }
            .items-table td.text-right { text-align: right; font-weight: 600; }
            .total-section { margin-top: 18px; background: linear-gradient(to right, #fef2f2 0%, #fee2e2 100%); padding: 14px; border-radius: 8px; }
            .total-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 11px; }
            .total-label { color: #666; font-weight: 600; }
            .total-value { font-weight: 700; color: #1a1a1a; font-size: 12px; }
            .grand-total { margin-top: 10px; padding: 12px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
            .grand-total-label { color: white; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; }
            .grand-total-value { color: white; font-size: 18px; font-weight: 900; }
            .signature-section { margin-top: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
            .signature-box { border: 2px solid #fee2e2; padding: 14px; border-radius: 8px; background: #fefefe; }
            .signature-label { font-size: 11px; color: #666; margin-bottom: 8px; font-weight: 600; }
            .signature-area { height: 60px; border-bottom: 2px solid #e5e7eb; margin-bottom: 8px; }
            .signature-name { font-size: 10px; color: #999; text-align: center; }
            .footer { margin-top: 20px; padding-top: 14px; border-top: 2px solid #fee2e2; text-align: center; color: #999; font-size: 9px; line-height: 1.6; }
            .print-date { color: #666; font-weight: 600; margin-bottom: 4px; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-section">
                <img src="/kenergysave-logo.avif" alt="Company Logo" class="logo">
                <div>
                  <div class="company-name">주식회사 제라</div>
                  <div class="company-name-en">ZERA Co., Ltd</div>
                  <div class="company-info">
                    <strong>주소:</strong> 경기도 군포시 엘에스로166번길 16-10, 2층<br>
                    <strong>Address:</strong> 2F, 16-10, 166beon-gil, Elseso-ro, Gunpo-si, Gyeonggi-do, Korea<br>
                    <strong>전화 / Tel:</strong> +82 31-427-1380 | <strong>이메일 / Email:</strong> info@zera-energy.com<br>
                    <strong>Website:</strong> www.zera-energy.com
                  </div>
                </div>
              </div>
              <div class="tax-invoice-badge">
                <div class="tax-invoice-title">${locale === 'ko' ? '세금계산서' : 'TAX INVOICE'}</div>
                <div class="tax-invoice-title-en">${locale === 'ko' ? 'Tax Invoice' : '세금계산서'}</div>
                <div class="tax-invoice-number">${inv.taxInvoiceNumber}</div>
              </div>
            </div>

            <div class="info-section">
              <div class="info-box">
                <div class="info-label">${locale === 'ko' ? '거래처' : 'Company'} / ${locale === 'ko' ? 'Company' : '거래처'}</div>
                <div class="info-value">${inv.customer}</div>
              </div>
              <div class="info-box">
                <div class="info-label">${locale === 'ko' ? '사업자번호' : 'Business No.'} / ${locale === 'ko' ? 'Business No.' : '사업자번호'}</div>
                <div class="info-value">${inv.businessNumber}</div>
              </div>
              <div class="info-box">
                <div class="info-label">${locale === 'ko' ? '발행일' : 'Issue Date'} / ${locale === 'ko' ? 'Issue Date' : '발행일'}</div>
                <div class="info-value">${inv.issueDate}</div>
              </div>
              <div class="info-box">
                <div class="info-label">${locale === 'ko' ? '유형' : 'Type'} / ${locale === 'ko' ? 'Type' : '유형'}</div>
                <div class="info-value">${inv.type === 'sales' ? (locale === 'ko' ? '매출' : 'Sales') : (locale === 'ko' ? '매입' : 'Purchase')}</div>
              </div>
            </div>

            <div class="items-section">
              <div class="section-title">${locale === 'ko' ? '거래 내역' : 'Transaction Details'} / ${locale === 'ko' ? 'Transaction Details' : '거래 내역'}</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>${locale === 'ko' ? '품목' : 'Item'}</th>
                    <th class="text-right">${locale === 'ko' ? '수량' : 'Quantity'}</th>
                    <th class="text-right">${locale === 'ko' ? '단위' : 'Unit'}</th>
                    <th class="text-right">${locale === 'ko' ? '단가' : 'Unit Price'}</th>
                    <th class="text-right">${locale === 'ko' ? '금액' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${inv.items.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td class="text-right">${item.quantity.toLocaleString()}</td>
                      <td class="text-right">${item.unit}</td>
                      <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                      <td class="text-right">${formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="total-section">
              <div class="total-row">
                <span class="total-label">${locale === 'ko' ? '공급가액' : 'Supply Amount'} / ${locale === 'ko' ? 'Supply Amount' : '공급가액'}</span>
                <span class="total-value">${formatCurrency(inv.supplyAmount)}</span>
              </div>
              <div class="total-row">
                <span class="total-label">${locale === 'ko' ? '부가세' : 'VAT'} (10%) / ${locale === 'ko' ? 'VAT' : '부가세'} (10%)</span>
                <span class="total-value">${formatCurrency(inv.taxAmount)}</span>
              </div>
              <div class="grand-total">
                <span class="grand-total-label">${locale === 'ko' ? '합계 금액' : 'Grand Total'} / ${locale === 'ko' ? 'Grand Total' : '합계 금액'}</span>
                <span class="grand-total-value">${formatCurrency(inv.totalAmount)}</span>
              </div>
            </div>

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-label">${locale === 'ko' ? '발행인' : 'Issued By'} / ${locale === 'ko' ? 'Issued By' : '발행인'}</div>
                <div class="signature-area"></div>
                <div class="signature-name">${locale === 'ko' ? '(서명 또는 인)' : '(Signature or Seal)'}</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">${locale === 'ko' ? '수령인' : 'Received By'} / ${locale === 'ko' ? 'Received By' : '수령인'}</div>
                <div class="signature-area"></div>
                <div class="signature-name">${locale === 'ko' ? '(서명 또는 인)' : '(Signature or Seal)'}</div>
              </div>
            </div>

            <div class="footer">
              <div class="print-date">${locale === 'ko' ? '출력일시' : 'Print Date'}: ${new Date().toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US')}</div>
              <div>${locale === 'ko' ? '본 세금계산서는 전자문서로 법적 효력을 가집니다.' : 'This tax invoice is valid as an electronic document with legal effect.'}</div>
              <div>© ${new Date().getFullYear()} ZERA Co., Ltd. All rights reserved.</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/hr/dashboard')} className="text-red-600 hover:text-red-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{t.taxInvoices}</h1>
                  <p className="text-sm text-gray-600">{t.taxInvoicesDesc}</p>
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
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={locale === 'ko' ? '세금계산서 번호 또는 거래처 검색...' : 'Search tax invoice or company...'} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500">
            <option value="all">{locale === 'ko' ? '전체 유형' : 'All Types'}</option>
            <option value="sales">{locale === 'ko' ? '매출' : 'Sales'}</option>
            <option value="purchase">{locale === 'ko' ? '매입' : 'Purchase'}</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500">
            <option value="all">{locale === 'ko' ? '모든 상태' : 'All Status'}</option>
            <option value="paid">{t.paid}</option>
            <option value="unpaid">{t.unpaid}</option>
            <option value="partial">{t.partial}</option>
            <option value="overdue">{t.overdue}</option>
          </select>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />{t.addNew}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-4">
            <h2 className="text-white font-bold text-lg">{t.taxInvoices} ({filtered.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">No.</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.taxInvoiceNumber}</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '유형' : 'Type'}</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '거래처' : 'Company'}</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '사업자번호' : 'Business No.'}</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.issueDate}</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">{locale === 'ko' ? '공급가액' : 'Supply Amount'}</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.tax}</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.grandTotal}</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.paymentStatus}</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-4 text-sm font-medium text-red-600">{inv.taxInvoiceNumber}</td>
                    <td className="px-4 py-4 text-center">{typeBadge(inv.type)}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{inv.customer}</td>
                    <td className="px-4 py-4 text-sm text-gray-500 font-mono">{inv.businessNumber}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{inv.issueDate}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 text-right">{formatCurrency(inv.supplyAmount)}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 text-right">{formatCurrency(inv.taxAmount)}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-4 py-4 text-center">{paymentBadge(inv.paymentStatus)}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedInvoice(inv)} className="text-red-500 hover:text-red-700" title={locale === 'ko' ? '상세보기' : 'View Details'}><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handlePrint(inv)} className="text-green-500 hover:text-green-700" title={locale === 'ko' ? '인쇄' : 'Print'}><Printer className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(inv.id)} className="text-red-400 hover:text-red-600" title={locale === 'ko' ? '삭제' : 'Delete'}><Trash2 className="w-4 h-4" /></button>
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
            <div className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">{selectedInvoice.taxInvoiceNumber}</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">{locale === 'ko' ? '거래처' : 'Company'}</p><p className="font-medium">{selectedInvoice.customer}</p></div>
                <div><p className="text-xs text-gray-500">{locale === 'ko' ? '사업자번호' : 'Business No.'}</p><p className="font-medium font-mono">{selectedInvoice.businessNumber}</p></div>
                <div><p className="text-xs text-gray-500">{locale === 'ko' ? '유형' : 'Type'}</p>{typeBadge(selectedInvoice.type)}</div>
                <div><p className="text-xs text-gray-500">{t.issueDate}</p><p className="font-medium">{selectedInvoice.issueDate}</p></div>
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
                <p className="text-sm">{locale === 'ko' ? '공급가액' : 'Supply Amount'}: {formatCurrency(selectedInvoice.supplyAmount)}</p>
                <p className="text-sm">{t.tax} (10%): {formatCurrency(selectedInvoice.taxAmount)}</p>
                <p className="text-lg font-bold">{t.grandTotal}: {formatCurrency(selectedInvoice.totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">{t.addNew} {t.taxInvoices}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '세금계산서 발행할 Invoice 선택' : 'Select Invoice for Tax Invoice'}</label>
                <select value={newInvoice.invoiceId} onChange={e => handleInvoiceSelect(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500">
                  <option value="">{locale === 'ko' ? 'Invoice 선택...' : 'Select Invoice...'}</option>
                  {availableInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.customer} ({formatCurrency(inv.totalAmount)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '거래처' : 'Company'}</label><input value={newInvoice.customer} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '사업자번호' : 'Business No.'}</label><input value={newInvoice.businessNumber} onChange={e => setNewInvoice({ ...newInvoice, businessNumber: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.issueDate}</label><input type="date" value={newInvoice.issueDate} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '품목명' : 'Item Name'}</label><input value={newInvoice.itemName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.quantity}</label><input type="number" value={newInvoice.quantity} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? '단위' : 'Unit'}</label><input value={newInvoice.unit} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.unitPrice}</label><input type="number" value={newInvoice.unitPrice} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" /></div>
              </div>

              {/* Payment Information Section */}
              <div className="border-t pt-4">
                <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  {locale === 'ko' ? '고객 결제 정보' : 'Customer Payment Information'}
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'ko' ? '받은 금액' : 'Amount Received'}
                    </label>
                    <input 
                      type="number" 
                      value={newInvoice.paymentReceived} 
                      onChange={(e) => {
                        const received = Number(e.target.value);
                        const totalAmount = newInvoice.quantity * newInvoice.unitPrice * 1.1; // Including tax
                        const remaining = Math.max(0, totalAmount - received);
                        const status = received >= totalAmount ? 'paid' : received > 0 ? 'partial' : 'pending';
                        setNewInvoice({ 
                          ...newInvoice, 
                          paymentReceived: received, 
                          remainingAmount: remaining,
                          paymentStatus: status
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500" 
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'ko' ? '결제일' : 'Payment Date'}
                    </label>
                    <input 
                      type="date" 
                      value={newInvoice.paymentDate} 
                      onChange={(e) => setNewInvoice({ ...newInvoice, paymentDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'ko' ? '결제 방법' : 'Payment Method'}
                    </label>
                    <select 
                      value={newInvoice.paymentMethod} 
                      onChange={(e) => setNewInvoice({ ...newInvoice, paymentMethod: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                    >
                      <option value="bank_transfer">{locale === 'ko' ? '계좌 이체' : 'Bank Transfer'}</option>
                      <option value="credit_card">{locale === 'ko' ? '신용카드' : 'Credit Card'}</option>
                      <option value="cash">{locale === 'ko' ? '현금' : 'Cash'}</option>
                      <option value="check">{locale === 'ko' ? '수표' : 'Check'}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {locale === 'ko' ? '결제 상태' : 'Payment Status'}
                    </label>
                    <select 
                      value={newInvoice.paymentStatus} 
                      onChange={(e) => setNewInvoice({ ...newInvoice, paymentStatus: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                    >
                      <option value="pending">{locale === 'ko' ? '대기' : 'Pending'}</option>
                      <option value="partial">{locale === 'ko' ? '부분 결제' : 'Partial'}</option>
                      <option value="paid">{locale === 'ko' ? '완료' : 'Paid'}</option>
                      <option value="overdue">{locale === 'ko' ? '연체' : 'Overdue'}</option>
                    </select>
                  </div>
                </div>
                
                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>{locale === 'ko' ? '전체 금액:' : 'Total Amount:'}</span>
                      <span className="font-medium">{formatCurrency(newInvoice.quantity * newInvoice.unitPrice * 1.1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{locale === 'ko' ? '받은 금액:' : 'Received:'}</span>
                      <span className="font-medium text-green-600">{formatCurrency(newInvoice.paymentReceived)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>{locale === 'ko' ? '남은 금액:' : 'Remaining:'}</span>
                      <span className="font-bold text-red-600">{formatCurrency(newInvoice.remainingAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t.cancel}</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
