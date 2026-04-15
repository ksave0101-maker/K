'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, Image, Globe, Download, Check, X } from 'lucide-react';
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
