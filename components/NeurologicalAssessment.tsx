 
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Brain, AlertTriangle, Save, ArrowLeft, Activity, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NeurologicalAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

const MEMORY_WORDS = ["BOLA", "CACHORRO", "VERDE", "CARRO", "MESA"];

export function NeurologicalAssessment({ athleteId, onCancel, onSave }: NeurologicalAssessmentProps) {
  // Section 1: Symptoms (0-6)
  const [symptoms, setSymptoms] = useState({
    headache: 0,
    dizziness: 0,
    nausea: 0,
    lightSensitivity: 0,
    noiseSensitivity: 0,
    concentration: 0,
    slowedDown: 0,
    confusion: 0
  });

  // Section 2: Memory
  const [showWords, setShowWords] = useState(false);
  const [memoryCorrect, setMemoryCorrect] = useState(0);

  // Section 3: Balance
  const [balance, setBalance] = useState({
    doubleLeg: 'stable',
    singleLeg: 'stable',
    tandem: 'stable'
  });

  // Derived State
  const [score, setScore] = useState(100);
  const [classification, setClassification] = useState({ label: 'Excelente', color: 'emerald' });
  const [alerts, setAlerts] = useState<string[]>([]);
  
  const [metrics, setMetrics] = useState({
    symptomScore: 0,
    memoryScore: 100,
    balanceScore: 100
  });

  useEffect(() => {
    // 1. Symptom Score (0-100)
    const totalSymptoms = Object.values(symptoms).reduce((a, b) => a + b, 0);
    const symptomScore = (totalSymptoms / 48) * 100;

    // 2. Memory Score (0-100)
    const memoryScore = (memoryCorrect / 5) * 100;

    // 3. Balance Score (0-100)
    const getBalanceValue = (val: string) => val === 'stable' ? 100 : val === 'sway' ? 70 : 40;
    const balanceScore = (
      getBalanceValue(balance.doubleLeg) + 
      getBalanceValue(balance.singleLeg) + 
      getBalanceValue(balance.tandem)
    ) / 3;

    // Final Score
    const finalScore = Math.round(((100 - symptomScore) * 0.4) + (memoryScore * 0.3) + (balanceScore * 0.3));
    setScore(finalScore);
    
    setMetrics({
      symptomScore: Math.round(symptomScore),
      memoryScore: Math.round(memoryScore),
      balanceScore: Math.round(balanceScore)
    });

    // Classification
    if (finalScore >= 90) setClassification({ label: 'Excelente', color: 'emerald' });
    else if (finalScore >= 75) setClassification({ label: 'Normal', color: 'cyan' });
    else if (finalScore >= 60) setClassification({ label: 'Atenção', color: 'amber' });
    else setClassification({ label: 'Déficit', color: 'rose' });

    // Alerts
    const newAlerts: string[] = [];
    if (Object.values(symptoms).some(v => v >= 4)) newAlerts.push("Sintoma Severo Detectado");
    if (memoryScore < 60) newAlerts.push("Déficit Cognitivo");
    if (Object.values(balance).some(v => v === 'unstable')) newAlerts.push("Instabilidade Postural");
    setAlerts(newAlerts);

  }, [symptoms, memoryCorrect, balance]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
    await onSave({
      type: "Neurológica",
      score,
      classification: classification.label,
      classification_color: classification.color,
      symptom_score: metrics.symptomScore,
      memory_score: metrics.memoryScore,
      balance_score: metrics.balanceScore,
      alerts,
      raw_data: { symptoms, memoryCorrect, balance }
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

  const Slider = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="space-y-2 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
      <div className="flex justify-between items-end">
        <label className="text-xxs font-black text-slate-400 uppercase tracking-widest">{label}</label>
        <span className={`text-lg font-black ${value > 0 ? (value >= 4 ? 'text-rose-400' : 'text-amber-400') : 'text-emerald-400'}`}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="6"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
      />
      <div className="flex justify-between text-xxs font-bold text-slate-600 uppercase tracking-widest">
        <span>Nenhum (0)</span>
        <span>Severo (6)</span>
      </div>
    </div>
  );

  const BalanceSelect = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="space-y-3 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
      <label className="text-xxs font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: 'stable', label: 'Estável' },
          { id: 'sway', label: 'Leve Desvio' },
          { id: 'unstable', label: 'Instável' }
        ].map(opt => (
          <button
            key={opt.id}
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
            <Brain className="w-6 h-6 text-cyan-500" />
            Avaliação Neurológica
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Baseline e Rastreio de Concussão
          </p>
        </div>

        <div className={`p-6 rounded-3xl border flex-1 flex items-center justify-between ${getColorClasses(classification.color)}`}>
          <div>
            <p className="text-xxs font-black uppercase tracking-widest opacity-70 mb-1">Score Neurológico</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{score}</span>
              <span className="text-sm font-bold uppercase tracking-widest opacity-80">{classification.label}</span>
            </div>
            {alerts.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-xxs font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md w-fit border border-rose-500/20">
                <AlertTriangle className="w-3 h-3" /> {alerts[0]} {alerts.length > 1 && `(+${alerts.length - 1})`}
              </div>
            )}
          </div>
          <Activity className="w-12 h-12 opacity-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Symptoms */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>Sintomas (0-6)</span>
            <span className="text-xxs text-slate-500">Impacto: {metrics.symptomScore}%</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Slider label="Dor de Cabeça" value={symptoms.headache} onChange={(v) => setSymptoms({...symptoms, headache: v})} />
            <Slider label="Tontura" value={symptoms.dizziness} onChange={(v) => setSymptoms({...symptoms, dizziness: v})} />
            <Slider label="Náusea" value={symptoms.nausea} onChange={(v) => setSymptoms({...symptoms, nausea: v})} />
            <Slider label="Sensibilidade à Luz" value={symptoms.lightSensitivity} onChange={(v) => setSymptoms({...symptoms, lightSensitivity: v})} />
            <Slider label="Sensibilidade ao Som" value={symptoms.noiseSensitivity} onChange={(v) => setSymptoms({...symptoms, noiseSensitivity: v})} />
            <Slider label="Dificuldade de Concentração" value={symptoms.concentration} onChange={(v) => setSymptoms({...symptoms, concentration: v})} />
            <Slider label="Sensação de Lentidão" value={symptoms.slowedDown} onChange={(v) => setSymptoms({...symptoms, slowedDown: v})} />
            <Slider label="Confusão Mental" value={symptoms.confusion} onChange={(v) => setSymptoms({...symptoms, confusion: v})} />
          </div>
        </div>

        <div className="space-y-8">
          {/* Section 2: Memory */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Memória (Recall Imediato)</span>
              <span className="text-xxs text-slate-500">Score: {metrics.memoryScore}%</span>
            </h3>
            <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Lista de Palavras</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowWords(!showWords)}
                  className="h-7 text-xxs font-bold uppercase tracking-widest border-slate-700 text-slate-300"
                >
                  {showWords ? <><EyeOff className="w-3 h-3 mr-1" /> Ocultar</> : <><Eye className="w-3 h-3 mr-1" /> Mostrar</>}
                </Button>
              </div>
              
              {showWords ? (
                <div className="flex flex-wrap gap-2">
                  {MEMORY_WORDS.map(word => (
                    <span key={word} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-black tracking-widest">
                      {word}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="h-8 flex items-center text-xxs font-bold text-slate-500 uppercase tracking-widest italic">
                  Palavras ocultas para o teste
                </div>
              )}

              <div className="pt-4 border-t border-slate-800/50">
                <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest mb-3">Palavras Lembradas Corretamente</p>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => setMemoryCorrect(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                        memoryCorrect === num 
                          ? 'bg-cyan-500 text-[#050B14] shadow-lg shadow-cyan-500/20' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Balance */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Equilíbrio (BESS Simplificado)</span>
              <span className="text-xxs text-slate-500">Score: {metrics.balanceScore}%</span>
            </h3>
            <div className="space-y-3">
              <BalanceSelect label="Apoio Bipodal (Pés Juntos)" value={balance.doubleLeg} onChange={(v) => setBalance({...balance, doubleLeg: v})} />
              <BalanceSelect label="Apoio Unipodal (Perna Não Dominante)" value={balance.singleLeg} onChange={(v) => setBalance({...balance, singleLeg: v})} />
              <BalanceSelect label="Apoio Tandem (Calcanhar-Ponta)" value={balance.tandem} onChange={(v) => setBalance({...balance, tandem: v})} />
            </div>
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
