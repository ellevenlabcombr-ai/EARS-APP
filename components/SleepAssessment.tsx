 
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
  Info
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

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Scoring Logic
  const score = useMemo(() => {
    const normalizeSleepDuration = (hours: number) => {
      if (hours >= 7 && hours <= 9) return 10;
      if (hours < 7) return (hours / 7) * 10;
      if (hours > 9) return 9;
      return 0;
    };

    const normalizeAwakenings = (count: number) => {
      if (count === 0) return 10;
      if (count === 1) return 8;
      if (count === 2) return 6;
      if (count === 3) return 4;
      return 2;
    };

    const v1 = normalizeSleepDuration(formData.duration);
    const v2 = formData.quality; // 0-10
    const v3 = formData.feltRested ? 10 : 0;
    const v4 = 10 - formData.difficultyFallingAsleep;
    const v5 = normalizeAwakenings(formData.awakenings);
    const v6 = 10 - formData.screenExposure;
    const v7 = formData.caffeineAtNight ? 0 : 10;
    const v8 = 10 - formData.daytimeSleepiness;
    const v9 = 10 - formData.morningFatigue;

    const total = (v1 + v2 + v3 + v4 + v5 + v6 + v7 + v8 + v9) / 9;
    return Math.round(total * 10) / 10;
  }, [formData]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (onSave) {
      await onSave(score, { ...formData, date: new Date().toISOString() });
    }
    
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getScoreColor = (s: number) => {
    if (s >= 8) return "text-emerald-400";
    if (s >= 6) return "text-yellow-400";
    return "text-rose-400";
  };

  const getScoreBg = (s: number) => {
    if (s >= 8) return "bg-emerald-500/10 border-emerald-500/20";
    if (s >= 6) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              Avaliação do Sono <Moon className="text-cyan-500" size={24} />
            </h1>
            <p className="text-slate-400 mt-1">
              {athleteName ? `Atleta: ${athleteName}` : "Análise de recuperação e qualidade do descanso"}
            </p>
          </div>
        </div>

        <div className={`px-6 py-3 rounded-2xl border flex items-center gap-4 transition-colors ${getScoreBg(score)}`}>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Score de Recuperação</p>
            <p className={`text-3xl font-black ${getScoreColor(score)}`}>{score.toFixed(1)}</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center">
            <Moon size={20} className={getScoreColor(score)} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Sleep Quantity */}
        <Card className="p-6 bg-[#0A1120] border-slate-800/50 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
              <Clock size={20} />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Quantidade de Sono</h2>
          </div>
          
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
        </Card>

        {/* B. Perceived Quality */}
        <Card className="p-6 bg-[#0A1120] border-slate-800/50 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <CheckCircle2 size={20} />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Qualidade Percebida</h2>
          </div>

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
        </Card>

        {/* C. Sleep Interruptions */}
        <Card className="p-6 bg-[#0A1120] border-slate-800/50 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <AlertCircle size={20} />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Interrupções</h2>
          </div>

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
        </Card>

        {/* D. Habits */}
        <Card className="p-6 bg-[#0A1120] border-slate-800/50 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Smartphone size={20} />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Hábitos Pré-Sono</h2>
          </div>

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
        </Card>

        {/* E. Daytime Impact */}
        <Card className="p-6 bg-[#0A1120] border-slate-800/50 space-y-6 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Sun size={20} />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Impacto Diurno</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </Card>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-auto lg:right-8 lg:bottom-8 p-4 lg:p-0 bg-[#050B14]/80 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-end gap-4">
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
            <Info size={16} />
            <span>Os dados serão salvos no histórico do atleta</span>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase tracking-widest px-8 py-6 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-[#050B14]/30 border-t-[#050B14] rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {isSaving ? "Salvando..." : "Finalizar Avaliação"}
          </Button>
        </div>
      </div>

      {/* Success Toast */}
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
