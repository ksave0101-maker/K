'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, Image, Globe, Download, Check, X, BookOpen, FileEdit, ClipboardList, Sparkles, ExternalLink, Mic, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import CompanyLogo from '@/components/CompanyLogo';
import CountryFlag from '@/components/CountryFlag';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface LanguageOption {
  code: string;
  name: string;
  flag: 'TH' | 'CN' | 'GB' | 'KR' | 'VN' | 'BN';
  nameKey: keyof typeof translations.ko;
}

const languages: LanguageOption[] = [
  { code: 'th', name: 'Thai', flag: 'TH', nameKey: 'thai' },
  { code: 'zh', name: 'Chinese', flag: 'CN', nameKey: 'chinese' },
  { code: 'en', name: 'English', flag: 'GB', nameKey: 'english' },
  { code: 'ko', name: 'Korean', flag: 'KR', nameKey: 'korean' },
  { code: 'vi', name: 'Vietnamese', flag: 'VN', nameKey: 'vietnamese' },
  { code: 'ms', name: 'Malay', flag: 'BN', nameKey: 'malay' }
];

export default function TranslatorPage() {
  const { locale } = useLocale();
  const t = translations[locale];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showNotebookEmbed, setShowNotebookEmbed] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setIsComplete(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIsComplete(false);
    }
  };

  const handleTranslate = async () => {
    if (!selectedFile || !targetLanguage) return;
    
    setIsTranslating(true);
    
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('targetLanguage', targetLanguage);
      
      // Call translation API
      const response = await fetch('/api/translate-file', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Translation failed');
      }
      
      // Get translated file
      const blob = await response.blob();
      
      // Store the blob for download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response header or create one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `translated_${selectedFile.name}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Auto-download the translated file
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsComplete(true);
    } catch (error) {
      console.error('Translation error:', error);
      alert(locale === 'ko' 
        ? '번역 중 오류가 발생했습니다. 다시 시도해주세요.' 
        : 'Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTargetLanguage('');
    setIsComplete(false);
    setIsTranslating(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-12 h-12 text-purple-600" />;
    }
    return <FileText className="w-12 h-12 text-blue-600" />;
  };

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
                  <Globe className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-semibold text-gray-700">{t.translatorTitle}</h2>
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.fileImageTranslator}</h2>
          <p className="text-lg text-gray-600">{t.translatorDescription}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-blue-600" />
              {t.uploadFile}
            </h3>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    {getFileIcon(selectedFile)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    {t.cancel}
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">{t.dragDropFile}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t.selectFile}
                  </button>
                </>
              )}
            </div>

            {/* File Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">{t.supportedFormats}:</p>
              <p className="text-xs text-gray-600">PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF</p>
              <p className="text-sm font-medium text-gray-700 mt-3 mb-2">{t.maxFileSize}:</p>
              <p className="text-xs text-gray-600">10 MB</p>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              {t.selectTargetLanguage}
            </h3>

            {/* Language Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setTargetLanguage(lang.code)}
                  disabled={isTranslating || isComplete}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    targetLanguage === lang.code
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isTranslating || isComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <CountryFlag country={lang.flag} size="lg" />
                    <span className="text-sm font-medium">{t[lang.nameKey]}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Action Button */}
            {!isComplete ? (
              <button
                onClick={handleTranslate}
                disabled={!selectedFile || !targetLanguage || isTranslating}
                className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  !selectedFile || !targetLanguage || isTranslating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                }`}
              >
                {isTranslating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t.translating}
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5" />
                    {t.translateDocument}
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <Check className="w-6 h-6" />
                    <span className="font-semibold">{t.translationComplete}</span>
                  </div>
                  <p className="text-xs text-green-700 ml-8">
                    {locale === 'ko' 
                      ? '파일이 자동으로 다운로드되었습니다' 
                      : 'File has been downloaded automatically'}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="w-full py-4 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  {t.uploadAnother}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── NotebookLM AI Section ── */}
        <div className="mt-10">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 shadow-xl mb-6">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  {locale === 'th' ? 'AI จัดการเอกสาร' : locale === 'ko' ? 'AI 문서 관리' : 'AI Document Intelligence'}
                </div>
                <h2 className="text-2xl font-black text-white mb-1">
                  {locale === 'th' ? 'NotebookLM AI Assistant' : locale === 'ko' ? 'NotebookLM AI 어시스턴트' : 'NotebookLM AI Assistant'}
                </h2>
                <p className="text-purple-100 text-sm max-w-xl leading-relaxed">
                  {locale === 'th'
                    ? 'ใช้ AI ของ Google จัดการเอกสาร สรุปการประชุม และสร้างรายงานอัตโนมัติ — อัปโหลดไฟล์แล้วถามคำถามได้ทันที'
                    : locale === 'ko'
                    ? 'Google AI로 문서 관리, 회의 요약, 보고서 작성 자동화 — 파일 업로드 후 즉시 질문 가능'
                    : 'Use Google AI to manage documents, summarize meetings, and auto-generate reports — upload files and ask questions instantly'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <a
                  href="https://notebooklm.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-purple-700 font-bold text-sm rounded-xl hover:bg-purple-50 transition-all shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  {locale === 'th' ? 'เปิด NotebookLM' : locale === 'ko' ? 'NotebookLM 열기' : 'Open NotebookLM'}
                </a>
                <button
                  onClick={() => setShowNotebookEmbed(!showNotebookEmbed)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-bold text-sm rounded-xl hover:bg-white/30 border border-white/20 transition-all"
                >
                  {showNotebookEmbed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showNotebookEmbed
                    ? (locale === 'th' ? 'ซ่อน' : locale === 'ko' ? '숨기기' : 'Hide')
                    : (locale === 'th' ? 'เปิดในหน้านี้' : locale === 'ko' ? '이 페이지에서 열기' : 'Open Here')}
                </button>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: FileText,
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-100',
                title: locale === 'th' ? 'จัดการเอกสาร' : locale === 'ko' ? '문서 관리' : 'Document Management',
                desc: locale === 'th'
                  ? 'อัปโหลด PDF, Word, TXT หลายไฟล์พร้อมกัน แล้วถาม AI สรุป วิเคราะห์ และค้นหาข้อมูลข้ามเอกสาร'
                  : locale === 'ko'
                  ? 'PDF, Word, TXT 여러 파일을 동시에 업로드하여 AI에게 요약, 분석, 교차 문서 검색 요청'
                  : 'Upload PDF, Word, TXT files simultaneously. Ask AI to summarize, analyze, and search across documents.',
                steps: locale === 'th'
                  ? ['อัปโหลดเอกสาร', 'ถาม AI ในภาษาไทย', 'รับสรุปทันที']
                  : locale === 'ko'
                  ? ['문서 업로드', 'AI에게 한국어로 질문', '즉시 요약 받기']
                  : ['Upload documents', 'Ask AI in any language', 'Get instant summary']
              },
              {
                icon: Mic,
                color: 'from-emerald-500 to-teal-600',
                bg: 'bg-emerald-50',
                border: 'border-emerald-100',
                title: locale === 'th' ? 'สรุปการประชุม' : locale === 'ko' ? '회의 요약' : 'Meeting Summary',
                desc: locale === 'th'
                  ? 'นำ transcript หรือบันทึกการประชุมมาให้ AI สรุปประเด็นสำคัญ การตัดสินใจ และ action items โดยอัตโนมัติ'
                  : locale === 'ko'
                  ? '회의록이나 트랜스크립트를 AI에게 제공하여 주요 사항, 결정 사항, 액션 아이템 자동 요약'
                  : 'Give meeting transcripts or notes to AI for automatic extraction of key points, decisions, and action items.',
                steps: locale === 'th'
                  ? ['วางบันทึกประชุม', 'AI สกัดประเด็น', 'ส่งออกรายงาน']
                  : locale === 'ko'
                  ? ['회의록 붙여넣기', 'AI가 핵심 추출', '보고서 내보내기']
                  : ['Paste meeting notes', 'AI extracts key points', 'Export report']
              },
              {
                icon: BarChart2,
                color: 'from-orange-500 to-amber-500',
                bg: 'bg-orange-50',
                border: 'border-orange-100',
                title: locale === 'th' ? 'ทำรายงาน' : locale === 'ko' ? '보고서 작성' : 'Report Generation',
                desc: locale === 'th'
                  ? 'รวบรวมข้อมูลจากหลายแหล่ง ให้ AI ร่างโครงสร้างรายงาน เขียนเนื้อหา และสรุปผลสำหรับผู้บริหาร'
                  : locale === 'ko'
                  ? '여러 소스의 데이터를 모아 AI가 보고서 구조 초안 작성, 내용 작성 및 경영진을 위한 요약 생성'
                  : 'Aggregate data from multiple sources. Let AI draft report structure, write content, and create executive summaries.',
                steps: locale === 'th'
                  ? ['ใส่แหล่งข้อมูล', 'AI ร่างรายงาน', 'แก้ไขและส่งออก']
                  : locale === 'ko'
                  ? ['데이터 소스 입력', 'AI가 보고서 초안', '편집 후 내보내기']
                  : ['Input data sources', 'AI drafts report', 'Edit and export']
              }
            ].map((card) => (
              <div key={card.title} className={`bg-white rounded-2xl border ${card.border} shadow-sm p-6 hover:shadow-md transition-all`}>
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.color} mb-4`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{card.desc}</p>
                <div className="space-y-1.5">
                  {card.steps.map((s, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs font-medium ${card.bg} rounded-lg px-3 py-1.5`}>
                      <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${card.color} text-white text-xs flex items-center justify-center font-bold shrink-0`}>{i + 1}</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* How-to guide */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-gray-800">
                {locale === 'th' ? 'วิธีใช้งาน NotebookLM กับเอกสาร K Energy Save' : locale === 'ko' ? 'K Energy Save 문서에 NotebookLM 사용 방법' : 'How to Use NotebookLM with K Energy Save Documents'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  num: '01', color: 'bg-violet-100 text-violet-700',
                  title: locale === 'th' ? 'เปิด NotebookLM' : locale === 'ko' ? 'NotebookLM 접속' : 'Open NotebookLM',
                  desc: locale === 'th' ? 'ไปที่ notebooklm.google.com แล้ว Sign in ด้วย Google Account' : locale === 'ko' ? 'notebooklm.google.com 접속 후 구글 계정으로 로그인' : 'Go to notebooklm.google.com and sign in with Google Account'
                },
                {
                  num: '02', color: 'bg-blue-100 text-blue-700',
                  title: locale === 'th' ? 'สร้าง Notebook ใหม่' : locale === 'ko' ? '새 노트북 생성' : 'Create New Notebook',
                  desc: locale === 'th' ? 'คลิก "+ New Notebook" แล้วอัปโหลด PDF รายงาน, บันทึกประชุม หรือเอกสารสัญญา' : locale === 'ko' ? '"+ New Notebook" 클릭 후 보고서 PDF, 회의록, 계약서 업로드' : 'Click "+ New Notebook" then upload report PDFs, meeting notes, or contract documents'
                },
                {
                  num: '03', color: 'bg-emerald-100 text-emerald-700',
                  title: locale === 'th' ? 'ถามคำถาม' : locale === 'ko' ? '질문하기' : 'Ask Questions',
                  desc: locale === 'th' ? 'พิมพ์คำถามเป็นภาษาไทย เช่น "สรุปประเด็นสำคัญจากการประชุมเดือนนี้"' : locale === 'ko' ? '"이번 달 회의에서 중요한 사항 요약해줘" 등 한국어로 질문' : 'Type questions like "Summarize the key points from this month\'s meeting"'
                },
                {
                  num: '04', color: 'bg-amber-100 text-amber-700',
                  title: locale === 'th' ? 'ส่งออกผลลัพธ์' : locale === 'ko' ? '결과 내보내기' : 'Export Results',
                  desc: locale === 'th' ? 'คัดลอกคำตอบ AI ไปใส่ใน Word/Google Docs หรือใช้ฟีเจอร์ "Audio Overview" สำหรับ podcast สรุป' : locale === 'ko' ? 'AI 답변을 Word/Google Docs에 복사하거나 "Audio Overview" 기능으로 요약 팟캐스트 생성' : 'Copy AI answers to Word/Google Docs or use "Audio Overview" for a summary podcast'
                }
              ].map((step) => (
                <div key={step.num} className="flex gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${step.color} flex items-center justify-center font-black text-xs`}>{step.num}</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm mb-1">{step.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt examples */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileEdit className="w-5 h-5 text-green-400" />
              <h3 className="font-bold text-white">
                {locale === 'th' ? 'ตัวอย่าง Prompt ที่ใช้บ่อย' : locale === 'ko' ? '자주 사용하는 프롬프트 예시' : 'Common Prompt Examples'}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  tag: locale === 'th' ? '📋 สรุปประชุม' : locale === 'ko' ? '📋 회의 요약' : '📋 Meeting Summary',
                  prompt: locale === 'th'
                    ? '"สรุปประเด็นสำคัญ การตัดสินใจ และ action items จากการประชุมนี้"'
                    : locale === 'ko'
                    ? '"이 회의에서 주요 사항, 결정 사항, 액션 아이템을 요약해줘"'
                    : '"Summarize the key points, decisions made, and action items from this meeting"'
                },
                {
                  tag: locale === 'th' ? '📊 วิเคราะห์รายงาน' : locale === 'ko' ? '📊 보고서 분석' : '📊 Report Analysis',
                  prompt: locale === 'th'
                    ? '"วิเคราะห์แนวโน้มจากรายงานพลังงาน และแนะนำจุดที่ควรปรับปรุง"'
                    : locale === 'ko'
                    ? '"에너지 보고서의 트렌드를 분석하고 개선이 필요한 부분을 제안해줘"'
                    : '"Analyze trends from the energy report and suggest areas for improvement"'
                },
                {
                  tag: locale === 'th' ? '📝 ร่างรายงาน' : locale === 'ko' ? '📝 보고서 초안' : '📝 Draft Report',
                  prompt: locale === 'th'
                    ? '"ร่างรายงานประจำเดือนสำหรับผู้บริหาร โดยใช้ข้อมูลจากเอกสารที่อัปโหลด"'
                    : locale === 'ko'
                    ? '"업로드된 문서의 데이터를 사용하여 경영진용 월간 보고서 초안 작성해줘"'
                    : '"Draft a monthly executive report using data from the uploaded documents"'
                },
                {
                  tag: locale === 'th' ? '🔍 ค้นหาข้อมูล' : locale === 'ko' ? '🔍 정보 검색' : '🔍 Find Information',
                  prompt: locale === 'th'
                    ? '"ดึงตัวเลขการประหยัดพลังงานทั้งหมดจากเอกสารเหล่านี้มาสรุปในตาราง"'
                    : locale === 'ko'
                    ? '"이 문서들에서 모든 에너지 절감 수치를 추출하여 표로 정리해줘"'
                    : '"Extract all energy savings figures from these documents and organize them in a table"'
                }
              ].map((ex) => (
                <div key={ex.tag} className="bg-slate-700/60 rounded-xl p-4">
                  <p className="text-emerald-400 text-xs font-bold mb-1.5">{ex.tag}</p>
                  <p className="text-gray-300 text-xs leading-relaxed font-mono">{ex.prompt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Embed / Open */}
          {showNotebookEmbed && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-bold text-gray-700">NotebookLM — notebooklm.google.com</span>
                </div>
                <a
                  href="https://notebooklm.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {locale === 'th' ? 'เปิดแบบเต็มจอ' : locale === 'ko' ? '전체 화면으로 열기' : 'Open fullscreen'}
                </a>
              </div>
              <div className="relative" style={{ height: '600px' }}>
                <iframe
                  src="https://notebooklm.google.com"
                  className="w-full h-full border-0"
                  title="NotebookLM"
                  allow="camera; microphone; clipboard-read; clipboard-write"
                  onError={() => {}}
                />
                {/* Fallback overlay (shown if iframe is blocked) */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-indigo-100 flex flex-col items-center justify-center p-8 pointer-events-none opacity-0 hover:opacity-0">
                </div>
              </div>
              <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
                <p className="text-xs text-amber-700">
                  <strong>{locale === 'th' ? 'หมายเหตุ:' : locale === 'ko' ? '참고:' : 'Note:'}</strong>{' '}
                  {locale === 'th'
                    ? 'หาก iframe ไม่โหลด ให้คลิก "เปิดแบบเต็มจอ" เพื่อใช้งานใน tab ใหม่'
                    : locale === 'ko'
                    ? 'iframe이 로드되지 않으면 "전체 화면으로 열기"를 클릭하여 새 탭에서 사용하세요'
                    : 'If the iframe does not load, click "Open fullscreen" to use it in a new tab'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* API Integration Warning */}
        <div className="mt-8 bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white font-bold text-sm">!</span>
            </div>
            <div>
              <h4 className="font-bold text-orange-900 mb-3 text-lg">
                {locale === 'ko' ? '⚠️ 프로덕션 배포 필요 사항' : '⚠️ Production Deployment Requirements'}
              </h4>
              <div className="text-sm text-orange-800 space-y-3">
                <p className="font-semibold">
                  {locale === 'ko' 
                    ? '실제 파일 번역을 위해서는 다음 서비스 연동이 필수입니다:' 
                    : 'For actual file translation, the following service integrations are required:'}
                </p>
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <p className="font-mono text-xs">
                    <strong>1. Translation API:</strong> {locale === 'ko' ? '구글 번역, Azure, OpenAI GPT-4' : 'Google Translate, Azure, OpenAI GPT-4'}
                  </p>
                  <p className="font-mono text-xs">
                    <strong>2. OCR Service:</strong> {locale === 'ko' ? '이미지 텍스트 추출 (Tesseract, Google Cloud Vision)' : 'Extract text from images (Tesseract, Google Cloud Vision)'}
                  </p>
                  <p className="font-mono text-xs">
                    <strong>3. PDF Processing:</strong> {locale === 'ko' ? 'PDF 파싱 및 생성 (pdf-lib, PyPDF2)' : 'Parse & create PDFs (pdf-lib, PyPDF2)'}
                  </p>
                  <p className="font-mono text-xs">
                    <strong>4. Backend API:</strong> {locale === 'ko' ? 'Node.js/Python 서버 엔드포인트' : 'Node.js/Python server endpoint'}
                  </p>
                </div>
                <div className="bg-orange-100 rounded p-3 mt-2">
                  <p className="text-xs font-semibold mb-2">
                    {locale === 'ko' ? '🎯 รองรับไฟล์:' : '🎯 Supported Files:'}
                  </p>
                  <ul className="text-xs space-y-1">
                    <li>✅ <strong>TXT:</strong> {locale === 'ko' ? '번역된 텍스트 파일 반환' : 'Returns translated text file'}</li>
                    <li>✅ <strong>PDF:</strong> {locale === 'ko' ? '텍스트 추출 → 번역 → 새 PDF 생성' : 'Extract text → Translate → Generate new PDF'}</li>
                    <li>✅ <strong>Images (JPG/PNG):</strong> {locale === 'ko' ? 'OCR로 텍스트 추출 → 번역 → PDF 생성' : 'OCR to extract text → Translate → Generate PDF'}</li>
                  </ul>
                  <p className="text-xs mt-2 pt-2 border-t border-orange-200">
                    {locale === 'ko'
                      ? '⚠️ 번역 기능을 사용하려면 Google Cloud Translation API 인증이 필요합니다.'
                      : '⚠️ Translation requires Google Cloud Translation API credentials.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
