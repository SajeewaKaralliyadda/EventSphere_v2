import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../../contexts/AuthContext';
import { useTenant, MOCK_TENANTS } from '../../contexts/TenantContext';
import { Shield, Building, Calendar, User, ChevronDown, ArrowRight, Sparkles, Mail, Zap, Music, Code, Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import EventGrid from '../../components/common/EventGrid';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import PartnerRequestModal from '../../components/ui/PartnerRequestModal';
import DynamicButton from '../../components/ui/DynamicButton';
import { getPlatformStats, discoverEvents, getActiveUniversities, PlatformStatsResponse, PublicEventResponse, TenantSummaryResponse } from '../../services/publicService';
import { type EventData } from '../../components/common/EventCard';
import logo from '../../assets/logo.png';

function formatEventDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoDate;
  }
}

function toEventData(e: PublicEventResponse): EventData {
  return {
    id: e.id,
    title: e.title,
    date: formatEventDate(e.eventDate),
    price: e.isFree ? 0 : (e.minTicketPrice ?? 0),
    thumbnail: e.coverImageUrl || `https://picsum.photos/seed/${e.id}/800/600`,
    tenantName: e.organizerName || 'EventSphere',
  };
}

export default function LandingPage() {
  const { demoLoginAs } = useAuth();
  const { currentTenant, setTenant } = useTenant();
  const navigate = useNavigate();
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [stats, setStats] = useState<PlatformStatsResponse | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [universities, setUniversities] = useState<TenantSummaryResponse[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    getActiveUniversities()
      .then(setUniversities)
      .catch(() => {});
    getPlatformStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoadingStats(false));

    discoverEvents({ page: 0, size: 6 })
      .then(page => setEvents(page.content.map(toEventData)))
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, []);

  const handleSimulatedLogin = (role: Role, path: string) => {
    demoLoginAs(role);
    navigate(path);
  };

  const statValue = (val: number | undefined, suffix = '') => {
    if (loadingStats || val === undefined) return <span className="animate-pulse text-slate-300 dark:text-slate-700">---</span>;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M${suffix}`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k${suffix}`;
    return `${val}${suffix}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500">
      <GlobalNavbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen" />
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }} className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px] mix-blend-screen" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium">EventSphere — live across {loadingStats ? '...' : (stats?.totalUniversities ?? '?')}+ universities</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-tight">
            Discover Campus Events <br className="hidden md:block" />
            <motion.span animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:200%_auto]">
              Like Never Before
            </motion.span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 font-medium">
            The unified Multi-Tenant SaaS platform for Event Management and Digital Ticketing across universities nationwide.
          </motion.p>

          {/* Search Pill */}
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="max-w-3xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 p-2 rounded-3xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 flex items-center px-4 py-2 w-full">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input type="text" placeholder="Search events, clubs, or tags..." className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-500" onKeyDown={e => e.key === 'Enter' && navigate('/events')} />
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700 shrink-0"></div>
            <div className="relative w-full sm:w-auto shrink-0 px-2 border-t sm:border-t-0 border-slate-200 dark:border-slate-700 pt-2 sm:pt-0">
              <select className="w-full sm:w-48 appearance-none bg-transparent border-none text-slate-900 dark:text-white px-4 py-2 pr-10 font-medium focus:outline-none cursor-pointer" value={currentTenant?.id || ''} onChange={(e) => { const tenant = universities.find(t => t.id === e.target.value); if (tenant) setTenant(tenant as any); }}>
                <option value="">All Universities</option>
                {universities.map(tenant => (<option key={tenant.id} value={tenant.id}>{tenant.name}</option>))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <button onClick={() => navigate('/events')} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-2xl sm:rounded-full font-bold transition-all hover:scale-105 shadow-lg shrink-0 mt-2 sm:mt-0">
              Find Events
            </button>
          </motion.div>

          {/* Stats Bar — live from API */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{statValue(stats?.totalUniversities, '+')}</span>
              <span className="text-sm">Universities</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{statValue(stats?.totalEventsHosted)}</span>
              <span className="text-sm">Events Hosted</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{statValue(stats?.totalTicketsSold)}</span>
              <span className="text-sm">Tickets Sold</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="max-w-7xl mx-auto px-6 mb-12 relative z-10">
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar items-center">
          <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide mr-2">Categories:</span>
          {['Technology', 'Music', 'Sports', 'Business', 'Arts', 'Networking'].map((category) => (
            <button key={category} onClick={() => navigate(`/events?category=${category}`)} className="px-5 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap">
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Featured Grid (Dynamic) */}
      <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Zap className="w-6 h-6 text-amber-500" /> Featured Highlights</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Discover what's trending across campuses</p>
        </div>
        
        {loadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        ) : events.length >= 3 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Main Event */}
            <div onClick={() => navigate(`/events/${events[0].id}`)} className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer">
              <img src={events[0].thumbnail} alt={events[0].title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 backdrop-blur-md border border-blue-500/30 text-xs font-bold mb-4"><Zap className="w-3 h-3" /> Featured</span>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{events[0].title}</h3>
                <p className="text-slate-300 mb-4 max-w-xl">{events[0].date} • Hosted by {events[0].tenantName}</p>
              </div>
            </div>
            
            {/* Top Right Event */}
            <div onClick={() => navigate(`/events/${events[1].id}`)} className="relative rounded-3xl overflow-hidden group cursor-pointer">
              <img src={events[1].thumbnail} alt={events[1].title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 backdrop-blur-md border border-purple-500/30 text-xs font-bold mb-3"><Calendar className="w-3 h-3" /> Upcoming</span>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{events[1].title}</h3>
                <p className="text-slate-300 text-sm">{events[1].date}</p>
              </div>
            </div>
            
            {/* Bottom Right Event */}
            <div onClick={() => navigate(`/events/${events[2].id}`)} className="relative rounded-3xl overflow-hidden group cursor-pointer bg-gradient-to-br from-blue-600 to-indigo-900">
              <img src={events[2].thumbnail} alt={events[2].title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-overlay opacity-50" referrerPolicy="no-referrer" />
              <div className="relative p-6 flex flex-col justify-between h-full z-10">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 text-xs font-bold mb-3"><Sparkles className="w-3 h-3" /> Trending</span>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{events[2].title}</h3>
                  <p className="text-blue-100 text-sm">{events[2].date}</p>
                </div>
                <div className="flex items-center justify-end mt-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
            Not enough events to show featured highlights yet. Check back soon!
          </div>
        )}
      </div>

      {/* Upcoming Events Grid — live from API */}
      <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
          <button onClick={() => navigate('/events')} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">View all &rarr;</button>
        </div>
        {loadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse h-72" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <EventGrid events={events} />
        ) : (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">No upcoming events found.</div>
        )}
      </div>



      {/* Partner CTA */}
      <div className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-900 text-white shadow-2xl p-8 md:p-16 text-center">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Bring EventSphere to Your Campus</h2>
            <p className="text-lg md:text-xl text-blue-100 mb-10">Join {loadingStats ? '...' : (stats?.totalUniversities ?? '?')}+ universities already using our platform.</p>
            <button onClick={() => setIsPartnerModalOpen(true)} className="inline-flex items-center gap-2 bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg">
              Partner Your University <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6"><Mail className="w-8 h-8" /></div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Never miss the best campus events</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto">Subscribe to get weekly updates on the hottest events and exclusive early-bird tickets.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your university email" required className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            <DynamicButton type="submit" className="px-8 py-4 text-base font-bold whitespace-nowrap">Subscribe</DynamicButton>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src={logo} alt="EventSphere Logo" className="w-8 h-8 object-contain" />
                <h3 className="text-xl font-bold">EventSphere</h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">The unified platform for campus events, ticketing, and student engagement.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/universities" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Universities</Link></li>
                <li><Link to="/help" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-sm text-slate-500 dark:text-slate-400">
            <p>&copy; {new Date().getFullYear()} EventSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <PartnerRequestModal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} />
    </div>
  );
}
