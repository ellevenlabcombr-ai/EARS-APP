"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Search,
  Filter,
  User,
  FileText,
  Calendar
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getLocalDateString } from "@/lib/utils";

interface Pendency {
  id: string;
  type: 'document' | 'evaluation' | 'wellness';
  title: string;
  description: string;
  athleteName: string;
  athleteId: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

export function PendenciesDashboard() {
  const [pendencies, setPendencies] = useState<Pendency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPendencies();
  }, []);

  const fetchPendencies = async () => {
    try {
      setLoading(true);
      if (!supabase) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);

      const [athletesRes, wellnessRes, painRes] = await Promise.all([
        supabase.from('athletes').select('id, name').limit(50),
        supabase.from('wellness_records').select('athlete_id, record_date').gte('record_date', yesterdayStr).limit(200),
        supabase.from('pain_reports').select('athlete_id, pain_level, body_part_id, created_at').gte('pain_level', 7).limit(50)
      ]);

      if (athletesRes.error) throw athletesRes.error;
      
      const athletesData = athletesRes.data || [];
      const wellnessData = wellnessRes.data || [];
      const painData = painRes.data || [];

      const realPendencies: Pendency[] = [];

      // 1. Wellness Pendencies (Athletes who didn't fill wellness today/yesterday)
      athletesData.forEach(athlete => {
        const hasWellness = wellnessData.some(w => w.athlete_id === athlete.id);
        if (!hasWellness) {
          realPendencies.push({
            id: `wellness-${athlete.id}`,
            type: 'wellness',
            title: 'Wellness não preenchido',
            description: 'O atleta ainda não preencheu o formulário de wellness nas últimas 24 horas.',
            athleteName: athlete.name,
            athleteId: athlete.id,
            dueDate: getLocalDateString(),
            priority: 'medium',
            status: 'pending'
          });
        }
      });

      // 2. Pain Pendencies (High pain reports)
      painData.forEach((pain, idx) => {
        const athlete = athletesData.find(a => a.id === pain.athlete_id);
        if (athlete) {
          realPendencies.push({
            id: `pain-${idx}-${pain.athlete_id}`,
            type: 'evaluation',
            title: `Dor Crítica: ${pain.body_part_id}`,
            description: `O atleta relatou nível de dor ${pain.pain_level}/10. Necessário avaliação imediata.`,
            athleteName: athlete.name,
            athleteId: athlete.id,
            dueDate: getLocalDateString(new Date(pain.created_at)),
            priority: 'high',
            status: 'pending'
          });
        }
      });

      setPendencies(realPendencies);
    } catch (error) {
      console.error('Error fetching pendencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPendencies = pendencies.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch = p.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText size={18} />;
      case 'evaluation': return <CheckCircle2 size={18} />;
      case 'wellness': return <AlertCircle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">
            Módulo de Pendências
          </h1>
          <p className="text-slate-400 mt-2">Acompanhe e gerencie as tarefas e documentos pendentes dos atletas.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 text-slate-400 focus-within:border-cyan-500 transition-colors">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar pendência..." 
              className="bg-transparent border-none outline-none text-sm w-48 md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-slate-900/50 border border-slate-800 rounded-xl p-1">
            <button 
              onClick={() => setFilter('pending')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === 'pending' ? 'bg-cyan-500 text-[#050B14]' : 'text-slate-400 hover:text-white'}`}
            >
              Pendentes
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-cyan-500 text-[#050B14]' : 'text-slate-400 hover:text-white'}`}
            >
              Todas
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-slate-900/20 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredPendencies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPendencies.map((pendency) => (
            <motion.div
              key={pendency.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0A1120] border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getPriorityColor(pendency.priority)}`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                  Prioridade {pendency.priority === 'high' ? 'Alta' : pendency.priority === 'medium' ? 'Média' : 'Baixa'}
                </div>
                <div className="text-slate-500">
                  {getTypeIcon(pendency.type)}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2 group-hover:text-cyan-400 transition-colors">
                {pendency.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                {pendency.description}
              </p>

              <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">{pendency.athleteName}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Atleta</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Prazo</p>
                  <p className="text-xs font-bold text-rose-400">{new Date(pendency.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                Resolver Pendência <ChevronRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-900/50 rounded-3xl flex items-center justify-center text-slate-700 mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-2">Tudo em dia!</h2>
          <p className="text-slate-500">Não encontramos nenhuma pendência para os critérios selecionados.</p>
        </div>
      )}
    </div>
  );
}
