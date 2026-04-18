"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Maximize2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { SafeRender } from "@/components/SafeRender";

interface EvolutionData {
  date: string;
  pain: number;
  strength: number;
  rom: number;
}

type RehabPhase = "Aguda" | "Subaguda" | "Funcional" | "Retorno ao Esporte";

interface ClinicalEvolutionPanelProps {
  regionName: string;
  data: EvolutionData[];
  riskScore?: number;
  lang?: "pt" | "en";
}

const getRehabPhase = (last: EvolutionData): { phase: RehabPhase; color: string; nextStep: string } => {
  if (last.pain >= 7 || last.strength < 40 || last.rom < 50) {
    return { 
      phase: "Aguda", 
      color: "text-rose-500", 
      nextStep: "Controle de dor e edema. Proteção tecidual." 
    };
  }
  if (last.pain >= 4 || last.strength < 70 || last.rom < 80) {
    return { 
      phase: "Subaguda", 
      color: "text-amber-500", 
      nextStep: "Ganho de ADM passiva/ativa e ativação muscular inicial." 
    };
  }
  if (last.pain >= 1 || last.strength < 90 || last.rom < 95) {
    return { 
      phase: "Funcional", 
      color: "text-cyan-500", 
      nextStep: "Fortalecimento dinâmico e exercícios proprioceptivos." 
    };
  }
  return { 
    phase: "Retorno ao Esporte", 
    color: "text-emerald-500", 
    nextStep: "Treino de gesto esportivo e carga máxima controlada." 
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A1120] border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <p className="text-xs font-bold text-white uppercase tracking-tight">
              {entry.name}: <span className="text-cyan-400">{entry.value}{entry.name === 'ADM' || entry.name === 'Força' ? '%' : ''}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ClinicalEvolutionPanel({ regionName, data, riskScore, lang = "pt" }: ClinicalEvolutionPanelProps) {
  // Calculate variations
  const first = data[0];
  const last = data[data.length - 1];
  const { phase, color: phaseColor, nextStep } = getRehabPhase(last);
  
  const deltaPain = last.pain - first.pain;
  const deltaStrength = last.strength - first.strength;
  const deltaRom = last.rom - first.rom;

  const riskColor = 
    riskScore !== undefined ? (
      riskScore >= 70 ? 'text-rose-500' :
      riskScore >= 40 ? 'text-amber-500' :
      'text-emerald-500'
    ) : 'text-slate-500';

  const getTrendIcon = (delta: number, inverse = false) => {
    const isGood = inverse ? delta < 0 : delta > 0;
    if (delta === 0) return null;
    return isGood ? (
      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-rose-500" />
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Evolução: {regionName}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${phaseColor}`}>
                Fase: {phase}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Últimos 7 dias
              </p>
            </div>
          </div>
        </div>
        
        {riskScore !== undefined && (
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Score de Risco</p>
            <p className={`text-lg font-black ${riskColor}`}>{riskScore}%</p>
          </div>
        )}
      </div>

      {/* Next Step Card */}
      <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="w-12 h-12 text-cyan-500" />
        </div>
        <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest mb-1">Próximo Passo Clínico</p>
        <p className="text-xs font-bold text-white leading-relaxed">
          {nextStep}
        </p>
      </div>

      {/* Variation Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Δ Dor</p>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-black ${deltaPain < 0 ? 'text-emerald-400' : deltaPain > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {deltaPain > 0 ? `+${deltaPain}` : deltaPain}
            </span>
            {getTrendIcon(deltaPain, true)}
          </div>
        </div>
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Δ Força</p>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-black ${deltaStrength > 0 ? 'text-emerald-400' : deltaStrength < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {deltaStrength > 0 ? `+${deltaStrength}%` : `${deltaStrength}%`}
            </span>
            {getTrendIcon(deltaStrength)}
          </div>
        </div>
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Δ ADM</p>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-black ${deltaRom > 0 ? 'text-emerald-400' : deltaRom < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {deltaRom > 0 ? `+${deltaRom}%` : `${deltaRom}%`}
            </span>
            {getTrendIcon(deltaRom)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-4">
        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 text-rose-500" /> Intensidade da Dor
            </span>
          </div>
          <div className="h-32 w-full">
            <SafeRender componentName="PainIntensityChart">
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis hide domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="pain" 
                  name="Dor"
                  stroke="#f43f5e" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPain)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </SafeRender>
        </div>
      </div>

        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Maximize2 className="w-3 h-3 text-cyan-500" /> Força & ADM
            </span>
          </div>
          <div className="h-32 w-full">
            <SafeRender componentName="StrengthROMChart">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="strength" 
                  name="Força"
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#0A1120' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rom" 
                  name="ADM"
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0A1120' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </SafeRender>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
