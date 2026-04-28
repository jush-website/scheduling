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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Simple query to avoid index issues
    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const eventList: CalendarEvent[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          eventList.push({ 
            id: doc.id, 
            ...data,
            date: data.targetDate 
          } as CalendarEvent);
        });
        
        const sortedList = eventList.sort((a, b) => b.targetDate.localeCompare(a.targetDate));
        setEvents(sortedList);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Safety timeout: if no data in 10 seconds, stop loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [user]);

  const addEvent = async (eventData: EventFormData) => {
    if (!user) return;
    await addDoc(collection(db, 'events'), {
      ...eventData,
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

  return { events, loading, error, addEvent, updateEvent, deleteEvent, toggleComplete };
};
