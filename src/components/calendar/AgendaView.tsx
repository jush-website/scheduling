import React from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { CalendarEvent } from '../../types';
import { CheckCircle2, Circle, Edit3, Trash2, CalendarDays } from 'lucide-react';

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
  const groupedEvents = events.sort((a, b) => a.date.localeCompare(b.date)).reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const sortedDates = Object.keys(groupedEvents).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white/40 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-[2rem] animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <CalendarDays className="w-10 h-10 opacity-20" />
        </div>
        <p className="text-lg font-black tracking-tight text-slate-500">尚無計畫安排</p>
        <p className="text-sm font-medium opacity-60">點擊右下角按鈕開啟新的一天</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {sortedDates.map(dateStr => {
        const date = parseISO(dateStr);
        const dayEvents = groupedEvents[dateStr];

        return (
          <div key={dateStr} className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 px-2">
              <div className={`h-10 w-10 flex flex-col items-center justify-center rounded-2xl shadow-sm ${
                isToday(date) ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-900'
              }`}>
                <span className="text-[10px] font-black uppercase leading-none opacity-60">{format(date, 'MMM')}</span>
                <span className="text-lg font-black leading-tight">{format(date, 'dd')}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {format(date, 'EEEE', { locale: zhTW })}
                </h3>
                {isToday(date) && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Today Priority</span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className={`glass-card group relative rounded-[1.5rem] p-6 transition-all duration-300 active:scale-[0.99] ${
                    event.isCompleted ? 'opacity-60 grayscale-[0.5]' : ''
                  }`}
                >
                  <div className="flex gap-5">
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleComplete(event.id, event.isCompleted)}
                      className={`shrink-0 mt-0.5 transition-all duration-300 hover:scale-110 ${
                        event.isCompleted ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'
                      }`}
                    >
                      {event.isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 fill-emerald-50" />
                      ) : (
                        <Circle className="w-7 h-7 stroke-[1.5]" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className={`font-black text-xl leading-snug tracking-tight transition-all ${
                          event.isCompleted ? 'text-slate-400 line-through decoration-2' : 'text-slate-800'
                        }`}>
                          {event.title}
                        </h4>
                      </div>
                      
                      {event.description && (
                        <p className={`text-base mt-2 font-medium leading-relaxed line-clamp-2 ${
                          event.isCompleted ? 'text-slate-300' : 'text-slate-500'
                        }`}>
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                    <button
                      onClick={() => onEventClick(event)}
                      className="p-2.5 bg-white/80 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-100 transition-all"
                      title="編輯"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event)}
                      className="p-2.5 bg-white/80 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 transition-all"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
