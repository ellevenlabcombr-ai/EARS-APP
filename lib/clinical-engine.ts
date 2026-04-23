
import { WellnessRecord, ClinicalTag, RiskCluster, ClinicalInsight } from '../types/clinical-engine'; // Assuming types are in a file or defined here

export interface EngineInput {
  wellnessRecords: WellnessRecord[];
  painReports: any[];
  assessments: any[];
  checkIns: any[];
  alerts: any[];
  clinicalTags?: ClinicalTag[];
  trendScore?: number;
  confidenceScore?: number;
}

export interface EngineOutput {
  clusters: RiskCluster[];
  insight: ClinicalInsight | null;
  decisionMode: 'Conservative' | 'Aggressive';
  decisionExplanation: string;
  interventions: string[];
}

/**
 * Clinical Engine V2 - Dual-Layer Decision Engine
 * Fuses raw metrics into interpreted insights.
 */
export function calculateRiskClusters(input: EngineInput): EngineOutput {
  const { wellnessRecords, painReports, assessments, checkIns, alerts, clinicalTags = [], trendScore = 0, confidenceScore = 0.5 } = input;
  const clusters: RiskCluster[] = [];

  const latestWellness = wellnessRecords[wellnessRecords.length - 1];
  const last3DaysWellness = wellnessRecords.slice(-3);
  
  // Tag Decay Logic
  const activeTags = clinicalTags.map(tag => {
    const weeksOld = Math.max(0, Math.floor((Date.now() - new Date(tag.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const decayedWeight = Math.max(0, tag.weight * Math.pow(0.9, weeksOld));
    return { ...tag, currentWeight: decayedWeight };
  }).filter(tag => tag.currentWeight > 0.5); 

  const totalTagWeight = activeTags.reduce((sum, tag) => sum + tag.currentWeight, 0);

  // 1. MECHANICAL OVERLOAD (Fusing Pain + Load + Tags + Trends)
  const recentPain = painReports.filter(p => new Date(p.created_at || p.record_date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
  const highPainReports = recentPain.filter(p => p.pain_level >= 5);
  const moderatePainReports = recentPain.filter(p => p.pain_level >= 4);

  const recentLoad = checkIns.slice(-3).reduce((acc, ci) => acc + ((ci.intensity || ci.mapped_rpe || 5) * (ci.duration_minutes || 60)), 0) / (checkIns.slice(-3).length || 1);
  const chronicLoad = checkIns.length > 0 ? (checkIns.reduce((acc, ci) => acc + ((ci.intensity || ci.mapped_rpe || 5) * (ci.duration_minutes || 60)), 0) / checkIns.length) : (recentLoad || 100);
  const acwr = recentLoad / chronicLoad;

  const hasSignificantPain = highPainReports.length >= 2 || (moderatePainReports.length >= 3);
  const isDangerousSpike = acwr > 1.5;
  
  // Cross-Assessment Junction
  const hasStructuralRisk = assessments.some(a => 
    (a.type?.toLowerCase().includes('ortho') || a.type?.toLowerCase().includes('biomech')) && 
    (a.score < 60 || a.classification?.toLowerCase().includes('risk'))
  );

  if (hasSignificantPain || acwr > 1.3 || isDangerousSpike || hasStructuralRisk) {
    const trendImpact = trendScore < -0.3 ? 15 : 0;
    const baseScore = acwr > 1.5 ? 85 : 60;
    const finalScore = Math.min(100, baseScore + (totalTagWeight * 6) + trendImpact);
    
    clusters.push({
      id: 'mech-overload',
      label: 'Sobrecarga Mecânica',
      score: finalScore,
      trend: trendScore < -0.3 ? 'up' : 'stable',
      factors: [
        hasSignificantPain ? `Dor recorrente` : null,
        acwr > 1.3 ? `Alta carga (ACWR: ${acwr.toFixed(2)})` : null,
        hasStructuralRisk ? 'Risco Estrutural' : null
      ].filter(Boolean) as string[],
      action: finalScore > 80 ? 'Análise imediata de carga' : 'Prevenção de sobrecarga'
    });
  }

  // RECOVERY DEFICIT
  if (latestWellness) {
    const lowReadiness = (latestWellness.readiness_score || 0) < 65;
    const recoverySignals = (lowReadiness ? 1 : 0) + (trendScore < -0.2 ? 1.5 : 0) + (totalTagWeight > 2 ? 1 : 0);

    if (recoverySignals >= 1.5) {
      clusters.push({
        id: 'recov-deficit',
        label: 'Déficit de Recuperação Comb.',
        score: Math.min(100, 50 + recoverySignals * 10),
        trend: trendScore < -0.5 ? 'up' : 'stable',
        factors: [
          lowReadiness ? 'Prontidão sistêmica reduzida' : null,
          trendScore < -0.2 ? 'Tendência de queda na prontidão' : null
        ].filter(Boolean) as string[],
        action: 'Otimizar janelas de recuperação'
      });
    }
  }

  // Filter & Prioritize output
  const filteredClusters = clusters.filter(c => c.score >= 50); 
  const sortedClusters = [...filteredClusters].sort((a, b) => b.score - a.score).slice(0, 2); 

  // Decision Layer Integration
  let decisionMode: 'Conservative' | 'Aggressive' = 'Aggressive';
  let decisionExplanation = 'Sinais estáveis.';

  if (sortedClusters.length > 0 || trendScore < -0.4) {
    decisionMode = 'Conservative';
    decisionExplanation = trendScore < -0.4 ? 'Tendência negativa sugere cautela.' : 'Agrupadores de risco ativos.';
  }

  const interventions: string[] = [];
  if (decisionMode === 'Conservative') {
    interventions.push('Reduzir volume e intensidade');
    if (confidenceScore < 0.5) interventions.push('Confirmar dados com o atleta');
  } else {
    interventions.push('Progredir conforme planejado');
  }

  let insight: ClinicalInsight | null = null;
  if (sortedClusters.length > 0) {
    insight = {
      riskLabel: sortedClusters[0].label,
      reason: `Baseado em tendência (${trendScore.toFixed(1)}) e histórico.`,
      suggestion: sortedClusters[0].action || 'Monitorar resposta.',
      priority: sortedClusters[0].score > 80 ? 'critical' : 'high'
    };
  }

  return { clusters: sortedClusters, insight, decisionMode, decisionExplanation, interventions };
}
