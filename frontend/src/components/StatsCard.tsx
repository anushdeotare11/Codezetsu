'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  trend?: { value: string; positive: boolean };
  accentColor?: 'primary' | 'secondary' | 'tertiary' | 'success';
  delay?: number;
}

const accentMap = {
  primary: { text: 'text-primary', glow: 'glow-primary', bg: 'bg-primary/10', border: 'rgba(79,156,249,0.08)' },
  secondary: { text: 'text-secondary', glow: 'glow-secondary', bg: 'bg-secondary/10', border: 'rgba(34,211,238,0.08)' },
  tertiary: { text: 'text-tertiary', glow: 'glow-tertiary', bg: 'bg-tertiary/10', border: 'rgba(236,72,153,0.08)' },
  success: { text: 'text-success', glow: 'glow-success', bg: 'bg-success/10', border: 'rgba(74,222,128,0.08)' },
};

export default function StatsCard({ icon: Icon, label, value, trend, accentColor = 'primary', delay = 0 }: StatsCardProps) {
  const accent = accentMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="glass-card rounded-2xl p-5 transition-all duration-300 group"
      style={{ borderColor: accent.border }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center transition-shadow group-hover:${accent.glow}`}>
          <Icon className={`w-5 h-5 ${accent.text}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            trend.positive ? 'text-success bg-success/10' : 'text-error bg-error/10'
          }`}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </div>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
        className={`text-2xl font-bold ${accent.text} mb-1`}
        style={{ fontFamily: 'Space Grotesk' }}
      >
        {value}
      </motion.div>
      <span className="text-xs text-on-surface-variant label-competitive block">{label}</span>
    </motion.div>
  );
}
