 
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Moon, 
  Sun, 
  Clock, 
  Coffee, 
  Smartphone, 
  AlertCircle, 
  CheckCircle2, 
  Save,
  ArrowLeft,
  Info,
  X
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface SleepAssessmentProps {
  athleteId?: string;
  athleteName?: string;
  onBack?: () => void;
  onSave?: (score: number, data: any) => void;
}

export function SleepAssessment({ athleteId, athleteName, onBack, onSave }: SleepAssessmentProps) {
  const [formData, setFormData] = useState({
    // A. Sleep Quantity
    duration: 8,
    bedtime: "22:30",
    wakeTime: "06:30",
    
    // B. Perceived Quality
    quality: 7,
    feltRested: true,
    difficultyFallingAsleep: 2,
    
    // C. Sleep Interruptions
    awakenings: 0,
    
    // D. Habits
    screenExposure: 3,
    caffeineAtNight: false,
    
    // E. Daytime Impact
    daytimeSleepiness: 2,
    morningFatigue: 3
  });

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Scoring Logic
  const assessmentResult = useMemo(() => {
    // 1. Quantidade
    let quantidade = 1;
    if (formData.duration >= 8.5) quantidade = 10;
    else if (formData.duration >= 8) quantidade = 9;
    else if (formData.duration >= 7.5) quantidade = 7;
    else if (formData.duration >= 7) quantidade = 5;
    else if (formData.duration >= 6.5) quantidade = 3;
    else quantidade = 1;

    // 2. Qualidade
    let qualidade = formData.quality;
    qualidade += formData.feltRested ? 1 : 0;
    qualidade -= formData.difficultyFallingAsleep * 0.3;
    qualidade = Math.max(0, Math.min(10, qualidade));

    // 3. Continuidade
    const contScores = [10, 8, 6, 4, 1];
    const continuidade = contScores[formData.awakenings] || 1;

    // 4. Habitos
    let habitos = 10;
    habitos -= formData.screenExposure * 0.5;
    habitos -= formData.caffeineAtNight ? 2 : 0;
    habitos = Math.max(0, Math.min(10, habitos));

    // 5. Impacto
    let impacto = 10 - ((formData.daytimeSleepiness + formData.morningFatigue) / 2);
    impacto = Math.max(0, Math.min(10, impacto));

    // Score Final
    const rawScore = (
      quantidade * 0.30 +
      qualidade * 0.30 +
      continuidade * 0.15 +
      habitos * 0.10 +
      impacto * 0.15
    ) * 10;

    const finalScore = Math.round(rawScore);

    // Classification
    let classification = "";
    if (finalScore >= 90) classification = "Excelente Recuperação";
    else if (finalScore >= 75) classification = "Boa Recuperação";
    else if (finalScore >= 60) classification = "Atenção";
    else if (finalScore >= 40) classification = "Baixa Recuperação";
    else classification = "Recuperação Crítica";

    // Insights
    const allInsights = [];
    if (quantidade < 6) allInsights.push("Tempo de sono insuficiente para recuperação ideal.");
    if (qualidade < 6) allInsights.push("Qualidade percebida reduzida, mesmo com possível duração adequada.");
    if (continuidade < 6) allInsights.push("Sono fragmentado por despertares frequentes.");
    if (habitos < 6) allInsights.push("Hábitos noturnos podem estar prejudicando o sono.");
    if (impacto < 6) allInsights.push("Sinais diurnos sugerem recuperação incompleta.");
    
    if (finalScore >= 85) allInsights.push("Padrão de sono compatível com boa recuperação física e mental.");

    const insights = allInsights.slice(0, 2);

    return {
      score: finalScore,
      classification,
      insights,
      subscores: {
        quantidade,
        qualidade,
        continuidade,
        habitos,
        impacto
      }
    };
  }, [formData]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (onSave) {
      await onSave(assessmentResult.score, { 
        ...formData, 
        date: new Date().toISOString(),
        score: assessmentResult.score,
        classification: assessmentResult.classification,
        insights: assessmentResult.insights,
        subscores: assessmentResult.subscores
      });
    }
    
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getScoreColor = (s: number) => {
    if (s >= 75) return "text-emerald-400";
    if (s >= 60) return "text-yellow-400";
    return "text-rose-400";
  };

  const getScoreBg = (s: number) => {
    if (s >= 75) return "bg-emerald-500/10 border-emerald-500/20";
    if (s >= 60) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-rose-500/10 border-rose-500/20";
  };

  const formSteps = [
    { id: 1, title: 'Quantidade', icon: Clock },
    { id: 2, title: 'Qualidade', icon: CheckCircle2 },
    { id: 3, title: 'Interrupções', icon: AlertCircle },
    { id: 4, title: 'Hábitos', icon: Smartphone },
    { id: 5, title: 'Impacto Diurno', icon: Sun },
    { id: 6, title: 'Resultado', icon: Save },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Moon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Avaliação do Sono</h2>
            <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">Qualidade do descanso</p>
          </div>
        </div>
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        )}
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

      <div className="max-w-2xl mx-auto space-y-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-500" /> Quantidade de Sono
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-slate-400 font-medium">Duração Total (Horas)</label>
                  <span className="text-cyan-400 font-bold">{formData.duration}h</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="12" 
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-widest">Horário de Deitar</label>
                  <input 
                    type="time" 
                    value={formData.bedtime}
                    onChange={(e) => setFormData({...formData, bedtime: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase font-bold tracking-widest">Horário de Acordar</label>
                  <input 
                    type="time" 
                    value={formData.wakeTime}
                    onChange={(e) => setFormData({...formData, wakeTime: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-500" /> Qualidade Percebida
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-slate-400 font-medium">Qualidade Geral (0-10)</label>
                  <span className="text-purple-400 font-bold">{formData.quality}/10</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={formData.quality}
                  onChange={(e) => setFormData({...formData, quality: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                <div>
                  <p className="text-white font-bold">Acordou descansado?</p>
                  <p className="text-xs text-slate-500">Sensação de recuperação completa</p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, feltRested: !formData.feltRested})}
                  className={`w-14 h-8 rounded-full transition-colors relative ${formData.feltRested ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.feltRested ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-slate-400 font-medium">Dificuldade para pegar no sono</label>
                  <span className="text-purple-400 font-bold">{formData.difficultyFallingAsleep}/10</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={formData.difficultyFallingAsleep}
                  onChange={(e) => setFormData({...formData, difficultyFallingAsleep: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-500" /> Interrupções
            </h3>
            <div className="space-y-4">
              <label className="text-slate-400 font-medium block">Número de despertares durante a noite</label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, "4+"].map((val, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFormData({...formData, awakenings: idx})}
                    className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold ${
                      formData.awakenings === idx 
                        ? "bg-amber-500 border-amber-500 text-[#050B14]" 
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-500" /> Hábitos Pré-Sono
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-slate-400 font-medium">Exposição a telas antes de dormir</label>
                  <span className="text-blue-400 font-bold">{formData.screenExposure}/10</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={formData.screenExposure}
                  onChange={(e) => setFormData({...formData, screenExposure: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <Coffee className="text-amber-400" size={20} />
                  <div>
                    <p className="text-white font-bold">Consumo de cafeína à noite?</p>
                    <p className="text-xs text-slate-500">Café, energéticos, pré-treinos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFormData({...formData, caffeineAtNight: !formData.caffeineAtNight})}
                  className={`w-14 h-8 rounded-full transition-colors relative ${formData.caffeineAtNight ? 'bg-rose-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.caffeineAtNight ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
              <Sun className="w-4 h-4 text-cyan-500" /> Impacto Diurno
            </h3>
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-slate-400 font-medium">Sonolência durante o dia</label>
                  <span className="text-rose-400 font-bold">{formData.daytimeSleepiness}/10</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={formData.daytimeSleepiness}
                  onChange={(e) => setFormData({...formData, daytimeSleepiness: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="text-slate-400 font-medium">Fadiga matinal</label>
                  <span className="text-rose-400 font-bold">{formData.morningFatigue}/10</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={formData.morningFatigue}
                  onChange={(e) => setFormData({...formData, morningFatigue: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-8 text-center border-b border-slate-800">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-2">Score de Recuperação</p>
                <div className={`text-7xl font-black mb-3 ${getScoreColor(assessmentResult.score).split(' ')[0]}`}>
                  {assessmentResult.score}
                </div>
                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${getScoreBg(assessmentResult.score)} ${getScoreColor(assessmentResult.score)} border`}>
                  {assessmentResult.classification}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                   <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Quantid.</span>
                      <span className={`text-base font-black mt-1 ${getScoreColor(assessmentResult.subscores.quantidade * 10)}`}>{assessmentResult.subscores.quantidade}</span>
                   </div>
                   <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Qualidade</span>
                      <span className={`text-base font-black mt-1 ${getScoreColor(assessmentResult.subscores.qualidade * 10)}`}>{assessmentResult.subscores.qualidade}</span>
                   </div>
                   <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Contin.</span>
                      <span className={`text-base font-black mt-1 ${getScoreColor(assessmentResult.subscores.continuidade * 10)}`}>{assessmentResult.subscores.continuidade}</span>
                   </div>
                   <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Hábitos</span>
                      <span className={`text-base font-black mt-1 ${getScoreColor(assessmentResult.subscores.habitos * 10)}`}>{assessmentResult.subscores.habitos}</span>
                   </div>
                   <div className="col-span-2 md:col-span-1 bg-slate-950 rounded-xl p-3 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Impacto</span>
                      <span className={`text-base font-black mt-1 ${getScoreColor(assessmentResult.subscores.impacto * 10)}`}>{assessmentResult.subscores.impacto}</span>
                   </div>
                </div>

                {assessmentResult.insights.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-4">Insights Gerados</h4>
                    {assessmentResult.insights.map((alert, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-4 py-3 rounded-xl border border-amber-500/20">
                        <span className="w-1.5 h-1.5 mt-1 rounded-full bg-amber-400 shrink-0" />
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
              onClick={() => step > 1 ? setStep(step - 1) : (onBack ? onBack() : null)} 
              className="text-slate-400 hover:text-white uppercase tracking-widest text-[10px] font-black"
            >
              {step === 1 ? 'Cancelar' : 'Anterior'}
            </Button>
            <Button 
              onClick={() => setStep(step + 1)} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white uppercase tracking-widest text-[10px] font-black w-32"
            >
              {step === 5 ? 'Ver Resultado' : 'Próximo'}
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 size={20} />
            Avaliação salva com sucesso!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
