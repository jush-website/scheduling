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
  serverTimestamp,
  orderBy
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
    // 注意：如果 Firestore 提示需要建立索引，請點擊 console 中的連結
    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const eventList: CalendarEvent[] = [];
        snapshot.forEach((doc) => {
          eventList.push({ id: doc.id, ...doc.data() } as CalendarEvent);
        });
        setEvents(eventList);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore subscription error:", error);
        setLoading(false); // 報錯時也要停止 loading
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addEvent = async (eventData: EventFormData) => {
    if (!user) return;
    await addDoc(collection(db, 'events'), {
      ...eventData,
      isCompleted: false, // 預設未完成
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
