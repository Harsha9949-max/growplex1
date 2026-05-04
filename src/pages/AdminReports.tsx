import { format, subDays } from "date-fns";
import { collection, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import { Download, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#14B8A6'];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    setLoading(true);
    let startDate = Timestamp.fromDate(subDays(new Date(), dateRange));

    const qOrders = query(collection(db, "orders"), where("createdAt", ">=", startDate));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // don't set loading false yet, wait for users or just set it
    });

    const qUsers = query(collection(db, "users"), where("createdAt", ">=", startDate));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Give a tiny delay to ensure both snapshots return their first data
      setTimeout(() => setLoading(false), 500);
    });

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, [dateRange]);

  const chartsData = useMemo(() => {
    let totalRevenue = 0;
    const timeMap: Record<string, any> = {};
    const platformCount: Record<string, number> = {};

    for (let i = dateRange; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, "MMM dd");
      timeMap[dateStr] = { date: dateStr, revenue: 0, newUsers: 0, orders: 0 };
    }

    orders.forEach(o => {
      if (o.orderStatus === "completed") {
        totalRevenue += o.price || 0;
      }
      
      const date = o.createdAt ? new Date(o.createdAt.seconds * 1000) : new Date();
      const dateStr = format(date, "MMM dd");
      if (timeMap[dateStr]) {
        timeMap[dateStr].orders += 1;
        if (o.orderStatus === "completed") {
          timeMap[dateStr].revenue += o.price || 0;
        }
      }

      // Group by service/platform
      const platform = o.serviceName ? o.serviceName.split(' ')[0] : 'Other'; // e.g., 'Instagram' from 'Instagram Followers'
      platformCount[platform] = (platformCount[platform] || 0) + 1;
    });

    users.forEach(u => {
      const date = u.createdAt ? new Date(u.createdAt.seconds * 1000) : new Date();
      const dateStr = format(date, "MMM dd");
      if (timeMap[dateStr]) {
        timeMap[dateStr].newUsers += 1;
      }
    });

    const timeSeries = Object.values(timeMap);
    
    const platformData = Object.entries(platformCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    return { totalRevenue, timeSeries, platformData };
  }, [orders, users, dateRange]);

  const exportReport = () => {
    const csv = [
      "Date,Revenue,New Users,Orders",
      ...chartsData.timeSeries.map(row => `${row.date},${row.revenue},${row.newUsers},${row.orders}`)
    ].join("\n");
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `growplex-report-${dateRange}days.csv`;
    a.click();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-surface border border-brand-border p-3 rounded-xl shadow-xl text-xs sm:text-sm">
          <p className="text-text-main font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} className="flex items-center gap-2" style={{ color: entry.color }}>
               {entry.name === 'Revenue' || entry.name.includes('revenue') ? '₹ ' : ''}
               {entry.value} {entry.name}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Advanced Reports</h1>
          <p className="text-text-muted text-sm mt-1">Detailed growth and user acquisition tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-text-main text-sm font-medium focus:outline-none cursor-pointer"
          >
            <option value={7}>Last 7 Days</option>
            <option value={15}>Last 15 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
          <button 
            onClick={exportReport}
            className="bg-brand-accent hover:bg-brand-accent-hover text-brand-primary py-2 px-3 sm:px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-sm"
          >
            <Download size={16} /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
           <p className="text-text-muted">Compiling advanced reports...</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-brand-surface border border-brand-border p-5 rounded-xl shadow-lg flex items-center justify-between">
               <div>
                  <p className="text-text-muted text-sm font-medium mb-1">Total Revenue</p>
                  <h3 className="text-2xl font-bold">₹{chartsData.totalRevenue.toLocaleString()}</h3>
               </div>
               <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                 <TrendingUp size={24} />
               </div>
            </div>
            <div className="bg-brand-surface border border-brand-border p-5 rounded-xl shadow-lg flex items-center justify-between">
               <div>
                  <p className="text-text-muted text-sm font-medium mb-1">Total Orders</p>
                  <h3 className="text-2xl font-bold">{orders.length.toLocaleString()}</h3>
               </div>
               <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
               </div>
            </div>
            <div className="bg-brand-surface border border-brand-border p-5 rounded-xl shadow-lg flex items-center justify-between">
               <div>
                  <p className="text-text-muted text-sm font-medium mb-1">New Users Signups</p>
                  <h3 className="text-2xl font-bold">{users.length.toLocaleString()}</h3>
               </div>
               <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                 <Users size={24} />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-brand-surface border border-brand-border p-5 sm:p-6 rounded-xl shadow-lg">
              <h3 className="font-heading font-bold text-lg mb-4">User Growth & Engagement</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartsData.timeSeries}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} width={30} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" name="New Users" dataKey="newUsers" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-brand-surface border border-brand-border p-5 sm:p-6 rounded-xl shadow-lg flex flex-col items-center">
              <h3 className="font-heading font-bold text-lg w-full mb-2">Order Source / Platform</h3>
              {chartsData.platformData.length > 0 ? (
                 <div className="w-full h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={chartsData.platformData}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={90}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {chartsData.platformData.map((_entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip content={<CustomTooltip />} />
                       <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
              ) : (
                 <div className="h-[300px] flex items-center justify-center text-text-muted">
                   <p>No platform data for this period.</p>
                 </div>
              )}
            </div>
          </div>
          
          <div className="bg-brand-surface border border-brand-border p-5 sm:p-6 rounded-xl shadow-lg">
             <h3 className="font-heading font-bold text-lg mb-4">Daily Volume (Revenue & Orders)</h3>
             <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartsData.timeSeries}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                   <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis yAxisId="left" orientation="left" stroke="#10B981" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} width={45} />
                   <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" fontSize={10} tickLine={false} axisLine={false} width={30} />
                   <Tooltip content={<CustomTooltip />} />
                   <Legend wrapperStyle={{ fontSize: '12px' }} />
                   <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                   <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </motion.div>
      )}
    </AdminLayout>
  );
}
