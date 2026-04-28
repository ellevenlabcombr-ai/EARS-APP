"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, Clock, Users, Activity, AlertTriangle, 
  CheckCircle2, ChevronRight, Loader2, RefreshCcw,
  Trophy, AlertCircle, Plus, Stethoscope, ArrowRight,
  ClipboardList, ChevronDown, ChevronUp, BookOpen, User as UserIcon,
  Check, X, Play, StickyNote, Trash2, ListTodo, Bell,
  CalendarDays
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { getLocalDateString } from "@/lib/utils";

interface DailyOperationsProps {
  onNavigate: (view: any) => void;
  onViewAthlete: (id: string) => void;
}

interface ClinicalSettings {
  critical_readiness_threshold: number;
  critical_pain_threshold: number;
  attention_readiness_min: number;
  attention_readiness_max: number;
  attention_pain_min: number;
  attention_pain_max: number;
  risk_message: string;
  attention_message: string;
}

const defaultSettings: ClinicalSettings = {
  critical_readiness_threshold: 50,
  critical_pain_threshold: 7,
  attention_readiness_min: 50,
  attention_readiness_max: 75,
  attention_pain_min: 4,
  attention_pain_max: 6,
  risk_message: 'Atleta em risco crítico. Avaliação médica e fisioterapêutica imediata necessária.',
  attention_message: 'Atleta em estado de atenção. Monitorar carga de treino e recuperação.'
};

export function DailyOperationsDashboard({ onNavigate, onViewAthlete }: DailyOperationsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [attentionAlerts, setAttentionAlerts] = useState<any[]>([]);
  const [isPendenciesOpen, setIsPendenciesOpen] = useState(false);
  const [fullAgenda, setFullAgenda] = useState<any[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any>(null);



  const updateAppointmentStatus = async (id: string, status: string, source: string = 'appointment') => {
    try {
      const table = source === 'smart_agenda' ? 'agenda_events' : 'appointments';
      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      fetchData(); // Refresh data
    } catch (error) {
      console.error(`Error updating ${source}:`, error);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!supabase) return;

      const dateStr = getLocalDateString(viewDate);
      const startOfView = new Date(viewDate);
      startOfView.setHours(0, 0, 0, 0);
      const endOfView = new Date(viewDate);
      endOfView.setHours(23, 59, 59, 999);

      // Fetch all data in parallel
      const [
        athletesRes, 
        appointmentsRes, 
        agendaEventsRes,
        wellnessRes, 
        painRes,
        settingsRes
      ] = await Promise.all([
        supabase.from('athletes').select('id, name, status').limit(200),
        supabase.from('appointments').select('id, athlete_id, date, start_time, end_time, status, type, title, athletes (id, name)').eq('date', dateStr).order('start_time', { ascending: true }).limit(100),
        supabase.from('agenda_events').select('*, athletes (id, name)').gte('start_time', startOfView.toISOString()).lte('start_time', endOfView.toISOString()).order('start_time', { ascending: true }).limit(100),
        supabase.from('wellness_records').select('athlete_id, readiness_score').eq('record_date', dateStr).limit(200),
        supabase.from('pain_reports').select('athlete_id, pain_level').gte('created_at', dateStr).limit(200),
        supabase.from('clinical_settings').select('*').maybeSingle()
      ]);

      if (athletesRes.error) throw athletesRes.error;
      if (appointmentsRes.error && appointmentsRes.error.code !== '42703') throw appointmentsRes.error;
      if (agendaEventsRes.error) {
        console.warn("Agenda events error:", agendaEventsRes.error.message);
      }
      if (wellnessRes.error) throw wellnessRes.error;
      if (painRes.error) throw painRes.error;

      const settings: ClinicalSettings = settingsRes.data || defaultSettings;

      let apptData = appointmentsRes.data || [];
      const agendaData = agendaEventsRes.data || [];
      
      // Fallback for appointments if 'date' column doesn't exist
      if (appointmentsRes.error?.code === '42703') {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('appointments')
          .select('id, athlete_id, appointment_date, start_time, end_time, status, type, title, athletes (id, name)')
          .eq('appointment_date', dateStr)
          .order('start_time', { ascending: true });
        
        if (fallbackError) throw fallbackError;
        apptData = fallbackData || [];
      }

      const athletesData = athletesRes.data || [];
      const wellnessData = wellnessRes.data || [];
      const painData = painRes.data || [];

      // Combine both sources
      const allEvents = [
        ...apptData.map(a => ({ ...a, source: 'appointment' })),
        ...agendaData.map(e => ({ 
          ...e, 
          source: 'smart_agenda',
          date: dateStr,
          // Normalize time strings for display
          start_time: format(new Date(e.start_time), "HH:mm"),
          end_time: format(new Date(e.end_time), "HH:mm"),
          type: e.category,
          status: e.status || 'pending'
        }))
      ].sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

      const todayAppointments = allEvents?.filter(a => a.type !== 'competition' && a.type !== 'event') || [];
      const todayEvents = allEvents?.filter(a => a.type === 'competition' || a.type === 'event') || [];

      const wellnessMap = new Map();
      wellnessData.forEach(w => wellnessMap.set(w.athlete_id, w));

      const painMap = new Map();
      painData.forEach(p => {
        const current = painMap.get(p.athlete_id) || 0;
        if (p.pain_level > current) painMap.set(p.athlete_id, p.pain_level);
      });

      const newRiskAlerts: any[] = [];
      const newAttentionAlerts: any[] = [];

      athletesData.forEach(athlete => {
        const w = wellnessMap.get(athlete.id);
        const p = painMap.get(athlete.id) || 0;
        
        const readiness = w ? w.readiness_score : null;
        const pain = p;

        const isRisk = 
          (readiness !== null && readiness < settings.critical_readiness_threshold) || 
          pain >= settings.critical_pain_threshold;

        const isAttention = 
          !isRisk && (
            (readiness !== null && readiness >= settings.attention_readiness_min && readiness <= settings.attention_readiness_max) || 
            (pain >= settings.attention_pain_min && pain <= settings.attention_pain_max)
          );

        if (isRisk) {
          newRiskAlerts.push({
            id: athlete.id,
            athleteName: athlete.name,
            readiness,
            pain,
            message: settings.risk_message
          });
        } else if (isAttention) {
          newAttentionAlerts.push({
            id: athlete.id,
            athleteName: athlete.name,
            readiness,
            pain,
            message: settings.attention_message
          });
        }
      });
      
      // Find next event (first pending one)
      const next = allEvents.find(a => a.status !== 'completed' && a.status !== 'cancelled');
      
      setNextAppointment(next || null);
      setFullAgenda(allEvents);
      setAppointments(todayAppointments);
      setEvents(todayEvents);
      setRiskAlerts(newRiskAlerts);
      setAttentionAlerts(newAttentionAlerts);

    } catch (error: any) {
      console.error("DAILY OPERATIONS ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  }, [viewDate]);

  useEffect(() => {
    fetchData();
    if (getLocalDateString(new Date()) === getLocalDateString(viewDate)) {
      setCurrentTime(new Date());
    } else {
      setCurrentTime(null);
    }
  }, [fetchData, viewDate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[25rem] space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-slate-500 text-sm font-black uppercase tracking-widest">
          Carregando Operação do Dia...
        </p>
      </div>
    );
  }

  const hasRisk = riskAlerts.length > 0;
  const hasAttention = attentionAlerts.length > 0;
  const hasAlerts = hasRisk || hasAttention;

  const getEventIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'competition':
      case 'competição':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'course':
      case 'curso':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'personal':
      case 'pessoal':
        return <UserIcon className="w-4 h-4 text-purple-500" />;
      case 'evaluation':
      case 'avaliação':
        return <ClipboardList className="w-4 h-4 text-emerald-500" />;
      default:
        return <Stethoscope className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <header className="sticky top-0 z-40 bg-[#050B14]/95 backdrop-blur-xl py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            🏠 Agenda e Tarefas
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-slate-400 text-xxs font-black uppercase tracking-widest min-w-[120px]">
              {format(viewDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button 
                onClick={() => setViewDate(new Date())}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${getLocalDateString(viewDate) === getLocalDateString(new Date()) ? 'bg-cyan-500 text-[#050B14]' : 'text-slate-400 hover:text-white'}`}
              >
                Hoje
              </button>
              <button 
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setViewDate(tomorrow);
                }}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${getLocalDateString(viewDate) !== getLocalDateString(new Date()) ? 'bg-cyan-500 text-[#050B14]' : 'text-slate-400 hover:text-white'}`}
              >
                Amanhã
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 mr-4 px-3 py-1 bg-slate-900/50 rounded-full border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xxs font-black text-slate-400 uppercase tracking-widest">Sistema Online</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            className="bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 font-bold uppercase tracking-widest text-xxs px-4 h-9"
          >
            <RefreshCcw size={12} className="mr-2" />
            Atualizar
          </Button>
        </div>
      </header>

      {/* Bloco 1: Foco Imediato (Próximo Compromisso) */}
      {nextAppointment && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Play size={80} className="text-cyan-500" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xxs font-black text-cyan-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock size={12} /> Agora / Próximo
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {nextAppointment.title || nextAppointment.type}
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-300 font-bold">
                    <Users size={16} className="text-slate-500" />
                    {nextAppointment.athletes?.name || 'Compromisso Geral'}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                  <div className="text-cyan-400 font-black tracking-widest text-sm">
                    {nextAppointment.start_time} - {nextAppointment.end_time}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => updateAppointmentStatus(nextAppointment.id, 'completed', nextAppointment.source)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-[#050B14] font-black uppercase tracking-widest text-xxs px-6 h-11"
                >
                  <Check size={16} className="mr-2" /> Concluir
                </Button>
                {nextAppointment.athlete_id && (
                  <Button 
                    variant="outline"
                    onClick={() => onViewAthlete(nextAppointment.athlete_id)}
                    className="bg-slate-900/50 border-slate-800 text-white hover:bg-slate-800 font-black uppercase tracking-widest text-xxs px-6 h-11"
                  >
                    Ver Perfil
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bloco 2: Agenda Completa */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Calendar size={14} className="text-cyan-500" />
            Fluxo Completo do Dia
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xxs font-black text-slate-500 uppercase tracking-widest">
                {fullAgenda.filter(a => a.status === 'completed').length} Concluídos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
              <span className="text-xxs font-black text-slate-500 uppercase tracking-widest">
                {fullAgenda.filter(a => a.status !== 'completed').length} Restantes
              </span>
            </div>
          </div>
        </div>

        <Card className="bg-slate-900/40 border-slate-800/50 shadow-2xl overflow-hidden backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/50">
              {fullAgenda.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800/30 flex items-center justify-center text-slate-600 mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="text-emerald-500 font-bold text-lg uppercase tracking-widest">✅ Operação tranquila hoje</p>
                  <p className="text-slate-500 text-sm font-medium">Nenhum compromisso ou alerta agendado.</p>
                </div>
              ) : (
                fullAgenda.map((appt) => (
                  <div 
                    key={appt.id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 transition-all group border-l-4 border-transparent gap-4 ${
                      appt.athlete_id ? 'cursor-pointer hover:bg-slate-800/30 hover:border-cyan-500/50' : 'hover:bg-slate-800/10'
                    } ${appt.status === 'completed' ? 'opacity-50 grayscale hover:grayscale-0' : ''}`}
                    onClick={() => appt.athlete_id && onViewAthlete(appt.athlete_id)}
                  >
                    <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                      <div className="text-center w-12 sm:w-16 shrink-0 pt-1 sm:pt-0">
                        <p className="text-xs sm:text-sm font-black text-white">{appt.start_time?.substring(0, 5)}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{appt.end_time?.substring(0, 5)}</p>
                      </div>
                      <div className="w-px h-10 bg-slate-800/50 hidden sm:block"></div>
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          {getEventIcon(appt.type)}
                          <h4 className="text-sm sm:text-base font-black text-white group-hover:text-cyan-400 transition-colors truncate">
                            {appt.title || appt.type}
                          </h4>
                          {appt.reminder_minutes !== null && appt.reminder_minutes !== undefined && (
                            <Bell className="w-3 h-3 text-cyan-500" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          {appt.athletes?.name && (
                            <span className="text-[9px] sm:text-xxs font-black uppercase text-slate-400 flex items-center gap-1">
                              <Users size={10} /> {appt.athletes.name}
                            </span>
                          )}
                          <span className="text-[9px] sm:text-xxs font-black uppercase px-2 py-0.5 rounded bg-slate-800/50 text-slate-500 border border-slate-800/50 capitalize">
                            {appt.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 mt-2 sm:mt-0">
                      {appt.status === 'cancelled' ? (
                        <div className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-xxs font-black uppercase tracking-widest border transition-all bg-rose-500/10 text-rose-500 border-rose-500/20">
                          Cancelado
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 cursor-pointer bg-slate-900/50 p-1.5 pr-3 rounded-full hover:bg-slate-800 transition-colors border border-slate-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateAppointmentStatus(appt.id, appt.status === 'completed' ? 'pending' : 'completed', appt.source);
                          }}
                        >
                          <button
                            type="button"
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              appt.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-700'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                appt.status === 'completed' ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${appt.status === 'completed' ? 'text-emerald-500' : 'text-slate-500'}`}>
                            {appt.status === 'completed' ? 'Concluído' : 'Pendente'}
                          </span>
                        </div>
                      )}
                      {appt.athlete_id && (
                        <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-cyan-500 transition-colors hidden sm:block" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
