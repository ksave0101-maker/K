'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, MessageCircle, User, Shield, CheckCircle, Paperclip, Image as ImageIcon, Download, FileText, X } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import CompanyLogo from '@/components/CompanyLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';

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
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  department?: string;
  attachments?: FileAttachment[];
}

interface DepartmentConfig {
  name: string;
  nameKey: keyof typeof translations.ko;
  color: string;
  bgGradient: string;
  icon: string;
}

const departmentConfigs: Record<string, DepartmentConfig> = {
  'hr': {
    name: 'HR & Accounting',
    nameKey: 'hrDepartment',
    color: 'blue-500',
    bgGradient: 'from-blue-600 to-indigo-600',
    icon: '👥'
  },
  'production': {
    name: 'Production & Logistics',
    nameKey: 'productionDepartment',
    color: 'orange-500',
    bgGradient: 'from-orange-600 to-amber-600',
    icon: '🏭'
  },
  'international-market': {
    name: 'International Market',
    nameKey: 'internationalMarketDepartment',
    color: 'purple-500',
    bgGradient: 'from-purple-600 to-indigo-600',
    icon: '🌍'
  },
  'domestic-market': {
    name: 'Domestic Market',
    nameKey: 'domesticMarketDepartment',
    color: 'orange-500',
    bgGradient: 'from-orange-600 to-red-600',
    icon: '🏪'
  },
  'quality-control': {
    name: 'Quality Control',
    nameKey: 'qualityControlDepartment',
    color: 'yellow-500',
    bgGradient: 'from-yellow-600 to-amber-600',
    icon: '✅'
  },
  'after-sales': {
    name: 'After-Sales Service',
    nameKey: 'afterSalesServiceDepartment',
    color: 'teal-500',
    bgGradient: 'from-teal-600 to-cyan-600',
    icon: '🎧'
  },
  'maintenance': {
    name: 'Maintenance',
    nameKey: 'maintenanceDepartment',
    color: 'indigo-500',
    bgGradient: 'from-indigo-600 to-violet-600',
    icon: '🔧'
  },
  'customers': {
    name: 'Customer Management',
    nameKey: 'hrDepartment', // Using a fallback
    color: 'blue-500',
    bgGradient: 'from-blue-600 to-sky-600',
    icon: '👥'
  },
  'research-development': {
    name: 'Research & Development',
    nameKey: 'researchDevelopmentDepartment',
    color: 'cyan-500',
    bgGradient: 'from-cyan-600 to-sky-600',
    icon: '🔬'
  },
  'executive': {
    name: 'Executive',
    nameKey: 'executiveDepartment',
    color: 'slate-600',
    bgGradient: 'from-slate-600 to-slate-800',
    icon: '🏢'
  },
  'admin': {
    name: 'Admin',
    nameKey: 'executiveDepartment',
    color: 'slate-600',
    bgGradient: 'from-slate-600 to-slate-800',
    icon: '🛡️'
  },
  'branch-manager': {
    name: 'Branch Manager',
    nameKey: 'executiveDepartment',
    color: 'slate-500',
    bgGradient: 'from-slate-500 to-slate-700',
    icon: '🏬'
  }
};

export default function DepartmentAdminSupportPage({ params }: { params: { department: string } }) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const departmentConfig = departmentConfigs[params.department];
  const departmentName = departmentConfig ? t[departmentConfig.nameKey] : params.department;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAdminOnline, setIsAdminOnline] = useState(true);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Load user name - use department-specific storage to avoid conflicts
    const deptSpecificKey = `chat-user-name-${params.department}`;
    const savedDeptName = localStorage.getItem(deptSpecificKey);
    const adminUser = localStorage.getItem('k_system_admin_user');

    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        const userDeptID = user.departmentID || '';

        // Map departmentID to slug
        const deptIDtoSlug: Record<string, string> = {
          'HR': 'hr',
          'Production': 'production',
          'InternationalMarket': 'international-market',
          'DomesticMarket': 'domestic-market',
          'QualityControl': 'quality-control',
          'AfterSales': 'after-sales',
          'Maintenance': 'maintenance',
          'RnD': 'research-development',
          'CustomerMgmt': 'customers',
        };

        const userDeptSlug = deptIDtoSlug[userDeptID] || '';

        // Only use session name if user belongs to this department
        if (userDeptSlug === params.department) {
          const displayName = user.name || user.username || '';
          if (displayName) {
            setUserName(displayName);
            localStorage.setItem(deptSpecificKey, displayName);
          } else if (savedDeptName) {
            setUserName(savedDeptName);
          } else {
            setShowNamePrompt(true);
          }
        } else if (savedDeptName) {
          // Different department - use saved department-specific name
          setUserName(savedDeptName);
        } else {
          // No saved name - prompt for name
          setShowNamePrompt(true);
        }
      } catch {
        if (savedDeptName) setUserName(savedDeptName);
        else setShowNamePrompt(true);
      }
    } else if (savedDeptName) {
      setUserName(savedDeptName);
    } else {
      setShowNamePrompt(true);
    }
  }, [params.department]);

  useEffect(() => {
    // Load messages from localStorage for this department
    const savedMessages = localStorage.getItem(`admin-chat-${params.department}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (e) {
        // If parsing fails, initialize with welcome message
        initializeWelcomeMessage();
      }
    } else {
      initializeWelcomeMessage();
    }
  }, [params.department, locale]);

  const initializeWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: '1',
      sender: locale === 'ko' ? '연구개발 부서' : 'Research & Development',
      role: 'admin',
      text: String(t.adminWelcomeMessage).replace('{department}', String(departmentName)),
      timestamp: new Date(Date.now() - 60000),
      status: 'read',
      department: params.department
    };
    setMessages([welcomeMessage]);
  };

  useEffect(() => {
    // Save messages to localStorage whenever they change
    if (messages.length > 0) {
      localStorage.setItem(`admin-chat-${params.department}`, JSON.stringify(messages));
    }
  }, [messages, params.department]);

  useEffect(() => {
    // Real-time message monitoring - check for new messages from R&D admin
    const checkForNewMessages = () => {
      const savedMessages = localStorage.getItem(`admin-chat-${params.department}`);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          const currentMsgIds = messages.map(m => m.id).join(',');
          const newMsgIds = parsed.map((m: any) => m.id).join(',');

          // Update if messages changed (different IDs or different length)
          if (currentMsgIds !== newMsgIds || parsed.length !== messages.length) {
            console.log('📨 New messages detected, updating...', {
              current: messages.length,
              new: parsed.length
            });
            setMessages(parsed.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })));
          }
        } catch (e) {
          console.error('Error loading new messages:', e);
        }
      }
    };

    // Check every 2 seconds for faster response
    const interval = setInterval(checkForNewMessages, 2000);

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `admin-chat-${params.department}` && e.newValue) {
        console.log('💾 Storage event detected from another tab');
        checkForNewMessages();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Check when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible, checking for messages...');
        checkForNewMessages();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [params.department, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert(locale === 'ko' ? '파일 크기는 5MB를 초과할 수 없습니다.' : 'File size cannot exceed 5MB.');
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
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: userName || (locale === 'ko' ? '사용자' : 'User'),
      role: 'user',
      text: newMessage,
      timestamp: new Date(),
      status: 'sent',
      department: params.department,
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setAttachments([]);

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' as const } : msg
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === message.id ? { ...msg, status: 'read' as const } : msg
        )
      );
    }, 1000);

    // No auto-reply - wait for real admin response from R&D dashboard
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Prevent hydration errors
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{locale === 'ko' ? '로딩 중...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!departmentConfig) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {locale === 'ko' ? '부서를 찾을 수 없습니다' : 'Department not found'}
          </h1>
          <Link href="/" className="text-blue-600 hover:underline">
            {t.back}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {locale === 'ko' ? '이름을 입력하세요' : 'Enter Your Name'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {locale === 'ko' 
                ? '채팅에서 사용할 이름을 입력해주세요.' 
                : 'Please enter your name for the chat.'}
            </p>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && userName.trim()) {
                  localStorage.setItem(`chat-user-name-${params.department}`, userName.trim());
                  setShowNamePrompt(false);
                }
              }}
              placeholder={locale === 'ko' ? '이름을 입력하세요...' : 'Enter your name...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <button
              onClick={() => {
                if (userName.trim()) {
                  localStorage.setItem(`chat-user-name-${params.department}`, userName.trim());
                  setShowNamePrompt(false);
                }
              }}
              disabled={!userName.trim()}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                userName.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {locale === 'ko' ? '확인' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CompanyLogo size="2xl" />
              <div className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-blue-600">{t.companyName}</h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{departmentConfig.icon}</span>
                  <Shield className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-700">
                    {departmentName} - {t.adminSupportChatRoom}
                  </h2>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{t.back}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className={`bg-gradient-to-r ${departmentConfig.bgGradient} px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
                  {departmentConfig.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {departmentName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <p className="text-white/80 text-sm">
                      {isAdminOnline ? t.adminOnline : t.adminOffline}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-md'
                  } rounded-lg p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.role === 'admin' ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="font-semibold text-sm">
                      {message.role === 'user' 
                        ? (userName || message.sender)
                        : message.sender
                      }
                    </span>
                    <span className={`text-xs ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString(locale === 'ko' ? 'ko-KR' : 'en-US', {
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
                                message.role === 'user'
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
                  
                  {message.role === 'user' && message.status && (
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <CheckCircle 
                        className={`w-3 h-3 ${
                          message.status === 'read' 
                            ? 'text-white' 
                            : message.status === 'delivered'
                            ? 'text-white/70'
                            : 'text-white/50'
                        }`}
                      />
                      <span className="text-xs text-white/70">
                        {message.status === 'read' 
                          ? (locale === 'ko' ? '읽음' : 'Read')
                          : message.status === 'delivered'
                          ? (locale === 'ko' ? '전달됨' : 'Delivered')
                          : (locale === 'ko' ? '전송됨' : 'Sent')
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            {/* Attachment Preview */}
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
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
                title={locale === 'ko' ? '파일 첨부' : 'Attach files'}
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={locale === 'ko' ? '메시지를 입력하세요...' : 'Type your message...'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={2}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() && attachments.length === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  newMessage.trim() || attachments.length > 0
                    ? `bg-gradient-to-r ${departmentConfig.bgGradient} text-white hover:shadow-lg`
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>{locale === 'ko' ? '전송' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className={`mt-6 bg-${departmentConfig.color}/10 border border-${departmentConfig.color}/30 rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            <MessageCircle className={`w-5 h-5 text-${departmentConfig.color} mt-0.5`} />
            <div>
              <h4 className={`font-semibold text-${departmentConfig.color} mb-1`}>
                {departmentName} - {t.administratorSupport}
              </h4>
              <p className="text-sm text-gray-700">
                {String(t.chatWithDepartmentAdmin).replace('{department}', String(departmentName))}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
