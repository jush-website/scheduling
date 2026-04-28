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
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<EventSchemaType>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      startDate: today,
      targetDate: today,
      description: '',
      ...initialData
    } as any
  });

  const onFormSubmit: SubmitHandler<EventSchemaType> = async (data) => {
    await onSubmit(data);
  };

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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Plan Title</label>
        <input
          {...register('title')}
          placeholder="What's the plan?"
          className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm ${errors.title ? 'border-rose-500' : 'border-slate-200'}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Start Date</label>
          <input
            type="date"
            {...register('startDate')}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Date</label>
          <input
            type="date"
            {...register('targetDate')}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description (Optional)</label>
        <textarea
          {...register('description')}
          placeholder="Add details..."
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[70px] text-sm"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !isOnline}
          className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Plan'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
