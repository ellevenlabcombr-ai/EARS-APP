"use client";

import React from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  isToday,
  addDays
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { AgendaEvent, getCategoryColor } from "@/types/agenda";

interface MonthCalendarGridProps {
  events: AgendaEvent[];
  onEventClick: (event: AgendaEvent) => void;
  currentDate: Date;
}

export function MonthCalendarGrid({ events, onEventClick, currentDate }: MonthCalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden">
      {/* Header - Weekdays */}
      <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/50">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center border-r border-slate-800 last:border-r-0">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Grid - Days */}
      <div className="grid grid-cols-7 auto-rows-[minmax(120px,1fr)]">
        {calendarDays.map((day, idx) => {
          const dayEvents = events.filter(event => 
            isSameDay(new Date(event.start_time), day) || 
            (new Date(event.start_time) < day && new Date(event.end_time) > day)
          );

          return (
            <div 
              key={idx} 
              className={`min-h-[120px] p-2 border-r border-b border-slate-800 transition-colors hover:bg-slate-800/10 ${
                !isSameMonth(day, monthStart) ? 'opacity-30' : ''
              } ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday(day) 
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' 
                    : 'text-slate-400'
                }`}>
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                {dayEvents.map((event) => {
                  const colorClass = getCategoryColor(event);
                  const isPersonalOrTravel = event.category === 'personal' || event.category === 'travel';
                  
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold truncate transition-all active:scale-95 border ${
                        isPersonalOrTravel 
                          ? 'border-slate-700 bg-slate-800/50 text-slate-300'
                          : `border-transparent ${colorClass.split(' ')[0]} text-slate-950`
                      }`}
                      title={event.title}
                    >
                      {!event.is_all_day && format(new Date(event.start_time), "HH:mm")}{" "}
                      {event.title}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
