import React from 'react';
import { getMonthDays, format, isSameMonth, isSameDay } from '../../utils/date';
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
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => event.date === format(day, 'yyyy-MM-dd'));
  };

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-4 border border-white/60 overflow-hidden shadow-2xl shadow-indigo-500/5">
      {/* Weekdays Header */}
      <div className="grid grid-cols-7 mb-4">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={idx}
              onClick={() => onDateClick(day)}
              className={`min-h-[110px] rounded-3xl p-2 transition-all duration-300 cursor-pointer group ${
                isCurrentMonth ? 'bg-white/60 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/10' : 'opacity-20'
              }`}
            >
              <div className="flex justify-start mb-2 ml-1">
                <span className={`inline-flex items-center justify-center w-8 h-8 text-sm rounded-xl font-black transition-all ${
                  isToday 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' 
                    : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-1 overflow-hidden px-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded-lg truncate transition-all ${
                      event.isCompleted 
                        ? 'bg-slate-100 text-slate-400 line-through' 
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[9px] font-black text-slate-300 text-center uppercase tracking-tighter">
                    + {dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
