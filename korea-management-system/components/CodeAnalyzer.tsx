'use client';

import { useState } from 'react';

export default function CodeAnalyzer() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeCode = async () => {
    if (!code.trim() || loading) return;

    setLoading(true);
    setAnalysis('');

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
    } catch (error: any) {
      console.error('Analysis error:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">🔍 Code Analyzer</h2>

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
              โค้ดที่ต้องการวิเคราะห์
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="วางโค้ดของคุณที่นี่..."
              className="w-full h-96 p-3 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={analyzeCode}
            disabled={loading || !code.trim()}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์โค้ด'}
          </button>
        </div>

        {/* Output Section */}
        <div>
          <label className="block text-sm font-medium mb-2">
            ผลการวิเคราะห์
          </label>
          <div className="h-[500px] p-4 border rounded-lg bg-gray-50 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">กำลังวิเคราะห์...</p>
                </div>
              </div>
            ) : analysis ? (
              <div className="whitespace-pre-wrap">{analysis}</div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                ผลการวิเคราะห์จะแสดงที่นี่
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
