"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Future integration point for Sentry or other logs
    // Sentry.captureException(error, { extra: errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#0A1120] border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-500 mb-6 border border-rose-500/20">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                Ops! Algo deu errado
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ocorreu um erro inesperado na aplicação. Nossa equipe técnica já foi notificada (simulação).
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 p-4 rounded-xl text-left overflow-auto max-h-40 border border-slate-800">
                <p className="text-rose-400 font-mono text-xs mb-2">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="text-slate-500 font-mono text-xxs leading-tight">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={this.handleReset}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-6 rounded-2xl gap-2 shadow-[0_0_20px_rgba(8,145,178,0.3)]"
              >
                <RefreshCw size={18} /> Tentar Novamente
              </Button>
              
              <Button 
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full border-slate-800 text-slate-400 hover:bg-slate-800 font-bold py-6 rounded-2xl gap-2"
              >
                <Home size={18} /> Voltar para o Início
              </Button>
            </div>
            
            <p className="text-xxs text-slate-600 font-medium uppercase tracking-[0.2em]">
              ERR_CODE: CLIENT_RENDER_EXCEPTION
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
