'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Achievement } from '@/lib/mockData';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md';
}

export default function AchievementBadge({ achievement, size = 'md' }: AchievementBadgeProps) {
  const isUnlocked = achievement.unlocked;
  const sizes = {
    sm: { card: 'w-20 h-24', icon: 'text-2xl', text: 'text-[9px]' },
    md: { card: 'w-28 h-32', icon: 'text-3xl', text: 'text-[10px]' },
  };
  const s = sizes[size];

  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.08, y: -4 } : {}}
      className={`relative ${s.card} flex flex-col items-center justify-center rounded-2xl p-2 transition-all duration-300 cursor-default shrink-0 ${
        isUnlocked ? 'achievement-unlocked glass-card' : 'achievement-locked glass-card'
      }`}
      style={isUnlocked ? { border: '1px solid rgba(79,156,249,0.08)' } : {}}
    >
      {!isUnlocked && (
        <div className="absolute top-1.5 right-1.5">
          <Lock className="w-3 h-3 text-on-surface-variant/30" />
        </div>
      )}

      <motion.span
        className={s.icon}
        animate={isUnlocked ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        {achievement.icon}
      </motion.span>

      <p className={`${s.text} font-semibold text-on-surface mt-1.5 text-center leading-tight`}>
        {achievement.name}
      </p>
      <p className={`${s.text} text-on-surface-variant text-center leading-tight mt-0.5`}>
        {achievement.description}
      </p>

      {isUnlocked && achievement.unlockedAt && (
        <p className="text-[8px] text-primary mt-1">{achievement.unlockedAt}</p>
      )}

      {isUnlocked && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(79,156,249,0.04) 0%, transparent 70%)',
          }}
        />
      )}
    </motion.div>
  );
}
