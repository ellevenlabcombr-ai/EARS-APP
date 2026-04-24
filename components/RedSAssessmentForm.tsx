/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Activity, TrendingDown, ShieldAlert, ActivitySquare, Utensils, AlertTriangle, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RedSAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

export function RedSAssessmentForm({ athleteId, onCancel, onSave }: RedSAssessmentProps) {
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
    if (behavior.restrictiveEating) newAlerts.push("Comportamento de Restrição de Energia");
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

  const Slider = ({ label, value, onChange, invertColor = false }: { label: string, value: number, onChange: (v: number) => void, invertColor?: boolean }) => {
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

  const SelectGroup = ({ label, value, options, onChange }: { label: string, value: string | boolean, options: {id: string | boolean, label: string}[], onChange: (v: any) => void }) => (
    <div className="space-y-3 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
      <label className="text-xxs font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {options.map(opt => (
          <button
            key={String(opt.id)}
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
            <ActivitySquare className="w-6 h-6 text-rose-500" />
            Avaliação RED-S
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Risco de Deficiência Relativa de Energia no Esporte
          </p>
        </div>

        <div className={`p-6 rounded-3xl border flex-1 flex items-center justify-between ${getColorClasses(classification.color)}`}>
          <div>
            <p className="text-xxs font-black uppercase tracking-widest opacity-70 mb-1">Score RED-S</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{score}</span>
              <span className="text-sm font-bold uppercase tracking-widest opacity-80">{classification.label}</span>
            </div>
            <p className="text-xxs font-black uppercase tracking-widest mt-1 opacity-90">{riskLevel}</p>
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
          <ShieldAlert className="w-12 h-12 opacity-20" />
        </div>
      </div>

      {/* Indices Preview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Déficit Energia', value: metrics.energyDeficit },
          { label: 'Queda Perf.', value: metrics.performanceDecline },
          { label: 'Falha Recup.', value: metrics.recoveryImpairment },
          { label: 'Risco Hormonal', value: metrics.hormonalRisk },
          { label: 'Risco Comport.', value: metrics.behaviorRisk }
        ].map(idx => (
          <div key={idx.label} className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
            <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">{idx.label}</p>
            <p className={`text-xl font-black ${idx.value > 60 ? 'text-rose-400' : idx.value > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {idx.value}%
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Energy Balance */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" /> Balanço Energético
          </h3>
          <div className="space-y-3">
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
        </div>

        {/* Section 2: Performance Impact */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-500" /> Impacto na Performance
          </h3>
          <div className="space-y-3">
            <Slider label="Queda de Performance" value={performance.drop} onChange={(v) => setPerformance({...performance, drop: v})} invertColor />
            <Slider label="Fadiga Precoce no Treino" value={performance.earlyFatigue} onChange={(v) => setPerformance({...performance, earlyFatigue: v})} invertColor />
            <Slider label="Percepção de Redução de Força" value={performance.reducedStrength} onChange={(v) => setPerformance({...performance, reducedStrength: v})} invertColor />
          </div>
        </div>

        {/* Section 3: Recovery & Immunity */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" /> Recuperação e Imunidade
          </h3>
          <div className="space-y-3">
            <SelectGroup 
              label="Doenças Frequentes (Imunidade Baixa)" 
              value={recovery.illness} 
              options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
              onChange={(v) => setRecovery({...recovery, illness: v})} 
            />
            <Slider label="Lentidão na Recuperação" value={recovery.slowRecovery} onChange={(v) => setRecovery({...recovery, slowRecovery: v})} invertColor />
            <Slider label="Fadiga Persistente" value={recovery.persistentFatigue} onChange={(v) => setRecovery({...recovery, persistentFatigue: v})} invertColor />
          </div>
        </div>

        {/* Section 4: Hormonal Indicators */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <ActivitySquare className="w-4 h-4 text-rose-500" /> Indicadores Hormonais
          </h3>
          <div className="space-y-3">
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
        </div>

        {/* Section 5: Nutritional Behavior */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-rose-500" /> Comportamento Nutricional
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
        <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white font-bold uppercase text-xxs tracking-widest">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-rose-500 hover:bg-rose-400 text-[#050B14] font-black uppercase text-xxs tracking-widest px-8">
          {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Salvar Avaliação
        </Button>
      </div>
    </motion.div>
  );
}
