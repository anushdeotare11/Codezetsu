'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  accentColor?: 'primary' | 'secondary' | 'tertiary' | 'success';
  delay?: number;
}

const accentMap = {
  primary: { text: 'text-primary', glow: 'glow-primary', bg: 'bg-primary-container/20' },
  secondary: { text: 'text-secondary', glow: 'glow-secondary', bg: 'bg-secondary-container/20' },
  tertiary: { text: 'text-tertiary', glow: 'glow-tertiary', bg: 'bg-tertiary-container/20' },
  success: { text: 'text-success', glow: 'glow-success', bg: 'bg-success/10' },
};

export default function StatsCard({ icon: Icon, label, value, trend, accentColor = 'primary', delay = 0 }: StatsCardProps) {
  const accent = accentMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2 }}
      className="glass-card rounded-2xl p-5 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${accent.text}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.positive ? 'text-success' : 'text-error'}`}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </div>
        )}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
        className={`text-2xl font-bold ${accent.text} mb-1`}
        style={{ fontFamily: 'Space Grotesk' }}
      >
        {value}
      </motion.p>
      <p className="text-xs text-on-surface-variant label-competitive">{label}</p>
    </motion.div>
  );
}
