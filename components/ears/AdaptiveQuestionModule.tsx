
"use client";

import React from 'react';
import { motion } from 'motion/react';

interface Props {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (val: number) => void;
  options?: { value: number; label: string; emoji: string }[];
}

export const AdaptiveQuestionModule: React.FC<Props> = ({ id, label, value, onChange, options }) => {
  const defaultOptions = [
    { value: 1, label: 'Muito Ruim', emoji: '😫' },
    { value: 2, label: 'Ruim', emoji: '🙁' },
    { value: 3, label: 'Normal', emoji: '😐' },
    { value: 4, label: 'Bom', emoji: '🙂' },
    { value: 5, label: 'Excelente', emoji: '🤩' },
  ];

  const currentOptions = options || defaultOptions;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{label}</h3>
      <div className="grid grid-cols-5 gap-2 sm:gap-4">
        {currentOptions.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300
                ${isSelected ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400' : 'bg-slate-900/50 hover:bg-slate-800 border border-slate-800'}
              `}
            >
              <span className="text-2xl sm:text-3xl mb-1">{opt.emoji}</span>
              <span className={`text-xxs font-bold uppercase tracking-tighter ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                {opt.label}
              </span>
              {isSelected && (
                <motion.div
                  layoutId="active-marker"
                  className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
