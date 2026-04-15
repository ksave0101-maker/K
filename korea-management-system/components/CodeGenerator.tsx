'use client';

import { useState } from 'react';

export default function CodeGenerator() {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    if (!description.trim() || loading) return;

    setLoading(true);
    setGeneratedCode('');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          language
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedCode(data.code);
    } catch (error: any) {
      console.error('Generation error:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('คัดลอกโค้ดแล้ว!');
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">✨ Code Generator</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              ภาษาโปรแกรม
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              อธิบายโค้ดที่ต้องการ
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายโค้ดที่คุณต้องการ เช่น: 'สร้างฟังก์ชันสำหรับคำนวณยอดรวมในตะกร้าสินค้า'"
              className="w-full h-96 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={generateCode}
            disabled={loading || !description.trim()}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'กำลังสร้างโค้ด...' : 'สร้างโค้ด'}
          </button>
        </div>

        {/* Output Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">
              โค้ดที่สร้างแล้ว
            </label>
            {generatedCode && (
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                📋 คัดลอก
              </button>
            )}
          </div>
          <div className="h-[500px] p-4 border rounded-lg bg-gray-900 text-green-400 overflow-y-auto font-mono text-sm">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                  <p className="mt-2">กำลังสร้างโค้ด...</p>
                </div>
              </div>
            ) : generatedCode ? (
              <pre className="whitespace-pre-wrap">{generatedCode}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                โค้ดที่สร้างจะแสดงที่นี่
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
