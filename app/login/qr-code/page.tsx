'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowLeft, QrCode, Eye, EyeOff, Scan, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import CompanyLogo from '@/components/CompanyLogo';
import CountryFlag from '@/components/CountryFlag';

export default function QRCodeLoginPage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const t = translations[locale] || translations['en'];

  // Translation helper with fallbacks for all 6 languages
  const L = (key: string, fallbacks: Record<string, string>) => {
    return fallbacks[locale] || fallbacks['en'] || key;
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'qr' | 'password'>('qr');
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showLangMenu && !target.closest('.language-selector')) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLangMenu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, pageName: '/login/qr-code' })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || L('loginError', {
          cn: '登录失败',
          th: 'การเข้าสู่ระบบล้มเหลว',
          ko: '로그인 실패',
          en: 'Login failed',
          vn: 'Đăng nhập thất bại',
          ms: 'Log masuk gagal'
        }));
        return;
      }

      const userTypeID = parseInt(data.typeID);
      const deptID = data.departmentID || '';
      const userId = data.userId;
      const siteValue = (data.site || '').toString().toLowerCase();

      console.log('👤 QR Code Login:', { userId, username: data.username, typeID: userTypeID, departmentID: deptID });

      // Super Users or QRCode department can access
      const isSuperUser = userTypeID === 4 || userTypeID === 7 || userTypeID === 18 || userId === 1 || userId === 7
        || deptID === 'Executive' || deptID === 'Admin' || deptID === 'CRM' || deptID === 'Branch Manager'
        || siteValue.includes('admin');

      const isQRCodeUser = deptID === 'QRCode';

      if (!isSuperUser && !isQRCodeUser) {
        setError(
          locale === 'ko'
            ? 'QR 코드 시스템에 접근 권한이 없습니다.'
            : locale === 'th'
            ? 'คุณไม่มีสิทธิ์เข้าถึงระบบ QR Code'
            : 'You do not have access to the QR Code system.'
        );
        return;
      }

      const redirectPath = '/qr-code/dashboard';

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

      console.log('✅ QR Code Login successful! Redirecting to:', redirectPath);

      setTimeout(() => {
        router.push(redirectPath);
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Connection error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = () => {
    // TODO: Implement QR code scanning functionality
    alert(locale === 'ko' ? 'QR 코드 스캔 기능은 곧 제공됩니다.' : locale === 'th' ? 'ฟังก์ชันสแกน QR Code จะพร้อมใช้งานเร็วๆ นี้' : 'QR code scanning feature coming soon.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language & Back */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">
              {locale === 'cn' ? '返回首页' : locale === 'th' ? 'กลับหน้าหลัก' : locale === 'ko' ? '홈으로' : locale === 'vn' ? 'Về trang chủ' : locale === 'ms' ? 'Kembali ke Laman Utama' : 'Back to Home'}
            </span>
          </Link>

          {/* Custom Language Selector */}
          <div className="relative language-selector">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {locale === 'cn' ? '中文' : locale === 'th' ? 'ไทย' : locale === 'ko' ? '한국어' : locale === 'vn' ? 'Tiếng Việt' : locale === 'ms' ? 'Melayu' : 'English'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {[
                  { code: 'cn' as const, name: '中文', flag: 'CN' as const },
                  { code: 'th' as const, name: 'ไทย', flag: 'TH' as const },
                  { code: 'ko' as const, name: '한국어', flag: 'KR' as const },
                  { code: 'en' as const, name: 'English', flag: 'GB' as const },
                  { code: 'vn' as const, name: 'Tiếng Việt', flag: 'VN' as const },
                  { code: 'ms' as const, name: 'Melayu', flag: 'MY' as const },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLocale(lang.code);
                      setShowLangMenu(false);
                      localStorage.setItem('locale', lang.code);
                      localStorage.setItem('k_system_lang', lang.code);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      locale === lang.code ? 'bg-rose-50 text-rose-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <CountryFlag country={lang.flag} size="sm" />
                    <span>{lang.name}</span>
                    {locale === lang.code && (
                      <span className="ml-auto text-rose-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* QR Code Header */}
          <div className="bg-gradient-to-r from-rose-500 to-rose-700 px-8 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {L('qrCodeSystem', {
                    cn: 'QR码系统',
                    th: 'ระบบ QR Code',
                    ko: 'QR 코드 시스템',
                    en: 'QR Code System',
                    vn: 'Hệ thống mã QR',
                    ms: 'Sistem Kod QR'
                  })}
                </h2>
                <p className="text-sm text-white/90 mt-1">
                  {L('qrLogin', {
                    cn: 'QR码系统登录',
                    th: 'ล็อกอินระบบ QR Code',
                    ko: 'QR 코드 시스템 로그인',
                    en: 'QR Code System Login',
                    vn: 'Đăng nhập hệ thống mã QR',
                    ms: 'Log masuk Sistem Kod QR'
                  })}
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
                <h1 className="text-lg font-bold text-gray-900">Zera co.,ltd</h1>
                <CountryFlag country="KR" size="sm" />
              </div>
              <p className="text-xs text-gray-500">K Energy Save Co., Ltd.</p>
            </div>

            {/* Login Mode Toggle */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMode('qr')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMode === 'qr'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <QrCode className="w-4 h-4" />
                  <span>{locale === 'ko' ? 'QR 코드' : locale === 'th' ? 'QR Code' : 'QR Code'}</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('password')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMode === 'password'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>{locale === 'ko' ? '비밀번호' : locale === 'th' ? 'รหัสผ่าน' : 'Password'}</span>
                </div>
              </button>
            </div>

            {loginMode === 'qr' ? (
              /* QR Code Scanner Mode */
              <div className="space-y-5">
                <div className="border-4 border-dashed border-rose-200 rounded-xl p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-rose-100 p-6 rounded-2xl">
                      <Scan className="w-16 h-16 text-rose-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {locale === 'ko' ? 'QR 코드 스캔' : locale === 'th' ? 'สแกน QR Code' : 'Scan QR Code'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {locale === 'ko'
                      ? 'QR 코드를 스캔하여 제품 문서를 확인하세요'
                      : locale === 'th'
                      ? 'สแกน QR Code เพื่อตรวจสอบเอกสารผลิตภัณฑ์'
                      : 'Scan your QR code for check product document'}
                  </p>
                  <button
                    type="button"
                    onClick={handleQRScan}
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-700 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
                  >
                    {locale === 'ko' ? 'QR 코드 스캔 시작' : locale === 'th' ? 'เริ่มสแกน QR Code' : 'Start QR Scan'}
                  </button>
                </div>
              </div>
            ) : (
              /* Password Login Mode */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    {L('username', {
                      cn: '用户名',
                      th: 'ชื่อผู้ใช้',
                      ko: '사용자 이름',
                      en: 'Username',
                      vn: 'Tên người dùng',
                      ms: 'Nama Pengguna'
                    })}
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
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder={L('usernamePlaceholder', {
                        cn: '输入您的用户名',
                        th: 'กรอกชื่อผู้ใช้',
                        ko: '사용자 이름을 입력하세요',
                        en: 'Enter your username',
                        vn: 'Nhập tên người dùng',
                        ms: 'Masukkan nama pengguna'
                      })}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    {L('password', {
                      cn: '密码',
                      th: 'รหัสผ่าน',
                      ko: '비밀번호',
                      en: 'Password',
                      vn: 'Mật khẩu',
                      ms: 'Kata Laluan'
                    })}
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
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder={L('passwordPlaceholder', {
                        cn: '输入您的密码',
                        th: 'กรอกรหัสผ่าน',
                        ko: '비밀번호를 입력하세요',
                        en: 'Enter your password',
                        vn: 'Nhập mật khẩu',
                        ms: 'Masukkan kata laluan'
                      })}
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                      {t.rememberMe}
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-rose-600 hover:text-rose-800 font-medium transition-colors"
                  >
                    {t.forgotPassword}
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-700 text-white py-3 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t.loggingIn : t.loginButton}
                </button>
              </form>
            )}
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
