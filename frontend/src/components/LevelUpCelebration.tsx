'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Star, Sparkles, Zap } from 'lucide-react';

interface LevelUpCelebrationProps {
  show: boolean;
  newLevel: number;
  levelTitle: string;
  onComplete?: () => void;
}

export default function LevelUpCelebration({ show, newLevel, levelTitle, onComplete }: LevelUpCelebrationProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    if (show) {
      // Play dramatic level-up sound effect
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Power-up swoop
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4); // A5
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.0);
      } catch (e) {
        console.log('Audio not supported or auto-play blocked', e);
      }

      // Generate celebration particles
      const newParticles = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#7c3aed', '#4cd7f6', '#ffb784', '#4ade80', '#fbbf24', '#ff6b6b'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);

      const timeout = setTimeout(() => {
        onComplete?.();
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, rgba(12,12,29,0.9) 70%)',
          }}
        >
          {/* Confetti Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${particle.x}%`,
                top: '50%',
                background: particle.color,
                boxShadow: `0 0 10px ${particle.color}`,
              }}
              initial={{ y: 0, opacity: 1, scale: 0 }}
              animate={{
                y: [0, -300 - Math.random() * 200, 400],
                x: [0, (Math.random() - 0.5) * 300],
                opacity: [0, 1, 1, 0],
                scale: [0, 1.5, 1, 0.5],
                rotate: [0, 720],
              }}
              transition={{
                duration: 2.5 + Math.random(),
                delay: particle.delay,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Ring Burst Effect */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border-2"
              style={{ borderColor: '#7c3aed' }}
              initial={{ width: 100, height: 100, opacity: 0.8 }}
              animate={{
                width: [100, 600],
                height: [100, 600],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1.5,
                delay: ring * 0.2,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Central Content */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
            className="glass-card rounded-3xl p-10 text-center relative"
            style={{
              boxShadow: '0 0 80px rgba(124,58,237,0.5), 0 0 150px rgba(76,215,246,0.2)',
            }}
          >
            {/* Floating Stars */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  top: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 180, 360],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random(),
                }}
              >
                <Star className="w-4 h-4 text-warning fill-warning" />
              </motion.div>
            ))}

            {/* Level Badge */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mb-4"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 rounded-full flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4cd7f6)',
                  boxShadow: '0 0 40px rgba(124,58,237,0.6)',
                }}
              >
                <Shield className="w-10 h-10 text-white" />
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-6 h-6 text-warning" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-warning" />
                <span className="text-sm font-bold text-warning uppercase tracking-widest">Level Up!</span>
                <Zap className="w-5 h-5 text-warning" />
              </div>

              <h1
                className="text-5xl font-black mb-2"
                style={{
                  fontFamily: 'Space Grotesk',
                  background: 'linear-gradient(135deg, #d2bbff, #7c3aed, #4cd7f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Level {newLevel}
              </h1>

              <p className="text-lg text-on-surface-variant font-medium">{levelTitle}</p>
            </motion.div>

            {/* XP Burst */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20"
            >
              <span className="text-success font-bold">+500 XP Bonus</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
