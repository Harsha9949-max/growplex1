import { FileText } from "lucide-react";
import { AdminLayout } from "../components/AdminLayout";

export default function AdminLogs() {
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Audit Logs</h1>
          <p className="text-text-muted text-sm mt-1">Track system events and admin actions</p>
        </div>
      </div>
      <div className="bg-brand-surface border border-brand-border rounded-xl shadow-lg flex flex-col items-center justify-center py-20 text-text-muted">
        <FileText size={48} className="mb-4 opacity-50" />
        <p>Log system initialized. New events will appear here.</p>
      </div>
    </AdminLayout>
  );
}
