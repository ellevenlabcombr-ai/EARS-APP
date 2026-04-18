export interface Athlete {
  id: string;
  name: string;
  nickname?: string;
  category: string;
  athlete_code?: string;
  password?: string;
  birth_date?: string;
  gender?: string;
  weight?: number;
  height?: number;
  avatar_url?: string;
  risk_level?: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
  readiness_score?: number;
  
  // Address
  address_zip?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  
  // Contact
  phone?: string;
  email?: string;
  rg?: string;
  cpf?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_cpf?: string;
  guardian_email?: string;
  
  // Medical
  alergia?: boolean;
  alergia_desc?: string;
  medicacao?: boolean;
  medicacao_desc?: string;
  cirurgia?: boolean;
  cirurgia_desc?: string;
  convenio?: string;
  carteirinha?: string;
  hospital?: string;
  
  // Sports
  sport?: string;
  modalidade?: string;
  lado_dominante?: string;
  posicao?: string;
  clube_anterior?: string;
  
  // Female Health
  last_period_date?: string;
  cycle_length?: number;
  is_menstruating?: boolean;
  group_name?: string;
  status?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface WellnessRecord {
  id: string;
  athlete_id: string;
  record_date: string;
  sleep_hours?: number;
  sleep_quality?: number;
  fatigue_level?: number;
  muscle_soreness?: number;
  soreness_location?: string;
  stress_level?: number;
  readiness_score?: number;
  menstrual_cycle?: string;
  menstrual_symptoms?: string[];
  hydration_perception?: number;
  hydration_score?: number;
  urine_color?: number;
  symptoms?: Record<string, number>;
  comments?: string;
  created_at?: string;
}

export interface ClinicalAlert {
  id: string;
  athlete_id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved';
  source?: string;
  related_check_in_id?: string;
  related_assessment_id?: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface ClinicalNote {
  id: string;
  athlete_id: string;
  pain_level?: number;
  feeling?: string;
  regions?: string[];
  treatments?: string[];
  observations?: string;
  generated_text?: string;
  is_signed?: boolean;
  professional_name?: string;
  created_at?: string;
}

export interface ClinicalAssessment {
  id: string;
  athlete_id: string;
  type: string;
  score?: number;
  classification?: string;
  classification_color?: string;
  data: any;
  notes?: string;
  assessment_date?: string;
  created_at?: string;
  updated_at?: string;
}
