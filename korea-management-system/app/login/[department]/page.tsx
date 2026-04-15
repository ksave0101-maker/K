'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowLeft, Briefcase, Users, FileText, BarChart3, Package, MapPin, Bell, Headphones, Wrench, FlaskConical } from 'lucide-react';
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
  }
};

export default function DepartmentLoginPage({ params }: { params: { department: string } }) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const config = departmentConfigs[params.department] || departmentConfigs.executive;
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      if (username && password) {
        // Redirect to department-specific dashboard
        if (params.department === 'executive') {
          router.push('/executive');
        } else {
          router.push(`/${params.department}/dashboard`);
        }
      } else {
        setError(t.loginError);
      }
      setIsLoading(false);
    }, 1000);
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
                <CompanyLogo size="md" />
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
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t.passwordPlaceholder}
                    required
                  />
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

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t.noAccount}{' '}
                <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  {t.contactAdmin}
                </button>
              </p>
            </div>
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
