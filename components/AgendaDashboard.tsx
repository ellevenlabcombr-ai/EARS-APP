"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, User, Plus, Search, Filter, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, XCircle, FileText, Activity, Thermometer, AlertTriangle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Athlete {
  id: string;
  name: string;
  athlete_code: string;
  status: string;
}

interface Appointment {
  id: string;
  athlete_id: string;
  date?: string;
  appointment_date?: string;
  start_time: string;
  end_time: string;
  type: string;
  status: string;
  notes?: string;
  pain_level?: number;
  readiness_score?: number;
  alert_flag?: boolean;
  athletes?: Athlete;
}

interface AgendaDashboardProps {
  onOpenProfile?: (athlete: any) => void;
}

export function AgendaDashboard({ onOpenProfile }: AgendaDashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [view, setView] = useState<'day' | 'week'>('day');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [athletesList, setAthletesList] = useState<Athlete[]>([]);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    athlete_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '08:00',
    end_time: '09:00',
    type: 'clinical',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, view]);

  useEffect(() => {
    if (isModalOpen && athletesList.length === 0) {
      fetchAthletes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from('athletes')
        .select('id, name, athlete_code, status')
        .order('name')
        .limit(100);
      
      if (error) throw error;
      setAthletesList(data || []);
    } catch (err) {
      console.error("Error fetching athletes:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      let startDate, endDate;

      if (view === 'day') {
        startDate = new Date(currentDate);
        endDate = new Date(currentDate);
      } else {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      }

      const formattedStart = format(startDate, 'yyyy-MM-dd');
      const formattedEnd = format(endDate, 'yyyy-MM-dd');

      // Try with 'date' column first
      let { data, error } = await supabase
        .from('appointments')
        .select(`
          id, athlete_id, date, start_time, end_time, status, type, notes, pain_level, readiness_score, alert_flag, created_at,
          athletes (
            id, name, athlete_code, status
          )
        `)
        .gte('date', formattedStart)
        .lte('date', formattedEnd)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(500);

      // Fallback to 'appointment_date' if 'date' doesn't exist
      if (error && error.code === '42703') {
        const fallback = await supabase
          .from('appointments')
          .select(`
            id, athlete_id, appointment_date, start_time, end_time, status, type, notes, pain_level, readiness_score, alert_flag, created_at,
            athletes (
              id, name, athlete_code, status
            )
          `)
          .gte('appointment_date', formattedStart)
          .lte('appointment_date', formattedEnd)
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(500);
        
        data = fallback.data;
        error = fallback.error;
      }

      if (error) {
        console.error("Appointments error:", error);
        if (error.code === '42P01') {
          setErrorMsg('Tabela de agendamentos não encontrada. Por favor, execute a migration no Supabase.');
        } else {
          setErrorMsg(error.message || 'Erro ao carregar agendamentos.');
        }
        setAppointments([]);
      } else {
        console.log("Appointments data:", data);
        setAppointments(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching appointments:', error);
      setErrorMsg('Erro inesperado ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      // 1. Validação Básica
      if (!formData.athlete_id || !formData.date || !formData.start_time || !formData.end_time || !formData.type) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.");
      }

      // 2. Formatação de Hora (Garante HH:mm:ss para o banco)
      const formatTime = (t: string) => t.length === 5 ? `${t}:00` : t;
      const startTime = formatTime(formData.start_time);
      const endTime = formatTime(formData.end_time);

      // 3. Conflict Prevention (CRITICAL)
      // Check if another appointment exists on the same date with overlapping times
      let existingApts = null;
      let conflictError = null;
      
      const conflictQuery1 = await supabase
        .from('appointments')
        .select('id, start_time, end_time')
        .eq('date', formData.date)
        .neq('status', 'canceled')
        .limit(1000);
        
      if (conflictQuery1.error && conflictQuery1.error.code === '42703') {
        const conflictQuery2 = await supabase
          .from('appointments')
          .select('id, start_time, end_time')
          .eq('appointment_date', formData.date)
          .neq('status', 'canceled')
          .limit(1000);
        existingApts = conflictQuery2.data;
        conflictError = conflictQuery2.error;
      } else {
        existingApts = conflictQuery1.data;
        conflictError = conflictQuery1.error;
      }
        
      if (!conflictError && existingApts) {
        const hasConflict = existingApts.some(apt => {
          // Time overlap logic: start_time < existing.end_time AND end_time > existing.start_time
          return startTime < apt.end_time && endTime > apt.start_time;
        });
        
        if (hasConflict) {
          throw new Error("Já existe um atendimento neste horário.");
        }
      }

      // 4. Construção Automática do Título
      const athlete = athletesList.find(a => a.id === formData.athlete_id);
      const typeLabels: Record<string, string> = {
        clinical: 'Clínico',
        training: 'Treino',
        evaluation: 'Avaliação',
        recovery: 'Recovery',
        other: 'Outro'
      };
      const title = `${typeLabels[formData.type] || 'Atendimento'} - ${athlete?.name || 'Atleta'}`;

      // 5. Montagem do Payload Principal
      const basePayload: any = {
        athlete_id: formData.athlete_id,
        title: title,
        start_time: startTime,
        end_time: endTime,
        type: formData.type,
        session_type: formData.type,
        status: 'scheduled',
      };

      // Adiciona notes apenas se não for vazio
      if (formData.notes && formData.notes.trim() !== '') {
        basePayload.notes = formData.notes.trim();
      }

      console.log("🚀 Tentando salvar agendamento...");

      // 6. Inserção no Supabase - Tentativa 1: Envia AMBAS as colunas de data
      let payload = { ...basePayload, date: formData.date, appointment_date: formData.date };
      let { data, error } = await supabase.from('appointments').insert([payload]).select();

      // 7. Tratamento de Erros e Fallbacks
      if (error) {
        console.warn("⚠️ Falha na Tentativa 1 (ambas as datas):", error.message);
        
        // Se o erro for de coluna inexistente (42703) ou erro vazio
        if (error.code === '42703' || (Object.keys(error).length === 0 && error.constructor === Object)) {
          
          // Tentativa 2: Apenas 'appointment_date' (comum em esquemas antigos)
          console.log("⚠️ Tentando fallback apenas com 'appointment_date'...");
          payload = { ...basePayload, appointment_date: formData.date };
          const fallback1 = await supabase.from('appointments').insert([payload]).select();
          
          if (fallback1.error) {
            console.warn("⚠️ Falha na Tentativa 2:", fallback1.error.message);
            
            // Tentativa 3: Apenas 'date' (esquema novo)
            console.log("⚠️ Tentando fallback apenas com 'date'...");
            payload = { ...basePayload, date: formData.date };
            const fallback2 = await supabase.from('appointments').insert([payload]).select();
            
            if (fallback2.error) {
              console.error("❌ Todas as tentativas falharam:", fallback2.error);
              throw new Error(fallback2.error.message || "Erro ao salvar no banco de dados.");
            } else {
              data = fallback2.data;
              error = null;
            }
          } else {
            data = fallback1.data;
            error = null;
          }
        } else {
          // Erros de RLS ou outros
          if (error.code === '42501') {
            throw new Error("Erro de permissão (RLS). Você não tem autorização para criar agendamentos.");
          }
          if (error.code === '23502') {
            throw new Error(`Erro de restrição NOT NULL: ${error.message}`);
          }
          throw new Error(error.message || "Erro desconhecido ao salvar.");
        }
      }

      // 8. Sucesso
      console.log("✅ Agendamento criado com sucesso!");
      setIsModalOpen(false);
      fetchAppointments(); // Recarrega a lista
      
      // Reseta o formulário
      setFormData({
        athlete_id: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '08:00',
        end_time: '09:00',
        type: 'clinical',
        notes: ''
      });

    } catch (err: any) {
      // Captura qualquer erro (de rede, validação, ou lançado manualmente)
      console.error("🚨 Exceção capturada:", err);
      alert(`Falha ao criar agendamento: ${err.message || "Erro de conexão ou servidor."}`);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, status: newStatus } : apt
      ));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Erro ao atualizar status");
    }
  };

  const handlePrev = () => setCurrentDate(prev => addDays(prev, view === 'day' ? -1 : -7));
  const handleNext = () => setCurrentDate(prev => addDays(prev, view === 'day' ? 1 : 7));

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    if (timeStr.includes('T')) return format(parseISO(timeStr), 'HH:mm');
    return timeStr.substring(0, 5); // Assuming HH:mm:ss format
  };

  const getClinicalColor = (readiness?: number, pain?: number) => {
    if (pain !== undefined && pain >= 5) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (readiness !== undefined) {
      if (readiness < 60) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      if (readiness < 80) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
    return 'text-slate-400 bg-slate-800 border-slate-700';
  };

  const getClinicalIndicator = (readiness?: number, pain?: number) => {
    if (pain !== undefined && pain >= 5) return 'bg-rose-500';
    if (readiness !== undefined) {
      if (readiness < 60) return 'bg-rose-500';
      if (readiness < 80) return 'bg-amber-500';
      return 'bg-emerald-500';
    }
    return 'bg-slate-500';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'clinical': return 'Clínico';
      case 'training': return 'Treino';
      case 'evaluation': return 'Avaliação';
      default: return 'Outro';
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">
            Agenda Clínica
          </h1>
          <p className="text-slate-400 mt-2">Gestão de atendimentos e monitoramento de risco.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Atendimento</span>
          </button>
        </div>
      </header>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-800 rounded-lg p-1">
              <button 
                onClick={() => setView('day')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'day' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Dia
              </button>
              <button 
                onClick={() => setView('week')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'week' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Semana
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white min-w-[150px] text-center">
              {view === 'day' 
                ? format(currentDate, "dd 'de' MMMM", { locale: ptBR })
                : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd MMM", { locale: ptBR })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "dd MMM", { locale: ptBR })}`
              }
            </h2>
            <button onClick={handleNext} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{errorMsg}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">Nenhum atendimento</h3>
              <p className="text-slate-400">Não há agendamentos para este período.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => {
                const readiness = apt.readiness_score;
                const pain = apt.pain_level;
                const isHighRisk = (readiness !== undefined && readiness < 60) || (pain !== undefined && pain >= 5) || apt.alert_flag;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={apt.id} 
                    className="group flex flex-col sm:flex-row gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all"
                  >
                    <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 sm:w-24 shrink-0">
                      <div className="text-xl font-bold text-white">
                        {formatTime(apt.start_time)}
                      </div>
                      <div className="text-sm text-slate-400">
                        {formatTime(apt.end_time)}
                      </div>
                    </div>

                    <div className={`w-1.5 self-stretch rounded-full hidden sm:block ${getClinicalIndicator(readiness, pain)}`} />

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-white">
                              {apt.athletes?.name || 'Atleta Desconhecido'}
                            </h3>
                            {isHighRisk && (
                              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                                <AlertTriangle className="w-3 h-3" />
                                Risco
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm">
                            <span className="px-2 py-0.5 bg-slate-900 rounded font-mono text-slate-300 border border-slate-700">
                              {apt.athletes?.athlete_code || '#00000'}
                            </span>
                            <span className="text-slate-400 flex items-center gap-1">
                              <Activity className="w-4 h-4" />
                              {apt.athletes?.status || 'Status N/A'}
                            </span>
                            <span className="text-slate-400 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {getTypeLabel(apt.type)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select 
                            value={apt.status}
                            onChange={(e) => updateStatus(apt.id, e.target.value)}
                            className={`text-sm font-medium px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors
                              ${apt.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                'bg-slate-800 text-slate-400 border-slate-700'}`}
                          >
                            <option value="scheduled" className="bg-slate-800 text-white">Agendado</option>
                            <option value="completed" className="bg-slate-800 text-white">Concluído</option>
                            <option value="canceled" className="bg-slate-800 text-white">Cancelado</option>
                          </select>
                          
                          {onOpenProfile && apt.athletes && (
                            <button 
                              onClick={() => onOpenProfile(apt.athletes)}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              <span className="hidden md:inline">Prontuário</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {readiness !== undefined && (
                          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-sm font-medium ${getClinicalColor(readiness)}`}>
                            <Activity className="w-4 h-4" />
                            <span>Readiness: {readiness}%</span>
                          </div>
                        )}
                        {pain !== undefined && (
                          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-sm font-medium ${getClinicalColor(undefined, pain)}`}>
                            <Thermometer className="w-4 h-4" />
                            <span>Dor: {pain}/10</span>
                          </div>
                        )}
                      </div>

                      {apt.notes && (
                        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-sm text-slate-300">
                          {apt.notes}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Appointment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Novo Atendimento</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Atleta</label>
                  <select 
                    required
                    value={formData.athlete_id}
                    onChange={(e) => setFormData({...formData, athlete_id: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Selecione um atleta...</option>
                    {athletesList.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.athlete_code})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Data</label>
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
                    <select 
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="clinical">Clínico</option>
                      <option value="training">Treino</option>
                      <option value="evaluation">Avaliação</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Início</label>
                    <input 
                      type="time" 
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Fim</label>
                    <input 
                      type="time" 
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Observações Clínicas</label>
                  <textarea 
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Queixas, objetivo da sessão..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-slate-300 hover:text-white font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>Agendar</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
