'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Swords, Timer, Zap, Shield, Heart } from 'lucide-react';
import { Problem } from '@/lib/mockData';

interface BossFightProps {
  problem: Problem;
  onAccept: () => void;
  onDecline: () => void;
}

// Pre-generated particle data to avoid hydration mismatch
const bossParticles = [
  { id: 0, color: '#7c3aed', left: 10, top: 20, size: 4, duration: 4, delay: 0.5, yMove: 150 },
  { id: 1, color: '#ff4444', left: 25, top: 40, size: 5, duration: 5, delay: 1, yMove: 200 },
  { id: 2, color: '#ffb784', left: 40, top: 60, size: 3, duration: 3.5, delay: 0, yMove: 180 },
  { id: 3, color: '#7c3aed', left: 55, top: 15, size: 4.5, duration: 4.5, delay: 2, yMove: 220 },
  { id: 4, color: '#ff4444', left: 70, top: 35, size: 3.5, duration: 5.5, delay: 1.5, yMove: 160 },
  { id: 5, color: '#ffb784', left: 85, top: 55, size: 5.5, duration: 4, delay: 0.5, yMove: 190 },
  { id: 6, color: '#7c3aed', left: 15, top: 75, size: 4, duration: 3, delay: 2.5, yMove: 170 },
  { id: 7, color: '#ff4444', left: 30, top: 85, size: 3, duration: 6, delay: 0, yMove: 250 },
  { id: 8, color: '#ffb784', left: 45, top: 25, size: 5, duration: 4.5, delay: 1, yMove: 200 },
  { id: 9, color: '#7c3aed', left: 60, top: 70, size: 4.5, duration: 5, delay: 2, yMove: 180 },
  { id: 10, color: '#ff4444', left: 75, top: 50, size: 3.5, duration: 3.5, delay: 1.5, yMove: 210 },
  { id: 11, color: '#ffb784', left: 90, top: 30, size: 4, duration: 4, delay: 0.5, yMove: 160 },
  { id: 12, color: '#7c3aed', left: 20, top: 90, size: 5.5, duration: 5.5, delay: 2.5, yMove: 230 },
  { id: 13, color: '#ff4444', left: 35, top: 10, size: 3, duration: 3, delay: 0, yMove: 140 },
  { id: 14, color: '#ffb784', left: 50, top: 45, size: 4.5, duration: 6, delay: 1, yMove: 190 },
  { id: 15, color: '#7c3aed', left: 65, top: 80, size: 4, duration: 4.5, delay: 2, yMove: 170 },
  { id: 16, color: '#ff4444', left: 80, top: 65, size: 5, duration: 5, delay: 1.5, yMove: 220 },
  { id: 17, color: '#ffb784', left: 12, top: 50, size: 3.5, duration: 3.5, delay: 0.5, yMove: 180 },
  { id: 18, color: '#7c3aed', left: 28, top: 5, size: 4.5, duration: 4, delay: 2.5, yMove: 200 },
  { id: 19, color: '#ff4444', left: 82, top: 95, size: 4, duration: 5.5, delay: 0, yMove: 240 },
];

export default function BossFight({ problem, onAccept, onDecline }: BossFightProps) {
  const [bossHP, setBossHP] = useState(100);
  const [showIntro, setShowIntro] = useState(true);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setPulseIntensity((p) => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const glowOpacity = 0.15 + (Math.sin(pulseIntensity * 0.1) + 1) * 0.1;

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse at center, rgba(124,58,237,${glowOpacity}) 0%, rgba(12,12,29,0.98) 60%, #0a0a15 100%)`,
          }}
        >
          {/* Ambient particles */}
          {mounted && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {bossParticles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    background: p.color,
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                  }}
                  animate={{
                    y: [0, -p.yMove],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                  }}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative glass-card rounded-3xl p-8 max-w-lg w-full mx-4 text-center"
            style={{
              border: '1px solid rgba(255,68,68,0.2)',
              boxShadow: '0 0 60px rgba(124,58,237,0.2), 0 0 120px rgba(255,68,68,0.08)',
            }}
          >
            {/* Boss Icon */}
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 overflow-hidden"
              style={{
                background: 'radial-gradient(circle, rgba(255,68,68,0.3) 0%, rgba(124,58,237,0.2) 100%)',
                boxShadow: '0 0 30px rgba(255,68,68,0.3)',
              }}
            >
              {problem.bossImageUrl ? (
                <img src={problem.bossImageUrl} alt="Boss" className="w-full h-full object-cover" />
              ) : (
                <Skull className="w-10 h-10 text-error" />
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-1"
              style={{
                fontFamily: 'Space Grotesk',
                background: 'linear-gradient(135deg, #ff4444, #ffb784)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ⚔️ BOSS FIGHT ⚔️
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-on-surface-variant mb-4"
            >
              A powerful enemy blocks your path
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl font-bold text-on-surface mb-2"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              {problem.title}
            </motion.h2>

            {/* Boss HP Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-error" />
                  <span className="label-competitive text-error">Boss HP</span>
                </div>
                <span className="text-xs font-bold text-error">{bossHP}/100</span>
              </div>
              <div className="h-3 rounded-full bg-surface-container-lowest overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #ff4444, #ff8888)' }}
                  initial={{ width: '100%' }}
                  animate={{ width: `${bossHP}%` }}
                />
              </div>
            </div>

            {/* Boss Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl bg-surface-container-lowest/60 p-2.5">
                <Swords className="w-4 h-4 text-error mx-auto mb-1" />
                <p className="text-[10px] text-on-surface-variant">Difficulty</p>
                <p className="text-sm font-bold text-error">{problem.difficultyScore}/10</p>
              </div>
              <div className="rounded-xl bg-surface-container-lowest/60 p-2.5">
                <Timer className="w-4 h-4 text-warning mx-auto mb-1" />
                <p className="text-[10px] text-on-surface-variant">Time Limit</p>
                <p className="text-sm font-bold text-warning">30 min</p>
              </div>
              <div className="rounded-xl bg-surface-container-lowest/60 p-2.5">
                <Zap className="w-4 h-4 text-tertiary mx-auto mb-1" />
                <p className="text-[10px] text-on-surface-variant">XP Reward</p>
                <p className="text-sm font-bold text-tertiary">500</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowIntro(false); onDecline(); }}
                className="flex-1 btn-ghost py-2.5 rounded-xl text-sm font-semibold"
              >
                Retreat
              </button>
              <motion.button
                onClick={() => { setShowIntro(false); onAccept(); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #ff4444, #a15100)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(255,68,68,0.3)',
                }}
              >
                ⚔️ Fight
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
