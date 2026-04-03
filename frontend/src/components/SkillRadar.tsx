'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import { SkillData } from '@/lib/mockData';

interface SkillRadarProps {
  data: SkillData[];
  size?: 'sm' | 'md' | 'lg';
}

export default function SkillRadar({ data, size = 'md' }: SkillRadarProps) {
  const heights = { sm: 250, md: 320, lg: 400 };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-card rounded-2xl p-5"
      style={{ border: '1px solid rgba(79,156,249,0.06)' }}
    >
      <h3
        className="text-sm font-semibold text-on-surface mb-1"
        style={{ fontFamily: 'Space Grotesk' }}
      >
        Skill Matrix
      </h3>
      <p className="text-xs text-on-surface-variant mb-4">Your combat analysis across 6 dimensions</p>

      <ResponsiveContainer width="100%" height={heights[size]}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid
            stroke="rgba(79,156,249,0.08)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="skillName"
            tick={{
              fill: '#94A3B8',
              fontSize: 11,
              fontFamily: 'Inter',
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 10]}
            tick={{ fill: '#64748B', fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            name="Skills"
            dataKey="score"
            stroke="#4F9CF9"
            strokeWidth={2}
            fill="url(#skillGradient)"
            fillOpacity={0.35}
            dot={{ fill: '#EC4899', r: 4, strokeWidth: 0 }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <defs>
            <linearGradient id="skillGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4F9CF9" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#EC4899" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const d = payload[0].payload as SkillData;
              return (
                <div
                  className="rounded-xl px-3 py-2"
                  style={{
                    background: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(79,156,249,0.15)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <p className="text-xs font-semibold text-on-surface">{d.skillName}</p>
                  <p className="text-sm font-bold text-primary">{d.score.toFixed(1)} / 10</p>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
