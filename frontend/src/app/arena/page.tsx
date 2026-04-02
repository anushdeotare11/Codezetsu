'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Loader2, CheckCircle2, XCircle, AlertCircle, ChevronRight, ChevronLeft, Skull
} from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import ProblemPanel from '@/components/ProblemPanel';
import BossFight from '@/components/BossFight';
import { mockProblems } from '@/lib/mockData';

export default function ArenaPage() {
  const [selectedProblemIdx, setSelectedProblemIdx] = useState(0);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<null | {
    status: string;
    passed: number;
    total: number;
    score: number;
    feedback: string;
  }>(null);
  const [showBossFight, setShowBossFight] = useState(false);
  const [showProblemList, setShowProblemList] = useState(false);

  const problem = mockProblems[selectedProblemIdx];

  // Set starter code when problem or language changes
  React.useEffect(() => {
    const starter = problem.starterCode[language] || '// Start coding...';
    setCode(starter);
    setResult(null);
  }, [selectedProblemIdx, language, problem.starterCode]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResult(null);

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock result
    const mockResult = {
      status: Math.random() > 0.3 ? 'accepted' : 'wrong_answer',
      passed: Math.random() > 0.3 ? problem.testCases.length : Math.floor(Math.random() * problem.testCases.length),
      total: problem.testCases.length,
      score: Math.floor(Math.random() * 4) + 6,
      feedback: 'Good approach! Consider optimizing your solution for better time complexity. The hash map pattern is well-implemented.',
    };
    mockResult.passed = mockResult.status === 'accepted' ? mockResult.total : mockResult.passed;

    setResult(mockResult);
    setIsSubmitting(false);
  };

  const selectProblem = (idx: number) => {
    if (mockProblems[idx].difficulty === 'boss') {
      setShowBossFight(true);
      setSelectedProblemIdx(idx);
    } else {
      setSelectedProblemIdx(idx);
    }
    setShowProblemList(false);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Boss Fight Modal */}
      {showBossFight && (
        <BossFight
          problem={problem}
          onAccept={() => setShowBossFight(false)}
          onDecline={() => {
            setShowBossFight(false);
            setSelectedProblemIdx(0);
          }}
        />
      )}

      {/* Arena Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-container-low shrink-0"
        style={{ borderBottom: '1px solid rgba(74,68,85,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProblemList(!showProblemList)}
            className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
          >
            {showProblemList ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Problems
          </button>
          <div className="h-4 w-px bg-outline-variant/20" />
          <div className="flex items-center gap-2">
            <span className={`badge-${problem.difficulty} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}>
              {problem.difficulty === 'boss' ? '⚔️ Boss' : problem.difficulty}
            </span>
            <span className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Space Grotesk' }}>
              {problem.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${
              isSubmitting
                ? 'bg-surface-container-high text-on-surface-variant cursor-wait'
                : 'btn-primary'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Submit
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Problem List Sidebar */}
        <AnimatePresence>
          {showProblemList && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 bg-surface-container-low overflow-y-auto"
              style={{ borderRight: '1px solid rgba(74,68,85,0.15)' }}
            >
              <div className="p-3 space-y-1">
                <p className="label-competitive px-2 py-1.5">Select Challenge</p>
                {mockProblems.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => selectProblem(i)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                      i === selectedProblemIdx
                        ? 'bg-primary-container/15 sidebar-active'
                        : 'hover:bg-surface-container-high/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`badge-${p.difficulty} px-1.5 py-0 rounded text-[9px] font-bold uppercase`}>
                        {p.difficulty === 'boss' ? '⚔️' : p.difficulty.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-xs font-medium text-on-surface truncate">{p.title}</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {p.topics.slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded">
                          {t.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Split Pane: Problem | Editor */}
        <div className="flex-1 flex min-h-0">
          {/* Problem Panel */}
          <div className="w-[40%] shrink-0 bg-surface-container-low overflow-hidden"
            style={{ borderRight: '1px solid rgba(74,68,85,0.15)' }}
          >
            <ProblemPanel problem={problem} />
          </div>

          {/* Editor + Results */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Code Editor */}
            <div className="flex-1 min-h-0">
              <CodeEditor
                language={language}
                value={code}
                onChange={setCode}
                onLanguageChange={setLanguage}
              />
            </div>

            {/* Results Panel */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="shrink-0 overflow-hidden bg-surface-container-lowest"
                  style={{ borderTop: '1px solid rgba(74,68,85,0.15)' }}
                >
                  <div className="p-4">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {result.status === 'accepted' ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-error" />
                        )}
                        <span className={`text-sm font-bold ${result.status === 'accepted' ? 'text-success' : 'text-error'}`}>
                          {result.status === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {result.passed}/{result.total} test cases passed
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="label-competitive">AI Score</span>
                        <span className="text-lg font-bold text-secondary" style={{ fontFamily: 'Space Grotesk' }}>
                          {result.score}/10
                        </span>
                      </div>
                    </div>

                    {/* Test Cases */}
                    <div className="flex gap-1.5 mb-3">
                      {Array.from({ length: result.total }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-8 h-1.5 rounded-full ${
                            i < result.passed ? 'bg-success' : 'bg-error/50'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Feedback */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-container/60">
                      <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-on-surface-variant leading-relaxed">{result.feedback}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
