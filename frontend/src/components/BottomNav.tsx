'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Swords, LayoutDashboard, Trophy, User } from 'lucide-react';

const navItems = [
  { href: '/arena', label: 'Arena', icon: Swords },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Ranks', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href} className="flex-1">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition-colors ${
                isActive ? 'text-secondary' : 'text-on-surface-variant'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`} />
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-secondary"
                    style={{ boxShadow: '0 0 8px rgba(76,215,246,0.8)' }}
                  />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
                {item.label}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
