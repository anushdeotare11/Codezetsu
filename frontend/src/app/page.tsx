'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Swords, Brain, Target, Skull, Trophy, Sparkles, ArrowRight, Zap, Shield, Star } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Code Evaluation',
    description: 'Real-time analysis from our advanced neural engine. Get instant feedback on efficiency, readability, and edge case handling.',
    accent: 'primary' as const,
  },
  {
    icon: Target,
    title: 'Adaptive Challenges',
    description: 'The arena grows with you. Challenges dynamically adjust complexity based on your performance and identified skill gaps.',
    accent: 'secondary' as const,
  },
  {
    icon: Skull,
    title: 'Boss Fights',
    description: 'High-stakes timed events. Face off against elite challenges in high-pressure algorithmic showdowns for massive XP rewards.',
    accent: 'tertiary' as const,
  },
];

const accentClasses = {
  primary: { bg: 'bg-primary-container/20', text: 'text-primary', glow: 'glow-primary' },
  secondary: { bg: 'bg-secondary-container/20', text: 'text-secondary', glow: 'glow-secondary' },
  tertiary: { bg: 'bg-tertiary-container/20', text: 'text-tertiary', glow: 'glow-tertiary' },
};

// Pre-generated particle positions to avoid hydration mismatch
const particleData = [
  { id: 0, color: '#7c3aed', left: 15, top: 10, size: 2.5, duration: 7, delay: 1 },
  { id: 1, color: '#4cd7f6', left: 25, top: 30, size: 3, duration: 8, delay: 2 },
  { id: 2, color: '#ffb784', left: 40, top: 50, size: 2, duration: 6, delay: 0.5 },
  { id: 3, color: '#7c3aed', left: 55, top: 20, size: 3.5, duration: 9, delay: 3 },
  { id: 4, color: '#4cd7f6', left: 70, top: 60, size: 2.2, duration: 7.5, delay: 1.5 },
  { id: 5, color: '#ffb784', left: 85, top: 40, size: 2.8, duration: 6.5, delay: 4 },
  { id: 6, color: '#7c3aed', left: 20, top: 70, size: 3.2, duration: 8.5, delay: 2.5 },
  { id: 7, color: '#4cd7f6', left: 35, top: 85, size: 2.4, duration: 7, delay: 0 },
  { id: 8, color: '#ffb784', left: 50, top: 15, size: 3, duration: 9.5, delay: 3.5 },
  { id: 9, color: '#7c3aed', left: 65, top: 75, size: 2.6, duration: 6, delay: 1 },
  { id: 10, color: '#4cd7f6', left: 80, top: 25, size: 2.9, duration: 8, delay: 4.5 },
  { id: 11, color: '#ffb784', left: 30, top: 55, size: 2.1, duration: 7.5, delay: 2 },
  { id: 12, color: '#7c3aed', left: 45, top: 90, size: 3.3, duration: 9, delay: 0.5 },
  { id: 13, color: '#4cd7f6', left: 60, top: 45, size: 2.7, duration: 6.5, delay: 3 },
  { id: 14, color: '#ffb784', left: 75, top: 80, size: 2.3, duration: 8.5, delay: 1.5 },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(76,215,246,0.25) 0%, transparent 70%)' }}
        />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(255,183,132,0.2) 0%, transparent 70%)' }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(210,187,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(210,187,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating Particles */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particleData.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                left: `${p.left}%`,
                top: `${p.top}%`,
              }}
              animate={{
                y: [0, -150 - p.duration * 10],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 px-8 py-12 max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="text-center pt-16 pb-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-8"
          >
            <div className="relative w-2 h-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <div className="w-2 h-2 rounded-full bg-secondary absolute inset-0 animate-ping opacity-75" />
            </div>
            <span className="text-xs font-medium text-secondary">Season 4 — Now Open</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-7xl font-bold mb-4 leading-tight"
            style={{ fontFamily: 'Space Grotesk' }}
          >
            <span className="gradient-text">SkillSprint</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-on-surface-variant mb-3 max-w-xl mx-auto"
          >
            The Adaptive Coding Arena where{' '}
            <span className="text-secondary font-semibold">AI evaluators</span> and{' '}
            <span className="text-primary font-semibold">human skill</span> collide.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-on-surface-variant/60 mb-8 max-w-lg mx-auto"
          >
            Battle dynamically generated challenges. Get real-time AI feedback. Level up your coding skills across 6 combat dimensions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-4"
          >
            <Link href="/arena">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary px-8 py-3 rounded-xl text-base font-bold inline-flex items-center gap-2"
              >
                <Swords className="w-5 h-5" />
                Enter the Arena
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-ghost px-6 py-3 rounded-xl text-sm font-semibold"
              >
                View Dashboard
              </motion.button>
            </Link>
          </motion.div>
        </section>

        {/* Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const accent = accentClasses[feature.accent];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.15 }}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl p-6 transition-all duration-300 group cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl ${accent.bg} flex items-center justify-center mb-4 group-hover:${accent.glow} transition-shadow`}>
                  <Icon className={`w-6 h-6 ${accent.text}`} />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </section>

        {/* Stats Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="glass-card rounded-3xl p-8 mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, value: '2,000+', label: 'Challenges', color: 'text-primary' },
              { icon: Trophy, value: '500+', label: 'Active Coders', color: 'text-secondary' },
              { icon: Zap, value: '10K+', label: 'Submissions', color: 'text-tertiary' },
              { icon: Star, value: '6', label: 'Skill Dimensions', color: 'text-warning' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 + i * 0.1 }}
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className={`text-2xl font-bold ${stat.color} mb-1`} style={{ fontFamily: 'Space Grotesk' }}>
                  {stat.value}
                </p>
                <p className="text-xs text-on-surface-variant label-competitive">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center pb-16"
        >
          <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
          <h2
            className="text-2xl font-bold text-on-surface mb-2"
            style={{ fontFamily: 'Space Grotesk' }}
          >
            Ready to prove yourself?
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Start your journey. The arena awaits.
          </p>
          <Link href="/arena">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary px-8 py-3 rounded-xl text-base font-bold inline-flex items-center gap-2"
            >
              <Swords className="w-5 h-5" />
              Begin Your Quest
            </motion.button>
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
