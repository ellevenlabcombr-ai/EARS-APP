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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-sm bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Minimal Header with Category Color */}
            <div className={`h-2 ${colorClass.split(' ')[0]}`} />
            
            <div className="p-0">
              <div className="flex justify-end p-2">
                <div className="flex gap-1">
                  {onEdit && (
                    <button 
                      onClick={() => {
                        onClose();
                        onEdit(event);
                      }}
                      className="p-2 hover:bg-gray-100 text-gray-600 rounded-full transition-colors"
                      title="Editar"
                    >
                      <Trash2 className="w-4 h-4 rotate-180" /> {/* Simulating edit icon if Lucide Pencil is missing, but I'll use a better approach */}
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(event.id)}
                      className="p-2 hover:bg-gray-100 text-gray-600 rounded-full transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 text-gray-600 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-4">
                <div className="flex gap-4">
                  <div className={`w-4 h-4 mt-1.5 rounded-sm shrink-0 ${colorClass.split(' ')[0]}`} />
                  <div className="space-y-1">
                    <h2 className="text-xl font-normal text-gray-900 leading-tight">
                      {event.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {isMultiDay && !event.is_all_day ? (
                        `${format(startTime, "EEEE, d 'de' MMMM", { locale: ptBR })} • ${format(startTime, "HH:mm")} – ${format(endTime, "EEEE, d 'de' MMMM", { locale: ptBR })} • ${format(endTime, "HH:mm")}`
                      ) : event.is_all_day ? (
                        `${format(startTime, "EEEE, d 'de' MMMM", { locale: ptBR })}${!isSameDay(startTime, endTime) ? ` – ${format(endTime, "EEEE, d 'de' MMMM", { locale: ptBR })}` : ''} • Dia Todo`
                      ) : (
                        `${format(startTime, "EEEE, d 'de' MMMM", { locale: ptBR })} • ${format(startTime, "HH:mm")} – ${format(endTime, "HH:mm")}`
                      )}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex gap-4">
                    <MapPin className="w-4 h-4 mt-1 text-gray-400 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-sm text-gray-600 font-medium">{event.location}</p>
                      {event.address && (
                        <p className="text-xs text-gray-400">{event.address}</p>
                      )}
                    </div>
                  </div>
                )}

                {event.athlete_id && (
                  <div className="flex gap-4">
                    <User className="w-4 h-4 mt-1 text-gray-400 shrink-0" />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center text-[10px] text-cyan-700 font-bold uppercase">
                        {(athleteName || 'A').charAt(0)}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{athleteName || 'Atleta Associado'}</span>
                    </div>
                  </div>
                )}

                {event.description && (
                  <div className="flex gap-4">
                    <Tag className="w-4 h-4 mt-1 text-gray-400 shrink-0" />
                    <p className="text-sm text-gray-600 leading-relaxed italic">{event.description}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Clock className="w-4 h-4 mt-1 text-gray-400 shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
                      {event.category === 'arbitration' ? 'Arbitragem' : 
                       event.category === 'clinical' ? 'Clínico' : 
                       event.category === 'competition' ? 'Competição' : 
                       event.category === 'professional' ? 'Profissional' : 
                       event.category === 'travel' ? 'Viagem' : 'Pessoal'}
                    </span>
                    {event.subcategory && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {event.subcategory}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
