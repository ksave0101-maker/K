/**
 * AI Configuration for Korea Management System
 * 
 * This file contains all AI-related configurations including:
 * - OpenAI API setup
 * - AI models selection
 * - System prompts for different features
 * - AI behavior settings
 */

import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// AI Models
export const AI_MODELS = {
  // GPT-4 - Most capable, best for complex tasks
  GPT4: 'gpt-4-turbo-preview',
  GPT4_MINI: 'gpt-4-1106-preview',
  
  // GPT-3.5 - Faster, cheaper, good for simple tasks
  GPT35: 'gpt-3.5-turbo',
  GPT35_16K: 'gpt-3.5-turbo-16k',
};

// System Prompts for different AI features
export const AI_PROMPTS = {
  // General chatbot assistant
  CHATBOT: `You are a helpful AI assistant for Korea Management System.
You help employees with:
- System navigation and usage
- Company policies and procedures
- Department information
- Branch office information (Korea, Brunei, Thailand, Vietnam)
- Document management
- General business questions

Always respond professionally, concisely, and in the language the user is speaking.
If you don't know something, say so honestly.`,

  // Document analysis
  DOCUMENT_ANALYZER: `You are an AI document analyzer.
Your task is to:
- Extract key information from documents
- Summarize content accurately
- Identify important dates, numbers, and entities
- Categorize document type
- Extract action items and follow-ups

Provide clear, structured analysis in JSON format when requested.`,

  // Translation improvement
  TRANSLATION: `You are a professional translator specializing in business documents.
Translate the text naturally while preserving:
- Original meaning and intent
- Technical terminology
- Business tone and formality
- Cultural context

Supported languages: Thai, Chinese, English, Korean, Vietnamese, Malay.
Provide natural, fluent translations that sound native.`,

  // Chat assistant for branch offices
  CHAT_ASSISTANT: `You are an AI assistant helping with inter-branch communication.
You help with:
- Language translation and clarification
- Department routing (which department to contact)
- Information about company structure
- Common business procedures
- Time zone and scheduling assistance

Be helpful, professional, and culturally aware.`,

  // Analytics and insights
  ANALYTICS: `You are a business analytics AI.
You analyze company data to provide:
- Trends and patterns
- Performance insights
- Predictive analytics
- Recommendations for improvement
- Risk assessments

Present insights clearly with supporting data and actionable recommendations.`,
};

// AI Configuration Settings
export const AI_CONFIG = {
  // Temperature (0-2): Higher = more creative, Lower = more focused
  TEMPERATURE: {
    CHATBOT: 0.7,
    TRANSLATION: 0.3,
    DOCUMENT_ANALYSIS: 0.5,
    CHAT_ASSISTANT: 0.7,
    ANALYTICS: 0.4,
  },
  
  // Max tokens for responses
  MAX_TOKENS: {
    CHATBOT: 500,
    TRANSLATION: 2000,
    DOCUMENT_ANALYSIS: 1500,
    CHAT_ASSISTANT: 400,
    ANALYTICS: 1000,
  },
  
  // Context window sizes
  CONTEXT_LENGTH: {
    CHATBOT: 10, // Remember last 10 messages
    CHAT_ASSISTANT: 5, // Remember last 5 messages
  },
};

// Language mappings
export const LANGUAGE_CODES = {
  ko: 'Korean',
  en: 'English',
  th: 'Thai',
  zh: 'Chinese',
  vi: 'Vietnamese',
  ms: 'Malay',
} as const;

// Department information for AI context
export const DEPARTMENT_INFO = {
  executive: {
    name: 'Executive Department',
    nameKo: '경영진',
    responsibilities: ['Strategic planning', 'Company direction', 'Major decisions'],
  },
  hr: {
    name: 'HR & Accounting Department',
    nameKo: 'HR & 회계',
    responsibilities: ['Employee management', 'Payroll', 'Benefits', 'Financial records'],
  },
  production: {
    name: 'Production & Logistics Department',
    nameKo: '생산 & 물류',
    responsibilities: ['Manufacturing', 'Supply chain', 'Inventory', 'Shipping'],
  },
  'international-market': {
    name: 'International Market Department',
    nameKo: '국제 시장',
    responsibilities: ['Global sales', 'International partnerships', 'Export'],
  },
  'domestic-market': {
    name: 'Domestic Market Department',
    nameKo: '국내 시장',
    responsibilities: ['Local sales', 'Domestic partnerships', 'Distribution'],
  },
  'quality-control': {
    name: 'Quality Control Department',
    nameKo: '품질 관리',
    responsibilities: ['Product testing', 'Quality assurance', 'Compliance'],
  },
  'after-sales': {
    name: 'After-Sales Service Department',
    nameKo: '애프터 서비스',
    responsibilities: ['Customer support', 'Warranty', 'Repairs', 'Complaints'],
  },
  maintenance: {
    name: 'Maintenance Department',
    nameKo: '유지 보수',
    responsibilities: ['Equipment maintenance', 'Facility management', 'Repairs'],
  },
  'research-development': {
    name: 'Research & Development Department',
    nameKo: 'R&D',
    responsibilities: ['Innovation', 'Product development', 'Research'],
  },
} as const;

// Branch information for AI context
export const BRANCH_INFO = {
  'brunei-chat': {
    name: 'Brunei Office',
    country: 'Brunei',
    language: 'Malay',
    timezone: 'Asia/Brunei',
  },
  'thailand-chat': {
    name: 'Thailand Office',
    country: 'Thailand',
    language: 'Thai',
    timezone: 'Asia/Bangkok',
  },
  'vietnam-chat': {
    name: 'Vietnam Office',
    country: 'Vietnam',
    language: 'Vietnamese',
    timezone: 'Asia/Ho_Chi_Minh',
  },
} as const;

// Check if AI is configured
export function isAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// Get AI availability status
export function getAIStatus() {
  const configured = isAIConfigured();
  return {
    available: configured,
    message: configured 
      ? 'AI services are available' 
      : 'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.',
    features: {
      chatbot: configured,
      translation: configured,
      documentAnalysis: configured,
      chatAssistant: configured,
      analytics: configured,
    },
  };
}
