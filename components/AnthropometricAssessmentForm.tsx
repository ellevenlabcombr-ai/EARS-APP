/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Scale, AlertTriangle, Save, ArrowLeft, Activity, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnthropometricAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

export function AnthropometricAssessmentForm({ athleteId, onCancel, onSave }: AnthropometricAssessmentProps) {
  // Measurements
  const [measurements, setMeasurements] = useState({
    weight: 70,
    height: 175,
    armCirc: 30,
    thighCirc: 50,
    waistCirc: 80
  });

  // Perceptions (0-10)
  const [perception, setPerception] = useState({
    bodyFat: 5,
    muscleDev: 5
  });

  // Derived State
  const [score, setScore] = useState(100);
  const [classification, setClassification] = useState({ label: 'Normal', color: 'cyan' });
  const [alerts, setAlerts] = useState<string[]>([]);
  
  const [metrics, setMetrics] = useState({
    bmi: 22.9,
    compositionIndex: 50,
    proportionIndex: 50
  });

  useEffect(() => {
    // 1. BMI Calculation & Normalization
    const heightM = measurements.height / 100;
    const bmi = measurements.weight / (heightM * heightM);
    
    // Normalize BMI: 18.5 - 24.9 is ideal (100). Penalize outside this range.
    let bmiScore = 100;
    if (bmi < 18.5) bmiScore = Math.max(0, 100 - (18.5 - bmi) * 10);
    else if (bmi > 24.9) bmiScore = Math.max(0, 100 - (bmi - 24.9) * 10);

    // 2. Composition Index (0-100)
    // High muscle (good) + Low fat (good)
    const fatScore = (10 - perception.bodyFat) * 10; // Reverse: 0 fat = 100, 10 fat = 0
    const muscleScore = perception.muscleDev * 10;
    const compositionIndex = (fatScore + muscleScore) / 2;

    // 3. Proportion Index (0-100)
    // Waist-to-Height Ratio (WHtR). Ideal is ~0.45 - 0.50
    const whtr = measurements.waistCirc / measurements.height;
    let proportionIndex = 100;
    if (whtr > 0.5) proportionIndex = Math.max(0, 100 - (whtr - 0.5) * 400);
    else if (whtr < 0.4) proportionIndex = Math.max(0, 100 - (0.4 - whtr) * 400);

    // Final Score
    const finalScore = Math.round((compositionIndex * 0.5) + (proportionIndex * 0.3) + (bmiScore * 0.2));
    setScore(finalScore);
    
    setMetrics({
      bmi: Number(bmi.toFixed(1)),
      compositionIndex: Math.round(compositionIndex),
      proportionIndex: Math.round(proportionIndex)
    });

    // Classification
    if (finalScore >= 85) setClassification({ label: 'Excelente', color: 'emerald' });
    else if (finalScore >= 70) setClassification({ label: 'Normal', color: 'cyan' });
    else if (finalScore >= 50) setClassification({ label: 'Atenção', color: 'amber' });
    else setClassification({ label: 'Déficit', color: 'rose' });

    // Alerts
    const newAlerts: string[] = [];
    if (perception.bodyFat > 7) newAlerts.push("Alta Percepção de Massa Gorda");
    if (perception.muscleDev < 4) newAlerts.push("Baixo Desenvolvimento Muscular");
    if (proportionIndex < 60) newAlerts.push("Desequilíbrio Corporal (Proporção)");
    setAlerts(newAlerts);

  }, [measurements, perception]);

  const handleSave = () => {
    onSave({
      type: "Antropométrica",
      score,
      classification: classification.label,
      classification_color: classification.color,
      bmi: metrics.bmi,
      composition_index: metrics.compositionIndex,
      proportion_index: metrics.proportionIndex,
      alerts,
      raw_data: { measurements, perception }
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
            <Scale className="w-6 h-6 text-cyan-500" />
            Avaliação Antropométrica
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Composição Corporal e Proporção
          </p>
        </div>

        <div className={`p-6 rounded-3xl border flex-1 flex items-center justify-between ${getColorClasses(classification.color)}`}>
          <div>
            <p className="text-xxs font-black uppercase tracking-widest opacity-70 mb-1">Score Antropométrico</p>
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
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">IMC</p>
          <p className={`text-2xl font-black ${metrics.bmi >= 18.5 && metrics.bmi <= 24.9 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metrics.bmi}
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Índice de Composição</p>
          <p className={`text-2xl font-black ${metrics.compositionIndex > 70 ? 'text-emerald-400' : metrics.compositionIndex > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.compositionIndex}%
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Índice de Proporção</p>
          <p className={`text-2xl font-black ${metrics.proportionIndex > 70 ? 'text-emerald-400' : metrics.proportionIndex > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.proportionIndex}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Basic Measurements */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-cyan-500" /> Medidas Básicas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Peso" value={measurements.weight} unit="kg" onChange={(v) => setMeasurements({...measurements, weight: v})} />
            <NumberInput label="Altura" value={measurements.height} unit="cm" onChange={(v) => setMeasurements({...measurements, height: v})} />
            <NumberInput label="Circ. Braço" value={measurements.armCirc} unit="cm" onChange={(v) => setMeasurements({...measurements, armCirc: v})} />
            <NumberInput label="Circ. Coxa" value={measurements.thighCirc} unit="cm" onChange={(v) => setMeasurements({...measurements, thighCirc: v})} />
            <div className="col-span-2">
              <NumberInput label="Circ. Cintura" value={measurements.waistCirc} unit="cm" onChange={(v) => setMeasurements({...measurements, waistCirc: v})} />
            </div>
          </div>
        </div>

        {/* Section 2: Perceptions */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500" /> Percepção Corporal (0-10)
          </h3>
          <div className="space-y-3">
            <Slider label="Percepção de Gordura Corporal" value={perception.bodyFat} onChange={(v) => setPerception({...perception, bodyFat: v})} invertColor />
            <Slider label="Percepção de Desenvolvimento Muscular" value={perception.muscleDev} onChange={(v) => setPerception({...perception, muscleDev: v})} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
        <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white font-bold uppercase text-xxs tracking-widest">
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase text-xxs tracking-widest px-8">
          <Save className="w-4 h-4 mr-2" /> Salvar Avaliação
        </Button>
      </div>
    </motion.div>
  );
}
