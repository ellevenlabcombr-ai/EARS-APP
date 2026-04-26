 
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, AlertTriangle, CheckCircle, Info, ChevronRight, Save, X, Dumbbell, Target, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BiomechanicalAssessmentProps {
  athleteId?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  language?: 'pt' | 'en';
}

const SliderField = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
      <span className="text-[10px] font-bold text-cyan-400">{value}/10</span>
    </div>
    <input 
      type="range" 
      min="0" 
      max="10" 
      step="1" 
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);

export default function BiomechanicalAssessment({ 
  athleteId, 
  onSave, 
  onCancel,
  language = 'pt' 
}: BiomechanicalAssessmentProps) {
  const [step, setStep] = useState(1);
  const [squat, setSquat] = useState({ kneeAlignment: 5, hipControl: 5, trunkControl: 5, depth: 5 });
  const [jump, setJump] = useState({ landingStability: 5, shockAbsorption: 5, kneeAlignment: 5 });
  const [balance, setBalance] = useState({ stability: 5, control: 5 });
  
  const [valgus, setValgus] = useState({ present: false, severity: 5 });
  const [asymmetry, setAsymmetry] = useState({ present: false, severity: 5 });

  const t = {
    pt: {
      title: 'Avaliação Biomecânica',
      subtitle: 'Análise de movimento e risco de lesão',
      squat: 'Agachamento',
      kneeAlignment: 'Alinhamento do Joelho',
      hipControl: 'Controle do Quadril',
      trunkControl: 'Controle do Tronco',
      depth: 'Profundidade',
      jump: 'Salto e Aterrissagem',
      landingStability: 'Estabilidade na Aterrissagem',
      shockAbsorption: 'Absorção de Impacto',
      balance: 'Equilíbrio Unipodal',
      stability: 'Estabilidade',
      control: 'Controle',
      valgus: 'Valgo Dinâmico do Joelho (CRÍTICO)',
      valgusPresent: 'Presença de Valgo Dinâmico',
      severity: 'Gravidade',
      asymmetry: 'Assimetria',
      asymmetryPresent: 'Diferença entre os lados',
      yes: 'Sim',
      no: 'Não',
      score: 'Score Biomecânico',
      riskHigh: 'Alto Risco',
      riskModerate: 'Risco Moderado',
      riskLow: 'Baixo Risco',
      clinicalInterpretation: 'Interpretação Clínica',
      actions: 'Ações Recomendadas',
      save: 'Salvar Avaliação',
      cancel: 'Cancelar',
      highRiskDesc: 'Déficits de movimento significativos detectados, com aumento do risco de lesão, especialmente em atividades de alta carga.',
      modRiskDesc: 'Alterações biomecânicas leves a moderadas. Monitoramento e estratégias corretivas recomendadas.',
      lowRiskDesc: 'Boa qualidade de movimento sem déficits biomecânicos significativos.',
      actionHigh1: 'Reduzir atividades de alto impacto',
      actionHigh2: 'Iniciar exercícios corretivos',
      actionHigh3: 'Monitorar de perto',
      actionMod1: 'Implementar estratégias corretivas',
      actionMod2: 'Monitorar progressão',
      actionLow1: 'Manter treinamento normal',
    },
    en: {
      title: 'Biomechanical Assessment',
      subtitle: 'Movement analysis and injury risk',
      squat: 'Squat Assessment',
      kneeAlignment: 'Knee Alignment',
      hipControl: 'Hip Control',
      trunkControl: 'Trunk Control',
      depth: 'Depth',
      jump: 'Jump & Landing',
      landingStability: 'Landing Stability',
      shockAbsorption: 'Shock Absorption',
      balance: 'Single-Leg Balance',
      stability: 'Stability',
      control: 'Control',
      valgus: 'Dynamic Knee Valgus (CRITICAL)',
      valgusPresent: 'Presence of Dynamic Valgus',
      severity: 'Severity',
      asymmetry: 'Asymmetry',
      asymmetryPresent: 'Side-to-side difference',
      yes: 'Yes',
      no: 'No',
      score: 'Biomechanical Score',
      riskHigh: 'High Risk',
      riskModerate: 'Moderate Risk',
      riskLow: 'Low Risk',
      clinicalInterpretation: 'Clinical Interpretation',
      actions: 'Recommended Actions',
      save: 'Save Assessment',
      cancel: 'Cancel',
      highRiskDesc: 'Significant movement deficits detected, with increased risk of injury, especially in high-load activities.',
      modRiskDesc: 'Mild to moderate biomechanical alterations. Monitoring and corrective strategies recommended.',
      lowRiskDesc: 'Good movement quality with no significant biomechanical deficits.',
      actionHigh1: 'Reduce high-impact activities',
      actionHigh2: 'Start corrective exercises',
      actionHigh3: 'Monitor closely',
      actionMod1: 'Implement corrective strategies',
      actionMod2: 'Monitor progression',
      actionLow1: 'Maintain training',
    }
  };

  const l = t[language];

  // Calculate Score and Risk Level during render
  const squatScore = (squat.kneeAlignment + squat.hipControl + squat.trunkControl + squat.depth) / 4;
  const jumpScore = (jump.landingStability + jump.shockAbsorption + jump.kneeAlignment) / 3;
  const balanceScore = (balance.stability + balance.control) / 2;

  const movementQuality = (squatScore + jumpScore + balanceScore) / 3;

  const valgusPenalty = valgus.present ? valgus.severity : 0;
  const asymmetryPenalty = asymmetry.present ? asymmetry.severity : 0;

  const finalScoreRaw = (
    (movementQuality * 0.7) +
    ((10 - valgusPenalty) * 0.2) +
    ((10 - asymmetryPenalty) * 0.1)
  ) * 10;

  const score = Math.round(finalScoreRaw);

  let riskLevel: 'low' | 'moderate' | 'high' = 'moderate';
  if (score >= 80) riskLevel = 'low';
  else if (score >= 60) riskLevel = 'moderate';
  else riskLevel = 'high';

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      await onSave({
        score,
        riskLevel,
        squat,
        jump,
        balance,
        valgus,
        asymmetry,
        date: new Date().toISOString()
      });
      setIsSaving(false);
    }
  };

  const steps = [
    { id: 1, title: l.squat, icon: Activity },
    { id: 2, title: l.jump, icon: Target },
    { id: 3, title: l.balance, icon: RefreshCw },
    { id: 4, title: 'Indicadores', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">{l.title}</h2>
            <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">{l.subtitle}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-4">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div 
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${step === s.id ? 'scale-110' : 'opacity-40'}`}
              onClick={() => setStep(s.id)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-700 text-slate-500'}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[0.6rem] font-black uppercase tracking-widest text-center max-w-[5rem] leading-tight">{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-2 mb-8 ${step > s.id ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Content Area Based on Step */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="bg-slate-900/40 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" /> {l.squat}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <SliderField label={l.kneeAlignment} value={squat.kneeAlignment} onChange={(v) => setSquat({...squat, kneeAlignment: v})} />
                  <SliderField label={l.hipControl} value={squat.hipControl} onChange={(v) => setSquat({...squat, hipControl: v})} />
                  <SliderField label={l.trunkControl} value={squat.trunkControl} onChange={(v) => setSquat({...squat, trunkControl: v})} />
                  <SliderField label={l.depth} value={squat.depth} onChange={(v) => setSquat({...squat, depth: v})} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="bg-slate-900/40 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" /> {l.jump}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <SliderField label={l.landingStability} value={jump.landingStability} onChange={(v) => setJump({...jump, landingStability: v})} />
                  <SliderField label={l.shockAbsorption} value={jump.shockAbsorption} onChange={(v) => setJump({...jump, shockAbsorption: v})} />
                  <SliderField label={l.kneeAlignment} value={jump.kneeAlignment} onChange={(v) => setJump({...jump, kneeAlignment: v})} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="bg-slate-900/40 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-cyan-400" /> {l.balance}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  <SliderField label={l.stability} value={balance.stability} onChange={(v) => setBalance({...balance, stability: v})} />
                  <SliderField label={l.control} value={balance.control} onChange={(v) => setBalance({...balance, control: v})} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="bg-slate-900/40 border-red-900/30">
                  <CardHeader>
                    <CardTitle className="text-sm font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {l.valgus}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{l.valgusPresent}</span>
                      <div className="flex bg-slate-800 rounded-lg p-1">
                        <button 
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${valgus.present ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-slate-200'}`}
                          onClick={() => setValgus({...valgus, present: true})}
                        >
                          {l.yes}
                        </button>
                        <button 
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${!valgus.present ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                          onClick={() => setValgus({...valgus, present: false})}
                        >
                          {l.no}
                        </button>
                      </div>
                    </div>
                    {valgus.present && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <SliderField label={l.severity} value={valgus.severity} onChange={(v) => setValgus({...valgus, severity: v})} />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-orange-900/30">
                  <CardHeader>
                    <CardTitle className="text-sm font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      {l.asymmetry}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{l.asymmetryPresent}</span>
                      <div className="flex bg-slate-800 rounded-lg p-1">
                        <button 
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${asymmetry.present ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-slate-200'}`}
                          onClick={() => setAsymmetry({...asymmetry, present: true})}
                        >
                          {l.yes}
                        </button>
                        <button 
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${!asymmetry.present ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                          onClick={() => setAsymmetry({...asymmetry, present: false})}
                        >
                          {l.no}
                        </button>
                      </div>
                    </div>
                    {asymmetry.present && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <SliderField label={l.severity} value={asymmetry.severity} onChange={(v) => setAsymmetry({...asymmetry, severity: v})} />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Sidebar */}
        <div className="space-y-6">
          <Card className="bg-slate-900/80 border-slate-700 overflow-hidden sticky top-6">
            <div className={`h-2 w-full ${
              riskLevel === 'high' ? 'bg-red-500' : 
              riskLevel === 'moderate' ? 'bg-orange-500' : 'bg-emerald-500'
            }`} />
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">{l.score}</p>
                <div className="text-6xl font-black text-white mb-2">{score}</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  riskLevel === 'high' ? 'bg-red-500/20 text-red-400' : 
                  riskLevel === 'moderate' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {riskLevel === 'high' ? l.riskHigh : riskLevel === 'moderate' ? l.riskModerate : l.riskLow}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-500 flex items-center gap-2 mb-2">
                    {l.clinicalInterpretation}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {riskLevel === 'high' ? l.highRiskDesc : 
                     riskLevel === 'moderate' ? l.modRiskDesc : l.lowRiskDesc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-3">{l.actions}</h4>
                  <ul className="space-y-2">
                    {riskLevel === 'high' && (
                      <>
                        <li className="flex items-start gap-2 text-xs font-bold text-slate-400">
                          <ChevronRight className="w-4 h-4 text-red-400 shrink-0" />
                          {l.actionHigh1}
                        </li>
                        <li className="flex items-start gap-2 text-xs font-bold text-slate-400">
                          <ChevronRight className="w-4 h-4 text-red-400 shrink-0" />
                          {l.actionHigh2}
                        </li>
                        <li className="flex items-start gap-2 text-xs font-bold text-slate-400">
                          <ChevronRight className="w-4 h-4 text-red-400 shrink-0" />
                          {l.actionHigh3}
                        </li>
                      </>
                    )}
                    {riskLevel === 'moderate' && (
                      <>
                        <li className="flex items-start gap-2 text-xs font-bold text-slate-400">
                          <ChevronRight className="w-4 h-4 text-orange-400 shrink-0" />
                          {l.actionMod1}
                        </li>
                        <li className="flex items-start gap-2 text-xs font-bold text-slate-400">
                          <ChevronRight className="w-4 h-4 text-orange-400 shrink-0" />
                          {l.actionMod2}
                        </li>
                      </>
                    )}
                    {riskLevel === 'low' && (
                      <li className="flex items-start gap-2 text-xs font-bold text-slate-400">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        {l.actionLow1}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              
              <Button onClick={handleSave} disabled={isSaving} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white uppercase tracking-widest text-[10px] font-black">
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Salvando...' : l.save}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
