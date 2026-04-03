'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Flame, CheckCircle2, Code2, Calendar, Clock, Target, Heart,
} from 'lucide-react';
import SkillRadar from '@/components/SkillRadar';
import XPBar from '@/components/XPBar';
import AchievementBadge from '@/components/AchievementBadge';
import { getLevelInfo, mockAchievements, UserProfile, SkillData, Submission } from '@/lib/mockData';
import { fetchUserProfile, fetchUserSkills, fetchSubmissionHistory, fetchUserStats } from '@/lib/api';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    accepted: 'bg-success/12 text-success border border-success/15',
    wrong_answer: 'bg-error/12 text-error border border-error/15',
    runtime_error: 'bg-warning/12 text-warning border border-warning/15',
    time_limit: 'bg-tertiary/12 text-tertiary border border-tertiary/15',
    pending: 'bg-outline/12 text-outline border border-outline/15',
  };
  const labels: Record<string, string> = {
    accepted: 'AC',
    wrong_answer: 'WA',
    runtime_error: 'RE',
    time_limit: 'TLE',
    pending: '...',
  };
  return (
    <span className={`${styles[status] || styles.pending} px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase`}>
      {labels[status] || status}
    </span>
  );
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [skills, setSkills] = React.useState<SkillData[]>([]);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [stats, setStats] = React.useState({ solved: 0, total: 0 });

  React.useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, skillsRes, submissionsRes, statsRes] = await Promise.all([
          fetchUserProfile(),
          fetchUserSkills(),
          fetchSubmissionHistory(20),
          fetchUserStats()
        ]);
        setUserProfile(profileRes);
        setSkills(skillsRes);
        setSubmissions(submissionsRes);
        setStats({ solved: statsRes.problems_solved || 0, total: statsRes.total_submissions || 0 });
      } catch (err) {
        console.error('Failed to load profile data', err);
      }
    }
    loadData();
  }, []);

  if (!userProfile) {
    return <div className="p-8 text-center text-on-surface-variant">Loading profile...</div>;
  }

  const levelInfo = getLevelInfo(userProfile.level);
  const acceptedCount = submissions.filter(s => s.status === 'accepted').length;
  const acceptanceRate = submissions.length > 0 ? Math.round((acceptedCount / submissions.length) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6"
        style={{ border: '1px solid rgba(79,156,249,0.06)' }}
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative shrink-0"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #4F9CF9, #7C3AED, #EC4899)',
              boxShadow: '0 0 35px rgba(79,156,249,0.25), 0 0 60px rgba(124,58,237,0.1)',
            }}
          >
            {userProfile.displayName.charAt(0)}
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #4F9CF9, #7C3AED)',
              boxShadow: '0 0 15px rgba(79,156,249,0.4)',
            }}
          >
            {userProfile.level}
          </div>
        </motion.div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Space Grotesk' }}>
            {userProfile.displayName}
          </h1>
          <p className="text-sm text-on-surface-variant">@{userProfile.username}</p>
          <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
            <span className="badge-boss px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <Shield className="w-3 h-3 inline mr-1" />
              Lv.{userProfile.level} {levelInfo.title}
            </span>
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {new Date(userProfile.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="mt-4 max-w-md">
            <XPBar currentXP={userProfile.xp} level={userProfile.level} showDetails={false} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          {[
            { icon: CheckCircle2, label: 'Solved', value: stats.solved.toString(), color: 'text-success', bg: 'rgba(74,222,128,0.06)' },
            { icon: Target, label: 'Accuracy', value: `${acceptanceRate}%`, color: 'text-primary', bg: 'rgba(79,156,249,0.06)' },
            { icon: Flame, label: 'Best Streak', value: `${userProfile.longestStreak}`, color: 'text-tertiary', bg: 'rgba(236,72,153,0.06)' },
            { icon: Code2, label: 'Fav Lang', value: 'Python', color: 'text-secondary', bg: 'rgba(34,211,238,0.06)' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-3 text-center min-w-[80px]"
              style={{
                background: stat.bg,
                border: '1px solid rgba(79,156,249,0.04)',
              }}
            >
              <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
              <p className={`text-sm font-bold ${stat.color}`} style={{ fontFamily: 'Space Grotesk' }}>{stat.value}</p>
              <p className="text-[9px] text-on-surface-variant">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Skill Radar + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SkillRadar data={skills} size="lg" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5"
          style={{ border: '1px solid rgba(79,156,249,0.06)' }}
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
        style={{ border: '1px solid rgba(79,156,249,0.06)' }}
      >
        <div className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(79,156,249,0.04)' }}
        >
          <h3 className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Space Grotesk' }}>
            Submission History
          </h3>
          <span className="label-competitive">{submissions.length} submissions</span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[1fr_80px_60px_60px_80px_100px] gap-3 px-5 py-2 text-on-surface-variant" style={{ borderBottom: '1px solid rgba(79,156,249,0.03)' }}>
          <span className="label-competitive">Problem</span>
          <span className="label-competitive text-center">Status</span>
          <span className="label-competitive text-center">Score</span>
          <span className="label-competitive text-center">Lang</span>
          <span className="label-competitive text-center">Time</span>
          <span className="label-competitive text-right">Date</span>
        </div>

        {submissions.map((sub, i) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            whileHover={{ backgroundColor: 'rgba(79,156,249,0.03)' }}
            className={`grid grid-cols-[1fr_80px_60px_60px_80px_100px] gap-3 px-5 py-3 items-center transition-colors ${
              i % 2 === 0 ? '' : ''
            }`}
            style={i % 2 === 0 ? { background: 'rgba(7,10,18,0.3)' } : {}}
          >
            <span className="text-xs font-medium text-on-surface truncate">{sub.problemTitle}</span>
            <div className="text-center"><StatusBadge status={sub.status} /></div>
            <span className="text-xs font-bold text-primary text-center">
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
