import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';

interface TestInfoModalProps {
  title: string;
  indication: string;
  application: string;
  positiveIndicators?: string[]; // Make these optional so they can serve other lists
  negativeIndicators?: string[]; // Make these optional
  referenceValues?: string[];
  deficitGrades?: string[];
  children?: React.ReactNode;
}

export function TestInfoModal({ 
  title, 
  indication, 
  application, 
  positiveIndicators, 
  negativeIndicators, 
  referenceValues,
  deficitGrades,
  children 
}: TestInfoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="inline-flex items-center gap-1.5 cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        {children}
        <Info className="w-3.5 h-3.5 text-cyan-500/50 group-hover:text-cyan-400 transition-colors" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A1120] border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden z-50 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/40">
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Info className="w-5 h-5 text-cyan-500" />
                  {title}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white shrink-0 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                <div>
                  <h4 className="text-xxs font-black text-cyan-500 uppercase tracking-widest mb-2">Indicação</h4>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    {indication}
                  </p>
                </div>

                <div>
                  <h4 className="text-xxs font-black text-cyan-500 uppercase tracking-widest mb-2">Modo de Aplicação</h4>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    {application}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {positiveIndicators && positiveIndicators.length > 0 && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                      <h4 className="text-xxs font-black text-emerald-500 uppercase tracking-widest mb-3">Indicadores Positivos</h4>
                      <ul className="space-y-2">
                        {positiveIndicators.map((item, idx) => (
                          <li key={idx} className="text-sm font-medium text-emerald-100/70 flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {negativeIndicators && negativeIndicators.length > 0 && (
                    <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                      <h4 className="text-xxs font-black text-rose-500 uppercase tracking-widest mb-3">Indicadores Negativos (Falha)</h4>
                      <ul className="space-y-2">
                        {negativeIndicators.map((item, idx) => (
                          <li key={idx} className="text-sm font-medium text-rose-100/70 flex items-start gap-2">
                            <span className="text-rose-500 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {referenceValues && referenceValues.length > 0 && (
                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl md:col-span-2">
                      <h4 className="text-xxs font-black text-blue-500 uppercase tracking-widest mb-3">Valores de Referência</h4>
                      <ul className="space-y-2">
                        {referenceValues.map((item, idx) => (
                          <li key={idx} className="text-sm font-medium text-blue-100/70 flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {deficitGrades && deficitGrades.length > 0 && (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl md:col-span-2">
                      <h4 className="text-xxs font-black text-amber-500 uppercase tracking-widest mb-3">Graus de Déficits</h4>
                      <ul className="space-y-2">
                        {deficitGrades.map((item, idx) => (
                          <li key={idx} className="text-sm font-medium text-amber-100/70 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
