 
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Stethoscope, 
  ChevronRight, 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Activity,
  History,
  Target,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TestInfoModal } from "@/components/TestInfoModal";

import { supabase } from "@/lib/supabase";

interface RegionPain {
  present: boolean;
  intensity: number;
  side: 'left' | 'right' | 'bilateral';
  type: 'Acute' | 'Chronic' | 'Recurrent';
  onset: 'Sudden' | 'Progressive';
  worseWithTraining: boolean;
  improvesWithRest: boolean;
  previousInjury: boolean;
  recurrence: boolean;
  timeAway: number; // weeks
  mechanism: 'Trauma direto' | 'Torção' | 'Sobrecarga' | 'Sem causa aparente';
  symptoms: string[];
  rom: 'Normal' | 'Limitada' | 'Muito Limitada';
  strength: number; // 0 to 5
  specialTests: Record<string, string>;
  previousTreatments: string[];
}

const BODY_REGIONS = [
  'Pescoço/Cervical', 'Costas/Tórax', 'Lombar', 'Ombro', 'Cotovelo', 'Punho/Mão', 'Quadril/Pelve', 'Joelho', 'Tornozelo/Pé'
] as const;

type BodyRegion = typeof BODY_REGIONS[number];

const SYMPTOM_OPTIONS = ['Estalo', 'Falseio', 'Travamento', 'Edema', 'Formigamento', 'Queimação', 'Irradiação', 'Fraqueza', 'Rigidez Matinal'];
const TREATMENT_OPTIONS = ['Fisioterapia', 'Cirurgia', 'Infiltração', 'Medicação', 'Acupuntura', 'Repouso', 'Gelo', 'Órtese/Kinesio'];

const ORTHOPEDIC_TESTS: Record<string, string[]> = {
  'Ombro': ['Neer', 'Hawkins-Kennedy', 'Jobe', 'Apprehension', 'Speed', 'Yergason'],
  'Joelho': ['Lachman', 'Gaveta Anterior', 'Gaveta Posterior', 'Pivot Shift', 'McMurray', 'Apley', 'Estresse em Valgo', 'Estresse em Varo'],
  'Tornozelo/Pé': ['Gaveta Anterior', 'Gaveta Posterior', 'Talar Tilt (Inversão)', 'Squeeze', 'Thompson'],
  'Quadril/Pelve': ['Thomas', 'Patrick (FABER)', 'FADIR', 'Ober', 'Trendelenburg'],
  'Lombar': ['Slump Test', 'Lasègue (SLR)', 'Schober'],
  'Pescoço/Cervical': ['Spurling', 'Distração'],
  'Cotovelo': ['Cozen', 'Mill', 'Golfer'],
  'Punho/Mão': ['Finkelstein', 'Phalen', 'Tinel'],
  'Costas/Tórax': ['Adam'] // Just a placeholder if needed
};

const CLINICAL_PATTERNS = [
  'Assimetria',
  'Baixo controle motor',
  'Compensação de movimento',
  'Dor mecânica',
  'Sobrecarga provável'
];

const SQUAT_ISSUES = ['Valgo dinâmico de joelho', 'Inclinação excessiva de tronco', 'Assimetria lateral', 'Elevação de calcanhar'];
const JUMP_ISSUES = ['Rigidez na aterrissagem', 'Déficit de controle de joelho', 'Assimetria', 'Instabilidade'];
const BALANCE_ISSUES = ['Oscilação excessiva', 'Perda de controle', 'Déficit proprioceptivo'];
const CORE_ISSUES = ['Incapacidade de manter prancha', 'Dor lombar', 'Rotação pélvica excessiva', 'Fraqueza abdominal'];

interface OrthopedicAssessmentProps {
  athleteId: string;
  athleteName?: string;
  onBack: () => void;
  onSave: (score: number, data: any) => void;
}

export function OrthopedicAssessment({ athleteId, athleteName, onBack, onSave }: OrthopedicAssessmentProps) {
  const [activeRegions, setActiveRegions] = useState<Partial<Record<BodyRegion, RegionPain>>>({});
  const [functionalImpact, setFunctionalImpact] = useState({
    training: 0,
    competition: 0,
    dailyActivities: false
  });
  const [functionalTests, setFunctionalTests] = useState({
    squat: 10,
    squatIssues: [] as string[],
    jump: 10,
    jumpIssues: [] as string[],
    balance: 10,
    balanceIssues: [] as string[],
    core: 10,
    coreIssues: [] as string[]
  });
  const [clinicalPatterns, setClinicalPatterns] = useState<string[]>([]);
  const [pgals, setPgals] = useState({
    cervical: 'Normal',
    ombros: 'Normal',
    colunaToracoLombar: 'Normal',
    quadril: 'Normal',
    joelhos: 'Normal',
    tornozelos: 'Normal'
  });
  const [showPgals, setShowPgals] = useState(false);

  const [maturationStatus, setMaturationStatus] = useState<string | null>(null);
  const [hasMaturationError, setHasMaturationError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'screening' | 'symptoms' | 'functional'>('history');
  const [history, setHistory] = useState({
    previousInjuries: false,
    injuryDetails: '',
    timeAwayFromSport: '',
    hypermobility: false,
    beightonScore: 0
  });

  useEffect(() => {
    async function fetchMaturation() {
      if (!athleteId || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('maturation_assessments')
          .select('growth_status, assessment_date')
          .eq('athlete_id', athleteId)
          .order('assessment_date', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          setHasMaturationError(true);
          return;
        }

        const assessmentDate = new Date(data.assessment_date);
        const daysSince = Math.floor((new Date().getTime() - assessmentDate.getTime()) / (1000 * 3600 * 24));
        
        if (daysSince > 90) {
          setHasMaturationError(true);
        } else {
          // Map Maturation
          let mapped = "Pré-puberal";
          if (data.growth_status === 'Circa-PHV') mapped = "Em crescimento acelerado";
          if (data.growth_status === 'Post-PHV') mapped = "Pós-puberal";
          setMaturationStatus(mapped);
          setHasMaturationError(false);
        }
      } catch (err) {
        console.error(err);
        setHasMaturationError(true);
      }
    }
    fetchMaturation();
  }, [athleteId]);

  const toggleRegion = (region: BodyRegion) => {
    setActiveRegions(prev => {
      const newRegions = { ...prev };
      if (newRegions[region]) {
        delete newRegions[region];
      } else {
        newRegions[region] = {
          present: true,
          intensity: 0,
          side: 'bilateral',
          type: 'Acute',
          onset: 'Sudden',
          worseWithTraining: false,
          improvesWithRest: true,
          previousInjury: false,
          recurrence: false,
          timeAway: 0,
          mechanism: 'Sem causa aparente',
          symptoms: [],
          rom: 'Normal',
          strength: 5,
          specialTests: {},
          previousTreatments: []
        };
      }
      return newRegions;
    });
  };

  const updateRegion = (region: BodyRegion, updates: Partial<RegionPain>) => {
    setActiveRegions(prev => ({
      ...prev,
      [region]: { ...prev[region]!, ...updates }
    }));
  };

  const assessmentResults = useMemo(() => {
    const regions = Object.values(activeRegions);
    const painIntensityMax = regions.length > 0 
      ? Math.max(...regions.map(r => r.intensity)) 
      : 0;
    
    const avgFunctionalImpact = (functionalImpact.training + functionalImpact.competition) / 2;
    const movementQuality = (functionalTests.squat + functionalTests.jump + functionalTests.balance) / 3;
    
    let injuryHistoryScore = 10;
    if (regions.some(r => r.recurrence)) {
      injuryHistoryScore = 3;
    } else if (regions.some(r => r.previousInjury)) {
      injuryHistoryScore = 6;
    }

    const pgalsAltered = Object.values(pgals).some(v => v === 'Alterado');
    const effectiveClinicalPatterns = [...clinicalPatterns];
    if (pgalsAltered && !effectiveClinicalPatterns.includes('Possível alteração estrutural')) {
      effectiveClinicalPatterns.push('Possível alteração estrutural');
    }

    const baseScore = (
      ((10 - painIntensityMax) * 0.4) +
      ((10 - avgFunctionalImpact) * 0.3) +
      (movementQuality * 0.2) +
      (injuryHistoryScore * 0.1)
    ) * 10;

    // Apply penalty to avoid "Falso 100" if clinical patterns exist
    const clinicalPenalty = effectiveClinicalPatterns.length * 2;
    const score = Math.max(0, Math.min(100, baseScore - clinicalPenalty));

    let statusFuncional = 'Estável';
    const hasPain = painIntensityMax > 0;
    
    if (painIntensityMax >= 5 && avgFunctionalImpact > 5) {
      statusFuncional = 'Alto risco';
    } else if (maturationStatus === 'Em crescimento acelerado' && (effectiveClinicalPatterns.includes('Assimetria') || effectiveClinicalPatterns.includes('Baixo controle motor'))) {
      statusFuncional = 'Em risco';
    } else if (effectiveClinicalPatterns.length >= 2) {
      statusFuncional = 'Em adaptação';
    } else if (effectiveClinicalPatterns.length === 0 && avgFunctionalImpact === 0 && !hasPain) {
      statusFuncional = 'Estável';
    } else {
      // Fallbacks se não encaixar perfeitamente acima
      if (score < 60 || painIntensityMax >= 7) statusFuncional = 'Alto risco';
      else if (score < 80) statusFuncional = 'Em risco';
      else if (effectiveClinicalPatterns.length === 1 || avgFunctionalImpact > 0 || hasPain) statusFuncional = 'Em adaptação';
      else statusFuncional = 'Estável';
    }

    // Pediatric Patterns
    const isAcceleratedGrowth = maturationStatus === 'Em crescimento acelerado';
    const hasKneePain = activeRegions['Joelho']?.present;
    const hasFootAnklePain = activeRegions['Tornozelo/Pé']?.present;
    const hasFunctionalImpact = avgFunctionalImpact > 0;

    const pediatricPatterns: string[] = [];

    if (hasKneePain && isAcceleratedGrowth && hasFunctionalImpact) {
      pediatricPatterns.push("Possível sobrecarga em tuberosidade tibial (padrão compatível com Osgood-Schlatter)");
    }
    if (hasFootAnklePain && isAcceleratedGrowth) {
      pediatricPatterns.push("Possível sobrecarga calcânea (padrão compatível com Sever)");
    }
    if ((effectiveClinicalPatterns.includes('Assimetria') || effectiveClinicalPatterns.includes('Baixo controle motor')) && hasFunctionalImpact) {
      pediatricPatterns.push("Possível sobrecarga mecânica por padrão de movimento");
    }
    if (isAcceleratedGrowth && effectiveClinicalPatterns.length > 0) {
      pediatricPatterns.push("Fase de crescimento associada a maior vulnerabilidade musculoesquelética");
    }

    // Ações Recomendadas
    let action = 'Manter treino atual, Monitoramento periódico';
    if (statusFuncional === 'Alto risco') {
      action = 'Suspensão parcial de carga, Intervenção direcionada, Reavaliação prioritária';
    } else if (statusFuncional === 'Em risco') {
      action = 'Redução de carga, Treino de estabilidade, Monitoramento próximo';
    } else if (statusFuncional === 'Em adaptação') {
      action = 'Foco em controle motor, Ajustes leves de carga';
    }

    if (pediatricPatterns.length > 0) {
      action += ', Ajuste de carga esportiva, Monitoramento de dor por crescimento, Intervenção preventiva direcionada';
    }

    let color = 'text-emerald-400';
    let bgColor = 'bg-emerald-500/10';
    if (statusFuncional === 'Alto risco') {
      color = 'text-rose-400'; bgColor = 'bg-rose-500/10';
    } else if (statusFuncional === 'Em risco') {
      color = 'text-orange-400'; bgColor = 'bg-orange-500/10';
    } else if (statusFuncional === 'Em adaptação') {
      color = 'text-amber-400'; bgColor = 'bg-amber-500/10';
    }

    // Interpretação Clínica Automática
    const achadoPrincipal = effectiveClinicalPatterns.length > 0 ? effectiveClinicalPatterns.join(', ').toLowerCase() : (hasPain ? 'dor sem padrão motor alterado' : 'função neuromuscular preservada');
    
    let integracao = isAcceleratedGrowth ? 'Associado à fase de crescimento acelerado' : 'Compatível com maturação atual';
    if (pgalsAltered) integracao += ' com achados de alteração estrutural no screening pGALS';

    let interpretation = `Achado principal: ${achadoPrincipal}\nIntegração: ${integracao}`;
    if (pediatricPatterns.length > 0) {
      interpretation += `\nPadrão pediátrico: ${pediatricPatterns.join('; ')}`;
    }
    interpretation += `\nNível de risco: ${statusFuncional.toLowerCase()}`;

    return {
      score: Math.round(score),
      painIntensityMax,
      avgFunctionalImpact,
      movementQuality,
      classification: statusFuncional,
      interpretation,
      action,
      color,
      bgColor,
      highestPainRegion: regions.length > 0 
        ? Object.entries(activeRegions).sort((a, b) => b[1]!.intensity - a[1]!.intensity)[0][0]
        : null
    };
  }, [activeRegions, functionalImpact, functionalTests, clinicalPatterns, maturationStatus, pgals]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await onSave(assessmentResults.score, {
      activeRegions,
      functionalImpact,
      functionalTests,
      clinicalPatterns,
      maturationStatus,
      results: assessmentResults
    });
    
    setShowSuccess(true);
    setIsSaving(false);
    
    setTimeout(() => {
      setShowSuccess(false);
      onBack();
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#050B14] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-4 sm:px-8 bg-[#0A1120]/80 backdrop-blur-xl shrink-0 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white mr-1 sm:mr-2 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
          <TestInfoModal
            title="Avaliação Ortopédica"
            indication="Rastreamento de dores, histórico de lesões e testes de restrição de mobilidade/força para prevenção secundária."
            application="Oleta relata histórico de lesões e dores atuais via mapa. Testes clínicos básicos (adm, dor palpação) podem ser integrados."
            referenceValues={["Score > 80: Sem restrições", "Score 60-79: Limitações leves", "Score < 60: Atenção clínica necessária"]}
            deficitGrades={["Leve (apenas sintomas durante o esporte)", "Moderado (sintomas limitam o esporte)", "Severo (dor em repouso / atv diárias)"]}
          >
            <span className="text-slate-400 text-xxs sm:text-sm font-bold uppercase tracking-wider hidden xs:inline hover:text-cyan-400 transition-colors">Avaliação Ortopédica</span>
          </TestInfoModal>
            <ChevronRight size={14} className="text-slate-600 hidden xs:inline shrink-0" />
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-widest text-cyan-400 truncate">
              {athleteName || 'Atleta'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {activeTab === 'functional' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-4"
              >
                <div className="hidden md:flex flex-col items-end mr-4">
                  <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Score Ortopédico</span>
                  <span className={`text-2xl font-black ${assessmentResults.color}`}>
                    {assessmentResults.score}/100
                  </span>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaving || showSuccess}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black uppercase tracking-widest text-xxs sm:text-sm transition-all shadow-lg flex items-center gap-2 ${
                    showSuccess 
                      ? "bg-emerald-500 text-[#050B14]" 
                      : "bg-cyan-500 hover:bg-cyan-400 text-[#050B14] shadow-cyan-500/20"
                  } disabled:opacity-50`}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-[#050B14]/30 border-t-[#050B14] rounded-full animate-spin"></div>
                  ) : showSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{showSuccess ? 'Salvo!' : 'Finalizar'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
          
          {/* Score Summary Card moved to the bottom of the assessment */}

          {/* Navigation Tabs (Progress Steps Style) */}
          <div className="flex items-center justify-start md:justify-between gap-4 md:gap-0 overflow-x-auto no-scrollbar px-4 mb-4 py-4 w-full max-w-4xl mx-auto">
            {[
              { id: 'history', label: 'Histórico', icon: History },
              { id: 'screening', label: 'Triagem (pGALS)', icon: Activity },
              { id: 'symptoms', label: 'Quadro de Dor', icon: Target },
              { id: 'functional', label: 'Função', icon: Stethoscope },
            ].map((tab, i, arr) => {
               const activeIndex = arr.findIndex(t => t.id === activeTab);
               const isActive = activeTab === tab.id;
               return (
                 <React.Fragment key={tab.id}>
                   <div 
                     className={`flex flex-col items-center gap-2 cursor-pointer transition-all shrink-0 ${isActive ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
                     onClick={() => setActiveTab(tab.id as any)}
                   >
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-slate-700 bg-slate-900 text-slate-500'}`}>
                       <tab.icon className="w-4 h-4" />
                     </div>
                     <span className={`text-[0.6rem] md:text-xs font-black uppercase tracking-widest text-center max-w-[5rem] md:max-w-[7rem] leading-tight mt-1 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>{tab.label}</span>
                   </div>
                   {i < arr.length - 1 && (
                     <div className={`w-8 md:flex-1 h-[2px] shrink-0 mb-8 mx-2 ${activeIndex > i ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
                   )}
                 </React.Fragment>
               );
            })}
          </div>

          <div className="space-y-8">
            {activeTab === 'history' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <section className="space-y-4">
                  <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <div className="w-2 h-6 bg-cyan-500 rounded-full"></div>
                    1. Histórico de Lesões
                  </h2>
                  <Card className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl space-y-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-bold text-white uppercase tracking-widest block mb-1">Lesão Prévia?</label>
                          <span className="text-xs text-slate-400">Lesões anteriores são o maior fator de risco para recidivas.</span>
                        </div>
                        <button
                          onClick={() => setHistory(prev => ({ ...prev, previousInjuries: !prev.previousInjuries }))}
                          className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${history.previousInjuries ? 'bg-cyan-500' : 'bg-slate-700'}`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-white transition-transform ${history.previousInjuries ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {history.previousInjuries && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-slate-800/50">
                          <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Detalhes da lesão prévia (Local, tipo)</label>
                            <textarea
                              value={history.injuryDetails}
                              onChange={e => setHistory(prev => ({ ...prev, injuryDetails: e.target.value }))}
                              placeholder="Ex: Entorse de tornozelo direito grau 2..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 min-h-[80px]"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Tempo de afastamento estimado no passado</label>
                            <input
                              type="text"
                              value={history.timeAwayFromSport}
                              onChange={e => setHistory(prev => ({ ...prev, timeAwayFromSport: e.target.value }))}
                              placeholder="Ex: 4 semanas"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </section>
              </div>
            )}

            {activeTab === 'screening' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* 0. Screening Musculoesquelético Pediátrico (pGALS) */}
                <section className="space-y-4">
                  <button 
                    onClick={() => setShowPgals(!showPgals)}
              className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-900/80 rounded-2xl border border-slate-800/80 transition-colors"
            >
              <h2 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-3">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                Screening Musculoesquelético Pediátrico (pGALS)
              </h2>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full">
                {showPgals ? "Ocultar" : "Opcional"}
              </span>
            </button>
            <AnimatePresence>
              {showPgals && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {[
                        { key: 'cervical', label: 'Coluna Cervical', desc: 'Movimento livre e sem dor' },
                        { key: 'ombros', label: 'Ombros', desc: 'Elevação bilateral / simetria' },
                        { key: 'colunaToracoLombar', label: 'Coluna Torácica e Lombar', desc: 'Flexão / extensão / alinhamento' },
                        { key: 'quadril', label: 'Quadril', desc: 'Mobilidade e simetria' },
                        { key: 'joelhos', label: 'Joelhos', desc: 'Alinhamento / dor / controle' },
                        { key: 'tornozelos', label: 'Tornozelos / Pés', desc: 'Mobilidade / apoio / dor' }
                      ].map(item => (
                        <div key={item.key} className="space-y-2 border border-slate-800/50 p-4 rounded-2xl bg-slate-900/30">
                          <p className="text-xs font-black text-white uppercase tracking-widest">{item.label}</p>
                          <p className="text-xxs text-slate-500 font-bold uppercase tracking-wider">{item.desc}</p>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => setPgals(prev => ({ ...prev, [item.key]: 'Normal' }))}
                              className={`flex-1 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-widest transition-colors ${
                                pgals[item.key as keyof typeof pgals] === 'Normal' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-slate-900 text-slate-500 border border-slate-800'
                              }`}
                            >Normal</button>
                            <button
                              onClick={() => setPgals(prev => ({ ...prev, [item.key]: 'Alterado' }))}
                              className={`flex-1 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-widest transition-colors ${
                                pgals[item.key as keyof typeof pgals] === 'Alterado' 
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                                  : 'bg-slate-900 text-slate-500 border border-slate-800'
                              }`}
                            >Alterado</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            
            <section className="space-y-4">
              <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                2. Hipermobilidade (Score de Beighton)
              </h2>
              <Card className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-bold text-white uppercase tracking-widest block mb-1">Apresenta Hipermobilidade Articular?</label>
                      <span className="text-xs text-slate-400">Avaliação baseada no Escore de Beighton (0-9).</span>
                    </div>
                    <button
                      onClick={() => setHistory(prev => ({ ...prev, hypermobility: !prev.hypermobility }))}
                      className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${history.hypermobility ? 'bg-purple-500' : 'bg-slate-700'}`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform ${history.hypermobility ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {history.hypermobility && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-slate-800/50">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Escore de Beighton</label>
                          <span className="text-sm font-black text-purple-400">{history.beightonScore}/9</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="9"
                          step="1"
                          value={history.beightonScore}
                          onChange={e => setHistory(prev => ({ ...prev, beightonScore: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <p className="text-xxs text-slate-500 uppercase mt-2 hidden sm:block">
                          Polegares(2) | Dedos Mínimos(2) | Cotovelos(2) | Joelhos(2) | Tronco(1)
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Card>
            </section>
          </section>
          </div>
          )}

          {activeTab === 'symptoms' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

          {/* 2. Pain Mapping */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-2 h-6 bg-cyan-500 rounded-full"></div>
              2. Mapeamento de Dor
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {BODY_REGIONS.map(region => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`p-4 rounded-2xl border transition-all text-center space-y-2 ${
                    activeRegions[region] 
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]" 
                      : "bg-[#0A1120] border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xxs font-black uppercase tracking-widest block">{region}</span>
                  {activeRegions[region] && (
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                      <span className="text-xxs font-bold">Ativo</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* 3. Pain Characteristics */}
          <AnimatePresence>
            {Object.keys(activeRegions).length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-6 bg-rose-500 rounded-full"></div>
                  3. Características da Dor
                </h2>
                
                <div className="space-y-4">
                  {Object.entries(activeRegions).map(([region, data]) => (
                    <Card key={region} className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-800/50 pb-4">
                        <h3 className="text-md font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Stethoscope size={18} className="text-rose-500" />
                          {region}
                        </h3>
                        <div className="flex items-center gap-2">
                          {['left', 'right', 'bilateral'].map(side => (
                            <button
                              key={side}
                              onClick={() => updateRegion(region as BodyRegion, { side: side as any })}
                              className={`px-3 py-1 rounded-full text-xxs font-black uppercase tracking-widest transition-all ${
                                data!.side === side ? "bg-cyan-500 text-[#050B14]" : "bg-slate-800 text-slate-500"
                              }`}
                            >
                              {side === 'left' ? 'Esq' : side === 'right' ? 'Dir' : 'Bilat'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between mb-2">
                              <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Intensidade (0-10)</label>
                              <span className="text-sm font-black text-rose-400">{data!.intensity}</span>
                            </div>
                            <input 
                              type="range" min="0" max="10" step="1"
                              value={data!.intensity}
                              onChange={(e) => updateRegion(region as BodyRegion, { intensity: parseInt(e.target.value) })}
                              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Tipo</label>
                              <select 
                                value={data!.type}
                                onChange={(e) => updateRegion(region as BodyRegion, { type: e.target.value as any })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                              >
                                <option value="Acute">Aguda</option>
                                <option value="Chronic">Crônica</option>
                                <option value="Recurrent">Recorrente</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Início</label>
                              <select 
                                value={data!.onset}
                                onChange={(e) => updateRegion(region as BodyRegion, { onset: e.target.value as any })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                              >
                                <option value="Sudden">Súbito</option>
                                <option value="Progressive">Progressivo</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Mecanismo de Lesão</label>
                            <select 
                              value={data!.mechanism}
                              onChange={(e) => updateRegion(region as BodyRegion, { mechanism: e.target.value as any })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                            >
                              <option value="Sem causa aparente">Sem causa aparente</option>
                              <option value="Trauma direto">Trauma direto</option>
                              <option value="Torção">Torção</option>
                              <option value="Sobrecarga">Sobrecarga</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Sintomas Associados</label>
                            <div className="flex flex-wrap gap-2">
                              {SYMPTOM_OPTIONS.map(symptom => (
                                <button
                                  key={symptom}
                                  onClick={() => {
                                    const newSymptoms = data!.symptoms.includes(symptom)
                                      ? data!.symptoms.filter(s => s !== symptom)
                                      : [...data!.symptoms, symptom];
                                    updateRegion(region as BodyRegion, { symptoms: newSymptoms });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all ${
                                    data!.symptoms.includes(symptom)
                                      ? "bg-rose-500 text-white"
                                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                  }`}
                                >
                                  {symptom}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              onClick={() => updateRegion(region as BodyRegion, { worseWithTraining: !data!.worseWithTraining })}
                              className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${
                                data!.worseWithTraining ? "bg-rose-500/10 border-rose-500 text-rose-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
                              }`}
                            >
                              <span className="text-xxs font-black uppercase tracking-widest block">Piora no Treino?</span>
                              <span className="text-xs font-bold">{data!.worseWithTraining ? 'Sim' : 'Não'}</span>
                            </button>
                            <button
                              onClick={() => updateRegion(region as BodyRegion, { improvesWithRest: !data!.improvesWithRest })}
                              className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${
                                data!.improvesWithRest ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
                              }`}
                            >
                              <span className="text-xxs font-black uppercase tracking-widest block">Melhora no Repouso?</span>
                              <span className="text-xs font-bold">{data!.improvesWithRest ? 'Sim' : 'Não'}</span>
                            </button>
                            <button
                              onClick={() => updateRegion(region as BodyRegion, { previousInjury: !data!.previousInjury })}
                              className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${
                                data!.previousInjury ? "bg-amber-500/10 border-amber-500 text-amber-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
                              }`}
                            >
                              <span className="text-xxs font-black uppercase tracking-widest block">Lesão Anterior?</span>
                              <span className="text-xs font-bold">{data!.previousInjury ? 'Sim' : 'Não'}</span>
                            </button>
                            <button
                              onClick={() => updateRegion(region as BodyRegion, { recurrence: !data!.recurrence })}
                              className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${
                                data!.recurrence ? "bg-rose-500/10 border-rose-500 text-rose-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
                              }`}
                            >
                              <span className="text-xxs font-black uppercase tracking-widest block">Recorrência?</span>
                              <span className="text-xs font-bold">{data!.recurrence ? 'Sim' : 'Não'}</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">ADM (Amplitude)</label>
                              <select 
                                value={data!.rom}
                                onChange={(e) => updateRegion(region as BodyRegion, { rom: e.target.value as any })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                              >
                                <option value="Normal">Normal</option>
                                <option value="Limitada">Limitada</option>
                                <option value="Muito Limitada">Muito Limitada</option>
                              </select>
                            </div>
                            <div>
                              <div className="flex justify-between mb-2">
                                <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Força (0-5)</label>
                                <span className="text-xs font-black text-cyan-400">{data!.strength}</span>
                              </div>
                              <input 
                                type="range" min="0" max="5" step="1"
                                value={data!.strength}
                                onChange={(e) => updateRegion(region as BodyRegion, { strength: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                              />
                            </div>
                          </div>

                          {ORTHOPEDIC_TESTS[region] && ORTHOPEDIC_TESTS[region].length > 0 && (
                            <div>
                              <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Testes Ortopédicos Especiais</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {ORTHOPEDIC_TESTS[region].map(test => {
                                  // @ts-ignore Let's type-cast specialTests to Record<string,string>
                                  const status = (data!.specialTests && data!.specialTests[test]) || 'Não Realizado';
                                  return (
                                    <div key={test} className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{test}</span>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => {
                                            const current = data!.specialTests || {};
                                            updateRegion(region as BodyRegion, { specialTests: { ...current, [test]: 'Positivo' } });
                                          }}
                                          className={`flex-1 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-widest transition-all ${
                                            status === 'Positivo' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-950 text-slate-500 border border-slate-800 hover:bg-slate-900'
                                          }`}
                                        >Positivo</button>
                                        <button
                                          onClick={() => {
                                            const current = data!.specialTests || {};
                                            updateRegion(region as BodyRegion, { specialTests: { ...current, [test]: 'Negativo' } });
                                          }}
                                          className={`flex-1 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-widest transition-all ${
                                            status === 'Negativo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500 border border-slate-800 hover:bg-slate-900'
                                          }`}
                                        >Negativo</button>
                                        <button
                                          onClick={() => {
                                            const current = data!.specialTests || {};
                                            updateRegion(region as BodyRegion, { specialTests: { ...current, [test]: 'Dor' } });
                                          }}
                                          className={`flex-1 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-widest transition-all ${
                                            status === 'Dor' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-950 text-slate-500 border border-slate-800 hover:bg-slate-900'
                                          }`}
                                        >Dor</button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-2">Tratamentos Prévios</label>
                            <div className="flex flex-wrap gap-2">
                              {TREATMENT_OPTIONS.map(treatment => (
                                <button
                                  key={treatment}
                                  onClick={() => {
                                    const newTreatments = data!.previousTreatments.includes(treatment)
                                      ? data!.previousTreatments.filter(t => t !== treatment)
                                      : [...data!.previousTreatments, treatment];
                                    updateRegion(region as BodyRegion, { previousTreatments: newTreatments });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all ${
                                    data!.previousTreatments.includes(treatment)
                                      ? "bg-cyan-500 text-[#050B14]"
                                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                  }`}
                                >
                                  {treatment}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* 4. Functional Impact */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
              4. Impacto Funcional
            </h2>
            <Card className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Impacto no Treino (0-10)</label>
                      <span className="text-sm font-black text-amber-400">{functionalImpact.training}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={functionalImpact.training}
                      onChange={(e) => setFunctionalImpact(prev => ({ ...prev, training: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Impacto na Competição (0-10)</label>
                      <span className="text-sm font-black text-amber-400">{functionalImpact.competition}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={functionalImpact.competition}
                      onChange={(e) => setFunctionalImpact(prev => ({ ...prev, competition: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setFunctionalImpact(prev => ({ ...prev, dailyActivities: !prev.dailyActivities }))}
                    className={`w-full p-6 rounded-2xl border transition-all flex items-center justify-between ${
                      functionalImpact.dailyActivities ? "bg-rose-500/10 border-rose-500 text-rose-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${functionalImpact.dailyActivities ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                        <AlertCircle size={24} />
                      </div>
                      <div className="text-left">
                        <span className="text-xxs font-black uppercase tracking-widest block">Limitação em Atividades Diárias?</span>
                        <span className="text-sm font-bold">Dificuldade em tarefas comuns do dia a dia</span>
                      </div>
                    </div>
                    <span className="text-lg font-black">{functionalImpact.dailyActivities ? 'Sim' : 'Não'}</span>
                  </button>
                </div>
              </div>
            </Card>
          </section>
          </div>
          )}

          {activeTab === 'functional' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* 5. Functional Tests */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
              3. Testes Funcionais (Screening)
            </h2>
            <Card className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-4 border border-slate-800 p-4 rounded-2xl bg-slate-900/30">
                  <div className="space-y-2">
                    <div className="flex justify-between mb-2">
                      <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Qualidade do Agachamento</label>
                      <span className="text-sm font-black text-emerald-400">{functionalTests.squat}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={functionalTests.squat}
                      onChange={(e) => setFunctionalTests(prev => ({ ...prev, squat: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className="text-xxs text-slate-500 uppercase font-bold text-center">Controle motor e estabilidade</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-800/50">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest px-1">Padrões Identificados:</span>
                    <div className="flex flex-col gap-2">
                      {SQUAT_ISSUES.map(issue => (
                        <label key={issue} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={functionalTests.squatIssues.includes(issue)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFunctionalTests(prev => ({
                                ...prev,
                                squatIssues: checked ? [...prev.squatIssues, issue] : prev.squatIssues.filter(i => i !== issue)
                              }));
                            }}
                            className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-800"
                          />
                          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors uppercase font-bold tracking-wider">{issue}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border border-slate-800 p-4 rounded-2xl bg-slate-900/30">
                  <div className="space-y-2">
                    <div className="flex justify-between mb-2">
                      <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Controle de Salto</label>
                      <span className="text-sm font-black text-emerald-400">{functionalTests.jump}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={functionalTests.jump}
                      onChange={(e) => setFunctionalTests(prev => ({ ...prev, jump: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className="text-xxs text-slate-500 uppercase font-bold text-center">Aterrissagem e absorção de impacto</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-800/50">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest px-1">Padrões Identificados:</span>
                    <div className="flex flex-col gap-2">
                      {JUMP_ISSUES.map(issue => (
                        <label key={issue} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={functionalTests.jumpIssues.includes(issue)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFunctionalTests(prev => ({
                                ...prev,
                                jumpIssues: checked ? [...prev.jumpIssues, issue] : prev.jumpIssues.filter(i => i !== issue)
                              }));
                            }}
                            className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-800"
                          />
                          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors uppercase font-bold tracking-wider">{issue}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border border-slate-800 p-4 rounded-2xl bg-slate-900/30">
                  <div className="space-y-2">
                    <div className="flex justify-between mb-2">
                      <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Equilíbrio / Estabilidade</label>
                      <span className="text-sm font-black text-emerald-400">{functionalTests.balance}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={functionalTests.balance}
                      onChange={(e) => setFunctionalTests(prev => ({ ...prev, balance: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className="text-xxs text-slate-500 uppercase font-bold text-center">Propriocepção e controle postural</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-800/50">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest px-1">Padrões Identificados:</span>
                    <div className="flex flex-col gap-2">
                      {BALANCE_ISSUES.map(issue => (
                        <label key={issue} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={functionalTests.balanceIssues.includes(issue)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFunctionalTests(prev => ({
                                ...prev,
                                balanceIssues: checked ? [...prev.balanceIssues, issue] : prev.balanceIssues.filter(i => i !== issue)
                              }));
                            }}
                            className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-800"
                          />
                          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors uppercase font-bold tracking-wider">{issue}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border border-slate-800 p-4 rounded-2xl bg-slate-900/30">
                  <div className="space-y-2">
                    <div className="flex justify-between mb-2">
                      <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Controle de Core</label>
                      <span className="text-sm font-black text-emerald-400">{functionalTests.core}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="1"
                      value={functionalTests.core}
                      onChange={(e) => setFunctionalTests(prev => ({ ...prev, core: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <p className="text-xxs text-slate-500 uppercase font-bold text-center">Força e estabilidade central</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-800/50">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest px-1">Padrões Identificados:</span>
                    <div className="flex flex-col gap-2">
                      {CORE_ISSUES.map(issue => (
                        <label key={issue} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={functionalTests.coreIssues.includes(issue)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFunctionalTests(prev => ({
                                ...prev,
                                coreIssues: checked ? [...prev.coreIssues, issue] : prev.coreIssues.filter(i => i !== issue)
                              }));
                            }}
                            className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 bg-slate-800"
                          />
                          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors uppercase font-bold tracking-wider">{issue}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* 4. Clinical Patterns */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
              4. Padrão Clínico Identificado
            </h2>
            <Card className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl">
              <div className="flex flex-wrap gap-3">
                {CLINICAL_PATTERNS.map(pattern => (
                  <button
                    key={pattern}
                    onClick={() => {
                      setClinicalPatterns(prev => 
                        prev.includes(pattern) ? prev.filter(p => p !== pattern) : [...prev, pattern]
                      )
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      clinicalPatterns.includes(pattern)
                        ? "bg-purple-500/20 border-purple-500 text-purple-400"
                        : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                    }`}
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            </Card>
          </section>

          {/* Score Summary Card */}
          <section className="space-y-4 pt-4">
            <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
              <div className="w-2 h-6 bg-cyan-500 rounded-full"></div>
              Resultado da Avaliação
            </h2>
            <Card className="bg-[#0A1120] border-slate-800 p-6 rounded-3xl overflow-hidden relative">
              <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl font-black uppercase tracking-widest text-xs ${assessmentResults.bgColor} ${assessmentResults.color}`}>
                {assessmentResults.classification}
              </div>

              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 flex flex-col gap-1">
                  <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Maturação Biológica</span>
                  {maturationStatus ? (
                    <span className="text-sm font-black text-cyan-400">{maturationStatus}</span>
                  ) : (
                    <span className="text-sm font-bold text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Avaliação não encontrada ou desatualizada (&gt;90 dias)
                    </span>
                  )}
                </div>
                <div className={`p-4 rounded-xl border flex flex-col gap-1 ${assessmentResults.bgColor} border-current/20`}>
                  <span className="text-xxs font-bold uppercase tracking-widest opacity-70" style={{ color: "inherit" }}>Status Funcional</span>
                  <span className={`text-sm font-black ${assessmentResults.color}`}>{assessmentResults.classification}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                  <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-2">Ortho Score</span>
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-800"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 - (364.4 * (assessmentResults.score || 0)) / 100}
                        className={`${assessmentResults.color} transition-all duration-1000`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-black ${assessmentResults.color}`}>{assessmentResults.score}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Info size={16} className="text-cyan-500" />
                      Interpretação Clínica
                    </h3>
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {assessmentResults.interpretation}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/50">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Activity size={16} className="text-cyan-500" />
                      Ações Recomendadas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {assessmentResults.action.split(',').map((act, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-xxs font-bold text-slate-300 uppercase tracking-wider">
                          {act.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>
          </div>
          )}

          </div>

        </div>
      </div>
    </div>
  );
}
