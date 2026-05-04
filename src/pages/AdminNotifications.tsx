import { doc, getDoc, setDoc } from "firebase/firestore";
import { Bell, Mail, Send, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";

export default function AdminNotifications() {
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState({
    telegram: { active: true, title: "Telegram Bot", desc: "Send order updates to a Telegram channel", icon: "Send" },
    email: { active: false, title: "Email Alerts", desc: "Send summary emails for new orders", icon: "Mail" },
    dashboard: { active: true, title: "Dashboard Alerts", desc: "In-app notifications for admins", icon: "Bell" },
    sms: { active: false, title: "SMS Gateway", desc: "SMS alerts to customers", icon: "Smartphone" }
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const docRef = doc(db, "system", "notifications");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // Merge with defaults so we don't overwrite icons and titles
          const data = docSnap.data();
          setNotifications(prev => {
            const merged = { ...prev };
            Object.keys(data).forEach(key => {
              if (merged[key as keyof typeof merged]) {
                merged[key as keyof typeof merged].active = data[key].active;
              }
            });
            return merged;
          });
        }
      } catch (error) {
        console.error("Failed to fetch notifications settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleToggle = async (key: keyof typeof notifications) => {
    const newStatus = !notifications[key].active;
    const updatedState = {
      ...notifications,
      [key]: {
        ...notifications[key],
        active: newStatus
      }
    };
    
    setNotifications(updatedState);
    
    // Auto save on toggle
    try {
      await setDoc(doc(db, "system", "notifications"), updatedState, { merge: true });
    } catch (error) {
      console.error("Failed to update notification setting:", error);
      // Revert if failed
      setNotifications(notifications);
      alert("Failed to update setting");
    }
  };

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case "Send": return Send;
      case "Mail": return Mail;
      case "Bell": return Bell;
      case "Smartphone": return Smartphone;
      default: return Bell;
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Notifications System</h1>
          <p className="text-text-muted text-sm mt-1">Configure automated alerts and updates</p>
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Object.keys(notifications) as Array<keyof typeof notifications>).map((key) => {
            const mod = notifications[key];
            const Icon = getIcon(mod.icon);
            return (
              <div key={key} className="bg-brand-surface border border-brand-border p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl transition-colors ${mod.active ? 'bg-brand-accent/10 text-brand-accent' : 'bg-brand-primary text-text-muted'}`}>
                    <Icon size={24} />
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase transition-colors ${mod.active ? 'bg-green-500/10 text-green-500' : 'bg-brand-primary text-text-muted'}`}>
                    {mod.active ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-text-main">{mod.title}</h3>
                <p className="text-sm text-text-muted mt-1 mb-4 h-10">{mod.desc}</p>
                <button 
                  onClick={() => handleToggle(key)}
                  className={`w-full py-2 border rounded-lg text-sm font-medium transition-colors ${mod.active ? 'border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-primary' : 'bg-brand-primary border-brand-border text-text-muted hover:text-text-main'}`}
                >
                  {mod.active ? "Disable" : "Enable"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
