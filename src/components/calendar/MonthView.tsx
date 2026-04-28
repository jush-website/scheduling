import React from 'react';
import { getMonthDays, format, isSameMonth, isSameDay, parseISO, isBefore, startOfDay } from '../../utils/date';
import type { CalendarEvent } from '../../types';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  onDateClick,
  onEventClick
}) => {
  const days = getMonthDays(currentDate);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const getEventsForDay = (day: Date) => {
    const current = startOfDay(day);
    return events.filter(event => {
      const start = startOfDay(parseISO(event.startDate));
      const end = startOfDay(parseISO(event.targetDate));
      return current >= start && current <= end;
    });
  };

  const today = startOfDay(new Date());

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-3 border border-white/60 overflow-hidden shadow-2xl shadow-indigo-500/5">
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isTodayDate = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          const dayStr = format(day, 'yyyy-MM-dd');

          return (
            <div
              key={idx}
              onClick={() => onDateClick(day)}
              className={`min-h-[100px] rounded-2xl p-1.5 transition-all duration-300 cursor-pointer group relative ${
                isCurrentMonth ? 'bg-white/60 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/10' : 'opacity-10'
              }`}
            >
              <div className="flex justify-start mb-1 ml-0.5">
                <span className={`inline-flex items-center justify-center w-6 h-6 text-[10px] rounded-lg font-black transition-all z-10 ${
                  isTodayDate 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-1 overflow-hidden px-0.5 relative z-10">
                {dayEvents.slice(0, 4).map(event => {
                  const isStart = event.startDate === dayStr;
                  const isEnd = event.targetDate === dayStr;
                  const isCompletedOnThisDay = event.isCompleted && event.completedAt === dayStr;
                  const isDelayed = !event.isCompleted && isBefore(parseISO(event.targetDate), today);
                  
                  let colorClass = 'bg-indigo-500/10 text-indigo-700';
                  let barClass = 'bg-indigo-500/10';
                  
                  if (event.isCompleted) {
                    colorClass = isCompletedOnThisDay ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-300';
                    barClass = 'bg-slate-100/50';
                  } else if (isDelayed) {
                    colorClass = 'bg-rose-50 text-rose-600';
                    barClass = 'bg-rose-100/30';
                  }

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`relative px-1.5 h-4 flex items-center text-[8px] font-black truncate transition-all ${colorClass} ${
                        !isStart && !isEnd ? 'rounded-none' : 'rounded-md'
                      } ${isStart ? 'rounded-r-none' : ''} ${isEnd ? 'rounded-l-none' : ''}`}
                    >
                      {(isStart || (idx % 7 === 0)) && (
                        <span className="flex items-center gap-1 z-20">
                          {isCompletedOnThisDay && <span className="w-1 h-1 bg-emerald-500 rounded-full" />}
                          {event.title}
                        </span>
                      )}
                      {/* 背景區間線條 - 統一高度與對齊 */}
                      <div className={`absolute inset-y-0 -left-1 -right-1 ${barClass} -z-10`} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
