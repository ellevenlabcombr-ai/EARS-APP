"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PersonStanding, AlertTriangle, Save, Activity, Ruler, Target, Heart, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestInfoModal } from "@/components/TestInfoModal";

interface MaturationAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

const NumberInput = ({ label, value, unit, onChange }: { label: string, value: number, unit: string, onChange: (v: number) => void }) => (
  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 flex flex-col justify-between">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</label>
    <div className="relative">
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-black text-sm focus:outline-none focus:border-cyan-500 transition-colors"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 uppercase">{unit}</span>
    </div>
  </div>
);

export function MaturationAssessmentForm({ athleteId, onCancel, onSave }: MaturationAssessmentProps) {
  const [step, setStep] = useState(1);

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
    let maturationIndex = 50;
    if (ratio < 0.5) maturationIndex = 80; 
    else if (ratio > 0.53) maturationIndex = 30; 
    
    // Adjust based on age and weight
    if (data.age < 12) maturationIndex -= 20;
    if (data.age > 16) maturationIndex += 20;

    const midParentHeight = (data.motherHeight + data.fatherHeight) / 2;
    if (data.height > midParentHeight) maturationIndex += 5;

    maturationIndex = Math.max(0, Math.min(100, maturationIndex));

    // 2. Growth Status
    let status = 'Circa-PHV';
    if (maturationIndex < 40) status = 'Pre-PHV';
    else if (maturationIndex > 70) status = 'Post-PHV';

    // 3. Final Score 
    let finalScore = 100;
    if (status === 'Circa-PHV') finalScore = 60; 
    else if (status === 'Pre-PHV') finalScore = 80;
    else finalScore = 90;

    setScore(finalScore);
    setGrowthStatus(status);
    setMetrics({
      maturationIndex: Math.round(maturationIndex),
      legLength: Math.round(legLength),
      ratio: Number(ratio.toFixed(2))
    });

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

    const newAlerts: string[] = [];
    if (classLabel === 'Precoce') newAlerts.push("Aceleração Precoce");
    if (classLabel === 'Tardio') newAlerts.push("Desenvolvimento Tardio");
    if (status === 'Circa-PHV') newAlerts.push("Risco de Estirão (Atenção)");
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

  const formSteps = [
    { id: 1, title: 'Atleta', icon: PersonStanding },
    { id: 2, title: 'Segmentos', icon: Ruler },
    { id: 3, title: 'Pais', icon: Target },
    { id: 4, title: 'Resultado', icon: Save },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <PersonStanding className="w-6 h-6 text-cyan-400" />
          </div>
          <TestInfoModal
            title="Avaliação de Maturação"
            indication="Estimar a idade biológica e o Pico de Velocidade de Crescimento (PHV) para adequar as cargas de treino nas categorias de base."
            application="Via método de Mirwald ou Khamis-Roche, coleta-se altura, peso, e altura sentado."
            referenceValues={["Pré-PHV: Crescimento acelerando", "Circa-PHV: Pico de crescimento (estirão)", "Pós-PHV: Crescimento desacelerando, focar em força muscular"]}
            deficitGrades={["Leve (pequeno desvio em relação à IG cronológica)", "Atenção: Atleta no estirão, vulnerável a dores nas epífises e trações musculares (Doença de Osgood-Schlatter, Sever)."]}
          >
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight hover:text-cyan-400 transition-colors">Avaliação de Maturação</h2>
              <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest text-left">Estágio de Maturação e PHV</p>
            </div>
          </TestInfoModal>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-start md:justify-between gap-4 md:gap-0 overflow-x-auto no-scrollbar px-4 py-4 my-2 w-full max-w-4xl mx-auto">
        {formSteps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div 
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all shrink-0 ${step === s.id ? 'scale-110' : 'opacity-40'}`}
              onClick={() => setStep(s.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] md:text-xs font-black uppercase tracking-widest text-center max-w-[5rem] md:max-w-[7rem] leading-tight mt-1">{s.title}</span>
            </div>
            {i < formSteps.length - 1 && (
              <div className={`w-8 md:flex-1 h-[2px] shrink-0 mb-8 mx-2 ${step > s.id ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <PersonStanding className="w-4 h-4 text-cyan-500" /> Dados Básicos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Idade" value={data.age} unit="anos" onChange={(v) => setData({...data, age: v})} />
              <NumberInput label="Peso Atual" value={data.weight} unit="kg" onChange={(v) => setData({...data, weight: v})} />
            </div>
          </motion.div>
        )}

        {step === 2 && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-cyan-500" /> Estatura e Segmentos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Altura (Em Pé)" value={data.height} unit="cm" onChange={(v) => setData({...data, height: v})} />
              <NumberInput label="Altura Sentado" value={data.sittingHeight} unit="cm" onChange={(v) => setData({...data, sittingHeight: v})} />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-500" /> Alvo Genético
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Altura da Mãe" value={data.motherHeight} unit="cm" onChange={(v) => setData({...data, motherHeight: v})} />
              <NumberInput label="Altura do Pai" value={data.fatherHeight} unit="cm" onChange={(v) => setData({...data, fatherHeight: v})} />
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-8 text-center border-b border-slate-800">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">Estabilidade</p>
                <div className="text-7xl font-black text-white mb-3">{score}</div>
                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getColorClasses(classification.color)}`}>
                  {classification.label}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Índice</span>
                    <span className="text-lg font-black mt-1 text-cyan-400">{metrics.maturationIndex}</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Razão</span>
                    <span className="text-lg font-black mt-1 text-cyan-400">{metrics.ratio}</span>
                  </div>
                  <div className="col-span-2 bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                    <span className="text-lg font-black mt-1 truncate max-w-full text-cyan-400">{growthStatus}</span>
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

                <Button onClick={handleSave} disabled={isSaving} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white uppercase tracking-widest text-xs font-black h-14 rounded-xl">
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

        {step < 4 && (
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
              className="bg-cyan-600 hover:bg-cyan-500 text-white uppercase tracking-widest text-[10px] font-black w-32"
            >
              {step === 3 ? 'Ver Resultado' : 'Próximo'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
