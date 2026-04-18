"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SafeRender } from "@/components/SafeRender";

interface TrendChartProps {
  data: { date: string; readiness: number; soreness: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-16 w-full">
      <SafeRender componentName="TrendChart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px', padding: '4px' }}
              itemStyle={{ color: '#e2e8f0' }}
              labelStyle={{ display: 'none' }}
            />
            <Line type="monotone" dataKey="readiness" stroke="#06b6d4" strokeWidth={2} dot={false} name="Prontidão" />
            <Line type="monotone" dataKey="soreness" stroke="#f43f5e" strokeWidth={2} dot={false} name="Dor" />
          </LineChart>
        </ResponsiveContainer>
      </SafeRender>
    </div>
  );
}
