'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Flame, CheckCircle2, Clock, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import StatsCard from '@/components/StatsCard';
import SkillRadar from '@/components/SkillRadar';
import XPBar from '@/components/XPBar';
import AchievementBadge from '@/components/AchievementBadge';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { StreakFireAnimation } from '@/components/XPGainPopup';
import { mockAchievements, UserProfile, SkillData, Submission } from '@/lib/mockData';
import { fetchUserProfile, fetchUserStats, fetchUserSkills, fetchSubmissionHistory } from '@/lib/api';

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

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ solved: 0, total: 0 });
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, statsRes, skillsRes, submissionsRes] = await Promise.all([
          fetchUserProfile(),
          fetchUserStats(),
          fetchUserSkills(),
          fetchSubmissionHistory(5)
        ]);
        
        setUserProfile(profileRes);
        setStats({ solved: statsRes.problems_solved || 0, total: statsRes.total_submissions || 0 });
        setSkills(skillsRes);
        setSubmissions(submissionsRes);
      } catch (err) {
        console.error('Dashboard data load failed', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading || !userProfile) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Space Grotesk' }}>
            Command Center
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Welcome back, {userProfile.displayName}</p>
        </div>
        <Link href="/arena">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary px-5 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2"
          >
            Enter Arena <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon={Zap}
          label="Total XP"
          value={userProfile.xp.toLocaleString()}
          trend={{ value: '+125', positive: true }}
          accentColor="primary"
          delay={0}
        />
        <StatsCard
          icon={Shield}
          label="Level"
          value={userProfile.level}
          accentColor="secondary"
          delay={0.1}
        />
        <StatsCard
          icon={Flame}
          label="Streak"
          value={<StreakFireAnimation streak={userProfile.currentStreak} />}
          trend={{ value: '+1', positive: true }}
          accentColor="tertiary"
          delay={0.2}
        />
        <StatsCard
          icon={CheckCircle2}
          label="Solved"
          value={stats.solved.toString()}
          trend={{ value: '+3', positive: true }}
          accentColor="success"
          delay={0.3}
        />
      </div>

      {/* XP Progress */}
      <XPBar currentXP={userProfile.xp} level={userProfile.level} />

      {/* Charts + Submissions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Skill Radar (3 cols) */}
        <div className="lg:col-span-3">
          <SkillRadar data={skills} size="lg" />
        </div>

        {/* Recent Submissions (2 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Space Grotesk' }}>
              Recent Submissions
            </h3>
            <span className="label-competitive">{submissions.length} total</span>
          </div>

          <div className="space-y-2">
            {submissions.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest/40 hover:bg-surface-container-lowest/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StatusBadge status={sub.status} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-on-surface truncate">{sub.problemTitle}</p>
                    <p className="text-[10px] text-on-surface-variant">{sub.language}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {sub.aiEvaluation && (
                    <p className="text-xs font-bold text-secondary">{sub.aiEvaluation.overallScore}/10</p>
                  )}
                  <p className="text-[10px] text-on-surface-variant flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {timeAgo(sub.submittedAt)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-on-surface" style={{ fontFamily: 'Space Grotesk' }}>
            Achievements
          </h3>
          <span className="label-competitive">
            {mockAchievements.filter(a => a.unlocked).length}/{mockAchievements.length} unlocked
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {mockAchievements.map((achievement) => (
            <AchievementBadge key={achievement.key} achievement={achievement} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
