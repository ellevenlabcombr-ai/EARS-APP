
import { RiskCluster, ClinicalInsight } from './clinical-engine';
import { TrendAnalysis } from './trend-engine';
import { ConfidenceResult } from './confidence-engine';

export type ClinicalRecommendation = "full_train" | "modified_train" | "recovery" | "hold";

export interface DecisionOutput {
  recommendation: ClinicalRecommendation;
  loadAdjustment: number; // percentage (e.g. 0.75 for 75%)
  focusAreas: string[];
  alerts: string[];
}

export const DecisionLayer = {
  analyze: (
    readinessScore: number,
    clusters: RiskCluster[],
    trends: TrendAnalysis,
    confidence: ConfidenceResult
  ): DecisionOutput => {
    let recommendation: ClinicalRecommendation = "full_train";
    let loadAdjustment = 1.0;
    const focusAreas: string[] = [];
    const alerts: string[] = [...confidence.reasons];

    const hasHighRiskMech = clusters.some(c => c.id === 'mech-overload' && c.score >= 70);
    const hasHighRecoveryDeficit = clusters.some(c => c.id === 'recov-deficit' && c.score >= 70);
    const criticalPainTrend = trends.painTrend === "worsening";
    const criticalReadinessTrend = trends.readinessTrend === "worsening" && readinessScore < 60;

    // 1. Logic for "HOLD" (Most Conservative)
    if ((hasHighRiskMech && criticalPainTrend) || (readinessScore < 45 && trends.trendScore < -0.5)) {
      recommendation = "hold";
      loadAdjustment = 0;
      focusAreas.push("Liberação Clínica", "Repouso Total");
      alerts.push("RISCO AGUDO: Tendência de piora combinada com dor crítica.");
    } 
    // 2. Logic for "RECOVERY"
    else if (hasHighRecoveryDeficit || readinessScore < 60 || (trends.trendScore < -0.3 && confidence.confidenceScore > 0.6)) {
      recommendation = "recovery";
      loadAdjustment = 0.5;
      focusAreas.push("Recovery Ativo", "Higiene do Sono");
      if (readinessScore < 60) alerts.push("Baixa prontidão sistêmica detectada.");
    }
    // 3. Logic for "MODIFIED"
    else if (clusters.length > 0 || trends.trendScore < 0 || readinessScore < 80) {
      recommendation = "modified_train";
      loadAdjustment = 0.8; // 80% load
      focusAreas.push("Controle de Carga", "Qualidade de Movimento");
      
      // Fine tune adjustment based on confidence
      if (confidence.confidenceLevel === 'low') {
          loadAdjustment = 0.9; // Be less extreme if we are unsure
          alerts.push("Ajuste cauteloso devido à baixa confiança dos dados.");
      }
    }

    // specific cluster focus
    clusters.forEach(c => {
        if (c.id === 'mech-overload') focusAreas.push("Mobilidade/Controle Motor");
        if (c.id === 'clinical-risk') focusAreas.push("Avaliação Estrutural");
    });

    return {
      recommendation,
      loadAdjustment,
      focusAreas: Array.from(new Set(focusAreas)),
      alerts
    };
  }
};
