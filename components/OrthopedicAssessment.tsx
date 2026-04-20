 
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Stethoscope, 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Activity,
  History,
  Target,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RegionPain {
  present: boolean;
  intensity: number;
  side: 'left' | 'right' | 'bilateral';
  type: 'Acute' | 'Chronic' | 'Recurrent';
  onset: 'Sudden' | 'Progressive';
  worseWithTraining: boolean;
  improvesWithRest: boolean;
  previousInjury: boolean;
  recurrence: boolean;
  timeAway: number; // weeks
  mechanism: 'Trauma direto' | 'Torção' | 'Sobrecarga' | 'Sem causa aparente';
  symptoms: string[];
  rom: 'Normal' | 'Limitada' | 'Muito Limitada';
  strength: number; // 0 to 5
  specialTests: string;
  previousTreatments: string[];
}

const BODY_REGIONS = [
  'Neck', 'Upper back', 'Lower back', 'Shoulder', 'Elbow', 'Wrist/Hand', 'Hip', 'Knee', 'Ankle/Foot'
] as const;

type BodyRegion = typeof BODY_REGIONS[number];

const SYMPTOM_OPTIONS = ['Estalo', 'Falseio', 'Travamento', 'Edema', 'Formigamento', 'Queimação', 'Irradiação'];
const TREATMENT_OPTIONS = ['Fisioterapia', 'Cirurgia', 'Infiltração', 'Medicação', 'Acupuntura', 'Repouso'];

interface OrthopedicAssessmentProps {
  athleteName?: string;
  onBack: () => void;
  onSave: (score: number, data: any) => void;
}

export function OrthopedicAssessment({ athleteName, onBack, onSave }: OrthopedicAssessmentProps) {
  const [activeRegions, setActiveRegions] = useState<Partial<Record<BodyRegion, RegionPain>>>({});
  const [functionalImpact, setFunctionalImpact] = useState({
    training: 0,
    competition: 0,
    dailyActivities: false
  });
  const [functionalTests, setFunctionalTests] = useState({
    squat: 10,
    jump: 10,
    balance: 10
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleRegion = (region: BodyRegion) => {
    setActiveRegions(prev => {
      const newRegions = { ...prev };
      if (newRegions[region]) {
        delete newRegions[region];
      } else {
        newRegions[region] = {
          present: true,
          intensity: 0,
          side: 'bilateral',
          type: 'Acute',
          onset: 'Sudden',
          worseWithTraining: false,
          improvesWithRest: true,
          previousInjury: false,
          recurrence: false,
          timeAway: 0,
          mechanism: 'Sem causa aparente',
          symptoms: [],
          rom: 'Normal',
          strength: 5,
          specialTests: '',
          previousTreatments: []
        };
      }
      return newRegions;
    });
  };

  const updateRegion = (region: BodyRegion, updates: Partial<RegionPain>) => {
    setActiveRegions(prev => ({
      ...prev,
      [region]: { ...prev[region]!, ...updates }
    }));
  };

  const assessmentResults = useMemo(() => {
    const regions = Object.values(activeRegions);
    const painIntensityMax = regions.length > 0 
      ? Math.max(...regions.map(r => r.intensity)) 
      : 0;
    
    const avgFunctionalImpact = (functionalImpact.training + functionalImpact.competition) / 2;
    const movementQuality = (functionalTests.squat + functionalTests.jump + functionalTests.balance) / 3;
    
    let injuryHistoryScore = 10;
    if (regions.some(r => r.recurrence)) {
      injuryHistoryScore = 3;
    } else if (regions.some(r => r.previousInjury)) {
      injuryHistoryScore = 6;
    }

    // orthoScore = ((10 - painIntensityMax) * 0.4) + ((10 - functionalImpact) * 0.3) + (movementQuality * 0.2) + (injuryHistoryScore * 0.1)
    // Multiply by 10 to scale to 0-100
    const score = (
      ((10 - painIntensityMax) * 0.4) +
      ((10 - avgFunctionalImpact) * 0.3) +
      (movementQuality * 0.2) +
      (injuryHistoryScore * 0.1)
    ) * 10;

    let classification = 'Low risk';
    let interpretation = 'No relevant clinical issues detected.';
    let action = 'Maintain current training';
    let color = 'text-emerald-400';
    let bgColor = 'bg-emerald-500/10';

    if (score < 60 || painIntensityMax >= 7) {
      classification = 'High risk';
      interpretation = 'Significant pain and functional limitation detected. Increased risk of injury or worsening condition.';
      action = 'Reduce training load, Recommend clinical evaluation, Consider temporary restriction';
      color = 'text-rose-400';
      bgColor = 'bg-rose-500/10';
    } else if (score < 80) {
      classification = 'Moderate risk';
      interpretation = 'Mild to moderate functional alterations. Monitoring and adjustments recommended.';
      action = 'Adjust training, Monitor symptoms';
      color = 'text-amber-400';
      bgColor = 'bg-amber-500/10';
    }

    return {
      score: Math.round(score),
      painIntensityMax,
      avgFunctionalImpact,
      movementQuality,
      classification,
      interpretation,
      action,
      color,
      bgColor,
      highestPainRegion: regions.length > 0 
        ? Object.entries(activeRegions).sort((a, b) => b[1]!.intensity - a[1]!.intensity)[0][0]
        : null
    };
  }, [activeRegions, functionalImpact, functionalTests]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await onSave(assessmentResults.score, {
      activeRegions,
      functionalImpact,
      functionalTests,
      results: assessmentResults
    });
    
    setShowSuccess(true);
    setIsSaving(false);
    
    setTimeout(() => {
      setShowSuccess(false);
      onBack();
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#050B14] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-4 sm:px-8 bg-[#0A1120]/80 backdrop-blur-xl shrink-0 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white mr-1 sm:mr-2 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-400 text-xxs sm:text-sm font-bold uppercase tracking-wider hidden xs:inline truncate">Avaliação Ortopédica</span>
            <ChevronRight size={14} className="text-slate-600 hidden xs:inline shrink-0" />
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-widest text-cyan-400 truncate">
              {athleteName || 'Atleta'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Score Ortopédico</span>
            <span className={`text-2xl font-black ${assessmentResults.color}`}>
              {assessmentResults.score}/100
            </span>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving || showSuccess}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black uppercase tracking-widest text-xxs sm:text-sm transition-all shadow-lg flex items-center gap-2 ${
              showSuccess 
                ? "bg-emerald-500 text-[#050B14]" 
                : "bg-cyan-500 hover:bg-cyan-400 text-[#050B14] shadow-cyan-500/20"
            } disabled:opacity-50`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-[#050B14]/30 border-t-[#050B14] rounded-full animate-spin"></div>
            ) : showSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{showSuccess ? 'Salvo!' : 'Finalizar'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
          
          {/* Score Summary Card */}
          <Card className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl overflow-hidden relative">
            <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl font-black uppercase tracking-widest text-xs ${assessmentResults.bgColor} ${assessmentResults.color}`}>
              {assessmentResults.classification}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-2">Ortho Score</span>
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-800"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * (assessmentResults.score || 0)) / 100}
                      className={`${assessmentResults.color} transition-all duration-1000`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-black ${assessmentResults.color}`}>{assessmentResults.score}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Info size={16} className="text-cyan-500" />
                    Interpretação Clínica
                  </h3>
                  <p className="text-slate-200 leading-relaxed">
                    {assessmentResults.interpretation}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/50">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Activity size={16} className="text-cyan-500" />
                    Ações Recomendadas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {assessmentResults.action.split(',').map((act, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-xxs font-bold text-slate-300 uppercase tracking-wider">
                        {act.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 1. Pain Mapping */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-2 h-6 bg-cyan-500 rounded-full"></div>
              1. Mapeamento de Dor
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {BODY_REGIONS.map(region => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${
                    activeRegions[region] 
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]" 
                      : "bg-[#0A1120] border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xxs font-black uppercase tracking-widest block">{region}</span>
                  {activeRegions[region] && (
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                      <span className="text-xxs font-bold">Ativo</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* 2. Pain Characteristics */}
          <AnimatePresence>
            {Object.keys(activeRegions).length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                  2. Características da Dor
                </h2>
                
                <div className="space-y-4">
                  {Object.entries(activeRegions).map(([region, data]) => (
                    <Card key={region} className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-800/50 pb-4">
                        <h3 className="text-md font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Stethoscope size={18} className="text-rose-500" />
                          {region}
                        </h3>
                        <div className="flex items-center gap-2">
                          {['left', 'right', 'bilateral'].map(side => (
                            <button
                              key={side}
                              onClick={() => updateRegion(region as BodyRegion, { side: side as any })}
                              className={`px-3 py-1 rounded-full text-xxs font-black uppercase tracking-widest transition-all ${
                                data!.side === side ? "bg-cyan-500 text-[#050B14]" : "bg-slate-800 text-slate-500"
                              }`}
                            >
                              {side === 'left' ? 'Esq' : side === 'right' ? 'Dir' : 'Bilat'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between mb-2">
                              <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Intensidade (0-10)</label>
                              <span className="text-sm font-black text-rose-400">{data!.intensity}</span>
                            </div>
                            <input 
                              type="range" min="0" max="10" step="1"
                              value={data!.intensity}
                              onChange={(e) => updateRegion(region as BodyRegion, { intensity: parseInt(e.target.value) })}
                              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Tipo</label>
                              <select 
                                value={data!.type}
                                onChange={(e) => updateRegion(region as BodyRegion, { type: e.target.value as any })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                              >
                                <option value="Acute">Aguda</option>
                                <option value="Chronic">Crônica</option>
                                <option value="Recurrent">Recorrente</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Início</label>
                              <select 
                                value={data!.onset}
                                onChange={(e) => updateRegion(region as BodyRegion, { onset: e.target.value as any })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                              >
                                <option value="Sudden">Súbito</option>
                                <option value="Progressive">Progressivo</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Mecanismo de Lesão</label>
                            <select 
                              value={data!.mechanism}
                              onChange={(e) => updateRegion(region as BodyRegion, { mechanism: e.target.value as any })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                            >
                              <option value="Sem causa aparente">Sem causa aparente</option>
                              <option value="Trauma direto">Trauma direto</option>
                              <option value="Torção">Torção</option>
                              <option value="Sobrecarga">Sobrecarga</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Sintomas Associados</label>
                            <div className="flex flex-wrap gap-2">
                              {SYMPTOM_OPTIONS.map(symptom => (
                                <button
                                  key={symptom}
                                  onClick={() => {
                                    const newSymptoms = data!.symptoms.includes(symptom)
                                      ? data!.symptoms.filter(s => s !== symptom)
                                      : [...data!.symptoms, symptom];
                                    updateRegion(region as BodyRegion, { symptoms: newSymptoms });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all ${
                                    data!.symptoms.includes(symptom)
                                      ? "bg-rose-500 text-white"
                                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                  }`}
                                >
                                  {symptom}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => updateRegion(region as BodyRegion, { worseWithTraining: !data!.worseWithTraining })}
                              className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${
                                data!.worseWithTraining ? "bg-rose-500/10 border-rose-500 text-rose-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
                              }`}
                            >
                              <span className="text-xxs font-black uppercase tracking-widest block">Piora no Treino?</span>
                              <span className="text-xs font-bold">{data!.worseWithTraining ? 'Sim' : 'Não'}</span>
                            </button>
                            <button
                              onClick={() => updateRegion(region as BodyRegion, { improvesWithRest: !data!.improvesWithRest })}
                              className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${
                                data!.improvesWithRest ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
                              }`}
                            >
                              <span className="text-xxs font-black uppercase tracking-widest block">Melhora no Repouso?</span>
                              <span className="text-xs font-bold">{data!.improvesWithRest ? 'Sim' : 'Não'}</span>
                            </button>
                            <button
                              onClick={() => updateRegion(region as BodyRegion, { previousInjury: !data!.previousInjury })}
                              className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${
                                data!.previousInjury ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
                              }`}
                            >
                              <span className="text-xxs font-black uppercase tracking-widest block">Lesão Anterior?</span>
                              <span className="text-xs font-bold">{data!.previousInjury ? 'Sim' : 'Não'}</span>
                            </button>
                            <button
                              onClick={() => updateRegion(region as BodyRegion, { recurrence: !data!.recurrence })}
                              className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${
                                data!.recurrence ? "bg-rose-500/10 border-rose-500 text-rose-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
                              }`}
                            >
                              <span className="text-xxs font-black uppercase tracking-widest block">Recorrência?</span>
                              <span className="text-xs font-bold">{data!.recurrence ? 'Sim' : 'Não'}</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">ADM (Amplitude)</label>
                              <select 
                                value={data!.rom}
                                onChange={(e) => updateRegion(region as BodyRegion, { rom: e.target.value as any })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                              >
                                <option value="Normal">Normal</option>
                                <option value="Limitada">Limitada</option>
                                <option value="Muito Limitada">Muito Limitada</option>
                              </select>
                            </div>
                            <div>
                              <div className="flex justify-between mb-2">
                                <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Força (0-5)</label>
                                <span className="text-xs font-black text-cyan-400">{data!.strength}</span>
                              </div>
                              <input 
                                type="range" min="0" max="5" step="1"
                                value={data!.strength}
                                onChange={(e) => updateRegion(region as BodyRegion, { strength: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Testes Especiais (Positivos)</label>
                            <input 
                              type="text"
                              placeholder="Ex: Lachman, Gaveta Anterior..."
                              value={data!.specialTests}
                              onChange={(e) => updateRegion(region as BodyRegion, { specialTests: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div>
                            <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Tratamentos Prévios</label>
                            <div className="flex flex-wrap gap-2">
                              {TREATMENT_OPTIONS.map(treatment => (
                                <button
                                  key={treatment}
                                  onClick={() => {
                                    const newTreatments = data!.previousTreatments.includes(treatment)
                                      ? data!.previousTreatments.filter(t => t !== treatment)
                                      : [...data!.previousTreatments, treatment];
                                    updateRegion(region as BodyRegion, { previousTreatments: newTreatments });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all ${
                                    data!.previousTreatments.includes(treatment)
                                      ? "bg-cyan-500 text-[#050B14]"
                                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                  }`}
                                >
                                  {treatment}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* 3. Functional Impact */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
              3. Impacto Funcional
            </h2>
            <Card className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Impacto no Treino (0-10)</label>
                      <span className="text-sm font-black text-amber-400">{functionalImpact.training}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={functionalImpact.training}
                      onChange={(e) => setFunctionalImpact(prev => ({ ...prev, training: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Impacto na Competição (0-10)</label>
                      <span className="text-sm font-black text-amber-400">{functionalImpact.competition}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={functionalImpact.competition}
                      onChange={(e) => setFunctionalImpact(prev => ({ ...prev, competition: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setFunctionalImpact(prev => ({ ...prev, dailyActivities: !prev.dailyActivities }))}
                    className={`w-full p-6 rounded-2xl border transition-all flex items-center justify-between ${
                      functionalImpact.dailyActivities ? "bg-rose-500/10 border-rose-500 text-rose-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${functionalImpact.dailyActivities ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                        <AlertCircle size={24} />
                      </div>
                      <div className="text-left">
                        <span className="text-xxs font-black uppercase tracking-widest block">Limitação em Atividades Diárias?</span>
                        <span className="text-sm font-bold">Dificuldade em tarefas comuns do dia a dia</span>
                      </div>
                    </div>
                    <span className="text-lg font-black">{functionalImpact.dailyActivities ? 'Sim' : 'Não'}</span>
                  </button>
                </div>
              </div>
            </Card>
          </section>

          {/* 4. Functional Tests */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
              4. Testes Funcionais (Screening)
            </h2>
            <Card className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="flex justify-between mb-2">
                    <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Qualidade do Agachamento</label>
                    <span className="text-sm font-black text-emerald-400">{functionalTests.squat}</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" step="1"
                    value={functionalTests.squat}
                    onChange={(e) => setFunctionalTests(prev => ({ ...prev, squat: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <p className="text-xxs text-slate-500 uppercase font-bold text-center">Controle motor e estabilidade</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between mb-2">
                    <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Controle de Salto</label>
                    <span className="text-sm font-black text-emerald-400">{functionalTests.jump}</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" step="1"
                    value={functionalTests.jump}
                    onChange={(e) => setFunctionalTests(prev => ({ ...prev, jump: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <p className="text-xxs text-slate-500 uppercase font-bold text-center">Aterrissagem e absorção de impacto</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between mb-2">
                    <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Equilíbrio / Estabilidade</label>
                    <span className="text-sm font-black text-emerald-400">{functionalTests.balance}</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" step="1"
                    value={functionalTests.balance}
                    onChange={(e) => setFunctionalTests(prev => ({ ...prev, balance: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <p className="text-xxs text-slate-500 uppercase font-bold text-center">Propriocepção e controle postural</p>
                </div>
              </div>
            </Card>
          </section>

        </div>
      </div>
    </div>
  );
}
