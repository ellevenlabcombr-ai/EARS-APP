import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { WellnessRecord } from "@/types/database";

interface AthleteState {
  checkins: WellnessRecord[];
  loading: boolean;
  error: string | null;
  
  athleteSport: string | null;
  
  // Actions
  fetchCheckins: (athleteId: string, sport?: string) => Promise<void>;
  addCheckin: (checkin: Partial<WellnessRecord>) => Promise<void>;
}

export const useAthleteStore = create<AthleteState>((set, get) => ({
  checkins: [],
  loading: false,
  error: null,
  athleteSport: null,

  fetchCheckins: async (athleteId: string, sport?: string) => {
    set({ loading: true, error: null, athleteSport: sport || null });
    try {
      const { data, error } = await supabase
        .from("wellness_records")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("record_date", { ascending: false });

      if (error) throw error;

      set({ checkins: data || [] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addCheckin: async (checkin: Partial<WellnessRecord>) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("wellness_records")
        .insert([checkin])
        .select();

      if (error) throw error;

      if (data) {
        set((state) => ({ checkins: [data[0], ...state.checkins] }));
      }
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));
