"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, User, ChevronRight, TrendingUp, TrendingDown, Minus, AlertTriangle, AlertCircle, Clock, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrendChart } from "./TrendChart";
import { parseDateString } from "@/lib/utils";

export type RiskLevel = "high" | "attention" | "stable" | "none";

export interface PrioritizedAthlete {
  id: string;
  name: string;
  readiness_score: number | null;
  muscle_soreness: number | null;
  last_checkin: string | null;
  risk_level: RiskLevel;
  trend: 'up' | 'down' | 'stable';
  history: { date: string; readiness: number; soreness: number }[];
  latest_assessment?: {
    type: string;
    classification: string;
    date: string;
  } | null;
  main_reason?: string;
  is_missing_checkin?: boolean;
  clinical_insight?: {
    riskLabel: string;
    reason: string;
    suggestion: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  risk_clusters?: {
    id: string;
    label: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
    factors: string[];
  }[];
  decision_mode?: 'Conservative' | 'Aggressive';
  decision_explanation?: string;
  interventions?: string[];
  clinical_tags?: { tag: string, source: 'clinical' | 'field_observation', weight: number }[];
}

interface PriorityQueueProps {
  athletes: PrioritizedAthlete[];
  onViewAthlete: (id: string) => void;
  section?: 'all' | 'immediate' | 'clinical';
}

export function PriorityQueue({ athletes, onViewAthlete, section = 'all' }: PriorityQueueProps) {
  const getTimeSince = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const diff = new Date().getTime() - parseDateString(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };

  // 1. Ação Imediata (Alto Risco)
  const immediateAction = athletes.filter(a => a.risk_level === 'high').sort((a, b) => {
    // 1. risco + avaliação crítica
    const aCritical = a.latest_assessment && (a.latest_assessment.classification === 'Alto Risco' || a.latest_assessment.classification === 'high');
    const bCritical = b.latest_assessment && (b.latest_assessment.classification === 'Alto Risco' || b.latest_assessment.classification === 'high');
    if (aCritical && !bCritical) return -1;
    if (!aCritical && bCritical) return 1;
    // 2. risco do dia (prontidão < 50 ou dor >= 7)
    const aReadiness = a.readiness_score ?? 100;
    const bReadiness = b.readiness_score ?? 100;
    return aReadiness - bReadiness;
  });

  // 2. Fila Clínica (Atenção)
  const clinicalQueue = athletes.filter(a => a.risk_level === 'attention').sort((a, b) => {
    // 3. atenção com tendência piorando
    if (a.trend === 'down' && b.trend !== 'down') return -1;
    if (a.trend !== 'down' && b.trend === 'down') return 1;
    // 4. atenção simples (ordena por prontidão)
    const aReadiness = a.readiness_score ?? 100;
    const bReadiness = b.readiness_score ?? 100;
    return aReadiness - bReadiness;
  });

  // 3. Sem check-in hoje
  const missingCheckin = athletes.filter(a => a.is_missing_checkin && a.risk_level !== 'high' && a.risk_level !== 'attention');

  const showImmediate = section === 'all' || section === 'immediate';
  const showClinical = section === 'all' || section === 'clinical';

  const isImmediateEmpty = immediateAction.length === 0;
  const isClinicalEmpty = clinicalQueue.length === 0 && missingCheckin.length === 0;

  if (section === 'immediate' && isImmediateEmpty) {
    return null;
  }

  const showEmptyState = section === 'all' 
    ? (isImmediateEmpty && isClinicalEmpty) 
    : (section === 'clinical' && isClinicalEmpty);

  const renderAthleteCard = (athlete: PrioritizedAthlete, type: 'risk' | 'attention' | 'missing') => {
    const isRisk = type === 'risk';
    const isMissing = type === 'missing';
    const colorClass = isRisk ? 'text-rose-500' : isMissing ? 'text-slate-400' : 'text-amber-500';
    const bgClass = isRisk ? 'bg-rose-500/10' : isMissing ? 'bg-slate-800/50' : 'bg-amber-500/10';
    const borderClass = isRisk ? 'border-rose-500/20' : isMissing ? 'border-slate-800' : 'border-amber-500/20';
    const hoverBgClass = isRisk ? 'hover:bg-rose-500/5' : isMissing ? 'hover:bg-slate-800/30' : 'hover:bg-amber-500/5';

    return (
      <div key={athlete.id} className={`p-6 flex flex-col gap-4 rounded-2xl border shadow-sm ${borderClass} ${bgClass} ${hoverBgClass} transition-all relative overflow-hidden group`}>
        {/* Subtle accent border on left */}
        <div className={`absolute top-0 left-0 w-1 h-full ${isRisk ? 'bg-rose-500/50' : isMissing ? 'bg-slate-700/50' : 'bg-amber-500/50'}`}></div>
        
        <div className="flex flex-col gap-6 relative z-10 pl-2">
          <div className="flex items-start gap-4 w-full">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${bgClass} ${colorClass}`}>
              {isRisk ? <AlertTriangle size={24} /> : isMissing ? <Clock size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  {athlete.name}
                  {athlete.trend === 'down' && <TrendingDown size={16} className="text-rose-500" />}
                  {athlete.trend === 'up' && <TrendingUp size={16} className="text-emerald-500" />}
                </h4>
                {athlete.clinical_insight && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                    athlete.clinical_insight.priority === 'critical' ? 'bg-rose-500 text-white' :
                    athlete.clinical_insight.priority === 'high' ? 'bg-orange-500 text-white' :
                    athlete.clinical_insight.priority === 'medium' ? 'bg-amber-500 text-white' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {athlete.clinical_insight.riskLabel}
                  </span>
                )}
                {athlete.decision_mode && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                    athlete.decision_mode === 'Conservative' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {athlete.decision_mode === 'Conservative' ? '🛡️ Conservador' : '⚡ Agressivo'}
                  </span>
                )}
              </div>
              
              {athlete.clinical_insight && (
                <div className="mb-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800/60 shadow-inner">
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    <span className="text-cyan-500 font-black uppercase text-[10px] tracking-widest block mb-1">Clinical Context & Insight</span>
                    {athlete.clinical_insight.reason}
                  </p>
                  
                  {athlete.clinical_tags && athlete.clinical_tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {athlete.clinical_tags.map((tag, idx) => (
                        <span key={idx} className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${tag.source === 'field_observation' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                          {tag.tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                    <p className="text-xs text-emerald-400/90 font-bold flex items-center gap-1.5">
                      <Activity size={12} />
                      Suggested Action: {athlete.clinical_insight.suggestion}
                    </p>
                    
                    {athlete.decision_explanation && (
                      <p className="text-[11px] text-slate-400 italic mt-1.5 ml-4 border-l-2 border-slate-700 pl-2">&quot;{athlete.decision_explanation}&quot;</p>
                    )}
                  </div>
                </div>
              )}

              {athlete.risk_clusters && athlete.risk_clusters.length > 0 && (
                <div className="flex flex-wrap gap-2.5 mb-4">
                  {athlete.risk_clusters.map((cluster) => (
                    <div key={cluster.id} className="bg-slate-800/50 border border-slate-700/60 px-3 py-1.5 rounded-lg flex items-center gap-3">
                       <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">{cluster.label}</span>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="h-1.5 w-20 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${cluster.score > 70 ? 'bg-rose-500' : cluster.score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${cluster.score}%` }} 
                            />
                          </div>
                          <span className="text-[10px] font-black text-slate-300">{cluster.score}%</span>
                        </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg">
                  Prontidão: <span className={athlete.readiness_score && athlete.readiness_score < 50 ? 'text-rose-400' : 'text-white'}>{athlete.readiness_score ?? '--'}%</span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg">
                  Dor: <span className={athlete.muscle_soreness && athlete.muscle_soreness >= 7 ? 'text-rose-400' : 'text-white'}>{athlete.muscle_soreness ?? '--'}</span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                  <Clock size={12} />
                  Check-in: {getTimeSince(athlete.last_checkin)}
                </span>
              </div>

              {athlete.latest_assessment && (
                <div className="flex items-center gap-2.5 mt-3 text-xs font-bold text-slate-400 bg-slate-800/30 px-3.5 py-2 rounded-xl border border-slate-700/50 w-max">
                  <ClipboardList size={14} className="text-cyan-500" />
                  <span className="uppercase tracking-widest">{athlete.latest_assessment.type}</span>
                  <span className="text-slate-600">•</span>
                  <span className={athlete.latest_assessment.classification === 'Alto Risco' || athlete.latest_assessment.classification === 'high' ? 'text-rose-400 font-black' : 'text-slate-300'}>
                    {athlete.latest_assessment.classification}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span>{getTimeSince(athlete.latest_assessment.date)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end w-full pt-4 border-t border-slate-800/50 relative z-20">
            <Button 
              size="lg" 
              className={`w-full sm:w-48 h-10 text-xs font-black uppercase tracking-widest shadow-lg ${isRisk ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20' : 'bg-cyan-500 hover:bg-cyan-400 text-[#050B14] shadow-cyan-500/20'}`}
              onClick={() => onViewAthlete(athlete.id)}
            >
              Ver Atleta <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Sniper Mode (Alta Prioridade) */}
      {showImmediate && immediateAction.length > 0 && (
        <Card className="bg-rose-500/5 border-rose-500/20 shadow-xl ring-1 ring-rose-500/20 overflow-hidden">
          <CardHeader className="border-b border-rose-500/10 bg-rose-500/10 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              Sniper Mode (Alta Prioridade)
            </CardTitle>
            <span className="text-xxs font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-bounce">
              {immediateAction.length}
            </span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {immediateAction.map(athlete => renderAthleteCard(athlete, 'risk'))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Radar Mode (Monitoramento Contínuo) */}
      {showClinical && clinicalQueue.length > 0 && (
        <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              Radar Mode (Monitoramento)
            </CardTitle>
            <span className="text-xxs font-black bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {clinicalQueue.length}
            </span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {clinicalQueue.map(athlete => renderAthleteCard(athlete, 'attention'))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Sem check-in hoje */}
      {showClinical && missingCheckin.length > 0 && (
        <Card className="bg-slate-900/20 border-slate-800/30 shadow-none overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
          <CardHeader className="border-b border-slate-800/30 bg-slate-900/10 px-6 py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xxs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Sem Check-in Hoje
            </CardTitle>
            <span className="text-xxs font-black bg-slate-800/50 text-slate-500 px-2 py-0.5 rounded-full">
              {missingCheckin.length}
            </span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {missingCheckin.map(athlete => renderAthleteCard(athlete, 'missing'))}
            </div>
          </CardContent>
        </Card>
      )}

      {showEmptyState && (
        <div className="p-10 text-center flex flex-col items-center justify-center space-y-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
            <Activity size={32} />
          </div>
          <p className="text-emerald-500 font-bold text-lg uppercase tracking-widest">✅ Fila Clínica Vazia</p>
          <p className="text-slate-400 text-sm">Nenhum atleta requer atenção clínica no momento.</p>
        </div>
      )}
    </div>
  );
}
