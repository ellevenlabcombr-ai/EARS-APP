"use client";

import React, { Component, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * SafeRender: A granular Error Boundary component to protect individual parts of the UI.
 * Standardizes error handling at the component level.
 */
export class SafeRender extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to the console with context
    console.error(`[SafeRender] Error caught in component "${this.props.componentName || 'Unknown'}":`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex flex-col items-center justify-center text-center space-y-2 min-h-[6.25rem]">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">
            Erro no Componente: {this.props.componentName || "Indisponível"}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-xxs text-rose-300 underline hover:text-rose-200"
          >
            Tentar recarregar seção
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
