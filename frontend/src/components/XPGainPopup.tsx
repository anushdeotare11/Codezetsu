'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, Flame } from 'lucide-react';

interface XPGainPopupProps {
  show: boolean;
  xpAmount: number;
  bonusText?: string;
  position?: { x: number; y: number };
}

export default function XPGainPopup({ show, xpAmount, bonusText, position }: XPGainPopupProps) {
  useEffect(() => {
    if (show) {
      // Play brief ping sound effect
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {
        console.log('Audio not supported or auto-play blocked', e);
      }
    }
  }, [show]);

  const posStyle = position 
    ? { left: position.x, top: position.y } 
    : { right: 32, top: 100 };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed z-[150] pointer-events-none"
          style={posStyle}
        >
          <div className="relative">
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: i % 2 === 0 ? '#4cd7f6' : '#7c3aed',
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 80],
                  y: [0, -40 - Math.random() * 60],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Main XP Display */}
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 0.5, repeat: 2 }}
              className="glass-card rounded-2xl px-6 py-4 text-center relative overflow-hidden"
              style={{
                boxShadow: '0 0 30px rgba(76,215,246,0.4)',
                border: '1px solid rgba(76,215,246,0.3)',
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: 2 }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <Zap className="w-6 h-6 text-secondary fill-secondary" />
                  </motion.div>
                  <span
                    className="text-3xl font-black text-secondary"
                    style={{ fontFamily: 'Space Grotesk' }}
                  >
                    +{xpAmount}
                  </span>
                  <span className="text-lg font-bold text-secondary">XP</span>
                </div>

                {bonusText && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-1 text-xs text-tertiary font-semibold"
                  >
                    <Star className="w-3 h-3" />
                    {bonusText}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Streak Fire Animation Component
export function StreakFireAnimation({ streak }: { streak: number }) {
  if (streak < 3) return null;

  return (
    <motion.div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary/20"
      animate={{
        scale: [1, 1.1, 1],
        boxShadow: [
          '0 0 10px rgba(255,183,132,0.3)',
          '0 0 20px rgba(255,183,132,0.5)',
          '0 0 10px rgba(255,183,132,0.3)',
        ],
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <motion.div
        animate={{ 
          y: [0, -2, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <Flame className="w-4 h-4 text-tertiary" />
      </motion.div>
      <span className="text-sm font-bold text-tertiary">{streak}</span>
      {streak >= 7 && (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-[10px] text-warning font-bold"
        >
          🔥
        </motion.span>
      )}
    </motion.div>
  );
}
