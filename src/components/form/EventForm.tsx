import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema } from '../../utils/validation';
import type { EventSchemaType } from '../../utils/validation';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface EventFormProps {
  initialData?: Partial<EventSchemaType>;
  onSubmit: (data: EventSchemaType) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const isOnline = useNetworkStatus();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<EventSchemaType>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      isAllDay: true,
      description: '',
      ...initialData
    } as any // Use 'as any' for defaultValues to bypass strict partial mismatch if any
  });

  const onFormSubmit: SubmitHandler<EventSchemaType> = async (data) => {
    await onSubmit(data);
  };

  // Prevent leaving if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">行程名稱</label>
        <input
          {...register('title')}
          placeholder="輸入計畫名稱..."
          className={`w-full px-4 py-3 bg-slate-100 border-2 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${errors.title ? 'border-destructive' : 'border-transparent'}`}
        />
        {errors.title && <p className="text-destructive text-xs font-bold mt-1 ml-2">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">計畫日期</label>
        <input
          type="date"
          {...register('date')}
          className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">詳細備註 (選填)</label>
        <textarea
          {...register('description')}
          placeholder="補充說明..."
          className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all min-h-[100px]"
        />
      </div>

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !isOnline}
          className="flex-[2] bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '確認新增'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
        >
          取消
        </button>
      </div>
    </form>
  );
};
