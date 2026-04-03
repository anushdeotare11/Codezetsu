'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Flame, Zap } from 'lucide-react';
import { getLevelInfo, getNextLevelXP } from '@/lib/mockData';

interface XPBarProps {
  currentXP: number;
  level: number;
  showDetails?: boolean;
}

export default function XPBar({ currentXP, level, showDetails = true }: XPBarProps) {
  const levelInfo = getLevelInfo(level);
  const nextLevelXP = getNextLevelXP(level);
  const currentLevelXP = levelInfo.xp;
  const progress = Math.min(((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, 100);
  const isCloseToLevelUp = progress >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-4"
      style={{ border: '1px solid rgba(79,156,249,0.06)' }}
    >
      {showDetails && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCloseToLevelUp ? 'animate-pulse-glow' : ''}`}
              style={{
                background: isCloseToLevelUp
                  ? 'rgba(236,72,153,0.15)'
                  : 'rgba(79,156,249,0.1)',
              }}
            >
              <Shield className={`w-4 h-4 ${isCloseToLevelUp ? 'text-tertiary' : 'text-primary'}`} />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Level {level}</p>
              <p className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Space Grotesk' }}>
                {levelInfo.title}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-on-surface-variant">Next level</p>
            <p className="text-sm font-bold text-primary">{nextLevelXP - currentXP} XP</p>
          </div>
        </div>
      )}

      <div className="relative">
        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(7,10,18,0.8)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isCloseToLevelUp
                ? 'linear-gradient(90deg, #EC4899, #FBBF24)'
                : 'linear-gradient(90deg, #4F9CF9, #7C3AED, #EC4899)',
              boxShadow: isCloseToLevelUp
                ? '0 0 12px rgba(236,72,153,0.4)'
                : '0 0 10px rgba(79,156,249,0.3)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
        {isCloseToLevelUp && (
          <motion.div
            className="absolute right-0 -top-1"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Zap className="w-4 h-4 text-warning" />
          </motion.div>
        )}
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-on-surface-variant">{currentXP.toLocaleString()} XP</span>
        <span className="text-[10px] text-on-surface-variant">{nextLevelXP.toLocaleString()} XP</span>
      </div>
    </motion.div>
  );
}
