import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import SidebarLayout from '../../components/ui/SidebarLayout';
import DynamicButton from '../../components/ui/DynamicButton';
import { Plus, Users, Calendar, GraduationCap, Ticket, TrendingUp, Activity, Trash, MoreVertical, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getTicketSalesData, inviteOrganizer, listEvents, deleteGlobalEvent } from '../../services/tenantAdminService';
import type { TenantDashboardStats, TicketSalesPoint } from '../../services/tenantAdminService';

const initialSalesData: TicketSalesPoint[] = [
  { period: 'Mon', totalSales: 0, ticketCount: 0 },
  { period: 'Tue', totalSales: 0, ticketCount: 0 },
  { period: 'Wed', totalSales: 0, ticketCount: 0 },
  { period: 'Thu', totalSales: 0, ticketCount: 0 },
  { period: 'Fri', totalSales: 0, ticketCount: 0 },
  { period: 'Sat', totalSales: 0, ticketCount: 0 },
  { period: 'Sun', totalSales: 0, ticketCount: 0 },
];

export default function TenantAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<TenantDashboardStats>({
    registeredStudents: 0,
    activeOrganizers: 0,
    upcomingEventsCount: 0,
  });
  const [salesData, setSalesData] = useState<TicketSalesPoint[]>(initialSalesData);
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EVENTS'>('OVERVIEW');
  const [events, setEvents] = useState<any[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsData, ticketData] = await Promise.all([
          getDashboardStats(),
          getTicketSalesData(),
        ]);
        setStats(statsData);
        if (ticketData && ticketData.length > 0) {
          setSalesData(ticketData);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  React.useEffect(() => {
    if (activeTab === 'EVENTS') {
      const fetchEvents = async () => {
        setIsEventsLoading(true);
        try {
          const data = await listEvents();
          setEvents(data);
        } catch (error) {
          toast.error('Failed to load events.');
        } finally {
          setIsEventsLoading(false);
        }
      };
      fetchEvents();
    }
  }, [activeTab]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await inviteOrganizer(inviteEmail.trim());
      toast.success('Invitation sent successfully!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
    } catch (err) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText === 'DELETE' && selectedEvent) {
      setIsDeleting(true);
      try {
        await deleteGlobalEvent(selectedEvent.id);
        setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
        toast.success(`Event "${selectedEvent.title}" deleted.`);
        setDeleteModalOpen(false);
        setSelectedEvent(null);
      } catch (err: any) {
        toast.error(err.response?.data?.message ?? 'Failed to delete event.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const glassCard = "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-all duration-300 hover:shadow-md";

  return (
    <SidebarLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening at your university today.</p>
        </div>
        <DynamicButton className="gap-2" onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Invite Organizer
        </DynamicButton>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 font-medium transition-colors ${
            activeTab === 'OVERVIEW'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`pb-3 font-medium transition-colors ${
            activeTab === 'EVENTS'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Event Management
        </button>
      </div>

      {activeTab === 'OVERVIEW' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Stat Card 1: Registered Students */}
        <div className={`${glassCard} flex flex-col justify-between`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight">{(stats?.registeredStudents || 0).toLocaleString()}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Registered Students</p>
          </div>
        </div>

        {/* Stat Card 2: Active Organizers */}
        <div className={`${glassCard} flex flex-col justify-between`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight">{(stats?.activeOrganizers || 0).toLocaleString()}</h3>
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
            <h3 className="text-3xl font-bold tracking-tight">{(stats?.upcomingEventsCount || 0).toLocaleString()}</h3>
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
          <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.2} />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="totalSales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Total Sales" />
                <Area yAxisId="right" type="monotone" dataKey="ticketCount" stroke="#10b981" strokeWidth={3} fillOpacity={0} name="Tickets Sold" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Quick Actions */}
        <div className={`${glassCard} md:col-span-1 lg:col-span-1 flex flex-col`}>
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="flex-1 space-y-6 overflow-y-auto max-h-[350px] pr-2">
            {!stats.recentActivities || stats.recentActivities.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">No recent activity found.</p>
            ) : (
              stats.recentActivities.map((activity, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    activity.type === 'ORGANIZER' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {activity.type === 'ORGANIZER' ? <Users className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activity.subtitle}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[400px]">
          <h2 className="text-xl font-bold mb-6">Manage Events</h2>
          {isEventsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center p-8">No events found for this university.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-slate-400 px-4">Event</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-slate-400 px-4">Date</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-slate-400 px-4">Status</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-slate-400 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={evt.coverImageUrl || 'https://via.placeholder.com/150?text=Event'} 
                            alt={evt.title} 
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800" 
                          />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{evt.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px]">{evt.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                        {evt.eventDate ? new Date(evt.eventDate).toLocaleDateString() : 'TBA'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          evt.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                          evt.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedEvent(evt);
                            setDeleteConfirmText('');
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsInviteModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Invite Organizer</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Send an email invitation to a new organizer to join your university portal.
                </p>

                <div className="space-y-2 mb-8">
                  <label className="block text-sm font-medium">Email Address</label>
                  <input 
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="organizer@university.edu"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim() || isInviting}
                    className="px-5 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isInviting ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Event Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setDeleteModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                  <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                    <Trash className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Delete Event (Admin)</h3>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  You are about to delete <strong className="text-slate-900 dark:text-white">{selectedEvent?.title}</strong> as a Tenant Admin. This overrides the organizer's control and cannot be undone.
                </p>

                <div className="space-y-2 mb-8">
                  <label className="block text-sm font-medium">Type <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-red-600 dark:text-red-400">DELETE</span> to confirm</label>
                  <input 
                    type="text" 
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Keep Event
                  </button>
                  <button 
                    onClick={handleConfirmDelete}
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    className="px-5 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SidebarLayout>
  );
}
