'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, Flame, ChevronUp, ChevronDown } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/mockData';

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  currentUserId: string;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-on-surface-variant w-5 text-center">{rank}</span>;
}

function UserAvatar({ name, rank }: { name: string; rank: number }) {
  const initial = name.charAt(0).toUpperCase();
  const gradients = [
    'linear-gradient(135deg, #FBBF24, #F59E0B)',
    'linear-gradient(135deg, #94A3B8, #64748B)',
    'linear-gradient(135deg, #D97706, #92400E)',
  ];
  const bg = rank <= 3 ? gradients[rank - 1] : 'linear-gradient(135deg, #1E293B, #334155)';

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
      style={{ background: bg }}
    >
      {initial}
    </div>
  );
}

export default function LeaderboardTable({ data, currentUserId }: LeaderboardTableProps) {
  // Top 3 podium
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div>
      {/* Podium */}
      <div className="flex items-end justify-center gap-4 mb-8 px-4">
        {/* 2nd Place */}
        {top3[1] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <UserAvatar name={top3[1].displayName} rank={2} />
            <p className="text-xs font-semibold text-on-surface mt-1.5 truncate max-w-[80px]">{top3[1].displayName}</p>
            <p className="text-[10px] text-primary">{top3[1].xp.toLocaleString()} XP</p>
            <div className="podium-silver w-20 h-16 rounded-t-xl mt-2 flex items-center justify-center">
              <span className="text-lg font-bold text-slate-300" style={{ fontFamily: 'Space Grotesk' }}>2</span>
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {top3[0] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Crown className="w-6 h-6 text-yellow-400 mb-1" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))' }} />
            </motion.div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                boxShadow: '0 0 25px rgba(251,191,36,0.3)',
              }}
            >
              {top3[0].displayName.charAt(0)}
            </div>
            <p className="text-sm font-bold text-on-surface mt-1.5 truncate max-w-[100px]">{top3[0].displayName}</p>
            <p className="text-xs text-primary font-semibold">{top3[0].xp.toLocaleString()} XP</p>
            <div className="podium-gold w-24 h-24 rounded-t-xl mt-2 flex items-center justify-center">
              <span className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Space Grotesk', textShadow: '0 0 15px rgba(251,191,36,0.5)' }}>1</span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <UserAvatar name={top3[2].displayName} rank={3} />
            <p className="text-xs font-semibold text-on-surface mt-1.5 truncate max-w-[80px]">{top3[2].displayName}</p>
            <p className="text-[10px] text-primary">{top3[2].xp.toLocaleString()} XP</p>
            <div className="podium-bronze w-20 h-12 rounded-t-xl mt-2 flex items-center justify-center">
              <span className="text-lg font-bold text-amber-600" style={{ fontFamily: 'Space Grotesk' }}>3</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(79,156,249,0.06)' }}>
        <div className="grid grid-cols-[48px_1fr_80px_80px_80px_60px] gap-2 px-4 py-2.5 text-on-surface-variant" style={{ borderBottom: '1px solid rgba(79,156,249,0.04)' }}>
          <span className="label-competitive text-center">#</span>
          <span className="label-competitive">Player</span>
          <span className="label-competitive text-center">Level</span>
          <span className="label-competitive text-center">XP</span>
          <span className="label-competitive text-center">Solved</span>
          <span className="label-competitive text-center">🔥</span>
        </div>

        {rest.map((entry, i) => {
          const isCurrentUser = entry.id === currentUserId;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ backgroundColor: 'rgba(79,156,249,0.04)' }}
              className={`grid grid-cols-[48px_1fr_80px_80px_80px_60px] gap-2 px-4 py-3 items-center transition-all ${
                isCurrentUser
                  ? 'table-row-highlight rounded-xl'
                  : i % 2 === 0
                    ? 'bg-surface-container-lowest/20'
                    : ''
              }`}
            >
              <div className="flex justify-center">
                <RankBadge rank={entry.rank} />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <UserAvatar name={entry.displayName} rank={entry.rank} />
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-primary' : 'text-on-surface'}`}>
                    {entry.displayName}
                  </p>
                  <p className="text-[10px] text-on-surface-variant">@{entry.username}</p>
                </div>
              </div>
              <p className="text-center text-sm font-medium text-on-surface-variant">{entry.level}</p>
              <p className="text-center text-sm font-bold text-primary">{entry.xp.toLocaleString()}</p>
              <p className="text-center text-sm text-on-surface-variant">{entry.problemsSolved}</p>
              <div className="flex items-center justify-center gap-0.5">
                <Flame className="w-3 h-3 text-tertiary" />
                <span className="text-xs text-tertiary font-semibold">{entry.currentStreak}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
