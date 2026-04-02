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
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
  return <span className="text-sm font-bold text-on-surface-variant w-5 text-center">{rank}</span>;
}

function UserAvatar({ name, rank }: { name: string; rank: number }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = ['bg-primary-container', 'bg-secondary-container', 'bg-tertiary-container'];
  const bg = rank <= 3 ? colors[rank - 1] : 'bg-surface-container-high';

  return (
    <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center text-xs font-bold text-on-surface`}>
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
      <div className="flex items-end justify-center gap-3 mb-8 px-4">
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
            <p className="text-[10px] text-secondary">{top3[1].xp.toLocaleString()} XP</p>
            <div className="podium-silver w-20 h-16 rounded-t-lg mt-2 flex items-center justify-center">
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
              <Crown className="w-6 h-6 text-yellow-400 mb-1" />
            </motion.div>
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-lg font-bold text-on-primary-container glow-primary">
              {top3[0].displayName.charAt(0)}
            </div>
            <p className="text-sm font-bold text-on-surface mt-1.5 truncate max-w-[100px]">{top3[0].displayName}</p>
            <p className="text-xs text-secondary font-semibold">{top3[0].xp.toLocaleString()} XP</p>
            <div className="podium-gold w-24 h-24 rounded-t-lg mt-2 flex items-center justify-center glow-tertiary">
              <span className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Space Grotesk' }}>1</span>
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
            <p className="text-[10px] text-secondary">{top3[2].xp.toLocaleString()} XP</p>
            <div className="podium-bronze w-20 h-12 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-lg font-bold text-amber-700" style={{ fontFamily: 'Space Grotesk' }}>3</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[48px_1fr_80px_80px_80px_60px] gap-2 px-4 py-2.5 text-on-surface-variant">
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
              className={`grid grid-cols-[48px_1fr_80px_80px_80px_60px] gap-2 px-4 py-3 items-center transition-colors ${
                isCurrentUser
                  ? 'table-row-highlight rounded-lg'
                  : i % 2 === 0
                    ? 'bg-surface-container-lowest/30'
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
              <p className="text-center text-sm font-bold text-secondary">{entry.xp.toLocaleString()}</p>
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
