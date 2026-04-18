"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { 
  Home, 
  Users, 
  ClipboardList, 
  Activity, 
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Moon,
  Stethoscope,
  Globe,
  Calendar,
  AlertCircle,
  CheckCircle,
  User,
  Brain,
  Zap,
  Heart,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { AthleteRegistration } from "./AthleteRegistration";
import { AthleteDashboard } from "./AthleteDashboard";
import { AthleteHealthProfile } from "./AthleteHealthProfile";
import { WellnessDashboard } from "./WellnessDashboard";
import { PhysioDashboard } from "./PhysioDashboard";
import { AthleteList } from "./AthleteList";
import { SleepAssessment } from "./SleepAssessment";
import { OrthopedicAssessment } from "./OrthopedicAssessment";
import BiomechanicalAssessment from "./BiomechanicalAssessment";
import { NeurologicalAssessment } from "./NeurologicalAssessment";
import { PsychologicalAssessment } from "./PsychologicalAssessment";
import { NutritionalAssessmentForm as NutritionalAssessment } from "./NutritionalAssessmentForm";
import { RedSAssessmentForm as RedsAssessment } from "./RedSAssessmentForm";
import { AnthropometricAssessmentForm as AnthropometricAssessment } from "./AnthropometricAssessmentForm";
import { MaturationAssessmentForm as MaturationAssessment } from "./MaturationAssessmentForm";
import { MenstrualAssessmentForm as MenstrualAssessment } from "./MenstrualAssessmentForm";
import { HydrationAssessmentForm as HydrationAssessment } from "./HydrationAssessmentForm";
import FunctionalAssessment from "./FunctionalScreening";
import DynamometryAssessment from "./DynamometryAssessment";
import PhysicalAssessment from "./PhysicalAssessment";
import { ConfirmDialog } from "./ConfirmDialog";
import { getLocalDateString } from "@/lib/utils";
import { DatabaseSeeder } from "./DatabaseSeeder";
import { SmartAgenda } from "./SmartAgenda";
import { PendenciesDashboard } from "./PendenciesDashboard";
import { ClinicalDashboard } from "./dashboard/ClinicalDashboard";
import { DailyOperationsDashboard } from "./dashboard/DailyOperationsDashboard";
import { EaglesDashboard } from "./dashboard/EaglesDashboard";
import { SettingsDashboard } from "./SettingsDashboard";
import { Button } from "@/components/ui/button";
import { SupabaseStatus } from "./SupabaseStatus";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserProfileModal } from "./UserProfileModal";

import { DataSafety } from "@/lib/dataSafety";
import { SafeRender } from "./SafeRender";

type View = 'home' | 'athletes' | 'new-athlete' | 'athlete-profile' | 'evaluations' | 'sleep-assessment' | 'orthopedic-assessment' | 'biomechanical-assessment' | 'neurological-assessment' | 'psychological-assessment' | 'nutritional-assessment' | 'reds-assessment' | 'anthropometric-assessment' | 'maturation-assessment' | 'menstrual-assessment' | 'hydration-assessment' | 'functional-assessment' | 'dynamometry-assessment' | 'physical-assessment' | 'wellness' | 'settings' | 'agenda' | 'pendencies' | 'clinical' | 'eagles';

interface MainDashboardProps {
  onLogout?: () => void;
}

export function MainDashboard({ onLogout }: MainDashboardProps) {
  const { t, language, setLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeMode, setActiveMode] = useState<'home' | 'clinical' | 'eagles'>('home');
  const [modeContext, setModeContext] = useState<Record<string, { view: View, athlete: any }>>({
    home: { view: 'home', athlete: null },
    clinical: { view: 'clinical', athlete: null },
    eagles: { view: 'eagles', athlete: null }
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState<View | 'logout' | null>(null);
  const [editingAthlete, setEditingAthlete] = useState<any>(null);
  const [selectedAthleteForEval, setSelectedAthleteForEval] = useState<any>(null);
  const [athletesList, setAthletesList] = useState<any[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [branding, setBranding] = useState<{logo_url: string | null, company_name: string}>({ logo_url: null, company_name: 'ELLEVEN' });
  const [userProfile, setUserProfile] = useState<{avatar_url: string | null, name: string}>({ avatar_url: null, name: 'Usuário' });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fetchBranding = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('branding_settings')
        .select('logo_url, company_name')
        .single();
      
      if (data) {
        setBranding({
          logo_url: data.logo_url,
          company_name: data.company_name || 'ELLEVEN'
        });
      }
    } catch (err) {
      console.error('Error fetching branding:', err);
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('user_profile_settings')
        .select('avatar_url, name')
        .maybeSingle();
      
      if (data) {
        setUserProfile({
          avatar_url: data.avatar_url,
          name: data.name || 'Usuário'
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, []);

  useEffect(() => {
    fetchBranding();
    fetchUserProfile();
    
    // Listen for branding updates
    const handleBrandingUpdate = () => fetchBranding();
    window.addEventListener('branding-updated', handleBrandingUpdate);
    return () => window.removeEventListener('branding-updated', handleBrandingUpdate);
  }, [fetchBranding, fetchUserProfile]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    
    if (view) {
      setCurrentView(view as View);
    }
  }, []);

  const fetchAthletes = useCallback(async (retryCount = 0) => {
    const controller = new AbortController();
    try {
      if (!supabase) {
        return;
      }
      const { data, error } = await supabase
        .from('athletes')
        .select('id, name')
        .order('name')
        .limit(50)
        .abortSignal(controller.signal);
      
      if (error) {
        if (error.code === '57014' && retryCount < 2) {
          console.warn(`Timeout fetching athletes, retrying... (${retryCount + 1}/2)`);
          // Wait 1s before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchAthletes(retryCount + 1);
        }
        const detailedError = JSON.stringify(error, Object.getOwnPropertyNames(error));
        console.error('Supabase error fetching athletes:', detailedError);
        throw error;
      }
      setAthletesList(DataSafety.getArray(data));
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Error fetching athletes:', error.message || error);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (currentView === 'evaluations') {
      const fetchPromise = fetchAthletes();
      fetchPromise.then(cleanupFn => {
        cleanup = cleanupFn;
      });
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [currentView, fetchAthletes]);

  const saveAssessment = async (table: string, score: number, data: any) => {
    if (!supabase || !selectedAthleteForEval?.id) {
      console.error('Supabase not initialized or no athlete selected');
      return;
    }

    try {
      // Clean data to avoid duplicating column fields in raw_data
      const { classification, classification_color, alerts, ...cleanData } = data;
      const rawDataToSave = data.raw_data || cleanData;

      const { error } = await supabase
        .from(table)
        .insert({
          athlete_id: selectedAthleteForEval.id,
          score: score || 0,
          classification: classification || data.classification || "",
          classification_color: classification_color || data.classification_color || "",
          alerts: alerts || data.alerts || [],
          raw_data: rawDataToSave,
          assessment_date: getLocalDateString()
        });

      if (error) throw error;
      setNotification({ message: 'Avaliação salva com sucesso!', type: 'success' });
    } catch (error: any) {
      console.error(`Error saving to ${table}:`, error);
      setNotification({ message: error.message || 'Erro ao salvar avaliação.', type: 'error' });
      throw error;
    }
  };

  const menuItems = useMemo(() => [
    { id: 'athletes', label: 'Atletas', icon: Users },
    { id: 'wellness', label: 'Wellness', icon: Activity },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ] as const, []);

  const operationalItems = useMemo(() => [
    { id: 'home', label: 'Operação', icon: Home, shortLabel: 'Operação', emoji: '🏠' },
    { id: 'clinical', label: 'Clinical Intelligence', icon: Brain, shortLabel: 'Clinical', emoji: '🧠' },
    { id: 'eagles', label: 'Projeto Águias', icon: Users, shortLabel: 'Águias', emoji: '🦅' },
  ] as const, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    
    // Initial check
    handleResize();
    
    // Check for query parameters to set initial view
    const params = new URLSearchParams(window.location.search);
    if (params.get('view')) {
      const view = params.get('view') as View;
      if (menuItems.some(m => m.id === view)) {
        setCurrentView(view);
      }
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuItems]);

  const handleNavigation = (action: View | 'logout') => {
    if (action === currentView) return;
    
    // Check if it's an operational mode switch
    if (['home', 'clinical', 'eagles'].includes(action)) {
      const mode = action as 'home' | 'clinical' | 'eagles';
      setActiveMode(mode);
      
      // Reset view to the mode's base view
      const targetView = mode === 'home' ? 'home' : mode === 'clinical' ? 'clinical' : 'eagles';
      
      if (isDirty) {
        setPendingAction(targetView);
      } else {
        setEditingAthlete(null);
        executeAction(targetView);
      }
      return;
    }

    if (isDirty) {
      setPendingAction(action);
    } else {
      executeAction(action);
    }
  };

  const executeAction = (action: View | 'logout') => {
    if (action === 'logout') {
      onLogout?.();
    } else {
      setCurrentView(action);
      if (!isDesktop) setIsMobileMenuOpen(false);
    }
    setIsDirty(false);
    setPendingAction(null);
  };

  // Memory of context for each operational mode
  useEffect(() => {
    if (['home', 'clinical', 'eagles', 'athlete-profile', 'evaluations'].includes(currentView)) {
      setModeContext(prev => ({
        ...prev,
        [activeMode]: { 
          view: currentView, 
          athlete: (currentView === 'athlete-profile' || currentView === 'evaluations') ? editingAthlete : null 
        }
      }));
    }
  }, [currentView, editingAthlete, activeMode]);

  const getPageTitle = () => {
    switch (currentView) {
      case 'home': return "Agenda & Operação";
      case 'clinical': return "Clinical Intelligence";
      case 'eagles': return "Projeto Águias";
      case 'agenda': return "Agenda";
      case 'athletes': return "Elenco";
      case 'new-athlete': return "Novo Atleta";
      case 'athlete-profile': return "Perfil do Atleta";
      case 'evaluations': return "Avaliações";
      case 'pendencies': return "Pendências";
      case 'wellness': return "Wellness";
      case 'settings': return "Configurações";
      default: return "Dashboard";
    }
  };

  const renderContent = () => {
    return (
      <SafeRender componentName={`View: ${currentView}`}>
        {(() => {
          switch (currentView) {
            case 'home':
              return (
                <DailyOperationsDashboard 
                  onNavigate={handleNavigation}
                  onViewAthlete={(id) => {
                    setEditingAthlete({ id });
                    handleNavigation('athlete-profile');
                  }} 
                />
              );
            case 'clinical':
              return (
                <ClinicalDashboard onViewAthlete={(id) => {
                  setEditingAthlete({ id });
                  handleNavigation('athlete-profile');
                }} />
              );
            case 'eagles':
              return (
                <EaglesDashboard 
                  onViewAthlete={(id) => {
                    setEditingAthlete({ id });
                    handleNavigation('athlete-profile');
                  }} 
                />
              );
            case 'wellness':
              return <WellnessDashboard onViewAthlete={(athlete) => {
                setEditingAthlete(athlete);
                handleNavigation('athlete-profile');
              }} />;
            case 'agenda':
              return <SmartAgenda />;
            case 'athletes':
              return (
                <AthleteList 
                  onAddAthlete={() => {
                    setEditingAthlete(null);
                    handleNavigation('new-athlete');
                  }}
                  onEditAthlete={(athlete) => {
                    setEditingAthlete(athlete);
                    handleNavigation('new-athlete');
                  }}
                  onViewDashboard={(athlete) => {
                    setEditingAthlete(athlete);
                    handleNavigation('athlete-profile');
                  }}
                />
              );
            case 'new-athlete':
              return (
                <AthleteRegistration 
                  onBack={() => handleNavigation('athletes')} 
                  onDirtyChange={setIsDirty}
                  initialData={editingAthlete}
                  onSave={(updatedAthlete) => {
                    setIsDirty(false);
                    setEditingAthlete(updatedAthlete);
                    executeAction('athletes');
                  }}
                />
              );
            case 'athlete-profile':
              if (editingAthlete) {
                return (
                  <AthleteHealthProfile 
                    athlete={editingAthlete}
                    onBack={() => handleNavigation('athletes')}
                    onSave={(updatedAthlete) => setEditingAthlete(updatedAthlete)}
                  />
                );
              }
              return <AthleteList onAddAthlete={() => handleNavigation('new-athlete')} onEditAthlete={() => {}} onViewDashboard={() => {}} />;
            case 'pendencies':
              return <PendenciesDashboard />;
            case 'evaluations':
              return (
                <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
                  <header className="mb-8">
                    <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">
                      Módulo de Avaliações
                    </h1>
                    <p className="text-slate-400 mt-2">Selecione um atleta e o tipo de avaliação para iniciar.</p>
                  </header>

                  {/* Athlete Selector for Evaluations */}
                  <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 mb-8">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Atleta Selecionado</label>
                    <div className="flex flex-wrap gap-3">
                      <select 
                        className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors min-w-[250px]"
                        onChange={(e) => {
                          const athlete = athletesList.find(a => a.id === e.target.value);
                          setSelectedAthleteForEval(athlete);
                        }}
                        value={selectedAthleteForEval?.id || ""}
                      >
                        <option value="">Selecione um atleta...</option>
                        {athletesList.map(athlete => (
                          <option key={athlete.id} value={athlete.id}>{athlete.name}</option>
                        ))}
                      </select>
                      {selectedAthleteForEval && (
                        <div className="flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-xl border border-cyan-500/20 font-bold text-sm">
                          <Users size={16} /> {selectedAthleteForEval.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 'sleep-assessment', title: 'Sono', icon: Moon, color: 'cyan', desc: 'Qualidade, duração e hábitos de descanso.' },
                      { id: 'orthopedic-assessment', title: 'Ortopédica', icon: Stethoscope, color: 'rose', desc: 'Riscos de lesão e padrões de dor.' },
                      { id: 'biomechanical-assessment', title: 'Biomecânica', icon: Activity, color: 'blue', desc: 'Análise de movimento e técnica.' },
                      { id: 'neurological-assessment', title: 'Neurológica', icon: Zap, color: 'yellow', desc: 'Reflexos, coordenação e controle motor.' },
                      { id: 'psychological-assessment', title: 'Psicológica', icon: Heart, color: 'purple', desc: 'Estado mental e prontidão emocional.' },
                      { id: 'nutritional-assessment', title: 'Nutricional', icon: ClipboardList, color: 'emerald', desc: 'Hábitos alimentares e hidratação.' },
                      { id: 'reds-assessment', title: 'RED-S', icon: AlertCircle, color: 'orange', desc: 'Deficiência energética relativa no esporte.' },
                      { id: 'physical-assessment', title: 'Física', icon: BarChart3, color: 'indigo', desc: 'Força, potência e capacidade aeróbica.' },
                      { id: 'functional-assessment', title: 'Funcional', icon: Activity, color: 'teal', desc: 'FMS e triagem funcional de movimento.' },
                      { id: 'dynamometry-assessment', title: 'Dinamometria', icon: Activity, color: 'cyan', desc: 'Força isométrica e picos de torque.' },
                      { id: 'anthropometric-assessment', title: 'Antropométrica', icon: Users, color: 'slate', desc: 'Medidas corporais e composição.' },
                      { id: 'maturation-assessment', title: 'Maturação', icon: TrendingUp, color: 'amber', desc: 'Estágio de desenvolvimento biológico.' },
                      { id: 'menstrual-assessment', title: 'Menstrual', icon: Heart, color: 'pink', desc: 'Ciclo e impactos na performance.' },
                      { id: 'hydration-assessment', title: 'Hidratação', icon: Globe, color: 'sky', desc: 'Status hídrico e perda de suor.' },
                    ].map((evalType) => (
                      <motion.button
                        key={evalType.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!selectedAthleteForEval}
                        onClick={() => setCurrentView(evalType.id as any)}
                        className={`p-6 bg-[#0A1120] border border-slate-800 rounded-2xl text-left group hover:border-${evalType.color}-500/50 transition-all ${!selectedAthleteForEval ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-12 h-12 bg-${evalType.color}-500/10 rounded-xl flex items-center justify-center text-${evalType.color}-500 mb-4 group-hover:bg-${evalType.color}-500 group-hover:text-[#050B14] transition-all`}>
                          <evalType.icon size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Avaliação {evalType.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {evalType.desc}
                        </p>
                        <div className={`mt-6 flex items-center gap-2 text-${evalType.color}-500 font-bold text-xs uppercase tracking-widest`}>
                          Iniciar Avaliação <ChevronRight size={14} />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            case 'sleep-assessment':
              return (
                <SleepAssessment 
                  athleteName={selectedAthleteForEval?.name}
                  onBack={() => handleNavigation('evaluations')}
                  onSave={async (score, data) => {
                    try {
                      await saveAssessment('sleep_assessments', score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'orthopedic-assessment':
              return (
                <OrthopedicAssessment 
                  athleteName={selectedAthleteForEval?.name}
                  onBack={() => handleNavigation('evaluations')}
                  onSave={async (score, data) => {
                    try {
                      await saveAssessment('orthopedic_assessments', score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'biomechanical-assessment':
              return (
                <BiomechanicalAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('biomechanical_assessments', data.score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'neurological-assessment':
              return (
                <NeurologicalAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('neurological_assessments', data.score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'psychological-assessment':
              return (
                <PsychologicalAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('psychological_assessments', data.score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'nutritional-assessment':
              return (
                <NutritionalAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('nutritional_assessments', data.score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'reds-assessment':
              return (
                <RedsAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('reds_assessments', data.score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'physical-assessment':
              return (
                <PhysicalAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('physical_load_assessments', 0, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'functional-assessment':
              return (
                <FunctionalAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('functional_assessments', data.score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'dynamometry-assessment':
              return (
                <DynamometryAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('dynamometry_assessments', data.score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'anthropometric-assessment':
              return (
                <AnthropometricAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('anthropometric_assessments', data.score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'maturation-assessment':
              return (
                <MaturationAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('maturation_assessments', data.score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'menstrual-assessment':
              return (
                <MenstrualAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('menstrual_assessments', data.score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'hydration-assessment':
              return (
                <HydrationAssessment 
                  athleteId={selectedAthleteForEval?.id}
                  onCancel={() => handleNavigation('evaluations')}
                  onSave={async (data) => {
                    try {
                      await saveAssessment('hydration_assessments', data.score, data);
                      handleNavigation('evaluations');
                    } catch (error) {
                      // Error handled in saveAssessment
                    }
                  }}
                />
              );
            case 'wellness':
              return (
                <WellnessDashboard 
                  onViewAthlete={(athlete) => {
                    setEditingAthlete(athlete);
                    handleNavigation('athlete-profile');
                  }} 
                />
              );
            case 'settings':
              return <SettingsDashboard />;
            default:
              return (
                <div className="flex-1 flex items-center justify-center min-h-screen text-slate-400">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto">
                      {React.createElement(menuItems.find(m => m.id === currentView)?.icon || Home, { className: "w-8 h-8 text-cyan-500" })}
                    </div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest">
                      {menuItems.find(m => m.id === currentView)?.label}
                    </h2>
                    <p>Módulo em desenvolvimento...</p>
                  </div>
                </div>
              );
          }
        })()}
      </SafeRender>
    );
  };

  return (
    <div className="flex h-dvh bg-[#050B14] overflow-hidden font-sans selection:bg-cyan-500/30">
      <SupabaseStatus />
      {/* Mobile Menu Button */}
      {/* Mobile Menu Toggle */}
      <button 
        className="lg:hidden fixed top-[calc(18px+env(safe-area-inset-top))] left-4 z-[100] w-11 h-11 flex items-center justify-center bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 backdrop-blur-md shadow-xl active:scale-95 transition-all"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && !isDesktop && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-[80] lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-[90] w-[88px] bg-[#0A1120] border-r border-slate-800/50 flex flex-col pt-safe pb-safe transition-transform duration-300 lg:translate-x-0 ${!isDesktop && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-slate-800/50 shrink-0">
          {branding.logo_url ? (
            <div className="relative w-12 h-12">
              <Image 
                src={branding.logo_url} 
                alt="Logo" 
                fill 
                className="object-contain"
                unoptimized
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-black text-xl border border-white/10">
              {branding.company_name.charAt(0)}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col justify-center items-center gap-4 py-6 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <React.Fragment key={item.id}>
                {item.id === 'settings' && <div className="w-8 h-px bg-slate-800/50 my-2" />}
                <div className="relative group">
                  <button
                    onClick={() => handleNavigation(item.id as View)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative ${
                      isActive 
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-cyan-400"
                    }`}
                  >
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full"></div>}
                    <Icon size={22} />
                  </button>
                  
                  {/* Simple Tooltip */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[110] border border-slate-700 pointer-events-none">
                    {item.label}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="py-6 border-t border-slate-800/50 shrink-0 flex flex-col items-center gap-4">
          <button 
            onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-800/50 hover:text-cyan-400 transition-all"
            title={language === 'pt' ? 'English' : 'Português'}
          >
            <Globe size={20} />
          </button>

          <button 
            onClick={() => handleNavigation('logout')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 relative overflow-y-auto custom-scrollbar w-full flex flex-col transition-colors duration-500 ${
        activeMode === 'clinical' ? 'bg-[#050B14] shadow-[inset_0_0_100px_rgba(59,130,246,0.05)]' :
        activeMode === 'eagles' ? 'bg-[#050B14] shadow-[inset_0_0_100px_rgba(6,182,212,0.05)]' :
        'bg-[#050B14]'
      }`}>
        {/* Global Header */}
        <header className={`sticky top-0 z-40 h-[calc(80px+env(safe-area-inset-top))] pt-safe backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-5 lg:px-8 shrink-0 transition-colors duration-500 ${
          activeMode === 'clinical' ? 'bg-blue-950/20' :
          activeMode === 'eagles' ? 'bg-cyan-950/20' :
          'bg-[#0A1120]/80'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 lg:hidden"></div>
            <div className="flex items-center gap-3">
              {branding.logo_url ? (
                <div className="relative w-9 h-9">
                  <Image 
                    src={branding.logo_url} 
                    alt="Logo" 
                    fill 
                    className="object-contain"
                    unoptimized
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-base border border-white/10 shadow-lg shadow-white/5">
                  {branding.company_name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Central Operational Menu */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 sm:gap-6 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800/50 backdrop-blur-md max-w-[450px] overflow-x-auto no-scrollbar">
              {operationalItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMode === item.id;
                
                return (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => handleNavigation(item.id as View)}
                      className={`flex items-center gap-2 px-3 sm:px-4 h-11 min-w-[44px] rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${
                        isActive 
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]" 
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <span className="text-lg leading-none">{item.emoji}</span>
                      <span className="hidden md:block">{item.shortLabel}</span>
                    </button>

                    {/* Tooltip for Mobile/Compact */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-slate-800 shadow-2xl pointer-events-none">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex flex-col items-end mr-2">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-50">{getPageTitle()}</h2>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest hidden sm:block">Online</span>
            </div>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors overflow-hidden relative"
            >
              {userProfile.avatar_url ? (
                <Image 
                  src={userProfile.avatar_url} 
                  alt="Avatar" 
                  fill 
                  className="object-cover"
                  unoptimized
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={16} />
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 max-w-[1280px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={pendingAction !== null}
        onConfirm={() => pendingAction && executeAction(pendingAction)}
        onCancel={() => setPendingAction(null)}
      />

      <UserProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={fetchUserProfile}
      />
    </div>
  );
}
