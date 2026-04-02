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
    >
      {showDetails && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCloseToLevelUp ? 'bg-tertiary-container/30 animate-pulse-glow' : 'bg-primary-container/20'}`}>
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
            <p className="text-sm font-bold text-secondary">{nextLevelXP - currentXP} XP</p>
          </div>
        </div>
      )}

      <div className="relative">
        <div className={`h-2.5 rounded-full overflow-hidden ${isCloseToLevelUp ? 'bg-tertiary-container/20' : 'bg-surface-container-lowest'}`}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isCloseToLevelUp
                ? 'linear-gradient(90deg, #a15100, #ffb784, #fbbf24)'
                : 'linear-gradient(90deg, #7c3aed, #4cd7f6)',
              boxShadow: isCloseToLevelUp
                ? '0 0 12px rgba(255,183,132,0.4)'
                : '0 0 8px rgba(76,215,246,0.3)',
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
