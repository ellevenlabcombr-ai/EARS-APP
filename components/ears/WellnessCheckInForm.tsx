
"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Moon, 
  Battery, 
  Smile, 
  Activity, 
  ArrowUpRight,
  ShieldAlert,
  Save,
  Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { AdaptiveQuestionModule } from './AdaptiveQuestionModule';
import { ClinicalSymptomsModule } from './ClinicalSymptomsModule';
import { PainMap } from '../PainMap';
import { EARSEngine } from '../../lib/ears-engine';
import { WellnessCheckIn, BodyPain, AthleteProfile } from '../../types/ears';

interface Props {
  athlete: AthleteProfile;
  onSubmit: (data: WellnessCheckIn) => void;
}

const MENSTRUAL_PHASES = [
  { id: 'menstrual', label: 'Menstrual', emoji: '🩸', desc: 'Início do ciclo' },
  { id: 'follicular', label: 'Folicular', emoji: '🌱', desc: 'Pós-menstruação' },
  { id: 'ovulatory', label: 'Ovulatória', emoji: '🥚', desc: 'Pico hormonal' },
  { id: 'luteal', label: 'Lútea', emoji: '🍂', desc: 'Pré-menstrual' },
  { id: 'none', label: 'Contraceptivo', emoji: '💊', desc: 'Ciclo suprimido' },
];

export const WellnessCheckInForm: React.FC<Props> = ({ athlete, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Partial<WellnessCheckIn>>({
    sleep_quality: 3,
    sleep_hours: 7,
    energy: 3,
    mood: 3,
    stress: 3,
    recovery: 3,
    confidence: 3,
    leg_heaviness: 3,
    overall_readiness: 3,
    pain_map: [],
    clinical_symptoms: [],
    menstrual_cycle: 'none'
  });

  // Calculate scores on the fly for feedback
  const { score, level } = useMemo(() => {
    return EARSEngine.calculateFinalReadiness(answers, athlete.age);
  }, [answers, athlete.age]);

  const handleUpdate = (field: keyof WellnessCheckIn, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handlePainMapUpdate = (map: Record<string, any>) => {
    const painList: BodyPain[] = Object.entries(map).map(([region, data]: [string, any]) => ({
      region,
      level: data.level || 5,
      type: (data.type?.[0] as any) || 'muscle'
    }));
    handleUpdate('pain_map', painList);
  };

  const nextStep = () => {
    // Logic for conditional modules
    if (step === 1) {
      const soreness = answers.leg_heaviness || 3;
      const drop = (athlete.previous_readiness || 100) - score;
      
      if (soreness >= 3 || drop > 15 || (answers.pain_map?.length || 0) > 0) {
        setStep(2); // Body Scanner
      } else if ((answers.sleep_quality || 5) <= 2 || (answers.energy || 5) <= 2 || (answers.mood || 5) <= 2) {
        setStep(3); // Symptoms
      } else if (athlete.gender === 'female') {
        setStep(5); // Menstrual Cycle
      } else {
        setStep(4); // Summary
      }
    } else if (step === 2) {
      if ((answers.sleep_quality || 5) <= 2 || (answers.energy || 5) <= 2 || (answers.mood || 5) <= 2) {
        setStep(3); // Symptoms
      } else if (athlete.gender === 'female') {
        setStep(5); // Menstrual Cycle
      } else {
        setStep(4); // Summary
      }
    } else if (step === 3) {
      if (athlete.gender === 'female') {
        setStep(5); // Menstrual Cycle
      } else {
        setStep(4); // Summary
      }
    } else if (step === 5) {
      setStep(4); // To Summary
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step === 5) {
      // Come back from Menstrual
      if ((answers.sleep_quality || 5) <= 2 || (answers.energy || 5) <= 2 || (answers.mood || 5) <= 2) {
        setStep(3);
      } else if (answers.pain_map && answers.pain_map.length > 0) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else if (step === 4) {
      if (athlete.gender === 'female') {
        setStep(5);
      } else if ((answers.sleep_quality || 5) <= 2 || (answers.energy || 5) <= 2 || (answers.mood || 5) <= 2) {
        setStep(3);
      } else if (answers.pain_map && answers.pain_map.length > 0) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else {
      setStep(step - 1);
    }
  };

  const getStatusColor = () => {
    if (level === 'ready') return 'text-emerald-400';
    if (level === 'attention') return 'text-amber-400';
    return 'text-rose-400';
  };

  const stepsCount = 4;
  const progress = (step / stepsCount) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      {/* Header & Score Preview */}
      <div className="flex items-center justify-between p-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl bg-slate-800/50 border border-white/5 ${getStatusColor()}`}>
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Wellness Check-in</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">EARS Intelligence System</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Provisório</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black ${getStatusColor()}`}>{score}</span>
            <span className="text-xs font-black text-slate-500">%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-2">
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          {step === 1 && (
            <div className="grid grid-cols-1 gap-8">
              <AdaptiveQuestionModule 
                id="sleep_quality"
                label="Qualidade do Sono"
                value={answers.sleep_quality}
                onChange={(v) => handleUpdate('sleep_quality', v)}
              />
              <AdaptiveQuestionModule 
                id="energy"
                label="Nível de Energia"
                value={answers.energy}
                onChange={(v) => handleUpdate('energy', v)}
              />
              <AdaptiveQuestionModule 
                id="leg_heaviness"
                label="Peso nas Pernas / Dor"
                value={answers.leg_heaviness}
                onChange={(v) => handleUpdate('leg_heaviness', v)}
              />
              <AdaptiveQuestionModule 
                id="mood"
                label="Humor / Motivação"
                value={answers.mood}
                onChange={(v) => handleUpdate('mood', v)}
              />
              <div className="grid grid-cols-2 gap-4">
                <AdaptiveQuestionModule 
                  id="stress"
                  label="Estresse ontem"
                  value={answers.stress}
                  onChange={(v) => handleUpdate('stress', v)}
                />
                <AdaptiveQuestionModule 
                  id="confidence"
                  label="Confiança hoje"
                  value={answers.confidence}
                  onChange={(v) => handleUpdate('confidence', v)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <p className="text-xs font-bold text-rose-200 uppercase tracking-tight">Scanner Corporal Ativado (Dor Detectada)</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-4">
                <PainMap 
                  value={(() => {
                    const map: any = {};
                    answers.pain_map?.forEach(p => {
                      map[p.region] = { level: p.level, type: [p.type] };
                    });
                    return map;
                  })()}
                  onChange={handlePainMapUpdate}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <ClinicalSymptomsModule 
              selected={answers.clinical_symptoms || []}
              onChange={(s) => handleUpdate('clinical_symptoms', s)}
            />
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                Ciclo Menstrual
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MENSTRUAL_PHASES.map((phase) => {
                  const isSelected = answers.menstrual_cycle === phase.id;
                  return (
                    <button
                      key={phase.id}
                      onClick={() => handleUpdate('menstrual_cycle', phase.id)}
                      className={`
                        flex items-center gap-4 p-5 rounded-[32px] border transition-all duration-300
                        ${isSelected 
                          ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-gradient-to-br from-rose-500/10 to-transparent' 
                          : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'}
                      `}
                    >
                      <div className={`p-4 rounded-2xl ${isSelected ? 'bg-rose-500/20' : 'bg-slate-800'}`}>
                        <span className="text-2xl">{phase.emoji}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-widest">{phase.label}</p>
                        <p className="text-[10px] opacity-60 font-medium">{phase.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-indigo-600 p-8 rounded-[40px] text-center shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Zap className="w-32 h-32" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Check-in Concluído</h2>
                <div className="flex justify-center items-baseline gap-2 my-4">
                  <span className="text-7xl font-black text-white">{score}</span>
                  <span className="text-xl font-bold text-indigo-200">%</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-lg`}>
                  <div className={`w-2 h-2 rounded-full bg-white animate-pulse`} />
                  <span className="text-xs font-black text-white uppercase tracking-widest">
                    {level === 'ready' ? 'Condição Ótima' : level === 'attention' ? 'Ponto de Atenção' : 'Risco de Lesão'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Deduções Ativas</p>
                  <p className="text-sm font-bold text-white uppercase">{EARSEngine.calculatePainDeduction(answers.pain_map || []) + EARSEngine.calculateSymptomsDeduction(answers.clinical_symptoms || []) + EARSEngine.calculateMultipliers(answers)}%</p>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Zonas de Dor</p>
                  <p className="text-sm font-bold text-white uppercase">{answers.pain_map?.length || 0} Regiões</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Navigation */}
      <div className="flex gap-4">
        {step > 1 && (
          <Button 
            variant="outline" 
            onClick={prevStep}
            className="flex-1 py-6 rounded-2xl border-slate-800 text-slate-400 font-black uppercase tracking-widest"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Voltar
          </Button>
        )}
        <Button 
          onClick={step === 4 ? () => onSubmit(answers as WellnessCheckIn) : nextStep}
          className={`flex-[2] py-6 rounded-2xl text-white font-black uppercase tracking-widest shadow-lg ${step === 4 ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
        >
          {step === 4 ? (
            <><Save className="w-5 h-5 mr-2" /> Salvar Tudo</>
          ) : (
            <><ChevronRight className="w-5 h-5 mr-2" /> Continuar</>
          )}
        </Button>
      </div>
    </div>
  );
};
