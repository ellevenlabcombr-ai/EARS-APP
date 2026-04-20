"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileText, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: {
    id: string;
    document_name: string;
    file_name?: string;
    category: string;
    file_url: string;
    mime_type?: string;
    file_type?: string;
    version_number?: number;
    created_at: string;
  } | null;
}

export function AttachmentPreviewModal({
  isOpen,
  onClose,
  attachment
}: AttachmentPreviewModalProps) {
  const [loading, setLoading] = useState(true);

  if (!attachment) return null;

  const isImage = attachment.mime_type?.startsWith('image/') || 
                  ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(attachment.file_type?.toLowerCase() || '');
  const isPDF = attachment.mime_type === 'application/pdf' || 
                attachment.file_type?.toLowerCase() === 'pdf';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-md">
                    {attachment.document_name || attachment.file_name || 'Documento'}
                  </h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xxs font-black text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-md">
                      {attachment.category}
                    </span>
                    <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest">
                      v{attachment.version_number || 1} • {new Date(attachment.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                  <a 
                    href={attachment.file_url} 
                    download={attachment.document_name || attachment.file_name}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="Baixar Arquivo"
                  >
                    <Download size={20} />
                  </a>
                <button 
                  onClick={onClose} 
                  className="p-2 text-slate-500 hover:text-white transition-colors ml-2"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-950 relative overflow-auto flex items-center justify-center p-4">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {isImage ? (
                <div className="relative w-full h-full min-h-[25rem]">
                  <Image
                    src={attachment.file_url}
                    alt={attachment.document_name}
                    fill
                    className="object-contain"
                    onLoadingComplete={() => setLoading(false)}
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : isPDF ? (
                <iframe
                  src={`${attachment.file_url}#toolbar=0`}
                  className="w-full h-full rounded-xl border border-slate-800"
                  onLoad={() => setLoading(false)}
                />
              ) : (
                <div className="text-center space-y-4 p-12">
                  {(() => { if (loading) setLoading(false); return null; })()}
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700 mx-auto">
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-widest">Pré-visualização não disponível</p>
                    <p className="text-xxs text-slate-500 uppercase tracking-widest mt-1">Este tipo de arquivo não pode ser exibido diretamente no navegador.</p>
                  </div>
                  <a 
                    href={attachment.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xxs font-black uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-800 hover:bg-slate-700 text-white h-10 px-4 py-2"
                  >
                    <ExternalLink size={14} className="mr-2" />
                    Abrir em nova aba
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
