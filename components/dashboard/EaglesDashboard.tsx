"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import { getLocalDateString } from "@/lib/utils";

interface EaglesDashboardProps {
  onViewAthlete: (id: string) => void;
}

export function EaglesDashboard({ onViewAthlete }: EaglesDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [wellness, setWellness] = useState<any[]>([]);
  const [pain, setPain] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const today = getLocalDateString();

    try {
      // 1. Fetch Athletes from "Projeto Águias"
      const { data: athletesData, error: athletesError } = await supabase
        .from('athletes')
        .select('id, name, status, avatar_url, group_name')
        .eq('group_name', 'Projeto Águias');

      if (athletesError) throw athletesError;
      const eagleAthletes = athletesData || [];
      const athleteIds = eagleAthletes.map(a => a.id);

      if (athleteIds.length === 0) {
        setAthletes([]);
        setWellness([]);
        setPain([]);
        setAppointments([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch Wellness, Pain and Appointments for these athletes
      const [wellnessRes, painRes, appointmentsRes] = await Promise.all([
        supabase
          .from('wellness_records')
          .select('athlete_id, readiness_score, record_date')
          .in('athlete_id', athleteIds)
          .eq('record_date', today)
          .limit(100),
        supabase
          .from('pain_reports')
          .select('athlete_id, pain_level, body_part_id, created_at')
          .in('athlete_id', athleteIds)
          .gte('created_at', today)
          .limit(100),
        supabase
          .from('appointments')
          .select('id, athlete_id, date, start_time, end_time, status, type, title, athletes(name)')
          .in('athlete_id', athleteIds)
          .eq('date', today)
          .order('start_time')
          .limit(50)
      ]);

      if (wellnessRes.error) throw wellnessRes.error;
      if (painRes.error) throw painRes.error;
      if (appointmentsRes.error) throw appointmentsRes.error;

      setAthletes(eagleAthletes);
      setWellness(wellnessRes.data || []);
      setPain(painRes.data || []);
      setAppointments(appointmentsRes.data || []);

    } catch (error: any) {
      console.error("EAGLES DASHBOARD ERROR:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculations
  const totalAthletes = athletes.length;
  const checkinsCount = wellness.length;
  const noCheckinCount = totalAthletes - checkinsCount;
  
  const aptosCount = athletes.filter(a => a.status === 'Apto').length;
  const riscoCount = athletes.filter(a => a.status === 'Risco' || a.status === 'Limitado').length;
  
  const aptoPercent = totalAthletes > 0 ? Math.round((aptosCount / totalAthletes) * 100) : 0;
  const riscoPercent = totalAthletes > 0 ? Math.round((riscoCount / totalAthletes) * 100) : 0;

  const alerts = wellness.filter(w => (w.readiness_score || 0) < 50).map(w => ({
    athleteId: w.athlete_id,
    athleteName: athletes.find(a => a.id === w.athlete_id)?.name || "Atleta",
    type: 'readiness',
    value: w.readiness_score,
    message: `Prontidão baixa: ${w.readiness_score}%`
  })).concat(
    pain.filter(p => p.pain_level >= 7).map(p => ({
      athleteId: p.athlete_id,
      athleteName: athletes.find(a => a.id === p.athlete_id)?.name || "Atleta",
      type: 'pain',
      value: p.pain_level,
      message: `Dor severa: Nível ${p.pain_level}`
    }))
  );

  const topInjuries = React.useMemo(() => {
    const counts: Record<string, number> = {};
    pain.forEach(p => {
      counts[p.body_part_id] = (counts[p.body_part_id] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [pain]);

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Carregando Projeto Águias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Users className="text-cyan-400" size={24} />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              Projeto Águias <span className="text-cyan-500">🦅</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium">Visão operacional e prontidão do grupo</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar atleta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-64 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Atletas" 
          value={totalAthletes} 
          icon={Users}
          color="blue"
        />
        <StatCard 
          label="Aptos" 
          value={`${aptoPercent}%`} 
          subValue={`${aptosCount} atletas`}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard 
          label="Em Risco" 
          value={`${riscoPercent}%`} 
          subValue={`${riscoCount} atletas`}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard 
          label="Sem Check-in" 
          value={noCheckinCount} 
          subValue="Aguardando"
          icon={Clock}
          color="slate"
          isWarning={noCheckinCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Alerts & Top Injuries */}
        <div className="lg:col-span-1 space-y-8">
          {/* Group Alerts */}
          <section className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-500" />
                Alertas do Grupo
              </h3>
              <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-md">
                {alerts.length} ATIVOS
              </span>
            </div>

            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/50 border border-slate-800/50 rounded-xl flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${alert.type === 'pain' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{alert.athleteName}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{alert.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="mx-auto text-emerald-500/20 mb-2" size={32} />
                  <p className="text-xs text-slate-500 font-bold uppercase">Nenhum alerta crítico</p>
                </div>
              )}
            </div>
          </section>

          {/* Top Injuries */}
          <section className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <Activity size={18} className="text-cyan-500" />
              Top Lesões / Queixas
            </h3>

            <div className="space-y-4">
              {topInjuries.length > 0 ? (
                topInjuries.map(([part, count], idx) => (
                  <div key={part} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                      <span className="text-slate-400">{part.replace(/_/g, ' ')}</span>
                      <span className="text-white">{count} relatos</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full" 
                        style={{ width: `${(count / pain.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-xs text-slate-500 font-bold uppercase">Sem relatos de dor hoje</p>
              )}
            </div>
          </section>
        </div>

        {/* Center Column: Athlete List */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-slate-900/40 border border-slate-800/50 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Users size={18} className="text-cyan-500" />
                Lista de Atletas
              </h3>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {filteredAthletes.length} Atletas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/30">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Atleta</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Prontidão</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Dor</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {filteredAthletes.map((athlete) => {
                    const wellnessRecord = wellness.find(w => w.athlete_id === athlete.id);
                    const painRecord = pain.filter(p => p.athlete_id === athlete.id).sort((a, b) => b.pain_level - a.pain_level)[0];
                    const readiness = wellnessRecord?.readiness_score;
                    const painLevel = painRecord?.pain_level || 0;

                    return (
                      <tr 
                        key={athlete.id} 
                        className="hover:bg-slate-800/20 transition-colors cursor-pointer group"
                        onClick={() => onViewAthlete(athlete.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 relative">
                              {athlete.avatar_url ? (
                                <Image 
                                  src={athlete.avatar_url} 
                                  alt={athlete.name} 
                                  fill 
                                  className="object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                                  {athlete.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{athlete.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {readiness !== undefined ? (
                            <div className="flex flex-col items-center">
                              <span className={`text-sm font-black ${readiness < 50 ? 'text-red-400' : readiness < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {readiness}%
                              </span>
                              <div className="w-12 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${readiness < 50 ? 'bg-red-500' : readiness < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${readiness}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-slate-600 uppercase">Pendente</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-black ${painLevel >= 7 ? 'text-red-400' : painLevel >= 4 ? 'text-amber-400' : painLevel > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>
                            {painLevel > 0 ? `Nível ${painLevel}` : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            athlete.status === 'Apto' ? 'bg-emerald-500/10 text-emerald-500' :
                            athlete.status === 'Risco' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {athlete.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight size={16} className="text-slate-600 group-hover:text-cyan-400 transition-colors ml-auto" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Eagles Agenda */}
          <section className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Calendar size={18} className="text-cyan-500" />
                Agenda do Águias
              </h3>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hoje</span>
            </div>

            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appt) => (
                  <div key={appt.id} className="flex items-center gap-4 p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl">
                    <div className="flex flex-col items-center justify-center min-w-[60px] py-1 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-xs font-black text-white">{appt.start_time?.substring(0, 5)}</span>
                      <span className="text-[8px] font-black text-slate-500 uppercase">Início</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{appt.title || appt.type}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase truncate">
                        {appt.athletes?.name || "Atleta"} • {appt.type}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                      appt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      appt.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {appt.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
                  <Calendar className="mx-auto text-slate-800 mb-3" size={40} />
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Nenhum agendamento para hoje</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon: Icon, color, isWarning }: any) {
  const colors: any = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    slate: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  };

  return (
    <div className={`p-6 rounded-3xl border backdrop-blur-sm transition-all hover:scale-[1.02] ${colors[color] || colors.slate} ${isWarning ? 'ring-1 ring-amber-500/50' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl bg-white/5`}>
          <Icon size={20} />
        </div>
        {subValue && (
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
            {subValue}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</h4>
        <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}
