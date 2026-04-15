import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const apiKey = process.env.GOOGLE_AI_API_KEY || '';

if (!apiKey) {
  console.warn('Warning: GOOGLE_AI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * Generate content from a single prompt
 */
export async function generateContent(prompt: string): Promise<GeminiResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return { text };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return { 
      text: '', 
      error: error.message || 'Failed to generate content' 
    };
  }
}

/**
 * Start a chat session with conversation history
 */
export async function startChat(history: ChatMessage[] = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Convert history to Gemini format
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts }]
    }));
    
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9,
      },
    });
    
    return chat;
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    throw error;
  }
}

/**
 * Send a message in an ongoing chat session
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<GeminiResponse> {
  try {
    const chat = await startChat(history);
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    return { text };
  } catch (error: any) {
    console.error('Gemini Chat Message Error:', error);
    return { 
      text: '', 
      error: error.message || 'Failed to send message' 
    };
  }
}

/**
 * Analyze code and provide suggestions
 */
export async function analyzeCode(
  code: string,
  language: string = 'typescript'
): Promise<GeminiResponse> {
  const prompt = `
วิเคราะห์โค้ด ${language} ต่อไปนี้และให้คำแนะนำ:

\`\`\`${language}
${code}
\`\`\`

กรุณาให้:
1. สรุปสิ่งที่โค้ดทำ
2. ข้อดีและข้อเสีย
3. คำแนะนำในการปรับปรุง
4. ปัญหาด้านความปลอดภัยที่อาจเกิดขึ้น (ถ้ามี)
5. คะแนนคุณภาพโค้ด (1-10)
`;
  
  return generateContent(prompt);
}

/**
 * Generate documentation for code
 */
export async function generateDocumentation(code: string): Promise<GeminiResponse> {
  const prompt = `
สร้างเอกสารสำหรับโค้ดต่อไปนี้ในรูปแบบที่อ่านง่าย:

\`\`\`typescript
${code}
\`\`\`

กรุณารวม:
1. คำอธิบายฟังก์ชัน/คอมโพเนนต์
2. Parameters และ Return values
3. ตัวอย่างการใช้งาน
4. หมายเหตุเพิ่มเติม (ถ้ามี)
`;
  
  return generateContent(prompt);
}

/**
 * Get suggestions for improvement based on description
 */
export async function getSuggestions(description: string): Promise<GeminiResponse> {
  const prompt = `
จากสถานการณ์ต่อไปนี้:
${description}

กรุณาแนะนำวิธีการปรับปรุงและพัฒนา พร้อมเหตุผลและตัวอย่างการทำงาน
`;
  
  return generateContent(prompt);
}

/**
 * Generate code from description
 */
export async function generateCode(
  description: string,
  language: string = 'typescript'
): Promise<GeminiResponse> {
  const prompt = `
สร้างโค้ด ${language} ตามคำอธิบายนี้:
${description}

โปรดให้:
1. โค้ดที่สมบูรณ์และใช้งานได้
2. คอมเมนต์อธิบายส่วนสำคัญ
3. Type definitions (สำหรับ TypeScript)
4. Error handling
5. ตัวอย่างการใช้งาน
`;
  
  return generateContent(prompt);
}

/**
 * Fix buggy code
 */
export async function fixCode(
  code: string,
  errorMessage: string,
  language: string = 'typescript'
): Promise<GeminiResponse> {
  const prompt = `
โค้ด ${language} นี้มีปัญหา:

\`\`\`${language}
${code}
\`\`\`

Error Message:
${errorMessage}

กรุณา:
1. ระบุสาเหตุของปัญหา
2. แก้ไขโค้ดให้ถูกต้อง
3. อธิบายสิ่งที่แก้ไข
4. ให้โค้ดที่แก้ไขแล้วพร้อมใช้งาน
`;
  
  return generateContent(prompt);
}

/**
 * Translate text to another language
 */
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<GeminiResponse> {
  const prompt = `
แปลข้อความต่อไปนี้เป็นภาษา${targetLanguage}:

${text}

กรุณาแปลอย่างเป็นธรรมชาติและเหมาะสมกับบริบท
`;
  
  return generateContent(prompt);
}

/**
 * Explain technical concept
 */
export async function explainConcept(concept: string): Promise<GeminiResponse> {
  const prompt = `
อธิบายแนวคิด/เทคโนโลยีนี้อย่างละเอียดเป็นภาษาไทย:
${concept}

กรุณาอธิบาย:
1. คำจำกัดความ
2. วิธีการทำงาน
3. ตัวอย่างการใช้งาน
4. ข้อดีและข้อเสีย
5. กรณีการใช้งานที่แนะนำ
`;
  
  return generateContent(prompt);
}

export default {
  generateContent,
  startChat,
  sendChatMessage,
  analyzeCode,
  generateDocumentation,
  getSuggestions,
  generateCode,
  fixCode,
  translateText,
  explainConcept,
};
