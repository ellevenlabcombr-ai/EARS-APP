/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Droplet, AlertTriangle, Save, ArrowLeft, Activity, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HydrationAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

export function HydrationAssessmentForm({ athleteId, onCancel, onSave }: HydrationAssessmentProps) {
  // Inputs
  const [data, setData] = useState({
    perception: 5,
    urineColor: 4, // 1-8
    thirst: 5,
    fluidIntake: 2.5, // liters
    weightVariation: 0, // %
    symptoms: {
      headache: false,
      dizziness: false,
      cramps: false,
      fatigue: false
    }
  });

  // Derived State
  const [score, setScore] = useState(100);
  const [classification, setClassification] = useState({ label: 'Normal', color: 'cyan' });
  const [alerts, setAlerts] = useState<string[]>([]);
  
  const [metrics, setMetrics] = useState({
    hydrationIndex: 50,
    physiologicalStress: 50
  });

  useEffect(() => {
    // 1. Hydration Index (0-100)
    const perceptionScore = (data.perception / 10) * 25;
    const urineScore = ((8 - data.urineColor) / 7) * 35; // 1 = 35, 8 = 0
    const thirstScore = ((10 - data.thirst) / 10) * 20; // 0 = 20, 10 = 0
    const fluidScore = Math.min((data.fluidIntake / 4) * 20, 20); // Max 20 points for 4+ liters
    
    const hydrationIndex = perceptionScore + urineScore + thirstScore + fluidScore;

    // 2. Physiological Stress (0-100)
    let symptomCount = 0;
    if (data.symptoms.headache) symptomCount++;
    if (data.symptoms.dizziness) symptomCount++;
    if (data.symptoms.cramps) symptomCount++;
    if (data.symptoms.fatigue) symptomCount++;
    
    const symptomStress = (symptomCount / 4) * 50;
    
    // Weight variation stress (loss > 0 is bad, loss > 2% is very bad)
    let weightStress = 0;
    if (data.weightVariation < 0) {
      const loss = Math.abs(data.weightVariation);
      weightStress = Math.min((loss / 4) * 50, 50); // 4% loss = 50 points
    }
    
    const physiologicalStress = symptomStress + weightStress;

    // Final Score
    const finalScore = Math.round((hydrationIndex * 0.7) + ((100 - physiologicalStress) * 0.3));
    setScore(finalScore);
    
    setMetrics({
      hydrationIndex: Math.round(hydrationIndex),
      physiologicalStress: Math.round(physiologicalStress)
    });

    // Classification
    if (finalScore >= 85) setClassification({ label: 'Excelente', color: 'emerald' });
    else if (finalScore >= 70) setClassification({ label: 'Normal', color: 'cyan' });
    else if (finalScore >= 50) setClassification({ label: 'Atenção', color: 'amber' });
    else setClassification({ label: 'Déficit', color: 'rose' });

    // Alerts
    const newAlerts: string[] = [];
    if (data.urineColor >= 6) newAlerts.push("Risco de Desidratação (Urina Escura)");
    if (data.fluidIntake < 2) newAlerts.push("Hidratação Insuficiente (< 2L)");
    if (symptomCount > 0) newAlerts.push("Estresse Fisiológico Presente");
    if (data.weightVariation <= -2) newAlerts.push("Desidratação Aguda (Perda de Peso > 2%)");
    setAlerts(newAlerts);

  }, [data]);

  const handleSave = () => {
    onSave({
      type: "Hidratação",
      score,
      classification: classification.label,
      classification_color: classification.color,
      hydration_index: metrics.hydrationIndex,
      physiological_stress: metrics.physiologicalStress,
      alerts,
      raw_data: data
    });
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

  const Slider = ({ label, value, onChange, invertColor = false, min = 0, max = 10, step = 1 }: { label: string, value: number, onChange: (v: number) => void, invertColor?: boolean, min?: number, max?: number, step?: number }) => {
    const isHighBad = invertColor;
    const ratio = (value - min) / (max - min);
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
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-xxs font-bold text-slate-600 uppercase tracking-widest">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  const NumberInput = ({ label, value, unit, onChange, step = 1 }: { label: string, value: number, unit: string, onChange: (v: number) => void, step?: number }) => (
    <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50 flex flex-col justify-between">
      <label className="text-xxs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
      <div className="relative">
        <input
          type="number"
          step={step}
          value={value === 0 ? "0" : value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-bold focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 uppercase">{unit}</span>
      </div>
    </div>
  );

  const Checkbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/50 bg-slate-900/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
      <div className={`w-5 h-5 rounded flex items-center justify-center border ${checked ? 'bg-rose-500 border-rose-500' : 'border-slate-600'}`}>
        {checked && <div className="w-2.5 h-2.5 bg-[#050B14] rounded-sm" />}
      </div>
      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{label}</span>
    </label>
  );

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
            <Droplet className="w-6 h-6 text-blue-500" />
            Avaliação de Hidratação
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Status de Hidratação e Impacto na Recuperação
          </p>
        </div>

        <div className={`p-6 rounded-3xl border flex-1 flex items-center justify-between ${getColorClasses(classification.color)}`}>
          <div>
            <p className="text-xxs font-black uppercase tracking-widest opacity-70 mb-1">Score de Hidratação</p>
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
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Índice de Hidratação</p>
          <p className={`text-2xl font-black ${metrics.hydrationIndex > 70 ? 'text-emerald-400' : metrics.hydrationIndex > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.hydrationIndex}%
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Estresse Fisiológico</p>
          <p className={`text-2xl font-black ${metrics.physiologicalStress < 30 ? 'text-emerald-400' : metrics.physiologicalStress < 70 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.physiologicalStress}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Hydration Status */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <Droplet className="w-4 h-4 text-blue-500" /> Status de Hidratação
          </h3>
          <div className="space-y-3">
            <Slider label="Percepção de Hidratação" value={data.perception} onChange={(v) => setData({...data, perception: v})} />
            <Slider label="Cor da Urina (1-Clara, 8-Escura)" value={data.urineColor} min={1} max={8} onChange={(v) => setData({...data, urineColor: v})} invertColor />
            <Slider label="Nível de Sede" value={data.thirst} onChange={(v) => setData({...data, thirst: v})} invertColor />
            <NumberInput label="Ingestão de Líquidos" value={data.fluidIntake} unit="L/dia" step={0.1} onChange={(v) => setData({...data, fluidIntake: v})} />
          </div>
        </div>

        {/* Section 2: Physiological Impact */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-blue-500" /> Impacto Fisiológico
          </h3>
          <div className="space-y-3">
            <NumberInput label="Variação de Peso (Ex: -2 para perda de 2%)" value={data.weightVariation} unit="%" step={0.1} onChange={(v) => setData({...data, weightVariation: v})} />
            
            <div className="pt-2">
              <label className="text-xxs font-black text-slate-400 uppercase tracking-widest mb-2 block">Sintomas Relatados</label>
              <div className="grid grid-cols-2 gap-2">
                <Checkbox label="Dor de Cabeça" checked={data.symptoms.headache} onChange={(v) => setData({...data, symptoms: {...data.symptoms, headache: v}})} />
                <Checkbox label="Tontura" checked={data.symptoms.dizziness} onChange={(v) => setData({...data, symptoms: {...data.symptoms, dizziness: v}})} />
                <Checkbox label="Cãibras" checked={data.symptoms.cramps} onChange={(v) => setData({...data, symptoms: {...data.symptoms, cramps: v}})} />
                <Checkbox label="Fadiga" checked={data.symptoms.fatigue} onChange={(v) => setData({...data, symptoms: {...data.symptoms, fatigue: v}})} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
        <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white font-bold uppercase text-xxs tracking-widest">
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-400 text-[#050B14] font-black uppercase text-xxs tracking-widest px-8">
          <Save className="w-4 h-4 mr-2" /> Salvar Avaliação
        </Button>
      </div>
    </motion.div>
  );
}
