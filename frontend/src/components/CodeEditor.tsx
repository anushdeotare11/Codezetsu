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
      className="flex flex-col h-full"
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-container-lowest">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-error/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <span className="text-[10px] text-on-surface-variant font-mono">solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : 'java'}</span>
        </div>

        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="text-xs bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:bg-surface-container-highest transition-colors"
          style={{ border: '1px solid rgba(74,68,85,0.15)' }}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-surface-container text-on-surface">
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
            <div className="flex items-center justify-center h-full bg-surface-container-lowest">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-primary-container border-t-primary rounded-full animate-spin" />
                <span className="text-xs text-on-surface-variant">Loading editor...</span>
              </div>
            </div>
          }
        />
      </div>
    </motion.div>
  );
}
