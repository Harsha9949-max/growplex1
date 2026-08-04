import { doc, getDoc, setDoc } from "firebase/firestore";
import { Check, Copy, Database, Eye, EyeOff, Globe, Key, MessageSquare, Save, Send, Server, Shield, Sparkles, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";

const TABS = ["General Settings", "Payment Gateway", "API Keys", "Security", "Maintenance"];

function ApiKeyInput({
  label,
  value,
  onChange,
  placeholder,
  description,
  forceShow,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  description?: string;
  forceShow?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const isVisible = forceShow || show;

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-text-muted">{label}</label>
        {value ? (
          <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${isVisible ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
            {isVisible ? "Visible" : "Hidden"}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-500 italic">Not set</span>
        )}
      </div>
      <div className="relative flex items-center">
        <input
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-brand-primary border border-brand-border rounded-lg pl-4 pr-20 py-2 text-text-main font-mono text-sm focus:outline-none focus:border-brand-accent/50"
        />
        <div className="absolute right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShow(!show)}
            title={isVisible ? "Hide key" : "Show key"}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-brand-border/50 rounded transition-colors"
          >
            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!value}
            title="Copy API key"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-brand-border/50 rounded transition-colors disabled:opacity-30"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
      {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("General Settings");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAllKeys, setShowAllKeys] = useState(false);

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
    firebaseStorageBucket: "",
    geminiApiKey: "",
    require2fa: false,
    ipWhitelisting: false,
    sessionTimeout: 60,
    maintenanceMode: false,
    maintenanceMessage: "We are currently performing maintenance. Please check back later.",
    disableRegistrations: false,
    telegramBotToken: "",
    telegramChatId: "",
    googleChatWebhookUrl: "",
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
      
      // Attempt to register Telegram Webhook if token exists
      if (settings.telegramBotToken) {
        const webhookUrl = `${window.location.origin}/api/telegram-webhook`;
        try {
          await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
        } catch (e) {
          console.error("Failed to set telegram webhook:", e);
        }
      }

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">System Settings</h1>
          <p className="text-text-muted text-sm mt-1">Manage global application configurations and API keys</p>
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
                <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg space-y-6">
                  <div>
                    <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                      <Globe size={18} className="text-brand-accent"/> General Data
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-text-muted mb-1 block">Platform Name</label>
                        <input type="text" value={settings.platformName} onChange={e => handleChange('platformName', e.target.value)} className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                      <Send size={18} className="text-brand-accent"/> Telegram Notifications
                    </h3>
                    <div className="space-y-4">
                      <ApiKeyInput
                        label="Telegram Bot Token"
                        value={settings.telegramBotToken}
                        onChange={val => handleChange('telegramBotToken', val)}
                        placeholder="e.g., 123456:ABCdefGhIJKlmNOpqrSTUvwxYZ"
                        description="Obtain from @BotFather on Telegram"
                        forceShow={showAllKeys}
                      />
                      <div>
                        <label className="text-sm font-medium text-text-muted mb-1 block">Telegram Chat ID</label>
                        <input type="text" value={settings.telegramChatId} onChange={e => handleChange('telegramChatId', e.target.value)} placeholder="e.g., 6376644545" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50 font-mono text-sm" />
                        <p className="text-xs text-text-muted mt-1">Your personal or group chat ID for receiving order alerts</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                      <MessageSquare size={18} className="text-brand-accent"/> Google Chat Integration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-text-muted mb-1 block">Google Chat Webhook URL</label>
                        <input type="text" value={settings.googleChatWebhookUrl || ""} onChange={e => handleChange('googleChatWebhookUrl', e.target.value)} placeholder="https://chat.googleapis.com/v1/spaces/.../webhooks/..." className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50 font-mono text-sm" />
                        <p className="text-xs text-text-muted mt-1">Incoming webhook URL to publish team conversations directly to a Google Chat space.</p>
                      </div>
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
                    <ApiKeyInput
                      label="Razorpay Key ID"
                      value={settings.razorpayKey}
                      onChange={val => handleChange('razorpayKey', val)}
                      placeholder="rzp_live_xxxxxxxxxxx"
                      description="Public key used for Razorpay checkout"
                      forceShow={showAllKeys}
                    />
                    <ApiKeyInput
                      label="Razorpay Key Secret"
                      value={settings.razorpaySecret}
                      onChange={val => handleChange('razorpaySecret', val)}
                      placeholder="Enter Razorpay Secret"
                      description="Secret key used for payment verification"
                      forceShow={showAllKeys}
                    />
                  </div>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === "API Keys" && (
                <div className="space-y-6">
                  {/* Master Key Reveal Toggle */}
                  <div className="flex items-center justify-between bg-brand-surface border border-brand-border rounded-xl p-4 shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Key size={16} className="text-brand-accent" /> API Key Controls
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5">Toggle plain text visibility for all API keys on this page</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAllKeys(!showAllKeys)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        showAllKeys 
                          ? 'bg-brand-accent text-brand-primary border-brand-accent' 
                          : 'bg-brand-primary text-brand-accent border-brand-border hover:bg-brand-border/50'
                      }`}
                    >
                      {showAllKeys ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showAllKeys ? "Mask All API Keys" : "Reveal All API Keys"}
                    </button>
                  </div>

                  {/* Provider SMM API Key */}
                  <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                      <Server size={18} className="text-brand-accent"/> SMM Provider API
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-text-muted mb-1 block">Provider API Endpoint URL</label>
                        <input
                          type="text"
                          value={settings.providerApiUrl}
                          onChange={e => handleChange('providerApiUrl', e.target.value)}
                          placeholder="https://growwsmmpanel.com/api/v2"
                          className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main font-mono text-sm focus:outline-none focus:border-brand-accent/50"
                        />
                      </div>
                      <ApiKeyInput
                        label="Provider API Key"
                        value={settings.providerApiKey}
                        onChange={val => handleChange('providerApiKey', val)}
                        placeholder="e.g., 349a8f21bc087e..."
                        description="Used for automated service syncing and order processing"
                        forceShow={showAllKeys}
                      />
                    </div>
                  </div>

                  {/* Gemini AI API Key */}
                  <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                      <Sparkles size={18} className="text-brand-accent"/> Google Gemini AI API
                    </h3>
                    <div className="space-y-4">
                      <ApiKeyInput
                        label="Gemini API Key"
                        value={settings.geminiApiKey}
                        onChange={val => handleChange('geminiApiKey', val)}
                        placeholder="AIzaSy..."
                        description="Used for AI Chat assistant and automated smart recommendations"
                        forceShow={showAllKeys}
                      />
                    </div>
                  </div>

                  {/* Firebase Configuration */}
                  <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                      <Database size={18} className="text-brand-accent"/> Firebase Configuration
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-text-muted mb-1 block">Project ID</label>
                          <input type="text" value={settings.firebaseProjectId} onChange={e => handleChange('firebaseProjectId', e.target.value)} placeholder="your-firebase-project-id" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main font-mono text-sm focus:outline-none focus:border-brand-accent/50" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-text-muted mb-1 block">Auth Domain</label>
                          <input type="text" value={settings.firebaseAuthDomain} onChange={e => handleChange('firebaseAuthDomain', e.target.value)} placeholder="project.firebaseapp.com" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main font-mono text-sm focus:outline-none focus:border-brand-accent/50" />
                        </div>
                      </div>
                      <ApiKeyInput
                        label="Firebase API Key"
                        value={settings.firebaseApiKey}
                        onChange={val => handleChange('firebaseApiKey', val)}
                        placeholder="AIzaSy..."
                        description="Client web API key for Firebase Firestore & Authentication"
                        forceShow={showAllKeys}
                      />
                      <div>
                        <label className="text-sm font-medium text-text-muted mb-1 block">Storage Bucket (Optional)</label>
                        <input type="text" value={settings.firebaseStorageBucket || ""} onChange={e => handleChange('firebaseStorageBucket', e.target.value)} placeholder="project.appspot.com" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main font-mono text-sm focus:outline-none focus:border-brand-accent/50" />
                      </div>
                    </div>
                  </div>

                  {/* Payment Gateway API Keys */}
                  <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                      <Key size={18} className="text-brand-accent"/> Payment Gateway API Keys
                    </h3>
                    <div className="space-y-4">
                      <ApiKeyInput
                        label="Razorpay Key ID"
                        value={settings.razorpayKey}
                        onChange={val => handleChange('razorpayKey', val)}
                        placeholder="rzp_live_xxxxxxxxxxx"
                        description="Public API key for client checkout"
                        forceShow={showAllKeys}
                      />
                      <ApiKeyInput
                        label="Razorpay Key Secret"
                        value={settings.razorpaySecret}
                        onChange={val => handleChange('razorpaySecret', val)}
                        placeholder="Razorpay Secret"
                        description="Secret key for server side order verification"
                        forceShow={showAllKeys}
                      />
                    </div>
                  </div>

                  {/* Telegram Bot Keys */}
                  <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                      <Send size={18} className="text-brand-accent"/> Telegram Integration
                    </h3>
                    <div className="space-y-4">
                      <ApiKeyInput
                        label="Telegram Bot Token"
                        value={settings.telegramBotToken}
                        onChange={val => handleChange('telegramBotToken', val)}
                        placeholder="123456:ABCdefGhIJKlm..."
                        description="Bot token from Telegram @BotFather"
                        forceShow={showAllKeys}
                      />
                      <div>
                        <label className="text-sm font-medium text-text-muted mb-1 block">Telegram Chat ID</label>
                        <input type="text" value={settings.telegramChatId} onChange={e => handleChange('telegramChatId', e.target.value)} placeholder="e.g., 6376644545" className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main font-mono text-sm focus:outline-none focus:border-brand-accent/50" />
                      </div>
                    </div>
                  </div>

                  {/* Pricing Configuration */}
                  <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                      <Database size={18} className="text-brand-accent"/> Pricing Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-text-muted mb-1 block">Default Markup Margin (%)</label>
                        <input type="number" value={settings.defaultMarkupMargin} onChange={e => handleChange('defaultMarkupMargin', Number(e.target.value))} className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50 font-mono text-sm" />
                        <p className="text-xs text-text-muted mt-1">This margin is applied to base prices globally to calculate final customer prices.</p>
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
                      <input type="number" value={settings.sessionTimeout} onChange={e => handleChange('sessionTimeout', Number(e.target.value))} className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50 font-mono text-sm" />
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

