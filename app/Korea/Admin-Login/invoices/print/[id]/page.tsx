'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';

type InvoiceData = {
  id: string;
  invoiceNumber?: string;
  customer?: string;
  customer_address?: string;
  issueDate?: string;
  dueDate?: string;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
  paymentStatus?: string;
  notes?: string;
  salesContractNumber?: string;
  pdo_number?: string;
  pdo_branch?: string;
  linked_pdo_number?: string;
  linked_pdo_date?: string;
  linked_pdo_product?: string;
  linked_pdo_status?: string;
};

export default function InvoicePrintPage() {
  const params = useParams();
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const isKo = locale === 'ko';
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const res = await fetch(`/api/korea-invoices/${params.id}`);
        const json = await res.json();
        if (json.success && json.invoice) {
          setInvoice(json.invoice);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadInvoice();
    }
  }, [params.id]);

  useEffect(() => {
    // Auto-print when invoice loads
    if (invoice && !loading) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [invoice, loading]);

  const formatDate = (value?: string) => {
    if (!value) return '-';
    try {
      const dt = new Date(value);
      if (Number.isNaN(dt.getTime())) return value;
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return value;
    }
  };

  const formatMoney = (value?: number) => {
    return new Intl.NumberFormat(isKo ? 'ko-KR' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(value || 0));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">{isKo ? '로딩 중...' : 'Loading...'}</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">
          {isKo ? '인보이스를 찾을 수 없습니다.' : 'Invoice not found.'}
        </div>
      </div>
    );
  }

  const invoiceNo = invoice.invoiceNumber || invoice.id;
  const customerId = (invoice.id || '').replace(/[^0-9]/g, '').slice(-5) || '-';
  const itemDescription = invoice.linked_pdo_product || invoice.notes?.split('\n')[0] || 'K-Saver-30kVA';
  const qty = 1;
  const unitPrice = Number(invoice.subtotal || invoice.totalAmount || 0);
  const subtotal = Number(invoice.subtotal || unitPrice * qty);
  const taxRate = Number(invoice.taxRate || 0);
  const taxAmount = Number(invoice.taxAmount || 0);
  const totalAmount = Number(invoice.totalAmount || subtotal + taxAmount);
  const thailandBranchName = 'K Energy Save Co., Ltd. (Thailand Branch)';
  const thailandBranchAddress = [
    '84 Chaloem Phrakiat Rama 9 Soi 34',
    'Nong Bon, Prawet',
    'Bangkok 10250, Thailand'
  ].join('\n');

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html, body {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            font-family: Arial, Helvetica, sans-serif;
          }

          .no-print {
            display: none !important;
          }

          .print-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 10mm 11mm;
            box-sizing: border-box;
            background: #fff;
            overflow: hidden;
          }
        }

        @media screen {
          .print-container {
            width: 210mm;
            min-height: 297mm;
            margin: 18px auto;
            padding: 10mm 11mm;
            box-sizing: border-box;
            background: #fff;
            box-shadow: 0 0 12px rgba(0,0,0,0.15);
            overflow: hidden;
          }
        }
      `}</style>

      <div className="no-print fixed left-4 top-4 z-50 flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          {isKo ? '← 뒤로 가기' : '← Back'}
        </button>

        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setLocale('ko')}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              locale === 'ko' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            한국어
          </button>
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              locale === 'en' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            English
          </button>
        </div>
      </div>

      <div className="print-container text-[11px] leading-[1.25] text-black">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <img src="/zera-logo.png" alt="ZERA" className="mb-1 h-14 w-auto object-contain" />
            <p>2F,16-10, 166Beon-Gil, Gunpo-Si, Gyeonggi-do, Korea</p>
            <p className="mt-1">TEL : +82-31-427-1380</p>
            <p>E-MAIL: info@zera-energy.com</p>
            <p>Prepared by: Eun Seok Oh / Assistant Manager</p>
          </div>

          <div className="w-[46%]">
            <h1 className="mb-2 text-right text-[32px] font-bold leading-none text-[#6f83b8]">INVOICE</h1>
            <table className="ml-auto w-[78%] border border-black border-collapse">
              <tbody>
                <tr>
                  <td className="w-[48%] border border-black px-2 py-1 text-right font-semibold">DATE</td>
                  <td className="border border-black px-2 py-1 text-center">{formatDate(invoice.issueDate)}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 text-right font-semibold">INVOICE NO</td>
                  <td className="border border-black px-2 py-1 text-center">{invoiceNo}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 text-right font-semibold">CUSTOMER ID</td>
                  <td className="border border-black px-2 py-1 text-center">{customerId}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 bg-[#2f4a87] px-2 py-1 text-[13px] font-bold tracking-wide text-white">CUSTOMER</div>
            <div className="min-h-[84px] border border-black p-2 text-[11px] leading-[1.25]">
              <p className="font-bold">{thailandBranchName}</p>
              <p className="mt-1 whitespace-pre-line">{thailandBranchAddress}</p>
            </div>
          </div>

          <div>
            <div className="mb-1 bg-[#2f4a87] px-2 py-1 text-[13px] font-bold tracking-wide text-white">REMARK</div>
            <div className="min-h-[84px] border border-black p-2 text-[11px] leading-[1.25]">
              <p>CONSIGNEE : {thailandBranchName.toUpperCase()}</p>
              <p>DESTINATION : BANGKOK, THAILAND</p>
              <p>INVOICE NO. OR PO NO : {invoice.salesContractNumber || invoice.linked_pdo_number || '-'}</p>
              <p>ORIGIN : MADE IN KOREA</p>
            </div>
          </div>
        </div>

        <table className="w-full border border-black border-collapse text-[11px] leading-[1.2]">
          <thead>
            <tr className="bg-[#2f4a87] text-white">
              <th className="w-[58%] border border-black px-2 py-1 text-left">DESCRIPTION</th>
              <th className="w-[14%] border border-black px-2 py-1">UNIT PRICE</th>
              <th className="w-[11%] border border-black px-2 py-1">QTY</th>
              <th className="w-[17%] border border-black px-2 py-1">AMOUNT(USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-2 py-1">{itemDescription}</td>
              <td className="border border-black px-2 py-1 text-center">$ {formatMoney(unitPrice)}</td>
              <td className="border border-black px-2 py-1 text-center">{qty}</td>
              <td className="border border-black px-2 py-1 text-right">$ {formatMoney(subtotal)}</td>
            </tr>
            {Array.from({ length: 8 }).map((_, idx) => (
              <tr key={idx}>
                <td className="h-5 border border-black" />
                <td className="border border-black" />
                <td className="border border-black" />
                <td className="border border-black" />
              </tr>
            ))}
            <tr>
              <td className="border border-black px-2 py-2 align-top" colSpan={3}>
                <p className="font-bold">***Summary of Payment***</p>
                <p>Total Amount: $ {formatMoney(totalAmount)} CIF Bangkok Based</p>
                {invoice.notes ? (
                  <p className="whitespace-pre-line">{invoice.notes}</p>
                ) : (
                  <>
                    <p>1st : $ {formatMoney(totalAmount / 2)} (50% against B/L)</p>
                    <p>2nd: $ {formatMoney(totalAmount / 2)} (50% after 90 days upon completion of installation)</p>
                  </>
                )}
              </td>
              <td className="border border-black" />
            </tr>
          </tbody>
        </table>

        <div className="mt-3 grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <div className="mb-1 bg-[#2f4a87] px-2 py-1 text-[13px] font-bold tracking-wide text-white">BANK INFORMATION</div>
            <div className="min-h-[148px] border border-black p-2 text-[11px] leading-[1.3]">
              <p className="italic">Beneficiary : ZERA co.</p>
              <p className="italic">Bank Name : industrial Bank of Korea</p>
              <p className="italic">Account No. : 165-132084-56-00010</p>
              <p className="italic">Swift Code : IBKOKRSEXXX</p>
              <p className="italic">Branch : Seongnam High-Tech</p>
              <p className="mt-2 italic">Address : 8, 457beon-gil, Dunchon-daero, Jungwon-gu,</p>
              <p className="italic">Seongnam-si, Gyeonggi-do, Republic of Korea</p>
            </div>
          </div>

          <div className="col-span-2">
            <table className="w-full border border-black border-collapse text-[11px] leading-[1.25]">
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1">Subtotal</td>
                  <td className="border border-black px-2 py-1 text-right">$ {formatMoney(subtotal)}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1">Taxable</td>
                  <td className="border border-black px-2 py-1 text-right">{taxRate ? `${taxRate}%` : ''}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1">Tax due</td>
                  <td className="border border-black px-2 py-1 text-right">{taxAmount ? `$ ${formatMoney(taxAmount)}` : ''}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1">Other</td>
                  <td className="border border-black px-2 py-1" />
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 font-bold">TOTAL</td>
                  <td className="border border-black px-2 py-1 text-right font-bold">$ {formatMoney(totalAmount)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 text-[11px]">
              <p>Confirmed by</p>
              <div className="mt-2 h-10 border-b border-black" />
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[16px] font-semibold italic">Thank You For Your Business!</div>
      </div>
    </>
  );
}
