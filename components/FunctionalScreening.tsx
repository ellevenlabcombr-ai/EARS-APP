"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const { t } = useLanguage();
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

      // Final score is the lower of the two sides for asymmetrical tests
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

  // Derived Values & Alerts
  const processedScores = useMemo(() => {
    const updated = { ...scores };
    
    // Apply pain overrides
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

    let focus = t('func.focus.control');
    if (mobility <= stability && mobility <= control) focus = t('func.focus.mobility');
    else if (stability <= mobility && stability <= control) focus = t('func.focus.stability');

    return { mobility, stability, control, focus };
  }, [processedScores, t]);

  const radarData = useMemo(() => [
    { subject: t('func.focus.mobility'), A: categories.mobility, fullMark: 3 },
    { subject: t('func.focus.stability'), A: categories.stability, fullMark: 3 },
    { subject: t('func.focus.control'), A: categories.control, fullMark: 3 },
  ], [categories, t]);

  const tests = [
    { 
      id: 'deep_squat', 
      label: t('func.tests.deep_squat'), 
      asymmetric: false,
      compensations: [
        t('func.comp.knee_valgus'),
        t('func.comp.heel_lift'),
        t('func.comp.trunk_forward'),
        t('func.comp.arms_fall')
      ]
    },
    { 
      id: 'hurdle_step', 
      label: t('func.tests.hurdle_step'), 
      asymmetric: true,
      compensations: [
        t('func.comp.loss_balance'),
        t('func.comp.hurdle_contact'),
        t('func.comp.lateral_lean'),
        t('func.comp.external_rotation')
      ]
    },
    { 
      id: 'inline_lunge', 
      label: t('func.tests.inline_lunge'), 
      asymmetric: true,
      compensations: [
        t('func.comp.loss_balance'),
        t('func.comp.knee_not_touching'),
        t('func.comp.trunk_forward'),
        t('func.comp.feet_not_aligned')
      ]
    },
    { 
      id: 'shoulder_mobility', 
      label: t('func.tests.shoulder_mobility'), 
      asymmetric: true,
      clearing: 'shoulder',
      compensations: [
        t('func.comp.distance_gt_1_5'),
        t('func.comp.pain_clearing'),
        t('func.comp.winging_scapula')
      ]
    },
    { 
      id: 'active_straight_leg_raise', 
      label: t('func.tests.active_straight_leg_raise'), 
      asymmetric: true,
      compensations: [
        t('func.comp.support_leg_flexes'),
        t('func.comp.raised_leg_flexes'),
        t('func.comp.pelvic_rotation'),
        t('func.comp.support_foot_external')
      ]
    },
    { 
      id: 'trunk_stability_push_up', 
      label: t('func.tests.trunk_stability_push_up'), 
      asymmetric: false,
      clearing: 'spine_extension',
      compensations: [
        t('func.comp.hip_lag'),
        t('func.comp.lumbar_extension'),
        t('func.comp.unable_lift_unit')
      ]
    },
    { 
      id: 'rotary_stability', 
      label: t('func.tests.rotary_stability'), 
      asymmetric: true,
      clearing: 'spine_flexion',
      compensations: [
        t('func.comp.loss_balance'),
        t('func.comp.unable_touch_elbow_knee'),
        t('func.comp.excessive_compensation')
      ]
    }
  ];

  const handleSave = () => {
    onSave({
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
  };

  const getScoreColor = (score: number) => {
    if (score === 3) return 'text-emerald-400';
    if (score === 2) return 'text-cyan-400';
    if (score === 1) return 'text-amber-400';
    return 'text-rose-400';
  };

  const riskColor = alerts.risk === 'high' ? 'text-rose-400' : alerts.risk === 'moderate' ? 'text-amber-400' : 'text-emerald-400';
  const riskBg = alerts.risk === 'high' ? 'bg-rose-500/10' : alerts.risk === 'moderate' ? 'bg-amber-500/10' : 'bg-emerald-500/10';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Accessibility className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">{t('func.title')}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('func.subtitle')}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tests */}
        <div className="lg:col-span-8 space-y-6">
          {tests.map((test) => (
            <Card key={test.id} className="bg-slate-900/40 border-slate-800/50 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Test Info & Scoring */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">{test.label}</h3>
                      <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold uppercase flex items-center gap-2">
                        <span className={getScoreColor(processedScores[test.id].score)}>{t('func.score_final')}: {processedScores[test.id].score}</span>
                        {processedScores[test.id].score === 0 && <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />}
                      </div>
                    </div>

                    {test.asymmetric ? (
                      <div className="grid grid-cols-2 gap-4">
                        {['left', 'right'].map((side) => (
                          <div key={side} className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{side === 'left' ? t('func.side_left') : t('func.side_right')}</p>
                              {test.asymmetric && side === 'right' && Math.abs((scores[test.id].left ?? 0) - (scores[test.id].right ?? 0)) >= 2 && (
                                <AlertCircle className="w-3 h-3 text-amber-400" />
                              )}
                            </div>
                            <div className="flex items-center justify-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                              {[0, 1, 2, 3].map((val) => (
                                <button
                                  key={val}
                                  onClick={() => handleScoreChange(test.id, side as 'left' | 'right', val)}
                                  className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-black transition-all ${
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
                          <span className={`text-[9px] font-bold uppercase ${clearingTests[test.clearing!].pain ? 'text-rose-400' : 'text-slate-500'}`}>{t('func.clearing_prompt')}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleClearingTest(test.clearing!, false)}
                            className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-all ${!clearingTests[test.clearing!].pain ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}
                          >
                            {t('func.no_pain')}
                          </button>
                          <button 
                            onClick={() => handleClearingTest(test.clearing!, true)}
                            className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-all ${clearingTests[test.clearing!].pain ? 'bg-rose-500 text-white' : 'text-slate-500'}`}
                          >
                            {t('func.with_pain')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compensations Checklist */}
                  <div className="w-full md:w-64 space-y-3">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t('func.compensations')}</p>
                    <div className="space-y-1">
                      {test.compensations.map((comp) => (
                        <button
                          key={comp}
                          onClick={() => toggleCompensation(test.id, comp)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[9px] font-medium transition-all flex items-center justify-between ${
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
        </div>

        {/* Right Column: Summary & Analysis */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-slate-900/80 border-slate-700 sticky top-6 overflow-hidden">
            <div className={`h-1 ${riskBg} w-full`} />
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t('func.score_label')}</p>
                <div className={`text-7xl font-black mb-1 ${riskColor}`}>{totalScore}</div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('func.score_max')}</p>
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
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{t('func.risk_analysis')}</h4>
                    <ShieldCheck className={`w-4 h-4 ${riskColor}`} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{t('func.risk_status')}</span>
                      <span className={`text-[10px] font-black uppercase ${riskColor}`}>
                        {alerts.risk === 'high' ? t('func.risk_high') : alerts.risk === 'moderate' ? t('func.risk_moderate') : t('func.risk_low')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{t('func.corrective_focus')}</span>
                      <span className="text-[10px] font-black text-cyan-400 uppercase">{categories.focus}</span>
                    </div>
                  </div>
                </div>

                {/* Clinical Alerts */}
                {(alerts.pain_override || alerts.asymmetry_alert || alerts.severe_dysfunction) && (
                  <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                    <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" /> {t('func.clinical_alerts')}
                    </h4>
                    <div className="space-y-1">
                      {alerts.pain_override && (
                        <div className="flex items-center gap-2 text-[9px] font-bold text-rose-400 uppercase">
                          <Zap className="w-3 h-3" /> {t('func.alerts.pain')}
                        </div>
                      )}
                      {alerts.asymmetry_alert && (
                        <div className="flex items-center gap-2 text-[9px] font-bold text-amber-400 uppercase">
                          <AlertTriangle className="w-3 h-3" /> {t('func.alerts.asymmetry')}
                        </div>
                      )}
                      {alerts.severe_dysfunction && (
                        <div className="flex items-center gap-2 text-[9px] font-bold text-rose-500 uppercase">
                          <AlertCircle className="w-3 h-3" /> {t('func.alerts.dysfunction')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Target className="w-3 h-3" /> {t('func.suggestion_label')}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    {alerts.risk === 'high' 
                      ? t('func.suggestions.high')
                      : alerts.risk === 'moderate'
                      ? t('func.suggestions.moderate')
                      : t('func.suggestions.low')}
                  </p>
                </div>

                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('func.notes_placeholder')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors min-h-[80px] resize-none text-[10px] font-medium"
                />

                <Button 
                  onClick={handleSave}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#050B14] font-black uppercase text-[10px] tracking-widest py-6 rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4 mr-2" /> {t('func.save_btn')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
