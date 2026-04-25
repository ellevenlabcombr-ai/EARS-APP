"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Stethoscope, ArrowRight, Lock, Mail, ChevronRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Role = 'admin' | 'athlete';

interface LoginScreenProps {
  onLogin: (role: Role, athleteData?: any) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setIsLoading(true);
    setError(null);

    try {
      if (selectedRole === 'admin') {
        // Simple hardcoded admin login for now
        if ((email === 'admin@ears.com' || email.toLowerCase() === 'cris') && password === 'Cj#46765821') {
          if (rememberMe) {
            localStorage.setItem('ears_session', JSON.stringify({
              role: 'admin',
              timestamp: new Date().getTime()
            }));
          }
          onLogin('admin');
        } else {
          setError('Credenciais de administrador inválidas.');
        }
      } else {
        // Real athlete login from Supabase
        if (!supabase) {
          setError('Erro de conexão com o banco de dados.');
          return;
        }

        // Try to find by email or athlete_code
        const isCode = /^\d+$/.test(email);
        
        let query = supabase
          .from('athletes')
          .select('id, gender')
          .eq('password', password);

        if (isCode) {
          query = query.eq('athlete_code', email);
        } else {
          query = query.eq('email', email);
        }

        const { data, error: dbError } = await query.maybeSingle();

        if (dbError) throw dbError;

        if (data) {
          // Cache for offline usage
          const cachedUsers = JSON.parse(localStorage.getItem('ears_offline_credentials') || '{}');
          cachedUsers[`${email}_${password}`] = data;
          localStorage.setItem('ears_offline_credentials', JSON.stringify(cachedUsers));

          if (rememberMe) {
            localStorage.setItem('ears_session', JSON.stringify({
              role: 'athlete',
              athleteData: data,
              timestamp: new Date().getTime()
            }));
          }
          onLogin('athlete', data);
        } else {
          setError('Credenciais incorretas.');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Try offline login fallback
      const errorStr = (err?.message || err?.toString() || JSON.stringify(err) || '').toLowerCase();
      const isOfflineStatus = !navigator.onLine || errorStr.includes('failed to fetch') || errorStr.includes('network') || errorStr === '{}' || errorStr === '[object object]';
      
      const cachedUsers = JSON.parse(localStorage.getItem('ears_offline_credentials') || '{}');
      const cachedData = cachedUsers[`${email}_${password}`];
      
      if (cachedData && isOfflineStatus) {
        if (rememberMe) {
          localStorage.setItem('ears_session', JSON.stringify({
            role: 'athlete',
            athleteData: cachedData,
            timestamp: new Date().getTime()
          }));
        }
        onLogin('athlete', cachedData);
      } else {
        if (isOfflineStatus && !cachedData) {
           setError('Sem conexão de internet e credenciais não encontradas para acesso offline. Você precisa fazer login com internet pelo menos uma vez.');
        } else {
           setError('Credenciais incorretas ou erro de servidor.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#050B14] flex flex-col items-center justify-center p-6 pt-safe font-sans relative overflow-hidden selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[7.5rem] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[7.5rem] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 flex items-center justify-center gap-3">
            EARS <span className="text-cyan-500">|</span> ELLEVEN
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
            Electronic Athlete Readiness System
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedRole ? (
            <motion.div 
              key="role-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <h2 className="text-center text-slate-300 font-medium mb-6">Selecione seu tipo de acesso:</h2>
              
              <button
                onClick={() => setSelectedRole('athlete')}
                className="w-full group relative bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 text-left overflow-hidden transition-all duration-300 flex items-center gap-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 bg-[#050B14] rounded-xl flex items-center justify-center border border-slate-800 group-hover:border-cyan-500/30 transition-colors shrink-0">
                  <Activity className="w-7 h-7 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Sou Atleta</h3>
                  <p className="text-sm text-slate-400">Acessar questionário e métricas</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </button>

              <button
                onClick={() => setSelectedRole('admin')}
                className="w-full group relative bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 text-left overflow-hidden transition-all duration-300 flex items-center gap-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-14 h-14 bg-[#050B14] rounded-xl flex items-center justify-center border border-slate-800 group-hover:border-emerald-500/30 transition-colors shrink-0">
                  <Stethoscope className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Sou Administrador</h3>
                  <p className="text-sm text-slate-400">Gestão clínica e dashboard</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="login-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedRole(null)}
                className="text-slate-400 hover:text-white text-sm font-medium mb-6 flex items-center transition-colors"
              >
                ← Voltar
              </button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${selectedRole === 'athlete' ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                  {selectedRole === 'athlete' ? <Activity className="w-6 h-6 text-cyan-400" /> : <Stethoscope className="w-6 h-6 text-emerald-400" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                    {selectedRole === 'athlete' ? 'Portal da Atleta' : 'Administração'}
                  </h2>
                  <p className="text-sm text-slate-400">Faça login para continuar</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {selectedRole === 'athlete' ? 'E-mail ou Código' : 'E-mail'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-[#050B14] border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-${selectedRole === 'athlete' ? 'cyan' : 'emerald'}-500 transition-colors`}
                      placeholder={selectedRole === 'athlete' ? "E-mail ou Código (Ex: 11001)" : "E-mail ou Usuário (Ex: Cris)"}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full bg-[#050B14] border border-slate-700 rounded-xl pl-11 pr-12 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-${selectedRole === 'athlete' ? 'cyan' : 'emerald'}-500 transition-colors`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${
                        rememberMe 
                          ? (selectedRole === 'athlete' ? 'bg-cyan-500 border-cyan-500' : 'bg-emerald-500 border-emerald-500') 
                          : 'border-slate-700 bg-slate-800/50 group-hover:border-slate-600'
                      }`}>
                        {rememberMe && <ArrowRight className="w-3.5 h-3.5 text-[#050B14] rotate-[-45deg]" />}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                      Mantenha-me logado
                    </span>
                  </label>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-3 text-rose-400 text-xs font-bold"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-8 disabled:opacity-50 ${
                    selectedRole === 'athlete' 
                      ? "bg-cyan-500 hover:bg-cyan-400 text-[#050B14] shadow-cyan-500/20" 
                      : "bg-emerald-500 hover:bg-emerald-400 text-[#050B14] shadow-emerald-500/20"
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#050B14]/30 border-t-[#050B14] rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Entrar <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
