'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: number;
    label: string;
  };
}

export function StatsCard({ title, value, subtitle, icon: Icon, color = '#60B5FF', trend }: StatsCardProps) {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value || 0;
      const duration = 1000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-zinc-800/50 rounded-lg p-6 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg"
      style={{ '--card-color': color } as any}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-400 text-sm mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-1">
            {displayValue.toLocaleString()}
          </h3>
          {subtitle && (
            <p className="text-zinc-500 text-xs">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-medium ${
                (trend?.value ?? 0) > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(trend?.value ?? 0) > 0 ? '+' : ''}{trend?.value ?? 0}%
              </span>
              <span className="text-xs text-zinc-500">{trend?.label ?? ''}</span>
            </div>
          )}
        </div>
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}
