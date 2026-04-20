
"use client";

import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  Calendar, 
  ChevronRight,
  Target,
  Trophy,
  Brain,
  Wind,
  Moon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PainMap, bodyParts } from '../PainMap';
import { ReadinessLevel, WellnessCheckIn, AthleteProfile } from '../../types/ears';

interface Props {
  athlete: AthleteProfile;
  history: WellnessCheckIn[];
  performanceCorrelation?: {
    load: number;
    stats: number;
    rpe: number;
  };
}

export const AthleteEarsDashboard: React.FC<Props> = ({ athlete, history, performanceCorrelation }) => {
  const latest = history[0];
  const previous = history[1];

  const chartData = [...history].reverse().map(h => ({
    date: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    score: h.readiness_score,
    sleep: h.sleep_quality * 20,
    stress: h.stress * 20,
  }));

  const getStatusColor = (lvl: ReadinessLevel) => {
    if (lvl === 'ready') return 'text-emerald-400';
    if (lvl === 'attention') return 'text-amber-400';
    return 'text-rose-400';
  };

  const getStatusBg = (lvl: ReadinessLevel) => {
    if (lvl === 'ready') return 'bg-emerald-500';
    if (lvl === 'attention') return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getStatusBorder = (lvl: ReadinessLevel) => {
    if (lvl === 'ready') return 'border-emerald-500/20';
    if (lvl === 'attention') return 'border-amber-500/20';
    return 'border-rose-500/20';
  };

  const trend = latest && previous ? latest.readiness_score - previous.readiness_score : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner: Battery & Basic Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 rounded-[2.5rem] bg-slate-900 border border-white/5 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Zap className="w-48 h-48" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xxs font-black text-slate-500 uppercase tracking-widest">Estado de Prontidão</span>
              <div className={`px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xxs font-bold text-indigo-400 uppercase tracking-widest`}>
                EARS Active
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-8xl font-black ${getStatusColor(latest?.level || 'ready')}`}
              >
                {latest?.readiness_score || 0}
              </motion.span>
              <span className="text-xl font-bold text-slate-500">%</span>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-800 rounded-full border border-white/5 overflow-hidden p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${latest?.readiness_score || 0}%` }}
                  className={`h-full rounded-full ${getStatusBg(latest?.level || 'ready')} shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                />
              </div>
              <div className="flex justify-between items-center text-xxs font-black uppercase tracking-widest text-slate-500">
                <span>Risco</span>
                <span className={getStatusColor(latest?.level || 'ready')}>
                  {latest?.level === 'ready' ? 'Condição Ideal' : latest?.level === 'attention' ? 'Em Atenção' : 'Risco Crítico'}
                </span>
                <span>Elite</span>
              </div>
            </div>

            {trend !== 0 && (
              <div className={`flex items-center gap-2 text-xs font-bold ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                <span>{trend > 0 ? '+' : ''}{trend}% em relação a ontem</span>
              </div>
            )}
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Sono', value: `${latest?.sleep_quality || 0}/5`, icon: Moon, color: 'text-blue-400', progress: (latest?.sleep_quality || 0) * 20 },
            { label: 'Recuperação', value: `${latest?.recovery || 0}/5`, icon: Wind, color: 'text-emerald-400', progress: (latest?.recovery || 0) * 20 },
            { label: 'Saúde Mental', value: `${latest?.mood || 0}/5`, icon: Brain, color: 'text-purple-400', progress: (latest?.mood || 0) * 20 },
            { 
              label: athlete.gender === 'female' ? 'Ciclo Menstrual' : 'Fisiológico', 
              value: athlete.gender === 'female' 
                ? (latest?.menstrual_cycle || 'N/A').toUpperCase() 
                : (latest?.clinical_symptoms?.length === 0 ? 'OK' : 'Alert'), 
              icon: athlete.gender === 'female' ? Calendar : Activity, 
              color: 'text-rose-400', 
              progress: athlete.gender === 'female' ? 100 : (latest?.clinical_symptoms?.length === 0 ? 100 : 40) 
            },
          ].map((m, i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-800/50 backdrop-blur-lg overflow-hidden group">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className={`p-3 rounded-2xl bg-slate-800/50 border border-white/5 w-fit mb-4 group-hover:scale-110 transition-transform ${m.color}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xxs font-black text-slate-500 uppercase tracking-widest">{m.label}</p>
                  <p className="text-xl font-black text-white">{m.value}</p>
                </div>
                <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${m.progress}%` }}
                    className={`h-full ${m.color.replace('text', 'bg')}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Analytics & Heatmap Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Trend */}
        <Card className="lg:col-span-8 bg-slate-900 border-slate-800 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Evolução de Performance
            </CardTitle>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-full bg-indigo-500 text-xxs font-black text-white uppercase tracking-widest">7 Dias</button>
              <button className="px-3 py-1 rounded-full bg-slate-800 text-xxs font-black text-slate-500 uppercase tracking-widest hover:text-slate-300">30 Dias</button>
            </div>
          </CardHeader>
          <CardContent className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="stress" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Heatmap Summary */}
        <Card className="lg:col-span-4 bg-slate-900 border-slate-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Mapa de Risco Muscular
              </div>
              {latest?.pain_map?.length > 0 && (
                <span className="text-xxs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">
                  {latest.pain_map.length} Zonas
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-auto flex flex-col items-center justify-center p-0 pb-6">
            <div className="scale-75 origin-top mb-[-60px]">
              <PainMap 
                value={(() => {
                  const map: any = {};
                  latest?.pain_map?.forEach(p => {
                    map[p.region] = { level: p.level, type: [p.type] };
                  });
                  return map;
                })()}
                readOnly={true}
              />
            </div>
            
            {/* Detailed Pain List */}
            <div className="w-full px-6 space-y-2">
              {latest?.pain_map?.map((p, idx) => {
                const regionLabel = bodyParts.find(bp => bp.id === p.region)?.label || p.region;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/50 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${p.level >= 7 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-amber-500'}`} />
                      <span className="text-xxs font-black text-white uppercase tracking-tighter">{regionLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xxs font-black text-slate-500 uppercase">{p.type === 'muscle' ? 'Muscular' : 'Articular'}</span>
                      <span className={`text-xs font-black ${p.level >= 7 ? 'text-rose-400' : 'text-amber-400'}`}>Nível {p.level}</span>
                    </div>
                  </div>
                );
              })}
              {(!latest?.pain_map || latest.pain_map.length === 0) && (
                <div className="text-center py-4">
                  <p className="text-xxs font-bold text-slate-600 uppercase tracking-widest italic">Nenhuma zona de dor relatada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Correlation */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            Correlação de Rendimento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xxs font-black text-slate-500 uppercase tracking-widest">Carga de Treino (CPE)</span>
                <span className="text-xs font-bold text-white">{performanceCorrelation?.load || 0}/100</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${performanceCorrelation?.load || 0}%` }}
                  className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                />
              </div>
              <p className="text-xxs text-slate-400 leading-relaxed italic">
                A carga atual está { (performanceCorrelation?.load || 0) > 70 ? 'acima' : 'dentro' } do esperado para manter o equilíbrio.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xxs font-black text-slate-500 uppercase tracking-widest">Rendimento Técnico</span>
                <span className="text-xs font-bold text-white">{performanceCorrelation?.stats || 0}/100</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${performanceCorrelation?.stats || 0}%` }}
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </div>
              <p className="text-xxs text-slate-400 leading-relaxed italic">
                Seu rendimento técnico tem alta correlação com a qualidade do sono relatado.
              </p>
            </div>

            <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800 flex flex-col justify-center text-center">
              <Trophy className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Status de Evolução</p>
              <h4 className="text-lg font-black text-white uppercase italic">Supercompensação</h4>
              <p className="text-xxs text-slate-400 mt-2">Você está no caminho certo para o ápice físico.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
