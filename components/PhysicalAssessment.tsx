 
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Weight, 
  Ruler, 
  Zap, 
  Heart, 
  TrendingUp, 
  Save, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Dumbbell,
  Timer,
  Target,
  BarChart3,
  Calculator
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface PhysicalAssessmentProps {
  athleteId: string;
  athleteAge?: number;
  athleteGender?: 'male' | 'female';
  onCancel: () => void;
  onSave: (data: any) => void;
}

export default function PhysicalAssessment({ athleteId, athleteAge = 25, athleteGender = 'male', onCancel, onSave }: PhysicalAssessmentProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Força & Potência
    squat: '',
    benchPress: '',
    deadlift: '',
    cmjJump: '',
    squatJump: '',
    powerOutput: '',
    
    // Step 2: Velocidade & Agilidade
    speed10m: '',
    speed30m: '',
    tTestAgility: '',
    illinoisAgility: '',
    changeOfDirection: '',

    // Step 3: Cap. Aeróbica & Anaeróbica
    vo2Max: '',
    beepTest: '',
    yoyoTest: '',
    restingHeartRate: '',
    recoveryHeartRate: '',

    // Step 4: Capacidades Coordenativas
    yBalanceAnt: '',
    yBalancePM: '',
    yBalancePL: '',
    reactionTime: '5', // 1-10
    rhythm: '5', // 1-10
    differentiation: '5', // 1-10
    spatialOrientation: '5', // 1-10
    
    notes: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
    await onSave({
      ...formData,
      athleteId,
      date: new Date().toISOString(),
      type: 'physical_fitness'
    });
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { id: 1, title: 'Força & Potência', icon: Zap },
    { id: 2, title: 'Velocidade & Agilidade', icon: Timer },
    { id: 3, title: 'Cardiorrespiratório', icon: Heart },
    { id: 4, title: 'Coordenativo', icon: Target },
    { id: 5, title: 'Resumo', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Avaliação Física</h2>
            <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">Capacidades Físicas & Coordenativas</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-4 py-2 my-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div 
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all shrink-0 ${step === s.id ? 'scale-110' : 'opacity-40'}`}
              onClick={() => setStep(s.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] font-black uppercase tracking-widest text-center max-w-[5rem] leading-tight">{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-[2px] shrink-0 mb-8 ${step > s.id ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-slate-900/40 border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" /> Força Máxima & Potência
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Agachamento (kg)</label>
                  <input type="number" value={formData.squat} onChange={(e) => handleChange('squat', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="000" />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Supino (kg)</label>
                  <input type="number" value={formData.benchPress} onChange={(e) => handleChange('benchPress', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="000" />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Salto CMJ (cm)</label>
                  <input type="number" value={formData.cmjJump} onChange={(e) => handleChange('cmjJump', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="00.0" />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Salto Squat (cm)</label>
                  <input type="number" value={formData.squatJump} onChange={(e) => handleChange('squatJump', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="00.0" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-slate-900/40 border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Timer className="w-4 h-4 text-indigo-400" /> Velocidade e Agilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Velocidade 10m (s)</label>
                  <input type="number" value={formData.speed10m} onChange={(e) => handleChange('speed10m', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Velocidade 30m (s)</label>
                  <input type="number" value={formData.speed30m} onChange={(e) => handleChange('speed30m', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">T-Test Agilidade (s)</label>
                  <input type="number" value={formData.tTestAgility} onChange={(e) => handleChange('tTestAgility', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="00.0" />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Illinois Test (s)</label>
                  <input type="number" value={formData.illinoisAgility} onChange={(e) => handleChange('illinoisAgility', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="00.0" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-slate-900/40 border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Heart className="w-4 h-4 text-indigo-400" /> Cardiorrespiratório
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">VO2 Máx (ml/kg/min)</label>
                  <input type="number" value={formData.vo2Max} onChange={(e) => handleChange('vo2Max', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="00.0" />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Yo-Yo Test (Distância)</label>
                  <input type="number" value={formData.yoyoTest} onChange={(e) => handleChange('yoyoTest', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="0000 m" />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Beep Test (Nível/Estágio)</label>
                  <input type="text" value={formData.beepTest} onChange={(e) => handleChange('beepTest', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="Ex: 12.4" />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">FC Repouso (bpm)</label>
                  <input type="number" value={formData.restingHeartRate} onChange={(e) => handleChange('restingHeartRate', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors" placeholder="00" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-slate-900/40 border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" /> Capacidades Coordenativas & Equilíbrio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-xxs font-black text-slate-400 uppercase tracking-widest mb-3 block">Equilíbrio (Y-Balance Test - mm)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Anterior</label>
                      <input type="number" value={formData.yBalanceAnt} onChange={(e) => handleChange('yBalanceAnt', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" placeholder="000" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Póstero-Medial</label>
                      <input type="number" value={formData.yBalancePM} onChange={(e) => handleChange('yBalancePM', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" placeholder="000" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Póstero-Lateral</label>
                      <input type="number" value={formData.yBalancePL} onChange={(e) => handleChange('yBalancePL', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" placeholder="000" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: 'reactionTime', label: 'Tempo de Reação' },
                    { id: 'rhythm', label: 'Ritmo' },
                    { id: 'differentiation', label: 'Diferenciação Kinestésica' },
                    { id: 'spatialOrientation', label: 'Orientação Espacial' }
                  ].map(cap => (
                    <div key={cap.id} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xxs font-black text-slate-400 uppercase tracking-widest">{cap.label}</label>
                        <span className="text-xs font-black text-indigo-400">{(formData as any)[cap.id]}/10</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" 
                        value={(formData as any)[cap.id]} 
                        onChange={(e) => handleChange(cap.id, e.target.value)}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="bg-slate-900/40 border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" /> Observações Finais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors min-h-[150px] resize-none"
                  placeholder="Descreva a qualidade técnica dos testes e observações relevantes..."
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
        <Button 
          variant="ghost" 
          onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
          className="text-slate-400 hover:text-white uppercase text-xxs font-black tracking-widest"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> {step === 1 ? 'Cancelar' : 'Anterior'}
        </Button>
        
        {step < 5 ? (
          <Button 
            onClick={() => setStep(step + 1)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white uppercase text-xxs font-black tracking-widest px-8"
          >
            Próximo <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-500 hover:bg-indigo-600 text-white uppercase text-xxs font-black tracking-widest px-8 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
          >
            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Finalizar Avaliação
          </Button>
        )}
      </div>
    </div>
  );
}
