/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Scale, AlertTriangle, Save, ArrowLeft, Activity, Ruler, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnthropometricAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

interface PerimetryData {
  neck: number;
  shoulders: number;
  chest: number;
  waist: number;
  abdomen: number;
  hip: number;
  rightArmRelaxed: number;
  leftArmRelaxed: number;
  rightArmFlexed: number;
  leftArmFlexed: number;
  rightForearm: number;
  leftForearm: number;
  rightThigh: number;
  leftThigh: number;
  rightCalf: number;
  leftCalf: number;
}

export function AnthropometricAssessmentForm({ athleteId, onCancel, onSave }: AnthropometricAssessmentProps) {
  const [measurements, setMeasurements] = useState<PerimetryData>({
    neck: 40,
    shoulders: 110,
    chest: 100,
    waist: 80,
    abdomen: 85,
    hip: 95,
    rightArmRelaxed: 32,
    leftArmRelaxed: 32,
    rightArmFlexed: 35,
    leftArmFlexed: 35,
    rightForearm: 28,
    leftForearm: 28,
    rightThigh: 55,
    leftThigh: 55,
    rightCalf: 38,
    leftCalf: 38,
  });

  const [score, setScore] = useState(100);
  const [classification, setClassification] = useState({ label: 'Simetria Ideal', color: 'emerald' });
  const [alerts, setAlerts] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({
    whr: 0.84, // Waist to hip ratio
    armAsymmetry: 0,
    thighAsymmetry: 0,
    calfAsymmetry: 0,
  });

  useEffect(() => {
    // 1. Waist to Hip Ratio (Relação Cintura-Quadril)
    const whr = measurements.hip > 0 ? measurements.waist / measurements.hip : 0;
    
    // 2. Asymmetry Calculations (Percentage difference)
    const calcAsymmetry = (right: number, left: number) => {
      if (right === 0 && left === 0) return 0;
      return Number((Math.abs(right - left) / Math.max(right, left) * 100).toFixed(1));
    };

    const armAsymmetry = calcAsymmetry(measurements.rightArmFlexed, measurements.leftArmFlexed);
    const thighAsymmetry = calcAsymmetry(measurements.rightThigh, measurements.leftThigh);
    const calfAsymmetry = calcAsymmetry(measurements.rightCalf, measurements.leftCalf);

    setMetrics({
      whr: Number(whr.toFixed(2)),
      armAsymmetry,
      thighAsymmetry,
      calfAsymmetry
    });

    // Penalties based on Asymmetries and WHR
    let penalty = 0;
    const newAlerts: string[] = [];

    if (armAsymmetry > 5) { penalty += 15; newAlerts.push(`Assimetria de Braço (${armAsymmetry}%)`); }
    else if (armAsymmetry > 2) penalty += 5;

    if (thighAsymmetry > 3) { penalty += 20; newAlerts.push(`Assimetria de Coxa (${thighAsymmetry}%)`); }
    else if (thighAsymmetry > 1.5) penalty += 5;

    if (calfAsymmetry > 3) { penalty += 15; newAlerts.push(`Assimetria de Panturrilha (${calfAsymmetry}%)`); }
    else if (calfAsymmetry > 1.5) penalty += 5;

    // Men WHR > 0.90 is high risk, Women > 0.85 (assuming roughly for general alert here if > 0.9)
    if (whr > 0.9) {
      penalty += 20;
      newAlerts.push(`RCQ Elevado (${whr.toFixed(2)}) - Risco Metabólico`);
    }

    const finalScore = Math.max(0, 100 - penalty);
    setScore(finalScore);

    if (finalScore >= 90) setClassification({ label: 'Simetria Excelente', color: 'emerald' });
    else if (finalScore >= 75) setClassification({ label: 'Boa Simetria', color: 'cyan' });
    else if (finalScore >= 50) setClassification({ label: 'Assimetria Moderada', color: 'amber' });
    else setClassification({ label: 'Assimetria Crítica', color: 'rose' });

    setAlerts(newAlerts);

  }, [measurements]);

  const handleSave = () => {
    onSave({
      type: "Antropométrica",
      score,
      classification: classification.label,
      classification_color: classification.color,
      whr: metrics.whr,
      asymmetries: {
        arm: metrics.armAsymmetry,
        thigh: metrics.thighAsymmetry,
        calf: metrics.calfAsymmetry
      },
      alerts,
      raw_data: { measurements }
    });
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

  const NumberInput = ({ label, value, unit, onChange }: { label: string, value: number, unit: string, onChange: (v: number) => void }) => (
    <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50 flex flex-col justify-between">
      <label className="text-xxs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white font-bold focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 uppercase">{unit}</span>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header & Summary Card */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Button variant="ghost" onClick={onCancel} className="mb-4 text-slate-400 hover:text-white px-0">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Ruler className="w-6 h-6 text-indigo-500" />
            Avaliação Antropométrica
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Perimetria e Simetria Muscular
          </p>
        </div>

        <div className={`p-6 rounded-3xl border flex-1 flex items-center justify-between ${getColorClasses(classification.color)}`}>
          <div>
            <p className="text-xxs font-black uppercase tracking-widest opacity-70 mb-1">Score de Simetria</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{score}</span>
              <span className="text-sm font-bold uppercase tracking-widest opacity-80">{classification.label}</span>
            </div>
            {alerts.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5">
                {alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xxs font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md w-fit border border-rose-500/20">
                    <AlertTriangle className="w-3 h-3" /> {alert}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Activity className="w-12 h-12 opacity-20" />
        </div>
      </div>

      {/* Indices Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">RCQ (Cintura/Quadril)</p>
          <p className={`text-2xl font-black ${metrics.whr < 0.85 ? 'text-emerald-400' : metrics.whr <= 0.9 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.whr}
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Assimetria Braços</p>
          <p className={`text-2xl font-black ${metrics.armAsymmetry <= 2 ? 'text-emerald-400' : metrics.armAsymmetry <= 5 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.armAsymmetry}%
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Assimetria Coxas</p>
          <p className={`text-2xl font-black ${metrics.thighAsymmetry <= 1.5 ? 'text-emerald-400' : metrics.thighAsymmetry <= 3 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.thighAsymmetry}%
          </p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Assimetria Panturrilha</p>
          <p className={`text-2xl font-black ${metrics.calfAsymmetry <= 1.5 ? 'text-emerald-400' : metrics.calfAsymmetry <= 3 ? 'text-amber-400' : 'text-rose-400'}`}>
            {metrics.calfAsymmetry}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tronco */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
             Tronco (cm)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Pescoço" value={measurements.neck} unit="cm" onChange={(v) => setMeasurements({...measurements, neck: v})} />
            <NumberInput label="Ombros" value={measurements.shoulders} unit="cm" onChange={(v) => setMeasurements({...measurements, shoulders: v})} />
            <NumberInput label="Tórax" value={measurements.chest} unit="cm" onChange={(v) => setMeasurements({...measurements, chest: v})} />
            <NumberInput label="Cintura" value={measurements.waist} unit="cm" onChange={(v) => setMeasurements({...measurements, waist: v})} />
            <NumberInput label="Abdome" value={measurements.abdomen} unit="cm" onChange={(v) => setMeasurements({...measurements, abdomen: v})} />
            <NumberInput label="Quadril" value={measurements.hip} unit="cm" onChange={(v) => setMeasurements({...measurements, hip: v})} />
          </div>
        </div>

        {/* Membros */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
            Membros Superiores e Inferiores (cm)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/10 p-3 rounded-2xl border border-slate-800 border-dashed space-y-3">
               <p className="text-xxs font-bold text-slate-500 uppercase text-center mb-2">Lado Direito</p>
               <NumberInput label="Braço Relaxado" value={measurements.rightArmRelaxed} unit="cm" onChange={(v) => setMeasurements({...measurements, rightArmRelaxed: v})} />
               <NumberInput label="Braço Contraído" value={measurements.rightArmFlexed} unit="cm" onChange={(v) => setMeasurements({...measurements, rightArmFlexed: v})} />
               <NumberInput label="Antebraço" value={measurements.rightForearm} unit="cm" onChange={(v) => setMeasurements({...measurements, rightForearm: v})} />
               <NumberInput label="Coxa Medial" value={measurements.rightThigh} unit="cm" onChange={(v) => setMeasurements({...measurements, rightThigh: v})} />
               <NumberInput label="Panturrilha" value={measurements.rightCalf} unit="cm" onChange={(v) => setMeasurements({...measurements, rightCalf: v})} />
            </div>
            
            <div className="bg-slate-900/10 p-3 rounded-2xl border border-slate-800 border-dashed space-y-3">
               <p className="text-xxs font-bold text-slate-500 uppercase text-center mb-2">Lado Esquerdo</p>
               <NumberInput label="Braço Relaxado" value={measurements.leftArmRelaxed} unit="cm" onChange={(v) => setMeasurements({...measurements, leftArmRelaxed: v})} />
               <NumberInput label="Braço Contraído" value={measurements.leftArmFlexed} unit="cm" onChange={(v) => setMeasurements({...measurements, leftArmFlexed: v})} />
               <NumberInput label="Antebraço" value={measurements.leftForearm} unit="cm" onChange={(v) => setMeasurements({...measurements, leftForearm: v})} />
               <NumberInput label="Coxa Medial" value={measurements.leftThigh} unit="cm" onChange={(v) => setMeasurements({...measurements, leftThigh: v})} />
               <NumberInput label="Panturrilha" value={measurements.leftCalf} unit="cm" onChange={(v) => setMeasurements({...measurements, leftCalf: v})} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
        <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white font-bold uppercase text-xxs tracking-widest">
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase text-xxs tracking-widest px-8">
          <Save className="w-4 h-4 mr-2" /> Salvar Avaliação
        </Button>
      </div>
    </motion.div>
  );
}
