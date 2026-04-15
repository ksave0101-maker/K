'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const { locale } = useLocale();
  const t = translations[locale];
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if AI is configured
  useEffect(() => {
    async function checkAIStatus() {
      try {
        const response = await fetch('/api/ai/chatbot');
        const data = await response.json();
        setIsConfigured(data.configured);
        
        // Add welcome message
        if (data.configured) {
          setMessages([{
            role: 'assistant',
            content: t.aiWelcomeMessage,
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error('Failed to check AI status:', error);
        setIsConfigured(false);
      }
    }
    
    checkAIStatus();
  }, [t]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          context: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: data.message || t.aiError,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: t.aiError,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([{
      role: 'assistant',
      content: t.aiWelcomeMessage,
      timestamp: new Date(),
    }]);
  };

  const handleExampleClick = (example: string) => {
    setInputMessage(example);
  };

  if (isConfigured === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AI Assistant...</p>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            ← {t.back}
          </Link>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {t.aiNotConfigured}
            </h1>
            <p className="text-gray-600">
              Please add OPENAI_API_KEY to your environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              ← {t.back}
            </Link>
            <div className="flex items-center space-x-3">
              <div className="text-4xl">🤖</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {t.aiChatbotTitle}
                </h1>
                <p className="text-sm text-gray-600">{t.aiChatDescription}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            {t.aiClearChat}
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-500">{t.aiWelcomeMessage}</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-bounce">●</div>
                    <div className="animate-bounce delay-100">●</div>
                    <div className="animate-bounce delay-200">●</div>
                    <span className="ml-2 text-gray-600">{t.aiThinking}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Example Questions */}
          {messages.length <= 1 && !isLoading && (
            <div className="border-t px-6 py-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">{t.aiExampleQuestions}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleExampleClick(t.aiExample1)}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {t.aiExample1}
                </button>
                <button
                  onClick={() => handleExampleClick(t.aiExample2)}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {t.aiExample2}
                </button>
                <button
                  onClick={() => handleExampleClick(t.aiExample3)}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {t.aiExample3}
                </button>
                <button
                  onClick={() => handleExampleClick(t.aiExample4)}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {t.aiExample4}
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.aiPlaceholder}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {t.aiSend}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
