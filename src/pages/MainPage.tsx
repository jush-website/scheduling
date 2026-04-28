import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { OfflineBanner } from '../components/layout/OfflineBanner';
import { MonthView } from '../components/calendar/MonthView';
import { AgendaView } from '../components/calendar/AgendaView';
import { FAB } from '../components/layout/FAB';
import { EventForm } from '../components/form/EventForm';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import type { CalendarEvent } from '../types';
import { format, addMonths, subMonths } from '../utils/date';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';

export const MainPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, loading: eventsLoading, addEvent, updateEvent, deleteEvent, toggleComplete } = useEvents();
  
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

  const handleConfirmDelete = (event: CalendarEvent) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
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
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              {format(currentDate, 'yyyy年 M月')}
            </h2>
            <p className="text-slate-500 font-medium">歡迎回來，這是您目前的排程進度</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-white border rounded-xl shadow-sm overflow-hidden">
              <button onClick={handlePrevMonth} className="p-2.5 hover:bg-slate-50 transition-colors border-r">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleToday} className="px-5 py-2.5 text-sm font-bold hover:bg-slate-50 transition-colors">
                今天
              </button>
              <button onClick={handleNextMonth} className="p-2.5 hover:bg-slate-50 transition-colors border-l">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleAddEvent}
              className="hidden md:flex bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all items-center gap-2"
            >
              新增行程
            </button>
          </div>
        </div>

        {eventsLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
            <div className="relative">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse"></div>
            </div>
            <p className="font-bold tracking-widest text-sm uppercase">正在同步雲端資料...</p>
          </div>
        ) : (
          <>
            {/* 桌面版日曆 - 依然保留，但手機版/列表版會是主推的卡片式 */}
            <div className="hidden xl:block mb-10">
              <MonthView
                currentDate={currentDate}
                events={events}
                onDateClick={setCurrentDate}
                onEventClick={handleEditEvent}
              />
            </div>

            {/* 卡片式視圖 (主要視圖) */}
            <div className="xl:hidden">
               <AgendaView
                events={events.filter(e => {
                  const eventDate = new Date(e.date);
                  return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
                })}
                onEventClick={handleEditEvent}
                onToggleComplete={toggleComplete}
                onDeleteEvent={handleConfirmDelete}
              />
            </div>
            
            {/* 在寬螢幕下也顯示列表作為摘要 */}
            <div className="hidden xl:block">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                本月行程清單
              </h3>
              <AgendaView
                events={events.filter(e => {
                  const eventDate = new Date(e.date);
                  return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
                })}
                onEventClick={handleEditEvent}
                onToggleComplete={toggleComplete}
                onDeleteEvent={handleConfirmDelete}
              />
            </div>
          </>
        )}
      </main>

      <FAB onClick={handleAddEvent} />

      {/* Event Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800">{editingEvent ? '編輯行程' : '新增行程'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-8">
              <EventForm
                initialData={editingEvent || { date: format(currentDate, 'yyyy-MM-dd') }}
                onSubmit={handleSubmit}
                onCancel={() => setIsFormOpen(false)}
                isSubmitting={isSubmitting}
              />
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
