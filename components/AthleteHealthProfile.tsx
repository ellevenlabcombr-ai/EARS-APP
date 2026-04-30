"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { parseDateString, getLocalDateString, getTagSuggestions } from "@/lib/utils";
import { translateKey, translateValue } from "@/lib/translations";
import { 
  ChevronLeft, 
  Activity, 
  Calendar, 
  Phone, 
  ShieldCheck, 
  ShieldAlert, 
  Stethoscope, 
  TrendingUp, 
  TrendingDown,
  MapPin, 
  User, 
  Users,
  Info,
  Clock,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  AlertCircle,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ClipboardList,
  Columns,
  Maximize2,
  Grid3X3,
  X,
  Mic,
  Check,
  PenTool,
  ChevronRight,
  Moon,
  Trophy,
  Key,
  Wand2,
  RefreshCcw,
  Droplets,
  Brain,
  BrainCircuit,
  Apple,
  Trash2,
  ActivitySquare,
  Scale,
  PersonStanding,
  Droplet,
  QrCode,
  Copy,
  CheckCircle,
  BellRing,
  History,
  Eye,
  Download,
  Code,
  Sparkles,
  Filter,
  Target,
  BarChart3,
  Tag,
  Globe,
  Award,
  AlertTriangle,
  CalendarDays
} from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PainMap } from "./PainMap";
import { ClinicalEvolutionPanel } from "./ClinicalEvolutionPanel";
import { SleepAssessment } from "./SleepAssessment";
import { SPORT_PROFILES, SportType, SportProfile, getSportProfile } from "@/lib/sportProfiles";
import { OrthopedicAssessment } from "./OrthopedicAssessment";
import BiomechanicalAssessment from "./BiomechanicalAssessment";
import PhysicalAssessment from "./PhysicalAssessment";
import FunctionalScreening from "./FunctionalScreening";
import DynamometryAssessment from "./DynamometryAssessment";
import { NeurologicalAssessment } from "./NeurologicalAssessment";
import { PsychologicalAssessment } from "./PsychologicalAssessment";
import { NutritionalAssessmentForm } from "./NutritionalAssessmentForm";
import { RedSAssessmentForm } from "./RedSAssessmentForm";
import { AnthropometricAssessmentForm } from "./AnthropometricAssessmentForm";
import { MaturationAssessmentForm } from "./MaturationAssessmentForm";
import { MenstrualAssessmentForm } from "./MenstrualAssessmentForm";
import { HydrationAssessmentForm } from "./HydrationAssessmentForm";
import { AthleteRegistration } from "./AthleteRegistration";
import { ConfirmDialog } from "./ConfirmDialog";
import { PosturalAssessmentModal, FRONTAL_SEGMENTS, LATERAL_SEGMENTS } from "./PosturalAssessmentModal";
import { PosturalAnalysisTool } from "./PosturalAnalysisTool";
import { AttachmentUploadForm, ATTACHMENT_CATEGORIES } from "./AttachmentUploadForm";
import { AttachmentPreviewModal } from "./AttachmentPreviewModal";
import { AttachmentVersionHistory } from "./AttachmentVersionHistory";
import { AssessmentVisualizer } from "./AssessmentVisualizer";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLanguage } from "@/contexts/LanguageContext";
import { ClinicalAlert } from "@/types/database";
import { calculateRiskClusters, ClinicalTag } from "@/lib/clinical-engine";
import { TrendEngine } from "@/lib/trend-engine";
import { ConfidenceEngine } from "@/lib/confidence-engine";
import { DecisionLayer } from "@/lib/decision-layer";
import { PriorityEngine } from "@/lib/priority-engine";
import { EARSEngine } from "@/lib/ears-engine";
import { DecayEngine } from "@/lib/decay-engine";
import { SessionModePanel } from "./ears/SessionModePanel";
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
  ComposedChart,
  ReferenceLine
} from "recharts";
import { SafeRender } from "@/components/SafeRender";
import { QRCodeSVG } from "qrcode.react";

interface Athlete {
  id: string;
  athlete_code?: string;
  password?: string;
  name: string;
  nickname: string;
  category: string;
  status: 'Apto' | 'Transição' | 'DM' | 'Apto com Restrição' | 'Reabilitação' | 'Departamento Médico';
  readiness: number;
  lastUpdate: string;
  photo: string | null;
  position: string;
  phone: string;
  gender: 'M' | 'F';
  age?: number;
  weight?: number | string;
  height?: number | string;
  dominance?: 'Destro' | 'Canhoto' | 'Ambidestro';
  sport?: string;
  riskLevel?: 'Baixo' | 'Moderado' | 'Alto' | 'Crítico';
  email?: string;
  rg?: string;
  sexo?: string;
  club?: string;
  addressNumber?: string;
  addressComplement?: string;
  cep?: string;
  address?: {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
  };
  convenio?: string;
  carteirinha?: string;
  hospital?: string;
  alergiaDesc?: string;
  medicacao?: string;
  hasAllergy?: boolean;
  ladoDominante?: string;
  modalidade?: string;
  posicao?: string;
  categoria?: string;
  birthDate?: string;
  guardianName?: string;
  guardianCpf?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  group_name?: string;
}

type AssessmentType = 'list' | 'biomechanical' | 'sleep' | 'orthopedic' | 'physical' | 'functional' | 'dynamometry' | 'strength' | 'neurological' | 'psychological' | 'nutritional' | 'reds' | 'anthropometric' | 'maturation' | 'menstrual' | 'hydration';

interface AthleteHealthProfileProps {
  athlete: Athlete;
  onBack: () => void;
  onSave?: (athlete: Athlete) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A1120] border border-slate-800 p-3 rounded-xl shadow-2xl">
        <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <p className="text-xs font-bold text-white uppercase tracking-tight">
              {entry.name}: <span className="text-cyan-400">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const renderDataNode = (key: string, value: any, lang: string, depth = 0): React.ReactNode => {
  // Skip internal or redundant fields at root level
  if (depth === 0 && ['classification', 'classification_color', 'alerts', 'score', 'athlete_id', 'id', 'created_at', 'assessment_date', 'clinical_report', 'clinical_alerts'].includes(key)) return null;

  const translatedKey = translateKey(key, lang);

  if (value === null || value === undefined) return null;

  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      <div key={key} className={`mt-2 ${depth > 0 ? 'ml-4 border-l border-slate-700/50 pl-3' : 'p-3 rounded-xl bg-slate-900/30 border border-slate-800/30'}`}>
        <span className="text-xxs font-bold text-slate-400 uppercase tracking-tight block mb-2">{translatedKey}</span>
        <div className="space-y-2">
          {Object.entries(value).map(([subKey, subValue]) => renderDataNode(subKey, subValue, lang, depth + 1))}
        </div>
      </div>
    );
  }

  return (
    <div key={key} className={`flex items-center justify-between ${depth === 0 ? 'p-3 rounded-xl bg-slate-900/30 border border-slate-800/30' : 'py-1'}`}>
      <span className="text-xxs font-bold text-slate-500 uppercase tracking-tight">{translatedKey}</span>
      <span className="text-xs font-bold text-white text-right ml-4">
        {translateValue(value, lang)}
      </span>
    </div>
  );
};

export function AthleteHealthProfile({ athlete: initialAthlete, onBack, onSave }: AthleteHealthProfileProps) {
  const { t, language } = useLanguage();
  const [athlete, setAthlete] = useState<any>(initialAthlete);

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateDetailedAge = (birthDate?: string) => {
    const dateToUse = birthDate || athlete.birth_date || athlete.birthDate;
    if (!dateToUse) return null;
    const birth = new Date(dateToUse);
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
  };

  const athleteAge = calculateAge(athlete.birth_date || athlete.birthDate);

  const [wellnessHistory, setWellnessHistory] = useState<any[]>([]);
  const [prontuarioNotes, setProntuarioNotes] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isDeletingAttachment, setIsDeletingAttachment] = useState<string | null>(null);
  const [showEditAttachmentModal, setShowEditAttachmentModal] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<any>(null);
  const [isUpdatingAttachment, setIsUpdatingAttachment] = useState(false);
  const [clinicalAssessments, setClinicalAssessments] = useState<any[]>([]);
  const [loadData, setLoadData] = useState<any[]>([]);
  const [painReports, setPainReports] = useState<any[]>([]);
  const [athleteAlerts, setAthleteAlerts] = useState<ClinicalAlert[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [clinicalTags, setClinicalTags] = useState<ClinicalTag[]>([
    { id: '1', tag: 'Posterior chain vulnerability', created_at: new Date().toISOString(), weight: 1.5, source: 'clinical' },
    { id: '2', tag: 'Load intolerance', created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), weight: 2.0, source: 'field_observation' }
  ]); // Simulated default state from DB

  // Grouped Inputs for stability and single truth consistency
  const clinicalInputs = useMemo(() => {
    return {
      wellnessHistory,
      painReports,
      clinicalAssessments,
      loadData,
      tags: clinicalTags
    };
  }, [wellnessHistory, painReports, clinicalAssessments, loadData, clinicalTags]);

  const [isSessionMode, setIsSessionMode] = useState(false);
  const clinicalSessionData = useMemo(() => {
    if (!clinicalInputs.wellnessHistory.length) return null;
    
    // Normalize format for engine
    const normalizedWellness = clinicalInputs.wellnessHistory.map(w => ({
      ...w,
      id: w.id || '',
      athlete_id: athlete.id,
      readiness_score: w.readiness_score || w.readiness || 0, // Handle different keys
      fatigue_level: w.fatigue_level || 0,
      muscle_soreness: w.muscle_soreness || 0,
      sleep_hours: w.sleep_hours || 0,
      sleep_quality: w.sleep_quality || 0,
      stress_level: w.stress_level || 0,
      record_date: w.record_date,
      created_at: w.record_date, 
      symptoms: w.symptoms || []
    }));

    const normalizedLoad = clinicalInputs.loadData.map(l => ({
      intensity: l.intensity || (l.raw_data && l.raw_data.rpe) || l.rpe || 5,
      duration_minutes: l.duration || (l.raw_data && l.raw_data.duration) || 60,
    }));

    const trends = TrendEngine.analyze(normalizedWellness);
    const confidence = ConfidenceEngine.calculate(normalizedWellness, {});
    const decayed = DecayEngine.processHistory(normalizedWellness);
    
    // Calculate final predictive readiness
    const readiness = EARSEngine.calculateFinalReadiness(
      normalizedWellness[normalizedWellness.length-1] as any,
      athlete.age || 25,
      normalizedWellness.slice(-3).map(w => w.sleep_hours),
      decayed,
      trends
    );

    const riskClustersResult = calculateRiskClusters({
      wellnessRecords: normalizedWellness,
      painReports: clinicalInputs.painReports,
      assessments: clinicalInputs.clinicalAssessments,
      checkIns: normalizedLoad,
      alerts: athleteAlerts,
      clinicalTags: clinicalInputs.tags,
      trendScore: trends.trendScore,
      confidenceScore: confidence.confidenceScore
    });

    const recommendation = DecisionLayer.analyze(
      readiness.score,
      riskClustersResult.clusters,
      trends,
      confidence
    );

    const priorityOutput = PriorityEngine.process({
      decision: recommendation.recommendation,
      confidence: confidence.confidenceLevel,
      riskScore: riskClustersResult.clusters[0]?.score || 0,
      trendScore: trends.trendScore,
      factors: riskClustersResult.clusters.flatMap(c => c.factors),
      actions: recommendation.focusAreas.concat(recommendation.alerts),
      tags: clinicalInputs.tags.map(t => t.tag)
    });

    return {
      readiness,
      riskClustersResult,
      recommendation,
      priorityOutput,
      trends,
      confidence,
      decayed
    };
  }, [clinicalInputs, athleteAlerts, athlete.id, athlete.age]);

  const [activeTab, setActiveTab] = useState<'overview' | 'ficha' | 'clinical' | 'prontuario' | 'history' | 'attachments'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [athletePhoto, setAthletePhoto] = useState<string | null>(athlete.photo || null);

  useEffect(() => {
    const fetchFullData = async () => {
      console.log("Athlete ID:", initialAthlete.id);
      
      if (!initialAthlete.id) {
        console.warn("Athlete ID is missing, skipping fetch");
        return;
      }

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('athletes')
            .select('*')
            .eq('id', initialAthlete.id)
            .maybeSingle();
          
          if (error) {
            console.error("SUPABASE FULL ERROR:", {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint
            });
            return;
          }

          if (!data) {
            console.warn("Atleta não encontrado no banco de dados");
            return;
          }

          setAthlete({
            ...initialAthlete,
            ...data,
            birthDate: data.birth_date || initialAthlete.birthDate,
            riskLevel: data.risk_level || initialAthlete.riskLevel,
            readiness: data.readiness_score || initialAthlete.readiness,
            group_name: data.group_name || initialAthlete.group_name,
            modalidade: data.modalidade || initialAthlete.modalidade,
            club: data.clube_anterior || initialAthlete.club,
            category: data.category || initialAthlete.category,
            position: data.posicao || initialAthlete.position,
            weight: data.weight || initialAthlete.weight,
            height: data.height || initialAthlete.height,
            dominance: data.lado_dominante || initialAthlete.dominance,
            phone: data.phone || initialAthlete.phone,
            email: data.email || initialAthlete.email,
            address: {
              logradouro: data.address_street,
              bairro: data.address_neighborhood,
              localidade: data.address_city,
              uf: data.address_state
            },
            addressNumber: data.address_number,
            addressComplement: data.address_complement,
            cep: data.address_zip,
            password: data.password,
            convenio: data.convenio,
            carteirinha: data.carteirinha,
            hospital: data.hospital,
            hasAllergy: data.alergia,
            alergiaDesc: data.alergia_desc,
            medicacao: data.medicacao_desc,
            guardianName: data.guardian_name,
            guardianPhone: data.guardian_phone,
            guardianCpf: data.guardian_cpf,
            guardianEmail: data.guardian_email,
            rg: data.rg,
            cpf: data.cpf,
            nickname: data.nickname,
            gender: data.gender,
            athlete_code: data.athlete_code,
            status: data.status,
            photo: data.avatar_url || initialAthlete.photo,
          });
          
          if (data.avatar_url) {
            setAthletePhoto(data.avatar_url);
          }
        } catch (err: any) {
          console.error("SUPABASE FULL ERROR (catch):", {
            message: err?.message,
            code: err?.code,
            details: err?.details,
            hint: err?.hint
          });
        }
      }
    };
    fetchFullData();
  }, [initialAthlete.id, initialAthlete]);
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<AssessmentType>('list');
  const [trendAlerts, setTrendAlerts] = useState<string[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const [showPosturalModal, setShowPosturalModal] = useState(false);
  const [showClinicalNoteModal, setShowClinicalNoteModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState<string | null>(null);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<string | null>(null);
  const [confirmDeleteAttachment, setConfirmDeleteAttachment] = useState<{id: string, name: string} | null>(null);
  const [confirmDeleteAssessment, setConfirmDeleteAssessment] = useState<{id: string, source_table: string} | null>(null);
  const [isDeletingAssessment, setIsDeletingAssessment] = useState(false);
  const [showSignatureStep, setShowSignatureStep] = useState(false);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [showAttachmentHistory, setShowAttachmentHistory] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
  const [versionGroupIdForNewVersion, setVersionGroupIdForNewVersion] = useState<string | null>(null);
  const [attachmentFilter, setAttachmentFilter] = useState('Todos');
  const [attachmentSearch, setAttachmentSearch] = useState('');
  const [generatedNote, setGeneratedNote] = useState("");
  const [posturalView, setPosturalView] = useState<'side-by-side' | 'overlay' | 'technical'>('side-by-side');
  const [showGrid, setShowGrid] = useState(true);
  const [posturalEvaluation, setPosturalEvaluation] = useState({
    head: 'Normal',
    shoulders: 'Simétrico',
    pelvis: 'Nivelada',
    knees: 'Alinhados',
    feet: 'Normal',
    notes: ''
  });

  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!reportRef.current || !selectedAssessment) return;
    
    try {
      setIsGeneratingPdf(true);
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const reportElement = clonedDoc.querySelector('[ref-report-container]') || clonedDoc.body;
          if (reportElement instanceof HTMLElement) {
            // Force white background and dark text for print
            reportElement.style.backgroundColor = '#ffffff';
            reportElement.style.color = '#0f172a';
            
            // Fix all text colors and borders in the clone
            const allTexts = reportElement.querySelectorAll('p, span, h1, h2, h3, h4, h5, div');
            allTexts.forEach(el => {
              if (el instanceof HTMLElement) {
                if (el.classList.contains('text-slate-400') || el.classList.contains('text-slate-500')) {
                   el.style.color = '#64748b';
                } else if (!el.classList.contains('text-cyan-500') && !el.classList.contains('text-rose-500') && !el.classList.contains('text-emerald-500')) {
                   el.style.color = '#0f172a';
                }
              }
            });

            const allCards = reportElement.querySelectorAll('.bg-slate-900, .bg-slate-900\\/50, .bg-slate-900\\/60, .bg-slate-900\\/40, .bg-slate-900\\/30');
            allCards.forEach(card => {
              if (card instanceof HTMLElement) {
                card.style.backgroundColor = '#f8fafc';
                card.style.borderColor = '#e2e8f0';
              }
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const dateStr = new Date(selectedAssessment.assessment_date).toLocaleDateString('pt-BR').replace(/\//g, '-');
      const typeStr = selectedAssessment.assessment_type || 'assessment';
      const athleteName = athlete.name.split(' ')[0] || 'Atleta';
      
      pdf.save(`Relatorio_${typeStr}_${athleteName}_${dateStr}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification({ message: 'Erro ao gerar PDF: ' + (error instanceof Error ? error.message : 'Desconhecido'), type: 'error' });
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  const [selectedClinicalRegion, setSelectedClinicalRegion] = useState<{id: string, label: string} | null>(null);

  const sportProfile = getSportProfile(athlete.sport);

  const calculateRiskScore = (regionId: string) => {
    const data = generateRegionEvolution(regionId);
    const last = data[data.length - 1];
    const priorityRegion = sportProfile.priorityRegions.find(r => r.id === regionId);
    const loadLevel = priorityRegion?.loadLevel || 1;

    // Risk factors: High pain, low strength, high sport load
    const painFactor = last.pain * 10; // 0-100
    const strengthFactor = 100 - last.strength; // 0-100
    const loadFactor = loadLevel * 33.3; // 33, 66, 100

    const score = (painFactor * 0.4) + (strengthFactor * 0.4) + (loadFactor * 0.2);
    return Math.round(score);
  };

  const generateRegionEvolution = (regionId: string) => {
    const days = 7;
    const data = [];
    const today = new Date();
    
    // Seed random based on regionId to have consistent "random" data for a region
    let seed = regionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Generate some realistic-ish trends
      const basePain = 5 + (random() * 2 - 1);
      const pain = Math.max(0, Math.min(10, Math.round(basePain - (days - 1 - i) * 0.5)));
      
      const baseStrength = 70 + (random() * 10 - 5);
      const strength = Math.max(0, Math.min(100, Math.round(baseStrength + (days - 1 - i) * 2)));
      
      const baseRom = 80 + (random() * 10 - 5);
      const rom = Math.max(0, Math.min(100, Math.round(baseRom + (days - 1 - i) * 1.5)));

      data.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        pain,
        strength,
        rom
      });
    }
    return data;
  };

  const getRegionPhase = (regionId: string) => {
    const data = generateRegionEvolution(regionId);
    const last = data[data.length - 1];
    
    if (last.pain >= 7 || last.strength < 40 || last.rom < 50) return "Aguda";
    if (last.pain >= 4 || last.strength < 70 || last.rom < 80) return "Subaguda";
    if (last.pain >= 1 || last.strength < 90 || last.rom < 95) return "Funcional";
    return "Retorno ao Esporte";
  };

  const priorityRegions = sportProfile.priorityRegions;

  const handleCopyCode = () => {
    if (athlete.athlete_code) {
      navigator.clipboard.writeText(athlete.athlete_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Supabase Data States
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

  const handleGeneratePassword = async () => {
    try {
      setIsGeneratingPassword(true);
      const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
      
      if (!supabase) return;
      
      const { error } = await supabase
        .from('athletes')
        .update({ password: newPassword })
        .eq('id', athlete.id);
        
      if (error) {
        console.error("SUPABASE FULL ERROR:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      if (onSave) {
        onSave({ ...athlete, password: newPassword });
      }
      alert('Senha gerada com sucesso!');
    } catch (err: any) {
      console.error('Error generating password:', err);
      const errorMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      alert(`Erro ao gerar senha: ${errorMsg}`);
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  const fetchAllAssessmentsData = useCallback(async (athleteId: string) => {
    if (!supabase) return [];
    
    console.log(`Fetching assessments for athlete ${athleteId} from all_assessments view...`);
    
    const { data, error } = await supabase
      .from('all_assessments')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('assessment_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error("SUPABASE FULL ERROR:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        athleteId
      });
      return [];
    }

    console.log(`Fetched ${data?.length || 0} assessments from view`);
    return data || [];
  }, []);

  const [isUsingAttachmentFallback, setIsUsingAttachmentFallback] = useState(false);

  useEffect(() => {
    const fetchAthleteData = async () => {
      try {
        setIsLoadingData(true);
        if (!supabase) return;

        console.log(`Fetching data for athlete: ${athlete.name} (ID: ${athlete.id})`);

        // Fetch all data in parallel
        const [wellnessRes, notesRes, assessmentsRes, alertsRes, painRes, loadRes] = await Promise.all([
          supabase
            .from('wellness_records')
            .select('record_date, readiness_score, fatigue_level, muscle_soreness, sleep_hours, sleep_quality, stress_level, fatigue_level, muscle_soreness, soreness_location, menstrual_cycle, menstrual_symptoms, hydration_perception, hydration_score, urine_color, symptoms, comments')
            .eq('athlete_id', athlete.id)
            .order('record_date', { ascending: false })
            .limit(14),
          supabase
            .from('clinical_notes')
            .select('id, note_date, generated_text, observations, is_signed, professional_name, pain_level, feeling, regions, treatments')
            .eq('athlete_id', athlete.id)
            .order('note_date', { ascending: false })
            .limit(100),
          fetchAllAssessmentsData(athlete.id),
          supabase
            .from('clinical_alerts')
            .select('*')
            .eq('athlete_id', athlete.id)
            .order('created_at', { ascending: false })
            .limit(50),
          supabase
            .from('pain_reports')
            .select('*')
            .eq('athlete_id', athlete.id)
            .order('created_at', { ascending: false })
            .limit(50),
          supabase
            .from('physical_load_assessments')
            .select('*')
            .eq('athlete_id', athlete.id)
            .order('assessment_date', { ascending: false })
            .limit(14)
        ]);

        if (alertsRes.data) {
          setAthleteAlerts(alertsRes.data);
        }

        if (painRes.data) {
          setPainReports(painRes.data);
        }

        if (loadRes.data) {
          setLoadData(loadRes.data);
        }
        
        // Fetch attachments from database with fallback
        let dbAttachmentsData: any[] | null = null;
        let dbError: any = null;

        try {
          const { data, error } = await supabase
            .from('athlete_attachments')
            .select('*')
            .eq('athlete_id', athlete.id)
            .eq('is_current_version', true)
            .order('created_at', { ascending: false });
          
          if (error) {
            // If column missing, try without versioning filter
            if (error.message?.includes('column "is_current_version" does not exist')) {
              const fallback = await supabase
                .from('athlete_attachments')
                .select('*')
                .eq('athlete_id', athlete.id)
                .order('created_at', { ascending: false });
              dbAttachmentsData = fallback.data;
              dbError = fallback.error;
            } else {
              dbError = error;
            }
          } else {
            dbAttachmentsData = data;
          }
        } catch (err) {
          dbError = err;
        }
          
        if (!dbError && dbAttachmentsData && dbAttachmentsData.length > 0) {
          setAttachments(dbAttachmentsData);
          setIsUsingAttachmentFallback(false);
        } else {
          setIsUsingAttachmentFallback(true);
          if (dbError) {
            const errorMessage = dbError.message || String(dbError);
            // Only log as error if it's not a "table not found" error
            if (errorMessage.includes("Could not find the table") || errorMessage.includes("relation \"athlete_attachments\" does not exist")) {
              console.log("Athlete attachments table not found, falling back to storage listing. Please run the migrations.");
            } else {
              console.error("ATTACHMENTS DB FETCH ERROR:", errorMessage);
            }
          } else if (dbAttachmentsData && dbAttachmentsData.length === 0) {
            console.log("No attachments found in database, checking storage fallback...");
          }
          
          // Final fallback: Fetch from storage listing if DB fails
          console.log(`Falling back to storage listing for attachments in path: attachments/${athlete.id}`);
          const { data: storageFiles, error: storageError } = await supabase.storage
            .from('avatars')
            .list(`attachments/${athlete.id}`);
            
          console.log("Storage listing result:", { storageFiles, storageError });
            
          if (!storageError && storageFiles) {
            const formattedAttachments = storageFiles
              .filter(f => f.name !== '.emptyFolderPlaceholder')
              .map(f => {
                const { data: { publicUrl } } = supabase.storage
                  .from('avatars')
                  .getPublicUrl(`attachments/${athlete.id}/${f.name}`);
                  
                return {
                  id: f.id || f.name,
                  file_name: f.name,
                  // Improved extraction: handle double underscore separator and restore spaces from underscores if any
                  document_name: f.name.includes('__') 
                    ? f.name.split('__')[0].replace(/_/g, ' ') 
                    : f.name.split('.').slice(0, -1).join('.').replace(/_/g, ' '),
                  category: 'Outros',
                  file_type: f.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
                  file_size: f.metadata?.size || 0,
                  file_url: publicUrl,
                  created_at: f.created_at || new Date().toISOString(),
                  is_current_version: true,
                  version_number: 1
                };
              })
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              
            console.log("Formatted attachments from storage:", formattedAttachments);
            setAttachments(formattedAttachments);
          } else if (storageError) {
            console.error("STORAGE LIST ERROR:", storageError);
          }
        }

        if (wellnessRes.error) {
          console.error("WELLNESS FETCH ERROR:", wellnessRes.error);
        }

        if (wellnessRes.data) {
          // Reverse to make it chronological (oldest first) for charts
          const chronologicalData = [...wellnessRes.data].reverse();
          
          console.log("LATEST WELLNESS RAW:", chronologicalData[chronologicalData.length - 1]);
          const SYMPTOM_LABELS: Record<string, string> = {
            headache: "Dor de cabeça",
            dizziness: "Tontura",
            nausea: "Náusea",
            fatigue_extreme: "Fadiga Extrema",
            general_malaise: "Mal-estar Geral",
            fever: "Febre",
            shortness_of_breath: "Falta de Ar",
            chest_pain: "Dor no Peito",
            palpitations: "Palpitações",
            skin_lesion: "Lesão de Pele",
            ingrown_nail: "Unha Encravada",
            bruise: "Hematoma/Bolha"
          };

          const formattedWellness = chronologicalData.map(w => {
            const clinicalSymptoms = w.symptoms ? Object.entries(w.symptoms)
              .filter(([_, level]) => (level as number) > 0)
              .map(([key, _]) => SYMPTOM_LABELS[key] || key) : [];
            
            const allSymptoms = [...(w.menstrual_symptoms || []), ...clinicalSymptoms];

            return {
              date: parseDateString(w.record_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              readiness: w.readiness_score,
              sleep: w.sleep_hours, // Corrected from sleep_quality
              sleep_quality: w.sleep_quality,
              stress: w.stress_level,
              fatigue: w.fatigue_level,
              soreness: w.muscle_soreness,
              soreness_location: w.soreness_location,
              load: 0, 
              pain: w.muscle_soreness,
              dor: w.muscle_soreness,
              menstrual_cycle: w.menstrual_cycle,
              hydration: w.hydration_perception,
              urine_color: w.urine_color,
              symptoms: allSymptoms
            };
          });
          console.log("LATEST WELLNESS MAPPED:", formattedWellness[formattedWellness.length - 1]);
          setWellnessHistory(formattedWellness);

          // --- TREND ANALYSIS ---
          const alerts: string[] = [];
          const len = chronologicalData.length;
          
          if (len >= 3) {
            const last3 = chronologicalData.slice(-3);
            // A) Queda de sono por 3 dias seguidos ou < 6h por 3 dias
            const sleepDrop = last3[0].sleep_hours > last3[1].sleep_hours && last3[1].sleep_hours > last3[2].sleep_hours;
            const sleepLow = last3.every(r => r.sleep_hours != null && r.sleep_hours < 6);
            if (sleepDrop || sleepLow) alerts.push("Queda de sono por 3 dias consecutivos");

            // B) Queda de prontidão por 3 registros seguidos
            if (last3[0].readiness_score > last3[1].readiness_score && last3[1].readiness_score > last3[2].readiness_score) {
              alerts.push("Prontidão em queda progressiva");
            }

            // C) Dor aumentando em sequência
            if (last3[0].muscle_soreness < last3[1].muscle_soreness && last3[1].muscle_soreness < last3[2].muscle_soreness) {
              alerts.push("Aumento sequencial de dor muscular");
            }
          } else if (len >= 2) {
            const last2 = chronologicalData.slice(-2);
            if (last2[0].readiness_score > last2[1].readiness_score && (last2[0].readiness_score - last2[1].readiness_score > 10)) {
              alerts.push("Queda brusca de prontidão");
            }
          }

          // D) Possível desidratação recorrente
          if (len >= 2) {
            const last2 = chronologicalData.slice(-2);
            if (last2.every(r => r.urine_color != null && r.urine_color >= 4)) {
              alerts.push("Possível desidratação recorrente");
            }
          }
          
          console.log("TREND ANALYSIS:", alerts);
          setTrendAlerts(alerts);
        }

        if (notesRes.error) {
          console.error("NOTES FETCH ERROR:", notesRes.error);
        }

        if (notesRes.data) {
          const formattedNotes = notesRes.data.map(n => ({
            id: n.id,
            date: new Date(n.note_date).toLocaleString('pt-BR'),
            text: n.generated_text || n.observations || '',
            signed: n.is_signed,
            professional: n.professional_name,
            pain_level: n.pain_level,
            feeling: n.feeling,
            regions: n.regions || [],
            treatments: n.treatments || [],
            observations: n.observations || ''
          }));
          setProntuarioNotes(formattedNotes);
        }

        if (assessmentsRes) {
          console.log('Fetched and merged assessments on reload:', assessmentsRes);
          setClinicalAssessments(assessmentsRes);
        }

      } catch (err: any) {
        console.error("ATHLETE PROFILE DATA FETCH ERROR:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAthleteData();
  }, [athlete.id, athlete.name, fetchAllAssessmentsData]);

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const generateClinicalReport = async (type: string, data: any, score: number) => {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.warn("Gemini API key not found. Skipping clinical report generation.");
      return { report: null, alerts: [] };
    }

    try {
      setIsGeneratingReport(true);
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
            const prompt = `
        Você é um especialista em medicina esportiva e fisiologia do exercício de elite.
        Analise os seguintes dados de uma avaliação ${type} do atleta ${athlete.name}.
        
        DADOS DA AVALIAÇÃO:
        - Tipo: ${type}
        - Score: ${score}/100
        - Detalhes: ${JSON.stringify(data)}
        
        PERFIL DO ATLETA:
        - Nome: ${athlete.name}
        - Modalidade: ${athlete.modalidade}
        - Posição: ${athlete.posicao}
        
        TAREFA:
        Você deve gerar um RELATÓRIO CLÍNICO DIRETO E OBJETIVO (em ${language === "en" ? "Inglês" : "Português"}), estruturado exatamente como um padrão de "Prontuário Médico Esportivo".
        Use emojis indicativos para que fique agradável de ler na tela.
        Escreva no formato detalhado abaixo e com as linhas e blocos separados usando enter para pular 2 linhas (evite um grande bloco denso de texto):
        
        🎯 CONTEXTO CLÍNICO & OBJETIVO:
        [descrição breve do contexto do atleta e o objetivo da avaliação com base na modalidade/posição]

        📊 SUBJETIVO / RESPOSTA DO PACIENTE:
        [interpretação principal dos dados numéricos ou queixas levantadas pela avaliação, ex: "Paciente compareceu com score X e reportou..."]

        🛠️ CONDUTAS & RACIOCÍNIO CLÍNICO:
        - Regiões Alvo: [ex: Cervical, Ombro]
        - Risco/Diagnóstico principal: [ex: Simetria muscular em deficit...]
        [breve conclusão sobre o impacto disto na posição/modalidade do atleta e o que deve ser feito para corrigir ou manter, por que foram escolhidas essas intervenções?]

        📍 ATUALIZAÇÃO DE TAGS RECOMENDADAS:
        [+] [tag para adicionar baseada nos achados]
        [-] [tag caso o paciente tenha melhorado de algo]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              report: { type: Type.STRING },
              alerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ["warning", "danger", "info"] },
                    message: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ["high", "medium", "low"] }
                  },
                  required: ["type", "message", "priority"]
                }
              }
            },
            required: ["report", "alerts"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      return {
        report: result.report || "Relatório não gerado.",
        alerts: result.alerts || []
      };
    } catch (err) {
      console.error("Error generating clinical report:", err);
      return { report: "Erro ao gerar relatório clínico automático.", alerts: [] };
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDeleteAssessment = async () => {
    if (!supabase || !confirmDeleteAssessment) return;
    setIsDeletingAssessment(true);
    
    try {
      const { error } = await supabase
        .from(confirmDeleteAssessment.source_table)
        .delete()
        .eq('id', confirmDeleteAssessment.id);
        
      if (error) throw error;
      
      setNotification({ message: 'Avaliação excluída com sucesso!', type: 'success' });
      setConfirmDeleteAssessment(null);
      const refreshedData = await fetchAllAssessmentsData(athlete.id);
      setClinicalAssessments(refreshedData);
    } catch (err) {
      console.error('Error deleting assessment:', err);
      setNotification({ message: 'Erro ao excluir avaliação.', type: 'error' });
    } finally {
      setIsDeletingAssessment(false);
    }
  };

  const saveAssessment = async (type: string, data: any, score?: number, riskLevel?: string) => {
    if (!supabase) {
      console.warn('Supabase not configured, assessment not saved to cloud');
      return;
    }

    try {
      // Map type to table name
      const typeToTableMap: Record<string, string> = {
        'sleep': 'sleep_assessments',
        'orthopedic': 'orthopedic_assessments',
        'biomechanical': 'biomechanical_assessments',
        'physical': 'physical_load_assessments',
        'strength': 'performance_assessments',
        'performance': 'performance_assessments',
        'neurological': 'neurological_assessments',
        'psychological': 'psychological_assessments',
        'nutritional': 'nutritional_assessments',
        'reds': 'reds_assessments',
        'anthropometric': 'anthropometric_assessments',
        'maturation': 'maturation_assessments',
        'menstrual': 'menstrual_assessments',
        'hydration': 'hydration_assessments',
        'functional': 'functional_assessments',
        'dynamometry': 'dynamometry_assessments',
        'postural': 'postural_assessments'
      };

      // Normalize accented types if they somehow get passed
      let normalizedType = type.toLowerCase();
      const typeMap: Record<string, string> = {
        'psicológica': 'psychological',
        'física': 'physical',
        'hidratação': 'hydration',
        'nutricional': 'nutritional',
        'maturação': 'maturation',
        'antropométrica': 'anthropometric',
        'neurológica': 'neurological',
        'biomecânica': 'biomechanical',
        'ortopédica': 'orthopedic',
        'dinamometria': 'dynamometry',
        'força': 'strength'
      };

      if (typeMap[normalizedType]) {
        normalizedType = typeMap[normalizedType];
      }

      const tableName = typeToTableMap[normalizedType] || typeToTableMap[type];

      if (tableName) {
        // Generate clinical report using AI
        const { report, alerts: clinicalAlerts } = await generateClinicalReport(type, data, score || 0);

        // Save to specific modular table
        // Clean data to avoid duplicating column fields in raw_data
        const { classification, classification_color, alerts, ...cleanData } = data;
        const rawDataToSave = data.raw_data || cleanData;

        const { data: savedData, error } = await supabase
          .from(tableName)
          .insert([
            {
              athlete_id: athlete.id,
              score: score || 0,
              classification: riskLevel || classification || data.classification || "",
              classification_color: classification_color || data.classification_color || "",
              alerts: alerts || data.alerts || [],
              raw_data: rawDataToSave,
              clinical_report: report,
              clinical_alerts: clinicalAlerts,
              assessment_date: getLocalDateString()
            }
          ])
          .select();

        if (error) throw error;
        
        if (savedData) {
          console.log('Successfully saved assessment:', savedData);
          setNotification({ message: 'Avaliação salva com sucesso!', type: 'success' });
          // Re-fetch all assessments to ensure the view is updated and state is in sync
          const refreshedData = await fetchAllAssessmentsData(athlete.id);
          console.log('Refreshed data after save:', refreshedData);
          setClinicalAssessments(refreshedData);
        }
      } else {
        throw new Error(`Assessment type '${type}' not mapped to a modular table.`);
      }
    } catch (error: any) {
      console.error(`Error saving ${type} assessment:`, error);
      setNotification({ message: error.message || 'Erro ao salvar avaliação.', type: 'error' });
      throw error;
    }
  };

  // Fast Clinical Note State
  const [noteForm, setNoteForm] = useState({
    pain: 2,
    feeling: 'Igual',
    regions: [] as string[],
    treatments: [] as string[],
    obs: '',
    suggestionMatch: 'Yes' as 'Yes' | 'Partially' | 'No',
    tagAdjustments: [] as { id: string, action: 'reinforce' | 'remove' | 'keep' }[],
    newTags: [] as string[]
  });
  
  const [isListening, setIsListening] = useState(false);

  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id);
    setNoteForm({
      feeling: note.feeling || 'Igual',
      pain: note.pain_level || 0,
      regions: note.regions || [],
      treatments: note.treatments || [],
      obs: note.observations || ''
    });
    setGeneratedNote(note.text);
    setShowSignatureStep(true);
    setShowClinicalNoteModal(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!supabase) return;
    
    try {
      setIsDeletingNote(noteId);
      const { error } = await supabase
        .from('clinical_notes')
        .delete()
        .eq('id', noteId);
        
      if (error) throw error;
      
      setProntuarioNotes(prev => prev.filter(n => n.id !== noteId));
      setNotification({ message: 'Registro excluído com sucesso!', type: 'success' });
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setNotification({ message: 'Erro ao excluir registro.', type: 'error' });
    } finally {
      setIsDeletingNote(null);
      setConfirmDeleteNote(null);
    }
  };

  const handleUploadAttachment = async (data: { 
    file: File, 
    documentName: string, 
    category: string, 
    versionNote?: string,
    versionGroupId?: string
  }) => {
    if (!supabase) return;
    
    setIsUploadingAttachment(true);
    try {
      const fileExt = data.file.name.split('.').pop();
      // Remove accents and replace spaces/special chars with underscores to prevent Invalid Key errors
      const normalizedStr = data.documentName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const safeDocName = normalizedStr.replace(/[^\w-]/g, '_');
      // Use double underscore as a clear separator between name and random suffix
      const fileName = `${safeDocName}__${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `attachments/${athlete.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, data.file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      let versionNumber = 1;
      let versionGroupId = data.versionGroupId || crypto.randomUUID();

      if (data.versionGroupId) {
        // If it's a new version, find the latest version number and update previous current versions
        const { data: latestVersion } = await supabase
          .from('athlete_attachments')
          .select('version_number')
          .eq('version_group_id', data.versionGroupId)
          .order('version_number', { ascending: false })
          .limit(1)
          .single();
        
        if (latestVersion) {
          versionNumber = latestVersion.version_number + 1;
        }

        // Set previous versions as not current
        await supabase
          .from('athlete_attachments')
          .update({ is_current_version: false })
          .eq('version_group_id', data.versionGroupId);
      }
        
      try {
        const { data: attachmentData, error: dbError } = await supabase
          .from('athlete_attachments')
          .insert([{
            athlete_id: athlete.id,
            document_name: data.documentName,
            category: data.category,
            file_name: data.file.name,
            file_type: fileExt,
            mime_type: data.file.type,
            file_size: data.file.size,
            file_url: publicUrl,
            version_group_id: versionGroupId,
            version_number: versionNumber,
            is_current_version: true,
            version_note: data.versionNote || null
          }])
          .select()
          .single();
          
        if (dbError) {
          if (dbError.message?.includes('Could not find the table') || dbError.message?.includes('relation "athlete_attachments" does not exist')) {
            console.warn("Athlete attachments table not found, document metadata not saved to DB. Falling back to storage only.");
          } else {
            throw dbError;
          }
        }
      } catch (dbInsertErr: any) {
        console.warn("DB Insert failed, but file was uploaded to storage:", dbInsertErr.message);
      }
      
      // Refresh attachments list (this will use the fallback fetch I implemented earlier)
      // We need to trigger the same fetch logic or just reload the page/state
      // For now, let's just re-run the fetch logic if possible, or just let the user refresh
      // Actually, I can just call the fetch function if I extract it.
      
      // Refresh attachments list
      let refreshedAttachments: any[] | null = null;
      try {
        const { data: dbAttachments, error: dbFetchError } = await supabase
          .from('athlete_attachments')
          .select('*')
          .eq('athlete_id', athlete.id)
          .eq('is_current_version', true)
          .order('created_at', { ascending: false });
          
        if (!dbFetchError && dbAttachments && dbAttachments.length > 0) {
          refreshedAttachments = dbAttachments;
        }
      } catch (e) {
        console.warn("Error refreshing from DB:", e);
      }

      if (refreshedAttachments) {
        setAttachments(refreshedAttachments);
      } else {
        // Trigger storage fallback fetch manually here
        const { data: storageFiles } = await supabase.storage
          .from('avatars')
          .list(`attachments/${athlete.id}`);
          
        if (storageFiles) {
          const formattedAttachments = storageFiles
            .filter(f => f.name !== '.emptyFolderPlaceholder')
            .map(f => {
              const { data: { publicUrl: pUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(`attachments/${athlete.id}/${f.name}`);
                
              return {
                id: f.id || f.name,
                file_name: f.name,
                // Improved extraction: handle double underscore separator and restore spaces from underscores if any
                document_name: f.name.includes('__') 
                  ? f.name.split('__')[0].replace(/_/g, ' ') 
                  : f.name.split('.').slice(0, -1).join('.').replace(/_/g, ' '),
                category: 'Outros',
                file_type: f.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
                file_size: f.metadata?.size || 0,
                file_url: pUrl,
                created_at: f.created_at || new Date().toISOString(),
                is_current_version: true,
                version_number: 1
              };
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
          setAttachments(formattedAttachments);
        }
      }
      setNotification({ message: data.versionGroupId ? 'Nova versão enviada com sucesso!' : 'Anexo enviado com sucesso!', type: 'success' });
    } catch (err: any) {
      console.error('Error uploading attachment:', err.message || err.details || err.hint || err);
      setNotification({ message: `Erro ao enviar anexo: ${err.message || 'Erro desconhecido'}`, type: 'error' });
    } finally {
      setIsUploadingAttachment(false);
      setShowAttachmentUpload(false);
      setVersionGroupIdForNewVersion(null);
    }
  };

  const handleDeleteAttachment = async (attachment: any) => {
    if (!supabase) return;
    
    setIsDeletingAttachment(attachment.id);
    try {
      // Extract file name from URL or path
      const urlParts = attachment.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `attachments/${athlete.id}/${fileName}`;
      
      // 1. Remove from storage
      const { error: storageError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);
        
      if (storageError) {
        console.warn('Storage delete error (might be expected if file not found):', storageError);
      }
      
      // 2. Try DB operations if table exists
      try {
        if (attachment.is_current_version) {
          const { data: prevVersions } = await supabase
            .from('athlete_attachments')
            .select('*')
            .eq('version_group_id', attachment.version_group_id)
            .neq('id', attachment.id)
            .order('version_number', { ascending: false })
            .limit(1);

          if (prevVersions && prevVersions.length > 0) {
            await supabase
              .from('athlete_attachments')
              .update({ is_current_version: true })
              .eq('id', prevVersions[0].id);
          }
        }

        // 3. Delete DB record
        const { error: dbError } = await supabase
          .from('athlete_attachments')
          .delete()
          .eq('id', attachment.id);
          
        if (dbError && !dbError.message?.includes('Could not find the table') && !dbError.message?.includes('relation "athlete_attachments" does not exist')) {
          throw dbError;
        }
      } catch (dbErr: any) {
        console.warn("DB Delete failed, but continuing with storage cleanup:", dbErr.message);
      }
      
      // Refresh attachments list
      const { data: dbCheck } = await supabase.from('athlete_attachments').select('id').limit(1);
      if (dbCheck) {
        const { data: allAttachments } = await supabase
          .from('athlete_attachments')
          .select('*')
          .eq('athlete_id', athlete.id)
          .eq('is_current_version', true)
          .order('created_at', { ascending: false });
          
        if (allAttachments) setAttachments(allAttachments);
      } else {
        // Trigger storage fallback fetch manually here
        const { data: storageFiles } = await supabase.storage
          .from('avatars')
          .list(`attachments/${athlete.id}`);
          
        if (storageFiles) {
          const formattedAttachments = storageFiles
            .filter(f => f.name !== '.emptyFolderPlaceholder')
            .map(f => {
              const { data: { publicUrl: pUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(`attachments/${athlete.id}/${f.name}`);
                
              return {
                id: f.id || f.name,
                file_name: f.name,
                // Improved extraction: handle double underscore separator and restore spaces from underscores if any
                document_name: f.name.includes('__') 
                  ? f.name.split('__')[0].replace(/_/g, ' ') 
                  : f.name.split('.').slice(0, -1).join('.').replace(/_/g, ' '),
                category: 'Outros',
                file_type: f.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
                file_size: f.metadata?.size || 0,
                file_url: pUrl,
                created_at: f.created_at || new Date().toISOString(),
                is_current_version: true,
                version_number: 1
              };
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
          setAttachments(formattedAttachments);
        }
      }
      setNotification({ message: 'Anexo excluído com sucesso!', type: 'success' });
    } catch (err: any) {
      console.error('Error deleting attachment:', err.message || err.details || err.hint || err);
      setNotification({ message: `Erro ao excluir anexo: ${err.message || 'Erro desconhecido'}`, type: 'error' });
    } finally {
      setIsDeletingAttachment(null);
      setConfirmDeleteAttachment(null);
    }
  };

  const handleUpdateAttachment = async (id: string, updates: { document_name: string, category: string }) => {
    if (!supabase) return;
    setIsUpdatingAttachment(true);
    try {
      const { error } = await supabase
        .from('athlete_attachments')
        .update({
          document_name: updates.document_name,
          category: updates.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setAttachments(prev => prev.map(att => att.id === id ? { ...att, ...updates } : att));
      setNotification({ message: 'Anexo atualizado com sucesso!', type: 'success' });
      setShowEditAttachmentModal(false);
    } catch (err: any) {
      console.error('Error updating attachment:', err);
      setNotification({ message: `Erro ao atualizar anexo: ${err.message || 'Erro desconhecido'}`, type: 'error' });
    } finally {
      setIsUpdatingAttachment(false);
    }
  };

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentTranscript += transcript + ' ';
            }
          }
          if (currentTranscript) {
            setNoteForm(prev => ({ ...prev, obs: prev.obs + (prev.obs ? ' ' : '') + currentTranscript }));
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const REGIONS_GROUPS = [
    { name: 'Coluna & Core', items: ['Cervical', 'Torácica', 'Lombar', 'Sacro-ilíaca', 'Core/Abdômen'] },
    { name: 'Membros Superiores', items: ['Ombro D', 'Ombro E', 'Cotovelo/Mão D', 'Cotovelo/Mão E'] },
    { name: 'Quadril & Coxa', items: ['Quadril D', 'Quadril E', 'Glúteo D', 'Glúteo E', 'Quadríceps D', 'Quadríceps E', 'Posterior de Coxa D', 'Posterior de Coxa E', 'Adutores D', 'Adutores E'] },
    { name: 'Perna & Pé', items: ['Joelho D', 'Joelho E', 'Panturrilha D', 'Panturrilha E', 'Tendão de Aquiles D', 'Tendão de Aquiles E', 'Tornozelo D', 'Tornozelo E', 'Fáscia Plantar D', 'Fáscia Plantar E'] }
  ];

  const TREATMENTS_GROUPS = [
    { name: 'Terapia Manual & Analgesia', items: ['Terapia Manual', 'Liberação Miofascial', 'Liberação Instrumental (IASTM)', 'Mobilização Articular', 'Manipulação Articular', 'Dry Needling', 'Ventosaterapia'] },
    { name: 'Cinesioterapia & Força', items: ['Exercícios Terapêuticos', 'Estabilização Segmentar', 'Treino Sensoriomotor', 'Treino Pliométrico', 'BFR (Restrição de Fluxo)', 'Isocinético'] },
    { name: 'Eletrotermofototerapia', items: ['Fotobiomodulação (LED/Laser)', 'Ondas de Choque', 'Eletroestimulação (Compex/FES)', 'TENS / Correntes Analgésicas', 'Ultrassom'] },
    { name: 'Recovery & Prevenção', items: ['Crioterapia (GameReady)', 'Recovery (Bota Pneumática)', 'Recovery (Imersão)', 'Pistola de Massagem', 'Bandagem Funcional/Kinesio', 'Gestão de Carga'] }
  ];

  // Mock for postural photos
  const [posturalHistory, setPosturalHistory] = useState<any[]>([]);

  const [compareDates, setCompareDates] = useState<any[]>([]);

  const handlePosturalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newPhoto = {
          id: Date.now().toString(),
          url: event.target.result as string,
          date: new Date().toLocaleDateString('pt-BR')
        };
        const updatedHistory = [...posturalHistory, newPhoto];
        setPosturalHistory(updatedHistory);
        
        // Auto-select for comparison if we have less than 2
        if (compareDates.length === 0) {
          setCompareDates([newPhoto]);
        } else if (compareDates.length === 1) {
          setCompareDates([compareDates[0], newPhoto]);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Mock for pain evolution
  const painData = wellnessHistory.slice(-6).map(w => ({
    date: w.date,
    dor: w.pain
  }));

  const getStatusConfig = (status: Athlete['status']) => {
    switch (status) {
      case 'Apto':
        return { label: 'Apto', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: ShieldCheck };
      case 'Apto com Restrição':
        return { label: 'Apto c/ Restrição', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: ShieldAlert };
      case 'Transição':
        return { label: 'Transição', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: TrendingUp };
      case 'Reabilitação':
        return { label: 'Reabilitação', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Activity };
      case 'DM':
        return { label: 'Dep. Médico', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: Stethoscope };
      default:
        return { label: status, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Info };
    }
  };

  const getRiskConfig = (level: Athlete['riskLevel']) => {
    switch (level) {
      case 'Baixo': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Baixo Risco' };
      case 'Moderado': return { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Risco Moderado' };
      case 'Alto': return { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Alto Risco' };
      case 'Crítico': return { color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'Risco Crítico' };
      default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Não Avaliado' };
    }
  };

  const latestAssessmentsByType = useMemo(() => {
    return clinicalAssessments.reduce((acc, curr) => {
      // clinicalAssessments sorted by date desc, so the first one we find for a type is the latest
      if (curr.score !== null && curr.score !== undefined && !acc[curr.assessment_type]) {
         acc[curr.assessment_type] = curr;
      }
      return acc;
    }, {} as Record<string, any>);
  }, [clinicalAssessments]);

  const { globalAssessmentScore, assessmentAlerts } = useMemo(() => {
    const assessmentValues = Object.values(latestAssessmentsByType);
    const score = assessmentValues.length > 0 
      ? Math.round(assessmentValues.reduce((sum, a) => sum + Number(a.score), 0) / assessmentValues.length)
      : null;
    const alerts = assessmentValues.flatMap(a => (a.alerts || []).map((alert: string) => ({ type: a.assessment_type, message: alert })));
    return { globalAssessmentScore: score, assessmentAlerts: alerts };
  }, [latestAssessmentsByType]);

  const statusCfg = getStatusConfig(athlete.status);
  const riskCfg = getRiskConfig(athlete.riskLevel || 'Baixo');
  const StatusIcon = statusCfg.icon;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden font-sans">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialogs */}
      <ConfirmDialog 
        isOpen={confirmDeleteNote !== null}
        title="Excluir Registro"
        description="Tem certeza que deseja excluir este registro do prontuário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => confirmDeleteNote && handleDeleteNote(confirmDeleteNote)}
        onCancel={() => setConfirmDeleteNote(null)}
      />

      <ConfirmDialog 
        isOpen={confirmDeleteAttachment !== null}
        title="Excluir Anexo"
        description={`Tem certeza que deseja excluir o anexo "${confirmDeleteAttachment?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => confirmDeleteAttachment && handleDeleteAttachment(confirmDeleteAttachment.id, confirmDeleteAttachment.name)}
        onCancel={() => setConfirmDeleteAttachment(null)}
      />

            {/* Top App Bar */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-10 pb-24 sm:pb-4 flex flex-col lg:grid lg:grid-cols-4 lg:grid-rows-[auto_auto_1fr] gap-x-8 gap-y-6">
        <div className="col-span-full mb-0 lg:mb-2">
          <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white uppercase text-xxs font-black tracking-widest bg-slate-900/80 backdrop-blur-md rounded-full shadow-lg border border-slate-800"><ChevronLeft className="w-4 h-4 mr-2" /> Voltar para Dashboard</Button>
        </div>

        {/* Large Profile Header block restored */}
        <div className="lg:col-span-full lg:row-start-2 order-1 min-w-0 flex flex-col gap-4">
          {/* Ultra-Technological Luxurious Profile Header */}
          <div className="relative w-full rounded-3xl lg:rounded-[2.5rem] bg-gradient-to-br from-[#0c111c] to-[#04060a] border border-slate-800/60 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
            {/* Background Ambient Glow */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl lg:rounded-[2.5rem] pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent blur-[100px] mix-blend-screen mix-blend-overlay"></div>
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/5 via-transparent to-transparent blur-[120px] mix-blend-screen"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
          </div>

          <div className="relative bg-slate-950/40 backdrop-blur-3xl rounded-[22px] lg:rounded-[2.3rem] p-6 lg:p-10 flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 z-10">
            
            {/* Hex/Tech Avatar Frame */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500/30 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden border border-white/10 bg-slate-900/50 shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.5)] p-2">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  {athletePhoto ? (
                    <Image 
                      src={athletePhoto} 
                      alt={athlete.nickname || athlete.name || 'Avatar'} 
                      fill 
                      className="object-cover scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out"
                      unoptimized
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900/80 flex items-center justify-center">
                      <User className="w-24 h-24 text-slate-800" />
                    </div>
                  )}
                  {/* Subtle Tech Overlay */}
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-full pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[200%] -top-full animate-[scan_6s_linear_infinite] pointer-events-none mix-blend-overlay" />
                </div>
              </div>
            </div>

            {/* Profile Info & Stats */}
            <div className="flex-1 w-full text-center lg:text-left flex flex-col justify-center py-4 lg:py-6">
              
              {/* Top Tech Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                <div className={`px-4 py-1.5 rounded-full border backdrop-blur-md font-black uppercase tracking-widest text-[9px] flex items-center gap-2 shadow-lg ${athlete.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : athlete.status === 'injured' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-500/10 border-slate-500/30 text-slate-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${athlete.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : athlete.status === 'injured' ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.8)]'} animate-pulse`} />
                  SYS: {athlete.status === 'active' ? "APTO" : athlete.status === 'injured' ? "LESIONADO" : "INATIVO"}
                </div>
                {athlete.athlete_code && (
                  <div className="px-3 py-1.5 bg-white/5 text-slate-400 text-[9px] font-mono font-bold rounded-full uppercase tracking-[0.3em] border border-white/5 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-cyan-500 opacity-50" />
                    ID-{athlete.athlete_code}
                  </div>
                )}
              </div>

              {/* Name Display */}
              <div className="mb-8">
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white uppercase tracking-tighter drop-shadow-2xl leading-[1.1]">
                  <span className="font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                    {athlete.nickname || athlete.name?.split(' ')[0] || ""}
                  </span>
                </h2>
              </div>

              {/* Athlete Specs Grid */}
              <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-center justify-center lg:justify-start gap-y-6 gap-x-12">
                {athlete.sport && (
                  <div className="flex flex-col gap-1 items-center lg:items-start">
                    <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-slate-500 flex items-center gap-1.5"><Globe className="w-2.5 h-2.5" /> {language === 'pt' ? 'Modalidade' : 'Sport'}</span>
                    <span className="text-sm font-black text-slate-200 uppercase tracking-wider">{athlete.sport}</span>
                  </div>
                )}
                {athlete.position && (
                  <div className="flex flex-col gap-1 items-center lg:items-start lg:border-l border-slate-800 lg:pl-12">
                    <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-slate-500 flex items-center gap-1.5"><Target className="w-2.5 h-2.5" /> {language === 'pt' ? 'Posição' : 'Position'}</span>
                    <span className="text-sm font-black text-slate-200 uppercase tracking-wider">{athlete.position}</span>
                  </div>
                )}
                {athlete.category && (
                  <div className="flex flex-col gap-1 items-center lg:items-start lg:border-l border-slate-800 lg:pl-12">
                    <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-slate-500 flex items-center gap-1.5"><Award className="w-2.5 h-2.5" /> {language === 'pt' ? 'Categoria' : 'Category'}</span>
                    <span className="text-sm font-black text-slate-200 uppercase tracking-wider">{athlete.category}</span>
                  </div>
                )}
                {athlete.birth_date && (
                  <div className="flex flex-col gap-1 items-center lg:items-start lg:border-l border-slate-800 lg:pl-12">
                    <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-slate-500 flex items-center gap-1.5"><CalendarDays className="w-2.5 h-2.5" /> {language === 'pt' ? 'Idade' : 'Age'}</span>
                    <span className="text-sm font-black text-slate-200 uppercase tracking-wider">{new Date().getFullYear() - new Date(athlete.birth_date).getFullYear()} <span className="text-[10px] text-slate-500">YRS</span></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* HUD PERFORMANCE BAR (One-Line Futuristic Interface) */}
        <div className="relative group lg:col-span-full order-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl">
            
            {/* Integrated Metrics Line */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap lg:items-center justify-between gap-6 lg:gap-8 w-full">
              
              {/* 1. RISCO CLÍNICO ATUAL */}
              <div className="w-full sm:w-auto flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 rotate-45 transform hover:rotate-0 transition-transform duration-500 ${riskCfg.color.replace('text-', 'border-').replace('400', '500/30')} bg-slate-900/50`}>
                  <ShieldCheck className={`-rotate-45 group-hover:rotate-0 transition-transform duration-500 w-6 h-6 ${riskCfg.color}`} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">{language === 'pt' ? 'Risco Clínico Atual' : 'Current Clinical Risk'}</p>
                  <div className={`text-lg font-black uppercase tracking-widest ${riskCfg.color} flex items-center gap-2`}>
                    {riskCfg.label}
                    <div className={`w-2 h-2 rounded-full ${riskCfg.color.replace('text-', 'bg-')} animate-pulse`} />
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden lg:block w-px h-10 bg-gradient-to-b from-transparent via-slate-800 to-transparent" />

              {/* 2. STATUS */}
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><StatusIcon className="w-3 h-3" /> Status</p>
                <span className={`text-base font-black uppercase tracking-tighter ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>

              {/* 3. PRONTIDÃO */}
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Activity className="w-3 h-3" /> Prontidão</p>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-black ${clinicalSessionData?.readiness?.score && clinicalSessionData?.readiness?.score < 65 ? 'text-rose-400' : 'text-white'}`}>
                    {clinicalSessionData?.readiness?.score || 0}%
                  </span>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${clinicalSessionData?.readiness?.score && clinicalSessionData?.readiness?.score < 65 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                      style={{ width: `${clinicalSessionData?.readiness?.score || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden lg:block w-px h-10 bg-gradient-to-b from-transparent via-slate-800 to-transparent" />

              {/* 4. TAGS ATIVAS */}
              <div className="flex flex-col w-full sm:w-auto">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Tag className="w-3 h-3 text-purple-500" /> Tags Ativas</p>
                <div className="flex flex-wrap gap-1">
                  {clinicalTags.slice(0, 3).map((t, i) => (
                    <span key={i} className="text-[8px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase">{t.tag}</span>
                  ))}
                  {clinicalTags.length === 0 && <span className="text-[9px] text-slate-600 font-bold italic">-</span>}
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden lg:block w-px h-10 bg-gradient-to-b from-transparent via-slate-800 to-transparent" />

              {/* 5. FOCO DE RECUPERAÇÃO */}
              <div className="flex flex-col w-full sm:w-auto lg:flex-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Target className="w-3 h-3 text-rose-500" /> Foco de Recuperação</p>
                 <div className="flex flex-wrap gap-3">
                   {athleteAlerts.filter(a => a.status === 'active').slice(0, 2).map(alert => (
                     <div key={alert.id} className="flex gap-2 items-center bg-rose-500/5 border border-rose-500/10 px-2 py-0.5 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-300 truncate max-w-[150px]">{alert.message}</span>
                     </div>
                   ))}
                   {athleteAlerts.filter(a => a.status === 'active').length === 0 && (
                      <span className="text-[9px] text-slate-600 font-bold italic">Nenhum foco de risco.</span>
                   )}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="col-span-full lg:row-start-3 order-3 overflow-x-auto custom-scrollbar pb-4 pt-2">
          <div className="flex items-center justify-between min-w-[600px]">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Activity },
              { id: 'ficha', label: 'Cadastro', icon: User },
              { id: 'clinical', label: 'Avaliações', icon: Stethoscope },
              { id: 'prontuario', label: 'Prontuário', icon: FileText },
              { id: 'attachments', label: 'Anexos', icon: ClipboardList },
              { id: 'history', label: 'Histórico', icon: Clock },
            ].map((tab, i, arr) => {
              const activeIndex = arr.findIndex(t => t.id === activeTab);
              const isPast = activeIndex > i;
              const isActive = activeIndex === i;
              
              return (
              <React.Fragment key={tab.id}>
                <div 
                  className={`flex flex-col items-center gap-3 cursor-pointer transition-all ${isActive ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-[3px] ${isActive ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-slate-700 bg-slate-900/50 text-slate-400'}`}>
                    <tab.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[0.65rem] font-black uppercase tracking-widest text-center max-w-[6rem] leading-tight ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>{tab.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-[3px] mx-4 mb-8 rounded-full ${activeIndex > i ? 'bg-cyan-500/50' : 'bg-slate-800'}`}></div>
                )}
              </React.Fragment>
            )})}
          </div>
        </div>

        <div className="col-span-full lg:row-start-4 order-4 space-y-10 min-w-0 pb-32">
        {activeTab === 'overview' && (
          <div className="space-y-10 pb-32">
            {/* Clinical Alerts Banner */}
            {assessmentAlerts.length > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 rounded-lg shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Alertas Clínicos Ativos</h4>
                    <p className="text-xs text-rose-200/70">O atleta possui {assessmentAlerts.length} alerta(s) nas avaliações recentes.</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveTab('clinical')}
                  className="bg-transparent border-rose-500/30 font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <span className="hidden sm:inline">Ver Detalhes</span>
                  <span className="sm:hidden">Ver</span>
                </Button>
              </div>
            )}

            {/* Session Mode Toggle Container */}
            <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800/50 p-6 rounded-[2rem] backdrop-blur-md shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <BrainCircuit className="w-24 h-24 text-cyan-500" />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <div className={`p-4 rounded-2xl transition-all duration-500 ${isSessionMode ? 'bg-cyan-500 text-[#020617] shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-110' : 'bg-slate-800 text-slate-500'}`}>
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    Modo Sessão Inteligente
                    {isSessionMode && <span className="flex h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">Adaptação dinâmica baseada em IA para a sessão de hoje</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSessionMode(!isSessionMode)}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-500 focus:outline-none ${isSessionMode ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-slate-800'}`}
              >
                <div className={`inline-block h-8 w-8 transform rounded-full bg-white transition-all duration-500 shadow-xl ${isSessionMode ? 'translate-x-11' : 'translate-x-1'} flex items-center justify-center`}>
                  {isSessionMode ? <Check className="w-5 h-5 text-cyan-600" /> : <X className="w-5 h-5 text-slate-400" />}
                </div>
              </button>
            </div>

            {isSessionMode ? (
              <SessionModePanel 
                 visibleBlocks={clinicalSessionData?.priorityOutput.visibleBlocks || []}
                 decision={clinicalSessionData?.priorityOutput.adjustedDecision || 'full_train'}
                 content={(() => {
                   const content = clinicalSessionData?.priorityOutput.content || { factors: [], actions: [], tags: [] };
                   // Inject AI Condutas from recent postural assessment
                   const recentPosturalActions = clinicalAssessments?.find(a => a.assessment_type === 'postural')?.raw_data?.ai_actions;
                   if (recentPosturalActions) {
                     return {
                       ...content,
                       actions: [...content.actions, { title: "Condutas Específicas (IA - Postural)", desc: recentPosturalActions }]
                     };
                   }
                   return content;
                 })()}
                 metrics={{
                    readiness: clinicalSessionData?.readiness.score || 0,
                    trend: clinicalSessionData?.trends.trendScore || 0
                 }}
                 confidence={{
                    level: clinicalSessionData?.confidence.confidenceLevel || 'low',
                    score: clinicalSessionData?.confidence.confidenceScore || 0
                 }}
              />
            ) : (
              <>
                {/* 2. Decision cards row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { 
              label: 'Prontidão', 
              value: clinicalSessionData?.readiness.score != null ? `${clinicalSessionData.readiness.score}%` : (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].readiness != null ? `${wellnessHistory[wellnessHistory.length - 1].readiness}%` : (athlete.readiness != null ? `${athlete.readiness}%` : 'Não informado')), 
              icon: Activity, 
              color: (clinicalSessionData?.readiness.score || 100) < 60 ? 'text-rose-400' : (clinicalSessionData?.readiness.score || 100) < 80 ? 'text-amber-400' : 'text-cyan-400', 
              bg: (clinicalSessionData?.readiness.score || 100) < 60 ? 'bg-rose-500/10' : (clinicalSessionData?.readiness.score || 100) < 80 ? 'bg-amber-500/10' : 'bg-cyan-500/10', 
              trend: clinicalSessionData?.trends.readinessTrend === "improving" ? 'up' : clinicalSessionData?.trends.readinessTrend === "worsening" ? 'down' : 'stable',
              alert: (clinicalSessionData?.readiness.score || 100) < 60 ? 'Queda Crítica' : null 
            },
            { 
              label: 'Status de Dor', 
              value: wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].pain != null ? `Nível ${wellnessHistory[wellnessHistory.length - 1].pain}` : 'Não informado', 
              icon: Thermometer, 
              color: (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].pain != null && wellnessHistory[wellnessHistory.length - 1].pain > 3) ? 'text-rose-400' : 'text-emerald-400', 
              bg: (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].pain != null && wellnessHistory[wellnessHistory.length - 1].pain > 3) ? 'bg-rose-500/10' : 'bg-emerald-500/10', 
              trend: wellnessHistory.length > 1 && wellnessHistory[wellnessHistory.length - 1].pain != null && wellnessHistory[wellnessHistory.length - 2].pain != null ? (wellnessHistory[wellnessHistory.length - 1].pain > wellnessHistory[wellnessHistory.length - 2].pain ? 'up' : 'down') : 'stable',
              alert: (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].pain != null) ? (wellnessHistory[wellnessHistory.length - 1].pain >= 7 ? 'Ponto Crítico' : wellnessHistory[wellnessHistory.length - 1].pain >= 4 ? 'Atenção' : null) : null
            },
            { 
              label: 'Horas de Sono', 
              value: wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].sleep != null ? `${wellnessHistory[wellnessHistory.length - 1].sleep}h` : 'Não informado', 
              icon: Clock, 
              color: (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].sleep != null && wellnessHistory[wellnessHistory.length - 1].sleep >= 7) ? 'text-emerald-400' : 'text-amber-400', 
              bg: (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].sleep != null && wellnessHistory[wellnessHistory.length - 1].sleep >= 7) ? 'bg-emerald-500/10' : 'bg-amber-500/10', 
              trend: wellnessHistory.length > 1 && wellnessHistory[wellnessHistory.length - 1].sleep != null && wellnessHistory[wellnessHistory.length - 2].sleep != null ? (wellnessHistory[wellnessHistory.length - 1].sleep >= wellnessHistory[wellnessHistory.length - 2].sleep ? 'up' : 'down') : 'stable' 
            },
            { 
              label: 'Qualidade Sono', 
              value: wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].sleep_quality != null ? 
                (wellnessHistory[wellnessHistory.length - 1].sleep_quality >= 4 ? 'Boa' : wellnessHistory[wellnessHistory.length - 1].sleep_quality === 3 ? 'Regular' : 'Ruim') : 'Não informada', 
              icon: Moon, 
              color: (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].sleep_quality != null && wellnessHistory[wellnessHistory.length - 1].sleep_quality >= 4) ? 'text-emerald-400' : (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].sleep_quality != null && wellnessHistory[wellnessHistory.length - 1].sleep_quality === 3) ? 'text-amber-400' : 'text-rose-400', 
              bg: (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].sleep_quality != null && wellnessHistory[wellnessHistory.length - 1].sleep_quality >= 4) ? 'bg-emerald-500/10' : (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].sleep_quality != null && wellnessHistory[wellnessHistory.length - 1].sleep_quality === 3) ? 'bg-amber-500/10' : 'bg-rose-500/10', 
              trend: wellnessHistory.length > 1 && wellnessHistory[wellnessHistory.length - 1].sleep_quality != null && wellnessHistory[wellnessHistory.length - 2].sleep_quality != null ? (wellnessHistory[wellnessHistory.length - 1].sleep_quality >= wellnessHistory[wellnessHistory.length - 2].sleep_quality ? 'up' : 'down') : 'stable' 
            },
            { 
              label: 'Nível Fadiga', 
              value: wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].fatigue != null ? (wellnessHistory[wellnessHistory.length - 1].fatigue > 7 ? 'Alta' : wellnessHistory[wellnessHistory.length - 1].fatigue > 4 ? 'Moderada' : 'Baixa') : 'Não informado', 
              icon: Zap, 
              color: (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].fatigue != null && wellnessHistory[wellnessHistory.length - 1].fatigue > 7) ? 'text-rose-400' : (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].fatigue != null && wellnessHistory[wellnessHistory.length - 1].fatigue > 4) ? 'text-amber-400' : 'text-emerald-400', 
              bg: (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].fatigue != null && wellnessHistory[wellnessHistory.length - 1].fatigue > 7) ? 'bg-rose-500/10' : (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].fatigue != null && wellnessHistory[wellnessHistory.length - 1].fatigue > 4) ? 'bg-amber-500/10' : 'bg-emerald-500/10', 
              trend: 'stable', 
              alert: (wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].fatigue != null && wellnessHistory[wellnessHistory.length - 1].fatigue > 7) ? 'Fadiga Alta' : null 
            },
            { 
              label: 'Disponibilidade', 
              value: clinicalSessionData?.priorityOutput.adjustedDecision === 'hold' ? 'HOLD' : 
                     clinicalSessionData?.priorityOutput.adjustedDecision === 'recovery' ? 'Recovery' :
                     clinicalSessionData?.priorityOutput.adjustedDecision === 'modified_train' ? 'Restrição' : 
                     'Apto', 
              icon: ShieldCheck, 
              color: clinicalSessionData?.priorityOutput.adjustedDecision === 'hold' ? 'text-rose-400' : 
                     clinicalSessionData?.priorityOutput.adjustedDecision === 'recovery' ? 'text-amber-400' :
                     clinicalSessionData?.priorityOutput.adjustedDecision === 'modified_train' ? 'text-indigo-400' : 
                     'text-emerald-400', 
              bg: clinicalSessionData?.priorityOutput.adjustedDecision === 'hold' ? 'bg-rose-500/10' : 
                  clinicalSessionData?.priorityOutput.adjustedDecision === 'recovery' ? 'bg-amber-500/10' :
                  clinicalSessionData?.priorityOutput.adjustedDecision === 'modified_train' ? 'bg-indigo-500/10' : 
                  'bg-emerald-500/10', 
              trend: 'stable' 
            },
          ].map((card, i) => (
            <Card key={i} className={`bg-slate-900/40 border-slate-800/50 shadow-lg group hover:border-slate-700 transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden ${card.alert ? 'ring-1 ring-rose-500/30' : ''}`}>
              {card.alert && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-rose-500 animate-pulse" />
              )}
              <CardContent className="p-2 flex flex-col items-center text-center">
                <div className={`p-1 ${card.bg} rounded-lg mb-1.5`}>
                  <card.icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
                <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-0.5">{card.label}</p>
                <p className={`text-base font-black tracking-tight ${card.color}`}>{card.value}</p>
                
                {card.alert ? (
                  <div className="mt-1.5 w-full pt-1.5 border-t border-rose-500/20 flex flex-col items-center gap-0.5">
                    <span className="text-xxs font-black text-rose-500 uppercase tracking-widest animate-pulse">{card.alert}</span>
                  </div>
                ) : (
                  <div className="mt-1.5 w-full pt-1.5 border-t border-slate-800/50 flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-1">
                      {card.trend === 'up' && <ArrowUpRight className="w-2 h-2 text-emerald-500" />}
                      {card.trend === 'down' && <ArrowDownRight className="w-2 h-2 text-rose-500" />}
                      <span className="text-xxs font-bold text-slate-600 uppercase tracking-tighter">Tendência</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 2. Painel Clínico & Diagnóstico */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-cyan-500" />
            Painel Clínico & Diagnóstico
          </h2>
          
          <Card className="bg-slate-900/40 border-slate-800/50 shadow-2xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col items-center">
                  <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-6">Mapa de Reabilitação & Risco</p>
                  <div className="w-full">
                    <PainMap 
                      value={(() => {
                        const baseValue = wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].soreness_location && wellnessHistory[wellnessHistory.length - 1].soreness_location !== 'Nenhuma' ? 
                          (typeof wellnessHistory[wellnessHistory.length - 1].soreness_location === 'string' ? 
                            { [wellnessHistory[wellnessHistory.length - 1].soreness_location]: { level: wellnessHistory[wellnessHistory.length - 1].pain || 5, type: 'muscle' } } : 
                            wellnessHistory[wellnessHistory.length - 1].soreness_location
                          ) : {};
                        
                        // Add phases to priority regions for visualization
                        const enhancedValue = { ...baseValue };
                        sportProfile.priorityRegions.forEach(region => {
                          if (!enhancedValue[region.id]) {
                            enhancedValue[region.id] = { level: 0, type: 'prevention', phase: getRegionPhase(region.id) };
                          } else {
                            enhancedValue[region.id].phase = getRegionPhase(region.id);
                          }
                        });
                        return enhancedValue;
                      })()} 
                      readOnly={true} 
                      onPartClick={(part) => setSelectedClinicalRegion({ id: part.id, label: part.label })}
                      selectedPartId={selectedClinicalRegion?.id}
                    />
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: 'Aguda', color: 'bg-rose-500' },
                      { label: 'Subaguda', color: 'bg-amber-500' },
                      { label: 'Funcional', color: 'bg-cyan-500' },
                      { label: 'Retorno', color: 'bg-emerald-500' }
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <AnimatePresence mode="wait">
                    {selectedClinicalRegion ? (
                      <div className="relative">
                        <button 
                          onClick={() => setSelectedClinicalRegion(null)}
                          className="absolute -top-2 -right-2 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full border border-slate-700 shadow-xl z-10 transition-all active:scale-95"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <ClinicalEvolutionPanel 
                          key={selectedClinicalRegion.id}
                          regionName={selectedClinicalRegion.label}
                          data={generateRegionEvolution(selectedClinicalRegion.id)}
                          riskScore={calculateRiskScore(selectedClinicalRegion.id)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Priority Regions Card */}
                        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black text-white uppercase tracking-tight">Regiões Prioritárias ({sportProfile.name})</span>
                            <span className="text-xxs text-cyan-500 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Monitoramento Ativo
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {priorityRegions.map(region => {
                              const phase = getRegionPhase(region.id);
                              const riskScore = calculateRiskScore(region.id);
                              
                              const phaseColor = 
                                phase === 'Aguda' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                                phase === 'Subaguda' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                                phase === 'Funcional' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' :
                                'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                              
                              const riskColor = 
                                riskScore >= 70 ? 'text-rose-500' :
                                riskScore >= 40 ? 'text-amber-500' :
                                'text-emerald-500';

                              return (
                                <button
                                  key={region.id}
                                  onClick={() => setSelectedClinicalRegion({ id: region.id, label: region.label })}
                                  className="flex items-center justify-between p-2.5 bg-slate-900/50 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-all group"
                                >
                                  <div className="flex flex-col items-start">
                                    <span className="text-xxs font-bold text-slate-300 uppercase group-hover:text-white transition-colors">{region.label}</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-xxs font-black text-slate-500 uppercase tracking-tighter">Risco:</span>
                                      <span className={`text-xxs font-black uppercase ${riskColor}`}>{riskScore}%</span>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-xxs font-black uppercase border ${phaseColor}`}>
                                    {phase}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black text-white uppercase tracking-tight">Resumo Evolutivo</span>
                            <span className="text-xxs text-slate-500 font-bold">Geral</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg border border-slate-800/50">
                              <span className="text-xxs font-bold text-slate-400 uppercase">Status de Dor</span>
                              <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" /> -15% esta semana
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg border border-slate-800/50">
                              <span className="text-xxs font-bold text-slate-400 uppercase">Ganho de Força</span>
                              <span className="text-xs font-black text-cyan-400 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +8% esta semana
                              </span>
                            </div>
                          </div>
                        </div>

                        {wellnessHistory.length > 0 && (wellnessHistory[wellnessHistory.length - 1].symptoms?.length > 0 || wellnessHistory[wellnessHistory.length - 1].pain > 0) ? (
                          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-black text-white uppercase tracking-tight">Sintomas Detectados</span>
                              <span className="text-xxs text-slate-500 font-bold">{wellnessHistory[wellnessHistory.length - 1].date}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {wellnessHistory[wellnessHistory.length - 1].pain > 0 && (
                                <span className={`px-3 py-1 rounded-full text-xxs font-black uppercase tracking-widest ${wellnessHistory[wellnessHistory.length - 1].pain >= 7 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : wellnessHistory[wellnessHistory.length - 1].pain >= 4 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                  Dor: {wellnessHistory[wellnessHistory.length - 1].pain}/10
                                </span>
                              )}
                              {wellnessHistory[wellnessHistory.length - 1].symptoms?.map((symptom: string) => (
                                <span key={symptom} className="px-3 py-1 rounded-full text-xxs font-black uppercase tracking-widest bg-slate-800 text-slate-300 border border-slate-700">
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center">
                            <Activity className="w-8 h-8 text-slate-700 mb-3" />
                            <p className="text-xxs font-black text-slate-600 uppercase tracking-widest">Selecione uma região para análise detalhada</p>
                          </div>
                        )}
                      </div>
                    )}
                  </AnimatePresence>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Cor da Urina (Hidratação)</p>
                          <p className="text-xs text-slate-300 font-medium">
                            {wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].urine_color ? (
                              wellnessHistory[wellnessHistory.length - 1].urine_color === 1 ? "Muito clara" :
                              wellnessHistory[wellnessHistory.length - 1].urine_color === 2 ? "Clara" :
                              wellnessHistory[wellnessHistory.length - 1].urine_color === 3 ? "Amarelo claro" :
                              wellnessHistory[wellnessHistory.length - 1].urine_color === 4 ? "Amarelo escuro" :
                              "Âmbar / muito escura"
                            ) : "Não informada"}
                          </p>
                        </div>
                        {wellnessHistory.length > 0 && wellnessHistory[wellnessHistory.length - 1].urine_color && (
                          <div className={`w-4 h-4 rounded-full ${
                            wellnessHistory[wellnessHistory.length - 1].urine_color === 1 ? "bg-cyan-200" :
                            wellnessHistory[wellnessHistory.length - 1].urine_color === 2 ? "bg-yellow-200" :
                            wellnessHistory[wellnessHistory.length - 1].urine_color === 3 ? "bg-yellow-400" :
                            wellnessHistory[wellnessHistory.length - 1].urine_color === 4 ? "bg-amber-500" :
                            "bg-orange-700"
                          }`} />
                        )}
                      </div>

                      {trendAlerts.length > 0 && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                          <p className="text-xxs font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> Alertas de Tendência
                          </p>
                          <ul className="space-y-1">
                            {trendAlerts.map((alert, idx) => (
                              <li key={idx} className="text-xs text-amber-200/80 font-medium flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span> {alert}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {(() => {
                        const latest = wellnessHistory.length > 0 ? wellnessHistory[wellnessHistory.length - 1] : null;
                        let conduta = "Aguardando dados";
                        let explicacao = "Sem dados recentes de wellness para definir conduta.";
                        let color = "slate";

                        if (latest) {
                          const hasCriticalTrend = trendAlerts.some(a => a.includes('Queda de sono') || a.includes('Prontidão em queda progressiva') || a.includes('Aumento sequencial de dor'));

                          if (latest.readiness < 50 || latest.pain >= 7) {
                            conduta = "Avaliar Imediatamente";
                            explicacao = latest.pain >= 7 ? "Dor severa relatada." : "Queda crítica de prontidão.";
                            if (hasCriticalTrend) explicacao += " Tendência negativa confirmada.";
                            color = "rose";
                          } else if (latest.readiness < 70 || latest.pain >= 4 || latest.fatigue > 7 || latest.sleep < 6 || latest.urine_color >= 4 || trendAlerts.length > 0) {
                            conduta = "Reduzir Carga / Monitorar";
                            const reasons = [];
                            if (latest.readiness < 70) reasons.push("prontidão em atenção");
                            if (latest.pain >= 4) reasons.push("dor moderada");
                            if (latest.fatigue > 7) reasons.push("fadiga alta");
                            if (latest.sleep < 6) reasons.push("sono insuficiente");
                            if (latest.urine_color >= 4) reasons.push("possível desidratação");
                            
                            if (trendAlerts.length > 0) {
                                reasons.push(...trendAlerts.map(t => t.toLowerCase()));
                            }
                            
                            explicacao = reasons.join(", ") + ".";
                            explicacao = explicacao.charAt(0).toUpperCase() + explicacao.slice(1);
                            color = "amber";
                          } else {
                            conduta = "Treino Normal";
                            explicacao = "Métricas de recuperação e prontidão adequadas.";
                            color = "emerald";
                          }
                        }

                        return (
                          <div className={`p-4 bg-${color}-500/5 border border-${color}-500/20 rounded-xl`}>
                            <p className={`text-xxs font-black text-${color}-500 uppercase tracking-widest mb-2`}>Conduta Prioritária</p>
                            <p className={`text-sm font-bold text-white mb-1`}>{conduta}</p>
                            <p className="text-xs text-slate-400 font-medium italic">{explicacao}</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. AI Summary & Menstrual Cycle (Insights) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {wellnessHistory.length > 0 ? (
            <Card className="bg-cyan-500/5 border-cyan-500/20 shadow-xl overflow-hidden relative group h-full">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-24 h-24 text-cyan-500" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <h3 className="text-xxs font-black text-cyan-500 uppercase tracking-widest">Resumo Inteligente (AI)</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-base text-slate-300 leading-relaxed font-medium">
                    O atleta apresenta um status de prontidão de <span className="text-cyan-400 font-bold">{wellnessHistory[wellnessHistory.length - 1].readiness != null ? `${wellnessHistory[wellnessHistory.length - 1].readiness}%` : 'Não informado'}</span> com base no último registro de <span className="text-slate-400">{wellnessHistory[wellnessHistory.length - 1].date}</span>.
                    {wellnessHistory[wellnessHistory.length - 1].sleep != null && (
                      <> O registro de sono indica <span className="text-amber-400 font-bold">{wellnessHistory[wellnessHistory.length - 1].sleep}h</span>.</>
                    )}
                  </p>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-xxs font-black text-emerald-400 uppercase tracking-widest mb-2">Recomendação Clínica</p>
                    <p className="text-sm text-emerald-100 font-medium">
                      Manter monitoramento diário e ajustar carga conforme percepção de esforço e recuperação.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-900/20 border-slate-800/50 border-dashed shadow-xl flex flex-col items-center justify-center p-12 text-center h-full">
              <BrainCircuit className="w-12 h-12 text-slate-800 mb-4" />
              <h3 className="text-xxs font-black text-slate-600 uppercase tracking-widest mb-2">Aguardando Dados</h3>
              <p className="text-xs text-slate-500 max-w-[12.5rem]">Inicie o monitoramento wellness para gerar insights inteligentes.</p>
            </Card>
          )}

          {athlete.gender === 'F' ? (
            <Card className="bg-slate-900/40 border-slate-800/50 shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4">
                <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-pink-500" />
                  Monitoramento de Ciclo Menstrual
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-pink-500/5 border border-pink-500/20 rounded-xl">
                    <div>
                      <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Status Atual (Hoje)</p>
                      <p className="text-lg font-black text-pink-400 uppercase tracking-tight">
                        {wellnessHistory[wellnessHistory.length - 1]?.menstrual_cycle || 'Não Informado'}
                      </p>
                    </div>
                    <Droplets className="w-8 h-8 text-pink-500/40" />
                  </div>
                  
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-3">Histórico Recente</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {wellnessHistory.length > 0 ? (
                        wellnessHistory.slice(-7).map((w, idx) => (
                          <div key={idx} className="flex-shrink-0 w-16 text-center">
                            <p className="text-xxs font-bold text-slate-600 mb-1">{w.date}</p>
                            <div className={`h-6 rounded flex items-center justify-center text-xxs font-black uppercase ${
                              w.menstrual_cycle ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-slate-800 text-slate-600'
                            }`}>
                              {w.menstrual_cycle ? w.menstrual_cycle.substring(0, 3) : '-'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xxs text-slate-600 italic py-2">Nenhum registro encontrado.</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="hidden lg:block" /> // Placeholder to keep AI summary on the left
          )}
        </div>

        {/* 4. Monitoring trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-slate-900/40 border-slate-800/50 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4">
              <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                Evolução Wellness & Prontidão
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[13.75rem] w-full">
                <SafeRender componentName="WellnessHistoryChart">
                  <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wellnessHistory}>
                    <defs>
                      <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="readiness" name="Prontidão" stroke="#22d3ee" strokeWidth={3} fill="url(#colorReadiness)" />
                    <Line type="monotone" dataKey="sleep" name="Sono" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="fatigue" name="Fadiga" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </SafeRender>
            </div>
          </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800/50 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4">
              <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                Evolução da Dor (NPS)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[13.75rem] w-full">
                <SafeRender componentName="PainEvolutionChart">
                  <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={painData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                      itemStyle={{ color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '0.625rem', textTransform: 'uppercase' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="dor" 
                      name="Nível de Dor"
                      stroke="#f43f5e" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#0f172a' }}
                      activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </SafeRender>
            </div>
          </CardContent>
          </Card>
        </div>

        {/* 4. Advanced Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Readiness Gauge & ACWR */}
          <Card className="bg-slate-900/40 border-slate-800/50 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Carga de Trabalho & Prontidão
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xxs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-500/20">
                  ACWR: 1.05
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-8">
                {/* Readiness Gauge */}
                <div className="flex items-center justify-around py-2">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-800"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={339.3}
                        strokeDashoffset={339.3 - (339.3 * (athlete.readiness || 0)) / 100}
                        strokeLinecap="round"
                        className="text-cyan-500 transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white tracking-tighter">{athlete.readiness}%</span>
                      <span className="text-xxs font-black text-slate-500 uppercase tracking-widest">Prontidão</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Sono: 85%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                      <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Fadiga: 60%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Estresse: 90%</p>
                    </div>
                  </div>
                </div>

                {/* ACWR Chart */}
                <div className="h-[10rem] w-full">
                  <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-2 text-center">Relação Carga Aguda:Crônica (ACWR)</p>
                  <SafeRender componentName="ACWRChart">
                    <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={wellnessHistory.length > 0 ? wellnessHistory.slice(-7).map(w => ({
                      day: w.date.split('/')[0],
                      acute: w.readiness * 5,
                      chronic: w.readiness * 4.8,
                      ratio: 1.05
                    })) : []}>
                      {wellnessHistory.length > 0 ? (
                        <>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="day" stroke="#475569" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                          <YAxis yAxisId="left" stroke="#475569" fontSize={8} fontWeight="bold" tickLine={false} axisLine={false} hide />
                          <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={8} fontWeight="bold" tickLine={false} axisLine={false} domain={[0, 2]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.75rem' }}
                            itemStyle={{ fontSize: '0.625rem', fontWeight: 'bold' }}
                          />
                          <Bar yAxisId="left" dataKey="acute" name="Carga Aguda" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={15} />
                          <Line yAxisId="right" type="monotone" dataKey="ratio" name="ACWR" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                        </>
                      ) : null}
                    </ComposedChart>
                  </ResponsiveContainer>
                </SafeRender>
              </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Performance Evolution */}
          <Card className="bg-slate-900/40 border-slate-800/50 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-4 h-4 text-cyan-500" />
                Evolução de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                <div className="h-[12.5rem] w-full">
                  <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-4 text-center">Força & Potência (Salto Vertical)</p>
                  <SafeRender componentName="PhysicalAssessmentChart">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={clinicalAssessments.filter(a => a.assessment_type === 'physical').map(a => ({
                      date: new Date(a.assessment_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                      value: a.score
                    }))}>
                      {clinicalAssessments.filter(a => a.assessment_type === 'physical').length > 0 ? (
                        <>
                          <defs>
                            <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="date" stroke="#475569" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                          <YAxis stroke="#475569" fontSize={8} fontWeight="bold" tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.75rem' }}
                            itemStyle={{ fontSize: '0.625rem', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="value" name="CMJ (cm)" stroke="#22d3ee" strokeWidth={3} fill="url(#colorPerf)" />
                        </>
                      ) : null}
                    </AreaChart>
                  </ResponsiveContainer>
                </SafeRender>
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Melhora (30 dias)</p>
                    <p className="text-sm font-black text-slate-600">--%</p>
                  </div>
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">Status Atual</p>
                    <p className="text-sm font-black text-slate-600">--</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Alerts and Condutas */}
        <Card className="bg-slate-900/40 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)] overflow-hidden mt-6">
          <CardHeader className="border-b border-rose-500/20 bg-rose-500/5 px-6 py-4">
            <CardTitle className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Alertas & Condutas Orientadas (IA)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Alertas */}
              <div className="space-y-4">
                <h3 className="text-xxs font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <BellRing className="w-3 h-3" />
                  Alertas Ativos Principais
                </h3>
                {athleteAlerts.filter(a => a.status === 'active').length > 0 ? (
                  <ul className="space-y-2">
                    {athleteAlerts.filter(a => a.status === 'active').slice(0, 4).map(alert => (
                      <li key={alert.id} className="flex items-start gap-2 bg-slate-950/50 p-3 rounded-xl border border-rose-500/20 shadow-sm">
                        <span className="text-rose-500 mt-0.5">•</span>
                        <div className="flex-1">
                          <span className="text-xs text-rose-100 font-medium">{alert.message}</span>
                          <p className="text-[10px] text-rose-500/50 uppercase font-black tracking-widest mt-1">{(alert.priority || 'Medium')} Priority</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                   <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex items-center gap-3">
                     <CheckCircle className="w-5 h-5 text-emerald-500/50" />
                     <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest">Nenhum alerta crítico ativo</p>
                   </div>
                )}
              </div>

              {/* Condutas */}
              <div className="space-y-4">
                <h3 className="text-xxs font-black text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Stethoscope className="w-3 h-3" />
                  Condutas Recentes (IA)
                </h3>
                {clinicalAssessments?.find(a => a.assessment_type === 'postural')?.raw_data?.ai_actions ? (
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-cyan-500/20 text-xs text-cyan-100 whitespace-pre-wrap leading-relaxed shadow-sm font-medium">
                    {clinicalAssessments.find(a => a.assessment_type === 'postural')?.raw_data?.ai_actions}
                  </div>
                ) : (
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-500 whitespace-pre-wrap leading-relaxed flex items-center justify-center">
                    <p className="font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 opacity-50" />
                      Sem condutas geradas por IA (Avalie a postura).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )}
  </div>
)}

    {activeTab === 'ficha' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                <User className="w-6 h-6 text-cyan-500" />
                Ficha Cadastral
              </h2>
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase tracking-widest text-xs px-6 py-2 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                Editar Ficha
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Dados Pessoais */}
              <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl">
                <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4">
                  <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-500" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Nome Completo</p>
                    <p className="text-sm font-medium text-white">{athlete.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Apelido</p>
                      <p className="text-sm font-medium text-white">{athlete.nickname || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">RG</p>
                      <p className="text-sm font-medium text-white">{athlete.rg || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">CPF</p>
                      <p className="text-sm font-medium text-white">{athlete.cpf || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Data de Nascimento</p>
                      <p className="text-sm font-medium text-white">
                        {athlete.birthDate || athlete.birth_date ? new Date(athlete.birthDate || athlete.birth_date || '').toLocaleDateString('pt-BR') : '-'}
                      </p>
                      {(athlete.birthDate || athlete.birth_date) && (
                        <p className="text-xxs font-bold text-cyan-500 uppercase tracking-widest mt-1">
                          {(() => {
                            const age = calculateDetailedAge(athlete.birthDate || athlete.birth_date);
                            if (!age) return '';
                            return `${age.years} anos, ${age.months} meses e ${age.days} dias`;
                          })()}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Sexo</p>
                      <p className="text-sm font-medium text-white">{athlete.gender === 'M' ? 'Masculino' : athlete.gender === 'F' ? 'Feminino' : '-'}</p>
                    </div>
                    {athlete.group_name && (
                      <div>
                        <p className="text-xxs font-bold text-cyan-500 uppercase tracking-widest mb-1">Projeto / Equipe</p>
                        <p className="text-sm font-black text-cyan-400 uppercase tracking-tight">{athlete.group_name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Dados Esportivos */}
              <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl">
                <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4">
                  <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-cyan-500" />
                    Dados Esportivos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Modalidade</p>
                      <p className="text-sm font-medium text-white">
                        {athlete.modalidade === 'Volleyball' && language === 'pt' ? 'Vôlei' : (athlete.modalidade || '-')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Clube</p>
                      <p className="text-sm font-medium text-white">{athlete.club || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Categoria</p>
                      <p className="text-sm font-medium text-white">{athlete.category}</p>
                    </div>
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Posição</p>
                      <p className="text-sm font-medium text-white">{athlete.position || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Peso</p>
                      <p className="text-sm font-medium text-white">{athlete.weight ? `${athlete.weight} kg` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Altura</p>
                      <p className="text-sm font-medium text-white">{athlete.height ? `${athlete.height} cm` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Dominância</p>
                      <p className="text-sm font-medium text-white">{athlete.dominance || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados de Contato */}
              <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl">
                <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4">
                  <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-4 h-4 text-cyan-500" />
                    Dados de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Telefone</p>
                      <p className="text-sm font-medium text-white">{athlete.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p>
                      <p className="text-sm font-medium text-white break-all" title={athlete.email}>{athlete.email || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço */}
              <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl">
                <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4">
                  <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-500" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Logradouro</p>
                    <p className="text-sm font-medium text-white">
                      {athlete.address?.logradouro ? (
                        <>
                          {athlete.address.logradouro}, {athlete.addressNumber || 'S/N'}
                          {athlete.addressComplement ? ` - ${athlete.addressComplement}` : ''}
                          <br />
                          {athlete.address.bairro} - {athlete.address.localidade}/{athlete.address.uf}
                          <br />
                          CEP: {athlete.cep}
                        </>
                      ) : '-'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Acesso ao Sistema */}
              <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl border-cyan-500/20">
                <CardHeader className="border-b border-slate-800/50 bg-cyan-500/5 px-6 py-4">
                  <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-500" />
                    Acesso ao Sistema (Wellness)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Email de Acesso</p>
                    <p className="text-sm font-medium text-white break-all">{athlete.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Senha Gerada</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-cyan-400 tracking-widest bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
                        {athlete.password || 'Não gerada'}
                      </p>
                      {!athlete.password && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={handleGeneratePassword}
                          disabled={isGeneratingPassword}
                          className="h-8 px-2 text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10 gap-1.5"
                        >
                          {isGeneratingPassword ? (
                            <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5" />
                          )}
                          <span className="text-xxs font-black uppercase tracking-widest">Gerar</span>
                        </Button>
                      )}
                    </div>
                    <p className="text-xxs text-slate-500 uppercase tracking-widest mt-2">Esta senha é gerada automaticamente pelo sistema.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Informações Médicas & Emergência */}
              <Card className="bg-slate-900/40 border-slate-800/50 shadow-xl md:col-span-2 lg:col-span-3">
                <CardHeader className="border-b border-slate-800/50 bg-slate-900/20 px-6 py-4">
                  <CardTitle className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Informações Médicas & Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-xxs font-black text-cyan-500 uppercase tracking-widest border-b border-slate-800 pb-2">Plano de Saúde</h4>
                      <div>
                        <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Convênio</p>
                        <p className="text-sm font-medium text-white">{athlete.convenio || '-'}</p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Carteirinha</p>
                          <p className="text-sm font-medium text-white">{athlete.carteirinha || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Hospital Pref.</p>
                          <p className="text-sm font-medium text-white">{athlete.hospital || '-'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xxs font-black text-cyan-500 uppercase tracking-widest border-b border-slate-800 pb-2">Alergias & Medicações</h4>
                      <div>
                        <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Possui Alergia?</p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700">
                          <div className={`w-1.5 h-1.5 rounded-full ${athlete.hasAllergy ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                          <span className="text-xs font-bold text-white uppercase tracking-widest">{athlete.hasAllergy ? 'Sim' : 'Não'}</span>
                        </div>
                      </div>
                      {athlete.hasAllergy && (
                        <div>
                          <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Descrição da Alergia</p>
                          <p className="text-sm font-medium text-rose-400">{athlete.alergiaDesc || '-'}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xxs font-black text-cyan-500 uppercase tracking-widest border-b border-slate-800 pb-2">Contato de Emergência / Responsável</h4>
                      <div>
                        <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Nome do Responsável</p>
                        <p className="text-sm font-medium text-white">{athlete.guardianName || '-'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Telefone</p>
                          <p className="text-sm font-medium text-white">{athlete.guardianPhone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">CPF</p>
                          <p className="text-sm font-medium text-white">{athlete.guardianCpf || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</p>
                        <p className="text-sm font-medium text-white truncate" title={athlete.guardianEmail}>{athlete.guardianEmail || '-'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'clinical' && (
          <div className="space-y-8">
            {/* Global Assessment Score Card */}
            {globalAssessmentScore !== null && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col items-center justify-center shrink-0 space-y-3 p-6 bg-slate-900/80 rounded-[2rem] border border-slate-800/50 shadow-inner min-w-[200px]">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">Score Geral<br/>de Avaliações</p>
                  <div className="relative flex items-center justify-center w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="56" className="stroke-slate-800" strokeWidth="12" fill="none" />
                      <circle 
                        cx="64" cy="64" r="56" 
                        strokeWidth="12" fill="none" 
                        strokeDasharray={351.8} 
                        strokeDashoffset={351.8 - (351.8 * globalAssessmentScore) / 100}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ease-out ${globalAssessmentScore < 60 ? 'stroke-rose-500' : globalAssessmentScore < 80 ? 'stroke-amber-500' : 'stroke-cyan-500'}`}
                      />
                    </svg>
                    <span className="absolute text-4xl font-black text-white">{globalAssessmentScore}</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-6 z-10">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-cyan-400" />
                      Resumo Clínico Estruturado
                    </h3>
                    <p className="text-sm text-slate-400">Padronização dos dados encontrados nas últimas avaliações clínicas e físicas realizadas.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {assessmentAlerts.length > 0 ? (
                      <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Alertas Recentes das Avaliações</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {assessmentAlerts.map((alert, i) => (
                            <div key={i} className="flex gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl items-start">
                              <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-slate-300 leading-snug">{alert.message}</p>
                                <p className="text-[9px] font-black uppercase text-slate-500 mt-1">{translateKey(alert.type, language)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl">
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-bold">Nenhum alerta ativo nas avaliações recentes.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Clinical Alerts Section */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-500" />
                {language === "pt" ? "Alertas Clínicos" : "Clinical Alerts"}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {athleteAlerts.filter(a => a.status === 'active').length === 0 ? (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500/20 mb-2" />
                    <p className="text-emerald-500/60 text-xxs font-black uppercase tracking-widest">Nenhum alerta ativo</p>
                  </div>
                ) : (
                  athleteAlerts.filter(a => a.status === 'active').map(alert => (
                    <Card key={alert.id} className={`bg-slate-900/40 border-slate-800/50 shadow-xl ${alert.severity === 'high' ? 'border-l-4 border-l-rose-500' : alert.severity === 'medium' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-blue-500'}`}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 p-2 rounded-lg ${alert.severity === 'high' ? 'bg-rose-500/10 text-rose-500' : alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{alert.message}</p>
                            <p className="text-xxs text-slate-500 uppercase font-black mt-1">
                              Gerado em {new Date(alert.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={async () => {
                            const { resolveClinicalAlert } = await import("@/lib/clinical");
                            await resolveClinicalAlert(alert.id);
                            // Refresh alerts
                            if (supabase) {
                              const { data } = await supabase.from('clinical_alerts').select('*').eq('athlete_id', athlete.id).order('created_at', { ascending: false });
                              if (data) setAthleteAlerts(data);
                            }
                          }}
                          className="h-8 text-xxs font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                        >
                          Resolver
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}

                {athleteAlerts.filter(a => a.status === 'resolved').length > 0 && (
                  <div className="pt-4 border-t border-slate-800/50">
                    <h3 className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <History className="w-3 h-3" />
                      Histórico Resolvido
                    </h3>
                    <div className="space-y-2 opacity-60">
                      {athleteAlerts.filter(a => a.status === 'resolved').slice(0, 5).map(alert => (
                        <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-900/20 border border-slate-800/30 rounded-xl">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-3 h-3 text-emerald-500/40" />
                            <span className="text-xs text-slate-400">{alert.message}</span>
                          </div>
                          <span className="text-xxs font-bold text-slate-600 uppercase">
                            Resolvido em {new Date(alert.resolved_at!).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-cyan-500" />
                Avaliações & Testes
              </h2>
            </div>

            {activeAssessment === 'list' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'sleep', label: 'Avaliação do Sono', description: 'Monitoramento de recuperação e higiene do sono.', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { id: 'orthopedic', label: 'Avaliação Ortopédica', description: 'Screening funcional, mapeamento de dor e histórico.', icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                  { id: 'biomechanical', label: t('bio.title'), description: 'Análise de movimento e risco de lesão.', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  { id: 'physical', label: t('phys.title'), description: t('phys.desc'), icon: Weight, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { id: 'postural', label: t('postural.title'), description: t('postural.desc'), icon: Columns, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { id: 'functional', label: t('func.title'), description: t('func.desc'), icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { id: 'strength', label: t('dyna.title'), description: t('dyna.desc'), icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { id: 'neurological', label: 'Avaliação Neurológica', description: 'Baseline e Rastreio de Concussão.', icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  { id: 'psychological', label: 'Avaliação Psicológica', description: 'Prontidão Mental e Risco Comportamental.', icon: BrainCircuit, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { id: 'nutritional', label: 'Avaliação Nutricional', description: 'Hábitos Alimentares e Energia.', icon: Apple, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { id: 'reds', label: 'Avaliação RED-S', description: 'Risco de Deficiência Relativa de Energia.', icon: ActivitySquare, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                  { id: 'anthropometric', label: 'Avaliação Antropométrica', description: 'Composição Corporal e Proporção.', icon: Scale, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  { id: 'maturation', label: 'Avaliação de Maturação', description: 'Estágio de Maturação Biológica e PHV.', icon: PersonStanding, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { id: 'menstrual', label: 'Avaliação Menstrual', description: 'Saúde Hormonal e Ciclo Menstrual.', icon: Droplets, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                  { id: 'hydration', label: 'Avaliação de Hidratação', description: 'Status de Hidratação e Recuperação.', icon: Droplet, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                ].map((item) => (
                  <Card 
                    key={item.id} 
                    onClick={() => (item.id === 'postural' ? setShowPosturalModal(true) : setActiveAssessment(item.id as any))}
                    className="bg-slate-900/40 border-slate-800/50 shadow-xl group hover:border-slate-700 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">{item.label}</h3>
                      <p className="text-xxs text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
                        {item.description}
                      </p>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-xxs font-black text-cyan-500 uppercase tracking-widest">Iniciar Avaliação</span>
                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeAssessment !== 'list' && (
              <div className="fixed inset-0 z-[100] bg-[#020617] overflow-y-auto pointer-events-auto">
                <div className="p-4 sm:p-6 md:p-8 pt-[calc(max(env(safe-area-inset-top),_2rem)+2rem)] sm:pt-6 w-full max-w-7xl mx-auto space-y-6 min-h-screen">

            {activeAssessment === 'biomechanical' && (
              <BiomechanicalAssessment 
                athleteId={athlete.id} 
                language={language}
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('biomechanical', data);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'sleep' && (
              <SleepAssessment 
                athleteId={athlete.id} 
                onBack={() => setActiveAssessment('list')}
                onSave={async (score, data) => {
                  try {
                    await saveAssessment('sleep', data, score);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'orthopedic' && (
              <OrthopedicAssessment 
                athleteId={athlete.id}
                athleteName={athlete.name}
                onBack={() => setActiveAssessment('list')}
                onSave={async (score, data) => {
                  try {
                    await saveAssessment('orthopedic', data, score);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'physical' && (
              <PhysicalAssessment 
                athleteId={athlete.id} 
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('physical', data);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'functional' && (
              <FunctionalScreening 
                athleteId={athlete.id} 
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('functional', data, data.score_total, data.risk_level);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'strength' && (
              <DynamometryAssessment 
                athleteId={athlete.id} 
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('strength', data);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'neurological' && (
              <NeurologicalAssessment 
                athleteId={athlete.id} 
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('neurological', data, data.score, data.classification);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'psychological' && (
              <PsychologicalAssessment 
                athleteId={athlete.id} 
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('psychological', data, data.score, data.classification);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'nutritional' && (
              <NutritionalAssessmentForm 
                athleteId={athlete.id} 
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('nutritional', data, data.score, data.classification);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'reds' && (
              <RedSAssessmentForm 
                athleteId={athlete.id} 
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('reds', data, data.score, data.classification);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'anthropometric' && (
              <AnthropometricAssessmentForm 
                athlete={athlete}
                previousAssessments={clinicalAssessments}
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('anthropometric', data, data.score, data.classification);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'maturation' && (
              <MaturationAssessmentForm 
                athleteId={athlete.id} 
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('maturation', data, data.score, data.classification);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'menstrual' && (
              <MenstrualAssessmentForm 
                athleteId={athlete.id} 
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('menstrual', data, data.score, data.classification);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

            {activeAssessment === 'hydration' && (
              <HydrationAssessmentForm 
                athleteId={athlete.id} 
                onCancel={() => setActiveAssessment('list')}
                onSave={async (data) => {
                  try {
                    await saveAssessment('hydration', data, data.score, data.classification);
                    setActiveAssessment('list');
                  } catch (error) {
                    // Error handled in saveAssessment
                  }
                }} 
              />
            )}

                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attachments' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-cyan-500" />
                Documentos e Exames
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 md:flex-none">
                  <input 
                    type="text"
                    placeholder="Buscar documento..."
                    value={attachmentSearch}
                    onChange={(e) => setAttachmentSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors w-full md:w-48"
                  />
                </div>
                <select
                  value={attachmentFilter}
                  onChange={(e) => setAttachmentFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                >
                  <option value="Todos">Todas Categorias</option>
                  {ATTACHMENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    const { data: buckets } = await supabase.storage.listBuckets();
                    console.log("All buckets:", buckets);

                    const { data, error } = await supabase.storage.from('avatars').list();
                    console.log("All files in 'avatars' bucket root:", data);
                    if (error) console.error("Error listing 'avatars' bucket:", error);
                    
                    const { data: attData, error: attError } = await supabase.storage.from('avatars').list('attachments');
                    console.log("All folders in 'attachments/' folder:", attData);
                    if (attError) console.error("Error listing 'attachments/' folder:", attError);

                    const { data: athleteData, error: athleteError } = await supabase.storage.from('avatars').list(`attachments/${athlete.id}`);
                    console.log(`Files in 'attachments/${athlete.id}/' folder:`, athleteData);
                    if (athleteError) console.error(`Error listing 'attachments/${athlete.id}/' folder:`, athleteError);
                  }}
                  className="border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800"
                  title="Debug Storage"
                >
                  <Code className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    // Trigger a re-fetch by updating a dummy state or just calling the fetch logic
                    // For simplicity, let's just reload the page or re-run the effect if we can
                    // Actually, I'll add a fetchAttachments function and call it
                    window.location.reload();
                  }}
                  className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Atualizar lista"
                >
                  <RefreshCcw className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => {
                    setVersionGroupIdForNewVersion(null);
                    setShowAttachmentUpload(true);
                  }} 
                  className="bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase text-xxs tracking-widest"
                >
                  <Plus className="w-4 h-4 mr-2" /> Novo Anexo
                </Button>
              </div>
            </div>

            {isUsingAttachmentFallback && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xxs font-black text-amber-500 uppercase tracking-widest">Modo de Segurança Ativo</p>
                  <p className="text-xxs text-amber-200/70 font-medium leading-relaxed">
                    As tabelas de banco de dados não foram encontradas. Os arquivos estão sendo listados diretamente do armazenamento, 
                    por isso a filtragem por categoria e versões podem estar limitadas. Execute as migrações SQL para normalizar.
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attachments
                .filter(file => {
                  const docName = file.document_name || file.file_name || '';
                  const matchesSearch = docName.toLowerCase().includes(attachmentSearch.toLowerCase());
                  const matchesCategory = attachmentFilter === 'Todos' || file.category === attachmentFilter;
                  return matchesSearch && matchesCategory;
                }).length === 0 ? (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                    <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                      <FileText className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 font-medium">Nenhum anexo encontrado</p>
                    <p className="text-slate-500 text-xs mt-1">Clique em &quot;Novo Anexo&quot; para enviar um documento</p>
                  </div>
                ) : (
                  attachments
                    .filter(file => {
                      const docName = file.document_name || file.file_name || '';
                      const matchesSearch = docName.toLowerCase().includes(attachmentSearch.toLowerCase());
                      const matchesCategory = attachmentFilter === 'Todos' || file.category === attachmentFilter;
                      return matchesSearch && matchesCategory;
                    })
                    .map(file => (
                      <Card key={file.id} className="bg-slate-900/40 border-slate-800/50 shadow-xl group hover:border-cyan-500/30 transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-[#050B14] transition-all">
                              <FileText size={24} />
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => {
                                  setSelectedAttachment(file);
                                  setShowAttachmentPreview(true);
                                }}
                                className="p-2 text-slate-500 hover:text-cyan-400 transition-colors"
                                title="Visualizar"
                              >
                                <Eye size={18} />
                              </button>
                              <a 
                                href={file.file_url} 
                                download={file.document_name || file.file_name}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                                title="Baixar"
                              >
                                <Download size={18} />
                              </a>
                              <button 
                                onClick={() => {
                                  setEditingAttachment(file);
                                  setShowEditAttachmentModal(true);
                                }}
                                className="p-2 text-slate-500 hover:text-cyan-400 transition-colors"
                                title="Editar"
                              >
                                <PenTool size={18} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate" title={file.document_name || file.file_name}>
                                {file.document_name || file.file_name}
                              </h3>
                              <span className="text-xxs font-black bg-slate-800 text-slate-400 uppercase tracking-widest px-1.5 py-0.5 rounded border border-slate-700">
                                v{file.version_number || 1}
                              </span>
                            </div>
                            <span className="text-xxs font-black text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-md">
                              {file.category}
                            </span>
                          </div>

                          <p className="text-xxs text-slate-500 uppercase tracking-widest font-bold mb-4">
                            {file.mime_type?.split('/')[1]?.toUpperCase() || file.file_type?.toUpperCase() || 'ARQUIVO'} • {(file.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/50">
                            <span className="text-xxs text-slate-500 uppercase tracking-widest">
                              {new Date(file.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => {
                                  setVersionGroupIdForNewVersion(file.version_group_id);
                                  setShowAttachmentUpload(true);
                                }}
                                className="text-xxs font-black text-cyan-500 uppercase tracking-widest hover:text-cyan-400 transition-colors"
                              >
                                Nova Versão
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedAttachment(file);
                                  setShowAttachmentHistory(true);
                                }}
                                className="text-xxs font-black text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors"
                              >
                                Histórico
                              </button>
                              <button 
                                onClick={() => setConfirmDeleteAttachment(file)}
                                disabled={isDeletingAttachment === file.id}
                                className="text-xxs font-black text-rose-400 uppercase tracking-widest hover:text-rose-300 transition-colors disabled:opacity-50"
                              >
                                {isDeletingAttachment === file.id ? 'Excluindo...' : 'Excluir'}
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
            </div>
          </div>
        )}

        {activeTab === 'prontuario' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-500" />
                Prontuário Eletrônico
              </h2>
                <Button onClick={() => { 
                  setShowSignatureStep(false); 
                  setNoteForm({
                    pain: 2,
                    feeling: 'Igual',
                    regions: [] as string[],
                    treatments: [] as string[],
                    obs: '',
                    suggestionMatch: 'Yes',
                    tagAdjustments: clinicalTags.map(t => ({ id: t.id, action: 'keep' as const })),
                    newTags: []
                  });
                  setShowClinicalNoteModal(true); 
                }} className="bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase text-xxs tracking-widest">
                <Plus className="w-4 h-4 mr-2" /> Nova Evolução
              </Button>
            </div>
            <div className="space-y-4">
              {prontuarioNotes.map(note => (
                <Card key={note.id} className="bg-slate-900/40 border-slate-800/50 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <Clock className="w-4 h-4" /> {note.date}
                      </div>
                      <div className="flex items-center gap-2">
                        {note.signed && (
                          <div className="flex items-center gap-1 text-emerald-400 text-xxs font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 mr-2">
                            <Check className="w-3 h-3" /> Assinado
                          </div>
                        )}
                        <button 
                          onClick={() => handleEditNote(note)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PenTool className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteNote(note.id)}
                          disabled={isDeletingNote === note.id}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">{note.text}</p>
                    <div className="border-t border-slate-800/50 pt-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                        <PenTool className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{note.professional}</p>
                        <p className="text-xxs text-slate-500 uppercase tracking-widest">Fisioterapeuta Responsável</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {prontuarioNotes.length === 0 && (
                <div className="text-center py-12 bg-slate-900/20 border border-slate-800/50 rounded-3xl">
                  <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum registro encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-500" />{language === "pt" ? "Histórico de Avaliações" : "Assessment History"}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Total: {clinicalAssessments.length}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/20 shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800/50">
                    <th className="px-6 py-4 text-xxs font-black text-slate-500 uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-xxs font-black text-slate-500 uppercase tracking-widest">Avaliação</th>
                    <th className="px-6 py-4 text-xxs font-black text-slate-500 uppercase tracking-widest">Score / Resultado</th>
                    <th className="px-6 py-4 text-xxs font-black text-slate-500 uppercase tracking-widest">Classificação</th>
                    <th className="px-6 py-4 text-xxs font-black text-slate-500 uppercase tracking-widest">Fonte</th>
                    <th className="px-6 py-4 text-xxs font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {clinicalAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
                            <ClipboardList size={24} />
                          </div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nenhuma avaliação encontrada</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    clinicalAssessments.map((assessment) => (
                      <tr 
                        key={assessment.id} 
                        className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                        onClick={() => setSelectedAssessment(assessment)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">
                              {new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="text-xxs text-slate-500 font-medium">
                              {new Date(assessment.assessment_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-[#050B14] transition-all">
                              <Activity size={16} />
                            </div>
                            <span className="text-xs font-black text-white uppercase tracking-tight">
                              {assessment.assessment_type === 'sleep' ? 'Sono' :
                               assessment.assessment_type === 'orthopedic' ? 'Ortopédica' :
                               assessment.assessment_type === 'biomechanical' ? 'Biomecânica' :
                               assessment.assessment_type === 'physical' ? 'Física' :
                               assessment.assessment_type === 'functional' ? 'Funcional' :
                               assessment.assessment_type === 'strength' ? 'Dinamometria' :
                               assessment.assessment_type === 'neurological' ? 'Neurológica' :
                               assessment.assessment_type === 'psychological' ? 'Psicológica' :
                               assessment.assessment_type === 'nutritional' ? 'Nutricional' :
                               assessment.assessment_type === 'reds' ? 'RED-S' :
                               assessment.assessment_type === 'anthropometric' ? 'Antropométrica' :
                               assessment.assessment_type === 'maturation' ? 'Maturação' :
                               assessment.assessment_type === 'menstrual' ? 'Menstrual' :
                               assessment.assessment_type === 'hydration' ? 'Hidratação' : assessment.assessment_type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-cyan-400 tracking-tight">
                            {assessment.score !== null && assessment.score !== undefined ? assessment.score : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {assessment.classification ? (
                            <span className={`text-xxs font-black px-2 py-1 rounded uppercase tracking-widest border ${
                              assessment.classification_color === 'emerald-500' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              assessment.classification_color === 'amber-500' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              assessment.classification_color === 'rose-500' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              assessment.classification === 'Baixo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              assessment.classification === 'Médio' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              assessment.classification === 'Alto' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {assessment.classification}
                            </span>
                          ) : (
                            <span className="text-xxs font-bold text-slate-600 uppercase tracking-widest">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest">
                            {assessment.source_table || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAssessment(assessment);
                              }}
                            >
                              <ArrowUpRight size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteAssessment({ id: assessment.id, source_table: assessment.source_table });
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Assessment Detail Modal */}
      <AnimatePresence>
        {selectedAssessment && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0A1120] border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-cyan-500/10 rounded-xl">
                    <ClipboardList className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{language === "pt" ? "Detalhes da Avaliação" : "Assessment Details"}</h3>
                    <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest">
                      {new Date(selectedAssessment.assessment_date).toLocaleDateString('pt-BR')} {new Date(selectedAssessment.assessment_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedAssessment(null)}
                  className="rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Content */}
              <div ref={reportRef} data-report-container="true" className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50">
                    <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">{language === "pt" ? "Tipo" : "Type"}</p>
                    <p className="text-sm font-bold text-white uppercase">
                      {language === "pt" ? (
                       selectedAssessment.assessment_type === 'sleep' ? 'Sono' :
                       selectedAssessment.assessment_type === 'orthopedic' ? 'Ortopédica' :
                       selectedAssessment.assessment_type === 'biomechanical' ? 'Biomecânica' :
                       selectedAssessment.assessment_type === 'physical' ? 'Física' :
                       selectedAssessment.assessment_type === 'functional' ? 'Funcional' :
                       selectedAssessment.assessment_type === 'strength' ? 'Dinamometria' :
                       selectedAssessment.assessment_type === 'neurological' ? 'Neurológica' :
                       selectedAssessment.assessment_type === 'psychological' ? 'Psicológica' :
                       selectedAssessment.assessment_type === 'nutritional' ? 'Nutricional' :
                       selectedAssessment.assessment_type === 'reds' ? 'RED-S' :
                       selectedAssessment.assessment_type === 'anthropometric' ? 'Antropométrica' :
                       selectedAssessment.assessment_type === 'maturation' ? 'Maturação' :
                       selectedAssessment.assessment_type === 'menstrual' ? 'Menstrual' :
                       selectedAssessment.assessment_type === 'hydration' ? 'Hidratação' : selectedAssessment.assessment_type
                      ) : (
                       selectedAssessment.assessment_type === 'sleep' ? 'Sleep' :
                       selectedAssessment.assessment_type === 'orthopedic' ? 'Orthopedic' :
                       selectedAssessment.assessment_type === 'biomechanical' ? 'Biomechanical' :
                       selectedAssessment.assessment_type === 'physical' ? 'Physical' :
                       selectedAssessment.assessment_type === 'functional' ? 'Functional' :
                       selectedAssessment.assessment_type === 'strength' ? 'Dynamometry' :
                       selectedAssessment.assessment_type === 'neurological' ? 'Neurological' :
                       selectedAssessment.assessment_type === 'psychological' ? 'Psychological' :
                       selectedAssessment.assessment_type === 'nutritional' ? 'Nutritional' :
                       selectedAssessment.assessment_type === 'reds' ? 'RED-S' :
                       selectedAssessment.assessment_type === 'anthropometric' ? 'Anthropometric' :
                       selectedAssessment.assessment_type === 'maturation' ? 'Maturation' :
                       selectedAssessment.assessment_type === 'menstrual' ? 'Menstrual' :
                       selectedAssessment.assessment_type === 'hydration' ? 'Hydration' : selectedAssessment.assessment_type
                      )}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50">
                    <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">{language === "pt" ? "Classificação" : "Classification"}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedAssessment.classification_color === 'emerald-500' ? 'bg-emerald-500' :
                        selectedAssessment.classification_color === 'amber-500' ? 'bg-amber-500' :
                        selectedAssessment.classification_color === 'rose-500' ? 'bg-rose-500' :
                        selectedAssessment.classification === 'Baixo' ? 'bg-emerald-500' :
                        selectedAssessment.classification === 'Médio' ? 'bg-amber-500' :
                        selectedAssessment.classification === 'Alto' ? 'bg-rose-500' : 'bg-slate-500'
                      }`} />
                      <p className="text-sm font-bold text-white uppercase">{translateValue(selectedAssessment.classification, language) || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Score */}
                {selectedAssessment.score !== null && (
                  <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-between">
                    <div>
                      <p className="text-xxs font-black text-cyan-500 uppercase tracking-widest mb-1">{language === "pt" ? "Pontuação Final" : "Final Score"}</p>
                      <p className="text-2xl font-black text-white">{selectedAssessment.score}</p>
                    </div>
                    <Activity className="w-8 h-8 text-cyan-500/20" />
                  </div>
                )}

                {/* Data Details */}
                <div className="space-y-4">
                  <h4 className="text-xxs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">{language === "pt" ? "Dados Detalhados" : "Detailed Data"}</h4>
                  
                  {selectedAssessment.assessment_type === 'postural' ? (
                    <div className="w-full flex flex-col gap-4 mt-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {(selectedAssessment.raw_data || selectedAssessment.data)?.frontal?.url && (
                          <PosturalAnalysisTool 
                            label={language === 'pt' ? "Visão Frontal" : "Frontal View"} 
                            imageUrl={(selectedAssessment.raw_data || selectedAssessment.data).frontal.url} 
                            onImageChange={() => {}} 
                            segments={(selectedAssessment.raw_data || selectedAssessment.data).frontal.segments || []} 
                            onSegmentsChange={() => {}} 
                            availableSegmentDefinitions={FRONTAL_SEGMENTS}
                            readOnly 
                          />
                        )}
                        {(selectedAssessment.raw_data || selectedAssessment.data)?.dorsal?.url && (
                          <PosturalAnalysisTool 
                            label={language === 'pt' ? "Visão Dorsal" : "Dorsal View"} 
                            imageUrl={(selectedAssessment.raw_data || selectedAssessment.data).dorsal.url} 
                            onImageChange={() => {}} 
                            segments={(selectedAssessment.raw_data || selectedAssessment.data).dorsal.segments || []} 
                            onSegmentsChange={() => {}} 
                            availableSegmentDefinitions={FRONTAL_SEGMENTS}
                            readOnly 
                          />
                        )}
                        {(selectedAssessment.raw_data || selectedAssessment.data)?.lateralR?.url && (
                          <PosturalAnalysisTool 
                            label={language === 'pt' ? "Lateral Direita" : "Right Lateral"} 
                            imageUrl={(selectedAssessment.raw_data || selectedAssessment.data).lateralR.url} 
                            onImageChange={() => {}} 
                            segments={(selectedAssessment.raw_data || selectedAssessment.data).lateralR.segments || []} 
                            onSegmentsChange={() => {}} 
                            availableSegmentDefinitions={LATERAL_SEGMENTS}
                            readOnly 
                          />
                        )}
                        {(selectedAssessment.raw_data || selectedAssessment.data)?.lateralL?.url && (
                          <PosturalAnalysisTool 
                            label={language === 'pt' ? "Lateral Esquerda" : "Left Lateral"} 
                            imageUrl={(selectedAssessment.raw_data || selectedAssessment.data).lateralL.url} 
                            onImageChange={() => {}} 
                            segments={(selectedAssessment.raw_data || selectedAssessment.data).lateralL.segments || []} 
                            onSegmentsChange={() => {}} 
                            availableSegmentDefinitions={LATERAL_SEGMENTS}
                            readOnly 
                          />
                        )}
                      </div>
                      
                      {(selectedAssessment.raw_data || selectedAssessment.data)?.notes && (
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mt-4">
                          <p className="text-xs text-slate-400 font-medium">Notas da Avaliação</p>
                          <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{(selectedAssessment.raw_data || selectedAssessment.data).notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <AssessmentVisualizer 
                      data={selectedAssessment.raw_data || selectedAssessment.data} 
                      type={selectedAssessment.assessment_type} 
                      language={language} 
                      selectedAssessment={selectedAssessment} 
                    />
                  )}
                </div>

                {/* Clinical Report */}
                {selectedAssessment.clinical_report && (
                  <div className="space-y-4">
                    <h4 className="text-xxs font-black text-cyan-400 uppercase tracking-widest border-b border-cyan-900/30 pb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      {language === "pt" ? "Relatório Clínico" : "Clinical Report"}
                    </h4>
                    <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/50 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                      {selectedAssessment.clinical_report}
                    </div>
                  </div>
                )}

                {/* Clinical Alerts */}
                {selectedAssessment.clinical_alerts && selectedAssessment.clinical_alerts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xxs font-black text-amber-400 uppercase tracking-widest border-b border-amber-900/30 pb-2 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      {language === "pt" ? "Alertas Clínicos" : "Clinical Alerts"}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedAssessment.clinical_alerts.map((alert: any, idx: number) => (
                        <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border ${
                          alert.type === 'danger' ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' :
                          alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
                          'bg-cyan-500/10 border-cyan-500/20 text-cyan-200'
                        }`}>
                          <div className={`mt-0.5 p-1 rounded-md ${
                            alert.type === 'danger' ? 'bg-rose-500/20' :
                            alert.type === 'warning' ? 'bg-amber-500/20' :
                            'bg-cyan-500/20'
                          }`}>
                            {alert.type === 'danger' ? <X className="w-3 h-3" /> : 
                             alert.type === 'warning' ? <AlertCircle className="w-3 h-3" /> : 
                             <Info className="w-3 h-3" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold leading-tight">{alert.message}</p>
                            <p className="text-xxs font-black uppercase tracking-widest mt-1 opacity-50">Prioridade: {alert.priority}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {selectedAssessment.alerts && selectedAssessment.alerts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xxs font-black text-rose-400 uppercase tracking-widest border-b border-rose-900/30 pb-2">Alertas Detectados</h4>
                    <div className="space-y-2">
                      {selectedAssessment.alerts.map((alert: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          <span className="text-xs font-bold text-rose-200 uppercase tracking-tight">{alert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <Button 
                  onClick={exportToPDF}
                  disabled={isGeneratingPdf}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-xxs h-10 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  {isGeneratingPdf ? (
                    <>
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      Exportar PDF
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => setSelectedAssessment(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-xxs h-10 px-8 rounded-xl"
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      



      </main>

      {/* Postural Assessment Modal */}
      <PosturalAssessmentModal
        athleteId={athlete.id}
        isOpen={showPosturalModal}
        onClose={() => setShowPosturalModal(false)}
        supabase={supabase}
        onSaveSuccess={() => {
          fetchAllAssessmentsData(athlete.id).then(refreshedData => {
            setClinicalAssessments(refreshedData);
          });
        }}
        language={language}
      />

      {/* Fast Clinical Note Modal */}
      <AnimatePresence>
        {showClinicalNoteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0A1120] border border-slate-800 w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col shadow-2xl max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-xl">
                    <Plus className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{editingNoteId ? 'Editar Evolução' : 'Evolução Rápida'}</h3>
                    <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Registro de sessão simplificado</p>
                  </div>
                </div>
                <button onClick={() => {
                  setShowClinicalNoteModal(false);
                  setEditingNoteId(null);
                }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                {!showSignatureStep ? (
                  <>
                    {/* 1. AUTO-CONTEXT: Clinical Summary */}
                    <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-cyan-500" /> Contexto da Sessão
                        </h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                          riskCfg.color.replace('text-', 'bg-').replace('400', '500/20')
                        } ${riskCfg.color}`}>
                          Risco: {athlete.riskLevel || 'Baixo'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Top Risk Cluster</p>
                          <p className="text-xs font-bold text-slate-300">
                            {clinicalSessionData?.clusters?.[0]?.label || 'Estável'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Objetivo IA</p>
                          <p className="text-xs font-bold text-slate-300">
                            {clinicalSessionData?.decisionMode === 'Conservative' ? 'Conservador (🛡️ Proteção)' : 'Agressivo (⚡ Performance)'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tags Ativas</p>
                          <div className="flex flex-wrap gap-1.5">
                            {clinicalTags.length > 0 ? clinicalTags.map((t, i) => (
                              <span key={i} className="text-[8px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                {t.tag}
                              </span>
                            )) : (
                              <span className="text-[9px] text-slate-600 italic">Sem tags ativas</span>
                            )}
                          </div>
                        </div>
                        <div className="pt-1">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Sugestões Aplicadas</p>
                          <div className="flex flex-wrap gap-1.5">
                            {clinicalSessionData?.interventions && clinicalSessionData.interventions.length > 0 ? clinicalSessionData.interventions.slice(0, 3).map((inv, idx) => (
                              <span key={idx} className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                                {inv}
                              </span>
                            )) : (
                              <span className="text-[9px] text-slate-600 italic">Nenhuma sugestão gerada</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. SYSTEM VALIDATION */}
                    <div className="space-y-4">
                      <h4 className="text-xxs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Brain className="w-3 h-3 text-purple-500" /> Validação da Sugestão
                      </h4>
                      <div className="bg-slate-900/50 p-1 rounded-xl border border-slate-800/50 flex">
                        {[
                          { val: 'Yes', label: 'Sim', color: 'bg-emerald-500' },
                          { val: 'Partially', label: 'Parcialmente', color: 'bg-amber-500' },
                          { val: 'No', label: 'Não', color: 'bg-rose-500' }
                        ].map(opt => (
                          <button
                            key={opt.val}
                            onClick={() => setNoteForm({...noteForm, suggestionMatch: opt.val as any})}
                            className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                              noteForm.suggestionMatch === opt.val 
                                ? `${opt.color} text-slate-950 shadow-lg` 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. RESPONSE BLOCK & Pain */}
                    <div className="space-y-4">
                      <h4 className="text-xxs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History className="w-3 h-3 text-cyan-500" /> Resposta Imediata
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Feeling */}
                        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
                          {[
                            { val: 'Pior', color: 'bg-rose-500' },
                            { val: 'Igual', color: 'bg-slate-500' },
                            { val: 'Melhor', color: 'bg-emerald-500' }
                          ].map(opt => (
                            <button
                              key={opt.val}
                              onClick={() => setNoteForm({...noteForm, feeling: opt.val})}
                              className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                noteForm.feeling === opt.val 
                                  ? `${opt.color} text-[#050B14] shadow-lg` 
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                            >
                              {opt.val}
                            </button>
                          ))}
                        </div>
                        {/* Pain Slider */}
                        <div className="flex flex-col justify-center px-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xxs font-bold text-slate-500 uppercase">Nível de Dor (EVA)</span>
                            <span className={`text-lg font-black ${noteForm.pain > 6 ? 'text-rose-400' : noteForm.pain > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {noteForm.pain}
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="10" 
                            value={noteForm.pain}
                            onChange={(e) => setNoteForm({...noteForm, pain: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                          <div className="flex justify-between text-xxs font-bold text-slate-600 mt-1">
                            <span>0 (Sem Dor)</span>
                            <span>10 (Máxima)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. TAG ADJUSTMENT Section */}
                    <div className="space-y-3">
                      <h4 className="text-xxs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Tag className="w-3 h-3 text-purple-400" /> Ajuste de Tags Clínicas
                      </h4>
                      <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4 space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {clinicalTags.map(tag => {
                            const adj = noteForm.tagAdjustments.find(a => a.id === tag.id);
                            const action = adj?.action || 'keep';
                            return (
                              <div key={tag.id} className="flex items-center gap-1">
                                <span className={`px-2.5 py-1.5 rounded-l-lg text-[10px] font-black uppercase tracking-widest border-y border-l transition-all ${
                                  action === 'remove' 
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 opacity-50 line-through' 
                                    : action === 'reinforce'
                                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                                }`}>
                                  {tag.tag}
                                </span>
                                <div className="flex border-y border-r border-slate-700 rounded-r-lg overflow-hidden h-full">
                                  <button
                                    onClick={() => setNoteForm(prev => ({
                                      ...prev,
                                      tagAdjustments: prev.tagAdjustments.map(a => 
                                        a.id === tag.id ? { ...a, action: a.action === 'reinforce' ? 'keep' : 'reinforce' } : a
                                      )
                                    }))}
                                    className={`p-1.5 hover:bg-purple-500/20 transition-all ${action === 'reinforce' ? 'bg-purple-500 text-white' : 'text-slate-500'}`}
                                    title="Reforçar"
                                  >
                                    <TrendingUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setNoteForm(prev => ({
                                      ...prev,
                                      tagAdjustments: prev.tagAdjustments.map(a => 
                                        a.id === tag.id ? { ...a, action: a.action === 'remove' ? 'keep' : 'remove' } : a
                                      )
                                    }))}
                                    className={`p-1.5 hover:bg-rose-500/20 transition-all ${action === 'remove' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}
                                    title="Remover"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Adicionar nova tag..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/30 transition-all"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = e.currentTarget.value.trim();
                                if (val && !noteForm.newTags.includes(val)) {
                                  setNoteForm(prev => ({ ...prev, newTags: [...prev.newTags, val] }));
                                  e.currentTarget.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                        {noteForm.newTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {noteForm.newTags.map(tag => (
                              <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                {tag}
                                <button onClick={() => setNoteForm(prev => ({ ...prev, newTags: prev.newTags.filter(t => t !== tag) }))}>
                                  <X className="w-3 h-3 hover:text-white" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Regions Section */}
                    <div className="space-y-3">
                      <h4 className="text-xxs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Regiões Tratadas
                      </h4>
                      <div className="space-y-4">
                        {REGIONS_GROUPS.map(group => (
                          <div key={group.name}>
                            <h5 className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-2">{group.name}</h5>
                            <div className="flex flex-wrap gap-2">
                              {group.items.map(region => {
                                const isSelected = noteForm.regions.includes(region);
                                return (
                                  <button
                                    key={region}
                                    onClick={() => {
                                      setNoteForm(prev => ({
                                        ...prev,
                                        regions: isSelected 
                                          ? prev.regions.filter(r => r !== region)
                                          : [...prev.regions, region]
                                      }))
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                      isSelected 
                                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                                    }`}
                                  >
                                    {region}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Treatments Section */}
                    <div className="space-y-3">
                      <h4 className="text-xxs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Stethoscope className="w-3 h-3" /> Condutas Realizadas
                      </h4>
                      <div className="space-y-4">
                        {TREATMENTS_GROUPS.map(group => (
                          <div key={group.name}>
                            <h5 className="text-xxs font-bold text-slate-500 uppercase tracking-widest mb-2">{group.name}</h5>
                            <div className="flex flex-wrap gap-2">
                              {group.items.map(treatment => {
                                const isSelected = noteForm.treatments.includes(treatment);
                                return (
                                  <button
                                    key={treatment}
                                    onClick={() => {
                                      setNoteForm(prev => ({
                                        ...prev,
                                        treatments: isSelected 
                                          ? prev.treatments.filter(t => t !== treatment)
                                          : [...prev.treatments, treatment]
                                      }))
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                      isSelected 
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3" />}
                                    {treatment}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Observations Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xxs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <FileText className="w-3 h-3" /> Observações Adicionais (Opcional)
                        </h4>
                        <button 
                          onClick={toggleListening}
                          className={`text-xxs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                            isListening 
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' 
                              : 'bg-cyan-500/10 text-cyan-400 border border-transparent hover:bg-cyan-500/20'
                          }`}
                        >
                          {isListening ? (
                            <>
                              <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                              Ouvindo... (Clique p/ parar)
                            </>
                          ) : (
                            <>
                              <Mic className="w-3 h-3" /> Ditar por Voz
                            </>
                          )}
                        </button>
                      </div>
                      <textarea 
                        value={noteForm.obs}
                        onChange={(e) => setNoteForm({...noteForm, obs: e.target.value})}
                        placeholder="Detalhes específicos da sessão, evolução de carga, etc..."
                        className="w-full h-24 bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-3">
                      <FileText className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-1">Texto Técnico Gerado</h4>
                        <p className="text-xxs font-bold text-cyan-500/70 uppercase tracking-widest">Revise o documento antes de assinar digitalmente. Você pode editar o texto livremente.</p>
                      </div>
                    </div>
                    <textarea 
                      value={generatedNote}
                      onChange={(e) => setGeneratedNote(e.target.value)}
                      className="w-full h-64 bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none leading-relaxed"
                    />
                  </div>
                )}
              </div>

              <div className="p-5 bg-slate-900/80 border-t border-slate-800 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => {
                  if (showSignatureStep && !editingNoteId) setShowSignatureStep(false);
                  else {
                    setShowClinicalNoteModal(false);
                    setEditingNoteId(null);
                  }
                }} className="text-slate-400 hover:text-white font-bold uppercase text-xxs tracking-widest">
                  {showSignatureStep && !editingNoteId ? 'Voltar' : 'Cancelar'}
                </Button>
                
                {!showSignatureStep ? (
                  <Button 
                    onClick={() => {
                      const regionsText = noteForm.regions.length > 0 ? noteForm.regions.join(', ') : 'regiões não especificadas';
                      const treatmentsText = noteForm.treatments.length > 0 ? noteForm.treatments.join(', ') : 'condutas não especificadas';
                      
                      const riskContext = clinicalSessionData?.insight?.riskLabel ? `inserido em um contexto de risco clínico [${clinicalSessionData.insight.riskLabel.toUpperCase()}]` : 'com estabilidade clínica';
                      const objectiveContext = clinicalSessionData?.decisionMode === 'Conservative' ? 'Cuidado Moderado (foco em recuperação e prevenção)' : 'Performance Total (foco em manutenção de carga e progressão)';
                      const validationContext = noteForm.suggestionMatch === 'Yes' ? 'total adesão à realidade clínica' : noteForm.suggestionMatch === 'Partially' ? 'ajustes pontuais necessários' : 'divergência observada na prática';

                      const clustersContext = clinicalSessionData?.clusters && clinicalSessionData.clusters.length > 0 
                        ? `
Os principais clusters de risco identificados no momento: ${clinicalSessionData.clusters.map(c => c.label).join(', ')}.` 
                        : '';

                      let treatmentsReasoning = '';
                      if (noteForm.treatments.length > 0) {
                        treatmentsReasoning = `Estas intervenções foram escolhidas com o objetivo de ${clinicalSessionData?.decisionMode === 'Conservative' ? 'mitigar os riscos agudos, controlar o quadro álgico e promover recuperação tecidual' : 'manter a prontidão muscular, tolerância à carga e otimização biomecânica'}, alinhando-se diretamente ao objetivo principal da sessão de ${objectiveContext}.`;
                      }

                      const adjustments = noteForm.tagAdjustments.filter(a => a.action !== 'keep');
                      const tagContext = adjustments.length > 0 || noteForm.newTags.length > 0
                        ? `
📍 ATUALIZAÇÃO DE TAGS:
${adjustments.map(a => `${a.action === 'remove' ? '[-] Remover' : '[+] Reforçar'} "${clinicalTags.find(t => t.id === a.id)?.tag}"`).join('; ')}${noteForm.newTags.length > 0 ? `; [+] Adicionar: ${noteForm.newTags.join(', ')}` : ''}`
                        : '';

                      const text = `🎯 CONTEXTO CLÍNICO & OBJETIVO:
Paciente ${riskContext}. O objetivo da sessão é ${objectiveContext}.${clustersContext}
✅ VALIDAÇÃO DO SISTEMA: Sugestão da IA apresentou ${validationContext}.

📊 SUBJETIVO / RESPOSTA DO PACIENTE:
Paciente compareceu à sessão fisioterapêutica relatando estar se sentindo ${noteForm.feeling.toLowerCase()}, apresentando quadro álgico de intensidade ${noteForm.pain}/10 na Escala Visual Analógica (EVA).

🛠️ CONDUTAS & RACIOCÍNIO CLÍNICO:
- Regiões Alvo: ${regionsText}.
- Intervenções Aplicadas: ${treatmentsText}.
${treatmentsReasoning}${tagContext}

${noteForm.obs ? `📝 OBSERVAÇÕES ADICIONAIS:
${noteForm.obs}` : ''}`;
                      
                      setGeneratedNote(text);
                      setShowSignatureStep(true);
                    }}
                    className="bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase text-xxs tracking-widest px-8"
                  >
                    Gerar Texto Técnico <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={async () => {
                      const professionalName = "Dra. Cristina Jorge - CREFITO 3/252531-F";
                      
                      if (supabase) {
                        try {
                          if (editingNoteId) {
                            const { error } = await supabase
                              .from('clinical_notes')
                              .update({
                                generated_text: generatedNote,
                                pain_level: noteForm.pain,
                                feeling: noteForm.feeling,
                                regions: noteForm.regions,
                                treatments: noteForm.treatments,
                                observations: noteForm.obs,
                                is_signed: true
                              })
                              .eq('id', editingNoteId);
                              
                            if (error) throw error;
                            
                            setProntuarioNotes(prev => prev.map(n => 
                              n.id === editingNoteId 
                                ? { ...n, text: generatedNote, signed: true, pain_level: noteForm.pain, feeling: noteForm.feeling, regions: noteForm.regions, treatments: noteForm.treatments, observations: noteForm.obs }
                                : n
                            ));
                          } else {
                            const { data, error } = await supabase
                              .from('clinical_notes')
                              .insert([
                                {
                                  athlete_id: athlete.id,
                                  note_date: new Date().toISOString(),
                                  pain_level: noteForm.pain,
                                  feeling: noteForm.feeling,
                                  regions: noteForm.regions,
                                  treatments: noteForm.treatments,
                                  observations: noteForm.obs,
                                  generated_text: generatedNote,
                                  is_signed: true,
                                  professional_name: professionalName
                                }
                              ])
                              .select();
                              
                            if (error) throw error;

                            // Update clinicalTags based on adjustments
                            const updatedTags = [...clinicalTags];
                            noteForm.tagAdjustments.forEach(adj => {
                              if (adj.action === 'remove') {
                                const idx = updatedTags.findIndex(t => t.id === adj.id);
                                if (idx !== -1) updatedTags.splice(idx, 1);
                              } else if (adj.action === 'reinforce') {
                                const tag = updatedTags.find(t => t.id === adj.id);
                                if (tag) tag.weight = (tag.weight || 1) + 0.2;
                              }
                            });
                            noteForm.newTags.forEach(tagName => {
                              updatedTags.push({
                                id: Math.random().toString(36).substr(2, 9),
                                tag: tagName,
                                created_at: new Date().toISOString(),
                                weight: 1.0,
                                source: 'clinical'
                              });
                            });
                            setClinicalTags(updatedTags);
                            
                            if (data && data.length > 0) {
                              const newNote = {
                                id: data[0].id,
                                date: new Date(data[0].note_date || data[0].created_at).toLocaleString('pt-BR'),
                                text: data[0].generated_text || data[0].observations || '',
                                signed: data[0].is_signed,
                                professional: data[0].professional_name,
                                pain_level: data[0].pain_level,
                                feeling: data[0].feeling,
                                regions: data[0].regions,
                                treatments: data[0].treatments,
                                observations: data[0].observations
                              };
                              setProntuarioNotes([newNote, ...prontuarioNotes]);
                              setNotification({ message: 'Evolução salva com sucesso!', type: 'success' });
                            }
                          }
                        } catch (error) {
                          console.error('Error saving clinical note:', error);
                          setNotification({ message: "Erro ao salvar evolução.", type: 'error' });
                        }
                      } else {
                        // Fallback for no-db mode
                        const newNote = {
                          id: editingNoteId || Date.now().toString(),
                          date: new Date().toLocaleString('pt-BR'),
                          text: generatedNote,
                          signed: true,
                          professional: professionalName,
                          pain_level: noteForm.pain,
                          feeling: noteForm.feeling,
                          regions: noteForm.regions,
                          treatments: noteForm.treatments,
                          observations: noteForm.obs
                        };
                        if (editingNoteId) {
                          setProntuarioNotes(prev => prev.map(n => n.id === editingNoteId ? newNote : n));
                        } else {
                          setProntuarioNotes([newNote, ...prontuarioNotes]);
                        }
                      }
                      
                      setShowClinicalNoteModal(false);
                      setEditingNoteId(null);
                      setShowSignatureStep(false);
                      setActiveTab('prontuario');
                      setNoteForm({ pain: 2, feeling: 'Melhor', regions: [], treatments: [], obs: '' });
                      setGeneratedNote('');
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-[#050B14] font-black uppercase text-xxs tracking-widest px-8"
                  >
                    <PenTool className="w-4 h-4 mr-2" /> Assinar e Salvar
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#0A1120] border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <QrCode className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-widest">Identidade</h2>
                    <p className="text-xxs font-bold text-slate-500 uppercase tracking-tighter">Código do Atleta</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowQrModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 flex flex-col items-center justify-center space-y-6">
                <div className="bg-slate-900/50 p-4 rounded-2xl shadow-inner border border-slate-800/50">
                  <QRCodeSVG 
                    value={JSON.stringify({
                      id: athlete.id,
                      athlete_code: athlete.athlete_code,
                      name: athlete.name
                    })}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{athlete.name}</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <span className="text-2xl font-black text-amber-500 tracking-widest">#{athlete.athlete_code}</span>
                    <button 
                      onClick={handleCopyCode}
                      className="p-2 text-amber-500 hover:bg-amber-500/20 rounded-lg transition-colors"
                      title="Copiar Código"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="bg-[#0A1120]/80 border-t border-slate-800/50 p-6 text-center">
        <p className="text-xxs font-bold text-slate-600 uppercase tracking-[0.3em]">
          EARS High Performance Clinical Monitoring • v2.0
        </p>
      </footer>

      {/* Edit Athlete Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
            onClick={() => {
              if (isDirty) {
                setShowConfirmDialog(true);
              } else {
                setIsEditModalOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-5xl bg-[#050B14] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 overflow-y-auto relative">
                <AthleteRegistration 
                  initialData={athlete}
                  onDirtyChange={setIsDirty}
                  onBack={() => {
                    if (isDirty) {
                      setShowConfirmDialog(true);
                    } else {
                      setIsEditModalOpen(false);
                    }
                  }}
                  onSave={(data) => {
                    setIsDirty(false);
                    setIsEditModalOpen(false);
                    if (onSave) {
                      onSave({
                        ...athlete,
                        ...data,
                        age: data.birthDate ? new Date().getFullYear() - new Date(data.birthDate).getFullYear() : athlete.age,
                        category: data.categoria || athlete.category,
                        sport: data.modalidade || athlete.sport,
                        position: data.posicao || athlete.position,
                      });
                    }
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog 
        isOpen={showConfirmDialog}
        onConfirm={() => {
          setShowConfirmDialog(false);
          setIsDirty(false);
          setIsEditModalOpen(false);
        }}
        onCancel={() => setShowConfirmDialog(false)}
      />

      <ConfirmDialog 
        isOpen={!!confirmDeleteAssessment}
        title={language === "pt" ? "Excluir Avaliação" : "Delete Assessment"}
        description={language === "pt" ? "Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita." : "Are you sure you want to delete this assessment? This action cannot be undone."}
        confirmText={language === "pt" ? "Excluir" : "Delete"}
        loading={isDeletingAssessment}
        onConfirm={handleDeleteAssessment}
        onCancel={() => setConfirmDeleteAssessment(null)}
      />

      <ConfirmDialog 
        isOpen={!!confirmDeleteNote}
        title="Excluir Registro"
        description="Tem certeza que deseja excluir este registro do prontuário? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        loading={!!isDeletingNote}
        onConfirm={() => confirmDeleteNote && handleDeleteNote(confirmDeleteNote)}
        onCancel={() => setConfirmDeleteNote(null)}
      />

      <ConfirmDialog 
        isOpen={!!confirmDeleteAttachment}
        title="Excluir Anexo"
        description="Tem certeza que deseja excluir este anexo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        loading={!!isDeletingAttachment}
        onConfirm={() => confirmDeleteAttachment && handleDeleteAttachment(confirmDeleteAttachment)}
        onCancel={() => setConfirmDeleteAttachment(null)}
      />

      <AttachmentUploadForm 
        isOpen={showAttachmentUpload}
        onClose={() => {
          setShowAttachmentUpload(false);
          setVersionGroupIdForNewVersion(null);
        }}
        onUpload={handleUploadAttachment}
        isUploading={isUploadingAttachment}
        versionGroupId={versionGroupIdForNewVersion || undefined}
        initialDocumentName={versionGroupIdForNewVersion ? attachments.find(a => a.version_group_id === versionGroupIdForNewVersion)?.document_name : ''}
        initialCategory={versionGroupIdForNewVersion ? attachments.find(a => a.version_group_id === versionGroupIdForNewVersion)?.category : 'Outros'}
      />

      <AttachmentPreviewModal 
        isOpen={showAttachmentPreview}
        onClose={() => {
          setShowAttachmentPreview(false);
          setSelectedAttachment(null);
        }}
        attachment={selectedAttachment}
      />

      <AttachmentVersionHistory 
        isOpen={showAttachmentHistory}
        onClose={() => {
          setShowAttachmentHistory(false);
          setSelectedAttachment(null);
        }}
        versionGroupId={selectedAttachment?.version_group_id}
        onPreview={(version) => {
          setSelectedAttachment(version);
          setShowAttachmentPreview(true);
        }}
        onDelete={async (version) => {
          setConfirmDeleteAttachment(version);
        }}
      />

      {/* Edit Attachment Modal */}
      <AnimatePresence>
        {showEditAttachmentModal && editingAttachment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0A1120] border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-xl">
                    <PenTool className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Editar Anexo</h3>
                    <p className="text-xxs font-bold text-slate-500 uppercase tracking-widest">Atualizar informações do documento</p>
                  </div>
                </div>
                <button onClick={() => setShowEditAttachmentModal(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Nome do Documento</label>
                  <input 
                    type="text"
                    value={editingAttachment.document_name}
                    onChange={(e) => setEditingAttachment({ ...editingAttachment, document_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xxs font-black text-slate-500 uppercase tracking-widest">Categoria</label>
                  <select 
                    value={editingAttachment.category}
                    onChange={(e) => setEditingAttachment({ ...editingAttachment, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                  >
                    {ATTACHMENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowEditAttachmentModal(false)}
                  className="flex-1 border-slate-800 text-slate-400 font-black uppercase tracking-widest text-xxs h-12 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleUpdateAttachment(editingAttachment.id, { 
                    document_name: editingAttachment.document_name, 
                    category: editingAttachment.category 
                  })}
                  disabled={isUpdatingAttachment}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase tracking-widest text-xxs h-12 rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  {isUpdatingAttachment ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
