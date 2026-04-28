"use client";

import React from "react";
import { AgendaEvent, getCategoryColor } from "@/types/agenda";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell } from "lucide-react";

interface EventCardProps {
  event: AgendaEvent;
  onClick: (event: AgendaEvent) => void;
  isMultiDay?: boolean;
}

export function EventCard({ event, onClick, isMultiDay }: EventCardProps) {
  const colorClass = getCategoryColor(event);
  const startTime = new Date(event.start_time);
  
  if (isMultiDay) {
    return (
      <div 
        onClick={() => onClick(event)}
        className={`px-2 py-1 rounded border text-left cursor-pointer transition-all hover:brightness-110 active:scale-95 ${colorClass} h-full overflow-hidden flex items-center shrink-0`}
      >
        <span className="text-[10px] font-black leading-none truncate block w-full">{event.title}</span>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(event)}
      className={`px-2 py-1 rounded border text-left cursor-pointer transition-all hover:brightness-110 active:scale-95 ${colorClass} h-full overflow-hidden flex flex-col justify-center relative`}
    >
      <div className="flex items-center justify-between gap-1.5 w-full">
        <span className="text-[10px] font-black leading-none truncate flex-1 min-w-0 flex items-center gap-1">
          {event.reminder_minutes !== null && event.reminder_minutes !== undefined && (
            <Bell className="w-3 h-3 shrink-0 opacity-70" />
          )}
          <span className="truncate">{event.title}</span>
        </span>
        {!event.is_all_day && (
          <span className="text-[9px] font-black uppercase tracking-tighter opacity-70 shrink-0">
            {format(startTime, "h:mm a")}
          </span>
        )}
      </div>
    </div>
  );
}
