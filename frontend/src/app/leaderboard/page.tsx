'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import LeaderboardTable from '@/components/LeaderboardTable';
import { mockLeaderboard, mockUser } from '@/lib/mockData';

const tabs = ['All Time', 'This Week', 'Today'];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('All Time');

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 flex items-center justify-center glow-tertiary">
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
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-lowest/60">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
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
        <LeaderboardTable data={mockLeaderboard} currentUserId={mockUser.id} />
      </motion.div>
    </div>
  );
}
