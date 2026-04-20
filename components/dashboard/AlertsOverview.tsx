"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface AlertsOverviewProps {
  highRiskCount: number;
  attentionCount: number;
  stableCount: number;
  missingCheckinCount: number;
}

export function AlertsOverview({
  highRiskCount,
  attentionCount,
  stableCount,
  missingCheckinCount,
}: AlertsOverviewProps) {
  const alerts = [
    {
      label: "Alto Risco",
      value: highRiskCount,
      icon: AlertCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      label: "Atenção",
      value: attentionCount,
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Estáveis",
      value: stableCount,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Sem Check-in",
      value: missingCheckinCount,
      icon: Clock,
      color: "text-slate-400",
      bg: "bg-slate-800/50",
      border: "border-slate-700/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {alerts.map((alert) => (
        <Card key={alert.label} className={`${alert.bg} ${alert.border} border shadow-lg`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">
                  {alert.label}
                </p>
                <h3 className={`text-3xl font-black ${alert.color}`}>
                  {alert.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${alert.bg} ${alert.color}`}>
                <alert.icon size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
