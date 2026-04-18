import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title = "Alterações não salvas",
  description = "Você tem dados preenchidos que não foram salvos. Se sair agora, perderá essas informações. Deseja realmente sair?",
  confirmText = "Sair sem salvar",
  cancelText = "Cancelar",
  loading = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" />
              {title}
            </h3>
            <p className="text-slate-400 mb-6">{description}</p>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={onCancel} 
                disabled={loading}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                {cancelText}
              </Button>
              <Button 
                variant="destructive" 
                onClick={onConfirm} 
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-700 text-white min-w-[100px]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
