"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ATTACHMENT_CATEGORIES = [
  'Exame',
  'Imagem',
  'Relatório',
  'Prescrição',
  'Termo',
  'Avaliação',
  'Outros'
];

interface AttachmentUploadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { 
    file: File, 
    documentName: string, 
    category: string, 
    versionNote?: string,
    versionGroupId?: string
  }) => Promise<void>;
  isUploading: boolean;
  versionGroupId?: string;
  initialDocumentName?: string;
  initialCategory?: string;
}

export function AttachmentUploadForm({
  isOpen,
  onClose,
  onUpload,
  isUploading,
  versionGroupId,
  initialDocumentName = '',
  initialCategory = 'Outros'
}: AttachmentUploadFormProps) {
  const [documentName, setDocumentName] = useState(initialDocumentName);
  const [category, setCategory] = useState(initialCategory);
  const [versionNote, setVersionNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("O arquivo excede o limite de 50MB");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      if (!documentName) {
        // Pre-fill document name from file name (without extension) as a suggestion
        const nameWithoutExt = selectedFile.name.split('.').slice(0, -1).join('.');
        setDocumentName(nameWithoutExt);
      }
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentName.trim()) {
      setError("Informe o nome do documento antes de enviar");
      return;
    }
    if (!file && !versionGroupId) {
      setError("Selecione um arquivo para upload");
      return;
    }
    if (!file && versionGroupId) {
      setError("Selecione a nova versão do arquivo");
      return;
    }

    try {
      await onUpload({
        file: file!,
        documentName,
        category,
        versionNote,
        versionGroupId
      });
      // Reset form on success
      setDocumentName('');
      setCategory('Outros');
      setVersionNote('');
      setFile(null);
      onClose();
    } catch (err) {
      // Error handled by parent
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-500" />
                {versionGroupId ? 'Nova Versão de Documento' : 'Novo Anexo'}
              </h3>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                    Nome do Documento <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Ex: Laudo de Ressonância, Exame de Sangue"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                    Categoria <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                  >
                    {ATTACHMENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {versionGroupId && (
                  <div>
                    <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                      Observação da Versão (Opcional)
                    </label>
                    <textarea
                      value={versionNote}
                      onChange={(e) => setVersionNote(e.target.value)}
                      placeholder="Ex: laudo atualizado após reavaliação"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors h-20 resize-none"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
                    Arquivo <span className="text-rose-500">*</span>
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      file ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {file ? (
                      <>
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500">
                          <FileText size={24} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-white truncate max-w-[12.5rem]">{file.name}</p>
                          <p className="text-xxs text-slate-500 uppercase tracking-widest mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-600">
                          <Upload size={24} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-400">Clique ou arraste o arquivo</p>
                          <p className="text-xxs text-slate-600 uppercase tracking-widest mt-1">PDF, Imagens (Max 50MB)</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-widest">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose}
                  disabled={isUploading}
                  className="text-slate-400 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUploading}
                  className="bg-cyan-500 hover:bg-cyan-400 text-[#050B14] font-black uppercase tracking-widest min-w-[8.75rem]"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-[#050B14] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    versionGroupId ? 'Enviar Nova Versão' : 'Enviar Documento'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
