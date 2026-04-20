
import { WellnessCheckIn, BodyPain, ReadinessLevel } from '../types/ears';

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
  calculateBaseScore: (checkin: Partial<WellnessCheckIn>): number => {
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
      return (val / max) * 100;
    };

    // Invert negative metrics (Stress & Leg Heaviness)
    const legHeavinessValue = checkin.leg_heaviness ? (6 - checkin.leg_heaviness) : 3;
    const stressValue = checkin.stress ? (6 - checkin.stress) : 3;

    const scores = {
      sleep: normalize(checkin.sleep_quality),
      energy: normalize(checkin.energy),
      soreness: normalize(legHeavinessValue),
      stress: normalize(stressValue),
      mood: normalize(checkin.mood),
      other: normalize(checkin.hydration || checkin.nutrition || checkin.overall_readiness || 3)
    };

    const baseScore = 
      (scores.sleep * weights.sleep) +
      (scores.energy * weights.energy) +
      (scores.soreness * weights.soreness) +
      (scores.stress * weights.stress) +
      (scores.mood * weights.mood) +
      (scores.other * weights.other);

    return Math.round(baseScore);
  },

  calculatePainDeduction: (painMap: BodyPain[]): number => {
    if (painMap.length === 0) return 0;
    
    // Use highest pain point
    const maxPain = Math.max(...painMap.map(p => p.level), 0);
    
    // Pain curve: 0=0%, 1=-0.5%, 2=-1.5%, 3=-3%, 4=-5%, 5=-8%, 6=-11%, 7=-15%, 8=-20%, 9=-25%, 10=-30%
    const curve: Record<number, number> = {
      0: 0, 1: 0.5, 2: 1.5, 3: 3, 4: 5, 5: 8, 6: 11, 7: 15, 8: 20, 9: 25, 10: 30
    };
    
    return curve[Math.floor(maxPain)] || (maxPain > 10 ? 30 : 0);
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

  calculateFinalReadiness: (checkin: Partial<WellnessCheckIn>, age: number = 25): { score: number, level: ReadinessLevel } => {
    const baseScore = EARSEngine.calculateBaseScore(checkin);
    const painDeduction = EARSEngine.calculatePainDeduction(checkin.pain_map || []);
    const symptomDeduction = EARSEngine.calculateSymptomsDeduction(checkin.clinical_symptoms || []);
    const menstrualDeduction = EARSEngine.calculateMenstrualDeduction(checkin.menstrual_cycle);
    const multipliers = EARSEngine.calculateMultipliers(checkin);

    // Age adjustment: penalty_multiplier = 1 + ((age - 25) * 0.01) (0.85 to 1.15)
    let ageMultiplier = 1 + ((age - 25) * 0.01);
    ageMultiplier = Math.max(0.85, Math.min(1.15, ageMultiplier));

    const totalDeductions = (painDeduction + symptomDeduction + menstrualDeduction + multipliers) * ageMultiplier;
    
    const finalScore = Math.max(0, Math.round(baseScore - totalDeductions));
    
    let level: ReadinessLevel = 'ready';
    if (finalScore < 60) level = 'risk';
    else if (finalScore < 80) level = 'attention';

    return { score: finalScore, level };
  }
};
