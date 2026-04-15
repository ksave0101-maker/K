"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Briefcase, Factory, FileText, GraduationCap, LogOut, Package, Settings, User } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import CountryFlag from '@/components/CountryFlag'
import { useLocale } from '@/lib/LocaleContext'

export default function LearningMainPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name?: string; username?: string } | null>(null)
  const [branchFilter, setBranchFilter] = useState<'all' | 'korea' | 'thailand' | 'vietnam' | 'malaysia' | 'brunei'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'work' | 'system'>('all')

  const L = (texts: { en: string; ko: string; th: string; vn: string; ms: string; cn: string }) => {
    return texts[locale] || texts.en
  }

  useEffect(() => {
    setMounted(true)
    try {
      const token = localStorage.getItem('k_system_admin_token')
      const userData = localStorage.getItem('k_system_admin_user')

      if (!token || !userData) {
        router.replace('/admin/main/learning-login')
        return
      }

      setCurrentUser(JSON.parse(userData))
    } catch {
      router.replace('/admin/main/learning-login')
    }
  }, [router])

  const handleLogout = () => {
    try {
      localStorage.removeItem('k_system_admin_token')
      localStorage.removeItem('k_system_admin_user')
    } catch {}
    router.push('/admin/main/learning-login')
  }

  const getCardFlag = (href: string): 'KR' | 'TH' | 'VN' | 'MY' | 'BN' => {
    const lower = href.toLowerCase()
    if (lower.includes('thailand')) return 'TH'
    if (lower.includes('vietnam')) return 'VN'
    if (lower.includes('malaysia')) return 'MY'
    if (lower.includes('brunei')) return 'BN'
    return 'KR'
  }

  const getBranchKey = (href: string): 'korea' | 'thailand' | 'vietnam' | 'malaysia' | 'brunei' => {
    const lower = href.toLowerCase()
    if (lower.includes('thailand')) return 'thailand'
    if (lower.includes('vietnam')) return 'vietnam'
    if (lower.includes('malaysia')) return 'malaysia'
    if (lower.includes('brunei')) return 'brunei'
    return 'korea'
  }

  const getTypeKey = (href: string): 'work' | 'system' => {
    return href.toLowerCase().includes('system-usage') ? 'system' : 'work'
  }

  const menuCards = [
    {
      title: L({ en: 'Work Manuals - Korea Branch', ko: '업무 매뉴얼 - 한국 지사', th: 'คู่มือการทำงาน - สาขาเกาหลี', vn: 'Hướng dẫn công việc - Chi nhánh Hàn Quốc', ms: 'Manual kerja - Cawangan Korea', cn: '工作手册 - 韩国分支' }),
      description: L({ en: 'Department manuals and login buttons for Korea branch', ko: '한국 지사 부서 매뉴얼 및 로그인 버튼', th: 'คู่มือแผนกและปุ่มล็อกอินของสาขาเกาหลี', vn: 'Hướng dẫn phòng ban và nút đăng nhập cho chi nhánh Hàn Quốc', ms: 'Manual jabatan dan butang log masuk untuk cawangan Korea', cn: '韩国分支部门手册与登录按钮' }),
      href: '/admin/main/learning-main/department-work-guides#korea-hq',
      icon: Briefcase,
      color: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
    },
    {
      title: L({ en: 'Work Manuals - Thailand Branch', ko: '업무 매뉴얼 - 태국 지사', th: 'คู่มือการทำงาน - สาขาไทย', vn: 'Hướng dẫn công việc - Chi nhánh Thái Lan', ms: 'Manual kerja - Cawangan Thailand', cn: '工作手册 - 泰国分支' }),
      description: L({ en: 'Department manuals and login buttons for Thailand branch', ko: '태국 지사 부서 매뉴얼 및 로그인 버튼', th: 'คู่มือแผนกและปุ่มล็อกอินของสาขาไทย', vn: 'Hướng dẫn phòng ban và nút đăng nhập cho chi nhánh Thái Lan', ms: 'Manual jabatan dan butang log masuk untuk cawangan Thailand', cn: '泰国分支部门手册与登录按钮' }),
      href: '/admin/main/learning-main/department-work-guides#thailand-branch',
      icon: Briefcase,
      color: 'linear-gradient(135deg, #475569 0%, #1f2937 100%)'
    },
    {
      title: L({ en: 'Work Manuals - Vietnam Branch', ko: '업무 매뉴얼 - 베트남 지사', th: 'คู่มือการทำงาน - สาขาเวียดนาม', vn: 'Hướng dẫn công việc - Chi nhánh Việt Nam', ms: 'Manual kerja - Cawangan Vietnam', cn: '工作手册 - 越南分支' }),
      description: L({ en: 'Department manuals and login buttons for Vietnam branch', ko: '베트남 지사 부서 매뉴얼 및 로그인 버튼', th: 'คู่มือแผนกและปุ่มล็อกอินของสาขาเวียดนาม', vn: 'Hướng dẫn phòng ban và nút đăng nhập cho chi nhánh Việt Nam', ms: 'Manual jabatan dan butang log masuk untuk cawangan Vietnam', cn: '越南分支部门手册与登录按钮' }),
      href: '/admin/main/learning-main/department-work-guides#vietnam-branch',
      icon: Briefcase,
      color: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
    },
    {
      title: L({ en: 'Work Manuals - Malaysia Branch', ko: '업무 매뉴얼 - 말레이시아 지사', th: 'คู่มือการทำงาน - สาขามาเลเซีย', vn: 'Hướng dẫn công việc - Chi nhánh Malaysia', ms: 'Manual kerja - Cawangan Malaysia', cn: '工作手册 - 马来西亚分支' }),
      description: L({ en: 'Department manuals and login buttons for Malaysia branch', ko: '말레이시아 지사 부서 매뉴얼 및 로그인 버튼', th: 'คู่มือแผนกและปุ่มล็อกอินของสาขามาเลเซีย', vn: 'Hướng dẫn phòng ban và nút đăng nhập cho chi nhánh Malaysia', ms: 'Manual jabatan dan butang log masuk untuk cawangan Malaysia', cn: '马来西亚分支部门手册与登录按钮' }),
      href: '/admin/main/learning-main/department-work-guides#malaysia-branch',
      icon: Briefcase,
      color: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)'
    },
    {
      title: L({ en: 'Work Manuals - Brunei Branch', ko: '업무 매뉴얼 - 브루나이 지사', th: 'คู่มือการทำงาน - สาขาบรูไน', vn: 'Hướng dẫn công việc - Chi nhánh Brunei', ms: 'Manual kerja - Cawangan Brunei', cn: '工作手册 - 文莱分支' }),
      description: L({ en: 'Department manuals and login buttons for Brunei branch', ko: '브루나이 지사 부서 매뉴얼 및 로그인 버튼', th: 'คู่มือแผนกและปุ่มล็อกอินของสาขาบรูไน', vn: 'Hướng dẫn phòng ban và nút đăng nhập cho chi nhánh Brunei', ms: 'Manual jabatan dan butang log masuk untuk cawangan Brunei', cn: '文莱分支部门手册与登录按钮' }),
      href: '/admin/main/learning-main/department-work-guides#brunei-branch',
      icon: Briefcase,
      color: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)'
    },
    {
      title: L({ en: 'System Manuals - Korea Branch', ko: '시스템 매뉴얼 - 한국 지사', th: 'คู่มือการใช้ระบบ - สาขาเกาหลี', vn: 'Hướng dẫn hệ thống - Chi nhánh Hàn Quốc', ms: 'Manual sistem - Cawangan Korea', cn: '系统手册 - 韩国分支' }),
      description: L({ en: 'Role-based system login menu for Korea branch', ko: '한국 지사 권한별 시스템 로그인 메뉴', th: 'เมนูล็อกอินระบบตามสิทธิ์ของสาขาเกาหลี', vn: 'Menu đăng nhập hệ thống theo quyền cho chi nhánh Hàn Quốc', ms: 'Menu log masuk sistem ikut peranan untuk cawangan Korea', cn: '韩国分支按权限系统登录菜单' }),
      href: '/admin/main/learning-main/system-usage-guides#korea-hq',
      icon: Settings,
      color: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)'
    },
    {
      title: L({ en: 'System Manuals - Thailand Branch', ko: '시스템 매뉴얼 - 태국 지사', th: 'คู่มือการใช้ระบบ - สาขาไทย', vn: 'Hướng dẫn hệ thống - Chi nhánh Thái Lan', ms: 'Manual sistem - Cawangan Thailand', cn: '系统手册 - 泰国分支' }),
      description: L({ en: 'Role-based system login menu for Thailand branch', ko: '태국 지사 권한별 시스템 로그인 메뉴', th: 'เมนูล็อกอินระบบตามสิทธิ์ของสาขาไทย', vn: 'Menu đăng nhập hệ thống theo quyền cho chi nhánh Thái Lan', ms: 'Menu log masuk sistem ikut peranan untuk cawangan Thailand', cn: '泰国分支按权限系统登录菜单' }),
      href: '/admin/main/learning-main/system-usage-guides#thailand-branch',
      icon: Settings,
      color: 'linear-gradient(135deg, #475569 0%, #1f2937 100%)'
    },
    {
      title: L({ en: 'System Manuals - Vietnam Branch', ko: '시스템 매뉴얼 - 베트남 지사', th: 'คู่มือการใช้ระบบ - สาขาเวียดนาม', vn: 'Hướng dẫn hệ thống - Chi nhánh Việt Nam', ms: 'Manual sistem - Cawangan Vietnam', cn: '系统手册 - 越南分支' }),
      description: L({ en: 'Role-based system login menu for Vietnam branch', ko: '베트남 지사 권한별 시스템 로그인 메뉴', th: 'เมนูล็อกอินระบบตามสิทธิ์ของสาขาเวียดนาม', vn: 'Menu đăng nhập hệ thống theo quyền cho chi nhánh Việt Nam', ms: 'Menu log masuk sistem ikut peranan untuk cawangan Vietnam', cn: '越南分支按权限系统登录菜单' }),
      href: '/admin/main/learning-main/system-usage-guides#vietnam-branch',
      icon: Settings,
      color: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)'
    },
    {
      title: L({ en: 'System Manuals - Malaysia Branch', ko: '시스템 매뉴얼 - 말레이시아 지사', th: 'คู่มือการใช้ระบบ - สาขามาเลเซีย', vn: 'Hướng dẫn hệ thống - Chi nhánh Malaysia', ms: 'Manual sistem - Cawangan Malaysia', cn: '系统手册 - 马来西亚分支' }),
      description: L({ en: 'Role-based system login menu for Malaysia branch', ko: '말레이시아 지사 권한별 시스템 로그인 메뉴', th: 'เมนูล็อกอินระบบตามสิทธิ์ของสาขามาเลเซีย', vn: 'Menu đăng nhập hệ thống theo quyền cho chi nhánh Malaysia', ms: 'Menu log masuk sistem ikut peranan untuk cawangan Malaysia', cn: '马来西亚分支按权限系统登录菜单' }),
      href: '/admin/main/learning-main/system-usage-guides#malaysia-branch',
      icon: Settings,
      color: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
    },
    {
      title: L({ en: 'System Manuals - Brunei Branch', ko: '시스템 매뉴얼 - 브루나이 지사', th: 'คู่มือการใช้ระบบ - สาขาบรูไน', vn: 'Hướng dẫn hệ thống - Chi nhánh Brunei', ms: 'Manual sistem - Cawangan Brunei', cn: '系统手册 - 文莱分支' }),
      description: L({ en: 'Role-based system login menu for Brunei branch', ko: '브루나이 지사 권한별 시스템 로그인 메뉴', th: 'เมนูล็อกอินระบบตามสิทธิ์ของสาขาบรูไน', vn: 'Menu đăng nhập hệ thống theo quyền cho chi nhánh Brunei', ms: 'Menu log masuk sistem ikut peranan untuk cawangan Brunei', cn: '文莱分支按权限系统登录菜单' }),
      href: '/admin/main/learning-main/system-usage-guides#brunei-branch',
      icon: Settings,
      color: 'linear-gradient(135deg, #be123c 0%, #881337 100%)'
    },
    {
      title: L({ en: 'Product Guides', ko: '제품 관련 매뉴얼', th: 'คู่มือเกี่ยวกับผลิตภัณฑ์', vn: 'Hướng dẫn về sản phẩm', ms: 'Panduan produk', cn: '产品相关手册' }),
      description: L({ en: 'Guides and login links for product-related tasks', ko: '제품 관련 업무 가이드 및 로그인 링크', th: 'คู่มือและลิงก์ล็อกอินสำหรับงานด้านผลิตภัณฑ์', vn: 'Hướng dẫn và liên kết đăng nhập cho tác vụ sản phẩm', ms: 'Panduan dan pautan log masuk untuk tugasan produk', cn: '产品相关任务指南与登录链接' }),
      href: '/admin/main/learning-main/product-guides',
      icon: Package,
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      scope: 'global' as const
    },
    {
      title: L({ en: 'Production Guides', ko: '생산 매뉴얼', th: 'คู่มือการผลิต', vn: 'Hướng dẫn sản xuất', ms: 'Panduan pengeluaran', cn: '生产手册' }),
      description: L({ en: 'Guides and login links for production workflows', ko: '생산 업무 흐름 가이드 및 로그인 링크', th: 'คู่มือและลิงก์ล็อกอินสำหรับกระบวนการผลิต', vn: 'Hướng dẫn và liên kết đăng nhập cho quy trình sản xuất', ms: 'Panduan dan pautan log masuk untuk aliran kerja pengeluaran', cn: '生产流程指南与登录链接' }),
      href: '/admin/main/learning-main/production-guides',
      icon: Factory,
      color: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
      scope: 'global' as const
    },
    {
      title: L({ en: 'Other Guides', ko: '기타 매뉴얼', th: 'คู่มืออื่นๆ', vn: 'Hướng dẫnอื่นๆ', ms: 'Panduan lain', cn: '其他手册' }),
      description: L({ en: 'Additional guides for other systems and tools', ko: '기타 시스템/도구를 위한 추가 가이드', th: 'คู่มือเพิ่มเติมสำหรับระบบและเครื่องมืออื่นๆ', vn: 'Hướng dẫn bổ sung cho hệ thống và công cụ khác', ms: 'Panduan tambahan untuk sistem dan alat lain', cn: '其他系统与工具的附加手册' }),
      href: '/admin/main/learning-main/other-guides',
      icon: FileText,
      color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      scope: 'global' as const
    }
  ]

  const filteredMenuCards = useMemo(() => {
    return menuCards.filter((item) => {
      const cardBranch = getBranchKey(item.href)
      const cardType = getTypeKey(item.href)
      const isGlobalCard = item.scope === 'global'
      const passBranch = isGlobalCard || branchFilter === 'all' || cardBranch === branchFilter
      const passType = typeFilter === 'all' || cardType === typeFilter
      return passBranch && passType
    })
  }, [menuCards, branchFilter, typeFilter])

  const branchButtons = [
    { key: 'all' as const, label: L({ en: 'All Branches', ko: '전체 지점', th: 'ทุกสาขา', vn: 'Tất cả chi nhánh', ms: 'Semua cawangan', cn: '全部分支' }), flag: null },
    { key: 'korea' as const, label: L({ en: 'Korea', ko: '한국', th: 'เกาหลี', vn: 'Hàn Quốc', ms: 'Korea', cn: '韩国' }), flag: 'KR' as const },
    { key: 'thailand' as const, label: L({ en: 'Thailand', ko: '태국', th: 'ไทย', vn: 'Thái Lan', ms: 'Thailand', cn: '泰国' }), flag: 'TH' as const },
    { key: 'vietnam' as const, label: L({ en: 'Vietnam', ko: '베트남', th: 'เวียดนาม', vn: 'Việt Nam', ms: 'Vietnam', cn: '越南' }), flag: 'VN' as const },
    { key: 'malaysia' as const, label: L({ en: 'Malaysia', ko: '말레이시아', th: 'มาเลเซีย', vn: 'Malaysia', ms: 'Malaysia', cn: '马来西亚' }), flag: 'MY' as const },
    { key: 'brunei' as const, label: L({ en: 'Brunei', ko: '브루나이', th: 'บรูไน', vn: 'Brunei', ms: 'Brunei', cn: '文莱' }), flag: 'BN' as const }
  ]

  const typeButtons = [
    { key: 'all' as const, label: L({ en: 'All Types', ko: '전체 유형', th: 'ทุกประเภท', vn: 'Tất cả loại', ms: 'Semua jenis', cn: '全部类型' }), emoji: '🧩' },
    { key: 'work' as const, label: L({ en: 'Work Manuals', ko: '업무 매뉴얼', th: 'คู่มือการทำงาน', vn: 'Hướng dẫn công việc', ms: 'Manual kerja', cn: '工作手册' }), emoji: '📘' },
    { key: 'system' as const, label: L({ en: 'System Manuals', ko: '시스템 매뉴얼', th: 'คู่มือการใช้ระบบ', vn: 'Hướng dẫn hệ thống', ms: 'Manual sistem', cn: '系统手册' }), emoji: '⚙️' }
  ]

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #eef2ff 0%, #e2e8f0 100%)' }}>
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1f2937' }}>{L({ en: 'Learning & Training Main Menu', ko: '학습 및 교육 메인 메뉴', th: 'เมนูหลักการเรียนรู้และการฝึกอบรม', vn: 'Menu chính Học tập & Đào tạo', ms: 'Menu Utama Pembelajaran & Latihan', cn: '学习与培训主菜单' })}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{L({ en: 'K Energy Save - Learning Access Portal', ko: 'K Energy Save - 학습 접근 포털', th: 'K Energy Save - พอร์ทัลเข้าถึงการเรียนรู้', vn: 'K Energy Save - Cổng truy cập học tập', ms: 'K Energy Save - Portal Akses Pembelajaran', cn: 'K Energy Save - 学习访问门户' })}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LanguageSwitcher allowedCodes={['th', 'vn', 'ms', 'ko', 'en', 'cn']} showBruneiAlias />
            <button
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#fff',
                color: '#374151',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <LogOut size={14} /> {L({ en: 'Logout', ko: '로그아웃', th: 'ออกจากระบบ', vn: 'Đăng xuất', ms: 'Log keluar', cn: '退出登录' })}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <User size={18} color="#6366f1" />
          <span style={{ color: '#374151', fontWeight: 600 }}>
            {L({ en: 'Welcome', ko: '환영합니다', th: 'ยินดีต้อนรับ', vn: 'Chào mừng', ms: 'Selamat datang', cn: '欢迎' })}: {currentUser?.name || currentUser?.username || L({ en: 'Learning User', ko: '학습 사용자', th: 'ผู้ใช้การเรียนรู้', vn: 'Người dùng học tập', ms: 'Pengguna pembelajaran', cn: '学习用户' })}
          </span>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10, fontWeight: 700 }}>
            {L({ en: 'Quick Filters', ko: '빠른 필터', th: 'ตัวกรองด่วน', vn: 'Bộ lọc nhanh', ms: 'Penapis pantas', cn: '快速筛选' })}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, fontWeight: 600 }}>
              {L({ en: 'By Branch', ko: '지점별', th: 'ตามสาขา', vn: 'Theo chi nhánh', ms: 'Mengikut cawangan', cn: '按分支' })}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {branchButtons.map((btn) => {
                const active = branchFilter === btn.key
                return (
                  <button
                    key={btn.key}
                    onClick={() => setBranchFilter(btn.key)}
                    style={{
                      border: active ? '1px solid #6366f1' : '1px solid #e5e7eb',
                      background: active ? '#eef2ff' : '#fff',
                      color: active ? '#3730a3' : '#374151',
                      borderRadius: 999,
                      padding: '7px 12px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {btn.flag ? <CountryFlag country={btn.flag} size="sm" /> : <span>🌐</span>} {btn.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, fontWeight: 600 }}>
              {L({ en: 'By Manual Type', ko: '매뉴얼 유형별', th: 'ตามประเภทคู่มือ', vn: 'Theo loại hướng dẫn', ms: 'Mengikut jenis manual', cn: '按手册类型' })}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {typeButtons.map((btn) => {
                const active = typeFilter === btn.key
                return (
                  <button
                    key={btn.key}
                    onClick={() => setTypeFilter(btn.key)}
                    style={{
                      border: active ? '1px solid #0f766e' : '1px solid #e5e7eb',
                      background: active ? '#ecfeff' : '#fff',
                      color: active ? '#115e59' : '#374151',
                      borderRadius: 999,
                      padding: '7px 12px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {btn.emoji} {btn.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {filteredMenuCards.map((item) => {
            const Icon = item.icon
            const branch = getBranchKey(item.href)
            const manualType = getTypeKey(item.href)
            const isGlobalCard = item.scope === 'global'
            return (
              <Link
                key={item.title}
                href={item.href}
                style={{
                  textDecoration: 'none',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 14,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={22} color="#fff" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#4b5563', marginBottom: 4 }}>
                  <CountryFlag country={getCardFlag(item.href)} size="sm" />
                  <span>{manualType === 'system' ? '⚙️' : '📘'}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                  {!isGlobalCard ? (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#f3f4f6', color: '#4b5563' }}>
                      {branch.toUpperCase()}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: '#fff7ed', color: '#9a3412' }}>
                      {L({ en: 'ALL BRANCHES', ko: '전체 지점', th: 'ทุกสาขา', vn: 'TẤT CẢ CHI NHÁNH', ms: 'SEMUA CAWANGAN', cn: '全部分支' })}
                    </span>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: manualType === 'system' ? '#ecfeff' : '#eef2ff', color: manualType === 'system' ? '#115e59' : '#3730a3' }}>
                    {manualType === 'system' ? L({ en: 'System', ko: '시스템', th: 'ระบบ', vn: 'Hệ thống', ms: 'Sistem', cn: '系统' }) : L({ en: 'Work', ko: '업무', th: 'งาน', vn: 'Công việc', ms: 'Kerja', cn: '工作' })}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{item.description}</div>
              </Link>
            )
          })}
        </div>

        {filteredMenuCards.length === 0 && (
          <div style={{ marginTop: 14, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: 14, color: '#9a3412', fontWeight: 700 }}>
            {L({ en: 'No menu found with current filters. Try selecting All.', ko: '현재 필터에서 메뉴가 없습니다. 전체를 선택해보세요.', th: 'ไม่พบเมนูตามตัวกรองปัจจุบัน กรุณาลองเลือกทั้งหมด', vn: 'Không tìm thấy menu với bộ lọc hiện tại. Hãy chọn tất cả.', ms: 'Tiada menu ditemui dengan penapis semasa. Cuba pilih semua.', cn: '当前筛选下未找到菜单，请尝试选择全部。' })}
          </div>
        )}
      </div>
    </div>
  )
}
