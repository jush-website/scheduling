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
import { ChevronLeft, ChevronRight, X, Plus, Calendar as CalendarIcon, Loader2, AlertCircle, Settings, LogOut, CheckCircle2, Search, ArrowUpDown } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../context/AuthContext';

export const MainPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, loading: eventsLoading, error: eventsError, addEvent, updateEvent, deleteEvent, toggleComplete } = useEvents();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

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
    setShowDayEvents(false);
    setShowCompletedModal(false);
  };

  const handleConfirmDelete = (event: CalendarEvent) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
    setShowDayEvents(false);
    setShowCompletedModal(false);
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
    setShowSettings(false);
    setShowCompletedModal(false);
    setEditingEvent(null);
    setCurrentDate(new Date());
  };

  const backdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModals();
  };

  // 分類計畫與排序過濾
  const ongoingEvents = events
    .filter(e => !e.isCompleted)
    .filter(e => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (e.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return a.targetDate.localeCompare(b.targetDate);
      }
      return a.title.localeCompare(b.title);
    });

  const completedEvents = events
    .filter(e => e.isCompleted)
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));

  const selectedDateEvents = events.filter(e => e.targetDate === format(currentDate, 'yyyy-MM-dd'));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      <OfflineBanner />

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10 md:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-1 relative">
            <div className="flex items-center justify-between md:justify-start gap-4">
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

              {/* Header Actions (Completed & Settings) */}
              <div className="flex items-center gap-2">
                {/* Completed Button */}
                <button 
                  onClick={() => setShowCompletedModal(true)}
                  className="p-3 bg-white border border-slate-100 rounded-2xl text-emerald-500 shadow-sm active:scale-95 transition-all relative"
                  title="已完成的計畫"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  {completedEvents.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {completedEvents.length}
                    </span>
                  )}
                </button>

                {/* Settings Button */}
                <div className="md:hidden relative">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 shadow-sm active:scale-95 transition-all"
                  >
                    <Settings className="w-6 h-6" />
                  </button>
                  
                  {showSettings && (
                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[70] animate-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">目前使用者</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{user?.displayName}</p>
                      </div>
                      <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors font-bold text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        登出系統
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowMobileCalendar(true)}
              className="flex-1 md:flex-none p-4 bg-white border border-slate-100 rounded-2xl text-slate-700 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-3 font-black text-sm xl:hidden"
            >
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              <span>開啟日曆</span>
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
          <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600 text-sm font-bold flex items-center gap-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>連線錯誤: {eventsError}。請檢查網路或 Firebase 權限。</span>
          </div>
        )}

        {eventsLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full"></div>
            </div>
            <p className="font-black tracking-[0.4em] text-slate-300 text-xs uppercase">正在同步雲端資料</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-10 items-start">
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
            <div className="xl:col-span-5 2xl:col-span-4 space-y-8">
              {/* Ongoing Section */}
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                      進行中的計畫
                    </h3>
                    <span className="bg-white px-3 py-2 rounded-xl text-slate-500 text-xs font-black uppercase tracking-widest border border-slate-100 shadow-sm">
                      {ongoingEvents.length}
                    </span>
                  </div>
                  
                  {/* Search and Filter UI */}
                  <div className="flex flex-col sm:flex-row gap-2 px-1">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text"
                        placeholder="搜尋計畫名稱或描述..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all shadow-sm"
                      />
                    </div>
                    <button 
                      onClick={() => setSortBy(sortBy === 'date' ? 'title' : 'date')}
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                      {sortBy === 'date' ? '依日期排序' : '依名稱排序'}
                    </button>
                  </div>
                </div>

                <div className="px-1 md:px-0">
                  <AgendaView
                    events={ongoingEvents}
                    onEventClick={handleEditEvent}
                    onToggleComplete={toggleComplete}
                    onDeleteEvent={handleConfirmDelete}
                  />
                </div>
              </div>
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
                    {format(currentDate, 'M月')}
                  </button>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button onClick={closeModals} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
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

      {/* Completed Events Modal */}
      {showCompletedModal && (
        <div 
          onClick={backdropClick}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        >
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-8 py-7 border-b border-slate-50 flex items-center justify-between bg-emerald-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">已完成的計畫</h3>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">TOTAL {completedEvents.length} ITEMS</p>
              </div>
              <button onClick={() => setShowCompletedModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto">
              {completedEvents.length > 0 ? (
                <AgendaView
                  events={completedEvents}
                  onEventClick={handleEditEvent}
                  onToggleComplete={toggleComplete}
                  onDeleteEvent={handleConfirmDelete}
                />
              ) : (
                <div className="py-16 text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-slate-100 mx-auto" />
                  <p className="text-slate-400 font-bold">目前沒有已完成的計畫</p>
                </div>
              )}
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
            <div className="px-8 py-7 border-b border-slate-50 flex items-center justify-between bg-indigo-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{format(currentDate, 'MM/dd')} 計畫清單</h3>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">{format(currentDate, 'yyyy')} WORKSPACE</p>
              </div>
              <button onClick={() => setShowDayEvents(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto">
              {selectedDateEvents.length > 0 ? (
                <AgendaView
                  events={selectedDateEvents}
                  onEventClick={handleEditEvent}
                  onToggleComplete={toggleComplete}
                  onDeleteEvent={handleConfirmDelete}
                />
              ) : (
                <div className="py-16 text-center space-y-6">
                  <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CalendarIcon className="w-12 h-12 text-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-500 font-black text-lg">這一天目前沒有計畫</p>
                    <p className="text-slate-400 text-sm font-bold">開始規劃您的精彩一天吧！</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDayEvents(false);
                      handleAddEvent();
                    }}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                  >
                    立即新增計畫
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
