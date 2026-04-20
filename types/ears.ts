
export type ReadinessLevel = 'ready' | 'attention' | 'risk';

export interface BodyPain {
  region: string;
  level: number;
  type: 'muscle' | 'joint' | 'other';
}

export interface WellnessCheckIn {
  id: string;
  athleteId: string;
  date: string;
  
  // Core Metrics (1-5)
  sleep_quality: number;
  sleep_hours: number;
  energy: number;
  mood: number;
  stress: number;
  recovery: number;
  confidence: number;
  leg_heaviness: number;
  overall_readiness: number;
  
  // Menstrual Cycle (Girls only)
  menstrual_cycle?: 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'none';
  
  // Rotating/Optional
  hydration?: number; // 1-5
  urine_color?: number; // 1-5
  nutrition?: number; // 1-5
  pre_training_meal?: number; // 1-5
  enjoyment?: number; // 1-5
  emotional_fatigue?: number; // 1-5
  
  // Modules
  pain_map: BodyPain[];
  clinical_symptoms: string[];
  
  // Computed (Stored for performance)
  readiness_score: number;
  base_score: number;
  deductions: number;
  level: ReadinessLevel;
}

export interface AthleteProfile {
  id: string;
  name: string;
  nickname?: string;
  gender: 'male' | 'female';
  age: number;
  sport: string;
  category: string;
  avatar_url?: string;
  previous_readiness?: number;
}

export interface MetricDefinition {
  id: keyof WellnessCheckIn;
  label: string;
  emoji: string;
  type: 'scale' | 'rotation' | 'conditional';
}
