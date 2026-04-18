"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Activity,
  Moon,
  Smile,
  Battery,
  CheckCircle2,
  ActivitySquare,
  Droplets,
  AlertCircle,
  Apple,
  Clock,
  Utensils,
  RefreshCcw,
  Quote,
  History,
  Plus,
  ChevronLeft,
  ChevronRight,
  Target,
  Dumbbell,
  Heart,
  Globe,
  Lightbulb,
  Flame,
  Coins,
  Trophy,
  CalendarDays,
  Award,
  Zap,
  MessageSquare,
  LogOut,
  User,
  X,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  CheckCircle2 as CheckCircle,
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  ArrowRight,
  Info,
  MapPin,
  MoreVertical,
  Filter,
  Search,
  Download,
  Share2,
  Shield,
  Stethoscope
} from "lucide-react";
import Image from "next/image";
import { PainMap } from "@/components/PainMap";
import { SupabaseStatus } from "./SupabaseStatus";
import { supabase, hasSupabaseConfig, supabaseDebugInfo } from "@/lib/supabase";
import { t, Language } from "@/lib/i18n";
import { Athlete, WellnessRecord } from "@/types/database";
import { parseDateString, getLocalDateString } from "@/lib/utils";
import { PageContainer } from "./layout/AppLayout";
import { useAthleteStore } from "@/store/useAthleteStore";
import { DataSafety } from "@/lib/dataSafety";
import { SafeRender } from "./SafeRender";

const getPainTypeLabel = (type: string, lang: "pt" | "en"): string => {
  if (!type) return "";
  const types = type.split(', ');
  const mapping: Record<string, { pt: string; en: string }> = {
    muscle: { pt: "Dor Muscular", en: "Muscle Pain" },
    joint: { pt: "Dor Articular", en: "Joint Pain" },
    bone: { pt: "Dor Óssea", en: "Bone Pain" },
    burning: { pt: "Queimação", en: "Burning" },
    sharp: { pt: "Pontada", en: "Sharp Pain" },
    discomfort: { pt: "Incômodo leve", en: "Mild Discomfort" },
  };
  return types.map(t => mapping[t.trim().toLowerCase()]?.[lang] || t).join(', ');
};

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
  return mapping[id.trim().toLowerCase()] || id.trim().replace(/_/g, " ");
};

const mapPartToRegion = (partId: string): string | null => {
  const id = partId.toLowerCase();
  if (id.includes('knee')) return 'knee';
  if (id.includes('shoulder')) return 'shoulder';
  if (id.includes('ankle')) return 'ankle';
  if (id.includes('hip') || id.includes('pelvis') || id.includes('glutes')) return 'hip';
  if (id.includes('lumbar') || id.includes('back')) return 'lumbar';
  if (id.includes('neck') || id.includes('cervical')) return 'neck';
  return null;
};

const getPainIntensityColor = (level: number): string => {
  if (level <= 3) return "text-emerald-400";
  if (level <= 6) return "text-yellow-400";
  return "text-red-400";
};

const getOptionsForMetric = (metricId: string, lang: Language) => {
  const opts = t[lang].options;

  const defaultOptions = [
    { value: 1, label: opts.veryBad, color: "bg-red-500", emoji: "😫" },
    { value: 2, label: opts.bad, color: "bg-orange-500", emoji: "🙁" },
    { value: 3, label: opts.ok, color: "bg-yellow-500", emoji: "😐" },
    { value: 4, label: opts.good, color: "bg-lime-500", emoji: "🙂" },
    { value: 5, label: opts.veryGood, color: "bg-emerald-500", emoji: "🤩" },
  ];

  const sleepHourOptions = [
    { value: 4, label: "< 5h", color: "bg-red-500", emoji: "🥱" },
    { value: 6, label: "5-6h", color: "bg-orange-500", emoji: "😪" },
    { value: 7, label: "7h", color: "bg-yellow-500", emoji: "😌" },
    { value: 8, label: "8h", color: "bg-lime-500", emoji: "😴" },
    { value: 9, label: "> 8h", color: "bg-emerald-500", emoji: "🛌" },
  ];

  const energyOptions = [
    { value: 1, label: "0-20%", color: "bg-red-500", emoji: "🪫" },
    { value: 2, label: "20-40%", color: "bg-orange-500", emoji: "🔋" },
    { value: 3, label: "40-60%", color: "bg-yellow-500", emoji: "🔋" },
    { value: 4, label: "60-80%", color: "bg-lime-500", emoji: "🔋" },
    { value: 5, label: "80-100%", color: "bg-emerald-500", emoji: "🔋" },
  ];

  const stressOptions = [
    { value: 1, label: opts.high, color: "bg-red-500", emoji: "🤬" },
    { value: 2, label: opts.medium, color: "bg-orange-500", emoji: "😠" },
    { value: 3, label: opts.ok, color: "bg-yellow-500", emoji: "😐" },
    { value: 4, label: opts.low, color: "bg-lime-500", emoji: "🙂" },
    { value: 5, label: opts.zero, color: "bg-emerald-500", emoji: "😌" },
  ];

  const hydrationOptions = [
    { value: 1, label: "< 1L", color: "bg-red-500", emoji: "💧" },
    { value: 2, label: "1-2L", color: "bg-orange-500", emoji: "💧💧" },
    { value: 3, label: "2-3L", color: "bg-yellow-500", emoji: "💧💧💧" },
    { value: 4, label: "3-4L", color: "bg-lime-500", emoji: "🥤" },
    { value: 5, label: "> 4L", color: "bg-emerald-500", emoji: "🥤🥤" },
  ];

  const urineColorOptions = [
    { value: 1, label: lang === "pt" ? "Muito clara" : "Very clear", color: "bg-cyan-200", emoji: "💧" },
    { value: 2, label: lang === "pt" ? "Clara" : "Clear", color: "bg-yellow-200", emoji: "💧" },
    { value: 3, label: lang === "pt" ? "Amarelo claro" : "Light yellow", color: "bg-yellow-400", emoji: "🟡" },
    { value: 4, label: lang === "pt" ? "Amarelo escuro" : "Dark yellow", color: "bg-amber-500", emoji: "🟠" },
    { value: 5, label: lang === "pt" ? "Âmbar / muito escura" : "Amber / very dark", color: "bg-orange-700", emoji: "🟤" },
  ];

  const nutritionOptions = [
    { value: 1, label: opts.veryBad, color: "bg-red-500", emoji: "🍔🍟" },
    { value: 2, label: opts.bad, color: "bg-orange-500", emoji: "🍕" },
    { value: 3, label: opts.ok, color: "bg-yellow-500", emoji: "🍝" },
    { value: 4, label: opts.good, color: "bg-lime-500", emoji: "🥗🍗" },
    { value: 5, label: opts.veryGood, color: "bg-emerald-500", emoji: "🥑🥦" },
  ];

  const preTrainingMealOptions = [
    { value: 1, label: opts.didntEat, color: "bg-red-500", emoji: "🚫" },
    { value: 2, label: opts.ateLittle, color: "bg-orange-500", emoji: "🤏" },
    { value: 3, label: opts.ok, color: "bg-yellow-500", emoji: "👍" },
    { value: 4, label: opts.ateWell, color: "bg-lime-500", emoji: "😋" },
    { value: 5, label: opts.ateLot, color: "bg-emerald-500", emoji: "🍽️" },
  ];

  const confidenceOptions = [
    { value: 1, label: opts.veryLow, color: "bg-red-500", emoji: "📉" },
    { value: 2, label: opts.lowConf, color: "bg-orange-500", emoji: "😟" },
    { value: 3, label: opts.ok, color: "bg-yellow-500", emoji: "😐" },
    { value: 4, label: opts.highConf, color: "bg-lime-500", emoji: "😎" },
    { value: 5, label: opts.veryHigh, color: "bg-emerald-500", emoji: "🚀" },
  ];

  const legHeavinessOptions = [
    { value: 1, label: opts.veryHeavy, color: "bg-red-500", emoji: "🧱" },
    { value: 2, label: opts.heavy, color: "bg-orange-500", emoji: "🏋️" },
    { value: 3, label: opts.normal, color: "bg-yellow-500", emoji: "😐" },
    { value: 4, label: opts.light, color: "bg-lime-500", emoji: "🏃" },
    { value: 5, label: opts.veryLight, color: "bg-emerald-500", emoji: "🪶" },
  ];

  const menstrualCycleOptions = [
    { value: 1, label: opts.menstrual_menstruacao, color: "bg-rose-500", emoji: "🩸" },
    { value: 2, label: opts.menstrual_folicular, color: "bg-fuchsia-500", emoji: "🌱" },
    { value: 3, label: opts.menstrual_ovulatoria, color: "bg-purple-500", emoji: "✨" },
    { value: 4, label: opts.menstrual_lutea, color: "bg-pink-500", emoji: "🌙" },
  ];

  switch (metricId) {
    case "sleep_hours":
      return sleepHourOptions;
    case "energy":
      return energyOptions;
    case "stress":
      return stressOptions;
    case "hydration":
      return hydrationOptions;
    case "urine_color":
      return urineColorOptions;
    case "nutrition":
      return nutritionOptions;
    case "pre_training_meal":
      return preTrainingMealOptions;
    case "confidence":
      return confidenceOptions;
    case "leg_heaviness":
      return legHeavinessOptions;
    case "mood":
    case "training_recovery":
    case "overall_wellbeing":
      return defaultOptions;
    case "menstrual_cycle":
      return menstrualCycleOptions;
    default:
      return defaultOptions;
  }
};

const getMetrics = (lang: Language, gender: "M" | "F" = "M") => {
  const m = t[lang].metrics;
  const baseMetrics = [
    {
      id: "sleep",
      label: m.sleep.label,
      icon: Moon,
      description: m.sleep.desc,
    },
    {
      id: "sleep_hours",
      label: m.sleep_hours.label,
      icon: Clock,
      description: m.sleep_hours.desc,
    },
    {
      id: "energy",
      label: m.energy.label,
      icon: Battery,
      description: m.energy.desc,
    },
    { id: "mood", label: m.mood.label, icon: Smile, description: m.mood.desc },
    {
      id: "stress",
      label: m.stress.label,
      icon: Activity,
      description: m.stress.desc,
    },
    {
      id: "hydration",
      label: m.hydration.label,
      icon: Droplets,
      description: m.hydration.desc,
    },
    {
      id: "urine_color",
      label: lang === "pt" ? "Qual a cor da sua urina hoje?" : "What is the color of your urine today?",
      icon: Droplets,
      description: lang === "pt" ? "Indica o nível de hidratação." : "Indicates hydration level.",
    },
    {
      id: "nutrition",
      label: m.nutrition.label,
      icon: Apple,
      description: m.nutrition.desc,
    },
    {
      id: "pre_training_meal",
      label: m.pre_training_meal.label,
      icon: Utensils,
      description: m.pre_training_meal.desc,
    },
    {
      id: "training_recovery",
      label: m.training_recovery.label,
      icon: RefreshCcw,
      description: m.training_recovery.desc,
    },
    {
      id: "confidence",
      label: m.confidence.label,
      icon: Target,
      description: m.confidence.desc,
    },
    {
      id: "leg_heaviness",
      label: m.leg_heaviness.label,
      icon: Dumbbell,
      description: m.leg_heaviness.desc,
    },
    {
      id: "overall_wellbeing",
      label: m.overall_wellbeing.label,
      icon: Heart,
      description: m.overall_wellbeing.desc,
    },
  ];

  return baseMetrics;
};

const motivationalQuotes = [
  {
    text: "Eu errei mais de 9.000 arremessos na minha carreira. Perdi quase 300 jogos... E é por isso que eu tive sucesso.",
    author: "Michael Jordan",
  },
  {
    text: "Odiar perder é mais importante do que amar ganhar.",
    author: "Ayrton Senna",
  },
  {
    text: "Você não pode colocar um limite em nada. Quanto mais você sonha, mais longe você chega.",
    author: "Michael Phelps",
  },
  {
    text: "Eu odiava cada minuto dos treinos, mas dizia: 'Não desista. Sofra agora e viva o resto de sua vida como um campeão'.",
    author: "Muhammad Ali",
  },
  {
    text: "Eu treinei 4 anos para correr 9 segundos. Tem gente que não vê resultados em 2 meses e desiste.",
    author: "Usain Bolt",
  },
  {
    text: "Para ser um campeão, você tem que acreditar em si mesmo quando ninguém mais acredita.",
    author: "Sugar Ray Robinson",
  },
  {
    text: "A vontade de se preparar tem que ser maior do que a vontade de vencer.",
    author: "Bob Knight",
  },
  {
    text: "Se você não tem confiança, você sempre encontrará uma maneira de não vencer.",
    author: "Carl Lewis",
  },
  {
    text: "A excelência não é um ato singular, mas um hábito. Você é o que você faz repetidamente.",
    author: "Shaquille O'Neal",
  },
  {
    text: "Sempre acreditei que se você colocar o trabalho, os resultados virão.",
    author: "Michael Jordan",
  },
];

type ViewState = "history" | "questionnaire" | "summary";

interface AthleteDashboardProps {
  onBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  athleteId?: string;
  athleteGender?: 'M' | 'F';
}

export function AthleteDashboard({ 
  onBack, 
  onDirtyChange,
  athleteId,
  athleteGender = "F"
}: AthleteDashboardProps) {
  console.log("AthleteDashboard rendered with athleteId:", athleteId);
  const { checkins, loading: storeLoading, fetchCheckins: storeFetchCheckins } = useAthleteStore();

  const [lang, setLang] = useState<Language>("pt");
  const [view, setView] = useState<ViewState>("history");

  // Athlete profile state
  const [athleteData, setAthleteData] = useState<Athlete | null>(null);
  const [loadingAthlete, setLoadingAthlete] = useState(true);
  const [athleteCode, setAthleteCode] = useState<string | null>(null);

  // Records & Tracking
  const [latestPainMap, setLatestPainMap] = useState<Record<string, { level: number; type: string }>>({});
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [respondedToday, setRespondedToday] = useState<boolean>(false);
  const [todaySummary, setTodaySummary] = useState<any>(null);
  
  // Questionnaires & Setup
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [painMap, setPainMap] = useState<Record<string, { level: number; type: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (athleteId) {
      storeFetchCheckins(athleteId, athleteData?.sport);
    }
  }, [athleteId, athleteData?.sport, storeFetchCheckins]);

  // Gamification & Insights Logic
  const latestCheckIn = checkins[0];
  const hasCheckedInToday =
    latestCheckIn &&
    parseDateString(latestCheckIn.record_date || latestCheckIn.created_at).toDateString() ===
      new Date().toDateString();
  const currentReadiness = latestCheckIn?.readiness_score ?? 0;

  const latestPainMapData = (() => {
    const raw = latestCheckIn?.soreness_location;
    if (!raw || raw === 'Nenhuma') return {};
    
    // If it's already an object/array (Supabase auto-parsing)
    if (typeof raw === 'object' && raw !== null) {
      if (Array.isArray(raw)) {
        const map: Record<string, any> = {};
        raw.forEach(item => {
          map[item.region] = { level: item.intensity || item.level || 5, type: item.type || 'muscle' };
        });
        return map;
      }
      return raw;
    }

    // If it's a string, try parsing it
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const map: Record<string, any> = {};
          parsed.forEach(item => {
            map[item.region] = { level: item.intensity || item.level || 5, type: item.type || 'muscle' };
          });
          return map;
        } else if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
      } catch (e) {
        // Not JSON, try split
        const parts = raw.split(',').map((s: string) => s.trim());
        const map: Record<string, any> = {};
        parts.forEach((p: string) => {
          if (p) map[p] = { level: latestCheckIn?.muscle_soreness || 5, type: 'muscle' };
        });
        return map;
      }
    }
    return {};
  })();

  const finalPainMap = Object.keys(latestPainMapData).length > 0 ? latestPainMapData : latestPainMap;

  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const hasAnswers = Object.keys(answers).length > 0;
    const hasPain = Object.keys(painMap).length > 0;
    const hasNotes = notes.length > 0;
    
    if (view === "questionnaire") {
      onDirtyChange?.(hasAnswers || hasPain || hasNotes);
    } else {
      onDirtyChange?.(false);
    }
  }, [answers, painMap, notes, view, onDirtyChange]);

  // Use props for athlete identity and gender
  const theme = {
    text: athleteGender === "M" ? "text-indigo-400" : "text-rose-400",
    bg: athleteGender === "M" ? "bg-indigo-500" : "bg-rose-500",
    bgAlpha: athleteGender === "M" ? "bg-indigo-500/20" : "bg-rose-500/20",
    border: athleteGender === "M" ? "border-indigo-500/30" : "border-rose-500/30",
    borderAlpha: athleteGender === "M" ? "border-indigo-500/10" : "border-rose-500/10",
    ring: athleteGender === "M" ? "ring-indigo-500" : "ring-rose-500",
    shadow: athleteGender === "M" ? "shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "shadow-[0_0_15px_rgba(244,63,94,0.2)]",
    shadowStrong: athleteGender === "M" ? "shadow-[0_0_20px_rgba(99,102,241,0.3)]" : "shadow-[0_0_20px_rgba(244,63,94,0.3)]",
    gradientFrom: athleteGender === "M" ? "from-indigo-500/10" : "from-rose-500/10",
    gradientVia: athleteGender === "M" ? "via-purple-500" : "via-pink-500",
    gradientTo: athleteGender === "M" ? "to-indigo-500" : "to-rose-500",
    icon: athleteGender === "M" ? "text-indigo-300" : "text-rose-300",
    button: athleteGender === "M" ? "bg-indigo-600 hover:bg-indigo-500" : "bg-rose-600 hover:bg-rose-500",
  };

  // Use real data if available, otherwise 0
  const currentXp = athleteData?.xp || 0;
  const currentCoins = athleteData?.coins || 0;
  const athleteLevel = Math.floor(currentXp / 500) + 1;

  const getInsight = () => {
    if (!latestCheckIn)
      return lang === "pt"
        ? "Faça seu check-in para receber dicas personalizadas!"
        : "Complete your check-in for personalized tips!";
    if (latestCheckIn.sleep_hours < 6)
      return lang === "pt"
        ? "Seu sono foi curto. Uma soneca de 20 min à tarde pode ajudar na recuperação."
        : "Short sleep. A 20-min power nap can boost recovery.";
    if (latestCheckIn.muscle_soreness >= 4)
      return lang === "pt"
        ? "Dores musculares altas. Foco em mobilidade e hidratação hoje."
        : "High muscle soreness. Focus on mobility and hydration today.";
    if (latestCheckIn.stress_level >= 4)
      return lang === "pt"
        ? "Nível de estresse elevado. Tire 5 minutos para respiração profunda antes do treino."
        : "High stress. Take 5 mins for deep breathing before training.";
    if (currentReadiness > 80)
      return lang === "pt"
        ? "Você está na sua melhor forma! Dia perfeito para alta intensidade."
        : "You are in top shape! Perfect day for high intensity.";

    // Sport specific tips
    if (athleteData?.sport === "Futebol") {
      return lang === "pt"
        ? "Dia de treino técnico? Foco no controle de carga excêntrica para proteger seus adutores."
        : "Technical training day? Focus on eccentric load control to protect your adductors.";
    }
    if (athleteData?.sport === "Beach Tennis") {
      return lang === "pt"
        ? "A areia exige mais da sua estabilidade. Capriche no aquecimento de tornozelos hoje."
        : "Sand demands more stability. Warm up your ankles thoroughly today.";
    }

    return lang === "pt"
      ? "Recuperação estável. Mantenha o foco na hidratação e boa alimentação."
      : "Stable recovery. Keep focusing on hydration and nutrition.";
  };

  // Set random quote
  useEffect(() => {
    setMotivationalQuote(
      motivationalQuotes[
        Math.floor(Math.random() * motivationalQuotes.length)
      ],
    );
  }, [view]);

  // Fetch history and athlete data
  const fetchData = React.useCallback(async () => {
    if (!athleteId || !supabase) {
      return;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    setLoadingAthlete(true);
    
    try {
      console.log("Fetching primary data for athleteId:", athleteId);
      
      // 1. Fetch athlete profile
      const { data: athlete, error: athleteError } = await supabase
        .from("athletes")
        .select("*")
        .eq("id", athleteId)
        .single();
      
      if (athleteError) {
        console.error("Athlete fetch error:", athleteError);
      } else if (athlete) {
        setAthleteData(athlete);
        setXp(athlete.xp || 0);
        setCoins(athlete.coins || 0);
        setAthleteCode(athlete.athlete_code);
      }

      // 2. Fetch workload data
      const { data: loadData } = await supabase
        .from("physical_load_assessments")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("assessment_date", { ascending: false })
        .limit(15);
      
      if (loadData) {
        setWorkloadData(loadData);
      }

      clearTimeout(timeoutId);
    } catch (err: any) {
      console.error("Failed to fetch data in AthleteDashboard:", err);
    } finally {
      setLoadingAthlete(false);
    }
  }, [athleteId]);

  // Derived checkin data effect
  useEffect(() => {
    if (!athleteId || !supabase) return;

    // 1. Check if responded today
    const today = getLocalDateString();
    const todayRecord = checkins.find(r => r.record_date === today);
    if (todayRecord) {
      setRespondedToday(true);
      setTodaySummary(todayRecord);
    } else {
      setRespondedToday(false);
      setTodaySummary(null);
    }

    // 2. Fetch latest pain map (from the most recent record)
    const fetchPainReport = async () => {
      if (checkins.length > 0) {
        const latestId = checkins[0].id;
        const { data: painData, error: painError } = await supabase
          .from("pain_reports")
          .select("body_part_id, pain_level, pain_type")
          .eq("check_in_id", latestId)
          .limit(100);
        
        if (!painError && painData) {
          const mappedPain: Record<string, { level: number; type: string }> = {};
          painData.forEach((p: any) => {
            mappedPain[p.body_part_id] = { level: p.pain_level, type: p.pain_type || "acute" };
          });
          setLatestPainMap(mappedPain);
        }
      } else {
        setLatestPainMap({});
      }
    };

    fetchPainReport();
  }, [checkins, athleteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelect = (metricId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [metricId]: value }));
  };

  const handleSaveCycleSetup = async () => {
    if (!supabase) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('athletes')
        .update({
          last_period_date: setupLastPeriod,
          cycle_length: setupCycleLength,
          is_menstruating: false
        })
        .eq('id', athleteId);
      
      if (error) {
        console.error("Supabase error saving cycle setup:", error);
        throw error;
      }
      
      // Refresh data
      await fetchData();
      setView("history");
    } catch (err: any) {
      console.error("Error saving cycle setup:", err);
      alert(lang === "pt" 
        ? `Erro ao salvar configuração: ${err.message || "Verifique se as colunas existem no banco de dados."}`
        : `Error saving setup: ${err.message || "Check if columns exist in the database."}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const metrics = getMetrics(lang, athleteGender).filter(m => m.id !== 'menstrual_cycle');
  const isComplete = metrics.every((m) => answers[m.id] !== undefined);

  // Menstrual Cycle Helpers
  const cycleInfo = useMemo(() => {
    if (athleteGender !== "F" || !athleteData?.last_period_date) return null;

    const lastPeriod = parseDateString(athleteData.last_period_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastPeriod.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = today.getTime() - lastPeriod.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const cycleLength = (athleteData as any).cycle_length || 28;
    
    // Normalize day within cycle
    const currentDay = ((Math.max(0, diffDays - 1)) % cycleLength) + 1;
    
    let phase = "";
    let phaseKey = "";
    
    // If athlete explicitly reported they are menstruating, override the phase
    if (athleteData.is_menstruating) {
      phase = lang === "pt" ? "Menstrual" : "Menstrual";
      phaseKey = "menstrual";
    } else if (currentDay <= 5) {
      phase = lang === "pt" ? "Menstrual" : "Menstrual";
      phaseKey = "menstrual";
    } else if (currentDay <= 13) {
      phase = lang === "pt" ? "Folicular" : "Follicular";
      phaseKey = "follicular";
    } else if (currentDay <= 15) {
      phase = lang === "pt" ? "Ovulatória" : "Ovulatory";
      phaseKey = "ovulatory";
    } else {
      phase = lang === "pt" ? "Lútea" : "Luteal";
      phaseKey = "luteal";
    }

    const nextPeriodDays = Math.max(0, cycleLength - currentDay);
    const isLate = diffDays > cycleLength && !athleteData.is_menstruating;
    const lateDays = isLate ? diffDays - cycleLength : 0;

    return { currentDay, phase, phaseKey, nextPeriodDays, isLate, lateDays, cycleLength };
  }, [athleteData, lang, athleteGender]);

  const athleteAge = useMemo(() => {
    if (!athleteData?.birth_date) return null;
    const birth = new Date(athleteData.birth_date);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return { years, months, days };
  }, [athleteData?.birth_date]);

  // FINAL early return after all hooks
  if (!athleteId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center bg-[#050B14] min-h-screen">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest text-[#FFF]">Atleta Não Identificado</h2>
          <p className="text-slate-400">Não foi possível carregar os dados deste atleta. ID faltando no contexto.</p>
          <Button onClick={onBack} variant="outline" className="border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Voltar para Home</Button>
        </div>
      </div>
    );
  }

  const handleStartCycle = async () => {
    if (!supabase || !athleteId) return;
    
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    const { error } = await supabase
      .from("athletes")
      .update({ 
        last_period_date: today,
        is_menstruating: true 
      })
      .eq("id", athleteId);
    
    if (!error) {
      setAthleteData({ ...athleteData, last_period_date: today, is_menstruating: true });
      // Also save a record of this
      await supabase.from("wellness_records").insert([{
        athlete_id: athleteId,
        record_date: today,
        comments: lang === "pt" ? "Início do ciclo menstrual relatado." : "Start of menstrual cycle reported.",
        menstrual_cycle: "Menstrual"
      }]);
    }
  };

  const toggleMenstrualSymptom = (id: string) => {
    setMenstrualSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Calculate readiness score (0-100)
  const calculateReadiness = () => {
    let totalScore = 0;
    let maxScore = 0;

    Object.entries(answers).forEach(([key, value]) => {
      if (key === "sleep_hours") {
        const normalized = value <= 4 ? 1 : value >= 9 ? 5 : value - 3;
        totalScore += normalized;
      } else {
        totalScore += value;
      }
      maxScore += 5;
    });

    const painValues = Object.values(painMap).map((p) => p.level);
    const maxPain = painValues.length > 0 ? Math.max(...painValues) : 0;
    const painDeduction = maxPain * 2;

    if (maxScore === 0) return 100;

    return Math.max(
      0,
      Math.round((totalScore / maxScore) * 100) - painDeduction,
    );
  };

  const readiness = calculateReadiness();

  const calculateStreak = () => {
    if (!checkins || checkins.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(today);

    const hasToday = checkins.some((record) => {
      const recordDate = parseDateString(record.record_date || record.created_at);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    if (!hasToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    for (let i = 0; i < 30; i++) {
      const found = checkins.some((record) => {
        const recordDate = parseDateString(record.record_date || record.created_at);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === currentDate.getTime();
      });

      if (found) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getTips = () => {
    const tips = [];
    const adv = t[lang].advice;

    if (answers["hydration"] && answers["hydration"] <= 2)
      tips.push(adv.hydrationLow);
    if (answers["sleep_hours"] && answers["sleep_hours"] <= 6)
      tips.push(adv.sleepLow);
    if (answers["nutrition"] && answers["nutrition"] <= 2)
      tips.push(adv.nutritionLow);
    if (answers["stress"] && answers["stress"] <= 2) tips.push(adv.stressHigh);
    if (answers["energy"] && answers["energy"] <= 2) tips.push(adv.energyLow);
    if (answers["training_recovery"] && answers["training_recovery"] <= 2)
      tips.push(adv.recoveryLow);

    return tips;
  };

  const handleSubmit = async () => {
    if (!isComplete) return;
    setIsSubmitting(true);
    setSubmitError(null);

    if (!supabase) {
      setSubmitError("Erro de Configuração do Banco de Dados.");
      setIsSubmitting(false);
      return;
    }

    try {
      const localDateStr = getLocalDateString();
      const checkInDataToInsert = {
        athlete_id: athleteId,
        record_date: localDateStr,
        sleep_quality: answers["sleep"],
        stress_level: answers["stress"],
        muscle_soreness: answers["leg_heaviness"],
        energy_level: answers["energy"],
        readiness_score: readiness,
        notes: notes.trim() || null,
        hydration: answers["hydration"],
        nutrition: answers["nutrition"],
        mood: answers["mood"],
        sleep_hours: answers["sleep_hours"],
        pre_training_meal: answers["pre_training_meal"],
        training_recovery: answers["training_recovery"],
        confidence: answers["confidence"],
        leg_heaviness: answers["leg_heaviness"],
        overall_wellbeing: answers["overall_wellbeing"]
      };

      const { data: checkInData, error: checkInError } = await supabase
        .from("check_ins")
        .insert([checkInDataToInsert])
        .select();

      if (checkInError) throw checkInError;

      // Simplificação extrema: apenas check_ins
      console.log("Check-in enviado com sucesso");
      
      await storeFetchCheckins(athleteId, athleteData?.sport);
      await fetchData();
    } catch (error: any) {
      console.error("Error saving check-in:", error);
      setSubmitError(error.message || "Erro ao salvar check-in.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setView("summary");
  };

  const resetForm = () => {
    setAnswers({});
    setPainMap({});
    setNotes("");
    setView("history");
  };

  const toggleLang = () => {
    setLang((prev) => (prev === "pt" ? "en" : "pt"));
  };

  if (!athleteId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-rose-400 font-bold uppercase tracking-widest text-xs">Erro: ID do atleta não encontrado.</p>
          <Button onClick={onBack} variant="outline" className="text-slate-400 border-slate-800">Voltar</Button>
        </div>
      </div>
    );
  }

  if (loadingAthlete) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando perfil...</p>
        </div>
      </div>
    );
  }

    if (view === "history") {
      const streak = calculateStreak();
    const chartData = checkins
      .slice(0, 15)
      .reverse()
      .map((record) => ({
        date: parseDateString(record.record_date || record.created_at).toLocaleDateString(
          lang === "pt" ? "pt-BR" : "en-US",
          { day: "2-digit", month: "2-digit" },
        ),
        score: record.readiness_score,
        sleep: (record.sleep_quality || 0) * 20,
        fatigue: (record.fatigue_level || 0) * 20,
        stress: (record.stress_level || 0) * 20,
      }));

    const painChartData = checkins
      .slice(0, 15)
      .reverse()
      .map((record) => ({
        date: parseDateString(record.record_date || record.created_at).toLocaleDateString(
          lang === "pt" ? "pt-BR" : "en-US",
          { day: "2-digit", month: "2-digit" },
        ),
        level: record.muscle_soreness || 0,
      }));


    const WellnessWidget = () => {
      if (!respondedToday) {
        return (
          <Card className="bg-[#0A1120] border-amber-500/30 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 animate-pulse">
                    <Zap className="w-8 h-8 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Check-in de hoje pendente</h3>
                    <p className="text-slate-400 text-sm">Sua bateria clínica precisa ser atualizada para gerar insights.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setView("questionnaire")}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-widest px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105"
                >
                  Responder agora
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      }

      const summaryMetrics = [
        { label: lang === "pt" ? "Sono" : "Sleep", value: todaySummary?.sleep_quality || 0, icon: Moon, color: "text-blue-400" },
        { label: lang === "pt" ? "Fadiga" : "Fatigue", value: todaySummary?.fatigue_level || 0, icon: Battery, color: "text-amber-400" },
        { label: lang === "pt" ? "Dor" : "Pain", value: Math.max(0, ...Object.values(latestPainMap).map(p => p.level)), icon: Activity, color: "text-rose-400" },
      ];

      return (
        <Card className="bg-[#0A1120] border-emerald-500/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Check-in Concluído</h3>
                  <p className="text-slate-400 text-sm">Dados sincronizados com sucesso. Veja seu resumo abaixo.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                {summaryMetrics.map((m, i) => (
                  <div key={i} className="flex-1 md:flex-none bg-slate-900/50 border border-slate-800 p-3 rounded-xl text-center min-w-[80px]">
                    <m.icon className={`w-5 h-5 mx-auto mb-1 ${m.color}`} />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{m.label}</p>
                    <p className="text-lg font-black text-white">{m.value}{m.label === "Dor" ? "/10" : "/5"}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedRecord(todaySummary)}
                  className="flex-1 md:flex-none border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Detalhes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setView("questionnaire")}
                  className="flex-1 md:flex-none border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Editar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    };

    // Generate last 7 days for the weekly tracker
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toDateString();
      const hasRecord = checkins.some(
        (record) => parseDateString(record.record_date || record.created_at).toDateString() === dateStr,
      );
      return {
        dayName: d.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", {
          weekday: "short",
        }),
        hasRecord,
        isToday: i === 6,
      };
    });

    return (
      <PageContainer maxWidth="3xl" className="pt-safe">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pb-12"
        >
        {/* Top Bar: Title, Language & Gamification Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50 gap-3 w-full">
          <div className="flex items-center gap-2 w-full sm:w-auto pl-12 sm:pl-0">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-rose-400 mr-1 shrink-0" title="Sair">
              <LogOut className="w-5 h-5" />
            </Button>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight uppercase truncate">
              App do Atleta <span className={theme.text}>Elleven</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar w-full sm:w-auto justify-center sm:justify-end py-1">
            <div className={`flex items-center gap-2 ${theme.bgAlpha} px-2.5 py-1 rounded-full border ${theme.border} shrink-0`}>
              <Trophy className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.text}`} />
              <span className={`text-[10px] sm:text-xs font-bold ${theme.icon}`}>
                Lvl {athleteLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-500/20 px-2.5 py-1 rounded-full border border-yellow-500/30 shrink-0">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-[10px] sm:text-xs font-bold text-yellow-300">
                {currentCoins}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("squad")}
              className="text-slate-400 hover:text-white shrink-0 text-[10px] sm:text-xs h-8 px-2"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              {lang === "pt" ? "Squad" : "Squad"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="text-slate-400 hover:text-white shrink-0 text-[10px] sm:text-xs h-8 px-2"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              {lang === "pt" ? "EN" : "PT"}
            </Button>
          </div>
        </div>

        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
            <div className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 ${theme.border} shadow-2xl transition-all duration-500 hover:scale-105`}>
              <div className="absolute inset-0 rounded-full overflow-hidden">
                {(athleteData?.avatar_url && athleteData.avatar_url.trim() !== '') ? (
                  <Image 
                    src={athleteData.avatar_url} 
                    alt={athleteData.name} 
                    fill 
                    className="object-cover"
                    unoptimized
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-full h-full ${theme.bgAlpha} flex items-center justify-center`}>
                    <User className={`w-12 h-12 sm:w-16 sm:h-16 ${theme.icon}`} />
                  </div>
                )}
              </div>
              
              {/* Readiness Badge next to photo */}
              <div className="absolute -bottom-1 -right-1 bg-slate-900 p-1 rounded-full border-2 border-slate-800 shadow-xl z-20">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center border ${currentReadiness >= 80 ? 'border-emerald-500/50 bg-emerald-500/10' : currentReadiness >= 50 ? 'border-amber-500/50 bg-amber-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                  <span className={`text-[10px] sm:text-xs font-black ${currentReadiness >= 80 ? 'text-emerald-400' : currentReadiness >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {currentReadiness}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {t[lang].greeting.replace("{name}", athleteData?.nickname || athleteData?.name || "")}
              </h2>
              {athleteData?.birth_date && (
                <p className={`text-[10px] sm:text-xs font-black ${theme.text} uppercase tracking-[0.2em]`}>
                  {(() => {
                    const age = athleteAge;
                    if (!age) return '';
                    return `${age.years} anos, ${age.months} meses e ${age.days} dias`;
                  })()}
                </p>
              )}
              {athleteCode && (
                <span className={`px-3 py-1 ${theme.bgAlpha} ${theme.text} text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-widest border ${theme.borderAlpha} shadow-lg`}>
                  #{athleteCode}
                </span>
              )}
            </div>
          </div>
          <p className="text-slate-400 font-medium text-sm sm:text-base max-w-md mx-auto">
            {lang === "pt"
              ? "Pronto para dominar o dia?"
              : "Ready to dominate the day?"}
          </p>
        </div>

        {/* Motivational Quote */}
        <div className={`bg-slate-900/40 p-6 rounded-2xl border ${theme.borderAlpha} relative ${theme.shadowStrong} overflow-hidden max-w-md mx-auto`}>
          <Quote className={`absolute top-4 left-4 w-6 h-6 ${theme.bgAlpha}`} />
          <p className="text-sm text-slate-300 font-medium italic relative z-10 leading-relaxed pt-2 px-4">
            &quot;{motivationalQuote.text}&quot;
          </p>
          <p className={`text-xs ${theme.text} font-bold uppercase tracking-widest mt-3`}>
            — {motivationalQuote.author}
          </p>
        </div>

        {/* Cycle Alert (Dynamic for Female Athletes) */}
        {athleteGender === "F" && (
          <>
            {cycleInfo ? (
              <div className={`bg-rose-500/10 border ${cycleInfo.isLate ? 'border-rose-500 animate-pulse' : 'border-rose-500/30'} rounded-2xl p-4 flex items-start gap-4 max-w-md mx-auto shadow-lg`}>
                <div className={`p-2 ${cycleInfo.isLate ? 'bg-rose-500' : 'bg-rose-500/20'} rounded-full shrink-0`}>
                  <Droplets className={`w-5 h-5 ${cycleInfo.isLate ? 'text-white' : 'text-rose-400'}`} />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${cycleInfo.isLate ? 'text-rose-500' : 'text-rose-300'} mb-1 flex items-center gap-2`}>
                    {cycleInfo.isLate ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        {lang === "pt" ? "Atraso Detectado" : "Delay Detected"}
                      </>
                    ) : (
                      lang === "pt" ? "Status do Ciclo" : "Cycle Status"
                    )}
                  </h4>
                  <p className="text-xs text-rose-200/80 leading-relaxed">
                    {cycleInfo.isLate ? (
                      lang === "pt" 
                        ? `Seu ciclo está com ${cycleInfo.lateDays} dias de atraso. Por favor, informe se o ciclo iniciou ou procure a comissão.`
                        : `Your cycle is ${cycleInfo.lateDays} days late. Please report if it started or contact the staff.`
                    ) : (
                      lang === "pt"
                        ? `Você está no Dia ${cycleInfo.currentDay} (${cycleInfo.phase}). Próxima menstruação em aproximadamente ${cycleInfo.nextPeriodDays} dias.`
                        : `You are on Day ${cycleInfo.currentDay} (${cycleInfo.phase}). Next period in approximately ${cycleInfo.nextPeriodDays} days.`
                    )}
                  </p>
                  {!hasCheckedInToday && (
                    <Button 
                      size="sm" 
                      onClick={handleStartCycle}
                      className="mt-3 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest h-7 px-3 rounded-lg"
                    >
                      {lang === "pt" ? "Meu Ciclo Iniciou Hoje" : "My Cycle Started Today"}
                    </Button>
                  )}
                </div>
              </div>
            ) : !loadingAthlete && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 flex flex-col items-center text-center gap-4 max-w-md mx-auto shadow-lg">
                <div className="p-3 bg-rose-500/20 rounded-full">
                  <CalendarDays className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-wider mb-2">
                    {lang === "pt" ? "Configurar Ciclo Menstrual" : "Setup Menstrual Cycle"}
                  </h4>
                  <p className="text-sm text-rose-200/80 leading-relaxed mb-4">
                    {lang === "pt" 
                      ? "Para automatizarmos seu acompanhamento, precisamos saber a data da sua última menstruação."
                      : "To automate your tracking, we need to know the date of your last period."}
                  </p>
                  <Button 
                    onClick={() => setView("cycle_setup")}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest py-6 rounded-xl"
                  >
                    {lang === "pt" ? "Configurar Agora" : "Setup Now"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <WellnessWidget />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Charts Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Evolução de Wellness & Prontidão
                </h3>
              </div>
              <Card className="bg-[#0A1120] border-slate-800/50 p-6">
                <div className="h-64 w-full">
                  <SafeRender componentName="Gráfico de Evolução" fallback={<div className="h-full flex items-center justify-center text-slate-500 font-bold text-xs">Erro ao carregar gráfico</div>}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" stroke="#475569" fontSize={10} tickMargin={10} />
                      <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px" }}
                        itemStyle={{ fontWeight: "bold" }}
                      />
                      <Line type="monotone" dataKey="score" name="Prontidão" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="sleep" name="Sono" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      <Line type="monotone" dataKey="fatigue" name="Fadiga" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </SafeRender>
              </div>
            </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  <ActivitySquare className="w-4 h-4" />
                  Intensidade de Dor (NPS)
                </h3>
                <Card className="bg-[#0A1120] border-slate-800/50 p-6">
                  <div className="h-48 w-full">
                    <SafeRender componentName="Gráfico de Dor" fallback={<div className="h-full flex items-center justify-center text-slate-500 font-bold text-xs">Erro ao carregar gráfico</div>}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={painChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="date" stroke="#475569" fontSize={10} tickMargin={10} />
                        <YAxis stroke="#475569" fontSize={10} domain={[0, 10]} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "12px" }} />
                        <Line type="stepAfter" dataKey="level" name="Dor" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </SafeRender>
                </div>
              </Card>
              </div>
            </div>

            {/* Pain Map Summary Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  {lang === "pt" ? "Mapa de Dor Atual" : "Current Pain Map"}
                </h3>
              </div>
              
              <Card className="bg-slate-900/40 border-slate-800/50 overflow-hidden shadow-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                    <div className="w-full lg:w-1/2 shrink-0">
                      <PainMap 
                        value={finalPainMap} 
                        readOnly={true}
                      />
                    </div>
                    <div className="flex-1 space-y-6 w-full">
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intensidade Geral</p>
                          <p className={`text-xl font-black ${latestCheckIn?.muscle_soreness && latestCheckIn.muscle_soreness > 4 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {latestCheckIn?.muscle_soreness || 0}/10
                          </p>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              (latestCheckIn?.muscle_soreness || 0) <= 3 ? 'bg-emerald-500' : 
                              (latestCheckIn?.muscle_soreness || 0) <= 6 ? 'bg-yellow-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${((latestCheckIn?.muscle_soreness || 0) / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Locais Detalhados</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(finalPainMap).length > 0 ? (
                            Object.entries(finalPainMap).map(([part, data]) => (
                              <span 
                                key={part}
                                className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 group hover:bg-rose-500/20 transition-all"
                              >
                                {getPainLocationLabel(part)}
                                <span className="text-[9px] opacity-70 bg-rose-500/20 px-1.5 py-0.5 rounded">Nível {data.level}</span>
                              </span>
                            ))
                          ) : (
                            <div className="w-full text-center py-8 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800/50">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                {lang === "pt" ? "Nenhuma dor relatada" : "No pain reported"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            
            {/* Weekly Tracker & Streak */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <Trophy className="w-4 h-4" />
                Progresso Semanal
              </h3>
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50">
                <div className="flex justify-between items-center mb-6">
                  {last7Days.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          day.hasRecord
                            ? `${theme.bgAlpha} ${theme.border} ${theme.text}`
                            : day.isToday
                              ? "bg-slate-800 border-slate-600 text-slate-500 border-dashed"
                              : "bg-slate-900 border-slate-800 text-slate-700"
                        }`}
                      >
                        {day.hasRecord ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-[10px] font-bold">
                            {day.dayName.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-black text-white">{streak}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span className="text-2xl font-black text-white">{athleteLevel}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nível</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coach's Insight */}
            <div className={`${theme.bgAlpha} p-6 rounded-2xl border ${theme.border} relative overflow-hidden group`}>
              <div className="flex items-start gap-4 relative z-10">
                <div className={`p-3 ${theme.bgAlpha} rounded-xl border ${theme.border} shrink-0`}>
                  <Lightbulb className={`w-6 h-6 ${theme.text}`} />
                </div>
                <div>
                  <h3 className={`text-xs font-black ${theme.icon} uppercase tracking-wider mb-1`}>
                    Dica da Cris
                  </h3>
                  <p className="text-slate-300 font-medium leading-relaxed text-sm">
                    {getInsight()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-12 pt-8 border-t border-slate-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
              <History className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-wider">
              {t[lang].yourHistory}
            </h3>
          </div>

          {storeLoading ? (
            <div className="flex justify-center py-12">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${athleteGender === 'M' ? 'border-indigo-500' : 'border-rose-500'}`}></div>
            </div>
          ) : checkins.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-800/50">
              <p className="text-slate-400 font-medium">{t[lang].noRecords}</p>
              <p className="text-sm text-slate-500 mt-1">
                {t[lang].firstCheckin}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4">
                {checkins.map((record) => {
                  const date = parseDateString(record.record_date || record.created_at);
                  const isGood = record.readiness_score >= 75;
                  const isWarning =
                    record.readiness_score >= 50 && record.readiness_score < 75;

                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className={`bg-[#0A1120] border-slate-800/50 hover:${theme.border} transition-colors overflow-hidden relative group`}>
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${isGood ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-red-500"}`}
                        ></div>
                        <CardContent className="p-5 flex items-center justify-between pl-6">
                          <div>
                            <p className="text-white font-bold text-lg capitalize">
                              {date.toLocaleDateString(
                                lang === "pt" ? "pt-BR" : "en-US",
                                {
                                  weekday: "long",
                                  day: "2-digit",
                                  month: "short",
                                },
                              )}
                            </p>
                            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {date.toLocaleTimeString(
                                lang === "pt" ? "pt-BR" : "en-US",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                                {t[lang].battery}
                              </p>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-2xl font-black ${isGood ? "text-emerald-400" : isWarning ? "text-amber-400" : "text-red-400"}`}
                                >
                                  {record.readiness_score}%
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedRecord(record)}
                              className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0A1120] border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90dvh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {parseDateString(selectedRecord.record_date || selectedRecord.created_at).toLocaleDateString(
                      lang === "pt" ? "pt-BR" : "en-US",
                      { weekday: 'long', day: '2-digit', month: 'long' }
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                    Check-in realizado às {parseDateString(selectedRecord.record_date || selectedRecord.created_at).toLocaleTimeString(lang === "pt" ? "pt-BR" : "en-US", { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedRecord(null)}
                  className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Readiness Score */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-3xl border border-slate-800/50">
                  <div className="relative flex items-center justify-center w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-800"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 - (364.4 * selectedRecord.readiness_score) / 100}
                        className={`${
                          selectedRecord.readiness_score >= 75 ? "text-emerald-500" : 
                          selectedRecord.readiness_score >= 50 ? "text-amber-500" : "text-red-500"
                        } transition-all duration-1000 ease-out`}
                      />
                    </svg>
                    <span className="absolute text-3xl font-black text-white">{selectedRecord.readiness_score}%</span>
                  </div>
                  <p className="mt-4 text-xs font-black text-slate-500 uppercase tracking-widest">Nível de Prontidão</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {metrics.map((m) => {
                    let val = null;
                    if (selectedRecord) {
                      switch(m.id) {
                        case 'sleep': val = selectedRecord.sleep_quality; break;
                        case 'energy': val = selectedRecord.fatigue_level ? (6 - selectedRecord.fatigue_level) : null; break;
                        case 'stress': val = selectedRecord.stress_level; break;
                        case 'hydration': val = selectedRecord.hydration_perception; break;
                        case 'leg_heaviness': val = selectedRecord.muscle_soreness ? Math.ceil(selectedRecord.muscle_soreness / 2) : null; break;
                        default: val = (selectedRecord as any)[m.id];
                      }
                    }
                    const opt = getOptionsForMetric(m.id, lang).find(o => o.value === val);
                    if (!opt) return null;
                    return (
                      <div key={m.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 flex flex-col items-center text-center">
                        <m.icon className={`w-5 h-5 ${theme.text} mb-2`} />
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{m.label}</span>
                        <span className="text-base">{opt.emoji} <span className="text-sm text-white font-bold ml-1">{opt.label}</span></span>
                      </div>
                    );
                  })}
                </div>

                {/* Pain Map */}
                {(selectedRecord.soreness_location || selectedRecord.wellness_records?.[0]?.soreness_location) && (
                  <div className="space-y-4 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <ActivitySquare className="w-5 h-5 text-rose-400" />
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">Mapa de Dor</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:flex lg:flex-row gap-8 items-center justify-center">
                      <div className="w-full lg:w-1/2 shrink-0">
                        <PainMap 
                          value={(() => {
                            const loc = selectedRecord.soreness_location || selectedRecord.wellness_records?.[0]?.soreness_location;
                            if (!loc || loc === 'Nenhuma') return {};
                            try {
                              const parsed = JSON.parse(loc);
                              const map: Record<string, { level: number; type: string }> = {};
                              if (Array.isArray(parsed)) {
                                parsed.forEach(item => {
                                  if (item.region) {
                                    map[item.region] = { level: item.level || selectedRecord.muscle_soreness || 5, type: item.type || 'muscle' };
                                  }
                                });
                                return map;
                              }
                            } catch (e) {
                              const parts = loc.split(',');
                              const map: Record<string, { level: number; type: string }> = {};
                              parts.forEach((p: string) => {
                                if (p.trim()) map[p.trim()] = { level: selectedRecord.muscle_soreness || 5, type: 'muscle' };
                              });
                              return map;
                            }
                            return {};
                          })()}
                          readOnly={true} 
                        />
                      </div>
                      <div className="flex-1 space-y-6 w-full">
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 space-y-3">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intensidade Geral</p>
                          <p className={`text-2xl font-black ${selectedRecord.muscle_soreness > 4 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {selectedRecord.muscle_soreness}/10
                          </p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Locais</p>
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const loc = selectedRecord.soreness_location || selectedRecord.wellness_records?.[0]?.soreness_location;
                              if (!loc || loc === 'Nenhuma') return null;
                              try {
                                const parsed = JSON.parse(loc);
                                if (Array.isArray(parsed)) {
                                  return parsed.map(item => (
                                    <span key={item.region} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-700">
                                      {getPainLocationLabel(item.region)} {item.type ? `(${getPainTypeLabel(item.type, lang)})` : ''}
                                    </span>
                                  ));
                                }
                              } catch (e) {
                                return loc.split(',').map((l: string) => (
                                  <span key={l} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-700">
                                    {getPainLocationLabel(l.trim())}
                                  </span>
                                ));
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedRecord.notes && (
                  <div className="space-y-3 pt-4 border-t border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Observações</p>
                    <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                      <p className="text-sm text-slate-300 italic">&quot;{selectedRecord.notes}&quot;</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </PageContainer>
    );
  }

  if (view === "summary") {
    const tips = getTips();

    return (
      <PageContainer maxWidth="3xl" className="pt-safe">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8 pb-12"
        >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            {t[lang].yourDailyStatus}
          </h2>
          <p className="text-slate-400 font-medium">{t[lang].summarySent}</p>
        </div>

        <Card className={`bg-[#0A1120] ${theme.borderAlpha} shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden`}>
          <CardHeader className={`bg-gradient-to-r ${theme.gradientFrom} to-transparent pb-6 border-b ${theme.borderAlpha} text-center`}>
            <div className="w-48 h-48 mx-auto bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-800 mb-4 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <span
                className={`text-6xl font-black ${readiness >= 75 ? "text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" : readiness >= 50 ? "text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" : "text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"}`}
              >
                {readiness}%
              </span>
            </div>
            <CardTitle className="text-2xl text-white uppercase tracking-wider font-black">
              {readiness >= 75
                ? t[lang].readyForGame
                : readiness >= 50
                  ? t[lang].moderateAttention
                  : t[lang].lowBattery}
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2 text-base max-w-md mx-auto">
              {readiness >= 75
                ? t[lang].goodRecovery
                : readiness >= 50
                  ? t[lang].moderateFatigue
                  : t[lang].highRisk}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {tips.length > 0 && (
              <div className={`mb-6 ${theme.bgAlpha} border ${theme.borderAlpha} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className={`w-5 h-5 ${theme.text}`} />
                  <h3 className={`text-sm font-bold ${theme.icon} uppercase tracking-widest`}>
                    {t[lang].tips}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <li
                      key={i}
                      className="text-slate-300 text-sm flex items-start gap-2"
                    >
                      <span className={`${theme.text} mt-0.5`}>•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
              {t[lang].yourAnswers}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-8">
              {metrics.map((m) => {
                const val = answers[m.id];
                const opt = getOptionsForMetric(m.id, lang).find(
                  (o) => o.value === val,
                );
                return (
                  <div
                    key={m.id}
                    className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50 flex flex-col items-center text-center"
                  >
                    <m.icon className={`w-5 h-5 ${theme.text} mb-2`} />
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      {m.label}
                    </span>
                    <span className="text-lg">
                      {opt?.emoji}{" "}
                      <span className="text-sm text-white font-medium ml-1">
                        {opt?.label}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={resetForm}
            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white uppercase tracking-wider font-bold"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t[lang].backToHome}
          </Button>
        </div>
      </motion.div>
      </PageContainer>
    );
  }


  // Questionnaire View
  return (
    <PageContainer maxWidth="3xl" className="pt-safe">
      <div className="space-y-8 pb-12">
        <SupabaseStatus />
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => setView("history")}
          className="text-slate-400 hover:text-white hover:bg-slate-800 -ml-2"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {t[lang].back}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLang}
          className="text-slate-400 hover:text-white"
        >
          <Globe className="w-4 h-4 mr-2" />
          {lang === "pt" ? "EN" : "PT-BR"}
        </Button>
      </div>

      <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {lang === "pt" 
              ? `Atualize sua Bateria, ${athleteData?.nickname || athleteData?.name || ""} ⚡`
              : `Update your Battery, ${athleteData?.nickname || athleteData?.name || ""} ⚡`}
          </h2>
          <p className="text-slate-400 font-medium text-sm sm:text-base">{t[lang].answerHonestly}</p>
        </div>
      </div>

      <div className="space-y-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const currentOptions = getOptionsForMetric(metric.id, lang);
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`overflow-hidden bg-[#0A1120] ${theme.borderAlpha} shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
                <CardHeader className={`bg-gradient-to-r ${theme.gradientFrom} to-transparent pb-4 border-b ${theme.borderAlpha}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 ${theme.bgAlpha} rounded-lg border ${theme.border} ${theme.shadow}`}>
                      <Icon className={`w-6 h-6 ${theme.text}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white uppercase tracking-wider font-black">
                        {metric.label}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {metric.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-5 gap-2 sm:gap-4">
                    {currentOptions.map((option) => {
                      const isSelected = answers[metric.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSelect(metric.id, option.value)}
                          className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-300 border ${
                            isSelected
                              ? `${option.color} text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105 border-transparent`
                              : "bg-[#050B14] hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span className="text-2xl sm:text-3xl mb-2 drop-shadow-md">
                            {option.emoji}
                          </span>
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center leading-tight">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: metrics.length * 0.1 }}
        >
          <Card className="overflow-hidden bg-[#0A1120] border-cyan-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-transparent pb-4 border-b border-cyan-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <ActivitySquare className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white uppercase tracking-wider font-bold">
                    {t[lang].biometricScanner}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {t[lang].mapPainAreas}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 w-full overflow-hidden">
                  <PainMap value={painMap} onChange={setPainMap} lang={lang} />
                </div>
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-slate-950/50 p-5 rounded-2xl border border-cyan-500/10 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <p className="text-[10px] font-black text-cyan-500/70 uppercase tracking-widest">Status do Scanner</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">Áreas Detectadas</p>
                      <p className="text-2xl font-black text-white">{Object.keys(painMap).length}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">Intensidade Máx.</p>
                      <p className={`text-2xl font-black ${Math.max(0, ...Object.values(painMap).map(p => p.level)) > 6 ? 'text-rose-400' : 'text-cyan-400'}`}>
                        {Math.max(0, ...Object.values(painMap).map(p => p.level))}/10
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Legenda de Cores</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">0-3: Leve / Normal</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">4-6: Moderado / Atenção</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">7-10: Intenso / Crítico</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                    <p className="text-[10px] text-cyan-400/70 font-medium leading-relaxed italic">
                      * Toque nas áreas do corpo para registrar o nível e o tipo de dor específica.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (metrics.length + 2) * 0.1 }}
        >
          <Card className="overflow-hidden bg-[#0A1120] border-slate-700/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-800/50 to-transparent pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white uppercase tracking-wider font-bold">
                    {lang === "pt" ? "Notas para a Comissão" : "Notes for Staff"}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {lang === "pt" ? "Algo mais que devemos saber hoje? (Opcional)" : "Anything else we should know today? (Optional)"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === "pt" ? "Ex: Senti uma fisgada leve no adutor no último treino..." : "Ex: Felt a slight pull in my adductor during the last sprint..."}
                className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col items-end pt-4 space-y-4"
      >
        {submitError && (
          <div className="w-full p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
            <p className="text-red-400 font-medium text-sm">{submitError}</p>
            <p className="text-red-500/70 text-xs mt-1">
              Dica: Se o erro for de permissão (RLS), execute o script SQL para
              desativar o RLS.
            </p>
          </div>
        )}
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          className={`w-full sm:w-auto ${theme.button} text-white font-bold uppercase tracking-widest ${theme.shadowStrong} disabled:opacity-50 disabled:shadow-none`}
        >
          {isSubmitting ? t[lang].syncing : t[lang].syncData}
        </Button>
        </motion.div>
      </div>
    </PageContainer>
  );
}
