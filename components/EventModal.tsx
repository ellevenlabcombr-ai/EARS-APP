"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, Tag, User, AlertTriangle, Trash2, MapPin } from "lucide-react";
import { AgendaEvent, getCategoryColor } from "@/types/agenda";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventModalProps {
  event: AgendaEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (event: AgendaEvent) => void;
}

export function EventModal({ event, isOpen, onClose, onDelete, onEdit }: EventModalProps) {
  const [athleteName, setAthleteName] = useState<string>("");

  useEffect(() => {
    const fetchAthlete = async () => {
      if (event?.athlete_id) {
        const { data } = await supabase.from('athletes').select('name').eq('id', event.athlete_id).single();
        if (data) {
          setAthleteName(data.name);
        }
      }
    };
    if (isOpen && event?.athlete_id) {
      fetchAthlete();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAthleteName("");
    }
  }, [event?.athlete_id, isOpen]);

  if (!event) return null;

  const colorClass = getCategoryColor(event);
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  const isMultiDay = !isSameDay(startTime, endTime) || event.is_all_day;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className={`h-2 ${colorClass.split(' ')[0]}`} />
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xxs font-black uppercase border ${colorClass}`}>
                      {event.category === 'competition' ? 'competição' : event.category === 'clinical' ? 'clínico' : event.category === 'professional' ? 'profissional' : event.category === 'travel' ? 'viagem' : 'pessoal'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white leading-tight">
                    {event.title}
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-slate-400">
                  <Clock className="w-4 h-4 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">
                      {isMultiDay && !event.is_all_day ? (
                        `${format(startTime, "dd 'de' MMM, h:mm a", { locale: ptBR })} - ${format(endTime, "dd 'de' MMM, h:mm a", { locale: ptBR })}`
                      ) : event.is_all_day ? (
                        isSameDay(startTime, endTime) 
                          ? `${format(startTime, "dd 'de' MMMM", { locale: ptBR })} (Dia Todo)`
                          : `${format(startTime, "dd 'de' MMM", { locale: ptBR })} - ${format(endTime, "dd 'de' MMM", { locale: ptBR })} (Dia Todo)`
                      ) : (
                        `${format(startTime, "dd 'de' MMMM", { locale: ptBR })} • ${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`
                      )}
                    </span>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3 text-slate-400">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <div className="flex flex-col">
                      <p className="text-xs font-bold leading-relaxed">{event.location}</p>
                      {event.address && (
                        <p className="text-[10px] text-slate-500">{event.address}</p>
                      )}
                    </div>
                  </div>
                )}
                {!event.location && event.address && (
                  <div className="flex items-start gap-3 text-slate-400">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed">{event.address}</p>
                  </div>
                )}

                {event.description && (
                  <div className="flex items-start gap-3 text-slate-400">
                    <Tag className="w-4 h-4 mt-0.5" />
                    <p className="text-xs leading-relaxed">{event.description}</p>
                  </div>
                )}

                {event.athlete_id && (
                  <div className="flex items-center gap-3 text-slate-400">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-bold">Atleta Associado: {athleteName || event.athlete_id}</span>
                  </div>
                )}

                {event.category === 'clinical' && (
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xxs font-black text-slate-500 uppercase tracking-widest">Score de Risco</span>
                      <span className={`text-sm font-black ${event.risk_score && event.risk_score > 7 ? 'text-rose-500' : 'text-cyan-400'}`}>
                        {event.risk_score || 0}/10
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xxs font-black text-slate-500 uppercase tracking-widest">Prioridade do Sistema</span>
                      <span className="text-sm font-black text-white">
                        {event.priority.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {onEdit && (
                  <button 
                    className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                    onClick={() => {
                      onClose();
                      onEdit(event);
                    }}
                  >
                    Editar Evento
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={() => onDelete(event.id)}
                    className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl border border-rose-500/20 transition-all active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
