"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import {
  Users,
  AlertCircle,
  Activity,
  ClipboardList,
  Search,
  Filter,
  ChevronRight,
  Stethoscope,
  MessageSquare,
  CheckCircle2,
  ChevronLeft,
  Calendar,
  BarChart3,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLocalDateString } from "@/lib/utils";

interface AthleteData {
  id: string;
  athlete_code?: string;
  name: string;
  readiness: number;
  status: string;
  pain: { part: string; level: number } | null;
  notes: string;
  lastUpdate: string;
}

interface PhysioDashboardProps {
  onBack: () => void;
}

const getPainLocationLabel = (id: string): string => {
  const mapping: Record<string, string> = {
    head_f: "Cabeça (F)",
    neck_f: "Pescoço (F)",
    chest: "Peitoral",
    abs: "Abdômen",
    shoulder_l_f: "Ombro Esq. (F)",
    shoulder_r_f: "Ombro Dir. (F)",
    biceps_l_f: "Bíceps Esq.",
    biceps_r_f: "Bíceps Dir.",
    forearm_l_f: "Antebraço Esq.",
    forearm_r_f: "Antebraço Dir.",
    hand_l_f: "Mão Esq.",
    hand_r_f: "Mão Dir.",
    pelvis_f: "Pelve / Oblíquos",
    thigh_l_f: "Coxa Esq. (Anterior)",
    thigh_r_f: "Coxa Dir. (Anterior)",
    knee_l_f: "Joelho Esq.",
    knee_r_f: "Joelho Dir.",
    calf_l_f: "Canela Esq.",
    calf_r_f: "Canela Dir.",
    foot_l_f: "Pé Esq.",
    foot_r_f: "Pé Dir.",
    head_b: "Cabeça (P)",
    neck_b: "Pescoço (P)",
    upper_back: "Trapézio",
    lats: "Dorsais",
    lower_back: "Lombar",
    shoulder_l_b: "Ombro Esq. (P)",
    shoulder_r_b: "Ombro Dir. (P)",
    triceps_l_b: "Tríceps Esq.",
    triceps_r_b: "Tríceps Dir.",
    forearm_l_b: "Antebraço Esq. (P)",
    forearm_r_b: "Antebraço Dir. (P)",
    hand_l_b: "Mão Esq. (P)",
    hand_r_b: "Mão Dir. (P)",
    glutes: "Glúteos",
    hamstring_l_b: "Coxa Esq. (P)",
    hamstring_r_b: "Coxa Dir. (P)",
    calf_l_b: "Panturrilha Esq.",
    calf_r_b: "Panturrilha Dir.",
    foot_l_b: "Calcanhar Esq.",
    foot_r_b: "Calcanhar Dir.",
  };
  return mapping[id] || id.replace(/_/g, " ");
};

export function PhysioDashboard({ onBack }: PhysioDashboardProps) {
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [pendenciesCount, setPendenciesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      if (!supabase) return;

      // Fetch data in parallel to improve performance
      // Reduced range to 14 days to prevent timeouts on large datasets
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const dateFilter = getLocalDateString(fourteenDaysAgo);

      const [athletesResponse, wellnessResponse, painResponse] = await Promise.all([
        supabase
          .from('athletes')
          .select('id, athlete_code, name, readiness_score, risk_level, updated_at')
          .order('name', { ascending: true })
          .limit(50), // Reduced limit to prevent timeout
        
        supabase
          .from('wellness_records')
          .select('athlete_id, record_date, comments, readiness_score')
          .gte('record_date', dateFilter)
          .order('record_date', { ascending: false })
          .limit(100), // Reduced limit to prevent timeout
          
        supabase
          .from('pain_reports')
          .select('athlete_id, body_part_id, pain_level, created_at')
          .gte('created_at', fourteenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(100), // Reduced limit to prevent timeout
      ]);

      if (athletesResponse.error) {
        if (athletesResponse.error.code === '57014' && retryCount < 2) {
          console.warn(`Timeout fetching physio data, retrying... (${retryCount + 1}/2)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchDashboardData(retryCount + 1);
        }
        throw athletesResponse.error;
      }
      if (wellnessResponse.error) throw wellnessResponse.error;
      if (painResponse.error) throw painResponse.error;

      const athletesData = athletesResponse.data;
      const wellnessData = wellnessResponse.data;
      const painData = painResponse.data;

      // Calculate pendencies
      let pCount = 0;
      if (athletesData) {
        // 1. Athletes without wellness today
        const today = getLocalDateString();
        const athletesWithWellnessToday = new Set(wellnessData?.filter(w => w.record_date === today).map(w => w.athlete_id));
        const missingWellness = athletesData.filter(a => !athletesWithWellnessToday.has(a.id)).length;
        pCount += missingWellness;

        // 2. Overdue billings (removed)
        // pCount += (billingsData?.length || 0);

        setPendenciesCount(pCount);
      }

      if (athletesData) {
        const mappedData: AthleteData[] = athletesData.map(athlete => {
          // Find latest wellness record for this athlete
          const latestRecord = wellnessData?.find(w => w.athlete_id === athlete.id);
          
          // Find latest pain report for this athlete
          const latestPain = painData?.find(p => p.athlete_id === athlete.id);
          
          let pain = null;
          if (latestPain) {
             pain = { part: latestPain.body_part_id, level: latestPain.pain_level };
          }

          return {
            id: athlete.id,
            athlete_code: athlete.athlete_code,
            name: athlete.name,
            readiness: latestRecord?.readiness_score || athlete.readiness_score || 0,
            status: athlete.risk_level === 'Alto' ? 'dm' : (athlete.risk_level === 'Médio' ? 'transition' : 'active'),
            pain: pain,
            notes: latestRecord?.comments || "",
            lastUpdate: new Date(athlete.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
        });
        setAthletes(mappedData);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      console.dir(error); // See the full object in console
      
      let errorMsg = 'Erro desconhecido';
      if (error?.message) errorMsg = error.message;
      else if (error?.details) errorMsg = error.details;
      else if (error?.code) errorMsg = `Código: ${error.code}`;
      else if (typeof error === 'string') errorMsg = error;
      else {
        try {
          errorMsg = JSON.stringify(error);
          if (errorMsg === '{}') errorMsg = String(error);
        } catch (e) {
          errorMsg = String(error);
        }
      }
      console.error('Detailed error message:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const alerts = athletes.filter(
    (a) => (a.pain && a.pain.level >= 5) || a.readiness < 50 || a.status === "dm"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "transition":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "dm":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativa";
      case "transition":
        return "Transição";
      case "dm":
        return "DM";
      default:
        return status;
    }
  };

  const getReadinessColor = (score: number) => {
    if (score === 0) return "text-slate-500";
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-rose-400";
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A1120]/80 backdrop-blur-md border-b border-slate-800/50 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 pl-12 lg:pl-0">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 truncate">
                EARS <span className="text-cyan-500">|</span> ELLEVEN
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
                Portal da Fisioterapia • Dra. Cristina
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-300">Sistema Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Command Center Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-blue-500/10 rounded-2xl mb-3">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Atletas Ativos</p>
              <p className="text-3xl font-black text-white">{athletes.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-emerald-500/10 rounded-2xl mb-3">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Média Prontidão</p>
              <p className="text-3xl font-black text-white">
                {athletes.filter(a => a.readiness > 0).length > 0 
                  ? Math.round(athletes.reduce((acc, curr) => acc + curr.readiness, 0) / athletes.filter(a => a.readiness > 0).length)
                  : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-amber-500/10 rounded-2xl mb-3">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pendências</p>
              <p className="text-3xl font-black text-white">{pendenciesCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-rose-500/10 border-rose-500/20 shadow-xl">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-rose-500/20 rounded-2xl mb-3">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Alertas Críticos</p>
              <p className="text-3xl font-black text-rose-400">{alerts.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-yellow-500/10 rounded-2xl mb-3">
                <Stethoscope className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Em Reabilitação</p>
              <p className="text-3xl font-black text-white">
                {athletes.filter(a => a.status === "dm").length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Action Area: Critical Alerts & Quick Access */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-rose-500" />
                Atenção Prioritária
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Tempo Real
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <div className="col-span-full text-center p-12 bg-slate-900/40 rounded-3xl border border-slate-800/50">
                  <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sincronizando dados...</p>
                </div>
              ) : alerts.length > 0 ? (
                alerts.map((athlete) => (
                  <motion.div
                    key={`alert-${athlete.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0A1120] border border-slate-800 hover:border-rose-500/30 rounded-3xl p-6 shadow-2xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <AlertCircle className="w-16 h-16 text-rose-500" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 font-black text-slate-400">
                          {athlete.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-black text-white text-lg uppercase tracking-tight">{athlete.name}</h3>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-widest ${getStatusColor(athlete.status)}`}>
                            {getStatusLabel(athlete.status)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${getReadinessColor(athlete.readiness)}`}>
                          {athlete.readiness}%
                        </p>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Prontidão</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {athlete.pain && (
                        <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Dor Relatada</span>
                            <span className={`text-xs font-black ${
                              athlete.pain.level <= 3 ? 'text-emerald-400' : 
                              athlete.pain.level <= 6 ? 'text-yellow-400' : 'text-rose-400'
                            }`}>{athlete.pain.level}/10</span>
                          </div>
                          <p className="text-sm text-white font-bold">{getPainLocationLabel(athlete.pain.part)}</p>
                        </div>
                      )}

                      {athlete.notes && (
                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Observação</span>
                          <p className="text-xs text-slate-300 italic leading-relaxed">&quot;{athlete.notes}&quot;</p>
                        </div>
                      )}
                    </div>

                    <Button 
                      variant="ghost" 
                      className="w-full mt-4 bg-slate-900/50 hover:bg-cyan-500 hover:text-[#050B14] text-cyan-500 border border-slate-800 hover:border-cyan-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      Acessar Prontuário
                    </Button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center p-12 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
                  <p className="text-emerald-400 font-black uppercase tracking-widest text-xs">Todos os atletas em conformidade</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions & Recent Activity */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-cyan-500" />
              Atividade Recente
            </h2>

            <Card className="bg-slate-900/40 border-slate-800/50 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800/50">
                  {athletes.filter(a => a.readiness > 0).slice(0, 6).map((athlete, i) => (
                    <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-800/20 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${getStatusColor(athlete.status)} border shadow-lg group-hover:scale-110 transition-transform`}>
                          {athlete.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">{athlete.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{athlete.lastUpdate}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-black ${getReadinessColor(athlete.readiness)}`}>{athlete.readiness}%</span>
                        <div className="flex items-center justify-end gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${getReadinessColor(athlete.readiness).replace('text-', 'bg-')}`} />
                          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Score</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {athletes.filter(a => a.readiness > 0).length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-slate-500 text-xs font-black uppercase tracking-widest italic">Nenhuma atividade registrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Agenda", icon: Calendar, color: "bg-purple-500", desc: "Ver compromissos" },
              ].map((action, i) => (
                <motion.button
                  key={i}
                  whileHover={{ y: -5 }}
                  className="bg-[#0A1120] border border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center gap-3 group hover:border-cyan-500/30 transition-all shadow-xl"
                >
                  <div className={`p-4 ${action.color}/10 rounded-2xl text-${action.color.split('-')[1]}-400 group-hover:bg-cyan-500 group-hover:text-[#050B14] transition-all`}>
                    <action.icon size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest block">{action.label}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{action.desc}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
