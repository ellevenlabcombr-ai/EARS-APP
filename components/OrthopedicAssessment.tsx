"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Stethoscope, ChevronRight, ArrowLeft, Save, CheckCircle2,
  FileQuestion, Eye, Activity, CheckSquare, TriangleAlert, ShieldAlert, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TestInfoModal } from "@/components/TestInfoModal";

interface OrthopedicAssessmentProps {
  athleteId: string;
  athleteName?: string;
  onBack: () => void;
  onSave: (score: number, data: any) => void;
}

type Tab = 'anamnese' | 'inspecao' | 'mobilidade' | 'funcional' | 'especificos' | 'redflags';

export function OrthopedicAssessment({ athleteId, athleteName, onBack, onSave }: OrthopedicAssessmentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('anamnese');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // === MÓDULO 1: ANAMNESE ===
  const [anamnese, setAnamnese] = useState({
    senteDorHoje: false,
    ondeDoi: [] as string[],
    intensidade: 0,
    quandoAparece: [] as string[],
    haQuantoTempo: '',
    lesaoDiagnosticada: false,
    lesoes: [{
      tipoLesao: [] as string[],
      qualRegiao: '',
      afastado: '',
      mesmoLocal: false
    }],
    cresceuRapido: '',
    menosFlexivel: '',
    dorAumentou: ''
  });

  const addLesao = () => {
    setAnamnese({
      ...anamnese,
      lesoes: [...anamnese.lesoes, { tipoLesao: [], qualRegiao: '', afastado: '', mesmoLocal: false }]
    });
  };

  const updateLesao = (index: number, field: string, value: any) => {
    const newLesoes = [...anamnese.lesoes];
    newLesoes[index] = { ...newLesoes[index], [field]: value };
    setAnamnese({ ...anamnese, lesoes: newLesoes });
  };

  const removeLesao = (index: number) => {
    const newLesoes = anamnese.lesoes.filter((_, i) => i !== index);
    setAnamnese({ ...anamnese, lesoes: newLesoes });
  };

  const REGIOES = ["Pescoço", "Ombro", "Cotovelo", "Punho/mão", "Coluna torácica", "Lombar", "Quadril/virilha", "Coxa", "Joelho", "Canela", "Tornozelo", "Pé"];
  const QUANDO_APARECE = ["Em repouso", "Durante treino", "Após treino", "Ao acordar", "Em saltos", "Em corrida", "Em mudanças de direção"];
  const TEMPO_DOR = ["<7 dias", "1 a 4 semanas", "1 mês", "Intermitente há meses"];
  const TIPO_LESAO = ["Entorse", "Fratura", "Luxação", "Tendinite", "Lesão muscular", "Cirurgia", "Outra"];
  const AFASTADO = ["Não", "<1 semana", "1 a 4 semanas", "1 mês"];

  // === MÓDULO 2: INSPEÇÃO ESTÁTICA ===
  const [inspecao, setInspecao] = useState({
    coluna: { cabecaAnteriorizada: 0, ombros: 0, escoliose: 0, cifose: 0, lordose: 0 },
    pelve: { inclinacao: 0, rotacao: 0 },
    joelhos: { valgo: 0, varo: 0, recurvato: 0 },
    pes: { plano: 0, cavo: 0, pronacao: 0, assimetria: 0 }
  });

  // === MÓDULO 3: MOBILIDADE ===
  const [mobilidade, setMobilidade] = useState({
    kneeDir: '',
    kneeEsq: '',
    quadrilRotacao: '',
    quadrilFlexao: '',
    isquios: '',
    ombro: ''
  });

  // === MÓDULO 4: FUNCIONAL ===
  const [funcional, setFuncional] = useState({
    agachamento: 0,
    slsDirValgo: false, slsDirQueda: false, slsDirTremor: false, slsDirDor: false,
    slsEsqValgo: false, slsEsqQueda: false, slsEsqTremor: false, slsEsqDor: false,
    stepDown: '',
    salto: '',
    equilibrio: ''
  });

  // === MÓDULO 5: ESPECÍFICOS ===
  const [especificos, setEspecificos] = useState({
    joelho: [] as string[],
    tornozelo: [] as string[],
    coluna: [] as string[],
    ombro: [] as string[]
  });

  // === MÓDULO 6: RED FLAGS ===
  const [redflags, setRedflags] = useState({
    dorNoturna: false,
    claudicacao: false,
    travamento: false,
    edema: false,
    perdaForca: false,
    estaloInstabilidade: false,
    dorOssea: false,
    escolioseProg: false
  });

  const handleSave = async () => {
    setIsSaving(true);
    
    // Cálculo de Score Simulando a Lógica Completa
    const hasRedFlag = Object.values(redflags).some(v => v);
    let tempScore = 100;
    
    if (hasRedFlag) {
      tempScore = 30;
    } else {
      if (anamnese.senteDorHoje && anamnese.intensidade > 5) tempScore -= 30;
      else if (anamnese.senteDorHoje) tempScore -= 10;
      
      if (anamnese.lesaoDiagnosticada) tempScore -= 10;
      if (funcional.agachamento > 1) tempScore -= 10;
      
      const inspSum = Object.values(inspecao).reduce((acc, section) => 
        acc + Object.values(section).reduce((a, b) => a + Number(b), 0), 0
      );
      tempScore -= (inspSum * 2);
    }
    
    tempScore = Math.max(0, Math.min(100, Math.floor(tempScore)));

    await onSave(tempScore, {
      anamnese, inspecao, mobilidade, funcional, especificos, redflags
    });
    
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onBack();
    }, 1500);
  };

  const TABS = [
    { id: 'anamnese', label: 'Anamnese', icon: FileQuestion },
    { id: 'inspecao', label: 'Inspeção', icon: Eye },
    { id: 'mobilidade', label: 'Mobilidade', icon: Activity },
    { id: 'funcional', label: 'Funcional', icon: CheckSquare },
    { id: 'especificos', label: 'Específicos', icon: TriangleAlert },
    { id: 'redflags', label: 'Flags', icon: ShieldAlert },
  ] as const;

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-4 sm:px-8 bg-[#0A1120]/80 backdrop-blur-xl shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white mr-2 sm:mr-4 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 hidden sm:flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <TestInfoModal
              title="Avaliação Ortopédica"
              indication="Rastreamento de dores, histórico de lesões e testes de mobilidade/força avançada."
              application="Através de questionário e testes visuais (estáticos/funcionais)."
            >
              <div className="text-left">
                <h2 className="text-lg font-black text-white uppercase tracking-tight hover:text-cyan-400 transition-colors cursor-pointer truncate">
                  Avaliação Ortopédica
                </h2>
                <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate">
                  Prevenção de Lesões e Dor
                </p>
              </div>
            </TestInfoModal>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving || showSuccess}
          className={`px-4 sm:px-6 py-2 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${
            showSuccess ? "bg-emerald-500 text-slate-900" : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"
          }`}
        >
          {isSaving ? <span className="animate-pulse">...</span> : showSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span className="hidden sm:inline">{showSuccess ? 'Salvo' : 'Finalizar'}</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="flex items-center overflow-x-auto no-scrollbar px-4 py-4 shrink-0 gap-4 max-w-5xl mx-auto w-full">
        {TABS.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <div key={t.id} onClick={() => setActiveTab(t.id)} className={`cursor-pointer shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${isActive ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}>
              <t.icon className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>
            </div>
          )
        })}
      </div>

      {/* Content */}
      <div className="px-4 sm:px-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-8 h-full">

          {/* === TAB 1: ANAMNESE === */}
          {activeTab === 'anamnese' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest text-cyan-400">1. Dor Atual</h3>
                <Card className="bg-slate-900/40 border-slate-800 p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-200">Você sente dor hoje?</span>
                      <div className="flex gap-2">
                         <Button variant={anamnese.senteDorHoje ? "default" : "outline"} onClick={() => setAnamnese({...anamnese, senteDorHoje: true})} className={`${anamnese.senteDorHoje ? 'bg-rose-500 hover:bg-rose-600' : 'border-slate-700'}`}>Sim</Button>
                         <Button variant={!anamnese.senteDorHoje ? "default" : "outline"} onClick={() => setAnamnese({...anamnese, senteDorHoje: false})} className={`${!anamnese.senteDorHoje ? 'bg-emerald-500 hover:bg-emerald-600' : 'border-slate-700'}`}>Não</Button>
                      </div>
                    </div>

                    {anamnese.senteDorHoje && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Onde dói?</label>
                          <div className="flex flex-wrap gap-2">
                            {REGIOES.map(reg => (
                              <button key={reg} onClick={() => setAnamnese({...anamnese, ondeDoi: toggleArrayItem(anamnese.ondeDoi, reg)})}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${anamnese.ondeDoi.includes(reg) ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                                {reg}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Intensidade (0 a 10) : <span className="text-rose-400 text-lg">{anamnese.intensidade}</span></label>
                          <input type="range" min="0" max="10" value={anamnese.intensidade} onChange={(e) => setAnamnese({...anamnese, intensidade: Number(e.target.value)})} className="w-full accent-rose-500" />
                          <div className="flex justify-between text-xs font-medium text-slate-500"><span>0 - Nenhuma</span><span>10 - Máxima</span></div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">A dor aparece:</label>
                          <div className="flex flex-wrap gap-2">
                            {QUANDO_APARECE.map(q => (
                              <button key={q} onClick={() => setAnamnese({...anamnese, quandoAparece: toggleArrayItem(anamnese.quandoAparece, q)})}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${anamnese.quandoAparece.includes(q) ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Há quanto tempo?</label>
                          <div className="flex flex-wrap gap-2">
                            {TEMPO_DOR.map(t => (
                              <button key={t} onClick={() => setAnamnese({...anamnese, haQuantoTempo: t})}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${anamnese.haQuantoTempo === t ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest text-cyan-400">2. Histórico Ortopédico</h3>
                <Card className="bg-slate-900/40 border-slate-800 p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-200">Já teve lesão esportiva diagnosticada?</span>
                      <div className="flex gap-2">
                         <Button variant={anamnese.lesaoDiagnosticada ? "default" : "outline"} onClick={() => setAnamnese({...anamnese, lesaoDiagnosticada: true})} className={`${anamnese.lesaoDiagnosticada ? 'bg-cyan-500 text-slate-900' : 'border-slate-700'}`}>Sim</Button>
                         <Button variant={!anamnese.lesaoDiagnosticada ? "default" : "outline"} onClick={() => setAnamnese({...anamnese, lesaoDiagnosticada: false})} className={`${!anamnese.lesaoDiagnosticada ? 'bg-slate-700 text-white' : 'border-slate-700'}`}>Não</Button>
                      </div>
                    </div>

                    {anamnese.lesaoDiagnosticada && (
                      <div className="space-y-6">
                        {anamnese.lesoes.map((lesao, idx) => (
                          <div key={idx} className="space-y-4 p-4 border border-slate-700/50 rounded-xl relative">
                            {anamnese.lesoes.length > 1 && (
                              <button onClick={() => removeLesao(idx)} className="absolute top-2 right-2 p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400 rounded-lg">
                                <TriangleAlert className="w-4 h-4 hidden" /> {/* Just to not import X if not used, or use text */}
                                <span className="text-xxs font-bold uppercase">Remover</span>
                              </button>
                            )}
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Lesão {idx + 1}</h4>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quais?</label>
                              <div className="flex flex-wrap gap-2">
                                {TIPO_LESAO.map(t => {
                                  const isSelected = lesao.tipoLesao.includes(t);
                                  return (
                                    <button key={t} onClick={() => updateLesao(idx, 'tipoLesao', toggleArrayItem(lesao.tipoLesao, t))}
                                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${isSelected ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                                      {t}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Em qual região?</label>
                              <input type="text" value={lesao.qualRegiao} onChange={(e) => updateLesao(idx, 'qualRegiao', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-slate-200" placeholder="Ex: Joelho direito" />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ficou afastado do esporte?</label>
                              <div className="flex flex-wrap gap-2">
                                {AFASTADO.map(t => (
                                  <button key={t} onClick={() => updateLesao(idx, 'afastado', t)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${lesao.afastado === t ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                              <span className="text-sm font-bold text-slate-200">Já lesionou o mesmo local mais de uma vez?</span>
                              <div className="flex gap-2">
                                <Button variant={lesao.mesmoLocal ? "default" : "outline"} onClick={() => updateLesao(idx, 'mesmoLocal', true)} className={`${lesao.mesmoLocal ? 'bg-rose-500 hover:bg-rose-600' : 'border-slate-700'}`}>Sim</Button>
                                <Button variant={!lesao.mesmoLocal ? "default" : "outline"} onClick={() => updateLesao(idx, 'mesmoLocal', false)} className={`${!lesao.mesmoLocal ? 'bg-slate-700 hover:bg-slate-600' : 'border-slate-700'}`}>Não</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" onClick={addLesao} className="w-full border-dashed border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300">
                          + Adicionar outra lesão
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest text-cyan-400">3. Crescimento Relacionado</h3>
                <Card className="bg-slate-900/40 border-slate-800 p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-200">Cresceu rápido nos últimos meses?</span>
                      <div className="flex gap-2">
                        {['Sim', 'Não', 'Não sabe'].map(opt => (
                          <Button key={opt} variant={anamnese.cresceuRapido === opt ? "default" : "outline"} size="sm" onClick={() => setAnamnese({...anamnese, cresceuRapido: opt})} className={`${anamnese.cresceuRapido === opt ? 'bg-purple-500' : 'border-slate-700'}`}>{opt}</Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-200">Ficou mais &quot;duro&quot; ou menos flexível recentemente?</span>
                      <div className="flex gap-2">
                        {['Sim', 'Não'].map(opt => (
                          <Button key={opt} variant={anamnese.menosFlexivel === opt ? "default" : "outline"} size="sm" onClick={() => setAnamnese({...anamnese, menosFlexivel: opt})} className={`${anamnese.menosFlexivel === opt ? 'bg-purple-500' : 'border-slate-700'}`}>{opt}</Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-200">Dor aumentou após fase de crescimento?</span>
                      <div className="flex gap-2">
                        {['Sim', 'Não'].map(opt => (
                          <Button key={opt} variant={anamnese.dorAumentou === opt ? "default" : "outline"} size="sm" onClick={() => setAnamnese({...anamnese, dorAumentou: opt})} className={`${anamnese.dorAumentou === opt ? 'bg-rose-500' : 'border-slate-700'}`}>{opt}</Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            </div>
          )}

          {/* === TAB 2: INSPEÇÃO === */}
          {activeTab === 'inspecao' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl text-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Score de Inspeção: <span className="font-black text-cyan-400">0 (Normal) a 3 (Importante)</span></p>
              </div>

              {[
                { title: 'Coluna', key: 'coluna', items: ['Cabeça anteriorizada', 'Ombros desnivelados', 'Escoliose aparente', 'Hipercifose', 'Hiperlordose'], stateKeys: ['cabecaAnteriorizada', 'ombros', 'escoliose', 'cifose', 'lordose'] },
                { title: 'Pelve', key: 'pelve', items: ['Inclinação pélvica', 'Rotação pélvica'], stateKeys: ['inclinacao', 'rotacao'] },
                { title: 'Joelhos', key: 'joelhos', items: ['Genu valgo', 'Genu varo', 'Recurvato'], stateKeys: ['valgo', 'varo', 'recurvato'] },
                { title: 'Pés', key: 'pes', items: ['Pé plano', 'Pé cavo', 'Pronação excessiva', 'Assimetria entre lados'], stateKeys: ['plano', 'cavo', 'pronacao', 'assimetria'] },
              ].map(group => (
                <section key={group.key} className="space-y-3">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest text-cyan-400">{group.title}</h3>
                  <Card className="bg-slate-900/40 border-slate-800 p-6">
                    <div className="space-y-6">
                      {group.items.map((item, idx) => {
                        const sKey = group.stateKeys[idx] as keyof typeof inspecao[keyof typeof inspecao];
                        const val = (inspecao[group.key as keyof typeof inspecao] as any)[sKey] as number;
                        return (
                          <div key={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <span className="text-sm font-bold text-slate-300">{item}</span>
                            <div className="flex items-center bg-slate-950 p-1 rounded-xl">
                              {[0, 1, 2, 3].map(score => (
                                <button key={score} onClick={() => setInspecao(prev => ({...prev, [group.key]: { ...prev[group.key as keyof typeof inspecao], [sKey]: score }}))}
                                  className={`w-10 h-10 rounded-lg font-black text-sm flex items-center justify-center transition-colors ${val === score ? (score === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500 text-slate-900') : 'text-slate-500 hover:text-slate-300'}`}>
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                </section>
              ))}
            </div>
          )}

          {/* === TAB 3: MOBILIDADE === */}
          {activeTab === 'mobilidade' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest text-cyan-400">Tornozelo (Knee to Wall)</h3>
                <Card className="bg-slate-900/40 border-slate-800 p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">Direito (cm)</label>
                      <input type="number" placeholder="0" value={mobilidade.kneeDir} onChange={(e) => setMobilidade({...mobilidade, kneeDir: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-lg font-black focus:ring-1 focus:ring-cyan-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">Esquerdo (cm)</label>
                      <input type="number" placeholder="0" value={mobilidade.kneeEsq} onChange={(e) => setMobilidade({...mobilidade, kneeEsq: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-lg font-black focus:ring-1 focus:ring-cyan-500 outline-none" />
                    </div>
                  </div>
                  {mobilidade.kneeDir && mobilidade.kneeEsq && Math.abs(Number(mobilidade.kneeDir) - Number(mobilidade.kneeEsq)) > 2 && (
                    <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4" /> Diferença &gt; 2cm: Alerta!
                    </div>
                  )}
                </Card>
              </section>

              {[
                { title: 'Quadril - Rotação Int/Ext', key: 'quadrilRotacao', opts: ['Normal', 'Reduzida', 'Assimétrica'] },
                { title: 'Quadril - Flexão', key: 'quadrilFlexao', opts: ['Livre', 'Restrita', 'Dolorosa'] },
                { title: 'Isquiotibiais (Elevação Perna Reta)', key: 'isquios', opts: ['Normal', 'Restrita D', 'Restrita E', 'Bilateral'] },
                { title: 'Ombro (Apley Scratch Test)', key: 'ombro', opts: ['Normal', 'Restrição Sup.', 'Restrição Inf.', 'Dor'] },
              ].map(t => (
                <section key={t.key} className="space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest text-cyan-400">{t.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {t.opts.map(opt => (
                      <button key={opt} onClick={() => setMobilidade({...mobilidade, [t.key]: opt})}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${mobilidade[t.key as keyof typeof mobilidade] === opt ? 'bg-cyan-500 text-slate-900 border-cyan-500' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* === TAB 4: FUNCIONAL === */}
          {activeTab === 'funcional' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <section className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest text-cyan-400">1. Agachamento Bilateral</h3>
                <Card className="bg-slate-900/40 border-slate-800 p-6 space-y-4">
                  <p className="text-xs text-slate-500 font-bold uppercase">Observar: calcanhar sobe, joelho entra, tronco colapsa, dor</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200 mr-4">Score Total:</span>
                    {[0, 1, 2, 3].map(s => (
                      <button key={s} onClick={() => setFuncional({...funcional, agachamento: s})}
                        className={`w-12 h-12 rounded-xl text-lg font-black transition-colors ${funcional.agachamento === s ? 'bg-cyan-500 text-slate-900' : 'bg-slate-950 text-slate-500 hover:bg-slate-800'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </Card>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest text-cyan-400">2. Single Leg Squat</h3>
                <Card className="bg-slate-900/40 border-slate-800 p-6 space-y-6">
                  {['Dir', 'Esq'].map(lado => (
                    <div key={lado} className="space-y-3">
                      <label className="text-sm font-black text-slate-300 uppercase block border-b border-slate-800 pb-2">Lado {lado === 'Dir' ? 'Direito' : 'Esquerdo'}</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {k: 'Valgo', label: 'Valgo Dinâmico'}, 
                          {k: 'Queda', label: 'Queda Pélvica'}, 
                          {k: 'Tremor', label: 'Tremor'}, 
                          {k: 'Dor', label: 'Dor'}
                        ].map(obs => {
                           const sKey = `sls${lado}${obs.k}` as keyof typeof funcional;
                           const val = funcional[sKey] as boolean;
                           return (
                             <button key={obs.k} onClick={() => setFuncional({...funcional, [sKey]: !val})}
                               className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${val ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                               {obs.label}
                             </button>
                           )
                        })}
                      </div>
                    </div>
                  ))}
                </Card>
              </section>

              {[
                { title: '3. Step Down Test', key: 'stepDown', opts: ['Adequado', 'Compensa', 'Dor', 'Perde alinhamento'] },
                { title: '4. Salto e Aterrissagem', key: 'salto', opts: ['Simétrico', 'Assimétrico', 'Rigidez', 'Colapso joelho'] },
                { title: '5. Equilíbrio Unilateral 30s', key: 'equilibrio', opts: ['Normal', 'Instável', 'Muito instável'] },
              ].map(t => (
                <section key={t.key} className="space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest text-cyan-400">{t.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {t.opts.map(opt => (
                      <button key={opt} onClick={() => setFuncional({...funcional, [t.key]: opt})}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${funcional[t.key as keyof typeof funcional] === opt ? 'bg-cyan-500 text-slate-900 border-cyan-500' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* === TAB 5: ESPECÍFICOS === */}
          {activeTab === 'especificos' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl">
                <p className="text-sm text-slate-300">Selecione apenas os testes realizados e que deram <span className="font-bold text-rose-400">POSITIVO</span> (DOR ou ALTERAÇÃO).</p>
              </div>

              {[
                { title: 'Joelho', key: 'joelho', tests: ['Clarke/PF Compression (Dor patelar)', 'Thessaly (Meniscal)', 'Lachman (LCA)'] },
                { title: 'Tornozelo', key: 'tornozelo', tests: ['Anterior Drawer (Instab)', 'Eversão/Inversão Resistida'] },
                { title: 'Coluna', key: 'coluna', tests: ['Adams Forward Bend (Escoliose)', 'Extensão lombar monopodal (Pars/Stress)'] },
                { title: 'Ombro', key: 'ombro', tests: ['Apprehension Test (Instab)', 'Rotação Comparativa Assimétrica'] },
              ].map(group => (
                <section key={group.title} className="space-y-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest text-cyan-400">{group.title}</h3>
                  <Card className="bg-slate-900/40 border-slate-800 p-6 space-y-3">
                     {group.tests.map(test => {
                       const arr = especificos[group.key as keyof typeof especificos] as string[];
                       const selected = arr.includes(test);
                       return (
                         <label key={test} className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${selected ? 'bg-rose-500/10 border-rose-500' : 'bg-slate-950 border-slate-800 hover:bg-slate-900'}`}>
                           <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border mt-0.5 ${selected ? 'bg-rose-500 border-rose-500' : 'border-slate-600'}`}>
                             {selected && <CheckSquare className="w-3 h-3 text-white" />}
                           </div>
                           <span className={`text-sm font-bold ${selected ? 'text-rose-400' : 'text-slate-300'}`}>{test}</span>
                         </label>
                       )
                     })}
                  </Card>
                </section>
              ))}
            </div>
          )}

          {/* === TAB 6: RED FLAGS === */}
          {activeTab === 'redflags' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex gap-3 text-rose-400">
                <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase">Atenção Médica Imediata</h4>
                  <p className="text-xs">Se qualquer um destes sinais for identificado, encaminhe imediatamente para avaliação médica especializada.</p>
                </div>
              </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'dorNoturna', label: 'Dor noturna persistente' },
                    { key: 'claudicacao', label: 'Claudicação (Mancar)' },
                    { key: 'travamento', label: 'Travamento articular' },
                    { key: 'edema', label: 'Edema persistente' },
                    { key: 'perdaForca', label: 'Perda de força visível' },
                    { key: 'estaloInstabilidade', label: 'Estalo traumático + instabilidade' },
                    { key: 'dorOssea', label: 'Dor óssea localizada contínua' },
                    { key: 'escolioseProg', label: 'Escoliose progressiva rápida' },
                  ].map(flag => {
                     const selected = redflags[flag.key as keyof typeof redflags];
                     return (
                      <button key={flag.key} onClick={() => setRedflags({...redflags, [flag.key]: !selected})}
                        className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-colors ${selected ? 'bg-rose-500 text-white border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900'}`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-white bg-transparent' : 'border-slate-700'}`}>
                          {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm font-bold leading-tight">{flag.label}</span>
                      </button>
                     )
                  })}
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

