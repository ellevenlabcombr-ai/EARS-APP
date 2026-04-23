
"use client";

import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  AlertTriangle,
  ClipboardList,
  Target,
  Tag,
  Activity,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SessionDecision, ExecutionStep } from '../../lib/priority-engine';

interface SessionModePanelProps {
  visibleBlocks: string[];
  decision: SessionDecision;
  content: {
    factors: string[];
    actions: string[];
    tags: string[];
    executionPlan: ExecutionStep[];
  };
  metrics?: {
    readiness: number;
    trend: number;
  };
  confidence: {
    level: string;
    score: number;
  };
}

export const SessionModePanel: React.FC<SessionModePanelProps> = ({ 
  visibleBlocks, 
  decision, 
  content, 
  metrics,
  confidence 
}) => {
  const isBlockVisible = (id: string) => visibleBlocks.includes(id);

  const getDecisionTheme = () => {
    switch(decision) {
      case 'hold': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'Interrupção (HOLD)', icon: ShieldAlert };
      case 'recovery': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Recovery Ativo', icon: Info };
      case 'modified_train': return { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', label: 'Treino Modificado', icon: Zap };
      case 'full_train': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Performance Total', icon: Target };
      default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', label: 'Aguardando', icon: Info };
    }
  };

  const theme = getDecisionTheme();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 1. Decision Header */}
      {isBlockVisible('DecisionHeader') && (
        <Card className={`border-2 shadow-2xl relative overflow-hidden transition-all duration-500 ${theme.bg} ${theme.border}`}>
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <theme.icon className="w-32 h-32" />
          </div>
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-500" />
              Decisão Clínica da Sessão
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <motion.h3 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className={`text-5xl font-black uppercase tracking-tighter ${theme.color} mb-2`}
            >
              {theme.label}
            </motion.h3>
            <p className="text-lg font-bold text-slate-300 max-w-xl leading-snug">
              {decision === 'hold' ? 'Risco agudo identificado pelo sistema. Prioridade total para recuperação e diagnóstico.' : 
               decision === 'modified_train' ? 'Adaptação necessária por sinais de fadiga. Modulação de volume e foco em segurança.' :
               decision === 'recovery' ? 'Foco em regeneração sistêmica e mobilidade. Evitar picos de impacto.' :
               'Atleta apto para carga máxima planejada. Estabilidade sistêmica validada.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 1.1 Warning Banner */}
      {isBlockVisible('WarningBanner') && (
        <div className="p-4 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <p className="text-sm font-bold text-amber-200 uppercase tracking-tight">
            ALERTA: Baixa confiança na análise. Decisão conservadora aplicada.
          </p>
        </div>
      )}

      {/* 1.2 Session Rules (Specific for HOLD) */}
      {isBlockVisible('SessionRules') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Impacto</h4>
            <p className="text-sm font-bold text-white uppercase">ZERO</p>
          </div>
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Carga</h4>
            <p className="text-sm font-bold text-white uppercase">Sessão Suspensa</p>
          </div>
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Foco</h4>
            <p className="text-sm font-bold text-white uppercase">Clínico</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Key Factors */}
        {isBlockVisible('KeyFactors') && (
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-500" /> Fatores Críticos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.factors.map((f, i) => (
                <div key={i} className="px-5 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-[13px] font-black text-white uppercase tracking-tight flex items-center gap-4 transition-all hover:bg-slate-950/80">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  {f}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 4. Focus Tags */}
        {isBlockVisible('FocusTags') && (
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-500" /> Tags de Foco Clínico
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              {content.tags.map((t, i) => (
                <div key={i} className="px-5 py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-[11px] font-black text-purple-400 uppercase tracking-widest">
                  {t}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 5. Execution Plan */}
      {isBlockVisible('ExecutionPlan') && (
        <Card className="bg-slate-900/40 border-slate-800 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-slate-900/60">
            <CardTitle className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-cyan-500" /> Plano de Execução Imediata
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              {content.executionPlan.map((step, sIdx) => (
                <div key={sIdx} className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <div className="h-[1px] w-4 bg-slate-800" />
                      {step.title}
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {step.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-5 bg-slate-950/40 border border-white/5 rounded-3xl group transition-all hover:border-cyan-500/30">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <CheckCircle className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </div>
                        <span className="text-[13px] font-black text-slate-100 uppercase tracking-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 6. Metrics Panel */}
        {isBlockVisible('MetricsPanel') && metrics && (
           <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                 <p className="text-xxs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Prontidão (Decayed)</p>
                 <div className="text-4xl font-black text-white">{metrics.readiness}%</div>
              </CardContent>
           </Card>
        )}

        {/* 7. Trend Panel */}
        {isBlockVisible('TrendPanel') && metrics && (
           <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                 <p className="text-xxs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Tendência (7d)</p>
                 <div className={`flex items-center gap-2 text-xl font-black ${metrics.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {metrics.trend >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {metrics.trend > 0 ? '+' : ''}{metrics.trend.toFixed(1)}
                 </div>
              </CardContent>
           </Card>
        )}

        {/* 8. Confidence Badge */}
        {isBlockVisible('ConfidenceBadge') && (
           <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                 <p className="text-xxs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Confiança da Análise</p>
                 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    confidence.level === 'high' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                    confidence.level === 'moderate' ? 'bg-amber-500 text-white' :
                    'bg-rose-500 text-white'
                 }`}>
                    {confidence.level} Analysis
                 </div>
              </CardContent>
           </Card>
        )}
      </div>
    </motion.div>
  );
};
