import React from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { CalendarEvent } from '../../types';
import { Clock } from 'lucide-react';

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ events, onEventClick }) => {
  // Group events by date
  const groupedEvents = events.sort((a, b) => a.date.localeCompare(b.date)).reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const sortedDates = Object.keys(groupedEvents).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>目前沒有任何行程</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(dateStr => {
        const date = parseISO(dateStr);
        const dayEvents = groupedEvents[dateStr];

        return (
          <div key={dateStr} className="space-y-3">
            <div className="flex items-center gap-2 px-4 py-1 bg-muted/30 rounded-full w-fit">
              <span className={`text-sm font-bold ${isToday(date) ? 'text-primary' : 'text-foreground'}`}>
                {format(date, 'M/d (E)', { locale: zhTW })}
              </span>
              {isToday(date) && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase font-black">今天</span>}
            </div>

            <div className="space-y-2">
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="bg-white border rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg truncate">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {event.isAllDay ? (
                        <span className="text-xs font-bold bg-muted px-2 py-1 rounded">全天</span>
                      ) : (
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <Clock className="w-3 h-3" />
                          <span className="text-sm">{event.startTime}</span>
                        </div>
                      )}
                    </div>
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
