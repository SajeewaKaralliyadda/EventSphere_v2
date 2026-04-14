import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SidebarLayout from '../../components/ui/SidebarLayout';
import DynamicButton from '../../components/ui/DynamicButton';
import { Plus, Users, Calendar, GraduationCap, Ticket, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import api from '../../lib/api';

const initialSalesData = [
  { name: 'Mon', sales: 0 },
  { name: 'Tue', sales: 0 },
  { name: 'Wed', sales: 0 },
  { name: 'Thu', sales: 0 },
  { name: 'Fri', sales: 0 },
  { name: 'Sat', sales: 0 },
  { name: 'Sun', sales: 0 },
];

export default function TenantAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({
    registeredStudents: 0,
    activeOrganizers: 0,
    upcomingEvents: 0,
    salesData: initialSalesData
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/tenant-admin/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  const glassCard = "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-all duration-300 hover:shadow-md";

  return (
    <SidebarLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening at your university today.</p>
        </div>
        <DynamicButton className="gap-2">
          <Plus className="w-4 h-4" />
          Invite Organizer
        </DynamicButton>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Stat Card 1: Registered Students */}
        <div className={`${glassCard} flex flex-col justify-between`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +5%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight">{stats.registeredStudents.toLocaleString()}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Registered Students</p>
          </div>
        </div>

        {/* Stat Card 2: Active Organizers */}
        <div className={`${glassCard} flex flex-col justify-between`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +12%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight">{stats.activeOrganizers.toLocaleString()}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Active Organizers</p>
          </div>
        </div>

        {/* Stat Card 3: Upcoming Events */}
        <div className={`${glassCard} flex flex-col justify-between`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight">{stats.upcomingEvents.toLocaleString()}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Upcoming Events</p>
          </div>
        </div>

        {/* Main Chart: University Ticket Sales */}
        <div className={`${glassCard} md:col-span-2 lg:col-span-2 min-h-[350px] flex flex-col`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">University Ticket Sales</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Weekly ticket sales overview</p>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Ticket className="w-5 h-5 text-slate-500" />
            </div>
          </div>
          <div className="flex-1 w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Quick Actions */}
        <div className={`${glassCard} md:col-span-1 lg:col-span-1 flex flex-col`}>
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="flex-1 space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium">New Organizer Approved</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sarah Jenkins (Computer Science Dept)</p>
                <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Event Published</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Spring Career Fair 2026</p>
                <p className="text-xs text-slate-400 mt-1">5 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Sales Milestone Reached</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">1,000 tickets sold for Hackathon</p>
                <p className="text-xs text-slate-400 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
