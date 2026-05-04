import { doc, getDoc, setDoc } from "firebase/firestore";
import { Database, Globe, Key, Save, Send, Shield, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";

const TABS = ["General Settings", "Payment Gateway", "API Keys", "Security", "Maintenance"];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("General Settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    platformName: "Growplex",
    supportEmail: "support@growplex.com",
    supportPhone: "+91 9999999999",
    upiId: "growplex@upi",
    razorpayKey: "",
    razorpaySecret: "",
    providerApiUrl: "https://growwsmmpanel.com/api/v2",
    providerApiKey: "",
    defaultMarkupMargin: 40,
    firebaseProjectId: "",
    firebaseApiKey: "",
    firebaseAuthDomain: "",
    require2fa: false,
    ipWhitelisting: false,
    sessionTimeout: 60,
    maintenanceMode: false,
    maintenanceMessage: "We are currently performing maintenance. Please check back later.",
    disableRegistrations: false,
    telegramBotToken: "",
    telegramChatId: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "system", "settings");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "system", "settings"), settings, { merge: true });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">System Settings</h1>
          <p className="text-text-muted text-sm mt-1">Manage global application configurations</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading || saving}
          className="bg-brand-accent text-brand-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
        >
          <Save size={18} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {TABS.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-brand-accent/10 border border-brand-accent text-brand-accent' 
                  : 'bg-brand-surface border border-brand-border text-text-muted hover:text-text-main hover:border-brand-accent/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
             <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <>
              {/* General Settings Tab */}
              {activeTab === "General Settings" && (
                <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                    <Globe size={18} className="text-brand-accent"/> General Data
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text-muted mb-1 block">Platform Name</label>
                      <input type="text" value={settings.platformName} onChange={e => handleChange('platformName', e.target.value)} className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-text-muted mb-1 block">Support Email</label>
                        <input type="email" value={settings.supportEmail} onChange={e => handleChange('supportEmail', e.target.value)} className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-muted mb-1 block">Support Phone</label>
                        <input type="text" value={settings.supportPhone} onChange={e => handleChange('supportPhone', e.target.value)} className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold font-heading mb-4 mt-6 border-b border-brand-border pb-3 flex items-center gap-2">
                    <Send size={18} className="text-brand-accent"/> Telegram Notifications
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text-muted mb-1 block">Telegram Bot Token</label>
                      <input type="password" value={settings.telegramBotToken} onChange={e => handleChange('telegramBotToken', e.target.value)} placeholder="e.g., 123456:ABCdefGhIJKlmNOpqrSTUvwxYZ" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                      <p className="text-xs text-text-muted mt-1">Get this from @BotFather on Telegram</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted mb-1 block">Telegram Chat ID</label>
                      <input type="text" value={settings.telegramChatId} onChange={e => handleChange('telegramChatId', e.target.value)} placeholder="e.g., 6376644545" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                      <p className="text-xs text-text-muted mt-1">Your personal or group chat ID for receiving order alerts</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Gateway Tab */}
              {activeTab === "Payment Gateway" && (
                <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                    <Key size={18} className="text-brand-accent"/> Payment Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text-muted mb-1 block">UPI ID</label>
                      <input type="text" value={settings.upiId} onChange={e => handleChange('upiId', e.target.value)} className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted mb-1 block">Razorpay Key (Optional)</label>
                      <input type="password" value={settings.razorpayKey} onChange={e => handleChange('razorpayKey', e.target.value)} placeholder="rzp_live_xxxxxxxxxxx" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted mb-1 block">Razorpay Secret (Optional)</label>
                      <input type="password" value={settings.razorpaySecret} onChange={e => handleChange('razorpaySecret', e.target.value)} placeholder="Enter Razorpay Secret" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === "API Keys" && (
                <div className="space-y-6">
                  <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                      <Database size={18} className="text-brand-accent"/> Pricing Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-text-muted mb-1 block">Default Markup Margin (%)</label>
                        <input type="number" value={settings.defaultMarkupMargin} onChange={e => handleChange('defaultMarkupMargin', Number(e.target.value))} className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                        <p className="text-xs text-text-muted mt-1">This margin is applied to base prices globally to calculate final customer prices.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                      <Key size={18} className="text-brand-accent"/> Firebase Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-text-muted mb-1 block">Project ID</label>
                        <input type="text" value={settings.firebaseProjectId} onChange={e => handleChange('firebaseProjectId', e.target.value)} placeholder="your-firebase-project-id" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-text-muted mb-1 block">API Key</label>
                          <input type="password" value={settings.firebaseApiKey} onChange={e => handleChange('firebaseApiKey', e.target.value)} placeholder="Firebase API Key" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-text-muted mb-1 block">Auth Domain</label>
                          <input type="text" value={settings.firebaseAuthDomain} onChange={e => handleChange('firebaseAuthDomain', e.target.value)} placeholder="project.firebaseapp.com" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "Security" && (
                <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                    <Shield size={18} className="text-brand-accent"/> Security Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-brand-primary rounded-xl border border-brand-border">
                      <div>
                        <p className="text-sm font-medium text-text-main">Two-Factor Authentication</p>
                        <p className="text-xs text-text-muted mt-0.5">Require 2FA for admin accounts</p>
                      </div>
                      <button onClick={() => handleChange('require2fa', !settings.require2fa)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${settings.require2fa ? 'bg-brand-accent' : 'bg-brand-border'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${settings.require2fa ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-brand-primary rounded-xl border border-brand-border">
                      <div>
                        <p className="text-sm font-medium text-text-main">IP Whitelisting</p>
                        <p className="text-xs text-text-muted mt-0.5">Restrict admin access to specific IPs</p>
                      </div>
                      <button onClick={() => handleChange('ipWhitelisting', !settings.ipWhitelisting)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${settings.ipWhitelisting ? 'bg-brand-accent' : 'bg-brand-border'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${settings.ipWhitelisting ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted mb-1 block">Session Timeout (minutes)</label>
                      <input type="number" value={settings.sessionTimeout} onChange={e => handleChange('sessionTimeout', Number(e.target.value))} className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                    </div>
                  </div>
                </div>
              )}

              {/* Maintenance Tab */}
              {activeTab === "Maintenance" && (
                <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                    <Wrench size={18} className="text-brand-accent"/> Maintenance Mode
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-brand-primary rounded-xl border border-brand-border">
                      <div>
                        <p className="text-sm font-medium text-text-main">Enable Maintenance Mode</p>
                        <p className="text-xs text-text-muted mt-0.5">Show maintenance page to all users</p>
                      </div>
                      <button onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-brand-accent' : 'bg-brand-border'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted mb-1 block">Maintenance Message</label>
                      <textarea 
                        value={settings.maintenanceMessage}
                        onChange={e => handleChange('maintenanceMessage', e.target.value)}
                        rows={3}
                        className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50 resize-none" 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-brand-primary rounded-xl border border-brand-border">
                      <div>
                        <p className="text-sm font-medium text-text-main">Disable New Registrations</p>
                        <p className="text-xs text-text-muted mt-0.5">Temporarily prevent new users from signing up</p>
                      </div>
                      <button onClick={() => handleChange('disableRegistrations', !settings.disableRegistrations)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${settings.disableRegistrations ? 'bg-brand-accent' : 'bg-brand-border'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${settings.disableRegistrations ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
