 
"use client";

import React, { useState } from 'react';
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
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface PhysicalAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

export default function PhysicalAssessment({ athleteId, onCancel, onSave }: PhysicalAssessmentProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Body Composition
    weight: '',
    height: '',
    fatPercentage: '',
    muscleMass: '',
    visceralFat: '',
    
    // Strength
    squat: '',
    benchPress: '',
    deadlift: '',
    pullUps: '',
    
    // Power
    verticalJump: '',
    broadJump: '',
    sprint30m: '',
    
    // Aerobic
    vo2Max: '',
    beepTest: '',
    restingHeartRate: '',
    
    notes: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      athleteId,
      date: new Date().toISOString(),
      type: 'physical'
    });
  };

  const steps = [
    { id: 1, title: 'Composição Corporal', icon: Weight },
    { id: 2, title: 'Força e Potência', icon: Zap },
    { id: 3, title: 'Capacidade Aeróbica', icon: Heart },
    { id: 4, title: 'Resumo e Notas', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Avaliação Física</h2>
            <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">Performance e Composição</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-4">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div 
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${step === s.id ? 'scale-110' : 'opacity-40'}`}
              onClick={() => setStep(s.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xxs font-black uppercase tracking-widest text-center max-w-[3.75rem]">{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-2 mb-6 ${step > s.id ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
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
                  <Ruler className="w-4 h-4 text-emerald-400" /> Antropometria
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Peso (kg)</label>
                  <input 
                    type="number" 
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="00.0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Altura (cm)</label>
                  <input 
                    type="number" 
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Gordura Corporal (%)</label>
                  <input 
                    type="number" 
                    value={formData.fatPercentage}
                    onChange={(e) => handleChange('fatPercentage', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="00.0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Massa Muscular (kg)</label>
                  <input 
                    type="number" 
                    value={formData.muscleMass}
                    onChange={(e) => handleChange('muscleMass', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="00.0"
                  />
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
                  <Dumbbell className="w-4 h-4 text-emerald-400" /> Testes de Força (1RM)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Agachamento (kg)</label>
                  <input 
                    type="number" 
                    value={formData.squat}
                    onChange={(e) => handleChange('squat', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Supino (kg)</label>
                  <input 
                    type="number" 
                    value={formData.benchPress}
                    onChange={(e) => handleChange('benchPress', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Lev. Terra (kg)</label>
                  <input 
                    type="number" 
                    value={formData.deadlift}
                    onChange={(e) => handleChange('deadlift', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="000"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Timer className="w-4 h-4 text-emerald-400" /> Potência e Velocidade
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Salto Vertical (cm)</label>
                  <input 
                    type="number" 
                    value={formData.verticalJump}
                    onChange={(e) => handleChange('verticalJump', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="00.0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Salto Horizontal (cm)</label>
                  <input 
                    type="number" 
                    value={formData.broadJump}
                    onChange={(e) => handleChange('broadJump', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Sprint 30m (s)</label>
                  <input 
                    type="number" 
                    value={formData.sprint30m}
                    onChange={(e) => handleChange('sprint30m', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="0.00"
                  />
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
                  <Heart className="w-4 h-4 text-emerald-400" /> Capacidade Aeróbica
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">VO2 Máx (ml/kg/min)</label>
                  <input 
                    type="number" 
                    value={formData.vo2Max}
                    onChange={(e) => handleChange('vo2Max', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="00.0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Beep Test (Nível)</label>
                  <input 
                    type="text" 
                    value={formData.beepTest}
                    onChange={(e) => handleChange('beepTest', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="Ex: 12.4"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Freq. Cardíaca Repouso (bpm)</label>
                  <input 
                    type="number" 
                    value={formData.restingHeartRate}
                    onChange={(e) => handleChange('restingHeartRate', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="00"
                  />
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
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> Observações Finais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors min-h-[9.375rem] resize-none"
                  placeholder="Descreva observações relevantes sobre a performance física do atleta..."
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
        
        {step < 4 ? (
          <Button 
            onClick={() => setStep(step + 1)}
            className="bg-emerald-500 hover:bg-emerald-600 text-[#050B14] uppercase text-xxs font-black tracking-widest px-8"
          >
            Próximo <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-[#050B14] uppercase text-xxs font-black tracking-widest px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Save className="w-4 h-4 mr-2" /> Finalizar Avaliação
          </Button>
        )}
      </div>
    </div>
  );
}
