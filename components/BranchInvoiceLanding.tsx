'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';

type BranchCode = 'KR' | 'TH' | 'VN' | 'MY' | 'BN';

type BranchInvoiceLandingProps = {
  branchCode: BranchCode;
  branchNameEn: string;
  branchNameKo: string;
  subtitleEn: string;
  subtitleKo: string;
  flagSrc: string;
  flagAlt: string;
  accentClass: string;
  formHref?: string;
  listHref?: string;
};

type DraftItem = {
  desc: string;
  qty: number;
  price: number;
};

type DeliveryReport = {
  id: string;
  documentNo: string;
  documentDate: string;
  customerName: string;
  phone: string;
  address: string;
  referenceNo: string;
  sourceLabel: string;
  items: DraftItem[];
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function buildDefaultInvoiceNo(branchCode: BranchCode) {
  const ymd = todayString().replaceAll('-', '');
  return `INV-${ymd}-${branchCode}00001`;
}

function normalizeItems(items: any[]): DraftItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    return [{ desc: '', qty: 1, price: 0 }];
  }

  const mapped = items.map((item) => ({
    desc: String(
      item?.product_name ||
      item?.productName ||
      item?.name ||
      item?.description ||
      item?.desc ||
      item?.sku ||
      ''
    ),
    qty: Number(item?.quantity || item?.qty || item?.Qty || 1) || 1,
    price: Number(item?.price || item?.unit_price || item?.unitPrice || 0) || 0,
  }))

  return mapped.length > 0 ? mapped : [{ desc: '', qty: 1, price: 0 }];
}

export default function BranchInvoiceLanding({
  branchCode,
  branchNameEn,
  branchNameKo,
  subtitleEn,
  subtitleKo,
  flagSrc,
  flagAlt,
  accentClass,
  formHref,
  listHref,
}: BranchInvoiceLandingProps) {
  const { locale, setLocale } = useLocale();
  const isKo = locale === 'ko';

  const branchName = isKo ? branchNameKo : branchNameEn;
  const subtitle = isKo ? subtitleKo : subtitleEn;

  const fixedBranchCompanyName = branchCode === 'TH' ? 'K Energy Save co., Ltd (Group of Zera) Thailand' : '';
  const fixedBranchPhone = branchCode === 'TH' ? '02-080-8916' : '';
  const fixedBranchEmail = branchCode === 'TH' ? 'info@kenergy-save.com' : '';
  const fixedBranchAddress = branchCode === 'TH' ? '84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250, Thailand' : '';

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingReports, setLoadingReports] = useState(false);
  const [reports, setReports] = useState<DeliveryReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DeliveryReport | null>(null);
  const [invoiceNo, setInvoiceNo] = useState(() => buildDefaultInvoiceNo(branchCode));
  const [invoiceNoLoading, setInvoiceNoLoading] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(() => todayString());
  const [customerName, setCustomerName] = useState(fixedBranchCompanyName);
  const [customerPhone, setCustomerPhone] = useState(fixedBranchPhone);
  const [customerAddress, setCustomerAddress] = useState(fixedBranchAddress);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([{ desc: '', qty: 1, price: 0 }]);
  const [vatRate, setVatRate] = useState(branchCode === 'TH' ? 7 : 0);
  const [saving, setSaving] = useState(false);

  const refreshInvoiceNo = async () => {
    setInvoiceNoLoading(true);
    try {
      const res = await fetch(`/api/branch-invoices?branchCode=${encodeURIComponent(branchCode)}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data?.success && data?.invoiceNo) {
        setInvoiceNo(String(data.invoiceNo));
      } else {
        setInvoiceNo(buildDefaultInvoiceNo(branchCode));
      }
    } catch {
      setInvoiceNo(buildDefaultInvoiceNo(branchCode));
    } finally {
      setInvoiceNoLoading(false);
    }
  };

  // Load next invoice number from DB on mount
  useEffect(() => { void refreshInvoiceNo(); }, []);

  const draftSubtotal = draftItems.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0);
  const draftVat = draftSubtotal * (Number(vatRate) || 0) / 100;
  const draftTotal = draftSubtotal + draftVat;

  const q = searchTerm.trim().toLowerCase();
  const filteredReports = !q
    ? reports
    : reports.filter((report) =>
        report.documentNo.toLowerCase().includes(q) ||
        report.customerName.toLowerCase().includes(q) ||
        report.referenceNo.toLowerCase().includes(q) ||
        report.address.toLowerCase().includes(q)
      );

  const updateDraftItem = (index: number, key: keyof DraftItem, value: string) => {
    setDraftItems((prev) => prev.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      if (key === 'desc') return { ...item, desc: value };
      return { ...item, [key]: Number(value) || 0 };
    }));
  };

  const addDraftItem = () => setDraftItems((prev) => [...prev, { desc: '', qty: 1, price: 0 }]);
  const removeDraftItem = (index: number) => setDraftItems((prev) => prev.length > 1 ? prev.filter((_, itemIndex) => itemIndex !== index) : prev);

  const applyReport = (report: DeliveryReport) => {
    setSelectedReport(report);
    setCustomerName(report.customerName);
    setCustomerPhone(report.phone);
    setCustomerAddress(report.address);
    setDraftItems(report.items.length > 0 ? report.items : [{ desc: '', qty: 1, price: 0 }]);
    setShowSearchModal(false);
  };

  const handleSave = async () => {
    if (!invoiceNo.trim()) {
      alert(isKo ? '인보이스 번호를 입력하세요.' : 'Please enter invoice number.');
      return;
    }
    if (!customerName.trim()) {
      alert(isKo ? '고객 이름을 입력하세요.' : 'Please enter customer name.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        invNo: invoiceNo,
        invDate: invoiceDate,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        subtotal: draftSubtotal,
        vat: vatRate,
        vat_amount: draftVat,
        total_amount: draftTotal,
        items: draftItems.map(item => ({
          desc: item.desc,
          qty: item.qty,
          price: item.price,
          total: item.qty * item.price
        })),
        branch_code: branchCode,
        delivery_reference: selectedReport?.documentNo || null
      };

      const res = await fetch('/api/branch-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (res.ok && json.success) {
        alert(isKo ? '인보이스가 저장되었습니다!' : 'Invoice saved successfully!');
        // Reset form and get next invoice number from DB
        await refreshInvoiceNo();
        setInvoiceDate(todayString());
        setCustomerName(fixedBranchCompanyName);
        setCustomerPhone(fixedBranchPhone);
        setCustomerAddress(fixedBranchAddress);
        setDraftItems([{ desc: '', qty: 1, price: 0 }]);
        setSelectedReport(null);
      } else {
        throw new Error(json.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert(isKo ? `저장 실패: ${error.message}` : `Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      let nextReports: DeliveryReport[] = [];

      if (branchCode === 'TH') {
        // Fetch from kr_shipment_updates (TH destination) + used invoice data in parallel
        const [shipRes, invRes] = await Promise.all([
          fetch('/api/korea/shipment-updates?destination=Thailand', { cache: 'no-store' }),
          fetch(`/api/branch-invoices?branchCode=TH`, { cache: 'no-store' }),
        ]);
        const shipJson = await shipRes.json();
        const invJson = invRes.ok ? await invRes.json() : {};
        const usedShipments = new Set<string>((invJson.usedShipmentNos || []).map((s: string) => s.toUpperCase()));
        const usedPdos = new Set<string>((invJson.usedPdoNos || []).map((s: string) => s.toUpperCase()));
        const rows = Array.isArray(shipJson) ? shipJson : (Array.isArray(shipJson?.rows) ? shipJson.rows : []);
        nextReports = rows
          .filter((row: any) => {
            const sn = String(row.shipmentNumber || '').toUpperCase();
            const pdo = String(row.orderNumber || '').toUpperCase();
            return !usedShipments.has(sn) && !(pdo && usedPdos.has(pdo));
          })
          .map((row: any) => ({
            id: String(row.id || row.shipmentNumber || ''),
            documentNo: String(row.shipmentNumber || ''),
            documentDate: String(row.estimatedDelivery || row.lastUpdate || row.created_at || ''),
            customerName: String(row.contactPerson || row.destination || 'Thailand Branch'),
            phone: String(row.contactPhone || ''),
            address: String(row.destinationAddress || ''),
            referenceNo: String(row.orderNumber || ''),
            sourceLabel: 'Thailand Shipment List',
            items: normalizeItems(Array.isArray(row.items) ? row.items : (typeof row.items === 'string' ? JSON.parse(row.items || '[]') : [])),
          }));
      } else if (branchCode === 'KR') {
        const res = await fetch('/api/korea/domestic-shipments', { cache: 'no-store' });
        const rows = await res.json();
        nextReports = (Array.isArray(rows) ? rows : []).map((row: any) => ({
          id: String(row.id || row.shipmentNumber || ''),
          documentNo: String(row.shipmentNumber || ''),
          documentDate: String(row.shipDate || row.estimatedDelivery || row.actualDelivery || row.created_at || ''),
          customerName: String(row.destinationRegion || 'Korea Domestic'),
          phone: '',
          address: String(row.destinationAddress || ''),
          referenceNo: String(row.orderNumber || ''),
          sourceLabel: 'Korea Domestic Shipment',
          items: normalizeItems(row.items || []),
        }));
      } else {
        const res = await fetch('/api/korea/int-shipments', { cache: 'no-store' });
        const rows = await res.json();
        nextReports = (Array.isArray(rows) ? rows : [])
          .filter((row: any) => String(row.branchCountryCode || '').toUpperCase() === branchCode)
          .map((row: any) => ({
            id: String(row.id || row.shipmentNumber || ''),
            documentNo: String(row.shipmentNumber || ''),
            documentDate: String(row.shipDate || row.estimatedDelivery || row.actualDelivery || row.created_at || ''),
            customerName: String(row.destination || row.branchCountry || branchNameEn),
            phone: '',
            address: String(row.destinationAddress || ''),
            referenceNo: String(row.orderNumber || ''),
            sourceLabel: 'International Shipment',
            items: normalizeItems(row.items || []),
          }));
      }

      setReports(nextReports);
    } catch (error) {
      console.error('Failed to load delivery reports:', error);
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-10">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/production/dashboard"
            className="no-print inline-flex items-center rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
          >
            {isKo ? '← 생산 대시보드로 돌아가기' : '← Back to Production Dashboard'}
          </Link>

          <div className="no-print inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setLocale('ko')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                locale === 'ko'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              한국어
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                locale === 'en'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl">
          <div className={`h-2 w-full ${accentClass}`} />

          <div className="p-8 md:p-10">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                  <Image
                    src={flagSrc}
                    alt={flagAlt}
                    width={72}
                    height={72}
                    className="h-16 w-16 object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                    {isKo ? '지점 인보이스' : 'Branch Invoice'}
                  </p>
                  <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                    {branchName}
                  </h1>
                  <p className="mt-2 text-base text-gray-600">
                    {subtitle}
                  </p>
                </div>
              </div>

            </div>

            <div className="no-print mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={async () => {
                  setShowSearchModal(true);
                  await loadReports();
                }}
                className={`inline-flex items-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 ${accentClass}`}
              >
                {isKo ? '배송 보고서 검색' : 'Search Delivery Report'}
              </button>

              <Link
                href={listHref || '/production/dashboard'}
                className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                {listHref
                  ? (isKo
                      ? `Korea HQ → ${branchCode} 인보이스 목록`
                      : `Korea HQ → ${branchCode} Invoice List`)
                  : (isKo ? '대시보드로 돌아가기' : 'Return to Dashboard')}
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      {isKo ? '인보이스 번호' : 'Invoice No.'}
                    </label>
                    <input
                      value={invoiceNoLoading ? (isKo ? '불러오는 중...' : 'Loading...') : invoiceNo}
                      onChange={(e) => !invoiceNoLoading && setInvoiceNo(e.target.value)}
                      readOnly={invoiceNoLoading}
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-400 ${invoiceNoLoading ? 'border-gray-200 bg-gray-100 text-gray-400' : 'border-gray-300 bg-white'}`}
                    />
                  </div>
                  <div className="w-full md:w-56">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      {isKo ? '날짜' : 'Date'}
                    </label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-400"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      {isKo ? '지점 회사명' : 'Branch Company Name'}
                    </label>
                    {fixedBranchCompanyName ? (
                      <div className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-800">
                        {fixedBranchCompanyName}
                      </div>
                    ) : (
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-400"
                      />
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      {isKo ? '연락처' : 'Phone'}
                    </label>
                    {fixedBranchPhone ? (
                      <div className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-800">
                        {fixedBranchPhone}
                      </div>
                    ) : (
                      <input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-400"
                      />
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      VAT (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    {isKo ? '주소' : 'Address'}
                  </label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-400"
                  />
                </div>

                {selectedReport && (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
                    <div className="font-semibold">
                      {isKo ? '가져온 배송 보고서' : 'Imported Delivery Report'}
                    </div>
                    <div className="mt-1">
                      {selectedReport.documentNo} {selectedReport.referenceNo ? `• Ref ${selectedReport.referenceNo}` : ''} {selectedReport.documentDate ? `• ${selectedReport.documentDate}` : ''}
                    </div>
                    <div className="mt-1 text-orange-700">{selectedReport.sourceLabel}</div>
                  </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{isKo ? '설명' : 'Description'}</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{isKo ? '수량' : 'Qty'}</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{isKo ? '단가' : 'Price'}</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{isKo ? '합계' : 'Total'}</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftItems.map((item, index) => (
                        <tr key={`${index}-${item.desc}`} className="border-t border-gray-100">
                          <td className="px-4 py-3">
                            <input
                              value={item.desc}
                              onChange={(e) => updateDraftItem(index, 'desc', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-orange-400"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              value={item.qty}
                              onChange={(e) => updateDraftItem(index, 'qty', e.target.value)}
                              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm text-gray-800 outline-none transition focus:border-orange-400"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              value={item.price}
                              onChange={(e) => updateDraftItem(index, 'price', e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm text-gray-800 outline-none transition focus:border-orange-400"
                            />
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                            {((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeDraftItem(index)}
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              {isKo ? '삭제' : 'Remove'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={addDraftItem}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    {isKo ? '+ 항목 추가' : '+ Add Item'}
                  </button>

                  <div className="min-w-64 rounded-2xl border border-gray-200 bg-white p-4 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>{isKo ? '소계' : 'Subtotal'}</span>
                      <span>{draftSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-gray-600">
                      <span>VAT</span>
                      <span>{draftVat.toLocaleString()}</span>
                    </div>
                    <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
                      <span>{isKo ? '합계' : 'Total'}</span>
                      <span>{draftTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50 ${accentClass}`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {saving ? (isKo ? '저장 중...' : 'Saving...') : (isKo ? '인보이스 저장' : 'Save Invoice')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showSearchModal && (
        <div className="no-print fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isKo ? '배송 보고서 선택' : 'Select Delivery Report'}
                </h2>
                <p className="text-sm text-gray-500">
                  {branchName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                ✕
              </button>
            </div>

            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isKo ? '번호, 주문번호, 주소 검색' : 'Search by number, reference, or address'}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-400"
                />
                <button
                  type="button"
                  onClick={loadReports}
                  className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 ${accentClass}`}
                >
                  {loadingReports ? (isKo ? '불러오는 중...' : 'Loading...') : (isKo ? '검색' : 'Search')}
                </button>
              </div>
            </div>

            <div className="max-h-[55vh] overflow-auto px-6 py-4">
              {loadingReports ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  {isKo ? '배송 보고서를 불러오는 중입니다.' : 'Loading delivery reports.'}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  {isKo ? '표시할 배송 보고서가 없습니다.' : 'No delivery reports found.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => applyReport(report)}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-base font-bold text-gray-900">{report.documentNo}</div>
                          <div className="mt-1 text-sm text-gray-600">
                            {report.customerName || branchName}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {report.address}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{report.documentDate}</div>
                          {report.referenceNo && (
                            <div className="mt-1">{isKo ? '참조' : 'Ref'}: {report.referenceNo}</div>
                          )}
                          <div className="mt-1 text-xs text-orange-600">{report.sourceLabel}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
