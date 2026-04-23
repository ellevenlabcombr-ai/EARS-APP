 
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
    // Body Composition
    weight: '',
    height: '',
    fatPercentage: '',
    muscleMass: '',
    visceralFat: '',
    
    // Skinfolds (mm)
    sfTriceps: '',
    sfSubscapular: '',
    sfChest: '',
    sfAxillary: '',
    sfSuprailiac: '',
    sfAbdomen: '',
    sfThigh: '',

    // Bone/Residual approx
    boneMass: '15', // approx 15% of body weight as fallback

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

  // Auto-calculate BF and Muscle Mass when skinfolds or weight change
  useEffect(() => {
    const w = parseFloat(formData.weight);
    const tri = parseFloat(formData.sfTriceps) || 0;
    const sub = parseFloat(formData.sfSubscapular) || 0;
    const che = parseFloat(formData.sfChest) || 0;
    const axi = parseFloat(formData.sfAxillary) || 0;
    const sup = parseFloat(formData.sfSuprailiac) || 0;
    const abd = parseFloat(formData.sfAbdomen) || 0;
    const thi = parseFloat(formData.sfThigh) || 0;

    const sum7 = tri + sub + che + axi + sup + abd + thi;

    if (w > 0 && sum7 > 0) {
      let bd = 1.0;
      const age = athleteAge || 25;
      
      // Jackson & Pollock 7-site
      if (athleteGender === 'female') {
        bd = 1.0970 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * age);
      } else {
        bd = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * age);
      }
      
      // Siri Equation
      let bf = (495 / bd) - 450;
      if (bf < 2) bf = 2; // minimum boundary
      if (bf > 60) bf = 60; // maximum boundary

      // Muscle mass approx (Lean Mass - Bone - Residual)
      // For simplicity in sports: Muscle Mass = Total Weight - Fat Mass - Bone Mass
      // Bone mass is approx 15% of weight, Residual (organs/blood) ~ 25%.
      // Often trainers just want "Lean Body Mass", but if "Muscle Mass" is asked:
      // Lean Body Mass (LBM) = W - Fat
      const fatMass = w * (bf / 100);
      const lbm = w - fatMass;
      // Let's assume Muscle Mass is roughly LBM * 0.5 or we just output LBM if they mean Massa Magra. 
      // Many use (Weight - FatWeight) as Lean Mass. Let's provide Lean Mass as "Massa Muscular / Magra".
      // To be more precise, skeletal muscle mass is ~ LBM * 0.55. Let's output LBM as it's standard.
      
      const muscleMass = lbm; // Using Lean Mass as proxy for "Massa Muscular" as often used interchangeably by coaches.

      setFormData(prev => ({
        ...prev,
        fatPercentage: bf.toFixed(1),
        muscleMass: muscleMass.toFixed(1)
      }));
    }
  }, [
    formData.weight, formData.sfTriceps, formData.sfSubscapular, formData.sfChest, 
    formData.sfAxillary, formData.sfSuprailiac, formData.sfAbdomen, formData.sfThigh,
    athleteAge, athleteGender
  ]);

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
    { id: 1, title: 'Composição', icon: Weight },
    { id: 2, title: 'Dobras', icon: Calculator },
    { id: 3, title: 'Força e Potência', icon: Zap },
    { id: 4, title: 'Cap. Aeróbica', icon: Heart },
    { id: 5, title: 'Resumo', icon: BarChart3 },
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
              <span className="text-xxs font-black uppercase tracking-widest text-center max-w-[4rem]">{s.title}</span>
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
                  <Ruler className="w-4 h-4 text-emerald-400" /> Antropometria Básica
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
                  <label className="text-xxs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    Gordura Corporal (%) <Calculator className="w-3 h-3" />
                  </label>
                  <input 
                    type="number" 
                    value={formData.fatPercentage}
                    onChange={(e) => handleChange('fatPercentage', e.target.value)}
                    className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 font-black focus:border-emerald-500 outline-none transition-colors placeholder:text-emerald-500/30"
                    placeholder="Auto ou Digite..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    Massa Magra/Muscular (kg) <Calculator className="w-3 h-3" />
                  </label>
                  <input 
                    type="number" 
                    value={formData.muscleMass}
                    onChange={(e) => handleChange('muscleMass', e.target.value)}
                    className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 font-black focus:border-emerald-500 outline-none transition-colors placeholder:text-emerald-500/30"
                    placeholder="Auto ou Digite..."
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
                  <Calculator className="w-4 h-4 text-emerald-400" /> Dobras Cutâneas (mm)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Preencha as dobras para calcular BF automaticamente (Protocolo Jackson & Pollock 7m).
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'sfTriceps', label: 'Tríceps' },
                  { id: 'sfSubscapular', label: 'Subscapular' },
                  { id: 'sfChest', label: 'Peitoral' },
                  { id: 'sfAxillary', label: 'Axilar Média' },
                  { id: 'sfSuprailiac', label: 'Supra-ilíaca' },
                  { id: 'sfAbdomen', label: 'Abdominal' },
                  { id: 'sfThigh', label: 'Coxa' }
                ].map(sf => (
                  <div key={sf.id} className="space-y-2">
                    <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">{sf.label}</label>
                    <input 
                      type="number" 
                      value={(formData as any)[sf.id]}
                      onChange={(e) => handleChange(sf.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
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

        {step === 4 && (
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

        {step === 5 && (
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
        
        {step < 5 ? (
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
