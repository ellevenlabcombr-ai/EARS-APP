
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

export interface ClinicalTag {
  id: string;
  tag: string;
  created_at: string;
  weight: number;
  source: 'clinical' | 'field_observation';
}
