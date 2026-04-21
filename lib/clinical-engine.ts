
export interface RiskCluster {
  id: string;
  label: string;
  score: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  factors: string[];
  action?: string;
}

export interface ClinicalInsight {
  riskLabel: string;
  reason: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface WellnessRecord {
  id: string;
  athlete_id: string;
  readiness_score: number;
  fatigue_level: number;
  muscle_soreness: number;
  sleep_hours: number;
  sleep_quality: number;
  stress_level: number;
  leg_heaviness?: number;
  rpe_simple?: number;
  mapped_rpe?: number;
  duration_minutes?: number;
  session_load?: number;
  [key: string]: any;
}

export interface EngineInput {
  wellnessRecords: WellnessRecord[];
  painReports: any[];
  assessments: any[];
  checkIns: any[];
  alerts: any[];
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
  const { wellnessRecords, painReports, assessments, checkIns, alerts } = input;
  const clusters: RiskCluster[] = [];

  const latestWellness = wellnessRecords[wellnessRecords.length - 1];
  const last3DaysWellness = wellnessRecords.slice(-3);
  
  // 1. MECHANICAL OVERLOAD (Fusing Pain + Load)
  // Calibration: require at least 2 pain reports >= 4, OR multiple days of pain, OR severe load spike
  const recentPain = painReports.filter(p => new Date(p.created_at || p.record_date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
  const highPainReports = recentPain.filter(p => p.pain_level >= 5);
  const moderatePainReports = recentPain.filter(p => p.pain_level >= 4);

  // Load approximation (using duration and mapped RPE)
  // If checkIns is from loadData, it might have duration and rpe variables as intensity/duration_minutes
  const recentLoad = checkIns.slice(-3).reduce((acc, ci) => acc + ((ci.intensity || ci.mapped_rpe || 5) * (ci.duration_minutes || 60)), 0) / (checkIns.slice(-3).length || 1);
  const chronicLoad = checkIns.length > 0 ? (checkIns.reduce((acc, ci) => acc + ((ci.intensity || ci.mapped_rpe || 5) * (ci.duration_minutes || 60)), 0) / checkIns.length) : 0;
  const acwr = chronicLoad > 0 ? recentLoad / chronicLoad : 1;

  const hasSignificantPain = highPainReports.length >= 2 || (moderatePainReports.length >= 3);
  const hasPainAndLoad = highPainReports.length >= 1 && acwr > 1.3;
  const hasSevereLoadSpike = acwr > 1.6;

  if (hasSignificantPain || hasPainAndLoad || hasSevereLoadSpike) {
    const isCritical = hasSignificantPain && acwr > 1.3;
    const score = isCritical ? 85 : 65;
    
    clusters.push({
      id: 'mech-overload',
      label: 'Sobrecarga Mecânica',
      score,
      trend: highPainReports.length > 1 ? 'up' : 'stable',
      factors: [
        hasSignificantPain ? `Dor recorrente (${moderatePainReports.length} registros >=4)` : null,
        acwr > 1.2 ? `Pico de carga identificado (ACWR: ${acwr.toFixed(1)})` : null
      ].filter(Boolean) as string[],
      action: isCritical ? 'Avaliação fisioterápica e modulação imediata de volume' : 'Monitorar resposta inflamatória; adequar carga'
    });
  }

  // 2. RECOVERY DEFICIT (Fusing Sleep + Fatigue + Readiness)
  // Calibration: Requires at least 2 synergistic signals or a hard trend
  if (latestWellness) {
    const sleepDeficit = latestWellness.sleep_hours < 6; // Adjusted from 7 to 6 to reduce false positives
    const highFatigue = (latestWellness.fatigue_level || 0) >= 7 || (latestWellness.energy_level && latestWellness.energy_level <= 2);
    const lowReadiness = latestWellness.readiness_score < 60;
    const historyLowReadiness = last3DaysWellness.filter(w => w.readiness_score < 60).length >= 2;

    let recoverySignals = 0;
    if (sleepDeficit) recoverySignals++;
    if (highFatigue) recoverySignals++;
    if (lowReadiness) recoverySignals++;
    if (historyLowReadiness) recoverySignals += 1.5;

    if (recoverySignals >= 2) {
      const isCritical = recoverySignals >= 3.5;
      const score = Math.min(100, 40 + (recoverySignals * 15));
      clusters.push({
        id: 'recov-deficit',
        label: 'Déficit de Recuperação Comb.',
        score,
        trend: historyLowReadiness ? 'up' : 'stable',
        factors: [
          sleepDeficit ? 'Noite mal dormida (< 6h)' : null,
          highFatigue ? 'Fadiga aguda relatada' : null,
          historyLowReadiness ? 'Prontidão reduzida (últimos dias)' : (lowReadiness ? 'Prontidão baixa (Hoje)' : null)
        ].filter(Boolean) as string[],
        action: isCritical ? 'Protocolo de recuperação obrigatório (Crioterapia/Bota)' : 'Focar em higiene do sono e hidratação'
      });
    }
  }

  // 3. CLINICAL RISK (Fusing Assessments + Alerts)
  // Calibration: Requires active critical statuses
  const criticalAssessments = assessments.filter(a => a.classification?.toLowerCase().includes('alto') || a.classification?.toLowerCase().includes('high'));
  const activeAlerts = alerts.filter(a => a.status === 'active' && a.severity === 'high');

  if (criticalAssessments.length > 0 || activeAlerts.length > 0) {
    clusters.push({
      id: 'clinical-risk',
      label: 'Risco Clínico Persistente',
      score: 90,
      trend: 'stable',
      factors: [
        criticalAssessments.length > 0 ? 'Avaliação de pré-temporada crítica' : null,
        activeAlerts.length > 0 ? 'Alerta clínico manual ativo' : null
      ].filter(Boolean) as string[],
      action: 'Avaliação presencial de liberação mandatória'
    });
  }

  // 4. CALIBRATED FATIGUE ALERTS
  if (latestWellness) {
    const s = latestWellness.symptoms || {};
    const rpe = latestWellness.rpe_simple || s.rpe_simple || 0;
    const rawLegHeaviness = latestWellness.leg_heaviness || s.leg_heaviness || 3;
    const legHeavinessSeverity = 6 - rawLegHeaviness; // 1 (Very Light) -> 5 (Very Heavy)
    
    // Only trigger if both are severe, and not just slightly tired
    if (rpe >= 4 && legHeavinessSeverity >= 4) {
      clusters.push({
        id: 'fatigue-sys',
        label: 'Fadiga Sistêmica Pós-Treino',
        score: 75,
        trend: 'stable',
        factors: ['Percepção de esforço muito alta (RPE)', 'Sensação de peso nas pernas severa'],
        action: 'Ajuste na intensidade da próxima sessão e focar em recuperação passiva'
      });
    } else if (rpe <= 2 && rpe > 0 && legHeavinessSeverity >= 4) {
      clusters.push({
        id: 'fatigue-loc',
        label: 'Fadiga Periférica Residual',
        score: 60,
        trend: 'stable',
        factors: ['Esforço global leve no treino prévio', 'Peso severo nos membros inferiores'],
        action: 'Avaliar fadiga acumulada; liberação miofascial sugerida'
      });
    }
  }

  // Filter & Prioritize output (Limit out noise)
  const filteredClusters = clusters.filter(c => c.score >= 50); // Drop low-level noise completely
  const sortedClusters = [...filteredClusters].sort((a, b) => b.score - a.score).slice(0, 2); // Max 2 high priority clusters

  // Hybrid Decision Layer Logic
  let decisionMode: 'Conservative' | 'Aggressive' = 'Aggressive';
  let decisionExplanation = 'Sinais estáveis e boa tolerância à carga.';

  const negativeTrend = clusters.some(c => c.trend === 'up' && c.score >= 70);
  const increasingPain = moderatePainReports.length >= 2 && highPainReports.length >= 1;
  const historicRisk = criticalAssessments.length > 0 || activeAlerts.length > 0;

  if (negativeTrend || increasingPain || historicRisk) {
    decisionMode = 'Conservative';
    if (increasingPain) decisionExplanation = 'Incremento agudo de dor detectado.';
    else if (negativeTrend) decisionExplanation = 'Tendência negativa em indicadores de recuperação.';
    else decisionExplanation = 'Histórico clínico ou avaliação pendente requer cautela.';
  } else if (latestWellness && latestWellness.readiness_score < 70) {
    decisionMode = 'Conservative';
    decisionExplanation = 'Nível de prontidão abaixo da zona de segurança.';
  }

  // Generate Intervention Suggestions
  const interventions: string[] = [];
  if (decisionMode === 'Conservative') {
    interventions.push('Reduzir volume e intensidade');
    interventions.push('Focar em protocolos de recuperação');
    if (clusters.some(c => c.id === 'mech-overload')) {
        interventions.push('Evitar exercícios de alto impacto');
    }
  } else {
    interventions.push('Manter progressão planejada');
    interventions.push('Monitorar resposta à carga');
  }

  // Generate Narrative Insight
  let insight: ClinicalInsight | null = null;
  
  if (sortedClusters.length > 0) {
    const top = sortedClusters[0];
    let priority: ClinicalInsight['priority'] = 'low';
    if (top.score >= 80) priority = 'critical';
    else if (top.score >= 65) priority = 'high';
    else if (top.score >= 50) priority = 'medium';

    insight = {
      riskLabel: priority === 'critical' ? `ALERTA CLÍNICO: ${top.label}` : top.label,
      reason: `Métrica combinada sugere ${top.label.toLowerCase()} devido a ${top.factors.join(" + ")}.`,
      suggestion: top.action || 'Monitoramento contínuo sugerido.',
      priority
    };
  } else if (latestWellness && latestWellness.readiness_score > 85) {
    insight = {
      riskLabel: 'Resposta Positiva à Carga',
      reason: 'Sinais consistentes de boa recuperação sistêmica.',
      suggestion: 'Manutenção do plano normal.',
      priority: 'low'
    };
  }

  return { clusters: sortedClusters, insight, decisionMode, decisionExplanation, interventions: interventions.slice(0, 2) };
}
