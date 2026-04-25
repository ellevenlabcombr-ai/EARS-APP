 
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BrainCircuit, AlertTriangle, Save, ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PsychologicalAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

export function PsychologicalAssessment({ athleteId, onCancel, onSave }: PsychologicalAssessmentProps) {
  // Section 1: Emotional State (0-10)
  const [emotional, setEmotional] = useState({ mood: 5, stress: 5, anxiety: 5 });

  // Section 2: Cognition (0-10)
  const [cognition, setCognition] = useState({ concentration: 5, mentalFatigue: 5, distraction: 5 });

  // Section 3: Motivation (0-10)
  const [motivation, setMotivation] = useState({ train: 5, enjoyment: 5, compete: 5 });

  // Section 4: Confidence & Fear (0-10)
  const [confidence, setConfidence] = useState({ confidence: 5, fearInjury: 5, fearMistakes: 5 });

  // Section 5: Pressure (0-10)
  const [pressure, setPressure] = useState({ school: 5, family: 5, competition: 5 });

  // Derived State
  const [score, setScore] = useState(100);
  const [classification, setClassification] = useState({ label: 'Normal', color: 'cyan' });
  const [alerts, setAlerts] = useState<string[]>([]);
  
  const [metrics, setMetrics] = useState({
    stressIndex: 50,
    fatigueIndex: 50,
    readinessIndex: 50
  });

  useEffect(() => {
    // 1. Stress Index (0-100)
    const stressAvg = (emotional.stress + emotional.anxiety + pressure.school + pressure.competition) / 4;
    const stressIndex = stressAvg * 10;

    // 2. Fatigue Index (0-100)
    const fatigueAvg = (cognition.mentalFatigue + cognition.distraction) / 2;
    const fatigueIndex = fatigueAvg * 10;

    // 3. Readiness Index (0-100)
    const readinessAvg = (emotional.mood + motivation.train + confidence.confidence + cognition.concentration) / 4;
    const readinessIndex = readinessAvg * 10;

    // Final Score
    const finalScore = Math.round((readinessIndex * 0.5) + ((100 - stressIndex) * 0.3) + ((100 - fatigueIndex) * 0.2));
    setScore(finalScore);
    
    setMetrics({
      stressIndex: Math.round(stressIndex),
      fatigueIndex: Math.round(fatigueIndex),
      readinessIndex: Math.round(readinessIndex)
    });

    // Classification
    if (finalScore >= 85) setClassification({ label: 'Excelente', color: 'emerald' });
    else if (finalScore >= 70) setClassification({ label: 'Normal', color: 'cyan' });
    else if (finalScore >= 50) setClassification({ label: 'Atenção', color: 'amber' });
    else setClassification({ label: 'Déficit', color: 'rose' });

    // Alerts
    const newAlerts: string[] = [];
    if (stressIndex > 70) newAlerts.push("Alto Estresse");
    if (confidence.fearInjury > 7) newAlerts.push("Cinesiofobia (Medo de Movimento)");
    if (motivation.train < 4) newAlerts.push("Baixa Motivação");
    if (confidence.confidence < 4) newAlerts.push("Baixa Confiança");
    setAlerts(newAlerts);

  }, [emotional, cognition, motivation, confidence, pressure]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
    await onSave({
      type: "Psicológica",
      score,
      classification: classification.label,
      classification_color: classification.color,
      stress_index: metrics.stressIndex,
      fatigue_index: metrics.fatigueIndex,
      readiness_index: metrics.readinessIndex,
      alerts,
      raw_data: { emotional, cognition, motivation, confidence, pressure }
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

  const Slider = ({ label, value, onChange, invertColor = false }: { label: string, value: number, onChange: (v: number) => void, invertColor?: boolean }) => {
    // For positive traits (mood, confidence), high is green.
    // For negative traits (stress, fear), high is red.
    const isHighBad = invertColor;
    const valueColor = isHighBad 
      ? (value > 7 ? 'text-rose-400' : value > 4 ? 'text-amber-400' : 'text-emerald-400')
      : (value < 4 ? 'text-rose-400' : value < 7 ? 'text-amber-400' : 'text-emerald-400');

    return (
      <div className="space-y-2 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
        <div className="flex justify-between items-end">
          <label className="text-xxs font-black text-slate-400 uppercase tracking-widest">{label}</label>
          <span className={`text-lg font-black ${valueColor}`}>{value}</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-xxs font-bold text-slate-600 uppercase tracking-widest">
          <span>Baixo (0)</span>
          <span>Alto (10)</span>
        </div>
      </div>
    );
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
            <BrainCircuit className="w-6 h-6 text-cyan-500" />
            Avaliação Psicológica
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Prontidão Mental e Risco Comportamental
          </p>
        </div>

        <div className={`p-6 rounded-3xl border flex-1 flex items-center justify-between ${getColorClasses(classification.color)}`}>
          <div>
            <p className="text-xxs font-black uppercase tracking-widest opacity-70 mb-1">Score Psicológico</p>
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
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Índice de Prontidão</p>
          <p className={`text-2xl font-black ${metrics.readinessIndex > 70 ? 'text-emerald-400' : metrics.readinessIndex > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.readinessIndex}%
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Índice de Estresse</p>
          <p className={`text-2xl font-black ${metrics.stressIndex < 40 ? 'text-emerald-400' : metrics.stressIndex < 70 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.stressIndex}%
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Índice de Fadiga Mental</p>
          <p className={`text-2xl font-black ${metrics.fatigueIndex < 40 ? 'text-emerald-400' : metrics.fatigueIndex < 70 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.fatigueIndex}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Emotional State */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2">
            Estado Emocional (0-10)
          </h3>
          <div className="space-y-3">
            <Slider label="Humor Geral" value={emotional.mood} onChange={(v) => setEmotional({...emotional, mood: v})} />
            <Slider label="Nível de Estresse" value={emotional.stress} onChange={(v) => setEmotional({...emotional, stress: v})} invertColor />
            <Slider label="Ansiedade" value={emotional.anxiety} onChange={(v) => setEmotional({...emotional, anxiety: v})} invertColor />
          </div>
        </div>

        {/* Section 2: Cognition */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2">
            Cognição (0-10)
          </h3>
          <div className="space-y-3">
            <Slider label="Concentração" value={cognition.concentration} onChange={(v) => setCognition({...cognition, concentration: v})} />
            <Slider label="Fadiga Mental" value={cognition.mentalFatigue} onChange={(v) => setCognition({...cognition, mentalFatigue: v})} invertColor />
            <Slider label="Distração" value={cognition.distraction} onChange={(v) => setCognition({...cognition, distraction: v})} invertColor />
          </div>
        </div>

        {/* Section 3: Motivation */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2">
            Motivação (0-10)
          </h3>
          <div className="space-y-3">
            <Slider label="Motivação para Treinar" value={motivation.train} onChange={(v) => setMotivation({...motivation, train: v})} />
            <Slider label="Prazer na Prática" value={motivation.enjoyment} onChange={(v) => setMotivation({...motivation, enjoyment: v})} />
            <Slider label="Vontade de Competir" value={motivation.compete} onChange={(v) => setMotivation({...motivation, compete: v})} />
          </div>
        </div>

        {/* Section 4: Confidence & Fear */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2">
            Confiança e Medo (0-10)
          </h3>
          <div className="space-y-3">
            <Slider label="Autoconfiança" value={confidence.confidence} onChange={(v) => setConfidence({...confidence, confidence: v})} />
            <Slider label="Medo de Lesão" value={confidence.fearInjury} onChange={(v) => setConfidence({...confidence, fearInjury: v})} invertColor />
            <Slider label="Medo de Errar" value={confidence.fearMistakes} onChange={(v) => setConfidence({...confidence, fearMistakes: v})} invertColor />
          </div>
        </div>

        {/* Section 5: Pressure */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2">
            Pressão Percebida (0-10)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Slider label="Pressão Escolar/Acadêmica" value={pressure.school} onChange={(v) => setPressure({...pressure, school: v})} invertColor />
            <Slider label="Pressão Familiar" value={pressure.family} onChange={(v) => setPressure({...pressure, family: v})} invertColor />
            <Slider label="Pressão por Resultados" value={pressure.competition} onChange={(v) => setPressure({...pressure, competition: v})} invertColor />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
        <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white font-bold uppercase text-xxs tracking-widest">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase text-xxs tracking-widest px-8">
          {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Salvar Avaliação
        </Button>
      </div>
    </motion.div>
  );
}
