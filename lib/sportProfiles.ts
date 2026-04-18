export type SportType = 'Vôlei' | 'Basquete' | 'Handebol' | 'Futsal' | 'Futebol' | 'Tênis' | 'Judô' | 'Geral';

export interface SportRegionProfile {
  id: string;
  label: string;
  loadLevel: 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
}

export interface SportProfile {
  name: SportType;
  priorityRegions: SportRegionProfile[];
}

export const SPORT_PROFILES: Record<SportType, SportProfile> = {
  'Vôlei': {
    name: 'Vôlei',
    priorityRegions: [
      { id: 'shoulder_r_f', label: 'Ombro Dominante', loadLevel: 3 },
      { id: 'knee_r_f', label: 'Joelho (D)', loadLevel: 3 },
      { id: 'knee_l_f', label: 'Joelho (E)', loadLevel: 3 },
      { id: 'lower_back', label: 'Lombar', loadLevel: 2 },
      { id: 'foot_r_f', label: 'Tornozelo', loadLevel: 2 }
    ]
  },
  'Basquete': {
    name: 'Basquete',
    priorityRegions: [
      { id: 'knee_r_f', label: 'Joelho (D)', loadLevel: 3 },
      { id: 'knee_l_f', label: 'Joelho (E)', loadLevel: 3 },
      { id: 'foot_r_f', label: 'Tornozelo (D)', loadLevel: 3 },
      { id: 'foot_l_f', label: 'Tornozelo (E)', loadLevel: 3 },
      { id: 'lower_back', label: 'Lombar', loadLevel: 2 }
    ]
  },
  'Futebol': {
    name: 'Futebol',
    priorityRegions: [
      { id: 'knee_r_f', label: 'Joelho (D)', loadLevel: 3 },
      { id: 'knee_l_f', label: 'Joelho (E)', loadLevel: 3 },
      { id: 'hip_r_f', label: 'Quadril (D)', loadLevel: 3 },
      { id: 'hip_l_f', label: 'Quadril (E)', loadLevel: 3 },
      { id: 'foot_r_f', label: 'Tornozelo (D)', loadLevel: 2 }
    ]
  },
  'Tênis': {
    name: 'Tênis',
    priorityRegions: [
      { id: 'shoulder_r_f', label: 'Ombro Dominante', loadLevel: 3 },
      { id: 'elbow_r_f', label: 'Cotovelo Dominante', loadLevel: 3 },
      { id: 'wrist_r_f', label: 'Punho Dominante', loadLevel: 2 },
      { id: 'knee_r_f', label: 'Joelho (D)', loadLevel: 2 },
      { id: 'lower_back', label: 'Lombar', loadLevel: 2 }
    ]
  },
  'Judô': {
    name: 'Judô',
    priorityRegions: [
      { id: 'shoulder_r_f', label: 'Ombro (D)', loadLevel: 3 },
      { id: 'shoulder_l_f', label: 'Ombro (E)', loadLevel: 3 },
      { id: 'knee_r_f', label: 'Joelho (D)', loadLevel: 3 },
      { id: 'knee_l_f', label: 'Joelho (E)', loadLevel: 3 },
      { id: 'cervical', label: 'Cervical', loadLevel: 3 }
    ]
  },
  'Handebol': {
    name: 'Handebol',
    priorityRegions: [
      { id: 'shoulder_r_f', label: 'Ombro Dominante', loadLevel: 3 },
      { id: 'knee_r_f', label: 'Joelho (D)', loadLevel: 3 },
      { id: 'knee_l_f', label: 'Joelho (E)', loadLevel: 3 },
      { id: 'foot_r_f', label: 'Tornozelo (D)', loadLevel: 2 },
      { id: 'lower_back', label: 'Lombar', loadLevel: 2 }
    ]
  },
  'Futsal': {
    name: 'Futsal',
    priorityRegions: [
      { id: 'knee_r_f', label: 'Joelho (D)', loadLevel: 3 },
      { id: 'knee_l_f', label: 'Joelho (E)', loadLevel: 3 },
      { id: 'hip_r_f', label: 'Quadril (D)', loadLevel: 3 },
      { id: 'hip_l_f', label: 'Quadril (E)', loadLevel: 3 },
      { id: 'foot_r_f', label: 'Tornozelo (D)', loadLevel: 3 }
    ]
  },
  'Geral': {
    name: 'Geral',
    priorityRegions: [
      { id: 'knee_r_f', label: 'Joelho (D)', loadLevel: 2 },
      { id: 'shoulder_r_f', label: 'Ombro (D)', loadLevel: 2 },
      { id: 'lower_back', label: 'Lombar', loadLevel: 2 }
    ]
  }
};

export const getSportProfile = (sportName: string | null | undefined): SportProfile => {
  if (!sportName) return SPORT_PROFILES['Geral'];

  const normalized = sportName
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents

  const mapping: Record<string, SportType> = {
    'volei': 'Vôlei',
    'volleyball': 'Vôlei',
    'basquete': 'Basquete',
    'basketball': 'Basquete',
    'handebol': 'Handebol',
    'handball': 'Handebol',
    'futsal': 'Futsal',
    'futebol': 'Futebol',
    'soccer': 'Futebol',
    'tenis': 'Tênis',
    'tennis': 'Tênis',
    'judo': 'Judô',
  };

  const matchedType = mapping[normalized];
  return matchedType ? SPORT_PROFILES[matchedType] : SPORT_PROFILES['Geral'];
};
