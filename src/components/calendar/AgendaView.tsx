import React from 'react';
import { format, isToday, parseISO, differenceInDays, startOfDay } from 'date-fns';
import type { CalendarEvent } from '../../types';
import { CheckCircle2, Circle, Edit3, Trash2, CalendarDays, AlertCircle, Clock } from 'lucide-react';

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onToggleComplete: (id: string, currentStatus: boolean) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ 
  events, 
  onEventClick,
  onToggleComplete,
  onDeleteEvent
}) => {
  // Sorting: Latest Target Date at the top (31st -> 1st)
  const sortedEvents = [...events].sort((a, b) => b.targetDate.localeCompare(a.targetDate));

  const getStatus = (event: CalendarEvent) => {
    if (event.isCompleted) return { label: 'Completed', color: 'text-emerald-500 bg-emerald-50' };
    
    const today = startOfDay(new Date());
    const target = startOfDay(parseISO(event.targetDate));
    const diff = differenceInDays(target, today);

    if (diff < 0) return { label: `Delayed ${Math.abs(diff)}d`, color: 'text-rose-500 bg-rose-50', icon: AlertCircle };
    if (diff === 0) return { label: 'Due Today', color: 'text-amber-500 bg-amber-50', icon: Clock };
    return { label: `${diff}d left`, color: 'text-indigo-500 bg-indigo-50', icon: Clock };
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white/20 border-2 border-dashed border-slate-200 rounded-[2rem]">
        <CalendarDays className="w-8 h-8 opacity-20 mb-2" />
        <p className="text-sm font-black text-slate-500">No plans for this month</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedEvents.map(event => {
        const status = getStatus(event);
        const StatusIcon = status.icon;

        return (
          <div
            key={event.id}
            className={`glass-card group relative rounded-2xl p-4 transition-all duration-300 ${
              event.isCompleted ? 'opacity-50' : ''
            }`}
          >
            <div className="flex gap-4">
              <button
                onClick={() => onToggleComplete(event.id, event.isCompleted)}
                className={`shrink-0 transition-all ${
                  event.isCompleted ? 'text-emerald-500' : 'text-slate-200 hover:text-indigo-500'
                }`}
              >
                {event.isCompleted ? <CheckCircle2 className="w-6 h-6 fill-emerald-50" /> : <Circle className="w-6 h-6 stroke-[1.5]" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className={`font-black text-sm tracking-tight truncate max-w-[200px] ${
                    event.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}>
                    {event.title}
                  </h4>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1 ${status.color}`}>
                    {StatusIcon && <StatusIcon className="w-2.5 h-2.5" />}
                    {status.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <span>{format(parseISO(event.startDate), 'MMM d')}</span>
                  <span>→</span>
                  <span className={isToday(parseISO(event.targetDate)) ? 'text-indigo-500' : ''}>
                    {format(parseISO(event.targetDate), 'MMM d')}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => onEventClick(event)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-300 hover:text-indigo-600 transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDeleteEvent(event)} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
