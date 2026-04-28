import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CalendarEvent, EventFormData } from '../types';
import { useAuth } from '../context/AuthContext';

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // 移除 orderBy 以避免索引未建立導致的資料消失，改在本地端排序
    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const eventList: CalendarEvent[] = [];
        snapshot.forEach((doc) => {
          eventList.push({ id: doc.id, ...doc.data() } as CalendarEvent);
        });
        
        // 本地排序：日期由舊到新
        const sortedList = eventList.sort((a, b) => a.date.localeCompare(b.date));
        
        setEvents(sortedList);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addEvent = async (eventData: EventFormData) => {
    if (!user) return;
    await addDoc(collection(db, 'events'), {
      ...eventData,
      isAllDay: true, // 強制全天
      isCompleted: false,
      userId: user.uid,
      createdAt: serverTimestamp()
    });
  };

  const updateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
    const eventRef = doc(db, 'events', id);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: serverTimestamp()
    });
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    const eventRef = doc(db, 'events', id);
    await updateDoc(eventRef, {
      isCompleted: !currentStatus,
      updatedAt: serverTimestamp()
    });
  };

  const deleteEvent = async (id: string) => {
    const eventRef = doc(db, 'events', id);
    await deleteDoc(eventRef);
  };

  return { events, loading, addEvent, updateEvent, deleteEvent, toggleComplete };
};
