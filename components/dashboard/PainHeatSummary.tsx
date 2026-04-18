"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface PainHeatSummaryProps {
  painData: { part: string; count: number }[];
}

export function PainHeatSummary({ painData }: PainHeatSummaryProps) {
  const maxCount = Math.max(...painData.map(d => d.count), 1);

  return (
    <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl h-full">
      <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4">
        <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-500" />
          Mapa de Dor (Últimos 7 dias)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {painData.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-4">
            Nenhum registro de dor.
          </div>
        ) : (
          <div className="space-y-4">
            {painData.map((item) => (
              <div key={item.part} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.part}</span>
                  <span className="text-slate-500">{item.count} atletas</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full" 
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
