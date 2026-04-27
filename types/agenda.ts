export type AgendaCategory = 'clinical' | 'professional' | 'personal' | 'competition' | 'travel';

export interface AgendaEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  category: AgendaCategory;
  subcategory: string | null;
  location?: string | null;
  address?: string | null;
  is_all_day?: boolean;
  athlete_id: string | null;
  risk_score: number | null;
  priority: number;
  origin: 'manual' | 'system' | 'sync';
  created_at: string;
}

export const calculatePriority = (event: Partial<AgendaEvent>): number => {
  let priority = 0;
  
  if (event.category === 'clinical') {
    priority = (Number(event.risk_score) || 0) * 0.7 + 5;
  } else if (event.category === 'competition') {
    priority = 10;
  } else if (event.category === 'travel') {
    priority = 8;
  } else if (event.category === 'professional') {
    priority = 5;
  } else {
    priority = 3;
  }

  return Math.min(10, Math.max(0, priority));
};

export const getCategoryColor = (event: AgendaEvent): string => {
  if (event.category === 'clinical') {
    const risk = event.risk_score || 0;
    if (risk < 4) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (risk < 7) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  }
  if (event.category === 'competition') {
    return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
  }
  if (event.category === 'travel') {
    return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
  }
  if (event.category === 'professional') {
    return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
  }
  if (event.category === 'personal') {
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
  return 'bg-slate-800/50 text-slate-400 border-slate-700';
};
