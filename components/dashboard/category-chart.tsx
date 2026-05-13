'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoryChartProps {
  data: { categoryName: string; count: number }[];
  title: string;
}

const COLORS = ['#60B5FF', '#FF9149', '#FF90BB', '#80D8C3', '#A19AD3', '#72BF78'];

export function CategoryChart({ data, title }: CategoryChartProps) {
  return (
    <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-zinc-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis 
            dataKey="categoryName" 
            stroke="#71717a" 
            tick={{ fontSize: 10 }}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#71717a" 
            tick={{ fontSize: 11 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#a1a1aa' }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
