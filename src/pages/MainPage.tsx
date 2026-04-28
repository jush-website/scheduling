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
import { ChevronLeft, ChevronRight, X, Loader2, Plus } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfflineBanner />

      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-2">
            <div className="flex items-center gap-5">
              <span className="text-7xl md:text-8xl font-black tracking-tighter text-slate-900 leading-none">
                {format(currentDate, 'MM')}
              </span>
              <div className="flex flex-col border-l-4 border-indigo-500 pl-5 py-2">
                <span className="text-3xl font-black text-slate-800 leading-none">{format(currentDate, 'yyyy')}</span>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 mt-2">Calendar Plans</span>
              </div>
            </div>
            <p className="text-slate-400 font-bold text-lg tracking-tight ml-1">
              整理您的思緒，成就每一項計畫。
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex glass rounded-2xl p-1.5 shadow-xl shadow-indigo-500/5">
              <button onClick={handlePrevMonth} className="p-3 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleToday} className="px-6 py-3 text-sm font-black text-slate-700 hover:text-indigo-600 transition-all uppercase tracking-widest">
                Today
              </button>
              <button onClick={handleNextMonth} className="p-3 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleAddEvent}
              className="hidden md:flex bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all items-center gap-3 uppercase tracking-widest text-xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              New Plan
            </button>
          </div>
        </div>

        {eventsLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 blur-2xl bg-indigo-500/20 animate-pulse"></div>
            </div>
            <p className="font-black tracking-[0.4em] text-slate-300 text-xs uppercase">Syncing Cloud Data</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
            {/* 左側日曆 */}
            <div className="xl:col-span-7 2xl:col-span-8 group">
              <div className="hidden xl:block transition-transform duration-500 group-hover:translate-y-[-4px]">
                <MonthView
                  currentDate={currentDate}
                  events={events}
                  onDateClick={setCurrentDate}
                  onEventClick={handleEditEvent}
                />
              </div>

              {/* 手機版清單 */}
              <div className="xl:hidden">
                 <AgendaView
                  events={events.filter(e => e.date.startsWith(format(currentDate, 'yyyy-MM')))}
                  onEventClick={handleEditEvent}
                  onToggleComplete={toggleComplete}
                  onDeleteEvent={handleConfirmDelete}
                />
              </div>
            </div>
            
            {/* 右側摘要側邊欄 */}
            <div className="hidden xl:block xl:col-span-5 2xl:col-span-4 sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-4 pb-10">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-indigo-500 rounded-full"></div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    計畫清單
                  </h3>
                </div>
                <span className="bg-white px-3 py-1.5 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm">
                  {events.filter(e => e.date.startsWith(format(currentDate, 'yyyy-MM'))).length} Plans
                </span>
              </div>
              
              <AgendaView
                events={events.filter(e => e.date.startsWith(format(currentDate, 'yyyy-MM')))}
                onEventClick={handleEditEvent}
                onToggleComplete={toggleComplete}
                onDeleteEvent={handleConfirmDelete}
              />
            </div>
          </div>
        )}
      </main>

      <FAB onClick={handleAddEvent} />

      {/* Modal 視窗優化 */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-white/20">
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingEvent ? '編輯計畫' : '開啟新計畫'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-3 rounded-full hover:bg-slate-100 transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-10">
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
        title="確定要移除計畫嗎？"
        message={`計畫「${eventToDelete?.title}」將被永久刪除。`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
};
