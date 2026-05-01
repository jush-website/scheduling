import React from 'react';
import { format, isToday, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
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
  const getStatus = (event: CalendarEvent) => {
    if (event.isCompleted) return { label: '已完成', color: 'text-emerald-500 bg-emerald-50' };
    
    const today = startOfDay(new Date());
    const target = startOfDay(parseISO(event.targetDate));
    const diff = differenceInDays(target, today);

    if (diff < 0) return { label: `延遲 ${Math.abs(diff)} 天`, color: 'text-rose-500 bg-rose-50', icon: AlertCircle };
    if (diff === 0) return { label: '今天到期', color: 'text-amber-500 bg-amber-50', icon: Clock };
    return { label: `剩餘 ${diff} 天`, color: 'text-indigo-500 bg-indigo-50', icon: Clock };
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white/20 border-2 border-dashed border-slate-200 rounded-[2rem]">
        <CalendarDays className="w-8 h-8 opacity-20 mb-2" />
        <p className="text-sm font-black text-slate-500">本月尚無任何計畫</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map(event => {
        const status = getStatus(event);
        const StatusIcon = status.icon;

        return (
          <div
            key={event.id}
            className={`glass-card group relative rounded-2xl p-5 transition-all duration-300 ${
              event.isCompleted ? 'opacity-50' : ''
            }`}
          >
            <div className="flex gap-5">
              <button
                onClick={() => onToggleComplete(event.id, event.isCompleted)}
                className={`shrink-0 transition-all ${
                  event.isCompleted ? 'text-emerald-500' : 'text-slate-200 hover:text-indigo-500'
                }`}
              >
                {event.isCompleted ? <CheckCircle2 className="w-7 h-7 fill-emerald-50" /> : <Circle className="w-7 h-7 stroke-[1.5]" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className={`font-black text-xl tracking-tight truncate max-w-[280px] ${
                    event.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}>
                    {event.title}
                  </h4>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${status.color}`}>
                    {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
                    {status.label}
                  </span>
                </div>
                
                {event.description && (
                  <p className={`text-lg mb-3 font-medium leading-relaxed line-clamp-2 ${
                    event.isCompleted ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {event.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <span>{format(parseISO(event.startDate), 'MM/dd')}</span>
                  <span className="opacity-40">→</span>
                  <span className={isToday(parseISO(event.targetDate)) ? 'text-indigo-500' : ''}>
                    {format(parseISO(event.targetDate), 'MM/dd')}
                  </span>
                  <span className="ml-1 opacity-40 font-normal">
                    ({format(parseISO(event.targetDate), 'EEEE', { locale: zhTW })})
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
              <button onClick={() => onEventClick(event)} className="p-2 bg-white/80 md:bg-transparent shadow-sm md:shadow-none border border-slate-100 md:border-none rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => onDeleteEvent(event)} className="p-2 bg-white/80 md:bg-transparent shadow-sm md:shadow-none border border-slate-100 md:border-none rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
