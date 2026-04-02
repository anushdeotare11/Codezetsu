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

export default function BossFight({ problem, onAccept, onDecline }: BossFightProps) {
  const [bossHP, setBossHP] = useState(100);
  const [showIntro, setShowIntro] = useState(true);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
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
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 4 + 2,
                  height: Math.random() * 4 + 2,
                  background: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#ff4444' : '#ffb784',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100 - Math.random() * 200],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>

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
