'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  LayoutDashboard,
  Trophy,
  User,
  ChevronLeft,
  ChevronRight,
  Flame,
  Shield,
  Zap,
} from 'lucide-react';
import { mockUser, getLevelInfo, getNextLevelXP } from '@/lib/mockData';

const navItems = [
  { href: '/arena', label: 'Arena', icon: Swords },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const levelInfo = getLevelInfo(mockUser.level);
  const nextLevelXP = getNextLevelXP(mockUser.level);
  const currentLevelXP = levelInfo.xp;
  const progress = ((mockUser.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(26,26,43,0.95) 0%, rgba(12,12,29,0.98) 100%)',
        borderRight: '1px solid rgba(74,68,85,0.15)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center shrink-0 glow-primary">
          <Zap className="w-5 h-5 text-on-primary-container" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-display text-lg font-bold gradient-text whitespace-nowrap"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              SkillSprint
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'sidebar-active bg-primary-container/10'
                    : 'hover:bg-surface-container-high/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-secondary' : 'text-on-surface-variant group-hover:text-primary'
                  }`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className={`text-sm font-medium whitespace-nowrap ${
                        isActive ? 'text-secondary' : 'text-on-surface-variant group-hover:text-on-surface'
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div
                    layoutId="sidebar-glow"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'radial-gradient(ellipse at center left, rgba(124,58,237,0.08) 0%, transparent 70%)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Mini Card */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-3 mb-3 p-3 rounded-xl glass-card"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-container/30 flex items-center justify-center shrink-0 border border-primary/20">
                {mockUser.avatarUrl ? (
                  <img src={mockUser.avatarUrl} alt={mockUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  <Shield className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-on-surface truncate">{mockUser.displayName}</p>
                <p className="text-[10px] text-on-surface-variant">Lv.{mockUser.level} {levelInfo.title}</p>
              </div>
            </div>
            <div className="xp-bar mb-1">
              <motion.div
                className="xp-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-on-surface-variant">{mockUser.xp} XP</span>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-tertiary" />
                <span className="text-[10px] text-tertiary font-semibold">{mockUser.currentStreak}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 mb-2 mx-2 rounded-lg hover:bg-surface-container-high/50 transition-colors text-on-surface-variant hover:text-on-surface"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
