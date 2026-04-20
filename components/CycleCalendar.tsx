
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
  addDays,
  subDays,
  parseISO
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface CycleCalendarProps {
  lastPeriodDate: string | null;
  cycleLength: number;
  currentDayInCycle: number;
  phaseKey: string;
}

export function CycleCalendar({ 
  lastPeriodDate, 
  cycleLength = 28, 
  currentDayInCycle 
}: CycleCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  if (!lastPeriodDate) return null;

  const startDate = startOfWeek(startOfMonth(currentMonth));
  const endDate = endOfWeek(endOfMonth(currentMonth));
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayInfo = (date: Date) => {
    const lastPeriod = new Date(lastPeriodDate + 'T00:00:00');
    // Simplified cycle prediction
    const diffTime = date.getTime() - lastPeriod.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Cycle day logic
    const dayInCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1;
    
    let phase = "";
    let color = "";

    if (dayInCycle <= 5) {
      phase = "Menstrual";
      color = "bg-rose-500/40 border-rose-500/50";
    } else if (dayInCycle <= 13) {
      phase = "Folicular";
      color = "bg-emerald-500/20 border-emerald-500/30";
    } else if (dayInCycle <= 15) {
      phase = "Ovulatória";
      color = "bg-amber-500/40 border-amber-500/50";
    } else {
      phase = "Lútea";
      color = "bg-indigo-500/20 border-indigo-500/30";
    }

    return { dayInCycle, phase, color };
  };

  const nextMonth = () => setCurrentMonth(addDays(endOfMonth(currentMonth), 1));
  const prevMonth = () => setCurrentMonth(subDays(startOfMonth(currentMonth), 1));

  return (
    <div className="bg-slate-950/50 rounded-3xl border border-slate-800 p-6 space-y-6">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-white font-black uppercase tracking-widest text-sm">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="text-slate-400 hover:text-white">
            <ChevronLeft size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="text-slate-400 hover:text-white">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xxs font-black text-slate-500 uppercase pb-2">
            {d}
          </div>
        ))}
        {calendarDays.map((date, i) => {
          const { color, dayInCycle } = getDayInfo(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isToday = isSameDay(date, new Date());
          
          return (
            <div 
              key={i} 
              className={`
                aspect-square flex flex-col items-center justify-center rounded-xl border text-xs transition-all relative group
                ${isCurrentMonth ? '' : 'opacity-20'}
                ${color}
                ${isToday ? 'scale-110 z-10 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent'}
              `}
            >
              <span className={`font-bold ${isToday ? 'text-white' : 'text-slate-300'}`}>
                {format(date, 'd')}
              </span>
              {dayInCycle === 1 && isCurrentMonth && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              )}
              
              {/* Tooltip-like info on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 text-xxs font-bold uppercase tracking-wider text-white">
                Dia {dayInCycle} • {getDayInfo(date).phase}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-500/50" />
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Menstrual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Folicular</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500/50" />
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Ovulatória</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500/20 border border-indigo-500/30" />
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">Lútea</span>
        </div>
      </div>
    </div>
  );
}
