import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { AppNotification } from '../types';
import { toast } from 'react-hot-toast';

export const useNotifications = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
      
      // Trigger toast for new unread notifications
      const lastNotification = data[0];
      if (lastNotification && !lastNotification.isRead) {
        const isNew = !notifications.find(n => n.id === lastNotification.id);
        if (isNew) {
           toast(lastNotification.message, {
             icon: lastNotification.type === 'success' ? '✅' : '🔔',
             style: {
               background: '#1A1A1A',
               color: '#fff',
               border: '1px solid rgba(255,255,255,0.05)',
               borderRadius: '16px',
             }
           });
        }
      }

      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.uid, notifications]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userProfile?.uid) return;
    try {
      const unread = notifications.filter(n => !n.isRead);
      if (unread.length === 0) return;

      const batch = writeBatch(db);
      unread.forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { isRead: true });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    loading,
    markAsRead,
    markAllAsRead
  };
};
