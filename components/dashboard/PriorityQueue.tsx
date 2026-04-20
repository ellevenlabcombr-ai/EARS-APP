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
      <div key={athlete.id} className={`p-5 flex flex-col gap-4 border-b last:border-0 ${borderClass} ${hoverBgClass} transition-colors`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgClass} ${colorClass}`}>
              {isRisk ? <AlertTriangle size={20} /> : isMissing ? <Clock size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                {athlete.name}
                {athlete.trend === 'down' && <TrendingDown size={14} className="text-rose-500" />}
                {athlete.trend === 'up' && <TrendingUp size={14} className="text-emerald-500" />}
              </h4>
              
              {!isMissing && athlete.main_reason && (
                <p className={`text-xs font-bold mt-1 ${colorClass}`}>
                  {athlete.main_reason}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-xxs font-black uppercase tracking-widest text-slate-400 bg-slate-900 px-2 py-1 rounded">
                  Prontidão: <span className={athlete.readiness_score && athlete.readiness_score < 50 ? 'text-rose-400' : 'text-white'}>{athlete.readiness_score ?? '--'}%</span>
                </span>
                <span className="text-xxs font-black uppercase tracking-widest text-slate-400 bg-slate-900 px-2 py-1 rounded">
                  Dor: <span className={athlete.muscle_soreness && athlete.muscle_soreness >= 7 ? 'text-rose-400' : 'text-white'}>{athlete.muscle_soreness ?? '--'}</span>
                </span>
                <span className="text-xxs font-black uppercase tracking-widest text-slate-500">
                  Check-in: {getTimeSince(athlete.last_checkin)}
                </span>
              </div>

              {athlete.latest_assessment && (
                <div className="flex items-center gap-2 mt-3 text-xxs font-bold text-slate-400 bg-slate-800/30 px-3 py-1.5 rounded-lg border border-slate-800">
                  <ClipboardList size={12} className="text-cyan-500" />
                  <span className="uppercase tracking-wider">{athlete.latest_assessment.type}</span>
                  <span className="text-slate-600">•</span>
                  <span className={athlete.latest_assessment.classification === 'Alto Risco' || athlete.latest_assessment.classification === 'high' ? 'text-rose-400' : 'text-slate-300'}>
                    {athlete.latest_assessment.classification}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span>{getTimeSince(athlete.latest_assessment.date)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <Button 
              size="sm" 
              className={`flex-1 sm:flex-none w-full sm:w-32 h-8 text-xxs font-black uppercase tracking-widest ${isRisk ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-cyan-500 hover:bg-cyan-600 text-[#050B14]'}`}
              onClick={() => onViewAthlete(athlete.id)}
            >
              Avaliar Agora
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 sm:flex-none w-full sm:w-32 h-8 text-xxs font-black uppercase tracking-widest border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => onViewAthlete(athlete.id)}
            >
              Ver Atleta
            </Button>
            {athlete.latest_assessment && (
              <Button 
                size="sm" 
                variant="ghost"
                className="flex-1 sm:flex-none w-full sm:w-32 h-8 text-xxs font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                onClick={() => onViewAthlete(athlete.id)}
              >
                Ver Avaliação
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Ação Imediata */}
      {showImmediate && immediateAction.length > 0 && (
        <Card className="bg-rose-500/5 border-rose-500/20 shadow-xl ring-1 ring-rose-500/20 overflow-hidden">
          <CardHeader className="border-b border-rose-500/10 bg-rose-500/10 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              Ação Imediata
            </CardTitle>
            <span className="text-xxs font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-bounce">
              {immediateAction.length}
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {immediateAction.map(athlete => renderAthleteCard(athlete, 'risk'))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Fila Clínica */}
      {showClinical && clinicalQueue.length > 0 && (
        <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              Fila Clínica
            </CardTitle>
            <span className="text-xxs font-black bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {clinicalQueue.length}
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
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
          <CardContent className="p-0">
            <div className="flex flex-col">
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
