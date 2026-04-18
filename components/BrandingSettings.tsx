"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, CheckCircle, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function BrandingSettings() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('ELLEVEN');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('branding_settings')
        .select('*')
        .single();
      
      if (data) {
        setLogoUrl(data.logo_url);
        setCompanyName(data.company_name || 'ELLEVEN');
      }
    } catch (err) {
      console.error('Error fetching branding:', err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setMessage('Por favor, selecione uma imagem válida.');
      return;
    }

    // Limit to 2MB for logos
    if (file.size > 2 * 1024 * 1024) {
      setStatus('error');
      setMessage('O logo deve ter no máximo 2MB.');
      return;
    }

    setIsUploading(true);
    setStatus('idle');

    try {
      // 1. Upload file
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `elleven/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        if (uploadError.message === 'Bucket not found') {
          throw new Error('O bucket "branding" não foi encontrado. Por favor, vá em Configurações > Desenvolvimento e clique em "Otimizar Banco (Auto-Fix)" para criar a estrutura necessária.');
        }
        throw uploadError;
      }

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      setStatus('success');
      setMessage('Imagem carregada com sucesso! Não esqueça de salvar.');
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      setStatus('error');
      setMessage(err.message || 'Erro ao carregar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!supabase) return;
    setIsSaving(true);
    setStatus('idle');

    try {
      const { data: existing } = await supabase
        .from('branding_settings')
        .select('id')
        .single();

      const payload = {
        logo_url: logoUrl,
        company_name: companyName,
        updated_at: new Date().toISOString()
      };

      let error;
      if (existing) {
        const { error: updateError } = await supabase
          .from('branding_settings')
          .update(payload)
          .eq('id', existing.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('branding_settings')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      setStatus('success');
      setMessage('Configurações de branding salvas com sucesso!');
      
      // Force reload to reflect changes in header/sidebar if needed
      // window.location.reload(); 
      // Better to use a global state or event
      window.dispatchEvent(new CustomEvent('branding-updated'));
    } catch (err: any) {
      console.error('Error saving branding:', err);
      setStatus('error');
      setMessage(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    setStatus('idle');
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Logo Preview */}
        <div className="flex-shrink-0">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Logo do Sistema</h3>
          <div className="relative w-48 h-48 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden group">
            {logoUrl ? (
              <>
                <Image 
                  src={logoUrl} 
                  alt="Logo Preview" 
                  fill 
                  className="object-contain p-4"
                  unoptimized
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    title="Trocar Logo"
                  >
                    <Upload size={18} />
                  </button>
                  <button 
                    onClick={handleRemoveLogo}
                    className="p-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-lg text-rose-400 transition-colors"
                    title="Remover Logo"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 text-slate-600 cursor-pointer hover:text-cyan-500 transition-colors"
              >
                <ImageIcon size={48} strokeWidth={1} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Nenhum Logo</span>
              </div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            )}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          
          <p className="text-[10px] text-slate-500 mt-4 max-w-[200px]">
            Recomendado: PNG transparente ou SVG. Tamanho máximo 2MB.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome da Empresa / App</label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none transition-colors"
              placeholder="Ex: ELLEVEN"
            />
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleSave}
              disabled={isSaving || isUploading}
              className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase tracking-widest px-8 py-6 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Salvar Branding
                </>
              )}
            </Button>
          </div>

          {status !== 'idle' && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {status === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
              <span className="text-xs font-bold">{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
