import React, { useState, useEffect, useMemo } from "react";
import { 
  DollarSign, ShoppingCart, Activity, CheckCircle, 
  Calendar, Download, PieChart as PieChartIcon, AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { AdminLayout } from "../components/AdminLayout";
import { db } from "../lib/firebase";
import { 
  collection, query, orderBy, onSnapshot, where, Timestamp 
} from "firebase/firestore";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from "recharts";
import { startOfDay, subDays, format, isSameDay } from "date-fns";

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
    // Top Services & Revenue/Orders over time
    const servicesCount: Record<string, number> = {};
    const statusCount: Record<string, number> = {
      new: 0, processing: 0, completed: 0, failed: 0
    };
    
    // Time Series grouped by day (MM/DD)
    const timeSeriesMap: Record<string, { date: string; revenue: number; orders: number }> = {};

    // Initialize recent days for continuity in charts
    if (dateRange !== "All Time" && dateRange !== "Today") {
      const days = dateRange === "Last 7 Days" ? 7 : 30;
      for (let i = days; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = format(d, "MMM dd");
        timeSeriesMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      }
    }

    orders.forEach(order => {
      // Services count
      servicesCount[order.serviceName] = (servicesCount[order.serviceName] || 0) + 1;
      
      // Status count
      if (statusCount[order.orderStatus] !== undefined) {
         statusCount[order.orderStatus]++;
      } else {
         statusCount[order.orderStatus] = 1;
      }

      // Time series
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

    // Time series sorted by date
    // Note: since keys might not be perfectly sortable purely as strings without year, 
    // we sorted them by mapping through original chronological processing, but since we map backwards it's ok.
    // For "All time", sort by actual date via mapping to epoch
    const timeSeries = Object.values(timeSeriesMap);
    // basic chronological sort for all time
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
        <div className="bg-brand-surface border border-brand-border p-3 rounded-xl shadow-xl z-50">
          <p className="text-text-main font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
               {entry.name === 'Revenue' || entry.name.includes('revenue') ? '₹ ' : ''}
               {entry.value} {entry.name.replace('revenue', 'Revenue').replace('orders', 'Orders')}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout>
      <main className="flex-grow max-w-7xl mx-auto w-full mb-12 space-y-6 lg:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading">Analytics Dashboard</h1>
            <p className="text-text-muted mt-1 text-sm md:text-base">Real-time revenue and order metrics</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-brand-surface border border-brand-border rounded-xl px-3 py-2 w-full sm:w-auto overflow-hidden">
              <Calendar size={18} className="text-text-muted shrink-0" />
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent border-none text-text-main text-sm font-medium focus:outline-none w-full cursor-pointer"
              >
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="All Time">All Time</option>
              </select>
            </div>
            <button 
              onClick={exportCSV}
              className="bg-brand-accent hover:bg-brand-accent-hover text-brand-primary py-2 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap w-full sm:w-auto"
            >
              <Download size={18} /> Export Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-text-muted text-sm">Loading dashboard data...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-brand-surface border border-brand-border p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-text-muted text-xs md:text-sm font-medium">Total Revenue</p>
                  <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg"><DollarSign size={16} className="text-green-500"/></div>
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-text-main truncate">₹{stats.totalRevenue.toLocaleString()}</h3>
                <p className="text-[10px] md:text-xs text-text-muted mt-1 uppercase tracking-wider">{dateRange}</p>
              </div>
              
              <div className="bg-brand-surface border border-brand-border p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-text-muted text-xs md:text-sm font-medium">Today's Revenue</p>
                  <div className="p-1.5 md:p-2 bg-brand-accent/10 rounded-lg"><Activity size={16} className="text-brand-accent"/></div>
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-text-main truncate">₹{stats.todaysRevenue.toLocaleString()}</h3>
                <p className="text-[10px] md:text-xs text-text-muted mt-1 uppercase tracking-wider">TODAY</p>
              </div>
              
              <div className="bg-brand-surface border border-brand-border p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-text-muted text-xs md:text-sm font-medium">Total Orders</p>
                  <div className="p-1.5 md:p-2 bg-blue-500/10 rounded-lg"><ShoppingCart size={16} className="text-blue-500"/></div>
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-text-main">{stats.totalOrders.toLocaleString()}</h3>
                <p className="text-[10px] md:text-xs text-text-muted mt-1 uppercase tracking-wider">{dateRange}</p>
              </div>
              
              <div className="bg-brand-surface border border-brand-border p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-text-muted text-xs md:text-sm font-medium">Today's Orders</p>
                  <div className="p-1.5 md:p-2 bg-purple-500/10 rounded-lg"><Activity size={16} className="text-purple-500"/></div>
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-text-main">{stats.todaysOrders.toLocaleString()}</h3>
                <p className="text-[10px] md:text-xs text-text-muted mt-1 uppercase tracking-wider">TODAY</p>
              </div>
              
              <div className="bg-brand-surface border border-brand-border p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-text-muted text-xs md:text-sm font-medium">Completed</p>
                  <div className="p-1.5 md:p-2 bg-teal-500/10 rounded-lg"><CheckCircle size={16} className="text-teal-500"/></div>
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-text-main">{stats.completedOrders.toLocaleString()}</h3>
                <p className="text-[10px] md:text-xs text-text-muted mt-1 uppercase tracking-wider">{dateRange}</p>
              </div>
              
              <div className="bg-brand-surface border border-brand-border p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-text-muted text-xs md:text-sm font-medium">Pending</p>
                  <div className="p-1.5 md:p-2 bg-yellow-500/10 rounded-lg"><AlertCircle size={16} className="text-yellow-500"/></div>
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-text-main">{stats.pendingOrders.toLocaleString()}</h3>
                <p className="text-[10px] md:text-xs text-text-muted mt-1 uppercase tracking-wider">NEW & PROCCESSING</p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-brand-surface border border-brand-border p-5 rounded-xl shadow-sm h-[350px] md:h-[400px] flex flex-col">
                <h3 className="font-heading font-bold text-base md:text-lg mb-4">Revenue Over Time</h3>
                <div className="flex-grow w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartsData.timeSeries} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" name="Revenue" dataKey="revenue" stroke="#A3E635" strokeWidth={3} dot={{ r: 3, fill: "#A3E635", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-brand-surface border border-brand-border p-5 rounded-xl shadow-sm h-[350px] md:h-[400px] flex flex-col">
                <h3 className="font-heading font-bold text-base md:text-lg mb-4">Orders Per Day</h3>
                <div className="flex-grow w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartsData.timeSeries} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} width={30} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                      <Bar dataKey="orders" name="Orders" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-surface border border-brand-border p-5 rounded-xl shadow-sm flex flex-col items-center">
                <h3 className="font-heading font-bold text-base md:text-lg w-full mb-2">Top Services</h3>
                {chartsData.topServices.length > 0 ? (
                   <div className="w-full h-[250px] md:h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={chartsData.topServices}
                           cx="50%"
                           cy="50%"
                           innerRadius={50}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                         >
                           {chartsData.topServices.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                           ))}
                         </Pie>
                         <Tooltip content={<CustomTooltip />} />
                         <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px' }}/>
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                ) : (
                   <div className="w-full h-[250px] flex items-center justify-center text-text-muted text-sm">
                     No services ordered yet.
                   </div>
                )}
              </div>
              
              <div className="bg-brand-surface border border-brand-border p-5 rounded-xl shadow-sm flex flex-col items-center">
                <h3 className="font-heading font-bold text-base md:text-lg w-full mb-2">Status Breakdown</h3>
                {chartsData.statusObj.length > 0 ? (
                   <div className="w-full h-[250px] md:h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={chartsData.statusObj}
                           cx="50%"
                           cy="50%"
                           innerRadius={0}
                           outerRadius={80}
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
                         <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px' }}/>
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

            {/* Recent Orders Table */}
            <div className="bg-brand-surface border border-brand-border rounded-xl shadow-sm overflow-hidden">
               <div className="p-4 md:p-5 border-b border-brand-border flex justify-between items-center bg-brand-primary/30">
                 <h3 className="font-heading font-bold text-base md:text-lg">Recent Orders</h3>
               </div>
               <div className="overflow-x-auto w-full">
                 <table className="w-full text-left text-xs md:text-sm whitespace-nowrap min-w-[700px]">
                   <thead className="bg-brand-primary/50 text-text-muted text-[10px] md:text-xs uppercase font-semibold">
                     <tr>
                       <th className="px-4 py-3 md:px-6 md:py-4">Order ID</th>
                       <th className="px-4 py-3 md:px-6 md:py-4">Customer</th>
                       <th className="px-4 py-3 md:px-6 md:py-4">Service</th>
                       <th className="px-4 py-3 md:px-6 md:py-4">Amount</th>
                       <th className="px-4 py-3 md:px-6 md:py-4">Status</th>
                       <th className="px-4 py-3 md:px-6 md:py-4">Date</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-brand-border">
                     {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-text-muted">No recent orders</td>
                        </tr>
                     ) : (
                        orders.slice(0, 10).map((order) => (
                           <tr key={order.orderId} className="hover:bg-brand-primary/30 transition-colors">
                             <td className="px-4 md:px-6 py-3 font-mono text-brand-accent text-[10px] md:text-xs">{order.orderId}</td>
                             <td className="px-4 md:px-6 py-3 font-medium">{(order.customerName || "No Name").substring(0,20)}</td>
                             <td className="px-4 md:px-6 py-3">
                               <div className="text-text-main text-xs md:text-sm truncate max-w-[150px] md:max-w-[200px]" title={order.serviceName}>{order.serviceName}</div>
                               <div className="text-[10px] md:text-xs text-text-muted">{order.packageQuantity}</div>
                             </td>
                             <td className="px-4 md:px-6 py-3 font-medium">₹{order.price}</td>
                             <td className="px-4 md:px-6 py-3">
                               <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase ${
                                 order.orderStatus === 'completed' ? 'bg-green-500/10 text-green-500' :
                                 order.orderStatus === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                                 order.orderStatus === 'failed' ? 'bg-red-500/10 text-red-500' :
                                 'bg-yellow-500/10 text-yellow-500'
                               }`}>
                                 {order.orderStatus}
                               </span>
                             </td>
                             <td className="px-4 md:px-6 py-3 text-text-muted text-[10px] md:text-xs">
                               {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                             </td>
                           </tr>
                        ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>

          </motion.div>
        )}
      </main>
    </AdminLayout>
  );
}
