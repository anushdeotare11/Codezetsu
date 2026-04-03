'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import LeaderboardTable from '@/components/LeaderboardTable';
import { LeaderboardEntry, mockUser } from '@/lib/mockData';
import { fetchLeaderboard, fetchUserProfile } from '@/lib/api';

const tabs = ['All Time', 'This Week', 'Today'];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('All Time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  React.useEffect(() => {
    async function load() {
      const [boardData, userProfile] = await Promise.all([
        fetchLeaderboard(10, activeTab === 'All Time' ? 'all' : activeTab === 'This Week' ? 'week' : 'today'),
        fetchUserProfile()
      ]);
      setLeaderboard(boardData);
      setCurrentUserId(userProfile.id);
    }
    load();
  }, [activeTab]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(236,72,153,0.1)',
              boxShadow: '0 0 15px rgba(236,72,153,0.15)',
            }}
          >
            <Trophy className="w-5 h-5 text-tertiary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Space Grotesk' }}>
              Leaderboard
            </h1>
            <p className="text-sm text-on-surface-variant">The arena&apos;s finest warriors</p>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{
            background: 'rgba(7,10,18,0.6)',
            border: '1px solid rgba(79,156,249,0.06)',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              style={activeTab === tab ? {
                background: 'linear-gradient(135deg, #4F9CF9, #7C3AED)',
                boxShadow: '0 0 15px rgba(79,156,249,0.2)',
              } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <LeaderboardTable data={leaderboard} currentUserId={currentUserId} />
      </motion.div>
    </div>
  );
}
