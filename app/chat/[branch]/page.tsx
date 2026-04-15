'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Globe, MessageCircle, User, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import CompanyLogo from '@/components/CompanyLogo';
import CountryFlag from '@/components/CountryFlag';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface Message {
  id: string;
  sender: string;
  text: string;
  translatedText?: string;
  timestamp: Date;
  isOwnMessage: boolean;
  departments?: string[];
}

interface BranchConfig {
  name: string;
  country: 'BN' | 'TH' | 'VN';
  language: string;
  color: string;
  bgGradient: string;
}

const branchConfigs: Record<string, BranchConfig> = {
  'brunei-chat': {
    name: 'Brunei',
    country: 'BN',
    language: 'Malay',
    color: 'amber-500',
    bgGradient: 'from-amber-500 to-amber-700'
  },
  'thailand-chat': {
    name: 'Thailand',
    country: 'TH',
    language: 'Thai',
    color: 'red-500',
    bgGradient: 'from-red-500 to-red-700'
  },
  'vietnam-chat': {
    name: 'Vietnam',
    country: 'VN',
    language: 'Vietnamese',
    color: 'emerald-500',
    bgGradient: 'from-emerald-500 to-emerald-700'
  }
};

const departments = [
  { id: 'executive', nameKey: 'executiveDepartment' as keyof typeof translations.ko },
  { id: 'hr', nameKey: 'hrDepartment' as keyof typeof translations.ko },
  { id: 'production', nameKey: 'productionDepartment' as keyof typeof translations.ko },
  { id: 'international-market', nameKey: 'internationalMarketDepartment' as keyof typeof translations.ko },
  { id: 'domestic-market', nameKey: 'domesticMarketDepartment' as keyof typeof translations.ko },
  { id: 'quality-control', nameKey: 'qualityControlDepartment' as keyof typeof translations.ko },
  { id: 'after-sales', nameKey: 'afterSalesServiceDepartment' as keyof typeof translations.ko },
  { id: 'maintenance', nameKey: 'maintenanceDepartment' as keyof typeof translations.ko },
  { id: 'research-development', nameKey: 'researchDevelopmentDepartment' as keyof typeof translations.ko }
];

export default function ChatPage({ params }: { params: { branch: string } }) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  const branchConfig = branchConfigs[params.branch];

  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments(prev => 
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const toggleAllDepartments = () => {
    if (selectedDepartments.length === departments.length) {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments(departments.map(d => d.id));
    }
  };

  useEffect(() => {
    // Simulate initial messages
    const initialMessages: Message[] = [
      {
        id: '1',
        sender: `${branchConfig?.name} Branch`,
        text: branchConfig?.name === 'Brunei' 
          ? 'Selamat datang! Bagaimana saya boleh membantu anda?' 
          : branchConfig?.name === 'Thailand'
          ? 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?'
          : 'Xin chào! Tôi có thể giúp gì cho bạn?',
        translatedText: '환영합니다! 무엇을 도와드릴까요?',
        timestamp: new Date(Date.now() - 3600000),
        isOwnMessage: false,
        departments: []
      }
    ];
    setMessages(initialMessages);
    // Select all departments by default
    setSelectedDepartments(departments.map(d => d.id));
  }, [branchConfig]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDepartmentDropdown && !target.closest('.department-selector')) {
        setShowDepartmentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDepartmentDropdown]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || selectedDepartments.length === 0) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      text: newMessage,
      timestamp: new Date(),
      isOwnMessage: true,
      departments: selectedDepartments
    };

    // Auto-translate to branch language
    if (autoTranslate) {
      // Translate user message to branch's language
      const translatedToBranchLanguage = branchConfig?.name === 'Brunei'
        ? `[Terjemahan ke Bahasa Melayu] ${newMessage}`
        : branchConfig?.name === 'Thailand'
        ? `[แปลเป็นภาษาไทย] ${newMessage}`
        : `[Dịch sang tiếng Việt] ${newMessage}`;
      
      message.translatedText = translatedToBranchLanguage;
    }

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate reply from branch
    setTimeout(() => {
      const replyText = branchConfig?.name === 'Brunei'
        ? 'Terima kasih atas mesej anda. Kami akan membalas secepat mungkin.'
        : branchConfig?.name === 'Thailand'
        ? 'ขอบคุณสำหรับข้อความค่ะ เราจะติดต่อกลับโดยเร็วที่สุดค่ะ'
        : 'Cảm ơn tin nhắn của bạn. Chúng tôi sẽ phản hồi sớm nhất có thể.';

      // Always translate replies to Korean
      const koreanTranslation = '메시지 감사합니다. 최대한 빨리 답변드리겠습니다.';

      // Randomly select one of the departments that received the message
      const replyingDeptId = selectedDepartments[Math.floor(Math.random() * selectedDepartments.length)];
      const replyingDept = departments.find(d => d.id === replyingDeptId);
      const deptName = replyingDept ? t[replyingDept.nameKey] : '';

      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender: `${branchConfig?.name} - ${deptName}`,
        text: replyText,
        translatedText: koreanTranslation,
        timestamp: new Date(),
        isOwnMessage: false,
        departments: [replyingDeptId]
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!branchConfig) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Branch not found</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CompanyLogo size="2xl" />
              <div className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-blue-600">{t.companyName}</h1>
                  <CountryFlag country="KR" size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-700">
                    {t.chatWithBranch}: {branchConfig.name}
                  </h2>
                  <CountryFlag country={branchConfig.country} size="sm" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{t.back}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className={`bg-gradient-to-r ${branchConfig.bgGradient} px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <CountryFlag country={branchConfig.country} size="lg" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{branchConfig.name} {t.chatTitle}</h3>
                  <p className="text-white/80 text-sm">{branchConfig.language}</p>
                </div>
              </div>
              <button
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  autoTranslate
                    ? 'bg-white text-gray-800'
                    : 'bg-white/20 text-white border-2 border-white'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {autoTranslate ? t.translationEnabled : t.translationDisabled}
                </span>
              </button>
            </div>
          </div>

          {/* Department Selector */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">{t.sendTo}:</label>
              <div className="relative flex-1 department-selector">
                <button
                  onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-700">
                    {selectedDepartments.length === 0
                      ? t.noDepartmentSelected
                      : selectedDepartments.length === departments.length
                      ? t.allDepartments
                      : `${selectedDepartments.length} ${t.selectedDepartments}`}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showDepartmentDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200">
                      <button
                        onClick={toggleAllDepartments}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded transition-colors"
                      >
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                          selectedDepartments.length === departments.length
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedDepartments.length === departments.length && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium text-sm">{t.allDepartments}</span>
                      </button>
                    </div>
                    {departments.map((dept) => (
                      <button
                        key={dept.id}
                        onClick={() => toggleDepartment(dept.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                          selectedDepartments.includes(dept.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedDepartments.includes(dept.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm">{t[dept.nameKey]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {selectedDepartments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedDepartments.map(deptId => {
                  const dept = departments.find(d => d.id === deptId);
                  return dept ? (
                    <span
                      key={deptId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    >
                      {t[dept.nameKey]}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-md'
                  } rounded-lg p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span className="font-semibold text-sm">{message.sender}</span>
                    <span className={`text-xs ${message.isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {!message.isOwnMessage && message.departments && message.departments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {message.departments.map(deptId => {
                        const dept = departments.find(d => d.id === deptId);
                        return dept ? (
                          <span
                            key={deptId}
                            className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {t[dept.nameKey]}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  {message.isOwnMessage && message.departments && message.departments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {message.departments.map(deptId => {
                        const dept = departments.find(d => d.id === deptId);
                        return dept ? (
                          <span
                            key={deptId}
                            className="inline-flex items-center px-2 py-0.5 bg-white/20 text-white text-xs rounded-full"
                          >
                            {t[dept.nameKey]}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  <p className="text-sm mb-2">{message.text}</p>
                  {autoTranslate && message.translatedText && (
                    <div className={`text-xs pt-2 border-t ${
                      message.isOwnMessage ? 'border-white/20' : 'border-gray-200'
                    }`}>
                      <span className={`font-medium ${message.isOwnMessage ? 'text-white/80' : 'text-gray-600'}`}>
                        {t.translatedMessage}:
                      </span>
                      <p className={`mt-1 ${message.isOwnMessage ? 'text-white/90' : 'text-gray-700'}`}>
                        {message.translatedText}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.typeMessage}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
                {selectedDepartments.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">{t.noDepartmentSelected}</p>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || selectedDepartments.length === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  newMessage.trim() && selectedDepartments.length > 0
                    ? `bg-gradient-to-r ${branchConfig.bgGradient} text-white hover:shadow-lg`
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>{t.sendMessage}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">{t.autoTranslate}</h4>
              <p className="text-sm text-blue-800">
                {t.autoTranslateInfo}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
