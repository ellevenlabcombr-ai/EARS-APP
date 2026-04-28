 
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Droplet, AlertTriangle, Save, Activity, Thermometer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HydrationAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

const Slider = ({ label, value, onChange, invertColor = false, min = 0, max = 10, step = 1 }: { label: string, value: number, onChange: (v: number) => void, invertColor?: boolean, min?: number, max?: number, step?: number }) => {
  const isHighBad = invertColor;
  const ratio = (value - min) / (max - min);
  const valueColor = isHighBad 
    ? (ratio > 0.7 ? 'text-rose-400' : ratio > 0.4 ? 'text-amber-400' : 'text-emerald-400')
    : (ratio < 0.4 ? 'text-rose-400' : ratio < 0.7 ? 'text-amber-400' : 'text-emerald-400');

  return (
    <div className="space-y-2 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
        <span className={`text-sm font-black ${valueColor}`}>{value}/{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
      />
    </div>
  );
};

const NumberInput = ({ label, value, unit, onChange, step = 1 }: { label: string, value: number, unit: string, onChange: (v: number) => void, step?: number }) => (
  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 flex flex-col justify-between">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</label>
    <div className="relative">
      <input
        type="number"
        step={step}
        value={value === 0 ? "0" : value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-bold text-sm focus:outline-none focus:border-cyan-500 transition-colors"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">{unit}</span>
    </div>
  </div>
);

const Checkbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/50 bg-slate-900/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
    <div className={`w-4 h-4 rounded flex items-center justify-center border ${checked ? 'bg-rose-500 border-rose-500' : 'border-slate-600'}`}>
      {checked && <div className="w-2 h-2 bg-[#050B14] rounded-sm" />}
    </div>
    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{label}</span>
  </label>
);

export function HydrationAssessmentForm({ athleteId, onCancel, onSave }: HydrationAssessmentProps) {
  const [step, setStep] = useState(1);
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

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        type: "Hidratação",
        score,
        classification: classification.label,
        classification_color: classification.color,
        hydration_index: metrics.hydrationIndex,
        physiological_stress: metrics.physiologicalStress,
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

  const formSteps = [
    { id: 1, title: 'Status', icon: Droplet },
    { id: 2, title: 'Fisiologia', icon: Thermometer },
    { id: 3, title: 'Resultado', icon: Save },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Avaliação Hidratação</h2>
            <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">Status de Hidratação e Impacto</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-4 py-2 my-2">
        {formSteps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div 
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all shrink-0 ${step === s.id ? 'scale-110' : 'opacity-40'}`}
              onClick={() => setStep(s.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] font-black uppercase tracking-widest text-center max-w-[5rem] leading-tight">{s.title}</span>
            </div>
            {i < formSteps.length - 1 && (
              <div className={`w-8 h-[2px] shrink-0 mb-8 ${step > s.id ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-500" /> Status de Hidratação
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Slider label="Percepção de Hidratação" value={data.perception} onChange={(v) => setData({...data, perception: v})} />
              <Slider label="Cor da Urina" value={data.urineColor} min={1} max={8} onChange={(v) => setData({...data, urineColor: v})} invertColor />
              <Slider label="Nível de Sede" value={data.thirst} onChange={(v) => setData({...data, thirst: v})} invertColor />
              <NumberInput label="Ingestão de Líquidos" value={data.fluidIntake} unit="L/dia" step={0.1} onChange={(v) => setData({...data, fluidIntake: v})} />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-blue-500" /> Impacto Fisiológico
            </h3>
            <div className="space-y-4">
              <NumberInput label="Variação de Peso (Ex: -2 para perda de 2%)" value={data.weightVariation} unit="%" step={0.1} onChange={(v) => setData({...data, weightVariation: v})} />
              
              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Sintomas Relatados</label>
                <div className="grid grid-cols-2 gap-3">
                  <Checkbox label="Dor de Cabeça" checked={data.symptoms.headache} onChange={(v) => setData({...data, symptoms: {...data.symptoms, headache: v}})} />
                  <Checkbox label="Tontura" checked={data.symptoms.dizziness} onChange={(v) => setData({...data, symptoms: {...data.symptoms, dizziness: v}})} />
                  <Checkbox label="Cãibras" checked={data.symptoms.cramps} onChange={(v) => setData({...data, symptoms: {...data.symptoms, cramps: v}})} />
                  <Checkbox label="Fadiga" checked={data.symptoms.fatigue} onChange={(v) => setData({...data, symptoms: {...data.symptoms, fatigue: v}})} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-8 text-center border-b border-slate-800">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">Score Hidratação</p>
                <div className="text-7xl font-black text-white mb-3">{score}</div>
                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getColorClasses(classification.color)}`}>
                  {classification.label}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Índice de Hidratação</span>
                    <span className={`text-xl font-black ${metrics.hydrationIndex > 70 ? 'text-emerald-400' : metrics.hydrationIndex > 50 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.hydrationIndex}%</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estresse Fisiológico</span>
                    <span className={`text-xl font-black ${metrics.physiologicalStress < 30 ? 'text-emerald-400' : metrics.physiologicalStress < 70 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.physiologicalStress}%</span>
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

                <Button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-500 text-white uppercase tracking-widest text-xs font-black h-14 rounded-xl">
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

        {step < 3 && (
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
              className="bg-blue-600 hover:bg-blue-500 text-white uppercase tracking-widest text-[10px] font-black w-32"
            >
              {step === 2 ? 'Ver Resultado' : 'Próximo'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
