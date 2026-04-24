
import { WellnessCheckIn, BodyPain, ReadinessLevel } from '../types/ears';
import { TrendAnalysis } from './trend-engine';
import { DecayedMetrics } from './decay-engine';

export const EARSEngine = {
  /**
   * Weights: 
   * Sleep quality = 25%
   * Energy = 20%
   * Soreness/Fatigue = 20% (inverted leg_heaviness)
   * Stress = 15% (inverted stress)
   * Mood = 10%
   * Nutrition/Hydration = 10%
   */
  calculateBaseScore: (checkin: Partial<WellnessCheckIn>, decayed?: DecayedMetrics): number => {
    const weights = {
      sleep: 0.25,
      energy: 0.20,
      soreness: 0.20,
      stress: 0.15,
      mood: 0.10,
      other: 0.10
    };

    const normalize = (val: number | undefined, max: number = 5) => {
      if (!val) return 0;
      // If val is already potentially a percentage (> 10), assume it's 0-100 and just return it clamped
      if (val > 10) return Math.max(0, Math.min(100, val));
      return Math.max(0, Math.min(100, (val / max) * 100));
    };

    // Use decayed metrics if available for a more stable baseline
    // Simple heuristic to bridge 10h scope to 1-5 scale if it's hours, or just pass if it's quality
    const sleepQuality = checkin.sleep_quality || (checkin.sleep_hours ? (checkin.sleep_hours >= 8 ? 5 : checkin.sleep_hours >= 6 ? 3 : 1) : 3);
    
    // Invert negative metrics (Stress & Leg Heaviness)
    const legVal = checkin.leg_heaviness || 3;
    const stressVal = checkin.stress || 3;
    const legHeavinessValue = 6 - Math.min(5, Math.max(1, legVal));
    const stressValue = 6 - Math.min(5, Math.max(1, stressVal));

    const scores = {
      sleep: decayed ? (decayed.weightedReadiness) : normalize(sleepQuality), 
      energy: normalize(checkin.energy),
      soreness: normalize(legHeavinessValue),
      stress: normalize(stressValue),
      mood: normalize(checkin.mood),
      other: normalize(checkin.overall_readiness || checkin.hydration || checkin.nutrition || 3)
    };

    // If decayed readiness is provided, it acts as a "buffer" to the today's base score
    let baseScore = 
      (scores.sleep * weights.sleep) +
      (scores.energy * weights.energy) +
      (scores.soreness * weights.soreness) +
      (scores.stress * weights.stress) +
      (scores.mood * weights.mood) +
      (scores.other * weights.other);

    if (decayed) {
        baseScore = (baseScore * 0.7) + (decayed.weightedReadiness * 0.3);
    }

    return Math.round(baseScore);
  },

  calculatePainDeduction: (painMap: BodyPain[], decayedPain?: number): number => {
    const rawPain = painMap.length > 0 ? Math.max(...painMap.map(p => p.level), 0) : 0;
    
    // Blend current pain with decayed pain (60/40 split)
    const maxPain = decayedPain ? (rawPain * 0.6 + decayedPain * 0.4) : rawPain;
    
    // Exponential-like Pain curve logic
    if (maxPain <= 3) return maxPain * 1.5; 
    if (maxPain <= 6) return 5 + (maxPain - 3) * 5; 
    
    const criticalMap: Record<number, number> = { 7: 30, 8: 45, 9: 65, 10: 90 };
    return criticalMap[Math.floor(maxPain)] || 90;
  },

  calculateSleepDeficit: (currentSleep: number, history: number[] = [], decayedSleep?: number): number => {
    let deduction = 0;
    const effectiveSleep = decayedSleep ? (currentSleep * 0.7 + decayedSleep * 0.3) : currentSleep;

    if (effectiveSleep < 6) deduction += 10;
    if (effectiveSleep < 4) deduction += 15; 

    const combined = [currentSleep, ...history.slice(0, 2)];
    const avgSleep = combined.reduce((a, b) => a + b, 0) / combined.length;
    
    if (combined.length >= 3 && avgSleep < 6.5) {
      deduction += 12; 
    }

    return deduction;
  },

  calculateSymptomsDeduction: (symptoms: string[]): number => {
    let deduction = 0;
    
    const severity: Record<string, 'light' | 'moderate' | 'severe'> = {
      'skin_injury': 'light',
      'blisters': 'light',
      'ingrown_nail': 'light',
      'headache': 'moderate',
      'nausea': 'moderate',
      'dizziness': 'moderate',
      'fever': 'severe',
      'flu_symptoms': 'severe'
    };

    symptoms.forEach(s => {
      const type = severity[s] || 'light';
      if (type === 'light') deduction += 2;
      else if (type === 'moderate') deduction += 8;
      else if (type === 'severe') deduction += 15;
    });

    return deduction;
  },

  calculateMultipliers: (checkin: Partial<WellnessCheckIn>): number => {
    let multiplierDeduction = 0;

    // Sleep <= 2 AND stress >= 4: -10%
    if ((checkin.sleep_quality || 0) <= 2 && (checkin.stress || 0) >= 4) {
      multiplierDeduction += 10;
    }

    // Mood <= 2 AND confidence <= 2: -8%
    if ((checkin.mood || 0) <= 2 && (checkin.confidence || 0) <= 2) {
      multiplierDeduction += 8;
    }

    // Hydration poor AND urine dark: -6%
    if ((checkin.hydration || 0) <= 2 && (checkin.urine_color || 0) >= 4) {
      multiplierDeduction += 6;
    }

    // NEW: If pain >= 5 AND previous training RPE >= 7: -12%
    // Note: We'll check max pain in the checkin.pain_map
    const maxPain = Math.max(...(checkin.pain_map || []).map(p => p.level), 0);
    if (maxPain >= 5) {
      // Assuming 7+ if not provided for safety in high performance context or if it was high yesterday
      multiplierDeduction += 12;
    }

    return multiplierDeduction;
  },

  calculateMenstrualDeduction: (phase?: string): number => {
    if (phase === 'menstrual') return 5;
    if (phase === 'luteal') return 2;
    return 0;
  },

  calculateFinalReadiness: (
    checkin: Partial<WellnessCheckIn>, 
    age: number = 25, 
    sleepHistory: number[] = [],
    decayed?: DecayedMetrics,
    trends?: TrendAnalysis
  ): { score: number, level: ReadinessLevel, breakdown: any } => {
    const baseScore = EARSEngine.calculateBaseScore(checkin, decayed);
    const painDeduction = EARSEngine.calculatePainDeduction(checkin.pain_map || [], decayed?.weightedPain);
    const symptomDeduction = EARSEngine.calculateSymptomsDeduction(checkin.clinical_symptoms || []);
    const sleepDeduction = EARSEngine.calculateSleepDeficit(checkin.sleep_hours || 8, sleepHistory, decayed?.weightedSleep);
    const menstrualDeduction = EARSEngine.calculateMenstrualDeduction(checkin.menstrual_cycle);
    const multipliers = EARSEngine.calculateMultipliers(checkin);

    // Trend Modifier: Worsening trend adds 5-10% extra penalty, Improving smoothes it out
    let trendFactor = 1.0;
    if (trends) {
      if (trends.trendScore < -0.3) trendFactor = 1.15; // +15% penalty
      else if (trends.trendScore > 0.3) trendFactor = 0.9; // -10% bonus
    }

    // Multi-domain Penalty: If 2 or more areas have significant deductions (>8)
    let domainCounts = 0;
    if (painDeduction > 8) domainCounts++;
    if (symptomDeduction > 8) domainCounts++;
    if (sleepDeduction > 8) domainCounts++;
    if (multipliers > 8) domainCounts++;

    const synergyMultiplier = domainCounts >= 2 ? 1.25 : 1; 

    let ageMultiplier = 1 + ((age - 25) * 0.01);
    ageMultiplier = Math.max(0.85, Math.min(1.15, ageMultiplier));

    const totalDeductions = (painDeduction + symptomDeduction + sleepDeduction + menstrualDeduction + multipliers) * ageMultiplier * synergyMultiplier * trendFactor;
    
    const finalScore = Math.max(0, Math.min(100, Math.round((decayed ? (baseScore * 0.8 + decayed.weightedReadiness * 0.2) : baseScore) - totalDeductions)));
    
    let level: ReadinessLevel = 'ready';
    if (finalScore < 60) level = 'risk';
    else if (finalScore < 80) level = 'attention';

    return { 
      score: finalScore, 
      level,
      breakdown: {
        baseScore,
        painDeduction,
        symptomDeduction,
        sleepDeduction,
        synergy: synergyMultiplier > 1,
        trendFactor
      }
    };
  }
};
