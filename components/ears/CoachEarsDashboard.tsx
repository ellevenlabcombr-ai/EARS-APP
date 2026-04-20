
"use client";

import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  ShieldAlert, 
  Flame, 
  Activity, 
  ChevronRight, 
  Filter,
  ArrowDownRight,
  UserPlus,
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ReadinessLevel, WellnessCheckIn, AthleteProfile } from '../../types/ears';

import Image from 'next/image';

interface CoachAthleteData {
  athlete: AthleteProfile;
  latestCheckin: WellnessCheckIn | null;
  trend: number;
}

interface Props {
  data: CoachAthleteData[];
  sport?: string;
}

export const CoachEarsDashboard: React.FC<Props> = ({ data, sport = 'Toda a Equipe' }) => {
  const atRisk = data.filter(d => d.latestCheckin?.level === 'risk');
  const alertCount = data.filter(d => (d.latestCheckin?.clinical_symptoms?.length || 0) > 0).length;
  
  const avgReadiness = data.length > 0
    ? Math.round(data.reduce((acc, d) => acc + (d.latestCheckin?.readiness_score || 0), 0) / data.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
            <Users className="w-24 h-24" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Prontidão Equipe</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-black ${avgReadiness > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{avgReadiness}</span>
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase tracking-tighter italic">Total {data.length} Atletas</p>
          </div>
          <div className={`p-4 rounded-2xl ${avgReadiness > 70 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
            <Activity className="w-8 h-8" />
          </div>
        </Card>

        {[
          { label: 'Atletas em Risco', value: atRisk.length, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Alertas Médicos', value: alertCount, icon: Stethoscope, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Risco de Lesão', value: data.filter(d => (d.latestCheckin?.pain_map?.length || 0) > 0).length, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 p-6 flex items-center justify-between group overflow-hidden relative">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <span className={`text-4xl font-black ${stat.color}`}>{stat.value}</span>
              <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase tracking-tighter italic">Detecção Ativa</p>
            </div>
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monitoring List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              Monitoramento em Tempo Real - {sport}
            </h3>
          </div>

          <div className="space-y-3">
            {data.sort((a, b) => (a.latestCheckin?.readiness_score || 0) - (b.latestCheckin?.readiness_score || 0)).map((item, idx) => (
              <motion.div
                key={item.athlete.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 rounded-3xl transition-all h-full"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 p-0.5 border border-white/10 overflow-hidden relative">
                      {item.athlete.avatar_url ? (
                        <Image 
                          src={item.athlete.avatar_url} 
                          alt="" 
                          fill 
                          className="object-cover rounded-xl" 
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-900">
                           <Users className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    {item.latestCheckin?.level === 'risk' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{item.athlete.nickname || item.athlete.name}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{item.athlete.sport} • {item.athlete.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 mt-4 md:mt-0">
                  <div className="text-center min-w-[60px]">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Prontidão</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-xl font-black ${item.latestCheckin?.level === 'ready' ? 'text-emerald-400' : item.latestCheckin?.level === 'attention' ? 'text-amber-400' : 'text-rose-400'}`}>
                        {item.latestCheckin?.readiness_score}%
                      </span>
                    </div>
                  </div>

                  <div className="hidden lg:block text-left min-w-[120px]">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Indicadores</p>
                    <div className="flex gap-1.5">
                      {item.latestCheckin?.clinical_symptoms?.length ? (
                        <div className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center" title="Sintomas">
                          <AlertCircle className="w-3 h-3" />
                        </div>
                      ) : null}
                      {item.latestCheckin?.pain_map?.length ? (
                        <div className="w-5 h-5 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center" title="Dor">
                          <Flame className="w-3 h-3" />
                        </div>
                      ) : null}
                      <div className={`w-5 h-5 rounded-lg ${item.trend >= 0 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'} flex items-center justify-center`}>
                        <ArrowDownRight className={`w-3 h-3 ${item.trend >= 0 ? '-rotate-90' : ''}`} />
                      </div>
                    </div>
                  </div>

                  <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-slate-900 border-rose-500/30 overflow-hidden group">
            <CardHeader className="bg-rose-500/5 border-b border-rose-500/10">
              <CardTitle className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Deteções Críticas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {atRisk.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/20 mx-auto mb-3" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nenhum risco detectado</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {atRisk.map(athlete => (
                    <div key={athlete.athlete.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-rose-500/20 flex items-center justify-center text-xs font-bold text-rose-400">
                          {athlete.latestCheckin?.readiness_score}%
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase">{athlete.athlete.name}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Queda de {athlete.trend}%</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
             <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
               <UserPlus className="w-5 h-5 text-indigo-400" />
               <p className="text-[10px] font-black text-indigo-200 uppercase tracking-tight">Vincular Novo Atleta</p>
             </div>
             <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Relatório Sintético</p>
                <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors">
                   Exportar CSV/PDF
                </button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ className, ...props }: any) => <Activity className={className} {...props} />;
