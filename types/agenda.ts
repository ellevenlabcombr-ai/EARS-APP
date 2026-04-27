export type AgendaCategory = 'clinical' | 'professional' | 'personal' | 'competition' | 'travel' | 'arbitration';

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
  } else if (event.category === 'arbitration') {
    priority = 9;
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
    if (risk < 4) return 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10';
    if (risk < 7) return 'bg-amber-500/30 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10';
    return 'bg-rose-500/30 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/10';
  }
  if (event.category === 'competition') {
    return 'bg-amber-400/40 text-amber-100 border-amber-400/60 shadow-md shadow-amber-400/20';
  }
  if (event.category === 'arbitration') {
    return 'bg-fuchsia-500/40 text-fuchsia-100 border-fuchsia-500/60 shadow-md shadow-fuchsia-500/20';
  }
  if (event.category === 'travel') {
    return 'bg-violet-500/40 text-violet-100 border-violet-500/60 shadow-md shadow-violet-500/20';
  }
  if (event.category === 'professional') {
    return 'bg-cyan-500/40 text-cyan-100 border-cyan-500/60 shadow-md shadow-cyan-500/20';
  }
  if (event.category === 'personal') {
    return 'bg-emerald-400/40 text-emerald-100 border-emerald-400/60 shadow-md shadow-emerald-400/20';
  }
  return 'bg-slate-700/60 text-white border-slate-600';
};
