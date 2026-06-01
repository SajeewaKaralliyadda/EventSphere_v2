import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  AlertTriangle,
  Calendar as CalendarIcon,
  BarChart2,
  QrCode,
  Eye,
  ChevronRight,
  MapPin,
  Clock,
  MoreVertical,
  CalendarDays,
  XCircle,
  X,
  Loader2,
  Trash,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { listEvents, postponeEvent, deleteEvent, type EventResponse } from '../../services/organizerService';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [postponeModalOpen, setPostponeModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);

  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isPostponing, setIsPostponing] = useState(false);
  const [cancelConfirmText, setCancelConfirmText] = useState('');
  const [myEvents, setMyEvents] = useState<EventResponse[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingFilter, setPendingFilter] = useState<'ALL' | 'PENDING_APPROVAL'>('ALL');

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    try {
      // organizerId === user.id (1:1 DB mapping)
      const events = await listEvents(user.id);
      setMyEvents(events);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const displayedEvents = pendingFilter === 'PENDING_APPROVAL' 
    ? myEvents.filter(e => e.status === 'PENDING_APPROVAL') 
    : myEvents;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'PENDING_APPROVAL': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const pendingCount = myEvents.filter(e => e.status === 'PENDING_APPROVAL').length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePostponeClick = (event: any) => {
    setSelectedEvent(event);
    setPostponeModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleCancelClick = (event: any) => {
    setSelectedEvent(event);
    setCancelConfirmText('');
    setCancelModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleConfirmPostpone = async () => {
    if (!selectedEvent || !newDate || !newTime || !user?.id) return;
    // Combine date + time into ISO-8601 LocalDateTime expected by backend
    const newDateTimeISO = `${newDate}T${newTime}:00`;
    setIsPostponing(true);
    try {
      const updated = await postponeEvent(user.id, selectedEvent.id, newDateTimeISO);
      // Update the event in local state so the list reflects the new date immediately
      setMyEvents(prev =>
        prev.map(e => (e.id === updated.id ? { ...e, eventDate: updated.eventDate } : e))
      );
      toast.success(`"${selectedEvent.title}" postponed to ${format(new Date(newDateTimeISO), 'MMM dd, yyyy p')}`);
      setPostponeModalOpen(false);
      setSelectedEvent(null);
      setNewDate('');
      setNewTime('');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to postpone event.');
    } finally {
      setIsPostponing(false);
    }
  };

  const [isCancelling, setIsCancelling] = useState(false);

  const handleConfirmCancel = async () => {
    if (cancelConfirmText === 'DELETE' && selectedEvent && user?.id) {
      setIsCancelling(true);
      try {
        await deleteEvent(user.id, selectedEvent.id);
        setMyEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
        toast.success(`Event "${selectedEvent.title}" has been deleted.`);
        setCancelModalOpen(false);
        setSelectedEvent(null);
      } catch (err: any) {
        toast.error(err.response?.data?.message ?? 'Failed to delete event.');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 md:space-y-8 pb-12">
        
        {/* Top Section: Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.firstName || 'Organizer'}!</h1>
            <p className="text-blue-100 text-sm md:text-base max-w-xl">
              Here's an overview of your events and ticket sales. You have 3 active events running right now.
            </p>
          </div>
          
          <div className="relative z-10 shrink-0">
            <button 
              onClick={() => navigate('/organizer/create-event')}
              className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>
        </div>

        {/* Alert Banner */}
        {pendingCount > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-yellow-800 dark:text-yellow-500">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-full shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="font-medium text-sm md:text-base">
                You have <span className="font-bold">{pendingCount} events</span> pending approval from university administration.
              </p>
            </div>
            <button 
              onClick={() => setPendingFilter(prev => prev === 'PENDING_APPROVAL' ? 'ALL' : 'PENDING_APPROVAL')}
              className="shrink-0 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-500/20 dark:hover:bg-yellow-500/30 text-yellow-800 dark:text-yellow-500 text-sm font-bold rounded-lg transition-colors"
            >
              {pendingFilter === 'PENDING_APPROVAL' ? 'Show All Events' : 'View Pending'}
            </button>
          </div>
        )}

        {/* Main Content (Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Left Column (70%): Your Events */}
          <div className="lg:col-span-2 space-y-6" id="your-events">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Events {pendingFilter === 'PENDING_APPROVAL' ? '(Pending)' : ''}</h2>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500">Loading events...</div>
              ) : displayedEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No events found. {pendingFilter === 'PENDING_APPROVAL' ? 'You have no pending events.' : 'Create one today!'}
                </div>
              ) : displayedEvents.map((event) => {
                const bookings = event.bookings || 0;
                const capacity = event.capacity || 0;
                const fillRate = capacity ? Math.round((bookings / capacity) * 100) : 0;
                const isApproved = event.status === 'PUBLISHED';

                return (
                  <div key={event.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row gap-5 transition-all hover:shadow-md">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-40 h-32 sm:h-auto shrink-0 rounded-xl overflow-hidden relative">
                      <img src={event.coverImageUrl || 'https://via.placeholder.com/400x200?text=No+Image'} alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-md shadow-sm ${
                          isApproved ? 'bg-emerald-500/90 text-white' : 'bg-orange-500/90 text-white'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1 pr-8">{event.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-3">
                            <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" /> {event.eventDate ? format(new Date(event.eventDate), 'MMM dd, yyyy') : 'N/A'}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.venue || 'TBA'}</span>
                          </div>
                        </div>
                        
                        {/* Options Dropdown */}
                        <div className="relative" ref={openDropdownId === event.id ? dropdownRef : null}>
                          <button 
                            onClick={() => setOpenDropdownId(openDropdownId === event.id ? null : (event.id as string))}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          <AnimatePresence>
                            {openDropdownId === event.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20"
                              >
                                <div className="py-1">
                                  <button 
                                    onClick={() => handlePostponeClick(event)}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                                  >
                                    <CalendarDays className="w-4 h-4" />
                                    Postpone Event
                                  </button>
                                  <button 
                                    onClick={() => handleCancelClick(event)}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                                  >
                                    <Trash className="w-4 h-4" />
                                    Delete Event
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 sm:mb-0">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Bookings ({fillRate}%)</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${fillRate > 80 ? 'bg-emerald-500' : fillRate > 40 ? 'bg-blue-500' : 'bg-slate-400'}`} 
                                style={{ width: `${fillRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{bookings}/{capacity}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Revenue</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{event.revenue || 'Rs. 0.00'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center justify-end gap-2 sm:border-l border-slate-100 dark:border-slate-800 sm:pl-5 pt-4 sm:pt-0 border-t sm:border-t-0">
                      <button 
                        onClick={() => navigate(`/organizer/reports?eventId=${event.id}`)}
                        className="flex-1 sm:flex-none w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors"
                      >
                        <BarChart2 className="w-3.5 h-3.5" /> Analytics
                      </button>
                      <button 
                        onClick={() => navigate('/organizer/scanner')}
                        className="flex-1 sm:flex-none w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Validate
                      </button>
                      <button 
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="flex-1 sm:flex-none w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (30%) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/organizer/create-event')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Create New Event</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                </button>
                
                <button 
                  onClick={() => document.getElementById('your-events')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Manage Events</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                </button>

                <button 
                  onClick={() => navigate('/organizer/scanner')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Validate Tickets</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                </button>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Bookings</h2>
              </div>
              
              <div className="space-y-5">
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-slate-500">Loading bookings...</div>
                ) : recentBookings.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No bookings yet.</div>
                ) : recentBookings.map((booking) => (
                  <div key={booking.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold shrink-0">
                      {booking.attendee?.fullName ? booking.attendee.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2">{booking.attendee?.fullName || 'Anonymous'}</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {booking.amountPaid === 0 ? 'Free' : `Rs. ${booking.amountPaid}`}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">{booking.event?.title || 'Event'}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{booking.quantity || 1}x {booking.ticketType || 'Ticket'}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.purchaseDate ? format(new Date(booking.purchaseDate), 'MMM dd') : ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Postpone Modal */}
      <AnimatePresence>
        {postponeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setPostponeModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Postpone Event</h3>
                  <button onClick={() => setPostponeModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Select a new date and time for <strong className="text-slate-900 dark:text-white">{selectedEvent?.title}</strong>. Attendees will be notified.
                </p>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium mb-2">New Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="date" 
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="time" 
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setPostponeModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPostpone}
                    disabled={!newDate || !newTime || isPostponing}
                    className="px-5 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isPostponing && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isPostponing ? 'Postponing...' : 'Confirm Postpone'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setCancelModalOpen(false)}
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
                  <h3 className="text-xl font-bold">Delete Event</h3>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  You are about to delete <strong className="text-slate-900 dark:text-white">{selectedEvent?.title}</strong>. This action cannot be undone. All attendees will be notified and refunded.
                </p>

                <div className="space-y-2 mb-8">
                  <label className="block text-sm font-medium">Type <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-red-600 dark:text-red-400">DELETE</span> to confirm</label>
                  <input 
                    type="text" 
                    value={cancelConfirmText}
                    onChange={(e) => setCancelConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button 
                    onClick={() => setCancelModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Keep Event
                  </button>
                  <button 
                    onClick={handleConfirmCancel}
                    disabled={cancelConfirmText !== 'DELETE' || isCancelling}
                    className="px-5 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isCancelling ? 'Deleting...' : 'Confirm Delete'}
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
