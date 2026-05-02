import React, { useState, useRef } from "react";
import { AdminLayout } from "../components/AdminLayout";
import { Database, Download, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

const COLLECTIONS_TO_BACKUP = ["services", "orders", "users", "system"];

export default function AdminBackup() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    setStatus({ type: 'info', message: 'Generating backup snapshot...' });
    
    try {
      const backupData: Record<string, any> = {};

      for (const collectionName of COLLECTIONS_TO_BACKUP) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        backupData[collectionName] = {};
        querySnapshot.forEach((docSnap) => {
          backupData[collectionName][docSnap.id] = docSnap.data();
        });
      }

      const backupString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([backupString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `growplex-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus({ type: 'success', message: 'Backup successfully exported!' });
    } catch (error) {
      console.error("Export failed:", error);
      setStatus({ type: 'error', message: 'Failed to generate backup. Check console for details.' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("WARNING: This will overwrite existing data with the backup contents. Are you absolutely sure?")) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImporting(true);
    setStatus({ type: 'info', message: 'Reading backup file...' });

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const backupData = JSON.parse(content);
          
          setStatus({ type: 'info', message: 'Restoring data to Firebase (this may take a moment)...' });

          let batch = writeBatch(db);
          let operationCount = 0;

          // Maximum writes per batch in Firestore is 500
          for (const collectionName of Object.keys(backupData)) {
            const collectionData = backupData[collectionName];
            for (const docId of Object.keys(collectionData)) {
              const docRef = doc(db, collectionName, docId);
              batch.set(docRef, collectionData[docId]);
              operationCount++;

              // Commit if we hit the limit and start a new batch
              if (operationCount === 490) {
                await batch.commit();
                batch = writeBatch(db);
                operationCount = 0;
              }
            }
          }

          if (operationCount > 0) {
            await batch.commit();
          }

          setStatus({ type: 'success', message: 'System successfully restored from backup!' });
        } catch (err) {
          console.error("Parse/Upload error:", err);
          setStatus({ type: 'error', message: 'Failed to restore backup. Invalid file format or network error.' });
        } finally {
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Import failed:", error);
      setStatus({ type: 'error', message: 'Failed to read backup file.' });
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">System Backups</h1>
          <p className="text-text-muted text-sm mt-1">Manage database snapshots and disaster recovery</p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-brand-primary border-brand-border text-brand-accent'}`}>
          {status.type === 'error' ? <AlertTriangle size={20} /> : status.type === 'success' ? <CheckCircle2 size={20} /> : <Database size={20} className="animate-pulse" />}
          <p className="font-medium">{status.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-brand-surface border border-brand-border p-8 rounded-xl shadow-lg flex flex-col items-center justify-center text-center">
           <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mb-4">
             <Download size={32} className="text-brand-accent" />
           </div>
           <h3 className="font-bold text-xl mb-2 text-text-main">Export Backup</h3>
           <p className="text-sm text-text-muted mb-6 max-w-sm">
             Download a complete, unified snapshot of all critical collections (services, orders, users, and system settings).
           </p>
           <button 
             onClick={handleExport}
             disabled={exporting || importing}
             className="bg-brand-accent text-brand-primary px-6 py-2.5 rounded-xl font-bold hover:bg-brand-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
           >
             {exporting ? (
               <><div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div> Exporting...</>
             ) : (
               <>Start Export</>
             )}
           </button>
        </div>

        <div className="bg-brand-surface border border-brand-border p-8 rounded-xl shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
           <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
             <Upload size={32} className="text-red-500" />
           </div>
           <h3 className="font-bold text-xl mb-2 text-text-main">Restore Data</h3>
           <p className="text-sm text-text-muted mb-6 max-w-sm">
             Upload a previous snapshot JSON to roll back database changes. 
             <strong className="text-red-400 block mt-1">Warning: Overwrites existing data.</strong>
           </p>
           <input 
             type="file" 
             accept=".json"
             ref={fileInputRef}
             onChange={handleImport}
             className="hidden" 
           />
           <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={exporting || importing}
             className="bg-brand-surface border-2 border-red-500/50 text-red-500 px-6 py-2.5 rounded-xl font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
           >
             {importing ? (
               <><div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div> Restoring...</>
             ) : (
               <>Select Backup File</>
             )}
           </button>
        </div>
      </div>
    </AdminLayout>
  );
}
