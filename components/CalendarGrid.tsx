"use client";

import React from "react";
import { 
  format, 
  startOfWeek, 
  addDays, 
  eachDayOfInterval, 
  isSameDay,
  startOfDay,
  endOfDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { AgendaEvent } from "@/types/agenda";
import { EventCard } from "./EventCard";

interface CalendarGridProps {
  events: AgendaEvent[];
  onEventClick: (event: AgendaEvent) => void;
  currentDate: Date;
}

export function CalendarGrid({ events, onEventClick, currentDate }: CalendarGridProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  });

  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 to 20:00

  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[80px_1fr] border-b border-slate-800">
        <div className="p-4 border-r border-slate-800" />
        <div className="grid grid-cols-7">
          {weekDays.map((day, i) => (
            <div 
              key={i} 
              className={`p-4 text-center border-r border-slate-800 last:border-r-0 ${
                isSameDay(day, new Date()) ? 'bg-cyan-500/5' : ''
              }`}
            >
              <p className="text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">
                {format(day, "EEE", { locale: ptBR })}
              </p>
              <p className={`text-lg font-black ${isSameDay(day, new Date()) ? 'text-cyan-400' : 'text-white'}`}>
                {format(day, "dd")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="relative h-[50rem] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-[80px_1fr]">
          {/* Time Column */}
          <div className="border-r border-slate-800">
            {hours.map(hour => (
              <div key={hour} className="h-20 p-2 text-right border-b border-slate-800/50">
                <span className="text-xxs font-black text-slate-600 uppercase">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-rows-[repeat(14,5rem)] pointer-events-none">
              {hours.map(hour => (
                <div key={hour} className="border-b border-slate-800/50 w-full" />
              ))}
            </div>

            {weekDays.map((day, dayIdx) => {
              const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), day));
              
              return (
                <div key={dayIdx} className="relative border-r border-slate-800/50 last:border-r-0 min-h-full">
                  {dayEvents.map(event => {
                    const start = new Date(event.start_time);
                    const end = new Date(event.end_time);
                    
                    const startHour = start.getHours();
                    const startMin = start.getMinutes();
                    const durationMin = (end.getTime() - start.getTime()) / (1000 * 60);
                    
                    // Calculate position (each hour is 80px / 5rem)
                    const top = (startHour - 7) * 80 + (startMin / 60) * 80;
                    const height = (durationMin / 60) * 80;

                    return (
                      <div 
                        key={event.id}
                        className="absolute left-1 right-1 z-10"
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <EventCard event={event} onClick={onEventClick} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
