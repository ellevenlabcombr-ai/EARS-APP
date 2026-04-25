 
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Droplets, AlertTriangle, Save, ArrowLeft, Activity, CalendarHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenstrualAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

const Slider = ({ label, value, onChange, invertColor = false, max = 10 }: { label: string, value: number, onChange: (v: number) => void, invertColor?: boolean, max?: number }) => {
  const isHighBad = invertColor;
  const ratio = value / max;
  const valueColor = isHighBad 
    ? (ratio > 0.7 ? 'text-rose-400' : ratio > 0.4 ? 'text-amber-400' : 'text-emerald-400')
    : (ratio < 0.4 ? 'text-rose-400' : ratio < 0.7 ? 'text-amber-400' : 'text-emerald-400');

  return (
    <div className="space-y-2 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
      <div className="flex justify-between items-end">
        <label className="text-xxs font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <span className={`text-lg font-black ${valueColor}`}>{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
      />
      <div className="flex justify-between text-xxs font-bold text-slate-600 uppercase tracking-widest">
        <span>Baixo (0)</span>
        <span>Alto ({max})</span>
      </div>
    </div>
  );
};

const SelectGroup = ({ label, value, options, onChange }: { label: string, value: string | boolean, options: {id: string | boolean, label: string}[], onChange: (v: any) => void }) => (
  <div className="space-y-3 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
    <label className="text-xxs font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map(opt => (
        <button
          key={String(opt.id)}
          onClick={() => onChange(opt.id)}
          className={`py-2 px-1 rounded-xl text-xxs font-black uppercase tracking-widest transition-all ${
            value === opt.id 
              ? 'bg-cyan-500 text-[#050B14] shadow-lg shadow-cyan-500/20' 
              : 'bg-slate-900/50 text-slate-500 border border-slate-800 hover:border-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const NumberInput = ({ label, value, unit, onChange }: { label: string, value: number, unit: string, onChange: (v: number) => void }) => (
  <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50 flex flex-col justify-between">
    <label className="text-xxs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
    <div className="relative">
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-bold focus:outline-none focus:border-cyan-500 transition-colors"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 uppercase">{unit}</span>
    </div>
  </div>
);

export function MenstrualAssessmentForm({ athleteId, onCancel, onSave }: MenstrualAssessmentProps) {
  // Inputs
  const [data, setData] = useState({
    menarcheAge: 12,
    regularity: 'regular', // regular, irregular
    cycleLength: 28,
    flow: 'moderate', // light, moderate, heavy
    pain: 3,
    pms: 4,
    missedPeriods: false
  });

  // Derived State
  const [score, setScore] = useState(100);
  const [classification, setClassification] = useState({ label: 'Normal', color: 'cyan' });
  const [alerts, setAlerts] = useState<string[]>([]);
  
  const [metrics, setMetrics] = useState({
    regularityIndex: 100,
    symptomLoad: 50,
    hormonalStability: 100
  });

  useEffect(() => {
    // 1. Regularity Index (0-100)
    let regularityIndex = 100;
    if (data.regularity === 'irregular') regularityIndex -= 50;
    if (data.missedPeriods) regularityIndex -= 50;
    regularityIndex = Math.max(0, regularityIndex);

    // 2. Symptom Load (0-100)
    // High pain and high PMS = High Load
    const symptomLoad = ((data.pain + data.pms) / 20) * 100;

    // 3. Hormonal Stability (0-100)
    // Combination of regularity, symptoms, and cycle length
    let stability = 100;
    if (data.cycleLength < 21 || data.cycleLength > 35) stability -= 30;
    if (data.regularity === 'irregular') stability -= 30;
    if (symptomLoad > 70) stability -= 20;
    if (data.missedPeriods) stability -= 40;
    stability = Math.max(0, stability);

    // Final Score
    const finalScore = Math.round((regularityIndex * 0.5) + ((100 - symptomLoad) * 0.3) + (stability * 0.2));
    setScore(finalScore);
    
    setMetrics({
      regularityIndex: Math.round(regularityIndex),
      symptomLoad: Math.round(symptomLoad),
      hormonalStability: Math.round(stability)
    });

    // Classification
    if (finalScore >= 85) setClassification({ label: 'Excelente', color: 'emerald' });
    else if (finalScore >= 70) setClassification({ label: 'Normal', color: 'cyan' });
    else if (finalScore >= 50) setClassification({ label: 'Atenção', color: 'amber' });
    else setClassification({ label: 'Déficit', color: 'rose' });

    // Alerts
    const newAlerts: string[] = [];
    if (data.missedPeriods) newAlerts.push("Risco de Amenorreia");
    if (data.regularity === 'irregular') newAlerts.push("Instabilidade Hormonal (Ciclo Irregular)");
    if (data.pain > 7) newAlerts.push("Dismenorreia Severa");
    if (data.cycleLength < 21 || data.cycleLength > 35) newAlerts.push("Ciclo Fora do Padrão (21-35 dias)");
    setAlerts(newAlerts);

  }, [data]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
    await onSave({
      type: "Menstrual",
      score,
      classification: classification.label,
      classification_color: classification.color,
      regularity_index: metrics.regularityIndex,
      symptom_load: metrics.symptomLoad,
      hormonal_stability: metrics.hormonalStability,
      alerts,
      raw_data: data
    });
    } finally {
      setIsSaving(false);
    }
  };

  const getColorClasses = (color: string) => {
    const map: any = {
      emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    };
    return map[color] || map.cyan;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header & Summary Card */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Button variant="ghost" onClick={onCancel} className="mb-4 text-slate-400 hover:text-white px-0">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Droplets className="w-6 h-6 text-pink-500" />
            Avaliação Menstrual
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Saúde Hormonal e Ciclo Menstrual
          </p>
        </div>

        <div className={`p-6 rounded-3xl border flex-1 flex items-center justify-between ${getColorClasses(classification.color)}`}>
          <div>
            <p className="text-xxs font-black uppercase tracking-widest opacity-70 mb-1">Score Menstrual</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{score}</span>
              <span className="text-sm font-bold uppercase tracking-widest opacity-80">{classification.label}</span>
            </div>
            {alerts.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xxs font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md w-fit border border-rose-500/20">
                    <AlertTriangle className="w-3 h-3" /> {alert}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Activity className="w-12 h-12 opacity-20" />
        </div>
      </div>

      {/* Indices Preview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Regularidade</p>
          <p className={`text-2xl font-black ${metrics.regularityIndex > 70 ? 'text-emerald-400' : metrics.regularityIndex > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.regularityIndex}%
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Carga de Sintomas</p>
          <p className={`text-2xl font-black ${metrics.symptomLoad < 30 ? 'text-emerald-400' : metrics.symptomLoad < 70 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.symptomLoad}%
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Estabilidade Hormonal</p>
          <p className={`text-2xl font-black ${metrics.hormonalStability > 70 ? 'text-emerald-400' : metrics.hormonalStability > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.hormonalStability}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Cycle Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <CalendarHeart className="w-4 h-4 text-pink-500" /> Detalhes do Ciclo
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Idade da Menarca" value={data.menarcheAge} unit="anos" onChange={(v) => setData({...data, menarcheAge: v})} />
              <NumberInput label="Duração do Ciclo" value={data.cycleLength} unit="dias" onChange={(v) => setData({...data, cycleLength: v})} />
            </div>
            <SelectGroup 
              label="Regularidade" 
              value={data.regularity} 
              options={[{id: 'regular', label: 'Regular'}, {id: 'irregular', label: 'Irregular'}]}
              onChange={(v) => setData({...data, regularity: v})} 
            />
            <SelectGroup 
              label="Ausência de Menstruação" 
              value={data.missedPeriods} 
              options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
              onChange={(v) => setData({...data, missedPeriods: v})} 
            />
          </div>
        </div>

        {/* Section 2: Symptoms */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-pink-500" /> Sintomas e Fluxo
          </h3>
          <div className="space-y-3">
            <SelectGroup 
              label="Intensidade do Fluxo" 
              value={data.flow} 
              options={[{id: 'light', label: 'Leve'}, {id: 'moderate', label: 'Moderado'}, {id: 'heavy', label: 'Intenso'}]}
              onChange={(v) => setData({...data, flow: v})} 
            />
            <Slider label="Intensidade da Dor (Cólica)" value={data.pain} onChange={(v) => setData({...data, pain: v})} invertColor />
            <Slider label="Sintomas de TPM" value={data.pms} onChange={(v) => setData({...data, pms: v})} invertColor />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
        <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white font-bold uppercase text-xxs tracking-widest">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-pink-500 hover:bg-pink-400 text-[#050B14] font-black uppercase text-xxs tracking-widest px-8">
          {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Salvar Avaliação
        </Button>
      </div>
    </motion.div>
  );
}
