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
    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-slate-800">
        {weekDays.map((day, i) => (
          <div 
            key={i} 
            className={`p-2 md:p-4 text-center border-r border-slate-800 last:border-r-0 ${
              isSameDay(day, new Date()) ? 'bg-cyan-500/5' : ''
            }`}
          >
            <p className="text-[10px] md:text-xxs font-black text-slate-500 uppercase tracking-widest mb-1">
              {format(day, "EEE", { locale: ptBR })}
            </p>
            <p className={`text-sm md:text-lg font-black ${isSameDay(day, new Date()) ? 'text-cyan-400' : 'text-white'}`}>
              {format(day, "dd")}
            </p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="relative h-[40rem] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-7 relative h-[40rem]">
          {/* Grid Lines */}
          <div className="absolute inset-0 grid grid-rows-[repeat(14,1fr)] pointer-events-none">
            {hours.map(hour => (
              <div key={hour} className="border-b border-slate-800/20 w-full" />
            ))}
          </div>

          {weekDays.map((day, dayIdx) => {
            const currentD = startOfDay(day);
            
            const dayEvents = events.filter(e => {
              const originalStart = startOfDay(new Date(e.start_time));
              const originalEnd = startOfDay(new Date(e.end_time));
              
              // Handle all events in the same grid
              return currentD >= originalStart && currentD <= originalEnd;
            });
            
            return (
              <div key={dayIdx} className="relative border-r border-slate-800/30 last:border-r-0 min-h-full">
                {dayEvents.map(event => {
                  const originalStart = new Date(event.start_time);
                  const originalEnd = new Date(event.end_time);
                  
                  let eventStart = new Date(originalStart);
                  let eventEnd = new Date(originalEnd);
                  
                  // Constrain start time to 07:00
                  if (originalStart < startOfDay(day) || originalStart.getHours() < 7) {
                    eventStart = new Date(day);
                    eventStart.setHours(7, 0, 0, 0);
                  }
                  
                  // Constrain end time to 21:00
                  const gridEndHour = 21;
                  if (originalEnd > endOfDay(day) || originalEnd.getHours() >= gridEndHour) {
                    eventEnd = new Date(day);
                    eventEnd.setHours(gridEndHour, 0, 0, 0);
                  }
                  
                  const startHour = eventStart.getHours();
                  const startMin = eventStart.getMinutes();
                  const durationMin = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60);
                  
                  if (durationMin <= 0 && !event.is_all_day) return null;
                  
                  const hourHeight = 640 / 14; // 40rem = 640px
                  
                  let top = (startHour - 7) * hourHeight + (startMin / 60) * hourHeight;
                  let height = 32; // Fixed compact height for all events

                  if (event.is_all_day) {
                    top = 0;
                    height = 24;
                  }

                  return (
                    <div 
                      key={event.id}
                      className="absolute left-0.5 right-0.5 z-10"
                      style={{ top: `${top}px`, height: `${height}px`, minHeight: '18px' }}
                    >
                      <EventCard event={event} onClick={onEventClick} isMultiDay={originalStart < startOfDay(day) || originalEnd > endOfDay(day)} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
