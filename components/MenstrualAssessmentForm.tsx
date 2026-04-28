 
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Droplets, AlertTriangle, Save, Activity, CalendarHeart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestInfoModal } from "@/components/TestInfoModal";

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
    <div className="space-y-2 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
        <span className={`text-sm font-black ${valueColor}`}>{value}/{max}</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
      />
    </div>
  );
};

const SelectGroup = ({ label, value, options, onChange }: { label: string, value: string | boolean, options: {id: string | boolean, label: string}[], onChange: (v: any) => void }) => (
  <div className="space-y-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map(opt => (
        <button
          key={String(opt.id)}
          onClick={() => onChange(opt.id)}
          className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
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
  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 flex flex-col justify-between">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</label>
    <div className="relative">
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-bold text-sm focus:outline-none focus:border-cyan-500 transition-colors"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">{unit}</span>
    </div>
  </div>
);

export function MenstrualAssessmentForm({ athleteId, onCancel, onSave }: MenstrualAssessmentProps) {
  const [step, setStep] = useState(1);
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
    const symptomLoad = ((data.pain + data.pms) / 20) * 100;

    // 3. Hormonal Stability (0-100)
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
    if (data.regularity === 'irregular') newAlerts.push("Instabilidade Hormonal");
    if (data.pain > 7) newAlerts.push("Dismenorreia Severa");
    if (data.cycleLength < 21 || data.cycleLength > 35) newAlerts.push("Ciclo Fora do Padrão");
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

  const formSteps = [
    { id: 1, title: 'Ciclo', icon: CalendarHeart },
    { id: 2, title: 'Sintomas', icon: Activity },
    { id: 3, title: 'Resultado', icon: Save },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-pink-400" />
          </div>
          <TestInfoModal
            title="Avaliação Menstrual"
            indication="Monitoramento do ciclo para prevenir deficiência de energia e adequar carga de treino/recuperação às fases."
            application="Preenchimento de formulário sobre regularidade de ciclo, dor (dismenorreia) e fluxo."
            referenceValues={["Score > 80: Ciclo regular e saudável", "Score 60-79: Alteraçãos leves ou dor ocasional", "Score < 60: Irregularidade ou bloqueio (risco RED-S)"]}
            deficitGrades={["Leve (Tensão pré-menstrual reportada)", "Moderado (Dismenorreia ou Oligomenorreia)", "Severo (Amenorreia secundária > 3 meses)"]}
          >
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight hover:text-cyan-400 transition-colors">Avaliação Menstrual</h2>
              <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest text-left">Saúde Hormonal da Atleta</p>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-pink-500 bg-pink-500/10 text-pink-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] md:text-xs font-black uppercase tracking-widest text-center max-w-[5rem] md:max-w-[7rem] leading-tight mt-1">{s.title}</span>
            </div>
            {i < formSteps.length - 1 && (
              <div className={`w-8 md:flex-1 h-[2px] shrink-0 mb-8 mx-2 ${step > s.id ? 'bg-pink-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-8 text-center border-b border-slate-800">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">Score Menstrual</p>
                <div className="text-7xl font-black text-white mb-3">{score}</div>
                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getColorClasses(classification.color)}`}>
                  {classification.label}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Regularidade</span>
                    <span className={`text-xl font-black ${metrics.regularityIndex > 70 ? 'text-emerald-400' : metrics.regularityIndex > 50 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.regularityIndex}%</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Carga Sintomas</span>
                    <span className={`text-xl font-black ${metrics.symptomLoad < 30 ? 'text-emerald-400' : metrics.symptomLoad < 70 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.symptomLoad}%</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estabilidade</span>
                    <span className={`text-xl font-black ${metrics.hormonalStability > 70 ? 'text-emerald-400' : metrics.hormonalStability > 50 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.hormonalStability}%</span>
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

                <Button onClick={handleSave} disabled={isSaving} className="w-full bg-pink-600 hover:bg-pink-500 text-white uppercase tracking-widest text-xs font-black h-14 rounded-xl">
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
              className="bg-pink-600 hover:bg-pink-500 text-white uppercase tracking-widest text-[10px] font-black w-32"
            >
              {step === 2 ? 'Ver Resultado' : 'Próximo'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
