"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Download, Eye, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface Version {
  id: string;
  document_name: string;
  file_name?: string;
  category: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  version_number: number;
  is_current_version: boolean;
  version_note?: string;
  created_at: string;
}

interface AttachmentVersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  versionGroupId: string;
  onPreview: (version: any) => void;
  onDelete: (version: any) => Promise<void>;
}

export function AttachmentVersionHistory({
  isOpen,
  onClose,
  versionGroupId,
  onPreview,
  onDelete
}: AttachmentVersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVersions = useCallback(async () => {
    if (!supabase || !versionGroupId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('athlete_attachments')
        .select('id, document_name, file_name, category, file_url, file_size, mime_type, version_number, is_current_version, version_note, created_at')
        .eq('version_group_id', versionGroupId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (err) {
      console.error('Error fetching versions:', err);
    } finally {
      setLoading(false);
    }
  }, [versionGroupId]);

  useEffect(() => {
    if (isOpen && versionGroupId) {
      fetchVersions();
    }
  }, [isOpen, versionGroupId, fetchVersions]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Histórico de Versões</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    {versions[0]?.document_name || versions[0]?.file_name || 'Documento'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Carregando histórico...</p>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-slate-500">Nenhuma versão encontrada.</p>
                </div>
              ) : (
                versions.map((version) => (
                  <div 
                    key={version.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      version.is_current_version 
                        ? 'bg-cyan-500/5 border-cyan-500/20' 
                        : 'bg-slate-950/50 border-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          version.is_current_version ? 'bg-cyan-500 text-[#050B14]' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <span className="text-xs font-black">v{version.version_number}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {new Date(version.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {version.is_current_version && (
                              <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 uppercase tracking-widest px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 size={8} /> Atual
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">
                            {(version.file_size / 1024 / 1024).toFixed(2)} MB • {version.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => onPreview(version)}
                          className="p-2 text-slate-500 hover:text-cyan-400 transition-colors"
                          title="Visualizar"
                        >
                          <Eye size={16} />
                        </button>
                        <a 
                          href={version.file_url} 
                          download 
                          className="p-2 text-slate-500 hover:text-white transition-colors"
                          title="Baixar"
                        >
                          <Download size={16} />
                        </a>
                        <button 
                          onClick={() => onDelete(version)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {version.version_note && (
                      <div className="flex items-start gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/50">
                        <Clock size={12} className="text-slate-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                          &quot;{version.version_note}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 font-black uppercase tracking-widest text-[10px]"
              >
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
