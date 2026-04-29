"use client";

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AgendaEvent } from '@/types/agenda';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  time: Date;
  event: AgendaEvent;
}

export function AgendaNotifier() {
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const notifiedEventIds = useRef<Set<string>>(new Set());
  const [hasPermission, setHasPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setHasPermission('granted');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setHasPermission(permission);
        });
      }
    }
  }, []);

  useEffect(() => {
    // Check every minute
    const checkReminders = async () => {
      try {
        const now = new Date();
        const lookaheadTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // Look 2 days ahead

        const { data, error } = await supabase
          .from('agenda_events')
          .select('*')
          .not('reminder_minutes', 'is', null)
          .gte('start_time', now.toISOString())
          .lte('start_time', lookaheadTime.toISOString());

        if (error) throw error;
        if (!data || data.length === 0) return;

        const currentTime = now.getTime();

        const activeEvents = data.filter((e: any) => e.status !== 'cancelled' && e.status !== 'completed');

        activeEvents.forEach(event => {
          const eventTime = new Date(event.start_time).getTime();
          const reminderMinutes = event.reminder_minutes as number;
          const notificationTime = eventTime - (reminderMinutes * 60 * 1000);
          
          // If the notification time has passed within the last 5 minutes, or is exactly now, fire it
          const timeSinceNotification = currentTime - notificationTime;
          
          if (timeSinceNotification >= 0 && timeSinceNotification < 5 * 60 * 1000) {
            // It's time to notify, but check if we already did
            if (!notifiedEventIds.current.has(event.id)) {
              notifiedEventIds.current.add(event.id);
              
              const reminderText = reminderMinutes === 0 ? 'Agora' : (reminderMinutes < 60 ? `${reminderMinutes} minutos` : (reminderMinutes === 60 ? '1 hora' : '1 dia'));
              const message = `Lembrete: ${event.title} (${reminderText})`;

              // Play audio alert
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);

                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.5);
              } catch (audioErr) {
                console.warn("Could not play audio alert:", audioErr);
              }

              // Show native notification if allowed
              if (hasPermission === 'granted' && 'Notification' in window) {
                new Notification('Lembrete ELLEVEN', {
                  body: message,
                  icon: '/icon512_maskable.png'
                });
              }

              // Show in-app toast
              const newToast: NotificationToast = {
                id: Math.random().toString(36).substring(7),
                title: 'Lembrete de Compromisso',
                message,
                time: new Date(),
                event: event as unknown as AgendaEvent
              };
              
              setToasts(prev => [...prev, newToast]);
            }
          }
        });
      } catch (err: any) {
        const errorString = err?.message || err?.toString() || '';
        if (errorString.includes('Load failed') || errorString.includes('Failed to fetch')) {
          // Ignore network errors in background polling
          return;
        }
        console.error("Error checking reminders:", err.message || err);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60 * 1000);

    return () => clearInterval(interval);
  }, [hasPermission]);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 " style={{ maxWidth: 'calc(100vw - 32px)' }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full sm:w-80 bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-xl shadow-cyan-500/10 p-4 flex gap-3 items-start overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-cyan-500"></div>
            <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-xl shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">{toast.title}</h4>
              <p className="text-xs font-medium text-slate-300 mt-1 line-clamp-2">{toast.message}</p>
            </div>
            <button 
              onClick={() => dismissToast(toast.id)}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
