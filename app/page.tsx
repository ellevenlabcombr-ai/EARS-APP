"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MainDashboard = dynamic(() => import('@/components/MainDashboard').then(mod => mod.MainDashboard), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const AthleteDashboard = dynamic(() => import('@/components/AthleteDashboard').then(mod => mod.AthleteDashboard), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const LoginScreen = dynamic(() => import('@/components/LoginScreen').then(mod => mod.LoginScreen), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AppLayout } from '@/components/layout/AppLayout';

const LoadingSpinner = () => (
  <div className="flex-1 flex items-center justify-center">
    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-black text-3xl shadow-[0_0_30px_rgba(6,182,212,0.2)] animate-pulse">
      E
    </div>
  </div>
);

type Role = 'admin' | 'athlete' | null;

export default function Home() {
  const [userRole, setUserRole] = useState<Role>(null);
  const [loggedInAthlete, setLoggedInAthlete] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState<'logout' | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('ears_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (new Date().getTime() - session.timestamp < thirtyDays) {
          setTimeout(() => {
            setUserRole(session.role);
            if (session.athleteData) {
              setLoggedInAthlete(session.athleteData);
            }
            setIsInitializing(false);
          }, 0);
          return;
        } else {
          localStorage.removeItem('ears_session');
        }
      } catch (e) {
        console.error("Error parsing saved session:", e);
        localStorage.removeItem('ears_session');
      }
    }
    setTimeout(() => {
      setIsInitializing(false);
    }, 0);
  }, []);

  const handleLogout = () => {
    if (isDirty) {
      setPendingAction('logout');
    } else {
      localStorage.removeItem('ears_session');
      setUserRole(null);
      setLoggedInAthlete(null);
    }
  };

  const handleLogin = (role: Role, athleteData?: any) => {
    setUserRole(role);
    if (athleteData) {
      setLoggedInAthlete(athleteData);
    }
  };

  if (isInitializing) {
    return (
      <AppLayout withSafeBottom={false}>
        <LoadingSpinner />
      </AppLayout>
    );
  }

  if (!userRole) {
    return (
      <AppLayout withSafeTop={false} withSafeBottom={false}>
        <LoginScreen onLogin={handleLogin} />
      </AppLayout>
    );
  }

  if (userRole === 'athlete') {
    return (
      <AppLayout withSafeTop={false} withSafeBottom={false}>
        <AthleteDashboard 
          onBack={handleLogout} 
          onDirtyChange={setIsDirty}
          athleteId={loggedInAthlete?.id}
          athleteGender={loggedInAthlete?.gender}
        />
        <ConfirmDialog 
          isOpen={pendingAction === 'logout'}
          onConfirm={() => {
            setPendingAction(null);
            setIsDirty(false);
            localStorage.removeItem('ears_session');
            setUserRole(null);
            setLoggedInAthlete(null);
          }}
          onCancel={() => setPendingAction(null)}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout withSafeTop={false} withSafeBottom={false}>
      <MainDashboard onLogout={handleLogout} />
    </AppLayout>
  );
}
