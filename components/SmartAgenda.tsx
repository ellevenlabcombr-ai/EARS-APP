"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Calendar as CalendarIcon,
  Search,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AgendaEvent, AgendaCategory } from "@/types/agenda";
import { SmartDaySummary } from "./SmartDaySummary";
import { CalendarGrid } from "./CalendarGrid";
import { EventModal } from "./EventModal";
import { CreateEventModal } from "./CreateEventModal";

export function SmartAgenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  
  const [filter, setFilter] = useState<AgendaCategory | 'all'>('all');

  const fetchEvents = useCallback(async () => {
    if (!supabase) return;
    
    try {
      setLoading(true);
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

      const { data, error } = await supabase
        .from('agenda_events')
        .select('*')
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        if (error.code === '42P01') {
          setError("Tabela 'agenda_events' não encontrada. Por favor, crie a tabela no Supabase.");
        } else {
          setError(error.message);
        }
        return;
      }

      setEvents(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSaveEvent = async (eventData: any) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('agenda_events')
        .insert([eventData]);

      if (error) throw error;
      
      setIsCreateModalOpen(false);
      fetchEvents();
    } catch (err: any) {
      alert("Erro ao salvar evento: " + err.message);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('agenda_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err: any) {
      alert("Erro ao excluir evento: " + err.message);
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.category === filter);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">
            Smart Agenda
          </h1>
          <p className="text-slate-400 mt-2">Gestão unificada e inteligência de decisão clínica.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/50 border border-slate-800 rounded-xl p-1">
            {(['all', 'clinical', 'professional', 'personal'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === cat 
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat === 'clinical' ? 'Clínico' : cat === 'professional' ? 'Profissional' : 'Pessoal'}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Evento</span>
          </button>
        </div>
      </header>

      <SmartDaySummary events={events} />

      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-white uppercase tracking-tight min-w-[200px] text-center">
              {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd MMM", { locale: ptBR })} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), "dd MMM", { locale: ptBR })}
            </h2>
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Visão Semanal</span>
          </div>
        </div>

        {error ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-500">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Erro na Agenda</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">{error}</p>
            </div>
            <button 
              onClick={() => fetchEvents()}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        ) : loading ? (
          <div className="py-40 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <CalendarGrid 
            events={filteredEvents} 
            currentDate={currentDate}
            onEventClick={(event) => {
              setSelectedEvent(event);
              setIsEventModalOpen(true);
            }}
          />
        )}
      </div>

      <CreateEventModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveEvent}
      />

      <EventModal 
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
