import { getToken, onMessage } from 'firebase/messaging';
import { getFCM, db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export const requestNotificationPermission = async (userId: string) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = await getFCM();
      if (!messaging) return null;

      const currentToken = await getToken(messaging, {
        vapidKey: 'BPrv-mock-vapid-key-replace-with-actual' // User needs to provide actual VAPID key from Firebase Console
      });

      if (currentToken) {
        // Save token to user profile
        await updateDoc(doc(db, 'users', userId), {
          fcmToken: currentToken
        });
        return currentToken;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
      }
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
  }
  return null;
};

export const onMessageListener = async () => {
  const messaging = await getFCM();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    toast(payload.notification?.body || 'New message received!', {
      icon: '🔔',
      style: {
        background: '#1A1A1A',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
      }
    });
  });
};
