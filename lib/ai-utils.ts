/**
 * AI Utility Functions
 * 
 * Helper functions for AI operations:
 * - Chat completion
 * - Translation
 * - Document analysis
 * - Text summarization
 */

import { openai, AI_MODELS, AI_PROMPTS, AI_CONFIG, LANGUAGE_CODES } from './ai-config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * General AI chat completion
 */
export async function askAI(
  userMessage: string,
  systemPrompt: string = AI_PROMPTS.CHATBOT,
  context: ChatMessage[] = [],
  model: string = AI_MODELS.GPT35
): Promise<AIResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context,
      { role: 'user', content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model,
      messages: messages as any,
      temperature: AI_CONFIG.TEMPERATURE.CHATBOT,
      max_tokens: AI_CONFIG.MAX_TOKENS.CHATBOT,
    });

    const answer = response.choices[0]?.message?.content || '';
    
    return {
      success: true,
      data: answer,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error('AI Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * AI-powered translation (better than Google Translate)
 */
export async function translateWithAI(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<AIResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const targetLangName = LANGUAGE_CODES[targetLanguage as keyof typeof LANGUAGE_CODES] || targetLanguage;
    const sourceLangName = sourceLanguage 
      ? LANGUAGE_CODES[sourceLanguage as keyof typeof LANGUAGE_CODES] || sourceLanguage
      : 'auto-detect';

    const prompt = `Translate the following text ${sourceLanguage ? `from ${sourceLangName}` : ''} to ${targetLangName}.
Maintain the original meaning, tone, and formatting.
Only return the translation, no explanation.

Text to translate:
${text}`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT35,
      messages: [
        { role: 'system', content: AI_PROMPTS.TRANSLATION },
        { role: 'user', content: prompt },
      ],
      temperature: AI_CONFIG.TEMPERATURE.TRANSLATION,
      max_tokens: AI_CONFIG.MAX_TOKENS.TRANSLATION,
    });

    const translation = response.choices[0]?.message?.content || '';
    
    return {
      success: true,
      data: translation.trim(),
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error('Translation Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze document content
 */
export async function analyzeDocument(
  documentText: string,
  analysisType: 'summary' | 'extract' | 'categorize' = 'summary'
): Promise<AIResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    
    switch (analysisType) {
      case 'summary':
        prompt = `Provide a concise summary of this document in bullet points:

${documentText}`;
        break;
      
      case 'extract':
        prompt = `Extract key information from this document:
- Important dates
- Key people/organizations
- Numbers and statistics
- Action items
- Decisions made

Document:
${documentText}`;
        break;
      
      case 'categorize':
        prompt = `Analyze and categorize this document:
- Document type (e.g., invoice, report, memo, contract)
- Main topic/subject
- Priority level (high/medium/low)
- Required action (if any)

Document:
${documentText}`;
        break;
    }

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT35,
      messages: [
        { role: 'system', content: AI_PROMPTS.DOCUMENT_ANALYZER },
        { role: 'user', content: prompt },
      ],
      temperature: AI_CONFIG.TEMPERATURE.DOCUMENT_ANALYSIS,
      max_tokens: AI_CONFIG.MAX_TOKENS.DOCUMENT_ANALYSIS,
    });

    const analysis = response.choices[0]?.message?.content || '';
    
    return {
      success: true,
      data: analysis,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error('Document Analysis Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Chat assistant for branch communications
 */
export async function chatAssistant(
  userMessage: string,
  branchContext: string,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const contextualPrompt = `${AI_PROMPTS.CHAT_ASSISTANT}

Current context: Communication with ${branchContext}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: contextualPrompt },
      ...conversationHistory.slice(-AI_CONFIG.CONTEXT_LENGTH.CHAT_ASSISTANT),
      { role: 'user', content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT35,
      messages: messages as any,
      temperature: AI_CONFIG.TEMPERATURE.CHAT_ASSISTANT,
      max_tokens: AI_CONFIG.MAX_TOKENS.CHAT_ASSISTANT,
    });

    const answer = response.choices[0]?.message?.content || '';
    
    return {
      success: true,
      data: answer,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error('Chat Assistant Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate business insights from data
 */
export async function generateInsights(
  dataDescription: string,
  dataPoints: any[]
): Promise<AIResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze the following business data and provide insights:

Context: ${dataDescription}

Data:
${JSON.stringify(dataPoints, null, 2)}

Provide:
1. Key trends
2. Notable patterns
3. Potential concerns
4. Recommendations`;

    const response = await openai.chat.completions.create({
      model: AI_MODELS.GPT35,
      messages: [
        { role: 'system', content: AI_PROMPTS.ANALYTICS },
        { role: 'user', content: prompt },
      ],
      temperature: AI_CONFIG.TEMPERATURE.ANALYTICS,
      max_tokens: AI_CONFIG.MAX_TOKENS.ANALYTICS,
    });

    const insights = response.choices[0]?.message?.content || '';
    
    return {
      success: true,
      data: insights,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error('Insights Generation Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Stream AI responses (for real-time chat)
 */
export async function streamAIResponse(
  userMessage: string,
  systemPrompt: string = AI_PROMPTS.CHATBOT,
  onChunk: (chunk: string) => void,
  model: string = AI_MODELS.GPT35
): Promise<AIResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: AI_CONFIG.TEMPERATURE.CHATBOT,
      max_tokens: AI_CONFIG.MAX_TOKENS.CHATBOT,
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        onChunk(content);
      }
    }

    return {
      success: true,
      data: fullResponse,
    };
  } catch (error) {
    console.error('Streaming Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
