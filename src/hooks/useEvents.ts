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
import { CalendarEvent, EventFormData } from '../types';
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

    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList: CalendarEvent[] = [];
      snapshot.forEach((doc) => {
        eventList.push({ id: doc.id, ...doc.data() } as CalendarEvent);
      });
      setEvents(eventList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addEvent = async (eventData: EventFormData) => {
    if (!user) return;
    await addDoc(collection(db, 'events'), {
      ...eventData,
      userId: user.uid,
      createdAt: serverTimestamp()
    });
  };

  const updateEvent = async (id: string, eventData: EventFormData) => {
    const eventRef = doc(db, 'events', id);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: serverTimestamp()
    });
  };

  const deleteEvent = async (id: string) => {
    const eventRef = doc(db, 'events', id);
    await deleteDoc(eventRef);
  };

  return { events, loading, addEvent, updateEvent, deleteEvent };
};
