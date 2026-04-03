'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

// Base skeleton with shimmer animation
function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden rounded ${className}`} style={{ background: 'rgba(30,41,59,0.4)', ...style }}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Card skeleton for dashboard stats
export function StatsCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-12 h-4" />
      </div>
      <Skeleton className="w-20 h-8 mb-2" />
      <Skeleton className="w-16 h-3" />
    </div>
  );
}

// Skill radar skeleton
export function SkillRadarSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <Skeleton className="w-32 h-5 mb-2" />
      <Skeleton className="w-48 h-3 mb-6" />
      <div className="flex items-center justify-center h-[320px]">
        <div className="relative">
          {[200, 150, 100, 50].map((size, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                border: '1px solid rgba(79,156,249,0.06)',
              }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
          <Skeleton className="w-[200px] h-[200px] rounded-full opacity-20" />
        </div>
      </div>
    </div>
  );
}

// Submission list skeleton
export function SubmissionSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(7,10,18,0.4)' }}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Skeleton className="w-8 h-5 rounded" />
        <div className="flex-1">
          <Skeleton className="w-32 h-4 mb-1" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="w-10 h-4 mb-1 ml-auto" />
        <Skeleton className="w-14 h-3 ml-auto" />
      </div>
    </div>
  );
}

// Problem panel skeleton
export function ProblemPanelSkeleton() {
  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-16 h-5 rounded-full" />
          <Skeleton className="w-8 h-4" />
        </div>
        <Skeleton className="w-48 h-7 mb-4" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-20 h-5 rounded-md" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-5/6 h-4" />
      </div>
      <div className="space-y-3 mt-6">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-full h-20 rounded-xl" />
      </div>
    </div>
  );
}

// Leaderboard row skeleton
export function LeaderboardRowSkeleton() {
  return (
    <div className="grid grid-cols-[48px_1fr_80px_80px_80px_60px] gap-2 px-4 py-3 items-center">
      <Skeleton className="w-6 h-6 rounded-full mx-auto" />
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div>
          <Skeleton className="w-24 h-4 mb-1" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <Skeleton className="w-8 h-4 mx-auto" />
      <Skeleton className="w-12 h-4 mx-auto" />
      <Skeleton className="w-8 h-4 mx-auto" />
      <Skeleton className="w-8 h-4 mx-auto" />
    </div>
  );
}

// Achievement badge skeleton
export function AchievementSkeleton() {
  return (
    <div className="w-28 h-32 flex flex-col items-center justify-center rounded-2xl glass-card p-2">
      <Skeleton className="w-10 h-10 rounded-full mb-2" />
      <Skeleton className="w-16 h-3 mb-1" />
      <Skeleton className="w-20 h-2" />
    </div>
  );
}

// Full dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="w-40 h-8 mb-2" />
          <Skeleton className="w-32 h-4" />
        </div>
        <Skeleton className="w-32 h-10 rounded-2xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* XP Bar */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div>
              <Skeleton className="w-16 h-3 mb-1" />
              <Skeleton className="w-24 h-4" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="w-16 h-3 mb-1" />
            <Skeleton className="w-12 h-4" />
          </div>
        </div>
        <Skeleton className="w-full h-2.5 rounded-full" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <SkillRadarSkeleton />
        </div>
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-16 h-4" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <SubmissionSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="w-28 h-5" />
          <Skeleton className="w-20 h-4" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <AchievementSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Arena skeleton
export function ArenaSkeleton() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: 'rgba(11,15,26,0.9)', borderBottom: '1px solid rgba(79,156,249,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <Skeleton className="w-20 h-8 rounded-lg" />
          <Skeleton className="w-px h-4" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-14 h-5 rounded" />
            <Skeleton className="w-32 h-5" />
          </div>
        </div>
        <Skeleton className="w-24 h-8 rounded-xl" />
      </div>

      {/* Main */}
      <div className="flex-1 flex min-h-0">
        {/* Problem Panel */}
        <div className="w-[40%] shrink-0"
          style={{ background: 'rgba(11,15,26,0.6)', borderRight: '1px solid rgba(79,156,249,0.06)' }}
        >
          <ProblemPanelSkeleton />
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(7,10,18,0.9)' }}>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="w-3 h-3 rounded-full" />
              </div>
              <Skeleton className="w-20 h-4" />
            </div>
            <Skeleton className="w-24 h-7 rounded-lg" />
          </div>
          <div className="flex-1 p-4" style={{ background: '#070A12' }}>
            <div className="space-y-2">
              {[55, 75, 60, 85, 70, 45, 80].map((width, i) => (
                <Skeleton key={i} className="h-4" style={{ width: `${width}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
