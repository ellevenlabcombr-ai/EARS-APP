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

      {/* All-Day / Multi-Day Section */}
      <div className="grid grid-cols-[80px_1fr] border-b border-slate-800 bg-slate-900/40 min-h-[40px]">
        <div className="p-2 border-r border-slate-800 flex items-center justify-end">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-right leading-tight">Dia<br/>Todo</span>
        </div>
        <div className="grid grid-cols-7">
          {weekDays.map((day, dayIdx) => {
            const currentD = startOfDay(day);
            const allDayEvents = events.filter(e => {
              const originalStart = startOfDay(new Date(e.start_time));
              const originalEnd = startOfDay(new Date(e.end_time));
              // Event spans multiple days, or explicitly marked as all_day, and overlaps with current day
              const isMultiDayEvent = !isSameDay(originalStart, originalEnd) || e.is_all_day;
              return isMultiDayEvent && currentD >= originalStart && currentD <= originalEnd;
            });

            return (
              <div key={dayIdx} className="border-r border-slate-800/50 last:border-r-0 p-1 flex flex-col gap-1 min-h-[40px]">
                {allDayEvents.map(event => (
                  <div key={event.id} className="h-[28px] shrink-0">
                    <EventCard event={event} onClick={onEventClick} isMultiDay={true} />
                  </div>
                ))}
              </div>
            );
          })}
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
                  {hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
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
              const currentD = startOfDay(day);
              
              const dayEvents = events.filter(e => {
                const originalStart = startOfDay(new Date(e.start_time));
                const originalEnd = startOfDay(new Date(e.end_time));
                
                // Exclude multi-day events and all_day events from the time grid
                if (!isSameDay(originalStart, originalEnd) || e.is_all_day) return false;
                
                return currentD >= originalStart && currentD <= originalEnd;
              });
              
              return (
                <div key={dayIdx} className="relative border-r border-slate-800/50 last:border-r-0 min-h-full">
                  {dayEvents.map(event => {
                    const originalStart = new Date(event.start_time);
                    const originalEnd = new Date(event.end_time);
                    
                    let eventStart = new Date(originalStart);
                    let eventEnd = new Date(originalEnd);
                    
                    // Constrain start time to today at 07:00 if starting before today's grid
                    if (originalStart < startOfDay(day) || originalStart.getHours() < 7) {
                      eventStart = new Date(day);
                      eventStart.setHours(7, 0, 0, 0);
                    }
                    
                    // Constrain end time to today at 21:00 if ending after today's grid
                    const gridEndHour = 21;
                    if (originalEnd > endOfDay(day) || originalEnd.getHours() >= gridEndHour) {
                      eventEnd = new Date(day);
                      eventEnd.setHours(gridEndHour, 0, 0, 0);
                    }
                    
                    const startHour = eventStart.getHours();
                    const startMin = eventStart.getMinutes();
                    const durationMin = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60);
                    
                    // Skip if duration is negative or zero (e.g., event ended before 07:00 today)
                    if (durationMin <= 0) return null;
                    
                    // Calculate position (each hour is 80px / 5rem)
                    const top = (startHour - 7) * 80 + (startMin / 60) * 80;
                    const height = Math.max((durationMin / 60) * 80, 20); // Min height of 20px for visibility

                    return (
                      <div 
                        key={event.id}
                        className="absolute left-1 right-1 z-10"
                        style={{ top: `${top}px`, height: `${height}px` }}
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
    </div>
  );
}
