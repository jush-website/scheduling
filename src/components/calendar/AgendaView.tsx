import React from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { CalendarEvent } from '../../types';
import { Clock, CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white border rounded-2xl border-dashed">
        <p className="text-lg font-medium">今天沒有安排行程</p>
        <p className="text-sm">點擊右下角按鈕新增一個吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {sortedDates.map(dateStr => {
        const date = parseISO(dateStr);
        const dayEvents = groupedEvents[dateStr];

        return (
          <div key={dateStr} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <span className={`text-xl font-black ${isToday(date) ? 'text-primary' : 'text-slate-800'}`}>
                {format(date, 'MM/dd (E)', { locale: zhTW })}
              </span>
              {isToday(date) && (
                <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Today
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className={`group relative bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 ${
                    event.isCompleted ? 'border-l-emerald-400 bg-slate-50/50' : 'border-l-primary'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleComplete(event.id, event.isCompleted)}
                      className={`shrink-0 mt-1 transition-colors ${
                        event.isCompleted ? 'text-emerald-500' : 'text-slate-300 hover:text-primary'
                      }`}
                    >
                      {event.isCompleted ? <CheckCircle2 className="w-6 h-6 fill-emerald-50" /> : <Circle className="w-6 h-6" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-lg leading-tight truncate ${
                        event.isCompleted ? 'text-slate-400 line-through decoration-2' : 'text-slate-800'
                      }`}>
                        {event.title}
                      </h4>
                      
                      <div className="flex items-center gap-3 mt-2">
                        {event.isAllDay ? (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">全天</span>
                        ) : (
                          <div className={`flex items-center gap-1 font-bold text-sm ${event.isCompleted ? 'text-slate-400' : 'text-primary'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className={`text-sm mt-3 line-clamp-2 ${event.isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Floating on hover) */}
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEventClick(event)}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors"
                      title="編輯"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event)}
                      className="p-2 hover:bg-destructive/10 rounded-lg text-slate-400 hover:text-destructive transition-colors"
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
