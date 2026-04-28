"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Activity, 
  AlertCircle, 
  Save, 
  X, 
  Dumbbell,
  BarChart3,
  Info,
  ArrowRightLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestInfoModal } from '@/components/TestInfoModal';

interface DynamometryAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

export default function DynamometryAssessment({ athleteId, onCancel, onSave }: DynamometryAssessmentProps) {
  const [step, setStep] = useState(1);
  
  // K-Force/Dynamometry data (kg or N)
  const [measurements, setMeasurements] = useState({
    quadricepsR: 0,
    quadricepsL: 0,
    hamstringsR: 0,
    hamstringsL: 0,
    hipAbductorsR: 0,
    hipAbductorsL: 0,
    hipAdductorsR: 0,
    hipAdductorsL: 0,
    gripR: 0,
    gripL: 0
  });

  const [notes, setNotes] = useState('');

  const handleValueChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const calculateAsymmetry = (right: number, left: number) => {
    if (right === 0 && left === 0) return 0;
    const diff = Math.abs(right - left);
    const max = Math.max(right, left);
    return Math.round((diff / max) * 100);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        athleteId,
        measurements,
        asymmetries: {
          quadriceps: calculateAsymmetry(measurements.quadricepsR, measurements.quadricepsL),
          hamstrings: calculateAsymmetry(measurements.hamstringsR, measurements.hamstringsL),
          hipAbductors: calculateAsymmetry(measurements.hipAbductorsR, measurements.hipAbductorsL),
          hipAdductors: calculateAsymmetry(measurements.hipAdductorsR, measurements.hipAdductorsL),
          grip: calculateAsymmetry(measurements.gripR, measurements.gripL)
        },
        date: new Date().toISOString(),
        type: 'dynamometry',
        notes
      });
    } finally {
      setIsSaving(false);
    }
  };

  const groups = [
    { id: 'quadriceps', label: 'E. Joelho (Quad)', fields: ['quadricepsR', 'quadricepsL'] },
    { id: 'hamstrings', label: 'F. Joelho (Isquios)', fields: ['hamstringsR', 'hamstringsL'] },
    { id: 'hipAbductors', label: 'Abdução Quadril', fields: ['hipAbductorsR', 'hipAbductorsL'] },
    { id: 'hipAdductors', label: 'Adução Quadril', fields: ['hipAdductorsR', 'hipAdductorsL'] },
    { id: 'grip', label: 'Preensão (Grip)', fields: ['gripR', 'gripL'] }
  ];

  const formSteps = [
    { id: 1, title: 'Quadríceps', icon: Zap },
    { id: 2, title: 'Isquiotibiais', icon: ArrowRightLeft },
    { id: 3, title: 'Quadril', icon: Activity },
    { id: 4, title: 'Preensão', icon: Dumbbell },
    { id: 5, title: 'Notas', icon: Info },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <TestInfoModal
            title="Dinamometria (K-Force)"
            indication="Medir força máxima isométrica e detectar assimetrias musculares (diferenças entre direita/esquerda)."
            application="Uso de dinamômetro portátil (Push/Pull). Realiza-se o teste bilateralmente com 1 repetição de familiarização e 2-3 de esforço máximo (3-5s)."
            referenceValues={["Diferença > 15%: Risco moderado/alto de lesão", "Diferença 10-15%: Zona de atenção", "Diferença < 10%: Aceitável (Simetria boa)"]}
            deficitGrades={["Leve (< 10%)", "Moderado (10-15%)", "Severo (> 15% ou dor associada)"]}
          >
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Dinamometria (K-Force)</h2>
              <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">Avaliação de Força Isométrica e Simetria</p>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] md:text-xs font-black uppercase tracking-widest text-center max-w-[5rem] md:max-w-[7rem] leading-tight mt-1">{s.title}</span>
            </div>
            {i < formSteps.length - 1 && (
              <div className={`w-8 md:flex-1 h-[2px] shrink-0 mb-8 mx-2 ${step > s.id ? 'bg-amber-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Extensão de Joelho (Quadríceps)
              </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">D - Direito (kg)</label>
                    <input type="number" value={measurements.quadricepsR || ''} onChange={(e) => handleValueChange('quadricepsR', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-black focus:outline-none focus:border-amber-500 transition-colors" />
                 </div>
                 <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">E - Esquerdo (kg)</label>
                    <input type="number" value={measurements.quadricepsL || ''} onChange={(e) => handleValueChange('quadricepsL', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-black focus:outline-none focus:border-amber-500 transition-colors" />
                 </div>
               </div>
            </motion.div>
          )}

          {step === 2 && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-500" /> Flexão de Joelho (Isquiotibiais)
              </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">D - Direito (kg)</label>
                    <input type="number" value={measurements.hamstringsR || ''} onChange={(e) => handleValueChange('hamstringsR', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-black focus:outline-none focus:border-amber-500 transition-colors" />
                 </div>
                 <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">E - Esquerdo (kg)</label>
                    <input type="number" value={measurements.hamstringsL || ''} onChange={(e) => handleValueChange('hamstringsL', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-black focus:outline-none focus:border-amber-500 transition-colors" />
                 </div>
               </div>
            </motion.div>
          )}

          {step === 3 && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" /> Abdução de Quadril
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">D - Direito (kg)</label>
                      <input type="number" value={measurements.hipAbductorsR || ''} onChange={(e) => handleValueChange('hipAbductorsR', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-black focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">E - Esquerdo (kg)</label>
                      <input type="number" value={measurements.hipAbductorsL || ''} onChange={(e) => handleValueChange('hipAbductorsL', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-black focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" /> Adução de Quadril
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">D - Direito (kg)</label>
                      <input type="number" value={measurements.hipAdductorsR || ''} onChange={(e) => handleValueChange('hipAdductorsR', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-black focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">E - Esquerdo (kg)</label>
                      <input type="number" value={measurements.hipAdductorsL || ''} onChange={(e) => handleValueChange('hipAdductorsL', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-black focus:outline-none focus:border-amber-500 transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-amber-500" /> Preensão Manual (Grip)
              </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">D - Direito (kg)</label>
                    <input type="number" value={measurements.gripR || ''} onChange={(e) => handleValueChange('gripR', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-black focus:outline-none focus:border-amber-500 transition-colors" />
                 </div>
                 <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">E - Esquerdo (kg)</label>
                    <input type="number" value={measurements.gripL || ''} onChange={(e) => handleValueChange('gripL', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-white font-black focus:outline-none focus:border-amber-500 transition-colors" />
                 </div>
               </div>
            </motion.div>
          )}
          {step === 5 && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-500" /> Observações Clínicas
              </h3>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-amber-500 transition-colors min-h-[150px] resize-none"
                placeholder="Anote observações sobre dor, compensações ou fadiga durante os testes..."
              />
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900/80 border-slate-700 sticky top-6">
            <CardContent className="p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" /> Resumo de Simetria
              </h3>
              
              <div className="space-y-4">
                {groups.map((group) => {
                  const rightVal = measurements[group.fields[0] as keyof typeof measurements];
                  const leftVal = measurements[group.fields[1] as keyof typeof measurements];
                  const asymmetry = calculateAsymmetry(rightVal, leftVal);
                  
                  return (
                    <div key={group.id} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">{group.label}</span>
                        <span className={asymmetry > 15 ? 'text-rose-400' : asymmetry > 10 ? 'text-amber-400' : 'text-emerald-400'}>
                          {asymmetry}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(asymmetry, 100)}%` }}
                          className={`h-full ${asymmetry > 15 ? 'bg-rose-500' : asymmetry > 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3 h-3 text-amber-400" /> Referência Clínica
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">0-10%: Normal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">10-15%: Atenção</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">&gt;15%: Intervir</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full mt-6 bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-lg shadow-lg shadow-amber-500/20"
              >
                {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Salvar Avaliação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
