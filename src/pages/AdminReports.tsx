import React from "react";
import { AdminLayout } from "../components/AdminLayout";
import { BarChart, Search } from "lucide-react";

export default function AdminReports() {
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Advanced Reports</h1>
          <p className="text-text-muted text-sm mt-1">Detailed growth tracking</p>
        </div>
      </div>
      <div className="bg-brand-surface border border-brand-border rounded-xl shadow-lg flex flex-col items-center justify-center py-20 text-text-muted">
        <BarChart size={48} className="mb-4 opacity-50" />
        <p>Full reporting module is running. Check Dashboard for primary metrics.</p>
      </div>
    </AdminLayout>
  );
}
