/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Apple, Heart, Utensils, AlertTriangle, Save, ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NutritionalAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

export function NutritionalAssessmentForm({ athleteId, onCancel, onSave }: NutritionalAssessmentProps) {
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
    if (healthScore < 60) newAlerts.push("Possível Condição de Saúde a Investigar");
    if (behaviorScore < 60) newAlerts.push("Risco de Transtorno Alimentar");
    if (restrictions.vegetarianVegan && health.vitaminDeficiency) newAlerts.push("Atenção: Deficiência Vitamínica em Dieta Restritiva");
    if (behavior.skippingMeals) newAlerts.push("Comportamento de Pular Refeições");
    setAlerts(newAlerts);

  }, [intake, restrictions, health, behavior, recovery]);

  const handleSave = () => {
    onSave({
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

  const SelectGroup = ({ label, value, options, onChange }: { label: string, value: string | boolean, options: {id: string | boolean, label: string}[], onChange: (v: any) => void }) => (
    <div className="space-y-3 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
      <label className="text-xxs font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
            <Apple className="w-6 h-6 text-cyan-500" />
            Avaliação Nutricional
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Hábitos Alimentares e Disponibilidade de Energia
          </p>
        </div>

        <div className={`p-6 rounded-3xl border flex-1 flex items-center justify-between ${getColorClasses(classification.color)}`}>
          <div>
            <p className="text-xxs font-black uppercase tracking-widest opacity-70 mb-1">Score Nutricional</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Qualidade</p>
          <p className={`text-xl font-black ${metrics.intakeScore > 70 ? 'text-emerald-400' : metrics.intakeScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.intakeScore}%
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Impacto (Restrições)</p>
          <p className={`text-xl font-black ${metrics.restrictionsScore > 70 ? 'text-emerald-400' : metrics.restrictionsScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.restrictionsScore}%
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Saúde/Doenças</p>
          <p className={`text-xl font-black ${metrics.healthScore > 70 ? 'text-emerald-400' : metrics.healthScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.healthScore}%
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Comportamento</p>
          <p className={`text-xl font-black ${metrics.behaviorScore > 70 ? 'text-emerald-400' : metrics.behaviorScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.behaviorScore}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Daily Intake Quality */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-cyan-500" /> Qualidade da Dieta
          </h3>
          <div className="space-y-3">
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
        </div>

        {/* Section 2: Restrictions & Intolerances */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cyan-500" /> Restrições e Intolerâncias
          </h3>
          <div className="space-y-3">
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
        </div>

        {/* Section 3: Health & Diseases */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500" /> Doenças e Condições Clínicas
          </h3>
          <div className="space-y-3">
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
        </div>

        {/* Section 4: Relationship with Food */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-cyan-500" /> Comportamento Alimentar
          </h3>
          <div className="space-y-3">
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
