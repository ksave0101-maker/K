'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, FileText } from 'lucide-react';

type ApprovalLocale = 'ko' | 'en';

const copy = {
  ko: {
    title: '로그인 성공',
    subtitle: '승인 검토 시스템에 정상적으로 로그인되었습니다.',
    detail: '잠시 후 승인 요청 목록으로 이동합니다.',
    goNow: '지금 바로 이동',
    loginAgain: '로그인 페이지로 돌아가기'
  },
  en: {
    title: 'Login Successful',
    subtitle: 'You have successfully signed in to the approval review system.',
    detail: 'You will be redirected to approval requests shortly.',
    goNow: 'Go Now',
    loginAgain: 'Back to Login'
  }
} as const;

export default function ApprovalReviewLoginSuccessPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [pageLocale, setPageLocale] = useState<ApprovalLocale>('ko');

  const t = useMemo(() => copy[pageLocale], [pageLocale]);

  useEffect(() => {
    setMounted(true);

    try {
      const user = localStorage.getItem('k_system_admin_user');
      if (!user) {
        router.replace('/executive/approval-review-login');
        return;
      }

      const savedLocale = localStorage.getItem('executive-approval-locale') || localStorage.getItem('locale');
      if (savedLocale === 'ko' || savedLocale === 'en') {
        setPageLocale(savedLocale);
      }
    } catch {
      router.replace('/executive/approval-review-login');
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace('/executive/approval-review');
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-center text-sm text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-gray-600 mt-2">{t.subtitle}</p>
        <p className="text-sm text-indigo-600 mt-1">{t.detail}</p>

        <div className="mt-6 grid grid-cols-1 gap-2">
          <Link
            href="/executive/approval-review"
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-3 font-medium hover:bg-indigo-700"
          >
            <FileText className="w-4 h-4" />
            {t.goNow}
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/executive/approval-review-login"
            className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-gray-200 text-gray-700 px-4 py-3 font-medium hover:bg-gray-50"
          >
            {t.loginAgain}
          </Link>
        </div>
      </div>
    </div>
  );
}
