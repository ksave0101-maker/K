'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, User, Eye, EyeOff, FileText, Globe } from 'lucide-react';
import { getT } from '@/lib/translations';
import CompanyLogo from '@/components/CompanyLogo';
import CountryFlag from '@/components/CountryFlag';

type ApprovalLocale = 'ko' | 'en';

export default function ApprovalReviewLoginPage() {
  const router = useRouter();
  const [pageLocale, setPageLocale] = useState<ApprovalLocale>('ko');
  const t = getT(pageLocale);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const savedLocale = localStorage.getItem('executive-approval-locale') || localStorage.getItem('locale');
      if (savedLocale === 'ko' || savedLocale === 'en') {
        setPageLocale(savedLocale);
      }
    } catch {}
  }, []);

  const toggleLanguage = () => {
    const nextLocale: ApprovalLocale = pageLocale === 'ko' ? 'en' : 'ko';
    setPageLocale(nextLocale);
    localStorage.setItem('executive-approval-locale', nextLocale);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          pageName: '/executive/approval-review-login'
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || t.loginError);
        return;
      }

      const userTypeID = parseInt(data.typeID);
      const deptID = data.departmentID || '';
      const userId = data.userId;
      const siteValue = (data.site || '').toString().toLowerCase();

      const isSuperUser =
        userTypeID === 4 ||
        userTypeID === 7 ||
        userTypeID === 18 ||
        userId === 1 ||
        userId === 7 ||
        deptID === 'Executive' ||
        deptID === 'Admin' ||
        deptID === 'CRM' ||
        deptID === 'Branch Manager' ||
        siteValue.includes('admin');

      const isAllowedApprover = isSuperUser || deptID === 'Executive' || deptID === 'Branch Manager';

      if (!isAllowedApprover) {
        setError(pageLocale === 'ko' ? '승인 검토 페이지에 접근 권한이 없습니다.' : 'You do not have permission to access approval review.');
        return;
      }

      localStorage.setItem(
        'k_system_admin_user',
        JSON.stringify({
          userId: data.userId,
          username: data.username,
          name: data.name,
          email: data.email,
          site: data.site,
          typeID: userTypeID,
          departmentID: deptID
        })
      );
      localStorage.setItem('k_system_admin_token', data.token || '');

      setTimeout(() => {
        router.push('/executive/approval-review-login/success');
      }, 100);
    } catch (err: any) {
      setError(err.message || (pageLocale === 'ko' ? '연결 중 오류가 발생했습니다.' : 'Connection error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-6 sm:pt-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Link href="/executive" className="inline-flex items-center gap-2 min-h-[44px] px-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{pageLocale === 'ko' ? 'Executive로 돌아가기' : 'Back to Executive'}</span>
          </Link>
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            type="button"
            aria-label={pageLocale === 'ko' ? '언어 변경' : 'Change language'}
          >
            <Globe className="w-4 h-4" />
            <span>{pageLocale === 'ko' ? '한국어' : 'English'}</span>
          </button>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-5 sm:px-8 py-5 sm:py-6 text-white">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold leading-snug">
                  {pageLocale === 'ko' ? '모바일 승인 검토 로그인' : 'Approval Review Login by Phone'}
                </h2>
                <p className="text-xs sm:text-sm text-white/90 mt-1">
                  {pageLocale === 'ko' ? '승인 권한 보유자 전용 보안 접속' : 'Secure approver-only access'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="text-center mb-5 sm:mb-6">
              <div className="flex justify-center mb-3">
                <CompanyLogo size="2xl" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-gray-900">{t.companyName}</h1>
                <CountryFlag country="KR" size="sm" />
              </div>
              <p className="text-xs text-gray-500">{t.executiveDepartment}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.username}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 sm:py-2.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={t.usernamePlaceholder}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.password}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 sm:py-2.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder={t.passwordPlaceholder}
                    required
                  />
                  {mounted && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[48px] bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-3 rounded-xl text-base font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t.loggingIn : (pageLocale === 'ko' ? '승인 검토 로그인' : 'Login for Approval Review')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
