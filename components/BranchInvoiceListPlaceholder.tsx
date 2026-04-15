'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';

type BranchInvoiceListPlaceholderProps = {
  branchNameEn: string;
  branchNameKo: string;
  subtitleEn: string;
  subtitleKo: string;
  accentClass: string;
  createHref: string;
};

export default function BranchInvoiceListPlaceholder({
  branchNameEn,
  branchNameKo,
  subtitleEn,
  subtitleKo,
  accentClass,
  createHref,
}: BranchInvoiceListPlaceholderProps) {
  const { locale, setLocale } = useLocale();
  const isKo = locale === 'ko';

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/production/dashboard"
            className="inline-flex items-center rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
          >
            {isKo ? '← 생산 대시보드로 돌아가기' : '← Back to Production Dashboard'}
          </Link>

          <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setLocale('ko')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${locale === 'ko' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              한국어
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${locale === 'en' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              English
            </button>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl">
          <div className={`h-2 w-full ${accentClass}`} />
          <div className="p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
              {isKo ? '지점 인보이스 목록' : 'Branch Invoice List'}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {isKo ? branchNameKo : branchNameEn}
            </h1>
            <p className="mt-2 text-base text-gray-600">
              {isKo ? subtitleKo : subtitleEn}
            </p>

            <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
              <div className="text-lg font-semibold text-gray-800">
                {isKo ? '이 지점의 인보이스 목록 페이지입니다.' : 'This is the invoice list page for this branch.'}
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {isKo ? '현재 표시할 인보이스 데이터가 없습니다.' : 'There are no invoices to display right now.'}
              </p>
              <div className="mt-6">
                <Link
                  href={createHref}
                  className={`inline-flex items-center rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 ${accentClass}`}
                >
                  {isKo ? '인보이스 생성 페이지로 이동' : 'Go to Invoice Create Page'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
