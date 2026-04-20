"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { User, X, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export function UserProfileModal({ isOpen, onClose, onProfileUpdated }: UserProfileModalProps) {
  const [name, setName] = useState('Usuário');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      setStatus('idle');
      setMessage('');
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    if (!supabase) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_profile_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error("USER PROFILE FETCH ERROR:", {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          full: error
        });
        
        const isTableMissing = error.message?.includes('relation "user_profile_settings" does not exist') || 
                               error.message?.includes('schema cache') ||
                               error.details?.includes('schema cache');

        if (isTableMissing) {
          console.warn('User profile table not found. Please run the database seeder.');
          setStatus('error');
          setMessage('Tabela de perfil não encontrada. Use o Auto-Fix em Configurações > Desenvolvimento.');
          return;
        }
        throw error;
      }

      if (data) {
        setName(data.name || 'Usuário');
        setEmail(data.email || '');
        setAvatarUrl(data.avatar_url || null);
      }
    } catch (err: any) {
      console.error("USER PROFILE CATCH ERROR:", err);
      setStatus('error');
      setMessage(`Erro ao carregar: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !supabase) return;

    // Limit to 5MB for avatars
    if (file.size > 5 * 1024 * 1024) {
      setStatus('error');
      setMessage('A foto deve ter no máximo 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setStatus('idle');

      // 1. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("AVATAR UPLOAD ERROR:", uploadError);
        
        if (uploadError.message?.includes('Bucket not found')) {
          throw new Error('Bucket "avatars" não encontrado. Use o Auto-Fix em Configurações > Desenvolvimento.');
        }
        throw uploadError;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
    } catch (err: any) {
      console.error("AVATAR UPLOAD CATCH ERROR:", err);
      setStatus('error');
      setMessage(`Erro no upload: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!supabase) return;
    setIsSaving(true);
    setStatus('idle');

    try {
      const { data: existing, error: selectError } = await supabase
        .from('user_profile_settings')
        .select('id')
        .maybeSingle();

      if (selectError) {
        const isTableMissing = selectError.message?.includes('relation "user_profile_settings" does not exist') || 
                               selectError.message?.includes('schema cache') ||
                               selectError.details?.includes('schema cache');

        if (isTableMissing) {
          throw new Error('Tabela de perfil não encontrada. Use o Auto-Fix em Configurações > Desenvolvimento.');
        }
        throw selectError;
      }

      const payload = {
        name,
        email,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };

      let error;
      if (existing) {
        const { error: updateError } = await supabase
          .from('user_profile_settings')
          .update(payload)
          .eq('id', existing.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_profile_settings')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      setStatus('success');
      setMessage('Perfil salvo com sucesso!');
      onProfileUpdated();
      
      // Close after a short delay on success
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: any) {
      console.error("USER PROFILE SAVE ERROR:", err);
      setStatus('error');
      setMessage(`Erro ao salvar: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0A1120] border border-slate-800 rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Meu Perfil</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando perfil...</p>
                </div>
              ) : (
                <>
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                        {avatarUrl ? (
                          <Image 
                            src={avatarUrl} 
                            alt="Avatar" 
                            fill 
                            className="object-cover"
                            unoptimized
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User size={40} className="text-slate-500" />
                        )}
                      </div>
                      
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                      >
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <>
                            <Camera size={24} className="text-white mb-1" />
                            <span className="text-xxs font-bold text-white uppercase tracking-wider">Alterar</span>
                          </>
                        )}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                    <p className="text-xxs text-slate-500 font-medium text-center">
                      Clique na imagem para alterar a foto.<br/>Recomendado: 400x400px.
                    </p>
                  </div>

                  {/* Form Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider ml-1">Nome</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
                        placeholder="Seu nome"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  {/* Status Message */}
                  {status !== 'idle' && (
                    <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                      status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      <span className="text-xs font-bold">{message}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-800/50">
                    <Button 
                      onClick={handleSave}
                      disabled={isSaving || isUploading}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase tracking-widest py-6 rounded-xl transition-all active:scale-95"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar Perfil'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
