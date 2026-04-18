"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing, TrendingDown, Clock, Activity, CheckCircle2, History, Loader2, AlertCircle } from "lucide-react";
import { ClinicalAlert } from "@/types/database";
import { Button } from "@/components/ui/button";
import { resolveClinicalAlert } from "@/lib/clinical";

interface SmartAlertsProps {
  alerts: ClinicalAlert[];
  onRefresh?: () => void;
}

export function SmartAlerts({ alerts, onRefresh }: SmartAlertsProps) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [view, setView] = useState<'active' | 'resolved'>('active');

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  const displayAlerts = view === 'active' ? activeAlerts : resolvedAlerts;

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    const { error } = await resolveClinicalAlert(id);
    if (!error) {
      onRefresh?.();
    }
    setResolvingId(null);
  };

  const getAlertIcon = (type: string, severity: string) => {
    const colorClass = severity === 'high' ? 'text-rose-500' : severity === 'medium' ? 'text-amber-500' : 'text-blue-500';
    
    switch (type) {
      case 'readiness_drop': return <TrendingDown size={16} className={colorClass} />;
      case 'persistent_pain': return <Activity size={16} className={colorClass} />;
      case 'missing_checkin': return <Clock size={16} className="text-slate-400" />;
      case 'trend_alert': return <TrendingDown size={16} className={colorClass} />;
      case 'symptom_alert': return <AlertCircle size={16} className={colorClass} />;
      default: return <BellRing size={16} className="text-cyan-500" />;
    }
  };

  return (
    <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl h-full flex flex-col">
      <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          {view === 'active' ? (
            <BellRing className="w-4 h-4 text-amber-500" />
          ) : (
            <History className="w-4 h-4 text-slate-400" />
          )}
          {view === 'active' ? 'Alertas Ativos' : 'Histórico de Alertas'}
        </CardTitle>
        <div className="flex bg-slate-800/50 p-1 rounded-lg">
          <button 
            onClick={() => setView('active')}
            className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${view === 'active' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Ativos
          </button>
          <button 
            onClick={() => setView('resolved')}
            className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${view === 'resolved' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Histórico
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        <div className="divide-y divide-slate-800/50 overflow-y-auto custom-scrollbar flex-1">
          {displayAlerts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-4 bg-slate-800/30 rounded-full">
                {view === 'active' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
                ) : (
                  <History className="w-8 h-8 text-slate-500/20" />
                )}
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                {view === 'active' ? 'Nenhum alerta ativo' : 'Nenhum alerta no histórico'}
              </p>
            </div>
          ) : (
            displayAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 flex items-start gap-3 hover:bg-slate-800/30 transition-colors relative group ${alert.severity === 'high' ? 'bg-rose-500/5' : ''}`}>
                <div className={`mt-0.5 p-1.5 rounded-md bg-slate-800/50 shrink-0 border ${
                  alert.severity === 'high' ? 'border-rose-500/20' : 
                  alert.severity === 'medium' ? 'border-amber-500/20' : 'border-blue-500/20'
                }`}>
                  {getAlertIcon(alert.type, alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{(alert as any).athlete?.name || 'Atleta'}</h4>
                    <span className="text-[9px] font-black uppercase text-slate-500 whitespace-nowrap">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
                  
                  {view === 'active' && (
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={resolvingId === alert.id}
                        onClick={() => handleResolve(alert.id)}
                        className="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                      >
                        {resolvingId === alert.id ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        )}
                        Resolver
                      </Button>
                    </div>
                  )}

                  {view === 'resolved' && alert.resolved_at && (
                    <p className="text-[9px] font-bold text-emerald-500/60 uppercase mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Resolvido em {new Date(alert.resolved_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
