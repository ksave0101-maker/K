'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Building2, Shield, User, Camera, Edit, Save, X, Calendar, Globe, Zap, Leaf, Server, Award, Users, TrendingUp, ExternalLink, Cpu, BarChart3, ShieldCheck, Wrench } from 'lucide-react';
import { useLocale } from '@/lib/LocaleContext';
import CountryFlag from '@/components/CountryFlag';

const companyStats = [
  { icon: Server,  value: '500+', label: 'Devices Deployed',  color: 'from-blue-500 to-blue-600' },
  { icon: Zap,     value: '1.2M', label: 'kWh Saved',         color: 'from-amber-400 to-orange-500' },
  { icon: Leaf,    value: '600+', label: 'Tons CO₂ Reduced',  color: 'from-emerald-500 to-teal-500' },
  { icon: Users,   value: '200+', label: 'Clients Worldwide', color: 'from-purple-500 to-violet-600' },
];

const services = [
  { icon: Cpu,        title: 'K-Save Energy Controller', desc: 'Advanced IoT device that optimizes reactive power and reduces electricity consumption up to 30% with real-time monitoring.', tag: 'Hardware', tagColor: 'bg-blue-50 text-blue-700' },
  { icon: BarChart3,  title: 'Energy Monitoring Platform', desc: 'Cloud dashboard for real-time analytics, historical reporting, and automated alerts across all sites.', tag: 'Software', tagColor: 'bg-emerald-50 text-emerald-700' },
  { icon: ShieldCheck,title: 'Power Quality Management', desc: 'THD reduction, power factor correction, and voltage stability — protecting equipment and reducing utility bills.', tag: 'Solution', tagColor: 'bg-amber-50 text-amber-700' },
  { icon: Wrench,     title: 'After-Sales & Maintenance', desc: 'On-site calibration, remote diagnostics, and 24/7 support for all installed systems.', tag: 'Service', tagColor: 'bg-purple-50 text-purple-700' },
];

const offices = [
  {
    id: 'thailand',
    country: 'Thailand',
    flag: 'TH' as const,
    emoji: '🇹🇭',
    company: 'K Energy Save Co., Ltd.',
    address: ['84 Chaloem Phrakiat Rama 9 Soi 34', 'Nong Bon, Prawet', 'Bangkok 10250, Thailand'],
    phone: '+66 2 080 8916',
    email: 'info@kenergy-save.com',
    mapUrl: 'https://maps.google.com/?q=84+Chaloem+Phrakiat+Rama+9+Soi+34+Bangkok',
    gradient: 'from-orange-500 to-orange-700',
    soft: 'bg-orange-50',
    border: 'border-orange-200',
    textAccent: 'text-orange-600',
    badgeBg: 'bg-orange-100 text-orange-700',
  },
  {
    id: 'korea',
    country: 'Korea',
    flag: 'KR' as const,
    emoji: '🇰🇷',
    company: 'Zera-Energy',
    address: ['2F, 16-10, 166beon-gil', 'Elseso-ro, Gunpo-si', 'Gyeonggi-do, Korea'],
    phone: '+82 31-427-1380',
    email: 'info@zera-energy.com',
    mapUrl: 'https://maps.google.com/?q=16-10+Elseso-ro+Gunpo-si+Gyeonggi-do+Korea',
    gradient: 'from-blue-600 to-blue-800',
    soft: 'bg-blue-50',
    border: 'border-blue-200',
    textAccent: 'text-blue-600',
    badgeBg: 'bg-blue-100 text-blue-700',
  },
];

const adminUser = {
  name: 'System Administrator',
  email: 'admin@kenergysave.com',
  phone: '+82 (0)10-9876-5432',
  since: 'January 2020',
};

export default function ProfilePage() {
  const { t } = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [adminName, setAdminName] = useState(adminUser.name);
  const [adminEmail, setAdminEmail] = useState(adminUser.email);
  const [adminPhone, setAdminPhone] = useState(adminUser.phone);

  return (
    <div className="min-h-full bg-gray-50 p-5 space-y-5">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 shadow-xl">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row items-center gap-8">
          {/* Logo */}
          <div className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-xl">
            <Image
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/AMqDpBqx0RHlW36D/kenergysave-logo-m6L2JxknygHwL0Bj.png"
              alt="K Energy Save Co., Ltd."
              width={160}
              height={56}
              className="h-14 w-auto object-contain"
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
              Group of Zera Co., Ltd.
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">K Energy Save Co., Ltd.</h1>
            <p className="text-emerald-100 text-sm mb-4 max-w-xl leading-relaxed">
              Smart energy management solutions — reducing electricity costs, improving power quality, and cutting CO₂ emissions for businesses across Asia.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <a href="https://www.kenergy-save.com" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-white text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-50 transition-all shadow-md">
                <Globe className="w-3.5 h-3.5" /> www.kenergy-save.com <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <a href="mailto:info@kenergy-save.com"
                className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-white/30 border border-white/20 transition-all">
                <Mail className="w-3.5 h-3.5" /> info@kenergy-save.com
              </a>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-5 border border-white/20 text-center shrink-0">
            <Award className="w-8 h-8 text-yellow-300 mb-2" />
            <p className="text-white text-xs font-semibold">Est.</p>
            <p className="text-white text-3xl font-black">2018</p>
            <p className="text-emerald-200 text-xs">Bangkok, TH</p>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {companyStats.map(s => (
          <div key={s.label} className={`relative overflow-hidden bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all`}>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
            <div className="p-2.5 bg-white/20 rounded-xl w-fit mb-3"><s.icon className="w-5 h-5 text-white" /></div>
            <p className="text-3xl font-black text-white leading-none">{s.value}</p>
            <p className="text-white/80 text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── About + Contact ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-emerald-500" /> About the Company
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            <strong className="text-gray-800">K Energy Save Co., Ltd.</strong> is a leading energy technology company under the <strong className="text-gray-800">Zera Group</strong>, headquartered in Bangkok, Thailand. We specialize in IoT-powered electricity management systems designed to help commercial and industrial facilities dramatically cut energy costs while improving grid stability.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Our flagship product, the <strong className="text-gray-800">K-Save Energy Controller</strong>, uses advanced algorithms to optimize reactive power, correct power factor, and suppress total harmonic distortion (THD) — all in real time. Clients gain full visibility over every kilowatt consumed via our cloud monitoring platform.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            With offices in Thailand and South Korea, and clients across the ASEAN region, we are committed to building a sustainable energy future — one facility at a time.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            {['Energy Management','IoT Devices','Power Quality','CO₂ Reduction','Smart Factory','ASEAN'].map(tag => (
              <span key={tag} className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">{tag}</span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Phone className="w-4 h-4 text-blue-500" /> Contact Info
          </h2>
          <div className="space-y-3">
            {[
              { icon: Phone, text: offices[0].phone, sub: 'Thailand HQ' },
              { icon: Phone, text: offices[1].phone, sub: 'Korea Office' },
              { icon: Mail,  text: offices[0].email, sub: 'Thailand HQ' },
              { icon: Mail,  text: offices[1].email, sub: 'Korea Office' },
              { icon: Globe, text: 'www.kenergy-save.com', sub: 'Official website' },
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg mt-0.5 shrink-0">
                  <c.icon className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{c.text}</p>
                  <p className="text-xs text-gray-400">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Office Locations ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-5">
          <MapPin className="w-4 h-4 text-red-400" /> Office Locations
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {offices.map((office) => (
            <div key={office.id} className={`border-2 ${office.border} rounded-2xl overflow-hidden hover:shadow-md transition-all`}>
              <div className={`bg-gradient-to-r ${office.gradient} px-6 py-5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <CountryFlag country={office.flag} size="md" />
                  <div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{office.country} Office</p>
                    <h3 className="text-white font-bold text-xl leading-tight">{office.company}</h3>
                  </div>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="p-5 space-y-3 bg-white">
                <div className={`flex gap-3 p-3 ${office.soft} rounded-xl`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${office.gradient} flex items-center justify-center shrink-0`}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Address</p>
                    {office.address.map((line, i) => (
                      <p key={i} className="text-sm text-gray-800">{line}</p>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <a href={`tel:${office.phone.replace(/\s|-/g,'')}`}
                    className={`flex items-center gap-2 p-3 ${office.soft} rounded-xl hover:opacity-80 transition-opacity`}>
                    <Phone className={`w-4 h-4 ${office.textAccent} shrink-0`} />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Phone</p>
                      <p className={`text-sm font-semibold ${office.textAccent}`}>{office.phone}</p>
                    </div>
                  </a>
                  <a href={`mailto:${office.email}`}
                    className={`flex items-center gap-2 p-3 ${office.soft} rounded-xl hover:opacity-80 transition-opacity`}>
                    <Mail className={`w-4 h-4 ${office.textAccent} shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Email</p>
                      <p className={`text-sm font-semibold ${office.textAccent} truncate`}>{office.email}</p>
                    </div>
                  </a>
                </div>
                <a href={office.mapUrl} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 ${office.border} ${office.soft} ${office.textAccent} text-sm font-semibold hover:opacity-80 transition-opacity`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  View on Google Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Products & Services ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-emerald-500" /> Products & Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map(s => (
            <div key={s.title} className="group p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all bg-gray-50 hover:bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                  <s.icon className="w-5 h-5 text-gray-600" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.tagColor}`}>{s.tag}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-2 leading-snug">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Administrator Profile ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-gray-500" /> {t('personalInformation') || 'Administrator'}
        </h2>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                <User className="w-8 h-8 text-white" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50">
                <Camera className="w-3 h-3 text-gray-600" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{adminName}</h3>
              <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                <Shield className="w-3 h-3" />{t('superAdmin') || 'Super Admin'}
              </span>
            </div>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
              <Edit className="w-4 h-4" />{t('editProfile') || 'Edit'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors">
                <Save className="w-4 h-4" />{t('saveChanges') || 'Save'}
              </button>
              <button onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors">
                <X className="w-4 h-4" />{t('cancelEdit') || 'Cancel'}
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: t('fullName') || 'Full Name',      value: adminName,  setter: setAdminName,  type: 'text',  icon: <User className="w-4 h-4 text-gray-400" /> },
            { label: t('emailAddress') || 'Email',       value: adminEmail, setter: setAdminEmail, type: 'email', icon: <Mail className="w-4 h-4 text-gray-400" /> },
            { label: t('phoneNumber') || 'Phone',        value: adminPhone, setter: setAdminPhone, type: 'tel',   icon: <Phone className="w-4 h-4 text-gray-400" /> },
          ].map(({ label, value, setter, type, icon }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
              {isEditing ? (
                <input type={type} value={value} onChange={e => setter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-400" />
              ) : (
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">
                  {icon}<span>{value}</span>
                </div>
              )}
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('memberSince') || 'Member Since'}</label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">
              <Calendar className="w-4 h-4 text-gray-400" /><span>{adminUser.since}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-gray-400">© 2026 K Energy Save Co., Ltd. · Group of Zera · All rights reserved.</p>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
          <Leaf className="w-3.5 h-3.5" /> Committed to a greener future
        </div>
      </div>

    </div>
  );
}
