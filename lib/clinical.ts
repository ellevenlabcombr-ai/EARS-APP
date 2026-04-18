import { supabase } from "./supabase";

/**
 * Resolves a clinical alert by updating its status to 'resolved'
 * and setting the resolved_at timestamp.
 */
export async function resolveClinicalAlert(alertId: string) {
  if (!supabase) {
    return { error: new Error("Supabase client not initialized") };
  }

  try {
    const { data, error } = await supabase
      .from('clinical_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error resolving clinical alert:", error);
    return { data: null, error };
  }
}

/**
 * Fetches active clinical alerts for a specific athlete or all athletes.
 */
export async function fetchClinicalAlerts(athleteId?: string, status: 'active' | 'resolved' = 'active') {
  if (!supabase) {
    return { data: [], error: new Error("Supabase client not initialized") };
  }

  let query = supabase
    .from('clinical_alerts')
    .select(`
      *,
      athlete:athletes(id, name)
    `)
    .eq('status', status);

  if (athleteId) {
    query = query.eq('athlete_id', athleteId);
  }

  // Priority ordering: high -> medium -> low, then most recent first
  const { data, error } = await query
    .order('severity', { ascending: false }) // This might need manual sorting if string order isn't enough
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching clinical alerts:", error);
    return { data: [], error };
  }

  // Manual sort for severity to ensure high -> medium -> low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  const sortedData = [...(data || [])].sort((a, b) => {
    if (a.status === 'resolved') return 0; // Don't sort resolved by severity as strictly
    return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
  });

  return { data: sortedData, error: null };
}
