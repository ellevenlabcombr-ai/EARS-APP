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
  Stethoscope,
  Bell,
  PhoneCall,
  WifiOff
} from "lucide-react";
import Image from "next/image";
import { PainMap } from "@/components/PainMap";
import { CycleCalendar } from "./CycleCalendar";
import { CYCLE_PHASES } from "@/lib/menstrual-content";
import { SupabaseStatus } from "./SupabaseStatus";
import { supabase, hasSupabaseConfig, supabaseDebugInfo } from "@/lib/supabase";
import { t, Language } from "@/lib/i18n";
import { Athlete, WellnessRecord } from "@/types/database";
import { parseDateString, getLocalDateString, getLocalDateTimeString } from "@/lib/utils";
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

const CLINICAL_SIGNS = [
  { id: "Febre", label_pt: "Febre", label_en: "Fever", emoji: "🤒" },
  { id: "Enjoo", label_pt: "Náusea / Enjoo", label_en: "Nausea", emoji: "🤢" },
  { id: "Vômito", label_pt: "Vômito", label_en: "Vomiting", emoji: "🤮" },
  { id: "Dor de Cabeça", label_pt: "Dor de Cabeça", label_en: "Headache", emoji: "🤕" },
  { id: "Tontura", label_pt: "Tontura / Vertigem", label_en: "Dizziness", emoji: "😵‍💫" },
  { id: "Dor de Garganta", label_pt: "Dor de Garganta", label_en: "Sore Throat", emoji: "🗣️" },
  { id: "Diarreia", label_pt: "Diarreia", label_en: "Diarrhea", emoji: "🚽" },
  { id: "Gripe", label_pt: "Sintomas Gripais", label_en: "Flu Symptoms", emoji: "🤧" },
  { id: "Lesão Pele", label_pt: "Lesão de Pele / Arranhão", label_en: "Skin Lesion", emoji: "🩹" },
  { id: "Bolhas", label_pt: "Bolhas", label_en: "Blisters", emoji: "🦶" },
  { id: "Unha Encravada", label_pt: "Unha Encravada", label_en: "Ingrown Toenail", emoji: "🩸" },
  { id: "Cólica", label_pt: "Cólica / Dor Abdominal", label_en: "Cramps", emoji: "😣", menstrual: true },
  { id: "Inchaço", label_pt: "Inchaço / Retenção", label_en: "Bloating", emoji: "🎈", menstrual: true },
  { id: "Sensibilidade Seios", label_pt: "Sensibilidade nos Seios", label_en: "Breast Sensitivity", emoji: "👙", menstrual: true },
  { id: "Humor", label_pt: "Mudança de Humor / TPM", label_en: "Mood Swings / PMS", emoji: "🌪️", menstrual: true },
  { id: "Acne", label_pt: "Pico de Acne", label_en: "Acne Breakout", emoji: "🫧", menstrual: true },
  { id: "Desejo Doce", label_pt: "Desejo por Doces", label_en: "Cravings", emoji: "🍫", menstrual: true },
];

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
    { value: 3, label: opts.ok, color: "bg-yellow-500", emoji: "👍" },
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
    { value: 3, label: opts.ok, color: "bg-yellow-500", emoji: "👍" },
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
    { value: 3, label: opts.ok, color: "bg-yellow-500", emoji: "👍" },
    { value: 4, label: opts.highConf, color: "bg-lime-500", emoji: "😎" },
    { value: 5, label: opts.veryHigh, color: "bg-emerald-500", emoji: "🚀" },
  ];

  const legHeavinessOptions = [
    { value: 1, label: opts.veryHeavy, color: "bg-red-500", emoji: "🧱" },
    { value: 2, label: opts.heavy, color: "bg-orange-500", emoji: "🏋️" },
    { value: 3, label: opts.normal, color: "bg-yellow-500", emoji: "👍" },
    { value: 4, label: opts.light, color: "bg-lime-500", emoji: "🏃" },
    { value: 5, label: opts.veryLight, color: "bg-emerald-500", emoji: "🪶" },
  ];

  const menstrualCycleOptions = [
    { value: 1, label: opts.menstrual_menstruacao, color: "bg-rose-500", emoji: "🩸" },
    { value: 2, label: opts.menstrual_folicular, color: "bg-fuchsia-500", emoji: "🌱" },
    { value: 3, label: opts.menstrual_ovulatoria, color: "bg-purple-500", emoji: "✨" },
    { value: 4, label: opts.menstrual_lutea, color: "bg-pink-500", emoji: "🌙" },
  ];

  const rpeOptions = [
    { value: 1, label: opts.rpe_very_easy, color: "bg-emerald-500", emoji: "😄" },
    { value: 2, label: opts.rpe_easy, color: "bg-lime-500", emoji: "🙂" },
    { value: 3, label: opts.rpe_medium, color: "bg-yellow-500", emoji: "😐" },
    { value: 4, label: opts.rpe_hard, color: "bg-orange-500", emoji: "😣" },
    { value: 5, label: opts.rpe_very_hard, color: "bg-red-500", emoji: "🥵" },
  ];

  const previousActivityOptions = [
    { value: 5, label: opts.act_rest, color: "bg-emerald-500", emoji: "🛌" },
    { value: 4, label: opts.act_phys, color: "bg-lime-500", emoji: "🏋️" },
    { value: 3, label: opts.act_train, color: "bg-yellow-500", emoji: "⚽" },
    { value: 2, label: opts.act_friendly, color: "bg-orange-500", emoji: "🤝" },
    { value: 1, label: opts.act_match, color: "bg-red-500", emoji: "🔥" },
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
    case "rpe_simple":
      return rpeOptions;
    case "previous_activity":
      return previousActivityOptions;
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
    // Morning Section
    {
      id: "sleep",
      group: "morning",
      label: m.sleep.label,
      icon: Moon,
      description: m.sleep.desc,
    },
    {
      id: "sleep_hours",
      group: "morning",
      label: m.sleep_hours.label,
      icon: Clock,
      description: m.sleep_hours.desc,
    },
    {
      id: "energy",
      group: "morning",
      label: m.energy.label,
      icon: Battery,
      description: m.energy.desc,
    },
    { id: "mood", group: "morning", label: m.mood.label, icon: Smile, description: m.mood.desc },
    {
      id: "stress",
      group: "morning",
      label: m.stress.label,
      icon: Activity,
      description: m.stress.desc,
    },
    // Daily/Habits Section
    {
      id: "hydration",
      group: "habits",
      label: m.hydration.label,
      icon: Droplets,
      description: m.hydration.desc,
    },
    {
      id: "urine_color",
      group: "habits",
      label: lang === "pt" ? "Qual a cor da sua urina hoje?" : "What is the color of your urine today?",
      icon: Droplets,
      description: lang === "pt" ? "Indica o nível de hidratação." : "Indicates hydration level.",
    },
    {
      id: "nutrition",
      group: "habits",
      label: m.nutrition.label,
      icon: Apple,
      description: m.nutrition.desc,
    },
    {
      id: "pre_training_meal",
      group: "habits",
      label: m.pre_training_meal.label,
      icon: Utensils,
      description: m.pre_training_meal.desc,
    },
    // Evening/Performance Section
    {
      id: "previous_activity",
      group: "evening",
      label: m.previous_activity.label,
      icon: Activity,
      description: m.previous_activity.desc,
    },
    {
      id: "training_recovery",
      group: "evening",
      label: m.training_recovery.label,
      icon: RefreshCcw,
      description: m.training_recovery.desc,
    },
    {
      id: "confidence",
      group: "evening",
      label: m.confidence.label,
      icon: Target,
      description: m.confidence.desc,
    },
    {
      id: "leg_heaviness",
      group: "evening",
      label: m.leg_heaviness.label,
      icon: Dumbbell,
      description: m.leg_heaviness.desc,
    },
    {
      id: "rpe_simple",
      group: "evening",
      label: m.rpe_simple.label,
      icon: Zap,
      description: m.rpe_simple.desc,
    },
    {
      id: "duration_minutes",
      group: "evening",
      label: m.duration_minutes.label,
      icon: Clock,
      description: m.duration_minutes.desc,
      type: "input"
    },
    {
      id: "overall_wellbeing",
      group: "overall",
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

type ViewState = "history" | "questionnaire" | "summary" | "cycle_setup" | "cycle_details" | "squad";

interface AthleteDashboardProps {
  onBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  athleteId?: string;
  athleteGender?: 'M' | 'F';
  initialAthleteData?: any;
}

export function AthleteDashboard({ 
  onBack, 
  onDirtyChange,
  athleteId,
  athleteGender = "F",
  initialAthleteData
}: AthleteDashboardProps) {
  console.log("AthleteDashboard rendered with athleteId:", athleteId);
  const { checkins, loading: storeLoading, fetchCheckins: storeFetchCheckins } = useAthleteStore();

  const [lang, setLang] = useState<Language>("pt");
  const [view, setView] = useState<ViewState>("history");

  // Athlete profile state
  const [athleteData, setAthleteData] = useState<Athlete | null>(initialAthleteData || null);
  const [loadingAthlete, setLoadingAthlete] = useState(true);
  const [athleteCode, setAthleteCode] = useState<string | null>(null);

  // Motivational Quote
  const [motivationalQuote, setMotivationalQuote] = useState(motivationalQuotes[0]);

  // Athletes setup states
  const [setupLastPeriod, setSetupLastPeriod] = useState<string>("");
  const [setupCycleLength, setSetupCycleLength] = useState<number>(28);
  const [menstrualSymptoms, setMenstrualSymptoms] = useState<string[]>([]);
  const [workloadData, setWorkloadData] = useState<any[]>([]);

  // Records & Tracking
  const [latestPainMap, setLatestPainMap] = useState<Record<string, { level: number; type: string }>>({});
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [respondedToday, setRespondedToday] = useState<boolean>(false);
  const [todaySummary, setTodaySummary] = useState<any>(null);
  
  // Questionnaires & Setup
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [clinicalSigns, setClinicalSigns] = useState<string[]>([]);
  const [painMap, setPainMap] = useState<Record<string, { level: number; type: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [isOffline, setIsOffline] = useState(false);
  const [hasPushPermission, setHasPushPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineData();
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if ("Notification" in window) {
      setHasPushPermission(Notification.permission);
    }
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [athleteId]);

  const syncOfflineData = async () => {
    if (!supabase) return;
    const pendingJson = localStorage.getItem(`pending_checkins_${athleteId}`);
    if (!pendingJson) return;

    try {
      const pendingData = JSON.parse(pendingJson);
      for (const item of pendingData) {
        // Assume item matches everything inserted in handleSubmit
        const { checkInDataToInsert, painReportsToInsert, sprintDataToInsert, workloadDataToInsert, cycleDataToInsert } = item;
        
        const { data: checkInData, error: checkInError } = await supabase.from("check_ins").insert([checkInDataToInsert]).select();
        if (checkInError) throw checkInError;
        
        const checkInId = checkInData[0].id;
        
        if (painReportsToInsert?.length > 0) {
          const finalPainReports = painReportsToInsert.map((p: any) => ({ ...p, check_in_id: checkInId }));
          await supabase.from("pain_reports").insert(finalPainReports);
        }
        if (sprintDataToInsert) {
          await supabase.from("sprint_data").insert([{ ...sprintDataToInsert, check_in_id: checkInId }]);
        }
        if (workloadDataToInsert) {
          await supabase.from("workload_tracking").insert([{ ...workloadDataToInsert, check_in_id: checkInId }]);
        }
        if (cycleDataToInsert) {
          await supabase.from("menstrual_tracking").insert([{ ...cycleDataToInsert, check_in_id: checkInId }]);
        }
      }
      localStorage.removeItem(`pending_checkins_${athleteId}`);
      storeFetchCheckins(athleteId!, athleteData?.sport);
    } catch (e) {
      console.error("Error syncing offline data:", e);
    }
  };

  const handlePushPermission = async () => {
    setShowNotificationSettings(true);
  };

  const handleSaveNotifications = async () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      try {
        const permission = await Notification.requestPermission();
        setHasPushPermission(permission);
      } catch (err) {
        console.error("Error asking push permission:", err);
      }
    } else if ("Notification" in window) {
      setHasPushPermission(Notification.permission);
    }
    
    // Save to local storage representing the backend config for now
    localStorage.setItem(`ears_reminder_time_${athleteId}`, reminderTime);
    setShowNotificationSettings(false);
    alert(lang === "pt" ? `Lembrete configurado para as ${reminderTime}!` : `Reminder set for ${reminderTime}!`);
  };

  useEffect(() => {
    const savedTime = localStorage.getItem(`ears_reminder_time_${athleteId}`);
    if (savedTime) setReminderTime(savedTime);
  }, [athleteId]);

  useEffect(() => {
    if (athleteId) {
      storeFetchCheckins(athleteId, athleteData?.sport);
    }
  }, [athleteId, athleteData?.sport, storeFetchCheckins]);

  // Gamification & Insights Logic
  const latestCheckIn = checkins[0];
  const hasCheckedInToday =
    latestCheckIn &&
    parseDateString(latestCheckIn.created_at || latestCheckIn.record_date).toDateString() ===
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

    // 1. Check if responded today (only if it has a readiness score)
    const today = getLocalDateString();
    const todayRecord = checkins.find(r => {
      const rDate = r.created_at || r.record_date;
      return rDate.startsWith(today) && r.readiness_score !== undefined && r.readiness_score !== null;
    });
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
    if (!supabase || !athleteId || !setupLastPeriod) return;
    
    const { error } = await supabase
      .from("athletes")
      .update({ 
        last_period_date: setupLastPeriod,
        cycle_length: setupCycleLength,
        is_menstruating: false // Resetting if they are setting up a new cycle
      })
      .eq("id", athleteId);
    
    if (!error) {
      setAthleteData(prev => prev ? { ...prev, last_period_date: setupLastPeriod, cycle_length: setupCycleLength } : null);
      setView("history");
    } else {
      console.error("Error saving cycle setup:", error);
    }
  };

  const metrics = getMetrics(lang, athleteGender);
  const isComplete = metrics.every((m) => answers[m.id] !== undefined);

  const toggleClinicalSign = (id: string) => {
    setClinicalSigns((prev) => 
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

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
          <Button onClick={onBack} variant="outline" className="border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-xxs">Voltar para Home</Button>
        </div>
      </div>
    );
  }

  const handleToggleMenstruating = async () => {
    if (!supabase || !athleteId) return;
    
    const isCurrentlyMenstruating = !!athleteData?.is_menstruating;
    const today = getLocalDateString();
    const now = getLocalDateTimeString();
    
    const updateData: any = { 
      is_menstruating: !isCurrentlyMenstruating 
    };
    
    // If starting a new cycle, update last_period_date
    if (!isCurrentlyMenstruating) {
      updateData.last_period_date = today;
    }
    
    const { error } = await supabase
      .from("athletes")
      .update(updateData)
      .eq("id", athleteId);
    
    if (!error) {
      setAthleteData(prev => prev ? { ...prev, ...updateData } : null);
      
      const commentPt = !isCurrentlyMenstruating 
        ? "Início do ciclo menstrual relatado no Wellness."
        : "Término da fase menstrual relatado no Wellness.";
      const commentEn = !isCurrentlyMenstruating 
        ? "Start of menstrual cycle reported in Wellness."
        : "End of menstrual phase reported in Wellness.";

      await supabase.from("wellness_records").insert([{
        athlete_id: athleteId,
        record_date: now,
        comments: lang === "pt" ? commentPt : commentEn,
        menstrual_cycle: !isCurrentlyMenstruating ? "Menstrual" : "Follicular"
      }]);
      
      // Refresh local data to ensure everything is synced
      fetchData();
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
      // Exclude menstrual cycle from standard calculating out of 5
      if (key === "menstrual_cycle" || key === "duration_minutes" || key === "rpe_simple" || key === "previous_activity") return;

      let scoreValue = value;

      if (key === "sleep_hours") {
        // value ranges from 4 to 9+. Normalized is roughly 1 for 4h, 5 for 9+.
        scoreValue = value <= 4 ? 1 : value >= 9 ? 5 : value - 3;
      } else if (key === "urine_color") {
        // Urine color 1 (Clear) is optimal (5/5 points), 5 (Dark Amber) is negative (1/5 points)
        scoreValue = 6 - value; 
      }

      totalScore += scoreValue;
      maxScore += 5;
    });

    const painValues = Object.values(painMap).map((p) => p.level);
    const maxPain = painValues.length > 0 ? Math.max(...painValues) : 0;
    
    // Pain deduction: Mild pain (1-3) should deduct softly. Severe pain (7-10) should deduct heavily.
    // Curve: Level 1: 0.25%, Level 3: 2.25%, Level 5: 6.25%, Level 7: 12.25%, Level 10: 25% max deduction
    const painDeduction = maxPain > 0 ? (maxPain * maxPain) * 0.25 : 0; 
    
    // Clinical Signs Deduction Nuance
    let signsDeduction = 0;
    
    // Weights based on severity to prevent inflating or undervaluing based on context
    const severeSigns = ["Febre", "Vômito", "Diarreia", "Gripe"];
    const moderateSigns = ["Enjoo", "Tontura", "Dor de Cabeça", "Dor de Garganta"];
    const minorSigns = ["Lesão Pele", "Bolhas", "Unha Encravada"];

    clinicalSigns.forEach(sign => {
      if (severeSigns.includes(sign)) signsDeduction += 15;
      else if (moderateSigns.includes(sign)) signsDeduction += 8;
      else if (minorSigns.includes(sign)) signsDeduction += 2;
      else signsDeduction += 5; 
    });

    // Age factor 
    // Older athletes might take slightly longer to recover, meaning clinical/pain symptoms impact more
    let ageMultiplier = 1.0;
    if (athleteAge?.years) {
      if (athleteAge.years <= 20) {
        ageMultiplier = 0.85; // Faster recovery, symptoms impact 15% less
      } else if (athleteAge.years >= 30) {
        ageMultiplier = 1.15; // Slower recovery, symptoms impact 15% more
      }
    }

    // Activity Deduction
    const previousActivity = answers["previous_activity"];
    let activityDeduction = 0;
    if (previousActivity === 1) activityDeduction = 15; // Match -> huge drop
    else if (previousActivity === 2) activityDeduction = 10; // Friendly -> big drop
    else if (previousActivity === 3) activityDeduction = 5; // Tactical -> slight drop
    else if (previousActivity === 4) activityDeduction = 0; // Gym -> nothing
    else if (previousActivity === 5) activityDeduction = -5; // Rest -> gain readiness

    const totalDeductions = ((painDeduction + signsDeduction) * ageMultiplier) + activityDeduction;

    if (maxScore === 0) return Math.min(100, Math.max(0, 100 - Math.round(totalDeductions)));

    let baseReadiness = (totalScore / maxScore) * 100;
    
    return Math.min(
      100,
      Math.max(
        0,
        Math.round(baseReadiness - totalDeductions)
      )
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
      const recordDate = parseDateString(record.created_at || record.record_date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    if (!hasToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    for (let i = 0; i < 30; i++) {
      const found = checkins.some((record) => {
        const recordDate = parseDateString(record.created_at || record.record_date);
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

  const getTips = (record?: any) => {
    const tips = [];
    const adv = t[lang].advice;
    
    // Check values either from the passed record or current unsubmitted answers
    const hasLowHydration = record ? record.hydration_perception <= 2 : (answers["hydration"] && answers["hydration"] <= 2);
    const hasLowSleep = record ? record.sleep_hours <= 6 : (answers["sleep_hours"] && answers["sleep_hours"] <= 6);
    const hasLowNutrition = record ? record.nutrition <= 2 : (answers["nutrition"] && answers["nutrition"] <= 2);
    const hasHighStress = record ? record.stress_level <= 2 : (answers["stress"] && answers["stress"] <= 2);
    const hasLowEnergy = record ? record.fatigue_level <= 2 : (answers["energy"] && answers["energy"] <= 2);
    const hasLowRecovery = record ? record.training_recovery <= 2 : (answers["training_recovery"] && answers["training_recovery"] <= 2);

    const currentReadiness = record ? record.readiness_score : calculateReadiness();
    if (currentReadiness >= 75) {
      tips.push(lang === 'pt' ? 'Mantenha o ritmo! Nenhuma ação corretiva drástica é necessária hoje.' : 'Keep the pace! No drastic corrective action needed today.');
    } else if (currentReadiness >= 50) {
      tips.push(lang === 'pt' ? 'Recuperação ativa obrigatória: execute 15min de mobilidade e trabalho regenerativo hoje.' : 'Mandatory active recovery: execute 15min of mobility and regenerative work today.');
    } else {
      tips.push(lang === 'pt' ? 'Recuperação passiva obrigatória: descanso total. Comunique imediatamente o departamento físico sobre qualquer dor.' : 'Mandatory passive recovery: total rest. Immediately notify the physical department of any pain.');
    }

    if (hasLowHydration) tips.push(adv.hydrationLow);
    if (hasLowSleep) tips.push(adv.sleepLow);
    if (hasLowNutrition) tips.push(adv.nutritionLow);
    if (hasHighStress) tips.push(adv.stressHigh);
    if (hasLowEnergy) tips.push(adv.energyLow);
    if (hasLowRecovery) tips.push(adv.recoveryLow);

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
      const fullTimestamp = getLocalDateTimeString();
      const localDateStr = getLocalDateString();
      
      const clinicalSignsText = clinicalSigns.length > 0 
        ? `[SINAIS CLÍNICOS: ${clinicalSigns.join(", ")}] ` 
        : "";
      const finalNotes = `${clinicalSignsText}${notes.trim()}`.trim() || null;
      
      // Calculate max pain to map to muscle_soreness
      let maxPain = 0;
      let compiledSorenessLocation: string | null = null;
      
      if (Object.keys(painMap).length > 0) {
        maxPain = Math.max(...Object.values(painMap).map(p => p.level));
        compiledSorenessLocation = JSON.stringify(
          Object.entries(painMap).map(([region, data]) => ({
            region,
            level: data.level,
            type: data.type
          }))
        );
      }

      const rpe_simple = answers["rpe_simple"] || 0;
      const duration_minutes = answers["duration_minutes"] || 0;
      const mapped_rpe = rpe_simple * 2;
      const session_load = mapped_rpe * duration_minutes;

      const checkInDataToInsert = {
        athlete_id: athleteId,
        record_date: fullTimestamp,
        sleep_quality: answers["sleep"],
        stress_level: answers["stress"],
        muscle_soreness: maxPain > 0 ? maxPain : (answers["leg_heaviness"] || 0),
        energy_level: answers["energy"],
        readiness_score: readiness,
        notes: finalNotes,
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

      const wellnessDataToInsert = {
        athlete_id: athleteId,
        record_date: fullTimestamp,
        sleep_hours: answers["sleep_hours"],
        sleep_quality: answers["sleep"],
        fatigue_level: answers["energy"],
        muscle_soreness: maxPain > 0 ? maxPain : (answers["leg_heaviness"] || 0),
        soreness_location: compiledSorenessLocation,
        stress_level: answers["stress"],
        readiness_score: readiness,
        comments: finalNotes,
        hydration_perception: answers["hydration"],
        hydration_score: answers["hydration"],
        urine_color: answers["urine_color"],
        nutrition: answers["nutrition"],
        mood: answers["mood"],
        pre_training_meal: answers["pre_training_meal"],
        training_recovery: answers["training_recovery"],
        confidence: answers["confidence"],
        overall_wellbeing: answers["overall_wellbeing"],
        menstrual_cycle: cycleInfo?.phase,
        symptoms: {
          ...(clinicalSigns.length > 0 ? clinicalSigns.reduce((acc, sign) => ({ ...acc, [sign]: 1 }), {}) : {}),
          leg_heaviness: answers["leg_heaviness"] || 0,
          previous_activity: answers["previous_activity"] || 0,
          rpe_simple: rpe_simple,
          mapped_rpe: mapped_rpe,
          duration_minutes: duration_minutes,
          session_load: session_load
        }
      };

      let loadAssessment = null;
      if (session_load > 0) {
        loadAssessment = {
          athlete_id: athleteId,
          assessment_date: fullTimestamp,
          score: session_load,
          classification: session_load >= 600 ? "Alto" : (session_load >= 300 ? "Baixo" : "Ideal"),
          classification_color: session_load >= 600 ? "red" : (session_load >= 300 ? "yellow" : "green"),
          raw_data: {
            rpe: mapped_rpe,
            duration: duration_minutes
          }
        };
      }

      const existingPending = JSON.parse(localStorage.getItem(`pending_checkins_${athleteId}`) || "[]");
      const pendingItem = { checkInDataToInsert, painReportsToInsert: Object.keys(painMap).length > 0 ? Object.entries(painMap).map(([partId, data]) => ({ body_part_id: partId, pain_level: data.level, pain_type: data.type, athlete_id: athleteId })) : [], wellnessDataToInsert, loadAssessment };

      if (isOffline || !navigator.onLine) {
        existingPending.push(pendingItem);
        localStorage.setItem(`pending_checkins_${athleteId}`, JSON.stringify(existingPending));
        console.log("Check-in saved locally (offline mode)");
      } else {
        const { data: checkInData, error: checkInError } = await supabase
          .from("check_ins")
          .insert([checkInDataToInsert])
          .select();

        if (checkInError) throw checkInError;

        const checkInId = checkInData[0].id;

        if (pendingItem.painReportsToInsert.length > 0) {
          const painReports = pendingItem.painReportsToInsert.map(p => ({ ...p, check_in_id: checkInId }));
          await supabase.from("pain_reports").insert(painReports);
        }

        const finalWellnessData = { ...wellnessDataToInsert, id: checkInId };
        const { error: wellnessError } = await supabase.from("wellness_records").insert([finalWellnessData]);
        if (wellnessError) console.error("Could not sync to wellness_records:", wellnessError);

        if (loadAssessment) {
          await supabase.from("physical_load_assessments").insert([{ ...loadAssessment, check_in_id: checkInId }]);
        }

        console.log("Check-in enviado com sucesso");
        await storeFetchCheckins(athleteId, athleteData?.sport);
        await fetchData();
      }
    } catch (error: any) {
      console.error("Error saving check-in:", error);
      setSubmitError(error.message || "Erro ao salvar check-in.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      setView("summary");
    }, 2500);
  };

  const resetForm = () => {
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

    if (view === "cycle_setup") {
      return (
        <PageContainer maxWidth="3xl" className="pt-safe">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 pb-12"
          >
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => setView("history")}
                className="text-slate-400 hover:text-white hover:bg-slate-800 -ml-2"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                {t[lang].back}
              </Button>
            </div>
            
            <div className="text-center space-y-4">
               <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
                 <CalendarDays className="w-10 h-10 text-rose-500" />
               </div>
               <h2 className="text-3xl font-black text-white uppercase tracking-tight">Monitoramento do Ciclo</h2>
               <p className="text-slate-400 font-medium">Informe os dados básicos para acompanharmos seu ciclo menstrual.</p>
            </div>

            <Card className="bg-[#0A1120] border-rose-500/20 shadow-2xl p-8 max-w-xl mx-auto space-y-10">
              <div className="space-y-4">
                 <label className="text-xs font-black text-rose-400 uppercase tracking-widest block text-center mb-3">Data da Última Menstruação</label>
                 <input 
                   type="date"
                   className="bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-5 text-white font-bold text-center w-full focus:border-rose-500/50 transition-all outline-none text-lg"
                   value={setupLastPeriod}
                   onChange={(e) => setSetupLastPeriod(e.target.value)}
                 />
                 <p className="text-xxs text-slate-500 text-center uppercase tracking-wider italic">* O primeiro dia do seu último período menstrual.</p>
              </div>

              <div className="space-y-6 pt-4 border-t border-slate-800/50">
                 <label className="text-xs font-black text-rose-400 uppercase tracking-widest block text-center">Duração média do ciclo (em dias)</label>
                 <div className="flex items-center justify-center gap-8">
                   <Button 
                     variant="outline" 
                     size="icon" 
                     className="w-14 h-14 rounded-2xl border-slate-800 bg-slate-900/50 hover:bg-rose-500/20 hover:border-rose-500/30 text-rose-400"
                     onClick={() => setSetupCycleLength(prev => Math.max(20, prev - 1))}
                   >
                     <Minus className="w-6 h-6" />
                   </Button>
                   <div className="text-center">
                     <span className="text-5xl font-black text-white">{setupCycleLength}</span>
                     <p className="text-xxs text-slate-500 mt-1 font-bold uppercase tracking-widest">Dias</p>
                   </div>
                   <Button 
                     variant="outline" 
                     size="icon" 
                     className="w-14 h-14 rounded-2xl border-slate-800 bg-slate-900/50 hover:bg-rose-500/20 hover:border-rose-500/30 text-rose-400"
                     onClick={() => setSetupCycleLength(prev => Math.min(45, prev + 1))}
                   >
                     <Plus className="w-6 h-6" />
                   </Button>
                 </div>
                 <p className="text-xxs text-slate-500 text-center uppercase tracking-widest">O padrão é 28 dias.</p>
              </div>

              <Button 
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest py-8 rounded-2xl h-auto text-lg shadow-[0_10px_20px_rgba(225,29,72,0.3)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                onClick={handleSaveCycleSetup}
                disabled={!setupLastPeriod}
              >
                Ativar Monitoramento
              </Button>
            </Card>
          </motion.div>
        </PageContainer>
      );
    }

    if (view === "cycle_details" && cycleInfo && athleteGender === "F") {
      const phaseData = CYCLE_PHASES[cycleInfo.phaseKey] || CYCLE_PHASES.menstrual;
      
      return (
        <PageContainer maxWidth="3xl" className="pt-safe">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 pb-12"
          >
            <div className="flex justify-between items-center mb-2">
              <Button
                variant="ghost"
                onClick={() => setView("history")}
                className="text-slate-400 hover:text-white hover:bg-slate-800 -ml-2"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                {t[lang].back}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setView("cycle_setup")}
                className="border-slate-800 text-slate-400 text-xxs font-black uppercase tracking-widest px-3 h-8"
              >
                Configurar <Settings className="w-3 h-3 ml-2" />
              </Button>
            </div>

            <div className="space-y-2 text-center pb-4">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-3">
                {phaseData.emoji} {phaseData.title}
              </h2>
              <p className={`text-sm font-bold uppercase tracking-[0.2em] text-rose-400`}>
                Dia {cycleInfo.currentDay} • {phaseData.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#0A1120] border-slate-800/50 p-6 space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  O que está acontecendo?
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {phaseData.whatHappens}
                </p>
                <div className="pt-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30`}>
                    <TrendingUp className={`w-3 h-3 text-rose-400`} />
                    <span className={`text-xxs font-black uppercase tracking-widest text-rose-400`}>
                      Intensidade Recomendada: {phaseData.intensity}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="bg-[#0A1120] border-slate-800/50 p-6 space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Apple className="w-4 h-4 text-emerald-400" />
                    Nutrição Estratégica
                  </h3>
                  <div className="space-y-2">
                    {phaseData.nutrition.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span className="text-xs text-slate-300 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-[#0A1120] border-slate-800/50 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      Hidratação & Treino
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                      <p className="text-xs text-blue-200/90 leading-relaxed">
                        <span className="font-bold text-blue-400 uppercase tracking-widest text-xxs block mb-1">Hidratação:</span>
                        {phaseData.hydration}
                      </p>
                    </div>
                    <div className="bg-purple-500/5 p-3 rounded-xl border border-purple-500/10">
                      <p className="text-xs text-purple-200/90 leading-relaxed">
                        <span className="font-bold text-purple-400 uppercase tracking-widest text-xxs block mb-1">Treino:</span>
                        {phaseData.training}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                 <Calendar className="w-4 h-4" />
                 Calendário do Ciclo
               </h3>
               <CycleCalendar 
                 lastPeriodDate={athleteData?.last_period_date || null}
                 cycleLength={(athleteData as any).cycle_length || 28}
                 currentDayInCycle={cycleInfo.currentDay}
                 phaseKey={cycleInfo.phaseKey}
               />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleToggleMenstruating}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-xl transition-all active:scale-95"
              >
                Iniciou Hoje
              </Button>
              <Button 
                variant="outline"
                onClick={() => setView("history")}
                className="flex-1 border-slate-800 text-slate-400 font-black uppercase tracking-widest py-6 rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
              >
                Voltar
              </Button>
            </div>
          </motion.div>
        </PageContainer>
      );
    }

    if (view === "history") {
      const streak = calculateStreak();
    const chartData = checkins
      .slice(0, 15)
      .reverse()
      .map((record) => ({
        date: parseDateString(record.created_at || record.record_date).toLocaleDateString(
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
        date: parseDateString(record.created_at || record.record_date).toLocaleDateString(
          lang === "pt" ? "pt-BR" : "en-US",
          { day: "2-digit", month: "2-digit" },
        ),
        level: record.muscle_soreness || 0,
      }));


    const WellnessWidget = () => {
      const maxPainLevel = Math.max(0, ...Object.values(latestPainMap).map(p => p.level));
      const showSOS = respondedToday && maxPainLevel >= 8;

      const summaryMetrics = [
        { label: lang === "pt" ? "Sono" : "Sleep", value: todaySummary?.sleep_quality || 0, icon: Moon, color: "text-blue-400" },
        { label: lang === "pt" ? "Fadiga" : "Fatigue", value: todaySummary?.fatigue_level || 0, icon: Battery, color: "text-amber-400" },
        { label: lang === "pt" ? "Dor" : "Pain", value: maxPainLevel, icon: Activity, color: "text-rose-400" },
      ];

      if (!respondedToday) {
        return (
          <Card className="bg-[#0A1120] border-amber-500/30 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 animate-pulse">
                    <AlertCircle className="w-8 h-8 text-amber-400" />
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

      const todayTips = todaySummary ? getTips(todaySummary) : [];

      return (
        <div className="space-y-4">
          <Card className="bg-[#0A1120] border-emerald-500/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-emerald-500/20 rounded-3xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Status: Concluído</h3>
                      <div className="px-2 py-0.5 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span className="text-xxs font-black text-emerald-400 uppercase tracking-widest">{streak}d</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Sua prontidão diária foi registrada. Bom trabalho!</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  {summaryMetrics.map((m, i) => (
                    <div key={i} className="flex-1 md:flex-none bg-slate-950/80 border border-emerald-500/10 p-4 rounded-2xl text-center min-w-[5.625rem] shadow-lg">
                      <m.icon className={`w-5 h-5 mx-auto mb-2 ${m.color}`} />
                      <p className="text-xxs text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{m.label}</p>
                      <p className="text-xl font-black text-white leading-none">
                        {m.value}
                        <span className="text-xxs text-slate-600 ml-1 font-bold">/{m.label === "Dor" ? "10" : "5"}</span>
                      </p>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => setSelectedRecord(todaySummary)}
                  className="w-full md:w-auto border-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest hover:bg-emerald-500/10 shrink-0"
                >
                  Ver Detalhes
                </Button>
              </div>

              {todayTips.length > 0 && (
                <div className="mt-6 pt-6 border-t border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-black text-white uppercase tracking-widest">{t[lang].tips}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {todayTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 hover:border-emerald-500/30 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-emerald-400 text-xs font-black">{i + 1}</span>
                        </div>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {showSOS && (
            <Card className="bg-red-500/10 border-red-500/30 overflow-hidden relative shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-in fade-in zoom-in duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent pointer-events-none" />
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-500/20 rounded-3xl border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-red-400 flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="text-left space-y-1">
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter leading-none">
                        SOS Fisioterapia
                      </h3>
                      <p className="text-red-200 text-sm font-medium">Dor intensa identificada. Precisamos cuidar de você agora.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      const msg = encodeURIComponent(`Olá, sou o atleta ${athleteData?.nickname || athleteData?.name}, finalizei meu check-in e reportei uma dor preocupante de nível ${maxPainLevel}. Gostaria de solicitar ajuda da fisioterapia.`);
                      window.open(`https://wa.me/5511912952647?text=${msg}`, '_blank');
                    }}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-105 group border border-red-400"
                  >
                    <PhoneCall className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Falar com a Fisio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    };

    // Generate last 7 days for the weekly tracker
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toDateString();
      const hasRecord = checkins.some(
        (record) => parseDateString(record.created_at || record.record_date).toDateString() === dateStr,
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
            {isOffline && (
              <div className="flex items-center gap-1.5 bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20 shrink-0" title="Offline">
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline text-xxs font-bold text-rose-400 uppercase">Offline</span>
              </div>
            )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePushPermission}
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 shrink-0 text-xxs sm:text-xs h-8 px-2"
                title="Configurar Notificações"
              >
                <Bell className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 ${hasPushPermission === "granted" ? "text-amber-400" : "animate-pulse"}`} />
                <span className="hidden sm:inline">Alertas</span>
              </Button>
            <div className={`flex items-center gap-2 ${theme.bgAlpha} px-2.5 py-1 rounded-full border ${theme.border} shrink-0`}>
              <Trophy className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.text}`} />
              <span className={`text-xxs sm:text-xs font-bold ${theme.icon}`}>
                Lvl {athleteLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-500/20 px-2.5 py-1 rounded-full border border-yellow-500/30 shrink-0">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-xxs sm:text-xs font-bold text-yellow-300">
                {currentCoins}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="text-slate-400 hover:text-white shrink-0 text-xxs sm:text-xs h-8 px-2"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              {lang === "pt" ? "EN" : "PT"}
            </Button>
          </div>
        </div>

        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
            <div className={`relative w-32 h-32 sm:w-44 sm:h-44 rounded-full border-4 ${theme.border} shadow-2xl transition-all duration-500 hover:scale-105`}>
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
                    <User className={`w-16 h-16 sm:w-24 sm:h-24 ${theme.icon}`} />
                  </div>
                )}
              </div>
              
              {/* Readiness Badge next to photo */}
              <div className="absolute -bottom-1 -right-1 bg-slate-900 p-1.5 rounded-full border-2 border-slate-800 shadow-xl z-20">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex flex-col items-center justify-center border ${currentReadiness >= 80 ? 'border-emerald-500/50 bg-emerald-500/10' : currentReadiness >= 50 ? 'border-amber-500/50 bg-amber-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                  <span className={`text-xs sm:text-sm font-black ${currentReadiness >= 80 ? 'text-emerald-400' : currentReadiness >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {currentReadiness}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-2">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] text-center">
                {t[lang].greeting.replace("{name}", athleteData?.nickname || athleteData?.name || "")}
              </h2>
              {athleteCode && (
                <span className={`px-3 py-1 ${theme.bgAlpha} ${theme.text} text-xxs sm:text-xs font-bold rounded-full uppercase tracking-widest border ${theme.borderAlpha} shadow-lg`}>
                  #{athleteCode}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className={`bg-slate-900/40 p-6 rounded-2xl border ${theme.borderAlpha} relative ${theme.shadowStrong} overflow-hidden max-w-sm mx-auto`}>
          <Quote className={`absolute top-4 left-4 w-6 h-6 ${theme.bgAlpha}`} />
          <p className="text-sm text-slate-300 font-medium italic relative z-10 leading-relaxed pt-2 px-4">
            &quot;{motivationalQuote.text}&quot;
          </p>
          <p className={`text-xs ${theme.text} font-bold uppercase tracking-widest mt-3`}>
            — {motivationalQuote.author}
          </p>
        </div>

        {/* Cycle Intelligence Module - Dashboard Integration */}
        {athleteGender === 'F' && (
          <div className="max-w-md mx-auto w-full">
            {cycleInfo ? (
              <Card 
                className="bg-rose-500/5 border-rose-500/20 overflow-hidden border-dashed p-1"
              >
                <div className="p-5 space-y-5">
                  <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView("cycle_details")}>
                    <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 group-hover:scale-110 transition-transform">
                      <Droplets className="w-7 h-7 text-rose-500" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-xs font-black text-rose-500/70 uppercase tracking-[0.2em] mb-1">
                        Fase {cycleInfo.phase} • Dia {cycleInfo.currentDay}
                      </p>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        Ciclo Menstrual
                      </h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-rose-500 transition-colors" />
                  </div>
                  
                  <Button 
                    size="lg"
                    onClick={handleToggleMenstruating}
                    className={`w-full ${athleteData?.is_menstruating ? 'bg-rose-600 text-white' : 'bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white'} border border-rose-600/30 text-xs font-black uppercase tracking-[0.2em] h-12 transition-all active:scale-95 shadow-lg`}
                  >
                    {athleteData?.is_menstruating 
                      ? (lang === 'pt' ? "Estou Menstruando" : "Currently Menstruating") 
                      : (lang === 'pt' ? "Ciclo Iniciou Hoje" : "Cycle Started Today")}
                  </Button>
                </div>
              </Card>
            ) : !loadingAthlete && (
              <Card className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 flex flex-col items-center text-center gap-4 shadow-lg cursor-pointer hover:bg-rose-500/20 transition-colors" onClick={() => setView("cycle_setup")}>
                <div className="p-3 bg-rose-500/20 rounded-full">
                  <CalendarDays className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                    Configurar Ciclo Menstrual
                  </h4>
                  <p className="text-xs text-rose-200/60 leading-relaxed">
                    Habilite a inteligência hormonal para otimizar seus treinos.
                  </p>
                </div>
              </Card>
            )}
          </div>
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
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: '0.75rem' }}
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
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: '0.75rem' }} />
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
                          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest">Intensidade Geral</p>
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
                        <p className="text-xxs font-black text-slate-500 uppercase tracking-widest">Locais Detalhados</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(finalPainMap).length > 0 ? (
                            Object.entries(finalPainMap).map(([part, data]) => (
                              <span 
                                key={part}
                                className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 group hover:bg-rose-500/20 transition-all"
                              >
                                {getPainLocationLabel(part)}
                                <span className="text-xxs opacity-70 bg-rose-500/20 px-1.5 py-0.5 rounded">Nível {data.level}</span>
                              </span>
                            ))
                          ) : (
                            <div className="w-full text-center py-8 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800/50">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                              <p className="text-slate-500 font-bold uppercase tracking-widest text-xxs">
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
                          <span className="text-xxs font-bold">
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
                    <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Dias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span className="text-2xl font-black text-white">{athleteLevel}</span>
                    <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Nível</span>
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
                  const date = parseDateString(record.created_at || record.record_date);
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
                              <p className="text-xxs text-slate-500 uppercase tracking-widest font-bold mb-1">
                                {t[lang].battery}
                              </p>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-2xl font-black ${isGood ? "text-emerald-400" : isWarning ? "text-amber-400" : "text-red-400"}`}
                                >
                                  {Math.min(100, Math.round(record.readiness_score))}%
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
                    {parseDateString(selectedRecord.created_at || selectedRecord.record_date).toLocaleDateString(
                      lang === "pt" ? "pt-BR" : "en-US",
                      { weekday: 'long', day: '2-digit', month: 'long' }
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                    Check-in realizado às {parseDateString(selectedRecord.created_at || selectedRecord.record_date).toLocaleTimeString(lang === "pt" ? "pt-BR" : "en-US", { hour: '2-digit', minute: '2-digit' })}
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
                        strokeDashoffset={364.4 - (364.4 * Math.min(100, Math.round(selectedRecord.readiness_score))) / 100}
                        className={`${
                          selectedRecord.readiness_score >= 75 ? "text-emerald-500" : 
                          selectedRecord.readiness_score >= 50 ? "text-amber-500" : "text-red-500"
                        } transition-all duration-1000 ease-out`}
                      />
                    </svg>
                    <span className="absolute text-3xl font-black text-white">{Math.min(100, Math.round(selectedRecord.readiness_score))}%</span>
                  </div>
                  <p className="mt-4 text-xs font-black text-slate-500 uppercase tracking-widest">Nível de Prontidão</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {metrics.map((m) => {
                    let val: any = null;
                    if (selectedRecord) {
                      switch(m.id) {
                        case 'sleep': val = selectedRecord.sleep_quality; break;
                        case 'energy': val = selectedRecord.fatigue_level ? (6 - selectedRecord.fatigue_level) : null; break;
                        case 'stress': val = selectedRecord.stress_level; break;
                        case 'hydration': val = selectedRecord.hydration_perception; break;
                        case 'leg_heaviness': val = selectedRecord.muscle_soreness ? Math.ceil(selectedRecord.muscle_soreness / 2) : null; break;
                        case 'previous_activity': val = selectedRecord.symptoms?.previous_activity || (selectedRecord.wellness_records && selectedRecord.wellness_records[0]?.symptoms?.previous_activity); break;
                        case 'duration_minutes': val = selectedRecord.symptoms?.duration_minutes || (selectedRecord.wellness_records && selectedRecord.wellness_records[0]?.symptoms?.duration_minutes); break;
                        case 'rpe_simple': val = selectedRecord.symptoms?.rpe_simple || (selectedRecord.wellness_records && selectedRecord.wellness_records[0]?.symptoms?.rpe_simple); break;
                        default: val = (selectedRecord as any)[m.id];
                      }
                    }
                    if (val === undefined || val === null) return null;
                    
                    let emoji = "";
                    let labelStr = "";

                    if (m.id === "duration_minutes") {
                      emoji = "⏱️";
                      labelStr = `${val} min`;
                    } else {
                      const opt = getOptionsForMetric(m.id, lang).find(o => o.value === val);
                      if (!opt) return null;
                      emoji = opt.emoji;
                      labelStr = opt.label;
                    }

                    return (
                      <div key={m.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 flex flex-col items-center text-center">
                        <m.icon className={`w-5 h-5 ${theme.text} mb-2`} />
                        <span className="text-xxs text-slate-500 uppercase font-black tracking-widest mb-1">{m.label}</span>
                        <span className="text-base">{emoji} <span className="text-sm text-white font-bold ml-1">{labelStr}</span></span>
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
                          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest">Intensidade Geral</p>
                          <p className={`text-2xl font-black ${selectedRecord.muscle_soreness > 4 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {selectedRecord.muscle_soreness}/10
                          </p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest">Locais</p>
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const loc = selectedRecord.soreness_location || selectedRecord.wellness_records?.[0]?.soreness_location;
                              if (!loc || loc === 'Nenhuma') return null;
                              try {
                                const parsed = JSON.parse(loc);
                                if (Array.isArray(parsed)) {
                                  return parsed.map(item => (
                                    <span key={item.region} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xxs font-bold uppercase tracking-widest border border-slate-700">
                                      {getPainLocationLabel(item.region)} {item.type ? `(${getPainTypeLabel(item.type, lang)})` : ''}
                                    </span>
                                  ));
                                }
                              } catch (e) {
                                return loc.split(',').map((l: string) => (
                                  <span key={l} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xxs font-bold uppercase tracking-widest border border-slate-700">
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
                    <p className="text-xxs font-black text-slate-500 uppercase tracking-widest">Observações</p>
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
            <div className="text-slate-400 mt-4 text-base max-w-lg mx-auto text-center">
              {readiness >= 75
                ? t[lang].goodRecovery
                : readiness >= 50
                  ? t[lang].moderateFatigue
                  : t[lang].highRisk}
            </div>
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
                if (val === undefined || val === null) return null;

                let emoji = "";
                let labelStr = "";

                if (m.id === "duration_minutes") {
                  emoji = "⏱️";
                  labelStr = `${val} min`;
                } else {
                  const opt = getOptionsForMetric(m.id, lang).find(
                    (o) => o.value === val,
                  );
                  if (!opt) return null;
                  emoji = opt.emoji;
                  labelStr = opt.label;
                }

                return (
                  <div
                    key={m.id}
                    className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50 flex flex-col items-center text-center"
                  >
                    <m.icon className={`w-5 h-5 ${theme.text} mb-2`} />
                    <span className="text-xxs text-slate-400 uppercase font-bold tracking-wider mb-1">
                      {m.label}
                    </span>
                    <span className="text-lg">
                      {emoji}{" "}
                      <span className="text-sm text-white font-medium ml-1">
                        {labelStr}
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
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050B14]/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0A1120] border border-emerald-500/30 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center space-y-6 max-w-sm w-full"
            >
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sincronizado!</h2>
                <p className="text-slate-400 text-sm">Seu bem-estar foi registrado com sucesso. Bom treino!</p>
              </div>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showNotificationSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050B14]/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0A1120] border border-amber-500/30 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center max-w-sm w-full"
            >
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/30 mb-6">
                <Bell className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">
                {lang === "pt" ? "Lembretes Diários" : "Daily Reminders"}
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {lang === "pt" ? "Configure o horário ideal para você ser lembrado de responder o seu check-in diário de saúde (EARS)." : "Set the ideal time to be reminded to answer your daily health check-in (EARS)."}
              </p>
              
              <div className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === "pt" ? "Horário do lembrete" : "Reminder time"}</label>
                  <input 
                    type="time" 
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-xl focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                
                <div className="flex flex-col gap-3 pt-4">
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase py-6 rounded-xl"
                    onClick={handleSaveNotifications}
                  >
                    {lang === "pt" ? "Salvar Configuração" : "Save Settings"}
                  </Button>
                  <Button 
                    className="w-full bg-transparent hover:bg-slate-800 text-slate-400 font-bold uppercase py-6 rounded-xl border border-slate-800"
                    onClick={() => setShowNotificationSettings(false)}
                  >
                    {lang === "pt" ? "Agora Não" : "Not Now"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {(view === "questionnaire" && respondedToday) ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8"
        >
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Check-in de hoje concluído</h2>
            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
              Você já enviou suas respostas hoje! Suas métricas já estão com a comissão técnica.
            </p>
          </div>
          <Button 
            onClick={() => setView("history")}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest px-8 py-6 rounded-2xl border border-slate-800 shadow-xl transition-all active:scale-95"
          >
            Ver Dashboard
          </Button>
        </motion.div>
      ) : (
        <>
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

        {/* Clinical Summary Badge (Visual identity) */}
        <div className="flex justify-center mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-2 bg-[#050B14]/60 backdrop-blur-xl rounded-full border border-slate-800/50 flex items-center gap-3 shadow-2xl"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-black text-white/80 uppercase tracking-[0.3em]">Protocolo Wellness Elite</span>
          </motion.div>
        </div>
      </div>

      <div className="space-y-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const currentOptions = getOptionsForMetric(metric.id, lang);
          const showGroupHeader = index === 0 || metrics[index - 1].group !== (metric as any).group;
          const groupLabels: Record<string, { pt: string; en: string }> = {
            morning: { pt: "Módulo Matinal", en: "Morning Module" },
            habits: { pt: "Hábitos e Nutrição", en: "Habits & Nutrition" },
            evening: { pt: "Módulo de Performance", en: "Performance Module" },
            overall: { pt: "Considerações Finais", en: "Final Thoughts" }
          };

          return (
            <React.Fragment key={metric.id}>
              {showGroupHeader && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-8 pb-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800" />
                    <h3 className="text-xxs font-black text-slate-500 uppercase tracking-[0.3em] whitespace-nowrap">
                      {groupLabels[(metric as any).group]?.[lang]}
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800" />
                  </div>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
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
                    {(metric as any).type === "input" ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="180"
                            value={answers[metric.id] || ""}
                            onChange={(e) => handleSelect(metric.id, parseInt(e.target.value) || 0)}
                            className="w-full bg-[#050B14] border border-slate-800 text-white text-2xl font-black p-4 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                            placeholder="0"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold uppercase tracking-widest text-xs">min</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[30, 45, 60, 90, 120, 150, 180].map((val) => (
                            <button
                              key={val}
                              onClick={() => handleSelect(metric.id, val)}
                              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
                                answers[metric.id] === val
                                  ? "bg-cyan-500 border-transparent text-white"
                                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                              }`}
                            >
                              {val} min
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
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
                              <span className="text-xxs sm:text-xs font-bold uppercase tracking-wider text-center leading-tight">
                                {option.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </React.Fragment>
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
                      <p className="text-xxs font-black text-cyan-500/70 uppercase tracking-widest">Status do Scanner</p>
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
                    <p className="text-xxs font-black text-slate-500 uppercase tracking-widest px-1">Legenda de Cores</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">0-3: Leve / Normal</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">4-6: Moderado / Atenção</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">7-10: Intenso / Crítico</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                    <p className="text-xxs text-cyan-400/70 font-medium leading-relaxed italic">
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
            transition={{ delay: (metrics.length + 1) * 0.1 }}
          >
            <Card className="overflow-hidden bg-[#0A1120] border-slate-700/50 shadow-lg mb-6">
              <CardHeader className="bg-gradient-to-r from-red-500/10 to-transparent pb-4 border-b border-red-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                    <Stethoscope className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white uppercase tracking-wider font-bold">
                      {lang === "pt" ? "Sinais Clínicos" : "Clinical Signs"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {lang === "pt" ? "Você apresenta algum destes sintomas hoje?" : "Are you presenting any of these symptoms today?"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CLINICAL_SIGNS.filter(sign => {
                    // Always show non-menstrual signs
                    if (!(sign as any).menstrual) return true;
                    
                    // Show menstrual signs only for female athletes in relevant phases
                    if (athleteGender !== 'F') return false;
                    
                    const pKey = cycleInfo?.phaseKey;
                    // Luteal (TPM) and Menstrual phases are relevant for these symptoms
                    return (pKey === 'menstrual' || pKey === 'luteal');
                  }).map((sign) => {
                    const isSelected = clinicalSigns.includes(sign.id);
                    return (
                      <button
                        key={sign.id}
                        onClick={() => toggleClinicalSign(sign.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                          isSelected 
                            ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] scale-[0.98]' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-lg">{sign.emoji}</span>
                        <span className="text-xxs font-black uppercase tracking-tight text-left">
                          {lang === "pt" ? sign.label_pt : sign.label_en}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {clinicalSigns.length > 0 && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {lang === "pt" ? "ATENÇÃO: Sua bateria clínica será impactada por estes sintomas." : "ATTENTION: Your clinical battery will be impacted by these symptoms."}
                  </div>
                )}
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
      </>
      )}
    </PageContainer>
  );
}
