
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WellnessCheckInForm } from './WellnessCheckInForm';
import { AthleteEarsDashboard } from './AthleteEarsDashboard';
import { CoachEarsDashboard } from './CoachEarsDashboard';
import { AthleteProfile, WellnessCheckIn } from '../../types/ears';
import { Button } from '../ui/button';
import { LayoutDashboard, ClipboardCheck, Users, Info, Settings } from 'lucide-react';

// MOCK DATA GENERATOR
const generateMockHistory = (athleteId: string): WellnessCheckIn[] => {
  const history: WellnessCheckIn[] = [];
  const today = new Date();
  const phases: any[] = ['follicular', 'ovulatory', 'luteal', 'menstrual', 'none'];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const score = 60 + Math.floor(Math.random() * 35);
    history.push({
      id: `m-${i}`,
      athleteId,
      date: d.toISOString(),
      sleep_quality: 3 + Math.floor(Math.random() * 3),
      sleep_hours: 6 + Math.floor(Math.random() * 3),
      energy: 3 + Math.floor(Math.random() * 3),
      mood: 3 + Math.floor(Math.random() * 3),
      stress: 1 + Math.floor(Math.random() * 3),
      recovery: 3 + Math.floor(Math.random() * 3),
      confidence: 3 + Math.floor(Math.random() * 3),
      leg_heaviness: 1 + Math.floor(Math.random() * 2),
      overall_readiness: 4,
      menstrual_cycle: phases[i % 5],
      pain_map: i % 4 === 0 ? [{ region: 'knee_r_f', level: 5, type: 'muscle' }] : [],
      clinical_symptoms: i === 10 ? ['headache'] : [],
      readiness_score: score,
      base_score: score + 5,
      deductions: 5,
      level: score > 80 ? 'ready' : score > 60 ? 'attention' : 'risk'
    });
  }
  return history;
};

const MOCK_ATHLETE: AthleteProfile = {
  id: 'at-1',
  name: 'Maria Eduarda',
  nickname: 'Duda',
  gender: 'female',
  age: 22,
  sport: 'Vôlei',
  category: 'Elite',
  previous_readiness: 88,
  avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&auto=format&fit=crop'
};

const MOCK_TEAM: AthleteProfile[] = [
  MOCK_ATHLETE,
  { id: 'at-2', name: 'Ana Souza', nickname: 'Ana', gender: 'female', age: 25, sport: 'Vôlei', category: 'Elite', previous_readiness: 75 },
  { id: 'at-3', name: 'Juliana Lima', nickname: 'Ju', gender: 'female', age: 19, sport: 'Vôlei', category: 'Elite', previous_readiness: 92 },
  { id: 'at-4', name: 'Carla Silva', nickname: 'Carla', gender: 'female', age: 29, sport: 'Vôlei', category: 'Elite', previous_readiness: 60 },
];

export default function EarsSystem() {
  const [activeTab, setActiveTab] = useState<'athlete' | 'questionnaire' | 'coach'>('athlete');
  const [history, setHistory] = useState<WellnessCheckIn[]>(() => generateMockHistory(MOCK_ATHLETE.id));
  const [teamData, setTeamData] = useState<any[]>(() => 
    MOCK_TEAM.map(a => ({
      athlete: a,
      latestCheckin: generateMockHistory(a.id)[0],
      trend: -5 + Math.floor(Math.random() * 10)
    }))
  );

  const handleSubmitCheckin = (data: WellnessCheckIn) => {
    const newRecord = {
      ...data,
      id: `new-${Date.now()}`,
      athleteId: MOCK_ATHLETE.id,
      date: new Date().toISOString()
    };
    setHistory([newRecord, ...history]);
    setActiveTab('athlete');
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Sidebar/Top */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20">
                <Zap className="w-6 h-6 text-white" />
             </div>
             <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">EARS Intelligence</h1>
                <p className="text-xxs text-slate-500 font-bold uppercase tracking-widest">Elite Athlete Readiness System</p>
             </div>
          </div>

          <div className="flex items-center p-1.5 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl">
            {[
              { id: 'athlete', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'questionnaire', label: 'Check-in', icon: ClipboardCheck },
              { id: 'coach', label: 'Coach Info', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                  ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'athlete' && (
              <AthleteEarsDashboard 
                athlete={MOCK_ATHLETE} 
                history={history} 
                performanceCorrelation={{ load: 78, stats: 92, rpe: 8 }}
              />
            )}
            {activeTab === 'questionnaire' && (
              <WellnessCheckInForm 
                athlete={MOCK_ATHLETE} 
                history={history}
                onSubmit={handleSubmitCheckin} 
              />
            )}
            {activeTab === 'coach' && (
              <CoachEarsDashboard 
                data={teamData} 
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* System Footer Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-12 border-t border-white/5 gap-4">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-xxs font-black text-slate-600 uppercase tracking-widest">
                <Info className="w-4 h-4" />
                Version 2.4.0 High-Performance
             </div>
             <div className="flex items-center gap-2 text-xxs font-black text-slate-600 uppercase tracking-widest">
                <Settings className="w-4 h-4" />
                Algoritmo EARS 2.0 Ativo
             </div>
          </div>
          <p className="text-xxs font-black text-slate-700 uppercase tracking-widest">© 2026 EARS Sports Science Platform</p>
        </div>
      </div>
    </div>
  );
}

const Zap = ({ className, ...props }: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
