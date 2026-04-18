'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only access window on the client
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;

    // Use a small delay or microtask to avoid "cascading renders" warning.
    setTimeout(() => {
      setIsIOS(isIOSDevice);
      setIsStandalone(isStandaloneMode);
    }, 0);

    // If not installed and is iOS, we might want to show a hint
    if (isIOSDevice && !isStandaloneMode) {
      // Only show after a short delay so it's not too aggressive
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Handle Android/Desktop install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-3 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
            <Download className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Instalar EARS</h3>
            <p className="text-xs text-slate-400">Acesso rápido e offline</p>
          </div>
        </div>
        <button 
          onClick={() => setShowPrompt(false)}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isIOS ? (
        <div className="bg-slate-950/50 rounded-xl p-3 text-xs text-slate-300 flex flex-col gap-2">
          <p>Para instalar no seu iPhone/iPad:</p>
          <ol className="list-decimal list-inside space-y-1 ml-1">
            <li>Abra este link no <strong>Safari</strong></li>
            <li className="flex items-center gap-1">
              Toque no botão Compartilhar <Share className="w-3 h-3 inline" />
            </li>
            <li>Selecione <strong>Adicionar à Tela de Início</strong></li>
          </ol>
        </div>
      ) : (
        <Button 
          onClick={handleInstallClick}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
        >
          Instalar Aplicativo
        </Button>
      )}
    </div>
  );
}
