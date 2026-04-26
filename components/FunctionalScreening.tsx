"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Accessibility,
  CheckCircle2, 
  AlertCircle, 
  Save, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Activity,
  AlertTriangle,
  Zap,
  Target,
  ShieldCheck,
  RotateCcw,
  MoveUpRight,
  ArrowsUpFromLine,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestInfoModal } from '@/components/TestInfoModal';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';

interface FunctionalScreeningProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

type ScoreValue = 0 | 1 | 2 | 3;

interface TestScore {
  left?: number;
  right?: number;
  score: number;
  compensations: string[];
}

interface ClearingTest {
  pain: boolean; // true = pain, false = no pain
}

export default function FunctionalScreening({ athleteId, onCancel, onSave }: FunctionalScreeningProps) {
  const [step, setStep] = useState(1);
  const [scores, setScores] = useState<Record<string, TestScore>>({
    deep_squat: { score: 3, compensations: [] },
    hurdle_step: { left: 3, right: 3, score: 3, compensations: [] },
    inline_lunge: { left: 3, right: 3, score: 3, compensations: [] },
    shoulder_mobility: { left: 3, right: 3, score: 3, compensations: [] },
    active_straight_leg_raise: { left: 3, right: 3, score: 3, compensations: [] },
    trunk_stability_push_up: { score: 3, compensations: [] },
    rotary_stability: { left: 3, right: 3, score: 3, compensations: [] }
  });

  const [clearingTests, setClearingTests] = useState<Record<string, ClearingTest>>({
    shoulder: { pain: false },
    spine_extension: { pain: false },
    spine_flexion: { pain: false }
  });

  const [notes, setNotes] = useState('');

  const handleScoreChange = (testId: string, side: 'left' | 'right' | 'both', value: number) => {
    setScores(prev => {
      const current = prev[testId];
      let newLeft = current.left;
      let newRight = current.right;
      let newScore = current.score;

      if (side === 'left') newLeft = value;
      else if (side === 'right') newRight = value;
      else {
        newLeft = value;
        newRight = value;
        newScore = value;
      }

      const isAsymmetrical = ['hurdle_step', 'inline_lunge', 'shoulder_mobility', 'active_straight_leg_raise', 'rotary_stability'].includes(testId);
      if (isAsymmetrical) {
        newScore = Math.min(newLeft ?? 3, newRight ?? 3);
      } else {
        newScore = value;
      }

      return {
        ...prev,
        [testId]: { ...current, left: newLeft, right: newRight, score: newScore }
      };
    });
  };

  const toggleCompensation = (testId: string, comp: string) => {
    setScores(prev => {
      const current = prev[testId];
      const newComps = current.compensations.includes(comp)
        ? current.compensations.filter(c => c !== comp)
        : [...current.compensations, comp];
      return {
        ...prev,
        [testId]: { ...current, compensations: newComps }
      };
    });
  };

  const handleClearingTest = (id: string, pain: boolean) => {
    setClearingTests(prev => ({ ...prev, [id]: { pain } }));
  };

  const processedScores = useMemo(() => {
    const updated = { ...scores };
    
    if (clearingTests.shoulder.pain) updated.shoulder_mobility.score = 0;
    if (clearingTests.spine_extension.pain) updated.trunk_stability_push_up.score = 0;
    if (clearingTests.spine_flexion.pain) updated.rotary_stability.score = 0;

    return updated;
  }, [scores, clearingTests]);

  const totalScore = useMemo(() => {
    return Object.values(processedScores).reduce((acc, curr) => acc + curr.score, 0);
  }, [processedScores]);

  const alerts = useMemo(() => {
    const hasPain = Object.values(clearingTests).some(t => t.pain);
    const hasAsymmetry = Object.entries(processedScores).some(([_, s]) => 
      s.left !== undefined && s.right !== undefined && Math.abs(s.left - s.right) >= 2
    );
    const hasSevereDysfunction = Object.values(processedScores).some(s => s.score === 0);

    let risk: 'low' | 'moderate' | 'high' = 'low';
    if (totalScore <= 10 || hasPain) risk = 'high';
    else if (totalScore <= 14) risk = 'moderate';

    return {
      risk,
      pain_override: hasPain,
      asymmetry_alert: hasAsymmetry,
      severe_dysfunction: hasSevereDysfunction
    };
  }, [processedScores, totalScore, clearingTests]);

  const categories = useMemo(() => {
    const mobility = (processedScores.shoulder_mobility.score + processedScores.active_straight_leg_raise.score) / 2;
    const stability = (processedScores.hurdle_step.score + processedScores.inline_lunge.score) / 2;
    const control = (processedScores.deep_squat.score + processedScores.trunk_stability_push_up.score + processedScores.rotary_stability.score) / 3;

    let focus = 'Controle Motor';
    if (mobility <= stability && mobility <= control) focus = 'Mobilidade';
    else if (stability <= mobility && stability <= control) focus = 'Estabilidade';

    return { mobility, stability, control, focus };
  }, [processedScores]);

  const radarData = useMemo(() => [
    { subject: 'Mobilidade', A: categories.mobility, fullMark: 3 },
    { subject: 'Estabilidade', A: categories.stability, fullMark: 3 },
    { subject: 'Controle', A: categories.control, fullMark: 3 },
  ], [categories]);

  const tests = [
    { 
      id: 'deep_squat', 
      label: 'Agachamento Profundo',
      category: 'control', 
      asymmetric: false,
      info: {
        indication: "Avalia mobilidade bilateral dos quadris, joelhos e tornozelos, e estabilidade do core.",
        application: "Descer o máximo possível com calcanhares no chão e bastão estendido acima da cabeça.",
        positiveIndicators: ["Tronco paralelo à tíbia", "Fêmur abaixo da horizontal", "Calcanhares no chão"],
        negativeIndicators: ["Valgo dinâmico", "Calcanhar eleva", "Flexão excessiva do tronco"]
      },
      compensations: [
        'Valgo nos Joelhos',
        'Calcanhar levanta',
        'Flexão Excessiva do Tronco',
        'Braços caem à frente'
      ]
    },
    { 
      id: 'hurdle_step', 
      label: 'Passo sobre Barreira', 
      category: 'stability',
      asymmetric: true,
      info: {
        indication: "Avalia controle motor, mobilidade e estabilidade em passada assimétrica.",
        application: "Perna passa sobre barreira mantendo alinhamento corporal da perna de apoio.",
        positiveIndicators: ["Alinhamento tornozelo-joelho-quadril", "Lombar neutra", "Bastão paralelo à barreira"],
        negativeIndicators: ["Contato com elástico", "Perda de equilíbrio", "Rotação externa excessiva"]
      },
      compensations: [
        'Perda de Equilíbrio',
        'Contato com a Barreira',
        'Inclinação Lateral do Tronco',
        'Rotação Externa da Perna'
      ]
    },
    { 
      id: 'inline_lunge', 
      label: 'Avanço em Linha', 
      category: 'stability',
      asymmetric: true,
      info: {
        indication: "Simula rotação, flexão e movimento assimétrico lateral.",
        application: "Posição de afundo com pés na mesma linha, descer até joelho tocar a linha atrás do calcanhar.",
        positiveIndicators: ["Descida reta", "Tronco vertical sem rotação", "Ausência de perda de equilíbrio"],
        negativeIndicators: ["Afastamento da linha", "Curvatura do tronco", "Incapacidade de retornar"]
      },
      compensations: [
        'Perda de Equilíbrio',
        'Joelho não toca a linha alinhada',
        'Inclinação do Tronco',
        'Pés não permanecem alinhados'
      ]
    },
    { 
      id: 'shoulder_mobility', 
      label: 'Mobilidade de Ombros', 
      category: 'mobility',
      asymmetric: true,
      clearing: 'shoulder',
      info: {
        indication: "Testa amplitude combinada de rotação interna/extensão e externa/flexão.",
        application: "Tocar as duas mãos nas costas (uma por cima, uma por baixo).",
        positiveIndicators: ["Distância entre punhos menor que uma mão"],
        negativeIndicators: ["Distância maior que uma mão e meia", "Dor ao movimento"]
      },
      compensations: [
        'Distância > 1.5 mãos',
        'Dor no teste de verificação',
        'Escápula alada'
      ]
    },
    { 
      id: 'active_straight_leg_raise', 
      label: 'Elevação Ativa da Perna', 
      category: 'mobility',
      asymmetric: true,
      info: {
        indication: "Testa flexibilidade dos isquiotibiais e estabilidade pélvica.",
        application: "Deitado, elevar uma perna reta o máximo possível mantendo a oposta colada ao solo.",
        positiveIndicators: ["Maléolo ultrapassa o marco no meio da coxa", "Perna de baixo imóvel"],
        negativeIndicators: ["Perna de apoio flexiona", "Pelve rotaciona para facilitar"]
      },
      compensations: [
        'Perna de apoio flexiona',
        'Perna levantada flexiona',
        'Rotação / Báscula Pélvica',
        'Rotação Externa intensa da perna de suporte'
      ]
    },
    { 
      id: 'trunk_stability_push_up', 
      label: 'Flexão para Estabilidade do Tronco', 
      category: 'control',
      asymmetric: false,
      clearing: 'spine_extension',
      info: {
        indication: "Avalia estabilidade do core no plano sagital e controle da extensão.",
        application: "Realizar uma flexão a partir do solo mantendo o corpo como uma prancha rígida.",
        positiveIndicators: ["Corpo sobe em um único bloco sem 'lag' lombar"],
        negativeIndicators: ["Quadril fica para trás", "Hiperextensão lombar (lag)"]
      },
      compensations: [
        'Atraso Quadril (Lag lombar)',
        'Extensão Lombar pronunciada',
        'Não consegue subir os segmentos unidos'
      ]
    },
    { 
      id: 'rotary_stability', 
      label: 'Estabilidade Rotacional', 
      category: 'control',
      asymmetric: true,
      clearing: 'spine_flexion',
      info: {
        indication: "Ação neuromuscular multiponto, exigindo restrição de rotação durante movimento.",
        application: "4 apoios, tocar cotovelo no joelho do mesmo lado e estender ambos.",
        positiveIndicators: ["Execução ipsilateral (mesmo lado) suave e limpa", "Coluna plana paralela ao solo"],
        negativeIndicators: ["Queda iminente", "Falha de controle", "Realiza apenas na diagonal (compensação)"]
      },
      compensations: [
        'Perda de Equilíbrio massivo',
        'Não consegue tocar cotovelo no joelho ipsilateral',
        'Torção de coluna compensatória'
      ]
    }
  ];

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        type: "functional",
        score_total: totalScore,
        risk_level: alerts.risk,
        pain_override: alerts.pain_override,
        asymmetry_alert: alerts.asymmetry_alert,
        severe_dysfunction: alerts.severe_dysfunction,
        focus: categories.focus,
        movements: processedScores,
        clearing_tests: clearingTests,
        notes,
        athleteId,
        date: new Date().toISOString()
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score === 3) return 'text-emerald-400';
    if (score === 2) return 'text-cyan-400';
    if (score === 1) return 'text-amber-400';
    return 'text-rose-400';
  };

  const riskColor = alerts.risk === 'high' ? 'text-rose-400' : alerts.risk === 'moderate' ? 'text-amber-400' : 'text-emerald-400';
  const riskBg = alerts.risk === 'high' ? 'bg-rose-500/10' : alerts.risk === 'moderate' ? 'bg-amber-500/10' : 'bg-emerald-500/10';

  const formSteps = [
    { id: 1, title: 'Mobilidade', icon: MoveUpRight, filter: 'mobility' },
    { id: 2, title: 'Estabilidade', icon: ArrowsUpFromLine, filter: 'stability' },
    { id: 3, title: 'Controle Motor', icon: Target, filter: 'control' },
    { id: 4, title: 'Resumo FMS', icon: BarChart3, filter: 'summary' },
  ];

  const currentCategory = formSteps.find(s => s.id === step)?.filter;
  const currentTests = tests.filter(t => t.category === currentCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Accessibility className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Triagem Funcional</h2>
            <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">Baseado no FMS</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-4 max-w-2xl mx-auto">
        {formSteps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div 
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${step === s.id ? 'scale-110' : 'opacity-40'}`}
              onClick={() => setStep(s.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] font-black uppercase tracking-widest text-center max-w-[5rem] leading-tight">{s.title}</span>
            </div>
            {i < formSteps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-2 mb-8 ${step > s.id ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tests */}
        <div className="lg:col-span-8 space-y-6">
          {step !== 4 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               {currentTests.map((test) => (
                 <Card key={test.id} className="bg-slate-900/40 border-slate-800/50 overflow-hidden">
                   <CardContent className="p-6">
                     <div className="flex flex-col md:flex-row gap-6">
                       {/* Test Info & Scoring */}
                       <div className="flex-1 space-y-4">
                         <div className="flex items-center justify-between">
                           <TestInfoModal 
                             title={test.label} 
                             indication={test.info?.indication || ""} 
                             application={test.info?.application || ""}
                             positiveIndicators={test.info?.positiveIndicators || []}
                             negativeIndicators={test.info?.negativeIndicators || []}
                           >
                             <h3 className="text-xs font-black text-white uppercase tracking-widest">{test.label}</h3>
                           </TestInfoModal>
                           <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xxs font-bold uppercase flex items-center gap-2">
                             <span className={getScoreColor(processedScores[test.id].score)}>Score: {processedScores[test.id].score}</span>
                             {processedScores[test.id].score === 0 && <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />}
                           </div>
                         </div>
     
                         {test.asymmetric ? (
                           <div className="grid grid-cols-2 gap-4">
                             {['left', 'right'].map((side) => (
                               <div key={side} className="space-y-2">
                                 <div className="flex items-center justify-center gap-2">
                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{side === 'left' ? 'Esquerda' : 'Direita'}</p>
                                   {test.asymmetric && side === 'right' && Math.abs((scores[test.id].left ?? 0) - (scores[test.id].right ?? 0)) >= 2 && (
                                     <AlertCircle className="w-3 h-3 text-amber-400" />
                                   )}
                                 </div>
                                 <div className="flex items-center justify-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                                   {[0, 1, 2, 3].map((val) => (
                                     <button
                                       key={val}
                                       onClick={() => handleScoreChange(test.id, side as 'left' | 'right', val)}
                                       className={`w-8 h-8 rounded flex items-center justify-center text-xs font-black transition-all ${
                                         scores[test.id][side as 'left' | 'right'] === val 
                                           ? 'bg-emerald-500 text-[#050B14]' 
                                           : 'text-slate-500 hover:text-slate-300'
                                       }`}
                                     >
                                       {val}
                                     </button>
                                   ))}
                                 </div>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <div className="flex items-center justify-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 w-fit mx-auto">
                             {[0, 1, 2, 3].map((val) => (
                               <button
                                 key={val}
                                 onClick={() => handleScoreChange(test.id, 'both', val)}
                                 className={`w-10 h-10 rounded flex items-center justify-center text-xs font-black transition-all ${
                                   scores[test.id].score === val 
                                     ? 'bg-emerald-500 text-[#050B14]' 
                                     : 'text-slate-500 hover:text-slate-300'
                                 }`}
                               >
                                 {val}
                               </button>
                             ))}
                           </div>
                         )}
     
                         {/* Clearing Test if applicable */}
                         {test.clearing && (
                           <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${clearingTests[test.clearing!].pain ? 'bg-rose-500/10 border-rose-500/50' : 'bg-slate-950 border-slate-800'}`}>
                             <div className="flex items-center gap-2">
                               <Activity className={`w-3 h-3 ${clearingTests[test.clearing!].pain ? 'text-rose-400' : 'text-slate-500'}`} />
                               <span className={`text-[10px] font-bold uppercase tracking-widest ${clearingTests[test.clearing!].pain ? 'text-rose-400' : 'text-slate-500'}`}>Teste de Dor</span>
                             </div>
                             <div className="flex gap-2">
                               <button 
                                 onClick={() => handleClearingTest(test.clearing!, false)}
                                 className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!clearingTests[test.clearing!].pain ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:bg-slate-800'}`}
                               >
                                 Sem Dor
                               </button>
                               <button 
                                 onClick={() => handleClearingTest(test.clearing!, true)}
                                 className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${clearingTests[test.clearing!].pain ? 'bg-rose-500 text-white' : 'text-slate-500 hover:bg-slate-800'}`}
                               >
                                 Com Dor
                               </button>
                             </div>
                           </div>
                         )}
                       </div>
     
                       {/* Compensations Checklist */}
                       <div className="w-full md:w-64 space-y-3">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compensações</p>
                         <div className="space-y-1">
                           {test.compensations.map((comp) => (
                             <button
                               key={comp}
                               onClick={() => toggleCompensation(test.id, comp)}
                               className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                                 scores[test.id].compensations.includes(comp)
                                   ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                   : 'bg-slate-950/50 text-slate-500 border border-transparent hover:border-slate-800'
                               }`}
                             >
                               {comp}
                               {scores[test.id].compensations.includes(comp) && <CheckCircle2 className="w-3 h-3" />}
                             </button>
                           ))}
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               <Card className="bg-slate-900/40 border-slate-800/50">
                 <CardHeader>
                   <CardTitle className="text-sm font-black text-white uppercase tracking-widest">Observações Finais</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <textarea 
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors min-h-[120px] resize-none text-sm font-medium"
                     placeholder="Anote considerações sobre o score do FMS..."
                   />
                 </CardContent>
               </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column: Summary & Analysis */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-slate-900/80 border-slate-700 sticky top-6 overflow-hidden">
            <div className={`h-1 ${riskBg} w-full`} />
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Score Total</p>
                <div className={`text-7xl font-black mb-1 ${riskColor}`}>{totalScore}</div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Máximo: 21</p>
              </div>

              {/* Radar Chart */}
              <div className="h-64 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                    <Radar
                      name="Athlete"
                      dataKey="A"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Análise de Risco</h4>
                    <ShieldCheck className={`w-4 h-4 ${riskColor}`} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status de Risco</span>
                      <span className={`text-[10px] font-black uppercase ${riskColor}`}>
                        {alerts.risk === 'high' ? 'Alto Risco' : alerts.risk === 'moderate' ? 'Risco Moderado' : 'Baixo Risco'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Foco Corretivo</span>
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{categories.focus}</span>
                    </div>
                  </div>
                </div>

                {/* Clinical Alerts */}
                {(alerts.pain_override || alerts.asymmetry_alert || alerts.severe_dysfunction) && (
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                    <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" /> Fatores Críticos Localizados
                    </h4>
                    <div className="space-y-1">
                      {alerts.pain_override && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                          <Zap className="w-3 h-3" /> Dor Reportada
                        </div>
                      )}
                      {alerts.asymmetry_alert && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                          <AlertTriangle className="w-3 h-3" /> Assimetria Grosseira Crítica
                        </div>
                      )}
                      {alerts.severe_dysfunction && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                          <AlertCircle className="w-3 h-3" /> Incapacidade / Pontuação 0
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Sugestões de Mitigação
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-bold tracking-wide">
                    {alerts.risk === 'high' 
                      ? 'Requerem foco em reabilitação. Controle motor bloqueado.'
                      : alerts.risk === 'moderate'
                      ? 'Exercícios de mobilidade corretiva recomendados.'
                      : 'Boa funcionalidade. Treinamento normal autorizado.'}
                  </p>
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-lg shadow-lg shadow-emerald-500/20"
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Salvar Avaliação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
