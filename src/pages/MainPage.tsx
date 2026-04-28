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
import { ChevronLeft, ChevronRight, X, Plus, Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';

export const MainPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, loading: eventsLoading, error: eventsError, addEvent, updateEvent, deleteEvent, toggleComplete } = useEvents();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [showDayEvents, setShowDayEvents] = useState(false);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    if (showMobileCalendar) {
      setShowMobileCalendar(false);
    }
    setShowDayEvents(true);
  };

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

  const closeModals = () => {
    setIsFormOpen(false);
    setIsDeleteModalOpen(false);
    setShowMobileCalendar(false);
    setShowDayEvents(false);
    setEditingEvent(null);
  };

  const backdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModals();
  };

  const selectedDateEvents = events.filter(e => e.targetDate === format(currentDate, 'yyyy-MM-dd'));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfflineBanner />

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none">
                  {format(currentDate, 'MM')}
                </span>
                <span className="text-4xl md:text-5xl font-black tracking-tighter text-indigo-500 leading-none">
                  {format(currentDate, 'dd')}
                </span>
              </div>
              <div className="flex flex-col border-l-4 border-indigo-500 pl-4 py-1">
                <span className="text-2xl font-black text-slate-800 leading-none">{format(currentDate, 'yyyy')}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mt-1">計畫視圖</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowMobileCalendar(true)}
              className="xl:hidden p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-sm transition-all active:scale-95 flex items-center gap-2 font-bold text-sm"
            >
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              開啟日曆
            </button>
            <div className="hidden md:flex glass rounded-2xl p-1 shadow-indigo-500/5">
              <button onClick={handlePrevMonth} className="p-2.5 hover:bg-white rounded-xl transition-all text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleToday} className="px-6 py-2 text-sm font-black text-slate-700 hover:text-indigo-600 transition-all uppercase tracking-widest">
                今天
              </button>
              <button onClick={handleNextMonth} className="p-2.5 hover:bg-white rounded-xl transition-all text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddEvent}
              className="hidden md:flex bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:scale-105 transition-all items-center gap-2 uppercase tracking-widest text-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              新增計畫
            </button>
          </div>
        </div>

        {eventsError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-4 h-4" />
            <span>連線錯誤: {eventsError}。請檢查網路或 Firebase 權限。</span>
          </div>
        )}

        {eventsLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            <p className="font-black tracking-[0.3em] text-slate-300 text-[10px] uppercase">正在同步雲端資料</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Calendar Column - Desktop Only */}
            <div className="hidden xl:block xl:col-span-7 2xl:col-span-8">
              <MonthView
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEditEvent}
              />
            </div>

            {/* List Column */}
            <div className="xl:col-span-5 2xl:col-span-4 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  進行中的計畫
                </h3>
                <span className="bg-white px-2.5 py-1.5 rounded-lg text-slate-500 text-xs font-black uppercase tracking-widest border border-slate-100 shadow-sm">
                  {events.length} 個項目
                </span>
              </div>
              <AgendaView
                events={events}
                onEventClick={handleEditEvent}
                onToggleComplete={toggleComplete}
                onDeleteEvent={handleConfirmDelete}
              />
            </div>
          </div>
        )}
      </main>

      <FAB onClick={handleAddEvent} />

      {/* Mobile Calendar Modal */}
      {showMobileCalendar && (
        <div 
          onClick={backdropClick}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 xl:hidden"
        >
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">選擇日期</h3>
                <div className="flex bg-slate-100 rounded-xl p-0.5">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={handleToday} className="px-3 py-1 text-[10px] font-black text-slate-700 hover:text-indigo-600 transition-all uppercase">
                    今
                  </button>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button onClick={() => setShowMobileCalendar(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <MonthView
                currentDate={currentDate}
                events={events}
                onDateClick={handleDateClick}
                onEventClick={handleEditEvent}
              />
            </div>
          </div>
        </div>
      )}

      {/* Day Events Modal */}
      {showDayEvents && (
        <div 
          onClick={backdropClick}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        >
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-indigo-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{format(currentDate, 'MM/dd')} 計畫清單</h3>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">{format(currentDate, 'yyyy')} WORKSPACE</p>
              </div>
              <button onClick={() => setShowDayEvents(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {selectedDateEvents.length > 0 ? (
                <AgendaView
                  events={selectedDateEvents}
                  onEventClick={handleEditEvent}
                  onToggleComplete={toggleComplete}
                  onDeleteEvent={handleConfirmDelete}
                />
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <CalendarIcon className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold">這一天目前沒有任何計畫</p>
                  <button
                    onClick={() => {
                      setShowDayEvents(false);
                      handleAddEvent();
                    }}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-sm shadow-lg shadow-indigo-100"
                  >
                    立即新增
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div 
          onClick={backdropClick}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        >
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-500 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingEvent ? '編輯計畫' : '建立新計畫'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <EventForm
                initialData={editingEvent || { startDate: format(currentDate, 'yyyy-MM-dd'), targetDate: format(currentDate, 'yyyy-MM-dd') }}
                onSubmit={handleSubmit}
                onCancel={() => setIsFormOpen(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div 
          onClick={backdropClick}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        >
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95 duration-500">
            <ConfirmModal
              isOpen={true}
              title="確定要刪除嗎？"
              message={`您確定要移除「${eventToDelete?.title}」嗎？`}
              confirmText="確定刪除"
              cancelText="取消"
              onConfirm={handleDelete}
              onCancel={() => setIsDeleteModalOpen(false)}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
};
