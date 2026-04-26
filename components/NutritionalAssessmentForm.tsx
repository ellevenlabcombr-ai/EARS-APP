 
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Apple, Heart, Utensils, AlertTriangle, Save, Activity, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NutritionalAssessmentProps {
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

export function NutritionalAssessmentForm({ athleteId, onCancel, onSave }: NutritionalAssessmentProps) {
  const [step, setStep] = useState(1);

  // Section 1: Daily Intake Quality
  const [intake, setIntake] = useState({
    mealsPerDay: 3,
    breakfast: 'always', // always, sometimes, rarely
    fruitVeg: 5,
    protein: 5,
    ultraProcessed: 5
  });

  // Section 2: Restrictions & Preferences
  const [restrictions, setRestrictions] = useState({
    vegetarianVegan: false,
    lactoseIntolerance: false,
    glutenIntolerance: false,
    otherAllergies: false,
    restrictionImpact: 5 // 0-10 (how much it limits food options)
  });

  // Section 3: Health & Diseases
  const [health, setHealth] = useState({
    digestiveIssues: 5, // 0-10 (gastrite, refluxo, flatulência)
    anemiaHistory: false,
    bloodSugarIssues: false,
    vitaminDeficiency: false
  });

  // Section 4: Relationship with Food
  const [behavior, setBehavior] = useState({
    anxiety: 5,
    fearWeightGain: 5,
    skippingMeals: false,
    restrictiveEating: false
  });

  // Section 5: Recovery Nutrition
  const [recovery, setRecovery] = useState({
    eatsAfter: 'always', // always, sometimes, rarely
    timeToEat: '<30' // <30, 30-60, >60
  });

  // Derived State
  const [score, setScore] = useState(100);
  const [classification, setClassification] = useState({ label: 'Normal', color: 'cyan' });
  const [alerts, setAlerts] = useState<string[]>([]);
  
  const [metrics, setMetrics] = useState({
    intakeScore: 50,
    restrictionsScore: 50,
    healthScore: 50,
    behaviorScore: 50
  });

  useEffect(() => {
    // 1. Intake Score (0-100)
    const mealsScore = Math.min((intake.mealsPerDay / 6) * 20, 20);
    const breakfastScore = intake.breakfast === 'always' ? 20 : intake.breakfast === 'sometimes' ? 10 : 0;
    const fruitVegScore = (intake.fruitVeg / 10) * 20;
    const proteinScore = (intake.protein / 10) * 20;
    const ultraProcessedScore = ((10 - intake.ultraProcessed) / 10) * 20;
    const intakeScore = mealsScore + breakfastScore + fruitVegScore + proteinScore + ultraProcessedScore;

    // 2. Restrictions Score (0-100)
    // Less impact = higher score
    const impactScore = ((10 - restrictions.restrictionImpact) / 10) * 100;
    const restrictionsScore = impactScore;

    // 3. Health Score (0-100)
    const digestiveScore = ((10 - health.digestiveIssues) / 10) * 40;
    const anemiaScore = health.anemiaHistory ? 0 : 20;
    const bloodSugarScore = health.bloodSugarIssues ? 0 : 20;
    const vitaminScore = health.vitaminDeficiency ? 0 : 20;
    const healthScore = digestiveScore + anemiaScore + bloodSugarScore + vitaminScore;

    // 4. Behavior Score (0-100)
    const anxietyScore = ((10 - behavior.anxiety) / 10) * 25;
    const fearWeightGainScore = ((10 - behavior.fearWeightGain) / 10) * 25;
    const skippingMealsScore = behavior.skippingMeals ? 0 : 25;
    const restrictiveEatingScore = behavior.restrictiveEating ? 0 : 25;
    const behaviorScore = anxietyScore + fearWeightGainScore + skippingMealsScore + restrictiveEatingScore;

    // Final Score
    const finalScore = Math.round((intakeScore * 0.40) + (restrictionsScore * 0.15) + (healthScore * 0.25) + (behaviorScore * 0.20));
    setScore(finalScore);
    
    setMetrics({
      intakeScore: Math.round(intakeScore),
      restrictionsScore: Math.round(restrictionsScore),
      healthScore: Math.round(healthScore),
      behaviorScore: Math.round(behaviorScore)
    });

    // Classification
    if (finalScore >= 85) setClassification({ label: 'Excelente', color: 'emerald' });
    else if (finalScore >= 70) setClassification({ label: 'Normal', color: 'cyan' });
    else if (finalScore >= 50) setClassification({ label: 'Atenção', color: 'amber' });
    else setClassification({ label: 'Déficit', color: 'rose' });

    // Alerts
    const newAlerts: string[] = [];
    if (healthScore < 60) newAlerts.push("Condição de Saúde a Investigar");
    if (behaviorScore < 60) newAlerts.push("Risco de Transtorno Alimentar");
    if (restrictions.vegetarianVegan && health.vitaminDeficiency) newAlerts.push("Risco de Deficiência Vitamínica");
    if (behavior.skippingMeals) newAlerts.push("Comportamento Pular Refeições");
    setAlerts(newAlerts);

  }, [intake, restrictions, health, behavior, recovery]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        type: "Nutricional",
        score,
        classification: classification.label,
        classification_color: classification.color,
        intake_score: metrics.intakeScore,
        restrictions_score: metrics.restrictionsScore,
        health_score: metrics.healthScore,
        behavior_score: metrics.behaviorScore,
        alerts,
        raw_data: { intake, restrictions, health, behavior, recovery }
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
    { id: 1, title: 'Qualidade', icon: Utensils },
    { id: 2, title: 'Restrições', icon: AlertTriangle },
    { id: 3, title: 'Saúde', icon: Activity },
    { id: 4, title: 'Comportamento', icon: Heart },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Apple className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Avaliação Nutricional</h2>
            <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">Hábitos Alimentares da Atleta</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-4 max-w-lg mx-auto">
        {formSteps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div 
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${step === s.id ? 'scale-110' : 'opacity-40'}`}
              onClick={() => setStep(s.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] font-black uppercase tracking-widest text-center max-w-[5rem] leading-tight">{s.title}</span>
            </div>
            {i < formSteps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-2 mb-8 ${step > s.id ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-cyan-500" /> Qualidade da Dieta
              </h3>
              <div className="space-y-4">
                <Slider label="Refeições por dia" value={intake.mealsPerDay} max={6} onChange={(v) => setIntake({...intake, mealsPerDay: v})} />
                <SelectGroup 
                  label="Hábito de tomar café da manhã" 
                  value={intake.breakfast} 
                  options={[{id: 'always', label: 'Sempre'}, {id: 'sometimes', label: 'Às vezes'}, {id: 'rarely', label: 'Raramente'}]}
                  onChange={(v) => setIntake({...intake, breakfast: v})} 
                />
                <Slider label="Consumo de Frutas/Vegetais" value={intake.fruitVeg} onChange={(v) => setIntake({...intake, fruitVeg: v})} />
                <Slider label="Percepção de Consumo de Proteína" value={intake.protein} onChange={(v) => setIntake({...intake, protein: v})} />
                <Slider label="Consumo de Ultraprocessados" value={intake.ultraProcessed} onChange={(v) => setIntake({...intake, ultraProcessed: v})} invertColor />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-cyan-500" /> Restrições e Intolerâncias
              </h3>
              <div className="space-y-4">
                <SelectGroup 
                  label="Vegetariano / Vegano" 
                  value={restrictions.vegetarianVegan} 
                  options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                  onChange={(v) => setRestrictions({...restrictions, vegetarianVegan: v})} 
                />
                <SelectGroup 
                  label="Intolerância à Lactose" 
                  value={restrictions.lactoseIntolerance} 
                  options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                  onChange={(v) => setRestrictions({...restrictions, lactoseIntolerance: v})} 
                />
                <SelectGroup 
                  label="Intolerância ao Glúten / Celíaco" 
                  value={restrictions.glutenIntolerance} 
                  options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                  onChange={(v) => setRestrictions({...restrictions, glutenIntolerance: v})} 
                />
                <SelectGroup 
                  label="Outras Alergias Alimentares" 
                  value={restrictions.otherAllergies} 
                  options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                  onChange={(v) => setRestrictions({...restrictions, otherAllergies: v})} 
                />
                <Slider label="Impacto das restrições nas opções (0=Nenhum, 10=Muito)" value={restrictions.restrictionImpact} onChange={(v) => setRestrictions({...restrictions, restrictionImpact: v})} invertColor />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" /> Doenças e Condições Clínicas
              </h3>
              <div className="space-y-4">
                <Slider label="Problemas Digestivos (Gastrite, Refluxo, Gás)" value={health.digestiveIssues} onChange={(v) => setHealth({...health, digestiveIssues: v})} invertColor />
                <SelectGroup 
                  label="Histórico de Anemia" 
                  value={health.anemiaHistory} 
                  options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                  onChange={(v) => setHealth({...health, anemiaHistory: v})} 
                />
                <SelectGroup 
                  label="Alterações de Glicemia / Diabetes" 
                  value={health.bloodSugarIssues} 
                  options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                  onChange={(v) => setHealth({...health, bloodSugarIssues: v})} 
                />
                <SelectGroup 
                  label="Deficiência de Vitaminas (ex: D, B12)" 
                  value={health.vitaminDeficiency} 
                  options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                  onChange={(v) => setHealth({...health, vitaminDeficiency: v})} 
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-cyan-500" /> Comportamento Alimentar
              </h3>
              <div className="space-y-4">
                <Slider label="Ansiedade com a comida" value={behavior.anxiety} onChange={(v) => setBehavior({...behavior, anxiety: v})} invertColor />
                <Slider label="Medo de ganhar peso" value={behavior.fearWeightGain} onChange={(v) => setBehavior({...behavior, fearWeightGain: v})} invertColor />
                <SelectGroup 
                  label="Pula refeições intencionalmente" 
                  value={behavior.skippingMeals} 
                  options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                  onChange={(v) => setBehavior({...behavior, skippingMeals: v})} 
                />
                <SelectGroup 
                  label="Comportamento restritivo" 
                  value={behavior.restrictiveEating} 
                  options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                  onChange={(v) => setBehavior({...behavior, restrictiveEating: v})} 
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden sticky top-6">
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Score Nutricional</p>
                <div className="text-6xl font-black text-white mb-2">{score}</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getColorClasses(classification.color)}`}>
                  {classification.label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Qualidade</span>
                  <span className={`text-sm font-black mt-1 ${metrics.intakeScore > 70 ? 'text-emerald-400' : metrics.intakeScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.intakeScore}%</span>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Saúde</span>
                  <span className={`text-sm font-black mt-1 ${metrics.healthScore > 70 ? 'text-emerald-400' : metrics.healthScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.healthScore}%</span>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Restrições</span>
                  <span className={`text-sm font-black mt-1 ${metrics.restrictionsScore > 70 ? 'text-emerald-400' : metrics.restrictionsScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.restrictionsScore}%</span>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Comp.</span>
                  <span className={`text-sm font-black mt-1 ${metrics.behaviorScore > 70 ? 'text-emerald-400' : metrics.behaviorScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>{metrics.behaviorScore}%</span>
                </div>
              </div>

              {alerts.length > 0 && (
                <div className="space-y-2 mb-6">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {alert}
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={handleSave} disabled={isSaving} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white uppercase tracking-widest text-[10px] font-black">
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Salvando...' : 'Salvar Avaliação'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
