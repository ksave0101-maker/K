'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowLeft, Briefcase, Users, FileText, BarChart3, Package, MapPin, Bell, Headphones, Wrench, FlaskConical, Eye, EyeOff, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import CompanyLogo from '@/components/CompanyLogo';
import CountryFlag from '@/components/CountryFlag';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface DepartmentConfig {
  name: string;
  nameKey: keyof typeof translations.ko;
  icon: any;
  color: string;
  bgGradient: string;
}

const departmentConfigs: Record<string, DepartmentConfig> = {
  executive: {
    name: 'Executive Department',
    nameKey: 'executiveDepartment',
    icon: Briefcase,
    color: 'slate-700',
    bgGradient: 'from-slate-600 to-slate-800'
  },
  hr: {
    name: 'HR Department',
    nameKey: 'userManagement',
    icon: Users,
    color: 'blue-500',
    bgGradient: 'from-blue-500 to-blue-700'
  },
  production: {
    name: 'Production Department',
    nameKey: 'documentManagement',
    icon: FileText,
    color: 'green-500',
    bgGradient: 'from-green-500 to-green-700'
  },
  'international-market': {
    name: 'International Market Department',
    nameKey: 'statisticsAnalytics',
    icon: BarChart3,
    color: 'purple-500',
    bgGradient: 'from-purple-500 to-purple-700'
  },
  'domestic-market': {
    name: 'Domestic Market Department',
    nameKey: 'inventoryManagement',
    icon: Package,
    color: 'orange-500',
    bgGradient: 'from-orange-500 to-orange-700'
  },
  logistics: {
    name: 'Logistics Department',
    nameKey: 'locationManagement',
    icon: MapPin,
    color: 'red-500',
    bgGradient: 'from-red-500 to-red-700'
  },
  'quality-control': {
    name: 'Quality Control Department',
    nameKey: 'notificationCenter',
    icon: Bell,
    color: 'yellow-500',
    bgGradient: 'from-yellow-500 to-yellow-700'
  },
  'after-sales': {
    name: 'After-Sales Service',
    nameKey: 'afterSalesServiceDepartment',
    icon: Headphones,
    color: 'teal-500',
    bgGradient: 'from-teal-500 to-teal-700'
  },
  maintenance: {
    name: 'Maintenance Department',
    nameKey: 'maintenanceDepartment',
    icon: Wrench,
    color: 'indigo-500',
    bgGradient: 'from-indigo-500 to-indigo-700'
  },
  'research-development': {
    name: 'Research & Development',
    nameKey: 'researchDevelopmentDepartment',
    icon: FlaskConical,
    color: 'cyan-500',
    bgGradient: 'from-cyan-500 to-cyan-700'
  },
  'qr-code': {
    name: 'QR Code System',
    nameKey: 'qrCodeSystem',
    icon: QrCode,
    color: 'rose-500',
    bgGradient: 'from-rose-500 to-rose-700'
  }
};

export default function DepartmentLoginPage({ params }: { params: { department: string } }) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const config = departmentConfigs[params.department] || departmentConfigs.executive;
  const Icon = config.icon;

  // Maps departmentID → default redirect (used for normal users)
  const deptMap: Record<string, string> = {
    'Executive':           '/executive',
    'Admin':               '/executive',
    'HR':                  '/hr/dashboard',
    'Production':          '/production/dashboard',
    'InternationalMarket': '/international-market/dashboard',
    'DomesticMarket':      '/domestic-market/dashboard',
    'QualityControl':      '/quality-control/dashboard',
    'AfterSales':          '/after-sales/dashboard',
    'Maintenance':         '/maintenance/dashboard',
    'RnD':                 '/research-development/dashboard',
    'Logistics':           '/logistics/dashboard',
    'Branch Manager':      '/executive',
    'CustomerMgmt':        '/customers',
    'Translator':          '/translator',
    'AIAssistant':         '/ai-assistant',
    'BruneiChat':          '/chat/brunei',
    'VietnamChat':         '/chat/vietnam',
  };

  // Maps URL slug → redirect path
  const slugMap: Record<string, string> = {
    'executive':             '/executive',
    'hr':                    '/hr/dashboard',
    'production':            '/production/dashboard',
    'international-market':  '/international-market/dashboard',
    'domestic-market':       '/domestic-market/dashboard',
    'quality-control':       '/quality-control/dashboard',
    'after-sales':           '/after-sales/dashboard',
    'maintenance':           '/maintenance/dashboard',
    'research-development':  '/research-development/dashboard',
    'logistics':             '/logistics/dashboard',
    'customers':             '/customers',
    'translator':            '/translator',
    'ai-assistant':          '/ai-assistant',
    'chat-brunei':           '/chat/brunei',
    'chat-vietnam':          '/chat/vietnam',
    'qr-code':               '/qr-code/dashboard',
  };

  // Maps departmentID from DB → allowed URL slug(s)
  const deptIDtoSlug: Record<string, string[]> = {
    'Executive':           ['executive'],
    'Admin':               ['executive'],
    'CRM':                 ['executive', 'hr', 'production', 'international-market', 'domestic-market', 'quality-control', 'after-sales', 'maintenance', 'research-development', 'logistics', 'customers', 'translator', 'ai-assistant', 'chat-brunei', 'chat-vietnam', 'qr-code'],
    'Branch Manager':      ['executive'],
    'HR':                  ['hr'],
    'Production':          ['production'],
    'InternationalMarket': ['international-market'],
    'DomesticMarket':      ['domestic-market'],
    'QualityControl':      ['quality-control'],
    'AfterSales':          ['after-sales'],
    'Maintenance':         ['maintenance'],
    'RnD':                 ['research-development'],
    'Logistics':           ['logistics'],
    'CustomerMgmt':        ['customers'],
    'Translator':          ['translator'],
    'AIAssistant':         ['ai-assistant'],
    'BruneiChat':          ['chat-brunei'],
    'VietnamChat':         ['chat-vietnam'],
    'QRCode':              ['qr-code'],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, pageName: `/login/${params.department}` })
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

      console.log('👤 User login data:', { userId, username: data.username, typeID: userTypeID, departmentID: deptID });

      // Super Users can access any department/branch:
      // - Executive, Admin, CRM, Branch Manager departments
      // - typeID 4 (Admin) or 7 (Branch Manager)
      // - userId 1 or 7 (special admin users)
      const isSuperUser = userTypeID === 4 || userTypeID === 7 || userTypeID === 18 || userId === 1 || userId === 7
        || deptID === 'Executive' || deptID === 'Admin' || deptID === 'CRM' || deptID === 'Branch Manager'
        || siteValue.includes('admin');

      // Check if this user belongs to the department they are trying to log into
      if (!isSuperUser) {
        const allowedInternationalUserIds = new Set([19, 20, 21]);
        const allowedInternationalEmails = new Set([
          'sinad270@gmail.com',
          'thissana.nhoowhong@gmail.com',
          'yodin.thanida@gmail.com'
        ]);
        const userEmail = (data.email || '').toString().trim().toLowerCase();
        const isAllowedInternationalUser =
          params.department === 'international-market' &&
          (allowedInternationalUserIds.has(Number(userId)) || allowedInternationalEmails.has(userEmail));

        if (isAllowedInternationalUser) {
          console.log('✅ Allowlisted user granted access to international-market login:', {
            userId,
            username: data.username,
            email: userEmail
          });
        } else {
        const allowedSlugs = deptIDtoSlug[deptID] || [];
        if (!allowedSlugs.includes(params.department)) {
          setError(
            locale === 'ko'
              ? '이 부서에 접근 권한이 없습니다.'
              : 'You do not have access to this department.'
          );
          return;
        }
        }
      }

      const redirectPath = params.department in slugMap ? slugMap[params.department] : deptMap[deptID] || '/korea-main';

      console.log('🔄 Login redirect info:', {
        department: params.department,
        departmentID: deptID,
        typeID: userTypeID,
        isSuperUser,
        redirectPath
      });

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

      console.log('✅ Login successful! Redirecting to:', redirectPath);
      console.log('💾 Stored in localStorage:', { user: data.username, token: data.token ? 'YES' : 'NO' });

      // Small delay to ensure localStorage is saved
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language & Back */}
        <div className="flex items-center justify-between mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t.backToHome}</span>
        </Link>
          <LanguageSwitcher />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Department Header with Color */}
          <div className={`bg-gradient-to-r ${config.bgGradient} px-8 py-6 text-white`}>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t[config.nameKey]}</h2>
                <p className="text-sm text-white/90 mt-1">{t.departmentLogin}</p>
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    {t.rememberMe}
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {t.forgotPassword}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r ${config.bgGradient} text-white py-3 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
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
