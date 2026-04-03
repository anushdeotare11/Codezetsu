'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  onLanguageChange: (lang: string) => void;
}

const languages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
];

export default function CodeEditor({ language, value, onChange, onLanguageChange }: CodeEditorProps) {
  const monacoLangMap: Record<string, string> = {
    python: 'python',
    javascript: 'javascript',
    cpp: 'cpp',
    java: 'java',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full editor-glow-container"
    >
      {/* Editor Header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: 'rgba(7, 10, 18, 0.9)',
          borderBottom: '1px solid rgba(79,156,249,0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#FF6B6B' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#FBBF24' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#4ADE80' }} />
          </div>
          <span className="text-[10px] text-on-surface-variant font-mono">solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : 'java'}</span>
        </div>

        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer transition-colors"
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            color: '#E2E8F0',
            border: '1px solid rgba(79,156,249,0.1)',
          }}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value} style={{ background: '#111827', color: '#E2E8F0' }}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={monacoLangMap[language] || 'python'}
          value={value}
          onChange={(val) => onChange(val || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
            renderLineHighlight: 'line',
            wordWrap: 'on',
            tabSize: 4,
            automaticLayout: true,
          }}
          loading={
            <div className="flex items-center justify-center h-full" style={{ background: '#070A12' }}>
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-t-primary rounded-full animate-spin" style={{ borderColor: 'rgba(79,156,249,0.15)', borderTopColor: '#4F9CF9' }} />
                <span className="text-xs text-on-surface-variant">Initializing editor...</span>
              </div>
            </div>
          }
        />
      </div>
    </motion.div>
  );
}
