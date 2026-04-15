"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';

export default function NewProjectPage() {
  const { locale } = useLocale();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    const raw = localStorage.getItem('rd-projects');
    const projects = raw ? JSON.parse(raw) : [];
    const id = Date.now();
    projects.push({ id, title, description, created_at: new Date().toISOString() });
    localStorage.setItem('rd-projects', JSON.stringify(projects));
    router.push('/research-development/active-projects');
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{locale === 'ko' ? 'สร้างโครงการ R&D ใหม่' : 'Create New R&D Project'}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? 'ชื่อโครงการ' : 'Project Title'}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{locale === 'ko' ? 'รายละเอียด' : 'Description'}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded h-32" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded">{locale === 'ko' ? 'สร้าง' : 'Create'}</button>
          <button onClick={() => router.back()} className="px-4 py-2 border rounded">{locale === 'ko' ? 'ยกเลิก' : 'Cancel'}</button>
        </div>
      </div>
    </div>
  )
}
