"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { supabase } from "@/lib/supabase";
import {
  UserPlus,
  Save,
  ArrowLeft,
  Camera,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Users,
  Stethoscope,
  Trophy,
  HeartPulse,
  Home,
  ShieldAlert,
  FileText,
  ChevronRight,
  RefreshCw,
  Key,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./ConfirmDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Athlete } from "@/types/database";

const CONVENIOS = [
  'SUS', 'Amil', 'Bradesco Saúde', 'SulAmérica', 'Unimed', 'Porto Seguro', 'NotreDame Intermédica', 'Prevent Senior', 'Sompo Saúde', 'Golden Cross',
  'Allianz Saúde', 'Care Plus', 'Central Nacional Unimed', 'Hapvida', 'Mediservice', 'Omint', 'Seguros Unimed', 'Vitallis', 'Outro...'
];

const MODALIDADES_DATA: Record<string, string[]> = {
  'Atletismo': ['Velocidade', 'Fundo', 'Saltos', 'Arremessos', 'Marcha'],
  'Basquete': ['Armador', 'Ala-Armador', 'Ala', 'Ala-Pivô', 'Pivô'],
  'Futsal': ['Goleiro', 'Fixo', 'Ala Direito', 'Ala Esquerdo', 'Pivô'],
  'Futebol de Campo': ['Goleiro', 'Lateral Direito', 'Lateral Esquerdo', 'Zagueiro', 'Volante', 'Meia', 'Atacante', 'Centroavante'],
  'Handebol': ['Goleiro', 'Ponta Esquerda', 'Ponta Direita', 'Armador Esquerdo', 'Armador Central', 'Armador Direito', 'Pivô'],
  'Judô': ['Ligeiro', 'Meio-Leve', 'Leve', 'Meio-Médio', 'Médio', 'Meio-Pesado', 'Pesado'],
  'Natação': ['Crawl', 'Costas', 'Peito', 'Borboleta', 'Medley'],
  'Tênis': ['Simples', 'Duplas'],
  'Volleyball': ['Levantador', 'Oposto', 'Ponteiro', 'Central', 'Líbero'],
  'Vôlei de Praia': ['Defesa', 'Bloqueio'],
  'Outro...': ['Outra Posição']
};

// --- Helper Components ---
const FormLabel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <label className={`text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 ${className}`}>
    {children}
  </label>
);

const FormInput = ({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) => (
  <div className="space-y-1 w-full">
    <input
      {...props}
      className={`w-full bg-slate-900/50 border ${error ? 'border-rose-500' : 'border-slate-700'} rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors ${props.className || ''}`}
    />
    {error && (
      <motion.p 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1"
      >
        {error}
      </motion.p>
    )}
  </div>
);

const FormSelect = ({ error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) => (
  <div className="space-y-1 w-full">
    <div className="relative">
      <select
        {...props}
        className={`w-full bg-slate-900/50 border ${error ? 'border-rose-500' : 'border-slate-700'} rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none ${props.className || ''}`}
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
        <ChevronRight size={16} className="rotate-90" />
      </div>
    </div>
    {error && (
      <motion.p 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1"
      >
        {error}
      </motion.p>
    )}
  </div>
);
const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
    <div className="w-2 h-6 bg-cyan-500 rounded-full"></div>
    {title}
  </h2>
);

interface AthleteRegistrationProps {
  onBack: () => void;
  onSave?: (data: any) => void;
  initialData?: Athlete;
  onDirtyChange?: (dirty: boolean) => void;
}

export function AthleteRegistration({ onBack, onSave, initialData, onDirtyChange }: AthleteRegistrationProps) {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(initialData?.avatar_url || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [cep, setCep] = useState(initialData?.cep || '');
  const [address, setAddress] = useState(initialData?.address || { logradouro: '', bairro: '', localidade: '', uf: '' });
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || (initialData as any)?.birth_date || '');
  const [modalidade, setModalidade] = useState(initialData?.modalidade || (initialData as any)?.sport || '');
  const [position, setPosition] = useState(initialData?.posicao || (initialData as any)?.posicao || '');
  const [categoria, setCategoria] = useState(initialData?.categoria || (initialData as any)?.category || 'Sub-15');
  const [status, setStatus] = useState(initialData?.status || 'Apto');
  const [hasAllergy, setHasAllergy] = useState(initialData?.hasAllergy || (initialData as any)?.alergia || false);
  const [isProfessional, setIsProfessional] = useState((initialData as any)?.categoria === 'Profissional' || (initialData as any)?.category === 'Profissional');
  const [athleteCode, setAthleteCode] = useState(initialData?.athlete_code || '');
  const [dynamicSports, setDynamicSports] = useState<Record<string, string[]>>(MODALIDADES_DATA);

  useEffect(() => {
    const fetchSports = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('sports')
          .select('name, positions')
          .order('name');
        
        if (data && data.length > 0) {
          const sportsMap: Record<string, string[]> = {};
          data.forEach(s => {
            sportsMap[s.name] = s.positions;
          });
          // Ensure "Outro..." is always there
          if (!sportsMap['Outro...']) {
            sportsMap['Outro...'] = ['Outra Posição'];
          }
          setDynamicSports(sportsMap);
        }
      } catch (err: any) {
        console.error('Error fetching sports for registration:', err.message || err);
      }
    };
    fetchSports();
  }, []);

  const calculateCategory = (dateStr: string) => {
    if (!dateStr) return 'Master';
    const birth = new Date(dateStr);
    const today = new Date();
    // In sports, category is often based on the year difference (current year - birth year)
    const age = today.getFullYear() - birth.getFullYear();

    if (age <= 11) return 'Sub-11';
    if (age <= 13) return 'Sub-13';
    if (age <= 15) return 'Sub-15';
    if (age <= 17) return 'Sub-17';
    if (age <= 19) return 'Sub-19';
    if (age <= 21) return 'Sub-21';
    return 'Master';
  };

  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || '',
    nickname: initialData?.nickname || '',
    email: initialData?.email || '',
    password: initialData?.password || Math.random().toString(36).slice(-6).toUpperCase(),
    rg: initialData?.rg || '',
    cpf: initialData?.cpf || '',
    phone: initialData?.phone || '',
    sexo: initialData?.sexo || '',
    club: initialData?.club || '',
    height: initialData?.height || '',
    weight: initialData?.weight || '',
    addressNumber: initialData?.addressNumber || '',
    addressComplement: initialData?.addressComplement || '',
    convenio: initialData?.convenio || '',
    carteirinha: initialData?.carteirinha || '',
    hospital: initialData?.hospital || '',
    alergiaDesc: initialData?.alergiaDesc || '',
    ladoDominante: initialData?.ladoDominante || 'Destro',
    guardianName: initialData?.guardianName || '',
    guardianCpf: initialData?.guardianCpf || '',
    guardianPhone: initialData?.guardianPhone || '',
    guardianEmail: initialData?.guardianEmail || '',
    group_name: (initialData as any)?.group_name || ''
  }));

  const generateNewPassword = () => {
    setFormData(prev => ({
      ...prev,
      password: Math.random().toString(36).slice(-6).toUpperCase()
    }));
  };

  // Fetch full data if editing an existing athlete
  useEffect(() => {
    const fetchFullData = async () => {
      if (initialData?.id && supabase) {
        try {
          const { data, error } = await supabase
            .from('athletes')
            .select(`
              id, name, email, athlete_code, rg, cpf, phone, gender, clube_anterior, 
              height, weight, address_number, address_complement, convenio, 
              carteirinha, hospital, alergia_desc, medicacao_desc, lado_dominante, 
              guardian_name, guardian_cpf, guardian_phone, guardian_email, 
              group_name, birth_date, modalidade, posicao, category, status, 
              alergia, avatar_url, address_zip, address_street, 
              address_neighborhood, address_city, address_state
            `)
            .eq('id', initialData.id)
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

          if (data) {
            const athleteData = data as Athlete;
            setFormData(prev => ({
              ...prev,
              name: athleteData.name || prev.name,
              nickname: athleteData.nickname || prev.nickname,
              email: athleteData.email || prev.email,
              password: athleteData.password || prev.password,
              rg: athleteData.rg || prev.rg,
              cpf: athleteData.cpf || prev.cpf,
              phone: athleteData.phone || prev.phone,
              sexo: athleteData.gender || prev.sexo,
              club: athleteData.clube_anterior || prev.club,
              height: athleteData.height?.toString() || prev.height,
              weight: athleteData.weight?.toString() || prev.weight,
              addressNumber: athleteData.address_number || prev.addressNumber,
              addressComplement: athleteData.address_complement || prev.addressComplement,
              convenio: athleteData.convenio || prev.convenio,
              carteirinha: athleteData.carteirinha || prev.carteirinha,
              hospital: athleteData.hospital || prev.hospital,
              alergiaDesc: athleteData.alergia_desc || prev.alergiaDesc,
              ladoDominante: athleteData.lado_dominante || prev.ladoDominante,
              guardianName: athleteData.guardian_name || prev.guardianName,
              guardianCpf: athleteData.guardian_cpf || prev.guardianCpf,
              guardianPhone: athleteData.guardian_phone || prev.guardianPhone,
              guardianEmail: athleteData.guardian_email || prev.guardianEmail,
              group_name: athleteData.group_name || prev.group_name
            }));
            
            if (athleteData.birth_date) setBirthDate(athleteData.birth_date);
            if (athleteData.modalidade) setModalidade(athleteData.modalidade);
            if (athleteData.posicao) setPosition(athleteData.posicao);
            if (athleteData.category) setCategoria(athleteData.category);
            if (athleteData.status) setStatus(athleteData.status);
            if (athleteData.alergia !== undefined) setHasAllergy(athleteData.alergia);
            if (athleteData.avatar_url) setPhoto(athleteData.avatar_url);
            if (athleteData.address_zip) setCep(athleteData.address_zip);
            if (athleteData.athlete_code) setAthleteCode(athleteData.athlete_code);
            if (athleteData.address_street || athleteData.address_neighborhood || athleteData.address_city || athleteData.address_state) {
              setAddress({
                logradouro: athleteData.address_street || '',
                bairro: athleteData.address_neighborhood || '',
                localidade: athleteData.address_city || '',
                uf: athleteData.address_state || ''
              });
            }
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
  }, [initialData?.id]);

  // Track if form is dirty
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    onDirtyChange?.(true);
  }, [formData, cep, address, birthDate, modalidade, position, categoria, status, hasAllergy, photo, onDirtyChange]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit to 5MB for avatars
      if (file.size > 5 * 1024 * 1024) {
        alert("A foto deve ter no máximo 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    try {
      if (!imageToCrop || !croppedAreaPixels) return;
      const croppedImageBase64 = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (croppedImageBase64) {
        setPhoto(croppedImageBase64);
        
        // Convert base64 to file for upload
        const res = await fetch(croppedImageBase64);
        const blob = await res.blob();
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        setPhotoFile(file);
      }
    } catch (e) {
      console.error(e);
    }
    setCropModalOpen(false);
    setImageToCrop(null);
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setImageToCrop(null);
  };

  const compressImage = (base64: string, maxWidth = 400, maxHeight = 400): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        // Compress image before returning to reduce DB payload
        const compressed = await compressImage(base64);
        resolve(compressed);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setAddress({
            logradouro: data.logradouro,
            bairro: data.bairro,
            localidade: data.localidade,
            uf: data.uf
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleBirthDateChange = (date: string) => {
    setBirthDate(date);
    if (!isProfessional) {
      setCategoria(calculateCategory(date));
    }
  };

  const onInternalSave = async () => {
    // Validation
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Nome é obrigatório";
    if (!birthDate) errors.birthDate = "Data de nascimento é obrigatória";
    if (!formData.sexo) errors.sexo = "Sexo é obrigatório";
    if (!formData.email.trim()) errors.email = "E-mail é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "E-mail inválido";
    if (!modalidade) errors.modalidade = "Modalidade é obrigatória";
    if (!position) errors.position = "Posição é obrigatória";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setFieldErrors({});
    setUploading(true);
    let finalPhoto = photo;
    let finalAthleteCode = athleteCode;
    
    if (photoFile) {
      const uploadedUrl = await uploadPhoto(photoFile);
      if (uploadedUrl) finalPhoto = uploadedUrl;
    }

    const finalData = {
      ...formData,
      photo: finalPhoto,
      cep,
      address,
      birthDate,
      modalidade,
      position,
      categoria,
      status,
      hasAllergy
    };

    console.log('Payload being sent to Supabase:', finalData);

    if (supabase) {
      try {
        let password = formData.password;
        
        if (!finalAthleteCode && !initialData?.id) {
          // Optimized: Fetch all existing codes once and find a gap
          const { data: existingCodes } = await supabase
            .from('athletes')
            .select('athlete_code');
            
          const usedCodes = new Set(existingCodes?.map(a => a.athlete_code) || []);
          
          // Try to find a random gap
          let attempts = 0;
          while (attempts < 100) {
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const code = `11${random}`;
            if (!usedCodes.has(code)) {
              finalAthleteCode = code;
              setAthleteCode(code);
              break;
            }
            attempts++;
          }
          
          // If still no code (unlikely), find first available
          if (!finalAthleteCode) {
            for (let i = 0; i < 1000; i++) {
              const code = `11${i.toString().padStart(3, '0')}`;
              if (!usedCodes.has(code)) {
                finalAthleteCode = code;
                setAthleteCode(code);
                break;
              }
            }
          }
        }

        const dbAthlete: Partial<Athlete> & { [key: string]: any } = {
          name: finalData.name,
          nickname: finalData.nickname || null,
          athlete_code: finalAthleteCode,
          password: finalData.password,
          email: finalData.email || null,
          phone: finalData.phone || null,
          rg: finalData.rg || null,
          cpf: finalData.cpf || null,
          birth_date: finalData.birthDate || null,
          gender: finalData.sexo || null,
          category: finalData.categoria,
          risk_level: finalData.status === 'Departamento Médico' ? 'Alto' : (finalData.status === 'Transição' ? 'Médio' : 'Baixo'),
          avatar_url: finalData.photo,
          weight: finalData.weight ? parseFloat(finalData.weight) : null,
          height: finalData.height ? parseFloat(finalData.height) : null,
          address_number: finalData.addressNumber || null,
          address_complement: finalData.addressComplement || null,
          address_zip: finalData.cep || null,
          address_street: finalData.address.logradouro || null,
          address_neighborhood: finalData.address.bairro || null,
          address_city: finalData.address.localidade || null,
          address_state: finalData.address.uf || null,
          convenio: finalData.convenio || null,
          carteirinha: finalData.carteirinha || null,
          hospital: finalData.hospital || null,
          alergia: finalData.hasAllergy,
          alergia_desc: finalData.alergiaDesc || null,
          lado_dominante: finalData.ladoDominante || null,
          modalidade: finalData.modalidade || null,
          posicao: finalData.position || null,
          status: finalData.status || null,
          guardian_name: finalData.guardianName || null,
          guardian_phone: finalData.guardianPhone || null,
          guardian_cpf: finalData.guardianCpf || null,
          guardian_email: finalData.guardianEmail || null,
          group_name: finalData.group_name || null,
          updated_at: new Date().toISOString()
        };

        console.log('Mapped DB Athlete object:', dbAthlete);

        const performSave = async (payload: any) => {
          if (!supabase) throw new Error("Supabase client not initialized");
          if (initialData?.id) {
            return await supabase.from('athletes').update(payload).eq('id', initialData.id).select();
          } else {
            return await supabase.from('athletes').insert([payload]).select();
          }
        };

        const { data, error } = await performSave(dbAthlete);
          
        if (error) {
          console.error("ATHLETE REGISTRATION SAVE ERROR:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            data: dbAthlete
          });
          throw new Error(`Erro ao salvar atleta: ${error.message || error.code}`);
        }
        
        console.log('Supabase Response:', data);
      } catch (error: any) {
        console.error('Error saving athlete to Supabase:', error);
        
        // Extract meaningful error message
        let errorMsg = 'Erro desconhecido';
        if (typeof error === 'string') errorMsg = error;
        else if (error?.message) errorMsg = error.message;
        else if (error?.details) errorMsg = error.details;
        else if (error?.hint) errorMsg = error.hint;
        else {
          try {
            const str = JSON.stringify(error);
            if (str !== '{}') errorMsg = str;
            else errorMsg = String(error);
          } catch (e) {
            errorMsg = String(error);
          }
        }
        
        alert(`Erro ao salvar atleta: ${errorMsg}`);
        setUploading(false);
        return; // Stop execution if error
      }
    } else {
      alert('Erro: Supabase não configurado. Verifique as variáveis de ambiente (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY).');
      setUploading(false);
      return;
    }

    // Success state
    onDirtyChange?.(false);
    setSuccess(true);
    setUploading(false);
    
    const savedAthlete = { 
      ...finalData, 
      id: initialData?.id,
      athlete_code: finalAthleteCode,
      password: finalData.password,
      // Add mapped fields for compatibility with AthleteHealthProfile
      gender: finalData.sexo,
      category: finalData.categoria,
      sport: finalData.modalidade,
      position: finalData.posicao,
      birth_date: finalData.birthDate,
      avatar_url: finalData.photo
    };

    if (onSave) {
      onSave(savedAthlete);
    }
  };

  const onDelete = async () => {
    if (!initialData?.id || !supabase) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('athletes')
        .delete()
        .eq('id', initialData.id);
        
      if (error) throw error;
      
      onDirtyChange?.(false);
      onBack();
    } catch (error) {
      console.error('Error deleting athlete:', error);
      alert('Erro ao excluir atleta. Tente novamente.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#050B14] text-slate-200 font-sans selection:bg-cyan-500/30"
    >
      {/* Header */}
      <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-4 sm:px-8 bg-[#0A1120]/80 backdrop-blur-xl shrink-0 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-400 hover:text-white mr-1 sm:mr-2 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-400 text-[10px] sm:text-sm font-bold uppercase tracking-wider hidden xs:inline truncate">EARS | ELLEVEN</span>
            <ChevronRight size={14} className="text-slate-600 hidden xs:inline shrink-0" />
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-widest text-cyan-400 truncate">
              {initialData ? t('reg.title.edit') : t('reg.title.new')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {initialData && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting || uploading || success}
              className="px-3 sm:px-4 py-2 text-[10px] sm:text-sm font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
            >
              {deleting ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="hidden xs:inline">{t('reg.delete')}</span>
            </button>
          )}
          <button 
            onClick={onBack}
            className="px-3 sm:px-4 py-2 text-[10px] sm:text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider hidden xs:block"
          >
            {t('reg.cancel')}
          </button>
          <button 
            onClick={onInternalSave}
            disabled={uploading || success}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-sm transition-all shadow-lg flex items-center gap-2 ${
              success 
                ? "bg-emerald-500 hover:bg-emerald-600 text-[#050B14] shadow-emerald-500/20" 
                : "bg-cyan-500 hover:bg-cyan-400 text-[#050B14] shadow-cyan-500/20"
            } disabled:opacity-50`}
          >
            {uploading ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-[#050B14]/30 border-t-[#050B14] rounded-full animate-spin"></div>
                <span className="hidden xs:inline">Salvando...</span>
                <span className="xs:hidden">...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Salvo!</span>
                <span className="xs:hidden">OK!</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{initialData ? t('reg.save') : t('reg.save')}</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-12 pb-12">
          
          {/* Section 1: Dados Pessoais */}
          <section className="space-y-6">
            <SectionTitle title={t('reg.personal')} />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-800/50 shadow-xl">
              <div className="col-span-1 flex flex-col items-center justify-start gap-4 mb-8 lg:mb-0">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
                <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                  <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden bg-[#050B14] group-hover:border-cyan-500 transition-colors shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                    {photo ? (
                      <Image 
                        src={photo} 
                        alt="Preview" 
                        fill 
                        className="object-cover" 
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Camera size={72} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                    <span className="text-sm text-white font-black uppercase tracking-widest">{t('reg.changePhoto')}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Avatar</p>
                  <p className="text-[9px] text-slate-400">PNG, JPG até 5MB</p>
                </div>
              </div>
              
              <div className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormLabel>{t('reg.fullName')}</FormLabel>
                  <FormInput 
                    name="name"
                    error={fieldErrors.name}
                    placeholder="Ex: Lucas Henrique Oliveira" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <FormLabel>{t('reg.nickname')}</FormLabel>
                  <FormInput placeholder="Ex: Lucão" value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} />
                </div>
                <div>
                  <FormLabel>{t('reg.dob')}</FormLabel>
                  <FormInput 
                    name="birthDate"
                    error={fieldErrors.birthDate}
                    type="date" 
                    value={birthDate} 
                    onChange={(e) => handleBirthDateChange(e.target.value)} 
                    className="[color-scheme:dark]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>RG</FormLabel>
                    <FormInput placeholder="00.000.000-0" value={formData.rg} onChange={(e) => setFormData({...formData, rg: e.target.value})} />
                  </div>
                  <div>
                    <FormLabel>CPF</FormLabel>
                    <FormInput placeholder="000.000.000-00" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} />
                  </div>
                </div>
                <div>
                  <FormLabel>{t('reg.gender')}</FormLabel>
                  <FormSelect 
                    name="sexo"
                    error={fieldErrors.sexo}
                    value={formData.sexo}
                    onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                  >
                    <option value="">{t('reg.select')}</option>
                    <option value="M">{t('reg.gender.m')}</option>
                    <option value="F">{t('reg.gender.f')}</option>
                    <option value="O">{t('reg.gender.o')}</option>
                  </FormSelect>
                </div>
                <div>
                  <FormLabel>{t('reg.phone')}</FormLabel>
                  <FormInput placeholder="(00) 00000-0000" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="sm:col-span-2 pt-4 border-t border-slate-800/50 mt-2">
                  <FormLabel className="flex items-center gap-2 text-cyan-400"><Key className="w-4 h-4" /> {t('reg.portalAccess')}</FormLabel>
                </div>
                <div>
                  <FormLabel>{t('reg.email')} *</FormLabel>
                  <FormInput 
                    required
                    type="email" 
                    placeholder="atleta@email.com" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div>
                  <FormLabel>{t('reg.password')}</FormLabel>
                  <div className="flex gap-2">
                    <FormInput 
                      readOnly 
                      value={formData.password} 
                      className="font-mono text-cyan-400 tracking-widest font-bold bg-slate-900/80" 
                    />
                    <button 
                      type="button"
                      onClick={generateNewPassword}
                      className="px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                      title={t('reg.generatePass')}
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-2 pt-4 border-t border-slate-800/50 mt-2">
                  <FormLabel>{t('reg.address')}</FormLabel>
                </div>
                <div>
                  <FormLabel>CEP</FormLabel>
                  <FormInput 
                    placeholder="00000-000" 
                    value={cep} 
                    onChange={(e) => setCep(e.target.value)} 
                    onBlur={handleCepBlur}
                  />
                </div>
                <div className="sm:col-span-2">
                  <FormLabel>{t('reg.street')}</FormLabel>
                  <FormInput placeholder="Rua, Avenida..." value={address.logradouro} readOnly className="bg-slate-800/50" />
                </div>
                <div>
                  <FormLabel>{t('reg.number')}</FormLabel>
                  <FormInput placeholder="123" value={formData.addressNumber} onChange={(e) => setFormData({...formData, addressNumber: e.target.value})} />
                </div>
                <div>
                  <FormLabel>{t('reg.complement')}</FormLabel>
                  <FormInput placeholder="Apto, Bloco..." value={formData.addressComplement} onChange={(e) => setFormData({...formData, addressComplement: e.target.value})} />
                </div>
                <div>
                  <FormLabel>{t('reg.neighborhood')}</FormLabel>
                  <FormInput value={address.bairro} readOnly className="bg-slate-800/50" />
                </div>
                <div>
                  <FormLabel>{t('reg.cityState')}</FormLabel>
                  <FormInput value={address.localidade ? `${address.localidade} - ${address.uf}` : ''} readOnly className="bg-slate-800/50" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Saúde e Convênio */}
          <section className="space-y-6">
            <SectionTitle title={t('reg.health')} />
            <div className="bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-800/50 shadow-xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FormLabel>{t('reg.insurance')}</FormLabel>
                  <select 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                    value={formData.convenio}
                    onChange={(e) => setFormData({...formData, convenio: e.target.value})}
                  >
                    <option value="">{t('reg.select')}</option>
                    {CONVENIOS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>{t('reg.insuranceNumber')}</FormLabel>
                  <FormInput 
                    placeholder="000000000000" 
                    value={formData.carteirinha}
                    onChange={(e) => setFormData({...formData, carteirinha: e.target.value})}
                  />
                </div>
                <div>
                  <FormLabel>{t('reg.hospital')}</FormLabel>
                  <FormInput 
                    placeholder="Ex: Hospital Albert Einstein" 
                    value={formData.hospital}
                    onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-4">
                  <FormLabel>{t('reg.allergies')}</FormLabel>
                  <button 
                    type="button"
                    onClick={() => setHasAllergy(!hasAllergy)}
                    className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      hasAllergy ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {hasAllergy ? t('reg.yes') : t('reg.no')}
                  </button>
                </div>
                
                <AnimatePresence>
                  {hasAllergy && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
                    >
                      <div className="pt-2">
                        <FormLabel>{t('reg.allergyDesc')}</FormLabel>
                        <FormInput 
                          placeholder="Ex: Penicilina, Ácaro..." 
                          value={formData.alergiaDesc}
                          onChange={(e) => setFormData({...formData, alergiaDesc: e.target.value})}
                          className="border-rose-500/50 focus:border-rose-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Section 3: Dados Esportivos */}
          <section className="space-y-6">
            <SectionTitle title={t('reg.sports')} />
            <div className="bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-800/50 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <FormLabel>{t('reg.sport')}</FormLabel>
                  <FormSelect 
                    name="modalidade"
                    error={fieldErrors.modalidade}
                    value={modalidade}
                    onChange={(e) => {
                      setModalidade(e.target.value);
                      setPosition('');
                    }}
                  >
                    <option value="">{t('reg.select')}</option>
                    {Object.keys(dynamicSports).sort().map(m => (
                      <option key={m} value={m}>
                        {m === 'Volleyball' && language === 'pt' ? 'Vôlei' : m}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <div>
                  <FormLabel>{t('reg.position')}</FormLabel>
                  <FormSelect 
                    name="posicao"
                    error={fieldErrors.posicao}
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    disabled={!modalidade}
                  >
                    <option value="">{t('reg.select')}</option>
                    {modalidade && dynamicSports[modalidade]?.map(p => <option key={p} value={p}>{p}</option>)}
                  </FormSelect>
                </div>
                <div>
                  <FormLabel>Projeto / Equipe</FormLabel>
                  <select 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                    value={formData.group_name === 'ÁGUIAS' ? 'ÁGUIAS' : (formData.group_name ? 'OUTRO' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'ÁGUIAS') setFormData({...formData, group_name: 'ÁGUIAS'});
                      else if (val === '') setFormData({...formData, group_name: ''});
                      else setFormData({...formData, group_name: 'OUTRO_TEMP'});
                    }}
                  >
                    <option value="">Nenhum</option>
                    <option value="ÁGUIAS">PROJETO ÁGUIAS</option>
                    <option value="OUTRO">Outro (Especificar abaixo)</option>
                  </select>
                  {(formData.group_name !== '' && formData.group_name !== 'ÁGUIAS') && (
                    <div className="mt-2">
                      <FormInput 
                        placeholder="Nome da Equipe" 
                        value={formData.group_name === 'OUTRO_TEMP' ? '' : formData.group_name} 
                        onChange={(e) => setFormData({...formData, group_name: e.target.value})} 
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel>{t('reg.category')}</FormLabel>
                    <button
                      type="button"
                      onClick={() => {
                        const newIsProf = !isProfessional;
                        setIsProfessional(newIsProf);
                        if (newIsProf) {
                          setCategoria('Profissional');
                        } else {
                          setCategoria(calculateCategory(birthDate));
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                        isProfessional 
                          ? "bg-cyan-500 text-[#050B14] shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                          : "bg-slate-800 text-slate-500 hover:text-slate-400"
                      }`}
                    >
                      <Trophy className={`w-3 h-3 ${isProfessional ? "text-[#050B14]" : "text-slate-600"}`} />
                      {isProfessional ? "Profissional Ativo" : "Tornar Profissional"}
                    </button>
                  </div>
                  <FormSelect 
                    value={categoria} 
                    onChange={(e) => {
                      setCategoria(e.target.value);
                      if (e.target.value === 'Profissional') setIsProfessional(true);
                      else setIsProfessional(false);
                    }}
                    className={`font-bold ${isProfessional ? "text-cyan-400 border-cyan-500/50" : "text-white"}`}
                  >
                    <option value="Sub-11">Sub-11</option>
                    <option value="Sub-13">Sub-13</option>
                    <option value="Sub-15">Sub-15</option>
                    <option value="Sub-17">Sub-17</option>
                    <option value="Sub-19">Sub-19</option>
                    <option value="Sub-21">Sub-21</option>
                    <option value="Master">Master</option>
                    <option value="Profissional">Profissional</option>
                  </FormSelect>
                </div>
                <div>
                  <FormLabel>{t('reg.status')}</FormLabel>
                  <select 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Apto">Apto</option>
                    <option value="Recovery">Recovery</option>
                    <option value="Departamento Médico">Departamento Médico</option>
                    <option value="Transição">Transição</option>
                  </select>
                </div>
                <div>
                  <FormLabel>{t('reg.club')}</FormLabel>
                  <FormInput 
                    placeholder="Ex: EARS F.C." 
                    value={formData.club}
                    onChange={(e) => setFormData({...formData, club: e.target.value})}
                  />
                </div>
                <div>
                  <FormLabel>{t('reg.dominantSide')}</FormLabel>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, ladoDominante: 'Destro'})}
                      className={`flex-1 p-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                        formData.ladoDominante === 'Destro' ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-600"
                      }`}
                    >
                      {t('reg.right')}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, ladoDominante: 'Canhoto'})}
                      className={`flex-1 p-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                        formData.ladoDominante === 'Canhoto' ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-600"
                      }`}
                    >
                      {t('reg.left')}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>{t('reg.height')}</FormLabel>
                    <FormInput 
                      type="number" 
                      step="0.01"
                      placeholder="1.85" 
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                    />
                  </div>
                  <div>
                    <FormLabel>{t('reg.weight')}</FormLabel>
                    <FormInput 
                      type="number" 
                      step="0.1" 
                      placeholder="78.5" 
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Dados do Responsável */}
          <section className="space-y-6">
            <SectionTitle title={t('reg.guardian')} />
            <div className="bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-800/50 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel>{t('reg.guardianName')}</FormLabel>
                  <FormInput 
                    placeholder="Nome completo" 
                    value={formData.guardianName}
                    onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
                  />
                </div>
                <div>
                  <FormLabel>CPF</FormLabel>
                  <FormInput 
                    placeholder="000.000.000-00" 
                    value={formData.guardianCpf}
                    onChange={(e) => setFormData({...formData, guardianCpf: e.target.value})}
                  />
                </div>
                <div>
                  <FormLabel>{t('reg.guardianPhone')}</FormLabel>
                  <FormInput 
                    type="tel" 
                    placeholder="(00) 00000-0000" 
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})}
                  />
                </div>
                <div>
                  <FormLabel>{t('reg.guardianEmail')}</FormLabel>
                  <FormInput 
                    type="email" 
                    placeholder="email@exemplo.com" 
                    value={formData.guardianEmail}
                    onChange={(e) => setFormData({...formData, guardianEmail: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Save Button at the end */}
          <div className="flex justify-center sm:justify-end pt-8 pb-20">
            <button 
              onClick={onInternalSave}
              disabled={uploading || success}
              className={`w-full sm:w-auto px-8 sm:px-12 py-4 rounded-xl text-md sm:text-lg font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 ${
                success 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-[#050B14] shadow-emerald-500/20" 
                  : "bg-cyan-500 hover:bg-cyan-400 text-[#050B14] shadow-cyan-500/20"
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-6 h-6 border-2 border-[#050B14]/30 border-t-[#050B14] rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Salvo com Sucesso!
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  {t('reg.save')}
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        title={t('reg.delete')}
        description="Tem certeza que deseja excluir este atleta? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos."
        confirmText={t('reg.delete')}
        cancelText={t('reg.cancel')}
        onConfirm={onDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <AnimatePresence>
        {cropModalOpen && imageToCrop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1120] border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-black text-white uppercase tracking-widest">Ajustar Foto</h3>
                <Button variant="ghost" size="icon" onClick={handleCropCancel} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
              <div className="relative w-full h-[400px] bg-black">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-slate-900/50">
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-1/2 accent-cyan-500"
                />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCropCancel} className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 uppercase tracking-widest text-[10px] font-bold">
                    Cancelar
                  </Button>
                  <Button onClick={handleCropConfirm} className="bg-cyan-500 hover:bg-cyan-400 text-[#050B14] uppercase tracking-widest text-[10px] font-black">
                    Confirmar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
