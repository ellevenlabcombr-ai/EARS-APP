"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertOctagon, TrendingDown, Activity, ChevronRight, TrendingUp, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HighPriorityAthlete {
  id: string;
  name: string;
  readiness: number;
  soreness: number;
  trend: 'up' | 'down' | 'stable';
  reason: string;
}

interface HighPrioritySectionProps {
  athletes: HighPriorityAthlete[];
  onViewAthlete: (id: string) => void;
}

export function HighPrioritySection({ athletes, onViewAthlete }: HighPrioritySectionProps) {
  if (athletes.length === 0) return null;

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={16} />;
    if (trend === 'down') return <TrendingDown size={16} />;
    return <Minus size={16} />;
  };

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-sm font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
        <AlertOctagon size={16} />
        Ação Imediata Necessária
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {athletes.map(athlete => (
          <Card key={athlete.id} className="bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-500/5">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{athlete.name}</h3>
                  <p className="text-xs text-rose-400 font-medium mt-1">{athlete.reason}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                  {getTrendIcon(athlete.trend)}
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Prontidão</p>
                  <p className="text-xl font-black text-white">{athlete.readiness}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Dor</p>
                  <p className="text-xl font-black text-white">{athlete.soreness}/10</p>
                </div>
              </div>
              <Button 
                onClick={() => onViewAthlete(athlete.id)}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs uppercase tracking-widest font-bold"
              >
                Avaliar Atleta <ChevronRight size={14} className="ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
