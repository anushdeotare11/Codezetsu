'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Trophy } from 'lucide-react';
import { Achievement } from '@/lib/mockData';

interface AchievementUnlockProps {
  achievement: Achievement | null;
  onComplete?: () => void;
}

export default function AchievementUnlock({ achievement, onComplete }: AchievementUnlockProps) {
  const [particles, setParticles] = useState<{ id: number; angle: number; distance: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    if (achievement) {
      // Play celebratory sound effect using Web Audio API
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Tada chord arpeggio
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
      } catch (e) {
        console.log('Audio not supported or auto-play blocked', e);
      }

      // Generate radial particles
      const newParticles = Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        angle: (i / 24) * 360,
        distance: 80 + Math.random() * 60,
        size: 3 + Math.random() * 4,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);

      const timeout = setTimeout(() => {
        onComplete?.();
      }, 3500);
      return () => clearTimeout(timeout);
    }
  }, [achievement, onComplete]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[180] flex items-center justify-center pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(79,156,249,0.08) 0%, rgba(11,15,26,0.88) 60%)',
        }}
      >
        {/* Radial Particles */}
        {particles.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          const x = Math.cos(rad) * p.distance;
          const y = Math.sin(rad) * p.distance;
          
          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: '50%',
                top: '50%',
                background: p.id % 3 === 0 ? '#4F9CF9' : p.id % 3 === 1 ? '#FBBF24' : '#EC4899',
                boxShadow: `0 0 8px ${p.id % 3 === 0 ? '#4F9CF9' : p.id % 3 === 1 ? '#FBBF24' : '#EC4899'}`,
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: [0, x * 0.5, x],
                y: [0, y * 0.5, y],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 1.2,
                delay: p.delay,
                ease: 'easeOut',
              }}
            />
          );
        })}

        {/* Golden Ring Pulse */}
        {[1, 2].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full"
            style={{
              border: '3px solid #FBBF24',
              boxShadow: '0 0 20px rgba(251,191,36,0.5)',
            }}
            initial={{ width: 50, height: 50, opacity: 0.8 }}
            animate={{
              width: [50, 300],
              height: [50, 300],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1,
              delay: 0.3 + ring * 0.15,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Main Content */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="rounded-3xl p-8 text-center relative"
          style={{
            background: 'rgba(17, 24, 39, 0.8)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 0 60px rgba(251,191,36,0.3), 0 0 100px rgba(79,156,249,0.1)',
            border: '1px solid rgba(251,191,36,0.2)',
          }}
        >
          {/* Corner Stars */}
          {[
            { left: '10%', top: '15%' },
            { right: '10%', top: '15%' },
            { left: '15%', bottom: '20%' },
            { right: '15%', bottom: '20%' },
          ].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={pos}
              animate={{
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Star className="w-4 h-4 text-warning fill-warning" />
            </motion.div>
          ))}

          {/* Trophy/Badge */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="mb-4"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl relative"
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(79,156,249,0.15))',
                boxShadow: '0 0 30px rgba(251,191,36,0.2)',
              }}
            >
              <span className="text-4xl">{achievement.icon}</span>
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Sparkles className="w-5 h-5 text-warning" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Achievement Unlocked Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-warning" />
              <span className="text-xs font-bold text-warning uppercase tracking-widest">
                Achievement Unlocked!
              </span>
              <Trophy className="w-4 h-4 text-warning" />
            </div>

            <h2
              className="text-2xl font-bold text-on-surface mb-1"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              {achievement.name}
            </h2>

            <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
              {achievement.description}
            </p>
          </motion.div>

          {/* Bonus XP */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: 'spring' }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(79,156,249,0.12)', border: '1px solid rgba(79,156,249,0.15)' }}
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-sm text-primary font-semibold">+100 XP</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
