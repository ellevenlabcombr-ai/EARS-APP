
"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Activity, Thermometer, Brain, Zap, AlertCircle, Droplets, Footprints, Bandage } from 'lucide-react';

interface Symptom {
  id: string;
  label: string;
  emoji: string;
  icon: any;
  severity: 'light' | 'moderate' | 'severe';
}

const SYMPTOMS: Symptom[] = [
  { id: 'fever', label: 'Febre', emoji: '🤒', icon: Thermometer, severity: 'severe' },
  { id: 'headache', label: 'Dor de Cabeça', emoji: '🤕', icon: AlertCircle, severity: 'moderate' },
  { id: 'nausea', label: 'Náusea', emoji: '🤢', icon: Activity, severity: 'moderate' },
  { id: 'dizziness', label: 'Tontura', emoji: '😵‍💫', icon: Brain, severity: 'moderate' },
  { id: 'flu_symptoms', label: 'Gripe / Resfriado', emoji: '🤧', icon: Zap, severity: 'severe' },
  { id: 'skin_injury', label: 'Lesão de Pele', emoji: '🩹', icon: Bandage, severity: 'light' },
  { id: 'blisters', label: 'Bolhas', emoji: '🦶', icon: Footprints, severity: 'light' },
  { id: 'ingrown_nail', label: 'Unha Encravada', emoji: '🩸', icon: Droplets, severity: 'light' },
];

interface Props {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export const ClinicalSymptomsModule: React.FC<Props> = ({ selected, onChange }) => {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Sintomas Clínicos</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SYMPTOMS.map((s) => {
          const isSelected = selected.includes(s.id);
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`
                flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300
                ${isSelected 
                  ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'}
              `}
            >
              <div className={`p-2 rounded-xl ${isSelected ? 'bg-rose-500/20' : 'bg-slate-800'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xxs font-black uppercase tracking-tight">{s.label}</p>
                <span className="text-xs">{s.emoji}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
