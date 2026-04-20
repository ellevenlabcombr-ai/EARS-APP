"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { testSupabaseConnection, supabaseDebugInfo } from '@/lib/supabase';

export function SupabaseStatus() {
  const [status, setStatus] = useState<{ success: boolean; message: string; details?: string; warning?: boolean } | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const check = async () => {
      setIsChecking(true);
      const result = await testSupabaseConnection();
      setStatus(result);
      setIsChecking(false);
    };
    check();
    
    // Auto-check again every 60 seconds if there's an error
    const interval = setInterval(() => {
      if (!status?.success) check();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [status?.success]);

  if (!isVisible) return null;
  if (isChecking) return null;
  if (status?.success && !status?.warning) return null;

  const isWarning = status?.warning;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md animate-in fade-in slide-in-from-bottom-4">
      <div className={`${isWarning ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/30'} backdrop-blur-md p-4 rounded-2xl shadow-2xl border relative`}>
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
        
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${isWarning ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-rose-500/20 border-rose-500/30 text-rose-400'} rounded-xl flex items-center justify-center border shrink-0`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">
              {isWarning ? 'Aviso do Sistema' : 'Erro de Conexão (Supabase)'}
            </h4>
            <p className={`text-xs ${isWarning ? 'text-amber-200/70' : 'text-rose-200/70'} leading-relaxed mb-2`}>
              {status?.message || 'Não foi possível conectar ao banco de dados.'}
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className={`text-xxs font-black ${isWarning ? 'text-amber-400 hover:text-amber-300' : 'text-rose-400 hover:text-rose-300'} uppercase tracking-widest transition-colors`}
              >
                {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
              </button>
              <button 
                onClick={() => window.location.reload()}
                className={`text-xxs font-black text-white uppercase tracking-widest ${isWarning ? 'bg-amber-500/20 hover:bg-amber-500/30' : 'bg-rose-500/20 hover:bg-rose-500/30'} px-2 py-1 rounded-md transition-colors`}
              >
                Tentar Novamente
              </button>
              
              {supabaseDebugInfo.isPlaceholder && (
                <span className="text-xxs font-black text-rose-500 uppercase tracking-tighter bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 animate-pulse">
                  Configuração Pendente
                </span>
              )}
            </div>
            
            {showDetails && (
              <div className={`mt-3 p-2 bg-black/40 rounded-lg border ${isWarning ? 'border-amber-500/20' : 'border-rose-500/20'}`}>
                <div className="space-y-1">
                  <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Detalhes do Erro:</p>
                  <code className={`text-xxs ${isWarning ? 'text-amber-300/80' : 'text-rose-300/80'} break-all font-mono block`}>
                    {status?.details || 'Nenhum detalhe disponível.'}
                  </code>
                  
                  <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                    <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Estado da Configuração:</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${supabaseDebugInfo.hasUrl ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-xxs text-slate-400 uppercase">URL Presente</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${supabaseDebugInfo.hasKey ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-xxs text-slate-400 uppercase">Key Presente</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${supabaseDebugInfo.isUrlValid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-xxs text-slate-400 uppercase">URL Válida</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${!supabaseDebugInfo.isPlaceholder ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-xxs text-slate-400 uppercase">Não é Placeholder</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
