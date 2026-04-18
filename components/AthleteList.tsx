"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { supabase, supabaseDebugInfo } from "@/lib/supabase";
import { Athlete as DbAthlete } from "@/types/database";
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreVertical, 
  Activity, 
  Calendar, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  TrendingUp,
  MapPin,
  Phone,
  X,
  User,
  Users,
  Info,
  Wand2,
  RefreshCcw,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface AthleteListProps {
  onAddAthlete: () => void;
  onEditAthlete: (athlete: DbAthlete) => void;
  onViewDashboard: (athlete: DbAthlete) => void;
}

// Separate component for rendering avatars
const AthleteAvatar = ({ avatarUrl, name }: { avatarUrl: string | null, name: string }) => {
  if (!avatarUrl) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <User className="w-16 h-16 text-slate-700 opacity-50" />
      </div>
    );
  }

  return (
    <Image 
      src={avatarUrl} 
      alt={name} 
      fill 
      className="object-cover object-top" 
      referrerPolicy="no-referrer"
      unoptimized
    />
  );
};

export function AthleteList({ onAddAthlete, onEditAthlete, onViewDashboard }: AthleteListProps) {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedAthleteForInfo, setSelectedAthleteForInfo] = useState<DbAthlete | null>(null);
  const [athletes, setAthletes] = useState<DbAthlete[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAthletes = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      if (!supabase) {
        const msg = 'Supabase client not initialized in AthleteList';
        console.error(msg);
        setError(msg);
        return;
      }

      console.log('Fetching athletes from Supabase (optimized query)...');
      
      const { data, error: fetchError } = await supabase
        .from('athletes')
        .select(`
          id, 
          name, 
          nickname,
          athlete_code, 
          category, 
          posicao, 
          modalidade,
          birth_date,
          status, 
          group_name, 
          avatar_url,
          created_at,
          risk_level,
          readiness_score
        `)
        .order('name');

      if (fetchError) {
        console.error('Supabase fetch error details:', fetchError);
        if (fetchError.code === '57014' && retryCount < 2) {
          console.warn(`Timeout fetching athletes, retrying... (${retryCount + 1}/2)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchAthletes(retryCount + 1);
        }
        const detailedError = `Supabase fetch error: ${JSON.stringify(fetchError, Object.getOwnPropertyNames(fetchError))}`;
        console.error(detailedError);
        setError(detailedError);
        throw fetchError;
      }

      if (data) {
        setAthletes(data);
        
        // Extract unique categories and groups
        const uniqueCategories = Array.from(new Set(data.map(a => a.category).filter(Boolean))) as string[];
        const uniqueGroups = Array.from(new Set(data.map(a => a.group_name).filter(Boolean))) as string[];
        
        setCategories(uniqueCategories.sort());
        setGroups(uniqueGroups.sort());
      }
    } catch (err: any) {
      const errorMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.error('CRITICAL ERROR fetching athletes:', errorMsg);
      setError(`Erro ao carregar atletas: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAthletes();
    setIsClient(true);
  }, [fetchAthletes]);

  const filteredAthletes = athletes.filter(athlete => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch = 
      athlete.name.toLowerCase().includes(normalizedSearch) || 
      (athlete.nickname && athlete.nickname.toLowerCase().includes(normalizedSearch)) ||
      (athlete.athlete_code && athlete.athlete_code.toLowerCase().includes(normalizedSearch));
    
    const matchesStatus = filterStatus === "all" || athlete.status === filterStatus;
    const matchesCategory = filterCategory === "all" || athlete.category === filterCategory;
    const matchesGroup = filterGroup === "all" || athlete.group_name === filterGroup;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesGroup;
  });

  const getStatusConfig = (status: string | undefined) => {
    switch (status) {
      case 'Apto':
      case 'Apto com Restrição':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: ShieldCheck };
      case 'Transição':
      case 'Reabilitação':
        return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: TrendingUp };
      case 'DM':
      case 'Departamento Médico':
        return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: Stethoscope };
      default:
        return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Activity };
    }
  };

  const getRiskConfig = (risk: string | undefined) => {
    switch (risk) {
      case 'Crítico':
        return { color: 'text-white', bg: 'bg-rose-600', icon: AlertCircle };
      case 'Alto':
        return { color: 'text-rose-400', bg: 'bg-rose-500/20', icon: AlertCircle };
      case 'Médio':
        return { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: AlertTriangle };
      default:
        return null;
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#050B14] text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-4 sm:px-8 bg-[#0A1120]/80 backdrop-blur-xl shrink-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3 pl-12 lg:pl-0 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-widest leading-none truncate">Elenco</h1>
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1 truncate">Gestão de Atletas</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar atleta, apelido ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/50 border border-slate-700/50 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 w-64 transition-all"
            />
          </div>
          <Button 
            variant="outline"
            onClick={fetchAthletes}
            disabled={isLoading}
            className="border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 font-black uppercase tracking-widest text-[10px] sm:text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-2"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline">Atualizar</span>
          </Button>
          <Button 
            onClick={onAddAthlete}
            className="bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase tracking-widest text-[10px] sm:text-xs px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1 sm:gap-2"
          >
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Novo Atleta</span>
            <span className="xs:hidden">Novo</span>
          </Button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="px-6 py-4 bg-[#0A1120]/40 border-b border-slate-800/30 flex flex-wrap items-center gap-4 shrink-0">
        <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
          {['all', 'Apto', 'Transição', 'DM'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filterStatus === status 
                  ? "bg-slate-700 text-white shadow-lg" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {status === 'all' ? 'Todos' : status}
            </button>
          ))}
        </div>
        
        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Projeto:</span>
          <select 
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="bg-transparent text-[10px] font-bold text-slate-300 uppercase tracking-widest focus:outline-none cursor-pointer"
          >
            <option value="all">Todos</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoria:</span>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent text-[10px] font-bold text-slate-300 uppercase tracking-widest focus:outline-none cursor-pointer"
          >
            <option value="all">Todas</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {(filterStatus !== 'all' || filterGroup !== 'all' || filterCategory !== 'all' || searchTerm !== '') && (
          <button 
            onClick={() => {
              setFilterStatus('all');
              setFilterGroup('all');
              setFilterCategory('all');
              setSearchTerm('');
            }}
            className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors ml-auto"
          >
            <X size={12} />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="text-xs font-bold uppercase tracking-wider">
              <p>{error}</p>
              <button 
                onClick={fetchAthletes}
                className="mt-2 text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p className="font-bold uppercase tracking-widest text-sm">Carregando atletas...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAthletes.map((athlete) => {
                const statusCfg = getStatusConfig(athlete.status as any);
                const StatusIcon = statusCfg.icon;
                
                return (
                  <div
                    key={athlete.id}
                    className="group relative bg-[#0A1120] border border-slate-800/50 rounded-3xl hover:border-cyan-500/50 transition-all shadow-2xl overflow-hidden flex flex-col"
                  >
                    {/* Photo Section - Clickable */}
                    <div 
                      className="relative w-full aspect-[4/5] cursor-pointer overflow-hidden bg-slate-900"
                      onClick={() => onViewDashboard(athlete)}
                    >
                      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                        <AthleteAvatar avatarUrl={athlete.avatar_url || null} name={athlete.name} />
                      </div>
                      
                      {/* Cinematic Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/5 shadow-lg ${statusCfg.bg} ${statusCfg.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{athlete.status}</span>
                        </div>
                        
                        {athlete.risk_level && athlete.risk_level !== 'Baixo' && (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/5 shadow-lg ${getRiskConfig(athlete.risk_level)?.bg} ${getRiskConfig(athlete.risk_level)?.color}`}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Risco {athlete.risk_level}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedAthleteForInfo(athlete); }}
                          className="p-2 bg-[#0A1120]/80 backdrop-blur-md border border-white/10 rounded-xl text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors shadow-lg"
                          title="Ver Informações"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEditAthlete(athlete); }}
                          className="p-2 bg-[#0A1120]/80 backdrop-blur-md border border-white/10 rounded-xl text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors shadow-lg"
                          title="Editar Cadastro"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Name & Info (Bottom of Photo) */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        {athlete.athlete_code && (
                          <div className="inline-flex items-center mb-2 px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest backdrop-blur-sm">
                            #{athlete.athlete_code}
                          </div>
                        )}
                        <h3 className="font-black text-white text-2xl leading-tight group-hover:text-cyan-400 transition-colors uppercase tracking-tight flex items-center gap-2 drop-shadow-lg">
                          {athlete.name}
                          {athlete.group_name && athlete.group_name.toUpperCase().includes('AGUIA') && (
                            <span className="text-xl" title="Projeto Águias">🦅</span>
                          )}
                        </h3>
                        <p className="text-[11px] font-bold text-cyan-500/80 uppercase tracking-widest mt-1 drop-shadow-md">
                          {athlete.posicao || 'Atleta'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Details Section */}
                    <div className="p-5 flex flex-col gap-4 bg-[#050B14] relative z-10 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
                            <Calendar className="w-3 h-3 text-slate-500" />
                          </div>
                          <span className="truncate">{athlete.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
                            <Activity className="w-3 h-3 text-slate-500" />
                          </div>
                          <span className="truncate">{athlete.modalidade || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
                            <Users className="w-3 h-3 text-slate-500" />
                          </div>
                          <span className="truncate text-cyan-500/80">{athlete.group_name || 'Sem Projeto'}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => onViewDashboard(athlete)}
                        className="w-full py-3.5 bg-slate-900 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-cyan-400 transition-all flex items-center justify-center gap-2 group/btn shadow-inner"
                      >
                        Acessar Dashboard
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAthletes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-20 h-20 rounded-full bg-slate-900/50 flex items-center justify-center mb-4 border border-slate-800">
                  <Search className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-bold uppercase tracking-widest text-sm">Nenhum atleta encontrado</p>
                <p className="text-xs mt-1">Tente ajustar seus filtros ou busca</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Athlete Info Modal */}
      <AnimatePresence>
        {selectedAthleteForInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAthleteForInfo(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A1120] border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <User className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-widest">Informações da Atleta</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Dados Cadastrais</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAthleteForInfo(null)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-xl shrink-0 relative">
                    {selectedAthleteForInfo.avatar_url ? (
                      <Image 
                        src={selectedAthleteForInfo.avatar_url} 
                        alt={selectedAthleteForInfo.name} 
                        fill 
                        className="object-cover" 
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <User className="w-10 h-10 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate">
                      {selectedAthleteForInfo.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-cyan-400 font-bold uppercase tracking-[0.2em] text-xs">
                        {selectedAthleteForInfo.group_name || 'Sem Projeto'}
                      </p>
                      {selectedAthleteForInfo.athlete_code && (
                        <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          #{selectedAthleteForInfo.athlete_code}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoria</p>
                    <p className="text-sm font-bold text-slate-200 uppercase">{selectedAthleteForInfo.category}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Posição</p>
                    <p className="text-sm font-bold text-slate-200 uppercase">{selectedAthleteForInfo.posicao || 'Atleta'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status Atual</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusConfig(selectedAthleteForInfo.status as any).bg.replace('/10', '')}`}></div>
                      <span className={`text-sm font-black uppercase tracking-wider ${getStatusConfig(selectedAthleteForInfo.status as any).color}`}>
                        {selectedAthleteForInfo.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Modalidade</p>
                    <p className="text-sm font-bold text-slate-200 uppercase">
                      {selectedAthleteForInfo.modalidade === 'Volleyball' && language === 'pt' ? 'Vôlei' : (selectedAthleteForInfo.modalidade || '-')}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data de Cadastro</p>
                    <p className="text-sm font-bold text-slate-200 uppercase">
                      {isClient && selectedAthleteForInfo.created_at ? new Date(selectedAthleteForInfo.created_at).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-900/20 border-t border-slate-800/50 flex gap-3">
                <Button
                  onClick={() => {
                    onEditAthlete(selectedAthleteForInfo);
                    setSelectedAthleteForInfo(null);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-xs py-6 rounded-2xl border border-slate-700 transition-all"
                >
                  Editar Cadastro
                </Button>
                <Button
                  onClick={() => {
                    onViewDashboard(selectedAthleteForInfo);
                    setSelectedAthleteForInfo(null);
                  }}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase tracking-widest text-xs py-6 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Ver Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
