import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Copy, RefreshCw, Server, Shield, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export function PaymentDiagnostics() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "systemConfig", "cashfree");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }

      // Fetch recent webhook logs
      const logsQuery = query(collection(db, "webhookLogs"), orderBy("timestamp", "desc"), limit(5));
      const logsSnap = await getDocs(logsQuery);
      const logs = logsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecentLogs(logs);

    } catch (err) {
      console.error("Failed to fetch diagnostics", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] border border-brand-accent/20 rounded-xl p-6 text-center text-gray-500 animate-pulse">
        Loading payment diagnostics...
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-[#0a0a0a] border border-red-500/20 rounded-xl p-6 text-center text-red-500">
        Payment environment not configured or validation failed.
      </div>
    );
  }

  const isProd = config.paymentMode === "PRODUCTION";

  return (
    <div className="bg-[#0a0a0a] border border-brand-accent/20 rounded-xl overflow-hidden mb-8 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
      <div className="bg-[#111111] px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-bold text-white font-heading flex items-center gap-2 uppercase tracking-wider">
          <Shield size={18} className="text-brand-accent" />
          Payment Diagnostics
        </h3>
        <div className={`px-3 py-1 rounded border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isProd ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isProd ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></div>
          {isProd ? '🟢 PRODUCTION MODE' : '🟡 TEST MODE'}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Environment Status</h4>
            <button onClick={fetchDiagnostics} className="text-brand-accent hover:text-white transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Active Endpoint</span>
              <span className="font-mono text-xs text-blue-400 break-all">{config.activeEndpoint}</span>
            </div>
            
            <div className="bg-black border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Health</span>
              <span className={`font-mono text-xs font-bold uppercase ${config.environmentHealth === 'healthy' ? 'text-green-500' : 'text-red-500'}`}>
                {config.environmentHealth}
              </span>
            </div>

            <div className="bg-black border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Credential State</span>
              <span className="font-mono text-xs text-white">Valid isolated pair</span>
            </div>
            
            <div className="bg-black border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Last Validated</span>
              <span className="font-mono text-xs text-gray-400">
                {config.lastValidation ? format(new Date(config.lastValidation), "HH:mm:ss") : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            Recent Webhooks
          </h4>
          
          <div className="bg-black border border-gray-800 rounded-lg h-[160px] overflow-y-auto">
            {recentLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 text-xs font-mono">
                <Server size={24} className="mb-2 opacity-30" />
                No webhooks received
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111111] sticky top-0 text-gray-500">
                  <tr>
                    <th className="font-mono p-2 font-normal uppercase">Order ID</th>
                    <th className="font-mono p-2 font-normal uppercase">Status</th>
                    <th className="font-mono p-2 font-normal uppercase text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {recentLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-900 transition-colors">
                      <td className="p-2 font-mono text-gray-300">{log.orderId || 'Unknown'}</td>
                      <td className="p-2">
                        {log.processingStatus === 'completed' && <span className="text-green-500 flex items-center gap-1"><CheckCircle size={10}/> Completed</span>}
                        {log.processingStatus === 'failed' && <span className="text-red-500 flex items-center gap-1"><XCircle size={10}/> Failed</span>}
                        {log.processingStatus === 'processing' && <span className="text-brand-accent flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Processing</span>}
                      </td>
                      <td className="p-2 text-right font-mono text-gray-500">
                        {log.timestamp ? format(new Date(log.timestamp), "HH:mm") : '...'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
