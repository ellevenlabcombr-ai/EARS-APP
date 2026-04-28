 
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Activity, TrendingDown, ShieldAlert, ActivitySquare, Utensils, AlertTriangle, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RedSAssessmentProps {
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
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
      />
    </div>
  );
};

const SelectGroup = ({ label, value, options, onChange }: { label: string, value: string | boolean, options: {id: string | boolean, label: string}[], onChange: (v: any) => void }) => (
  <div className="space-y-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-2 gap-2">
      {options.map(opt => (
        <button
          key={String(opt.id)}
          onClick={() => onChange(opt.id)}
          className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            value === opt.id 
              ? 'bg-rose-500 text-[#050B14] shadow-lg shadow-rose-500/20' 
              : 'bg-slate-900/50 text-slate-500 border border-slate-800 hover:border-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export function RedSAssessmentForm({ athleteId, onCancel, onSave }: RedSAssessmentProps) {
  const [step, setStep] = useState(1);

  // Section 1: Energy Balance
  const [energy, setEnergy] = useState({
    dailyEnergy: 5,
    exhaustion: 5,
    recovered: 5,
    weightLoss: false
  });

  // Section 2: Performance Impact
  const [performance, setPerformance] = useState({
    drop: 5,
    earlyFatigue: 5,
    reducedStrength: 5
  });

  // Section 3: Recovery & Immunity
  const [recovery, setRecovery] = useState({
    illness: false,
    slowRecovery: 5,
    persistentFatigue: 5
  });

  // Section 4: Hormonal Indicators
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [hormonalF, setHormonalF] = useState({
    irregularCycle: false,
    missedPeriods: false,
    symptoms: 5
  });
  const [hormonalM, setHormonalM] = useState({
    reducedLibido: 5,
    lowMotivation: 5
  });

  // Section 5: Nutritional Behavior
  const [behavior, setBehavior] = useState({
    skippingMeals: false,
    restrictiveEating: false,
    fearWeightGain: 5
  });

  // Derived State
  const [score, setScore] = useState(100);
  const [classification, setClassification] = useState({ label: 'Normal', color: 'cyan' });
  const [riskLevel, setRiskLevel] = useState('Baixo Risco');
  const [alerts, setAlerts] = useState<string[]>([]);
  
  const [metrics, setMetrics] = useState({
    energyDeficit: 0,
    performanceDecline: 0,
    recoveryImpairment: 0,
    hormonalRisk: 0,
    behaviorRisk: 0
  });

  useEffect(() => {
    // 1. Energy Deficit Index (0-100)
    const lowEnergyScore = (10 - energy.dailyEnergy) * 3.33;
    const exhaustionScore = energy.exhaustion * 3.33;
    const weightLossScore = energy.weightLoss ? 33.3 : 0;
    const energyDeficit = lowEnergyScore + exhaustionScore + weightLossScore;

    // 2. Performance Decline Index (0-100)
    const performanceDecline = (performance.drop * 3.33) + (performance.earlyFatigue * 3.33) + (performance.reducedStrength * 3.33);

    // 3. Recovery Impairment Index (0-100)
    const illnessScore = recovery.illness ? 33.3 : 0;
    const recoveryImpairment = illnessScore + (recovery.slowRecovery * 3.33) + (recovery.persistentFatigue * 3.33);

    // 4. Hormonal Risk Index (0-100)
    let hormonalRisk = 0;
    if (gender === 'F') {
      hormonalRisk = (hormonalF.irregularCycle ? 33.3 : 0) + (hormonalF.missedPeriods ? 33.3 : 0) + (hormonalF.symptoms * 3.33);
    } else {
      hormonalRisk = (hormonalM.reducedLibido * 5) + (hormonalM.lowMotivation * 5);
    }

    // 5. Behavior Risk Index (0-100)
    const behaviorRisk = (behavior.skippingMeals ? 33.3 : 0) + (behavior.restrictiveEating ? 33.3 : 0) + (behavior.fearWeightGain * 3.33);

    // Final Score
    const finalScore = Math.round(100 - ((energyDeficit * 0.30) + (performanceDecline * 0.20) + (recoveryImpairment * 0.20) + (hormonalRisk * 0.15) + (behaviorRisk * 0.15)));
    setScore(finalScore);
    
    setMetrics({
      energyDeficit: Math.round(energyDeficit),
      performanceDecline: Math.round(performanceDecline),
      recoveryImpairment: Math.round(recoveryImpairment),
      hormonalRisk: Math.round(hormonalRisk),
      behaviorRisk: Math.round(behaviorRisk)
    });

    // Classification
    if (finalScore >= 85) setClassification({ label: 'Excelente', color: 'emerald' });
    else if (finalScore >= 70) setClassification({ label: 'Normal', color: 'cyan' });
    else if (finalScore >= 50) setClassification({ label: 'Atenção', color: 'amber' });
    else setClassification({ label: 'Déficit', color: 'rose' });

    // Risk Level
    if (finalScore >= 70) setRiskLevel('Baixo Risco');
    else if (finalScore >= 50) setRiskLevel('Risco Moderado');
    else setRiskLevel('Alto Risco');

    // Alerts
    const newAlerts: string[] = [];
    if (energy.weightLoss && (energy.exhaustion > 6 || recovery.persistentFatigue > 6)) newAlerts.push("Alto Risco de RED-S");
    if (gender === 'F' && (hormonalF.irregularCycle || hormonalF.missedPeriods)) newAlerts.push("Disfunção Hormonal");
    if (recovery.illness) newAlerts.push("Supressão Imunológica");
    if (behavior.restrictiveEating) newAlerts.push("Comportamento de Restrição");
    setAlerts(newAlerts);

  }, [energy, performance, recovery, gender, hormonalF, hormonalM, behavior]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        type: "RED-S",
        score,
        classification: classification.label,
        classification_color: classification.color,
        risk_level: riskLevel,
        energy_deficit_index: metrics.energyDeficit,
        performance_decline_index: metrics.performanceDecline,
        recovery_impairment_index: metrics.recoveryImpairment,
        hormonal_risk_index: metrics.hormonalRisk,
        behavior_risk_index: metrics.behaviorRisk,
        alerts,
        raw_data: { energy, performance, recovery, gender, hormonalF, hormonalM, behavior }
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
    { id: 1, title: 'Energia', icon: Activity },
    { id: 2, title: 'Perform.', icon: TrendingDown },
    { id: 3, title: 'Recuper.', icon: ShieldAlert },
    { id: 4, title: 'Hormonal', icon: ActivitySquare },
    { id: 5, title: 'Nutrição', icon: Utensils },
    { id: 6, title: 'Resultado', icon: Save },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <ActivitySquare className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Avaliação RED-S</h2>
            <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">Deficiência Relativa de Energia</p>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-rose-500 bg-rose-500/10 text-rose-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] font-black uppercase tracking-widest text-center max-w-[5rem] leading-tight">{s.title}</span>
            </div>
            {i < formSteps.length - 1 && (
              <div className={`w-8 h-[2px] shrink-0 mb-8 ${step > s.id ? 'bg-rose-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" /> Balanço Energético
            </h3>
            <div className="space-y-4">
              <Slider label="Nível de Energia Diária" value={energy.dailyEnergy} onChange={(v) => setEnergy({...energy, dailyEnergy: v})} />
              <Slider label="Sensação de Exaustão no Treino" value={energy.exhaustion} onChange={(v) => setEnergy({...energy, exhaustion: v})} invertColor />
              <Slider label="Recuperação entre Sessões" value={energy.recovered} onChange={(v) => setEnergy({...energy, recovered: v})} />
              <SelectGroup 
                label="Perda de peso recente inexplicada" 
                value={energy.weightLoss} 
                options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                onChange={(v) => setEnergy({...energy, weightLoss: v})} 
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" /> Impacto na Performance
            </h3>
            <div className="space-y-4">
              <Slider label="Queda de Performance" value={performance.drop} onChange={(v) => setPerformance({...performance, drop: v})} invertColor />
              <Slider label="Fadiga Precoce no Treino" value={performance.earlyFatigue} onChange={(v) => setPerformance({...performance, earlyFatigue: v})} invertColor />
              <Slider label="Percepção de Redução de Força" value={performance.reducedStrength} onChange={(v) => setPerformance({...performance, reducedStrength: v})} invertColor />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> Recuperação e Imunidade
            </h3>
            <div className="space-y-4">
              <SelectGroup 
                label="Doenças Frequentes (Imunidade Baixa)" 
                value={recovery.illness} 
                options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                onChange={(v) => setRecovery({...recovery, illness: v})} 
              />
              <Slider label="Lentidão na Recuperação" value={recovery.slowRecovery} onChange={(v) => setRecovery({...recovery, slowRecovery: v})} invertColor />
              <Slider label="Fadiga Persistente" value={recovery.persistentFatigue} onChange={(v) => setRecovery({...recovery, persistentFatigue: v})} invertColor />
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <ActivitySquare className="w-4 h-4 text-rose-500" /> Indicadores Hormonais
            </h3>
            <div className="space-y-4">
              <SelectGroup 
                label="Sexo Biológico" 
                value={gender} 
                options={[{id: 'M', label: 'Masculino'}, {id: 'F', label: 'Feminino'}]}
                onChange={(v) => setGender(v)} 
              />
              
              {gender === 'F' ? (
                <>
                  <SelectGroup 
                    label="Ciclo Menstrual Irregular" 
                    value={hormonalF.irregularCycle} 
                    options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                    onChange={(v) => setHormonalF({...hormonalF, irregularCycle: v})} 
                  />
                  <SelectGroup 
                    label="Ausência de Menstruação (Amenorreia)" 
                    value={hormonalF.missedPeriods} 
                    options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                    onChange={(v) => setHormonalF({...hormonalF, missedPeriods: v})} 
                  />
                  <Slider label="Aumento de Sintomas Menstruais" value={hormonalF.symptoms} onChange={(v) => setHormonalF({...hormonalF, symptoms: v})} invertColor />
                </>
              ) : (
                <>
                  <Slider label="Redução de Libido" value={hormonalM.reducedLibido} onChange={(v) => setHormonalM({...hormonalM, reducedLibido: v})} invertColor />
                  <Slider label="Baixa Motivação Geral" value={hormonalM.lowMotivation} onChange={(v) => setHormonalM({...hormonalM, lowMotivation: v})} invertColor />
                </>
              )}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-rose-500" /> Comportamento Nutricional
            </h3>
            <div className="space-y-4">
              <SelectGroup 
                label="Pula Refeições" 
                value={behavior.skippingMeals} 
                options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                onChange={(v) => setBehavior({...behavior, skippingMeals: v})} 
              />
              <SelectGroup 
                label="Alimentação Restritiva" 
                value={behavior.restrictiveEating} 
                options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                onChange={(v) => setBehavior({...behavior, restrictiveEating: v})} 
              />
              <Slider label="Medo de Ganhar Peso" value={behavior.fearWeightGain} onChange={(v) => setBehavior({...behavior, fearWeightGain: v})} invertColor />
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-8 text-center border-b border-slate-800">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">Score RED-S Global</p>
                <div className="text-7xl font-black text-white mb-3">{score}</div>
                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${getColorClasses(classification.color)}`}>
                  {classification.label}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{riskLevel}</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Energia</span>
                    <span className={`text-base font-black mt-1 ${metrics.energyDeficit > 60 ? 'text-rose-400' : metrics.energyDeficit > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{metrics.energyDeficit}%</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Perform.</span>
                    <span className={`text-base font-black mt-1 ${metrics.performanceDecline > 60 ? 'text-rose-400' : metrics.performanceDecline > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{metrics.performanceDecline}%</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Imunidade</span>
                    <span className={`text-base font-black mt-1 ${metrics.recoveryImpairment > 60 ? 'text-rose-400' : metrics.recoveryImpairment > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{metrics.recoveryImpairment}%</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Hormonal</span>
                    <span className={`text-base font-black mt-1 ${metrics.hormonalRisk > 60 ? 'text-rose-400' : metrics.hormonalRisk > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{metrics.hormonalRisk}%</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center col-span-2 md:col-span-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Comport.</span>
                    <span className={`text-base font-black mt-1 ${metrics.behaviorRisk > 60 ? 'text-rose-400' : metrics.behaviorRisk > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{metrics.behaviorRisk}%</span>
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

                <Button onClick={handleSave} disabled={isSaving} className="w-full bg-rose-600 hover:bg-rose-500 text-white uppercase tracking-widest text-xs font-black h-14 rounded-xl">
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
              className="bg-rose-600 hover:bg-rose-500 text-white uppercase tracking-widest text-[10px] font-black w-32"
            >
              {step === 5 ? 'Ver Resultado' : 'Próximo'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
