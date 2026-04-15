"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowLeft, FlaskConical, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { translations } from "@/lib/translations";
import CompanyLogo from "@/components/CompanyLogo";
import CountryFlag from "@/components/CountryFlag";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function KoreaRnDLoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const departmentSlug = "research-development";
  const Icon = FlaskConical;
  const configBg = "from-cyan-500 to-cyan-700";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, pageName: `/login/${departmentSlug}` })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || t.loginError);
        return;
      }

      const userTypeID = parseInt(data.typeID);
      const deptID = data.departmentID || "";
      const userId = data.userId;

      const siteValue = (data.site || '').toString().toLowerCase();

      const isSuperUser = userTypeID === 4 || userTypeID === 7 || userTypeID === 18 || userId === 1 || userId === 7
        || deptID === 'Executive' || deptID === 'Admin' || deptID === 'CRM' || deptID === 'Branch Manager'
        || siteValue.includes('admin');

      // Basic access check: allow if super user or if department is RnD
      if (!isSuperUser && deptID !== 'RnD') {
        setError(locale === 'ko' ? '이 부서에 접근 권한이 없습니다.' : 'You do not have access to this department.');
        return;
      }

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

      setTimeout(() => {
        router.push('/research-development/dashboard');
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
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t.backToHome}</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className={`bg-gradient-to-r ${configBg} px-8 py-6 text-white`}>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t.researchDevelopmentDepartment}</h2>
                <p className="text-sm text-white/90 mt-1">{t.departmentLogin}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
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
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">{t.username}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder={t.usernamePlaceholder} required />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder={t.passwordPlaceholder} required />
                  {mounted && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="text-gray-500 hover:text-gray-700">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">{t.rememberMe}</label>
                </div>
                <button type="button" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">{t.forgotPassword}</button>
              </div>

              <button type="submit" disabled={isLoading} className={`w-full bg-gradient-to-r ${configBg} text-white py-3 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}>
                {isLoading ? t.loggingIn : t.loginButton}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">{t.loginFooter}</p>
        </div>
      </div>
    </div>
  );
}
