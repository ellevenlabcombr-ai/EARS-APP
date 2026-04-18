"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface OperationalSummaryProps {
  totalAthletes: number;
  checkinsTodayCount: number;
  missingCheckinsCount: number;
  criticalAlertsCount: number;
}

export function OperationalSummary({
  totalAthletes,
  checkinsTodayCount,
  missingCheckinsCount,
  criticalAlertsCount,
}: OperationalSummaryProps) {
  const stats = [
    {
      label: "Total de Atletas",
      value: totalAthletes,
      icon: Users,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Check-ins Hoje",
      value: checkinsTodayCount,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Check-ins Faltantes",
      value: missingCheckinsCount,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Alertas Críticos",
      value: criticalAlertsCount,
      icon: AlertCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl">
      <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4">
        <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-cyan-500" />
          Resumo Operacional
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between p-4 bg-slate-800/20 border border-slate-800/50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
              <h4 className={`text-xl font-black ${stat.color}`}>
                {stat.value}
              </h4>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
