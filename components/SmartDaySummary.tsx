"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  Calendar, 
  Stethoscope, 
  AlertTriangle, 
  Zap,
  Activity
} from "lucide-react";
import { AgendaEvent } from "@/types/agenda";

interface SmartDaySummaryProps {
  events: AgendaEvent[];
}

export function SmartDaySummary({ events }: SmartDaySummaryProps) {
  const todayEvents = events.filter(e => {
    const start = new Date(e.start_time);
    const today = new Date();
    return start.toDateString() === today.toDateString();
  });

  const clinicalCount = todayEvents.filter(e => e.category === 'clinical').length;
  const highRiskCount = todayEvents.filter(e => e.category === 'clinical' && (e.risk_score || 0) > 7).length;
  
  const loadLevel = todayEvents.length < 5 ? 'Leve' : todayEvents.length <= 8 ? 'Moderado' : 'Alto';
  const loadColor = todayEvents.length < 5 ? 'text-emerald-400' : todayEvents.length <= 8 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4"
      >
        <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
          <Calendar className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total do Dia</p>
          <p className="text-xl font-black text-white">{todayEvents.length}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4"
      >
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <Stethoscope className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atendimentos</p>
          <p className="text-xl font-black text-white">{clinicalCount}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4"
      >
        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alto Risco</p>
          <p className="text-xl font-black text-white">{highRiskCount}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4"
      >
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <Activity className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Carga do Dia</p>
          <p className={`text-xl font-black ${loadColor}`}>{loadLevel}</p>
        </div>
      </motion.div>

      {highRiskCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-4 bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-center gap-3"
        >
          <Zap className="w-5 h-5 text-rose-500 fill-rose-500" />
          <p className="text-sm font-bold text-rose-400">
            Atleta de alto risco hoje — atenção prioritária
          </p>
        </motion.div>
      )}
    </div>
  );
}
