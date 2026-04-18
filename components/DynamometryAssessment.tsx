"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Dumbbell,
  BarChart3,
  Info,
  ArrowRightLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

  const handleSave = () => {
    onSave({
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
      type: 'dynamometry'
    });
  };

  const groups = [
    { id: 'quadriceps', label: 'Extensão de Joelho (Quadríceps)', fields: ['quadricepsR', 'quadricepsL'] },
    { id: 'hamstrings', label: 'Flexão de Joelho (Isquiotibiais)', fields: ['hamstringsR', 'hamstringsL'] },
    { id: 'hipAbductors', label: 'Abdução de Quadril', fields: ['hipAbductorsR', 'hipAbductorsL'] },
    { id: 'hipAdductors', label: 'Adução de Quadril', fields: ['hipAdductorsR', 'hipAdductorsL'] },
    { id: 'grip', label: 'Preensão Manual (Grip)', fields: ['gripR', 'gripL'] }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Dinamometria (K-Force)</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avaliação de Força Isométrica e Simetria</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {groups.map((group) => {
            const rightVal = measurements[group.fields[0] as keyof typeof measurements];
            const leftVal = measurements[group.fields[1] as keyof typeof measurements];
            const asymmetry = calculateAsymmetry(rightVal, leftVal);
            
            return (
              <Card key={group.id} className="bg-slate-900/40 border-slate-800/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black text-white uppercase tracking-widest flex items-center justify-between">
                    {group.label}
                    {asymmetry > 15 && (
                      <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <AlertCircle className="w-3 h-3" /> Assimetria Crítica
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Direito (kg)</label>
                    <input 
                      type="number" 
                      value={rightVal || ''}
                      onChange={(e) => handleValueChange(group.fields[0], e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
                      placeholder="00.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Esquerdo (kg)</label>
                    <input 
                      type="number" 
                      value={leftVal || ''}
                      onChange={(e) => handleValueChange(group.fields[1], e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
                      placeholder="00.0"
                    />
                  </div>
                  <div className="flex flex-col justify-center items-center bg-slate-950/50 rounded-2xl border border-slate-800/50 p-3">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Assimetria</p>
                    <div className={`text-xl font-black ${asymmetry > 15 ? 'text-rose-400' : asymmetry > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {asymmetry}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card className="bg-slate-900/40 border-slate-800/50">
            <CardHeader>
              <CardTitle className="text-[10px] font-black text-white uppercase tracking-widest">Observações Clínicas</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors min-h-[100px] resize-none text-sm"
                placeholder="Anote observações sobre dor, compensações ou fadiga durante os testes..."
              />
            </CardContent>
          </Card>
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
                        <span className="text-slate-400">{group.label.split('(')[0]}</span>
                        <span className={asymmetry > 15 ? 'text-rose-400' : asymmetry > 10 ? 'text-amber-400' : 'text-emerald-400'}>
                          {asymmetry}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">0-10%: Normal / Simétrico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">10-15%: Atenção / Monitorar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">&gt;15%: Risco / Intervir</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSave}
                className="w-full mt-8 bg-amber-500 hover:bg-amber-600 text-[#050B14] font-black uppercase text-[10px] tracking-widest py-6 rounded-xl shadow-lg shadow-amber-500/20"
              >
                <Save className="w-4 h-4 mr-2" /> Salvar Avaliação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
