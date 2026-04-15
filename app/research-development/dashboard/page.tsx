'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import {
  FlaskConical,
  Lightbulb,
  TestTube2,
  ScrollText,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  Clock,
  TrendingUp,
  Workflow,
  Bell,
  MessageCircle,
  Send,
  X,
  Shield,
  Users,
  Paperclip,
  FileText,
  Download,
  Image as ImageIcon,
} from 'lucide-react';

interface FileAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

interface Message {
  id: string;
  sender: string;
  role: 'admin' | 'user';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  department?: string;
  attachments?: FileAttachment[];
}

interface DepartmentMessages {
  department: string;
  departmentName: string;
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
  icon: string;
  color: string;
}

export default function ResearchDevelopmentDashboardPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale] as any;

  const [departmentChats, setDepartmentChats] = useState<DepartmentMessages[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentMessages | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<FileAttachment[]>([]);
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [previousUnreadCounts, setPreviousUnreadCounts] = useState<Record<string, number>>({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function for multilingual text
  const L = (en: string, ko: string, th?: string) => {
    if (locale === 'ko') return ko;
    if (locale === 'th' && th) return th;
    return en;
  };

  useEffect(() => {
    // Load user name from localStorage
    const savedName = localStorage.getItem('chat-user-name');
    if (savedName) {
      setUserName(savedName);
    }

    // Load current user from localStorage
    try {
      const userData = localStorage.getItem('k_system_admin_user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }

    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const departmentConfigs = useMemo(() => ({
    'hr': {
      name: L('HR & Accounting', 'HR & 회계 부서', 'HR และบัญชี'),
      icon: '👥',
      color: 'bg-blue-500'
    },
    'production': {
      name: L('Production & Logistics', '생산 & 물류 부서', 'ฝ่ายผลิตและโลจิสติกส์'),
      icon: '🏭',
      color: 'bg-orange-500'
    },
    'international-market': {
      name: L('International Market', '해외 시장 부서', 'ฝ่ายการตลาดต่างประเทศ'),
      icon: '🌍',
      color: 'bg-purple-500'
    },
    'domestic-market': {
      name: L('Domestic Market', '국내 시장 부서', 'ฝ่ายการตลาดภายในประเทศ'),
      icon: '🏪',
      color: 'bg-orange-500'
    },
    'quality-control': {
      name: L('Quality Control', '품질 관리 부서', 'ฝ่ายควบคุมคุณภาพ'),
      icon: '✅',
      color: 'bg-yellow-500'
    },
    'after-sales': {
      name: L('After-Sales Service', '애프터 서비스 부서', 'ฝ่ายบริการหลังการขาย'),
      icon: '🎧',
      color: 'bg-teal-500'
    },
    'maintenance': {
      name: L('Maintenance', '유지보수 부서', 'ฝ่ายบำรุงรักษา'),
      icon: '🔧',
      color: 'bg-indigo-500'
    },
    'customers': {
      name: L('Customer Management', '고객 관리', 'ฝ่ายบริหารลูกค้า'),
      icon: '👥',
      color: 'bg-blue-500'
    },
    'research-development': {
      name: L('Research & Development', '연구개발 부서', 'ฝ่ายวิจัยและพัฒนา'),
      icon: '🔬',
      color: 'bg-cyan-500'
    }
  }), [locale]);

  useEffect(() => {
    loadAllDepartmentChats();

    // Auto-refresh messages every 5 seconds for real-time updates
    const interval = setInterval(() => {
      loadAllDepartmentChats();
    }, 5000);
    
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAllDepartmentChats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [locale]);

  const loadAllDepartmentChats = () => {
    const chats: DepartmentMessages[] = [];
    
    // Always show all departments, whether they have messages or not
    Object.entries(departmentConfigs).forEach(([deptKey, config]) => {
      const savedMessages = localStorage.getItem(`admin-chat-${deptKey}`);
      let messages: Message[] = [];
      let unreadCount = 0;
      let lastMessage: Message | undefined = undefined;
      
      if (savedMessages) {
        try {
          messages = JSON.parse(savedMessages);
          const userMessages = messages.filter(msg => msg.role === 'user');
          const unreadMessages = userMessages.filter(msg => msg.status !== 'read');
          unreadCount = unreadMessages.length;
          lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
        } catch (e) {
          console.error(`Error loading messages for ${deptKey}:`, e);
        }
      }
      
      // Always add the department card
      chats.push({
        department: deptKey,
        departmentName: config.name,
        messages: messages,
        unreadCount: unreadCount,
        lastMessage: lastMessage,
        icon: config.icon,
        color: config.color
      });
    });
    
    // Sort by unread count first, then by last message time
    chats.sort((a, b) => {
      // Departments with unread messages come first
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

      // Then sort by last message time
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });

    // Check for new messages and show notifications
    chats.forEach(chat => {
      const prevCount = previousUnreadCounts[chat.department] || 0;
      const currentCount = chat.unreadCount;

      // New message detected!
      if (currentCount > prevCount && currentCount > 0) {
        const newMessagesCount = currentCount - prevCount;
        const notifText = locale === 'ko'
          ? `${chat.departmentName}에서 새 메시지 ${newMessagesCount}개`
          : `${newMessagesCount} new message(s) from ${chat.departmentName}`;

        // Show toast notification
        setNotificationMessage(notifText);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);

        // Show browser notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('K Energy Save - R&D', {
            body: notifText,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `msg-${chat.department}`,
            requireInteraction: false
          });
        }

        // Play notification sound
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi775ufTAoMUKbj8LZiFQc5kdfy0HssByd3x/DfkD8KFV6z6eqmUxQKRp/g8r1rIQQrgM/y2Io2CBlouu+bn0wKDFCm4/C1YhUHOpHX8tB7LAAL');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (e) {}
      }
    });

    // Update previous counts
    const newCounts: Record<string, number> = {};
    chats.forEach(chat => {
      newCounts[chat.department] = chat.unreadCount;
    });
    setPreviousUnreadCounts(newCounts);

    setDepartmentChats(chats);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert(L('File size cannot exceed 5MB.', '파일 크기는 5MB를 초과할 수 없습니다.', 'ขนาดไฟล์ต้องไม่เกิน 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const attachment: FileAttachment = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target?.result as string
        };
        setReplyAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setReplyAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = () => {
    if (!selectedDepartment || (!replyText.trim() && replyAttachments.length === 0)) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: L('Research & Development', '연구개발 부서', 'ฝ่ายวิจัยและพัฒนา'),
      role: 'admin',
      text: replyText,
      timestamp: new Date().toISOString(),
      status: 'read',
      department: selectedDepartment.department,
      attachments: replyAttachments.length > 0 ? replyAttachments : undefined
    };

    const updatedMessages = [...selectedDepartment.messages, newMessage];
    const storageKey = `admin-chat-${selectedDepartment.department}`;

    console.log('💬 R&D Admin sending message:', {
      department: selectedDepartment.department,
      storageKey,
      messageCount: updatedMessages.length,
      newMessage: newMessage.text
    });

    localStorage.setItem(storageKey, JSON.stringify(updatedMessages));

    // Verify it was saved
    const saved = localStorage.getItem(storageKey);
    console.log('✅ Message saved to localStorage:', saved ? 'SUCCESS' : 'FAILED');

    setReplyText('');
    setReplyAttachments([]);
    loadAllDepartmentChats();

    // Update selected department with new message
    setSelectedDepartment({
      ...selectedDepartment,
      messages: updatedMessages,
      lastMessage: newMessage
    });
  };

  const markAsRead = (deptKey: string) => {
    const storageKey = `admin-chat-${deptKey}`;
    const savedMessages = localStorage.getItem(storageKey);

    console.log('👀 Marking messages as read for:', deptKey);

    if (savedMessages) {
      try {
        const messages: Message[] = JSON.parse(savedMessages);
        const unreadCount = messages.filter(m => m.role === 'user' && m.status !== 'read').length;

        const updatedMessages = messages.map(msg => ({
          ...msg,
          // Only mark user messages as read
          status: msg.role === 'user' ? 'read' as const : msg.status
        }));

        console.log('✅ Marked as read:', { department: deptKey, unreadCount, total: messages.length });

        localStorage.setItem(storageKey, JSON.stringify(updatedMessages));
        loadAllDepartmentChats();
      } catch (e) {
        console.error('Error marking messages as read:', e);
      }
    }
  };

  const handleCloseModal = () => {
    // Mark messages as read when closing modal (after user has viewed them)
    if (selectedDepartment && selectedDepartment.unreadCount > 0) {
      console.log('📖 User closed modal, marking messages as read');
      markAsRead(selectedDepartment.department);
    }
    setSelectedDepartment(null);
  };

  const totalUnread = departmentChats.reduce((sum, dept) => sum + dept.unreadCount, 0);

  const kpiData = useMemo(() => [
    { name: L('Project Completion Rate', '프로젝트 완료율', 'อัตราความสำเร็จของโครงการ'), current: 85, target: 90, status: 'warning' },
    { name: L('R&D Investment Efficiency', '연구 투자 효율성', 'ประสิทธิภาพการลงทุน R&D'), current: 92, target: 85, status: 'good' },
    { name: L('Patent Application Success', '특허 출원 성공률', 'ความสำเร็จในการจดสิทธิบัตร'), current: 78, target: 80, status: 'warning' },
    { name: L('Innovation Project Ratio', '혁신 프로젝트 비율', 'อัตราโครงการนวัตกรรม'), current: 65, target: 70, status: 'critical' },
    { name: L('Tech Transfer Success', '기술 이전 성공률', 'ความสำเร็จในการถ่ายทอดเทคโนโลยี'), current: 88, target: 85, status: 'good' },
  ], [locale]);

  const improvements = useMemo(() => [
    {
      title: L('Improve Prototype Testing Process', '프로토타입 테스트 프로세스 개선', 'ปรับปรุงกระบวนการทดสอบต้นแบบ'),
      priority: 'high' as const,
      status: L('In Progress', '진행 중', 'กำลังดำเนินการ'),
      deadline: '2026-03-15'
    },
    {
      title: L('Update Research Budget Management', '연구 예산 관리 시스템 업데이트', 'อัปเดตระบบจัดการงบประมาณวิจัย'),
      priority: 'medium' as const,
      status: L('Pending', '대기 중', 'รอดำเนินการ'),
      deadline: '2026-04-01'
    },
    {
      title: L('Enhance Inter-department Collaboration', '부서 간 협업 프로세스 강화', 'เสริมสร้างการทำงานร่วมกันระหว่างแผนก'),
      priority: 'high' as const,
      status: L('In Progress', '진행 중', 'กำลังดำเนินการ'),
      deadline: '2026-03-30'
    },
    {
      title: L('Standardize Research Data Management', '연구 데이터 관리 표준화', 'มาตรฐานการจัดการข้อมูลวิจัย'),
      priority: 'low' as const,
      status: L('Planning', '계획 중', 'วางแผน'),
      deadline: '2026-05-15'
    },
  ], [locale]);

  type MenuCard = {
    icon: any;
    title: string;
    description: string;
    href: string;
    color: string;
    count: number | null;
    external?: boolean;
  };

  const menuCards: MenuCard[] = [
    {
      icon: FileText,
      title: L('Create Project', '프로젝트 생성', 'สร้างโครงการ'),
      description: L('Add a new R&D project', '새로운 R&D 프로젝트 추가', 'เพิ่มโครงการ R&D ใหม่'),
      href: '/research-development/projects/new',
      color: 'bg-indigo-500',
      count: null,
    },
    {
      icon: Lightbulb,
      title: L('Active Projects', '진행 중인 프로젝트', 'โครงการที่กำลังดำเนินการ'),
      description: L('Ongoing R&D projects', '현재 진행 중인 R&D 프로젝트', 'โครงการ R&D ที่กำลังดำเนินการ'),
      href: '/research-development/active-projects',
      color: 'bg-blue-500',
      count: 14,
    },
    {
      icon: TestTube2,
      title: L('Prototype Testing', '프로토타입 테스트', 'การทดสอบต้นแบบ'),
      description: L('Test and validate prototypes', '프로토타입 테스트 및 검증', 'ทดสอบและตรวจสอบต้นแบบ'),
      href: '/research-development/prototype-testing',
      color: 'bg-green-500',
      count: 6,
    },
    {
      icon: ScrollText,
      title: L('Patent Management', '특허 관리', 'การจัดการสิทธิบัตร'),
      description: L('Manage patents and intellectual property', '특허 및 지적재산권 관리', 'จัดการสิทธิบัตรและทรัพย์สินทางปัญญา'),
      href: '/research-development/patents',
      color: 'bg-purple-500',
      count: 5,
    },
    {
      icon: DollarSign,
      title: L('Research Budget', '연구 예산', 'งบประมาณวิจัย'),
      description: L('Manage R&D budget and expenses', 'R&D 예산 및 지출 관리', 'จัดการงบประมาณและค่าใช้จ่าย R&D'),
      href: '/research-development/budget',
      color: 'bg-orange-500',
      count: null,
    },
    {
      icon: Workflow,
      title: L('Flow System', 'Flow 시스템', 'ระบบ Flow'),
      description: L('Workflow management system', '워크플로우 관리 시스템', 'ระบบจัดการเวิร์กโฟลว์'),
      href: 'https://flow.team/signin.act',
      color: 'bg-cyan-600',
      count: null,
      external: true
    },
    {
      icon: Download,
      title: L('Export Data', '데이터 내보내기', 'ส่งออกข้อมูล'),
      description: L('Export DB tables to CSV/JSON for AI training', '데이터를 CSV/JSON으로 내보내 AI 학습에 사용', 'ส่งออกตารางฐานข้อมูลเป็น CSV/JSON สำหรับการฝึก AI'),
      href: '/research-development/export',
      color: 'bg-emerald-500',
      count: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-sky-100">
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md">
            <div className="bg-white/20 p-2 rounded-full">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">
                {L('New Message', '새 메시지', 'ข้อความใหม่')}
              </p>
              <p className="text-sm text-white/90">{notificationMessage}</p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/Korea/Admin-Login')} className="text-cyan-600 hover:text-cyan-800 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />{t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t.rdDashboard}</h1>
                    <p className="text-sm text-gray-600">{t.rdDashboardDesc}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Current User Display */}
              {mounted && currentUser && (
                <div className="px-4 py-2 rounded-lg bg-cyan-50 border-2 border-cyan-200 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-600" />
                  <span className="text-sm font-medium text-cyan-700">
                    {currentUser.name || currentUser.username}
                  </span>
                </div>
              )}
              {/* Admin Button */}
              {mounted ? (
                <Link
                  href="/admin/AdminKsave"
                  className="px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-2 border-2 border-indigo-200"
                >
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">
                    {L('Admin', '관리자', 'ผู้ดูแลระบบ')}
                  </span>
                </Link>
              ) : (
                <div className="px-4 py-2 rounded-lg bg-indigo-50 transition-colors flex items-center gap-2 border-2 border-indigo-200">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">{L('Admin', '관리자', 'ผู้ดูแลระบบ')}</span>
                </div>
              )}
              {/* Quick Messages Button - render only after client mount to avoid hydration mismatch */}
              {mounted ? (
                <button
                  onClick={() => {
                    const messageCenter = document.getElementById('message-center');
                    if (messageCenter) {
                      messageCenter.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="relative px-4 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-2 border-2 border-purple-200"
                >
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    {L('Messages', '부서 메시지', 'ข้อความ')}
                  </span>
                  {totalUnread > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </button>
              ) : (
                <div className="relative px-4 py-2 rounded-lg bg-purple-50 transition-colors flex items-center gap-2 border-2 border-purple-200">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">{L('Messages', '부서 메시지', 'ข้อความ')}</span>
                </div>
              )}
              {mounted ? <LanguageSwitcher /> : <div className="w-[140px]" />}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {selectedDepartment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Header */}
            <div className={`${selectedDepartment.color} px-6 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg">
                  {selectedDepartment.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedDepartment.departmentName}</h3>
                  <p className="text-white/80 text-sm">
                    {selectedDepartment.messages.length} {L('messages', '메시지', 'ข้อความ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin-support/${selectedDepartment.department}`}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-sm transition-colors"
                >
                  {L('View Full Chat', '전체 대화 보기', 'ดูการสนทนาทั้งหมด')}
                </Link>
                <button onClick={handleCloseModal} className="text-white hover:bg-white/20 rounded p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {selectedDepartment.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      message.role === 'admin'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                        : 'bg-white text-gray-800 shadow-md'
                    } rounded-lg p-4`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.role === 'admin' ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                      <span className="font-semibold text-sm">
                        {message.role === 'user'
                          ? (userName || message.sender)
                          : message.sender
                        }
                      </span>
                      <span className={`text-xs ${message.role === 'admin' ? 'text-white/70' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((file, idx) => (
                          <div key={idx}>
                            {file.type.startsWith('image/') ? (
                              <div className="rounded-lg overflow-hidden">
                                <img 
                                  src={file.data} 
                                  alt={file.name}
                                  className="max-w-full h-auto max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(file.data, '_blank')}
                                />
                                <p className="text-xs mt-1 opacity-70">{file.name}</p>
                              </div>
                            ) : (
                              <a
                                href={file.data}
                                download={file.name}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                                  message.role === 'admin'
                                    ? 'border-white/30 hover:bg-white/10'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <FileText className="w-4 h-4" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs opacity-70">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {/* Attachment Preview */}
              {replyAttachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {replyAttachments.map((file, idx) => (
                    <div key={idx} className="relative group">
                      {file.type.startsWith('image/') ? (
                        <div className="relative">
                          <img 
                            src={file.data} 
                            alt={file.name}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            onClick={() => removeAttachment(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-700 max-w-[100px] truncate">{file.name}</span>
                          <button
                            onClick={() => removeAttachment(idx)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                  title={L('Attach files', '파일 첨부', 'แนบไฟล์')}
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder={L('Type your reply...', '답장을 입력하세요...', 'พิมพ์ข้อความของคุณ...')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    rows={2}
                  />
                </div>
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() && replyAttachments.length === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    replyText.trim() || replyAttachments.length > 0
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  <span>{L('Send', '전송', 'ส่ง')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* KPI & Improvements Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* KPI Standards */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500 text-white p-3 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {L('Department KPI Performance', '부서 KPI 달성률', 'ผลการดำเนินงาน KPI ของแผนก')}
                </h3>
                <p className="text-sm text-gray-500">
                  {L('R&D Core Performance Indicators', '연구개발 부서 핵심 성과 지표', 'ตัวชี้วัดผลการดำเนินงานหลักของ R&D')}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {kpiData.map((kpi, idx) => (
                <div key={idx} className="border-l-4 pl-4 py-2" style={{
                  borderColor: kpi.status === 'good' ? '#10b981' : kpi.status === 'warning' ? '#f59e0b' : '#ef4444'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{kpi.name}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${
                        kpi.status === 'good' ? 'text-green-600' : 
                        kpi.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {kpi.current}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {L('Target', '목표', 'เป้าหมาย')}: {kpi.target}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        kpi.status === 'good' ? 'bg-green-500' : 
                        kpi.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(kpi.current, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {L('Overall Average Achievement', '전체 평균 달성률', 'ค่าเฉลี่ยความสำเร็จโดยรวม')}
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(kpiData.reduce((sum, kpi) => sum + kpi.current, 0) / kpiData.length)}%
              </span>
            </div>
          </div>

          {/* Improvement Areas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-500 text-white p-3 rounded-lg">
                <Workflow className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {L('Improvement Areas', '개선 필요 사항', 'พื้นที่ที่ต้องปรับปรุง')}
                </h3>
                <p className="text-sm text-gray-500">
                  {L('Ongoing Improvement Projects', '진행 중인 개선 프로젝트', 'โครงการปรับปรุงที่กำลังดำเนินการ')}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {improvements.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.priority === 'high' ? 'bg-red-100 text-red-700' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {item.priority === 'high' ? L('High', '높음', 'สูง') :
                           item.priority === 'medium' ? L('Medium', '중간', 'ปานกลาง') :
                           L('Low', '낮음', 'ต่ำ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status === L('In Progress', '진행 중', 'กำลังดำเนินการ') ? 'bg-green-100 text-green-700' :
                          item.status === L('Pending', '대기 중', 'รอดำเนินการ') ? 'bg-gray-100 text-gray-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {L('Deadline', '마감일', 'กำหนดเสร็จ')}: {new Date(item.deadline).toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale === 'th' ? 'th-TH' : 'en-US')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{L('Total Items', '총 개선 항목', 'รายการทั้งหมด')}</span>
                <span className="font-bold text-gray-800">{improvements.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">{L('High Priority', '높은 우선순위', 'ความสำคัญสูง')}</span>
                <span className="font-bold text-red-600">
                  {improvements.filter(i => i.priority === 'high').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Department Messages Center */}
        <div id="message-center" className="mb-8 scroll-mt-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {L('Department Messages Center', '부서 메시지 센터', 'ศูนย์ข้อความแผนก')}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {L('Manage inquiries and messages from all departments', '각 부서의 문의사항 및 메시지 관리', 'จัดการคำถามและข้อความจากทุกแผนก')}
                  </p>
                </div>
              </div>
              {totalUnread > 0 && (
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                  <span className="text-white font-bold">{totalUnread}</span>
                  <span className="text-white/80 text-sm">{L('New', '새 메시지', 'ใหม่')}</span>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentChats
                  .filter((dept) => dept.department !== 'research-development')
                  .map((dept) => (
                  <button
                    key={dept.department}
                    onClick={() => {
                      setSelectedDepartment(dept);
                      // Don't mark as read immediately - wait until modal is closed
                    }}
                    className={`bg-gradient-to-br from-gray-50 to-white border-2 rounded-lg p-4 text-left transition-all group ${
                      dept.messages.length > 0 
                        ? 'border-gray-200 hover:border-purple-400 hover:shadow-lg' 
                        : 'border-gray-100 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`${dept.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                          {dept.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-sm transition-colors ${
                            dept.messages.length > 0 
                              ? 'text-gray-800 group-hover:text-purple-600' 
                              : 'text-gray-600 group-hover:text-blue-600'
                          }`}>
                            {dept.departmentName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {dept.messages.length === 0 
                              ? (locale === 'ko' ? '메시지 없음' : 'No messages')
                              : `${dept.messages.length} ${locale === 'ko' ? '메시지' : 'messages'}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <Bell className={`w-6 h-6 ${dept.unreadCount > 0 ? 'text-purple-600 animate-pulse' : dept.messages.length > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                          {dept.unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                              {dept.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {dept.lastMessage && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          {locale === 'ko' ? '최근 활동' : 'Last activity'}: {new Date(dept.lastMessage.timestamp).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {menuCards.map((card, index) => {
            const Icon = card.icon;
            const isExternal = card.external;
            
            if (isExternal) {
              return (
                <a
                  key={index}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">{card.title}</h3>
                        {card.count !== null && (
                          <span className="bg-cyan-100 text-cyan-600 text-xs font-bold px-2 py-1 rounded-full">{card.count}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{card.description}</p>
                    </div>
                  </div>
                </a>
              );
            }
            
            return (
              <Link
                key={index}
                href={card.href}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">{card.title}</h3>
                      {card.count !== null && (
                        <span className="bg-cyan-100 text-cyan-600 text-xs font-bold px-2 py-1 rounded-full">{card.count}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
