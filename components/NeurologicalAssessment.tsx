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

type Step = number;

export function NeurologicalAssessment({ athleteId, onCancel, onSave }: NeurologicalAssessmentProps) {
  const [step, setStep] = useState<Step>(1);
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

  const formSteps = [
    { id: 1, title: 'Sintomas', icon: Activity },
    { id: 2, title: 'Cognitivo', icon: Brain },
    { id: 3, title: 'Motor & M-BESS', icon: ArrowLeft }, 
    { id: 4, title: 'VOMS', icon: Eye },
    { id: 5, title: 'Red Flags', icon: AlertTriangle },
    { id: 6, title: 'Resultado', icon: Save },
  ];

  const VOMS_FIELDS = [
    { key: 'baseline', label: 'Baseline', desc: 'Antes do teste', application: 'Registre os sintomas do atleta em repouso no momento, antes de realizar qualquer movimento provocativo.', reference: ['Apenas para registro do estado inicial'] },
    { key: 'smoothPursuits', label: 'Smooth Pursuits', desc: 'Acompanhamento suave', application: 'Segure um alvo a cerca de 1 metro na linha média. Mova-o lentamente para a direita e esquerda 50cm (2 repetições). O atleta deve seguir apenas com os olhos sem mover a cabeça.', reference: ['Normal: Acompanhamento suave e livre de dor.', 'Positivo: Visão tremida ou aumento dos sintomas.'] },
    { key: 'saccadesHorizontal', label: 'Saccades (H)', desc: 'Mov. sacádico horizontal', application: 'Dois alvos a 1 metro de distância, com 1 metro entre eles (horizontalmente). O atleta move APENAS os olhos rapidamente de um alvo para o outro, 10 vezes completas.', reference: ['Positivo: Piora na dor de cabeça, tontura, náusea (>2pts) e engasgo/visão dupla.'] },
    { key: 'saccadesVertical', label: 'Saccades (V)', desc: 'Mov. sacádico vertical', application: 'Similar ao Horizontal. Dois alvos dispostos verticalmente (1 metro entre si). O atleta move os olhos de cima para baixo 10 vezes completas.', reference: ['Positivo: Piora de 2 ou mais pontos nos sintomas avaliados.'] },
    { key: 'vorHorizontal', label: 'VOR (H)', desc: 'Reflexo V-O horizontal', application: 'Atleta foca num alvo (ex dedo) a 1m de distância. Segure e gire a cabeça dele (lado a lado, amplitude 20º) em formato de "não" acompanhando 180 bpm no metrônomo (10 ciclos totais).', reference: ['Incapacidade de manter fixação ou aumento nos sintomas refletem disfunção.'] },
    { key: 'vorVertical', label: 'VOR (V)', desc: 'Reflexo V-O vertical', application: 'Idêntico ao VOR H, mas com a cabela em movimento "sim" (cima-baixo, 20º) a 180 bpm por 10 ciclos. Olhar deve seguir fixo no alvo frontal.', reference: ['Positivo em caso de perda de fixação ou sintoma exacerbado.'] },
    { key: 'vms', label: 'VMS', desc: 'Sensibilidade visual ao mov.', application: 'Segurando os braços esticados com polegares cima, atleta foca nos polegares e roda de "bloco" (tronco e cabeça juntos) 80º direita-esquerda, no ritmo de 50bpm. Total 5 ciclos (D/E).', reference: ['O estímulo optocinético deflagra náuseas fortes ou tontura no caso de concussão.'] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 pb-2 shrink-0 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-indigo-400" />
          </div>
          <TestInfoModal
            title="Avaliação Neurológica Avançada (Child SCAT6 / VOMS)"
            indication="Rastreio pós-trauma craniano, acompanhamento de concussão ou baseline."
            application="Questionário de sintomas, testes cognitivos, equilíbrio (mBESS) e testes visuo-vestibulares (VOMS)."
          >
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight hover:text-cyan-400 transition-colors cursor-pointer">Avaliação Neurológica</h2>
              <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest truncate">Protocolo SCAT6 & VOMS pediátrico</p>
            </div>
          </TestInfoModal>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-start md:justify-between gap-4 md:gap-0 overflow-x-auto no-scrollbar px-4 sm:px-6 py-4 my-2 w-full max-w-4xl mx-auto shrink-0">
        {formSteps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div 
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all shrink-0 ${step === s.id ? 'scale-110' : 'opacity-40'}`}
              onClick={() => setStep(s.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] md:text-xs font-black uppercase tracking-widest text-center max-w-[5rem] md:max-w-[7rem] leading-tight mt-1">{s.title}</span>
            </div>
            {i < formSteps.length - 1 && (
              <div className={`w-8 md:flex-1 h-[2px] shrink-0 mb-8 mx-2 ${step > s.id ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 sm:px-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-8 h-full">

          {/* TAB 1: SINTOMAS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <TestInfoModal
                 title="Questionário de Sintomas"
                 indication="Identificação e quantificação dos sintomas relatados pelo atleta."
                 application="O atleta deve graduar cada sintoma baseado em como se sente AGORA (0 = Nenhum, 6 = Severo)."
                 referenceValues={["Sintomas leves: Score 0-2 dependendo do sintoma", "Sintomas severos: Valores altos (4+) em qualquer sintoma", "Red Flags: Dor de cabeça severa, perda de consciência (ver Red Flags no último passo)"]}
               >
                 <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl cursor-pointer hover:border-slate-500 transition-colors">
                   <p className="text-xs text-slate-400 font-bold flex items-center justify-between">
                     <span>Gradue cada sintoma baseando-se em como o atleta se sente AGORA. (0 = Nenhum, 6 = Severo)</span>
                     <FileQuestion className="w-4 h-4 text-cyan-500 shrink-0" />
                   </p>
                 </div>
               </TestInfoModal>
               
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
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               
               {/* Orientation */}
               <section className="space-y-4">
                 <TestInfoModal
                   title="Orientação (Maddocks / SCAT)"
                   indication="Avaliar a orientação e memória recente (tempo e espaço)."
                   application="Faça as 5 perguntas. O atleta deve responder corretamente. Anote se acertou ou errou."
                   referenceValues={["Sucesso: 5 acertos", "Falha: Qualquer erro pode indicar déficit cognitivo recente decorrente de concussão"]}
                 >
                   <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400 flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors w-fit">
                     1. Orientação (Maddocks / SCAT)
                     <FileQuestion className="w-4 h-4" />
                   </h3>
                 </TestInfoModal>
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
                 <TestInfoModal
                   title="Memória Imediata"
                   indication="Testar a capacidade de retenção imediata."
                   application="Leia a lista de 5 palavras no ritmo de 1 por segundo. Peça ao atleta para repetir o máximo que conseguir (em qualquer ordem). Repita isso por 3 tentativas (T1, T2, T3) usando as mesmas palavras."
                   referenceValues={["Bom: Lembrar todas as 5 na última tentativa", "Atenção: Dificuldade progressiva na retenção"]}
                 >
                   <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400 flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors w-fit">
                     2. Memória Imediata (Liste de Palavras)
                     <FileQuestion className="w-4 h-4" />
                   </h3>
                 </TestInfoModal>
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
                 <TestInfoModal
                   title="Concentração (Dígitos Inversos/Meses)"
                   indication="Avaliar a atenção sustentada e a memória de trabalho."
                   application="Leia os blocos numéricos (1 por segundo). O atleta deve repeti-los na ordem INVERSA. Para os meses, peça que diga os meses do ano de trás para frente."
                   referenceValues={["Passar 3 e 4 dígitos: Mínimo esperado", "Falhar em sequências simples: Comprometimento de atenção"]}
                 >
                   <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400 flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors w-fit">
                     3. Concentração (Dígitos Inversos)
                     <FileQuestion className="w-4 h-4" />
                   </h3>
                 </TestInfoModal>
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
                 <TestInfoModal
                   title="Memória Tardia"
                   indication="Testar a consolidação da memória em curto prazo."
                   application="Após pelo menos 5 minutos da primeira lista, peça ao atleta que lembre das 5 palavras anteriores sem dica."
                   referenceValues={["Normal: 4 a 5 palavras", "Alterado: Menos de 3 palavras podem sugerir perda de fixação do aprendizado"]}
                 >
                   <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400 flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors w-fit">
                     4. Memória Tardia (Após 5 min)
                     <FileQuestion className="w-4 h-4" />
                   </h3>
                 </TestInfoModal>
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
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               {/* mBESS */}
               <section className="space-y-4">
                 <TestInfoModal
                   title="modified BESS (mBESS)"
                   indication="Testar o equilíbrio estático postural."
                   application="3 posições (Pés Juntos, 1 Perna, Tandem/Ponta-calcanhar), pés descalços, olhos fechados. Conte os erros por 20 segundos em cada (Máx 10 por posição)."
                   referenceValues={["Erros que pontuam: Abrir olhos, tirar mãos da crista ilíaca, dar passo/tropeçar, flexão > 30º, ficar fora da posição > 5 seg"]}
                 >
                   <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400 flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors w-fit">
                     1. modified BESS (Erros em 20s, chão firme)
                     <FileQuestion className="w-4 h-4" />
                   </h3>
                 </TestInfoModal>
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
                 <TestInfoModal
                   title="Tandem Gait Test"
                   indication="Avaliar a locomoção, coordenação dinâmica e controle motor fino."
                   application="Aplicar uma fita de 3m no chão. O atleta deve marchar (sem tênis) colocando o calcanhar de um pé colado na ponta do outro pé, até o fim da linha, girar rapidamente 180º e voltar."
                   referenceValues={["Falhas (Marcar NÃO): Sair da linha, afastar o calcanhar do dedo (>1cm), agarrar/Tocar algo", "Tempo normal sugerido: Geralmente abaixo de 14 segundos"]}
                 >
                   <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400 flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors w-fit">
                     2. Tandem Gait Test
                     <FileQuestion className="w-4 h-4" />
                   </h3>
                 </TestInfoModal>
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
                 <TestInfoModal
                   title="Teste Dedo-Nariz (Finger-to-Nose)"
                   indication="Avaliar a função cerebelar (discriminação e controle)."
                   application="Sentado, olhos fechados. O atleta abre os braços (ombros 90°) e aponta o indicador de forma rápida e precisa para a ponta de seu próprio nariz assim que o avaliador ordenar."
                   referenceValues={["Falha: Errar o nariz (dismetria), tremores ou realizar o movimento muito devagar."]}
                 >
                   <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400 flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors w-fit">
                     3. Coordenação (Dedo-Nariz)
                     <FileQuestion className="w-4 h-4" />
                   </h3>
                 </TestInfoModal>
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
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <TestInfoModal
                 title="VOMS (Vestibular/Ocular Motor Screening)"
                 indication="Identificar e quantificar disfunções oculomotoras e vestibulares."
                 application="Em cada teste (como saccades, VOR), o atleta pode sentir os sintomas exacerbados ou provocados. Questione imediatamente após e anote o aumento na dor de cabeça, tontura, náusea ou névoa (0 a 10)."
                 referenceValues={["Normal: Sem alteração dos sintomas de baseline", "Positivo: Piora de 2 ou mais pontos nos sintomas após a manobra específica"]}
               >
                 <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl cursor-pointer hover:border-slate-500 transition-colors">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex justify-between items-center">
                     <span>Vestibular/Ocular Motor Screening (Score de provocação 0-10)</span>
                     <FileQuestion className="w-4 h-4 text-cyan-500 shrink-0" />
                   </p>
                 </div>
               </TestInfoModal>

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
                             {field.application ? (
                               <TestInfoModal
                                 title={field.label}
                                 indication={"Screening Vestibular/Oculomotor para " + field.label}
                                 application={field.application}
                                 referenceValues={field.reference}
                               >
                                 <div className="text-sm font-bold text-slate-200 cursor-pointer hover:text-cyan-400 transition-colors flex items-center gap-1.5 w-fit">
                                   {field.label}
                                   <FileQuestion className="w-3.5 h-3.5 text-slate-500" />
                                 </div>
                               </TestInfoModal>
                             ) : (
                               <div className="text-sm font-bold text-slate-200">{field.label}</div>
                             )}
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
                   <TestInfoModal
                     title="Near Point of Convergence (NPC)"
                     indication="Testar a convergência ocular e medir o limite visual."
                     application="Aproxime o dedo ou alvo visual na linha média até a ponta do nariz. Pare quando o atleta relatar 'visão dupla' ou quando os olhos desviarem. Tire a medida 3 vezes e tire a média."
                     referenceValues={["Normal: Menos de 5cm de distância", "Anormal: Consegue focar apenas além de 5cm de distância (indicativo da Concussão)"]}
                   >
                     <h4 className="text-sm font-bold text-white mb-1 w-fit cursor-pointer flex items-center gap-2 hover:text-indigo-300 transition-colors">
                       Near Point of Convergence (NPC)
                       <FileQuestion className="w-4 h-4 text-slate-400" />
                     </h4>
                   </TestInfoModal>
                   <p className="text-xs text-slate-500 font-bold uppercase mt-1">Distância até visão dupla, ou até a caneta tocar o nariz (cm).</p>
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
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               
               {/* Pediatric Flags */}
               <section className="space-y-4">
                 <TestInfoModal
                   title="Ativação Pediatria (Red Flags Comportamentais)"
                   indication="Identificar sinais de fadiga ou alteração comportamental precoce."
                   application="Pergunte aos pais, professor ou responsável sobre o comportamento recente da criança, fora do campo mental natural."
                   referenceValues={["Sem alerta: Nenhuma atitude suspeita", "Atenção (Marcar): Alteração aguda em comportamento, queda em notas, choro/birra anormais, insônia ou letargia."]}
                 >
                   <h3 className="text-sm font-black text-white uppercase tracking-widest text-indigo-400 flex items-center gap-2 cursor-pointer hover:text-indigo-300 transition-colors w-fit">
                     Ativação Pediatria (Pais/Relato)
                     <FileQuestion className="w-4 h-4" />
                   </h3>
                 </TestInfoModal>
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
                 <TestInfoModal
                   title="Red Flags Absolutos"
                   indication="Sinais de gravidade extrema ou suspeita de lesões estruturais severas."
                   application="Observe no paciente (ou pergunte) os itens listados. A resposta afirmativa de qualquer um exige interrupção e encaminhamento."
                   referenceValues={["Crítico: Qualquer Red Flag ativada obriga a ida ao Pronto-Socorro com remoção segura e acompanhamento!"]}
                 >
                   <div className="flex items-center gap-3 w-fit cursor-pointer hover:opacity-80 transition-opacity mb-4">
                     <AlertTriangle className="w-5 h-5 text-rose-500" />
                     <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                       RED FLAGS IMEDIATOS
                       <FileQuestion className="w-4 h-4 text-rose-400" />
                     </h3>
                   </div>
                 </TestInfoModal>
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

          {/* TAB 6: RESULTADO */}
          {step === 6 && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="bg-slate-800/50 p-6 flex flex-col items-center justify-center text-center border-b border-slate-800">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Pontuação Geral (0-100)</p>
                  <div className={`text-6xl font-black mb-3 ${classification.color === 'emerald' ? 'text-emerald-400' : classification.color === 'amber' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {score}
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-widest ${classification.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : classification.color === 'amber' ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-rose-500/10 border-rose-500 text-rose-400'}`}>
                    {classification.label}
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {alerts.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Alertas e Risco Detectados</h4>
                      {alerts.map((alert, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-red-500/10 text-red-400 px-4 py-3 rounded-xl border border-red-500/20">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="text-sm font-bold">{alert}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white uppercase tracking-widest text-xs font-black h-14 rounded-xl">
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    ) : (
                      <Save className="w-5 h-5 mr-3" />
                    )}
                    {isSaving ? 'Salvando...' : 'Salvar Avaliação'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
