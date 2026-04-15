'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowLeft, Leaf, Eye, EyeOff, Sprout } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import CompanyLogo from '@/components/CompanyLogo';
import CountryFlag from '@/components/CountryFlag';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function SmartFarmLoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, pageName: '/admin/main/smart-farm-login' })
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

      console.log('🌱 Smart Farm Login:', { userId, username: data.username, typeID: userTypeID, departmentID: deptID });

      // Super Users or SmartFarm department can access
      const isSuperUser = userTypeID === 4 || userTypeID === 7 || userTypeID === 18 || userId === 1 || userId === 7
        || deptID === 'Executive' || deptID === 'Admin' || deptID === 'CRM' || deptID === 'Branch Manager'
        || siteValue.includes('admin');

      const isSmartFarmUser = deptID === 'SmartFarm' || deptID === 'RnD';

      if (!isSuperUser && !isSmartFarmUser) {
        setError(
          locale === 'ko'
            ? '스마트 팜 시스템에 접근 권한이 없습니다.'
            : locale === 'th'
            ? 'คุณไม่มีสิทธิ์เข้าถึงระบบสมาร์ทฟาร์ม'
            : 'You do not have access to the Smart Farm system.'
        );
        return;
      }

      const redirectPath = '/smart-farm/dashboard';

      // Store user data and token
      localStorage.setItem('k_system_admin_user', JSON.stringify({
        userId: data.userId,
        username: data.username,
        name: data.name,
        email: data.email,
        site: data.site,
        typeID: userTypeID,
        departmentID: deptID
      }));
      localStorage.setItem('k_system_admin_token', data.token || '');

      console.log('✅ Smart Farm Login successful! Redirecting to:', redirectPath);

      setTimeout(() => {
        router.push(redirectPath);
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Connection error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language & Back */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/admin/main"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{locale === 'ko' ? '관리자 메인으로' : locale === 'th' ? 'กลับไปหน้าแอดมิน' : 'Back to Admin'}</span>
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
          {/* Smart Farm Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            <div className="relative flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Leaf className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {locale === 'ko' ? '스마트 팜 시스템' : locale === 'th' ? 'ระบบสมาร์ทฟาร์ม' : 'Smart Farm System'}
                </h2>
                <p className="text-sm text-white/90 mt-1 flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  {locale === 'ko' ? '농업 기술 관리 시스템' : locale === 'th' ? 'ระบบจัดการเทคโนโลยีการเกษตร' : 'Agricultural Technology Management'}
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-8">
            {/* Company Info */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <CompanyLogo size="2xl" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-gray-900">{t.companyName}</h1>
                <CountryFlag country="KR" size="sm" />
              </div>
              <p className="text-xs text-gray-500">{t.companySlogan}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder={t.usernamePlaceholder}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder={t.passwordPlaceholder}
                    required
                  />
                  {mounted && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Info Box */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">
                      {locale === 'ko' ? '스마트 팜 시스템' : locale === 'th' ? 'ระบบสมาร์ทฟาร์ม' : 'Smart Farm System'}
                    </p>
                    <p className="text-green-700">
                      {locale === 'ko'
                        ? '농업 생산, IoT 센서, 환경 제어 및 작물 관리 시스템'
                        : locale === 'th'
                        ? 'ระบบจัดการการผลิตทางการเกษตร เซ็นเซอร์ IoT ควบคุมสภาพแวดล้อม และจัดการพืชผล'
                        : 'Agricultural production, IoT sensors, environmental control, and crop management system'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    {t.rememberMe}
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  {t.forgotPassword}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
              >
                {isLoading ? t.loggingIn : t.loginButton}
              </button>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {t.loginFooter}
          </p>
        </div>
      </div>
    </div>
  );
}
