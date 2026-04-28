 
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Apple, Heart, Utensils, AlertTriangle, Save, Activity, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestInfoModal } from "@/components/TestInfoModal";

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

const SelectGroup = ({ label, value, options, onChange }: { label: string, value: string | boolean | undefined, options: {id: string | boolean, label: string}[], onChange: (v: any) => void }) => (
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

  // Section 1: Qualidade da Dieta
  const [intake, setIntake] = useState({
    mealsPerDay: 4,
    breakfast: 'always', // always, sometimes, rarely
    fruitVeg: 5,
    protein: 5,
    ultraProcessed: 3,
    whoPrepares: 'parents' // parents, self, mixed
  });

  // Section 2: Nutrição Esportiva (Novo)
  const [sports, setSports] = useState({
    preWorkoutMeal: 'always', // always, sometimes, rarely
    postWorkoutMeal: 'always', // always, sometimes, rarely
    supplements: false,
    prescribedBy: 'none', // nutritionist, internet, coach, self
    energyDrinks: 0 // 0-10
  });

  // Section 3: Saúde e Sinais Clínicos
  const [health, setHealth] = useState({
    digestiveIssues: 2, // 0-10 (gastrite, refluxo, flatulência)
    unexplainedFatigue: 2, // 0-10
    anemiaHistory: false,
    stressFractureHistory: false,
    vitaminDeficiency: false
  });

  // Section 4: Comportamento
  const [behavior, setBehavior] = useState({
    anxiety: 3,
    fearWeightGain: 3,
    skippingMeals: false,
    internetDiets: false
  });

  // Lógica inteligente de pontuação
  const assessmentResult = useMemo(() => {
    // 1. Qualidade da Dieta (0-100)
    let intakeScore = 0;
    intakeScore += Math.min((intake.mealsPerDay / 5) * 25, 25);
    intakeScore += intake.breakfast === 'always' ? 20 : intake.breakfast === 'sometimes' ? 10 : 0;
    intakeScore += (intake.fruitVeg / 10) * 20;
    intakeScore += (intake.protein / 10) * 15;
    intakeScore += ((10 - intake.ultraProcessed) / 10) * 20;
    intakeScore = Math.max(0, Math.min(100, Math.round(intakeScore)));

    // 2. Nutrição Esportiva (0-100)
    let sportsScore = 100;
    if (sports.preWorkoutMeal === 'rarely') sportsScore -= 20;
    else if (sports.preWorkoutMeal === 'sometimes') sportsScore -= 10;
    if (sports.postWorkoutMeal === 'rarely') sportsScore -= 20;
    else if (sports.postWorkoutMeal === 'sometimes') sportsScore -= 10;
    
    if (sports.supplements) {
      if (sports.prescribedBy === 'internet' || sports.prescribedBy === 'self') sportsScore -= 20;
      if (sports.prescribedBy === 'coach') sportsScore -= 10;
    }
    sportsScore -= (sports.energyDrinks * 2); // ate -20 pts por energeticos
    sportsScore = Math.max(0, Math.min(100, Math.round(sportsScore)));

    // 3. Saúde Clínica (0-100)
    let healthScore = 100;
    healthScore -= (health.digestiveIssues * 2);
    healthScore -= (health.unexplainedFatigue * 3);
    if (health.anemiaHistory) healthScore -= 15;
    if (health.stressFractureHistory) healthScore -= 20;
    if (health.vitaminDeficiency) healthScore -= 15;
    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

    // 4. Comportamento (0-100)
    let behaviorScore = 100;
    behaviorScore -= (behavior.anxiety * 3);
    behaviorScore -= (behavior.fearWeightGain * 3);
    if (behavior.skippingMeals) behaviorScore -= 20;
    if (behavior.internetDiets) behaviorScore -= 20;
    behaviorScore = Math.max(0, Math.min(100, Math.round(behaviorScore)));

    // Final Score (0-100)
    const finalScore = Math.round(
      (intakeScore * 0.35) + 
      (sportsScore * 0.25) + 
      (healthScore * 0.25) + 
      (behaviorScore * 0.15)
    );

    // Classification
    let classification = { label: 'Recuperação Crítica', color: 'rose' };
    if (finalScore >= 90) classification = { label: 'Excelente', color: 'emerald' };
    else if (finalScore >= 75) classification = { label: 'Bom', color: 'emerald' };
    else if (finalScore >= 60) classification = { label: 'Atenção', color: 'amber' };
    else if (finalScore >= 40) classification = { label: 'Inadequado', color: 'rose' };

    // Insights Automáticos
    const insights = [];
    if (intake.breakfast === 'rarely') insights.push("A omissão do café da manhã impacta o balanço energético geral.");
    if (sports.preWorkoutMeal === 'rarely' || sports.postWorkoutMeal === 'rarely') insights.push("O 'timing' nutricional (refeições pré/pós treino) precisa de ajuste.");
    if (sports.supplements && (sports.prescribedBy === 'internet' || sports.prescribedBy === 'self')) insights.push("Uso de suplementos sem orientação profissional detectado.");
    if (health.unexplainedFatigue > 6 || health.stressFractureHistory) insights.push("Sinais de possível RED-S (Baixa Disponibilidade Energética).");
    if (behavior.internetDiets) insights.push("Risco associado à adesão de dietas da internet.");
    if (sports.energyDrinks > 5) insights.push("Alto consumo de energéticos pode mascarar fadiga real.");

    return {
      score: finalScore,
      classification,
      insights: insights.slice(0, 3), // max 3 insights
      metrics: {
        intakeScore,
        sportsScore,
        healthScore,
        behaviorScore
      }
    };
  }, [intake, sports, health, behavior]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        type: "Nutricional",
        score: assessmentResult.score,
        classification: assessmentResult.classification.label,
        classification_color: assessmentResult.classification.color,
        intake_score: assessmentResult.metrics.intakeScore,
        sports_score: assessmentResult.metrics.sportsScore,
        health_score: assessmentResult.metrics.healthScore,
        behavior_score: assessmentResult.metrics.behaviorScore,
        alerts: assessmentResult.insights,
        raw_data: { intake, sports, health, behavior }
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
    { id: 2, title: 'Esporte', icon: Zap },
    { id: 3, title: 'Saúde', icon: Activity },
    { id: 4, title: 'Comportamento', icon: Heart },
    { id: 5, title: 'Resultado', icon: Save },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Apple className="w-6 h-6 text-emerald-400" />
          </div>
          <TestInfoModal
            title="Avaliação Nutricional (Smart)"
            indication="Triagem de qualidade da dieta, hidratação, suplementação e sinais de deficiência nutricional (RED-S)."
            application="O atleta preenche um Recordatório Qualitativo. O algoritmo cruza dados de macronutrientes, hidratação e sinais físicos."
            referenceValues={["Score > 80: Status Nutricional Adequado", "Score 60-79: Necessita ajustes finos", "Score < 60: Risco Nutricional (Possível deficiência)"]}
            deficitGrades={["Leve (pequenos ajustes de timing e macro)", "Moderado (Sintomas leves, baixa recuperação)", "Severo (Sinais clínicos de deficiência / perda de peso não intencional)"]}
          >
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight hover:text-cyan-400 transition-colors">Avaliação Nutricional (Smart)</h2>
              <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest text-left">Baseado em Consensos Científicos (2025)</p>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] md:text-xs font-black uppercase tracking-widest text-center max-w-[5rem] md:max-w-[7rem] leading-tight mt-1">{s.title}</span>
            </div>
            {i < formSteps.length - 1 && (
              <div className={`w-8 md:flex-1 h-[2px] shrink-0 mb-8 mx-2 ${step > s.id ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-500" /> Qualidade Geral
            </h3>
            <div className="space-y-4">
              <Slider label="Refeições por dia" value={intake.mealsPerDay} max={7} onChange={(v) => setIntake({...intake, mealsPerDay: v})} />
              <SelectGroup 
                label="Hábito de tomar café da manhã" 
                value={intake.breakfast} 
                options={[{id: 'always', label: 'Sempre'}, {id: 'sometimes', label: 'Às vezes'}, {id: 'rarely', label: 'Raramente'}]}
                onChange={(v) => setIntake({...intake, breakfast: v})} 
              />
              <SelectGroup 
                label="Quem prepara a maioria das refeições?" 
                value={intake.whoPrepares} 
                options={[{id: 'parents', label: 'Pais/Resp.'}, {id: 'self', label: 'O Próprio'}, {id: 'mixed', label: 'Ambos/Misto'}]}
                onChange={(v) => setIntake({...intake, whoPrepares: v})} 
              />
              <Slider label="Consumo de Frutas e Vegetais" value={intake.fruitVeg} onChange={(v) => setIntake({...intake, fruitVeg: v})} />
              <Slider label="Percepção de Consumo de Proteína" value={intake.protein} onChange={(v) => setIntake({...intake, protein: v})} />
              <Slider label="Consumo de Ultraprocessados (Doces/Fast Food)" value={intake.ultraProcessed} onChange={(v) => setIntake({...intake, ultraProcessed: v})} invertColor />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" /> Nutrição Esportiva (Timing)
            </h3>
            <div className="space-y-4">
              <SelectGroup 
                label="Rotina de Refeição PRÉ-treino (1-3h antes)" 
                value={sports.preWorkoutMeal} 
                options={[{id: 'always', label: 'Sempre'}, {id: 'sometimes', label: 'Às vezes'}, {id: 'rarely', label: 'Raramente/Jejum'}]}
                onChange={(v) => setSports({...sports, preWorkoutMeal: v})} 
              />
              <SelectGroup 
                label="Rotina de Refeição PÓS-treino (até 2h depois)" 
                value={sports.postWorkoutMeal} 
                options={[{id: 'always', label: 'Sempre'}, {id: 'sometimes', label: 'Às vezes'}, {id: 'rarely', label: 'Demora muito'}]}
                onChange={(v) => setSports({...sports, postWorkoutMeal: v})} 
              />
              <SelectGroup 
                label="Usa algum tipo de suplemento alimentar?" 
                value={sports.supplements} 
                options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                onChange={(v) => setSports({...sports, supplements: v})} 
              />
              {sports.supplements && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <SelectGroup 
                    label="Quem indicou a suplementação?" 
                    value={sports.prescribedBy} 
                    options={[
                      {id: 'nutritionist', label: 'Nutricionista/Méd.'}, 
                      {id: 'coach', label: 'Técnico'}, 
                      {id: 'internet', label: 'Amigos/Internet'},
                      {id: 'self', label: 'Conta Própria'}
                    ]}
                    onChange={(v) => setSports({...sports, prescribedBy: v})} 
                  />
                </motion.div>
              )}
              <Slider label="Frequência de consumo de Energéticos e Pré-Treinos" value={sports.energyDrinks} onChange={(v) => setSports({...sports, energyDrinks: v})} invertColor />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Sinais Clínicos (Atenção para RED-S)
            </h3>
            <div className="space-y-4">
              <Slider label="Fadiga Inexplicável ou Frequente" value={health.unexplainedFatigue} onChange={(v) => setHealth({...health, unexplainedFatigue: v})} invertColor />
              <Slider label="Desconforto Digestivo (Gás, refluxo, solta/presa)" value={health.digestiveIssues} onChange={(v) => setHealth({...health, digestiveIssues: v})} invertColor />
              <SelectGroup 
                label="Histórico de Anemia ou deficiência de Ferro?" 
                value={health.anemiaHistory} 
                options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                onChange={(v) => setHealth({...health, anemiaHistory: v})} 
              />
              <SelectGroup 
                label="Histórico de Lesão Rápida / Fratura por Estresse?" 
                value={health.stressFractureHistory} 
                options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                onChange={(v) => setHealth({...health, stressFractureHistory: v})} 
              />
              <SelectGroup 
                label="Deficiências apontadas em exames (Vit D, etc)?" 
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
              <Heart className="w-4 h-4 text-emerald-500" /> Comportamento e Mitos
            </h3>
            <div className="space-y-4">
              <Slider label="Sensação de ansiedade ligada à comida" value={behavior.anxiety} onChange={(v) => setBehavior({...behavior, anxiety: v})} invertColor />
              <Slider label="Preocupação excessiva em ganhar peso" value={behavior.fearWeightGain} onChange={(v) => setBehavior({...behavior, fearWeightGain: v})} invertColor />
              <SelectGroup 
                label="Você costuma pular refeições propositalmente?" 
                value={behavior.skippingMeals} 
                options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                onChange={(v) => setBehavior({...behavior, skippingMeals: v})} 
              />
              <SelectGroup 
                label="Costuma seguir dietas de influencers ou internet?" 
                value={behavior.internetDiets} 
                options={[{id: true, label: 'Sim'}, {id: false, label: 'Não'}]}
                onChange={(v) => setBehavior({...behavior, internetDiets: v})} 
              />
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-8 text-center border-b border-slate-800">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">Score Nutricional Global</p>
                <div className={`text-7xl font-black mb-3 ${getColorClasses(assessmentResult.classification.color).split(' ')[0]}`}>
                  {assessmentResult.score}
                </div>
                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${getColorClasses(assessmentResult.classification.color)}`}>
                  {assessmentResult.classification.label}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Qualidade</span>
                    <span className={`text-base font-black mt-1 ${assessmentResult.metrics.intakeScore >= 75 ? 'text-emerald-400' : assessmentResult.metrics.intakeScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{assessmentResult.metrics.intakeScore.toFixed(0)}</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Esporte/Rec.</span>
                    <span className={`text-base font-black mt-1 ${assessmentResult.metrics.sportsScore >= 75 ? 'text-emerald-400' : assessmentResult.metrics.sportsScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{assessmentResult.metrics.sportsScore.toFixed(0)}</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Saúde/Sinais</span>
                    <span className={`text-base font-black mt-1 ${assessmentResult.metrics.healthScore >= 75 ? 'text-emerald-400' : assessmentResult.metrics.healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{assessmentResult.metrics.healthScore.toFixed(0)}</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Comp.</span>
                    <span className={`text-base font-black mt-1 ${assessmentResult.metrics.behaviorScore >= 75 ? 'text-emerald-400' : assessmentResult.metrics.behaviorScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{assessmentResult.metrics.behaviorScore.toFixed(0)}</span>
                  </div>
                </div>

                {assessmentResult.insights.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Insights Gerados</h4>
                    {assessmentResult.insights.map((alert, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-4 py-3 rounded-xl border border-amber-500/20">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> 
                        <span className="leading-relaxed">{alert}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={handleSave} disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-widest text-xs font-black h-14 rounded-xl">
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  ) : (
                    <Save className="w-5 h-5 mr-3" />
                  )}
                  {isSaving ? 'Salvando...' : 'Salvar Avaliação (Smart)'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step < 5 && (
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-widest text-[10px] font-black"
            >
              {step === 4 ? 'Ver Resultado' : 'Próxima Etapa'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
