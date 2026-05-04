import { format, isSameDay, startOfDay, subDays } from "date-fns";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where
} from "firebase/firestore";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  ShoppingCart
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from "recharts";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";

interface GrowplexOrder {
  orderId: string;
  customerName: string;
  phone: string;
  serviceName: string;
  packageQuantity: string;
  price: number;
  paymentId: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: any;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#14B8A6'];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<GrowplexOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("Last 30 Days");

  useEffect(() => {
    setLoading(true);
    
    let q;
    const colRef = collection(db, "orders");
    
    if (dateRange === "All Time") {
      q = query(colRef, orderBy("createdAt", "desc"));
    } else {
      let startDate = new Date();
      if (dateRange === "Today") {
        startDate = startOfDay(new Date());
      } else if (dateRange === "Last 7 Days") {
        startDate = subDays(startOfDay(new Date()), 7);
      } else if (dateRange === "Last 30 Days") {
        startDate = subDays(startOfDay(new Date()), 30);
      }
      
      q = query(
        colRef, 
        where("createdAt", ">=", Timestamp.fromDate(startDate)),
        orderBy("createdAt", "desc")
      );
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: GrowplexOrder[] = [];
      snapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as any);
      });
      setOrders(fetchedOrders);
      setLoading(false);
    }, (err) => {
      console.error("Failed to fetch orders:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dateRange]);

  // Aggregations
  const stats = useMemo(() => {
    const today = new Date();
    let totalOrders = orders.length;
    let todaysOrders = 0;
    let totalRevenue = 0;
    let todaysRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;

    orders.forEach(order => {
      const orderDate = order.createdAt ? new Date(order.createdAt.seconds * 1000) : new Date();
      const isToday = isSameDay(orderDate, today);

      if (isToday) todaysOrders++;
      
      if (order.orderStatus === "completed") {
        completedOrders++;
        totalRevenue += order.price;
        if (isToday) todaysRevenue += order.price;
      }
      
      if (order.orderStatus === "new" || order.orderStatus === "processing") {
        pendingOrders++;
      }
    });

    return { totalOrders, todaysOrders, totalRevenue, todaysRevenue, pendingOrders, completedOrders };
  }, [orders]);

  // Chart Data Preparation
  const chartsData = useMemo(() => {
    const servicesCount: Record<string, number> = {};
    const statusCount: Record<string, number> = {
      new: 0, processing: 0, completed: 0, failed: 0
    };
    
    const timeSeriesMap: Record<string, { date: string; revenue: number; orders: number }> = {};

    if (dateRange !== "All Time" && dateRange !== "Today") {
      const days = dateRange === "Last 7 Days" ? 7 : 30;
      for (let i = days; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = format(d, "MMM dd");
        timeSeriesMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      }
    }

    orders.forEach(order => {
      servicesCount[order.serviceName] = (servicesCount[order.serviceName] || 0) + 1;
      
      if (statusCount[order.orderStatus] !== undefined) {
         statusCount[order.orderStatus]++;
      } else {
         statusCount[order.orderStatus] = 1;
      }

      const orderDate = order.createdAt ? new Date(order.createdAt.seconds * 1000) : new Date();
      const dateStr = format(orderDate, "MMM dd");
      
      if (!timeSeriesMap[dateStr]) {
        timeSeriesMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      }
      
      timeSeriesMap[dateStr].orders += 1;
      if (order.paymentStatus === 'paid') {
        timeSeriesMap[dateStr].revenue += order.price;
      }
    });

    const topServices = Object.entries(servicesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    const statusObj = Object.entries(statusCount)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name: name.toUpperCase(), value }));

    const timeSeries = Object.values(timeSeriesMap);
    if (dateRange === "All Time" || dateRange === "Today") {
       timeSeries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return { topServices, statusObj, timeSeries };
  }, [orders, dateRange]);

  const exportCSV = () => {
    const headers = "Order ID,Customer Name,Phone,Service,Package,Amount,Payment Status,Order Status,Date\n";
    const csv = orders.map(o => {
      const dateStr = o.createdAt ? new Date(o.createdAt.seconds * 1000).toLocaleString() : "";
      return `${o.orderId},"${o.customerName}",${o.phone},"${o.serviceName}","${o.packageQuantity}",${o.price},${o.paymentStatus},${o.orderStatus},"${dateStr}"`;
    }).join("\n");
    
    const blob = new Blob([headers + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `growplex-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-surface border border-brand-border p-3 rounded-xl shadow-xl text-xs sm:text-sm">
          <p className="text-text-main font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} className="flex items-center gap-2" style={{ color: entry.color }}>
               {entry.name === 'Revenue' || entry.name.includes('revenue') ? '₹ ' : ''}
               {entry.value} {entry.name.replace('revenue', 'Revenue').replace('orders', 'Orders')}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const STAT_CARDS = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, sub: dateRange, icon: DollarSign, color: "green" },
    { label: "Today's Revenue", value: `₹${stats.todaysRevenue.toLocaleString()}`, sub: "TODAY", icon: Activity, color: "amber" },
    { label: "Total Orders", value: stats.totalOrders.toLocaleString(), sub: dateRange, icon: ShoppingCart, color: "blue" },
    { label: "Today's Orders", value: stats.todaysOrders.toLocaleString(), sub: "TODAY", icon: Activity, color: "purple" },
    { label: "Completed", value: stats.completedOrders.toLocaleString(), sub: dateRange, icon: CheckCircle, color: "teal" },
    { label: "Pending", value: stats.pendingOrders.toLocaleString(), sub: "NEW & PROCESSING", icon: AlertCircle, color: "yellow" },
  ];

  const colorMap: Record<string, string> = {
    green: "bg-green-500/10 text-green-500",
    amber: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
    teal: "bg-teal-500/10 text-teal-500",
    yellow: "bg-yellow-500/10 text-yellow-500",
  };

  return (
    <AdminLayout>
      <main className="flex-grow max-w-7xl mx-auto w-full mb-8 sm:mb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">Analytics Dashboard</h1>
            <p className="text-text-muted mt-0.5 sm:mt-1 text-sm">Real-time revenue and order metrics</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial bg-brand-surface border border-brand-border rounded-xl px-3 py-2">
              <Calendar size={16} className="text-text-muted shrink-0" />
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent border-none text-text-main text-sm font-medium focus:outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="All Time">All Time</option>
              </select>
            </div>
            <button 
              onClick={exportCSV}
              className="bg-brand-accent hover:bg-brand-accent-hover text-brand-primary py-2 px-3 sm:px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-sm shrink-0"
            >
              <Download size={16} /> <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-text-muted">Loading dashboard data...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Summary Cards — 2 cols on mobile, 3 cols on lg */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {STAT_CARDS.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="bg-brand-surface border border-brand-border p-3 sm:p-5 rounded-xl shadow-lg">
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <p className="text-text-muted text-xs sm:text-sm font-medium truncate pr-1">{card.label}</p>
                      <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${colorMap[card.color]}`}>
                        <Icon size={14} className="sm:hidden" />
                        <Icon size={18} className="hidden sm:block" />
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-bold text-text-main truncate">{card.value}</h3>
                    <p className="text-[10px] sm:text-xs text-text-muted mt-0.5 sm:mt-1 uppercase tracking-wider truncate">{card.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Charts — single column on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-brand-surface border border-brand-border p-4 sm:p-6 rounded-xl shadow-lg flex flex-col">
                <h3 className="font-heading font-bold text-sm sm:text-lg mb-3 sm:mb-4">Revenue Over Time</h3>
                <div className="h-[250px] sm:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={chartsData.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} width={45} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" name="Revenue" dataKey="revenue" stroke="#A3E635" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-brand-surface border border-brand-border p-4 sm:p-6 rounded-xl shadow-lg flex flex-col">
                <h3 className="font-heading font-bold text-sm sm:text-lg mb-3 sm:mb-4">Orders Per Day</h3>
                <div className="h-[250px] sm:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={chartsData.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} width={30} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="orders" name="Orders" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Pie Charts — single column on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-brand-surface border border-brand-border p-4 sm:p-6 rounded-xl shadow-lg flex flex-col items-center">
                <h3 className="font-heading font-bold text-sm sm:text-lg w-full mb-2">Top Services</h3>
                {chartsData.topServices.length > 0 ? (
                   <div className="w-full h-[250px] sm:h-[300px]">
                     <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                       <PieChart>
                         <Pie
                           data={chartsData.topServices}
                           cx="50%"
                           cy="50%"
                           innerRadius={40}
                           outerRadius={70}
                           paddingAngle={5}
                           dataKey="value"
                         >
                           {chartsData.topServices.map((_entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip content={<CustomTooltip />} />
                         <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                ) : (
                   <div className="w-full h-[250px] flex items-center justify-center text-text-muted text-sm">
                     No services ordered yet.
                   </div>
                )}
              </div>
              
              <div className="bg-brand-surface border border-brand-border p-4 sm:p-6 rounded-xl shadow-lg flex flex-col items-center">
                <h3 className="font-heading font-bold text-sm sm:text-lg w-full mb-2">Order Status Breakdown</h3>
                {chartsData.statusObj.length > 0 ? (
                   <div className="w-full h-[250px] sm:h-[300px]">
                     <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                       <PieChart>
                         <Pie
                           data={chartsData.statusObj}
                           cx="50%"
                           cy="50%"
                           innerRadius={0}
                           outerRadius={70}
                           paddingAngle={2}
                           dataKey="value"
                         >
                           {chartsData.statusObj.map((entry, index) => {
                             let color = '#3B82F6';
                             if (entry.name === 'COMPLETED') color = '#10B981';
                             if (entry.name === 'PROCESSING') color = '#8B5CF6';
                             if (entry.name === 'FAILED') color = '#EF4444';
                             if (entry.name === 'NEW') color = '#F59E0B';
                             return <Cell key={`cell-${index}`} fill={color} />;
                           })}
                         </Pie>
                         <Tooltip content={<CustomTooltip />} />
                         <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                ) : (
                   <div className="w-full h-[250px] flex items-center justify-center text-text-muted text-sm">
                     No orders available.
                   </div>
                )}
              </div>
            </div>

            {/* Recent Orders — card view on mobile, table on desktop */}
            <div className="bg-brand-surface border border-brand-border rounded-xl shadow-lg overflow-hidden">
               <div className="p-4 sm:p-5 border-b border-brand-border flex justify-between items-center bg-brand-primary/30">
                 <h3 className="font-heading font-bold text-sm sm:text-lg">Recent Orders</h3>
               </div>
               
               {/* Desktop table */}
               <div className="hidden md:block overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-brand-primary/50 text-text-muted text-xs uppercase font-semibold">
                     <tr>
                       <th className="px-6 py-4">Order ID</th>
                       <th className="px-6 py-4">Customer</th>
                       <th className="px-6 py-4">Service</th>
                       <th className="px-6 py-4">Amount</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Date</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-brand-border">
                     {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-text-muted">No recent orders</td>
                        </tr>
                     ) : (
                        orders.slice(0, 10).map((order) => (
                           <tr key={order.orderId} className="hover:bg-brand-primary/30 transition-colors">
                             <td className="px-6 py-4 font-mono text-brand-accent text-xs">{order.orderId}</td>
                             <td className="px-6 py-4 font-medium">{order.customerName}</td>
                             <td className="px-6 py-4">
                               <div className="text-text-main">{order.serviceName}</div>
                               <div className="text-xs text-text-muted">{order.packageQuantity}</div>
                             </td>
                             <td className="px-6 py-4 font-medium">₹{order.price}</td>
                             <td className="px-6 py-4">
                               <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                 order.orderStatus === 'completed' ? 'bg-green-500/10 text-green-500' :
                                 order.orderStatus === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                                 order.orderStatus === 'failed' ? 'bg-red-500/10 text-red-500' :
                                 'bg-yellow-500/10 text-yellow-500'
                               }`}>
                                 {order.orderStatus}
                               </span>
                             </td>
                             <td className="px-6 py-4 text-text-muted text-xs">
                               {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                             </td>
                           </tr>
                        ))
                     )}
                   </tbody>
                 </table>
               </div>

               {/* Mobile card view */}
               <div className="md:hidden divide-y divide-brand-border">
                 {orders.length === 0 ? (
                   <div className="p-6 text-center text-text-muted text-sm">No recent orders</div>
                 ) : (
                   orders.slice(0, 10).map((order) => (
                     <div key={order.orderId} className="p-4 space-y-2">
                       <div className="flex justify-between items-start">
                         <div>
                           <p className="font-mono text-brand-accent text-xs">{order.orderId}</p>
                           <p className="font-medium text-sm mt-0.5">{order.customerName}</p>
                         </div>
                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                           order.orderStatus === 'completed' ? 'bg-green-500/10 text-green-500' :
                           order.orderStatus === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                           order.orderStatus === 'failed' ? 'bg-red-500/10 text-red-500' :
                           'bg-yellow-500/10 text-yellow-500'
                         }`}>
                           {order.orderStatus}
                         </span>
                       </div>
                       <div className="flex justify-between items-end text-xs">
                         <div>
                           <p className="text-text-muted">{order.serviceName}</p>
                           <p className="text-text-muted">{order.packageQuantity}</p>
                         </div>
                         <div className="text-right">
                           <p className="font-bold text-sm">₹{order.price}</p>
                           <p className="text-text-muted">{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                         </div>
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>

          </motion.div>
        )}
      </main>
    </AdminLayout>
  );
}
