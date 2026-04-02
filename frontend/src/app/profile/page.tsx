'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Flame, CheckCircle2, Code2, Calendar, Clock, Target, Heart,
} from 'lucide-react';
import SkillRadar from '@/components/SkillRadar';
import XPBar from '@/components/XPBar';
import AchievementBadge from '@/components/AchievementBadge';
import { mockUser, mockSkills, mockSubmissions, mockAchievements, getLevelInfo } from '@/lib/mockData';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    accepted: 'bg-success/15 text-success',
    wrong_answer: 'bg-error/15 text-error',
    runtime_error: 'bg-warning/15 text-warning',
    time_limit: 'bg-tertiary/15 text-tertiary',
    pending: 'bg-outline/15 text-outline',
  };
  const labels: Record<string, string> = {
    accepted: 'AC',
    wrong_answer: 'WA',
    runtime_error: 'RE',
    time_limit: 'TLE',
    pending: '...',
  };
  return (
    <span className={`${styles[status] || styles.pending} px-2 py-0.5 rounded text-[10px] font-bold uppercase`}>
      {labels[status] || status}
    </span>
  );
}

export default function ProfilePage() {
  const levelInfo = getLevelInfo(mockUser.level);
  const acceptedCount = mockSubmissions.filter(s => s.status === 'accepted').length;
  const acceptanceRate = mockSubmissions.length > 0 ? Math.round((acceptedCount / mockSubmissions.length) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6"
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative shrink-0"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4cd7f6)',
              boxShadow: '0 0 30px rgba(124,58,237,0.3)',
            }}
          >
            {mockUser.displayName.charAt(0)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container glow-primary">
            {mockUser.level}
          </div>
        </motion.div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Space Grotesk' }}>
            {mockUser.displayName}
          </h1>
          <p className="text-sm text-on-surface-variant">@{mockUser.username}</p>
          <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
            <span className="badge-boss px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <Shield className="w-3 h-3 inline mr-1" />
              Lv.{mockUser.level} {levelInfo.title}
            </span>
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {mockUser.createdAt}
            </span>
          </div>

          <div className="mt-4 max-w-md">
            <XPBar currentXP={mockUser.xp} level={mockUser.level} showDetails={false} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          {[
            { icon: CheckCircle2, label: 'Solved', value: '34', color: 'text-success' },
            { icon: Target, label: 'Accuracy', value: `${acceptanceRate}%`, color: 'text-secondary' },
            { icon: Flame, label: 'Best Streak', value: `${mockUser.longestStreak}`, color: 'text-tertiary' },
            { icon: Code2, label: 'Fav Lang', value: 'Python', color: 'text-primary' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-surface-container-lowest/40 p-3 text-center min-w-[80px]">
              <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
              <p className={`text-sm font-bold ${stat.color}`} style={{ fontFamily: 'Space Grotesk' }}>{stat.value}</p>
              <p className="text-[9px] text-on-surface-variant">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Skill Radar + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SkillRadar data={mockSkills} size="lg" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Space Grotesk' }}>
              Achievement Collection
            </h3>
            <span className="label-competitive">
              {mockAchievements.filter(a => a.unlocked).length}/{mockAchievements.length}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {mockAchievements.map((achievement) => (
              <AchievementBadge key={achievement.key} achievement={achievement} size="sm" />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Submission History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(74,68,85,0.1)' }}
        >
          <h3 className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Space Grotesk' }}>
            Submission History
          </h3>
          <span className="label-competitive">{mockSubmissions.length} submissions</span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[1fr_80px_60px_60px_80px_100px] gap-3 px-5 py-2 text-on-surface-variant">
          <span className="label-competitive">Problem</span>
          <span className="label-competitive text-center">Status</span>
          <span className="label-competitive text-center">Score</span>
          <span className="label-competitive text-center">Lang</span>
          <span className="label-competitive text-center">Time</span>
          <span className="label-competitive text-right">Date</span>
        </div>

        {mockSubmissions.map((sub, i) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className={`grid grid-cols-[1fr_80px_60px_60px_80px_100px] gap-3 px-5 py-3 items-center transition-colors hover:bg-surface-container-lowest/40 ${
              i % 2 === 0 ? 'bg-surface-container-lowest/20' : ''
            }`}
          >
            <span className="text-xs font-medium text-on-surface truncate">{sub.problemTitle}</span>
            <div className="text-center"><StatusBadge status={sub.status} /></div>
            <span className="text-xs font-bold text-secondary text-center">
              {sub.aiEvaluation ? `${sub.aiEvaluation.overallScore}/10` : '-'}
            </span>
            <span className="text-xs text-on-surface-variant text-center capitalize">{sub.language}</span>
            <span className="text-xs text-on-surface-variant text-center">
              {sub.executionTimeMs > 0 ? `${sub.executionTimeMs}ms` : '-'}
            </span>
            <span className="text-xs text-on-surface-variant text-right">
              {new Date(sub.submittedAt).toLocaleDateString()}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
