import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDateString(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date();
  if (dateStr.includes('T')) return new Date(dateStr);
  return new Date(dateStr + 'T12:00:00');
}

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalDateTimeString(d: Date = new Date()): string {
  return d.toISOString();
}

export function getTagSuggestions(tag: string): string[] {
  const lower = tag.toLowerCase();
  if (lower.includes('tornozelo') || lower.includes('rigidez') || lower.includes('stiffness')) {
    return ['Mobilidade de tornozelo', 'Liberação miofascial', 'Controle motor'];
  }
  if (lower.includes('posterior') || lower.includes('chain')) {
    return ['Redução de carga', 'Recuperação ativa', 'Fortalecimento controlado'];
  }
  if (lower.includes('intolerância') || lower.includes('intolerance')) {
    return ['Modulação severa de volume', 'Monitoramento estrito de esforço', 'Alternância de vetor'];
  }
  if (lower.includes('joelho') || lower.includes('tend') || lower.includes('patel')) {
    return ['Isometria analgésica preventiva', 'Redução de saltos/impacto', 'Revisão biomecânica focada'];
  }
  if (lower.includes('ombro') || lower.includes('shoulder')) {
    return ['Estabilização periescapular', 'Adequação de movimentos overhead', 'Liberação de tecido alvo'];
  }
  if (lower.includes('quadril') || lower.includes('groin') || lower.includes('púbis') || lower.includes('lumbar')) {
    return ['Trabalho indireto de estabilidade (Core)', 'Controle de amplitude de movimento', 'Revisão de dominância articular'];
  }
  
  // Default generic support actions
  return ['Monitoramento dinâmico local', 'Otimização térmica (Vasodilatação/Contração)', 'Manutenção de diálogo clínico-atleta'];
}
