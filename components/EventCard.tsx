"use client";

import React from "react";
import { AgendaEvent, getCategoryColor } from "@/types/agenda";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventCardProps {
  event: AgendaEvent;
  onClick: (event: AgendaEvent) => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const colorClass = getCategoryColor(event);
  const startTime = new Date(event.start_time);
  
  return (
    <div 
      onClick={() => onClick(event)}
      className={`p-2 rounded-lg border text-left cursor-pointer transition-all hover:brightness-110 active:scale-95 ${colorClass} h-full overflow-hidden`}
    >
      <p className="text-xxs font-black uppercase tracking-tighter opacity-70">
        {format(startTime, "HH:mm")}
      </p>
      <h4 className="text-xxs font-black leading-tight truncate">
        {event.title}
      </h4>
      {event.category === 'clinical' && event.risk_score !== null && (
        <div className="mt-1 flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-current" />
          <span className="text-xxs font-bold uppercase">Risco: {event.risk_score}</span>
        </div>
      )}
    </div>
  );
}
