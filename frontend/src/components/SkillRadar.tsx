


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
            stroke="rgba(74,68,85,0.3)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="skillName"
            tick={{
              fill: '#ccc3d8',
              fontSize: 11,
              fontFamily: 'Inter',
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 10]}
            tick={{ fill: '#958da1', fontSize: 9 }}
            axisLine={false}
          />
          <Radar
            name="Skills"
            dataKey="score"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="url(#skillGradient)"
            fillOpacity={0.4}
            dot={{ fill: '#4cd7f6', r: 4, strokeWidth: 0 }}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <defs>
            <linearGradient id="skillGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#4cd7f6" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const d = payload[0].payload as SkillData;
              return (
                <div className="glass-card rounded-lg px-3 py-2">
                  <p className="text-xs font-semibold text-on-surface">{d.skillName}</p>
                  <p className="text-sm font-bold text-secondary">{d.score.toFixed(1)} / 10</p>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
