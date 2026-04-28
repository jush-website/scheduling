import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, EventSchemaType } from '../../utils/validation';
import { addHours, format, parse } from 'date-fns';
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
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<EventSchemaType>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      isAllDay: false,
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      ...initialData
    }
  });

  const watchStartTime = watch('startTime');
  const watchEndTime = watch('endTime');
  const watchIsAllDay = watch('isAllDay');

  // Time Logic Lock: Auto-adjust endTime if startTime changes
  useEffect(() => {
    if (watchStartTime && watchEndTime) {
      const start = parse(watchStartTime, 'HH:mm', new Date());
      const end = parse(watchEndTime, 'HH:mm', new Date());
      
      if (end <= start) {
        const newEnd = addHours(start, 1);
        setValue('endTime', format(newEnd, 'HH:mm'));
      }
    }
  }, [watchStartTime, watchEndTime, setValue]);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white rounded-lg shadow-sm border">
      <div>
        <label className="block text-sm font-medium mb-1">行程標題</label>
        <input
          {...register('title')}
          placeholder="例如：團隊週會"
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none ${errors.title ? 'border-destructive' : 'border-input'}`}
        />
        {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">日期</label>
          <input
            type="date"
            {...register('date')}
            className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary outline-none"
          />
          {errors.date && <p className="text-destructive text-xs mt-1">{errors.date.message}</p>}
        </div>
        <div className="flex items-end pb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isAllDay')} className="w-4 h-4 rounded text-primary" />
            <span className="text-sm">全天行程</span>
          </label>
        </div>
      </div>

      {!watchIsAllDay && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
          <div>
            <label className="block text-sm font-medium mb-1">開始時間</label>
            <input
              type="time"
              {...register('startTime')}
              className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">結束時間</label>
            <input
              type="time"
              {...register('endTime')}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none ${errors.endTime ? 'border-destructive' : 'border-input'}`}
            />
            {errors.endTime && <p className="text-destructive text-xs mt-1">{errors.endTime.message}</p>}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">備註 (選填)</label>
        <textarea
          {...register('description')}
          className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !isOnline}
          className="flex-1 bg-primary text-primary-foreground py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '儲存行程'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-md font-medium hover:opacity-80 transition-all"
        >
          取消
        </button>
      </div>
      
      {!isOnline && (
        <p className="text-destructive text-center text-xs">離線狀態下無法儲存資料</p>
      )}
    </form>
  );
};
