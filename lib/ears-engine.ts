import { WellnessRecord } from "@/types/database";
import { SPORT_PROFILES, getSportProfile } from "./sportProfiles";

export type EARSStatus = "low" | "moderate" | "high";
export type EARSDecision = "normal" | "adjust" | "avoid";

export interface EARSEngineResult {
  readiness: number;
  risk: number;
  recovery: number;
  status: EARSStatus;
  decision: EARSDecision;
  recommendation: string;
  alerts: string[];
  trend: "melhora" | "queda" | "estável";
}

/**
 * Normalizes a value from a given range to 0-100.
 */
const normalize = (val: number, min: number, max: number) => {
  return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
};

/**
 * Calculates Readiness Score (0-100)
 * Higher is better.
 */
export const calculateReadiness = (data: Partial<WellnessRecord>) => {
  const sleepScore = normalize(data.sleep_quality || 3, 1, 5);
  const moodScore = normalize(data.mood || 3, 1, 5);
  const fatigueScore = 100 - normalize(data.fatigue_level || 3, 1, 5); // Inverted
  const painScore = 100 - normalize(data.muscle_soreness || 0, 0, 10); // Inverted

  return Math.round((sleepScore * 0.3) + (moodScore * 0.2) + (fatigueScore * 0.25) + (painScore * 0.25));
};

/**
 * Calculates Risk Score (0-100)
 * Lower is better.
 */
export const calculateRisk = (data: Partial<WellnessRecord>, acwr: number = 1.0, sport: string | null = null) => {
  let painScore = normalize(data.muscle_soreness || 0, 0, 10);
  
  // Apply sport-specific weights if pain map is available
  if (sport && data.soreness_location) {
    try {
      const painMap = (typeof data.soreness_location === 'string' && data.soreness_location.trim() !== '')
        ? JSON.parse(data.soreness_location) 
        : (data.soreness_location || []);
      
      if (Array.isArray(painMap) && painMap.length > 0) {
        const profile = getSportProfile(sport);
        let weightedSum = 0;
        let weightCount = 0;
        
        painMap.forEach((p: any) => {
          const regionId = p.region?.toLowerCase();
          if (!regionId) return;

          const pLevel = p.intensity || p.level || 0;
          
          // Find if this region is a priority for the sport
          // Mapping local region IDs to priority region IDs might be needed
          const priority = profile.priorityRegions.find(r => 
            r.id.toLowerCase().includes(regionId) || regionId?.includes(r.id.toLowerCase())
          );
          
          const weight = priority ? (priority.loadLevel === 3 ? 1.5 : priority.loadLevel === 2 ? 1.2 : 1.0) : 1.0;
          weightedSum += pLevel * weight;
          weightCount += weight;
        });
        
        if (weightCount > 0) {
          const avgWeightedPain = weightedSum / weightCount;
          // Blend general soreness with weighted local pain
          painScore = (painScore * 0.4) + (normalize(avgWeightedPain, 0, 10) * 0.6);
        }
      }
    } catch (e) {
      console.warn("Failed to parse pain map for risk calculation", e);
    }
  }

  const fatigueScore = normalize(data.fatigue_level || 3, 1, 5);
  const sleepDebt = 100 - normalize(data.sleep_quality || 3, 1, 5);
  
  // ACWR Penalty: > 1.5 is high risk
  const acwrPenalty = acwr > 1.5 ? 30 : acwr > 1.3 ? 15 : 0;

  return Math.round((painScore * 0.4) + (fatigueScore * 0.3) + (sleepDebt * 0.3) + acwrPenalty);
};

/**
 * Calculates Recovery Score (0-100)
 * Higher is better.
 */
export const calculateRecovery = (data: Partial<WellnessRecord>) => {
  const sleepScore = normalize(data.sleep_quality || 3, 1, 5);
  const nutritionScore = normalize(data.nutrition || 3, 1, 5);
  const hydrationScore = normalize(data.hydration_perception || 3, 1, 5);

  return Math.round((sleepScore * 0.5) + (nutritionScore * 0.25) + (hydrationScore * 0.25));
};

/**
 * Detects trends based on the last 3 records.
 */
export const calculateTrend = (history: WellnessRecord[]) => {
  if (history.length < 2) return { trend: "estável" as const, alert: "" };

  const latest = history[0];
  const previous = history[1];

  const readinessDiff = (latest.readiness_score || 0) - (previous.readiness_score || 0);
  const painDiff = (latest.muscle_soreness || 0) - (previous.muscle_soreness || 0);

  if (readinessDiff < -15 && painDiff > 2) {
    return { 
      trend: "queda" as const, 
      alert: "Queda brusca de prontidão com aumento de dor nas últimas 48h." 
    };
  }

  if (readinessDiff > 10) return { trend: "melhora" as const, alert: "" };
  if (readinessDiff < -10) return { trend: "queda" as const, alert: "" };

  return { trend: "estável" as const, alert: "" };
};

/**
 * Main EARS Engine logic.
 */
export const earsEngine = (
  current: Partial<WellnessRecord>, 
  history: WellnessRecord[] = [],
  acwr: number = 1.0,
  sport: string | null = null
): EARSEngineResult => {
  const readiness = calculateReadiness(current);
  const risk = calculateRisk(current, acwr, sport);
  const recovery = calculateRecovery(current);
  const { trend, alert: trendAlert } = calculateTrend(history);

  const alerts: string[] = [];
  if (current.muscle_soreness && current.muscle_soreness > 6) alerts.push("ALERTA VERMELHO: Nível de dor crítico detectado.");
  if (acwr > 1.5) alerts.push("RISCO ALTO: Sobrecarga aguda detectada (ACWR > 1.5).");
  if (readiness < 50) alerts.push("ALERTA: Prontidão abaixo do limite de segurança.");
  if (trendAlert) alerts.push(trendAlert);

  // Sport-specific alerts
  if (sport) {
    const normalizedSport = sport.toLowerCase();
    if (normalizedSport.includes('judo')) {
      // Example Judo specific check
      let painMap = [];
      try {
        painMap = (typeof current.soreness_location === 'string' && current.soreness_location.trim() !== '')
          ? JSON.parse(current.soreness_location) 
          : (current.soreness_location || []);
      } catch (e) {
        console.warn("Failed to parse soreness_location as JSON", e);
        // Fallback for legacy comma-separated strings
        if (typeof current.soreness_location === 'string' && current.soreness_location.trim() !== '') {
          painMap = current.soreness_location.split(',').map(part => ({ region: part.trim(), level: current.muscle_soreness || 5 }));
        }
      }
      
      const hasCervicalPain = Array.isArray(painMap) && painMap.some((p: any) => 
        (p.region?.toLowerCase() === 'cervical' || p.region?.toLowerCase() === 'neck') && (p.intensity > 3 || p.level > 3)
      );
      
      if (hasCervicalPain) {
        alerts.push("ALERTA JUDÔ: Atenção especial à região cervical detectada.");
      }
    }
  }

  let status: EARSStatus = "low";
  let decision: EARSDecision = "normal";
  let recommendation = "Atleta em condições ideais. Treino normal recomendado.";

  if (readiness < 50 || risk > 60) {
    status = "high";
    decision = "avoid";
    recommendation = "Risco elevado detectado. Evitar treino e focar em recuperação/fisioterapia.";
  } else if (readiness < 75 || risk > 30) {
    status = "moderate";
    decision = "adjust";
    recommendation = "Sinais de fadiga ou dor leve. Ajustar carga e reduzir intensidade.";
  }

  return {
    readiness,
    risk,
    recovery,
    status,
    decision,
    recommendation,
    alerts,
    trend
  };
};
