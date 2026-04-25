 
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PersonStanding, AlertTriangle, Save, ArrowLeft, Ruler, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaturationAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

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

export function MaturationAssessmentForm({ athleteId, onCancel, onSave }: MaturationAssessmentProps) {
  // Inputs
  const [data, setData] = useState({
    age: 14,
    height: 165,
    sittingHeight: 85,
    weight: 55,
    motherHeight: 160,
    fatherHeight: 175
  });


  // Derived State
  const [score, setScore] = useState(100);
  const [classification, setClassification] = useState({ label: 'Normal', color: 'cyan' });
  const [growthStatus, setGrowthStatus] = useState('Circa-PHV');
  const [alerts, setAlerts] = useState<string[]>([]);
  
  const [metrics, setMetrics] = useState({
    maturationIndex: 50,
    legLength: 80,
    ratio: 0.51
  });

  useEffect(() => {
    // Basic Calculations
    const legLength = data.height - data.sittingHeight;
    const ratio = data.sittingHeight / data.height;
    
    // 1. Maturation Index Approximation (0-100)
    // A lower ratio (longer legs relative to sitting height) often indicates entering the growth spurt.
    // Typical ratio is ~0.52. 
    let maturationIndex = 50;
    if (ratio < 0.5) maturationIndex = 80; // Legs growing fast (Circa-PHV)
    else if (ratio > 0.53) maturationIndex = 30; // Pre-PHV or Post-PHV
    
    // Adjust based on age and weight
    if (data.age < 12) maturationIndex -= 20;
    if (data.age > 16) maturationIndex += 20;

    // Optional: Predictive component based on parents height
    const midParentHeight = (data.motherHeight + data.fatherHeight) / 2;
    // We adjust score conceptually for the mock preview
    if (data.height > midParentHeight) maturationIndex += 5;

    maturationIndex = Math.max(0, Math.min(100, maturationIndex));

    // 2. Growth Status
    let status = 'Circa-PHV';
    if (maturationIndex < 40) status = 'Pre-PHV';
    else if (maturationIndex > 70) status = 'Post-PHV';

    // 3. Final Score (Stability of growth pattern)
    // For this mock, we'll consider Circa-PHV (rapid growth) as lower stability (needs attention)
    let finalScore = 100;
    if (status === 'Circa-PHV') finalScore = 60; // Needs attention due to growth spurt risk
    else if (status === 'Pre-PHV') finalScore = 80;
    else finalScore = 90;

    setScore(finalScore);
    setGrowthStatus(status);
    setMetrics({
      maturationIndex: Math.round(maturationIndex),
      legLength: Math.round(legLength),
      ratio: Number(ratio.toFixed(2))
    });

    // Classification (Precoce, Normal, Tardio)
    // This is a simplification. Usually requires population norms.
    let classLabel = 'Normal';
    let classColor = 'cyan';
    
    if (data.age < 13 && status === 'Post-PHV') {
      classLabel = 'Precoce';
      classColor = 'amber';
    } else if (data.age > 15 && status === 'Pre-PHV') {
      classLabel = 'Tardio';
      classColor = 'amber';
    } else {
      classLabel = 'Normal';
      classColor = 'emerald';
    }
    
    setClassification({ label: classLabel, color: classColor });

    // Alerts
    const newAlerts: string[] = [];
    if (classLabel === 'Precoce') newAlerts.push("Aceleração Precoce do Crescimento");
    if (classLabel === 'Tardio') newAlerts.push("Desenvolvimento Tardio");
    if (status === 'Circa-PHV') newAlerts.push("Risco de Estirão de Crescimento (Atenção à Carga)");
    setAlerts(newAlerts);

  }, [data]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
    await onSave({
      type: "Maturação",
      score,
      classification: classification.label,
      classification_color: classification.color,
      growth_status: growthStatus,
      maturation_index: metrics.maturationIndex,
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
            <PersonStanding className="w-6 h-6 text-indigo-500" />
            Avaliação de Maturação
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Estágio de Maturação Biológica e PHV
          </p>
        </div>

        <div className={`p-6 rounded-3xl border flex-1 flex items-center justify-between ${getColorClasses(classification.color)}`}>
          <div>
            <p className="text-xxs font-black uppercase tracking-widest opacity-70 mb-1">Score de Estabilidade</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{score}</span>
              <span className="text-sm font-bold uppercase tracking-widest opacity-80">{classification.label}</span>
            </div>
            <p className="text-xxs font-black uppercase tracking-widest mt-1 opacity-90">Status: {growthStatus}</p>
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
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Índice de Maturação</p>
          <p className="text-2xl font-black text-indigo-400">
            {metrics.maturationIndex}
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Comprimento da Perna</p>
          <p className="text-2xl font-black text-slate-300">
            {metrics.legLength} <span className="text-xs text-slate-500">cm</span>
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Razão Tronco-Estatura</p>
          <p className="text-2xl font-black text-slate-300">
            {metrics.ratio}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Basic Measurements */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-indigo-500" /> Dados Antropométricos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <NumberInput label="Idade" value={data.age} unit="anos" onChange={(v) => setData({...data, age: v})} />
            <NumberInput label="Altura" value={data.height} unit="cm" onChange={(v) => setData({...data, height: v})} />
            <NumberInput label="Altura Sentado" value={data.sittingHeight} unit="cm" onChange={(v) => setData({...data, sittingHeight: v})} />
            <NumberInput label="Peso" value={data.weight} unit="kg" onChange={(v) => setData({...data, weight: v})} />
            
            <NumberInput label="Altura da Mãe" value={data.motherHeight} unit="cm" onChange={(v) => setData({...data, motherHeight: v})} />
            <NumberInput label="Altura do Pai" value={data.fatherHeight} unit="cm" onChange={(v) => setData({...data, fatherHeight: v})} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
        <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white font-bold uppercase text-xxs tracking-widest">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-500 hover:bg-indigo-400 text-[#050B14] font-black uppercase text-xxs tracking-widest px-8">
          {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Salvar Avaliação
        </Button>
      </div>
    </motion.div>
  );
}
