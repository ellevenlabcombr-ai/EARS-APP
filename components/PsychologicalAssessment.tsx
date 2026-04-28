 
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BrainCircuit, AlertTriangle, Save, ArrowLeft, Activity, Heart, Zap, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PsychologicalAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

export function PsychologicalAssessment({ athleteId, onCancel, onSave }: PsychologicalAssessmentProps) {
  const [step, setStep] = useState(1);
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
    if (confidence.fearInjury > 7) newAlerts.push("Cinesiofobia");
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
    const isHighBad = invertColor;
    const valueColor = isHighBad 
      ? (value > 7 ? 'text-rose-400' : value > 4 ? 'text-amber-400' : 'text-emerald-400')
      : (value < 4 ? 'text-rose-400' : value < 7 ? 'text-amber-400' : 'text-emerald-400');

    return (
      <div className="space-y-2 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
        <div className="flex justify-between items-end">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
          <span className={`text-sm font-black ${valueColor}`}>{value}/10</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${isHighBad ? 'accent-rose-500' : 'accent-purple-500'}`}
        />
      </div>
    );
  };

  const steps = [
    { id: 1, title: 'Emocional', icon: Heart },
    { id: 2, title: 'Cognição', icon: BrainCircuit },
    { id: 3, title: 'Motivação', icon: Zap },
    { id: 4, title: 'Confiança', icon: Target },
    { id: 5, title: 'Pressão', icon: AlertTriangle },
    { id: 6, title: 'Resultado', icon: Save },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Avaliação Psicológica</h2>
            <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">Prontidão Mental e Risco</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-start md:justify-between gap-4 md:gap-0 overflow-x-auto no-scrollbar px-4 py-4 my-2 w-full max-w-4xl mx-auto">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div 
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all shrink-0 ${step === s.id ? 'scale-110' : 'opacity-40'}`}
              onClick={() => setStep(s.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] md:text-xs font-black uppercase tracking-widest text-center max-w-[5rem] md:max-w-[7rem] leading-tight mt-1">{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 md:flex-1 h-[2px] shrink-0 mb-8 mx-2 ${step > s.id ? 'bg-purple-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-400" /> Estado Emocional
            </h3>
            <div className="space-y-3">
              <Slider label="Humor Geral" value={emotional.mood} onChange={(v) => setEmotional({...emotional, mood: v})} />
              <Slider label="Nível de Estresse" value={emotional.stress} onChange={(v) => setEmotional({...emotional, stress: v})} invertColor />
              <Slider label="Ansiedade" value={emotional.anxiety} onChange={(v) => setEmotional({...emotional, anxiety: v})} invertColor />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-400" /> Cognição
            </h3>
            <div className="space-y-3">
              <Slider label="Concentração" value={cognition.concentration} onChange={(v) => setCognition({...cognition, concentration: v})} />
              <Slider label="Fadiga Mental" value={cognition.mentalFatigue} onChange={(v) => setCognition({...cognition, mentalFatigue: v})} invertColor />
              <Slider label="Distração" value={cognition.distraction} onChange={(v) => setCognition({...cognition, distraction: v})} invertColor />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" /> Motivação
            </h3>
            <div className="space-y-3">
              <Slider label="Vontade de Treinar" value={motivation.train} onChange={(v) => setMotivation({...motivation, train: v})} />
              <Slider label="Prazer na Prática" value={motivation.enjoyment} onChange={(v) => setMotivation({...motivation, enjoyment: v})} />
              <Slider label="Vontade de Competir" value={motivation.compete} onChange={(v) => setMotivation({...motivation, compete: v})} />
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" /> Confiança e Medo
            </h3>
            <div className="space-y-3">
              <Slider label="Autoconfiança" value={confidence.confidence} onChange={(v) => setConfidence({...confidence, confidence: v})} />
              <Slider label="Medo de Lesão" value={confidence.fearInjury} onChange={(v) => setConfidence({...confidence, fearInjury: v})} invertColor />
              <Slider label="Medo de Errar" value={confidence.fearMistakes} onChange={(v) => setConfidence({...confidence, fearMistakes: v})} invertColor />
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-400" /> Pressão Percebida
            </h3>
            <div className="space-y-3">
              <Slider label="Pressão Escolar/Acadêmica" value={pressure.school} onChange={(v) => setPressure({...pressure, school: v})} invertColor />
              <Slider label="Pressão Familiar" value={pressure.family} onChange={(v) => setPressure({...pressure, family: v})} invertColor />
              <Slider label="Pressão Constante por Resultados" value={pressure.competition} onChange={(v) => setPressure({...pressure, competition: v})} invertColor />
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-8 text-center border-b border-slate-800">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">Score Psicológico</p>
                <div className="text-7xl font-black text-white mb-3">{score}</div>
                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getColorClasses(classification.color)}`}>
                  {classification.label}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Índice Prontidão</span>
                    <span className={`text-xl font-black ${metrics.readinessIndex > 70 ? 'text-emerald-400' : metrics.readinessIndex > 50 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.readinessIndex}%</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Índice Estresse</span>
                    <span className={`text-xl font-black ${metrics.stressIndex < 40 ? 'text-emerald-400' : metrics.stressIndex < 70 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.stressIndex}%</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Índice Fadiga</span>
                    <span className={`text-xl font-black ${metrics.fatigueIndex < 40 ? 'text-emerald-400' : metrics.fatigueIndex < 70 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.fatigueIndex}%</span>
                  </div>
                </div>

                {alerts.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-4">Atenção Crítica</h4>
                    {alerts.map((alert, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-4 py-3 rounded-xl border border-rose-500/20">
                        <AlertTriangle className="w-4 h-4 shrink-0" /> {alert}
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={handleSave} disabled={isSaving} className="w-full bg-purple-600 hover:bg-purple-500 text-white uppercase tracking-widest text-xs font-black h-14 rounded-xl">
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  ) : (
                    <Save className="w-5 h-5 mr-3" />
                  )}
                  {isSaving ? 'Salvando...' : 'Salvar Avaliação'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step < 6 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <Button 
              variant="ghost" 
              onClick={() => step > 1 ? setStep(step - 1) : onCancel()} 
              className="text-slate-400 hover:text-white uppercase tracking-widest text-[10px] font-black"
            >
              {step === 1 ? 'Cancelar' : 'Anterior'}
            </Button>
            <Button 
              onClick={() => setStep(step + 1)} 
              className="bg-purple-600 hover:bg-purple-500 text-white uppercase tracking-widest text-[10px] font-black w-32"
            >
              {step === 5 ? 'Ver Resultado' : 'Próximo'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

