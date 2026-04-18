"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Palette, Calendar, HeartPulse, Database, Code } from 'lucide-react';
import { BrandingSettings } from './BrandingSettings';
import { AgendaSettings } from './AgendaSettings';
import { ClinicalSettings } from './ClinicalSettings';
import { SportsSettings } from './SportsSettings';
import { DatabaseSeeder } from './DatabaseSeeder';

type SettingsSection = 'branding' | 'agenda' | 'clinical' | 'data' | 'dev' | null;

export function SettingsDashboard() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('branding');

  const toggleSection = (section: SettingsSection) => {
    setActiveSection(prev => prev === section ? null : section);
  };

  const sections = [
    {
      id: 'branding' as const,
      title: 'Identidade Visual',
      icon: Palette,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-500',
      component: <BrandingSettings />
    },
    {
      id: 'agenda' as const,
      title: 'Configurações da Agenda',
      icon: Calendar,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-500',
      component: <AgendaSettings />
    },
    {
      id: 'clinical' as const,
      title: 'Regras Clínicas',
      icon: HeartPulse,
      color: 'bg-rose-500',
      textColor: 'text-rose-500',
      component: <ClinicalSettings />
    },
    {
      id: 'data' as const,
      title: 'Gestão de Dados',
      icon: Database,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-500',
      component: <SportsSettings />
    },
    {
      id: 'dev' as const,
      title: 'Desenvolvimento',
      icon: Code,
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      component: <DatabaseSeeder />
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">
          Configurações do Sistema
        </h1>
        <p className="text-slate-400 mt-2">Gerencie as preferências e dados do sistema.</p>
      </header>

      <div className="space-y-4">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const Icon = section.icon;

          return (
            <div 
              key={section.id} 
              className={`bg-slate-900/40 border transition-colors duration-300 rounded-2xl overflow-hidden ${
                isActive ? 'border-slate-700' : 'border-slate-800/50 hover:border-slate-700/80'
              }`}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800 ${section.textColor}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${
                  isActive ? 'bg-slate-800 text-white rotate-180' : 'bg-slate-950 text-slate-500'
                }`}>
                  <ChevronDown size={18} />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-5 sm:p-6 pt-0 border-t border-slate-800/50 mt-2">
                      {section.component}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
