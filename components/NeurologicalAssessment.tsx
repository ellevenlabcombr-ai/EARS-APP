"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, AlertTriangle, Save, ArrowLeft, Activity, 
  CheckCircle2, FileQuestion, GraduationCap, Eye, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TestInfoModal } from "@/components/TestInfoModal";

interface NeurologicalAssessmentProps {
  athleteId: string;
  onCancel: () => void;
  onSave: (data: any) => void;
}

type Tab = 'sintomas' | 'cognitivo' | 'motor' | 'voms' | 'redflags';

export function NeurologicalAssessment({ athleteId, onCancel, onSave }: NeurologicalAssessmentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('sintomas');
  const [isSaving, setIsSaving] = useState(false);

  // === 1. SINTOMAS (SCAT6 / Child SCAT6) ===
  const [symptoms, setSymptoms] = useState({
    headache: 0,
    nausea: 0,
    dizziness: 0,
    vomiting: 0,
    balanceProblems: 0,
    lightSensitivity: 0,
    noiseSensitivity: 0,
    feelingSlowedDown: 0,
    feelingInAFog: 0,
    dontFeelRight: 0,
    difficultyConcentrating: 0,
    difficultyRemembering: 0,
    fatigue: 0,
    confusion: 0,
    drowsiness: 0,
    troubleFallingAsleep: 0,
    moreEmotional: 0,
    irritability: 0,
    sadness: 0,
    nervousness: 0
  });

  // === 2. COGNITIVO ===
  const [cognitive, setCognitive] = useState({
    orientation: {
      venue: false,
      half: false,
      lastScored: false,
      lastTeamPlayed: false,
      wonLastGame: false
    },
    immediateMemory: [
      { t1: 0, t2: 0, t3: 0 }, // word list 1
      { t1: 0, t2: 0, t3: 0 }, // word list 2
      { t1: 0, t2: 0, t3: 0 }, // word list 3
      { t1: 0, t2: 0, t3: 0 }, // word list 4
      { t1: 0, t2: 0, t3: 0 }  // word list 5
    ],
    digitsBackward: {
      d3: false,
      d4: false,
      d5: false,
      d6: false
    },
    monthsReverse: false,
    delayedMemory: 0 // score out of 5
  });

  // === 3. MOTOR & EQUILÍBRIO ===
  const [motor, setMotor] = useState({
    mbessDouble: 0, // Errors 0-10
    mbessSingle: 0,
    mbessTandem: 0,
    tandemGaitTime: "", // seconds
    tandemGaitPass: true,
    fingerToNosePass: true
  });

  // === 4. VOMS (Visuo-Vestibular) ===
  // Score diff from baseline (0-10)
  const initialVomsObj = { headache: 0, dizziness: 0, nausea: 0, fogginess: 0 };
  const [voms, setVoms] = useState({
    baseline: { ...initialVomsObj },
    smoothPursuits: { ...initialVomsObj },
    saccadesHorizontal: { ...initialVomsObj },
    saccadesVertical: { ...initialVomsObj },
    vorHorizontal: { ...initialVomsObj },
    vorVertical: { ...initialVomsObj },
    vms: { ...initialVomsObj },
    npcDistance: "" // cm
  });

  // === 5. RED FLAGS & COMPORTAMENTAL (Pediatric Focus) ===
  const [redFlags, setRedFlags] = useState({
    neckPain: false,
    doubleVision: false,
    weaknessTingling: false,
    severeHeadache: false,
    seizure: false,
    lossOfConsciousness: false,
    deterioratingState: false,
    vomitingRepeated: false,
    increasingRestless: false,
    // Pediatric Behavioral
    schoolDecline: false,
    unusualTantrums: false,
    sleepPatternChange: false
  });

  // derived metrics
  const [score, setScore] = useState(100);
  const [classification, setClassification] = useState({ label: 'Excelente', color: 'emerald' });
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    let finalScore = 100;
    const newAlerts: string[] = [];

    // Symptom impact (max 22 symptoms * 6 = 132). Let's say any symptom drops score.
    const totalSymptoms = Object.values(symptoms).reduce((a, b) => a + Number(b), 0);
    if (totalSymptoms > 0) {
      finalScore -= Math.min(30, totalSymptoms * 1.5);
    }
    if (Object.values(symptoms).some(v => v >= 4)) {
      newAlerts.push("Sintomas Severos");
    }

    // Cognitive impact
    const orientationScore = Object.values(cognitive.orientation).filter(v => v).length;
    if (orientationScore < 5) finalScore -= (5 - orientationScore) * 2;
    
    // Balance impact
    const totalErrors = Number(motor.mbessDouble) + Number(motor.mbessSingle) + Number(motor.mbessTandem);
    if (totalErrors > 0) finalScore -= Math.min(20, totalErrors * 2);
    if (!motor.tandemGaitPass) finalScore -= 10;
    if (Number(motor.tandemGaitTime) > 14) newAlerts.push("Tandem Gait Lento (>14s)");

    // VOMS impact
    const getVomsChange = (test: typeof initialVomsObj) => {
      const b = voms.baseline;
      return Math.max(0, test.headache - b.headache) +
             Math.max(0, test.dizziness - b.dizziness) +
             Math.max(0, test.nausea - b.nausea) +
             Math.max(0, test.fogginess - b.fogginess);
    };
    
    let vomsTotalChange = 0;
    ['smoothPursuits', 'saccadesHorizontal', 'saccadesVertical', 'vorHorizontal', 'vorVertical', 'vms'].forEach(key => {
      const change = getVomsChange(voms[key as keyof typeof voms] as any);
      vomsTotalChange += change;
    });

    if (vomsTotalChange > 0) {
      finalScore -= Math.min(25, vomsTotalChange * 2);
      newAlerts.push("Alteração Vestibular/Ocular (VOMS positivo)");
    }
    if (Number(voms.npcDistance) >= 5) {
      newAlerts.push("Convergência Alterada (≥ 5cm)");
    }

    // Red Flags
    const rFlags = Object.entries(redFlags).filter(([k, v]) => v && !['schoolDecline', 'unusualTantrums', 'sleepPatternChange'].includes(k));
    if (rFlags.length > 0) {
      finalScore = 30; // Critical
      newAlerts.push("RED FLAG: Encaminhar ao PS imediatamente");
    }

    if (redFlags.schoolDecline || redFlags.unusualTantrums || redFlags.sleepPatternChange) {
      newAlerts.push("Atenção Comportamental Pediátrica");
      finalScore -= 10;
    }

    finalScore = Math.max(0, Math.floor(finalScore));
    setScore(finalScore);

    if (rFlags.length > 0) setClassification({ label: 'Crítico (Encaminhar)', color: 'rose' });
    else if (finalScore >= 90) setClassification({ label: 'Normal', color: 'emerald' });
    else if (finalScore >= 75) setClassification({ label: 'Atenção (Monitorar)', color: 'amber' });
    else setClassification({ label: 'Suspeita de Concussão / Déficit', color: 'rose' });

    setAlerts(newAlerts);
  }, [symptoms, cognitive, motor, voms, redFlags]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        type: "Neurológica Pediátrica/Sports",
        score,
        classification: classification.label,
        classification_color: classification.color,
        alerts,
        raw_data: { symptoms, cognitive, motor, voms, redFlags }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const TABS = [
    { id: 'sintomas', label: 'Sintomas SCAT', icon: Activity },
    { id: 'cognitivo', label: 'Cognitivo', icon: Brain },
    { id: 'motor', label: 'Motor & M-BESS', icon: ArrowLeft }, 
    { id: 'voms', label: 'VOMS', icon: Eye },
    { id: 'redflags', label: 'Escolar & Red Flags', icon: AlertTriangle },
  ] as const;

  const VOMS_FIELDS = [
    { key: 'baseline', label: 'Baseline', desc: 'Antes do teste' },
    { key: 'smoothPursuits', label: 'Smooth Pursuits', desc: 'Acompanhamento suave' },
    { key: 'saccadesHorizontal', label: 'Saccades (H)', desc: 'Mov. sacádico horizontal' },
    { key: 'saccadesVertical', label: 'Saccades (V)', desc: 'Mov. sacádico vertical' },
    { key: 'vorHorizontal', label: 'VOR (H)', desc: 'Reflexo V-O horizontal' },
    { key: 'vorVertical', label: 'VOR (V)', desc: 'Reflexo V-O vertical' },
    { key: 'vms', label: 'VMS', desc: 'Sensibilidade visual ao mov.' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050B14] overflow-hidden text-slate-200" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-4 sm:px-8 bg-[#0A1120]/80 backdrop-blur-xl shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-400 hover:text-white shrink-0 hidden sm:flex">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
             <TestInfoModal
              title="Avaliação Neurológica Avançada (Child SCAT6 / VOMS)"
              indication="Rastreio pós-trauma craniano, acompanhamento de concussão ou baseline."
              application="Questionário de sintomas, testes cognitivos, equilíbrio (mBESS) e testes visuo-vestibulares (VOMS)."
            >
              <h2 className="text-lg font-black text-white uppercase tracking-tight -mb-0.5 cursor-pointer hover:text-cyan-400 transition-colors">Avaliação Neurológica</h2>
            </TestInfoModal>
            <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest truncate">Protocolo SCAT6 & VOMS pediátrico</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={'px-4 sm:px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2'}
        >
          {isSaving ? <span className="animate-pulse">...</span> : <Save className="w-4 h-4" />}
          <span className="hidden sm:inline">Finalizar</span>
        </button>
      </header>

      {/* Classification Summary */}
      <div className="px-4 sm:px-8 py-4 shrink-0 max-w-5xl mx-auto w-full border-b border-slate-800/50">
        <div className="flex items-center flex-wrap gap-4 justify-between">
           <div className="flex items-center gap-4">
             <div className="text-3xl font-black text-white">{score} <span className="text-sm text-slate-500">/ 100</span></div>
             <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${classification.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : classification.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
               {classification.label}
             </div>
           </div>
           {alerts.length > 0 && (
             <div className="flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-black">
               <AlertTriangle className="w-4 h-4" />
               {alerts.length} ALERTA(S)
             </div>
           )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center overflow-x-auto no-scrollbar px-4 py-4 shrink-0 gap-4 max-w-5xl mx-auto w-full">
        {TABS.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <div key={t.id} onClick={() => setActiveTab(t.id)} className={`cursor-pointer shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${isActive ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}>
              <t.icon className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>
            </div>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-32 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8 h-full">

          {/* TAB 1: SINTOMAS */}
          {activeTab === 'sintomas' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl">
                 <p className="text-xs text-slate-400 font-bold">Gradue cada sintoma baseando-se em como o atleta se sente AGORA. (0 = Nenhum, 6 = Severo)</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {Object.keys(symptoms).map(key => {
                   const sympLabels: any = {
                     headache: "Dor de Cabeça",
                     nausea: "Náusea",
                     dizziness: "Tontura",
                     vomiting: "Vômito",
                     balanceProblems: "Problemas de Equilíbrio",
                     lightSensitivity: "Sensibilidade à Luz",
                     noiseSensitivity: "Sensibilidade ao Som",
                     feelingSlowedDown: "Sentindo-se Lento",
                     feelingInAFog: "Sentindo-se 'Numa Névoa'",
                     dontFeelRight: "Longe do Normal / Estranho",
                     difficultyConcentrating: "Dificuldade de Concentrar",
                     difficultyRemembering: "Dificuldade de Lembrar",
                     fatigue: "Fadiga / Cansaço",
                     confusion: "Confusão",
                     drowsiness: "Sonolência",
                     troubleFallingAsleep: "Dificuldade de Dormir",
                     moreEmotional: "Mais Emocional",
                     irritability: "Irritabilidade",
                     sadness: "Tristeza",
                     nervousness: "Nervosismo / Ansiedade"
                   };
                   const val = symptoms[key as keyof typeof symptoms];
                   return (
                     <div key={key} className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col space-y-3 shrink-0">
                       <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{sympLabels[key]}</span>
                       <div className="flex justify-between items-center bg-slate-950 p-1 rounded-xl">
                         {[0,1,2,3,4,5,6].map(i => (
                           <button 
                             key={i} 
                             onClick={() => setSymptoms({...symptoms, [key]: i})}
                             className={`w-8 h-8 rounded-lg text-sm font-black transition-colors ${val === i ? (i === 0 ? 'bg-emerald-500 text-slate-900' : i >= 4 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-900') : 'text-slate-500 hover:bg-slate-800'}`}
                           >
                             {i}
                           </button>
                         ))}
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          )}

          {/* TAB 2: COGNITIVO */}
          {activeTab === 'cognitivo' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               
               {/* Orientation */}
               <section className="space-y-4">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400">1. Orientação (Maddocks / SCAT)</h3>
                 <Card className="bg-slate-900/40 border-slate-800 p-6 space-y-4">
                   {[
                     { k: 'venue', l: 'Onde estamos hoje?' },
                     { k: 'half', l: 'Em que momento/tempo do jogo estamos?' },
                     { k: 'lastScored', l: 'Quem marcou por último?' },
                     { k: 'lastTeamPlayed', l: 'Qual time jogamos na última semana/jogo?' },
                     { k: 'wonLastGame', l: 'Ganhamos o último jogo?' }
                   ].map(item => (
                     <div key={item.k} className="flex items-center justify-between">
                       <span className="text-sm font-bold text-slate-300">{item.l}</span>
                       <div className="flex gap-2">
                         <Button variant={cognitive.orientation[item.k as keyof typeof cognitive.orientation] ? "default" : "outline"} onClick={() => setCognitive({...cognitive, orientation: {...cognitive.orientation, [item.k]: true}})} className={`${cognitive.orientation[item.k as keyof typeof cognitive.orientation] ? 'bg-emerald-500 hover:bg-emerald-600 outline-none' : 'border-slate-700'}`}>Correto</Button>
                         <Button variant={!cognitive.orientation[item.k as keyof typeof cognitive.orientation] ? "default" : "outline"} onClick={() => setCognitive({...cognitive, orientation: {...cognitive.orientation, [item.k]: false}})} className={`${!cognitive.orientation[item.k as keyof typeof cognitive.orientation] ? 'bg-rose-500 hover:bg-rose-600 outline-none' : 'border-slate-700'}`}>Erro</Button>
                       </div>
                     </div>
                   ))}
                 </Card>
               </section>

               {/* Memory */}
               <section className="space-y-4">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400">2. Memória Imediata (Liste de Palavras)</h3>
                 <Card className="bg-slate-900/40 border-slate-800 p-6 space-y-6">
                    <p className="text-xs text-slate-500 font-bold uppercase">Avalie o número de palavras recordadas corretamente em 3 tentativas.</p>
                    <div className="grid grid-cols-4 gap-4">
                       <div className="font-bold text-xs uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">Palavra</div>
                       <div className="font-bold text-xs text-center uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">T1</div>
                       <div className="font-bold text-xs text-center uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">T2</div>
                       <div className="font-bold text-xs text-center uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">T3</div>

                       {['DEDO', 'MOEDA', 'COPO', 'TAPETE', 'LIVRO'].map((word, idx) => (
                         <React.Fragment key={word}>
                           <div className="text-sm font-bold flex items-center text-slate-200">{word}</div>
                           {[1, 2, 3].map(t => {
                              const tKey = `t${t}` as 't1' | 't2' | 't3';
                              const isChecked = cognitive.immediateMemory[idx][tKey] === 1;
                              return (
                                <div key={t} className="flex items-center justify-center">
                                  <button onClick={() => {
                                      const newMem = [...cognitive.immediateMemory];
                                      newMem[idx][tKey] = isChecked ? 0 : 1;
                                      setCognitive({...cognitive, immediateMemory: newMem});
                                    }}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${isChecked ? 'bg-emerald-500 text-slate-900 border-emerald-500' : 'bg-slate-950 border-slate-700 text-slate-600'}`}>
                                    {isChecked && <CheckCircle2 className="w-4 h-4" />}
                                  </button>
                                </div>
                              )
                           })}
                         </React.Fragment>
                       ))}
                    </div>
                 </Card>
               </section>
               
               {/* Concentration */}
               <section className="space-y-4">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400">3. Concentração (Dígitos Inversos)</h3>
                 <Card className="bg-slate-900/40 border-slate-800 p-6 space-y-4">
                   <p className="text-xs text-slate-500 font-bold uppercase mb-4">Leia os dígitos, o atleta deve repetir ao contrário.</p>
                   {[
                     { k: 'd3', label: '3 Dígitos: 4-9-3' },
                     { k: 'd4', label: '4 Dígitos: 3-8-1-4' },
                     { k: 'd5', label: '5 Dígitos: 6-2-9-7-1' },
                     { k: 'd6', label: '6 Dígitos: 7-1-8-4-6-2' }
                   ].map(item => (
                     <div key={item.k} className="flex items-center justify-between">
                       <span className="text-sm font-bold text-slate-300">{item.label}</span>
                       <div className="flex gap-2">
                         <Button variant={cognitive.digitsBackward[item.k as keyof typeof cognitive.digitsBackward] ? "default" : "outline"} onClick={() => setCognitive({...cognitive, digitsBackward: {...cognitive.digitsBackward, [item.k]: true}})} className={`${cognitive.digitsBackward[item.k as keyof typeof cognitive.digitsBackward] ? 'bg-emerald-500 hover:bg-emerald-600 outline-none' : 'border-slate-700'}`}>Passou</Button>
                         <Button variant={!cognitive.digitsBackward[item.k as keyof typeof cognitive.digitsBackward] ? "default" : "outline"} onClick={() => setCognitive({...cognitive, digitsBackward: {...cognitive.digitsBackward, [item.k]: false}})} className={`${!cognitive.digitsBackward[item.k as keyof typeof cognitive.digitsBackward] ? 'bg-rose-500 hover:bg-rose-600 outline-none' : 'border-slate-700'}`}>Falhou</Button>
                       </div>
                     </div>
                   ))}

                   <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-300">Meses do Ano ao contrário</span>
                     <div className="flex gap-2">
                         <Button variant={cognitive.monthsReverse ? "default" : "outline"} onClick={() => setCognitive({...cognitive, monthsReverse: true})} className={`${cognitive.monthsReverse ? 'bg-emerald-500 hover:bg-emerald-600 outline-none' : 'border-slate-700'}`}>Passou</Button>
                         <Button variant={!cognitive.monthsReverse ? "default" : "outline"} onClick={() => setCognitive({...cognitive, monthsReverse: false})} className={`${!cognitive.monthsReverse ? 'bg-rose-500 hover:bg-rose-600 outline-none' : 'border-slate-700'}`}>Falhou</Button>
                       </div>
                   </div>
                 </Card>
               </section>

               <section className="space-y-4">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400">4. Memória Tardia (Após 5 min)</h3>
                 <Card className="bg-slate-900/40 border-slate-800 p-6 space-y-4">
                   <p className="text-xs text-slate-500 font-bold uppercase mb-4">Das 5 palavras, quantas o atleta lembrou agora?</p>
                   <div className="flex gap-2">
                      {[0,1,2,3,4,5].map(i => (
                        <button key={i} onClick={() => setCognitive({...cognitive, delayedMemory: i})}
                          className={`flex-1 h-12 rounded-xl text-lg font-black transition-all border ${cognitive.delayedMemory === i ? 'bg-cyan-500 border-cyan-500 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                          {i}
                        </button>
                      ))}
                   </div>
                 </Card>
               </section>
            </div>
          )}

          {/* TAB 3: MOTOR E EQUILÍBRIO */}
          {activeTab === 'motor' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               {/* mBESS */}
               <section className="space-y-4">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400">1. modified BESS (Erros em 20s, chão firme)</h3>
                 <Card className="bg-slate-900/40 border-slate-800 p-6 space-y-6">
                   {[
                     { k: 'mbessDouble', label: 'Bipodal (Double Leg)' },
                     { k: 'mbessSingle', label: 'Unipodal (Single Leg)' },
                     { k: 'mbessTandem', label: 'Tandem (Ponta-Calcanhar)' }
                   ].map(item => (
                     <div key={item.k} className="flex items-center justify-between">
                       <span className="text-sm font-bold text-slate-300">{item.label}</span>
                       <div className="flex items-center gap-2">
                         <span className="text-xs text-slate-500 font-bold uppercase mr-2">Erros:</span>
                         <select 
                           value={motor[item.k as keyof typeof motor] as number}
                           onChange={(e) => setMotor({...motor, [item.k]: Number(e.target.value)})}
                           className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold outline-none"
                         >
                           {[0,1,2,3,4,5,6,7,8,9,10].map(i => <option key={i} value={i}>{i} {i === 10 ? '(Max)' : ''}</option>)}
                         </select>
                       </div>
                     </div>
                   ))}
                 </Card>
               </section>

               {/* Tandem Gait */}
               <section className="space-y-4">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400">2. Tandem Gait Test</h3>
                 <Card className="bg-slate-900/40 border-slate-800 p-6 space-y-6">
                   <p className="text-xs text-slate-500 font-bold uppercase mb-4">Marchar calcanhar-ponta em linha reta (3 metros e voltar).</p>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-300">Tempo Total (segundos)</span>
                     <input type="number" step="0.1" placeholder="Ex: 12.5" value={motor.tandemGaitTime} onChange={(e) => setMotor({...motor, tandemGaitTime: e.target.value})} className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-center text-sm font-black focus:ring-1 focus:ring-cyan-500 outline-none text-slate-200" />
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                     <span className="text-sm font-bold text-slate-300">Qualidade (Passou sem desvios/quedas?)</span>
                     <div className="flex gap-2">
                        <Button variant={motor.tandemGaitPass ? "default" : "outline"} onClick={() => setMotor({...motor, tandemGaitPass: true})} className={`${motor.tandemGaitPass ? 'bg-emerald-500 hover:bg-emerald-600 outline-none' : 'border-slate-700'}`}>Sim</Button>
                        <Button variant={!motor.tandemGaitPass ? "default" : "outline"} onClick={() => setMotor({...motor, tandemGaitPass: false})} className={`${!motor.tandemGaitPass ? 'bg-rose-500 hover:bg-rose-600 outline-none' : 'border-slate-700'}`}>Não</Button>
                     </div>
                   </div>
                 </Card>
               </section>

               {/* Finger-to-Nose */}
               <section className="space-y-4">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400">3. Coordenação (Dedo-Nariz)</h3>
                 <Card className="bg-slate-900/40 border-slate-800 p-6 space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-300">Teste Feito com Sucesso?</span>
                     <div className="flex gap-2">
                        <Button variant={motor.fingerToNosePass ? "default" : "outline"} onClick={() => setMotor({...motor, fingerToNosePass: true})} className={`${motor.fingerToNosePass ? 'bg-emerald-500 hover:bg-emerald-600 outline-none' : 'border-slate-700'}`}>Passou</Button>
                        <Button variant={!motor.fingerToNosePass ? "default" : "outline"} onClick={() => setMotor({...motor, fingerToNosePass: false})} className={`${!motor.fingerToNosePass ? 'bg-rose-500 hover:bg-rose-600 outline-none' : 'border-slate-700'}`}>Falhou</Button>
                     </div>
                   </div>
                 </Card>
               </section>
            </div>
          )}

          {/* TAB 4: VOMS */}
          {activeTab === 'voms' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl">
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                   Vestibular/Ocular Motor Screening (Score de provocação 0-10)
                 </p>
               </div>

               <div className="overflow-x-auto rounded-2xl border border-slate-800 max-w-full">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-900 border-b border-slate-800 text-xxs uppercase tracking-widest text-slate-500">
                       <th className="p-4 font-black whitespace-nowrap min-w-[150px]">Teste</th>
                       <th className="p-4 font-black text-center min-w-[80px]">Dor Cab.</th>
                       <th className="p-4 font-black text-center min-w-[80px]">Tontura</th>
                       <th className="p-4 font-black text-center min-w-[80px]">Náusea</th>
                       <th className="p-4 font-black text-center min-w-[80px]">Névoa</th>
                     </tr>
                   </thead>
                   <tbody className="bg-slate-900/40">
                     {VOMS_FIELDS.map(field => {
                       const vObj = voms[field.key as keyof typeof voms] as any;
                       return (
                         <tr key={field.key} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                           <td className="p-4">
                             <div className="text-sm font-bold text-slate-200">{field.label}</div>
                             <div className="text-xxs text-slate-500 font-bold uppercase mt-0.5">{field.desc}</div>
                           </td>
                           {['headache', 'dizziness', 'nausea', 'fogginess'].map(k => (
                             <td key={k} className="p-3">
                               <select 
                                 value={vObj[k]} 
                                 onChange={(e) => {
                                   const nv = {...voms, [field.key]: { ...vObj, [k]: Number(e.target.value) }};
                                   setVoms(nv);
                                 }}
                                 className={`w-full bg-slate-950 border rounded-lg px-2 py-2 text-xs font-black outline-none text-center appearance-none ${vObj[k] > 0 ? 'border-amber-500/50 text-amber-400' : 'border-slate-800 text-slate-400'}`}
                               >
                                 {[0,1,2,3,4,5,6,7,8,9,10].map(i => <option key={i} value={i}>{i}</option>)}
                               </select>
                             </td>
                           ))}
                         </tr>
                       )
                     })}
                   </tbody>
                 </table>
               </div>

               <Card className="bg-slate-900/40 border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                 <div>
                   <h4 className="text-sm font-bold text-white mb-1">Near Point of Convergence (NPC)</h4>
                   <p className="text-xs text-slate-500 font-bold uppercase">Distância até visão dupla, ou até a caneta tocar o nariz (cm).</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <input 
                     type="number" 
                     placeholder="Ex: 3" 
                     value={voms.npcDistance} 
                     onChange={(e) => setVoms({...voms, npcDistance: e.target.value})} 
                     className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-center text-sm font-black focus:ring-1 focus:ring-cyan-500 outline-none text-slate-200" 
                   />
                   <span className="text-xs font-bold text-slate-500 uppercase">cm</span>
                 </div>
               </Card>
            </div>
          )}

          {/* TAB 5: RED FLAGS & COMPS */}
          {activeTab === 'redflags' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               
               {/* Pediatric Flags */}
               <section className="space-y-4">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400">Ativação Pediatria (Pais/Relato)</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { key: 'schoolDecline', label: 'Piora no desempenho escolar / dificuldades na aula' },
                      { key: 'unusualTantrums', label: 'Birras incomuns, choro exagerado, muita irritação' },
                      { key: 'sleepPatternChange', label: 'Alteração drástica no sono (durmindo muito ou insônia)' }
                    ].map(flag => {
                      const selected = redFlags[flag.key as keyof typeof redFlags];
                      return (
                        <button key={flag.key} onClick={() => setRedFlags({...redFlags, [flag.key]: !selected})}
                          className={`p-4 rounded-2xl border text-left flex flex-col gap-3 transition-colors ${selected ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900'}`}>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${selected ? 'border-amber-500 bg-amber-500' : 'border-slate-700'}`}>
                            {selected && <CheckCircle2 className="w-3 h-3 text-[#050B14]" />}
                          </div>
                          <span className="text-xs font-bold leading-snug">{flag.label}</span>
                        </button>
                      )
                    })}
                 </div>
               </section>

               {/* Absolute Red Flags */}
               <section className="space-y-4 pt-6 border-t border-slate-800/50">
                 <div className="flex items-center gap-3">
                   <AlertTriangle className="w-5 h-5 text-rose-500" />
                   <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest">RED FLAGS IMEDIATOS</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'neckPain', label: 'Dor no pescoço ou sensibilidade' },
                      { key: 'doubleVision', label: 'Visão Dupla' },
                      { key: 'weaknessTingling', label: 'Fraqueza ou Formigamento nos braços/pernas' },
                      { key: 'severeHeadache', label: 'Dor de cabeça severa ou piorando rápido' },
                      { key: 'seizure', label: 'Convulsão ou "Tremores"' },
                      { key: 'lossOfConsciousness', label: 'Perda de Consciência' },
                      { key: 'deterioratingState', label: 'Deterioração do estado consciente (acordando menos)' },
                      { key: 'vomitingRepeated', label: 'Vômito repetitivo' },
                      { key: 'increasingRestless', label: 'Ficando crescentemente agitado ou combativo' }
                    ].map(flag => {
                       const selected = redFlags[flag.key as keyof typeof redFlags];
                       return (
                        <button key={flag.key} onClick={() => setRedFlags({...redFlags, [flag.key]: !selected})}
                          className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-colors ${selected ? 'bg-rose-500 text-white border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900'}`}>
                          <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${selected ? 'border-white bg-transparent' : 'border-slate-700'}`}>
                            {selected && <div className="w-2 h-2 rounded-sm bg-white" />}
                          </div>
                          <span className="text-sm font-bold leading-tight">{flag.label}</span>
                        </button>
                       )
                    })}
                 </div>
               </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
