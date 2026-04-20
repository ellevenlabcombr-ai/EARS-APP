"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { supabase, supabaseDebugInfo } from "@/lib/supabase";
import { 
  Activity, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Search, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  FileText,
  Brain,
  Battery,
  Moon,
  Loader2,
  Droplets,
  Info,
  Smile,
  Apple,
  Utensils,
  RefreshCcw,
  Target,
  Dumbbell,
  Heart
} from "lucide-react";
import { DataSafety } from '@/lib/dataSafety';
import { SafeRender } from '@/components/SafeRender';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocalDateString, parseDateString } from "@/lib/utils";
import { PainMap } from "@/components/PainMap";

interface WellnessDashboardProps {
  onViewAthlete: (athlete: any) => void;
}

const getPainLocationLabel = (id: string): string => {
  const mapping: Record<string, string> = {
    head_f: "Cabeça (Frontal)",
    neck_f: "Pescoço (Frontal)",
    chest: "Peitoral",
    abs: "Abdômen",
    shoulder_l_f: "Ombro Esquerdo (Frontal)",
    shoulder_r_f: "Ombro Direito (Frontal)",
    biceps_l_f: "Bíceps Esquerdo",
    biceps_r_f: "Bíceps Direito",
    forearm_l_f: "Antebraço Esquerdo",
    forearm_r_f: "Antebraço Direito",
    hand_l_f: "Mão Esquerda",
    hand_r_f: "Mão Direita",
    pelvis_f: "Pelve / Oblíquos",
    thigh_l_f: "Coxa Esquerda (Anterior)",
    thigh_r_f: "Coxa Direita (Anterior)",
    knee_l_f: "Joelho Esquerdo",
    knee_r_f: "Joelho Direito",
    calf_l_f: "Canela Esquerda",
    calf_r_f: "Canela Direita",
    foot_l_f: "Pé Esquerdo",
    foot_r_f: "Pé Direito",
    head_b: "Cabeça (Posterior)",
    neck_b: "Pescoço (Posterior)",
    upper_back: "Trapézio / Costas Superior",
    lats: "Dorsais",
    lower_back: "Lombar",
    shoulder_l_b: "Ombro Esquerdo (Posterior)",
    shoulder_r_b: "Ombro Direito (Posterior)",
    triceps_l_b: "Tríceps Esquerdo",
    triceps_r_b: "Tríceps Direito",
    forearm_l_b: "Antebraço Esquerdo (Posterior)",
    forearm_r_b: "Antebraço Direito (Posterior)",
    hand_l_b: "Mão Esquerda (Posterior)",
    hand_r_b: "Mão Direita (Posterior)",
    glutes: "Glúteos",
    hamstring_l_b: "Coxa Esquerda (Posterior)",
    hamstring_r_b: "Coxa Direita (Posterior)",
    calf_l_b: "Panturrilha Esquerda",
    calf_r_b: "Panturrilha Direita",
    foot_l_b: "Calcanhar Esquerdo",
    foot_r_b: "Calcanhar Direito",
  };
  return mapping[id.trim()] || id.trim().replace(/_/g, " ");
};

const getPainMap = (record: any) => {
  if (!record || !record.soreness_location || record.soreness_location === 'Nenhuma') return {};
  const raw = record.soreness_location;
  
  // If it's already an object/array (Supabase auto-parsing)
  if (typeof raw === 'object' && raw !== null) {
    const map: Record<string, { level: number; type: string }> = {};
    if (Array.isArray(raw)) {
      raw.forEach(item => {
        map[item.region] = { 
          level: item.intensity || item.level || 5, 
          type: item.type || 'muscle' 
        };
      });
      return map;
    } else {
      Object.entries(raw).forEach(([loc, data]: [string, any]) => {
        if (typeof data === 'object' && data !== null) {
          map[loc] = { level: data.level || 5, type: data.type || 'muscle' };
        } else {
          map[loc] = { level: Number(data) || 5, type: 'muscle' };
        }
      });
      return map;
    }
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      const map: Record<string, { level: number; type: string }> = {};
      
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          map[item.region] = { 
            level: item.intensity || item.level || 5, 
            type: item.type || 'muscle' 
          };
        });
        return map;
      } else if (typeof parsed === 'object' && parsed !== null) {
        Object.entries(parsed).forEach(([loc, data]: [string, any]) => {
          if (typeof data === 'object' && data !== null) {
            map[loc] = { level: data.level || 5, type: data.type || 'muscle' };
          } else {
            map[loc] = { level: Number(data) || 5, type: 'muscle' };
          }
        });
        return map;
      }
    } catch (e) {
      // Fallback for comma-separated string
      const parts = raw.split(',').map((s: string) => s.trim());
      const map: Record<string, { level: number; type: string }> = {};
      parts.forEach((p: string) => {
        if (p) map[p] = { level: record.muscle_soreness || 5, type: 'muscle' };
      });
      return map;
    }
  }
  return {};
};

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export function WellnessDashboard({ onViewAthlete }: WellnessDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<any>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [lastError, setLastError] = useState<any>(null);
  const hasAttemptedAutoFix = useRef(false);
  const fetchRef = useRef<() => Promise<void>>(null);

  const autoFixDatabase = useCallback(async () => {
    if (!supabase) return;
    setIsAutoFixing(true);
    try {
      const sql = `
        CREATE OR REPLACE FUNCTION public.exec_sql(sql text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN EXECUTE sql; END; $$;

        -- Garantir que as tabelas existam com a estrutura correta
        CREATE TABLE IF NOT EXISTS check_ins (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
            date DATE NOT NULL DEFAULT CURRENT_DATE,
            sleep_quality INTEGER NOT NULL,
            stress_level INTEGER NOT NULL,
            muscle_soreness INTEGER NOT NULL,
            energy_level INTEGER NOT NULL,
            hydration INTEGER DEFAULT 3,
            nutrition INTEGER DEFAULT 3,
            mood INTEGER DEFAULT 3,
            sleep_hours NUMERIC DEFAULT 8,
            pre_training_meal INTEGER DEFAULT 3,
            training_recovery INTEGER DEFAULT 3,
            confidence INTEGER DEFAULT 3,
            leg_heaviness INTEGER DEFAULT 3,
            overall_wellbeing INTEGER DEFAULT 3,
            readiness_score INTEGER NOT NULL,
            menstrual_cycle TEXT,
            menstrual_symptoms TEXT[],
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS pain_reports (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            check_in_id UUID REFERENCES check_ins(id) ON DELETE CASCADE,
            athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
            body_part_id TEXT NOT NULL,
            pain_level INTEGER NOT NULL,
            pain_type TEXT DEFAULT 'acute',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS wellness_records (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
          record_date DATE NOT NULL DEFAULT CURRENT_DATE,
          sleep_hours DECIMAL(4,2),
          sleep_quality INTEGER,
          fatigue_level INTEGER,
          muscle_soreness INTEGER,
          soreness_location TEXT,
          stress_level INTEGER,
          readiness_score INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Garantir que as novas colunas existam
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='mood') THEN
                ALTER TABLE wellness_records ADD COLUMN mood INTEGER;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='nutrition') THEN
                ALTER TABLE wellness_records ADD COLUMN nutrition INTEGER;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='pre_training_meal') THEN
                ALTER TABLE wellness_records ADD COLUMN pre_training_meal INTEGER;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='training_recovery') THEN
                ALTER TABLE wellness_records ADD COLUMN training_recovery INTEGER;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='confidence') THEN
                ALTER TABLE wellness_records ADD COLUMN confidence INTEGER;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='overall_wellbeing') THEN
                ALTER TABLE wellness_records ADD COLUMN overall_wellbeing INTEGER;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='hydration_perception') THEN
                ALTER TABLE wellness_records ADD COLUMN hydration_perception NUMERIC;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='hydration_score') THEN
                ALTER TABLE wellness_records ADD COLUMN hydration_score NUMERIC;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='urine_color') THEN
                ALTER TABLE wellness_records ADD COLUMN urine_color INTEGER;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='symptoms') THEN
                ALTER TABLE wellness_records ADD COLUMN symptoms JSONB DEFAULT '{}'::jsonb;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='menstrual_cycle') THEN
                ALTER TABLE wellness_records ADD COLUMN menstrual_cycle TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='menstrual_symptoms') THEN
                ALTER TABLE wellness_records ADD COLUMN menstrual_symptoms TEXT[];
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_records' AND column_name='comments') THEN
                ALTER TABLE wellness_records ADD COLUMN comments TEXT;
            END IF;
        END $$;

        -- Desabilitar RLS para evitar erros de permissão
        ALTER TABLE check_ins DISABLE ROW LEVEL SECURITY;
        ALTER TABLE wellness_records DISABLE ROW LEVEL SECURITY;
        ALTER TABLE pain_reports DISABLE ROW LEVEL SECURITY;

        -- Criar índices de performance
        CREATE INDEX IF NOT EXISTS idx_wellness_records_athlete_id ON wellness_records(athlete_id);
        CREATE INDEX IF NOT EXISTS idx_wellness_records_record_date ON wellness_records(record_date);
        CREATE INDEX IF NOT EXISTS idx_wellness_records_date_athlete ON wellness_records(record_date, athlete_id);
        CREATE INDEX IF NOT EXISTS idx_check_ins_athlete_id ON check_ins(athlete_id);
        CREATE INDEX IF NOT EXISTS idx_check_ins_created_at ON check_ins(created_at);
        
        ANALYZE wellness_records;
        ANALYZE check_ins;
      `;
      // @ts-ignore
      const { error: rpcError } = await supabase.rpc('exec_sql', { sql: sql.trim() });
      
      if (rpcError) {
        console.error('Erro ao executar RPC exec_sql:', rpcError);
        if (rpcError.message?.includes('function public.exec_sql(text) does not exist')) {
          setLastError({
            message: 'Função de sistema (exec_sql) ausente no Supabase.',
            code: 'RPC_MISSING',
            details: 'A função RPC "exec_sql" não foi encontrada. Você precisa criá-la manualmente no SQL Editor do Supabase.',
            hint: 'Copie o código SQL no painel de Debug e execute-o no SQL Editor do Supabase.'
          });
          return;
        }
        throw rpcError;
      }

      console.log('Auto-Fix concluído com sucesso.');
      if (fetchRef.current) fetchRef.current();
    } catch (err: any) {
      console.error('Erro no Auto-Fix automático:', err);
      setLastError({
        message: 'Falha ao otimizar o banco de dados.',
        code: err?.code || 'AUTO_FIX_ERROR',
        details: err?.message || JSON.stringify(err),
        hint: 'Tente executar o SQL manualmente no painel de Debug.'
      });
    } finally {
      setIsAutoFixing(false);
    }
  }, []);

  const fetchWellnessData = useCallback(async () => {
      if (!supabase) return;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      setIsLoading(true);
      setLastError(null);
      try {
        const today = getLocalDateString();
        console.log('Fetching wellness for date:', today);

        // 1. Fetch athletes first (limit to 50 to ensure performance)
        const { data: athletesData, error: athletesError } = await supabase
          .from('athletes')
          .select('id, athlete_code, name, gender, category, avatar_url, last_period_date, cycle_length, is_menstruating, phone')
          .limit(50)
          .abortSignal(controller.signal);

        if (athletesError) throw athletesError;
        
        const athletes = athletesData || [];
        const athleteIds = athletes.map(a => a.id);
        
        console.log('Athletes fetched:', athletes.length);

        // 2. Fetch wellness records for these athletes ONLY (last 3 days for pain alerts)
        let wellnessData: any[] = [];
        let historicalWellnessData: any[] = [];
        if (athleteIds.length > 0) {
          const todayDateObj = new Date();
          const threeDaysAgo = new Date(todayDateObj);
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

          const { data, error: wellnessError } = await supabase
            .from('wellness_records')
            .select('athlete_id, record_date, created_at, readiness_score, sleep_hours, sleep_quality, muscle_soreness, soreness_location, fatigue_level, stress_level, mood, nutrition, pre_training_meal, training_recovery, confidence, overall_wellbeing, comments, menstrual_cycle, menstrual_symptoms, urine_color, symptoms, hydration_perception, hydration_score')
            .gte('record_date', threeDaysAgoStr)
            .lte('record_date', today)
            .in('athlete_id', athleteIds)
            .abortSignal(controller.signal);
            
          if (wellnessError) throw wellnessError;
          historicalWellnessData = data || [];
          wellnessData = historicalWellnessData.filter(r => r.record_date === today);
        }

        clearTimeout(timeoutId);
        
        console.log('Wellness records fetched:', wellnessData.length);

        // Map data
        const mappedAthletes = athletes.map(athlete => {
          const record = wellnessData.find(r => r.athlete_id === athlete.id);
          const readiness = record ? record.readiness_score : null;
          
          // Calculate pain alerts
          const painAlerts: string[] = [];
          const athleteHistory = historicalWellnessData.filter(r => r.athlete_id === athlete.id).sort((a, b) => a.record_date.localeCompare(b.record_date));
          
          if (athleteHistory.length >= 3) {
            const todayRecord = athleteHistory[athleteHistory.length - 1];
            const yesterdayRecord = athleteHistory[athleteHistory.length - 2];
            const dayBeforeRecord = athleteHistory[athleteHistory.length - 3];

            if (todayRecord.record_date === today) {
              const painToday = getPainMap(todayRecord);
              const painYesterday = getPainMap(yesterdayRecord);
              const painDayBefore = getPainMap(dayBeforeRecord);

              for (const region in painToday) {
                if (painYesterday[region] !== undefined && painDayBefore[region] !== undefined) {
                  if (painToday[region] > painDayBefore[region]) {
                    painAlerts.push(`Aumento de dor persistente (3 dias) na região: ${getPainLocationLabel(region)}`);
                  }
                }
              }
            }
          }

          let isPeriodLate = false;
          let daysLate = 0;
          if (athlete.gender === 'F' && athlete.last_period_date) {
            const lastPeriod = parseDateString(athlete.last_period_date);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0); // Reset time for comparison
            lastPeriod.setHours(0, 0, 0, 0);
            
            const diffTime = Math.abs(todayDate.getTime() - lastPeriod.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const cycleLength = athlete.cycle_length || 28;
            
            if (diffDays > cycleLength && !athlete.is_menstruating) {
              isPeriodLate = true;
              daysLate = diffDays - cycleLength;
            }
          }
          
          const painMapData = getPainMap(record);
          
          // Debug log for specific athlete
          if (record) {
            console.log(`Record for ${athlete.name}:`, record);
          }

          const painValues = Object.values(painMapData).map((p: any) => p.level);
          const maxPainFromMap = painValues.length > 0 ? Math.max(...painValues) : 0;
          const finalSoreness = record ? Math.max(record.muscle_soreness || 0, maxPainFromMap) : null;
          
          return {
            id: athlete.id,
            athlete_code: athlete.athlete_code,
            name: athlete.name,
            gender: athlete.gender,
            position: athlete.category,
            photo: (athlete.avatar_url && athlete.avatar_url.trim() !== '') ? athlete.avatar_url : `https://picsum.photos/seed/${athlete.id}/100/100`,
            status: record ? 'completed' : 'pending',
            submittedAt: record && record.created_at ? new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null,
            readiness: readiness,
            sleep: record ? record.sleep_hours : null,
            sleepQuality: record ? (record.sleep_quality > 3 ? 'Boa' : 'Regular') : null,
            soreness: finalSoreness,
            sorenessLocation: record ? record.soreness_location || 'Nenhuma' : null,
            fatigue: record ? record.fatigue_level : null,
            stress: record ? record.stress_level : null,
            mood: record ? record.mood : null,
            nutrition: record ? record.nutrition : null,
            preTrainingMeal: record ? record.pre_training_meal : null,
            trainingRecovery: record ? record.training_recovery : null,
            confidence: record ? record.confidence : null,
            overallWellbeing: record ? record.overall_wellbeing : null,
            hydration_perception: record ? record.hydration_perception : null,
            urine_color: record ? record.urine_color : null,
            comments: record ? record.comments : '',
            symptoms: record ? record.symptoms : {},
            menstrualCycle: record ? record.menstrual_cycle : null,
            menstrualSymptoms: record ? record.menstrual_symptoms : [],
            isPeriodLate,
            daysLate,
            painAlerts,
            critical: (readiness !== null && readiness < 70) || isPeriodLate || painAlerts.length > 0,
            trend: readiness !== null ? (readiness > 80 ? 'up' : readiness < 70 ? 'down' : 'stable') : null,
            phone: athlete.phone
          };
        });

        setAthletes(DataSafety.getArray(mappedAthletes));
        // Reset auto-fix flag on success
        hasAttemptedAutoFix.current = false;
      } catch (error: any) {
        console.error('Erro ao buscar dados de wellness:', error);
        
        // Auto-fix logic: if we get an error and haven't tried fixing yet, try it!
        if (!hasAttemptedAutoFix.current && error.name !== 'AbortError') {
          console.log('Detectado erro no banco. Iniciando Auto-Fix automático...');
          hasAttemptedAutoFix.current = true;
          autoFixDatabase();
          return;
        }

        if (error.name === 'AbortError') {
          setLastError({
            message: 'Tempo limite excedido (30s). O banco pode estar lento.',
            code: 'TIMEOUT',
            hint: 'Tente recarregar ou usar o botão de otimização no painel de Debug.'
          });
        } else {
          setLastError({
            message: error?.message || 'Erro ao carregar dados.',
            code: error?.code || 'FETCH_ERROR',
            details: error?.details || JSON.stringify(error),
            hint: 'Verifique a conexão ou as tabelas no Supabase.'
          });
        }
      } finally {
        setIsLoading(false);
      }
  }, [autoFixDatabase]);

  useEffect(() => {
    fetchRef.current = fetchWellnessData;
  }, [fetchWellnessData]);

  useEffect(() => {
    fetchWellnessData();
  }, [fetchWellnessData]);

  const fixDatabase = async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      await autoFixDatabase();
      alert('Banco de dados otimizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao otimizar banco:', err);
      alert('Erro ao otimizar. Verifique o painel de Debug.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!supabase) return;
    if (!window.confirm("Tem certeza que deseja limpar todos os dados de wellness? Isso não pode ser desfeito.")) return;
    
    setIsClearing(true);
    try {
      // Clear wellness_records and check_ins
      const { error: wellnessError } = await supabase
        .from('wellness_records')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      const { error: checkInsError } = await supabase
        .from('check_ins')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (wellnessError) throw wellnessError;
      if (checkInsError) throw checkInsError;
      
      alert('Dados limpos com sucesso!');
      fetchWellnessData();
    } catch (error: any) {
      console.error('Erro ao limpar dados:', error);
      alert(`Erro ao limpar dados: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleWhatsAppNotify = (athlete: any) => {
    if (!athlete.phone) {
      alert(`O atleta ${athlete.name} não possui telefone cadastrado.`);
      return;
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = athlete.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      alert(`O telefone cadastrado para ${athlete.name} parece inválido.`);
      return;
    }

    const message = `Olá ${athlete.name}, notamos que você ainda não preencheu seu wellness hoje. Por favor, reserve 1 minuto para atualizar seus dados.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleNotifyAllPending = () => {
    const pendingAthletes = athletes.filter(a => a.status === 'pending');
    if (pendingAthletes.length === 0) {
      alert('Não há atletas pendentes para notificar.');
      return;
    }

    if (window.confirm(`Deseja abrir o WhatsApp para notificar ${pendingAthletes.length} atletas? Os links serão abertos um por um.`)) {
      pendingAthletes.forEach((athlete, index) => {
        // Delay each open slightly to avoid browser blocking multiple popups
        setTimeout(() => {
          handleWhatsAppNotify(athlete);
        }, index * 1000);
      });
    }
  };

  const filteredAthletes = athletes.filter(athlete => {
    if (filter === 'completed' && athlete.status !== 'completed') return false;
    if (filter === 'pending' && athlete.status !== 'pending') return false;
    if (filter === 'critical' && !athlete.critical) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesName = athlete.name.toLowerCase().includes(searchLower);
      const matchesCode = athlete.athlete_code && athlete.athlete_code.includes(searchLower.replace('#', ''));
      if (!matchesName && !matchesCode) return false;
    }
    return true;
  });

  const completedCount = athletes.filter(a => a.status === 'completed').length;
  const totalCount = athletes.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const criticalCount = athletes.filter(a => a.critical).length;

  const getReadinessColor = (score: number | null) => {
    if (score === null) return "text-slate-500 bg-slate-800/50";
    if (score >= 75) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <SafeRender componentName="WellnessDashboard">
      <div className="flex-1 flex flex-col min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="bg-[#0f172a]/60 backdrop-blur-md border-b border-slate-800/50 px-6 py-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Activity className="w-6 h-6 text-cyan-500" />
              Monitoramento Wellness
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              Questionário Diário • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleClearData}
              disabled={isClearing}
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold uppercase text-xxs tracking-widest"
            >
              {isClearing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
              Limpar Dados
            </Button>
            <Button 
              variant="outline" 
              onClick={handleNotifyAllPending}
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-bold uppercase text-xxs tracking-widest"
            >
              <WhatsAppIcon className="w-4 h-4 mr-2" />
              Notificar Pendentes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDebug(!showDebug)}
              className={`border-slate-700 font-bold uppercase text-xxs tracking-widest ${showDebug ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'text-slate-300'}`}
            >
              <Info className="w-4 h-4 mr-2" />
              Debug
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {showDebug && (
          <Card className="bg-slate-900/80 border-cyan-500/30 shadow-2xl overflow-hidden">
            <CardHeader className="bg-cyan-500/10 border-b border-cyan-500/20 py-3">
              <CardTitle className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4" />
                Informações de Diagnóstico
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-xxs font-black text-slate-500 uppercase tracking-widest">Configuração Supabase</h3>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xxs font-mono space-y-1">
                    <p><span className="text-slate-500">URL Presente:</span> <span className={supabaseDebugInfo.hasUrl ? "text-emerald-400" : "text-rose-400"}>{supabaseDebugInfo.hasUrl ? "Sim" : "Não"}</span></p>
                    <p><span className="text-slate-500">Key Presente:</span> <span className={supabaseDebugInfo.hasKey ? "text-emerald-400" : "text-rose-400"}>{supabaseDebugInfo.hasKey ? "Sim" : "Não"}</span></p>
                    <p><span className="text-slate-500">URL Válida:</span> <span className={supabaseDebugInfo.isUrlValid ? "text-emerald-400" : "text-rose-400"}>{supabaseDebugInfo.isUrlValid ? "Sim" : "Não"}</span></p>
                    <p><span className="text-slate-500">Início URL:</span> {supabaseDebugInfo.urlStart}...</p>
                    <p><span className="text-slate-500">Tamanho Key:</span> {supabaseDebugInfo.keyLength}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xxs font-black text-slate-500 uppercase tracking-widest">Último Erro</h3>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xxs font-mono overflow-auto max-h-40">
                    {lastError ? (
                      <pre className="text-rose-400 whitespace-pre-wrap">
                        {JSON.stringify({
                          message: lastError.message,
                          code: lastError.code,
                          details: lastError.details,
                          hint: lastError.hint
                        }, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-emerald-400">Nenhum erro registrado.</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xxs font-black text-slate-500 uppercase tracking-widest">Solução de Performance (SQL)</h3>
                <div className="bg-slate-950 p-3 rounded-lg border border-amber-500/30 text-xxs font-mono space-y-2">
                  <p className="text-amber-400 font-bold">Opção 1: Apenas Otimizar (Recomendado)</p>
                  <pre className="text-slate-400 whitespace-pre-wrap bg-slate-900 p-2 rounded border border-slate-800 select-all">
{`CREATE OR REPLACE FUNCTION public.exec_sql(sql text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN EXECUTE sql; END; $$;

CREATE INDEX IF NOT EXISTS idx_wellness_records_athlete_id ON wellness_records(athlete_id);
CREATE INDEX IF NOT EXISTS idx_wellness_records_record_date ON wellness_records(record_date);
CREATE INDEX IF NOT EXISTS idx_wellness_records_date_athlete ON wellness_records(record_date, athlete_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_athlete_id ON check_ins(athlete_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_at ON check_ins(created_at);
ANALYZE wellness_records;
ANALYZE check_ins;`}
                  </pre>
                  
                  <div className="flex gap-4 mt-4">
                    <Button
                      onClick={autoFixDatabase}
                      disabled={isAutoFixing}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white font-black uppercase text-xxs tracking-widest"
                    >
                      {isAutoFixing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
                      Otimizar Banco (Auto-Fix)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={fetchWellnessData}
                      disabled={isLoading}
                      className="border-slate-700 text-slate-300 hover:text-white font-black uppercase text-xxs tracking-widest"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                      Recarregar Dados
                    </Button>
                  </div>
                  
                  <p className="text-red-400 font-bold mt-6">Opção 2: Reset Total (CUIDADO: Apaga dados de Wellness/Check-in)</p>
                  <pre className="text-slate-400 whitespace-pre-wrap bg-slate-900 p-2 rounded border border-slate-800 select-all">
{`CREATE OR REPLACE FUNCTION public.exec_sql(sql text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN EXECUTE sql; END; $$;

DROP TABLE IF EXISTS pain_reports CASCADE;
DROP TABLE IF EXISTS wellness_records CASCADE;
DROP TABLE IF EXISTS check_ins CASCADE;

CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    sleep_quality INTEGER NOT NULL,
    stress_level INTEGER NOT NULL,
    muscle_soreness INTEGER NOT NULL,
    energy_level INTEGER NOT NULL,
    hydration INTEGER DEFAULT 3,
    nutrition INTEGER DEFAULT 3,
    mood INTEGER DEFAULT 3,
    sleep_hours NUMERIC DEFAULT 8,
    pre_training_meal INTEGER DEFAULT 3,
    training_recovery INTEGER DEFAULT 3,
    confidence INTEGER DEFAULT 3,
    leg_heaviness INTEGER DEFAULT 3,
    overall_wellbeing INTEGER DEFAULT 3,
    readiness_score INTEGER NOT NULL,
    menstrual_cycle TEXT,
    menstrual_symptoms TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pain_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_in_id UUID REFERENCES check_ins(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    body_part_id TEXT NOT NULL,
    pain_level INTEGER NOT NULL,
    pain_type TEXT DEFAULT 'acute',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE wellness_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours DECIMAL(4,2),
  sleep_quality INTEGER,
  fatigue_level INTEGER,
  muscle_soreness INTEGER,
  soreness_location TEXT,
  stress_level INTEGER,
  mood INTEGER,
  nutrition INTEGER,
  pre_training_meal INTEGER,
  training_recovery INTEGER,
  confidence INTEGER,
  overall_wellbeing INTEGER,
  readiness_score INTEGER,
  menstrual_cycle TEXT,
  menstrual_symptoms TEXT[],
  hydration_perception NUMERIC,
  hydration_score NUMERIC,
  urine_color INTEGER,
  symptoms JSONB DEFAULT '{}'::jsonb,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitar RLS para facilitar o debug inicial
ALTER TABLE check_ins DISABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE pain_reports DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_wellness_records_athlete_id ON wellness_records(athlete_id);
CREATE INDEX idx_wellness_records_record_date ON wellness_records(record_date);
CREATE INDEX idx_wellness_records_date_athlete ON wellness_records(record_date, athlete_id);
CREATE INDEX idx_check_ins_athlete_id ON check_ins(athlete_id);
CREATE INDEX idx_check_ins_created_at ON check_ins(created_at);
ANALYZE wellness_records;
ANALYZE check_ins;`}
                  </pre>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => fixDatabase()}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xxs uppercase tracking-widest"
                >
                  Otimizar Banco (Auto-Fix)
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => fetchWellnessData()}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xxs uppercase tracking-widest"
                >
                  Tentar Novamente
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowDebug(false)}
                  className="border-slate-700 text-slate-400 hover:text-white font-bold text-xxs uppercase tracking-widest"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {isAutoFixing && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 animate-pulse py-20">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Sincronização Automática</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Detectamos uma inconsistência no banco de dados e estamos corrigindo automaticamente para você. Por favor, aguarde alguns segundos...
              </p>
            </div>
          </div>
        )}

        {!isAutoFixing && isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            <p className="text-sm font-bold text-cyan-400 animate-pulse uppercase tracking-widest">Carregando dados de Wellness...</p>
          </div>
        ) : !isAutoFixing && lastError ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
            <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/20">
              <AlertCircle className="w-12 h-12 text-rose-500" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Erro de Conexão</h2>
              <p className="text-sm text-slate-400">
                {lastError.message || "Ocorreu um erro ao carregar os dados do banco de dados. Isso pode ser devido a uma conexão lenta ou tempo limite excedido (Timeout)."}
              </p>
              {lastError.code === '57014' && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400 text-left">
                  <p className="font-bold uppercase mb-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Dica de Performance:
                  </p>
                  O banco de dados demorou muito para responder. Certifique-se de que os índices foram criados no Supabase SQL Editor.
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => fetchWellnessData()}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest px-8"
              >
                Tentar Novamente
              </Button>
              <Button 
                variant="outline"
                onClick={() => fixDatabase()}
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-bold uppercase tracking-widest"
              >
                Otimizar Banco (Auto-Fix)
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowDebug(true)}
                className="border-slate-700 text-slate-300 hover:text-white font-bold uppercase tracking-widest"
              >
                Ver Detalhes
              </Button>
            </div>
          </div>
        ) : !isAutoFixing && (
          <>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                <CheckCircle2 className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Taxa de Resposta</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-white">{completionRate}%</p>
                  <p className="text-xs font-bold text-slate-400">{completedCount} de {totalCount} atletas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <Activity className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Média de Prontidão (Geral)</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-emerald-400">
                    {athletes.filter(a => a.readiness !== null).length > 0
                      ? Math.round(athletes.reduce((acc, curr) => acc + (curr.readiness || 0), 0) / athletes.filter(a => a.readiness !== null).length)
                      : 0}%
                  </p>
                  <p className="text-xs font-bold text-emerald-500/70 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> Estável</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className="p-4 bg-rose-500/20 rounded-2xl border border-rose-500/30">
                <AlertCircle className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <p className="text-xxs font-black text-rose-500/70 uppercase tracking-widest mb-1">Atenção Crítica</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-rose-400">{criticalCount}</p>
                  <p className="text-xs font-bold text-rose-500/70">atletas em risco</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800/50 w-full sm:w-auto overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'completed', label: 'Respondidos' },
                { id: 'pending', label: 'Pendentes' },
                { id: 'critical', label: 'Críticos' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xxs font-black uppercase tracking-widest transition-all ${
                    filter === f.id 
                      ? 'bg-cyan-500 text-[#050B14] shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar atleta..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-xxs font-black text-slate-500 uppercase tracking-widest">
                    <th className="p-4 pl-6">Atleta</th>
                    <th className="p-4 text-center hidden lg:table-cell">Status</th>
                    <th className="p-4 text-center">Prontidão</th>
                    <th className="p-4 text-center hidden sm:table-cell">Sono (h)</th>
                    <th className="p-4 text-center">Dor</th>
                    <th className="p-4 text-center hidden md:table-cell">Fadiga</th>
                    <th className="p-4 text-center hidden xl:table-cell">Ciclo</th>
                    <th className="p-4 text-right pr-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredAthletes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-slate-800/50 rounded-full">
                            <Search className="w-8 h-8 text-slate-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-white font-bold">Nenhum atleta encontrado</p>
                            <p className="text-xs text-slate-500">Tente ajustar seus filtros ou buscar por outro nome.</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSearchQuery('');
                              setFilter('all');
                            }}
                            className="mt-2 border-slate-700 text-slate-400 hover:text-white"
                          >
                            Limpar Filtros
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAthletes.map((athlete) => (
                    <motion.tr 
                      key={athlete.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-800/20 transition-colors group"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-700">
                            <Image 
                              src={athlete.photo} 
                              alt={athlete.name} 
                              fill 
                              className="object-cover" 
                              unoptimized
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-white">{athlete.name}</p>
                              {athlete.athlete_code && (
                                <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-xxs font-bold rounded uppercase tracking-widest border border-amber-500/20">
                                  #{athlete.athlete_code}
                                </span>
                              )}
                            </div>
                            <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest">{athlete.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center hidden lg:table-cell">
                        {athlete.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xxs font-black uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" /> OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400 text-xxs font-black uppercase tracking-widest">
                            <Clock className="w-3 h-3" /> Pend
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {athlete.status === 'completed' ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className={`inline-flex items-center justify-center w-10 h-8 rounded-lg border font-black text-sm ${getReadinessColor(athlete.readiness)}`}>
                              {athlete.readiness}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-300 hidden sm:table-cell">
                        {athlete.sleep ? `${athlete.sleep}h` : '-'}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {athlete.soreness ? (
                            <span className={`text-sm font-black ${athlete.soreness > 4 ? 'text-rose-400' : 'text-slate-300'}`}>
                              {athlete.soreness}
                            </span>
                          ) : '-'}
                          {athlete.sorenessLocation && athlete.sorenessLocation !== 'Nenhuma' && (
                            <span className="text-xxs font-black text-rose-500 uppercase tracking-tighter bg-rose-500/10 px-1 rounded">Mapa</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center hidden md:table-cell">
                        {athlete.fatigue ? (
                          <span className={`text-sm font-black ${athlete.fatigue > 4 ? 'text-rose-400' : 'text-slate-300'}`}>
                            {athlete.fatigue}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-center hidden xl:table-cell">
                        {athlete.gender === 'F' ? (
                          <div className="flex flex-col items-center gap-1">
                            {athlete.menstrualCycle ? (
                              <span className="px-2 py-0.5 bg-pink-500/10 text-pink-400 text-xxs font-bold rounded uppercase tracking-widest border border-pink-500/20">
                                {athlete.menstrualCycle}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                            {athlete.isPeriodLate && (
                              <span className="flex items-center gap-1 text-xxs font-black text-rose-500 uppercase animate-pulse">
                                <AlertCircle className="w-3 h-3" /> Atraso {athlete.daysLate}d
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-700">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6">
                        {athlete.status === 'completed' ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedAnswers(athlete)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-bold uppercase text-xxs tracking-widest"
                          >
                            Ver Respostas <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleWhatsAppNotify(athlete)}
                            className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 font-bold uppercase text-xxs tracking-widest"
                          >
                            <WhatsAppIcon className="w-3 h-3 mr-1" /> Cobrar
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    )}
  </main>

      {/* Questionnaire Answers Modal */}
      {selectedAnswers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#0f172a] w-full max-w-2xl rounded-3xl border border-slate-800/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/50 flex items-start justify-between bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-700">
                  <Image 
                    src={selectedAnswers.photo} 
                    alt={selectedAnswers.name} 
                    fill 
                    className="object-cover" 
                    unoptimized
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">{selectedAnswers.name}</h2>
                    {selectedAnswers.athlete_code && (
                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-xxs font-bold rounded uppercase tracking-widest border border-amber-500/20">
                        #{selectedAnswers.athlete_code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedAnswers.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 text-xxs font-black uppercase tracking-widest">
                      <Clock className="w-3 h-3" /> Hoje, {selectedAnswers.submittedAt || '--:--'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAnswers(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              {/* Readiness Score */}
              <div className="flex items-center justify-between p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                <div>
                  <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Score de Prontidão</p>
                  <p className="text-sm font-medium text-slate-400">Calculado com base nas respostas diárias</p>
                </div>
                <div className={`flex items-center justify-center w-20 h-20 rounded-2xl border-2 font-black text-3xl ${getReadinessColor(selectedAnswers.readiness)}`}>
                  {selectedAnswers.readiness}
                </div>
              </div>

              {/* Pain Alerts */}
              {selectedAnswers.painAlerts && selectedAnswers.painAlerts.length > 0 && (
                <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-rose-500/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                    </div>
                    <p className="text-xs font-black text-rose-400 uppercase tracking-widest">Alerta Clínico: Dor Persistente</p>
                  </div>
                  <ul className="space-y-2">
                    {selectedAnswers.painAlerts.map((alert: string, idx: number) => (
                      <li key={idx} className="text-sm text-rose-300 font-medium flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Grid of Answers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sleep */}
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <Moon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Sono</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-slate-500">Duração</p>
                      <p className="text-xl font-black text-white">{selectedAnswers.sleep}h</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-slate-500">Qualidade</p>
                      <p className="text-sm font-bold text-indigo-400">{selectedAnswers.sleepQuality}</p>
                    </div>
                  </div>
                </div>

                {/* Fatigue */}
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Battery className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Fadiga</p>
                  </div>
                  <div className="flex justify-between items-end h-[2.75rem]">
                    <p className="text-sm text-slate-500">Nível (1-10)</p>
                    <p className={`text-2xl font-black ${selectedAnswers.fatigue > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {selectedAnswers.fatigue}
                    </p>
                  </div>
                </div>

                {/* Soreness */}
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50 sm:col-span-2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-rose-500/10 rounded-lg">
                      <Activity className="w-5 h-5 text-rose-400" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Dor Muscular e Mapa de Dor</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 w-full overflow-hidden">
                      <PainMap 
                        value={(() => {
                          if (!selectedAnswers.sorenessLocation || selectedAnswers.sorenessLocation === 'Nenhuma') return {};
                          try {
                            const parsed = JSON.parse(selectedAnswers.sorenessLocation);
                            const map: Record<string, { level: number; type: string }> = {};
                            
                            if (Array.isArray(parsed)) {
                              parsed.forEach(item => {
                                map[item.region] = { 
                                  level: item.intensity || item.level || 5, 
                                  type: item.type || 'muscle' 
                                };
                              });
                              return map;
                            } else if (typeof parsed === 'object' && parsed !== null) {
                              Object.entries(parsed).forEach(([loc, data]: [string, any]) => {
                                if (typeof data === 'object' && data !== null) {
                                  map[loc] = { 
                                    level: data.level || 5, 
                                    type: data.type || 'muscle' 
                                  };
                                } else {
                                  map[loc] = { 
                                    level: Number(data) || 5, 
                                    type: 'muscle' 
                                  };
                                }
                              });
                              return map;
                            }
                          } catch (e) {
                            const parts = selectedAnswers.sorenessLocation.split(',').map((s: string) => s.trim());
                            const map: Record<string, { level: number; type: string }> = {};
                            parts.forEach((p: string) => {
                              if (p) map[p] = { level: selectedAnswers.soreness || 5, type: 'muscle' };
                            });
                            return map;
                          }
                          return {};
                        })()}
                        readOnly={true}
                      />
                    </div>
                    
                    <div className="lg:col-span-5 space-y-8 w-full">
                      <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest">Intensidade Geral</p>
                          <p className={`text-2xl font-black ${Math.max(selectedAnswers.soreness || 0, ...Object.values(getPainMap(selectedAnswers)).map(p => p.level)) > 4 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {Math.max(selectedAnswers.soreness || 0, ...Object.values(getPainMap(selectedAnswers)).map(p => p.level))}/10
                          </p>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              (selectedAnswers.soreness || 0) <= 3 ? 'bg-emerald-500' : 
                              (selectedAnswers.soreness || 0) <= 6 ? 'bg-yellow-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${((selectedAnswers.soreness || 0) / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xxs font-black text-slate-500 uppercase tracking-widest">Locais Detalhados</p>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedAnswers.sorenessLocation && selectedAnswers.sorenessLocation !== 'Nenhuma' ? (
                            (() => {
                              try {
                                const parsed = JSON.parse(selectedAnswers.sorenessLocation);
                                if (Array.isArray(parsed)) {
                                  return parsed.map((item: any) => (
                                    <div 
                                      key={item.region}
                                      className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center justify-between group hover:bg-rose-500/10 transition-all"
                                    >
                                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        {getPainLocationLabel(item.region)}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xxs font-black text-rose-400 bg-rose-500/10 px-2 py-1 rounded uppercase">
                                          Nível {item.intensity || item.level || 5}
                                        </span>
                                      </div>
                                    </div>
                                  ));
                                } else if (typeof parsed === 'object' && parsed !== null) {
                                  return Object.entries(parsed).map(([loc, data]: [string, any]) => (
                                    <div 
                                      key={loc}
                                      className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center justify-between group hover:bg-rose-500/10 transition-all"
                                    >
                                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        {getPainLocationLabel(loc)}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xxs font-black text-rose-400 bg-rose-500/10 px-2 py-1 rounded uppercase">
                                          Nível {typeof data === 'object' ? data.level : data}
                                        </span>
                                      </div>
                                    </div>
                                  ));
                                }
                              } catch (e) {
                                return selectedAnswers.sorenessLocation.split(',').map((loc: string) => (
                                  <div 
                                    key={loc}
                                    className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center justify-between group hover:bg-rose-500/10 transition-all"
                                  >
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                      {getPainLocationLabel(loc.trim())}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xxs font-black text-rose-400 bg-rose-500/10 px-2 py-1 rounded uppercase">
                                        Nível {selectedAnswers.soreness || 5}
                                      </span>
                                    </div>
                                  </div>
                                ));
                              }
                            })()
                          ) : (
                            <div className="p-4 bg-slate-950/50 border border-slate-800 border-dashed rounded-xl text-center">
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Nenhum local selecionado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Sintomas Clínicos</p>
                  </div>
                  <div className="space-y-2">
                    {selectedAnswers.symptoms && Object.values(selectedAnswers.symptoms).some(v => (v as number) > 0) ? (
                      Object.entries(selectedAnswers.symptoms).map(([key, value]) => {
                        if ((value as number) === 0) return null;
                        const labels: Record<string, string> = {
                          headache: "Dor de cabeça",
                          dizziness: "Tontura",
                          nausea: "Náusea",
                          fatigue_extreme: "Fadiga extrema",
                          general_malaise: "Mal-estar geral",
                          skin_lesion: "Lesão de Pele / Bolhas",
                          ingrown_nail: "Unha Encravada",
                          bruise: "Hematoma / Pancada"
                        };
                        const levelLabels = ["Nenhum", "Leve", "Moderado", "Severo"];
                        return (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">{labels[key] || key}</span>
                            <span className={`text-xxs font-black uppercase px-2 py-0.5 rounded ${
                              (value as number) === 1 ? 'text-yellow-400 bg-yellow-400/10' :
                              (value as number) === 2 ? 'text-orange-400 bg-orange-400/10' :
                              'text-red-400 bg-red-400/10'
                            }`}>
                              {levelLabels[value as number]}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm font-bold text-emerald-500 text-center py-2">Nenhum sintoma relatado</p>
                    )}
                  </div>
                </div>

                {/* Stress */}
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Estresse</p>
                  </div>
                  <div className="flex justify-between items-end h-[2.75rem]">
                    <p className="text-sm text-slate-500">Nível (1-10)</p>
                    <p className={`text-2xl font-black ${selectedAnswers.stress > 5 ? 'text-purple-400' : 'text-emerald-400'}`}>
                      {selectedAnswers.stress}
                    </p>
                  </div>
                </div>

                {/* Mood */}
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-pink-500/10 rounded-lg">
                      <Smile className="w-5 h-5 text-pink-400" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Humor</p>
                  </div>
                  <div className="flex justify-between items-end h-[2.75rem]">
                    <p className="text-sm text-slate-500">Nível (1-5)</p>
                    <p className={`text-2xl font-black ${selectedAnswers.mood < 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedAnswers.mood || '-'}
                    </p>
                  </div>
                </div>

                {/* Hydration */}
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Droplets className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Hidratação</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-slate-500">Percepção (1-5)</p>
                      <p className="text-lg font-black text-white">{selectedAnswers.hydration_perception || '-'}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-sm text-slate-500">Cor Urina (1-5)</p>
                      <p className="text-sm font-bold text-cyan-400">{selectedAnswers.urine_color || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Nutrition */}
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Apple className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Nutrição</p>
                  </div>
                  <div className="flex justify-between items-end h-[2.75rem]">
                    <p className="text-sm text-slate-500">Qualidade (1-5)</p>
                    <p className={`text-2xl font-black ${selectedAnswers.nutrition < 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedAnswers.nutrition || '-'}
                    </p>
                  </div>
                </div>

                {/* Pre-Training Meal */}
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Utensils className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Refeição Pré-Treino</p>
                  </div>
                  <div className="flex justify-between items-end h-[2.75rem]">
                    <p className="text-sm text-slate-500">Qualidade (1-5)</p>
                    <p className={`text-2xl font-black ${selectedAnswers.preTrainingMeal < 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedAnswers.preTrainingMeal || '-'}
                    </p>
                  </div>
                </div>

                {/* Confidence & Recovery */}
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50 sm:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Target className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Confiança</p>
                      </div>
                      <p className="text-2xl font-black text-white">{selectedAnswers.confidence || '-'}/5</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <RefreshCcw className="w-5 h-5 text-orange-400" />
                        </div>
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Recuperação</p>
                      </div>
                      <p className="text-2xl font-black text-white">{selectedAnswers.trainingRecovery || '-'}/5</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <Heart className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Bem-estar</p>
                      </div>
                      <p className="text-2xl font-black text-white">{selectedAnswers.overallWellbeing || '-'}/5</p>
                    </div>
                  </div>
                </div>

                {/* Menstrual Cycle (If applicable) */}
                {selectedAnswers.gender === 'F' && (
                  <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-pink-500/10 rounded-lg">
                        <Droplets className="w-5 h-5 text-pink-400" />
                      </div>
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Ciclo Menstrual</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-500">Fase Atual</p>
                        <p className="text-sm font-black text-pink-400 uppercase tracking-widest">
                          {selectedAnswers.menstrualCycle || 'Não informado'}
                        </p>
                      </div>
                      {selectedAnswers.menstrualSymptoms && selectedAnswers.menstrualSymptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedAnswers.menstrualSymptoms.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-xxs font-black uppercase tracking-widest rounded border border-rose-500/20">
                              {s === 'cramps' ? 'Cólica' : 
                               s === 'headache' ? 'Dor de Cabeça' : 
                               s === 'bloating' ? 'Inchaço' : 
                               s === 'fatigue' ? 'Fadiga' : 
                               s === 'mood' ? 'Humor' : 
                               s === 'breast_pain' ? 'Dor nos Seios' : s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments */}
              {selectedAnswers.comments && (
                <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Comentários do Atleta</p>
                  </div>
                  <p className="text-sm text-slate-300 italic">&quot;{selectedAnswers.comments}&quot;</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800/50 bg-slate-900/80 flex justify-end gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedAnswers(null)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 font-bold uppercase text-xxs tracking-widest"
              >
                Fechar
              </Button>
              <Button 
                onClick={() => {
                  setSelectedAnswers(null);
                  onViewAthlete(selectedAnswers);
                }}
                className="bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase text-xxs tracking-widest"
              >
                Abrir Prontuário Clínico <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </SafeRender>
  );
}
