'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Problem } from '@/lib/mockData';

interface ProblemPanelProps {
  problem: Problem;
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const badgeClass = `badge-${difficulty}`;
  return (
    <span className={`${badgeClass} px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider`}>
      {difficulty === 'boss' ? '⚔️ Boss' : difficulty}
    </span>
  );
}

export default function ProblemPanel({ problem }: ProblemPanelProps) {
  const [showHints, setShowHints] = useState(false);

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Title & Difficulty */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="text-[10px] text-on-surface-variant/50">#{problem.id}</span>
        </div>
        <h1
          className="text-xl font-bold text-on-surface"
          style={{ fontFamily: 'Space Grotesk' }}
        >
          {problem.title}
        </h1>
      </div>

      {/* Topic Tags */}
      <div className="flex flex-wrap gap-1.5">
        {problem.topics.map((topic) => (
          <span
            key={topic}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium text-primary"
            style={{
              background: 'rgba(79,156,249,0.08)',
              border: '1px solid rgba(79,156,249,0.08)',
            }}
          >
            <Tag className="w-2.5 h-2.5" />
            {topic.replace('_', ' ')}
          </span>
        ))}
      </div>

      {/* Description */}
      <div className="prose prose-invert prose-sm max-w-none">
        {problem.description.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={i} className="font-semibold text-on-surface text-sm mt-3">{line.replace(/\*\*/g, '')}</p>;
          }
          if (line.startsWith('- ')) {
            return <p key={i} className="text-on-surface-variant text-sm ml-3">• {line.slice(2)}</p>;
          }
          if (line.includes('`')) {
            const parts = line.split('`');
            return (
              <p key={i} className="text-on-surface-variant text-sm">
                {parts.map((part, j) =>
                  j % 2 === 1 ? (
                    <code key={j} className="px-1.5 py-0.5 rounded-md text-primary font-mono text-xs" style={{ background: 'rgba(79,156,249,0.08)' }}>
                      {part}
                    </code>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </p>
            );
          }
          if (line.trim() === '') return <div key={i} className="h-2" />;
          return <p key={i} className="text-on-surface-variant text-sm leading-relaxed">{line}</p>;
        })}
      </div>

      {/* Examples */}
      {problem.examples.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-on-surface label-competitive">Examples</h3>
          {problem.examples.map((ex, i) => (
            <div
              key={i}
              className="rounded-xl p-3 space-y-1.5"
              style={{
                background: 'rgba(7,10,18,0.6)',
                border: '1px solid rgba(79,156,249,0.04)',
              }}
            >
              <div className="flex gap-2"><span className="text-[10px] text-on-surface-variant shrink-0">Input:</span><code className="text-xs text-primary font-mono">{ex.input}</code></div>
              <div className="flex gap-2"><span className="text-[10px] text-on-surface-variant shrink-0">Output:</span><code className="text-xs text-success font-mono">{ex.output}</code></div>
              {ex.explanation && <p className="text-[10px] text-on-surface-variant italic">💡 {ex.explanation}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Hints */}
      {problem.hints.length > 0 && (
        <div>
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            {showHints ? 'Hide Hints' : `Show Hints (${problem.hints.length})`}
            {showHints ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <AnimatePresence>
            {showHints && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2 space-y-2"
              >
                {problem.hints.map((hint, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex gap-2 p-2.5 rounded-xl"
                    style={{
                      background: 'rgba(79,156,249,0.05)',
                      border: '1px solid rgba(79,156,249,0.06)',
                    }}
                  >
                    <span className="text-xs text-primary font-bold shrink-0">#{i + 1}</span>
                    <p className="text-xs text-on-surface-variant">{hint}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
