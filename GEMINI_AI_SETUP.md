# 🤖 Google Gemini AI Integration

## ภาพรวม

ระบบ Gemini AI ที่ถูก integrate เข้ากับ Korea Management System โดยใช้ Google Gemini 1.5 Pro Model

## ✨ Features

### 1. 💬 Chat Assistant
- สนทนาแบบต่อเนื่องกับ AI
- มี conversation history
- ตอบคำถามได้หลากหลายหัวข้อ

### 2. 🔍 Code Analyzer
- วิเคราะห์โค้ดและให้คำแนะนำ
- ตรวจสอบคุณภาพโค้ด
- ค้นหาจุดอ่อนด้านความปลอดภัย
- รองรับหลายภาษา (TypeScript, JavaScript, Python, Java, C++, C#, Go, Rust)

### 3. ✨ Code Generator
- สร้างโค้ดจากคำอธิบาย
- มี error handling และ type definitions
- มีตัวอย่างการใช้งาน

### 4. 🔧 Code Fixer
- แก้ไขโค้ดที่มีบั๊ก
- อธิบายสาเหตุและวิธีแก้ไข

### 5. 🌍 Translator
- แปลข้อความหลายภาษา
- แปลตามบริบทอย่างเป็นธรรมชาติ

## 📦 Installation

### 1. ติดตั้ง Dependencies

\`\`\`bash
npm install @google/generative-ai
\`\`\`

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ \`.env.local\` และเพิ่ม:

\`\`\`env
GOOGLE_AI_API_KEY=your_api_key_here
NEXT_PUBLIC_GEMINI_ENABLED=true
\`\`\`

### 3. รับ API Key

1. ไปที่ [Google AI Studio](https://makersuite.google.com/app/apikey)
2. สร้าง API key ใหม่
3. คัดลอกและใส่ใน `.env.local`

### 4. รัน Development Server

\`\`\`bash
npm run dev
\`\`\`

## 🚀 Usage

### เข้าใช้งานผ่าน Web Interface

เปิดเบราว์เซอร์และไปที่:
\`\`\`
http://localhost:3002/gemini-ai
\`\`\`

### ใช้งานผ่าน API

#### 1. Chat API

\`\`\`typescript
const response = await fetch('/api/gemini/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'สวัสดีครับ',
    history: [] // Optional: conversation history
  }),
});

const data = await response.json();
console.log(data.response);
\`\`\`

#### 2. Analyze Code API

\`\`\`typescript
const response = await fetch('/api/gemini/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: 'function hello() { console.log("Hello"); }',
    language: 'javascript'
  }),
});

const data = await response.json();
console.log(data.analysis);
\`\`\`

#### 3. Generate Code API

\`\`\`typescript
const response = await fetch('/api/gemini/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    description: 'สร้างฟังก์ชันสำหรับคำนวณยอดรวมในตะกร้าสินค้า',
    language: 'typescript'
  }),
});

const data = await response.json();
console.log(data.code);
\`\`\`

#### 4. Fix Code API

\`\`\`typescript
const response = await fetch('/api/gemini/fix', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: 'const sum = (a, b) => a + b;',
    errorMessage: 'Parameter implicitly has any type',
    language: 'typescript'
  }),
});

const data = await response.json();
console.log(data.fixedCode);
\`\`\`

#### 5. Translate API

\`\`\`typescript
const response = await fetch('/api/gemini/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Hello, how are you?',
    targetLanguage: 'ไทย'
  }),
});

const data = await response.json();
console.log(data.translatedText);
\`\`\`

## 📚 Library Functions

### ใช้งาน Gemini Library โดยตรง

\`\`\`typescript
import {
  generateContent,
  sendChatMessage,
  analyzeCode,
  generateCode,
  fixCode,
  translateText,
  explainConcept
} from '@/lib/gemini';

// Simple generation
const result = await generateContent('อธิบาย React คืออะไร');
console.log(result.text);

// Chat with history
const chatResult = await sendChatMessage('สวัสดี', []);
console.log(chatResult.text);

// Analyze code
const analysis = await analyzeCode('const x = 1;', 'javascript');
console.log(analysis.text);

// Generate code
const generatedCode = await generateCode(
  'สร้างฟังก์ชันคำนวณ factorial',
  'typescript'
);
console.log(generatedCode.text);

// Fix code
const fixed = await fixCode(
  'const sum = (a, b) => a + b;',
  'Missing types',
  'typescript'
);
console.log(fixed.text);

// Translate
const translated = await translateText('Hello', 'ไทย');
console.log(translated.text);

// Explain concept
const explanation = await explainConcept('Machine Learning');
console.log(explanation.text);
\`\`\`

## 🎨 Components

### ใช้ Components สำเร็จรูป

\`\`\`tsx
import GeminiChat from '@/components/GeminiChat';
import CodeAnalyzer from '@/components/CodeAnalyzer';
import CodeGenerator from '@/components/CodeGenerator';

export default function MyPage() {
  return (
    <div>
      <GeminiChat />
      <CodeAnalyzer />
      <CodeGenerator />
    </div>
  );
}
\`\`\`

## 📁 File Structure

\`\`\`
korea-management-system/
├── .env.local                          # Environment variables (API Key)
├── lib/
│   └── gemini.ts                       # Gemini AI service library
├── app/
│   ├── api/
│   │   └── gemini/
│   │       ├── chat/route.ts           # Chat API endpoint
│   │       ├── analyze/route.ts        # Code analysis endpoint
│   │       ├── generate/route.ts       # Code generation endpoint
│   │       ├── fix/route.ts            # Code fix endpoint
│   │       └── translate/route.ts      # Translation endpoint
│   └── gemini-ai/
│       └── page.tsx                    # Gemini AI demo page
└── components/
    ├── GeminiChat.tsx                  # Chat component
    ├── CodeAnalyzer.tsx                # Code analyzer component
    └── CodeGenerator.tsx               # Code generator component
\`\`\`

## ⚙️ Configuration

### Model Settings

แก้ไขใน \`lib/gemini.ts\`:

\`\`\`typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro' // Change model here
});

// Chat configuration
const chat = model.startChat({
  history: formattedHistory,
  generationConfig: {
    maxOutputTokens: 2048,  // Max tokens
    temperature: 0.9,        // Creativity (0-1)
  },
});
\`\`\`

## 🔒 Security

- **ห้ามเปิดเผย API Key** - เก็บไว้ใน `.env.local` เท่านั้น
- **ไม่ commit `.env.local`** - เพิ่มใน `.gitignore`
- **Rate Limiting** - ควรเพิ่ม rate limiting สำหรับ production
- **Input Validation** - ตรวจสอบ input ก่อนส่งไปยัง API

## 📊 API Limits

- **Free Tier**: 60 requests/minute
- **Response Size**: ขึ้นอยู่กับ model
- **Token Limits**: ตรวจสอบที่ [Google AI Pricing](https://ai.google.dev/pricing)

## 🐛 Troubleshooting

### API Key ไม่ทำงาน
1. ตรวจสอบว่า API Key ถูกต้อง
2. ตรวจสอบว่าเปิดใช้งาน Gemini API แล้ว
3. ตรวจสอบ quota remaining

### Module Not Found
\`\`\`bash
npm install @google/generative-ai
\`\`\`

### TypeScript Errors
\`\`\`bash
npm run lint
\`\`\`

## 🔗 Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Node.js SDK](https://github.com/google/generative-ai-js)

## 📝 License

MIT License - ใช้งานได้อย่างอิสระ

## 👨‍💻 Support

หากมีปัญหาหรือคำถาม:
1. ตรวจสอบ console logs
2. ดู error messages
3. อ่าน documentation
4. ติดต่อทีมพัฒนา

---

**Created with ❤️ for Korea Management System**
