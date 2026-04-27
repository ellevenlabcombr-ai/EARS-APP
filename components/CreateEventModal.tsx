"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Clock, Tag, User, AlertTriangle, Stethoscope, Trophy, Briefcase, UserCircle, AlignLeft, Activity, Plane, MapPin, Scale } from "lucide-react";
import { AgendaCategory, calculatePriority, AgendaEvent } from "@/types/agenda";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: any) => void;
  initialEvent?: AgendaEvent | null;
}

const CATEGORIES_CONFIG = [
  { value: 'clinical', label: 'Clínico', icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', activeBg: 'bg-rose-500/20', activeBorder: 'border-rose-500' },
  { value: 'competition', label: 'Competição', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', activeBg: 'bg-amber-500/20', activeBorder: 'border-amber-500' },
  { value: 'arbitration', label: 'Arbitragem', icon: Scale, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', activeBg: 'bg-fuchsia-500/20', activeBorder: 'border-fuchsia-500' },
  { value: 'travel', label: 'Viagem', icon: Plane, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', activeBg: 'bg-violet-500/20', activeBorder: 'border-violet-500' },
  { value: 'professional', label: 'Profissional', icon: Briefcase, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', activeBg: 'bg-cyan-500/20', activeBorder: 'border-cyan-500' },
  { value: 'personal', label: 'Pessoal', icon: UserCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', activeBg: 'bg-emerald-500/20', activeBorder: 'border-emerald-500' },
];

export function CreateEventModal({ isOpen, onClose, onSave, initialEvent }: CreateEventModalProps) {
  const [athletes, setAthletes] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const { data } = await supabase.from('athletes').select('id, name');
        if (data) setAthletes(data);
      } catch (err) {
        console.error("Error fetching athletes:", err);
      }
    };
    if (isOpen) {
      fetchAthletes();
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "clinical" as AgendaCategory,
    subcategory: "",
    location: "",
    address: "",
    is_all_day: false,
    start_time: "",
    end_time: "",
    athlete_id: "",
    reminder_minutes: null as number | null,
  });

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const toLocalInputFormat = (date: Date) => {
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().substring(0, 16);
    };

    if (isOpen && initialEvent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: initialEvent.title || "",
        description: initialEvent.description || "",
        category: initialEvent.category,
        subcategory: initialEvent.subcategory || "",
        location: initialEvent.location || "",
        address: initialEvent.address || "",
        is_all_day: initialEvent.is_all_day || false,
        start_time: toLocalInputFormat(new Date(initialEvent.start_time)),
        end_time: toLocalInputFormat(new Date(initialEvent.end_time)),
        athlete_id: initialEvent.athlete_id || "",
        reminder_minutes: initialEvent.reminder_minutes ?? null,
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMsg("");
    } else if (isOpen && !initialEvent) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const startStr = toLocalInputFormat(now);
      now.setHours(now.getHours() + 1);
      const endStr = toLocalInputFormat(now);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: "",
        description: "",
        category: "clinical",
        subcategory: "",
        location: "",
        address: "",
        is_all_day: false,
        start_time: startStr,
        end_time: endStr,
        athlete_id: "",
        reminder_minutes: null,
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMsg("");
    }
  }, [isOpen, initialEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setErrorMsg("O título é obrigatório");
      return;
    }
    if (!formData.start_time) {
      setErrorMsg("A data e hora de início são obrigatórias");
      return;
    }
    if (!formData.end_time) {
      setErrorMsg("A data e hora de término são obrigatórias");
      return;
    }
    
    // If it's all day, we adjust the time to start at 00:00 and end at 23:59 so it definitely spans the selected days
    let finalStart = formData.start_time;
    let finalEnd = formData.end_time;

    if (formData.is_all_day) {
      finalStart = formData.start_time.split('T')[0] + 'T00:00';
      finalEnd = formData.end_time.split('T')[0] + 'T23:59';
    }

    const parseToLocalISO = (dateTimeStr: string) => {
      const [datePart, timePart] = dateTimeStr.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute).toISOString();
    };

    const startISO = parseToLocalISO(finalStart);
    const endISO = parseToLocalISO(finalEnd);

    if (new Date(startISO) > new Date(endISO)) {
      setErrorMsg("O término não pode ser antes do início");
      return;
    }

    setErrorMsg("");
    
    // Auto-complete address if location is "Consultório" or "ELLEVEN"
    let finalLocation = formData.location.trim();
    let finalAddress = formData.address.trim();

    if (finalLocation.toLowerCase().includes('consultório') || finalLocation.toLowerCase().includes('elleven')) {
      finalLocation = 'ELLEVEN';
      finalAddress = 'Alameda Santos, 211 - Cj. 1604';
    }

    const priority = calculatePriority({
      category: formData.category,
    });

    const savePayload: any = {
      ...formData,
      start_time: startISO,
      end_time: endISO,
      location: finalLocation || null,
      address: finalAddress || null,
      subcategory: null,
      athlete_id: formData.athlete_id.trim() || null,
      risk_score: null,
      priority,
      origin: 'manual',
    };

    if (initialEvent?.id) {
      savePayload.id = initialEvent.id;
    }

    onSave(savePayload);
    
    // Default config gets reset when opening
  };

  const activeCategory = CATEGORIES_CONFIG.find(c => c.value === formData.category) || CATEGORIES_CONFIG[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden"
          >
            {/* Header - Fixed */}
            <div className="p-6 sm:p-8 border-b border-slate-800 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-2">
                  {initialEvent ? "Editar Evento" : "Novo Evento"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {initialEvent ? "Edite as informações do seu compromisso." : "Adicione um novo compromisso na sua agenda inteligente."}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 sm:p-2.5 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 sm:p-8">
              <form id="create-event-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
                
                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Tipo de Evento</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {CATEGORIES_CONFIG.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = formData.category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.value as AgendaCategory })}
                          className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all ${
                            isActive 
                              ? `${cat.activeBg} ${cat.activeBorder} ${cat.color} shadow-lg scale-105 z-10` 
                              : `bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300`
                          }`}
                        >
                          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-2 ${isActive ? cat.color : ''}`} />
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center leading-tight">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title & Location */}
                <div className="space-y-4 bg-slate-950/30 p-5 rounded-3xl border border-slate-800/50">
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <AlignLeft className="w-4 h-4" /> Título
                    </label>
                    <input 
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-medium"
                      placeholder="Ex: Avaliação Isocinética"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Nome do Local</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, location: "ELLEVEN", address: "Alameda Santos, 211 - Cj. 1604" })}
                          className="text-[#050B14] bg-cyan-500 hover:bg-cyan-400 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" /> No Consultório
                        </button>
                      </label>
                      <input 
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-medium"
                        placeholder="Ex: ELLEVEN ou Consultório"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Endereço Completo
                      </label>
                      <input 
                        type="text"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-medium"
                        placeholder="Ex: Av. Giovanni Gronchi, 5923"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> Atleta Associado (Opcional)
                    </label>
                    <select
                      value={formData.athlete_id}
                      onChange={e => setFormData({...formData, athlete_id: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-medium appearance-none [color-scheme:dark]"
                    >
                      <option value="">Selecione um atleta...</option>
                      {athletes.map(athlete => (
                        <option key={athlete.id} value={athlete.id}>{athlete.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-4 bg-slate-950/30 p-5 rounded-3xl border border-slate-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Horários</h3>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={formData.is_all_day}
                          onChange={e => setFormData({...formData, is_all_day: e.target.checked})}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${formData.is_all_day ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_all_day ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Dia Todo</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Start Date & Time */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block border-b border-slate-800 pb-2">
                        Início
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="date"
                          value={formData.start_time ? formData.start_time.split('T')[0] : ''}
                          onChange={e => {
                            const date = e.target.value;
                            const time = formData.start_time ? formData.start_time.split('T')[1]?.substring(0,5) : '08:00';
                            setFormData({...formData, start_time: `${date}T${time}`});
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-medium [color-scheme:dark] flex-1 min-w-0"
                        />
                        {!formData.is_all_day && (
                          <input 
                            type="time"
                            value={formData.start_time ? formData.start_time.split('T')[1]?.substring(0,5) : ''}
                            onChange={e => {
                              const time = e.target.value;
                              const date = formData.start_time ? formData.start_time.split('T')[0] : new Date().toISOString().split('T')[0];
                              setFormData({...formData, start_time: `${date}T${time}`});
                            }}
                            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-medium [color-scheme:dark] w-[100px] shrink-0"
                          />
                        )}
                      </div>
                    </div>

                    {/* End Date & Time */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block border-b border-slate-800 pb-2 opacity-70">
                        Término
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="date"
                          min={formData.start_time ? formData.start_time.split('T')[0] : ''}
                          value={formData.end_time ? formData.end_time.split('T')[0] : ''}
                          onChange={e => {
                            const date = e.target.value;
                            const time = formData.end_time ? formData.end_time.split('T')[1]?.substring(0,5) : '09:00';
                            setFormData({...formData, end_time: `${date}T${time}`});
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-medium [color-scheme:dark] flex-1 min-w-0"
                        />
                        {!formData.is_all_day && (
                          <input 
                            type="time"
                            value={formData.end_time ? formData.end_time.split('T')[1]?.substring(0,5) : ''}
                            onChange={e => {
                              const time = e.target.value;
                              const date = formData.end_time ? formData.end_time.split('T')[0] : (formData.start_time ? formData.start_time.split('T')[0] : new Date().toISOString().split('T')[0]);
                              setFormData({...formData, end_time: `${date}T${time}`});
                            }}
                            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-medium [color-scheme:dark] w-[100px] shrink-0"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description and Reminders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Anotações / Descrição</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors h-28 resize-none placeholder:text-slate-600 font-medium"
                      placeholder="Adicione notas relevantes para o evento..."
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2 block">
                      <Clock className="w-4 h-4" /> Lembrete / Alerta
                    </label>
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 h-28 flex flex-col justify-center">
                      <select
                        value={formData.reminder_minutes === null ? "" : formData.reminder_minutes.toString()}
                        onChange={e => setFormData({...formData, reminder_minutes: e.target.value ? parseInt(e.target.value, 10) : null})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-medium appearance-none [color-scheme:dark]"
                      >
                        <option value="">Sem lembrete</option>
                        <option value="0">No horário do evento</option>
                        <option value="5">5 minutos antes</option>
                        <option value="15">15 minutos antes</option>
                        <option value="30">30 minutos antes</option>
                        <option value="60">1 hora antes</option>
                        <option value="1440">1 dia antes</option>
                      </select>
                      <p className="mt-2 text-[10px] text-slate-500 font-medium text-center">
                        Você será notificado quando o app estiver aberto
                      </p>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            {/* Error Message & Action - Fixed */}
            <div className="shrink-0">
              {errorMsg && (
                <div className="px-6 sm:px-8 py-3 bg-rose-500/10 border-t border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {errorMsg}
                </div>
              )}

              <div className="p-6 sm:p-8 bg-slate-900 border-t border-slate-800 rounded-b-3xl flex gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase tracking-widest rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  form="create-event-form"
                  className={`flex-1 py-4 ${activeCategory.activeBg} hover:opacity-80 text-white border ${activeCategory.activeBorder} text-xs font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2`}
                >
                  <Calendar className="w-4 h-4" />
                  {initialEvent ? "Salvar Alterações" : "Agendar Evento"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
