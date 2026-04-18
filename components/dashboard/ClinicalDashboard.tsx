"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PriorityQueue, PrioritizedAthlete, RiskLevel } from "./PriorityQueue";
import { SmartAlerts } from "./SmartAlerts";
import { PainHeatSummary } from "./PainHeatSummary";
import { Loader2, RefreshCcw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClinicalAlert } from "@/types/database";
import { fetchClinicalAlerts } from "@/lib/clinical";
import { getLocalDateString, parseDateString } from "@/lib/utils";

interface ClinicalDashboardProps {
  onViewAthlete: (id: string) => void;
}

const getPainLocationLabel = (id: string): string => {
  const mapping: Record<string, string> = {
    head_f: "Cabeça (F)", neck_f: "Pescoço (F)", chest: "Peitoral", abs: "Abdômen",
    shoulder_l_f: "Ombro Esq. (F)", shoulder_r_f: "Ombro Dir. (F)", biceps_l_f: "Bíceps Esq.",
    biceps_r_f: "Bíceps Dir.", forearm_l_f: "Antebraço Esq.", forearm_r_f: "Antebraço Dir.",
    hand_l_f: "Mão Esq.", hand_r_f: "Mão Dir.", pelvis_f: "Pelve / Oblíquos",
    thigh_l_f: "Coxa Esq. (Anterior)", thigh_r_f: "Coxa Dir. (Anterior)", knee_l_f: "Joelho Esq.",
    knee_r_f: "Joelho Dir.", calf_l_f: "Canela Esq.", calf_r_f: "Canela Dir.",
    foot_l_f: "Pé Esq.", foot_r_f: "Pé Dir.", head_b: "Cabeça (P)", neck_b: "Pescoço (P)",
    upper_back: "Trapézio", lats: "Dorsais", lower_back: "Lombar", shoulder_l_b: "Ombro Esq. (P)",
    shoulder_r_b: "Ombro Dir. (P)", triceps_l_b: "Tríceps Esq.", triceps_r_b: "Tríceps Dir.",
    forearm_l_b: "Antebraço Esq. (P)", forearm_r_b: "Antebraço Dir. (P)", hand_l_b: "Mão Esq. (P)",
    hand_r_b: "Mão Dir. (P)", glutes: "Glúteos", hamstring_l_b: "Coxa Esq. (P)",
    hamstring_r_b: "Coxa Dir. (P)", calf_l_b: "Panturrilha Esq.", calf_r_b: "Panturrilha Dir.",
    foot_l_b: "Calcanhar Esq.", foot_r_b: "Calcanhar Dir.",
  };
  return mapping[id] || id.replace(/_/g, " ");
};

export function ClinicalDashboard({ onViewAthlete }: ClinicalDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [athletes, setAthletes] = useState<PrioritizedAthlete[]>([]);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [painHeat, setPainHeat] = useState<{ part: string; count: number }[]>([]);
  const [stats, setStats] = useState({
    totalAthletes: 0,
    checkinsToday: 0,
    missingCheckins: 0,
    highRisk: 0,
    attention: 0,
    stable: 0,
    criticalAlerts: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!supabase) return;

      const today = getLocalDateString();
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = getLocalDateString(sevenDaysAgo);

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoStr = getLocalDateString(twoDaysAgo);

      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const fourteenDaysAgoStr = getLocalDateString(fourteenDaysAgo);

      const [athletesRes, wellnessRes, painRes, assessmentsRes, alertsRes] = await Promise.all([
        supabase
          .from('athletes')
          .select('id, name')
          .limit(100),
        supabase
          .from('wellness_records')
          .select('athlete_id, readiness_score, muscle_soreness, sleep_hours, urine_color, record_date, symptoms, created_at')
          .gte('record_date', sevenDaysAgoStr)
          .order('record_date', { ascending: true })
          .order('created_at', { ascending: true })
          .limit(500),
        supabase
          .from('pain_reports')
          .select('athlete_id, body_part_id, pain_level, created_at')
          .gte('created_at', sevenDaysAgoStr)
          .limit(500),
        supabase
          .from('all_assessments')
          .select('athlete_id, assessment_type, classification, assessment_date')
          .gte('assessment_date', fourteenDaysAgoStr)
          .order('assessment_date', { ascending: false })
          .limit(500),
        supabase
          .from('clinical_alerts')
          .select(`
            *,
            athlete:athletes(id, name)
          `)
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      const athletesData = athletesRes.data || [];
      const wellnessData = wellnessRes.data || [];
      const painData = painRes.data || [];
      const assessmentsData = assessmentsRes.data || [];
      const alertsData = alertsRes.data || [];

      setAlerts(alertsData);

      if (athletesRes.error) console.error("ATHLETES QUERY ERROR:", athletesRes.error);
      if (wellnessRes.error) console.error("WELLNESS QUERY ERROR:", wellnessRes.error);
      if (painRes.error) console.error("PAIN REPORTS QUERY ERROR:", painRes.error);
      if (assessmentsRes.error) console.error("ASSESSMENTS QUERY ERROR:", assessmentsRes.error);
      if (alertsRes.error) console.error("ALERTS QUERY ERROR:", alertsRes.error);

      // Process data
      const wellnessByAthlete = new Map<string, any[]>();
      wellnessData?.forEach(record => {
        if (!wellnessByAthlete.has(record.athlete_id)) {
          wellnessByAthlete.set(record.athlete_id, []);
        }
        wellnessByAthlete.get(record.athlete_id)!.push(record);
      });

      const assessmentsByAthlete = new Map<string, any>();
      assessmentsData?.forEach(record => {
        if (!assessmentsByAthlete.has(record.athlete_id)) {
          assessmentsByAthlete.set(record.athlete_id, record); // Since it's ordered by date desc, the first one is the latest
        }
      });

      const painByPart = new Map<string, Set<string>>();
      painData?.forEach(record => {
        if (record.pain_level >= 4) {
          if (!painByPart.has(record.body_part_id)) {
            painByPart.set(record.body_part_id, new Set());
          }
          painByPart.get(record.body_part_id)!.add(record.athlete_id);
        }
      });

      const painHeatData = Array.from(painByPart.entries())
        .map(([part, athletesSet]) => ({ part: getPainLocationLabel(part), count: athletesSet.size }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      let highRiskCount = 0;
      let attentionCount = 0;
      let stableCount = 0;
      let checkinsToday = 0;

      const sAlerts: any[] = [];

      const prioritizedList: PrioritizedAthlete[] = (athletesData || []).map(athlete => {
        const records = wellnessByAthlete.get(athlete.id) || [];
        const todayRecord = records.find(r => r.record_date.startsWith(today));
        
        if (todayRecord) checkinsToday++;

        const history = records.map(r => ({
          date: r.record_date,
          readiness: r.readiness_score || 0,
          soreness: r.muscle_soreness || 0
        }));

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (records.length >= 2) {
          const last = records[records.length - 1].readiness_score || 0;
          const prev = records[records.length - 2].readiness_score || 0;
          if (last < prev - 5) trend = 'down';
          else if (last > prev + 5) trend = 'up';
        }

        let riskLevel: RiskLevel = "none";
        let readiness = todayRecord?.readiness_score ?? null;
        let soreness = todayRecord?.muscle_soreness ?? null;
        let sleepHours = todayRecord?.sleep_hours ?? null;
        let urineColor = todayRecord?.urine_color ?? null;
        let lastCheckin = records.length > 0 ? records[records.length - 1].created_at : null;

        let isHighPriority = false;
        let hpReason = "";
        let mainReason = "";

        const latestAssessment = assessmentsByAthlete.get(athlete.id);
        const assessmentIsCritical = latestAssessment && (latestAssessment.classification === 'Alto Risco' || latestAssessment.classification === 'high');

        // --- TREND ANALYSIS ---
        const trendAlerts: string[] = [];
        const len = records.length;
        
        if (len >= 3) {
          const last3 = records.slice(-3);
          const sleepDrop = last3[0].sleep_hours > last3[1].sleep_hours && last3[1].sleep_hours > last3[2].sleep_hours;
          const sleepLow = last3.every(r => r.sleep_hours != null && r.sleep_hours < 6);
          if (sleepDrop || sleepLow) trendAlerts.push("Queda de sono (3 dias)");

          if (last3[0].readiness_score > last3[1].readiness_score && last3[1].readiness_score > last3[2].readiness_score) {
            trendAlerts.push("Prontidão em queda");
          }

          if (last3[0].muscle_soreness < last3[1].muscle_soreness && last3[1].muscle_soreness < last3[2].muscle_soreness) {
            trendAlerts.push("Aumento de dor");
          }
        }

        if (len >= 2) {
          const last = records[len - 1].readiness_score || 0;
          const prev = records[len - 2].readiness_score || 0;
          if (prev - last >= 20) {
            trendAlerts.push("Queda brusca de prontidão (>20%)");
          }
          
          const last2 = records.slice(-2);
          if (last2.every(r => r.urine_color != null && r.urine_color >= 4)) {
            trendAlerts.push("Desidratação recorrente");
          }
        }

        const hasCriticalTrend = trendAlerts.some(a => a.includes('Queda de sono') || a.includes('Prontidão em queda') || a.includes('Aumento de dor') || a.includes('Queda brusca'));

        // Check for active alerts in clinical_alerts table for this athlete
        const athleteActiveAlerts = alertsData.filter(a => a.athlete_id === athlete.id && a.status === 'active');
        const highestSeverity = athleteActiveAlerts.reduce((acc, curr) => {
          if (curr.severity === 'high') return 'high';
          if (curr.severity === 'medium' && acc !== 'high') return 'medium';
          return acc;
        }, 'low' as 'low' | 'medium' | 'high');

        if (highestSeverity === 'high') {
          riskLevel = 'high';
          isHighPriority = true;
          mainReason = athleteActiveAlerts.find(a => a.severity === 'high')?.message || "Alerta crítico ativo";
        } else if (highestSeverity === 'medium') {
          riskLevel = 'attention';
          mainReason = athleteActiveAlerts.find(a => a.severity === 'medium')?.message || "Atenção clínica";
        }

        if (riskLevel === "none") {
          if (readiness !== null && readiness < 50) {
            riskLevel = "high";
            isHighPriority = true;
            hpReason = "Prontidão muito baixa";
            mainReason = "Prontidão crítica";
            if (hasCriticalTrend) { hpReason += " + Tendência"; mainReason += " + Tendência"; }
          } else if (soreness !== null && soreness >= 7) {
            riskLevel = "high";
            isHighPriority = true;
            hpReason = "Dor severa relatada";
            mainReason = "Dor elevada";
            if (hasCriticalTrend) { hpReason += " + Tendência"; mainReason += " + Tendência"; }
          } else if (assessmentIsCritical) {
            riskLevel = "high";
            isHighPriority = true;
            hpReason = "Avaliação crítica";
            mainReason = `Avaliação ${latestAssessment.assessment_type} crítica`;
          } else if (trendAlerts.some(a => a.includes('Queda brusca'))) {
            riskLevel = "high";
            isHighPriority = true;
            hpReason = "Queda brusca de prontidão";
            mainReason = "Queda brusca de prontidão";
          }
        }

        if (!isHighPriority && readiness !== null) {
          if ((readiness >= 50 && readiness <= 70) || (soreness !== null && soreness >= 4 && soreness <= 6) || (urineColor !== null && urineColor >= 4) || (sleepHours !== null && sleepHours < 6) || trendAlerts.length > 0) {
            riskLevel = "attention";
            const reasons = [];
            if (readiness !== null && readiness <= 70) reasons.push("Prontidão em atenção");
            if (soreness !== null && soreness >= 4) reasons.push("Dor moderada");
            if (urineColor !== null && urineColor >= 4) reasons.push("Possível desidratação");
            if (sleepHours !== null && sleepHours < 6) reasons.push("Sono insuficiente");
            if (trendAlerts.length > 0) reasons.push(...trendAlerts);
            mainReason = reasons.slice(0, 2).join(" | ");
          } else {
            riskLevel = "stable";
          }
        }

        // Add to Smart Alerts
        if (trendAlerts.length > 0) {
          trendAlerts.forEach((alertMsg, idx) => {
            sAlerts.push({
              id: `alert-trend-${athlete.id}-${idx}`,
              athleteId: athlete.id,
              athleteName: athlete.name,
              type: alertMsg.includes('Queda') ? 'readiness_drop' : 'trend_alert',
              message: alertMsg
            });
          });
        }

        if (riskLevel === 'high') highRiskCount++;
        else if (riskLevel === 'attention') attentionCount++;
        else if (riskLevel === 'stable') stableCount++;

        if (lastCheckin) {
          const daysSince = (new Date().getTime() - new Date(lastCheckin).getTime()) / (1000 * 3600 * 24);
          if (daysSince > 2) {
            sAlerts.push({
              id: `alert-missing-${athlete.id}`,
              athleteId: athlete.id,
              athleteName: athlete.name,
              type: 'missing_checkin',
              message: `Sem check-in há mais de 48h.`
            });
          }
        } else {
          sAlerts.push({
            id: `alert-missing-${athlete.id}`,
            athleteId: athlete.id,
            athleteName: athlete.name,
            type: 'missing_checkin',
            message: `Nenhum check-in registrado recentemente.`
          });
        }

        const athletePain = painData?.filter(p => p.athlete_id === athlete.id) || [];
        const recentPain = athletePain.filter(p => p.pain_level >= 7);
        if (recentPain.length >= 2) {
          sAlerts.push({
            id: `alert-pain-${athlete.id}`,
            athleteId: athlete.id,
            athleteName: athlete.name,
            type: 'persistent_pain',
            message: `Dor severa (>=7) relatada em múltiplos dias.`
          });
        }

        return {
          id: athlete.id,
          name: athlete.name,
          readiness_score: readiness,
          muscle_soreness: soreness,
          last_checkin: lastCheckin,
          risk_level: riskLevel,
          trend,
          history,
          latest_assessment: latestAssessment ? {
            type: latestAssessment.assessment_type,
            classification: latestAssessment.classification,
            date: latestAssessment.assessment_date
          } : null,
          main_reason: mainReason,
          is_missing_checkin: !todayRecord
        };
      });

      const sortedList = prioritizedList.sort((a, b) => {
        const priority = { high: 0, attention: 1, stable: 2, none: 3 };
        return priority[a.risk_level] - priority[b.risk_level];
      });

      setAthletes(sortedList);
      setPainHeat(painHeatData);
      setStats({
        totalAthletes: athletesData?.length || 0,
        checkinsToday,
        missingCheckins: (athletesData?.length || 0) - checkinsToday,
        highRisk: highRiskCount,
        attention: attentionCount,
        stable: stableCount,
        criticalAlerts: alertsData.filter(a => a.status === 'active' && a.severity === 'high').length,
      });

    } catch (error: any) {
      console.error("CLINICAL DASHBOARD ERROR:", {
        message: error?.message || "Unknown error",
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        full: error
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-slate-500 text-sm font-black uppercase tracking-widest">
          Carregando Inteligência Clínica V2...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            🧠 Clinical Intelligence
            <span className="text-[10px] bg-cyan-500 text-[#050B14] px-2 py-0.5 rounded-full tracking-widest">V2</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Sistema avançado de decisão clínica e priorização.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchData}
          className="bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
        >
          <RefreshCcw size={14} />
          Atualizar Dados
        </Button>
      </header>

      <PriorityQueue 
        athletes={athletes} 
        onViewAthlete={onViewAthlete} 
        section="immediate"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <PriorityQueue 
            athletes={athletes} 
            onViewAthlete={onViewAthlete} 
            section="clinical"
          />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <SmartAlerts alerts={alerts} onRefresh={fetchData} />
          <PainHeatSummary painData={painHeat} />
        </div>
      </div>
    </div>
  );
}
