import React from 'react';
import { getMonthDays, format, isSameMonth, isSameDay } from '../../utils/date';
import { CalendarEvent } from '../../types';

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
    return events.filter(event => event.date === format(day, 'yyyy-MM-dd'));
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      {/* Weekdays Header */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={idx}
              onClick={() => onDateClick(day)}
              className={`min-h-[120px] border-b border-r p-1 transition-colors cursor-pointer hover:bg-muted/20 ${
                !isCurrentMonth ? 'bg-muted/10' : ''
              } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full font-medium ${
                  isToday ? 'bg-primary text-primary-foreground' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary border border-primary/20 truncate hover:bg-primary/20 transition-colors"
                  >
                    {!event.isAllDay && <span className="mr-1 font-bold">{event.startTime}</span>}
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
