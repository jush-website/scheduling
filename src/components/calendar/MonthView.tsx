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
    return events.filter(event => event.targetDate === format(day, 'yyyy-MM-dd'));
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

          return (
            <div
              key={idx}
              onClick={() => onDateClick(day)}
              className={`min-h-[80px] rounded-2xl p-1.5 transition-all duration-300 cursor-pointer group ${
                isCurrentMonth ? 'bg-white/60 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/10' : 'opacity-10'
              }`}
            >
              <div className="flex justify-start mb-1 ml-0.5">
                <span className={`inline-flex items-center justify-center w-6 h-6 text-[10px] rounded-lg font-black transition-all ${
                  isTodayDate 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-0.5 overflow-hidden px-0.5">
                {dayEvents.slice(0, 3).map(event => {
                  const isDelayed = !event.isCompleted && isBefore(parseISO(event.targetDate), today);
                  const colorClass = event.isCompleted 
                    ? 'bg-slate-100 text-slate-400' 
                    : isDelayed ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600';

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`px-1.5 py-0.5 text-[8px] font-black rounded-md truncate transition-all ${colorClass}`}
                    >
                      {event.title}
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
