import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { OfflineBanner } from '../components/layout/OfflineBanner';
import { MonthView } from '../components/calendar/MonthView';
import { AgendaView } from '../components/calendar/AgendaView';
import { FAB } from '../components/layout/FAB';
import { EventForm } from '../components/form/EventForm';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { CalendarEvent } from '../types';
import { format, addMonths, subMonths } from '../utils/date';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';

export const MainPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, loading: eventsLoading, addEvent, updateEvent, deleteEvent } = useEvents();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, formData);
      } else {
        await addEvent(formData);
      }
      setIsFormOpen(false);
      setEditingEvent(null);
    } catch (error) {
      alert("儲存失敗，請檢查網路連線。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteEvent(eventToDelete.id);
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
      setIsFormOpen(false);
    } catch (error) {
      alert("刪除失敗。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <OfflineBanner />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {format(currentDate, 'yyyy年 M月')}
            </h2>
            <p className="text-muted-foreground">管理您的個人與團隊行程</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-white border rounded-md shadow-sm">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-muted transition-colors border-r">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleToday} className="px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                今天
              </button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-muted transition-colors border-l">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleAddEvent}
              className="hidden md:flex bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:opacity-90 transition-opacity items-center gap-2"
            >
              新增行程
            </button>
          </div>
        </div>

        {eventsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>正在同步雲端資料...</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block">
              <MonthView
                currentDate={currentDate}
                events={events}
                onDateClick={(date) => {
                  setCurrentDate(date);
                }}
                onEventClick={handleEditEvent}
              />
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
              <AgendaView
                events={events.filter(e => {
                  const eventDate = new Date(e.date);
                  return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
                })}
                onEventClick={handleEditEvent}
              />
            </div>
          </>
        )}
      </main>

      <FAB onClick={handleAddEvent} />

      {/* Event Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/20">
              <h3 className="text-lg font-bold">{editingEvent ? '編輯行程' : '新增行程'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <EventForm
                initialData={editingEvent || { date: format(currentDate, 'yyyy-MM-dd') }}
                onSubmit={handleSubmit}
                onCancel={() => setIsFormOpen(false)}
                isSubmitting={isSubmitting}
              />
              {editingEvent && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setEventToDelete(editingEvent);
                      setIsDeleteModalOpen(true);
                    }}
                    className="w-full text-destructive text-sm font-medium py-2 rounded-md hover:bg-destructive/5 transition-colors"
                  >
                    刪除此行程
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="確定要刪除行程嗎？"
        message={`您確定要刪除「${eventToDelete?.title}」嗎？此動作無法復原。`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
};
