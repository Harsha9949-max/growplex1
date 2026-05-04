import { doc, getDoc, setDoc } from "firebase/firestore";
import { FileEdit, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface ContentState {
  announcementText: string;
  announcementActive: boolean;
  announcementLink: string;
  faqs: FAQ[];
}

export default function AdminContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [content, setContent] = useState<ContentState>({
    announcementText: "Welcome to Growplex! Check out our new premium services.",
    announcementActive: true,
    announcementLink: "/services",
    faqs: [
      { id: "1", question: "How long does delivery take?", answer: "Usually within 1-24 hours depending on the service." }
    ]
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, "system", "content");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "system", "content"), content, { merge: true });
      alert("Content saved successfully!");
    } catch (error) {
      console.error("Failed to save content:", error);
      alert("Error saving content.");
    } finally {
      setSaving(false);
    }
  };

  const addFAQ = () => {
    setContent({
      ...content,
      faqs: [...content.faqs, { id: Date.now().toString(), question: "", answer: "" }]
    });
  };

  const removeFAQ = (id: string) => {
    setContent({
      ...content,
      faqs: content.faqs.filter(faq => faq.id !== id)
    });
  };

  const updateFAQ = (id: string, field: "question" | "answer", value: string) => {
    setContent({
      ...content,
      faqs: content.faqs.map(faq => faq.id === id ? { ...faq, [field]: value } : faq)
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Content Management</h1>
          <p className="text-text-muted text-sm mt-1">Update website content and announcements</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading || saving}
          className="bg-brand-accent text-brand-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-accent-hover transition-colors disabled:opacity-50"
        >
          <Save size={18} /> {saving ? "Saving..." : "Save Content"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Announcement Banner Section */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg h-fit">
            <h3 className="text-lg font-bold font-heading mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
              <FileEdit size={18} className="text-brand-accent"/> Announcement Banner
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-brand-primary rounded-xl border border-brand-border">
                <div>
                  <p className="text-sm font-medium text-text-main">Show Announcement</p>
                  <p className="text-xs text-text-muted mt-0.5">Display a banner at the top of the site</p>
                </div>
                <button 
                  onClick={() => setContent({...content, announcementActive: !content.announcementActive})}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${content.announcementActive ? 'bg-brand-accent' : 'bg-brand-border'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${content.announcementActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted mb-1 block">Banner Text</label>
                <input 
                  type="text" 
                  value={content.announcementText}
                  onChange={(e) => setContent({...content, announcementText: e.target.value})}
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" 
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-muted mb-1 block">Action Link (Optional)</label>
                <input 
                  type="text" 
                  value={content.announcementLink}
                  onChange={(e) => setContent({...content, announcementLink: e.target.value})}
                  placeholder="/services or https://example.com"
                  className="w-full bg-brand-primary border border-brand-border rounded-lg px-4 py-2 text-text-main focus:outline-none focus:border-brand-accent/50" 
                />
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4 border-b border-brand-border pb-3">
              <h3 className="text-lg font-bold font-heading flex items-center gap-2">
                <FileEdit size={18} className="text-brand-accent"/> FAQ Management
              </h3>
              <button 
                onClick={addFAQ}
                className="text-sm bg-brand-primary border border-brand-border hover:border-brand-accent text-text-main py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus size={14}/> Add FAQ
              </button>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {content.faqs.map((faq, index) => (
                <div key={faq.id} className="p-4 bg-brand-primary rounded-xl border border-brand-border relative group">
                  <button 
                    onClick={() => removeFAQ(faq.id)}
                    className="absolute top-2 right-2 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1 block">Question {index + 1}</label>
                      <input 
                        type="text" 
                        value={faq.question}
                        onChange={(e) => updateFAQ(faq.id, "question", e.target.value)}
                        className="w-full bg-transparent border-b border-brand-border focus:border-brand-accent pb-1 text-sm text-text-main focus:outline-none transition-colors" 
                        placeholder="E.g. What is your refund policy?"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1 block">Answer</label>
                      <textarea 
                        value={faq.answer}
                        onChange={(e) => updateFAQ(faq.id, "answer", e.target.value)}
                        rows={2}
                        className="w-full bg-transparent border-b border-brand-border focus:border-brand-accent pb-1 text-sm text-text-main focus:outline-none transition-colors resize-none" 
                        placeholder="Answer details..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {content.faqs.length === 0 && (
                <div className="text-center py-8 text-text-muted border border-dashed border-brand-border rounded-xl">
                  No FAQs added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
