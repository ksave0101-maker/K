'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CompanyLogo from '@/components/CompanyLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';

const departments = [
  { slug: 'executive',            label: 'Executive',              icon: '🏢', color: '#475569' },
  { slug: 'admin',                label: 'Admin',                  icon: '🛡️', color: '#475569' },
  { slug: 'hr',                   label: 'HR & Accounting',        icon: '👥', color: '#3b82f6' },
  { slug: 'production',           label: 'Production & Logistics', icon: '🏭', color: '#f97316' },
  { slug: 'international-market', label: 'International Market',   icon: '🌍', color: '#8b5cf6' },
  { slug: 'domestic-market',      label: 'Domestic Market',        icon: '🏪', color: '#ef4444' },
  { slug: 'quality-control',      label: 'Quality Control',        icon: '✅', color: '#eab308' },
  { slug: 'after-sales',          label: 'After-Sales Service',    icon: '🎧', color: '#14b8a6' },
  { slug: 'maintenance',          label: 'Maintenance',            icon: '🔧', color: '#6366f1' },
  { slug: 'research-development', label: 'Research & Development', icon: '🔬', color: '#06b6d4' },
  { slug: 'customers',            label: 'Customer Management',    icon: '🤝', color: '#0ea5e9' },
  { slug: 'branch-manager',       label: 'Branch Manager',         icon: '🏬', color: '#64748b' },
];

const deptIDtoSlug: Record<string, string> = {
  'Executive':           'executive',
  'Admin':               'admin',
  'CRM':                 'admin',
  'Branch Manager':      'branch-manager',
  'HR':                  'hr',
  'Production':          'production',
  'InternationalMarket': 'international-market',
  'DomesticMarket':      'domestic-market',
  'QualityControl':      'quality-control',
  'AfterSales':          'after-sales',
  'Maintenance':         'maintenance',
  'RnD':                 'research-development',
  'Logistics':           'production',
  'CustomerMgmt':        'customers',
};

export default function AdminSupportPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [userName, setUserName] = useState('');
  const [deptSlug, setDeptSlug] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('k_system_admin_user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setUserName(user.name || user.username || '');
        const slug = deptIDtoSlug[user.departmentID] || '';
        setDeptSlug(slug);
      } catch {}
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', padding: 24 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CompanyLogo size="md" />
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18 }}>K Energy Save</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Admin Support Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {userName && (
            <div style={{ color: '#cbd5e1', fontSize: 14 }}>
              👤 {userName}
            </div>
          )}
          <LanguageSwitcher />
        </div>
      </div>

      {/* My Department shortcut */}
      {deptSlug && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>
            {locale === 'ko' ? '내 부서' : 'My Department'}
          </div>
          <Link href={`/admin-support/${deptSlug}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#fff', padding: '12px 24px', borderRadius: 12,
              fontWeight: 600, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(37,99,235,0.4)'
            }}>
            ⚡ {locale === 'ko' ? '내 부서 채팅방 열기' : 'Open My Department Chat'}
          </Link>
        </div>
      )}

      {/* Department grid */}
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
        {locale === 'ko' ? '모든 부서' : 'All Departments'}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16
      }}>
        {departments.map(dept => (
          <Link key={dept.slug} href={`/admin-support/${dept.slug}`}
            style={{
              background: '#1e293b',
              border: `1px solid ${dept.color}44`,
              borderRadius: 14,
              padding: '20px 16px',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `${dept.color}22`,
              border: `1.5px solid ${dept.color}66`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26
            }}>
              {dept.icon}
            </div>
            <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13, textAlign: 'center', lineHeight: 1.4 }}>
              {dept.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Back */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <button onClick={() => router.push('/Korea/Admin-Login')}
          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
          ← {t.backToLogin}
        </button>
      </div>
    </div>
  );
}
