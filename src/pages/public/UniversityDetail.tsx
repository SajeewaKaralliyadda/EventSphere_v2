import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUniversityBySlug, discoverEvents, TenantSummaryResponse, PublicEventResponse } from '../../services/publicService';
import { type EventData } from '../../components/common/EventCard';
import EventGrid from '../../components/common/EventGrid';
import GlobalNavbar from '../../components/ui/GlobalNavbar';
import { MapPin, Building2, Calendar, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

function formatEventDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoDate;
  }
}

function toEventData(e: PublicEventResponse, tenantName: string): EventData {
  return {
    id: e.id,
    title: e.title,
    date: formatEventDate(e.eventDate),
    price: e.isFree ? 0 : (e.minTicketPrice ?? 0),
    thumbnail: e.coverImageUrl || `https://picsum.photos/seed/${e.id}/800/600`,
    tenantName: tenantName,
  };
}

export default function UniversityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [university, setUniversity] = useState<TenantSummaryResponse | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    getUniversityBySlug(slug)
      .then(data => {
        setUniversity(data);
        setLoading(false);
        // Once we have the university, fetch its events
        setLoadingEvents(true);
        discoverEvents({ tenantId: data.id, page: 0, size: 12 })
          .then(page => {
            setEvents(page.content.map(e => toEventData(e, data.name)));
          })
          .catch(err => {
            console.error("Failed to fetch university events", err);
          })
          .finally(() => setLoadingEvents(false));
      })
      .catch(err => {
        console.error("Failed to fetch university details", err);
        setError("University not found.");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex items-center justify-center">
        <GlobalNavbar />
        <div className="text-center pt-24">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading campus details...</p>
        </div>
      </div>
    );
  }

  if (error || !university) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col items-center justify-center">
        <GlobalNavbar />
        <Building2 className="w-20 h-20 text-slate-300 dark:text-slate-700 mb-6" />
        <h1 className="text-3xl font-bold mb-4">{error || "Campus Not Found"}</h1>
        <button onClick={() => navigate('/universities')} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
      </div>
    );
  }

  const defaultBanner = "https://picsum.photos/seed/campus/1920/600";
  const bgColor = university.primaryColor || '#3b82f6';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 pb-24">
      <GlobalNavbar />

      {/* Hero Banner */}
      <div className="relative h-[400px] w-full pt-20">
        <img 
          src={university.coverImageUrl || defaultBanner} 
          alt={`${university.name} Banner`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        
        {/* Back Button */}
        <div className="absolute top-28 left-6 md:left-12 z-20">
          <button onClick={() => navigate('/universities')} className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> All Universities
          </button>
        </div>
      </div>

      {/* University Info Header */}
      <div className="max-w-7xl mx-auto px-6 relative -mt-24 z-10 mb-16">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Logo */}
          <div className="shrink-0 -mt-20 md:-mt-24">
            {university.logoUrl ? (
              <img 
                src={university.logoUrl} 
                alt={`${university.name} Logo`} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover shadow-xl border-4 border-white dark:border-slate-900 bg-white"
              />
            ) : (
              <div 
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl shadow-xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-white font-bold text-5xl"
                style={{ backgroundColor: bgColor }}
              >
                {university.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info Details */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
              {university.name}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-600 dark:text-slate-400 font-medium mb-6">
              {university.location && (
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm">
                  <MapPin className="w-4 h-4" /> {university.location}
                </span>
              )}
              {university.contactEmail && (
                <a href={`mailto:${university.contactEmail}`} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm hover:text-blue-500 transition-colors">
                  <Mail className="w-4 h-4" /> {university.contactEmail}
                </a>
              )}
            </div>

            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {university.description || `Welcome to the official EventSphere portal for ${university.name}. Discover and join exciting campus events, connect with peers, and make the most out of your university experience.`}
            </p>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8" style={{ color: university.primaryColor || '#3b82f6' }} /> Upcoming Campus Events
          </h2>
        </div>

        {loadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse h-72" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <EventGrid events={events} />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: university.primaryColor || '#cbd5e1' }} />
            <h3 className="text-2xl font-bold mb-2">No upcoming events</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              There are currently no upcoming events scheduled for this campus. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
