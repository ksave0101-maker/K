'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function ProductionLoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple authentication (in production, use proper auth)
    if (credentials.username && credentials.password) {
      // Redirect to production dashboard
      router.push('/production/dashboard');
    } else {
      setError('Please enter username and password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      {/* Language Switcher - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 text-orange-600 hover:text-orange-800 flex items-center gap-2"
        >
          ← {t.back}
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏭</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {t.productionDepartment}
            </h1>
            <p className="text-gray-600 text-sm">
              {t.productionDepartmentDesc}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ko' ? '사용자명' : 'Username'}
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder={locale === 'ko' ? '사용자명을 입력하세요' : 'Enter username'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ko' ? '비밀번호' : 'Password'}
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder={locale === 'ko' ? '비밀번호를 입력하세요' : 'Enter password'}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {locale === 'ko' ? '로그인' : 'Login'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">
              {locale === 'ko' ? '🔐 데모 계정:' : '🔐 Demo Account:'}
            </p>
            <p className="text-xs font-mono text-gray-700">
              Username: production / Password: demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
