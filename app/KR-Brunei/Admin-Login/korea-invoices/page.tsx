'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';

type KoreaInvoice = {
  id: string;
  invoiceNumber?: string;
  customer?: string;
  issueDate?: string;
  dueDate?: string;
  totalAmount?: number;
  paymentStatus?: string;
  linked_pdo_number?: string;
  pdo_branch?: string;
};

export default function BruneiKoreaInvoicesPage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const isKo = locale === 'ko';
  const [rows, setRows] = useState<KoreaInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/korea-invoices?branch=brunei&status=all', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.error || 'Failed to load invoices');
        }
        setRows(Array.isArray(json.rows) ? json.rows : []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatDate = (value?: string) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleDateString('en-BN');
    } catch {
      return value;
    }
  };

  const formatMoney = (value?: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value || 0));
  };

  const statusLabel = (status?: string) => {
    const value = status || 'unpaid';
    if (value === 'paid') return isKo ? '지급완료' : 'Paid';
    if (value === 'partial') return isKo ? '부분지급' : 'Partial';
    if (value === 'overdue') return isKo ? '연체' : 'Overdue';
    if (value === 'unpaid') return isKo ? '미지급' : 'Unpaid';
    return value;
  };

  const handlePrint = (id: string) => {
    window.open(`/Korea/Admin-Login/invoices/print/${id}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push('/KR-Brunei/Admin-Login/invoices/create')}
            className="inline-flex items-center rounded-lg border border-yellow-200 bg-white px-4 py-2 text-sm font-medium text-yellow-700 transition hover:border-yellow-300 hover:bg-yellow-50"
          >
            {isKo ? '← 돌아가기' : '← Back'}
          </button>

          <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setLocale('ko')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${locale === 'ko' ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              한국어
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${locale === 'en' ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              English
            </button>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-yellow-100 bg-white shadow-xl">
          <div className="h-2 w-full bg-yellow-500" />
          <div className="p-8 md:p-10">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500">
                  Korea HQ → Brunei
                </p>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                  {isKo ? '본사 인보이스 목록' : 'Korea HQ Invoices'}
                </h1>
                <p className="mt-2 text-base text-gray-600">
                  {isKo ? '본사에서 발행한 브루나이 지점 인보이스' : 'Invoices from Korea HQ to Brunei Branch'}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
                <div className="font-semibold text-gray-800">{isKo ? '전체 건수' : 'Total'}</div>
                <div className="mt-1 text-2xl font-bold text-yellow-600">{rows.length}</div>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
                {isKo ? '인보이스를 불러오는 중입니다.' : 'Loading...'}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center text-sm text-red-600">
                {error}
              </div>
            ) : rows.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
                {isKo ? '표시할 인보이스가 없습니다.' : 'No invoices found'}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Invoice No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Issue Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Print</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="border-t border-gray-100 hover:bg-yellow-50/40">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{row.invoiceNumber || row.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <div>{row.customer || '-'}</div>
                            {row.linked_pdo_number && (
                              <div className="mt-1 text-xs text-yellow-600 font-medium">
                                PDO: {row.linked_pdo_number}
                                {row.pdo_branch && <span className="ml-1 text-gray-500">({row.pdo_branch})</span>}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatDate(row.issueDate)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatDate(row.dueDate)}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">$ {formatMoney(row.totalAmount)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                              {statusLabel(row.paymentStatus)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handlePrint(row.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-yellow-600"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              Print
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
